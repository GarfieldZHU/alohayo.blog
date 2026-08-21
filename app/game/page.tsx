import { genPageMetadata } from '../seo'
import GameLauncher from './GameLauncher'

export const metadata = genPageMetadata({
  title: 'Game Library',
  description: 'A compact shelf of browser games, ready to play from the blog.',
})

export default function GamePage() {
  return <GameLauncher />
}
