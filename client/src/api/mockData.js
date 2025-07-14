// src/api/mockData.js

export const mockScenarios = [
  { id: 1, title: "사라진 다이아몬드 (Mock Data)" },
  { id: 2, title: "저택의 유령 (Mock Data)" },
  { id: 3, title: "열차 살인 사건 (Mock Data)" },
];

// 방 데이터
export const mockRooms = [
  {
    id: 1,
    name: "메인 홀",
    description: "웅장한 저택의 메인 홀. 거대한 샹들리에가 걸려있다.",
    backgroundImageUrl: null, // 기본 배경 사용
    scenarioId: 1,
  },
  {
    id: 2,
    name: "도서관",
    description: "고풍스러운 도서관. 수많은 책들이 빼곡히 꽂혀있다.",
    backgroundImageUrl: null, // 기본 배경 사용
    scenarioId: 1,
  },
];

// 상호작용 객체 데이터
export const mockInteractiveObjects = [
  // 메인 홀 (roomId: 1)
  {
    id: 1,
    name: "집사",
    type: "npc",
    description: "저택의 집사. 무언가 숨기고 있는 것 같다.",
    x: "20%",
    y: "60%",
    width: "80px",
    height: "80px",
    icon: "👤",
    isClickable: true,
    isVisible: true,
    data: JSON.stringify({ dialogue: "어서오세요, 주인님..." }),
    roomId: 1,
  },
  {
    id: 2,
    name: "다이아몬드 진열장",
    type: "evidence",
    description: "비어있는 다이아몬드 진열장. 유리가 깨져있다.",
    x: "70%",
    y: "40%",
    width: "60px",
    height: "60px",
    icon: "💎",
    isClickable: true,
    isVisible: true,
    data: JSON.stringify({ clue: "유리 파편에 지문이 남아있다." }),
    roomId: 1,
  },
  {
    id: 3,
    name: "피의 흔적",
    type: "clue",
    description: "바닥에 떨어진 작은 핏자국",
    x: "50%",
    y: "30%",
    width: "40px",
    height: "40px",
    icon: "🔍",
    isClickable: true,
    isVisible: true,
    data: JSON.stringify({ clue: "누군가 다쳤을 가능성이 있다." }),
    roomId: 1,
  },
  {
    id: 4,
    name: "도서관 문",
    type: "door",
    description: "도서관으로 통하는 문",
    x: "90%",
    y: "50%",
    width: "70px",
    height: "100px",
    icon: "🚪",
    isClickable: true,
    isVisible: true,
    data: JSON.stringify({ targetRoomId: 2 }),
    roomId: 1,
  },
  {
    id: 5,
    name: "열쇠",
    type: "item",
    description: "작은 황동 열쇠",
    x: "30%",
    y: "80%",
    width: "30px",
    height: "30px",
    icon: "🔑",
    isClickable: true,
    isVisible: true,
    data: JSON.stringify({ itemId: "brass_key", description: "무언가를 열 수 있을 것 같다." }),
    roomId: 1,
  },
  
  // 도서관 (roomId: 2)
  {
    id: 6,
    name: "고서",
    type: "book",
    description: "먼지가 쌓인 고서",
    x: "25%",
    y: "45%",
    width: "50px",
    height: "50px",
    icon: "📖",
    isClickable: true,
    isVisible: true,
    data: JSON.stringify({ content: "저택의 역사에 대한 기록이 적혀있다." }),
    roomId: 2,
  },
  {
    id: 7,
    name: "메모장",
    type: "notepad",
    description: "누군가의 메모장",
    x: "60%",
    y: "35%",
    width: "45px",
    height: "45px",
    icon: "📝",
    isClickable: true,
    isVisible: true,
    data: JSON.stringify({ content: "다이아몬드의 위치에 대한 단서가 적혀있다." }),
    roomId: 2,
  },
  {
    id: 8,
    name: "메인 홀 문",
    type: "door",
    description: "메인 홀로 돌아가는 문",
    x: "10%",
    y: "50%",
    width: "70px",
    height: "100px",
    icon: "🚪",
    isClickable: true,
    isVisible: true,
    data: JSON.stringify({ targetRoomId: 1 }),
    roomId: 2,
  },
];

// NPC 데이터
export const mockNpcs = [
  {
    id: 1,
    name: "집사 윌리엄",
    settingPrompt: "저택의 오래된 집사. 정중하지만 무언가 숨기고 있다.",
    roomId: 1,
  },
  {
    id: 2,
    name: "도서관 사서",
    settingPrompt: "도서관을 관리하는 사서. 책에 대해 해박한 지식을 가지고 있다.",
    roomId: 2,
  },
];