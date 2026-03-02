const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env.local") });

async function test() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API key found in .env.local");
        return;
    }
    console.log("Found API key (last 4 digits):", apiKey.slice(-4));

    const genAI = new GoogleGenerativeAI(apiKey);

    // Test with Flash first
    console.log("Testing gemini-1.5-flash...");
    try {
        const modelFlash = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const resultFlash = await modelFlash.generateContent("Hello");
        console.log("Flash response:", resultFlash.response.text());
    } catch (e) {
        console.error("Flash failed:", e.message);
    }

    // Test with Pro
    console.log("Testing gemini-1.5-pro...");
    try {
        const modelPro = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const resultPro = await modelPro.generateContent("Hello");
        console.log("Pro response:", resultPro.response.text());
    } catch (e) {
        console.error("Pro failed:", e.message);
    }
}

test();
