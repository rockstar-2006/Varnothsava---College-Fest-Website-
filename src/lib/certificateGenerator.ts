import sharp from 'sharp';

export async function generateCertificate(
    name: string,
    college: string,
    requestUrl: string
): Promise<Buffer> {

    const width = 1599;
    const height = 1131;

    // Dynamic sizing logic
    const nameFontSize = name.length > 15 ? Math.max(22, 54 - (name.length - 15) * 2) : 54;
    const collegeFontSize = college.length > 25 ? Math.max(18, 34 - (college.length - 25) * 0.5) : 34;

    const nameX = Math.round(width * 0.36);
    const collegeX = Math.round(width * 0.26);
    
    // Nudge names for visual alignment
    const nameY = 594; 
    const collegeY = 654;

    // ── XML Escaping ───────────────────────────────────────────────────────────
    const escapeXml = (unsafe: string) => {
        return unsafe.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    };

    const safeName = escapeXml(name.toUpperCase());
    const safeCollege = escapeXml(college.toUpperCase());

    // ── Template image fetch ─────────────────────────────────────────────────────────
    const baseUrl = new URL(requestUrl);
    const origin = `${baseUrl.protocol}//${baseUrl.host}`;
    const templateRes = await fetch(`${origin}/image_copy_7.png`);
    if (!templateRes.ok) throw new Error(`Template fetch failed: ${templateRes.status}`);
    const templateBuffer = Buffer.from(await templateRes.arrayBuffer());

    // ── SVG XML ───────────────────────────────────────────────────────────────────────
    // Using EXACTING XML standards to avoid the "corrupt header" error.
    // Specifying "Liberation Serif" directly which is the standard on Vercel's Linux.
    const svgOverlay = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .nameText { font-family: "Liberation Serif", serif; font-weight: bold; font-size: ${nameFontSize}px; fill: #1B2631; }
    .collText { font-family: "Liberation Serif", serif; font-style: italic; font-size: ${collegeFontSize}px; fill: #515a5a; }
  </style>
  <text x="${nameX}" y="${nameY}" class="nameText" text-anchor="start">${safeName}</text>
  <text x="${collegeX}" y="${collegeY}" class="collText" text-anchor="start">${safeCollege}</text>
</svg>`, 'utf-8');

    // ── Output ──────────────────────────────────────────────────────────
    const outputBuffer = await sharp(templateBuffer)
        .composite([{ 
            input: svgOverlay, 
            top: 0, 
            left: 0 
        }])
        .png()
        .toBuffer();

    return outputBuffer;
}
