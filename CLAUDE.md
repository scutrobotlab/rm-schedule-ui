# CLAUDE.md — rm-schedule-ui

## 项目概述

**rm-schedule-ui** 是 RoboMaster 赛程分析软件的前端，由华南虎软件开发组维护。用于在瑞士轮等复杂赛制下，将各赛区、赛段的对阵与晋级关系可视化，帮助队伍与观众快速理解对阵与晋级路径。

- 线上地址：<https://schedule.scutbot.cn/>
- 后端仓库：<https://github.com/scutrobotlab/rm-schedule>（本仓库仅为 UI）
- 许可协议：Apache 2.0

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 语言 | TypeScript（strict）、Vue SFC |
| UI 框架 | Vue 3（`<script setup>`） |
| 组件库 | Vuetify 3（深色默认主题） |
| 构建 | Vite 6（`vite.config.mts`） |
| 路由 | Vue Router 4（手写路由表） |
| 状态 | Pinia（`defineStore`） |
| HTTP | axios |
| 图表 | ECharts 5 + vue-echarts |
| 关系图 | relation-graph-vue3 |
| 时间 | moment |
| 汉字搜索 | pinyin-match |
| 视频嵌入 | vue-bilibili-embed-renderer |
| 统计 | vue-gtag（GA）+ 百度统计（生产 HTML 内） |
| 样式 | Sass/SCSS、@mdi/font、roboto-fontface |
| 工程插件 | unplugin-auto-import、unplugin-vue-components、vite-plugin-vuetify、vite-plugin-vue-layouts、unplugin-fonts |
| 容器 | Docker 多阶段构建（Node 构建 + nginx:alpine 静态托管） |

---

## 项目结构

```
rm-schedule-ui/
├── index.html              # 入口 HTML，生产环境含百度统计
├── vite.config.mts         # Vite 配置、插件、@ 别名、/api 代理
├── tsconfig.json           # TS 严格模式，路径别名 @/* → src/*
├── Dockerfile              # pnpm 构建 + nginx 部署
├── etc/default.conf        # nginx SPA try_files 配置
├── public/                 # favicon、background/、static/
└── src/
    ├── main.ts             # 应用入口，注册插件，挂载 #app
    ├── App.vue             # v-app + UpdateAnnouncement + router-view
    ├── router/index.ts     # 手写路由表
    ├── plugins/            # Vuetify、集中 registerPlugins
    ├── stores/             # Pinia store（app、promotion、robot_data）
    ├── pages/index.vue     # 主页面，挂载 Situation + About
    ├── components/         # 核心 UI 组件
    ├── constant/           # 赛季、ZoneMap、各赛区 JSON 图数据
    ├── types/              # 赛程、排名、机器人数据等 TS 类型
    └── utils/cdn.ts        # CDN URL 改写为 /api/static/... 代理路径
```

---

## 核心功能

- **多赛季 / 多赛区切换**：顶部 Season / Zone 选择，非法参数回退默认值
- **对阵关系图**：`relation-graph-vue3` 固定布局，数据由常量 JSON + 实时赛程拼合
- **定时刷新**：`MatchGraph.vue` 约每 30s 拉取赛程、积分排名、机器人数据
- **预测模式**：URL `?predict=1` 开启，显示预测开关（`promotionStore.suggestionEnabled`）
- **直播模式**：URL `?live=1` 简化界面，便于导播透明底图等场景
- **队伍搜索**：`SearchPlayer.vue` 支持校名 / 队名 / 拼音，可跨赛区跳转
- **分析面板**：`AnalyzeTeam`（排名、雷达图、数据表）、`AnalyzeMatch`（对阵分析）、`HistoryMatch`（历史交锋）
- **王牌预言家 / 小程序投票**：`/api/mp/match` 拉取数据，在关系图上展示支持率
- **CDN 代理**：`StaticCDN()` 将 DJI / 阿里云 / S3 等域名统一换成 `/api/static/...`（`utils/cdn.ts`）
- **更新公告**：`UpdateAnnouncement` 根据 localStorage 版本码决定是否弹窗

---

## 开发与构建命令

项目推荐使用 **yarn**（根目录有 `yarn.lock`）；Dockerfile 中使用 **pnpm**。

```bash
yarn install          # 安装依赖
yarn dev              # 启动开发服务器（端口 3000）
yarn build            # 类型检查 + 生产构建
yarn preview          # 预览构建产物
yarn lint             # ESLint 自动修复
```

Docker 构建（参考 README）：

```bash
docker build -t rm-schedule-ui .
```

开发环境 `/api` 代理配置在 `vite.config.mts`，转发到 `http://localhost:8080`（后端服务）。

---

## 路由

定义在 `src/router/index.ts`（手写，非文件式路由）：

| 路径 | 组件 | 说明 |
|------|------|------|
| `/` | `pages/index.vue` | 默认赛季与赛区 |
| `/:season` | `pages/index.vue` | 指定赛季 |
| `/:season/:zoneId` | `pages/index.vue` | 指定赛季与赛区 |

**Query 参数：**

| 参数 | 说明 |
|------|------|
| `group` | 当前选中赛段 Tab |
| `live` | `1` 开启直播模式 |
| `predict` | `1` 开启预测模式 |

---

## 状态管理（Pinia）

| Store | 职责 |
|-------|------|
| `useAppStore` | 对话框布尔状态、`initStore`（更新公告） |
| `usePromotionStore` | 当前 season/zoneId、赛程 `schedule`、小组榜 `groupRank`、`mpMatchMap`、选中队伍/场次、B 站回放、预测开关；内含 axios 拉取逻辑 |
| `useRobotDataStore` | 机器人性能数据、`existRobotDataSet`、分区/复赛/决赛展示 Map、均值与峰值计算 |

---

## API 端点

开发环境由 Vite 代理到 `http://localhost:8080`。

| 端点 | 用途 |
|------|------|
| `GET /api/schedule` | 赛程总数据 |
| `GET /api/group_rank_info` | 小组积分排名 |
| `GET /api/mp/match?match_ids=` | 小程序对局/预言家数据 |
| `GET /api/robot_data` | 机器人统计数据 |
| `GET /api/rank` | 学校/队伍排名 |
| `GET /api/history_match` | 两队历史对阵 |
| `GET /api/match_order_to_video` | 场次对应录像 |
| `GET /api/team_info` | 队伍详情 |
| `/api/static/...` | 静态资源代理（CDN 绕 CORS） |

---

## 注意事项

- **包管理器不统一**：`yarn.lock` 在仓库内，但 Dockerfile 使用 pnpm；本地开发以 yarn 为准。
- **Pinia 在 devDependencies**：运行时实际使用 Pinia，但 `package.json` 将其列在 `devDependencies`，与常规做法不符（不影响功能）。
- **无测试配置**：`package.json` 中无 `test` 脚本，未引入 Vitest / Jest / Cypress。
- **双统计**：生产环境同时启用百度统计（`index.html`）和 vue-gtag（`VITE_APP_GA_ID`）。
- **文件式路由未接管**：`unplugin-vue-router` 已在 Vite 插件中启用（用于生成 `typed-router.d.ts`），但实际路由仍以 `router/index.ts` 手写为准。
- **大型静态配置驱动**：各赛区的图结构与轮次顺序大量硬编码在 `src/constant/`，运行时与 API 赛程合并后渲染。
