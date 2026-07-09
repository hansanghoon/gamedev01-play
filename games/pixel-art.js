// Faded Memory 전체 맵이 같이 쓰는 도트(픽셀) 그리기 도구.
// PX를 키우면 점 하나가 화면에서 또렷하게 보여서 "도트 그래픽" 느낌이 살아남.
const PX = 2;

// 16진 색상을 밝게(+) 또는 어둡게(-) 섞어서 새 색을 만듦. 명암 단계를 자동으로 만들 때 씀.
function shadeColor(hex, percent) {
  const num = parseInt(hex.slice(1), 16);
  const amt = Math.round((255 * percent) / 100);
  let r = (num >> 16) + amt;
  let g = ((num >> 8) & 0x00ff) + amt;
  let b = (num & 0x0000ff) + amt;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// 사각형을 도트로 채움. 테두리는 어둡게(외곽선), 왼쪽 위는 밝게, 오른쪽 아래는 어둡게 칠해서
// 빛이 왼쪽 위에서 온다고 가정한 입체감을 자동으로 만들어줌.
function pixelBlock(ctx, x, y, w, h, baseColor, opts = {}) {
  const { outline = true } = opts;
  const cols = Math.max(1, Math.round(w / PX));
  const rows = Math.max(1, Math.round(h / PX));
  const canShade = cols >= 5 && rows >= 5;
  const canOutline = outline && cols >= 3 && rows >= 3;
  const highlight = shadeColor(baseColor, 22);
  const shadow = shadeColor(baseColor, -22);
  const outlineColor = shadeColor(baseColor, -55);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isEdge = r === 0 || c === 0 || r === rows - 1 || c === cols - 1;
      let color = baseColor;
      if (canOutline && isEdge) color = outlineColor;
      else if (canShade && (r <= 1 || c <= 1)) color = highlight;
      else if (canShade && (r >= rows - 2 || c >= cols - 2)) color = shadow;
      ctx.fillStyle = color;
      ctx.fillRect(x + c * PX, y + r * PX, PX, PX);
    }
  }
}

// 원을 도트로 채움. 가장자리는 외곽선, 왼쪽 위 방향은 밝게, 오른쪽 아래 방향은 어둡게.
function pixelCircle(ctx, cx, cy, r, baseColor, opts = {}) {
  const { outline = true } = opts;
  const cells = Math.ceil(r / PX);
  const canShade = cells >= 4;
  const canOutline = outline && cells >= 2;
  const highlight = shadeColor(baseColor, 22);
  const shadow = shadeColor(baseColor, -22);
  const outlineColor = shadeColor(baseColor, -55);
  for (let dy = -cells; dy <= cells; dy++) {
    for (let dx = -cells; dx <= cells; dx++) {
      const px = dx * PX, py = dy * PX;
      const dist = Math.hypot(px, py);
      if (dist > r) continue;
      let color = baseColor;
      if (canOutline && dist > r - PX * 1.4) color = outlineColor;
      else if (canShade && dx + dy < -cells * 0.4) color = highlight;
      else if (canShade && dx + dy > cells * 0.6) color = shadow;
      ctx.fillStyle = color;
      ctx.fillRect(cx + px, cy + py, PX, PX);
    }
  }
}

// 지붕(위로 갈수록 좁아지는 삼각 모양)을 도트로 채움. 기와처럼 줄무늬 명암을 넣고 외곽선을 두름.
function pixelRoof(ctx, centerX, baseY, halfWidth, height, baseColor) {
  const rows = Math.round(height / PX);
  const shingleBand = shadeColor(baseColor, -14);
  const outlineColor = shadeColor(baseColor, -55);
  for (let r = 0; r < rows; r++) {
    const rowHalfWidth = halfWidth * (1 - r / rows);
    const cols = Math.max(1, Math.round((rowHalfWidth * 2) / PX));
    const startX = centerX - (cols * PX) / 2;
    const isBand = Math.floor(r / 3) % 2 === 1;
    for (let c = 0; c < cols; c++) {
      const isEdge = c === 0 || c === cols - 1 || r === rows - 1;
      ctx.fillStyle = isEdge ? outlineColor : isBand ? shingleBand : baseColor;
      ctx.fillRect(startX + c * PX, baseY - (r + 1) * PX, PX, PX);
    }
  }
}

// 좌표를 무작위처럼 보이는 정수로 흩어주는 해시. 같은 좌표는 항상 같은 값이 나와서
// (매 프레임 같은 무늬 유지) 단순 곱셈식과 달리 격자/줄무늬가 보이지 않고 자연스럽게 흩어짐.
function hashCell(cx, cy) {
  let h = cx * 374761393 + cy * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  h = h ^ (h >> 16);
  return Math.abs(h) % 1000;
}

// 잔디/흙바닥처럼 넓은 면에 점박이 질감을 줌. Math.random() 대신 위 해시로
// 점을 흩뿌려서, 반짝이지 않으면서도 격자 무늬 없이 자연스러운 텍스처를 만듦.
function ditherGround(ctx, x, y, w, h, baseColor, speckleColor, percent = 16) {
  const cols = Math.round(w / PX);
  const rows = Math.round(h / PX);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cellX = Math.round(x / PX) + c;
      const cellY = Math.round(y / PX) + r;
      ctx.fillStyle = hashCell(cellX, cellY) < percent * 10 ? speckleColor : baseColor;
      ctx.fillRect(x + c * PX, y + r * PX, PX, PX);
    }
  }
}

