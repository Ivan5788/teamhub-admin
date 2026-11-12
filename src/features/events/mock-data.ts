import type { CompanyEvent } from './schema'

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
    capacity: 30,
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
]

export const eventSeed: CompanyEvent[] = raw.map((e, i) => {
  const createdAt = new Date(Date.now() - i * DAY).toISOString()
  return { ...e, id: `evt-${i + 1}`, createdAt, updatedAt: createdAt }
})
