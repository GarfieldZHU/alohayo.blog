import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'

interface PageSEOProps {
  title: string
  description?: string
  image?: string
  path?: string
  keywords?: string[]
  type?: 'website' | 'article'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export function genPageMetadata({
  title,
  description,
  image,
  path = '/',
  keywords,
  type = 'website',
  ...rest
}: PageSEOProps): Metadata {
  const url = path.startsWith('http') ? path : new URL(path, siteMetadata.siteUrl).toString()
  const images = [image || siteMetadata.socialBanner].map((img) =>
    img.startsWith('http') ? img : new URL(img, siteMetadata.siteUrl).toString()
  )

  return {
    title,
    description: description || siteMetadata.description,
    keywords: keywords || siteMetadata.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | ${siteMetadata.title}`,
      description: description || siteMetadata.description,
      url,
      siteName: siteMetadata.title,
      images,
      locale: 'en_US',
      type,
    },
    twitter: {
      title: `${title} | ${siteMetadata.title}`,
      description: description || siteMetadata.description,
      card: 'summary_large_image',
      creator: siteMetadata.twitterHandle,
      images,
    },
    ...rest,
  }
}
