import GameLauncher from '../../game/GameLauncher'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({
  title: 'Alohayo 世界',
  description: '走进一个不断变化的世界，沿着自己的地平线前进。',
})

export default function ChineseGamePage() {
  return <GameLauncher />
}
