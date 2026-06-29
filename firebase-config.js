// Firebase SDK
import { initializeApp } from
"https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
    getAuth
} from
"https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    getFirestore
} from
"https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// Configuração do projeto
const firebaseConfig = {

    apiKey: "AIzaSyChaPGRAaCcpCg6Lvh-llZ2Fz0J_APQIGw",

    authDomain: "mathnexus-774d5.firebaseapp.com",

    projectId: "mathnexus-774d5",

    storageBucket: "mathnexus-774d5.firebasestorage.app",

    messagingSenderId: "643988018985",

    appId: "1:643988018985:web:e1af824caf142a64034938"

};

// Inicialização
const app = initializeApp(firebaseConfig);

// Serviços
export const auth = getAuth(app);

export const db = getFirestore(app);
