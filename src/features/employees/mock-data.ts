import type { Employee } from './schema'

/** 僅供 mock 模式使用的初始資料。清除 localStorage 即可還原 */
const raw: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: '王小明',
    email: 'ming.wang@example.com',
    phone: '0912345678',
    department: 'engineering',
    title: '資深前端工程師',
    status: 'active',
    hireDate: '2021-03-15',
  },
  {
    name: '陳怡君',
    email: 'yijun.chen@example.com',
    phone: '0923456789',
    department: 'product',
    title: '產品經理',
    status: 'active',
    hireDate: '2020-07-01',
  },
  {
    name: '林志豪',
    email: 'zhihao.lin@example.com',
    phone: '0934567890',
    department: 'engineering',
    title: '後端工程師',
    status: 'active',
    hireDate: '2022-01-10',
  },
  {
    name: '張雅婷',
    email: 'yating.chang@example.com',
    phone: '0945678901',
    department: 'design',
    title: 'UI/UX 設計師',
    status: 'onLeave',
    hireDate: '2021-09-01',
  },
  {
    name: '李建宏',
    email: 'jianhong.li@example.com',
    phone: '0956789012',
    department: 'sales',
    title: '業務經理',
    status: 'active',
    hireDate: '2019-04-22',
  },
  {
    name: '黃淑芬',
    email: 'shufen.huang@example.com',
    phone: '0967890123',
    department: 'hr',
    title: '人資專員',
    status: 'active',
    hireDate: '2023-02-13',
  },
  {
    name: '吳俊傑',
    email: 'junjie.wu@example.com',
    phone: '0978901234',
    department: 'finance',
    title: '會計',
    status: 'resigned',
    hireDate: '2018-11-05',
  },
  {
    name: '劉佳穎',
    email: 'jiaying.liu@example.com',
    phone: '0989012345',
    department: 'marketing',
    title: '行銷企劃',
    status: 'active',
    hireDate: '2022-06-20',
  },
  {
    name: '蔡宗翰',
    email: 'zonghan.tsai@example.com',
    phone: '0911223344',
    department: 'engineering',
    title: 'DevOps 工程師',
    status: 'active',
    hireDate: '2023-08-01',
  },
  {
    name: '楊心怡',
    email: 'xinyi.yang@example.com',
    phone: '0922334455',
    department: 'design',
    title: '視覺設計師',
    status: 'active',
    hireDate: '2024-03-04',
  },
  {
    name: '許家豪',
    email: 'jiahao.hsu@example.com',
    phone: '0933445566',
    department: 'sales',
    title: '業務專員',
    status: 'active',
    hireDate: '2024-05-16',
  },
  {
    name: '鄭雅雯',
    email: 'yawen.cheng@example.com',
    phone: '0944556677',
    department: 'product',
    title: '產品設計師',
    status: 'onLeave',
    hireDate: '2022-10-03',
  },
  {
    name: '謝承恩',
    email: 'chengen.hsieh@example.com',
    phone: '0955667788',
    department: 'engineering',
    title: '技術主管',
    status: 'active',
    hireDate: '2017-08-14',
  },
]

/**
 * 補充資料：讓列表有 5 頁、各部門與狀態都有足夠樣本，可以展示分頁、篩選與搜尋。
 * 格式：[姓名, Email 帳號, 部門, 職稱, 狀態, 到職日]
 */
