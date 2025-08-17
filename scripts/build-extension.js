const fs = require('fs');
const path = require('path');

// 清理并创建输出目录
const outDir = path.join(__dirname, '../extension-build');
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

// 复制 manifest.json
const manifestSrc = path.join(__dirname, '../manifest.json');
const manifestDest = path.join(outDir, 'manifest.json');
fs.copyFileSync(manifestSrc, manifestDest);

// 复制插件核心文件
const extensionSrc = path.join(__dirname, '../public/extension');
if (fs.existsSync(extensionSrc)) {
  const extensionFiles = fs.readdirSync(extensionSrc);
  extensionFiles.forEach(file => {
    // 排除 dify-api.js 文件
    if (file === 'dify-api.js') return;
    
    const srcFile = path.join(extensionSrc, file);
    const destFile = path.join(outDir, file);
    if (fs.statSync(srcFile).isFile()) {
      fs.copyFileSync(srcFile, destFile);
    }
  });
}

// 复制图标文件
const iconsSrc = path.join(__dirname, '../public/icons');
const iconsDest = path.join(outDir, 'icons');

if (fs.existsSync(iconsSrc)) {
  fs.mkdirSync(iconsDest, { recursive: true });

  const iconFiles = fs.readdirSync(iconsSrc);
  iconFiles.forEach(file => {
    const srcFile = path.join(iconsSrc, file);
    const destFile = path.join(iconsDest, file);
    if (fs.statSync(srcFile).isFile()) {
      fs.copyFileSync(srcFile, destFile);
    }
  });
}

// 复制演示页面
const demoSrc = path.join(__dirname, '../public/demo.html');
const demoDest = path.join(outDir, 'demo.html');
if (fs.existsSync(demoSrc)) {
  fs.copyFileSync(demoSrc, demoDest);
}

// 复制测试页面
const testSrc = path.join(__dirname, '../public/test.html');
const testDest = path.join(outDir, 'test.html');
if (fs.existsSync(testSrc)) {
  fs.copyFileSync(testSrc, testDest);
}

console.log('Chrome 插件构建完成！');
console.log('插件文件位于: ' + outDir);
console.log('');
console.log('安装步骤:');
console.log('1. 打开 Chrome 浏览器');
console.log('2. 访问 chrome://extensions/');
console.log('3. 开启"开发者模式"');
console.log('4. 点击"加载已解压的扩展程序"');
console.log('5. 选择 extension-build 目录');
