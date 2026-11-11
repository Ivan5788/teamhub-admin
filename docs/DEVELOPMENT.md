# 開發指南

給要在這個專案上新增功能的開發者。專案介紹請見 [README](../README.md)。

## 資料夾結構

```
src/
├── app/                    # 應用程式外殼：Provider、路由
├── config/navigation.ts    # 側邊欄選單
├── components/
│   ├── ui/                 # 純 UI 元件（Button、Modal、Input…），不含任何業務邏輯
│   ├── data-table/         # 表格、分頁、搜尋列
│   └── layout/             # 後台版面、頁首
├── hooks/                  # 跨模組共用的 hooks
├── lib/
│   ├── api/                # API 層：mock / 真實後端切換
│   ├── query/              # React Query 共用設定與 hooks 工廠
│   ├── options.ts          # 狀態/類別列舉的定義工具
│   └── utils.ts            # cn()、日期格式化
└── features/               # ★ 業務模組，日常開發 90% 在這裡
    ├── employees/
    ├── events/
    └── dashboard/
```

### 一個 feature 模組長這樣

```
features/employees/
├── constants.ts            # 狀態、部門等選項（label、顏色）
├── schema.ts               # Zod 驗證規則 + TypeScript 型別
├── mock-data.ts            # 假資料
├── api.ts                  # API 與 React Query hooks（通常 10 行就夠）
├── components/
│   ├── EmployeeFormModal.tsx   # 新增 / 編輯表單
│   └── employee-columns.tsx    # 表格欄位定義
├── pages/
│   └── EmployeeListPage.tsx    # 列表頁（組合以上所有東西）
└── index.ts                # 對外公開的內容
```

**規則：**
1. 模組之間只能透過 `index.ts` 互相引用（`import { employeeHooks } from '@/features/employees'`）
2. `components/ui` 不能 import `features/` 的任何東西
3. 頁面元件不要直接呼叫 `fetch` 或 `employeeApi`，一律使用 hooks

---

## 資料流

```
頁面元件
  │  employeeHooks.useList(params)      ← 讀取
  │  employeeHooks.useCreate().mutate() ← 寫入（成功後自動刷新列表 + 跳提示）
  ▼
lib/query/create-resource-hooks.ts      ← React Query 包裝
  ▼
ResourceApi（list / get / create / update / remove）
  ├─ mock-api.ts   ← VITE_USE_MOCK 不是 false 時（預設）
  └─ http-api.ts   ← VITE_USE_MOCK=false 時，打 RESTful API
```

### 串接真實後端

1. 複製 `.env.example` 為 `.env.local`，設定 `VITE_USE_MOCK=false` 和 `VITE_API_BASE_URL`
2. 後端需符合以下格式（若不同，只需修改 `src/lib/api/http-api.ts`）：

```
GET    /employees?page=1&pageSize=10&keyword=王&status=active
       → { items: Employee[], total: number, page: number, pageSize: number }
GET    /employees/:id     → Employee
POST   /employees         → Employee
PATCH  /employees/:id     → Employee
DELETE /employees/:id     → 204
錯誤回應 → { message: string }（會直接顯示在 toast）
```

3. 需要帶 token 時，修改 `src/lib/api/http.ts` 的 headers。

---

## 📋 SOP：新增一個 CRUD 模組

以「公告管理 announcements」為例，**建議直接複製 `features/employees` 整個資料夾再改名**。

### 1. `constants.ts` — 定義選項

```ts
export const ANNOUNCEMENT_STATUS = defineOptions({
  draft: { label: '草稿', tone: 'gray' },
  published: { label: '已發布', tone: 'green' },
})
```

一份定義同時提供：`.keys`（給 zod）、`.options`（給下拉選單）、`.label(v)` / `.tone(v)`（給 Badge）。

### 2. `schema.ts` — 驗證規則與型別

```ts
export const announcementFormSchema = z.object({
  title: z.string().trim().min(1, '請輸入標題'),
  status: z.enum(ANNOUNCEMENT_STATUS.keys),
})
export type AnnouncementFormValues = z.infer<typeof announcementFormSchema>
export type Announcement = BaseEntity & AnnouncementFormValues
```

### 3. `api.ts` — 一次產生全部 CRUD

```ts
export const announcementApi = createResourceApi<Announcement>({
  resource: 'announcements',
  mock: { seed: announcementSeed, searchFields: ['title'] },
})
export const announcementHooks = createResourceHooks('announcements', announcementApi, '公告')
```

### 4. 表單、欄位、列表頁

照著 `EmployeeFormModal.tsx`、`employee-columns.tsx`、`EmployeeListPage.tsx` 修改欄位即可。

### 5. 註冊路由與選單

- `src/app/router.tsx` 加一筆路由
- `src/config/navigation.ts` 加一筆選單

完成 ✅

---

## 常見任務速查

| 我想要… | 改哪裡 |
| --- | --- |
| 表單加一個欄位 | `schema.ts` 加規則 → `XxxFormModal.tsx` 加輸入框 |
| 列表多顯示一欄 | `xxx-columns.tsx` |
| 加一個篩選條件 | 列表頁 `useListState({ filterKeys: [...] })` + `<TableToolbar>` 裡放 `<Select>` |
| 新增狀態選項 / 改顏色 | `constants.ts` |
| 非 CRUD 的業務動作（例如上架） | 參考 `features/events/api.ts` 的 `useTogglePublish` |
| 新增共用 UI 元件 | `components/ui/` 並在 `index.ts` 匯出 |
| 改 API 格式 / 加 token | `lib/api/http-api.ts`、`lib/api/http.ts` |

## 寫程式慣例

- 元件檔案用 `PascalCase.tsx`，其他用 `kebab-case.ts`，hooks 用 `useXxx.ts`
- 一律使用 `@/` 絕對路徑引用跨資料夾的檔案
- 合併 className 用 `cn()`，不要用字串相加
- 彈窗表單用 `{open && <XxxFormModal />}` 掛載，每次打開都是乾淨狀態，不需要手動 reset
- 列表的分頁/搜尋/篩選狀態放在網址上（`useListState`），重新整理不會遺失