// === 실내 가구 그리기 ===
// 가구를 위에서 내려다본 평면(사각형)으로 그리면 침대인지 책상인지 구분이 안 됨.
// 그래서 캐릭터를 그릴 때처럼 "바닥에 닿는 줄(groundY)"을 기준으로 위로 쌓아 올려서,
// 옆/정면에서 본 것처럼 높이가 보이게 그림. 등받이·다리·헤드보드처럼 높이가 다른 부분을
// 일부러 다르게 그려서 멀리서도 무슨 가구인지 알아볼 수 있게 함.

// 가구가 공중에 떠 있지 않고 바닥에 놓여 있는 것처럼 보이도록, 바닥에 살짝 눌린 그림자를 그림
function dropShadow(ctx, cx, groundY, w) {
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  const halfW = (w * 0.45) / 2;
  ctx.fillRect(cx - halfW, groundY - PX, halfW * 2, PX * 2);
}

function drawBed(ctx, x, groundY, w) {
  const mattressDepth = 46;
  const topY = groundY - mattressDepth;
  const headboardH = 32;

  dropShadow(ctx, x + w / 2, groundY, w);
  pixelBlock(ctx, x, topY - headboardH, w, headboardH, "#6b4423"); // 헤드보드(머리맏, 가장 높음)
  pixelBlock(ctx, x + 4, topY, w - 8, mattressDepth, "#bcd9a8"); // 매트리스 + 이불
  pixelBlock(ctx, x + 12, topY + 4, w - 24, 16, "#f5f0e6"); // 베개
  pixelBlock(ctx, x + 6, groundY - 6, 6, 8, "#4a3322", { outline: false }); // 다리
  pixelBlock(ctx, x + w - 12, groundY - 6, 6, 8, "#4a3322", { outline: false });
}

function drawNightstand(ctx, x, groundY, w) {
  const h = 26;
  dropShadow(ctx, x + w / 2, groundY, w);
  pixelBlock(ctx, x, groundY - h, w, h, "#8a6a3a");
  ctx.fillStyle = shadeColor("#8a6a3a", -45);
  ctx.fillRect(x + 2, groundY - h / 2, w - 4, PX); // 서랍 구분선
  pixelCircle(ctx, x + w / 2, groundY - h / 2 - 5, 1.5, "#3a2c1a", { outline: false }); // 손잡이
}

function drawSofa(ctx, x, groundY, w) {
  const seatH = 22, armW = 14, armH = 30, backH = 36;
  dropShadow(ctx, x + w / 2, groundY, w);
  pixelBlock(ctx, x + armW, groundY - seatH - backH, w - armW * 2, backH, "#6b4423"); // 등받이(가장 높음)
  pixelBlock(ctx, x, groundY - armH, armW, armH, "#6b4423"); // 팔걸이
  pixelBlock(ctx, x + w - armW, groundY - armH, armW, armH, "#6b4423");
  pixelBlock(ctx, x + armW, groundY - seatH, w - armW * 2, seatH, "#7a5234"); // 좌석(가장 낮음)
  pixelCircle(ctx, x + w * 0.34, groundY - seatH - 5, 7, "#cc3b3b");
  pixelCircle(ctx, x + w * 0.66, groundY - seatH - 5, 7, "#cc3b3b");
}

function drawCoffeeTable(ctx, x, groundY, w, legH = 16, topH = 10) {
  dropShadow(ctx, x + w / 2, groundY, w);
  pixelBlock(ctx, x + 4, groundY - legH, 5, legH, "#5a3f24", { outline: false }); // 다리
  pixelBlock(ctx, x + w - 9, groundY - legH, 5, legH, "#5a3f24", { outline: false });
  pixelBlock(ctx, x, groundY - legH - topH, w, topH, "#8a6a3a"); // 상판
}

function drawCounter(ctx, x, groundY, w, h = 42) {
  dropShadow(ctx, x + w / 2, groundY, w);
  pixelBlock(ctx, x, groundY - h, w, h, "#8a6a3a");
  ctx.fillStyle = shadeColor("#8a6a3a", -45);
  const doors = Math.max(2, Math.round(w / 30));
  for (let i = 1; i < doors; i++) {
    ctx.fillRect(x + (w / doors) * i, groundY - h + 6, PX, h - 12); // 캐비닛 문 구분선
  }
  pixelBlock(ctx, x, groundY - h, w, 6, shadeColor("#8a6a3a", 28), { outline: false }); // 조리대 상판
}

function drawStove(ctx, x, groundY, w, h = 42) {
  drawCounter(ctx, x, groundY, w, h);
  pixelCircle(ctx, x + w * 0.3, groundY - h + 3, 4, "#2a2a2a", { outline: false }); // 화구
  pixelCircle(ctx, x + w * 0.7, groundY - h + 3, 4, "#2a2a2a", { outline: false });
  pixelBlock(ctx, x + 6, groundY - h + 14, w - 12, h - 20, "#3a2c1a"); // 오븐 문
  pixelCircle(ctx, x + w - 12, groundY - h / 2, 1.5, "#cfae28", { outline: false }); // 손잡이
}

function drawSink(ctx, x, groundY, w, h = 42) {
  dropShadow(ctx, x + w / 2, groundY, w);
  pixelBlock(ctx, x, groundY - h, w, h, "#9fae9c");
  pixelBlock(ctx, x + 6, groundY - h + 4, w - 12, 10, "#5d6b5b", { outline: false }); // 안쪽 싱크
  pixelBlock(ctx, x + w / 2 - 2, groundY - h - 10, 4, 10, "#cfd4d2", { outline: false }); // 수도꼭지
}

