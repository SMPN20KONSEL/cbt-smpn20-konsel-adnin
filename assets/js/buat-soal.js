// ======================================================
// ======================= FIREBASE =====================
// ======================================================
import { db } from "./firebase.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";


// ======================================================
// ======================= ELEMENT ======================
// ======================================================
const daftarSoal = document.getElementById("daftarSoal");
const toastBox   = document.getElementById("toast");

const judulUjian = document.getElementById("judulUjian");
const mapelInput = document.getElementById("mapelInput");
const kelasInput = document.getElementById("kelasInput");

const btnSimpan  = document.getElementById("btnSimpan");


// ======================================================
// ======================== UTIL ========================
// ======================================================
function buatSoalId(prefix, nomor) {
  return `${prefix}${nomor}`;
}

function buatDocId(judul, mapel, kelas) {
  return `${judul}_${mapel}_${kelas}`
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function bersihkanPertanyaan(text = "") {
  return text
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/\s*\((pg|esai|essay|pilihan ganda)\)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}


// ======================================================
// ======================== TOAST =======================
// ======================================================
function toast(msg, type = "success") {
  const div = document.createElement("div");
  div.innerText = msg;
  div.style.background = type === "error" ? "#dc2626" : "#16a34a";
  div.style.color = "#fff";
  div.style.padding = "10px 15px";
  div.style.marginTop = "10px";
  div.style.borderRadius = "6px";

  toastBox.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}


// ======================================================
// ======================= LOADING ======================
// ======================================================
function setLoading(btn, text = "⏳ Loading...") {
  if (!btn) return;
  btn.disabled = true;
  btn.dataset.text = btn.innerHTML;
  btn.innerHTML = text;
}

function stopLoading(btn) {
  if (!btn) return;
  btn.disabled = false;
  btn.innerHTML = btn.dataset.text;
}


// ======================================================
// ===================== TAMBAH SOAL ====================
// ======================================================
window.tambahSoal = (data = null) => {
  const card = document.createElement("div");
  card.className = "soal-card";
  card.style.border = "1px solid #ccc";
  card.style.padding = "15px";
  card.style.marginBottom = "15px";
  card.style.borderRadius = "10px";

  card.innerHTML = `
    <select class="tipe-soal">
      <option value="pg">Pilihan Ganda</option>
      <option value="esai">Esai</option>
    </select>

    <div class="pertanyaan" contenteditable style="margin-top:8px"></div>

    ${data?.gambar ? `<img src="${data.gambar}" style="max-width:100%;margin:10px 0">` : ""}

    <div class="pg-options" style="margin-top:8px">
      ${["A","B","C","D"].map(l => `
        <div><b>${l}.</b> <span contenteditable class="opsi-input"></span></div>
      `).join("")}

      <select class="jawaban">
        <option value="">Kunci Jawaban</option>
        ${["A","B","C","D"].map(l => `<option>${l}</option>`).join("")}
      </select>
    </div>

    <button type="button" onclick="this.parentElement.remove()">🗑 Hapus Soal</button>
  `;

  daftarSoal.appendChild(card);

  const tipe  = card.querySelector(".tipe-soal");
  const pgBox = card.querySelector(".pg-options");

  tipe.onchange = () => {
    pgBox.style.display = tipe.value === "pg" ? "block" : "none";
  };

  if (data) {
    tipe.value = data.tipe;
    card.querySelector(".pertanyaan").innerText =
      bersihkanPertanyaan(data.pertanyaan || "");

    if (data.tipe === "pg") {
      const opsiEl = card.querySelectorAll(".opsi-input");
      Object.entries(data.opsi || {}).forEach(([_, v], i) => {
        if (opsiEl[i]) opsiEl[i].innerText = v;
      });
      card.querySelector(".jawaban").value = data.jawabanBenar || "";
    }
  }

  tipe.dispatchEvent(new Event("change"));
};
// ======================================================
// ============ TAMBAHAN TIPE SOAL BARU =================
// ======================================================

// UPGRADE: tambah opsi di tambahSoal
const oldTambahSoal = window.tambahSoal;

window.tambahSoal = (data = null) => {
  oldTambahSoal(data);

  const card = daftarSoal.lastElementChild;

  // tambah tipe baru
  const select = card.querySelector(".tipe-soal");
  select.innerHTML = `
    <option value="pg">Pilihan Ganda</option>
    <option value="esai">Esai</option>
    <option value="bs">Benar / Salah</option>
    <option value="isian">Isian</option>
    <option value="menjodohkan">Menjodohkan</option>
  `;

  // tambahan container baru
  const extra = document.createElement("div");
  extra.className = "extra-container";
  extra.style.marginTop = "10px";

  extra.innerHTML = `
    <!-- BENAR SALAH -->
    <div class="box-bs" style="display:none">
      <select class="kunci-bs">
        <option value="">Kunci</option>
        <option value="benar">Benar</option>
        <option value="salah">Salah</option>
      </select>
    </div>

    <!-- ISIAN -->
    <div class="box-isian" style="display:none">
      <input class="kunci-isian" placeholder="Jawaban benar">
    </div>

    <!-- MENJODOHKAN -->
    <div class="box-menjodohkan" style="display:none">
      ${[1,2,3].map(i => `
        <div style="display:flex; gap:10px; margin-bottom:5px">
          <input placeholder="Soal ${i}" class="mj-soal">
          <input placeholder="Jawaban ${i}" class="mj-jawab">
        </div>
      `).join("")}
    </div>
  `;

  card.appendChild(extra);

  const pgBox = card.querySelector(".pg-options");
  const bsBox = card.querySelector(".box-bs");
  const isianBox = card.querySelector(".box-isian");
  const mjBox = card.querySelector(".box-menjodohkan");

  // ubah tampilan sesuai tipe
  select.onchange = () => {
    pgBox.style.display = select.value === "pg" ? "block" : "none";
    bsBox.style.display = select.value === "bs" ? "block" : "none";
    isianBox.style.display = select.value === "isian" ? "block" : "none";
    mjBox.style.display = select.value === "menjodohkan" ? "block" : "none";
  };

  select.dispatchEvent(new Event("change"));
};


// ======================================================
// ================== SIMPAN TAMBAHAN ===================
// ======================================================

// overwrite simpan tanpa hapus lama
const oldSimpan = window.simpanSemua;

window.simpanSemua = async () => {
  setLoading(btnSimpan, "💾 Menyimpan...");
  try {
    const judul = judulUjian.value.trim();
    const mapel = mapelInput.value.trim();
    const kelas = kelasInput.value.trim();

    if (!judul || !mapel || !kelas) {
      throw new Error("Judul, mapel, dan kelas wajib diisi");
    }

    const docId = buatDocId(judul, mapel, kelas);
    const docRef = doc(db, "bank_soal", docId);

    const snap = await getDoc(docRef);
    if (snap.exists()) {
      throw new Error("Soal sudah ada");
    }

    const soalPG = [];
    const soalEssay = [];
    const soalBS = [];
    const soalIsian = [];
    const soalMenjodohkan = [];

    document.querySelectorAll(".soal-card").forEach(card => {
      const tipe = card.querySelector(".tipe-soal").value;
      const pertanyaan = bersihkanPertanyaan(
        card.querySelector(".pertanyaan").innerText
      );

      if (tipe === "pg") {
        const opsi = {};
        card.querySelectorAll(".opsi-input").forEach((o, i) => {
          if (o.innerText.trim()) {
            opsi[String.fromCharCode(65 + i)] = o.innerText.trim();
          }
        });

        const kunci = card.querySelector(".jawaban").value;
        if (!kunci) return;

        soalPG.push({
          id: buatSoalId("PG", soalPG.length + 1),
          pertanyaan,
          opsi,
          jawabanBenar: kunci
        });
      }

      if (tipe === "esai") {
        soalEssay.push({
          id: buatSoalId("E", soalEssay.length + 1),
          pertanyaan,
          skorMax: 10
        });
      }

      if (tipe === "bs") {
        const kunci = card.querySelector(".kunci-bs").value;
        if (!kunci) return;

        soalBS.push({
          id: buatSoalId("BS", soalBS.length + 1),
          pertanyaan,
          jawabanBenar: kunci
        });
      }

      if (tipe === "isian") {
        const kunci = card.querySelector(".kunci-isian").value;
        if (!kunci) return;

        soalIsian.push({
          id: buatSoalId("IS", soalIsian.length + 1),
          pertanyaan,
          jawabanBenar: kunci
        });
      }

      if (tipe === "menjodohkan") {
        const pasangan = [];
        const soalList = card.querySelectorAll(".mj-soal");
        const jawabList = card.querySelectorAll(".mj-jawab");

        soalList.forEach((s, i) => {
          if (s.value && jawabList[i].value) {
            pasangan.push({
              soal: s.value,
              jawaban: jawabList[i].value
            });
          }
        });

        if (pasangan.length === 0) return;

        soalMenjodohkan.push({
          id: buatSoalId("MJ", soalMenjodohkan.length + 1),
          pertanyaan,
          pasangan
        });
      }
    });

    await setDoc(docRef, {
      judul,
      mapel,
      kelas,
      soalPG,
      soalEssay,
      soalBS,
      soalIsian,
      soalMenjodohkan,
      dibuat: serverTimestamp()
    });

    toast("✅ Semua tipe soal berhasil disimpan");
    daftarSoal.innerHTML = "";

  } catch (err) {
    toast("❌ " + err.message, "error");
  } finally {
    stopLoading(btnSimpan);
  }
};

// ======================================================
// ===================== IMPORT WORD ====================
// ======================================================
window.importWord = async (btn) => {
  setLoading(btn, "📄 Importing...");
  try {
    const file = document.getElementById("fileWord").files[0];
    if (!file) throw new Error("Pilih file Word");

    const buffer = await file.arrayBuffer();

    const result = await mammoth.convertToHtml(
      { arrayBuffer: buffer },
      {
        convertImage: mammoth.images.inline(image => {
          return image.read("base64").then(base64 => ({
            src: `data:${image.contentType};base64,${base64}`
          }));
        })
      }
    );

    parseSoalHtml(result.value);
    toast("✅ Import Word berhasil");
  } catch (err) {
    toast("❌ " + err.message, "error");
  } finally {
    stopLoading(btn);
  }
};


// ======================================================
// ==================== PARSER WORD =====================
// ======================================================
function parseSoalHtml(html) {
  const temp = document.createElement("div");
  temp.innerHTML = html;

  let soal = null;

  [...temp.children].forEach(block => {
    let text = block.textContent?.trim();

    // DETEKSI NOMOR SOAL
    if (/^\d+[\.\)]/.test(text)) {
      if (soal) tambahSoal(soal);

      soal = {
        tipe: "esai",
        pertanyaan: "",
        opsi: {},
        jawabanBenar: "",
        pasangan: [],
        gambar: null
      };

      text = text.replace(/^\d+[\.\)]\s*/, "");
    }

    if (!soal) return;

    // GAMBAR
    const img = block.querySelector("img");
    if (img && !soal.gambar) {
      soal.gambar = img.src;
    }

    // ================= PG =================
    const opsiPG = text.match(/^([A-D])\./);
    if (opsiPG) {
      soal.tipe = "pg";
      soal.opsi[opsiPG[1]] =
        bersihkanPertanyaan(text.replace(/^([A-D])\./, ""));
      return;
    }

    // ================= BENAR SALAH =================
    if (/^(benar|salah)$/i.test(text)) {
      soal.tipe = "bs";
      return;
    }

    // ================= MENJODOHKAN =================
    if (/^\d+\s*[-–]\s*/.test(text)) {
      soal.tipe = "menjodohkan";
      const [kiri, kanan] = text.split(/[-–]/);
      soal.pasangan.push({
        soal: kiri.replace(/^\d+/, "").trim(),
        jawaban: kanan.trim()
      });
      return;
    }

    // ================= KUNCI =================
    if (/KUNCI:/i.test(text)) {
      let kunci = text.replace(/KUNCI:/i, "").trim();

      if (soal.tipe === "pg") {
        soal.jawabanBenar = kunci.toUpperCase();
      } else if (soal.tipe === "bs") {
        soal.jawabanBenar = kunci.toLowerCase();
      } else {
        soal.tipe = "isian";
        soal.jawabanBenar = kunci;
      }
      return;
    }

    // ================= PERTANYAAN =================
    if (text) {
      soal.pertanyaan += " " + bersihkanPertanyaan(text);
    }
  });

  if (soal) tambahSoal(soal);
}


