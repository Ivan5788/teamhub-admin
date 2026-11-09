import { defineOptions } from '@/lib/options'

/** 上架狀態：草稿（從未上架）→ 已上架 ⇄ 已下架 */
export const EVENT_STATUS = defineOptions({
  draft: { label: '草稿', tone: 'gray' },
  published: { label: '已上架', tone: 'green' },
  unpublished: { label: '已下架', tone: 'yellow' },
})

export const EVENT_CATEGORY = defineOptions({
  training: { label: '教育訓練', tone: 'blue' },
  teamBuilding: { label: '團隊活動', tone: 'indigo' },
  seminar: { label: '講座分享', tone: 'blue' },
  csr: { label: '公益活動', tone: 'green' },
  party: { label: '聚餐 / 尾牙', tone: 'yellow' },
})
