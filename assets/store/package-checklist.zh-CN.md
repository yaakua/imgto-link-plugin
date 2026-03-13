# FaFaFa-全部发 最终打包清单（中文）

## 一、用于上传商店的目录

上传 Edge / Chrome 商店时，使用：

- `apps/extension/dist/`

不要直接上传源码目录 `apps/extension/`。

## 二、包内必须包含

### 1) 核心文件
- `manifest.json`
- `offscreen.html`

### 2) 构建产物
- `bundles/background.js`
- `bundles/content.js`
- `bundles/inject.js`
- `bundles/offscreen.js`
- `bundles/platforms/*`

### 3) 图标资源
- `icons/imgtolink_publisher_16.png`
- `icons/imgtolink_publisher_48.png`
- `icons/imgtolink_publisher_128.png`

### 4) 多语言资源
- `_locales/en/messages.json`
- `_locales/zh_CN/messages.json`

## 三、包内不需要包含

以下文件/目录用于开发或上架准备，不需要进入商店压缩包：

- `assets/store/*`
- `README.md`
- `PRIVACY.md`
- `scripts/*`
- 源码目录 `src/*`
- 工作区源码 `packages/*`

## 四、上传前核对项

1. `dist/manifest.json` 中应包含：
   - `default_locale`
   - `__MSG_extensionName__`
   - `__MSG_extensionDescription__`
2. `dist/_locales/en/messages.json` 存在
3. `dist/_locales/zh_CN/messages.json` 存在
4. `dist/icons/*` 存在
5. `dist/bundles/*` 存在

## 五、推荐打包步骤

1. 运行构建：
   - `bun run build`
2. 进入目录：
   - `apps/extension/dist`
3. 将 `dist` 目录内容压缩成 zip
4. 把 zip 上传到 Chrome / Edge 商店后台
