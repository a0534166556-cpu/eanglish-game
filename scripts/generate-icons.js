const fs = require('fs');
const path = require('path');

// SVG template for icons
const iconSVG = `<svg width="SIZE" height="SIZE" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#8B5CF6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="text" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#F3F4F6;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <circle cx="256" cy="256" r="240" fill="url(#bg)" stroke="#1E40AF" stroke-width="8"/>
  <circle cx="256" cy="256" r="200" fill="none" stroke="url(#text)" stroke-width="4" opacity="0.3"/>
  <text x="256" y="320" font-family="Arial, sans-serif" font-size="200" font-weight="bold" 
        text-anchor="middle" fill="url(#text)">E</text>
  
  <g transform="translate(180, 120)">
    <rect x="0" y="20" width="80" height="40" rx="20" fill="url(#text)" opacity="0.9"/>
    <circle cx="20" cy="40" r="8" fill="url(#bg)"/>
    <circle cx="60" cy="40" r="8" fill="url(#bg)"/>
    <circle cx="40" cy="25" r="4" fill="url(#bg)"/>
    <circle cx="50" cy="25" r="4" fill="url(#bg)"/>
  </g>
  
  <g fill="url(#text)" opacity="0.8">
    <polygon points="100,80 105,95 120,95 108,105 113,120 100,110 87,120 92,105 80,95 95,95" transform="scale(0.5)"/>
    <polygon points="100,80 105,95 120,95 108,105 113,120 100,110 87,120 92,105 80,95 95,95" transform="translate(350, 50) scale(0.3)"/>
    <polygon points="100,80 105,95 120,95 108,105 113,120 100,110 87,120 92,105 80,95 95,95" transform="translate(80, 350) scale(0.4)"/>
  </g>
</svg>`;

// Icon sizes needed
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate icons for each size
sizes.forEach(size => {
  const svgContent = iconSVG.replace(/SIZE/g, size);
  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(iconsDir, filename);
  
  // For now, we'll create SVG files and note that they need to be converted to PNG
  const svgFilename = `icon-${size}x${size}.svg`;
  const svgFilepath = path.join(iconsDir, svgFilename);
  
  fs.writeFileSync(svgFilepath, svgContent);
  console.log(`Created ${svgFilename}`);
});

// Create shortcut icons
const shortcuts = [
  { name: 'games', icon: '🎮' },
  { name: 'shop', icon: '🛒' },
  { name: 'profile', icon: '👤' }
];

shortcuts.forEach(shortcut => {
  const shortcutSVG = `<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="96" height="96" rx="20" fill="url(#bg)"/>
    <text x="48" y="60" font-family="Arial, sans-serif" font-size="40" text-anchor="middle" fill="white">${shortcut.icon}</text>
  </svg>`;
  
  const filepath = path.join(iconsDir, `${shortcut.name}-shortcut.png`);
  const svgFilepath = path.join(iconsDir, `${shortcut.name}-shortcut.svg`);
  
  fs.writeFileSync(svgFilepath, shortcutSVG);
  console.log(`Created ${shortcut.name}-shortcut.svg`);
});

console.log('\n✅ Icon generation complete!');
console.log('📝 Note: SVG files need to be converted to PNG for production use.');
console.log('💡 You can use online converters or tools like ImageMagick to convert SVG to PNG.');
