import { BookOpen, Volume2, VolumeX } from "lucide-react"
import BrandMark from "./BrandMark"
import { GAME_TIME } from "../hooks/useGameLogic"

const beanParticles = [
  { x: "2%", size: 15, drift: 44, sway: -22, duration: 9.2, delay: -1.6, opacity: 0.18, rotate: 520 },
  { x: "7%", size: 20, drift: 58, sway: 18, duration: 10.4, delay: -4.2, opacity: 0.22, rotate: 640 },
  { x: "11%", size: 24, drift: 38, sway: -16, duration: 12.1, delay: -8.7, opacity: 0.27, rotate: 720 },
  { x: "16%", size: 18, drift: 66, sway: 24, duration: 8.8, delay: -2.9, opacity: 0.19, rotate: 560 },
  { x: "21%", size: 27, drift: 46, sway: -20, duration: 11.5, delay: -6.1, opacity: 0.3, rotate: 760 },
  { x: "26%", size: 16, drift: 54, sway: 19, duration: 9.7, delay: -3.5, opacity: 0.18, rotate: 600 },
  { x: "31%", size: 23, drift: 70, sway: -26, duration: 10.9, delay: -7.9, opacity: 0.26, rotate: 820 },
  { x: "36%", size: 19, drift: 42, sway: 14, duration: 8.9, delay: -5.4, opacity: 0.2, rotate: 540 },
  { x: "41%", size: 29, drift: 62, sway: -18, duration: 12.8, delay: -9.6, opacity: 0.33, rotate: 900 },
  { x: "46%", size: 17, drift: 50, sway: 21, duration: 9.4, delay: -1.8, opacity: 0.19, rotate: 610 },
  { x: "51%", size: 25, drift: 68, sway: -24, duration: 11.2, delay: -6.7, opacity: 0.28, rotate: 780 },
  { x: "56%", size: 21, drift: 48, sway: 16, duration: 10.3, delay: -4.9, opacity: 0.23, rotate: 660 },
  { x: "61%", size: 30, drift: 72, sway: -28, duration: 13.1, delay: -10.8, opacity: 0.34, rotate: 940 },
  { x: "66%", size: 18, drift: 52, sway: 19, duration: 9.6, delay: -2.2, opacity: 0.2, rotate: 580 },
  { x: "71%", size: 24, drift: 60, sway: -17, duration: 11.7, delay: -8.3, opacity: 0.27, rotate: 740 },
  { x: "76%", size: 16, drift: 46, sway: 15, duration: 8.7, delay: -3.1, opacity: 0.17, rotate: 520 },
  { x: "81%", size: 28, drift: 74, sway: -25, duration: 12.4, delay: -7.2, opacity: 0.31, rotate: 880 },
  { x: "86%", size: 20, drift: 56, sway: 18, duration: 10.1, delay: -5.8, opacity: 0.22, rotate: 640 },
  { x: "91%", size: 26, drift: 64, sway: -20, duration: 11.4, delay: -9.4, opacity: 0.29, rotate: 800 },
  { x: "96%", size: 17, drift: 40, sway: 13, duration: 8.5, delay: -4.6, opacity: 0.18, rotate: 560 },
]

export default function StartScreen({ game }) {
  const submit = (e) => { e.preventDefault(); if (!game.playerName.trim()) return; game.startGame() }
  return <main className="scene scene--start">
    <div className="bean-particles" aria-hidden="true">{beanParticles.map((bean, i) => <i key={i} style={{ "--x": bean.x, "--size": `${bean.size}px`, "--drift": `${bean.drift}px`, "--sway": `${bean.sway}px`, "--duration": `${bean.duration}s`, "--delay": `${bean.delay}s`, "--opacity": bean.opacity, "--rotate": `${bean.rotate}deg` }} />)}</div>
    <header className="landing-nav"><BrandMark compact /><div className="nav-tools"><button className="icon-btn" onClick={() => game.setSoundEnabled(!game.soundEnabled)} aria-label="Bật hoặc tắt âm thanh">{game.soundEnabled ? <Volume2 /> : <VolumeX />}</button><button className="outline-btn" onClick={() => game.setRulesOpen(true)}><BookOpen /> Luật chơi</button></div></header>
    <section className="hero-copy">
      <p className="eyebrow">HÀNH TRÌNH GIẢI PHÓNG DÂN TỘC · 1939–1945</p><h1>DẤU ẤN<br/><span>LỊCH SỬ</span></h1>
      <h2>Kết nối sự kiện — Ghi nhớ chặng đường giành độc lập</h2>
      <p className="hero-desc">Ghép đúng mỗi sự kiện với ý nghĩa lịch sử tương ứng, lần theo bước chuyển của cách mạng Việt Nam từ năm 1939 đến thắng lợi Tháng Tám 1945.</p>
      <form className="start-form" onSubmit={submit}><label htmlFor="player">Tên người tham gia</label><div className={`name-field ${!game.playerName.trim() ? "empty" : ""}`}><input id="player" maxLength="30" autoFocus value={game.playerName} onChange={(e) => game.setPlayerName(e.target.value)} placeholder="Nhập tên của bạn"/><button type="submit" disabled={!game.playerName.trim()}>BẮT ĐẦU HÀNH TRÌNH <span>→</span></button></div></form>
      <p className="player-code-note">Mã người chơi: <b>#{game.playerCode}</b>{game.playerDisplayName ? ` · hiển thị: ${game.playerDisplayName}` : ""}</p>
      <div className="steps">{["Lật hai tư liệu", "Kết nối đúng sự kiện", `Hoàn thành trong ${GAME_TIME} giây`].map((x, i) => <div key={x}><b>0{i + 1}</b><span>{x}</span></div>)}</div>
    </section>
    <aside className="coffee-note"><span>08</span><p>DẤU MỐC LỊCH SỬ<br/><b>MỘT HÀNH TRÌNH</b></p></aside>
  </main>
}
