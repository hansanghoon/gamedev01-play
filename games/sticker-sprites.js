// 스티커 플래닛의 스티커 데이터 + 도트 그리기 (게임과 갤러리가 같이 씀)
// 꿈속 탐험가의 dream-sprites.js와 같은 방식: 스티커를 고치면 앱과 갤러리에 동시 반영.
// pixel-art.js를 먼저 로드해야 함 (pixelPatternCircle, pixelCircle, shadeColor, hashCell, PX 사용).

// ================== 스티커 데이터 ==================
// 세트: 7일 연속 기록마다 새 세트가 열림 (need = 필요한 최고 연속 기록)
const SETS = [
  { id: 'planet',  name: '🪐 행성 세트', need: 0 },
  { id: 'sport',   name: '⚽ 스포츠 공 세트', need: 7 },
  { id: 'dino',    name: '🦖 공룡 세트', need: 14 },
  { id: 'fruit',   name: '🍎 과일 세트', need: 21 },
  { id: 'eggs',    name: '🥚 알 세트', need: 28 },
  { id: 'gem',     name: '💎 보석 세트', need: 35 },
  { id: 'animal',  name: '🐾 동물 세트', need: 42 },
  { id: 'sweet',   name: '🍩 간식 세트', need: 49 },
  { id: 'monster', name: '👾 몬스터 세트', need: 56 },
  // 새 세트는 여기에 추가! (need: 63, 70, ...)
];

