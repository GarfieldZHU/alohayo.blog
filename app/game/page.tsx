import { genPageMetadata } from '../seo'
import GameLauncher from './GameLauncher'

export const metadata = genPageMetadata({
  title: 'Alohayo World',
  description:
    'Launch Alohayo World in World Mode, review the planned Game Mode, and explore the roadmap for HUD, settlements, roads, and traversal systems.',
  path: '/game/',
  keywords: [
    'Alohayo World',
    'world mode',
    'game mode',
    'procedural world',
    'fixed camera game',
    'settlements',
    'roads',
    'terrain generation',
  ],
})

export default function GamePage() {
  return <GameLauncher />
}
