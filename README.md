# Bitcoin Academy · 比特币学院

一个手机端优先、以《精通比特币》第三版为核心教材的系统化交互式学习平台。从零开始，逐步理解比特币的诞生背景、技术原理、运行机制、经济价值、安全机制与技术演进。

**不是电子书阅读器，而是可操作、可测试、可追踪进度的学习系统。**

---

## 一、已交付功能（第一阶段完整版）

| # | 功能 | 状态 |
|---|------|------|
| 1 | 完整首页（大型圆形进度仪表盘、今日任务、连续天数、待复习、下一节推荐、模块进度） | ✅ |
| 2 | 十个学习模块课程目录（按认知递进组织） | ✅ |
| 3 | 30 节实质性教学内容（远超要求的 20 节） | ✅ |
| 4 | 六个可操作的互动实验室 | ✅ |
| 5 | 完整测试与错题系统（5 种题型、自动判分、详细解析、重做移出） | ✅ |
| 6 | 学习进度记录（LocalStorage 持久化） | ✅ |
| 7 | 知识地图（可点击节点 + 学习主线） | ✅ |
| 8 | 手机端固定底部导航 + 桌面侧边栏 | ✅ |
| 9 | 本地数据持久化（刷新/关闭浏览器不丢失） | ✅ |
| 10 | PWA 基础支持（可添加到 iPhone 主屏幕、Service Worker 离线缓存） | ✅ |

### 三个重点打磨的功能

1. **UTXO 交易模拟器**：可调转账金额与手续费率，完整演示「输入 UTXO → Bob 收款 → Alice 找零 → 手续费 → 签名 → 广播 → 交易池 → 矿工打包 → 确认」全流程。所有金额以聪（satoshi）为最小单位计算，`手续费 = 输入 − 输出`，逻辑与真实规则一致。
2. **PoW 挖矿模拟器**：使用真实 SHA-256（Web Crypto API），可调难度（1–6 个前导零），支持单步与连续挖矿，实时显示 nonce、哈希、前导零与尝试次数，并明确说明与真实网络难度（约 60+ 前导零、EH/s 级算力）的差距。
3. **知识地图**：16 个知识点、18 条关联边，点击节点跳转到对应课程或实验；提供「学习主线」视图串联密码学 → 公私钥 → 签名 → UTXO → 交易 → 区块 → 区块链 → PoW → 共识。

### 内容与技术准确性

- 密码学实验室使用**真实算法**：SHA-256 为浏览器 Web Crypto 原生实现；secp256k1 公钥派生、HASH160、Base58Check 为纯 TypeScript 实现，已通过官方测试向量校验（私钥 `1` → 公钥 `0279be66…` → 地址 `1BgGZ9tc…`）。
- 教学模拟（交易、区块链结构）明确标注「教学模拟」，不冒充真实协议。
- 未激活的协议提案不会被描述成已实施功能；技术演进内容标注资料日期。
- 经济学模块同时呈现支持者与批评者观点，不把投资价值写成确定事实。
- 所有密钥仅浏览器本地生成，不上传、不保存；不提供输入真实私钥/助记词的入口。

---

## 二、项目目录

```
bitcoin-academy/
├── public/
│   ├── manifest.webmanifest      # PWA 清单
│   ├── sw.js                     # Service Worker（网络优先 + 离线回退）
│   └── icons/                    # PWA 图标（192/512 PNG + SVG 源）
├── src/
│   ├── main.tsx                  # 应用入口
│   ├── App.tsx                   # 路由（hash 路由）与页面切换
│   ├── index.css                 # 设计系统 / 全局样式
│   ├── types/index.ts            # 全部 TypeScript 类型定义
│   ├── data/
│   │   ├── modules.ts            # 10 个模块元数据
│   │   ├── lessons/module01..10.ts   # 30 节课内容（与组件分离）
│   │   ├── questions/module01..10.ts # 108 道题题库
│   │   ├── knowledgeMap.ts       # 知识地图节点与连线
│   │   └── index.ts              # 数据汇总与索引
│   ├── store/LearningStore.tsx   # 学习状态管理 + LocalStorage 持久化
│   ├── utils/
│   │   ├── crypto.ts             # 真实 SHA-256、Base58 等
│   │   ├── bitcoinCrypto.ts      # secp256k1 / HASH160 / 地址生成
│   │   ├── grader.ts             # 判分引擎（5 种题型判分语义）
│   │   └── format.ts             # 金额/日期/连续天数工具
│   ├── components/
│   │   ├── layout/               # 底部导航、桌面侧栏、应用外壳
│   │   ├── ui/                   # 通用组件、进度环、内容渲染器
│   │   ├── viz/Diagram.tsx       # 结构化图解渲染
│   │   └── labs/                 # 6 个互动实验室 + 注册表
│   └── pages/                    # 首页、课程、课程详情、实验室、知识地图、我的
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig*.json
└── README.md
```

