const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
    apiKey: "AIzaSyA7anO04p6sMyN38pIT-Yytp0LY4Zj_nXk",
    authDomain: "web-varnothsava.firebaseapp.com",
    projectId: "web-varnothsava",
    storageBucket: "web-varnothsava.firebasestorage.app",
    messagingSenderId: "943741524490",
    appId: "1:943741524490:web:fc064db962fa4177aeddf3",
    measurementId: "G-LQ0T4Q2KRJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function run() {
    try {
        let userCred;
        try {
            console.log("Creating user...");
            userCred = await createUserWithEmailAndPassword(auth, "test" + Date.now() + "@example.com", "password123");
        } catch (e) {
            console.error("Create fail:", e.message);
            return;
        }
        
        const token = await userCred.user.getIdToken();
        console.log("Got token:", token ? "YES" : "NO");

        const fetch = (await import('node-fetch')).default;

        console.log("Calling /api/register...");
        const resReg = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: {
                    name: "Test User",
                    usn: "123",
                    collegeName: "Other",
                    phone: "1234567890"
                }
            })
        });
        
        console.log("Register status:", resReg.status);
        console.log("Register body:", await resReg.text());

        console.log("Calling /api/me...");
        const resMe = await fetch('http://localhost:3000/api/me', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        
        console.log("Me status:", resMe.status);
        console.log("Me body:", await resMe.text());

    } catch (err) {
        console.error("Unhandled:", err);
    }
}
run();
