import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export async function generateCertificate(name: string, college: string): Promise<Buffer> {
    // Use process.cwd() to resolve the public directory correctly on Vercel
    const templatePath = path.join(process.cwd(), 'public', 'image_copy_7.png');
    
    if (!fs.existsSync(templatePath)) {
        throw new Error('Certificate template not found at ' + templatePath);
    }

    const width = 1599;
    const height = 1131;

    // Dynamic font scaling (Aggressive for very long names/colleges to prevent border crossing)
    const nameFontSize = name.length > 15 ? Math.max(20, 52 - (name.length - 15) * 2.2) : 52;
    const collegeFontSize = college.length > 25 ? Math.max(18, 32 - (college.length - 25) * 0.5) : 32;

    // Separate x positions to maximize space
    const nameX = "36%";    // Nudged right to give space after "Mr. / Ms."
    const collegeX = "26%"; // Start from the beginning of its dotted line to maximize room

    const nameColor = "#1B2631"; // Premium Deep Navy Blue for the Name
    const collegeColor = "#515a5a"; // Gunmetal Grey for the College

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

    // SVG for text overlays (Using inline styles for max compatibility with Sharp)
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

    // Return a Buffer directly — avoids file system write issues on Vercel/serverless
    const outputBuffer = await sharp(templatePath)
        .composite([
            {
                input: Buffer.from(svgText),
                top: 0,
                left: 0,
            },
        ])
        .png()
        .toBuffer();

    return outputBuffer;
}
