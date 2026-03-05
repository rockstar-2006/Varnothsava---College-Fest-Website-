import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { missions } from "@/data/missions";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `
You are the official "Varnothsava 2026 Assistant," the AI guide for the national-level techno-cultural fest organized by SMVITM (Shri Madhwa Vadiraja Institute of Technology and Management), Bantakal, Udupi.

CRITICAL INSTRUCTION:
1. ONLY use the information provided in this prompt. 
2. DO NOT use your internal knowledge about common competition names (e.g., if you know what a 'Prompt to Product' event usually is, FORGET IT. Only use the description and rules provided below).
3. IF information is not in this prompt, say: "I'm sorry, I don't have that specific detail. Please contact our Chief Coordinator, Bhushan Poojary, at 7381709385 for more information."
4. PRIZE POOL: The TOTAL PRIZE POOL for the fest is over ₹3,00,000 (3 Lakhs). Do NOT mention specific prize pools for individual events unless the user explicitly asks, and even then, emphasize the total fest pool.

KEY FEST DETAILS:
- Name: Varnothsava 2026
- Institution: SMVITM, Bantakal, Udupi
- Dates: March 11th and 12th, 2026
- Theme: A fusion of Technology and Culture.

- ENTRY FEE: ₹200 (SMVITM) / ₹300 (Others). "Pay Once, Join All!"
- WHAT IS INCLUDED: This single payment covers your registration for **ALL** major events including **BGMI** and **Prompt to Product**.
- ROBO SOCCER EXCEPTION: **Robo Soccer** is the only event that requires an **ADDITIONAL ₹300 per team** registration fee. This extra fee must be paid by the **Team Leader only**. Other team members only pay their normal entry fee.
- REGISTRATION STEPS:
  1. **STEP 1: PAY ENTRY FEE** - Click 'Register Now' and pay the base fee. (If you are a Robo Soccer Leader, also pay the 300 team fee).
  2. **STEP 2: GET PASS ID** - Once paid, your unique **Pass ID** will be visible on your Profile.
  3. **STEP 3: SOLO VS TEAM** - 
     - **Solo:** Your ID is auto-fetched. Just click register on the event page.
     - **Team:** Every friend pays their entry fee and gives you their Pass ID.
  4. **STEP 4: SUBMIT** - Choose your event, enter the Pass IDs (for teams), and you're set!

COORDINATORS:
- Bhushan Poojary: 7381709385 (Chief Coordinator)
- Tejas Nayak: 8296151023 (Technical Coordinator)
- Abhishek: 9844101520 (Cultural Coordinator)

EVENT DATABASE (STRICT GUIDELINES):
Use ONLY these details for event queries:

${missions.map(m => `
---
EVENT: ${m.title}
TYPE: ${m.type}
DESCRIPTION: ${m.description}
RULES: ${m.rules ? m.rules.join('. ') : 'Refer to website rules section.'}
TEAM SIZE: ${m.minTeamSize} to ${m.maxTeamSize} members.
DATE/TIME: ${m.date} at ${m.time || 'TBD'}.
---`).join('\n')}

GUIDELINES:
- Be concise.
- Use Markdown for structure (bolding, lists).
- If asked about "Prompt to Product", emphasize the two-round structure: Round 1 (Image Replication from memory using prompts) and Round 2 (AI Product Revival of a broken repository in 90 minutes).
`;

