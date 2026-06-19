const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const SIZES = [72, 96, 128, 144, 192, 512]
const outDir = path.join(__dirname, '..', 'public', 'icons')

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

async function generate() {
  for (const size of SIZES) {
    const fontSize = Math.round(size * 0.5)
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
        <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="#0D0F14"/>
        <text
          x="50%" y="54%"
          dominant-baseline="middle"
          text-anchor="middle"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="${fontSize}"
          font-weight="900"
          fill="#00D4AA"
        >P</text>
      </svg>`

    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(outDir, `icon-${size}.png`))

    console.log(`✓ icon-${size}.png`)
  }
  console.log('\nDone! Icons saved to public/icons/')
}

generate().catch(console.error)
