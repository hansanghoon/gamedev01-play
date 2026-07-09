// 게임 전체에서 같이 쓰는 아이템 정보 (장소, 추억 이야기)
const ALL_ITEMS = [
  { id: "trowel", name: "흙묻은 모종삽", location: "햇볕 바른 가족집 마당",
    memory: "꽃을 좋아하시는 할머니와 함께 꽃을 심었던 기억이 떠오른다." },
  { id: "tricycle", name: "녹슨 세발자전거", location: "햇볕 바른 가족집 마당",
    memory: "할아버지가 잡아주신 손을 놓고 처음으로 혼자 페달을 밟았던 기억이 떠오른다." },
  { id: "jarlid", name: "깨진 장독 뚜껑", location: "햇볕 바른 가족집 마당",
    memory: "마당에서 뛰어 놀다가 장독 뚜껑을 깨뜨려서 혼났던 기억이 떠오른다." },
  { id: "basket", name: "녹슨 철제 바구니", location: "녹슨 두레박이 있는 우물",
    memory: "우물에서 물을 퍼올렸던 기억이 떠오른다." },
  { id: "strawhat", name: "흙투성이 밀짚모자", location: "거미줄 친 헛간",
    memory: "할아버지와 함께 농사를 마쳤던 기억이 떠오른다." },
  { id: "busmap", name: "뜯어진 노선도", location: "먼지 앉은 버스정류장",
    memory: "할아버지와 버스를 타고 마을회관에 갔던 기억이 떠오른다." },
  { id: "janggi", name: "낡은 장기판", location: "빛바랜 정자",
    memory: "정자에서 장기를 두시던 어르신들을 보았던 기억이 떠오른다." },
  { id: "fan", name: "분리된 선풍기 조각", location: "색 바랜 슈퍼",
    memory: "부채질을 하고 계시던 슈퍼 사장님을 보았던 기억이 떠오른다." },
  { id: "chestnut", name: "다 까진 밤송이", location: "이끼 낀 뒷산",
    memory: "할아버지와 함께 밤을 따러 나갔던 기억이 떠오른다." },
  { id: "watermelon", name: "수박 조각", location: "졸졸 흐르는 시냇가",
    memory: "수박을 먹다가 흘렸던 기억이 떠오른다." },
  { id: "rice", name: "벼 조각", location: "허수아비 선 논두렁",
    memory: "허수아비를 보았던 기억이 떠오른다." },
  { id: "bikebell", name: "녹슨 자전거 벨", location: "이끼 낀 돌다리",
    memory: "자전거를 타다가 다리 위에서 벨이 떨어져 나왔던 기억이 떠오른다." },
  { id: "photo", name: "물에 젖은 가족사진", location: "이끼 낀 돌다리",
    memory: "다리를 건너다가 실수로 가족사진을 물에 빠뜨렸던 기억이 떠오른다." }
];

const SAVE_KEY = "familyMemories_collected";

function loadCollected() {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveCollected(ids) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(ids));
}

function markCollected(id) {
  const ids = loadCollected();
  if (!ids.includes(id)) {
    ids.push(id);
    saveCollected(ids);
  }
}

// === 충돌 판정 (벽/가구/나무처럼 "막혀야 하는" 사물에 부딪히는지 검사) ===
// 장애물은 사각형 {x,y,w,h} 또는 원형 {x,y,r}로 적는다.
// margin은 캐릭터 몸통이 차지하는 폭만큼 여유를 줘서, 발 위치(점 하나)만 검사해도
// 실제로는 캐릭터 크기만큼 막힌 것처럼 느껴지게 함.
function hitsObstacle(px, py, obstacle, margin = 7) {
  if (obstacle.r != null) {
    return Math.hypot(px - obstacle.x, py - obstacle.y) < obstacle.r + margin;
  }
  return px > obstacle.x - margin && px < obstacle.x + obstacle.w + margin &&
         py > obstacle.y - margin && py < obstacle.y + obstacle.h + margin;
}

function hitsAnyObstacle(px, py, obstacles) {
  return obstacles.some((o) => hitsObstacle(px, py, o));
}

// x, y를 한 축씩 따로 이동해보고 장애물에 막히면 그 축만 취소함.
// 이렇게 하면 벽에 부딪혔을 때 그 자리에 멈추는 게 아니라 벽을 따라 미끄러지듯 이동함.
function moveWithObstacles(player, dx, dy, obstacles) {
  if (dx !== 0) {
    const nx = player.x + dx;
    if (!hitsAnyObstacle(nx, player.y, obstacles)) player.x = nx;
  }
  if (dy !== 0) {
    const ny = player.y + dy;
    if (!hitsAnyObstacle(player.x, ny, obstacles)) player.y = ny;
  }
}

