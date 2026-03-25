# FaFaFa-全部发 上架提交流程（中文）

## 一、提交前准备
1. 确认扩展名称：`FaFaFa-全部发`
2. 确认 `manifest.json`、README、隐私政策、商店文案一致
3. 准备图标与截图：
   - 128x128 图标
   - 3~5 张商店截图
   - 可选横幅：`promo-1400x560.svg`
4. 准备文案：
   - Chrome：`listing-copy.zh-CN.md` / `listing-copy.en.md`
   - Edge：`listing-copy.edge.zh-CN.md` / `listing-copy.edge.en.md`
   - 审核备注：`reviewer-notes.zh-CN.md` / `reviewer-notes.en.md`

## 二、Chrome Web Store 提交
1. 进入 Chrome Web Store Developer Dashboard
2. 上传打包后的扩展包
3. 填写名称、简短描述、详细描述
4. 上传图标与截图
5. 填写隐私与权限说明
6. 在审核备注中粘贴 `reviewer-notes` 内容
7. 检查商店页面中的链接是否指向：
   - https://fafafa.ai/publish-extension
   - https://fafafa.ai/mdeditor
8. 提交审核

## 三、Edge Add-ons 提交
1. 进入 Microsoft Partner Center / Edge Add-ons 后台
2. 上传扩展包
3. 优先使用 `listing-copy.edge.*` 文案
4. 上传同一组图标与截图
5. 追加审核备注，重点说明：
   - 用户主动触发
   - 本地处理正文
   - 权限仅用于登录检测与内容填充
6. 提交审核

## 四、若审核问到权限
- `cookies`：用于检测目标平台是否已登录
- `clipboardRead`：用于读取 HTML 富文本内容

## 五、审核被拒后的排查顺序
1. 是否权限说明不够清晰
2. 是否截图未体现真实功能
3. 是否品牌名、描述、隐私政策不一致
4. 是否商店链接与实际安装引导页不一致
5. 是否 reviewer notes 没有明确说明“仅用户主动触发”
