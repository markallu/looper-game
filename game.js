const challenges = [
  { word: 'APPLE', emoji: '🍎', letter: 'A', color: '#ef6573' },
  { word: 'BEAR', emoji: '🐻', letter: 'B', color: '#a77552' },
  { word: 'CAT', emoji: '🐱', letter: 'C', color: '#f0b553' },
  { word: 'DOG', emoji: '🐶', letter: 'D', color: '#c78c5b' },
  { word: 'ELEPHANT', emoji: '🐘', letter: 'E', color: '#879bb8' },
  { word: 'FISH', emoji: '🐟', letter: 'F', color: '#38a9e3' },
  { word: 'GRAPES', emoji: '🍇', letter: 'G', color: '#8f65c5' },
  { word: 'HAT', emoji: '🎩', letter: 'H', color: '#252b44' },
  { word: 'IGLOO', emoji: '🧊', letter: 'I', color: '#83d8ee' },
  { word: 'JUICE', emoji: '🧃', letter: 'J', color: '#ff9b39' }
];
let index = 0, stars = 0, locked = false, streak = 0;
const el = id => document.getElementById(id);
const heroes = ['looper', 'wolly'];
const confettiColors = ['#ff7893', '#ffd84f', '#71cb52', '#2a9ff2', '#8f65c5'];
const distractors = answer => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(letter => letter !== answer);
  const choices = [answer];
  while (choices.length < 3) choices.push(letters.splice(Math.floor(Math.random() * letters.length), 1)[0]);
  return choices.sort(() => Math.random() - .5);
};
function speak(text) { if ('speechSynthesis' in window) { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = .78; u.pitch = 1.25; speechSynthesis.speak(u); } }

let audioCtx;
function tone(freq, start, duration, type) {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
  osc.type = type; osc.frequency.value = freq;
  osc.connect(gain); gain.connect(audioCtx.destination);
  const t = audioCtx.currentTime + start;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(.18, t + .02);
  gain.gain.exponentialRampToValueAtTime(.001, t + duration);
  osc.start(t); osc.stop(t + duration);
}
function successChime() { [523, 659, 784].forEach((freq, i) => tone(freq, i * .09, .22, 'triangle')); }
function bonusChime() { [523, 659, 784, 1047].forEach((freq, i) => tone(freq, i * .08, .28, 'triangle')); }
function buzz() { tone(196, 0, .28, 'sawtooth'); }

function confettiBurst(count) {
  const layer = el('confetti');
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const size = 6 + Math.random() * 7;
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.width = `${size}px`;
    piece.style.height = `${size * .4}px`;
    piece.style.background = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    piece.style.animationDuration = `${1.6 + Math.random() * 1.3}s`;
    piece.style.animationDelay = `${Math.random() * .3}s`;
    piece.addEventListener('animationend', () => piece.remove());
    layer.appendChild(piece);
  }
}
const helpers = ['Looper found', 'Wolly knows'];
function react(character, cls) {
  character.classList.remove('celebrate-big', 'celebrate-small', 'wince');
  void character.offsetWidth;
  character.classList.add(cls);
}
function updateStreak() {
  const badge = el('streakBadge');
  if (streak >= 2) {
    el('streakCount').textContent = streak; badge.hidden = false;
    badge.classList.remove('pop'); void badge.offsetWidth; badge.classList.add('pop');
  } else badge.hidden = true;
}
function render() {
  const item = challenges[index]; locked = false;
  el('word').textContent = item.word; el('picture').textContent = item.emoji;
  el('picture').style.background = `linear-gradient(135deg, #fff, ${item.color}55)`;
  el('prompt').textContent = `${helpers[index % helpers.length]} a ${item.word.toLowerCase()}!`;
  el('round').textContent = `ROUND ${index + 1} OF ${challenges.length}`;
  el('progress').style.width = `${(index / challenges.length) * 100 + 10}%`;
  el('coach').className = 'coach'; el('coach').textContent = 'Tap a letter to help your friends!'; el('next').hidden = true;
  el('choices').replaceChildren(...distractors(item.letter).map(letter => {
    const btn = document.createElement('button'); btn.className = 'choice'; btn.textContent = letter; btn.setAttribute('aria-label', `Choose ${letter}`);
    btn.onclick = () => choose(btn, letter, item); return btn;
  }));
}
function choose(button, letter, item) {
  if (locked) return;
  const hero = document.querySelector(`.character.${heroes[index % heroes.length]}`);
  const isLast = index === challenges.length - 1;
  if (letter === item.letter) {
    locked = true; button.classList.add('correct'); stars++; streak++;
    const bonus = streak % 3 === 0;
    if (bonus) stars++;
    el('stars').textContent = stars; updateStreak();
    el('coach').className = 'coach win';
    el('coach').textContent = bonus ? `Bonus star! ${streak} in a row! ★★` : `Amazing! ${item.word} starts with ${item.letter}! ★`;
    el('card').classList.remove('celebrate'); void el('card').offsetWidth; el('card').classList.add('celebrate');
    speak(`${item.word} starts with ${item.letter}. Great job!`);
    document.querySelectorAll('.character').forEach(character => react(character, character === hero ? 'celebrate-big' : 'celebrate-small'));
    confettiBurst(isLast ? 70 : bonus ? 34 : 20);
    bonus ? bonusChime() : successChime();
    if (isLast) {
      setTimeout(() => { el('finaleStars').textContent = `You collected ${stars} stars ★`; el('finale').hidden = false; confettiBurst(45); }, 1000);
    } else {
      el('next').hidden = false; el('next').textContent = 'Next adventure →';
    }
  } else {
    button.classList.add('wrong'); button.disabled = true; streak = 0; updateStreak();
    el('coach').className = 'coach try'; el('coach').textContent = 'Nice try! Listen for the first sound.';
    if (hero) react(hero, 'wince');
    buzz(); speak(`Try again. ${item.word}.`);
  }
}
el('next').onclick = () => { index++; render(); };
el('sound').onclick = () => { const item = challenges[index]; speak(`${item.word}. ${item.letter} is for ${item.word}.`); };
el('playAgain').onclick = () => { index = 0; stars = 0; streak = 0; el('stars').textContent = 0; el('streakBadge').hidden = true; el('finale').hidden = true; render(); };
document.querySelectorAll('.character').forEach(c => c.addEventListener('animationend', e => { if (e.animationName === 'dropIn') c.classList.remove('entrance'); }));
render();
