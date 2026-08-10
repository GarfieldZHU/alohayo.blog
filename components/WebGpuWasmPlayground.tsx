'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { compileEditableWat, DEFAULT_WAT } from '../lib/wasmWatRunner.mjs'

const shader = /* wgsl */ `
struct Uniforms {
  color: vec4f,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@vertex
fn vertex_main(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
  var positions = array<vec2f, 3>(
    vec2f(0.0, 0.78),
    vec2f(-0.78, -0.78),
    vec2f(0.78, -0.78),
  );
  return vec4f(positions[index], 0.0, 1.0);
}

@fragment
fn fragment_main() -> @location(0) vec4f {
  return uniforms.color;
}
`

type WebGpuRenderPass = {
  setPipeline: (pipeline: WebGpuPipeline) => void
  setBindGroup: (index: number, bindGroup: unknown) => void
  draw: (vertexCount: number) => void
  end: () => void
}

type WebGpuCommandEncoder = {
  beginRenderPass: (descriptor: unknown) => WebGpuRenderPass
  finish: () => unknown
}

type WebGpuPipeline = {
  getBindGroupLayout: (index: number) => unknown
}

type WebGpuDevice = {
  queue: {
    writeBuffer: (buffer: unknown, offset: number, data: ArrayBufferView) => void
    submit: (commands: unknown[]) => void
  }
  createCommandEncoder: () => WebGpuCommandEncoder
  createBuffer: (descriptor: unknown) => unknown
  createShaderModule: (descriptor: unknown) => unknown
  createRenderPipeline: (descriptor: unknown) => WebGpuPipeline
  createBindGroup: (descriptor: unknown) => unknown
  lost: Promise<unknown>
  destroy?: () => void
}

type WebGpuContext = {
  configure: (descriptor: unknown) => void
  getCurrentTexture: () => { createView: () => unknown }
}

type WebGpuAdapter = {
  requestDevice: () => Promise<WebGpuDevice>
}

type WebGpuApi = {
  requestAdapter: () => Promise<WebGpuAdapter | null>
  getPreferredCanvasFormat: () => string
}

type GpuState = {
  context: WebGpuContext
  device: WebGpuDevice
  pipeline: WebGpuPipeline
  bindGroup: unknown
  uniformBuffer: unknown
}

type GpuStatus = 'checking' | 'ready' | 'unavailable' | 'error'

const colorFor = (value: number) => {
  const hue = ((value % 360) + 360) % 360
  return `hsl(${hue} 82% 56%)`
}

const rgbFor = (value: number) => {
  const hue = (((value % 360) + 360) % 360) / 60
  const chroma = 0.82
  const x = chroma * (1 - Math.abs((hue % 2) - 1))
  const [red, green, blue] =
    hue < 1
      ? [chroma, x, 0]
      : hue < 2
        ? [x, chroma, 0]
        : hue < 3
          ? [0, chroma, x]
          : hue < 4
            ? [0, x, chroma]
            : hue < 5
              ? [x, 0, chroma]
              : [chroma, 0, x]

  const match = 0.56 - chroma / 2
  return new Float32Array([red + match, green + match, blue + match, 1])
}

