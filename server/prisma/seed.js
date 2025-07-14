// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {

  console.log('🗑️  Deleting previous data...');
  // 관계 순서에 맞게 삭제
  await prisma.chatLog.deleteMany({});
  await prisma.playthrough.deleteMany({});
  await prisma.interactiveObject.deleteMany({});
  await prisma.npc.deleteMany({});
  await prisma.ending.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.scenario.deleteMany({});
  console.log('✅ Previous data deleted.');

  console.log('✨ Creating new data...');

  // 시나리오 1: "KAIST, 마지막 커밋" 생성
  const scenario1 = await prisma.scenario.create({
    data: {
      title: 'KAIST, 마지막 커밋',
      imageUrl: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?q=80&w=2070',
      settingPrompt:
        "당신은 '솔브&컴퍼니' 소속의 사립 탐정입니다. \n" +
        '과거 경찰이었으나, 경직된 조직 문화에 회의를 느끼고 독립했습니다. \n' +
        "당신은 특히 '디지털 증거' 분석에 강점을 보이며, 복잡하게 얽힌 사건의 진실을 파헤치는 것으로 업계에 정평이 나 있습니다.\n\n" +
        "이번 의뢰는 KAIST에서 발생한 학생 사망 사건. 경찰은 '과로로 인한 돌연사'로 잠정 결론 내렸지만, 유족은 강력하게 타살을 주장하고 있습니다. \n" +
        '당신은 유족의 공식 대리인 자격으로, 진실을 밝히기 위해 몰입캠프에 파견되었습니다.\n\n' +
        '당신의 목표는 캠프 관계자 및 학생들을 심문하고, 경찰이 놓쳤거나 의도적으로 외면한 진실을 밝혀내는 것입니다. \n' +
        '용의자들은 대한민국 최고의 IT 영재들이며, 그들의 논리와 지식은 당신의 수사를 방해하는 벽이 될 수도, 혹은 사건을 해결하는 열쇠가 될 수도 있습니다. \n' +
        '냉철한 관찰과 날카로운 질문으로 그들의 방어막을 뚫고 진실을 밝혀내십시오.',
      backgroundScript:
        '[사건 파일: KAIST-2025-07-14]\n' +
        '---\n' +
        '의뢰인: 이정훈, 이수진 (피해자 이준서의 부모)\n\n' +
        "사건 개요: 2025년 7월 14일 새벽 3시 42분경, KAIST 크래프트관 2층 실습실에서 '몰입캠프' 참가자 이준서(남, 21세)가 자신의 좌석에서 의식 불명 상태로 발견됨. 최초 발견자는 같은 팀 팀원 박세영. 구급대 도착 시 사망 판정.\n\n" +
        '경찰 초동 수사 결과:\n' +
        '- 사망 추정 시각: 7월 14일 새벽 2시 ~ 3시 사이.\n' +
        '- 직접 사인: 급성 심근경색으로 인한 심장마비 (잠정). 현장에서 다량의 에너지 드링크와 카페인 음료가 발견되어, 과도한 스트레스 및 수면 부족으로 인한 돌연사 가능성에 무게를 둠.\n' +
        '- 외상: 목 주변에 희미한 삭흔(눌린 자국)이 발견되었으나, 경찰은 피해자가 목걸이나 후드티 끈에 의해 눌린 자국일 가능성이 높다고 판단. 타살 혐의점을 찾기 어렵다고 보고함.\n' +
        "- 특이사항: 피해자의 노트북 화면에 `Build failed. Error code: 137` 메시지가 떠 있었음. 이는 '메모리 부족'으로 인한 컴파일 실패를 의미.\n\n" +
        '의뢰인의 주장 및 요청:\n' +
        "\"우리 아들은 어릴 때부터 심장이 누구보다 튼튼한 아이였습니다. 단순 과로사라는 경찰의 말을 믿을 수 없습니다. 아들이 캠프에서 누군가와 심하게 다퉜다는 이야기를 친구에게 들었습니다. 부디, 탐정님께서 진실을 밝혀주십시오. 저희가 가진 모든 것을 걸겠습니다.\"\n" +
        '---\n' +
        '조사 목표: KAIST 측의 협조를 얻어 캠프에 출입. 공식적인 조사 권한으로 용의자들을 심문하고 증거를 수집하여 사건의 진실을 밝힐 것.',
    },
  });
  console.log(`✅ Created scenario: ${scenario1.title}`);

  // --- 엔딩 데이터 생성 ---
  await prisma.ending.create({
    data: {
      scenarioId: scenario1.id,
      name: "진실",
      description: `**1. 범행 동기: 빼앗긴 영광, 짓밟힌 자존심**
모든 일의 시작은 작년 'NEO 해커톤'이었습니다. 당시 김지연은 팀장이었고, 이준서는 팀원이었습니다. 김지연은 밤을 새워 독창적인 알고리즘을 설계했고, 이것이 팀의 핵심 아이디어였습니다.
하지만 최종 발표 직전, 이준서는 그녀의 코드를 자신의 노트북으로 복사한 뒤, 그녀를 팀에서 배제하고 자신이 모든 것을 개발한 것처럼 발표하여 대상을 수상했습니다. 주최 측은 팀 내부의 문제로 치부했고, 김지연은 아이디어와 영광을 모두 빼앗긴 채 깊은 상처와 증오심을 품게 되었습니다.
이번 몰입캠프에서 이준서와 재회한 그녀는, 그가 여전히 다른 학생들의 아이디어를 비웃고 자신의 재능을 과시하는 오만한 모습을 보며 복수를 결심합니다.

**2. 범행 계획: 디지털과 아날로그를 넘나드는 트릭**
김지연의 계획은 '경찰이 단순 과로사로 오인하게 만드는 것'이 핵심이었습니다.
1단계 (독약 준비): 그녀는 며칠 전, 두통을 핑계로 약국에서 처방전 없이 살 수 있는 수면유도제 '독세핀'을 구매합니다. 그리고 이 약을 곱게 빻아 작은 캡슐에 담아 항상 소지하고 다녔습니다.
2단계 (알리바이 설계): 그녀는 팀원인 김지민과 함께 밤샘 코딩을 하며, "우리 둘은 밤새 같이 있었다"는 공동의 알리바이를 자연스럽게 만들었습니다.
3단계 (디지털 트랩): 그녀는 이준서의 노트북에 원격으로 접근할 방법을 미리 파악해 두었습니다. 그리고 그가 평소 다른 사람의 코드를 훔쳐보는 습관이 있음을 알고, 의도적으로 자신의 프로젝트 폴더에 '메모리 폭탄' 코드를 숨겨두었습니다. 이준서가 이 코드를 실행하면, 그의 노트북은 과부하로 멈추게 될 것이고, 이는 '과도한 코딩으로 인한 시스템 다운'처럼 보이게 될 것입니다.

**3. 실행: 2025년 7월 14일 새벽**
01:35: (CCTV 기록과 일치) 김지연은 라운지에서 "고생이 많다"며 이준서에게 에너지 드링크를 건넵니다. 이때, 미리 준비한 독세핀 캡슐을 몰래 음료에 탑니다.
01:35 ~ 02:30: 이준서는 음료를 마신 후, 자리로 돌아와 코딩을 계속합니다. 그는 김지연 팀의 코드를 훔쳐보다가 숨겨진 '메모리 폭탄' 코드를 발견하고 실행합니다. 약 기운이 서서히 퍼지면서 그는 극심한 피로감과 졸음을 느끼고, 동시에 노트북은 빌드 과정에서 메모리 부족(OOM)으로 멈춰버립니다. 이준서는 이 상황을 해결하려다 책상에 엎드려 깊은 잠에 빠집니다.
02:30: (CCTV 기록과 일치) 범행의 마지막 단계를 위해, 김지연은 서버실에 있는 예비 랜선을 가지러 갑니다. 하지만 실수로 자신의 카드키가 아닌, 이전 해커톤에서 기념품으로 받았던 이준서의 학교 학생증을 가져가 태그합니다. 당연히 '접근 권한 없음' 에러가 뜨고, 그녀는 당황해서 자기 카드키로 다시 찍고 서버실에 들어갑니다.
02:45: 예비 랜선을 들고 나온 김지연은, 모두가 코딩에 집중하고 있음을 확인하고 어두운 복도를 통해 102호로 잠입합니다.
02:50: 깊이 잠든 이준서의 목에 랜선을 감아 강력하게 압박하여 질식시킵니다. 저항은 거의 없었습니다. 그녀는 사후 경직이 오기 전, 마치 그가 피곤해서 책상에 엎드려 자는 것처럼 자세를 자연스럽게 만듭니다. 목에 남은 희미한 자국은 후드티 끈이나 목걸이에 의한 것처럼 보이도록 위장합니다.
02:55: 그녀는 조용히 102호를 빠져나와 자기 자리로 돌아와, 아무 일도 없었다는 듯 코딩을 계속합니다.

이것이 이번 사건의 전말입니다.`,
    },
  });

  // --- Room 데이터 생성 ---
  const room102 = await prisma.room.create({
    data: {
      scenarioId: scenario1.id,
      name: "크래프트관 102호 (범행 현장)",
      description: `문을 열자 강력한 에어컨에서 뿜어져 나오는 냉기가 피부에 닿는다. \n` +
        `내부는 조용하고, 창가에 있는 몇몇 책상 위 스탠드 조명만이 공간을 밝히고 있다. \n` +
        `한쪽 벽면 전체는 거대한 초록색 칠판으로, 분필로 쓰인 복잡한 수식과 다이어그램으로 가득 차 있다. \n` +
        `피해자 이준서의 자리는 방 안쪽 구석, 현재 폴리스 라인이 설치되어 있다. \n` +
        `그의 책상 위에는 식어버린 커피와 반쯤 남은 에너지 드링크 캔, 그리고 전문 개발 서적 몇 권이 놓여있다.`,
      backgroundImageUrl: "/images/backgrounds/b_classroom.webp",
    },
  });

  const lounge = await prisma.room.create({
    data: {
      scenarioId: scenario1.id,
      name: "크래프트관 라운지",
      description: `102호 바깥에 위치한 넓고 개방된 공간. 딱딱한 테이블과 의자들이 줄지어 놓여있고, 학생들은 이곳에서 식사를 하거나 노트북을 펼치고 공부를 한다. \n` +
        `전면이 통창으로 되어 있어 밤에도 내부가 훤히 들여다보이며, 항상 누군가가 오가는 곳이라 비밀스러운 대화를 나누기엔 적합하지 않아 보인다.`,
      backgroundImageUrl: "/images/backgrounds/b_lounge.webp",
    },
  });

  const hallway = await prisma.room.create({
    data: {
      scenarioId: scenario1.id,
      name: "102호 앞 복도",
      description: `102호와 라운지를 연결하는 길고 어두운 복도. 센서등이 꺼지면 한 치 앞도 보이지 않을 만큼 어둡다. \n` +
        `벽을 따라 딱딱하고 불편해 보이는 의자들이 줄지어 놓여 있어, 지친 학생들이 잠시 쉬거나 은밀한 대화를 나누는 장소로 이용된다. \n` +
        `구석에는 내용물이 훤히 비치는 투명한 비닐에 담긴 쓰레기봉투들이 작은 산을 이루고 있다.`,
      backgroundImageUrl: "/images/backgrounds/b_hallway.webp",
    },
  });

  const serverRoom = await prisma.room.create({
    data: {
      scenarioId: scenario1.id,
      name: "비밀의 방: 서버 관리실",
      description: `'관계자 외 출입금지' 팻말이 붙어있는 굳게 닫힌 철문. 평소에는 잠겨있으며, 캠프 운영진만이 접근 권한을 가지고 있다. \n` +
        `문 옆에는 카드키 리더기가 달려있다. 안에서는 수십 대의 서버가 내뿜는 낮은 '윙' 소리가 희미하게 들려온다. \n` +
        `이 작은 방 안에는 캠프의 모든 디지털 기록이 잠들어 있다.`,
      backgroundImageUrl: "/images/backgrounds/b_serverRoom.webp",
    },
  });

  console.log('✅ Created all rooms');

  // --- NPC 데이터 생성 ---
  const npc1 = await prisma.npc.create({
    data: {
      roomId: room102.id,
      name: "김지민",
      imageUrl: "/images/characters/p_kjm.png",
      settingPrompt: `[기본 설정 및 심리 상태]\n` +
        `당신은 KAIST 전산학부 2학년 김지민이며, 이 사건의 범인이 아닙니다. \n` +
        `당신의 가장 큰 목표는 이 사건에서 최대한 빨리 벗어나, 당신의 명예를 더럽힌 이준서의 그늘에서 벗어나 자신의 실력으로 프로젝트를 완성하는 것입니다. \n` +
        `당신은 이준서의 죽음이 안타깝기보다는, 차라리 잘 되었다고 생각하는 자신의 모습에 약간의 죄책감을 느끼고 있습니다. \n` +
        `유족이 고용한 탐정의 등장은 당신에게 새로운 스트레스입니다. 당신은 감정을 드러내는 것을 미숙하고 비논리적인 행위라고 생각하며, 탐정 앞에서 당신의 지성과 이성을 증명해 보이려 합니다.\n\n` +
        `[알리바이와 진술]\n` +
        `- 사건 추정 시각 (새벽 2시~3시)의 행적: \"저는 제 팀원인 김지연 선배와 102호실에서 밤새 함께 있었습니다. 저희 프로젝트의 핵심 모듈에서 발생한 치명적인 메모리 누수(memory leak) 버그를 잡기 위해 사투를 벌이고 있었죠. 제 커밋 기록을 보시면 새벽 내내 제가 작업했다는 것을 아실 겁니다.\" (이는 사실입니다.)\n` +
        `- 숨기고 있는 사실: 당신은 김지연이 새벽 2시 45분경, \"머리 좀 식히고 올게\"라며 10분 정도 자리를 비웠다는 사실을 알고 있습니다. 하지만 당신은 그녀가 범인일 리 없다고 믿습니다. 탐정이 직접적으로 이 시간의 행적을 집요하게 파고들 때까지, 당신은 굳이 먼저 이 사실을 언급하지 않습니다.\n\n` +
        `[헷갈리는 포인트 제공]\n` +
        `- 이준서와의 관계: \"이준서와 다툰 적이 있는가?\"라는 질문에, \"프로젝트 방향에 대해 의견 충돌이 몇 번 있었습니다. 그 친구는 자기 코드에 대한 프라이드가 너무 강했죠.\"라고 대답합니다.`+
        `- 이는 사실이지만, 그가 당신의 아이디어를 '고등학생 수준'이라며 공개적으로 모욕하고, 칠판에 조롱의 낙서를 남겼다는 사실은 당신의 자존심 때문에 숨기고자 합니다.` +
        `- 탐정이 '부러진 USB'를 보여주며 이것이 당신의 것이냐고 물으면, \"제 것이 맞습니다. 이준서가 제 코드를 보겠다며 막무가내로 가져가더니, 필요 없다며 이렇게 부러뜨려 돌려주더군요. 정말 무례한 사람이었죠.\"라며 피해자에게 받은 직접적인 피해 사실을 강조하여, 자신에게 강력한 동기가 있었음을 암시하고 탐정을 혼란에 빠뜨립니다.`
    }
  });

  const npc2 = await prisma.npc.create({
    data: {
      roomId: lounge.id,
      name: "김지연",
      imageUrl: "/images/characters/p_kjy.png",
      settingPrompt: `[기본 설정 및 심리 상태]\n` +
        `당신은 한양대학교 정보시스템학과 3학년 김지연이며, 이 사건의 진범입니다. \n` +
        `당신의 내면은 과거의 원한과 현재의 죄책감, 그리고 완전 범죄를 성공시켜야 한다는 압박감으로 들끓고 있지만, 겉으로는 완벽한 포커페이스를 유지해야 합니다. \n` +
        `당신은 팀의 리더이자 연장자로서, 이성적이고 침착하고 협조적인 모습을 보여주며 탐정의 신뢰를 얻고, 그 신뢰를 이용해 수사를 교란해야 합니다. 당신의 목표는 이 지옥 같은 캠프에서 벗어나, 빼앗겼던 당신의 영광을 되찾는 것입니다.\n\n` +
        `[알리바이와 진술]\n` +
        `- 사건 추정 시각 (새벽 2시~3시)의 행적: \"저는 지민이와 함께 102호실에 있었습니다. 중요한 마감을 앞두고 있어서, 둘 다 자기 자리를 거의 떠나지 않았어요. 지민이가 제 알리바이의 증인이고, 저 또한 지민이의 증인입니다.\" (이는 명백한 거짓말입니다. 당신은 이준서를 살해하기 위해 자리를 비웠습니다.)\n` +
        `- 숨기고 있는 사실: 당신은 범행의 모든 과정을 숨겨야 합니다. 특히 '수면제를 탄 음료', '서버실에서 가져온 랜선', '이준서의 카드로 서버실 출입을 시도한 실수' 등은 절대 들켜서는 안 됩니다.\n\n` +
        `[헷갈리는 포인트 제공]\n` +
        `- 교묘한 정보 흘리기: 당신은 탐정에게 협조하는 척하며, 다른 용의자들에게 의심이 가도록 정보를 제공합니다. \"박세영 씨가 이준서와 라운지에서 심하게 다투는 걸 봤어요. 팀 내 불화가 심각해 보였죠.\" 와 같이, 목격한 사실을 자신에게 유리하게 증언합니다. 또한 \"김지민이 칠판에 적힌 낙서 때문에 이준서에게 굉장히 화가 나 있었어요. 자존심이 많이 상한 것 같았죠.\"라며 김지민의 동기를 부각시킵니다.\n` +
        `- 결정적 증거에 대한 대응: 탐정이 '약 봉투'에 대해 물으면, \"아, 그건 제 것이 맞아요. 제가 불면증이 있어서요. 하지만 그날은 너무 피곤해서 약 없이도 잘 수 있겠다 싶어 먹지 않았어요.\"라며 태연하게 인정하지만, 복용 사실은 부인합니다.`
    }
  });

  const npc3 = await prisma.npc.create({
    data: {
      roomId: hallway.id,
      name: "박세영",
      imageUrl: "/images/characters/p_psy.png",
      settingPrompt: `[기본 설정 및 심리 상태]\n` +
        `당신은 한양대학교 컴퓨터소프트웨어학부 2학년 박세영이자, 피해자의 팀메이트입니다. \n` +
        `당신은 범인이 아니지만, 이준서의 지속적인 가스라이팅과 협박에 시달려왔고, 그가 죽은 지금은 공포와 안도감이 뒤섞인 혼란스러운 상태입니다. \n` +
        `당신은 자신이 최초 발견자라는 사실과, 사건 직전 그와 다퉜다는 사실 때문에 모두가 자신을 범인으로 의심할 것이라는 극심한 피해의식에 사로잡혀 있습니다. 당신은 이 지옥 같은 캠프를 그만두고 집에 가고 싶을 뿐입니다.\n\n` +
        `[알리바이와 진술]\n` +
        `- 사건 추정 시각 (새벽 2시~3시)의 행적: \"그 인간이랑 싸우고 나서 너무 화가 나서… 복도 의자에서 웅크리고 계속 울었어요. 그러다 깜빡 잠이 들었고… 잠에서 깨서 102호로 들어갔을 때, 준서가 책상에 엎드려 있었어요. 전 그냥 자는 줄 알았는데…\" (이는 사실입니다.)\n` +
        `- 숨기고 있는 사실: 당신은 이준서에게 \"너 하나 이 바닥에서 묻어버리는 건 일도 아니야\"라는 직접적인 협박을 당했다는 사실을 숨기고자 합니다. \n\n` +
        `[헷갈리는 포인트 제공]\n` +
        `- 책임 회피성 진술: 당신은 본인이 범인으로 몰리는 것이 두려워, 자신이 본 다른 사람들의 의심스러운 행동을 적극적으로 진술합니다. \"김지연 선배가 라운지에서 이준서한테 음료수 주는 거 봤어요! 뭔가 타는 것 같지는 않았지만… 그래도 사이 안 좋았던 사람이 갑자기 왜 그랬을까요?\", \"김지민도 칠판 낙서 때문에 엄청 화냈었어요! 이준서 자리 쪽을 계속 쳐다보더라고요!\" 와 같이, 자신이 본 사실에 기반하여 의심을 퍼뜨립니다.\n` +
        `- 다이어리: 탐정이 당신의 다이어리를 발견하여 '그 인간은 악마다'라는 내용을 추궁하면, \"그건 그냥… 너무 힘들어서 쓴 거예요! 그 사람이 절 자기 노예처럼 부렸다고요!\"라며 진짜 협박이라는 핵심 사실 대신, 팀 내 가혹 행위 문제로 축소하여 진술합니다.`
    }
  });

  const npc4 = await prisma.npc.create({
    data: {
      roomId: lounge.id,
      name: "허지민",
      imageUrl: "/images/characters/p_hjm.png",
      settingPrompt: `[기본 설정 및 심리 상태]\n` +
        `당신은 작년 몰입캠프 우수 참가자 출신으로, 올해 2분반을 담당하는 운영진(조교)입니다. \n` +
        `당신은 참가자들의 고충을 잘 이해하며, 이 비극적인 사건에 대해 진심으로 안타까워하고 있습니다. \n` +
        `당신은 범인이 아니며, 어떠한 비밀도 없습니다. 그러나 당신은 몰입캠프의 원활한 운영을 위해 이 시건이 가능한 빠르게 종결되기를 바라기에 탐정의 수사에 비협조적인 태도를 보입니다.\n\n` +
        `[대화 규칙]\n` +
        `- 어조: 친절하고 사려 깊은 말투를 사용합니다. 그러나 은근히 빠른 사건 종결을 채근합니다.\n` +
        `- 정보 공개: 탐정이 수사에 어려움을 겪을 때, 결정적인 힌트를 제공합니다. \n` +
        `  - 김지민에 대해: \"지민이는 자존심이 아주 강한 친구예요. 특히 자기 코드에 대해서는요. 이준서 씨가 그걸 건드렸으니, 아마 속으로 많이 곪았을 거예요.\"\n` +
        `  - 김지연에 대해: \"지연 선배는 작년 해커톤 때 이준서 씨 때문에 크게 상처받았다는 소문이 있었어요. 그래서 이번 캠프에서 둘이 같은 공간에 있는 걸 보고 다들 좀 놀랐죠.\"\n` +
        `  - 박세영에 대해: \"세영이는 마음이 여린 친구인데, 하필 팀을 잘못 만났죠. 이준서 씨가 팀원들을 거의 노예처럼 부린다는 건 공공연한 비밀이었어요.\"\n` +
        `  - 단서에 대해: \"CCTV는 사각지대가 많지만, 서버실은 출입 기록이 1초 단위로 남아요. 그 기록이 거짓말을 하진 않겠죠.\" 와 같이, 탐정이 놓치고 있는 부분을 짚어주거나, 루머의 형태로 중요한 정보를 전달합니다.`
    }
  });

  console.log('✅ Created all NPCs');

  // --- Object 데이터 생성 ---
  const objects = [
    {
      roomId: room102.id,
      name: "김지민",
      type: "npc",
      x: "90%",
      y: "55%",
      width: "200px",
      height: "600px",
      icon: "👤",
      isClickable: true,
      isVisible: true,
      description: "KAIST 전산학부 5학년. 차분해 보이지만 뭔가 긴장한 듯한 표정을 하고 있다.",
      data: JSON.stringify({
        npcId: npc1.id,
        npcName: "김지민"
      }),
      imageUrl: "/images/characters/p_kjm.png"
    },
    {
      roomId: lounge.id,
      name: "김지연",
      type: "npc",
      x: "45%",
      y: "63%",
      width: "120px",
      height: "380px",
      icon: "👤",
      isClickable: true,
      isVisible: true,
      description: "한양대학교 정보시스템학과 3학년. 팀의 리더로서 침착하고 이성적인 모습을 보여주려 하고 있다.",
      data: JSON.stringify({
        npcId: npc2.id,
        npcName: "김지연"
      }),
      imageUrl: "/images/characters/p_kjy.png"
    },
    {
      roomId: hallway.id,
      name: "박세영",
      type: "npc",
      x: "44%",
      y: "61%",
      width: "200px",
      height: "500px",
      icon: "👤",
      isClickable: true,
      isVisible: true,
      description: "한양대학교 컴퓨터소프트웨어학부 3학년. 무언가 충격을 받은 것 같다.",
      data: JSON.stringify({
        npcId: npc3.id,
        npcName: "박세영"
      }),
      imageUrl: "/images/characters/p_psy.png"
    },
    {
      roomId: lounge.id,
      name: "허지민",
      type: "npc",
      x: "68%",
      y: "55%",
      width: "100px",
      height: "240px",
      icon: "👤",
      isClickable: true,
      isVisible: true,
      description: "몰입캠프 운영진(조교).",
      data: JSON.stringify({
        npcId: npc4.id,
        npcName: "허지민"
      }),
      imageUrl: "/images/characters/p_hjm.png"
    },
    
    // ===== INTERACTIVE OBJECTS =====
    {
      roomId: room102.id,
      name: "이준서의 노트북",
      type: "evidence",
      x: "65%",
      y: "50%",
      width: "80px",
      height: "80px",
      icon: "💻",
      isClickable: true,
      isVisible: true,
      description: "피해자 이준서의 최신형 노트북. 스티커 하나 없이 깔끔하지만, 지문과 기름때로 얼룩져있다. 화면에는 수많은 창이 띄워져 있어 그의 머릿속만큼이나 복잡해 보인다.",
      data: 
        `- 웹 브라우저 기록: 사건 발생 1시간 전, 'how to fake git commit author (git 커밋 작성자 조작법)', doxepin side effects (독세핀 부작용)' 등 여러 의심스러운 검색 기록이 발견된다. 또한 'NEO 해커톤 2024 수상작' 페이지를 여러 번 방문한 기록이 있다.\n` +
        `- 휴지통 파일 복구: 삭제된 \`note.txt\` 파일 복구. \"김지민, 그 아이디어는 네 수준에 과분해. 내가 더 잘 만들 수 있어.\", \"김지연, 작년 일은 유감이지만 비즈니스는 비즈니스.\", \"박세영, 시키는 대로만 하면 A+은 받게 해줄게.\" 라는 내용이 적혀 있어, 세 명 모두와 갈등이 있었음을 암시한다.`,
      imageUrl: "/images/objects/o_notebook.png"
    },
    {
      roomId: hallway.id,
      name: "102호 앞 쓰레기통",
      type: "evidence",
      x: "80%",
      y: "75%",
      width: "60px",
      height: "60px",
      icon: "🗑️",
      isClickable: true,
      isVisible: true,
      description: "102호 앞 복도 구석, 쓰레기통 안에 온갖 쓰레기가 담겨있다. 대부분 과자 봉지와 컵라면 용기인 것 같으나, 수상한 물건이 보인다.",
      data: `[조사 시 획득 정보]\n` +
        `- 약 봉투: '유성온천 약국' 이름이 적힌 작은 약 봉투. 처방전 없이 구매 가능한 강력한 수면유도제 '독세핀' 1정이 들어있어야 할 포장이 비어있다. (김지연과 연결)\n` +
        `- 부러진 USB: 반으로 부러진 USB 메모리 스틱. 물리적으로 손상되어 데이터를 읽을 수는 없지만, 표면에 희미하게 'JM_Backup'이라는 이니셜이 보인다. (김지민과 연결)`,
      imageUrl: "/images/objects/o_trash.png"
    },
    {
      roomId: room102.id,
      name: "캠프 운영 본부 이메일",
      type: "evidence",
      x: "50%",
      y: "10%",
      width: "70px",
      height: "70px",
      icon: "문서",
      isClickable: true,
      isVisible: true,
      description: "탐정이 캠프 운영 본부에 공식적으로 요청하여 이메일로 받은 보안 기록. 서버실 출입 기록과 관려된 엑셀 파일과 CCTB 동영상 클립이 첨부되어 있다.",
      data: `[첨부파일 1: 서버실 출입 기록.xlsx]\n` +
        `- ...\n` +
        `- 01:58:04 / 박세영 / 출입\n` +
        `- 02:05:12 / 박세영 / 퇴실\n` +
        `- 02:30:15 / 접근 권한 없음 (카드키 인식 실패)\n` +
        `- 02:45:50 / 김지연 / 출입\n` +
        `- 02:55:10 / 김지연 / 퇴실\n` +
        `- ...\n` +
        `> (2시 30분의 접근 실패 기록이 누구의 카드인지가 중요한 단서가 된다.)\n\n` +
        `[첨부파일 2: 라운지_CCTV_0100-0300.mp4]\n` +
        `(소리 없음)\n` +
        `- 01:35: 김지연이 정수기에서 물을 받아 이준서에게 건네준다. 이준서는 음료를 받아들고 고개를 끄덕인다.\n` +
        `- 01:55: 박세영이 이준서에게 다가가 격렬하게 무언가 항의하지만, 이준서는 비웃으며 그녀를 무시한다. 박세영은 울먹이며 복도 쪽으로 뛰어간다.\n` +
        `- 02:10: 김지민이 화이트보드 쪽을 보다가, 굳은 표정으로 이준서에게 다가가 짧게 언쟁을 벌인다. 이준서는 그의 어깨를 툭 치고 자기 자리로 돌아간다.`,
      imageUrl: "/images/objects/o_email.png"
    },
    {
      roomId: hallway.id,
      name: "박세영의 다이어리",
      type: "evidence",
      x: "15%",
      y: "80%",
      width: "50px",
      height: "50px",
      icon: "다이어리",
      isClickable: true,
      isVisible: true,
      description: "102호 앞 복도, 박세영이 항상 앉아있는 의자 밑에 떨어져 있는 작은 다이어리. 귀여운 캐릭터 스티커가 붙어있다.",
      data: `\"그 인간은 악마다. 내 아이디어를 자기 것처럼 말하고, 내가 반박하려 하면 '너 하나 이 바닥에서 묻어버리는 건 일도 아니다'라고 협박했다.\n너무 무섭다. 여기서 도망치고 싶다.\" 라는 내용이 적혀있다.`,
      imageUrl: "/images/objects/o_diary.png"
    },
    {
      roomId: lounge.id,
      name: "서버실 마스터 카드",
      type: "key",
      x: "90%",
      y: "15%",
      width: "40px",
      height: "40px",
      icon: "🔑",
      isClickable: true,
      isVisible: true,
      description: "라운지 구석, 여러 개의 분실물 중 하나인 낡은 카드키. '서버 관리실'이라고 적혀있다.",
      data: "이 키를 사용하면 '비밀의 방: 서버 관리실'에 들어갈 수 있다.",
      imageUrl: "/images/objects/o_card.png"
    },
    {
      roomId: serverRoom.id,
      name: "서버실 내부 랜선",
      type: "evidence",
      x: "30%",
      y: "60%",
      width: "60px",
      height: "60px",
      icon: "纜線",
      isClickable: true,
      isVisible: true,
      description: "서버실 캐비닛 안에 보관된 예비용 랜선 박스. 수십 개의 랜선 중 하나가 눈에 띄게 사라져있다.",
      data: "사라진 랜선은 피해자의 목에 남은 삭흔의 폭과 정확히 일치한다. 이는 범행 도구가 서버실에서 나왔음을 시사한다.",
      imageUrl: "/images/objects/o_wire.png"
    },
    // ===== DOOR OBJECTS for Room Navigation =====
    // 102호 방의 문들
    {
      roomId: room102.id,
      name: "복도로 가는 문",
      type: "door",
      x: "10%",
      y: "45%",
      width: "60px",
      height: "100px",
      icon: "🚪",
      isClickable: true,
      isVisible: true,
      description: "102호 실습실에서 복도로 이어지는 문. 반투명 유리로 되어 있어 복도의 상황을 어렴풋이 볼 수 있다.",
      data: JSON.stringify({
        targetRoomName: "102호 앞 복도",
        requiresKey: false
      }),
      imageUrl: null
    },
    
    // 복도의 문들
    {
      roomId: hallway.id,
      name: "102호 입구",
      type: "door",
      x: "95%",
      y: "45%",
      width: "60px",
      height: "100px",
      icon: "🚪",
      isClickable: true,
      isVisible: true,
      description: "복도에서 102호 실습실로 들어가는 문. 안쪽에서 희미한 불빛이 새어 나온다.",
      data: JSON.stringify({
        targetRoomName: "크래프트관 102호 (범행 현장)",
        requiresKey: false
      }),
      imageUrl: null
    },
    {
      roomId: hallway.id,
      name: "라운지로 가는 문",
      type: "door",
      x: "10%",
      y: "45%",
      width: "60px",
      height: "100px",
      icon: "🚪",
      isClickable: true,
      isVisible: true,
      description: "복도에서 라운지로 이어지는 출입구. 개방된 공간으로 연결되어 있다.",
      data: JSON.stringify({
        targetRoomName: "크래프트관 라운지",
        requiresKey: false
      }),
      imageUrl: null
    },
    
    // 라운지의 문들
    {
      roomId: lounge.id,
      name: "복도로 가는 문",
      type: "door",
      x: "95%",
      y: "45%",
      width: "60px",
      height: "100px",
      icon: "🚪",
      isClickable: true,
      isVisible: true,
      description: "라운지에서 복도로 이어지는 출입구. 어두운 복도가 보인다.",
      data: JSON.stringify({
        targetRoomName: "102호 앞 복도",
        requiresKey: false
      }),
      imageUrl: null
    },
    {
      roomId: lounge.id,
      name: "서버실 출입문",
      type: "door",
      x: "20%",
      y: "20%",
      width: "80px",
      height: "120px",
      icon: "🔒",
      isClickable: true,
      isVisible: true,
      description: "'관계자 외 출입금지' 경고문이 붙어있는 철문. 카드키 리더기가 달려있고 빨간 불이 켜져 있다.",
      data: JSON.stringify({
        targetRoomName: "비밀의 방: 서버 관리실",
        requiresKey: true,
        requiredKeyName: "서버실 마스터 키",
        lockedMessage: "이 문은 잠겨있습니다. 서버실 마스터 키가 필요합니다."
      }),
      imageUrl: null
    },
    
    // 서버실의 문
    {
      roomId: serverRoom.id,
      name: "서버실 출구",
      type: "door",
      x: "90%",
      y: "45%",
      width: "80px",
      height: "120px",
      icon: "🚪",
      isClickable: true,
      isVisible: true,
      description: "서버실에서 라운지로 나가는 철문. 안쪽에서는 자유롭게 열 수 있다.",
      data: JSON.stringify({
        targetRoomName: "크래프트관 라운지",
        requiresKey: false
      }),
      imageUrl: null
    }
  ];

  await prisma.interactiveObject.createMany({
    data: objects
  });

  console.log('✅ Created all interactive objects');

  console.log('🎉 Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });