const fs = require('fs');
const path = 'd:\\web\\src\\components\\sections\\EventGrid.tsx';

try {
    const content = fs.readFileSync(path, 'utf8');
    const lines = content.split(/\r?\n/);

    // Line 921 (index 920) is the closing bracket '}'. 
    // We want to keep lines 1 to 921.
    // So we slice from 0 to 921.

    if (lines.length > 925) { // Safety check: only truncate if it's significantly longer
        console.log(`Original line count: ${lines.length}`);
        const newLines = lines.slice(0, 921);

        // Verify the last line is indeed '}' just to be super safe
        const lastLine = newLines[newLines.length - 1].trim();
        if (lastLine === '}') {
            fs.writeFileSync(path, newLines.join('\n'));
            console.log('Successfully truncated EventGrid.tsx to 921 lines.');
        } else {
            console.error(`Aborting: Line 921 is '${lastLine}', expected '}'`);
        }
    } else {
        console.log('File is not as long as expected, skipping truncation.');
    }
} catch (err) {
    console.error('Error:', err);
}