// rarity: common(일반) 70% / rare(레어) 25% / legend(전설) 5%
const STICKERS = [
  // ---- 행성 세트 ----
  { id: 'planet-0',  set: 'planet', name: '불꽃별',   rarity: 'common', kind: 'spots',   c: '#e05a4e', face: 'excited' },
  { id: 'planet-1',  set: 'planet', name: '바다별',   rarity: 'common', kind: 'spots',   c: '#3f7fd9', face: 'smile' },
  { id: 'planet-2',  set: 'planet', name: '새싹별',   rarity: 'common', kind: 'spots',   c: '#5ab55e', face: 'smile' },
  { id: 'planet-3',  set: 'planet', name: '귤별',     rarity: 'common', kind: 'stripe',  c: '#f2953c', face: 'wink' },
  { id: 'planet-4',  set: 'planet', name: '포도별',   rarity: 'common', kind: 'spots',   c: '#8a5fc9', face: 'sleepy' },
  { id: 'planet-5',  set: 'planet', name: '솜사탕별', rarity: 'common', kind: 'stripe',  c: '#ef92b5', face: 'smile' },
  { id: 'planet-6',  set: 'planet', name: '얼음별',   rarity: 'common', kind: 'spots',   c: '#7fd4e8', face: 'surprised' },
  { id: 'planet-7',  set: 'planet', name: '치즈별',   rarity: 'common', kind: 'spots',   c: '#f2d049', face: 'excited' },
  { id: 'planet-8',  set: 'planet', name: '고리별',   rarity: 'rare',   kind: 'ring',    c: '#d9a23b', face: 'cool' },
  { id: 'planet-9',  set: 'planet', name: '무지개별', rarity: 'rare',   kind: 'rainbow', c: '#e05a4e', face: 'excited' },
  { id: 'planet-10', set: 'planet', name: '달님',     rarity: 'rare',   kind: 'moon',    c: '#cfd4dc', face: 'sleepy' },
  { id: 'planet-11', set: 'planet', name: '태양',     rarity: 'legend', kind: 'sun',     c: '#f7b32b', face: 'smile' },
  // ---- 스포츠 공 세트 ----
  { id: 'sport-0',  set: 'sport', name: '축구공',     rarity: 'common', kind: 'soccer',   c: '#f2f0ea', face: 'smile' },
  { id: 'sport-1',  set: 'sport', name: '농구공',     rarity: 'common', kind: 'basket',   c: '#e8843c', face: 'excited' },
  { id: 'sport-2',  set: 'sport', name: '야구공',     rarity: 'common', kind: 'baseball', c: '#f2f0ea', face: 'wink' },
  { id: 'sport-3',  set: 'sport', name: '테니스공',   rarity: 'common', kind: 'tennis',   c: '#cbe63c', face: 'smile' },
  { id: 'sport-4',  set: 'sport', name: '배구공',     rarity: 'common', kind: 'volley',   c: '#f2f0ea', face: 'surprised' },
  { id: 'sport-5',  set: 'sport', name: '탁구공',     rarity: 'common', kind: 'plain',    c: '#f7e7d3', face: 'sleepy' },
  { id: 'sport-6',  set: 'sport', name: '골프공',     rarity: 'common', kind: 'golf',     c: '#eef0f2', face: 'smile' },
  { id: 'sport-7',  set: 'sport', name: '피구공',     rarity: 'common', kind: 'stripe',   c: '#d94f4f', face: 'excited' },
  { id: 'sport-8',  set: 'sport', name: '볼링공',     rarity: 'rare',   kind: 'bowling',  c: '#5a4a8a', face: 'cool' },
  { id: 'sport-9',  set: 'sport', name: '8번공',      rarity: 'rare',   kind: 'eight',    c: '#26262e', face: 'wink', faceColor: '#f2f0ea' },
  { id: 'sport-10', set: 'sport', name: '비치볼',     rarity: 'rare',   kind: 'beach',    c: '#f2f0ea', face: 'excited' },
  { id: 'sport-11', set: 'sport', name: '황금 축구공', rarity: 'legend', kind: 'goldsoccer', c: '#f2c94c', face: 'cool' },
  // ---- 공룡 세트 ----
  { id: 'dino-0',  set: 'dino', name: '티라노',   rarity: 'common', kind: 'spots',   c: '#4e9e52', face: 'grr' },
  { id: 'dino-1',  set: 'dino', name: '트리케라', rarity: 'common', kind: 'tricera', c: '#d9895f', face: 'smile' },
  { id: 'dino-2',  set: 'dino', name: '스테고',   rarity: 'common', kind: 'stego',   c: '#e0a03c', face: 'sleepy' },
  { id: 'dino-3',  set: 'dino', name: '브라키오', rarity: 'common', kind: 'spots',   c: '#6fa8d9', face: 'smile' },
  { id: 'dino-4',  set: 'dino', name: '랩터',     rarity: 'common', kind: 'raptor',  c: '#c9773c', face: 'excited' },
  { id: 'dino-5',  set: 'dino', name: '안킬로',   rarity: 'common', kind: 'anky',    c: '#96825a', face: 'surprised' },
  { id: 'dino-6',  set: 'dino', name: '프테라',   rarity: 'common', kind: 'ptera',   c: '#b57fd4', face: 'wink' },
  { id: 'dino-7',  set: 'dino', name: '파키',     rarity: 'common', kind: 'pachy',   c: '#c95f6e', face: 'smile' },
  { id: 'dino-8',  set: 'dino', name: '스피노',   rarity: 'rare',   kind: 'spino',   c: '#5a8ab5', face: 'excited' },
  { id: 'dino-9',  set: 'dino', name: '모사',     rarity: 'rare',   kind: 'mosa',    c: '#3f6fa8', face: 'wink' },
  { id: 'dino-10', set: 'dino', name: '공룡알',   rarity: 'rare',   kind: 'egg',     c: '#f2e8d0', face: 'surprised' },
  { id: 'dino-11', set: 'dino', name: '드래곤',   rarity: 'legend', kind: 'dragon',  c: '#d94f4f', face: 'grr' },
  // ---- 과일 세트 ----
  { id: 'fruit-0',  set: 'fruit', name: '사과',     rarity: 'common', kind: 'plain',   c: '#c94050', face: 'smile',     decoFront: ['stem', 'shine'] },
  { id: 'fruit-1',  set: 'fruit', name: '오렌지',   rarity: 'common', kind: 'golf',    c: '#f2953c', face: 'excited',   decoFront: ['stem'] },
  { id: 'fruit-2',  set: 'fruit', name: '수박',     rarity: 'common', kind: 'melon',   c: '#4e9e52', face: 'wink',      decoFront: ['stem'] },
  { id: 'fruit-3',  set: 'fruit', name: '포도',     rarity: 'common', kind: 'anky',    c: '#7a54b5', face: 'sleepy',    decoFront: ['stem', 'shine'] },
  { id: 'fruit-4',  set: 'fruit', name: '레몬',     rarity: 'common', kind: 'plain',   c: '#f2d049', face: 'surprised', decoFront: ['stem'] },
  { id: 'fruit-5',  set: 'fruit', name: '복숭아',   rarity: 'common', kind: 'pachy',   c: '#ef92b5', face: 'smile',     decoFront: ['stem'] },
  { id: 'fruit-6',  set: 'fruit', name: '블루베리', rarity: 'common', kind: 'spots',   c: '#3f5fd9', face: 'excited',   decoFront: ['calyx'] },
  { id: 'fruit-7',  set: 'fruit', name: '토마토',   rarity: 'common', kind: 'plain',   c: '#d9483e', face: 'cool',      decoFront: ['calyx', 'shine'] },
  { id: 'fruit-8',  set: 'fruit', name: '파인애플', rarity: 'rare',   kind: 'pine',    c: '#e8b53c', face: 'excited',   decoBack: ['crown'] },
  { id: 'fruit-9',  set: 'fruit', name: '체리',     rarity: 'rare',   kind: 'plain',   c: '#c9364a', face: 'wink',      decoBack: ['cherryTwin'], decoFront: ['shine'] },
  { id: 'fruit-10', set: 'fruit', name: '키위',     rarity: 'rare',   kind: 'kiwicut', c: '#9ec93c', face: 'smile' },
  { id: 'fruit-11', set: 'fruit', name: '황금사과', rarity: 'legend', kind: 'plain',   c: '#f2c94c', face: 'cool',      decoFront: ['stem', 'sparkle'] },
  // ---- 알 세트 ----
  { id: 'eggs-0',  set: 'eggs', name: '달걀',       rarity: 'common', kind: 'plain',   c: '#f2ecda', face: 'smile' },
  { id: 'eggs-1',  set: 'eggs', name: '메추리알',   rarity: 'common', kind: 'spots',   c: '#d9c9a8', face: 'wink' },
  { id: 'eggs-2',  set: 'eggs', name: '파랑새알',   rarity: 'common', kind: 'plain',   c: '#7fd4e8', face: 'sleepy' },
  { id: 'eggs-3',  set: 'eggs', name: '민트알',     rarity: 'common', kind: 'plain',   c: '#9ee8c9', face: 'excited' },
  { id: 'eggs-4',  set: 'eggs', name: '딸기알',     rarity: 'common', kind: 'spots',   c: '#efb0c5', face: 'smile' },
  { id: 'eggs-5',  set: 'eggs', name: '줄무늬알',   rarity: 'common', kind: 'stripe',  c: '#e8d9a0', face: 'surprised' },
  { id: 'eggs-6',  set: 'eggs', name: '보라알',     rarity: 'common', kind: 'spots',   c: '#b5a8e0', face: 'sleepy' },
  { id: 'eggs-7',  set: 'eggs', name: '타조알',     rarity: 'common', kind: 'golf',    c: '#e8e0cc', face: 'smile' },
  { id: 'eggs-8',  set: 'eggs', name: '부화알',     rarity: 'rare',   kind: 'plain',   c: '#f2e8d0', face: 'surprised', decoFront: ['crack'] },
  { id: 'eggs-9',  set: 'eggs', name: '은하알',     rarity: 'rare',   kind: 'galaxy',  c: '#2e3158', face: 'excited', faceColor: '#dfe4f5' },
  { id: 'eggs-10', set: 'eggs', name: '용의 알',    rarity: 'rare',   kind: 'pine',    c: '#5ab5a0', face: 'cool' },
  { id: 'eggs-11', set: 'eggs', name: '황금알',     rarity: 'legend', kind: 'plain',   c: '#f2c94c', face: 'smile',     decoFront: ['sparkle'] },
  // ---- 보석 세트 ----
  { id: 'gem-0',  set: 'gem', name: '루비',         rarity: 'common', kind: 'gem',    c: '#d9365e', face: 'excited',   decoFront: ['shine'] },
  { id: 'gem-1',  set: 'gem', name: '사파이어',     rarity: 'common', kind: 'gem',    c: '#3f5fd9', face: 'cool',      decoFront: ['shine'] },
  { id: 'gem-2',  set: 'gem', name: '에메랄드',     rarity: 'common', kind: 'gem',    c: '#2ea86a', face: 'smile',     decoFront: ['shine'] },
  { id: 'gem-3',  set: 'gem', name: '자수정',       rarity: 'common', kind: 'gem',    c: '#8a5fc9', face: 'sleepy',    decoFront: ['shine'] },
  { id: 'gem-4',  set: 'gem', name: '토파즈',       rarity: 'common', kind: 'gem',    c: '#f2a53c', face: 'wink',      decoFront: ['shine'] },
  { id: 'gem-5',  set: 'gem', name: '아쿠아마린',   rarity: 'common', kind: 'gem',    c: '#6fd4e0', face: 'smile',     decoFront: ['shine'] },
  { id: 'gem-6',  set: 'gem', name: '로즈쿼츠',     rarity: 'common', kind: 'gem',    c: '#efa8c0', face: 'excited',   decoFront: ['shine'] },
  { id: 'gem-7',  set: 'gem', name: '흑요석',       rarity: 'common', kind: 'gem',    c: '#4a4a5c', face: 'cool', faceColor: '#f2f0ea', decoFront: ['shine'] },
  { id: 'gem-8',  set: 'gem', name: '진주',         rarity: 'rare',   kind: 'pearl',  c: '#f2ecec', face: 'smile',     decoFront: ['shine'] },
  { id: 'gem-9',  set: 'gem', name: '오팔',         rarity: 'rare',   kind: 'opal',   c: '#e8e4f2', face: 'surprised' },
  { id: 'gem-10', set: 'gem', name: '청금석',       rarity: 'rare',   kind: 'lapis',  c: '#2a4a8a', face: 'excited', faceColor: '#dfe8f5' },
  { id: 'gem-11', set: 'gem', name: '다이아몬드',   rarity: 'legend', kind: 'gem',    c: '#dfe8f2', face: 'cool',      decoFront: ['sparkle'] },
  // ---- 동물 세트 ----
  { id: 'animal-0',  set: 'animal', name: '강아지', rarity: 'common', kind: 'plain', c: '#c9a26b', face: 'smile',     decoBack: ['earsDog'] },
  { id: 'animal-1',  set: 'animal', name: '고양이', rarity: 'common', kind: 'plain', c: '#e8a33d', face: 'wink',      decoBack: ['earsCat'] },
  { id: 'animal-2',  set: 'animal', name: '토끼',   rarity: 'common', kind: 'plain', c: '#f2e8e0', face: 'surprised', decoBack: ['earsBunny'] },
  { id: 'animal-3',  set: 'animal', name: '곰',     rarity: 'common', kind: 'plain', c: '#a8743c', face: 'smile',     decoBack: ['earsRound'] },
  { id: 'animal-4',  set: 'animal', name: '판다',   rarity: 'common', kind: 'plain', c: '#f2f0ea', face: 'cool',      decoBack: ['earsBlack'] },
  { id: 'animal-5',  set: 'animal', name: '여우',   rarity: 'common', kind: 'belly', c: '#e07a3c', face: 'excited',   decoBack: ['earsCat'] },
  { id: 'animal-6',  set: 'animal', name: '개구리', rarity: 'common', kind: 'plain', c: '#5ab55e', face: 'surprised', decoBack: ['frogEyes'] },
  { id: 'animal-7',  set: 'animal', name: '돼지',   rarity: 'common', kind: 'plain', c: '#efa8c0', face: 'sleepy',    decoBack: ['earsCat'], decoFront: ['snout'] },
  { id: 'animal-8',  set: 'animal', name: '부엉이', rarity: 'rare',   kind: 'spots', c: '#a8825a', face: 'surprised', decoBack: ['tufts'] },
  { id: 'animal-9',  set: 'animal', name: '사자',   rarity: 'rare',   kind: 'plain', c: '#e8b53c', face: 'grr',       decoBack: ['mane'] },
  { id: 'animal-10', set: 'animal', name: '늑대',   rarity: 'rare',   kind: 'belly', c: '#8a93a0', face: 'cool',      decoBack: ['earsCat'] },
  { id: 'animal-11', set: 'animal', name: '유니콘', rarity: 'legend', kind: 'plain', c: '#f5f0f5', face: 'wink',      decoBack: ['horn'], decoFront: ['sparkle'] },
  // ---- 간식 세트 ----
  { id: 'sweet-0',  set: 'sweet', name: '쿠키',        rarity: 'common', kind: 'spots',   c: '#c9954f', face: 'smile' },
  { id: 'sweet-1',  set: 'sweet', name: '도넛',        rarity: 'common', kind: 'donut',   c: '#e8c99a', face: 'excited',   decoFront: ['sprinkle'] },
  { id: 'sweet-2',  set: 'sweet', name: '마카롱',      rarity: 'common', kind: 'macaron', c: '#efa8c0', face: 'smile' },
  { id: 'sweet-3',  set: 'sweet', name: '사탕',        rarity: 'common', kind: 'swirl',   c: '#e05a6e', face: 'excited',   decoFront: ['shine'] },
  { id: 'sweet-4',  set: 'sweet', name: '호빵',        rarity: 'common', kind: 'plain',   c: '#f2ecda', face: 'sleepy' },
  { id: 'sweet-5',  set: 'sweet', name: '푸딩',        rarity: 'common', kind: 'pudding', c: '#f2d049', face: 'smile' },
  { id: 'sweet-6',  set: 'sweet', name: '솜사탕',      rarity: 'common', kind: 'anky',    c: '#efb0d5', face: 'smile' },
  { id: 'sweet-7',  set: 'sweet', name: '민트초코',    rarity: 'common', kind: 'spots',   c: '#b5e8d0', face: 'wink' },
  { id: 'sweet-8',  set: 'sweet', name: '생일 케이크', rarity: 'rare',   kind: 'stripe',  c: '#f5e0e8', face: 'excited',   decoFront: ['candle'] },
  { id: 'sweet-9',  set: 'sweet', name: '무지개 사탕', rarity: 'rare',   kind: 'rainbowswirl', c: '#e05a4e', face: 'surprised' },
  { id: 'sweet-10', set: 'sweet', name: '젤리',        rarity: 'rare',   kind: 'plain',   c: '#6fd4ac', face: 'sleepy',    decoFront: ['shine'] },
  { id: 'sweet-11', set: 'sweet', name: '별사탕',      rarity: 'legend', kind: 'plain',   c: '#f5e0b5', face: 'smile',     decoBack: ['spikes'], decoFront: ['sparkle'] },
  // ---- 몬스터 세트 ----
  { id: 'monster-0',  set: 'monster', name: '슬라임',   rarity: 'common', kind: 'plain',   c: '#5ac96a', face: 'excited',   decoFront: ['drips', 'shine'] },
  { id: 'monster-1',  set: 'monster', name: '유령',     rarity: 'common', kind: 'plain',   c: '#f2f0f5', face: 'surprised' },
  { id: 'monster-2',  set: 'monster', name: '외눈이',   rarity: 'common', kind: 'plain',   c: '#8a5fc9', face: 'cyclops' },
  { id: 'monster-3',  set: 'monster', name: '박쥐',     rarity: 'common', kind: 'plain',   c: '#5a4a8a', face: 'wink',      decoBack: ['wings'] },
  { id: 'monster-4',  set: 'monster', name: '좀비',     rarity: 'common', kind: 'plain',   c: '#8aa86a', face: 'grr' },
  { id: 'monster-5',  set: 'monster', name: '호박 잭',  rarity: 'common', kind: 'ridge',   c: '#e8843c', face: 'grr',       decoFront: ['stem'] },
  { id: 'monster-6',  set: 'monster', name: '문어몬',   rarity: 'common', kind: 'anky',    c: '#d96a9e', face: 'surprised' },
  { id: 'monster-7',  set: 'monster', name: '로봇',     rarity: 'common', kind: 'plain',   c: '#9aa3b0', face: 'cool',      decoBack: ['antenna'] },
  { id: 'monster-8',  set: 'monster', name: '뱀파이어', rarity: 'rare',   kind: 'plain',   c: '#d9d0e8', face: 'grr' },
  { id: 'monster-9',  set: 'monster', name: '미라',     rarity: 'rare',   kind: 'bandage', c: '#e8e0cc', face: 'sleepy' },
  { id: 'monster-10', set: 'monster', name: '외계인',   rarity: 'rare',   kind: 'plain',   c: '#7fd4a0', face: 'cyclops',   decoBack: ['antenna'] },
  { id: 'monster-11', set: 'monster', name: '마왕',     rarity: 'legend', kind: 'plain',   c: '#8a3a4a', face: 'grr',       decoBack: ['horns2'], decoFront: ['sparkle'] },
];
const RARITY_LABEL = { common: '● 일반', rare: '◆ 레어', legend: '★ 전설' };
const RARITY_WEIGHT = { common: 70, rare: 25, legend: 5 };
function stickerById(id) { return STICKERS.find(function (s) { return s.id === id; }); }

