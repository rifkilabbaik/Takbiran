# Takbiran — Cetak Biru Pelayanan

Aplikasi web (PWA) untuk menilai kinerja pelayanan outlet Labbaik Chicken: **7 Langkah
Pelayanan**, **Double Check Order**, dan **Kebersihan** 5 area. Hasil tersimpan di
perangkat dan dikirim sebagai **teks** ke Google Spreadsheet.

Dibuat untuk dipakai satu tangan di lapangan: berjalan penuh tanpa sinyal, menyimpan
otomatis, dan mengirim sendiri begitu kembali online.

---

## Isi

| Berkas | Isi |
|---|---|
| `index.html` | Kerangka layar (4 tab + wizard penilaian) |
| `css/app.css` | Design system: token, tema terang/gelap, komponen |
| `js/data.js` | Data master: 100 toko, item & bobot penilaian, aturan kategori |
| `js/store.js` | Penyimpanan lokal — localStorage (data) + IndexedDB (foto) |
| `js/sync.js` | Sinkronisasi ke Apps Script Web App |
| `js/charts.js` | Grafik SVG inline (tanpa library, jalan offline) |
| `js/export.js` | Ekspor PDF / Excel / Markdown |
| `js/app.js` | Navigasi & seluruh layar |
| `sw.js`, `manifest.json`, `icons/` | Kelengkapan PWA |
| `apps-script/Code.gs` | Kode backend untuk Google Spreadsheet |

---

## Menyiapkan spreadsheet

Data hanya masuk ke spreadsheet setelah langkah ini dijalankan.

1. Buka [spreadsheet tujuan](https://docs.google.com/spreadsheets/d/159eILHT2HGI7lL8le4Eo32lZxJBE0xHM7JZr2peFMpY/edit).
2. **Extensions ▸ Apps Script**.
3. Hapus isi editor, tempel seluruh isi `apps-script/Code.gs`, lalu simpan.
4. Jalankan fungsi `setup` sekali dari editor dan setujui izin yang diminta. Dua sheet
   akan dibuat: **Rekap** dan **Detail**.
5. **Deploy ▸ New deployment ▸ Web app**:
   - *Execute as*: **Me**
   - *Who has access*: **Anyone**
6. Salin URL yang berakhiran `/exec`.
7. Di aplikasi: **Pengaturan ▸ URL Web App**, tempel, lalu tekan **Uji koneksi**.
   Balasan yang benar menyebutkan nama spreadsheet.

> Setiap kali `Code.gs` diubah, deploy ulang sebagai **versi baru** — kalau tidak, URL
> lama masih menjalankan kode lama.

### Bentuk data di spreadsheet

**Rekap** — satu baris per penilaian:

`ID · Waktu Input · Tanggal · Jam · Jenis · Area · Toko · Petugas · Skor · Maks ·
Persen · Kategori · Jumlah Item · Item Tidak Memenuhi · Jumlah Foto · Catatan · Perangkat`

**Detail** — satu baris per item:

`ID · Tanggal · Toko · Petugas · Jenis · Grup · Item · Nilai · Maks · Status · Keterangan · Foto`

Semuanya teks dan angka; **tidak ada gambar** yang dikirim. Kolom `Foto` hanya menandai
`Ada`. Foto bukti tetap di perangkat dan hanya ikut pada ekspor PDF/Excel.

Penulisan bersifat **upsert berdasarkan kolom ID**, jadi record yang sama boleh dikirim
berulang tanpa memunculkan baris ganda. Sifat itulah yang membuat antrean offline aman.

---

## Cara kerja sinkronisasi

```
selesai menilai
   └─ simpan lokal (langsung, selalu berhasil)
      └─ POST ke Web App
         ├─ berhasil            → status "Tersimpan"
         ├─ CORS diblokir       → kirim ulang mode no-cors → status "Terkirim",
         │                        diverifikasi lewat ?action=ids saat sinkron berikutnya
         └─ offline / gagal     → masuk antrean, dikirim otomatis saat online kembali
```

POST memakai `Content-Type: text/plain` dengan sengaja: itu membuatnya jadi *simple
request* sehingga tidak memicu CORS preflight yang selalu ditolak Apps Script. Untuk
pembacaan, `fetch` dicoba lebih dulu dan JSONP dipakai sebagai cadangan.

Endpoint yang tersedia: `?action=ping`, `?action=ids`, `?action=list&limit=n`,
`?action=detail&id=…`, serta POST `{action:'save'|'saveMany'|'delete'}`.

---

## Perhitungan skor

- **7 Langkah** — 20 item skala 1–5, bobot per item berjumlah 100.
  Nilai item = `(skor / 5) × bobot`.
- **Double Check** — 15 item skala 1–5, bobot rata `100/15` per item.
- **Kebersihan** — Ya/Tidak. Ya = bobot penuh, Tidak = 0. Bobot **tiap area** berjumlah
  100, sehingga saat beberapa area dinilai sekaligus bobot antar-area setara.

Kategori: **Sempurna** 100 · **Sangat Baik** ≥90 · **Baik** ≥80 · **Cukup** ≥75 ·
**Buruk** <75. Dihitung dari angka yang sudah dibulatkan ke dua desimal, supaya label
tidak pernah bertentangan dengan persentase yang tampil.

Item kosong pada penilaian skala dihitung 0 dan aplikasi meminta konfirmasi lebih dulu.
Penilaian kebersihan wajib terisi seluruhnya.

---

## Menjalankan & memasang

Aplikasi statis — cukup layani foldernya lewat HTTPS (GitHub Pages sudah cukup).
Service worker dan pemasangan PWA membutuhkan HTTPS atau `localhost`.

```bash
npx http-server -p 8080 -c-1 .
# lalu buka http://localhost:8080
```

Di ponsel: buka URL-nya, pilih **Add to Home Screen**. Setelah terpasang, aplikasi jalan
tanpa internet — termasuk ekspor PDF dan Excel, karena pustakanya ikut di-cache saat
pemasangan.

Untuk merilis versi baru, naikkan `VERSION` di `sw.js` agar cache lama dibuang.

---

## Catatan penyimpanan

- Riwayat & pengaturan → `localStorage`. Saat kuota penuh, riwayat lama yang **sudah
  tersinkron** dipangkas lebih dulu; yang belum terkirim tidak pernah dibuang otomatis.
- Foto bukti → IndexedDB, dikompres ke maksimal 1280px / kualitas 0,72.
- Draft tersimpan otomatis saat mengisi. Menekan Kembali, menutup aplikasi, atau
  kehabisan baterai tidak menghilangkan jawaban.
- **Pengaturan ▸ Hapus semua data lokal** memberi peringatan tambahan bila masih ada
  penilaian yang belum sampai ke spreadsheet.
