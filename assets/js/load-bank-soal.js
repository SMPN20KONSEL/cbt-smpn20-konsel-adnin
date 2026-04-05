// =====================================================
// LIHAT DETAIL BANK SOAL
// =====================================================

import { db } from "./firebase.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// PARAM URL
const params = new URLSearchParams(window.location.search);
const bankId = params.get("id");

// ELEMENT
const judulEl = document.getElementById("judul");
const infoEl  = document.getElementById("info");
const listEl  = document.getElementById("soal-list");

// VALIDASI
if (!bankId) {
  listEl.innerHTML = "<p style='color:red'>❌ ID bank soal tidak ditemukan</p>";
  throw new Error("ID bank soal kosong");
}

// =====================================================
async function loadSoal() {
  listEl.innerHTML = "<p>⏳ Memuat soal...</p>";

  try {
    const ref = doc(db, "bank_soal", bankId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      listEl.innerHTML = "<p>❌ Data bank soal tidak ditemukan</p>";
      return;
    }

    const data = snap.data();

    // HEADER
    judulEl.textContent = data.judul || "-";
    infoEl.textContent = `${data.mapel || "-"} • Kelas ${data.kelas || "-"}`;

    listEl.innerHTML = "";
    let no = 1;

// =====================================================
// ================= PG =================
(data.soalPG || []).forEach((s) => {
  let opsiHTML = "";

  if (s.opsi) {
    for (const k in s.opsi) {
      opsiHTML += `<div>${k}. ${s.opsi[k]}</div>`;
    }
  }

  listEl.innerHTML += `
    <div class="soal-box">
      <span class="jenis">Pilihan Ganda</span>
      <div class="nomor">Soal ${no++}</div>
      <div class="pertanyaan">${s.pertanyaan || ""}</div>
      <div class="opsi">${opsiHTML}</div>
      <small><b>Jawaban:</b> ${s.jawabanBenar || "-"}</small>
    </div>
  `;
});


// =====================================================
// ================= MCMA =================
(data.soalMCMA || []).forEach((s) => {
  let opsiHTML = "";

  if (s.opsi) {
    for (const k in s.opsi) {
      opsiHTML += `<div>[ ] ${k}. ${s.opsi[k]}</div>`;
    }
  }

  listEl.innerHTML += `
    <div class="soal-box">
      <span class="jenis" style="background:#f59e0b">PG Kompleks</span>
      <div class="nomor">Soal ${no++}</div>
      <div class="pertanyaan">${s.pertanyaan || ""}</div>
      <div class="opsi">${opsiHTML}</div>
      <small><b>Jawaban:</b> ${(s.jawabanBenar || []).join(", ")}</small>
    </div>
  `;
});


// =====================================================
// ================= KATEGORI =================
(data.soalKategori || []).forEach((s) => {
  let pernyataanHTML = "";

  (s.pernyataan || []).forEach((p, i) => {
    pernyataanHTML += `
      <div>
        ${i + 1}. ${p.teks}
        <small>(Jawaban: ${p.jawabanBenar ? "Benar" : "Salah"})</small>
      </div>
    `;
  });

  listEl.innerHTML += `
    <div class="soal-box">
      <span class="jenis" style="background:#8b5cf6">Kategori</span>
      <div class="nomor">Soal ${no++}</div>
      <div class="pertanyaan">${s.pertanyaan || ""}</div>
      <div class="opsi">${pernyataanHTML}</div>
    </div>
  `;
});


// =====================================================
// ================= ESSAY =================
(data.soalEssay || []).forEach((s) => {
  listEl.innerHTML += `
    <div class="soal-box">
      <span class="jenis" style="background:#16a34a">Esai</span>
      <div class="nomor">Soal ${no++}</div>
      <div class="pertanyaan">${s.pertanyaan || ""}</div>
    </div>
  `;
});

    // RENDER MATHJAX
    if (window.MathJax) MathJax.typeset();

  } catch (err) {
    console.error(err);
    listEl.innerHTML = `
      <p style="color:red">
        ❌ Gagal memuat soal<br>
        ${err.message}
      </p>
    `;
  }
}

// =====================================================
loadSoal();