// ================== 스티커 도트 그리기 ==================
// pixel-art.js의 pixelPatternCircle로 몸통(외곽선+명암+질감 자동)을 그리고,
// 그 위에 점 눈코입으로 기분을 표현한다 (아이디어: 점으로 눈코입!)
const S_SIZE = 84, S_C = 42, S_R = 26;

function stickerColorFn(st) {
  const c = st.c;
  switch (st.kind) {
    case 'stripe':
      return function (px, py) { return Math.floor((py + 60) / 10) % 2 ? shadeColor(c, -12) : c; };
    case 'spots':
      return function (px, py) {
        return hashCell(Math.floor(px / 8) + 60, Math.floor(py / 8) + 60) < 300 ? shadeColor(c, -14) : c;
      };
    case 'moon':
      return function (px, py) {
        return hashCell(Math.floor(px / 10) + 21, Math.floor(py / 10) + 7) < 320 ? shadeColor(c, -22) : c;
      };
    case 'rainbow':
      return function (px, py) {
        const bands = ['#e05a4e', '#f2953c', '#f2d049', '#5ab55e', '#3f7fd9', '#8a5fc9'];
        const i = Math.max(0, Math.min(5, Math.floor((py + S_R) / (S_R * 2 / 6))));
        return bands[i];
      };
    case 'sun':
      return function (px, py, dist) { return dist < S_R * 0.55 ? shadeColor(c, 16) : c; };
    case 'soccer':
    case 'goldsoccer': {
      const spotColor = st.kind === 'soccer' ? '#26262e' : '#7a5a12';
      const spots = [[0, -17], [-18, 7], [18, 7], [0, 21]];
      return function (px, py) {
        for (let i = 0; i < spots.length; i++) {
          if (Math.hypot(px - spots[i][0], py - spots[i][1]) < 6) return spotColor;
        }
        return c;
      };
    }
    case 'basket':
      return function (px, py) {
        if (Math.abs(px) < PX || Math.abs(py) < PX) return '#5a2e14';
        return c;
      };
    case 'baseball':
      return function (px, py) {
        if (Math.abs(Math.hypot(px + 34, py) - 26) < PX * 1.2) return '#c94f4f';
        if (Math.abs(Math.hypot(px - 34, py) - 26) < PX * 1.2) return '#c94f4f';
        return c;
      };
    case 'tennis':
      return function (px, py) {
        if (Math.abs(Math.hypot(px + 34, py) - 26) < PX * 1.2) return '#f5f5f0';
        if (Math.abs(Math.hypot(px - 34, py) - 26) < PX * 1.2) return '#f5f5f0';
        return c;
      };
    case 'volley':
      return function (px, py) {
        return Math.floor((px * 0.4 + py + 60) / 12) % 3 === 0 ? '#3f5fd9' : c;
      };
    case 'golf':
      return function (px, py) {
        return hashCell(Math.floor(px / 4) + 9, Math.floor(py / 4) + 33) < 350 ? shadeColor(c, -8) : c;
      };
    case 'bowling': {
      const holes = [[-6, -14], [0, -18], [6, -14]];
      return function (px, py) {
        for (let i = 0; i < holes.length; i++) {
          if (Math.hypot(px - holes[i][0], py - holes[i][1]) < 3) return '#241d38';
        }
        return c;
      };
    }
    case 'eight':
      return function (px, py) {
        if (Math.hypot(px, py + 15) < 8) {
          // 흰 동그라미 안의 "8" (작은 원 두 개)
          if (Math.hypot(px, py + 18) < 2.5 || Math.hypot(px, py + 12) < 2.5) return '#26262e';
          return '#f2f0ea';
        }
        return c;
      };
    case 'beach':
      return function (px, py) {
        const a = Math.atan2(py, px);
        const i = Math.floor(((a + Math.PI) / (Math.PI * 2)) * 6) % 6;
        return ['#e05a4e', '#f2f0ea', '#f2d049', '#f2f0ea', '#3f7fd9', '#f2f0ea'][i];
      };
    case 'raptor': // 대각선 줄무늬
      return function (px, py) {
        return Math.floor((px - py + 80) / 10) % 3 === 0 ? shadeColor(c, -18) : c;
      };
    case 'anky': // 갑옷 돌기 (밝은 혹들)
      return function (px, py) {
        return hashCell(Math.floor(px / 8) + 3, Math.floor(py / 8) + 17) < 280 ? shadeColor(c, 16) : c;
      };
    case 'pachy': // 정수리 돔 (위쪽이 단단하고 밝음)
      return function (px, py) { return py < -10 ? shadeColor(c, 22) : c; };
    case 'ptera': // 배 쪽이 밝음
      return function (px, py) { return py > 8 ? shadeColor(c, 18) : c; };
    case 'mosa': // 바다 파충류: 배가 하얗게
      return function (px, py) { return py > 6 ? '#cfe0ea' : c; };
    case 'egg': // 알 무늬 점박이
      return function (px, py) {
        return hashCell(Math.floor(px / 6) + 8, Math.floor(py / 6) + 29) < 200 ? '#d9b88a' : c;
      };
    case 'dragon': // 황금 배
      return function (px, py) { return py > 8 ? '#f2c94c' : c; };
    case 'melon': // 수박 세로 줄무늬 (살짝 구불구불)
      return function (px, py) {
        return Math.floor((px + Math.sin(py * 0.18) * 5 + 66) / 10) % 2 ? shadeColor(c, -24) : c;
      };
    case 'ridge': // 호박 골 (곧은 세로 줄)
      return function (px, py) { return Math.floor((px + 66) / 11) % 2 ? shadeColor(c, -14) : c; };
    case 'pine': // 파인애플 격자 (비늘 무늬)
      return function (px, py) {
        return (Math.floor((px + py + 120) / 10) + Math.floor((px - py + 120) / 10)) % 2 ? shadeColor(c, -14) : c;
      };
    case 'kiwicut': // 잘린 키위: 흰 중심 + 씨앗 링
      return function (px, py, dist) {
        if (dist < 7) return '#f2ecd0';
        if (dist < 15) {
          const a = Math.atan2(py, px);
          if (dist > 10 && Math.round(a / (Math.PI / 6)) % 2 === 0) return '#2a2a1a';
          return shadeColor(c, 12);
        }
        return c;
      };
    case 'gem': // 보석 커팅면 (가운데 밝은 면 + 부채꼴 면들)
      return function (px, py, dist) {
        if (dist < S_R * 0.45) return shadeColor(c, 20);
        const a = Math.atan2(py, px);
        return Math.floor(((a + Math.PI) / (Math.PI * 2)) * 8) % 2 ? shadeColor(c, -10) : shadeColor(c, 8);
      };
    case 'pearl': // 진주 (분홍·하늘빛이 은은하게 도는)
      return function (px, py) {
        const h = hashCell(Math.floor(px / 6) + 3, Math.floor(py / 6) + 11);
        if (h < 160) return '#f5d9e5';
        if (h < 320) return '#d9e5f5';
        return c;
      };
    case 'opal': // 오팔 (파스텔 무지개 얼룩)
      return function (px, py) {
        const h = hashCell(Math.floor(px / 6) + 7, Math.floor(py / 6) + 19);
        const pastels = ['#f5c9d9', '#c9e5f5', '#c9f5d9', '#f5eec9'];
        return h < 400 ? pastels[h % 4] : c;
      };
    case 'belly': // 배 쪽이 하얀 동물 (여우·늑대)
      return function (px, py) { return py > 6 ? '#f5f0e6' : c; };
    case 'donut': // 위쪽 절반은 딸기 아이싱
      return function (px, py) { return py < -2 ? '#ef7fa8' : c; };
    case 'macaron': // 가운데 크림 띠
      return function (px, py) { return Math.abs(py) < 5 ? '#f5eedd' : c; };
    case 'pudding': // 위에 카라멜
      return function (px, py) { return py < -8 ? '#a86a32' : c; };
    case 'swirl': // 사탕 소용돌이
      return function (px, py, dist) {
        const a = Math.atan2(py, px);
        return Math.floor(a / (Math.PI / 3) + dist / 7) % 2 ? '#f5f0ea' : c;
      };
    case 'bandage': // 미라 붕대 (대각선 띠)
      return function (px, py) { return Math.floor((px + py + 120) / 13) % 2 ? shadeColor(c, -12) : c; };
    case 'galaxy': // 은하: 밤하늘 + 박힌 별들 + 성운
      return function (px, py) {
        const h = hashCell(Math.floor(px / 4) + 13, Math.floor(py / 4) + 27);
        if (h < 35) return '#f5f0dc';
        if (h < 60) return '#ffd75e';
        if (h < 190) return shadeColor(c, 20); // 성운 얼룩
        return c;
      };
    case 'lapis': // 청금석: 남색 + 금가루
      return function (px, py) {
        const h = hashCell(Math.floor(px / 4) + 5, Math.floor(py / 4) + 41);
        if (h < 70) return '#d9a23b';
        if (h < 180) return shadeColor(c, 14);
        return c;
      };
    case 'rainbowswirl': // 무지개 소용돌이 (사탕용 — 띠와는 다르게!)
      return function (px, py, dist) {
        const a = Math.atan2(py, px);
        const idx = Math.floor(a / (Math.PI / 3) + dist / 7);
        const cols = ['#e05a4e', '#f2953c', '#f2d049', '#5ab55e', '#3f7fd9', '#8a5fc9'];
        return cols[((idx % 6) + 6) % 6];
      };
    default: // plain
      return function () { return c; };
  }
}

