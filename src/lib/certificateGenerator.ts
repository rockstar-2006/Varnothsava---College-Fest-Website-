import sharp from 'sharp';

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

    const nameX = Math.round(width * 0.36);     // 36% of width in px
    const collegeX = Math.round(width * 0.26);   // 26% of width in px
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

    // Fetch template image via URL (works on Vercel — public folder served via CDN)
    const baseUrl = new URL(requestUrl);
    const origin = `${baseUrl.protocol}//${baseUrl.host}`;
    console.log(`[CERT] Fetching template from: ${origin}/image_copy_7.png`);

    const templateRes = await fetch(`${origin}/image_copy_7.png`);
    if (!templateRes.ok) {
        throw new Error(`Failed to fetch certificate template: ${templateRes.status}`);
    }
    const templateBuffer = Buffer.from(await templateRes.arrayBuffer());

    // Use presentation attributes (NOT style="") for maximum librsvg compatibility
    // Use DejaVu Serif / Liberation Serif — guaranteed on Amazon Linux 2 (Vercel Lambda)
    const svgText = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <text
    x="${nameX}"
    y="595"
    font-family="DejaVu Serif, Liberation Serif, Georgia, serif"
    font-size="${nameFontSize}"
    font-weight="bold"
    fill="${nameColor}"
    text-anchor="start"
  >${safeName}</text>
  <text
    x="${collegeX}"
    y="653"
    font-family="DejaVu Serif, Liberation Serif, Georgia, serif"
    font-size="${collegeFontSize}"
    font-weight="normal"
    font-style="italic"
    fill="${collegeColor}"
    text-anchor="start"
  >${safeCollege}</text>
</svg>`;

    const outputBuffer = await sharp(templateBuffer)
        .composite([{
            input: Buffer.from(svgText),
            top: 0,
            left: 0,
        }])
        .png()
        .toBuffer();

    return outputBuffer;
}