function drawChair(ctx, x, groundY, w = 22) {
  const legH = 8, seatH = 10, backW = w * 0.55, backH = 24;
  dropShadow(ctx, x + w / 2, groundY, w);
  pixelBlock(ctx, x + 3, groundY - legH, 4, legH, "#5a3f24", { outline: false }); // 다리
  pixelBlock(ctx, x + w - 7, groundY - legH, 4, legH, "#5a3f24", { outline: false });
  pixelBlock(ctx, x + (w - backW) / 2, groundY - legH - seatH - backH, backW, backH, "#5a3f24"); // 등받이(좌석보다 좁고 뒤쪽, 높음)
  pixelBlock(ctx, x, groundY - legH - seatH, w, seatH, "#bfa06a"); // 좌석(다리 위, 등받이보다 넓고 밝음)
}

function drawDiningTable(ctx, x, groundY, w = 70, depth = 36) {
  dropShadow(ctx, x + w / 2, groundY - depth / 2, w + 10);
  pixelBlock(ctx, x + 4, groundY - 6, 5, 6, "#5a3f24", { outline: false }); // 다리
  pixelBlock(ctx, x + w - 9, groundY - 6, 5, 6, "#5a3f24", { outline: false });
  pixelBlock(ctx, x, groundY - depth, w, depth - 6, "#8a6a3a"); // 상판
}

function drawPotPlant(ctx, cx, groundY, r = 12) {
  dropShadow(ctx, cx, groundY, r * 1.6);
  pixelBlock(ctx, cx - r * 0.5, groundY - 10, r, 10, "#8a6a3a"); // 화분
  pixelCircle(ctx, cx, groundY - 10 - r * 0.6, r, "#4f8f3b"); // 잎
}

// 침대에 누운 모습. 서 있는 캐릭터를 그대로 눕히는 대신, 베개 쪽에 머리만 보이고
// 몸은 이불에 덮여서 살짝 도톰하게 부푼 것처럼 그림(누워서 자는 모습으로 흔히 쓰는 표현).
function drawLyingCharacter(ctx, cx, cy, blanketColor) {
  const headSize = 13;
  const headX = cx - 20;
  // 이불 위로 도톰하게 부푼 몸(베개 옆에서 발 쪽으로 갈수록 낮아지는 느낌은 생략하고 단순한 둔덕으로)
  pixelBlock(ctx, headX + 6, cy - 6, 36, 12, shadeColor(blanketColor, -8), { outline: false });
  // 베개에 닿은 머리
  pixelBlock(ctx, headX, cy - headSize / 2, headSize, headSize, "#f0c79a");
  pixelBlock(ctx, headX, cy - headSize / 2, headSize, headSize * 0.45, "#6b4423", { outline: false });
  // 감은 눈(자고 있다는 표시로 점 하나만)
  ctx.fillStyle = "#2a1f14";
  ctx.fillRect(headX + headSize * 0.55, cy - 1, PX, PX);
}

// 건초 더미. 동그랗게 쌓인 마른 풀 위에 묶은 줄무늬 2개를 그려서 그냥 동그란 덤불과 구분되게 함
function drawHayBale(ctx, cx, cy, r) {
  dropShadow(ctx, cx, cy + r, r * 1.6);
  pixelCircle(ctx, cx, cy, r, "#d9b54a");
  ctx.fillStyle = shadeColor("#d9b54a", -35);
  ctx.fillRect(cx - r * 0.8, cy - r * 0.1 - PX / 2, r * 1.6, PX);
  ctx.fillRect(cx - r * 0.7, cy + r * 0.4 - PX / 2, r * 1.4, PX);
}

// 가시 돋은 밤송이(장식). 그냥 동그란 점이 아니라 가시가 삐죽삐죽 나온 모양으로 알아보기 쉽게 함
function drawChestnutBurr(ctx, cx, cy, r) {
  pixelCircle(ctx, cx, cy, r, "#6b5a3a", { outline: false });
  ctx.fillStyle = "#4a3f28";
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
    ctx.fillRect(cx + Math.cos(a) * (r + 2), cy + Math.sin(a) * (r + 2), PX, PX);
  }
}

// 물가의 갈대/부들 덤불. (cx, baseY)는 덤불이 자라는 땅 위치(뿌리 쪽)
function drawReeds(ctx, cx, baseY) {
  const blades = [[-10, -34], [-3, -42], [4, -40], [10, -32]];
  ctx.strokeStyle = "#3f7a3a";
  ctx.lineWidth = 2;
  blades.forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(cx + dx * 0.3, baseY);
    ctx.quadraticCurveTo(cx + dx * 0.6, baseY + dy * 0.6, cx + dx, baseY + dy);
    ctx.stroke();
  });
  // 부들(cattail) 꽃대 두 개
  pixelBlock(ctx, cx - 2, baseY - 30, 3, 22, "#4a6a2a", { outline: false });
  pixelCircle(ctx, cx - 1, baseY - 32, 4, "#6b4f2a", { outline: false });
  pixelBlock(ctx, cx + 6, baseY - 26, 3, 18, "#4a6a2a", { outline: false });
  pixelCircle(ctx, cx + 7, baseY - 28, 4, "#6b4f2a", { outline: false });
}

