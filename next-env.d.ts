/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.


// Use toc component
// see https://github.com/stefanprobst/rehype-extract-toc#how-to-use-with-mdx
declare module '*.mdx' {
    import type { MDXProps } from 'mdx/types'
    import type { Toc } from '@stefanprobst/rehype-extract-toc'

    export const tableOfContents: Toc
    export default function MDXContent(props: MDXProps): JSX.Element
}