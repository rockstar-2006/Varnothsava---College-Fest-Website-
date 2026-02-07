const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');

const pdfPath = path.resolve('c:\\Varnothsava---College-Fest-Website-\\Varnotasava(Rules of External Events 2k26)-1.pdf');
if (!fs.existsSync(pdfPath)) {
  console.error('PDF not found at', pdfPath);
  process.exit(2);
}
const dataBuffer = fs.readFileSync(pdfPath);

pdf(dataBuffer).then(function(data){
  fs.mkdirSync('tmp', { recursive: true });
  fs.writeFileSync('tmp/pdf_text.txt', data.text, 'utf8');
  console.log('WROTE tmp/pdf_text.txt');
}).catch(err=>{console.error(err); process.exit(1);});