// === 지도 시스템: 전체 장소 목록(걸어서 이어지는 순서) + 방문 여부 ===
// file이 null이면 아직 맵을 안 만든 장소. 지도 메뉴에서 "아직 갈 수 없는 곳"으로 표시됨.
const LOCATIONS = [
  { id: "yard", name: "햇볕 바른 가족집 마당", file: "family-yard.html" },
  { id: "well", name: "녹슨 두레박이 있는 우물", file: "well.html" },
  { id: "barn", name: "거미줄 친 헛간", file: "barn.html" },
  { id: "busstop", name: "먼지 앉은 버스정류장", file: "busstop.html" },
  { id: "pavilion", name: "빛바랜 정자", file: "pavilion.html" },
  { id: "store", name: "색 바랜 슈퍼", file: "store.html" },
  { id: "mountain", name: "이끼 낀 뒷산", file: "mountain.html" },
  { id: "stream", name: "졸졸 흐르는 시냇가", file: "stream.html" },
  { id: "ricefield", name: "허수아비 선 논두렁", file: "ricefield.html" },
  { id: "bridge", name: "이끼 낀 돌다리", file: "bridge.html" }
];

const VISITED_KEY = "familyMemories_visited";

function loadVisited() {
  try {
    return JSON.parse(localStorage.getItem(VISITED_KEY)) || [];
  } catch (e) {
    return [];
  }
}

// 한 장소에 처음 도착했을 때 true를 반환하고, 그 자리에서 "방문함"으로 표시해둠.
// 도착 내레이션을 "처음 한 번만" 보여주는 데 씀.
function markVisitedIfNew(id) {
  const ids = loadVisited();
  if (ids.includes(id)) return false;
  ids.push(id);
  localStorage.setItem(VISITED_KEY, JSON.stringify(ids));
  return true;
}

const INTRO_SHOWN_KEY = "familyMemories_introShown";

// 마당의 시작 상황설명(인트로)을 이미 본 적이 있는지 확인함.
// 새로고침이나 처음부터 다시 시작해도 다시 보여주지 않기 위해 reload에도 지워지지 않는 localStorage를 씀.
function hasIntroShown() {
  return localStorage.getItem(INTRO_SHOWN_KEY) === "1";
}

function markIntroShown() {
  localStorage.setItem(INTRO_SHOWN_KEY, "1");
}

// 도감(☰ → 도감 탭)에 보여줄 아이템 목록을 만듦. 아이템마다 작은 도트 아이콘을 그려서 보여주고,
// 이름을 누르면 추억 설명이 펼쳐졌다 접혔다 함(아직 못 찾은 아이템은 이름이 "???"라서 눌러도 그대로임).
function renderDex(container) {
  const collected = loadCollected();
  container.innerHTML = "";

  ALL_ITEMS.forEach((item) => {
    const has = collected.includes(item.id);

    const row = document.createElement("div");
    row.className = "dexRow";
    row.style.display = "flex";
    row.style.gap = "8px";
    row.style.alignItems = "flex-start";

    const iconCanvas = document.createElement("canvas");
    iconCanvas.width = 36;
    iconCanvas.height = 36;
    iconCanvas.style.flexShrink = "0";
    drawItemIcon(iconCanvas.getContext("2d"), has ? item.id : null, 0, 0);

    const info = document.createElement("div");
    info.style.flex = "1";

    const nameEl = document.createElement("div");
    nameEl.className = "dexName";
    nameEl.textContent = has ? item.name : "???";

    const locEl = document.createElement("div");
    locEl.className = "dexLoc";
    locEl.textContent = item.location;

    const memoryEl = document.createElement("div");
    memoryEl.className = "dexMemory";
    memoryEl.textContent = item.memory;
    memoryEl.style.display = "none";

    if (has) {
      nameEl.style.cursor = "pointer";
      nameEl.title = "눌러서 추억 보기";
      nameEl.addEventListener("click", () => {
        memoryEl.style.display = memoryEl.style.display === "none" ? "block" : "none";
      });
    }

    info.appendChild(nameEl);
    info.appendChild(locEl);
    info.appendChild(memoryEl);
    row.appendChild(iconCanvas);
    row.appendChild(info);
    container.appendChild(row);
  });

  const summary = document.createElement("div");
  summary.style.marginTop = "10px";
  summary.style.fontSize = "12px";
  summary.style.color = "#7a6a50";
  summary.textContent = `전체 수집: ${collected.length} / ${ALL_ITEMS.length}`;
  container.appendChild(summary);
}

