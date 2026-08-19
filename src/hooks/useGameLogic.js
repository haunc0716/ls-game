import { useCallback, useEffect, useRef, useState } from "react"
import { pairs } from "../data/pairs"
import { fetchLeaderboard, submitScore } from "../services/api"

export const SCREENS = { START: "start", PLAY: "play", RESULT: "result", LEADERBOARD: "leaderboard", TIMEOUT: "timeout" }
export const GAME_TIME = 180
const LEADERBOARD_KEY = "history-1939-1945-leaderboard"
const LEADERBOARD_LIMIT = 30
const PLAYER_CODE_KEY = "history-1939-1945-player-code"

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5)
const makeCards = () => shuffle(pairs.flatMap((pair, pairId) => [
  { uid: `${pairId}-term`, pairId, type: "term", text: pair.term },
  { uid: `${pairId}-def`, pairId, type: "def", text: pair.def },
]))
const generatePlayerCode = () => String(Math.floor(1000 + Math.random() * 9000))
const getOrCreatePlayerCode = () => {
  const saved = localStorage.getItem(PLAYER_CODE_KEY)
  if (saved) return saved
  const next = generatePlayerCode()
  localStorage.setItem(PLAYER_CODE_KEY, next)
  return next
}
const formatDisplayName = (name, code) => `${name.trim()} · #${code}`
const parsePlayerMeta = (name) => {
  const text = String(name || "").trim()
  const match = text.match(/^(.*?)\s*[·-]\s*#(\d{4})$/)
  if (!match) return { name: text, playerCode: "", playerId: text.toLowerCase() }
  const cleanName = match[1].trim()
  const playerCode = match[2]
  return { name: cleanName, playerCode, playerId: playerCode }
}
const normalizeTimestamp = (value) => {
  const text = String(value || "").trim()
  if (!text) return { playedAt: "", date: "", timeLabel: "" }
  const [timeLabelPart = "", stampPart = ""] = text.split(" - ")
  const parts = stampPart.split(" ")
  return {
    playedAt: stampPart || text,
    date: parts.slice(1).join(" ") || stampPart || text,
    timeLabel: timeLabelPart || "",
  }
}
const normalizeEntry = (entry, index = 0) => {
  const fallbackStamp = normalizeTimestamp(entry.playedAt ?? entry.timeStamp ?? entry.timeText ?? entry.time)
  const duration = Number(entry.seconds ?? entry.time)
  const hasDuration = Number.isFinite(duration)
  const playerMeta = parsePlayerMeta(entry.displayName ?? entry.name)
  return {
    id: entry.id ?? `${playerMeta.playerId || entry.name || "player"}-${entry.date ?? "date"}-${index}`,
    name: entry.name && entry.playerCode ? entry.name : (playerMeta.name || "Ẩn danh"),
    playerCode: entry.playerCode ?? playerMeta.playerCode,
    playerId: entry.playerId ?? playerMeta.playerId,
    displayName: entry.displayName ?? (playerMeta.playerCode ? formatDisplayName(playerMeta.name, playerMeta.playerCode) : (entry.name ?? "Ẩn danh")),
    score: Number(entry.score) || 0,
    seconds: hasDuration ? duration : GAME_TIME,
    timeLabel: hasDuration ? `${duration}s` : (entry.timeLabel ?? fallbackStamp.timeLabel ?? "-"),
    date: entry.date ?? fallbackStamp.date ?? "",
    playedAt: entry.playedAt ?? fallbackStamp.playedAt ?? "",
  }
}
const rankEntries = (entries) => Array.from(entries.reduce((best, entry) => {
  const normalized = normalizeEntry(entry)
  const current = best.get(normalized.playerId)
  if (!current) {
    best.set(normalized.playerId, normalized)
    return best
  }
  if (normalized.score > current.score || (normalized.score === current.score && normalized.seconds < current.seconds)) {
    best.set(normalized.playerId, { ...normalized, displayName: normalized.displayName, name: normalized.name, playerCode: normalized.playerCode })
    return best
  }
  best.set(normalized.playerId, { ...current, displayName: normalized.displayName, name: normalized.name, playerCode: normalized.playerCode })
  return best
}, new Map()).values()).sort((a, b) => b.score - a.score || a.seconds - b.seconds).slice(0, LEADERBOARD_LIMIT)

export function useGameLogic() {
  const [screen, setScreen] = useState(SCREENS.START)
  const [playerName, setPlayerName] = useState("")
  const [playerCode] = useState(() => getOrCreatePlayerCode())
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState(new Set())
  const [wrongCards, setWrongCards] = useState(new Set())
  const [wrongCount, setWrongCount] = useState(0)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [highestCombo, setHighestCombo] = useState(0)
  const [remainingTime, setRemainingTime] = useState(GAME_TIME)
  const [momentum, setMomentum] = useState(0)
  const [hints, setHints] = useState(0)
  const [paused, setPaused] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [rulesOpen, setRulesOpen] = useState(false)
  const [toast, setToast] = useState("")
  const [locked, setLocked] = useState(false)
  const [peeked, setPeeked] = useState(new Set())
  const [leaderboard, setLeaderboard] = useState([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(false)
  const toastTimer = useRef()
  const audioCtxRef = useRef(null)
  const playerNameRef = useRef(playerName)
  const scoreRef = useRef(score)
  const remainingTimeRef = useRef(remainingTime)

  useEffect(() => { playerNameRef.current = playerName }, [playerName])
  useEffect(() => { scoreRef.current = score }, [score])
  useEffect(() => { remainingTimeRef.current = remainingTime }, [remainingTime])

  const playSound = useCallback((kind) => {
    if (!soundEnabled) return
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = audioCtxRef.current || new AudioCtx()
    audioCtxRef.current = ctx
    if (ctx.state === "suspended") ctx.resume()
    const osc = ctx.createOscillator(); const gain = ctx.createGain()
    const tones = { flip: [310, .05], correct: [660, .16], wrong: [145, .18], warning: [440, .12], finish: [880, .3] }
    const [frequency, duration] = tones[kind] || tones.flip
    osc.frequency.value = frequency; osc.type = kind === "wrong" ? "sawtooth" : "sine"
    gain.gain.setValueAtTime(.055, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + duration)
    osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + duration)
  }, [soundEnabled])

  useEffect(() => () => audioCtxRef.current?.close(), [])

  const notify = useCallback((message) => {
    setToast(message); clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(""), 1800)
  }, [])

  const refreshLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true)
    let next = []
    try {
      const remote = await fetchLeaderboard()
      if (remote.length) {
        next = rankEntries(remote.map((entry, index) => normalizeEntry(entry, index)))
      }
    } catch {
      // Dùng bảng xếp hạng cục bộ khi nguồn Google không khả dụng.
    }

    if (!next.length) {
      next = rankEntries(JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || "[]"))
    }

    setLeaderboard(next)
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(next))
    setLeaderboardLoading(false)
    return next
  }, [])

  const saveResult = useCallback((overrides = {}) => {
    const duration = overrides.time ?? GAME_TIME - remainingTimeRef.current
    const cleanName = playerNameRef.current.trim()
    const record = {
      id: playerCode,
      playerId: playerCode,
      playerCode,
      name: cleanName,
      displayName: formatDisplayName(cleanName, playerCode),
      score: overrides.score ?? scoreRef.current,
      seconds: duration,
      timeLabel: `${duration}s`,
      date: new Date().toLocaleDateString("vi-VN"),
      playedAt: new Date().toLocaleString("vi-VN"),
    }
    const old = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || "[]")
    const next = rankEntries([...old, record])
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(next))
    setLeaderboard(next)
    submitScore(record)
      .catch(() => {})
      .finally(() => refreshLeaderboard())
  }, [playerCode, refreshLeaderboard])

  useEffect(() => {
    if (screen !== SCREENS.PLAY || paused) return
    const timer = setInterval(() => setRemainingTime((t) => {
      if (t <= 1) {
        clearInterval(timer)
        queueMicrotask(() => { saveResult({ time: GAME_TIME }); setScreen(SCREENS.TIMEOUT) })
        return 0
      }
      if (t === 11) playSound("warning")
      return t - 1
    }), 1000)
    return () => clearInterval(timer)
  }, [screen, paused, saveResult, playSound])

  const startGame = useCallback(() => {
    setCards(makeCards()); setFlipped([]); setMatched(new Set()); setWrongCards(new Set())
    setWrongCount(0); setScore(0); setCombo(0); setHighestCombo(0); setRemainingTime(GAME_TIME)
    setMomentum(0); setHints(0); setPaused(false); setLocked(false); setPeeked(new Set()); setScreen(SCREENS.PLAY)
  }, [])

  const selectCard = useCallback((card) => {
    if (locked || paused || matched.has(card.pairId) || flipped.some((c) => c.uid === card.uid) || flipped.length >= 2) return
    const next = [...flipped, card]; setFlipped(next)
    playSound("flip")
    if (next.length < 2) return
    setLocked(true)
    const [a, b] = next
    if (a.pairId === b.pairId && a.type !== b.type) {
      setTimeout(() => {
        const nextMatched = new Set(matched).add(a.pairId)
        const nextCombo = combo + 1; const multiplier = nextCombo >= 3 ? 3 : nextCombo >= 2 ? 2 : 1
        const nextScore = score + 100 * multiplier
        setMatched(nextMatched); setCombo(nextCombo); setHighestCombo((v) => Math.max(v, nextCombo)); setScore(nextScore)
        setMomentum((v) => { const n = v + 25; if (n >= 100) { setHints((h) => h + 1); notify("Khí thế dâng cao — nhận 1 quyền trợ giúp"); return 0 } return n })
        setFlipped([]); setLocked(false); notify(`CHÍNH XÁC  +${100 * multiplier}`); playSound("correct")
        if (nextMatched.size === pairs.length) { setTimeout(() => { playSound("finish"); saveResult({ score: nextScore }); setScreen(SCREENS.RESULT) }, 600) }
      }, 450)
    } else {
      setWrongCards(new Set([a.uid, b.uid])); setWrongCount((v) => v + 1); setScore((v) => Math.max(0, v - 20)); setCombo(0); notify("CHƯA ĐÚNG  −20"); playSound("wrong")
      setTimeout(() => { setWrongCards(new Set()); setFlipped([]); setLocked(false) }, 800)
    }
  }, [combo, flipped, locked, matched, notify, paused, playSound, saveResult, score])

  const useHint = useCallback(() => {
    if (!hints || locked) return notify("Hãy tích lũy đầy khí thế trước")
    const unmatched = cards.filter((c) => !matched.has(c.pairId)); if (!unmatched.length) return
    const chosen = unmatched[0].pairId
    setHints((h) => h - 1); setPeeked(new Set(cards.filter((c) => c.pairId === chosen).map((c) => c.uid))); notify("Gợi ý đang mở trong 2 giây")
    setTimeout(() => setPeeked(new Set()), 2000)
  }, [cards, hints, locked, matched, notify])

  return { screen, setScreen, playerName, setPlayerName, playerCode, playerId: playerCode, playerDisplayName: playerName.trim() ? formatDisplayName(playerName, playerCode) : "", cards, flipped, matched, wrongCards, wrongCount, score, combo, highestCombo, remainingTime, momentum, hints, paused, setPaused, soundEnabled, setSoundEnabled, rulesOpen, setRulesOpen, toast, locked, peeked, leaderboard, leaderboardLoading, refreshLeaderboard, startGame, selectCard, useHint }
}
