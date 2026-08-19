import { memo, useMemo } from "react"
import { CircleHelp, Lightbulb, Pause, Play, RotateCcw, Volume2, VolumeX, X } from "lucide-react"
import BrandMark from "./BrandMark"
import { SCREENS, GAME_TIME } from "../hooks/useGameLogic"

const Stat = memo(function Stat({ value, label, danger }) { return <div className={`stat ${danger ? "danger" : ""}`}><strong>{value}</strong><span>{label}</span></div> })

const formatClock = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

const MemoryCard = memo(function MemoryCard({ card, index, isUp, isMatched, isWrong, onSelectCard }) {
  const logoSrc = "/assets/coffee-game/history-mark.svg"
  return <button type="button" className={`memory-card ${isUp ? "is-up" : ""} ${isMatched ? "is-matched" : ""} ${isWrong ? "is-wrong" : ""} ${index % 2 === 0 ? "is-light-mark" : "is-dark-mark"}`} onPointerDown={() => onSelectCard(card)} onClick={(event) => { if (event.detail === 0) onSelectCard(card) }} disabled={isMatched} aria-label={isUp ? card.text : "Tư liệu đang úp"}><span className="card-rotor"><span className="card-side card-back"><span className="card-back-glow" aria-hidden="true" /><img className="card-back-logo" src={logoSrc} alt="" aria-hidden="true" /><small className="card-back-word">1939 · 1945</small></span><span className="card-side card-front"><em>{card.type === "term" ? "SỰ KIỆN" : "Ý NGHĨA"}</em><span>{card.text}</span></span></span></button>
}, (prev, next) => prev.card === next.card && prev.index === next.index && prev.isUp === next.isUp && prev.isMatched === next.isMatched && prev.isWrong === next.isWrong && prev.onSelectCard === next.onSelectCard)

function PauseModal({ game }) { if (!game.paused) return null; return <div className="modal-backdrop"><section className="modal-panel pause-panel"><Pause size={36}/><p className="eyebrow">TẠM DỪNG HÀNH TRÌNH</p><h2>DÒNG LỊCH SỬ ĐANG TẠM DỪNG</h2><p>Đồng hồ đã dừng. Khi sẵn sàng, hãy trở lại hành trình tìm hiểu các dấu mốc 1939–1945.</p><button className="primary-btn" onClick={() => game.setPaused(false)}><Play/> TIẾP TỤC</button><div className="modal-actions"><button onClick={game.startGame}><RotateCcw/> Chơi lại</button><button onClick={() => game.setScreen(SCREENS.START)}><X/> Thoát</button></div></section></div> }

export default function PlayScreen({ game }) {
  const flippedIds = useMemo(() => new Set(game.flipped.map((card) => card.uid)), [game.flipped])

  return <main className="scene scene--play">
    <header className="game-header"><div className="player-block"><BrandMark compact/><span className="avatar">{game.playerName.slice(0, 1).toUpperCase()}</span><p><small>NGƯỜI CHƠI · #{game.playerCode}</small><strong>{game.playerName}</strong></p></div><div className="stats"><Stat value={formatClock(game.remainingTime)} label="THỜI GIAN" danger={game.remainingTime <= 10}/><Stat value={`${game.matched.size}/8`} label="CẶP ĐÚNG"/><Stat value={game.wrongCount} label="LẦN SAI"/><Stat value={game.score} label="ĐIỂM"/></div><div className="header-actions"><button onClick={() => game.setPaused(true)} aria-label="Tạm dừng"><Pause/></button><button onClick={() => game.setSoundEnabled(!game.soundEnabled)} aria-label="Âm thanh">{game.soundEnabled ? <Volume2/> : <VolumeX/>}</button><button onClick={() => game.setRulesOpen(true)} aria-label="Luật chơi"><CircleHelp/></button></div><div className="time-progress"><i style={{ width: `${game.remainingTime / GAME_TIME * 100}%` }}/></div></header>
    <section className="game-layout"><aside className="mission-panel"><p className="eyebrow">NHIỆM VỤ</p><h3>Hoàn thành 8 dấu mốc trước khi hết giờ</h3><div className="ring" style={{ "--p": `${game.matched.size / 8 * 360}deg` }}><strong>{game.matched.size}</strong><span>/ 8 MỐC</span></div><div className="badge-label">{game.matched.size >= 7 ? "NHÀ SỬ HỌC" : game.matched.size >= 4 ? "NGƯỜI AM HIỂU" : "NGƯỜI KHÁM PHÁ"}</div></aside>
      <div className="board"><div className="board-top"><span>CHỌN 1 SỰ KIỆN + 1 Ý NGHĨA LỊCH SỬ</span>{game.combo >= 2 && <b className="combo">LIÊN HOÀN ×{Math.min(3, game.combo)}</b>}</div><div className="card-grid">{game.cards.map((card, index) => { const isMatched = game.matched.has(card.pairId); const isUp = isMatched || flippedIds.has(card.uid) || game.peeked.has(card.uid); return <MemoryCard card={card} index={index} isUp={isUp} isMatched={isMatched} isWrong={game.wrongCards.has(card.uid)} onSelectCard={game.selectCard} key={card.uid}/> })}</div></div>
      <aside className="energy-panel"><p className="eyebrow">KHÍ THẾ CÁCH MẠNG</p><div className="energy"><i style={{ height: `${game.momentum}%` }}/><span>{game.momentum}%</span></div><p>Ghép đúng để tích lũy khí thế và mở khóa trợ giúp.</p><button className="hint-btn" onClick={game.useHint}><Lightbulb/><span>Xem nhanh một cặp<small>Còn {game.hints} lượt</small></span></button><div className="pair-progress"><span>Tiến độ hành trình</span><i><b style={{ width: `${game.matched.size / 8 * 100}%` }}/></i></div></aside>
    </section>{game.toast && <div className="toast" role="status">{game.toast}</div>}<PauseModal game={game}/>
  </main>
}
