import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword } 
  from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } 
  from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const roleSelect = document.getElementById("role");
const error = document.getElementById("error");
const loginBtn = document.getElementById("loginBtn");

loginBtn.onclick = async () => {
  error.innerText = "";

  try {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const roleDipilih = roleSelect.value;

    if (!email || !password) {
      error.innerText = "Email dan password wajib diisi";
      return;
    }

    // 1️⃣ LOGIN AUTH
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    // 2️⃣ CEK USER DI FIRESTORE
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);

    // 3️⃣ AUTO CREATE JIKA BELUM ADA
    if (!snap.exists()) {
      await setDoc(userRef, {
        email: userCred.user.email,
        role: roleDipilih,
        createdAt: serverTimestamp()
      });
    }

    const roleDB = snap.exists()
      ? snap.data().role
      : roleDipilih;

    // 4️⃣ VALIDASI ROLE
    if (roleDB !== roleDipilih) {
      error.innerText = "Role tidak sesuai";
      return;
    }

    // 5️⃣ SIMPAN SESSION
    sessionStorage.setItem("uid", uid);
    sessionStorage.setItem("role", roleDB);

    // 6️⃣ REDIRECT
    if (roleDB === "admin") {
      window.location.href = "admin/dashboard.html";
    } else if (roleDB === "guru") {
      window.location.href = "guru/dashboard-guru.html";
    } else {
      error.innerText = "Role tidak dikenali!";
    }

  } catch (e) {
    console.error("Login gagal:", e);

    if (e.code === "auth/user-not-found") {
      error.innerText = "Email belum terdaftar";
    } else if (e.code === "auth/wrong-password") {
      error.innerText = "Password salah";
    } else if (e.code === "auth/invalid-email") {
      error.innerText = "Format email tidak valid";
    } else {
      error.innerText = e.message;
    }
  }
};
