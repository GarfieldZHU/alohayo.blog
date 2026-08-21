import TOCInline from 'pliny/ui/TOCInline'
import Pre from 'pliny/ui/Pre'
import BlogNewsletterForm from 'pliny/ui/BlogNewsletterForm'
import type { MDXComponents } from 'mdx/types'
import Image from './Image'
import CustomLink from './Link'
import { NeonFlicker } from './NeonFlicker'
import { HoverImageTooltip } from './HoverImageTooltip'
import HoverIframeTooltip from './HoverIframeTooltip'
import { GamingPlatforms } from './GamingPlatforms'
import { AboutSectionLabel } from './AboutSectionLabel'
import WebGpuWasmPlayground from './WebGpuWasmPlayground'
import { DuckDbBenchmarkDemo } from './duckdb-demo/DuckDbBenchmarkDemo'

export const components: MDXComponents = {
  Image,
  TOCInline,
  a: CustomLink,
  pre: Pre,
  BlogNewsletterForm,
  NeonFlicker,
  HoverImageTooltip,
  HoverIframeTooltip,
  GamingPlatforms,
  AboutSectionLabel,
  WebGpuWasmPlayground,
  DuckDbBenchmarkDemo,
}
