const fs = require('fs');
const path = require('path');

// 创建简单的 PNG 图标数据 (1x1 像素的蓝色图标)
function createSimplePNG(size) {
  // 这是一个最小的 PNG 文件头和数据
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, size, // width
    0x00, 0x00, 0x00, size, // height
    0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
  ]);

  // 简单的蓝色像素数据
  const pixelData = Buffer.alloc(size * size * 3); // RGB data
  for (let i = 0; i < pixelData.length; i += 3) {
    pixelData[i] = 0x4F;     // R
    pixelData[i + 1] = 0x46; // G
    pixelData[i + 2] = 0xE5; // B
  }

  // 创建一个基本的 PNG 结构
  const basicPNG = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]), // PNG signature
    Buffer.from([0x00, 0x00, 0x00, 0x0D]), // IHDR length
    Buffer.from('IHDR'),
    Buffer.from([0x00, 0x00, 0x00, size, 0x00, 0x00, 0x00, size]), // dimensions
    Buffer.from([0x08, 0x02, 0x00, 0x00, 0x00]), // bit depth, color type, etc.
    Buffer.from([0x00, 0x00, 0x00, 0x00]), // CRC placeholder
    Buffer.from([0x00, 0x00, 0x00, 0x00]), // IEND length
    Buffer.from('IEND'),
    Buffer.from([0xAE, 0x42, 0x60, 0x82]) // IEND CRC
  ]);

  return basicPNG;
}

// 创建图标目录
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 创建不同尺寸的图标
const sizes = [16, 48, 128];
sizes.forEach(size => {
  const iconPath = path.join(iconsDir, `icon${size}.png`);

  // 创建一个简单的彩色方块作为图标
  const canvas = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#4F46E5"/>
    <circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="white" opacity="0.9"/>
    <text x="${size/2}" y="${size/2 + 3}" text-anchor="middle" font-family="Arial" font-size="${size/8}" fill="#4F46E5" font-weight="bold">T</text>
  </svg>`;

  // 将 SVG 内容写入文件（作为临时解决方案）
  fs.writeFileSync(iconPath.replace('.png', '.svg'), canvas);

  // 创建一个简单的文本文件作为占位符
  fs.writeFileSync(iconPath, `# ${size}x${size} PNG icon placeholder\n# Replace with actual PNG file`);
});

console.log('图标文件已创建！');
console.log('注意：这些是占位符文件，建议使用专业工具创建真实的 PNG 图标。');
