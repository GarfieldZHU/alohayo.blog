import GameLauncher from '../../game/GameLauncher'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({
  title: '游戏库',
  description: '一架可以直接从博客打开的浏览器游戏库。',
})

export default function ChineseGamePage() {
  return <GameLauncher />
}
