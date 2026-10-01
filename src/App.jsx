import { useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { SCREENS, useGameLogic } from "./hooks/useGameLogic"
import StartScreen from "./components/StartScreen"
import PlayScreen from "./components/PlayScreen"
import ResultScreen from "./components/ResultScreen"
import LeaderboardScreen from "./components/LeaderboardScreen"
import RulesModal from "./components/RulesModal"

export default function App() {
  const game = useGameLogic()
  const bgmRef = useRef(null)

  // Điều khiển nhạc nền theo trạng thái bật/tắt âm thanh
  useEffect(() => {
    const audio = bgmRef.current
    if (!audio) return
    audio.volume = 0.3

    if (game.soundEnabled) {
      audio.play().catch(() => {
        // Trình duyệt có thể chặn autoplay trước khi người dùng click
      })
    } else {
      audio.pause()
    }
  }, [game.soundEnabled])

  // Kích hoạt nhạc ngay khi người dùng chạm/click lần đầu (vượt qua chính sách autoplay của trình duyệt)
  useEffect(() => {
    const handleFirstInteraction = () => {
      const audio = bgmRef.current
      if (audio && game.soundEnabled && audio.paused) {
        audio.play().catch(() => {})
      }
    }

    window.addEventListener("pointerdown", handleFirstInteraction, { once: true })
    window.addEventListener("keydown", handleFirstInteraction, { once: true })

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction)
      window.removeEventListener("keydown", handleFirstInteraction)
    }
  }, [game.soundEnabled])

  const screens = {
    [SCREENS.START]: <StartScreen game={game} />,
    [SCREENS.PLAY]: <PlayScreen game={game} />,
    [SCREENS.RESULT]: <ResultScreen game={game} />,
    [SCREENS.TIMEOUT]: <ResultScreen game={game} timeout />,
    [SCREENS.LEADERBOARD]: <LeaderboardScreen game={game} />,
  }

  return (
    <>
      <audio ref={bgmRef} src="/assets/dantoc/bgm.mp3" loop preload="auto" />
      <AnimatePresence mode="wait">
        <motion.div
          className="app-stage"
          key={game.screen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {screens[game.screen]}
        </motion.div>
      </AnimatePresence>
      <RulesModal game={game} />
    </>
  )
}
