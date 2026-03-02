const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

const envPath = path.resolve(__dirname, '../.env.local');
require('dotenv').config({ path: envPath });

let serviceAccount = null;
try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        let keyStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
        if (keyStr.startsWith("'") && keyStr.endsWith("'")) {
            keyStr = keyStr.slice(1, -1);
        }
        serviceAccount = JSON.parse(keyStr);
        if (serviceAccount && serviceAccount.private_key) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
    }
} catch (err) {
    console.error("FATAL: Failed to load service account:", err);
}

if (!serviceAccount) {
    console.error(`FIREBASE_SERVICE_ACCOUNT_KEY not found. Tried checking: ${envPath}`);
    process.exit(1);
}

if (require('firebase-admin/app').getApps().length === 0) {
    initializeApp({
        credential: cert(serviceAccount)
    });
}

const db = getFirestore();

// List of events extracted from missions.ts to populate the database
const eventsToSync = [
    { id: "TECH-001", title: "ALGORITHM ROULETTE", type: "Technical", category: "AI/ML", fee: 200, date: "11-MARCH", coordinators: ["Ms. Shalaka", "Ananya Bhat", "Yathika P Amin"] },
    { id: "TECH-002", title: "Prompt To Product", type: "Technical", category: "AI/Product", fee: 200, date: "11-MARCH", coordinators: ["Dr. Rashmi", "Suraj Bhagwat", "BHUSHAN POOJARY"] },
    { id: "TECH-003", title: "ELECTRO DETECTIVES", type: "Technical", category: "Electronics", fee: 200, date: "11-MARCH", coordinators: ["Mr. Sandeep Prabhu", "PRERANA SHETTY", "NISHMITHA"] },
    { id: "TECH-004", title: "FASTEST LINE FOLLOWER", type: "Technical", category: "Robotics", fee: 200, date: "11-MARCH", coordinators: ["Ms. Sthuthi", "KAUSHIK", "K S Raveesha Padmashali"] },
    { id: "TECH-005", title: "HACKHUNT", type: "Technical", category: "Coding", fee: 200, date: "11-MARCH", coordinators: ["Ms. Ashwitha", "SUMEDH NAVADA", "Tejas Nayak"] },
    { id: "TECH-006", title: "PITCHATHON", type: "Technical", category: "Innovation", fee: 200, date: "11-MARCH", coordinators: ["Ms. Shalaka", "PAI AVANI", "Bhushan Poojary"] },
    { id: "TECH-007", title: "WRIGHT BROTHERS", type: "Technical", category: "Mechanical", fee: 200, date: "11-MARCH", coordinators: ["Dr. Madhukar Nayak", "ABHISHEK K N", "VAIBHAV C MENDON"] },
    { id: "TECH-008", title: "ROBO SOCCER", type: "Technical", category: "Robotics", fee: 200, date: "12-MARCH", coordinators: ["Mr. Sharath Kumar", "VINAYAKA", "KARTHIK NAYAK"] },
    { id: "GAME-001", title: "CLASH OF RADIANTS", type: "Gaming", category: "Valorant", fee: 500, date: "11/12-MARCH", coordinators: ["Ms. Ashwitha", "U PRADYUMNA", "SATHWIK S BHAT"] },
    { id: "GAME-002", title: "BGMI", type: "Gaming", category: "Mobile Gaming", fee: 400, date: "11/12-MARCH", coordinators: ["Mr. Sandeep Prabhu", "KEVIN MENDONCA"] },
    { id: "MBA-001", title: "Money Matters", type: "Business", category: "Management", fee: 0, date: "12-MARCH", coordinators: ["Prof. Steevan R T", "Mr. Arwin Menezes", "Ms. Shravya"] },
    { id: "MBA-002", title: "Visionary Ventures", type: "Business", category: "Management", fee: 0, date: "12-MARCH", coordinators: ["Prof. Melanie P D", "Ms. Krithika", "Ms. Rashmitha"] },
    { id: "MBA-003", title: "The Ultimate Biz Team", type: "Business", category: "Management", fee: 0, date: "12-MARCH", coordinators: ["Prof. Aurin Madtha", "Ms. Sannidhi", "Ms. Shruthi"] },
    { id: "Solo-Singing", title: "BHAVA TARANGA", type: "Cultural", category: "Hobby Club", fee: 150, date: "11-MARCH", coordinators: ["Ms. Ashwitha", "Abhishek Kini", "Shreerama"] },
    { id: "Group-Singing", title: "Janapada nada", type: "Cultural", category: "Hobby Club", fee: 150, date: "11-MARCH", coordinators: ["Ms. Yogeshwary B H", "Akash", "Vaishnavi"] },
    { id: "Solo-Classical-Dance", title: "Thaka Dhimi Tha", type: "Cultural", category: "Hobby Club", fee: 150, date: "11-MARCH", coordinators: ["Ms. Ashwini", "Sneha Ganesh", "Amrutha"] },
    { id: "Group-Western-Dance", title: "Groove Gala", type: "Cultural", category: "Hobby Club", fee: 150, date: "12-MARCH", coordinators: ["Ms. Sowmya P", "Rahul Bhat", "Shreyas Shet"] },
    { id: "Stand-Up-Comedy", title: "Speech of Smiles", type: "Cultural", category: "Hobby Club", fee: 150, date: "11-MARCH", coordinators: ["Ms. Sthuthi", "Dheeraj", "Sadhana"] },
    { id: "Who Am I", title: "Who Am I (Reels)", type: "Cultural", category: "General", fee: 150, date: "11-MARCH", coordinators: ["Ms. Pramathi", "Samarth Ganesh", "Nishanth"] },
    { id: "Face-Painting", title: "Face Painting", type: "Cultural", category: "General", fee: 150, date: "11-MARCH", coordinators: ["Ms. Pramathi", "Samarth Ganesh", "Nishanth"] },
    { id: "Mehandi", title: "Hands of Art", type: "Cultural", category: "General", fee: 100, date: "11-MARCH", coordinators: ["Ms. Rajeshwari", "Fathimath Ansira", "Afeefa Noor"] },
    { id: "Anime-Quiz", title: "Anime Arena", type: "Cultural", category: "General", fee: 100, date: "11-MARCH", coordinators: ["Dr. Rashmi Samanth", "Roylene", "Reynol Dsouza"] },
    { id: "Antakshari", title: "Musical Marathon", type: "Cultural", category: "Hobby Club", fee: 100, date: "12-MARCH", coordinators: ["Mr. Mallya Ananth Mohan", "Chitkala H", "Bhagyashree"] },
    { id: "Flower-arrangement-vegetable-carving", title: "Natures Palette", type: "Cultural", category: "General", fee: 100, date: "12-MARCH", coordinators: ["Ms. Rashmi Achar", "Mansi R Rao", "Pratiksha"] },
    { id: "Variety-Act", title: "Kala Sangama", type: "Cultural", category: "General", fee: 100, date: "12-MARCH", coordinators: ["Ms. Reshma Nayak", "Shreya", "Chirashree"] },
    { id: "MIME", title: "Slient Symphony", type: "Cultural", category: "Hobby Club", fee: 100, date: "12-MARCH", coordinators: ["Mr. Varun", "Surabhi", "Viraj"] },
    { id: "Rangoli", title: "Bannada Prapancha", type: "Cultural", category: "General", fee: 100, date: "11-MARCH", coordinators: ["Ms. Yogeshwary B H", "Deepa D Prabhu", "Sanjana Bhomkar"] },
    { id: "Drawing", title: "Art of Tune", type: "Cultural", category: "Hobby Club", fee: 100, date: "11-MARCH", coordinators: ["Dr. Rashmi Samanth", "Advaith Acharya", "Ashish Prasad"] },
    { id: "Pencil-Sketch", title: "Sketch Chronicles", type: "Cultural", category: "Hobby Club", fee: 100, date: "11-MARCH", coordinators: ["Ms. Rajeshwari", "Shivaprasadh", "Pragathi"] },
    { id: "Pick-and-Speech", title: "JAM", type: "Cultural", category: "General", fee: 100, date: "12-MARCH", coordinators: ["Mr. Varun K", "Kamath Mayur Jaywant", "Chirag Sathish Poojary"] },
    { id: "Photography", title: "Shutterverse", type: "Cultural", category: "Promotional", fee: 100, date: "11/12-MARCH", coordinators: ["Dr. Madhukar Nayak", "Pawan kumar", "Chetan V kotian"] },
    { id: "Videography", title: "Cinecapture", type: "Cultural", category: "Promotional", fee: 100, date: "11/12-MARCH", coordinators: ["Mr. Sandeep Prabhu", "Rahul", "Chetan V kotian"] }
];

async function sync() {
    console.log("Starting event sync...");
    const batch = db.batch();
    const eventsCol = db.collection('events');

    for (const event of eventsToSync) {
        const { id, ...data } = event;
        const ref = eventsCol.doc(id);
        batch.set(ref, {
            ...data,
            updatedAt: new Date().toISOString(),
            registrationStatus: 'open'
        }, { merge: true });
    }

    await batch.commit();
    console.log(`Successfully synced ${eventsToSync.length} events to Firestore!`);
}

sync().catch(console.error);