// 점으로 눈코입 — 기분 표현!
function drawFace(ctx, cx, cy, type, color) {
  ctx.fillStyle = color || '#26262e';
  const E = 8; // 눈 사이 거리(중심에서)
  function eyeDot(x) { ctx.fillRect(cx + x - 2, cy - 6, 4, 4); }
  function eyeLine(x) { ctx.fillRect(cx + x - 3, cy - 5, 6, 2); }
  function eyeHappy(x) { // ^ 모양
    ctx.fillRect(cx + x - 4, cy - 4, 2, 2);
    ctx.fillRect(cx + x - 2, cy - 6, 4, 2);
    ctx.fillRect(cx + x + 2, cy - 4, 2, 2);
  }
  function mouthSmile() {
    ctx.fillRect(cx - 6, cy + 5, 2, 2);
    ctx.fillRect(cx - 4, cy + 7, 8, 2);
    ctx.fillRect(cx + 4, cy + 5, 2, 2);
  }
  switch (type) {
    case 'smile':
      eyeDot(-E); eyeDot(E); mouthSmile();
      break;
    case 'wink':
      eyeDot(-E); eyeLine(E); mouthSmile();
      break;
    case 'sleepy':
      eyeLine(-E); eyeLine(E);
      ctx.fillRect(cx - 1, cy + 6, 3, 3); // 조그맣게 벌린 입
      break;
    case 'excited':
      eyeHappy(-E); eyeHappy(E);
      ctx.fillRect(cx - 4, cy + 5, 8, 5); // 활짝 벌린 입
      ctx.fillStyle = '#ef92b5'; // 볼터치
      ctx.fillRect(cx - 15, cy + 1, 3, 3);
      ctx.fillRect(cx + 12, cy + 1, 3, 3);
      break;
    case 'surprised':
      eyeDot(-E); eyeDot(E);
      ctx.fillRect(cx - 2, cy + 5, 5, 5); // 동그랗게 벌어진 입
      break;
    case 'cool': // 진짜 선글라스: 알 2개 + 브릿지 + 다리 + 렌즈 반짝
      ctx.fillRect(cx - 13, cy - 8, 10, 8);  // 왼쪽 알
      ctx.fillRect(cx + 3, cy - 8, 10, 8);   // 오른쪽 알
      ctx.fillRect(cx - 3, cy - 7, 6, 2);    // 브릿지
      ctx.fillRect(cx - 16, cy - 7, 3, 2);   // 안경 다리
      ctx.fillRect(cx + 13, cy - 7, 3, 2);
      ctx.fillStyle = 'rgba(255,255,255,0.55)'; // 렌즈 반짝
      ctx.fillRect(cx - 11, cy - 6, 2, 2);
      ctx.fillRect(cx + 5, cy - 6, 2, 2);
      ctx.fillStyle = color || '#26262e';
      mouthSmile();
      break;
    case 'grr': // 으르렁! (화난 눈썹 + 뾰족 이빨)
      ctx.fillRect(cx - E - 4, cy - 10, 3, 2); // 눈썹 (안쪽으로 내려감)
      ctx.fillRect(cx - E - 1, cy - 9, 3, 2);
      ctx.fillRect(cx + E + 1, cy - 10, 3, 2);
      ctx.fillRect(cx + E - 2, cy - 9, 3, 2);
      eyeDot(-E); eyeDot(E);
      ctx.fillRect(cx - 7, cy + 4, 14, 6); // 벌린 입
      ctx.fillStyle = '#f5f5f0'; // 이빨
      ctx.fillRect(cx - 6, cy + 4, 3, 3);
      ctx.fillRect(cx - 1, cy + 4, 3, 3);
      ctx.fillRect(cx + 4, cy + 4, 3, 3);
      break;
    case 'cyclops': // 커다란 외눈 (몬스터용)
      ctx.fillRect(cx - 5, cy - 10, 10, 10);
      ctx.fillStyle = '#f5f5f0';
      ctx.fillRect(cx - 1, cy - 8, 3, 3); // 눈 반짝임
      ctx.fillStyle = color || '#26262e';
      ctx.fillRect(cx - 3, cy + 5, 6, 3); // 입
      break;
  }
}