架构原则：课程内容与页面组件分离、学习数据独立管理、模块清晰拆分（无单一巨型 App 文件）。

---

## 三、本地运行

```bash
cd bitcoin-academy
npm install
npm run dev
```

浏览器打开终端显示的本地地址（默认 `http://localhost:5173/`）。

生产构建与预览：

```bash
npm run build      # 类型检查 + 生产构建，输出到 dist/
npm run preview    # 本地预览构建产物
```

> 说明：本地开发 base 为 `/`；仅 GitHub Pages 项目站点部署时需要 `/bitcoin-academy/`，通过构建时设置环境变量 `VITE_GH_PAGES=1` 自动切换。

---

## 四、GitHub Pages 部署

**本项目已上线：https://x13502239474-oss.github.io/bitcoin-academy/**

采用 **`gh-pages` 分支部署**（源码在 `main`，构建产物在 `gh-pages`），仓库 Settings → Pages 的 Source 为 `gh-pages` 分支根目录。

发布/更新命令：

```bash
VITE_GH_PAGES=1 npm run build          # 生成 /bitcoin-academy/ 前缀的产物
cd dist && touch .nojekyll             # 关闭 Jekyll 处理
git init -b gh-pages && git add -A && git commit -m deploy
git push -f origin gh-pages            # 推送后 Pages 自动重建
```

关键点：构建时 `VITE_GH_PAGES=1` 让资源路径匹配项目站点子路径（`/bitcoin-academy/`），Service Worker 注册路径与作用域随 base 自动适配。

> 若希望改为 **GitHub Actions 自动部署**（每次 push 自动构建），需将 `.github/workflows/deploy.yml` 纳入版本管理；该文件已在本地生成（备份于项目上级目录 `deploy.yml.bak`），但推送它要求 GitHub token 具备 `workflow` 权限。补上该权限后即可启用。

---

## 五、手机端访问验证

- 采用 Mobile First 设计，适配 iPhone 常见屏幕（Safe Area 安全区适配）。
- 底部固定五宫格导航（首页 / 课程 / 实验室 / 知识库 / 我的），触摸目标 ≥ 44px。
- 正文行高 1.85、字号适合移动端阅读；复杂图表为纵向/可滚动布局，无横向溢出。
- 六个实验室均可在手机端操作（滑块、按钮、输入均可触控）。
- PWA：Safari 打开后「分享 → 添加到主屏幕」，即可全屏离线使用。

建议验证清单：
1. iPhone Safari 打开首页，检查进度仪表盘与底部导航显示正常。
2. 进入「实验室 → UTXO 交易模拟器」，调整金额与手续费，走完整个流程。
3. 进入「挖矿模拟器」，设置难度 3，点击开始挖矿，观察找到区块。
4. 进入「知识地图」，点击节点跳转。
5. 完成一节课程并标记学完，杀掉浏览器进程后重开，确认进度保留。
6. 添加到主屏幕，断网后打开，确认课程可离线阅读。

---

## 六、功能测试结果

| 测试项 | 方法 | 结果 |
|--------|------|------|
| 生产构建 | `npm run build` | 通过（TypeScript 无错误） |
| 数据一致性 | 脚本校验 30 课 / 108 题 | 零死链、零非法结构 |
| 判分引擎 | 20 项单元测试（正常/变体/错误/未作答/全角归一化） | 20/20 通过 |
| secp256k1 公钥派生 | 官方向量：私钥 1 → 压缩公钥 | 一致 |
| 完整地址生成 | 官方向量：私钥 1 → `1BgGZ9tc…` | 一致 |
| SHA-256 | 空串/标准向量对比 Node crypto | 一致 |
| RIPEMD-160 | 4 组标准向量对比 Node crypto | 一致 |
| 浏览器交互测试 | Chrome CDP 自动化（18 项） | 18/18 通过 |
| 手机端渲染 | Chrome headless 390×844 截图首页/课程/UTXO/挖矿/知识地图 | 布局正常，零横向溢出 |
| 进度持久化 | 标记学完 → 刷新页面 → 检查状态 | 通过 |
| 真实挖矿 | 点击开始挖矿 → 找到满足难度的区块 | 通过 |

---

## 七、知识来源与版权

核心教材：《精通比特币》第三版（Mastering Bitcoin, 3rd Edition），Andreas M. Antonopoulos / David A. Harding 著（2023）。

参考来源：
- Bitcoin Core 官方文档：https://bitcoincore.org/en/doc/
- Bitcoin BIPs：https://github.com/bitcoin/bips
- Bitcoin Developer Guide：https://developer.bitcoin.org/devguide/
- 比特币白皮书：https://bitcoin.org/bitcoin.pdf

课程内容以自己的语言重新组织，不照抄原文；引用处标注出处。技术状态标注资料日期（2026-11）。本项目为个人学习用途，不构成任何投资建议。
