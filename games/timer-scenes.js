// 타이머 앱(timer.html)이 "기다리는 화면"에 그리는 도트 장면들.
// timer.html(실제 앱)과 timer-scene-preview.html(개발용 미리보기)이 같이 쓴다.
// 도트 함수(pixelBlock·pixelCircle·pixelPatternCircle·shadeColor·ditherGround·hashCell·PX)는
// pixel-art.js에서 옴. 도트 규칙: 외곽선 + 3단 명암 + 자연스러운 점박이 텍스처.
//
// 공통: 각 함수는 (ctx, p, t)를 받는다.
//   p = 진행도 0~1 (0=방금 시작, 1=완성)
//   t = 초 단위 시간 (김·바람·모래 흔들림 애니메이션용)
//   캔버스는 240x240 기준.

// ===================================================================
// 🎉 완성 축하 연출 — 타이머가 다 됐을 때 장면 위에 덧그림 (반짝이 + "완성!" 도장)
// ===================================================================
function drawCelebration(ctx, t) {
  // 반짝이 별 (제자리에서 커졌다 작아졌다)
  const stars = [[40, 58], [200, 70], [52, 150], [192, 148], [118, 38], [156, 112], [78, 98]];
  ctx.lineWidth = PX;
  stars.forEach(([sx, sy], i) => {
    const s = 3 + Math.abs(Math.sin(t * 3 + i * 1.3)) * 5;
    ctx.strokeStyle = i % 2 ? '#fff2a8' : '#ffd75e';
    ctx.beginPath();
    ctx.moveTo(sx - s, sy); ctx.lineTo(sx + s, sy);
    ctx.moveTo(sx, sy - s); ctx.lineTo(sx, sy + s);
    ctx.stroke();
  });

  // "완성!" 도장 (살짝 기울여 찍은 느낌 + 통통 튀는 크기)
  const pop = 1 + Math.sin(t * 5) * 0.05;
  ctx.save();
  ctx.translate(120, 92);
  ctx.rotate(-0.17);
  ctx.scale(pop, pop);
  ctx.strokeStyle = '#e8484a';
  ctx.lineWidth = PX * 2;
  ctx.beginPath();
  ctx.arc(0, 0, 36, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#e8484a';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('완성!', 0, 1);
  ctx.restore();
}

// ---- 작은 공용 헬퍼 ----
function softShadow(ctx, cx, cy, rx, ry) {
  ctx.fillStyle = 'rgba(0,0,0,0.26)';
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}
function softGlow(ctx, x, y, r, color) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}
// 점박이 텍스처 여부 (좌표 고정 → 프레임마다 안 반짝임)
function speck(x, y, chance) {
  return hashCell(Math.round(x / PX), Math.round(y / PX)) < chance * 10;
}

