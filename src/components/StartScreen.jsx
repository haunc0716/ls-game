import { BookOpen, Volume2, VolumeX } from "lucide-react"
import BrandMark from "./BrandMark"
import { GAME_TIME } from "../hooks/useGameLogic"

const particles = [
  { x: "3%", size: 14, drift: 40, sway: -18, duration: 8.5, delay: -1.2, opacity: 0.35, rotate: 360 },
  { x: "8%", size: 18, drift: 50, sway: 16, duration: 10.2, delay: -3.8, opacity: 0.45, rotate: 540 },
  { x: "14%", size: 22, drift: 35, sway: -14, duration: 11.5, delay: -7.5, opacity: 0.5, rotate: 480 },
  { x: "19%", size: 16, drift: 55, sway: 20, duration: 8.2, delay: -2.4, opacity: 0.38, rotate: 420 },
  { x: "25%", size: 24, drift: 42, sway: -18, duration: 10.8, delay: -5.5, opacity: 0.55, rotate: 600 },
  { x: "32%", size: 15, drift: 48, sway: 15, duration: 9.1, delay: -3.0, opacity: 0.36, rotate: 360 },
  { x: "38%", size: 20, drift: 60, sway: -22, duration: 10.5, delay: -6.8, opacity: 0.48, rotate: 520 },
  { x: "44%", size: 17, drift: 38, sway: 12, duration: 8.6, delay: -4.5, opacity: 0.4, rotate: 450 },
  { x: "50%", size: 25, drift: 56, sway: -16, duration: 11.8, delay: -8.2, opacity: 0.6, rotate: 680 },
  { x: "57%", size: 16, drift: 45, sway: 18, duration: 9.0, delay: -1.5, opacity: 0.38, rotate: 400 },
  { x: "63%", size: 22, drift: 58, sway: -20, duration: 10.9, delay: -5.9, opacity: 0.5, rotate: 580 },
  { x: "69%", size: 19, drift: 44, sway: 14, duration: 9.8, delay: -4.1, opacity: 0.42, rotate: 480 },
  { x: "75%", size: 26, drift: 62, sway: -24, duration: 12.2, delay: -9.5, opacity: 0.58, rotate: 720 },
  { x: "82%", size: 16, drift: 46, sway: 16, duration: 8.8, delay: -2.0, opacity: 0.36, rotate: 390 },
  { x: "88%", size: 21, drift: 52, sway: -15, duration: 10.4, delay: -7.1, opacity: 0.46, rotate: 540 },
  { x: "94%", size: 15, drift: 36, sway: 12, duration: 8.1, delay: -2.8, opacity: 0.35, rotate: 360 },
]

export default function StartScreen({ game }) {
  const submit = (e) => {
    e.preventDefault()
    if (!game.playerName.trim()) return
    game.startGame()
  }

  return (
    <main className="scene scene--start">
      <div className="sparkle-particles" aria-hidden="true">
        {particles.map((p, i) => (
          <i
            key={i}
            style={{
              "--x": p.x,
              "--size": `${p.size}px`,
              "--drift": `${p.drift}px`,
              "--sway": `${p.sway}px`,
              "--duration": `${p.duration}s`,
              "--delay": `${p.delay}s`,
              "--opacity": p.opacity,
              "--rotate": `${p.rotate}deg`,
            }}
          />
        ))}
      </div>

      <header className="landing-nav">
        <BrandMark compact />
        <div className="nav-tools">
          <button
            className="icon-btn"
            onClick={() => game.setSoundEnabled(!game.soundEnabled)}
            aria-label="Bật hoặc tắt âm thanh"
          >
            {game.soundEnabled ? <Volume2 /> : <VolumeX />}
          </button>
          <button className="outline-btn" onClick={() => game.setRulesOpen(true)}>
            <BookOpen /> Luật chơi
          </button>
        </div>
      </header>

      <section className="hero-copy">
        <p className="eyebrow">CHỦ NGHĨA XÃ HỘI KHOA HỌC · MLN131</p>
        <h1>
          VẤN ĐỀ<br />
          <span>DÂN TỘC</span>
        </h1>
        <h2>Trò chơi ghép cặp tương tác — Khái niệm & Luận điểm cốt lõi</h2>
        <p className="hero-desc">
          Khám phá và kết nối chính xác các luận điểm của Chủ nghĩa Mác – Lênin và Đảng, Nhà nước Việt Nam về vấn đề dân tộc trong thời kỳ quá độ lên chủ nghĩa xã hội.
        </p>

        <form className="start-form" onSubmit={submit}>
          <label htmlFor="player">Tên người tham gia</label>
          <div className={`name-field ${!game.playerName.trim() ? "empty" : ""}`}>
            <input
              id="player"
              maxLength="30"
              autoFocus
              value={game.playerName}
              onChange={(e) => game.setPlayerName(e.target.value)}
              placeholder="Nhập họ tên hoặc biệt danh..."
            />
            <button type="submit" disabled={!game.playerName.trim()}>
              BẮT ĐẦU TRÒ CHƠI <span>→</span>
            </button>
          </div>
        </form>

        <p className="player-code-note">
          Mã định danh: <b>#{game.playerCode}</b>
          {game.playerDisplayName ? ` · Hiển thị: ${game.playerDisplayName}` : ""}
        </p>

        <div className="steps">
          {["Lật hai thẻ bài", "Ghép đúng cặp khái niệm", `Chinh phục trong ${GAME_TIME} giây`].map((x, i) => (
            <div key={x}>
              <b>0{i + 1}</b>
              <span>{x}</span>
            </div>
          ))}
        </div>
      </section>

      <aside className="dantoc-badge">
        <span>08</span>
        <p>
          BỘ THẺ KIẾN THỨC<br />
          <b>VẤN ĐỀ DÂN TỘC</b>
        </p>
      </aside>
    </main>
  )
}