// 위로 뾰족한 도트 삼각형 (뿔, 등판, 볏에 사용). (x, y)가 꼭짓점.
function pixelTriUp(ctx, x, y, w, h, color) {
  const rows = Math.max(1, Math.round(h / PX));
  ctx.fillStyle = color;
  for (let r = 0; r < rows; r++) {
    const rowW = Math.max(PX, Math.round((w * (r + 1)) / rows / PX) * PX);
    ctx.fillRect(x - rowW / 2, y + r * PX, rowW, PX);
  }
}

// ---- 조립식 장식 (스티커 정의에 decoBack/decoFront 배열로 지정) ----
// decoBack: 몸통 뒤에 (귀·뿔·날개처럼 몸에 붙은 것), decoFront: 맨 앞에 (꼭지·반짝임처럼 위에 얹는 것)
const S_TOP = S_C - S_R; // 몸통 원의 맨 위

const DECO_BACK = {
  earsCat: function (ctx, st) { // 뾰족 귀
    pixelTriUp(ctx, S_C - 14, S_TOP - 10, 14, 16, shadeColor(st.c, -12));
    pixelTriUp(ctx, S_C + 14, S_TOP - 10, 14, 16, shadeColor(st.c, -12));
  },
  earsRound: function (ctx, st) { // 동글 귀 (곰)
    pixelCircle(ctx, S_C - 16, S_TOP + 2, 8, shadeColor(st.c, -10));
    pixelCircle(ctx, S_C + 16, S_TOP + 2, 8, shadeColor(st.c, -10));
  },
  earsBlack: function (ctx) { // 판다 귀
    pixelCircle(ctx, S_C - 16, S_TOP + 2, 8, '#33333e');
    pixelCircle(ctx, S_C + 16, S_TOP + 2, 8, '#33333e');
  },
  earsBunny: function (ctx, st) { // 긴 귀 (토끼)
    pixelBlock(ctx, S_C - 16, S_TOP - 16, 10, 26, shadeColor(st.c, -6));
    pixelBlock(ctx, S_C + 6, S_TOP - 16, 10, 26, shadeColor(st.c, -6));
  },
  earsDog: function (ctx, st) { // 늘어진 귀 (양옆)
    pixelCircle(ctx, S_C - S_R - 2, S_C - 6, 9, shadeColor(st.c, -22));
    pixelCircle(ctx, S_C + S_R + 2, S_C - 6, 9, shadeColor(st.c, -22));
  },
  mane: function (ctx, st) { // 사자 갈기
    pixelCircle(ctx, S_C, S_C, S_R + 7, shadeColor(st.c, -28));
  },
  tufts: function (ctx, st) { // 부엉이 귀깃
    pixelTriUp(ctx, S_C - 12, S_TOP - 8, 8, 12, shadeColor(st.c, -18));
    pixelTriUp(ctx, S_C + 12, S_TOP - 8, 8, 12, shadeColor(st.c, -18));
  },
  wings: function (ctx, st) { // 박쥐 날개 (위로 뾰족)
    pixelTriUp(ctx, S_C - S_R - 6, S_C - 12, 12, 18, shadeColor(st.c, -15));
    pixelTriUp(ctx, S_C + S_R + 6, S_C - 12, 12, 18, shadeColor(st.c, -15));
  },
  horn: function (ctx) { // 유니콘 뿔
    pixelTriUp(ctx, S_C, S_TOP - 18, 10, 22, '#f2c94c');
  },
  horns2: function (ctx) { // 마왕 뿔 2개
    pixelTriUp(ctx, S_C - 12, S_TOP - 10, 8, 16, '#f2c94c');
    pixelTriUp(ctx, S_C + 12, S_TOP - 10, 8, 16, '#f2c94c');
  },
  crown: function (ctx) { // 파인애플 잎
    pixelTriUp(ctx, S_C - 10, S_TOP - 10, 8, 14, '#4f8f3b');
    pixelTriUp(ctx, S_C, S_TOP - 16, 8, 20, '#3f7a30');
    pixelTriUp(ctx, S_C + 10, S_TOP - 10, 8, 14, '#4f8f3b');
  },
  cherryTwin: function (ctx, st) { // 뒤의 작은 체리 + 꼭지 줄기
    pixelCircle(ctx, S_C + 20, S_C - 12, 9, shadeColor(st.c, -10));
    ctx.fillStyle = '#3f7a30';
    ctx.fillRect(S_C + 18, S_TOP - 10, PX, 16);
    ctx.fillRect(S_C - 2, S_TOP - 12, PX, 10);
    ctx.fillRect(S_C - 2, S_TOP - 12, 22, PX);
  },
  antenna: function (ctx) { // 안테나 (로봇·외계인)
    pixelBlock(ctx, S_C - 2, S_TOP - 12, 4, 12, '#8a93a0', { outline: false });
    pixelCircle(ctx, S_C, S_TOP - 14, 4, '#e05a4e', { outline: false });
  },
  frogEyes: function (ctx, st) { // 개구리 눈두덩
    pixelCircle(ctx, S_C - 11, S_TOP + 1, 7, st.c);
    pixelCircle(ctx, S_C + 11, S_TOP + 1, 7, st.c);
  },
  spikes: function (ctx, st) { // 별사탕 뿔들
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4 + Math.PI / 8;
      pixelCircle(ctx, S_C + Math.cos(a) * (S_R + 4), S_C + Math.sin(a) * (S_R + 4), 5,
        shadeColor(st.c, 8), { outline: false });
    }
  },
};

const DECO_FRONT = {
  stem: function (ctx) { // 꼭지 + 잎
    ctx.fillStyle = '#6b4423';
    ctx.fillRect(S_C - 2, S_TOP - 6, 4, 10);
    pixelCircle(ctx, S_C + 9, S_TOP - 2, 5, '#4f8f3b', { outline: false });
  },
  calyx: function (ctx) { // 초록 꼭지 잎 (토마토·블루베리)
    ctx.fillStyle = '#3f7a30';
    ctx.fillRect(S_C - 8, S_TOP + 2, 16, 3);
    ctx.fillRect(S_C - 2, S_TOP - 4, 4, 8);
  },
  crack: function (ctx) { // 금 간 자국 (부화알)
    ctx.fillStyle = '#a8906a';
    let y = S_C - 12;
    for (let i = 0; i < 7; i++) {
      ctx.fillRect(S_C - 14 + i * 4, y, 4, PX);
      y += (i % 2 === 0 ? 1 : -1) * PX * 2;
    }
  },
  sparkle: function (ctx) { // 반짝반짝 (전설용)
    ctx.fillStyle = '#fff8dc';
    [[-20, -14], [22, -6], [12, 22]].forEach(function (p) {
      ctx.fillRect(S_C + p[0], S_C + p[1], PX, PX);
      ctx.fillRect(S_C + p[0] - PX, S_C + p[1] + PX, PX, PX);
      ctx.fillRect(S_C + p[0] + PX, S_C + p[1] + PX, PX, PX);
      ctx.fillRect(S_C + p[0], S_C + p[1] + PX * 2, PX, PX);
    });
  },
  sprinkle: function (ctx) { // 도넛 스프링클 (아이싱 위에만)
    const cols = ['#f2d049', '#5ab55e', '#3f7fd9', '#f2f0ea'];
    [[-14, -14], [-4, -20], [8, -16], [16, -8], [-18, -6]].forEach(function (p, i) {
      ctx.fillStyle = cols[i % cols.length];
      ctx.fillRect(S_C + p[0], S_C + p[1], PX * 2, PX);
    });
  },
  candle: function (ctx) { // 케이크 초 + 불꽃
    pixelBlock(ctx, S_C - 3, S_TOP - 10, 6, 12, '#f2f0ea', { outline: false });
    ctx.fillStyle = '#f7b32b';
    ctx.fillRect(S_C - 1, S_TOP - 16, 3, 6);
  },
  snout: function (ctx, st) { // 돼지 코
    pixelCircle(ctx, S_C, S_C + 4, 7, shadeColor(st.c, 14), { outline: false });
    ctx.fillStyle = '#8a4a5e';
    ctx.fillRect(S_C - 4, S_C + 3, 2, 3);
    ctx.fillRect(S_C + 2, S_C + 3, 2, 3);
  },
  drips: function (ctx, st) { // 슬라임 방울
    pixelCircle(ctx, S_C - 12, S_C + S_R - 2, 5, st.c, { outline: false });
    pixelCircle(ctx, S_C + 14, S_C + S_R - 4, 4, st.c, { outline: false });
  },
  shine: function (ctx) { // 반질반질 윤기 (왼쪽 위에 하얀 점)
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillRect(S_C - 14, S_C - 14, PX * 2, PX * 2);
    ctx.fillRect(S_C - 10, S_C - 18, PX, PX);
  },
};

