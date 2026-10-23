import * as XLSX from 'xlsx';
import { InventoryItem, StockMutation, LoanRecord, InstitutionSettings } from '../types/inventory';

export const exportService = {
  /**
   * Export all or selected data into a high-fidelity Microsoft Excel (.xlsx) workbook
   */
  exportToExcel(
    items: InventoryItem[],
    mutations: StockMutation[],
    loans: LoanRecord[],
    settings: InstitutionSettings,
    target: 'all' | 'inventory' | 'stock' | 'loans' = 'all'
  ) {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Inventaris
    if (target === 'all' || target === 'inventory') {
      const inventoryData = items.map((item, idx) => ({
        'No': idx + 1,
        'Kode Barang': item.code,
        'Nama Barang / Aset': item.name,
        'Kategori': item.category,
        'Merk / Brand': item.brand,
        'Spesifikasi': item.specs,
        'Kondisi': item.condition,
        'Lokasi Ruangan': item.location,
        'Total Stok': item.totalStock,
        'Sedang Dipinjam': item.borrowedStock,
        'Stok Tersedia': item.availableStock,
        'Satuan': item.unit,
        'Harga Perolehan (Rp)': item.price,
        'Total Nilai (Rp)': item.price * item.totalStock,
        'Tgl Pembelian': item.purchaseDate,
        'Keterangan': item.notes || '-',
      }));
      const wsInv = XLSX.utils.json_to_sheet(inventoryData);
      XLSX.utils.book_append_sheet(wb, wsInv, 'Daftar_Inventaris');
    }

    // Sheet 2: Stok & Mutasi
    if (target === 'all' || target === 'stock') {
      const stockSummary = items.map((item, idx) => ({
        'No': idx + 1,
        'Kode Barang': item.code,
        'Nama Barang': item.name,
        'Total Fisik': item.totalStock,
        'Sedang Dipinjam': item.borrowedStock,
        'Tersedia': item.availableStock,
        'Batas Minimum Alert': item.minStockAlert,
        'Status Stok': item.availableStock === 0 ? 'Habis' : item.availableStock <= item.minStockAlert ? 'Menipis' : 'Aman',
        'Satuan': item.unit,
        'Lokasi': item.location,
      }));
      const wsStock = XLSX.utils.json_to_sheet(stockSummary);
      XLSX.utils.book_append_sheet(wb, wsStock, 'Status_Stok_Barang');

      const mutationData = mutations.map((mut, idx) => ({
        'No': idx + 1,
        'Tanggal': mut.date,
        'No Referensi / Dokumen': mut.referenceNumber,
        'Kode Barang': mut.itemCode,
        'Nama Barang': mut.itemName,
        'Jenis Mutasi': mut.type,
        'Jumlah (Qty)': mut.quantity,
        'Stok Sebelumnya': mut.previousStock,
        'Stok Akhir': mut.currentStock,
        'Asal / Tujuan': mut.sourceOrDestination,
        'Petugas': mut.operator,
        'Keterangan': mut.notes,
      }));
      const wsMut = XLSX.utils.json_to_sheet(mutationData);
      XLSX.utils.book_append_sheet(wb, wsMut, 'Riwayat_Mutasi_Stok');
    }

    // Sheet 3: Peminjaman Alat
    if (target === 'all' || target === 'loans') {
      const loanData = loans.map((loan, idx) => ({
        'No': idx + 1,
        'Kode Transaksi': loan.loanCode,
        'Kode Barang': loan.itemCode,
        'Nama Alat / Barang': loan.itemName,
        'Jumlah Pinjam': loan.quantity,
        'Nama Peminjam': loan.borrowerName,
        'Tipe Peminjam': loan.borrowerType,
        'No Identitas (NIP/NISN)': loan.borrowerIdentifier,
        'Kontak / WA': loan.borrowerContact,
        'Tanggal Pinjam': loan.loanDate,
        'Tenggat Kembali': loan.dueDate,
        'Tanggal Dikembalikan': loan.returnDate || '-',
        'Status': loan.status,
        'Kondisi Awal': loan.initialCondition,
        'Kondisi Kembali': loan.returnCondition || '-',
        'Keperluan': loan.purpose,
        'Catatan': loan.notes || '-',
      }));
      const wsLoans = XLSX.utils.json_to_sheet(loanData);
      XLSX.utils.book_append_sheet(wb, wsLoans, 'Data_Peminjaman_Alat');
    }

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `Laporan-Inventaris-${target.toUpperCase()}-${dateStr}.xlsx`;
    XLSX.writeFile(wb, filename);
  },

  /**
   * Export official formatted report as Microsoft Word document (.doc)
   */
  exportToWord(
    reportTitle: string,
    items: InventoryItem[],
    loans: LoanRecord[],
    mutations: StockMutation[],
    settings: InstitutionSettings,
    type: 'inventaris' | 'stok' | 'peminjaman' | 'semua'
  ) {
    const today = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    let tableHtml = '';

    if (type === 'inventaris' || type === 'semua') {
      tableHtml += `
        <h3 style="margin-top: 24px; font-size: 14pt; color: #1e293b;">A. DAFTAR INVENTARIS & ASET BARANG</h3>
        <table border="1" cellspacing="0" cellpadding="6" style="border-collapse: collapse; width: 100%; font-size: 9pt; font-family: Arial, sans-serif;">
          <tr style="background-color: #f1f5f9; font-weight: bold; text-align: center;">
            <th style="width: 30px;">No</th>
            <th>Kode</th>
            <th>Nama Barang</th>
            <th>Kategori</th>
            <th>Kondisi</th>
            <th>Lokasi</th>
            <th style="width: 50px;">Stok</th>
            <th style="width: 50px;">Tersedia</th>
            <th>Harga Perolehan</th>
          </tr>
          ${items
            .map(
              (item, idx) => `
            <tr>
              <td align="center">${idx + 1}</td>
              <td><b>${item.code}</b></td>
              <td>${item.name}</td>
              <td>${item.category}</td>
              <td align="center">${item.condition}</td>
              <td>${item.location}</td>
              <td align="center">${item.totalStock} ${item.unit}</td>
              <td align="center"><b>${item.availableStock}</b></td>
              <td align="right">Rp ${item.price.toLocaleString('id-ID')}</td>
            </tr>
          `
            )
            .join('')}
        </table>
      `;
    }

    if (type === 'stok' || type === 'semua') {
      tableHtml += `
        <h3 style="margin-top: 28px; font-size: 14pt; color: #1e293b;">B. REKAPITULASI STOK & MUTASI BARANG</h3>
        <table border="1" cellspacing="0" cellpadding="6" style="border-collapse: collapse; width: 100%; font-size: 9pt; font-family: Arial, sans-serif;">
          <tr style="background-color: #f1f5f9; font-weight: bold; text-align: center;">
            <th style="width: 30px;">No</th>
            <th>Tanggal</th>
            <th>No. Dokumen</th>
            <th>Nama Barang</th>
            <th>Mutasi</th>
            <th>Qty</th>
            <th>Stok Akhir</th>
            <th>Keterangan / Asal-Tujuan</th>
          </tr>
          ${mutations
            .map(
              (m, idx) => `
            <tr>
              <td align="center">${idx + 1}</td>
              <td align="center">${m.date}</td>
              <td>${m.referenceNumber}</td>
              <td>${m.itemName}</td>
              <td align="center"><b>${m.type}</b></td>
              <td align="center">${m.quantity}</td>
              <td align="center">${m.currentStock}</td>
              <td>${m.sourceOrDestination} (${m.notes})</td>
            </tr>
          `
            )
            .join('')}
        </table>
      `;
    }

    if (type === 'peminjaman' || type === 'semua') {
      tableHtml += `
        <h3 style="margin-top: 28px; font-size: 14pt; color: #1e293b;">C. CATATAN SIRKULASI PEMINJAMAN ALAT</h3>
        <table border="1" cellspacing="0" cellpadding="6" style="border-collapse: collapse; width: 100%; font-size: 9pt; font-family: Arial, sans-serif;">
          <tr style="background-color: #f1f5f9; font-weight: bold; text-align: center;">
            <th style="width: 30px;">No</th>
            <th>Kode Pinjam</th>
            <th>Nama Alat</th>
            <th>Peminjam</th>
            <th>Status/Tipe</th>
            <th>Tgl Pinjam</th>
            <th>Tenggat</th>
            <th>Tgl Kembali</th>
            <th>Status</th>
          </tr>
          ${loans
            .map(
              (l, idx) => `
            <tr>
              <td align="center">${idx + 1}</td>
              <td><b>${l.loanCode}</b></td>
              <td>${l.itemName} (${l.quantity} unit)</td>
              <td>${l.borrowerName} (${l.borrowerContact})</td>
              <td align="center">${l.borrowerType}</td>
              <td align="center">${l.loanDate}</td>
              <td align="center">${l.dueDate}</td>
              <td align="center">${l.returnDate || '-'}</td>
              <td align="center"><b>${l.status}</b></td>
            </tr>
          `
            )
            .join('')}
        </table>
      `;
    }

    const wordContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${reportTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.4; color: #0f172a; margin: 40px; }
          .kop-header { text-align: center; border-bottom: 3px double #000; padding-bottom: 12px; margin-bottom: 24px; }
          .inst-name { font-size: 16pt; font-weight: bold; text-transform: uppercase; margin: 0; }
          .inst-sub { font-size: 12pt; font-weight: bold; margin: 4px 0; color: #334155; }
          .inst-detail { font-size: 9.5pt; color: #475569; margin: 2px 0; }
          .doc-title { text-align: center; font-size: 14pt; font-weight: bold; text-decoration: underline; margin-top: 20px; }
          .doc-meta { text-align: center; font-size: 10pt; color: #64748b; margin-bottom: 20px; }
          .sig-table { width: 100%; margin-top: 50px; page-break-inside: avoid; }
        </style>
      </head>
      <body>
        <div class="kop-header">
          <p class="inst-name">${settings.institutionName}</p>
          <p class="inst-sub">${settings.subTitle}</p>
          <p class="inst-detail">${settings.address}</p>
          <p class="inst-detail">${settings.contact}</p>
        </div>

        <div class="doc-title">${reportTitle.toUpperCase()}</div>
        <div class="doc-meta">Nomor Registrasi: INV-LAP/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)} | Tanggal Cetak: ${today}</div>

        ${tableHtml}

        <table class="sig-table" border="0" style="width: 100%; margin-top: 45px; border-collapse: collapse;">
          <tr>
            <td style="width: 50%; text-align: center; vertical-align: top;">
              <p>Mengetahui,<br><b>Kepala ${settings.institutionName}</b></p>
              <br><br><br><br>
              <p><b><u>${settings.headmasterName}</u></b><br>NIP. ${settings.headmasterNIP}</p>
            </td>
            <td style="width: 50%; text-align: center; vertical-align: top;">
              <p>${settings.city}, ${today}<br><b>${settings.adminTitle}</b></p>
              <br><br><br><br>
              <p><b><u>${settings.adminName}</u></b><br>NIP/ID. PENGELOLA-SARPRAS</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + wordContent], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
