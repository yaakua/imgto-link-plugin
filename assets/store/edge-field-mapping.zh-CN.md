# FaFaFa-全部发 Edge 提交字段对照表（中文）

## 适用页面
- Edge Add-ons 后台的 Store Listings / Description / Images / Notes 等表单

## 字段对照

### 扩展名
- 来源：`manifest.json`
- 自动方式：通过 `_locales` + `__MSG_extensionName__`
- 当前值：FaFaFa-全部发

### 简短描述 / manifest 描述
- 来源：`apps/extension/_locales/*/messages.json`
- 自动方式：通过 `__MSG_extensionDescription__`
- 说明：可尝试由后台自动解析；若未带出，可手动复制短描述

### 详细描述（长描述）
- 中文：`assets/store/listing-copy.edge.zh-CN.md`
- 英文：`assets/store/listing-copy.edge.en.md`

### 审核备注
- 中文：`assets/store/reviewer-notes.zh-CN.md`
- 英文：`assets/store/reviewer-notes.en.md`

### 截图文案
- 规划：`assets/store/screenshot-plan.zh-CN.md`
- 字幕：`assets/store/screenshot-captions.zh-CN.md`

### 英文截图文案
- 规划：`assets/store/screenshot-plan.en.md`
- 字幕：`assets/store/screenshot-captions.en.md`

### 宣传横幅
- 文件：`assets/store/promo-1400x560.svg`

### 隐私说明
- 文件：`PRIVACY.md`
- 建议：若后台要求 URL，可使用你后续上线的官网隐私页地址；若只需文本，可参考该文件整理

## 建议填写顺序
1. 先上传 zip 包
2. 看名称/短描述是否自动带出
3. 手动粘贴长描述
4. 上传截图
5. 填 reviewer notes
6. 最后检查链接是否都指向 `https://fafafa.ai`
