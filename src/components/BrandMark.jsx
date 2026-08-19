export default function BrandMark({ compact = false }) {
  return <div className={`brand ${compact ? "brand--compact" : ""}`} aria-label="Dấu Ấn Lịch Sử"><img className="brand-logo" src="/assets/coffee-game/history-mark.svg" alt="" aria-hidden="true" /><span lang="vi"><strong>Dấu Ấn</strong><small>Lịch Sử</small></span></div>
}