const STATIC_RESPONSES: Record<string, string> = {
    "How to register?": `To register for **Varnothsava 2026**, please follow these steps:

1. **STEP 1: PAY ENTRY FEE** - Click the [Register Now](/auth/register) button and pay the base entry fee (₹200 for SMVITM students / ₹300 for Others). 
2. **STEP 2: GET PASS ID** - Once you've paid, go to your **Profile** page to find your unique **Pass ID**.
3. **STEP 4: SOLO VS TEAM** - 
   - **Solo Events:** Just visit the event page and click Register. Your ID is fetched automatically!
   - **Team Events:** Your leader must collect the Pass IDs of all members.
4. **STEP 5: SUBMIT** - The Team Leader enters all Pass IDs on the event registration form and submits. 

*Remember: "Pay Once, Join All!"*`,

    "About Payment & Robo Soccer": `**Payment Details:**
- **Entry Fee:** ₹200 (SMVITM Students) / ₹300 (Other Colleges).
- **Robo Soccer Fee:** This is the only event with an extra fee of **₹300 per team**, paid by the **Team Leader only**.
- **All-Access Pass:** Your base entry fee allows you to join any other event (BGMI, Prompt to Product, etc.) at no extra cost!

**Robo Soccer Event:**
- **Description:** A thrilling knockout robot football tournament!
- **Team Size:** 2 to 4 members.
- **Schedule:** March 11th, 10:00 AM.
- **Rules:** Knockout format, 30x30cm bots, max 5.5kg.

*Need more payment help? Contact Bhushan Poojary: 7381709385*`,

    "Accommodation Info": `**Accommodation at SMVITM:**
Yes, we provide comfortable accommodation for participants traveling from distant colleges. 

- **Availability:** Limited slots, first-come-first-served.
- **Charges:** Please contact our hospitality team for specific nominal charges.
- **Contact:** Reach out to **Bhushan Poojary (7381709385)** to reserve your stay!`,

    "Contact Details": `**Varnothsava 2026 - Official Contacts:**

- **Chief Coordinator:** Bhushan Poojary - [7381709385](tel:7381709385)
- **Technical Events:** Tejas Nayak - [8296151023](tel:8296151023)
- **Cultural/Hobby Events:** Abhishek - [9844101520](tel:9844101520)

Feel free to call or WhatsApp for any urgent queries! 📞`
};

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();

        // 1. FAST PATH: Check for static responses to save API quota
        if (STATIC_RESPONSES[message]) {
            return NextResponse.json({ text: STATIC_RESPONSES[message] });
        }

        const apiKeys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "").split(',').filter(Boolean);

        if (apiKeys.length === 0) {
            return NextResponse.json({ error: "API Keys not configured" }, { status: 500 });
        }

        // 2. MULTI-KEY ROTATION: Always use gemini-2.5-flash but rotate keys to bypass quota
        let lastError = null;

        for (const apiKey of apiKeys) {
            try {
                // Initialize a new AI instance for each key attempt
                const tempGenAI = new GoogleGenerativeAI(apiKey);
                const model = tempGenAI.getGenerativeModel({ model: "gemini-2.5-flash" });

                const chat = model.startChat({
                    history: [
                        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
                        { role: "model", parts: [{ text: "Understood. I am the context-bound Varnothsava 2026 Assistant." }] },
                        ...history.slice(-6).map((m: any) => ({
                            role: m.sender === 'user' ? 'user' : 'model',
                            parts: [{ text: m.text }]
                        }))
                    ],
                });

                const result = await chat.sendMessage(message);
                const response = await result.response;
                return NextResponse.json({ text: response.text() });
            } catch (err: any) {
                lastError = err;
                if (err.message?.includes('429')) {
                    console.warn(`API Key rate limited, trying next key...`);
                    continue;
                }
                // If it's a different error (e.g. invalid key), try next key or throw
                console.error("API Attempt failed:", err.message);
                continue;
            }
        }

        throw lastError; // If all keys fail

    } catch (error: any) {
        console.error("DEBUG - FINAL CHAT ERROR:", error);

        let errorMsg = "I'm a bit overwhelmed with requests right now. 🤖";
        if (error.message?.includes('429')) {
            errorMsg = "We've reached our temporary AI question limit across all systems.";
        }
        return NextResponse.json({
            text: `${errorMsg}\n\nFor immediate help regarding registration or events, please contact our **Chief Coordinator, Bhushan Poojary (7381709385)**.`
        });
    }
}
