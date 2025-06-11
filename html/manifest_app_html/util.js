function getState() {
  const raw = localStorage.getItem('manifest_state');
  return raw ? JSON.parse(raw) : {
    desire: '',
    streak: 0,
    total: 0,
    longest: 0,
    last: null,
    entries: []
  };
}

function saveState(state) {
  localStorage.setItem('manifest_state', JSON.stringify(state));
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function hasCompletedToday(state) {
  return state.last === todayStr();
}

function incrementStreak(state) {
  const today = todayStr();
  if (state.last === today) return state;
  const prev = state.last ? new Date(state.last) : null;
  const isConsecutive = prev && ((new Date(prev.getTime() + 86400000)).toISOString().split('T')[0] === today);
  state.streak = isConsecutive ? state.streak + 1 : 1;
  state.total += 1;
  if (state.streak > state.longest) state.longest = state.streak;
  state.last = today;
  return state;
}

function nextMilestoneDays(streak) {
  if (streak < 7) return 7 - streak;
  if (streak < 14) return 14 - streak;
  if (streak < 21) return 21 - streak;
  if (streak < 28) return 28 - streak;
  return 0;
}

function currentBadge(streak) {
  if (streak >= 28) return 'Glowing star ⭐';
  if (streak >= 21) return 'Blooming flower 🌸';
  if (streak >= 14) return 'Growing tree 🌿';
  if (streak >= 7) return 'Golden seed 🌱';
  return '';
}
