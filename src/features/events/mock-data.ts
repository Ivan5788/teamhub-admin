import type { CompanyEvent, Registration } from './schema'

const DAY = 86_400_000

/** 以「今天」為基準產生時間，讓 mock 資料永遠有未開始 / 已結束的活動 */
const at = (dayOffset: number, hour: number, durationHours: number) => {
  const start = new Date()
  start.setHours(hour, 0, 0, 0)
  start.setTime(start.getTime() + dayOffset * DAY)
  return {
    startAt: start.toISOString(),
    endAt: new Date(start.getTime() + durationHours * 3_600_000).toISOString(),
  }
}

const raw: Omit<CompanyEvent, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: '2026 年度尾牙',
    category: 'party',
    description: '一年一度的尾牙晚宴，現場有抽獎與表演節目。',
    location: '台北君悅酒店 凱悅廳',
    ...at(80, 18, 4),
    capacity: 300,
    coverUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400',
    status: 'draft',
  },
  {
    title: 'React 19 新功能分享會',
    category: 'seminar',
    description: '由前端團隊分享 React 19 的 Actions、use() 與 Server Components 實務經驗。',
    location: '總部 10F 大會議室',
    ...at(7, 14, 2),
    capacity: 50,
    coverUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
    status: 'published',
  },
  {
    title: '新進人員教育訓練',
    category: 'training',
    description: '公司制度、資安規範與各部門介紹。',
    location: '總部 8F 訓練教室',
    ...at(3, 9, 8),
    capacity: 5,
    coverUrl: '',
    status: 'published',
  },
  {
    title: '淨灘公益活動',
    category: 'csr',
    description: '與在地環保團體合作，一起守護海岸線。',
    location: '新北市 福隆海水浴場',
    ...at(21, 8, 5),
    capacity: 80,
    coverUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=400',
    status: 'published',
  },
  {
    title: '秋季部門登山健行',
    category: 'teamBuilding',
    description: '七星山主峰路線，中午山上野餐。',
    location: '陽明山國家公園',
    ...at(-10, 8, 6),
    capacity: 40,
    coverUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400',
    status: 'unpublished',
  },
  {
    title: '資安意識線上課程',
    category: 'training',
    description: '全員必修，課程結束後需完成線上測驗。',
    location: '線上（Google Meet）',
    ...at(-30, 10, 2),
    capacity: 500,
    coverUrl: '',
    status: 'unpublished',
  },
  {
    title: '業務季度啟動會議',
    category: 'seminar',
    description: 'Q4 業績目標與策略說明。',
    location: '總部 10F 大會議室',
    ...at(14, 10, 3),
    capacity: 60,
    coverUrl: '',
    status: 'draft',
  },
  {
    title: 'Figma 設計系統工作坊',
    category: 'training',
    description: '從 Variables、Components 到交付規格，實作一套小型設計系統。',
    location: '總部 9F 創意空間',
    ...at(10, 14, 3),
    capacity: 20,
    coverUrl: '',
    status: 'published',
  },
  {
    title: '季度全員大會',
    category: 'seminar',
    description: '執行長說明營運成果與下一季重點，會後開放 Q&A。',
    location: '總部 B1 演講廳（同步直播）',
    ...at(28, 15, 2),
    capacity: 200,
    coverUrl: '',
    status: 'published',
  },
  {
    title: '羽球社例行練習',
    category: 'teamBuilding',
    description: '每週一次，球拍可向社團借用。',
    location: '內湖運動中心 3F 羽球場',
    ...at(2, 19, 2),
    capacity: 12,
    coverUrl: '',
    status: 'published',
  },
  {
    title: '聖誕交換禮物派對',
    category: 'party',
    description: '禮物預算 500 元，現場有自助餐與音樂表演。',
    location: '總部 1F 員工餐廳',
    ...at(37, 18, 3),
    capacity: 120,
    coverUrl: '',
    status: 'published',
  },
  {
    title: '捐血一袋 救人一命',
    category: 'csr',
    description: '與捐血中心合作，捐血車停靠總部門口。',
    location: '總部大樓前廣場',
    ...at(45, 10, 6),
    capacity: 60,
    coverUrl: '',
    status: 'draft',
  },
  {
    title: 'TypeScript 進階讀書會',
    category: 'seminar',
    description: '型別體操、泛型設計與大型專案的型別策略。',
    location: '總部 10F 小會議室',
    ...at(-5, 19, 2),
    capacity: 30,
    coverUrl: '',
    status: 'published',
  },
  {
    title: '急救證照訓練',
    category: 'training',
    description: 'CPR 與 AED 實作，結訓後取得紅十字會證照。',
    location: '總部 8F 訓練教室',
    ...at(-21, 9, 8),
    capacity: 25,
    coverUrl: '',
    status: 'unpublished',
  },
  {
    title: '2027 新春開工春酒',
    category: 'party',
    description: '開工第一天的春酒餐會，各部門主管發放開工紅包。',
    location: '台北晶華酒店 宴會廳',
    ...at(110, 18, 4),
    capacity: 300,
    coverUrl: '',
    status: 'draft',
  },
  {
    title: '主管領導力培訓',
    category: 'training',
    description: '一對一溝通、績效回饋與團隊激勵的實務演練。',
    location: '總部 8F 訓練教室',
    ...at(17, 9, 7),
    capacity: 15,
    coverUrl: '',
    status: 'published',
  },
  {
    title: '社區長者陪伴志工',
    category: 'csr',
    description: '到社區關懷據點陪長輩聊天、玩桌遊。',
    location: '內湖區 東湖社區關懷據點',
    ...at(24, 13, 4),
    capacity: 20,
    coverUrl: '',
    status: 'published',
  },
  {
    title: '產品 Demo Day',
    category: 'seminar',
    description: '各產品團隊展示本季成果，評審選出最佳專案。',
    location: '總部 B1 演講廳',
    ...at(49, 13, 5),
    capacity: 100,
    coverUrl: '',
    status: 'draft',
  },
  {
    title: '週五桌遊之夜',
    category: 'teamBuilding',
    description: '下班後一起玩桌遊，公司提供披薩與飲料。',
    location: '總部 9F 交誼廳',
    ...at(1, 18, 3),
    capacity: 16,
    coverUrl: '',
    status: 'published',
  },
  {
    title: '無障礙設計講座',
    category: 'seminar',
    description: '邀請視障使用者現身說法，示範螢幕閱讀器操作。',
    location: '總部 10F 大會議室',
    ...at(-45, 14, 2),
    capacity: 80,
    coverUrl: '',
    status: 'unpublished',
  },
]