// 지도 메뉴(☰ → 지도 탭)에 보여줄 목록 HTML을 만듦. 방문한 곳은 이름을 눌러서 바로 이동할 수 있음.
function renderLocationList(container, currentId) {
  const visited = loadVisited();
  container.innerHTML = "";
  LOCATIONS.forEach((loc) => {
    const row = document.createElement("div");
    row.className = "mapRow";
    const isCurrent = loc.id === currentId;
    const isVisited = visited.includes(loc.id);
    let status, clickable = false;
    if (isCurrent) { status = "📍 지금 여기"; }
    else if (!loc.file) { status = "🔒 아직 갈 수 없는 곳"; }
    else if (isVisited) { status = "✅ 가본 곳 (눌러서 이동)"; clickable = true; }
    else { status = "❓ 아직 못 가본 곳"; }
    row.innerHTML = `<span class="mapName">${loc.name}</span><span class="mapStatus">${status}</span>`;
    if (clickable) {
      row.classList.add("mapClickable");
      row.addEventListener("click", () => { location.href = loc.file; });
    }
    container.appendChild(row);
  });
}

// 새로고침(F5)으로 들어온 경우에만 모은 추억/방문 기록을 초기화함.
// 맵 사이를 걸어서 이동하는 것(location.href로 다음 페이지 이동)은 "새로고침"이 아니라
// "새 페이지로 이동"이라서, Navigation Timing API로 둘을 구분할 수 있음.
// 새로고침은 어떤 맵에서 눌러도(Cmd+R 포함) 처음 장소(마당)부터 다시 시작하게 함
(function resetCollectedOnReload() {
  try {
    const nav = performance.getEntriesByType("navigation")[0];
    if (nav && nav.type === "reload") {
      saveCollected([]);
      localStorage.removeItem(VISITED_KEY);
      const currentFile = location.pathname.split("/").pop();
      if (currentFile !== "family-yard.html") {
        location.href = "family-yard.html";
      }
    }
  } catch (e) {
    // 이 API를 못 쓰는 환경이면 그냥 기존 진행 상황을 유지함
  }
})();

// 맵 가장자리로 걸어나갈 때 다음 맵으로 넘어가기 위한 정보를 잠깐 저장해두는 곳.
// sessionStorage라서 탭을 닫으면 사라짐(다음 방문까지만 유효하면 됨).
// dir이 "left"/"right"(좌우로 나감)면 pos는 y 좌표, dir이 "up"/"down"(위아래로 나감)면 pos는 x 좌표를 담음 —
// 가로 이동이면 세로 위치를 이어주고, 세로 이동이면 가로 위치를 이어주는 식.
const TRANSITION_KEY = "familyMemories_transition";

function setMapTransition(pos, dir) {
  sessionStorage.setItem(TRANSITION_KEY, JSON.stringify({ pos, dir }));
}

function popMapTransition() {
  const raw = sessionStorage.getItem(TRANSITION_KEY);
  sessionStorage.removeItem(TRANSITION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

// === 배경음악이 맵을 넘어갈 때마다 처음부터 다시 재생되는 문제 해결 ===
// 각 맵은 별도의 HTML 페이지라서 다음 맵으로 넘어가면 <audio> 태그가 새로 만들어지고
// 재생 위치가 0으로 되돌아감. 그래서 페이지를 떠나기 직전에 현재 재생 위치/재생 중인지/
// 음소거 상태를 sessionStorage에 저장해두고, 다음 맵이 로드되면 그 위치에서 이어서 재생함.
const BGM_STATE_KEY = "familyMemories_bgmState";

function saveBgmState(bgm) {
  try {
    sessionStorage.setItem(BGM_STATE_KEY, JSON.stringify({
      time: bgm.currentTime,
      playing: !bgm.paused,
      muted: bgm.muted
    }));
  } catch (e) {
    // 저장 실패해도 음악이 처음부터 재생되는 것 외엔 문제 없으니 조용히 무시
  }
}

// 저장된 재생 상태가 있으면 그 위치로 이어서 재생하고 true를 반환, 없으면 false
// 재생 위치/음소거 상태만 복원하고, 실제로 재생됐는지는 반환값(state.playing)으로 알려줌.
// 호출하는 쪽에서 musicStarted를 play()가 "성공했을 때만" true로 바꿔야 함 — 그렇지 않으면
// 브라우저 자동재생 제한으로 play()가 막혔는데도 musicStarted=true가 되어, 첫 키 입력 때
// 다시 시도하는 로직(startMusic)이 평생 실행되지 않아 음악이 영영 안 나오는 버그가 생김.
function restoreBgmState(bgm) {
  try {
    const raw = sessionStorage.getItem(BGM_STATE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    bgm.currentTime = state.time || 0;
    bgm.muted = !!state.muted;
    return state;
  } catch (e) {
    return null;
  }
}

// 아이템을 주울 때 짧게 들리는 "딩!" 소리. 음원 파일 없이 Web Audio API로
// 직접 만들어서 재생함(음이 위로 살짝 올라갔다가 빠르게 잦아듦).
let pickupAudioCtx = null;
function playPickupChime() {
  try {
    pickupAudioCtx = pickupAudioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const ctx = pickupAudioCtx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.32);
  } catch (e) {
    // 브라우저가 오디오 재생을 막아둔 상황이면 조용히 무시
  }
}
