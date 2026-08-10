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

  useEffect(() => {
    let active = true

    const setup = async () => {
      const canvas = canvasRef.current
      const webgpu = (navigator as unknown as { gpu?: WebGpuApi }).gpu

      if (!canvas || !webgpu) {
        setStatus('WebGPU is not available here. The WASM part still works below.')
        return
      }

      const adapter = await webgpu.requestAdapter()
      if (!adapter) {
        setStatus('No WebGPU adapter was offered. The WASM part still works below.')
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

      device.lost.then(() => {
        if (active) setStatus('The WebGPU device was lost. Try reloading the page.')
      })

      if (active) {
        setStatus('WebGPU ready. Edit the WAT, then run it.')
      }

      draw(0)
    }

    setup().catch((reason) => {
      if (active)
        setStatus(
          `WebGPU setup failed: ${reason instanceof Error ? reason.message : String(reason)}`
        )
    })

    return () => {
      active = false
      gpuRef.current?.device?.destroy?.()
      gpuRef.current = null
    }
  }, [draw])

  const run = async () => {
    setError('')
    try {
      const bytes = compileEditableWat(source)
      const { instance } = await WebAssembly.instantiate(bytes)
      const shade = (instance.exports as { shade?: unknown }).shade
      if (typeof shade !== 'function') throw new Error('The module did not export `shade`.')
      const value = Number((shade as (value: number) => number)(input))
      setResult(value)
      draw(value)
      setStatus(
        gpuRef.current
          ? `WASM returned ${value}; WebGPU painted the triangle.`
          : `WASM returned ${value}.`
      )
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason))
      setStatus('The program did not run. Fix the WAT and try again.')
    }
  }

  return (
    <section className="not-prose my-8 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-950">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.8fr)]">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Editable WASM instruction block
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              This tiny runner accepts one exported <code>i32 → i32</code> function. No imports, no
              DOM, no surprise.
            </p>
          </div>
          <textarea
            aria-label="Editable WebAssembly text module"
            className="ring-primary-500 min-h-64 w-full rounded-lg border border-gray-300 bg-gray-950 p-3 font-mono text-xs leading-5 text-emerald-200 outline-none focus:ring-2 dark:border-gray-700"
            spellCheck={false}
            value={source}
            onChange={(event) => setSource(event.target.value)}
          />
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
              <output className="w-6 font-mono">{input}</output>
            </label>
            <button
              className="bg-primary-500 hover:bg-primary-600 rounded-md px-3 py-1.5 text-xs font-semibold text-white transition"
              type="button"
              onClick={run}
            >
              Run WASM
            </button>
            <button
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-700 transition hover:bg-white dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
              type="button"
              onClick={() => setSource(DEFAULT_WAT)}
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
          <canvas
            ref={canvasRef}
            aria-label="WebGPU triangle preview"
            className="block aspect-video w-full rounded-lg bg-slate-950"
            height="360"
            width="640"
          />
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 text-xs dark:border-gray-800 dark:bg-gray-900">
            <span className="text-gray-600 dark:text-gray-400">WASM result</span>
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
