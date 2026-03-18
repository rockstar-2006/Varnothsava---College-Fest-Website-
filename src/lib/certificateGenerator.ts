import sharp from 'sharp';

export async function generateCertificate(
    name: string,
    college: string,
    requestUrl: string
): Promise<Buffer> {

    const width = 1599;
    const height = 1131;

    // Dynamic font scaling
    const nameFontSize = name.length > 15 ? Math.max(20, 52 - (name.length - 15) * 2.2) : 52;
    const collegeFontSize = college.length > 25 ? Math.max(18, 32 - (college.length - 25) * 0.5) : 32;

    const nameX = "36%";
    const collegeX = "26%";
    const nameColor = "#1B2631";
    const collegeColor = "#515a5a";

    const escapeXml = (unsafe: string) => {
        return unsafe.replace(/[<>&"']/g, (c) => {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '"': return '&quot;';
                case "'": return '&apos;';
                default: return c;
            }
        });
    };

    const safeName = escapeXml(name.toUpperCase());
    const safeCollege = escapeXml(college.toUpperCase());

    const baseUrl = new URL(requestUrl);
    const origin = `${baseUrl.protocol}//${baseUrl.host}`;

    // Fetch template image
    console.log(`[CERT] Fetching template from: ${origin}/image_copy_7.png`);
    const templateRes = await fetch(`${origin}/image_copy_7.png`);
    if (!templateRes.ok) {
        throw new Error(`Failed to fetch certificate template: ${templateRes.status}`);
    }
    const templateBuffer = Buffer.from(await templateRes.arrayBuffer());

    // Fetch a bold serif font from Google Fonts CDN and embed as base64
    // Playfair Display Bold — ideal for certificates
    let fontBase64 = '';
    try {
        const fontRes = await fetch(
            'https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXBzDwcbmjWBN2PKd3vUA_.woff2'
        );
        if (fontRes.ok) {
            fontBase64 = Buffer.from(await fontRes.arrayBuffer()).toString('base64');
            console.log('[CERT] Font loaded successfully');
        }
    } catch (e) {
        console.warn('[CERT] Could not load custom font, falling back to system serif');
    }

    const fontFaceDeclaration = fontBase64
        ? `@font-face {
            font-family: 'CertFont';
            src: url('data:font/woff2;base64,${fontBase64}') format('woff2');
            font-weight: bold;
        }`
        : '';

    const fontFamily = fontBase64 ? "'CertFont', 'Georgia', serif" : "'Georgia', 'Liberation Serif', serif";

    const svgText = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <defs>
            <style>
                ${fontFaceDeclaration}
            </style>
        </defs>
        <text 
            x="${nameX}" 
            y="595" 
            font-family="${fontFamily}"
            font-size="${nameFontSize}"
            font-weight="bold"
            fill="${nameColor}"
            text-anchor="start"
        >${safeName}</text>
        <text 
            x="${collegeX}" 
            y="653" 
            font-family="${fontFamily}"
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
