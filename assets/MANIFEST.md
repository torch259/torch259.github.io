# 素材清单 MANIFEST

> 本表是素材**唯一登记表**：生产素材的 Agent 完成一项就更新一行；评审与"人审 gate"都以此为准。
> 状态流转：`待生成 → 已生成 → 已审核 → 已挂接 → 已废弃(注明原因)`。
> 当前项目处于 **Phase 1（风格规格）之前的盘点期**：仓库内暂无任何图片/音频素材，以下为规划条目。

| ID | 文件 | 挂点 | 尺寸 | 格式 | ≤大小 | 状态 | 提示词存档 | 版权备注 |
|---|---|---|---|---|---|---|---|---|
| IMG-HERO | assets/bg/hero-main.webp | #view-home / .hero | 1600×900 | webp | 400KB | 待生成 | prompts/IMG-HERO.md | 原创 AI（风格致敬，禁官方图） |
| IMG-AVATAR | assets/bg/avatar-me.webp | #avatar | 512×512 | webp | 200KB | 待生成 | prompts/IMG-AVATAR.md | 本人照片风格化（原料入 originals/） |
| IMG-COVER | assets/ui/cover-placeholder.webp | #cover（空状态占位） | 256×256 | webp | 30KB | 待生成 | prompts/IMG-COVER.md | 程序化/AI 原创 |
| TX-NOISE | （推荐内联 SVG data-URI） | body::after | 矢量 | svg | 3KB | 待生成 | — | 程序化 |
| TX-HALFTONE | （推荐内联 SVG data-URI） | 强调色块/按钮 | 矢量 | svg | 3KB | 待生成 | — | 程序化 |
| TX-STRIKE | （推荐内联 SVG data-URI） | 斜条纹分隔/标签 | 矢量 | svg | 3KB | 待生成 | — | 程序化 |
| FNT-DISPLAY | assets/fonts/display-latin.woff2 | 标题/时钟数字 | — | woff2 | 200KB | 待生成 | — | OFL 开源（如 Bebas Neue/Anton/Oswald） |
| FNT-CJK | assets/fonts/cjk-*.woff2（子集化） | 中文标题/正文 | — | woff2 | ≤1MB/套 | 待生成 | — | OFL 开源（Noto Sans SC 等） |

## 增补说明（记录新素材怎么加）
- 新素材 = 新增一行 + `prompts/` 存档 + 挂点必须能在 `index.html` 找到对应元素/选择器；
- 素材被页面代码引用后立刻把状态改为 `已挂接`，未引用前不允许删除；
- 任何一行不允许携带"官方截图/搬运图"类备注，否则视为违规素材。
