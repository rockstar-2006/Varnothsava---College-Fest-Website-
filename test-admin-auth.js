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
        const email = "coordinator@varnothsava.in";
        try {
            console.log("Creating/Logging in coordinator...", email);
            userCred = await signInWithEmailAndPassword(auth, email, "password123");
        } catch (e) {
            console.error("Login fail, trying create:", e.message);
            try {
                userCred = await createUserWithEmailAndPassword(auth, email, "password123");
            } catch(e2) {
                console.error("Create fail:", e2.message);
                return;
            }
        }
        
        const token = await userCred.user.getIdToken();
        const fetch = (await import('node-fetch')).default;

        console.log("Calling /api/me as coordinator...");
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
