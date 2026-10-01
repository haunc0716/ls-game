export default function BrandMark({ compact = false }) {
  return <div className={`brand ${compact ? "brand--compact" : ""}`} aria-label="Vấn đề Dân tộc"><img className="brand-logo" src="/assets/coffee-game/history-mark.svg" alt="" aria-hidden="true" /><span lang="vi"><strong>VẤN ĐỀ</strong><small>DÂN TỘC</small></span></div>
}