export const eventSeed: CompanyEvent[] = raw.map((e, i) => {
  const createdAt = new Date(Date.now() - i * DAY).toISOString()
  return { ...e, id: `evt-${i + 1}`, createdAt, updatedAt: createdAt }
})

/** 非在職員工（留職停薪、離職）的序號，不能報名；mock-data.test.ts 會核對 */
const INACTIVE = new Set([4, 7, 12, 21, 25, 32, 36, 45])
const EMPLOYEE_COUNT = 48

/** 從在職員工中依固定間隔挑 count 人：結果固定、不重複 */
const pick = (count: number, offset: number) => {
  const active = Array.from({ length: EMPLOYEE_COUNT }, (_, i) => i + 1).filter(
    (n) => !INACTIVE.has(n),
  )
  return Array.from({ length: count }, (_, i) => active[(offset + i * 7) % active.length])
}

/**
 * 報名資料，涵蓋各種名額狀態：
 * React 19 分享會 6/50、新進人員訓練額滿 5/5、羽球社額滿 12/12、
 * 桌遊之夜 13/16 與設計工作坊 17/20（接近額滿，進度條變色）、已結束的讀書會 18/30
 */
const registrations: [eventId: string, employeeIds: number[]][] = [
  ['evt-2', [1, 2, 3, 5, 9, 10]],
  ['evt-3', [6, 8, 11, 13, 1]],
  ['evt-4', [2, 9]],
  ['evt-8', pick(17, 0)],
  ['evt-9', pick(30, 3)],
  ['evt-10', pick(12, 5)],
  ['evt-11', pick(25, 11)],
  ['evt-13', pick(18, 2)],
  ['evt-16', pick(9, 8)],
  ['evt-17', pick(4, 13)],
  ['evt-19', pick(13, 1)],
]

export const registrationSeed: Registration[] = registrations.flatMap(([eventId, employees]) =>
  employees.map((n, i) => {
    const createdAt = new Date(Date.now() - (i + 1) * 3_600_000).toISOString()
    return {
      id: `reg-${eventId}-${n}`,
      eventId,
      employeeId: `emp-${n}`,
      createdAt,
      updatedAt: createdAt,
    }
  }),
)
