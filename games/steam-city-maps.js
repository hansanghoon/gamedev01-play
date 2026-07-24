// 멈춘 도시 맵 데이터 — steam-city-editor.html 에서 내보냄
// platforms: [x,y(윗면),폭](발판) / grounds: [x,y,폭,높이](땅) / start:[x,y] / doors:{x,y,to,at} / objects:{type,x,y}
const STEAM_MAPS = {
  room: {
    name: "방", width: 64, height: 40, start: [28,30],
    platforms: [
      [0,30,64]
    ],
    grounds: [
    ],
    doors: [
      { x: 51, y: 30, to: "street", at: [20,34] }
    ],
    objects: [
    ]
  },
  street: {
    name: "거리", width: 320, height: 40, start: [10,32],
    platforms: [
      [288,34,32], [172,13,2]
    ],
    grounds: [
      [0,34,78,6], [86,27,11,13], [96,27,21,13], [112,14,34,5], [156,26,26,4], [206,29,1,1],
      [184,16,20,3], [170,5,13,6], [208,16,8,24], [231,22,22,4], [219,27,11,3], [240,34,38,6],
      [269,1,14,18], [230,0,8,11], [78,33,8,7], [78,0,8,8]
    ],
    doors: [
      { x: 2, y: 34, to: "room", at: [43,30] },
      { x: 72, y: 34, to: "factory", at: [8,34], down: true },
      { x: 306, y: 34, to: "tower", at: [6,66] }
    ],
    objects: [
      {"type":"merchant","x":50,"y":34},
      {"type":"memory","x":38,"y":34,"text":"여기서 처음 만났어. 비 오던 날이었지."}
    ]
  },
  factory: {
    name: "지하 공장", width: 130, height: 40, start: [8,34],
    platforms: [
      [0,34,130], [24,27,16], [50,28,14], [80,26,16], [104,29,14]
    ],
    grounds: [
    ],
    doors: [
      { x: 6, y: 34, to: "street", at: [72,34] },
      { x: 124, y: 34, to: "tower", at: [40,66] },
      { x: 64, y: 34, to: "canal", at: [8,30], down: true }
    ],
    objects: [
      {"type":"lamp","x":14,"y":34},
      {"type":"lamp","x":66,"y":34},
      {"type":"lamp","x":118,"y":34},
      {"type":"vent","x":36,"y":34},
      {"type":"vent","x":92,"y":34},
      {"type":"gear","x":32,"y":20},
      {"type":"gear","x":100,"y":18},
      {"type":"enemy","x":30,"y":34},
      {"type":"enemy","x":44,"y":34},
      {"type":"enemy","x":64,"y":34},
      {"type":"enemy","x":84,"y":34},
      {"type":"enemy","x":112,"y":34},
      {"type":"charger","x":98,"y":34}
    ]
  },
  tower: {
    name: "탑", width: 64, height: 72, start: [6,66],
    platforms: [
      [0,66,64], [8,60,14], [34,54,14], [10,48,14], [34,42,14], [22,37,20],
      [20,4,24], [44,4,20]
    ],
    grounds: [
    ],
    doors: [
      { x: 1, y: 66, to: "street", at: [297,34] },
      { x: 62, y: 3, to: "map2", at: [8,30] },
      { x: 58, y: 66, to: "factory", at: [110,34] }
    ],
    objects: [
      {"type":"vent","x":60,"y":66},
      {"type":"vent","x":20,"y":60}
    ]
  },
  map2: {
    name: "증기 골목", width: 176, height: 48, start: [8,30],
    platforms: [
      [70,26,18],
      [30,19,12], [52,12,12], [30,5,36],
      [150,22,16], [150,14,14]
    ],
    grounds: [
      [0,30,176,18]
    ],
    doors: [
      { x: 4, y: 30, to: "tower", at: [48,4] },
      { x: 170, y: 30, to: "map3", at: [8,118] }
    ],
    objects: [
      {"type":"vent","x":28,"y":30},
      {"type":"vent","x":93,"y":30},
      {"type":"lamp","x":77,"y":30},
      {"type":"lamp","x":36,"y":30},
      {"type":"gear","x":74,"y":15},
      {"type":"gear","x":80,"y":11},
      {"type":"enemy","x":48,"y":30},
      {"type":"enemy","x":108,"y":30},
      {"type":"enemy","x":134,"y":30},
      {"type":"enemy","x":156,"y":14},
      {"type":"wall","x":48,"y":5,"w":3,"h":18,"hp":3},
      {"type":"heart","x":57,"y":5},
      {"type":"memory","x":60,"y":30,"text":"여기서 처음으로 크게 다퉜지. 증기 소리가 우리 목소리를 삼켜버렸으면 했어."}
    ]
  },
  map3: {
    name: "큰 굴뚝", width: 50, height: 128, start: [8,118],
    platforms: [
      [0,118,50], [26,109,18], [4,99,20], [27,89,23], [4,79,18], [28,69,19],
      [4,59,20], [28,49,20], [4,39,21], [29,29,21], [3,19,21], [30,9,17]
    ],
    grounds: [
    ],
    doors: [
      { x: 2, y: 118, to: "map2", at: [118,30] },
      { x: 44, y: 9, to: "summit", at: [8,30] }
    ],
    objects: [
      {"type":"lamp","x":40,"y":118},
      {"type":"memory","x":10,"y":59,"text":"꼭대기까지 같이 오르자고 약속했었는데. 지금은 나 혼자 오르고 있어."},
      {"type":"heart","x":12,"y":15}
    ]
  },
  summit: {
    name: "탑 꼭대기", width: 96, height: 40, start: [8,30],
    platforms: [
      [0,30,96]
    ],
    grounds: [
    ],
    doors: [
      { x: 4, y: 30, to: "map3", at: [38,9] }
    ],
    objects: [
      {"type":"boss","x":56,"y":30},
      {"type":"memory","x":82,"y":30,"text":"네가 제일 좋아하던 풍경이야. …잘 지내. 나도, 잘 지낼게.","final":true}
    ]
  },
  canal: {
    name: "물든 수로", width: 120, height: 40, start: [8,30],
    platforms: [
      [40,24,10], [64,22,10]
    ],
    grounds: [
      [0,30,120,10], [0,0,2,30], [118,0,2,30], [88,0,10,23]
    ],
    doors: [
      { x: 4, y: 30, to: "factory", at: [56,34] }
    ],
    objects: [
      {"type":"lamp","x":20,"y":30},
      {"type":"vent","x":50,"y":30},
      {"type":"wall","x":60,"y":30,"w":3,"h":30,"hp":3},
      {"type":"lamp","x":78,"y":30},
      {"type":"heart","x":108,"y":30}
    ]
  }
};