function drawSticker(canvas, st) {
  canvas.width = S_SIZE;
  canvas.height = S_SIZE;
  const ctx = canvas.getContext('2d');
  const topY = S_C - S_R; // 몸통 원의 맨 위

  // ---- 조립식 뒤 장식 ----
  (st.decoBack || []).forEach(function (d) { DECO_BACK[d](ctx, st); });

  // ---- 몸통 뒤에 먼저 그리는 장식 ----
  if (st.kind === 'tricera') { // 목 뒤의 프릴
    pixelCircle(ctx, S_C, S_C, S_R + 6, shadeColor(st.c, -18));
  }
  if (st.kind === 'stego') { // 등판 3장
    pixelTriUp(ctx, S_C - 16, topY - 4, 10, 14, '#c94f4f');
    pixelTriUp(ctx, S_C, topY - 9, 12, 18, '#c94f4f');
    pixelTriUp(ctx, S_C + 16, topY - 4, 10, 14, '#c94f4f');
  }
  if (st.kind === 'spino') { // 등 위의 돛 (부채 모양 가시들)
    [-18, -9, 0, 9, 18].forEach(function (x) {
      const h = 16 - Math.abs(x) * 0.4;
      pixelTriUp(ctx, S_C + x, topY - h + 6, 8, h, '#e8843c');
    });
  }
  if (st.kind === 'ptera') { // 뒤로 길게 뻗은 볏
    for (let i = 0; i < 9; i++) {
      ctx.fillStyle = shadeColor(st.c, -22);
      ctx.fillRect(S_C + 2 + i * PX, topY + 4 - i * PX, PX, PX * 4);
    }
  }
  if (st.kind === 'mosa') { // 양옆 지느러미
    pixelBlock(ctx, S_C - S_R - 8, S_C + 2, 12, 10, st.c);
    pixelBlock(ctx, S_C + S_R - 4, S_C + 2, 12, 10, st.c);
  }
  if (st.kind === 'dragon') { // 황금 뿔 2개
    pixelTriUp(ctx, S_C - 12, topY - 10, 8, 16, '#f2c94c');
    pixelTriUp(ctx, S_C + 12, topY - 10, 8, 16, '#f2c94c');
  }

  // 태양 광선 (몸통 뒤에 먼저)
  if (st.kind === 'sun') {
    for (let k = 0; k < 12; k++) {
      const a = (k * Math.PI) / 6;
      const len = k % 2 === 0 ? 12 : 7;
      ctx.fillStyle = k % 2 === 0 ? '#f7b32b' : '#f2953c';
      for (let d = S_R; d <= S_R + len; d += PX) {
        ctx.fillRect(Math.round((S_C + Math.cos(a) * d) / PX) * PX,
                     Math.round((S_C + Math.sin(a) * d) / PX) * PX, PX, PX);
      }
    }
  }

  pixelPatternCircle(ctx, S_C, S_C, S_R, stickerColorFn(st));

  // 고리별의 고리 (몸통 앞을 가로지름)
  if (st.kind === 'ring') {
    for (let x = -38; x <= 38; x += PX) {
      const y = Math.round((x * 0.14) / PX) * PX;
      const edge = Math.abs(x) > 30;
      ctx.fillStyle = edge ? shadeColor('#e8d9a0', -40) : '#e8d9a0';
      ctx.fillRect(S_C + x, S_C + 6 + y, PX, PX);
      ctx.fillStyle = edge ? shadeColor('#c9b878', -40) : '#c9b878';
      ctx.fillRect(S_C + x, S_C + 6 + y + PX, PX, PX);
    }
  }

  // ---- 몸통 앞에 그리는 장식 ----
  if (st.kind === 'tricera') { // 이마의 뿔 2개
    pixelTriUp(ctx, S_C - 10, topY - 8, 8, 14, '#f2e8d0');
    pixelTriUp(ctx, S_C + 10, topY - 8, 8, 14, '#f2e8d0');
  }
  if (st.kind === 'egg') { // 금이 간 자국 (지그재그)
    ctx.fillStyle = '#a8906a';
    let cy2 = S_C - 12;
    for (let i = 0; i < 7; i++) {
      ctx.fillRect(S_C - 14 + i * 4, cy2, 4, PX);
      cy2 += (i % 2 === 0 ? 1 : -1) * PX * 2;
    }
  }
  if (st.kind === 'dragon') { // 전설의 반짝임
    ctx.fillStyle = '#fff8dc';
    [[-20, -14], [22, -6], [12, 22]].forEach(function (p) {
      ctx.fillRect(S_C + p[0], S_C + p[1], PX, PX);
      ctx.fillRect(S_C + p[0] - PX, S_C + p[1] + PX, PX, PX);
      ctx.fillRect(S_C + p[0] + PX, S_C + p[1] + PX, PX, PX);
      ctx.fillRect(S_C + p[0], S_C + p[1] + PX * 2, PX, PX);
    });
  }

  // 황금 축구공 반짝임
  if (st.kind === 'goldsoccer') {
    ctx.fillStyle = '#fff8dc';
    [[-20, -18], [22, -10], [16, 22]].forEach(function (p) {
      ctx.fillRect(S_C + p[0], S_C + p[1], PX, PX);
      ctx.fillRect(S_C + p[0] - PX, S_C + p[1] + PX, PX, PX);
      ctx.fillRect(S_C + p[0] + PX, S_C + p[1] + PX, PX, PX);
      ctx.fillRect(S_C + p[0], S_C + p[1] + PX * 2, PX, PX);
    });
  }

  drawFace(ctx, S_C, S_C, st.face, st.faceColor);

  // ---- 조립식 앞 장식 (얼굴 위에 얹는 것: 꼭지·코·반짝임 등) ----
  (st.decoFront || []).forEach(function (d) { DECO_FRONT[d](ctx, st); });
}

function makeStickerEl(st) {
  const canvas = document.createElement('canvas');
  canvas.className = 'sticker';
  drawSticker(canvas, st);
  return canvas;
}