// ===================================================================
// 🍜 라면이 끓는 과정 (라면 종류 타이머용)
// ===================================================================
function drawRamenScene(ctx, p, t) {
  const cx = 120;
  softShadow(ctx, cx, 210, 76, 12);

  const cup = '#d5413f';
  const band = '#f3ece0';                 // 컵 가운데 라벨 흰 띠
  const cupEdge = shadeColor(cup, -50);
  const broth = '#c9772e', brothHi = shadeColor(broth, 22), brothSh = shadeColor(broth, -16);
  const noodle = '#f0d24a', noodleSh = shadeColor(noodle, -26);

  const topY = 70, botY = 202;
  const halfAt = (y) => 84 + (56 - 84) * ((y - topY) / (botY - topY));
  const wall = 7;
  const inTop = 84, inBot = 197;
  const fillTopY = inBot - (inBot - inTop) * p;   // 국물 표면 (위로 차오름)
  const bandTop = 128, bandBot = 156;

  // --- 컵 몸통 (한 줄씩: 벽은 3단 명암+점박이, 안은 마른 면/국물) ---
  for (let y = topY; y < botY; y += PX) {
    const ho = halfAt(y), hi = ho - wall;
    for (let x = cx - ho; x < cx + ho; x += PX) {
      const dx = x - cx, ax = Math.abs(dx);
      let color;
      if (ax >= hi) {
        // 컵 벽
        if (ax > ho - PX * 1.5 || y > botY - PX * 2) {
          color = cupEdge;                                 // 외곽선
        } else {
          const inBand = y >= bandTop && y <= bandBot;
          let base = inBand ? band : cup;
          if (dx < -hi * 0.35) base = shadeColor(base, 22);       // 왼쪽 하이라이트
          else if (dx > hi * 0.35) base = shadeColor(base, -18);  // 오른쪽 그림자
          if (!inBand && speck(x, y, 8)) base = shadeColor(base, -9);
          color = base;
        }
      } else if (y >= fillTopY) {
        // 국물
        if (y < fillTopY + PX * 2) color = brothHi;             // 표면 반짝
        else color = speck(x, y, 14) ? brothSh : broth;         // 점박이
      } else {
        color = speck(x, y, 20) ? noodleSh : noodle;            // 마른 면 바탕
      }
      ctx.fillStyle = color;
      ctx.fillRect(x, y, PX, PX);
    }
  }

  // 라벨 띠에 라면 로고 느낌의 빨간 물결선
  ctx.strokeStyle = cup;
  ctx.lineWidth = PX;
  ctx.beginPath();
  for (let x = cx - 40; x <= cx + 40; x += 3) {
    const yy = 142 + Math.sin(x * 0.25) * 3;
    x === cx - 40 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
  }
  ctx.stroke();

  // --- 마른 구역: 꼬불꼬불 면발 텍스처 ---
  ctx.strokeStyle = noodleSh;
  ctx.lineWidth = PX;
  for (let y = inTop + 6; y < fillTopY - 3; y += 7) {
    const hw = halfAt(y) - wall - 4;
    if (hw < 6) continue;
    ctx.beginPath();
    for (let x = cx - hw; x <= cx + hw; x += 3) {
      const w = Math.sin(x * 0.45 + y * 0.5) * 2.4;
      x === cx - hw ? ctx.moveTo(x, y + w) : ctx.lineTo(x, y + w);
    }
    ctx.stroke();
  }

  // --- 국물 표면 면발 (익을수록 잘 보임) ---
  const surfHalf = halfAt(fillTopY) - wall - 3;
  if (p > 0.12 && surfHalf > 6) {
    for (let s = 0; s < 3; s++) {
      ctx.strokeStyle = s === 1 ? shadeColor(noodle, 14) : noodle;
      ctx.lineWidth = PX * 1.4;
      ctx.beginPath();
      for (let x = cx - surfHalf; x <= cx + surfHalf; x += 4) {
        const wave = Math.sin(x * 0.16 + t * 2 + s * 1.7) * 2.4;
        const py = fillTopY + 3 + s * 3 + wave;
        x === cx - surfHalf ? ctx.moveTo(x, py) : ctx.lineTo(x, py);
      }
      ctx.stroke();
    }
  }

  // --- 국물 방울이 보글보글 올라옴 ---
  if (p > 0.1) {
    for (let i = 0; i < 5; i++) {
      const bx = cx + (hashCell(i, 3) % 70 - 35);
      const phase = (t * 0.4 + i * 0.27) % 1;
      const by = inBot - phase * (inBot - fillTopY);
      if (by > fillTopY + 3) pixelCircle(ctx, bx, by, 1.6, brothHi, { outline: false });
    }
  }

  // --- 고명 (거의 다 익으면): 나루토마키 + 반숙계란 + 김 + 파 ---
  if (p > 0.62) {
    const sy = fillTopY + 8;
    pixelBlock(ctx, cx - 2, sy - 22, 12, 22, '#2f4a35');   // 김(뒤에 세움)
    ramenNaruto(ctx, cx - 24, sy, 8);                      // 나루토마키
    ramenEgg(ctx, cx + 22, sy);                            // 반숙 계란
    ctx.fillStyle = '#6ec24a';                             // 파
    [[-6, -3], [10, 2], [-14, 4], [4, 6], [18, -1]].forEach(([ox, oy]) => {
      ctx.fillRect(cx + ox, sy + oy, PX * 2, PX);
    });
  }

  // --- 젓가락 (컵에 걸쳐 놓음) ---
  ramenChopsticks(ctx, cx + 20, topY);

  // --- 김 모락모락 ---
  const steam = 0.35 + p * 0.65;
  ctx.lineWidth = PX * 1.5;
  for (let s = 0; s < 3; s++) {
    ctx.strokeStyle = `rgba(255,255,255,${0.2 * steam})`;
    const baseX = cx + (s - 1) * 26;
    ctx.beginPath();
    const top = 62 - 42 * steam;
    for (let y = 62; y > top; y -= 4) {
      const prog = (62 - y) / 42;
      const wave = Math.sin(y * 0.2 + t * 3 + s * 2) * 9 * prog;
      const px = baseX + wave;
      y === 62 ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
    }
    ctx.stroke();
  }
}

