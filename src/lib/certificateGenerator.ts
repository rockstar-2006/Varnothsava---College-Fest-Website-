import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export async function generateCertificate(
    name: string,
    college: string,
    requestUrl: string
): Promise<Buffer> {

    const width = 1599;
    const height = 1131;

    // Dynamic font scaling
    const nameFontSize = name.length > 15 ? Math.max(22, 52 - (name.length - 15) * 2.2) : 52;
    const collegeFontSize = college.length > 25 ? Math.max(18, 32 - (college.length - 25) * 0.5) : 32;

    const nameX = Math.round(width * 0.36);
    const collegeX = Math.round(width * 0.26);
    const nameColor = "#1B2631";
    const collegeColor = "#515a5a";

    const escapeXml = (unsafe: string) => {
        return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    };

    const safeName = escapeXml(name.toUpperCase());
    const safeCollege = escapeXml(college.toUpperCase());

    // ── Template image ─────────────────────────────────────────────────────────
    // Fetch via public URL — works on Vercel (CDN) and locally
    const baseUrl = new URL(requestUrl);
    const origin = `${baseUrl.protocol}//${baseUrl.host}`;
    console.log(`[CERT] Fetching template from: ${origin}/image_copy_7.png`);

    const templateRes = await fetch(`${origin}/image_copy_7.png`);
    if (!templateRes.ok) {
        throw new Error(`Failed to fetch certificate template: ${templateRes.status}`);
    }
    const templateBuffer = Buffer.from(await templateRes.arrayBuffer());

    // ── Font embedding ─────────────────────────────────────────────────────────
    // Read PT Serif Bold from node_modules — committed to git, always available
    // on both local dev and Vercel Lambda (node_modules is bundled)
    let fontBase64 = '';
    let fontFormat = 'woff';
    try {
        const fontPath = path.join(
            process.cwd(),
            'node_modules',
            '@fontsource',
            'pt-serif',
            'files',
            'pt-serif-latin-700-normal.woff'
        );
        if (fs.existsSync(fontPath)) {
            fontBase64 = fs.readFileSync(fontPath).toString('base64');
            console.log('[CERT] PT Serif Bold font loaded from node_modules ✓');
        } else {
            console.warn('[CERT] Font file not found at:', fontPath);
        }
    } catch (e) {
        console.warn('[CERT] Could not load font:', e);
    }

    const fontFaceBlock = fontBase64
        ? `@font-face {
    font-family: "CertFont";
    src: url("data:font/${fontFormat};base64,${fontBase64}") format("${fontFormat}");
    font-weight: bold;
    font-style: normal;
  }`
        : '';

    const fontFamily = fontBase64
        ? '"CertFont", "PT Serif", "Georgia", serif'
        : '"DejaVu Serif", "Liberation Serif", "Georgia", serif';

    // ── SVG overlay ────────────────────────────────────────────────────────────
    const svgText = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <style>
      ${fontFaceBlock}
    </style>
  </defs>
  <text
    x="${nameX}"
    y="595"
    font-family='${fontFamily}'
    font-size="${nameFontSize}"
    font-weight="bold"
    fill="${nameColor}"
    text-anchor="start"
  >${safeName}</text>
  <text
    x="${collegeX}"
    y="653"
    font-family='${fontFamily}'
    font-size="${collegeFontSize}"
    font-weight="normal"
    font-style="italic"
    fill="${collegeColor}"
    text-anchor="start"
  >${safeCollege}</text>
</svg>`;

    const outputBuffer = await sharp(templateBuffer)
        .composite([{ input: Buffer.from(svgText), top: 0, left: 0 }])
        .png()
        .toBuffer();

    return outputBuffer;
}
