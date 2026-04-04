// assets/js/dashboard.js
import { db } from "./firebase.js";
import { collection, onSnapshot } 
from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

/* ================= TOTAL ================= */
onSnapshot(collection(db, "siswa"), (snap) => {
  document.getElementById("totalSiswa").innerText = snap.size;
});

onSnapshot(collection(db, "guru"), (snap) => {
  document.getElementById("totalguru").innerText = snap.size;
});
// ================= MONITORING =================
onSnapshot(collection(db, "jawaban_siswa"), (snapshot) => {
  table.innerHTML = "";

  snapshot.forEach((doc) => {
    const data = doc.data();

    let statusText = "";
    let className = "";
    let waktu = "-";

    // ================= STATUS =================
    if (!data.waktu_mulai) {
      statusText = "Belum Mengerjakan";
      className = "belum";
    } 
    else if (data.waktu_mulai && !data.waktu_selesai) {
      statusText = "Sedang Mengerjakan";
      className = "aktif";
      waktu = new Date().toLocaleTimeString();
    } 
    else if (data.waktu_selesai) {
      statusText = "Selesai";
      className = "selesai";
      waktu = new Date(data.waktu_selesai.seconds * 1000).toLocaleTimeString();
    }

    table.innerHTML += `
      <tr>
        <td>${data.namaSiswa}</td>
        <td>${data.kelas || "-"}</td>
        <td class="${className}">${statusText}</td>
        <td>${waktu}</td>
      </tr>
    `;
  });
});