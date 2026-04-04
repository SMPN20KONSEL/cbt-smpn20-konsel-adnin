import { db } from "./firebase.js";
import { collection, onSnapshot } 
from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

const table = document.getElementById("monitoringTable");

function formatStatus(data) {
  if (!data.waktu_mulai) return ["Belum Mengerjakan", "belum"];
  if (data.waktu_mulai && !data.waktu_selesai) return ["Sedang Mengerjakan", "aktif"];
  if (data.waktu_selesai) return ["Selesai", "selesai"];

  return ["-", ""];
}

function formatWaktu(data) {
  if (data.waktu_mulai && !data.waktu_selesai) {
    return new Date().toLocaleTimeString();
  }

  if (data.waktu_selesai) {
    return new Date(data.waktu_selesai.seconds * 1000).toLocaleTimeString();
  }

  return "-";
}

/* ================= MONITORING ================= */
onSnapshot(collection(db, "jawaban_siswa"), (snapshot) => {
  table.innerHTML = "";

  snapshot.forEach((doc) => {
    const data = doc.data();

    const [statusText, className] = formatStatus(data);
    const waktu = formatWaktu(data);

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