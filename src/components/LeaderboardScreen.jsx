import { useEffect } from "react"
import { ArrowLeft, Play } from "lucide-react"
import { SCREENS } from "../hooks/useGameLogic"
export default function LeaderboardScreen({ game }) {
  const leaders = game.leaderboard
  const { refreshLeaderboard } = game
  useEffect(() => {
    refreshLeaderboard()
  }, [refreshLeaderboard])
  return <main className="scene scene--result"><section className="leaderboard"><p className="eyebrow">DANH DỰ & THÀNH TÍCH</p><h1>BẢNG VÀNG THÀNH TÍCH</h1><div className="menu-table"><div className="lb-head"><span>HẠNG</span><span>NGƯỜI CHƠI</span><span>ĐIỂM</span><span>THỜI GIAN</span><span>NGÀY CHƠI</span></div>{game.leaderboardLoading && !leaders.length ? <p className="empty-list">Đang tải bảng xếp hạng...</p> : leaders.length ? leaders.map((p, i) => <div className={`lb-row ${p.playerId === game.playerId ? "current" : ""}`} key={p.id}><span className={`rank rank-${i + 1}`}>{String(i + 1).padStart(2, "0")}</span><strong>{p.displayName || p.name}</strong><b>{p.score}</b><span>{p.timeLabel || "-"}</span><span>{p.date || "-"}</span></div>) : <p className="empty-list">Chưa có thành tích. Hãy là người đầu tiên ghi tên lên bảng vàng.</p>}</div><div className="result-actions"><button onClick={() => game.setScreen(SCREENS.START)}><ArrowLeft/> Trang chính</button><button className="primary-btn" onClick={game.startGame}><Play/> CHƠI LẠI</button></div></section></main>
}
