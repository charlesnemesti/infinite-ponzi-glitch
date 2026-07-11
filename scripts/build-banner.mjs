import sharp from "sharp";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const W = 1500;
const H = 500;

const bgPath =
  process.argv[2] ??
  "C:/Users/ritix/.cursor/projects/C-Users-ritix-AppData-Local-Temp-e4f56ef8-13ea-4633-aec3-1b51b96c64f5/assets/ipg-banner-bg.png";

const overlaySvg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#030303" stop-opacity="0.92"/>
      <stop offset="35%" stop-color="#030303" stop-opacity="0.55"/>
      <stop offset="65%" stop-color="#030303" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#030303" stop-opacity="0.88"/>
    </linearGradient>
    <linearGradient id="glow" x1="0%" y1="50%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#00ff41" stop-opacity="0"/>
      <stop offset="50%" stop-color="#00ff41" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#00ff41" stop-opacity="0"/>
    </linearGradient>
    <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="1" fill="#00ff41" opacity="0.04"/>
    </pattern>
    <filter id="glitch">
      <feOffset in="SourceGraphic" dx="2" dy="0" result="c"/>
      <feOffset in="SourceGraphic" dx="-2" dy="0" result="m"/>
      <feFlood flood-color="#00f0ff" result="cyan"/>
      <feFlood flood-color="#ff0080" result="magenta"/>
      <feComposite in="cyan" in2="c" operator="in" result="cyanLayer"/>
      <feComposite in="magenta" in2="m" operator="in" result="magentaLayer"/>
      <feMerge>
        <feMergeNode in="cyanLayer"/>
        <feMergeNode in="magentaLayer"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect width="${W}" height="${H}" fill="url(#scan)"/>

  <!-- HUD frame -->
  <rect x="24" y="24" width="${W - 48}" height="${H - 48}" fill="none" stroke="#00ff41" stroke-width="1" opacity="0.35"/>
  <path d="M24 24 H80 V24" stroke="#00f0ff" stroke-width="2" opacity="0.7"/>
  <path d="M24 24 V80" stroke="#00f0ff" stroke-width="2" opacity="0.7"/>
  <path d="M${W - 24} ${H - 24} H${W - 80} V${H - 24}" stroke="#ff0080" stroke-width="2" opacity="0.7"/>
  <path d="M${W - 24} ${H - 24} V${H - 80}" stroke="#ff0080" stroke-width="2" opacity="0.7"/>

  <!-- Decorative code lines -->
  <text x="1100" y="60" fill="#00ff41" opacity="0.25" font-family="monospace" font-size="11">&gt; STACK_OVERFLOW_IMMINENT</text>
  <text x="1100" y="78" fill="#00f0ff" opacity="0.2" font-family="monospace" font-size="11">&gt; ATTENTION_FI::ACTIVE</text>
  <text x="1100" y="96" fill="#ff0080" opacity="0.2" font-family="monospace" font-size="11">&gt; SEASON_01::30%_ALLOC</text>
  <text x="48" y="${H - 48}" fill="#00ff41" opacity="0.3" font-family="monospace" font-size="12">ROBINHOOD_CHAIN // MAINNET // 4663</text>

  <!-- Main title -->
  <text x="380" y="215" fill="#00f0ff" opacity="0.45" font-family="monospace" font-size="58" font-weight="bold" filter="url(#glitch)">INFINITE PONZI GLITCH</text>
  <text x="378" y="213" fill="#00ff41" font-family="monospace" font-size="58" font-weight="bold">INFINITE PONZI GLITCH</text>
  <text x="382" y="268" fill="#00ff41" opacity="0.55" font-family="monospace" font-size="22" letter-spacing="8">ATTENTION_FI // CHAIN_4663</text>
  <text x="382" y="310" fill="#ffff00" opacity="0.65" font-family="monospace" font-size="16">&gt;&gt; THE ONLY PONZI THAT ADMITS IT&apos;S A PONZI</text>
  <text x="382" y="340" fill="#00ff41" opacity="0.35" font-family="monospace" font-size="14">CONNECT · QUEST · RANK · EXTRACT · NO WARRANTY</text>

  <!-- Progress bar -->
  <rect x="382" y="365" width="680" height="6" fill="#00ff41" opacity="0.15"/>
  <rect x="382" y="365" width="420" height="6" fill="#00ff41" opacity="0.65"/>
  <text x="1070" y="373" fill="#00ff41" opacity="0.5" font-family="monospace" font-size="11">62%</text>
</svg>`;

async function main() {
  const bg = await sharp(bgPath)
    .resize(W, H, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.85, saturation: 1.15 })
    .blur(0.3)
    .toBuffer();

  const logo = await sharp(resolve(root, "public/logo.png"))
    .resize(280, 280, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const overlay = Buffer.from(overlaySvg);

  const logoLeft = 52;
  const logoTop = Math.round((H - 280) / 2);

  await sharp(bg)
    .composite([
      { input: overlay, top: 0, left: 0 },
      { input: logo, top: logoTop, left: logoLeft },
    ])
    .png({ compressionLevel: 9 })
    .toFile(resolve(root, "public/banner-twitter.png"));

  const meta = await sharp(resolve(root, "public/banner-twitter.png")).metadata();
  console.log(`Banner saved: ${meta.width}x${meta.height}`);
}

main().catch(console.error);
