// 크레파스 그림체 공용 도구상자.
// 스케치북 낚시 · 곤충채집 · 낙서 3D 가 각자 복사해서 쓰던 것들을 한곳에 모았다.
// 도트 게임의 pixel-art.js 와 같은 역할 — 이쪽은 크레파스 담당.
//
// 쓰는 법:
//   <script src="crayon.js"></script>
//   const cv = document.getElementById('cv');
//   const ctx = cv.getContext('2d');
//   crayonUse(ctx, cv.width, cv.height);     // ← 이거 먼저! 어느 종이에 그릴지 알려주기
//   crayonPath([[10,10],[200,60]], { color: CRAYON.red });
//
// ⚠️ pixel-art.js 는 pixelBlock(ctx, ...) 처럼 ctx를 매번 넘기지만,
//    여기는 crayonUse()로 한 번만 정해둔다. 원래 두 게임이 쓰던 방식 그대로라서
//    나중에 낚시·곤충채집을 이 파일로 옮길 때 부르는 코드를 안 고쳐도 된다.

let _ctx = null, _W = 0, _H = 0;

// 어느 캔버스에 그릴지 정한다. 화면 크기가 바뀌면 다시 부를 것.
// 배경을 오프스크린에 미리 그려두는 기법을 쓸 땐, 그릴 때만 잠깐 바꿨다가 되돌리면 된다.
function crayonUse(ctx, w, h) {
  _ctx = ctx;
  _W = w;
  _H = h;
}

// 지금 종이 크기 — 게임 쪽에서 W/H를 따로 안 들고 다녀도 되게.
function crayonSize() { return { w: _W, h: _H }; }

function _need() {
  if (!_ctx) throw new Error('crayonUse(ctx, W, H)를 먼저 부르세요');
  return _ctx;
}

// ---------- 크레파스 팔레트 ----------
// 크레파스 통이라고 생각하면 된다. 색을 늘리고 싶으면 여기에 추가.
const CRAYON = {
  paper:     '#fdf8ec',   // 스케치북 종이
  desk:      '#7a6a55',   // 책상 (종이 바깥)
  skyBlue:   '#8fd0ea',
  green:     '#6fb04c',
  darkGreen: '#42813a',
  yellow:    '#ffd23f',
  orange:    '#ff9633',
  brown:     '#a9713a',
  darkBrown: '#7c4f26',
  gray:      '#9aa0a8',
  red:       '#ff5f4c',
  redDark:   '#d24638',
  pink:      '#ff8fb1',
  skin:      '#ffcf9e',
  purple:    '#a077d8',
  navy:      '#2c5d94',
  black:     '#3a3530',
  cream:     '#fff6da',
};