// 긴 의자(벤치). 의자(drawChair)와 같은 방식이지만 더 넓고 등받이가 낮음
function drawBench(ctx, x, groundY, w) {
  const legH = 10, seatH = 8, backH = 22;
  dropShadow(ctx, x + w / 2, groundY, w);
  pixelBlock(ctx, x + 4, groundY - legH, 5, legH, "#5a3f24", { outline: false });
  pixelBlock(ctx, x + w - 9, groundY - legH, 5, legH, "#5a3f24", { outline: false });
  pixelBlock(ctx, x, groundY - legH - seatH - backH, w, backH, "#6b4423");
  pixelBlock(ctx, x, groundY - legH - seatH, w, seatH, "#8a6a3a");
}

// 헛간 구석에 거미줄이 쳐진 느낌을 주는 장식(충돌 없음, 얇은 실 몇 가닥만 표현)
function drawCornerWeb(ctx, cx, cy, size) {
  ctx.strokeStyle = "rgba(245,240,225,0.55)";
  ctx.lineWidth = 1;
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.arc(cx, cy, (size * i) / 3, Math.PI, Math.PI * 1.5);
    ctx.stroke();
  }
  for (let a = Math.PI; a <= Math.PI * 1.5; a += Math.PI / 8) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * size, cy + Math.sin(a) * size);
    ctx.stroke();
  }
}

// 모든 맵이 같이 쓰는 주인공 캐릭터 그리기
function drawCharacter(ctx, cx, groundY, direction, walkFrame, crouching, gliding) {
  const hairColor = "#6b4423";
  const skinColor = "#f0c79a";
  const shirtRed = "#cc3b3b";
  const shirtWhite = "#f5f0e6";
  const pantsColor = "#3b5fcc";
  const shoeColor = "#f2d33b";

  const legH = crouching ? 6 : 14;
  const bodyH = crouching ? 10 : 16;
  const bodyW = 18;
  const legW = 6;
  const legGap = 3;

  const bodyTopY = groundY - legH - bodyH;
  const headSize = 13;
  const headTopY = bodyTopY - headSize;

  const sideways = direction === "left" || direction === "right";
  let leftLegOffset = 0, rightLegOffset = 0;
  let leftLegH = legH, rightLegH = legH;

  if (!crouching) {
    if (sideways) {
      const dirSign = direction === "right" ? 1 : -1;
      const stride = 5;
      const swing = walkFrame === 0 ? stride : -stride;
      leftLegOffset = dirSign * swing;
      rightLegOffset = -leftLegOffset;
      leftLegH = leftLegOffset * dirSign > 0 ? legH * 0.7 : legH;
      rightLegH = rightLegOffset * dirSign > 0 ? legH * 0.7 : legH;
    } else {
      const offsetAmount = 3;
      if (walkFrame === 0) leftLegOffset = -offsetAmount;
      else rightLegOffset = -offsetAmount;
    }
  }

  const shoeH = 4;

  // 다리
  if (sideways) {
    pixelBlock(ctx, cx - legGap / 2 - legW + leftLegOffset, bodyTopY + bodyH, legW, leftLegH, pantsColor);
    pixelBlock(ctx, cx + legGap / 2 + rightLegOffset, bodyTopY + bodyH, legW, rightLegH, pantsColor);
  } else {
    pixelBlock(ctx, cx - legGap / 2 - legW, bodyTopY + bodyH + leftLegOffset, legW, legH, pantsColor);
    pixelBlock(ctx, cx + legGap / 2, bodyTopY + bodyH + rightLegOffset, legW, legH, pantsColor);
  }
  // 신발
  if (sideways) {
    pixelBlock(ctx, cx - legGap / 2 - legW + leftLegOffset, bodyTopY + bodyH + leftLegH - shoeH, legW, shoeH, shoeColor);
    pixelBlock(ctx, cx + legGap / 2 + rightLegOffset, bodyTopY + bodyH + rightLegH - shoeH, legW, shoeH, shoeColor);
  } else {
    pixelBlock(ctx, cx - legGap / 2 - legW, bodyTopY + bodyH + leftLegOffset + legH - shoeH, legW, shoeH, shoeColor);
    pixelBlock(ctx, cx + legGap / 2, bodyTopY + bodyH + rightLegOffset + legH - shoeH, legW, shoeH, shoeColor);
  }

  // 몸통: 빨강-하양 가로 줄무늬
  pixelBlock(ctx, cx - bodyW / 2, bodyTopY, bodyW, bodyH, shirtWhite);
  const stripeH = bodyH / 4;
  pixelBlock(ctx, cx - bodyW / 2, bodyTopY, bodyW, stripeH, shirtRed, { outline: false });
  pixelBlock(ctx, cx - bodyW / 2, bodyTopY + stripeH * 2, bodyW, stripeH, shirtRed, { outline: false });

  // 팔 (활공 중일 때만): 양쪽으로 펼쳐서 글라이더처럼 보이게 함. 진행 방향 쪽 팔은 살짝 아래로,
  // 반대쪽 팔은 살짝 위로 비대칭으로 둬서 앞으로 미끄러지듯 나아가는 역동적인 느낌을 줌
  if (gliding) {
    const dirSign = direction === "left" ? -1 : 1;
    const armW = 9, armH = 5;
    const shoulderY = bodyTopY + 2;
    pixelBlock(ctx, cx - dirSign * (bodyW / 2 + armW - 2), shoulderY - 3, armW, armH, skinColor);
    pixelBlock(ctx, cx + dirSign * (bodyW / 2 + armW - 2), shoulderY + 3, armW, armH, skinColor);
  }

  // 머리
  pixelBlock(ctx, cx - headSize / 2, headTopY, headSize, headSize, skinColor);
  if (direction === "up") {
    pixelBlock(ctx, cx - headSize / 2, headTopY, headSize, headSize, hairColor);
  } else {
    pixelBlock(ctx, cx - headSize / 2, headTopY, headSize, headSize * 0.5, hairColor, { outline: false });
    // 눈 (도트 한 칸)
    ctx.fillStyle = "#2a1f14";
    const eyeX = direction === "left" ? cx - 4 : direction === "right" ? cx + 2 : cx - 1;
    ctx.fillRect(eyeX, headTopY + headSize * 0.6, PX, PX);
  }
}

