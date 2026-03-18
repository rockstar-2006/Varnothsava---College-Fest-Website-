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
    const nameY = 548; 
    const collegeY = 620;

    // ── Template image fetch ─────────────────────────────────────────────────────────
    const baseUrl = new URL(requestUrl);
    const origin = `${baseUrl.protocol}//${baseUrl.host}`;
    const templateRes = await fetch(`${origin}/image_copy_7.png`);
    if (!templateRes.ok) throw new Error(`Template fetch failed: ${templateRes.status}`);
    const templateBuffer = Buffer.from(await templateRes.arrayBuffer());

    // ── SHARP NATIVE TEXT RENDERING (No SVG Tags) ───────────────────────────────────
    // This is the most robust way on Vercel/Linux. It bypasses the SVG font bugs
    // by using Sharp's internal text rendering engine directly.
    
    // 1. Create Transparent PNG for Name
    const nameOverlay = await sharp({
        text: {
            text: `<span foreground='#1B2631' font_weight='bold'>${name.toUpperCase()}</span>`,
            font: 'serif',
            fontSize: nameFontSize,
            rgba: true,
            align: 'left'
        }
    }).png().toBuffer();

    // 2. Create Transparent PNG for College
    const collegeOverlay = await sharp({
        text: {
            text: `<span foreground='#515a5a' font_style='italic'>${college.toUpperCase()}</span>`,
            font: 'serif',
            fontSize: collegeFontSize,
            rgba: true,
            align: 'left'
        }
    }).png().toBuffer();

    // 3. Composite everything onto the template
    const outputBuffer = await sharp(templateBuffer)
        .composite([
            { input: nameOverlay, left: nameX, top: nameY },
            { input: collegeOverlay, left: collegeX, top: collegeY }
        ])
        .png()
        .toBuffer();

    return outputBuffer;
}
