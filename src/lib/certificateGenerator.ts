import sharp from 'sharp';

export async function generateCertificate(
    name: string,
    college: string,
    requestUrl: string
): Promise<Buffer> {

    const width = 1599;
    const height = 1131;

    // Dynamic font scaling (Aggressive for very long names/colleges to prevent border crossing)
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

    // Build the absolute URL for the template image (works in any environment)
    const url = new URL(requestUrl);
    const templateUrl = `${url.protocol}//${url.host}/image_copy_7.png`;

    console.log(`[CERT] Fetching template from: ${templateUrl}`);

    const templateRes = await fetch(templateUrl);
    if (!templateRes.ok) {
        throw new Error(`Failed to fetch certificate template: ${templateRes.status} ${templateRes.statusText}`);
    }
    const templateBuffer = Buffer.from(await templateRes.arrayBuffer());

    const svgText = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <text 
            x="${nameX}" 
            y="595" 
            style="fill: ${nameColor}; font-family: 'Times New Roman', serif; font-size: ${nameFontSize}px; font-weight: bold; text-anchor: start;"
        >${safeName}</text>
        <text 
            x="${collegeX}" 
            y="653" 
            style="fill: ${collegeColor}; font-family: 'Times New Roman', serif; font-size: ${collegeFontSize}px; font-weight: 500; font-style: italic; text-anchor: start;"
        >${safeCollege}</text>
    </svg>
    `;

    const outputBuffer = await sharp(templateBuffer)
        .composite([{ input: Buffer.from(svgText), top: 0, left: 0 }])
        .png()
        .toBuffer();

    return outputBuffer;
}