// 도감(컬렉션 북)에 쓰는 아이템 아이콘. (x,y)는 36x36 크기 아이콘이 들어갈 영역의 왼쪽 위 모서리.
// 아직 못 찾은 아이템은 회색 물음표 박스로, 찾은 아이템은 종류별로 알아볼 수 있는 모양을 그림.
function drawItemIcon(ctx, id, x, y) {
  if (!id) {
    pixelBlock(ctx, x + 4, y + 4, 28, 28, "#cfc6ae", { outline: false });
    ctx.fillStyle = "#8a7d62";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("?", x + 18, y + 19);
    return;
  }

  switch (id) {
    case "trowel": // 흙묻은 모종삽
      pixelBlock(ctx, x + 15, y + 4, 5, 16, "#6b4423", { outline: false });
      // 삽날: 위는 둥글고 아래로 갈수록 좁아져 끝이 뾰족한 모양
      ctx.beginPath();
      ctx.moveTo(x + 8, y + 17);
      ctx.quadraticCurveTo(x + 17, y + 12, x + 26, y + 17);
      ctx.lineTo(x + 17, y + 34);
      ctx.closePath();
      ctx.fillStyle = "#9a958a";
      ctx.fill();
      ctx.strokeStyle = "#5a5650";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "#6b4423";
      ctx.fillRect(x + 12, y + 22, PX, PX);
      ctx.fillRect(x + 20, y + 26, PX, PX);
      break;
    case "tricycle": // 녹슨 세발자전거
      pixelCircle(ctx, x + 10, y + 28, 6, "#3a3a3a", { outline: false });
      pixelCircle(ctx, x + 26, y + 28, 6, "#3a3a3a", { outline: false });
      pixelBlock(ctx, x + 9, y + 18, 18, 4, "#8a3b2e", { outline: false });
      pixelBlock(ctx, x + 16, y + 8, 4, 12, "#8a3b2e", { outline: false });
      break;
    case "jarlid": // 깨진 장독 뚜껑
      pixelCircle(ctx, x + 16, y + 16, 11, "#9a6a4a");
      pixelBlock(ctx, x + 8, y + 28, 4, 4, "#9a6a4a", { outline: false });
      pixelBlock(ctx, x + 26, y + 30, 4, 3, "#9a6a4a", { outline: false });
      break;
    case "basket": // 녹슨 철제 바구니
      pixelBlock(ctx, x + 8, y + 8, 16, 4, "#6a6a5a", { outline: false });
      pixelBlock(ctx, x + 6, y + 14, 22, 16, "#9a958a");
      ctx.fillStyle = "#6a6a5a";
      for (let gx = x + 10; gx < x + 26; gx += 6) ctx.fillRect(gx, y + 14, PX, 16);
      break;
    case "strawhat": // 흙투성이 밀짚모자
      pixelCircle(ctx, x + 18, y + 24, 15, "#caa873", { outline: false });
      pixelBlock(ctx, x + 11, y + 9, 14, 11, "#b8965a");
      pixelBlock(ctx, x + 11, y + 17, 14, 3, "#6b4423", { outline: false });
      break;
    case "busmap": // 뜯어진 노선도
      pixelBlock(ctx, x + 6, y + 7, 24, 22, "#e8e3d0");
      ctx.strokeStyle = "#3b6fa0";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 10, y + 24);
      ctx.lineTo(x + 16, y + 14);
      ctx.lineTo(x + 22, y + 20);
      ctx.lineTo(x + 27, y + 12);
      ctx.stroke();
      pixelBlock(ctx, x + 26, y + 25, 5, 4, "#e8e3d0", { outline: false }); // 찢어진 모서리
      break;
    case "janggi": // 낡은 장기판
      pixelBlock(ctx, x + 5, y + 6, 26, 24, "#cbb98a");
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      for (let gx = x + 9; gx < x + 29; gx += 5) { ctx.beginPath(); ctx.moveTo(gx, y + 8); ctx.lineTo(gx, y + 28); ctx.stroke(); }
      for (let gy = y + 9; gy < y + 29; gy += 5) { ctx.beginPath(); ctx.moveTo(x + 7, gy); ctx.lineTo(x + 29, gy); ctx.stroke(); }
      pixelCircle(ctx, x + 13, y + 13, 3, "#8a3b2e", { outline: false });
      pixelCircle(ctx, x + 24, y + 23, 3, "#2a2a2a", { outline: false });
      break;
    case "fan": // 분리된 선풍기 조각
      pixelCircle(ctx, x + 18, y + 9, 6, "#cfe0e6", { outline: false });
      pixelCircle(ctx, x + 9, y + 26, 6, "#cfe0e6", { outline: false });
      pixelCircle(ctx, x + 27, y + 26, 6, "#cfe0e6", { outline: false });
      pixelCircle(ctx, x + 18, y + 19, 4, "#9a958a", { outline: false });
      break;
    case "chestnut": // 다 까진 밤송이
      pixelCircle(ctx, x + 12, y + 18, 9, "#6b5a3a", { outline: false });
      ctx.fillStyle = "#4a3f28";
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
        ctx.fillRect(x + 12 + Math.cos(a) * 10, y + 18 + Math.sin(a) * 10, PX, PX);
      }
      pixelCircle(ctx, x + 26, y + 24, 7, "#8a3b2e", { outline: false });
      break;
    case "watermelon": // 수박 조각
      pixelCircle(ctx, x + 18, y + 20, 14, "#3f7a3a", { outline: false });
      pixelCircle(ctx, x + 18, y + 20, 10, "#c9453f", { outline: false });
      ctx.fillStyle = "#2a1f14";
      ctx.fillRect(x + 15, y + 18, PX, PX);
      ctx.fillRect(x + 20, y + 22, PX, PX);
      ctx.fillRect(x + 17, y + 25, PX, PX);
      break;
    case "rice": // 벼 조각
      for (let i = 0; i < 6; i++) {
        pixelCircle(ctx, x + 10 + (i % 3) * 8, y + 14 + Math.floor(i / 3) * 10, 3, "#d9c98a", { outline: false });
      }
      break;
    case "bikebell": // 녹슨 자전거 벨
      pixelCircle(ctx, x + 16, y + 18, 11, "#8a8a7a");
      pixelBlock(ctx, x + 26, y + 22, 6, 3, "#6a6a5a", { outline: false });
      break;
    case "photo": // 물에 젖은 가족사진
      pixelBlock(ctx, x + 6, y + 6, 25, 24, "#e8e3d0");
      pixelBlock(ctx, x + 9, y + 9, 19, 18, "#9ec9e0", { outline: false });
      pixelCircle(ctx, x + 14, y + 21, 3, "#6b4f3a", { outline: false });
      pixelCircle(ctx, x + 19, y + 19, 3, "#6b4f3a", { outline: false });
      pixelCircle(ctx, x + 24, y + 21, 3, "#6b4f3a", { outline: false });
      break;
    default:
      pixelBlock(ctx, x + 6, y + 6, 24, 24, "#b0aa9c", { outline: false });
  }
}

