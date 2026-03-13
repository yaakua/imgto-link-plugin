# FaFaFa-全部发 多语言打包说明（中文）

## 已完成的打包结构

当前扩展包已经支持标准浏览器扩展 i18n 结构：

- `manifest.json` 使用 `__MSG_...__` 占位符
- `default_locale` 设置为 `en`
- 已提供：
  - `apps/extension/_locales/en/messages.json`
  - `apps/extension/_locales/zh_CN/messages.json`

重新打包后，`dist/` 中会包含 `_locales` 目录。

## Edge / Chrome 通常可自动识别的字段

- 扩展名称（name）
- manifest 描述（description）
- action 标题（default_title）

## 通常仍需在商店后台手动填写的字段

- 长描述 / 详细描述
- 截图
- 图标与宣传图
- 分类、标签、支持链接等商店表单字段

## 建议操作

1. 重新执行构建，确保 `dist/_locales/...` 存在
2. 用新的压缩包重新上传到 Edge / Chrome 商店后台
3. 检查名称和短描述是否自动带出
4. 长描述仍然使用 `assets/store/listing-copy*.md` 手动粘贴

## 注意

把 `listing-copy.en.md` / `listing-copy.zh-CN.md` 直接放进扩展包，不会被商店自动当作“长描述”读取。  
商店主要读取的是：

- `manifest.json`
- `_locales/*/messages.json`
- 以及你在商店后台表单中填写的内容
