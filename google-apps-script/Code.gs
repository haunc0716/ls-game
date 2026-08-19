const SHEET_NAME = 'LichSu1939_1945';
const HEADERS = ['Tên', 'Điểm', 'Thời gian'];
const LEADERBOARD_LIMIT = 30;

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const action = (params.action || '').toLowerCase();

  if (action === 'submit') {
    return submitScore_(params);
  }

  if (action === 'fetch') {
    return fetchLeaderboard_();
  }

  return jsonOutput_({
    ok: false,
    error: 'Missing or invalid action. Use ?action=submit or ?action=fetch',
  });
}

function submitScore_(params) {
  const lock = LockService.getDocumentLock();
  lock.waitLock(10000);

  try {
    const sheet = getLeaderboardSheet_();
    const displayName = sanitizeText_(params.name, 'Ẩn danh');
    const playerMeta = parsePlayerMeta_(displayName);
    const nextScore = toNumber_(params.score, 0);
    const nextSeconds = toNumber_(params.seconds, 120);
    const nextTime = formatLeaderboardTime_(nextSeconds, new Date());
    const existing = findPlayerRow_(sheet, playerMeta.playerId);

    if (!existing) {
      sheet.appendRow([displayName, nextScore, nextTime]);
    } else {
      const currentScore = toNumber_(existing.score, 0);
      const currentTime = parseLeaderboardTime_(existing.time);
      const isBetter = nextScore > currentScore || (nextScore === currentScore && nextSeconds < currentTime.seconds);

      sheet.getRange(existing.rowNumber, 1).setValue(displayName);
      if (isBetter) {
        sheet.getRange(existing.rowNumber, 2, 1, 2).setValues([[nextScore, nextTime]]);
      }
    }

    return jsonOutput_({
      ok: true,
      message: 'Score saved',
    });
  } finally {
    lock.releaseLock();
  }
}

function fetchLeaderboard_() {
  const sheet = getLeaderboardSheet_();
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return jsonOutput_([]);
  }

  const rows = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  const bestByPlayer = rows
    .map(function(row, index) {
      const timeInfo = parseLeaderboardTime_(row[2]);
      const playerMeta = parsePlayerMeta_(row[0]);
      return {
        id: 'row-' + (index + 2),
        rowNumber: index + 2,
        name: playerMeta.displayName,
        displayName: playerMeta.displayName,
        playerId: playerMeta.playerId,
        score: toNumber_(row[1], 0),
        time: timeInfo.seconds,
        timeLabel: timeInfo.timeLabel,
        date: timeInfo.date,
        playedAt: timeInfo.playedAt,
        seconds: timeInfo.seconds,
      };
    })
    .filter(function(entry) {
      return entry.name || entry.score || entry.playedAt;
    })
    .reduce(function(best, entry) {
      const current = best[entry.playerId];
      if (!current) {
        best[entry.playerId] = entry;
        return best;
      }
      if (entry.score > current.score || (entry.score === current.score && entry.seconds < current.seconds)) {
        best[entry.playerId] = {
          id: entry.id,
          rowNumber: entry.rowNumber,
          name: entry.name,
          displayName: entry.displayName,
          playerId: entry.playerId,
          score: entry.score,
          time: entry.time,
          timeLabel: entry.timeLabel,
          date: entry.date,
          playedAt: entry.playedAt,
          seconds: entry.seconds,
        };
        return best;
      }
      best[entry.playerId] = {
        id: current.id,
        rowNumber: current.rowNumber,
        name: entry.name,
        displayName: entry.displayName,
        playerId: current.playerId,
        score: current.score,
        time: current.time,
        timeLabel: current.timeLabel,
        date: current.date,
        playedAt: current.playedAt,
        seconds: current.seconds,
      };
      return best;
    }, {});
  const ranked = Object.keys(bestByPlayer)
    .map(function(playerId) { return bestByPlayer[playerId]; })
    .sort(function(a, b) {
      if (b.score !== a.score) return b.score - a.score;
      if (a.seconds !== b.seconds) return a.seconds - b.seconds;
      return a.rowNumber - b.rowNumber;
    })
    .slice(0, LEADERBOARD_LIMIT);

  return jsonOutput_(ranked);
}

function getLeaderboardSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  ensureHeaders_(sheet);
  return sheet;
}

function ensureHeaders_(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  const currentHeaders = headerRange.getValues()[0];

  HEADERS.forEach(function(header, index) {
    if (currentHeaders[index] !== header) {
      sheet.getRange(1, index + 1).setValue(header);
    }
  });
}

function jsonOutput_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function sanitizeText_(value, fallback) {
  const text = String(value || '').trim();
  return text || fallback;
}

function toNumber_(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatTimestamp_(date) {
  const timezone = Session.getScriptTimeZone() || 'Asia/Bangkok';
  return Utilities.formatDate(date, timezone, 'HH:mm:ss d/M/yyyy');
}

function formatLeaderboardTime_(seconds, date) {
  return seconds + 's - ' + formatTimestamp_(date);
}

function parseLeaderboardTime_(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return { playedAt: '', timeLabel: '', date: '', seconds: 120 };
  }

  const parts = raw.split(' - ');
  const timeLabel = parts[0] || '';
  const playedAt = parts.slice(1).join(' - ') || raw;
  const stampParts = playedAt.split(' ');
  return {
    playedAt: playedAt,
    timeLabel: timeLabel || raw,
    date: stampParts.slice(1).join(' ') || playedAt,
    seconds: parseSeconds_(timeLabel),
  };
}

function parseSeconds_(value) {
  const match = String(value || '').match(/(\d+)/);
  return match ? Number(match[1]) : 120;
}

function parsePlayerMeta_(value) {
  const text = sanitizeText_(value, 'Ẩn danh');
  const match = text.match(/^(.*?)\s*[·-]\s*#(\d{4})$/);
  if (!match) {
    return {
      displayName: text,
      playerId: text.toLowerCase(),
    };
  }

  return {
    displayName: match[1].trim() + ' · #' + match[2],
    playerId: match[2],
  };
}

function findPlayerRow_(sheet, playerId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;

  const names = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
  for (var index = 0; index < names.length; index += 1) {
    const row = names[index];
    const meta = parsePlayerMeta_(row[0]);
    if (meta.playerId === playerId) {
      return {
        rowNumber: index + 2,
        score: row[1],
        time: row[2],
      };
    }
  }

  return null;
}
