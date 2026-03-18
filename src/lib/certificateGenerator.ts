import sharp from 'sharp';

export async function generateCertificate(
    name: string,
    college: string,
    requestUrl: string
): Promise<Buffer> {

    const width = 1599;
    const height = 1131;

    // Dynamic sizing logic
    const nameFontSize = name.length > 15 ? Math.max(22, 54 - (name.length - 15) * 2.2) : 54;
    const collegeFontSize = college.length > 25 ? Math.max(18, 34 - (college.length - 25) * 0.5) : 34;

    const nameX = Math.round(width * 0.36);
    const collegeX = Math.round(width * 0.26);
    
    // Nudge names for visual alignment - these were calibrated for the PNG 1131h
    const nameY = 594; 
    const collegeY = 654;

    // ── Template image fetch ─────────────────────────────────────────────────────────
    const baseUrl = new URL(requestUrl);
    const origin = `${baseUrl.protocol}//${baseUrl.host}`;
    const templateRes = await fetch(`${origin}/image_copy_7.png`);
    if (!templateRes.ok) throw new Error(`Template fetch failed: ${templateRes.status}`);
    const templateBuffer = Buffer.from(await templateRes.arrayBuffer());

    // ── SVG XML (The "Force Fallback" Method) ───────────────────────────────────
    // If native sharp text fails or shows boxes, we go back to the most basic SVG
    // BUT we use THE absolute most generic CSS styles which are harder to break.
    
    const svgOverlay = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .name { font: bold ${nameFontSize}px serif; fill: #1B2631; }
        .college { font: italic ${collegeFontSize}px serif; fill: #515a5a; }
      </style>
      <text x="${nameX}" y="${nameY}" class="name" text-anchor="start">${name.toUpperCase()}</text>
      <text x="${collegeX}" y="${collegeY}" class="college" text-anchor="start">${college.toUpperCase()}</text>
    </svg>`);

    // ── Output ──────────────────────────────────────────────────────────
    // We compose the basic SVG on top of the template.
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
