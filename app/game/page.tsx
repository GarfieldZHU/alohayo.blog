import { genPageMetadata } from '../seo'
import GameLauncher from './GameLauncher'

export const metadata = genPageMetadata({
  title: 'Alohayo World',
  description: 'Generate and explore a vivid geography-based world, entirely in your browser.',
})

export default function GamePage() {
  return <GameLauncher />
}