function ramenNaruto(ctx, x, y, r) {
  pixelCircle(ctx, x, y, r, '#f6efe6');
  ctx.strokeStyle = '#e87f9c';
  ctx.lineWidth = PX;
  ctx.beginPath();
  for (let a = 0; a < Math.PI * 3; a += 0.3) {
    const rr = (a / (Math.PI * 3)) * (r - 2);
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
    a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.stroke();
}
function ramenEgg(ctx, x, y) {
  pixelCircle(ctx, x, y, 8, '#fbf4e6');
  pixelCircle(ctx, x, y + 1, 4, '#f2a83a', { outline: false });
  pixelCircle(ctx, x - 1, y, 1.5, '#ffd888', { outline: false });
}
function ramenChopsticks(ctx, x, topY) {
  ctx.save();
  ctx.translate(x, topY - 4);
  ctx.rotate(-0.32);
  for (const off of [0, 8]) {
    ctx.fillStyle = shadeColor('#caa06a', 22);
    ctx.fillRect(off, -78, PX, 118);
    ctx.fillStyle = '#caa06a';
    ctx.fillRect(off + PX, -78, PX, 118);
    ctx.fillStyle = shadeColor('#caa06a', -32);
    ctx.fillRect(off + PX * 2, -78, PX, 118);
  }
  ctx.restore();
}

// ===================================================================
// ⏳ 모래시계 (라면이 아닌 짧은 타이머용)
// ===================================================================
function drawHourglassScene(ctx, p, t) {
  const cx = 120;
  const capTopY = 42, capBotY = 190;   // 위/아래 나무 마개
  const neckTop = 116, neckBot = 122;
  const bulbTop = capTopY + 12, bulbBot = capBotY - 2;
  const maxHalf = 46, neckHalf = 4;
  const glass = '#cfe9ef', glassSh = shadeColor('#cfe9ef', -30);
  const sand = '#e6bb52', sandHi = shadeColor(sand, 20), sandSh = shadeColor(sand, -20);

  // 둥근 유리알 옆폭(가운데가 살짝 볼록)
  const topHalf = (y) => {
    const f = (y - bulbTop) / (neckTop - bulbTop);        // 0(위)~1(목)
    return neckHalf + (maxHalf - neckHalf) * (1 - f) + Math.sin(f * Math.PI) * 6;
  };
  const botHalf = (y) => {
    const f = (y - neckBot) / (bulbBot - neckBot);        // 0(목)~1(아래)
    return neckHalf + (maxHalf - neckHalf) * f + Math.sin(f * Math.PI) * 6;
  };

  const topSurf = bulbTop + (neckTop - bulbTop) * p;      // 위 모래 표면 (내려감)
  const botSurf = bulbBot - (bulbBot - neckBot) * p;      // 아래 모래 표면 (쌓임)

  // --- 위 유리알 ---
  for (let y = bulbTop; y < neckTop; y += PX) {
    const half = topHalf(y);
    const colSurf = topSurf + (half / maxHalf) * 10;       // 가운데가 더 파임(오목)
    for (let x = cx - half; x < cx + half; x += PX) {
      const ax = Math.abs(x - cx);
      let color;
      if (ax > half - PX * 1.4) color = glassSh;                 // 유리 외곽
      else if (x - cx < -half * 0.5) color = '#eaf6f9';          // 왼쪽 반짝
      else if (y >= colSurf) color = sandColor(x, y, sand, sandHi, sandSh, colSurf);
      else color = glass;                                        // 빈 유리
      ctx.fillStyle = color;
      ctx.fillRect(x, y, PX, PX);
    }
  }
  // --- 아래 유리알 ---
  for (let y = neckBot; y < bulbBot; y += PX) {
    const half = botHalf(y);
    const moundTop = botSurf + (1 - half / maxHalf) * 12;   // 가운데가 봉긋(더미)
    for (let x = cx - half; x < cx + half; x += PX) {
      const ax = Math.abs(x - cx);
      let color;
      if (ax > half - PX * 1.4) color = glassSh;
      else if (x - cx < -half * 0.5) color = '#eaf6f9';
      else if (y >= moundTop) color = sandColor(x, y, sand, sandHi, sandSh, moundTop);
      else color = glass;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, PX, PX);
    }
  }

  // --- 떨어지는 모래 줄기 + 반짝임 ---
  if (p > 0.02 && p < 0.999) {
    const jitter = Math.sin(t * 22) * 1.5;
    ctx.fillStyle = sand;
    for (let y = neckTop; y < botSurf; y += PX) {
      ctx.fillRect(cx - PX / 2 + jitter, y, PX, PX);
    }
    ctx.fillStyle = sandHi;
    const sy = neckTop + ((t * 120) % (botSurf - neckTop));
    ctx.fillRect(cx - PX / 2 + jitter, sy, PX, PX);
  }

  // --- 유리 대각선 반사光 ---
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = PX;
  ctx.beginPath(); ctx.moveTo(cx - 30, bulbTop + 8); ctx.lineTo(cx - 12, bulbTop + 40); ctx.stroke();

  // --- 나무 프레임 (마개 + 기둥 + 손잡이 knob) ---
  pixelBlock(ctx, cx - 60, capTopY - 8, 120, 14, '#9a733f');   // 위 마개
  pixelBlock(ctx, cx - 60, capBotY - 4, 120, 14, '#9a733f');   // 아래 마개
  for (const sx of [cx - 54, cx + 46]) {
    pixelBlock(ctx, sx, capTopY + 4, 8, capBotY - capTopY - 6, '#6b4a30'); // 기둥
  }
  for (const [kx, ky] of [[cx - 50, capTopY - 12], [cx + 50, capTopY - 12], [cx - 50, capBotY + 10], [cx + 50, capBotY + 10]]) {
    pixelCircle(ctx, kx, ky, 5, '#b98a4c');                     // 모서리 손잡이
  }
}

