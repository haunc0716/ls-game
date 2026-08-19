// ⚠️ Dán URL Web App Google Apps Script CỦA BẠN vào đây sau khi deploy (xem README mục "Google Sheets leaderboard").
const URL =
  "https://script.google.com/macros/s/AKfycbz0_r9E_mILp0aIMOVypA9XHZLmBGaXhDHXkLQMsQkGFiSunEcpC8a1PFpFfSoBVxZZ/exec";

const toQueryString = (params) => new URLSearchParams(
  Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null) acc[key] = String(value)
    return acc
  }, {})
).toString()

export async function submitScore(record) {
  const query = toQueryString({
    action: "submit",
    name: record.displayName,
    score: record.score,
    seconds: record.seconds,
  })
  await fetch(`${URL}?${query}`, { method: "GET", mode: "no-cors" })
}

export async function fetchLeaderboard() {
  try {
    const res = await fetch(`${URL}?action=fetch&t=${Date.now()}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
