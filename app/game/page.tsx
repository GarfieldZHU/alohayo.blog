import { genPageMetadata } from '../seo'
import GameLauncher from './GameLauncher'

export const metadata = genPageMetadata({
  title: 'Alohayo World',
  description: 'Step into an evolving world and find your own way across its horizon.',
})

export default function GamePage() {
  return <GameLauncher />
}