const more: [string, string, Employee['department'], string, Employee['status'], string][] = [
  ['周品妤', 'pinyu.chou', 'engineering', '前端工程師', 'active', '2024-07-01'],
  ['郭柏宇', 'boyu.kuo', 'engineering', '後端工程師', 'active', '2023-11-20'],
  ['洪詩涵', 'shihan.hung', 'design', '資深 UI 設計師', 'active', '2020-05-11'],
  ['邱冠廷', 'guanting.chiu', 'engineering', 'QA 工程師', 'active', '2022-09-05'],
  ['曾郁婷', 'yuting.tseng', 'marketing', '社群經理', 'active', '2021-12-01'],
  ['廖哲維', 'zhewei.liao', 'sales', '大客戶經理', 'active', '2019-02-18'],
  ['賴怡萱', 'yixuan.lai', 'hr', '招募專員', 'active', '2024-01-08'],
  ['徐子軒', 'zixuan.hsu', 'engineering', '資料工程師', 'onLeave', '2022-04-25'],
  ['蘇雨晴', 'yuqing.su', 'finance', '財務分析師', 'active', '2023-03-13'],
  ['葉俊宏', 'junhong.yeh', 'engineering', 'iOS 工程師', 'active', '2021-06-07'],
  ['莊雅筑', 'yazhu.chuang', 'product', '資深產品經理', 'active', '2018-10-15'],
  ['呂承翰', 'chenghan.lu', 'sales', '業務專員', 'resigned', '2020-08-03'],
  ['江佩珊', 'peishan.chiang', 'marketing', '品牌行銷', 'active', '2023-05-22'],
  ['何宇翔', 'yuxiang.ho', 'engineering', 'Android 工程師', 'active', '2022-11-14'],
  ['羅欣妤', 'xinyu.lo', 'design', '使用者研究員', 'active', '2024-09-02'],
  ['高振宇', 'zhenyu.kao', 'engineering', '架構師', 'active', '2016-04-01'],
  ['潘思妍', 'siyan.pan', 'hr', '人資經理', 'active', '2017-03-20'],
  ['簡志明', 'zhiming.chien', 'finance', '出納', 'active', '2021-01-11'],
  ['朱芷晴', 'zhiqing.chu', 'product', '產品分析師', 'onLeave', '2023-07-17'],
  ['彭冠霖', 'guanlin.peng', 'engineering', 'SRE 工程師', 'active', '2024-02-26'],
  ['游雅琪', 'yaqi.yu', 'sales', '業務助理', 'active', '2025-03-03'],
  ['詹博文', 'bowen.chan', 'engineering', '前端工程師', 'active', '2025-06-16'],
  ['沈怡廷', 'yiting.shen', 'marketing', '內容行銷', 'resigned', '2021-08-09'],
  ['范書豪', 'shuhao.fan', 'engineering', '全端工程師', 'active', '2023-10-02'],
  ['施佳蓉', 'jiarong.shih', 'design', '動態設計師', 'active', '2022-02-14'],
  ['方俊廷', 'junting.fang', 'sales', '業務經理', 'active', '2019-09-23'],
  ['孫若涵', 'ruohan.sun', 'finance', '會計主任', 'active', '2015-12-07'],
  ['石家銘', 'jiaming.shih', 'engineering', '資安工程師', 'active', '2024-11-11'],
  ['唐語彤', 'yutong.tang', 'product', '專案經理', 'active', '2022-07-04'],
  ['鍾宗憲', 'zongxian.chung', 'engineering', '機器學習工程師', 'active', '2025-01-06'],
  ['姚欣怡', 'xinyi.yao', 'hr', '訓練發展專員', 'active', '2023-09-18'],
  ['馮立偉', 'liwei.feng', 'sales', '通路經理', 'onLeave', '2020-03-30'],
  ['杜婉婷', 'wanting.tu', 'marketing', '活動企劃', 'active', '2025-08-25'],
  ['袁子豪', 'zihao.yuan', 'engineering', '實習工程師', 'active', '2026-07-01'],
  ['戴詠晴', 'yongqing.tai', 'design', '設計實習生', 'active', '2026-07-01'],
]

raw.push(
  ...more.map(([name, account, department, title, status, hireDate], i) => ({
    name,
    email: `${account}@example.com`,
    // 依序號產生不重複的手機號碼
    phone: `09${60_000_000 + i * 104_729}`,
    department,
    title,
    status,
    hireDate,
  })),
)

export const employeeSeed: Employee[] = raw.map((e, i) => {
  // 讓 createdAt 有先後順序，列表排序才穩定
  const createdAt = new Date(Date.now() - i * 86_400_000).toISOString()
  return { ...e, id: `emp-${i + 1}`, createdAt, updatedAt: createdAt }
})
