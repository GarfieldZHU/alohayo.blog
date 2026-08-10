import Link from 'next/link'
import { slug } from 'github-slugger'
interface Props {
  text: string
  locale?: 'en' | 'zh-CN'
}

const Tag = ({ text, locale = 'en' }: Props) => {
  return (
    <Link
      href={`${locale === 'zh-CN' ? '/zh-CN' : ''}/tags/${slug(text)}`}
      className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 mr-3 text-sm font-medium uppercase"
    >
      {text.split(' ').join('-')}
    </Link>
  )
}

export default Tag
