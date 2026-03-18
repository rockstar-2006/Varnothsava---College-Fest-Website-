import sharp from 'sharp';

export async function generateCertificate(
    name: string,
    college: string,
    requestUrl: string
): Promise<Buffer> {

    const width = 1599;
    const height = 1131;

    // Dynamic font scaling logic for the final PNG
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

    // ── Template image fetch ─────────────────────────────────────────────────────────
    const baseUrl = new URL(requestUrl);
    const origin = `${baseUrl.protocol}//${baseUrl.host}`;
    const templateRes = await fetch(`${origin}/image_copy_7.png`);
    if (!templateRes.ok) throw new Error(`Template fetch failed: ${templateRes.status}`);
    const templateBuffer = Buffer.from(await templateRes.arrayBuffer());

    // ── SVG XML ───────────────────────────────────────────────────────────────────────
    // Using THE absolute most standard SVG structure — zero complex font loading.
    // 'serif' is a web safe generic font family mapped to Liberation Serif on Vercel.
    const svgOverlay = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <text 
    x="${nameX}" 
    y="598" 
    font-family="serif" 
    font-size="${nameFontSize}" 
    font-weight="bold" 
    fill="${nameColor}" 
    text-anchor="start"
  >${safeName}</text>
  <text 
    x="${collegeX}" 
    y="658" 
    font-family="serif" 
    font-size="${collegeFontSize}" 
    font-weight="normal" 
    font-style="italic" 
    fill="${collegeColor}" 
    text-anchor="start"
  >${safeCollege}</text>
</svg>`;

    // ── Sharp Composite ────────────────────────────────────────────────────────────────
    const outputBuffer = await sharp(templateBuffer)
        .composite([{ 
            input: Buffer.from(svgOverlay, 'utf-8'), 
            top: 0, 
            left: 0 
        }])
        .png()
        .toBuffer();

    return outputBuffer;
}