// --- 아래는 섬 디펜스 게임(고양이 + 대포 + 게 + 바다괴물) 전용 위에서 본(탑다운) 그림들 ---

// 대포를 조작하는 고양이. 회전 없이 항상 대포 뒤에 서 있는 모습으로 그림.
// 둥근 귀 대신 삼각형 귀 + 호피무늬 줄무늬 + 수염 + 코를 더해서 멀리서도 "고양이"로 알아보기 쉽게 함.
function drawCatOperator(ctx, cx, cy) {
  const fur = "#e8a33d";
  const furDark = shadeColor(fur, -18);
  const furLight = shadeColor(fur, 20);

  // 꼬리: 몸 뒤에서 살짝 말려 올라간 모양(원 두 개를 이어 붙임)
  pixelCircle(ctx, cx - 11, cy + 11, 4, furDark, { outline: false });
  pixelCircle(ctx, cx - 9, cy + 7, 4, fur, { outline: false });

  // 몸
  pixelCircle(ctx, cx, cy + 2, 13, fur);

  // 호피무늬(등에 줄무늬 몇 개)
  ctx.fillStyle = furDark;
  ctx.fillRect(cx - 9, cy - 1, 5, 2);
  ctx.fillRect(cx + 4, cy - 1, 5, 2);
  ctx.fillRect(cx - 6, cy + 7, 4, 2);

  // 귀(삼각형 + 안쪽 분홍 귀)
  ctx.fillStyle = furDark;
  ctx.beginPath();
  ctx.moveTo(cx - 11, cy - 6);
  ctx.lineTo(cx - 6, cy - 17);
  ctx.lineTo(cx - 2, cy - 6);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 11, cy - 6);
  ctx.lineTo(cx + 6, cy - 17);
  ctx.lineTo(cx + 2, cy - 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#f3b9c2";
  ctx.beginPath();
  ctx.moveTo(cx - 9, cy - 8);
  ctx.lineTo(cx - 6.5, cy - 14);
  ctx.lineTo(cx - 4, cy - 8);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 9, cy - 8);
  ctx.lineTo(cx + 6.5, cy - 14);
  ctx.lineTo(cx + 4, cy - 8);
  ctx.closePath();
  ctx.fill();

  // 얼굴 하이라이트(이마 쪽을 살짝 밝게)
  pixelCircle(ctx, cx, cy - 2, 7, furLight, { outline: false });

  // 눈 + 코 + 수염
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(cx - 5, cy - 1, 2, 3);
  ctx.fillRect(cx + 3, cy - 1, 2, 3);
  ctx.fillStyle = "#c96a6a";
  ctx.fillRect(cx - 1, cy + 3, 2, 2);

  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 1;
  for (const side of [-1, 1]) {
    for (const dy of [-1, 1, 3]) {
      ctx.beginPath();
      ctx.moveTo(cx + side * 5, cy + 2 + dy * 0.5);
      ctx.lineTo(cx + side * 12, cy + dy);
      ctx.stroke();
    }
  }
}