// ---------- 색 섞기 ----------
// '#rgb' / '#rrggbb' → [r, g, b]
function _rgb(hex) {
  let h = String(hex).trim().replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// 색 두 개를 t(0~1) 비율로 섞는다. t=0이면 a, t=1이면 b.
function mixColor(a, b, t) {
  t = Math.max(0, Math.min(1, t));
  const A = _rgb(a), B = _rgb(b);
  const c = A.map((v, i) => Math.round(v + (B[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

// ⚠️ 여러 색을 **거쳐 가는** 그라데이션. (깊이 잠수 연습작에서 배운 것)
//    크림색에서 남색으로 곧장 섞으면 중간이 칙칙한 회색이 된다 — 물속인데 회색이면 몰입이 깨진다.
//    중간에 하늘색을 하나 끼워 넣으면 크림 → 하늘 → 남색으로 자연스럽게 넘어간다.
//      rampColor([CRAYON.paper, CRAYON.skyBlue, '#122a4e'], 깊이 / 최대깊이)
function rampColor(stops, t) {
  if (stops.length === 1) return mixColor(stops[0], stops[0], 0);
  t = Math.max(0, Math.min(1, t));
  const seg = 1 / (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(t / seg));
  return mixColor(stops[i], stops[i + 1], (t - i * seg) / seg);
}

// ---------- 시드 랜덤 (같은 시드면 항상 같은 꼬불거림) ----------
// 매번 다르게 흔들리면 그림이 부들부들 떨려서 눈이 아프다.
// 그래서 "이 선의 흔들림"을 시드로 고정해두고 늘 같은 모양으로 그린다.
function mulberry32(a) {
  return function() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 라인 보일 — 이 값을 바꾸면 모든 선의 꼬불거림이 한꺼번에 달라진다.
// 몇 프레임마다 crayonBoil()을 부르면 그림이 손으로 다시 그린 것처럼 살아 움직인다.
let _boil = 0;
function crayonBoil(steps = 3) { _boil = (_boil + 1) % steps; }
function crayonBoilSeed() { return _boil; }

// ---------- 경로 도우미 ----------
// 점과 점 사이가 멀면 흔들림을 줄 자리가 없다. 일정 간격으로 점을 촘촘히 다시 찍는다.
function resample(pts, step) {
  const out = [pts[0].slice()];
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const ax = pts[i - 1][0], ay = pts[i - 1][1];
    const bx = pts[i][0], by = pts[i][1];
    const dx = bx - ax, dy = by - ay;
    const len = Math.hypot(dx, dy);
    if (len === 0) continue;
    let t = step - acc;
    while (t <= len) {
      out.push([ax + dx * (t / len), ay + dy * (t / len)]);
      t += step;
    }
    acc = len - (t - step);
  }
  out.push(pts[pts.length - 1].slice());
  return out;
}

// 타원 둘레를 점 목록으로. crayonPath에 그대로 넘기면 크레파스로 그린 동그라미가 된다.
function ellipsePts(cx, cy, rx, ry, n = 44) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return pts;
}

// ---------- 크레파스 선 ----------
// 점 목록을 받아 삐뚤빼뚤한 크레파스 선으로 그린다. 이 파일의 심장.
//   color      색
//   width      굵기
//   seed       흔들림 모양 (같은 시드 = 같은 모양)
//   alpha      진하기
//   wobble     얼마나 꼬불거릴지
//   step       점을 다시 찍는 간격 (작을수록 촘촘·느림)
//   passes     몇 번 덧그을지 (2면 크레파스처럼 겹쳐 칠해진다)
//   continuous true면 한 붓에 쭉 (색칠용), false면 토막토막 (선용)
function crayonPath(pts, opt) {
  const ctx = _need();
  const {
    color, width = 5, seed = 1, alpha = 0.9,
    wobble = 3, step = 7, passes = 2,
  } = opt;
  const rand = mulberry32((seed * 7919 + _boil * 104729) >>> 0);
  const rs = resample(pts, step);
  if (rs.length < 2) return;

  // 점마다 진행 방향의 수직 방향으로 꼬불꼬불 밀어준다
  const p1 = rand() * 6.28, p2 = rand() * 6.28;
  const jittered = rs.map((p, i) => {
    const prev = rs[Math.max(0, i - 1)], next = rs[Math.min(rs.length - 1, i + 1)];
    let nx = -(next[1] - prev[1]), ny = next[0] - prev[0];
    const nl = Math.hypot(nx, ny) || 1;
    nx /= nl; ny /= nl;
    const off = Math.sin(i * 0.33 + p1) * wobble * 0.7
              + Math.sin(i * 0.11 + p2) * wobble
              + (rand() - 0.5) * 1.6;
    return [p[0] + nx * off, p[1] + ny * off];
  });

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (opt.continuous) {
    for (let pass = 0; pass < passes; pass++) {
      const ox = (rand() - 0.5) * 3, oy = (rand() - 0.5) * 3;
      ctx.globalAlpha = alpha * (0.7 + rand() * 0.3) / passes * 1.3;
      ctx.lineWidth = width * (0.85 + rand() * 0.3);
      ctx.beginPath();
      ctx.moveTo(jittered[0][0] + ox, jittered[0][1] + oy);
      for (let i = 1; i < jittered.length; i++) {
        ctx.lineTo(jittered[i][0] + ox, jittered[i][1] + oy);
      }
      ctx.stroke();
    }
  } else {
    // 토막마다 굵기·진하기를 조금씩 바꾸면 크레파스가 종이에 긁히는 느낌이 난다
    for (let pass = 0; pass < passes; pass++) {
      const ox = (rand() - 0.5) * 2.2, oy = (rand() - 0.5) * 2.2;
      for (let i = 1; i < jittered.length; i++) {
        ctx.globalAlpha = alpha * (0.45 + rand() * 0.55) / passes * 1.6;
        ctx.lineWidth = width * (0.7 + rand() * 0.6);
        ctx.beginPath();
        ctx.moveTo(jittered[i - 1][0] + ox, jittered[i - 1][1] + oy);
        ctx.lineTo(jittered[i][0] + ox, jittered[i][1] + oy);
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}

// ---------- 크레파스 색칠 (지그재그 슥슥) ----------
// 가로줄 목록을 받아 좌우로 왔다갔다하며 칠한다. 진짜로 손으로 칠한 것처럼 삐져나온다.
function scribbleFill(rows, opt) {
  const { color, width = 6, seed = 1, alpha = 0.5, overshoot = 8 } = opt;
  const rand = mulberry32((seed * 6271 + 17) >>> 0);
  const zig = [];
  let dir = 1;
  for (const r of rows) {
    const o1 = (rand() - 0.3) * overshoot;   // 삐져나오는 정도
    const o2 = (rand() - 0.3) * overshoot;
    const a = [r.x1 - o1, r.y + (rand() - 0.5) * 3];
    const b = [r.x2 + o2, r.y + (rand() - 0.5) * 3];
    if (dir > 0) zig.push(a, b); else zig.push(b, a);
    dir *= -1;   // 다음 줄은 반대 방향으로 (지그재그)
  }
  if (zig.length < 2) return;
  crayonPath(zig, { color, width, seed: seed + 3, alpha, wobble: 2, step: 12,
                    passes: 2, continuous: true });
}

// scribbleFill에 넘길 가로줄 목록 만들기 — 타원 모양으로
function ellipseRows(cx, cy, rx, ry, gap) {
  const rows = [];
  for (let y = cy - ry + gap * 0.6; y < cy + ry; y += gap) {
    const t = (y - cy) / ry;
    const half = rx * Math.sqrt(Math.max(0, 1 - t * t));
    if (half > 4) rows.push({ y, x1: cx - half, x2: cx + half });
  }
  return rows;
}

// scribbleFill에 넘길 가로줄 목록 만들기 — 네모 모양으로
function rectRows(x, y, w, h, gap) {
  const rows = [];
  for (let yy = y + gap * 0.5; yy < y + h; yy += gap) rows.push({ y: yy, x1: x, x2: x + w });
  return rows;
}

// ---------- 크레파스 글씨 ----------
// 글자 뒤에 흐린 테두리를 깔아서 어떤 색 위에서도 읽히게 한다.
function crayonText(str, x, y, size, color, align = 'center') {
  const ctx = _need();
  ctx.save();
  ctx.font = `bold ${size}px 'Comic Sans MS', 'Chalkboard SE', sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(80,60,40,0.28)';
  ctx.lineWidth = size * 0.14;
  ctx.strokeText(str, x, y + size * 0.05);
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
  ctx.restore();
}

// 넘치면 글자 크기를 줄여서 maxW 안에 우겨넣는다. 실제로 쓴 크기를 돌려준다.
// ⚠️ 한/영을 같이 하면 영어가 한국어보다 훨씬 길어서 화면 밖으로 잘려나간다.
//    화면에 딱 맞춘 글자는 crayonText 말고 반드시 이걸 쓸 것.
function fitText(str, x, y, maxW, size, color, align) {
  const ctx = _need();
  ctx.save();
  ctx.font = `bold ${size}px 'Comic Sans MS', 'Chalkboard SE', sans-serif`;
  const w = ctx.measureText(str).width;
  ctx.restore();
  if (w > maxW) size = Math.max(9, size * maxW / w);
  crayonText(str, x, y, size, color, align);
  return size;
}

// 풍경 위에 글자를 얹을 때 — 그냥 쓰면 그림에 묻힌다 (낚시에서 배운 것).
// 글자 뒤에 반투명 종이판을 깔아준다.
function textPlate(txt, x, y, size, color) {
  const ctx = _need();
  ctx.save();
  ctx.font = `bold ${size}px 'Comic Sans MS', 'Chalkboard SE', sans-serif`;
  const w = ctx.measureText(txt).width + 24;
  ctx.fillStyle = 'rgba(253,248,236,0.82)';
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - size * 0.85, w, size * 1.7, 8);
  ctx.fill();
  ctx.restore();
  crayonText(txt, x, y, size, color);
}

// ---------- 스케치북 ----------
// 책상 위에 놓인 스케치북을 그리고, 그림 그릴 종이 영역을 돌려준다.
// 돌려받은 {x,y,w,h} 안에만 그리면 종이 밖으로 안 삐져나간다.
function drawSketchbook(opt = {}) {
  const ctx = _need();
  const { spiralH = Math.max(26, _H * 0.05), deskColor = CRAYON.desk,
          paperColor = CRAYON.paper } = opt;

  ctx.fillStyle = deskColor;
  ctx.fillRect(0, 0, _W, _H);

  const m = Math.min(_W, _H) * 0.015;
  const px = m, py = spiralH * 0.55, pw = _W - m * 2, ph = _H - py - m;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = paperColor;
  ctx.beginPath();
  ctx.roundRect(px, py, pw, ph, 6);
  ctx.fill();
  ctx.restore();

  // 스프링 — 종이를 묶는 철사 고리
  const n = Math.floor(_W / 46);
  for (let i = 0; i < n; i++) {
    const x = (i + 0.5) * (_W / n);
    ctx.save();
    ctx.strokeStyle = '#b9bec6';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(x, spiralH * 0.55, 8, spiralH * 0.42, 0.25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  return { x: px, y: py, w: pw, h: ph };
}

// ============================================================
// 저장소 — 브라우저가 localStorage를 막아도 게임은 그냥 돌아가야 한다
// ------------------------------------------------------------
// ⚠️ localStorage를 직접 부르지 말 것. 반드시 LS를 쓴다. (스케치북 낚시에서 배운 교훈)
//    사파리 사생활 보호 모드나 iframe 안에서는 localStorage가 예외를 던진다.
//    그걸 안 막으면 저장이 아니라 게임 전체가 그 자리에서 죽는다.
// ============================================================
let STORAGE_OK = true;
const LS = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { STORAGE_OK = false; return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { STORAGE_OK = false; } },
  ok() { return STORAGE_OK; },
};

// ============================================================
// 언어 — 한국어 / English (원하면 더 늘릴 수 있음)
// ------------------------------------------------------------
// 값이 문자열이면 그대로, {ko:'…', en:'…'} 꼴이면 지금 언어를 골라 쓴다(LX).
// 언어를 늘릴 땐 crayonLangInit의 langs에 넣고 사전에 키만 추가하면 된다.
// 없는 언어는 앞 언어부터 차례로 대신 나온다.
//
// 쓰는 법:
//   const T = { start: { ko: '시작', en: 'Start' },
//               score: { ko: '점수 %1', en: 'Score %1' } };
//   crayonLangInit({ key: 'my-game-lang', langs: ['ko', 'en'], table: T });
//   tr('start')       // → '시작'
//   tr('score', 120)  // → '점수 120'   (%1 자리에 끼워 넣음)
// ============================================================
let LANG = 'en';
let _langs = ['ko', 'en'];
let _T = {};
let _langKey = null;

// 브라우저 설정에서 쓸 언어를 고른다.
// 모르는 언어면 목록의 마지막(보통 영어)으로 — 한국어로 시작하면 외국인은 아무것도 못 읽는다.
function detectLang(langs = _langs) {
  const list = navigator.languages || [navigator.language || 'en'];
  for (const l of list) {
    const s = String(l).toLowerCase();
    for (const cand of langs) {
      if (s.startsWith(cand)) return cand;
    }
  }
  return langs.includes('en') ? 'en' : langs[langs.length - 1];
}

// 게임 시작할 때 한 번 부른다. 저장해둔 언어가 있으면 그걸, 없으면 브라우저 설정을 따른다.
function crayonLangInit(opt = {}) {
  _langs = opt.langs || ['ko', 'en'];
  _T = opt.table || {};
  _langKey = opt.key || null;
  const saved = _langKey ? LS.get(_langKey) : null;
  LANG = (saved && _langs.includes(saved)) ? saved : detectLang(_langs);
  if (!_langs.includes(LANG)) LANG = _langs[0];
  document.documentElement.lang = LANG;
  return LANG;
}

function crayonLang() { return LANG; }

// 언어를 바꾸고 기억해둔다
function setLang(l) {
  if (!_langs.includes(l)) return LANG;
  LANG = l;
  document.documentElement.lang = LANG;
  if (_langKey) LS.set(_langKey, LANG);
  return LANG;
}

// 언어 버튼 하나로 돌려쓰기 — 한국어 → English → 한국어 …
function nextLang() {
  return setLang(_langs[(_langs.indexOf(LANG) + 1) % _langs.length]);
}

// {ko:'…', en:'…'} 에서 지금 언어를 꺼낸다. 그냥 문자열이면 그대로 돌려준다.
function LX(v) {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (v[LANG]) return v[LANG];
  for (const l of _langs) if (v[l]) return v[l];   // 없으면 있는 언어로 대신
  return '';
}

// 사전에서 꺼내 %1 %2 … 자리에 값을 끼워 넣는다
function tr(key, ...args) {
  let s = LX(_T[key]);
  args.forEach((a, i) => { s = s.split('%' + (i + 1)).join(a); });
  return s;
}

// ============================================================
// 소리 — 파일 없이 웹오디오로 합성한다 (mp3 한 개도 안 쓴다)
// ------------------------------------------------------------
// 음원 파일이 없으니 zip이 가볍고, 저작권 걱정도 없고, 소리를 코드로 바로 고칠 수 있다.
//
// 쓰는 법:
//   crayonAudioInit({ key: 'my-game' });   // 음소거·음량을 기억하게
//   sfx.tap();                             // 미리 만들어둔 효과음
//   beep(880, 0.1);                        // 직접 음 하나
//   melody(['C4', 'E4', 'G4', 'C5']);      // 짧은 가락
// ============================================================
let SFX = true;         // 소리 켬/끔
let VOLUME = 1;         // 0 ~ 1
let _audioKey = null;
let audioCtx = null;

// ⚠️ 브라우저는 사용자가 화면을 한 번 건드리기 전엔 소리를 막는다.
//    그래서 첫 터치·클릭·키 입력 때 자동으로 풀어준다. 이걸 빼먹으면
//    "왜 소리가 안 나지?" 하면서 잼 시간을 통째로 날린다.
function crayonAudioInit(opt = {}) {
  _audioKey = opt.key || null;
  if (_audioKey) {
    SFX = LS.get(_audioKey + '-sfx') !== 'off';
    const v = parseFloat(LS.get(_audioKey + '-vol'));
    VOLUME = (v >= 0 && v <= 1) ? v : 1;
  }
  if (opt.silent) SFX = false;   // 자동 검증 모드용
  const unlock = () => {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch (e) {}
  };
  ['pointerdown', 'touchstart', 'keydown'].forEach(ev =>
    window.addEventListener(ev, unlock, { once: false, passive: true }));
  return SFX;
}

function setSfx(on) {
  SFX = !!on;
  if (_audioKey) LS.set(_audioKey + '-sfx', SFX ? 'on' : 'off');
  return SFX;
}
function sfxOn() { return SFX; }

function setVolume(v) {
  VOLUME = Math.max(0, Math.min(1, v));
  if (_audioKey) LS.set(_audioKey + '-vol', String(VOLUME));
  return VOLUME;
}
function volume() { return VOLUME; }

// 음 하나 내기. 이 파일의 소리는 전부 여기서 나온다.
//   freq   높이(Hz). 음이름을 쓰고 싶으면 note('C4')
//   dur    길이(초)
//   type   음색 'sine'(부드럽게) 'square'(삑삑) 'sawtooth'(거칠게) 'triangle'
//   vol    크기
//   delay  몇 초 뒤에 낼지 (여러 음을 이어 붙일 때)
//   slide  소리 나는 동안 높이를 얼마나 미끄러뜨릴지 (음수면 뚝 떨어짐)
function beep(freq, dur, type = 'sine', vol = 0.18, delay = 0, slide = 0) {
  if (!SFX) return;
  vol *= VOLUME;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = audioCtx.currentTime + delay;
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  } catch (e) {}
}

// 음이름 → 주파수. 'C4' 'A#3' 'Bb5' 모두 됨. A4가 440Hz.
// 숫자로 외울 필요 없이 악보처럼 쓰라고 만든 것.
const _SEMITONE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function note(name) {
  if (typeof name === 'number') return name;
  const m = /^([A-Ga-g])([#b]?)(-?\d+)$/.exec(String(name).trim());
  if (!m) return 440;
  let semi = _SEMITONE[m[1].toUpperCase()];
  if (m[2] === '#') semi += 1;
  else if (m[2] === 'b') semi -= 1;
  const midi = (parseInt(m[3], 10) + 1) * 12 + semi;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// 짧은 가락. 음이름을 늘어놓으면 순서대로 울린다. '-' 는 쉼표.
//   melody(['C4', 'E4', 'G4', '-', 'C5'], { gap: 0.12 })
function melody(names, opt = {}) {
  const { dur = 0.14, gap = 0.12, type = 'sine', vol = 0.16, delay = 0 } = opt;
  names.forEach((n, i) => {
    if (n == null || n === '-') return;   // 쉼표는 건너뛴다
    beep(note(n), dur, type, vol, delay + i * gap);
  });
}

// 미리 만들어둔 효과음 — 낚시·곤충채집에서 쓰던 것 그대로.
// 새 소리가 필요하면 여기에 한 줄 추가하면 된다.
const sfx = {
  appear:  () => { beep(660, 0.09, 'square', 0.1); beep(880, 0.12, 'square', 0.1, 0.09); },
  tap:     () => beep(760, 0.06, 'square', 0.14),
  good:    () => beep(880, 0.1, 'sine', 0.18),
  perfect: () => { beep(880, 0.08, 'sine', 0.18); beep(1320, 0.14, 'sine', 0.18, 0.07); },
  caught:  () => [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.13, 'sine', 0.16, i * 0.09)),
  escape:  () => beep(220, 0.35, 'sawtooth', 0.08, 0, -120),
  swing:   () => beep(520, 0.16, 'sine', 0.09, 0, -300),   // 휙~
  achv:    () => [784, 784, 1047].forEach((f, i) => beep(f, i === 2 ? 0.3 : 0.1, 'square', 0.1, i * 0.12)),
  buy:     () => { beep(988, 0.07, 'square', 0.1); beep(1319, 0.1, 'square', 0.1, 0.06); },
  nope:    () => beep(200, 0.14, 'square', 0.08, 0, -60),   // 살 돈이 모자랄 때
};

// ============================================================
// 화면 크기 — 낚시·곤충채집에서 비싸게 배운 것들이 전부 여기 들어있다
// ------------------------------------------------------------
// 1) 가상 해상도: 화면이 minH보다 낮으면(폰 가로 등) 화면을 통째로 축소해서
//    minH인 척한다. 좁은 화면에서 버튼이 밖으로 나가는 문제가 원천 차단된다.
// 2) 캔버스가 너무 크면 사파리가 조용히 백지로 렌더링한다 → 픽셀 수를 제한한다.
// 3) 축소했으면 터치 좌표도 같은 비율로 되돌려야 버튼이 맞는다 (crayonPointer가 해준다).
// ============================================================
let _fit = { w: 0, h: 0, scale: 1, dpr: 1, portrait: false };

function crayonFit(cv, opt = {}) {
  const { minH = 640, maxPixels = 6e6, portraitUnder = 600 } = opt;
  let dpr = Math.min(2, window.devicePixelRatio || 1);
  const rawW = Math.max(1, window.innerWidth);
  const rawH = Math.max(1, window.innerHeight);

  while (dpr > 1 && rawW * rawH * dpr * dpr > maxPixels) dpr -= 0.25;

  const portrait = rawW < rawH && rawW < portraitUnder;   // 폰 세로 — 돌려달라고 안내
  const scale = rawH < minH ? rawH / minH : 1;
  const w = Math.max(1, Math.round(rawW / scale));
  const h = Math.max(1, Math.round(rawH / scale));

  cv.width = Math.max(1, Math.round(rawW * dpr));
  cv.height = Math.max(1, Math.round(rawH * dpr));
  cv.style.width = rawW + 'px';
  cv.style.height = rawH + 'px';

  _fit = { w, h, scale, dpr, portrait };
  const ctx = cv.getContext('2d');
  crayonApplyTransform(ctx);
  crayonUse(ctx, w, h);
  return _fit;
}

// 지금 화면 정보 — { w, h, scale, dpr, portrait }
function crayonScreen() { return _fit; }

// 논리 좌표를 실제 픽셀로 바꾸는 변환. 오프스크린 캔버스에 그릴 때도 이걸 걸어준다.
function crayonApplyTransform(c) {
  const s = _fit.dpr * _fit.scale;
  c.setTransform(s, 0, 0, s, 0, 0);
}

// ============================================================
// 게임 루프
// ------------------------------------------------------------
// ⚠️ 다음 프레임을 **먼저** 예약한다. 예약이 맨 마지막 줄이면, 그리는 도중 예외가
//    한 번만 나도 다음 프레임이 예약되지 않아 게임이 조용히 얼어붙는다. (곤충채집에서 겪음)
// 예외가 나면 그 프레임만 건너뛰되, 처음 한 번은 콘솔에 찍는다.
// 조용히 삼키면 잼 당일에 버그를 영원히 못 찾는다.
// ============================================================
function crayonLoop(fn) {
  let last = 0, running = true;
  const seen = new Set();
  function frame(t) {
    if (running) requestAnimationFrame(frame);
    try {
      const dt = last ? Math.min(0.1, (t - last) / 1000) : 0;   // 탭 전환 후 dt 폭주 방지
      last = t;
      fn(t, dt);
    } catch (e) {
      if (!seen.has(e.message)) { seen.add(e.message); console.error('[crayon] 프레임 건너뜀:', e); }
    }
  }
  requestAnimationFrame(frame);
  return { stop() { running = false; }, resume() { if (!running) { running = true; last = 0; requestAnimationFrame(frame); } } };
}

// ============================================================
// 입력 — 마우스·터치·키보드
// ============================================================

// 화면을 축소해 그렸어도 논리 좌표로 바꿔서 넘겨준다. 캔버스 위치도 감안한다.
function crayonPointer(cv, handler) {
  cv.addEventListener('pointerdown', (e) => {
    const r = cv.getBoundingClientRect();
    const x = (e.clientX - r.left) / _fit.scale;
    const y = (e.clientY - r.top) / _fit.scale;
    handler(x, y, e);
  });
}

// 키를 눌렀을 때 부를 함수를 짝지어 준다.
//   crayonKeys({ Space: onTap, Escape: goMenu, ArrowLeft: () => move(-1) })
// e.code 를 쓰므로 한/영 상태와 상관없이 같은 자리 키가 잡힌다.
function crayonKeys(map) {
  window.addEventListener('keydown', (e) => {
    const fn = map[e.code] || map[e.key];
    if (!fn) return;
    e.preventDefault();
    fn(e);
  });
}

// 점(x,y)이 네모 안에 있나 — 버튼 판정용
function inRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

// ============================================================
// 타이밍 판정 — "딱 맞췄다!" 하는 손맛을 만드는 도구
// ------------------------------------------------------------
// ⚠️ 이건 리듬 게임 전용이 아니다. 정답에서 얼마나 벗어났나를 재는 것뿐이라,
//    재는 게 시간이든 거리든 각도든 똑같이 쓸 수 있다.
//      시간  judge(지금, 눌러야할때)                     ← 리듬·따라하기
//      거리  judge(원의반지름, 목표반지름, {perfect:6, good:18})  ← 낚시
//      위치  judge(공의x, 배트의x, {perfect:8, good:24})          ← 야구 스윙
//
// 리듬 게임이 리듬 게임인 이유는 판정이 아니라 **예고**다.
// 언제 눌러야 하는지 미리 알려주지 않으면, 판정이 아무리 정교해도 그냥 찍기가 된다.
// ============================================================

// 기본 판정 폭(ms) — 곤충채집에서 플레이 피드백으로 다듬은 값
//   2026-08-01 "조금만 더 어렵게" → 130/320 에서 약 12% 좁힘
let JUDGE = { perfect: 115, good: 285 };

function setJudge(opt = {}) {
  if (opt.perfect != null) JUDGE.perfect = opt.perfect;
  if (opt.good != null) JUDGE.good = opt.good;
  return { ...JUDGE };
}
function judgeWindows() { return { ...JUDGE }; }

// 얼마나 잘 맞췄나 재기.
//   value    실제로 누른 값 (시각이면 performance.now())
//   target   맞춰야 하는 값
//   opt.mul  판정을 넉넉하게 (1.2면 20% 넓어짐 — 좋은 장비·쉬움 모드에 쓴다)
// 돌려주는 것: { rank:'perfect'|'good'|'miss', hit, diff, early }
function judge(value, target, opt = {}) {
  const mul = opt.mul == null ? 1 : opt.mul;
  const p = (opt.perfect == null ? JUDGE.perfect : opt.perfect) * mul;
  const g = (opt.good == null ? JUDGE.good : opt.good) * mul;
  const diff = Math.abs(value - target);
  const rank = diff <= p ? 'perfect' : (diff <= g ? 'good' : 'miss');
  return { rank, hit: rank !== 'miss', diff, early: value < target };
}

// 판정에 맞는 효과음을 알아서 낸다
function judgeSound(rank) {
  if (rank === 'perfect') sfx.perfect();
  else if (rank === 'good') sfx.good();
  else sfx.nope();
}

// ⚠️ 함정 검사 — 곤충채집에서 배운 것.
// 목표가 촘촘히 이어질 때, GOOD 폭(±)이 간격의 절반을 넘으면
// 앞 목표와 뒤 목표의 판정 구간이 겹쳐서 "아무 데나 눌러도 맞는" 게임이 된다.
// 판정 폭을 바꿀 때마다 제일 짧은 간격을 넣어서 확인할 것.
function judgeSafe(minGap, opt = {}) {
  const mul = opt.mul == null ? 1 : opt.mul;
  const g = (opt.good == null ? JUDGE.good : opt.good) * mul;
  const ok = g * 2 <= minGap;
  if (!ok) {
    console.warn('[crayon] 판정 구간이 겹칩니다 — GOOD 폭 ±' + g.toFixed(0) +
                 ' × 2 = ' + (g * 2).toFixed(0) + ' 가 간격 ' + minGap + ' 보다 큽니다.' +
                 ' good 을 ' + (minGap / 2).toFixed(0) + ' 이하로 줄이세요.');
  }
  return { ok, good: g, minGap, maxGood: minGap / 2 };
}

// 박자표 만들기 — 리듬을 쓸 때. bpm과 박자 간격 목록으로 "몇 ms에 눌러야 하는지"를 만든다.
//   beatTimes(120, [1, 1, 0.5, 0.5])  → [0, 500, 1000, 1250, 1500]
// 돌려받은 목록에 시작 시각을 더해서 쓰면 된다.
function beatTimes(bpm, gaps) {
  const beat = 60000 / bpm;
  const out = [0];
  let t = 0;
  for (const g of gaps) { t += beat * g; out.push(t); }
  return out;
}

// ============================================================
// 분위기 — "그 안에 들어와 있다"는 느낌을 만드는 장치들
// ------------------------------------------------------------
// 깊이 잠수 연습작에서 물빛 하나 고쳤더니 갑자기 물속이 됐다. 그런 것들을 모아둔다.
// 넷 다 게임 규칙과 상관없이 얹기만 하면 되므로, 주제가 뭐가 나오든 쓸 수 있다.
//   흔들림 shake · 어두워지기 fade · 떠다니는 것 makeDrift · 가장자리 그늘 vignette
//   (색 변화는 위쪽 rampColor)
// ============================================================

// ---------- 화면 흔들림 ----------
// 딱 맞췄을 때 "쿵" 하는 손맛. 남발하면 눈이 아프니 짧고 약하게.
let _shake = { power: 0, until: 0, seed: 1 };

function shake(power = 8, ms = 220) {
  _shake = { power, until: performance.now() + ms, seed: (_shake.seed * 7 + 13) % 9973, ms };
  return _shake;
}

// 지금 얼마나 밀렸나. 시간이 지나면 저절로 0으로 잦아든다.
function shakeOffset(t) {
  const now = t == null ? performance.now() : t;
  if (now >= _shake.until || _shake.power <= 0) return { x: 0, y: 0 };
  const left = (_shake.until - now) / _shake.ms;    // 1 → 0
  const p = _shake.power * left * left;             // 끝으로 갈수록 빠르게 잦아듦
  const rand = mulberry32((Math.floor(now / 16) + _shake.seed) >>> 0);
  return { x: (rand() - 0.5) * 2 * p, y: (rand() - 0.5) * 2 * p };
}

// 흔들린 상태로 그린다. save/restore를 안에서 해주니 되돌리는 걸 잊을 수 없다.
//   withShake(t, () => { 배경그리기(); 캐릭터그리기(); })
// ⚠️ 화면 전체를 흔들면 HUD(점수·버튼)까지 흔들린다. 버튼은 이 바깥에서 그릴 것 —
//    흔들리는 버튼은 누르기 어렵고, 터치 좌표는 안 흔들려서 어긋난다.
function withShake(t, fn) {
  const ctx = _need();
  const o = shakeOffset(t);
  ctx.save();
  ctx.translate(o.x, o.y);
  try { fn(); } finally { ctx.restore(); }
}

// ---------- 어두워지기 / 밝아지기 ----------
// 장면이 바뀔 때 뚝 끊기면 싸구려로 보인다. 0.3초만 덮어도 확 달라진다.
let _fade = { from: 0, to: 0, start: 0, ms: 1, color: '#000' };

function fadeOut(ms = 400, color = '#000') { _fade = { from: fadeAlpha(), to: 1, start: performance.now(), ms, color }; }
function fadeIn(ms = 400, color = '#000') { _fade = { from: fadeAlpha(), to: 0, start: performance.now(), ms, color }; }

function fadeAlpha(t) {
  const now = t == null ? performance.now() : t;
  const k = Math.max(0, Math.min(1, (now - _fade.start) / _fade.ms));
  return _fade.from + (_fade.to - _fade.from) * k;
}

// ⚠️ 소수점 값을 === 로 비교하면 0.9999999 같은 값 때문에 영원히 끝나지 않을 수 있다.
//    "덮개가 얼마나 진한가"가 아니라 "시간이 다 됐나"로 판단한다.
function fadeDone(t) {
  const now = t == null ? performance.now() : t;
  return now - _fade.start >= _fade.ms;
}

// 그리기 **맨 마지막**에 부른다. 안 그러면 덮개 위에 그림이 얹혀서 소용없다.
function drawFade(t) {
  const a = fadeAlpha(t);
  if (a <= 0) return a;
  const ctx = _need();
  ctx.save();
  ctx.globalAlpha = Math.min(1, a);
  ctx.fillStyle = _fade.color;
  ctx.fillRect(-_W, -_H, _W * 3, _H * 3);   // 흔들려도 가장자리가 안 비게 넉넉히
  ctx.restore();
  return a;
}

// ---------- 떠다니는 것 (물방울·먼지·눈·나뭇잎) ----------
// 배경에 뭔가 계속 움직이면 화면이 "살아있는 곳"이 된다. 정지 화면과 차이가 크다.
//
// ⚠️ 입자는 값싸게 그린다. 매 프레임 crayonPath로 크레파스 선을 다시 긋으면
//    입자 20개만으로도 프레임이 무너진다. 대신 살짝 흔들리는 원/점으로 흉내낸다.
//
//   const bubbles = makeDrift({ count: 22, color: '#cfe9ff', dir: -1 });
//   ... update(dt) 에서 bubbles.update(dt)
//   ... draw() 에서   bubbles.draw(t)
function makeDrift(opt = {}) {
  const {
    count = 20, color = '#ffffff', dir = -1,     // dir: -1 위로, 1 아래로
    size = [2.5, 7], speed = [14, 46], sway = 14,
    alpha = 0.5, shape = 'bubble', seed = 1,
  } = opt;
  const rand = mulberry32(seed >>> 0);
  const items = [];
  const area = () => opt.area || { x: 0, y: 0, w: _W, h: _H };

  function spawn(it, firstTime) {
    const a = area();
    it.x = a.x + rand() * a.w;
    it.y = firstTime ? a.y + rand() * a.h : (dir < 0 ? a.y + a.h + 10 : a.y - 10);
    it.r = size[0] + rand() * (size[1] - size[0]);
    it.v = speed[0] + rand() * (speed[1] - speed[0]);
    it.ph = rand() * 6.28;
    it.sw = sway * (0.4 + rand() * 0.6);
  }
  for (let i = 0; i < count; i++) { const it = {}; spawn(it, true); items.push(it); }

  return {
    items,
    update(dt) {
      const a = area();
      for (const it of items) {
        it.y += dir * it.v * dt;
        it.ph += dt * 1.6;
        if (dir < 0 && it.y < a.y - 12) spawn(it);
        else if (dir > 0 && it.y > a.y + a.h + 12) spawn(it);
      }
    },
    draw(t) {
      const ctx = _need();
      const a = area();
      ctx.save();
      ctx.beginPath();
      ctx.rect(a.x, a.y, a.w, a.h);   // 영역 밖으로 안 삐져나가게
      ctx.clip();
      ctx.globalAlpha = alpha;
      for (const it of items) {
        const x = it.x + Math.sin(it.ph) * it.sw;
        if (shape === 'bubble') {
          ctx.strokeStyle = color;
          ctx.lineWidth = Math.max(1, it.r * 0.35);
          ctx.beginPath();
          ctx.arc(x, it.y, it.r, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x, it.y, it.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    },
    reset() { for (const it of items) spawn(it, true); },
  };
}

// ---------- 가장자리 그늘 ----------
// 화면 네 귀퉁이를 살짝 어둡게 해서 가운데로 시선을 모은다.
// 깊은 물속·동굴·밤 장면에서 특히 잘 듣는다. 0.25~0.4 정도가 적당.
function vignette(strength = 0.3, color = '0,0,0') {
  if (strength <= 0) return;
  const ctx = _need();
  const cx = _W / 2, cy = _H / 2;
  const r = Math.hypot(cx, cy);
  const g = ctx.createRadialGradient(cx, cy, r * 0.45, cx, cy, r);
  g.addColorStop(0, `rgba(${color},0)`);
  g.addColorStop(1, `rgba(${color},${strength})`);
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, _W, _H);
  ctx.restore();
}
