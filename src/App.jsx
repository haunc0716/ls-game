import { AnimatePresence, motion } from "framer-motion"
import { SCREENS, useGameLogic } from "./hooks/useGameLogic"
import StartScreen from "./components/StartScreen"
import PlayScreen from "./components/PlayScreen"
import ResultScreen from "./components/ResultScreen"
import LeaderboardScreen from "./components/LeaderboardScreen"
import RulesModal from "./components/RulesModal"

export default function App() {
  const game = useGameLogic()

  const screens = {
    [SCREENS.START]: <StartScreen game={game} />,
    [SCREENS.PLAY]: <PlayScreen game={game} />,
    [SCREENS.RESULT]: <ResultScreen game={game} />,
    [SCREENS.TIMEOUT]: <ResultScreen game={game} timeout />,
    [SCREENS.LEADERBOARD]: <LeaderboardScreen game={game} />,
  }
  return <><AnimatePresence mode="wait"><motion.div className="app-stage" key={game.screen} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .35 }}>{screens[game.screen]}</motion.div></AnimatePresence><RulesModal game={game} /></>
}