// 모래 칸 색 (표면은 밝게, 안쪽은 점박이 텍스처)
function sandColor(x, y, sand, sandHi, sandSh, surfaceY) {
  if (y < surfaceY + PX * 2) return sandHi;
  return speck(x, y, 16) ? sandSh : sand;
}

// ===================================================================
// 🌱 집중의 숲 (50분 이상 타이머용) — 오래 집중할수록 큰 나무로 자람
// ===================================================================
function drawForestScene(ctx, p, t) {
  const cx = 120, groundY = 196;

  // --- 해 + 햇살 ---
  softGlow(ctx, 196, 46, 58, 'rgba(255,224,130,0.30)');
  ctx.strokeStyle = 'rgba(255,220,120,0.55)';
  ctx.lineWidth = PX;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
    const s = 3 + Math.sin(t * 0.9 + a) * 2;
    ctx.beginPath();
    ctx.moveTo(196 + Math.cos(a) * 19, 46 + Math.sin(a) * 19);
    ctx.lineTo(196 + Math.cos(a) * (24 + s), 46 + Math.sin(a) * (24 + s));
    ctx.stroke();
  }
  pixelCircle(ctx, 196, 46, 14, '#ffd24d');

  // --- 땅(잔디 텍스처) + 잔디 날 + 흙 둔덕 ---
  ditherGround(ctx, 0, groundY, 240, 44, '#37692a', '#57a03a', 22);
  ctx.strokeStyle = '#5fae3e';
  ctx.lineWidth = PX;
  for (let x = 6; x < 240; x += 11) {
    const h = 5 + hashCell(x, 1) % 6;
    const bend = Math.sin(t * 1.2 + x) * 1.5;
    ctx.beginPath();
    ctx.moveTo(x, groundY + 6);
    ctx.lineTo(x + 2 + bend, groundY + 6 - h);
    ctx.stroke();
  }
  pixelCircle(ctx, cx, groundY + 12, 34, '#7a5433');
  ctx.fillStyle = shadeColor('#7a5433', -18);
  for (let i = 0; i < 14; i++) {
    ctx.fillRect(cx - 28 + hashCell(i, 5) % 56, groundY + 2 + hashCell(i, 9) % 10, PX, PX);
  }

  // --- 나무 줄기 (뿌리 플레어 + 나무껍질 질감, 자랄수록 길고 굵어짐) ---
  const trunkH = 12 + p * 100;
  const baseW = 10 + p * 14, topW = 6 + p * 6;
  const trunkTopY = groundY - trunkH;
  for (let y = trunkTopY; y < groundY; y += PX) {
    const f = (y - trunkTopY) / trunkH;
    let hw = (topW + (baseW - topW) * f) / 2;
    if (f > 0.86) hw += (f - 0.86) * 70;                     // 밑동에서 뿌리처럼 벌어짐
    for (let x = cx - hw; x < cx + hw; x += PX) {
      const dx = x - cx;
      let c = '#7a5230';
      if (Math.abs(dx) > hw - PX * 1.3) c = shadeColor(c, -45);   // 외곽선
      else if (dx < -hw * 0.3) c = shadeColor(c, 16);            // 왼쪽 밝게
      else if (dx > hw * 0.3) c = shadeColor(c, -12);           // 오른쪽 그늘
      if (speck(x, y, 8)) c = shadeColor(c, -14);               // 껍질 결
      ctx.fillStyle = c;
      ctx.fillRect(x, y, PX, PX);
    }
  }

  // --- 잎(수관): 겹겹이 텍스처 있는 덩어리로 입체감 (덩어리 수를 줄여 가볍게) ---
  const sway = Math.sin(t * 1.4) * 4 * p;
  const R = 12 + p * 38;
  const ccy = trunkTopY + R * 0.15;
  // 뒤(어두움) → 앞(밝음) 순서
  const clumps = [
    [-R * 0.62, -R * 0.05, 0.72, '#357f2c'],
    [R * 0.62, -R * 0.05, 0.72, '#469638'],
    [0, -R * 0.55, 0.92, '#3c8a31'],
    [0, -R * 0.08, 0.70, '#3f8f34'],
  ];
  clumps.forEach(([ox, oy, sc, col]) => {
    pixelPatternCircle(ctx, cx + ox + sway, ccy + oy, R * sc, () => col, { speckle: 11 });
  });
  // 위쪽 햇빛 받는 밝은 잎
  pixelPatternCircle(ctx, cx - R * 0.25 + sway, ccy - R * 0.55, R * 0.4, () => '#67bd4a', { speckle: 13 });

  // --- 열매 (자라면 열림) ---
  if (p > 0.6) {
    [[-R * 0.5, -R * 0.1], [R * 0.55, R * 0.05], [0, -R * 0.55], [-R * 0.2, R * 0.4], [R * 0.28, -R * 0.35]]
      .forEach(([ox, oy]) => {
        const fx = cx + ox + sway, fy = ccy + oy;
        pixelCircle(ctx, fx, fy, 3.4, '#e8484a', { outline: false });
        ctx.fillStyle = '#ffd3d0';
        ctx.fillRect(fx - 2, fy - 2, PX, PX);              // 하이라이트 점
      });
  }

  // --- 다 자라면 잎이 살랑살랑 떨어짐 ---
  if (p > 0.85) {
    ctx.fillStyle = '#5fae3e';
    for (let i = 0; i < 5; i++) {
      const phase = (t * 0.3 + i * 0.2) % 1;
      const lx = cx + (hashCell(i, 2) % 100 - 50) + Math.sin(t * 2 + i) * 8;
      const ly = ccy + phase * (groundY - ccy);
      ctx.fillRect(lx, ly, PX * 2, PX);
    }
  }
}
