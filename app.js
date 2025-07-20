let produk = [];
let histori = JSON.parse(localStorage.getItem("histori")) || [];

function updateDaftar() {
  const daftar = document.getElementById("daftar-produk");
  daftar.innerHTML = "";
  let total = 0;

  produk.forEach((item, index) => {
    total += item.harga;
    const li = document.createElement("li");
    li.textContent = `${item.nama} - Rp${item.harga.toLocaleString()}`;
    daftar.appendChild(li);
  });

  document.getElementById("total").textContent = `Rp${total.toLocaleString()}`;
}

function tambahProduk() {
  const nama = document.getElementById("nama").value.trim();
  const harga = parseInt(document.getElementById("harga").value);

  if (!nama || isNaN(harga) || harga <= 0) {
    alert("Isi nama dan harga produk dengan benar!");
    return;
  }

  produk.push({ nama, harga });
  document.getElementById("nama").value = "";
  document.getElementById("harga").value = "";
  updateDaftar();
}

function selesaikanTransaksi() {
  const alamat = document.getElementById('alamat').value.trim();
  const bayar = parseInt(document.getElementById('bayar').value);
  let total = produk.reduce((sum, item) => sum + item.harga, 0);

  if (!alamat || isNaN(bayar) || produk.length === 0) {
    alert("Isi semua data pelanggan dan produk terlebih dahulu.");
    return;
  }

  if (bayar < total) {
    alert("Uang yang dibayar kurang dari total!");
    return;
  }

  const kembalian = bayar - total;
  const tanggal = new Date().toLocaleString("id-ID");

  const transaksi = {
    nama: "Transaksi WiFi",
    alamat,
    produk: [...produk],
    harga: total,
    bayar,
    kembalian,
    tanggal
  };

  histori.push(transaksi);
  localStorage.setItem('histori', JSON.stringify(histori));

  tampilkanHistori();

  // Reset semua input dan produk
  document.getElementById('alamat').value = '';
  document.getElementById('bayar').value = '';
  produk = [];
  updateDaftar();
}

function tampilkanHistori(data = null) {
  const historiList = document.getElementById('histori-transaksi');
  historiList.innerHTML = "";

  const dataHistori = data || JSON.parse(localStorage.getItem('histori')) || [];

  dataHistori.forEach((item, index) => {
    const produkList = item.produk.map(p => `${p.nama} (Rp${p.harga.toLocaleString()})`).join(", ");

    const li = document.createElement('li');
    li.innerHTML = `
      ${item.tanggal} - ${item.nama} (${item.alamat})<br>
      Produk: ${produkList}<br>
      Total: Rp${item.harga.toLocaleString()} | Dibayar: Rp${item.bayar.toLocaleString()} | Kembalian: Rp${item.kembalian.toLocaleString()}
      <button onclick="hapusTransaksi(${index})" style="margin-left:10px;color:red;">🗑️</button>
    `;
    historiList.appendChild(li);
  });
}

function filterHistori() {
  const tanggal = document.getElementById("filter-tanggal").value;
  if (!tanggal) {
    tampilkanHistori();
    return;
  }

  const hasil = histori.filter((t) => t.tanggal.startsWith(tanggal));
  tampilkanHistori(hasil);
}

function eksporCSV() {
  const histori = JSON.parse(localStorage.getItem('histori')) || [];
  if (histori.length === 0) {
    alert("Tidak ada data untuk diekspor.");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Tanggal,Nama,Alamat,Produk,Harga,Bayar,Kembalian\n";

  histori.forEach(item => {
    const produkList = item.produk.map(p => `${p.nama} (Rp${p.harga})`).join(" | ");
    csvContent += `${item.tanggal},${item.nama},${item.alamat},"${produkList}",${item.harga},${item.bayar},${item.kembalian}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "riwayat_transaksi.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function cetakStruk() {
  if (produk.length === 0) {
    alert("Belum ada produk ditambahkan!");
    return;
  }

  const waktu = new Date().toLocaleString("id-ID");
  const alamat = document.getElementById("alamat").value.trim();

  let struk = `
    <h2>TOMIHONK NETWORK</h2>
    <p>Jl. Projosumarto II, Kaligayam, Talang - Tegal</p>
    <p>${waktu}</p>
    <p>Alamat: ${alamat}</p>
    <div class="line"></div>
    <table style="width:100%">
      <tr><th align="left">Produk</th><th align="right">Harga</th></tr>
  `;

  let total = 0;
  produk.forEach((item) => {
    total += item.harga;
    struk += `<tr><td>${item.nama}</td><td align="right">Rp${item.harga.toLocaleString()}</td></tr>`;
  });

  struk += `
      </table>
      <div class="line"></div>
      <p><strong>Total: Rp${total.toLocaleString()}</strong></p>
      <p>Terima kasih!</p>
    `;

  const win = window.open("", "_blank", "width=300,height=600");
  win.document.write(`
    <html>
      <head>
        <title>Struk Pembayaran</title>
        <style>
          body { font-family: monospace; padding: 10px; }
          .line { border-top: 1px dashed #000; margin: 10px 0; }
          table { width: 100%; }
        </style>
      </head>
      <body>${struk}</body>
    </html>
  `);
  win.document.close();
  win.print();
}

function hapusTransaksi(index) {
  if (confirm("Yakin ingin menghapus transaksi ini?")) {
    let histori = JSON.parse(localStorage.getItem('histori')) || [];
    histori.splice(index, 1);
    localStorage.setItem('histori', JSON.stringify(histori));
    tampilkanHistori(); // Refresh tampilan riwayat
  }
}

// Tampilkan histori saat halaman dimuat
tampilkanHistori();

// Register service worker (jika ada)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('✅ Service Worker terdaftar'))
    .catch((err) => console.error('❌ SW gagal:', err));
}
