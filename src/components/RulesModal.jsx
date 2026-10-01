import { X } from "lucide-react"
import { GAME_TIME } from "../hooks/useGameLogic"

export default function RulesModal({ game }) {
  if (!game.rulesOpen) return null

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="rules-title">
      <section className="modal-panel">
        <button className="modal-close" onClick={() => game.setRulesOpen(false)} aria-label="Đóng">
          <X />
        </button>
        <p className="eyebrow">HƯỚNG DẪN TRẢI NGHIỆM</p>
        <h2 id="rules-title">Luật Trò Chơi</h2>
        <ol>
          <li>Chọn một thẻ <strong>Khái niệm</strong> và một thẻ <strong>Nội dung cốt lõi</strong> tương ứng.</li>
          <li>Ghép đúng nhận <strong>+100 điểm</strong>, duy trì chuỗi đúng nhận <strong>combo x2 / x3</strong>; ghép sai bị <strong>−20 điểm</strong>.</li>
          <li>Mỗi cặp đúng nạp <strong>+25% Khí thế đoàn kết</strong>. Khi đạt 100%, nhận <strong>1 quyền trợ giúp</strong> mở nhanh một cặp trong 2 giây.</li>
          <li>Hoàn thành toàn bộ 8 cặp nội dung trước khi đồng hồ <strong>{GAME_TIME} giây</strong> kết thúc.</li>
        </ol>
        <button className="primary-btn" onClick={() => game.setRulesOpen(false)}>
          ĐÃ HIỂU & SẴN SÀNG
        </button>
      </section>
    </div>
  )
}
