const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

require('dotenv').config({ path: '.env.local' });

async function readData() {
    try {
        const snapshot = await get(ref(db, 'devices/esp32-001'));
        if (snapshot.exists()) {
            console.log(JSON.stringify(snapshot.val(), null, 2));
        } else {
            console.log("No data available");
        }
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

readData();