// ======================================================
// ===================== SIMPAN SEMUA ===================
// ======================================================
window.simpanSemua = async () => {
  setLoading(btnSimpan, "💾 Menyimpan...");
  try {
    const judul = judulUjian.value.trim();
    const mapel = mapelInput.value.trim();
    const kelas = kelasInput.value.trim();

    if (!judul || !mapel || !kelas) {
      throw new Error("Judul, mapel, dan kelas wajib diisi");
    }

    const docId = buatDocId(judul, mapel, kelas);
    const docRef = doc(db, "bank_soal", docId);

    const snap = await getDoc(docRef);
    if (snap.exists()) {
      throw new Error("Soal sudah ada");
    }

    const soalPG = [];
    const soalEssay = [];

    document.querySelectorAll(".soal-card").forEach(card => {
      const tipe = card.querySelector(".tipe-soal").value;
      const pertanyaan = bersihkanPertanyaan(
        card.querySelector(".pertanyaan").innerText
      );
      const gambar = card.querySelector("img")?.src || null;

      if (tipe === "pg") {
        const opsi = {};
        card.querySelectorAll(".opsi-input").forEach((o, i) => {
          if (o.innerText.trim()) {
            opsi[String.fromCharCode(65 + i)] = o.innerText.trim();
          }
        });

        const kunci = card.querySelector(".jawaban").value;
        if (!kunci) return;

        soalPG.push({
          id: buatSoalId("PG", soalPG.length + 1),
          pertanyaan,
          gambar,
          opsi,
          jawabanBenar: kunci
        });
      } else {
        if (!pertanyaan && !gambar) return;

        soalEssay.push({
          id: buatSoalId("E", soalEssay.length + 1),
          pertanyaan,
          gambar,
          skorMax: 10
        });
      }
    });

    await setDoc(docRef, {
      judul,
      mapel,
      kelas,
      soalPG,
      soalEssay,
      dibuat: serverTimestamp()
    });

    toast("✅ Soal berhasil disimpan");
    daftarSoal.innerHTML = "";

  } catch (err) {
    toast("❌ " + err.message, "error");
  } finally {
    stopLoading(btnSimpan);
  }
};

btnSimpan?.addEventListener("click", e => {
  e.preventDefault();
  simpanSemua();
});
