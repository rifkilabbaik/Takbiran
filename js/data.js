/* Takbiran — master data penilaian.
   Bobot tidak boleh diubah tanpa persetujuan: tiap set berjumlah 100. */
(function (global) {
  'use strict';

  var TOKO = [
    "Ahmad Yani","Al Fathu","Angkrek","Antapani","Anyer","Babakan Sari","Baleendah","Banteng",
    "Baros","Batununggal","BBS","Bhayangkara","Bojongsoang","Bukit Barisan","Bulak Laut",
    "Cagar Alam","Caringin","Cibaraja","Cibeber","Cibinong","Cidahu","Cihampelas","Cikajang",
    "Cikande","Cileunyi","Cimanggu","Cimanuk","Cipasir","Cipocok","Ciracas","Ciruas","Ciwaru",
    "Ciwidey","Derwati","Gading Tutuka","Galuhmas","Gardu Tanjak","Gegerkalong","Grogol",
    "Indihiang","Jatos","Jombang","Juanda","Kaligandu","Kalitimbang","Kasemen","Katapang",
    "Kebon Dalem","Kelapa Dua","Kragilan","Kramatwatu","Krenceng","Labuan","Lebak Indah","Legok",
    "Lopang","Majalengka","Majasari","Margaasih","Margahayu","Mega Regency","Menes","Merak",
    "Multatuli","Munjul","Ona Siliwangi","Pakupatan","Palabuhan Ratu","Panam Simpang Satria",
    "Pandanwangi","Panimbang","PCI","Perjuangan","Permata Cimahi","Perumnas Cirebon","Petir",
    "Pipitan","Rancamanyar","Rumbai","Sarimanah","Seneja","Serdang","Siliwangi Tasik",
    "Simpang Lima","Singaparna","Sudirman Indramayu","Sukagalih","Sukamenak","Sumber","Taktakan",
    "Taman Cilegon Indah","Tegal","Tegal Cabe","Temu Putih","Tubagus Ismail","Ujung Berung",
    "Waringin","Warnasari","Warung Gunung","Weru"
  ].sort(function (a, b) {
    return a.localeCompare(b, 'id');
  });

  var LANGKAH7 = [
    { section: "GREETING", items: [
      { name: "3S (Senyum, salam, sapa)", bobot: 5 },
      { name: "Gestur tangan terbuka", bobot: 4 },
      { name: "Menanyakan “makan disini?”", bobot: 5 }
    ]},
    { section: "TAKING ORDER", items: [
      { name: "Menanyakan nama customer", bobot: 4 },
      { name: "Menyebut nama sendiri", bobot: 4 },
      { name: "Memberi respon ketika customer memesan", bobot: 7 },
      { name: "Eye contact", bobot: 5 }
    ]},
    { section: "SUGGESTIVE SELLING", items: [
      { name: "Tidak mengabsen menu", bobot: 5 },
      { name: "Merekomendasikan menu yang relevan", bobot: 8 },
      { name: "Menggunakan bahasa suggestive “mau coba?/sekalian”", bobot: 5 },
      { name: "Rekomendasi menu promo", bobot: 8 }
    ]},
    { section: "REPEAT ORDER", items: [
      { name: "Menyebutkan menu sesuai urutan", bobot: 3 },
      { name: "Menyebutkan harga", bobot: 4 },
      { name: "Menanyakan metode pembayaran", bobot: 4 }
    ]},
    { section: "PACKING", items: [
      { name: "Menyiapkan fast product apabila ada", bobot: 5 }
    ]},
    { section: "GIVING", items: [
      { name: "Meletakan & menyebutkan fast product yang telah disiapkan sebelumnya", bobot: 5 },
      { name: "Menyelesaikan transaksi", bobot: 5 },
      { name: "Memberikan strook dengan 2 tangan", bobot: 5 }
    ]},
    { section: "CLOSING", items: [
      { name: "Memberi estimasi waktu & WCS apabila ada pesanan menunggu", bobot: 4 },
      { name: "Ditutup dengan salam dan do'a", bobot: 5 }
    ]}
  ];

  var DC_ITEMS = 15;
  var DC_BOBOT = 100 / DC_ITEMS;

  var DOUBLECHECK = [
    { section: "PENGECEKAN PESANAN", items: [
      { name: "Mengecek kualitas product" },
      { name: "Mengecek kelengkapan condiment" },
      { name: "Mencoret docket/check strook" }
    ]},
    { section: "PERSIAPAN SEBELUM MEMANGGIL CUSTOMER", items: [
      { name: "Menjajarkan pesanan di atas meja pick up" },
      { name: "Membuka setengah packaging (take away)" },
      { name: "Menyiapkan alat makan (side menu)" },
      { name: "Menyiapkan plastic bag (take away) / tray (dine in)" }
    ]},
    { section: "MEMANGGIL CUSTOMER", items: [
      { name: "Menggunakan WCS" },
      { name: "Mengucap “terima kasih telah menunggu”" },
      { name: "Meminta WCS untuk dikembalikan" },
      { name: "Meminjam strook customer untuk cek kedua" }
    ]},
    { section: "MENGECEK PRODUK", items: [
      { name: "Menyebutkan menu sambil diperlihatkan pada customer" },
      { name: "Mencoret strook customer di bagian produk yang sudah siap diberikan" },
      { name: "Mengembalikan strook sebelum memberikan pesanan" },
      { name: "Closing: memberikan pesanan sambil mengucap terima kasih & do'a" }
    ]}
  ].map(function (sec) {
    return {
      section: sec.section,
      items: sec.items.map(function (it) { return { name: it.name, bobot: DC_BOBOT }; })
    };
  });

  var KEBERSIHAN = {
    parkir: { label: "Parkir", items: [
      { name: "Area parkir bersih dan rapi", bobot: 15 },
      { name: "Marka parkir jelas dan tidak pudar", bobot: 5 },
      { name: "Tulisan “Parkir Gratis” tersedia", bobot: 15 },
      { name: "Tempat sampah tersedia", bobot: 5 },
      { name: "Tempat sampah bersih & tertutup", bobot: 10 },
      { name: "Tanaman bersih & terawat", bobot: 5 },
      { name: "Tidak ada bau menyengat", bobot: 15 },
      { name: "CCTV tersedia", bobot: 15 },
      { name: "CCTV berfungsi dengan baik", bobot: 15 }
    ]},
    counter: { label: "Counter Kasir", items: [
      { name: "Counter bersih dari debu & kotoran", bobot: 12 },
      { name: "Area counter bersih & rapi", bobot: 10 },
      { name: "Balon tersedia (akhir pekan)", bobot: 5 },
      { name: "Payung tersedia", bobot: 5 },
      { name: "Tempat sampah tersedia", bobot: 5 },
      { name: "Tempat sampah bersih & tertutup", bobot: 8 },
      { name: "Lampu chicken warm menyala semua", bobot: 12 },
      { name: "Menu board jelas & tidak pudar", bobot: 10 },
      { name: "Media promosi terbaru terpasang", bobot: 10 },
      { name: "Menu TV board menyala", bobot: 8 },
      { name: "Menu TV board menampilkan menu relevan", bobot: 7 },
      { name: "Tempat menunggu pesanan tersedia", bobot: 8 }
    ]},
    dining: { label: "Dining", items: [
      { name: "Kaca & pintu bersih tanpa noda", bobot: 3 },
      { name: "Lantai bersih", bobot: 5 },
      { name: "Tidak ada ubin pecah membahayakan", bobot: 5 },
      { name: "Dinding bersih & cemerlang", bobot: 3 },
      { name: "Meja bersih & tidak lengket", bobot: 6 },
      { name: "Kursi bersih & kokoh", bobot: 5 },
      { name: "Langit-langit bersih (tanpa sarang laba-laba)", bobot: 3 },
      { name: "Tempat sampah tersedia", bobot: 2 },
      { name: "Tempat sampah bersih & tertutup", bobot: 3 },
      { name: "Suhu udara nyaman", bobot: 5 },
      { name: "Tidak ada bau menyengat", bobot: 5 },
      { name: "Pengharum ruangan tersedia", bobot: 2 },
      { name: "Wi-Fi tersedia", bobot: 3 },
      { name: "Kecepatan internet baik", bobot: 3 },
      { name: "Colokan listrik berfungsi", bobot: 3 },
      { name: "Colokan listrik terpasang rapi & aman", bobot: 3 },
      { name: "Lampu menyala semua", bobot: 3 },
      { name: "Nasyid diputar dengan volume sesuai", bobot: 5 },
      { name: "Bebas serangga, kucing, pengamen", bobot: 5 },
      { name: "Baby chair tersedia", bobot: 2 },
      { name: "Baby chair bersih & berfungsi", bobot: 3 },
      { name: "Playland tersedia", bobot: 2 },
      { name: "Playland bersih & aman", bobot: 4 },
      { name: "Wastafel tersedia", bobot: 2 },
      { name: "Wastafel bersih", bobot: 4 },
      { name: "Kaca wastafel bersih", bobot: 2 },
      { name: "Sabun cuci tangan tersedia", bobot: 5 },
      { name: "Pengering/tisu tangan tersedia", bobot: 4 }
    ]},
    toilet: { label: "Toilet", items: [
      { name: "Toilet bersih & tidak berbau", bobot: 14 },
      { name: "Lantai bersih & tidak licin", bobot: 10 },
      { name: "Dinding bersih", bobot: 5 },
      { name: "Langit-langit bersih", bobot: 3 },
      { name: "Air mengalir lancar", bobot: 10 },
      { name: "Flush toilet berfungsi", bobot: 10 },
      { name: "Pintu dapat dikunci", bobot: 8 },
      { name: "Sabun cuci tangan tersedia", bobot: 8 },
      { name: "Tisu toilet tersedia", bobot: 5 },
      { name: "Tempat sampah tersedia", bobot: 3 },
      { name: "Tempat sampah bersih & tertutup", bobot: 5 },
      { name: "Pengharum ruangan tersedia", bobot: 5 },
      { name: "Lampu menyala baik", bobot: 7 },
      { name: "Ventilasi/exhaust berfungsi", bobot: 7 }
    ]},
    mushola: { label: "Mushola", items: [
      { name: "Lantai bersih, tidak lengket/licin", bobot: 13 },
      { name: "Tempat wudhu bersih", bobot: 10 },
      { name: "Air wudhu mengalir lancar", bobot: 10 },
      { name: "Sandal wudhu tersedia", bobot: 5 },
      { name: "Sajadah tersedia", bobot: 8 },
      { name: "Sarung tersedia", bobot: 5 },
      { name: "Mukena tersedia", bobot: 8 },
      { name: "Sajadah, sarung, mukena bersih & harum", bobot: 10 },
      { name: "Al-Quran tersedia", bobot: 5 },
      { name: "Rak perlengkapan rapi", bobot: 3 },
      { name: "Pengharum ruangan tersedia", bobot: 5 },
      { name: "Tidak ada bau menyengat", bobot: 10 },
      { name: "Arah kiblat terlihat jelas", bobot: 8 }
    ]}
  };

  var AREAS = ['parkir', 'counter', 'dining', 'toilet', 'mushola'];

  var JENIS = {
    '7langkah':    { label: '7 Langkah Pelayanan', short: '7 Langkah',    petugas: 'Nama Kasir',        mode: 'skala' },
    'doublecheck': { label: 'Double Check Order',  short: 'Double Check', petugas: 'Nama Kasir/Server', mode: 'skala' },
    'kebersihan':  { label: 'Kebersihan',          short: 'Kebersihan',   petugas: 'Nama Auditor',      mode: 'checklist' }
  };

  /* Kategori dihitung dari nilai yang SUDAH dibulatkan ke 2 desimal,
     supaya label tidak pernah bertentangan dengan angka yang tampil. */
  function kategori(pct) {
    var p = Math.round(pct * 100) / 100;
    if (p >= 100) return { nama: 'Sempurna',    tone: 'good' };
    if (p >= 90)  return { nama: 'Sangat Baik', tone: 'good' };
    if (p >= 80)  return { nama: 'Baik',        tone: 'good' };
    if (p >= 75)  return { nama: 'Cukup',       tone: 'warn' };
    return          { nama: 'Buruk',       tone: 'bad' };
  }

  function sectionsFor(jenis) {
    if (jenis === '7langkah') return LANGKAH7;
    if (jenis === 'doublecheck') return DOUBLECHECK;
    return null;
  }

  global.TKB_DATA = {
    TOKO: TOKO,
    LANGKAH7: LANGKAH7,
    DOUBLECHECK: DOUBLECHECK,
    KEBERSIHAN: KEBERSIHAN,
    AREAS: AREAS,
    JENIS: JENIS,
    kategori: kategori,
    sectionsFor: sectionsFor
  };
})(window);
