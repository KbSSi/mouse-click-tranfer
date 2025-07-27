# 🔍 插件安装验证指南

## ✅ 最新修复版本

### 当前配置
- **权限**: 仅 `storage`（最小权限）
- **Service Worker**: 最小化版本
- **状态**: 应该可以正常安装

### 📁 确认文件位置
```
~/workspace/code/AI/time_transfer/extension-build/
```

## 🚀 安装步骤

### 1. 清理旧版本
1. 打开 `chrome://extensions/`
2. 如果已安装旧版本，点击"移除"
3. 清空浏览器缓存（可选）

### 2. 安装新版本
1. 确保"开发者模式"已开启
2. 点击"加载已解压的扩展程序"
3. 选择 `extension-build` 目录
4. 点击"选择文件夹"

### 3. 验证安装
- ✅ 插件图标出现在工具栏
- ✅ 没有错误提示
- ✅ 状态显示"已启用"

## 🔧 如果仍然报错

### 方案 1: 检查文件完整性
```bash
ls -la extension-build/
```
应该看到：
- manifest.json
- background.js
- content.js
- popup.html
- popup.js
- content.css
- demo.html
- icons/

### 方案 2: 手动验证 manifest.json
确保内容为：
```json
{
  "manifest_version": 3,
  "name": "Time Transfer & Translator",
  "version": "1.0.0",
  "description": "Mouse selection for timestamp conversion and translation",
  "permissions": [
    "storage"
  ],
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["content.css"]
    }
  ],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html",
    "default_title": "Time Transfer & Translator"
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

### 方案 3: 检查 Service Worker
1. 安装插件后，在 `chrome://extensions/` 页面
2. 找到插件，点击"检查视图" → "Service Worker"
3. 应该看到控制台输出：
   ```
   Time Transfer & Translator Service Worker 启动
   插件已安装
   Service Worker 初始化完成
   ```

## 🎯 功能测试

### 基础测试
1. 点击插件图标 → 应该显示弹窗
2. 在弹窗中输入时间戳 `1640995200` → 点击转换
3. 应该显示转换结果

### 页面测试
1. 打开 `extension-build/demo.html`
2. 选中时间戳 → 左键点击
3. 选中英文文本 → 右键点击

## 🆘 紧急方案

如果上述方法都不行，可以尝试：

### 创建最简版本
```bash
# 重新构建
npm run build:extension

# 或者手动复制文件
mkdir -p test-extension
cp extension-build/manifest.json test-extension/
cp extension-build/background.js test-extension/
cp extension-build/popup.html test-extension/
cp extension-build/popup.js test-extension/
```

然后加载 `test-extension` 目录。

## 📞 调试信息

如果仍有问题，请提供：
1. Chrome 版本号
2. 错误的完整信息
3. Service Worker 控制台的输出
4. `extension-build/manifest.json` 的实际内容

---

**当前版本**: 最小化 v1.0
**兼容性**: Chrome Manifest V3
**状态**: 应该可以正常安装 ✅