export default function WebGpuWasmPlayground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gpuRef = useRef<GpuState | null>(null)
  const [source, setSource] = useState(DEFAULT_WAT)
  const [input, setInput] = useState(12)
  const [result, setResult] = useState<number | null>(null)
  const [status, setStatus] = useState('Preparing the browser runtime…')
  const [error, setError] = useState('')
  const [gpuStatus, setGpuStatus] = useState<GpuStatus>('checking')
  const [isRunning, setIsRunning] = useState(false)

  const draw = useCallback((value: number) => {
    const gpu = gpuRef.current
    if (!gpu) return

    const color = rgbFor(value)
    gpu.device.queue.writeBuffer(gpu.uniformBuffer, 0, color)

    const encoder = gpu.device.createCommandEncoder()
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: gpu.context.getCurrentTexture().createView(),
          clearValue: { r: 0.035, g: 0.04, b: 0.08, a: 1 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    })
    pass.setPipeline(gpu.pipeline)
    pass.setBindGroup(0, gpu.bindGroup)
    pass.draw(3)
    pass.end()
    gpu.device.queue.submit([encoder.finish()])
  }, [])

  const execute = useCallback(
    async (program: string, value: number) => {
      setIsRunning(true)
      setError('')

      try {
        const bytes = compileEditableWat(program)
        const { instance } = await WebAssembly.instantiate(bytes)
        const shade = (instance.exports as { shade?: unknown }).shade
        if (typeof shade !== 'function') throw new Error('The module did not export `shade`.')

        const output = Number((shade as (input: number) => number)(value))
        setResult(output)
        draw(output)
        setStatus(
          gpuRef.current
            ? `WASM returned ${output}; WebGPU painted the triangle.`
            : `WASM returned ${output}; the WebGPU preview is unavailable.`
        )
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : String(reason))
        setStatus('The program did not run. Fix the WAT and try again.')
      } finally {
        setIsRunning(false)
      }
    },
    [draw]
  )

  useEffect(() => {
    let active = true

    const setup = async () => {
      const canvas = canvasRef.current
      const webgpu = (navigator as unknown as { gpu?: WebGpuApi }).gpu

      if (!canvas || !webgpu) {
        setGpuStatus('unavailable')
        setStatus('WebGPU is not available here. The WASM result still works below.')
        void execute(DEFAULT_WAT, 12)
        return
      }

      const adapter = await webgpu.requestAdapter()
      if (!adapter) {
        setGpuStatus('unavailable')
        setStatus('No WebGPU adapter was offered. The WASM result still works below.')
        void execute(DEFAULT_WAT, 12)
        return
      }

      const device = await adapter.requestDevice()
      const context = canvas.getContext('webgpu') as unknown as WebGpuContext | null
      if (!context) throw new Error('Could not create a WebGPU canvas context.')

      const format = webgpu.getPreferredCanvasFormat()
      context.configure({ device, format, alphaMode: 'premultiplied' })

      const shaderModule = device.createShaderModule({ code: shader })
      const bufferUsage = (
        globalThis as unknown as {
          GPUBufferUsage?: { UNIFORM: number; COPY_DST: number }
        }
      ).GPUBufferUsage ?? { UNIFORM: 0x40, COPY_DST: 0x08 }
      const uniformBuffer = device.createBuffer({
        size: 16,
        usage: bufferUsage.UNIFORM | bufferUsage.COPY_DST,
      })
      const pipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: { module: shaderModule, entryPoint: 'vertex_main' },
        fragment: { module: shaderModule, entryPoint: 'fragment_main', targets: [{ format }] },
        primitive: { topology: 'triangle-list' },
      })

      const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
      })

      gpuRef.current = { context, device, pipeline, bindGroup, uniformBuffer }
      setGpuStatus('ready')

      device.lost.then(() => {
        if (active) {
          setGpuStatus('error')
          setStatus('The WebGPU device was lost. Try reloading the page.')
        }
      })

      if (active) {
        setStatus('WebGPU ready. Edit the WAT, then run it.')
      }

      draw(0)
      void execute(DEFAULT_WAT, 12)
    }

    setup().catch((reason) => {
      if (active) {
        setGpuStatus('error')
        setStatus(
          `WebGPU setup failed: ${reason instanceof Error ? reason.message : String(reason)}`
        )
        void execute(DEFAULT_WAT, 12)
      }
    })

    return () => {
      active = false
      gpuRef.current?.device?.destroy?.()
      gpuRef.current = null
    }
  }, [draw, execute])

  return (
    <section className="not-prose my-8 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-950">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.8fr)]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Edit the WASM, then run it
              </p>
              <p id="wasm-playground-help" className="text-xs text-gray-600 dark:text-gray-400">
                One exported <code>i32 → i32</code> function. No imports, no DOM, no surprise.
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                gpuStatus === 'ready'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : gpuStatus === 'checking'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {gpuStatus === 'ready'
                ? 'WebGPU ready'
                : gpuStatus === 'checking'
                  ? 'Checking WebGPU'
                  : 'WASM fallback'}
            </span>
          </div>
          <textarea
            aria-label="Editable WASM color program"
            aria-describedby="wasm-playground-help"
            className="ring-primary-500 min-h-64 w-full rounded-lg border border-gray-300 bg-gray-950 p-3 font-mono text-xs leading-5 text-emerald-200 outline-none focus:ring-2 dark:border-gray-700"
            spellCheck={false}
            value={source}
            onChange={(event) => {
              setSource(event.target.value)
              setError('')
            }}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                event.preventDefault()
                void execute(source, input)
              }
            }}
          />
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Change <code>i32.const 7</code> to <code>i32.const 3</code>, then press{' '}
            <strong>Run WASM</strong>. With input <code>12</code>, the result goes from{' '}
            <code>84</code> to <code>36</code>, so the triangle changes color. <kbd>⌘/Ctrl</kbd> +{' '}
            <kbd>Enter</kbd> works too.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
              input
              <input
                aria-label="WASM input"
                className="accent-primary-500 w-24"
                type="range"
                min="0"
                max="64"
                value={input}
                onChange={(event) => setInput(Number(event.target.value))}
              />
              <input
                aria-label="WASM input value"
                className="w-14 rounded border border-gray-300 bg-white px-1.5 py-1 text-center font-mono text-xs dark:border-gray-700 dark:bg-gray-900"
                type="number"
                min="0"
                max="64"
                value={input}
                onChange={(event) => {
                  const next = event.target.valueAsNumber
                  if (Number.isFinite(next)) setInput(Math.min(64, Math.max(0, next)))
                }}
              />
            </label>
            <button
              className="bg-primary-500 hover:bg-primary-600 rounded-md px-3 py-1.5 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              disabled={isRunning}
              onClick={() => void execute(source, input)}
            >
              {isRunning ? 'Running…' : 'Run WASM'}
            </button>
            <button
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
              type="button"
              disabled={isRunning}
              onClick={() => {
                setSource(DEFAULT_WAT)
                void execute(DEFAULT_WAT, input)
              }}
            >
              Reset code
            </button>
          </div>
          {error && (
            <p
              className="rounded-md bg-red-50 p-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300"
              role="alert"
            >
              {error}
            </p>
          )}
          <p className="text-xs text-gray-600 dark:text-gray-400" role="status">
            {status}
          </p>
        </div>

        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-lg bg-slate-950">
            <canvas
              ref={canvasRef}
              aria-label="WebGPU triangle preview"
              className={`block aspect-video w-full ${gpuStatus === 'ready' ? '' : 'opacity-0'}`}
              height="360"
              width="640"
            />
            {gpuStatus !== 'ready' && (
              <div className="absolute inset-0 flex aspect-video items-center justify-center p-6 text-center">
                <div>
                  <div
                    className="mx-auto mb-3 h-14 w-14 rounded-full border-4 border-white/20 shadow-lg"
                    style={{ backgroundColor: result === null ? '#334155' : colorFor(result) }}
                  />
                  <p className="text-sm font-semibold text-white">
                    {gpuStatus === 'checking' ? 'Preparing the preview…' : 'WASM result preview'}
                  </p>
                  <p className="mt-1 text-xs text-slate-300">
                    {gpuStatus === 'checking'
                      ? 'The code can still run while WebGPU is checked.'
                      : 'WebGPU is unavailable in this browser, so the color is shown here.'}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 text-xs dark:border-gray-800 dark:bg-gray-900">
            <span className="text-gray-600 dark:text-gray-400">shade({input})</span>
            <span
              className="font-mono font-semibold"
              style={{ color: result === null ? undefined : colorFor(result) }}
            >
              {result === null ? '—' : result}
            </span>
          </div>
          <p className="text-xs leading-5 text-gray-600 dark:text-gray-400">
            The WASM return value becomes a color and is sent to a WebGPU uniform buffer. The
            triangle is intentionally humble.
          </p>
        </div>
      </div>
    </section>
  )
}