// 대포: 받침(원)과 조준 방향으로 회전하는 포신(사각형)을 따로 그림.
// level(업그레이드 단계, 기본 1)이 올라갈수록 포신이 살짝 커지고 보강 띠(리벳)와
// 청동색 톤이 늘어나서, 업그레이드를 안 해도 "지금 얼마나 강한 대포인지" 한눈에 보이게 함.
function drawCannon(ctx, cx, cy, angle, muzzleFlash, level = 1) {
  pixelCircle(ctx, cx, cy, 20, "#6b6b6b"); // 받침대
  pixelCircle(ctx, cx, cy, 11, "#4a4a4a"); // 회전축
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  const len = 34 + Math.min(level - 1, 4) * 2, w = 13 + Math.min(level - 1, 4);
  const barrelColor = level <= 1 ? "#333" : shadeColor("#6b4a2a", Math.min(level - 1, 4) * -4);
  ctx.fillStyle = barrelColor;
  ctx.fillRect(0, -w / 2, len, w);
  ctx.fillStyle = level <= 1 ? "#555" : "#a87b4a";
  ctx.fillRect(0, -w / 2, len, 3); // 위쪽 하이라이트 줄
  // 업그레이드 단계마다 보강 띠(리벳)를 하나씩 추가
  ctx.fillStyle = "#d9a23b";
  for (let i = 0; i < Math.min(level - 1, 4); i++) {
    const bx = len * (0.3 + i * 0.16);
    ctx.fillRect(bx, -w / 2 - 1, 2, w + 2);
    ctx.beginPath();
    ctx.arc(bx + 1, -w / 2 - 1, 1.6, 0, Math.PI * 2);
    ctx.arc(bx + 1, w / 2 + 1, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#1c1c1c";
  ctx.fillRect(len - 5, -w / 2, 5, w); // 포구
  if (muzzleFlash) {
    ctx.fillStyle = "#ffd35c";
    ctx.beginPath();
    ctx.arc(len + 4, 0, 8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// 포탄(작은 점). 날아가는 동안 단순한 원으로 충분함.
function drawCannonball(ctx, cx, cy) {
  pixelCircle(ctx, cx, cy, 5, "#222", { outline: false });
}

// 석탄을 나르는 게. 줄지어 이동할 때 여러 마리가 같이 그려져도 가볍도록 단순한 모양으로 구성.
function drawCrab(ctx, cx, cy, carryingCoal) {
  pixelCircle(ctx, cx, cy, 9, "#c0392b"); // 몸
  pixelCircle(ctx, cx - 10, cy - 3, 4, "#c0392b", { outline: false }); // 왼쪽 집게
  pixelCircle(ctx, cx + 10, cy - 3, 4, "#c0392b", { outline: false }); // 오른쪽 집게
  pixelBlock(ctx, cx - 8, cy + 6, 4, 4, "#8e2418", { outline: false }); // 다리
  pixelBlock(ctx, cx + 4, cy + 6, 4, 4, "#8e2418", { outline: false });
  if (carryingCoal) {
    pixelBlock(ctx, cx - 4, cy - 8, 8, 6, "#1a1a1a", { outline: false }); // 등에 진 석탄
  }
}

// 위에서 본 캐릭터(고양이/게/괴물) 발밑에 깔리는 타원 그림자. 공중에 떠 있지 않고
// 바닥(풀밭·모래·바다)에 붙어 있는 느낌을 줌.
function topDownShadow(ctx, cx, cy, rx, ry) {
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

// 절벽 위쪽에 뚫린 석탄 동굴 입구. 바위 아치 + 안쪽 어둠 + 반짝이는 석탄 알갱이로 구성.
function drawCaveMouth(ctx, cx, topY, halfWidth, depth) {
  const rockColor = "#5a5048";
  const mortar = shadeColor(rockColor, -35);
  pixelBlock(ctx, cx - halfWidth, topY, halfWidth * 2, depth, rockColor);

  // 쌓은 돌블록 무늬(가로줄마다 어긋나게 배치된 사각 블록 + 모르타르 선)로 그냥 바위가 아니라
  // "사람이 다듬어 쌓은 동굴 입구"처럼 보이게 함
  const blockH = 11;
  for (let row = 0; row * blockH < depth; row++) {
    const y = topY + row * blockH;
    const offset = row % 2 === 0 ? 0 : 14;
    ctx.fillStyle = mortar;
    ctx.fillRect(cx - halfWidth, y, halfWidth * 2, 1.5);
    for (let bx = cx - halfWidth - offset; bx < cx + halfWidth - 26; bx += 28) {
      if (bx + 26 < cx - halfWidth) continue;
      ctx.fillRect(bx + 26, y, 2, blockH);
    }
  }

  // 입구(반원 모양 어둠) - 안쪽으로 갈수록 더 어두워지는 느낌을 층으로 표현
  const mouthCx = cx, mouthCy = topY + depth * 0.58, mouthR = halfWidth * 0.42;
  ["#2a2420", "#1a1612", "#0d0b09"].forEach((shade, i) => {
    const r = mouthR * (1 - i * 0.18);
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.moveTo(mouthCx - r, topY + depth);
    ctx.arc(mouthCx, mouthCy, r, Math.PI, 0);
    ctx.lineTo(mouthCx + r, topY + depth);
    ctx.closePath();
    ctx.fill();
  });

  // 입구 양옆을 받치는 나무 기둥 + 위쪽 가로 보(갱도 입구 느낌)
  const postW = 8, postH = depth * 0.62;
  const postX = mouthR + 6;
  [-1, 1].forEach((side) => {
    pixelBlock(ctx, mouthCx + side * postX - postW / 2, topY + depth - postH, postW, postH, "#6b4a30");
  });
  pixelBlock(ctx, mouthCx - postX, topY + depth - postH - 8, postX * 2, 8, "#5a3d27");

  // 기둥에 매달린 랜턴(따뜻한 빛이 도는 등불) 2개
  [-1, 1].forEach((side) => {
    const lx = mouthCx + side * postX, ly = topY + depth - postH + 10;
    ctx.fillStyle = "rgba(255,200,90,0.32)"; // 부드러운 빛 번짐
    ctx.beginPath();
    ctx.arc(lx, ly, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,220,140,0.4)";
    ctx.beginPath();
    ctx.arc(lx, ly, 10, 0, Math.PI * 2);
    ctx.fill();
    pixelBlock(ctx, lx - 4, ly - 5, 8, 10, "#3a3a3a");
    ctx.fillStyle = "#ffd35c";
    ctx.fillRect(lx - 2, ly - 2, 4, 5);
  });

  // 동굴 안쪽에 박힌 석탄(반짝이는 점)
  for (let i = 0; i < 6; i++) {
    const px = cx + (hashCell(i, 7) % 100 - 50) * 0.01 * halfWidth * 0.7;
    const py = topY + depth * 0.5 + (hashCell(i, 13) % 100) * 0.01 * depth * 0.4;
    ctx.fillStyle = i % 2 === 0 ? "#ffb347" : "#3a3a3a";
    ctx.fillRect(px, py, 3, 3);
  }

  // 입구 앞 레일 + 석탄을 가득 실은 광차(트롤리)
  const trackY = topY + depth + 2;
  ctx.fillStyle = "#3a3a3a";
  ctx.fillRect(cx - 22, trackY, 44, 3);
  ctx.fillRect(cx - 22, trackY + 7, 44, 3);
  ctx.fillStyle = "#5a3d27";
  for (let tx = -20; tx <= 20; tx += 8) ctx.fillRect(cx + tx, trackY - 1.5, 4, 12);
  drawMineCart(ctx, cx, trackY + 16);

  // 입구 주변 이끼/풀 몇 포기로 자연스러운 느낌 추가
  [[-1.3, 0.3], [1.4, 0.5], [-0.7, 0.9], [0.9, 0.85]].forEach(([dx, dy]) => {
    pixelCircle(ctx, cx + dx * halfWidth, topY + dy * depth, 5, "#4a7a3a", { outline: false });
  });
}

// 석탄을 가득 실은 작은 광차. 동굴 입구 앞에 고정 소품으로 그려서 "석탄을 캐는 곳"임을 보여줌.
function drawMineCart(ctx, cx, cy) {
  pixelBlock(ctx, cx - 16, cy, 32, 16, "#6b4a30"); // 나무 짐받이
  pixelBlock(ctx, cx - 16, cy, 32, 4, "#4a3320"); // 위쪽 테두리
  ctx.fillStyle = "#1f1f1f";
  for (let i = 0; i < 7; i++) {
    const lx = cx - 13 + i * 4.5;
    ctx.beginPath();
    ctx.arc(lx, cy - 1, 4, Math.PI, 0);
    ctx.fill();
  }
  pixelCircle(ctx, cx - 9, cy + 17, 4, "#2a2a2a", { outline: false }); // 바퀴
  pixelCircle(ctx, cx + 9, cy + 17, 4, "#2a2a2a", { outline: false });
}

// 바다괴물(문어/해파리 느낌의 단순한 괴물). t(시간)로 촉수가 흔들리는 애니메이션을 줌.
// opts로 종류별 색/촉수 개수/뾰족한 모양 여부를 바꿔서 같은 함수로 여러 괴물 종을 표현함.
function drawSeaMonster(ctx, cx, cy, r, t, opts = {}) {
  const {
    bodyColor = "#3f5e8c",
    tipColor = "#33486b",
    tentacles = 5,
    spiky = false,
    eyeColor = "#ffd35c",
  } = opts;
  pixelCircle(ctx, cx, cy, r, bodyColor); // 몸
  for (let i = 0; i < tentacles; i++) {
    const baseAngle = (Math.PI * 2 * i) / tentacles;
    const wiggle = Math.sin(t * 0.15 + i) * 0.3;
    const angle = baseAngle + wiggle;
    const tx = cx + Math.cos(angle) * (r + 7);
    const ty = cy + Math.sin(angle) * (r + 7);
    if (spiky) {
      // 뾰족한 가시(돌격형 괴물용): 원 대신 삼각형으로 공격적인 느낌을 줌
      const px = cx + Math.cos(angle) * r, py = cy + Math.sin(angle) * r;
      ctx.fillStyle = tipColor;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(px + Math.cos(angle + 0.4) * 6, py + Math.sin(angle + 0.4) * 6);
      ctx.lineTo(px + Math.cos(angle - 0.4) * 6, py + Math.sin(angle - 0.4) * 6);
      ctx.closePath();
      ctx.fill();
    } else {
      pixelCircle(ctx, tx, ty, 4, tipColor, { outline: false }); // 촉수 끝
    }
  }
  pixelCircle(ctx, cx - r * 0.35, cy - r * 0.1, 3, eyeColor, { outline: false }); // 눈
  pixelCircle(ctx, cx + r * 0.35, cy - r * 0.1, 3, eyeColor, { outline: false });
}
