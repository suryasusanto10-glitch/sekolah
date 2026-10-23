import { useState, useMemo } from 'react';
import { InventoryItem, StockMutation, LoanRecord, InstitutionSettings } from '../types/inventory';
import { exportService } from '../services/exportService';
import { CATEGORIES } from '../data/mockData';
import {
  FileText,
  FileSpreadsheet,
  Printer,
  Download,
  Filter,
  CheckCircle2,
  Calendar,
  Building,
  ShieldCheck,
  Eye,
} from 'lucide-react';

interface ReportsViewProps {
  items: InventoryItem[];
  mutations: StockMutation[];
  loans: LoanRecord[];
  settings: InstitutionSettings;
}

export function ReportsView({ items, mutations, loans, settings }: ReportsViewProps) {
  const [reportType, setReportType] = useState<'inventaris' | 'stok' | 'peminjaman' | 'rusak'>('inventaris');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [selectedLoanStatus, setSelectedLoanStatus] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('2024-01-01');
  const [dateTo, setDateTo] = useState<string>(new Date().toISOString().split('T')[0]);

  // Filtered items for report
  const filteredItems = useMemo(() => {
    return items.filter((i) => {
      const matchCat = selectedCategory === 'all' || i.category === selectedCategory;
      const matchCond = selectedCondition === 'all' || i.condition === selectedCondition;
      return matchCat && matchCond;
    });
  }, [items, selectedCategory, selectedCondition]);

  // Filtered damaged items
  const damagedItems = useMemo(() => {
    return items.filter((i) => i.condition === 'Rusak Ringan' || i.condition === 'Rusak Berat');
  }, [items]);

  // Filtered loans for report
  const filteredLoans = useMemo(() => {
    return loans.filter((l) => {
      const matchStatus = selectedLoanStatus === 'all' || l.status === selectedLoanStatus;
      const matchDate = (!dateFrom || l.loanDate >= dateFrom) && (!dateTo || l.loanDate <= dateTo);
      return matchStatus && matchDate;
    });
  }, [loans, selectedLoanStatus, dateFrom, dateTo]);

  // Filtered mutations
  const filteredMutations = useMemo(() => {
    return mutations.filter((m) => {
      return (!dateFrom || m.date >= dateFrom) && (!dateTo || m.date <= dateTo);
    });
  }, [mutations, dateFrom, dateTo]);

  const todayIndo = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleExportExcel = () => {
    const targetMap = {
      inventaris: 'inventory',
      stok: 'stock',
      peminjaman: 'loans',
      rusak: 'inventory',
    } as const;

    exportService.exportToExcel(
      reportType === 'rusak' ? damagedItems : filteredItems,
      filteredMutations,
      filteredLoans,
      settings,
      targetMap[reportType]
    );
  };

  const handleExportWord = () => {
    const titleMap = {
      inventaris: 'Laporan Buku Induk Inventaris Barang dan Aset',
      stok: 'Laporan Rekapitulasi Stok dan Mutasi Barang',
      peminjaman: 'Laporan Sirkulasi Peminjaman dan Pengembalian Alat',
      rusak: 'Laporan Kondisi Barang Rusak dan Usulan Pemeliharaan',
    };

    const typeMap = {
      inventaris: 'inventaris',
      stok: 'stok',
      peminjaman: 'peminjaman',
      rusak: 'inventaris',
    } as const;

    exportService.exportToWord(
      titleMap[reportType],
      reportType === 'rusak' ? damagedItems : filteredItems,
      filteredLoans,
      filteredMutations,
      settings,
      typeMap[reportType]
    );
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Configuration Card (Hidden during print) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 no-print shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Pusat Generator Laporan & Ekspor Dokumen</h2>
            <p className="text-xs text-slate-500">
              Cetak dan unduh laporan resmi dalam format Word (.doc), Excel (.xlsx), atau PDF.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Unduh Excel (.xlsx)</span>
            </button>

            <button
              onClick={handleExportWord}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-800 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-blue-700" />
              <span>Unduh Word (.doc)</span>
            </button>

            <button
              onClick={handlePrintPDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>

        {/* Report Type Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => setReportType('inventaris')}
            className={`p-3 text-left rounded-lg border text-xs transition-colors cursor-pointer ${
              reportType === 'inventaris'
                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900'
                : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
            }`}
          >
            <span className="font-bold block">1. Buku Induk Inventaris</span>
            <span className="text-[11px] text-slate-500">Data lengkap aset & nilai perolehan</span>
          </button>

          <button
            onClick={() => setReportType('stok')}
            className={`p-3 text-left rounded-lg border text-xs transition-colors cursor-pointer ${
              reportType === 'stok'
                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900'
                : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
            }`}
          >
            <span className="font-bold block">2. Rekapitulasi Stok & Mutasi</span>
            <span className="text-[11px] text-slate-500">Ketersediaan & riwayat keluar-masuk</span>
          </button>

          <button
            onClick={() => setReportType('peminjaman')}
            className={`p-3 text-left rounded-lg border text-xs transition-colors cursor-pointer ${
              reportType === 'peminjaman'
                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900'
                : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
            }`}
          >
            <span className="font-bold block">3. Sirkulasi Peminjaman</span>
            <span className="text-[11px] text-slate-500">Data peminjam, tenggat & pengembalian</span>
          </button>

          <button
            onClick={() => setReportType('rusak')}
            className={`p-3 text-left rounded-lg border text-xs transition-colors cursor-pointer ${
              reportType === 'rusak'
                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900'
                : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
            }`}
          >
            <span className="font-bold block">4. Barang Rusak & Pemeliharaan</span>
            <span className="text-[11px] text-slate-500">Aset perlu perbaikan / usul afkir</span>
          </button>
        </div>

        {/* Report Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 text-xs">
          {reportType !== 'peminjaman' && (
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Kategori</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="all">Semua Kategori</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {reportType === 'peminjaman' ? (
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Status Peminjaman</label>
              <select
                value={selectedLoanStatus}
                onChange={(e) => setSelectedLoanStatus(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="all">Semua Status</option>
                <option value="Dipinjam">Sedang Dipinjam</option>
                <option value="Terlambat">Terlambat (Lewat Tenggat)</option>
                <option value="Kembali">Selesai Dikembalikan</option>
              </select>
            </div>
          ) : reportType === 'inventaris' ? (
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Kondisi Barang</label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="all">Semua Kondisi</option>
                <option value="Baik">Kondisi Baik</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Berat">Rusak Berat</option>
              </select>
            </div>
          ) : null}

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg bg-white font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg bg-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* OFFICIAL REPORT PREVIEW CONTAINER (Styled for on-screen & print-to-PDF) */}
      <div className="bg-white border border-slate-300 rounded-xl p-8 sm:p-12 shadow-sm text-slate-900 print:border-none print:shadow-none print:p-0">
        {/* KOP SURAT RESMI */}
        <div className="border-b-4 border-double border-slate-900 pb-4 text-center">
          <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-slate-950">
            {settings.institutionName}
          </h1>
          <h2 className="text-sm font-semibold uppercase text-slate-700 mt-0.5">
            {settings.subTitle}
          </h2>
          <p className="text-xs text-slate-600 mt-1">{settings.address}</p>
          <p className="text-xs text-slate-500">{settings.contact}</p>
        </div>

        {/* JUDUL DOKUMEN LAPORAN */}
        <div className="text-center my-6">
          <h3 className="text-base sm:text-lg font-bold uppercase underline tracking-wide">
            {reportType === 'inventaris' && 'BUKU INDUK DAFTAR INVENTARIS & ASET BARANG'}
            {reportType === 'stok' && 'LAPORAN REKAPITULASI STOK & MUTASI BARANG'}
            {reportType === 'peminjaman' && 'LAPORAN SIRKULASI PEMINJAMAN DAN PENGEMBALIAN ALAT'}
            {reportType === 'rusak' && 'LAPORAN KONDISI BARANG RUSAK & USULAN PERBAIKAN / AFKIR'}
          </h3>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Nomor: INV-LAP/{new Date().getFullYear()}/042 · Tanggal Cetak: {todayIndo}
          </p>
        </div>

        {/* TABEL DATA LAPORAN */}
        {reportType === 'inventaris' || reportType === 'rusak' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                  <th className="p-2 border border-slate-300 text-center w-10">No</th>
                  <th className="p-2 border border-slate-300">Kode</th>
                  <th className="p-2 border border-slate-300">Nama Barang / Spesifikasi</th>
                  <th className="p-2 border border-slate-300">Kategori</th>
                  <th className="p-2 border border-slate-300 text-center">Kondisi</th>
                  <th className="p-2 border border-slate-300">Lokasi</th>
                  <th className="p-2 border border-slate-300 text-center">Stok</th>
                  <th className="p-2 border border-slate-300 text-center">Tersedia</th>
                  <th className="p-2 border border-slate-300 text-right">Harga Satuan</th>
                </tr>
              </thead>
              <tbody>
                {(reportType === 'rusak' ? damagedItems : filteredItems).map((item, idx) => (
                  <tr key={item.id} className="border-b border-slate-200">
                    <td className="p-2 border border-slate-300 text-center font-mono">{idx + 1}</td>
                    <td className="p-2 border border-slate-300 font-mono font-bold">{item.code}</td>
                    <td className="p-2 border border-slate-300">
                      <span className="font-semibold block">{item.name}</span>
                      <span className="text-[11px] text-slate-500">{item.specs}</span>
                    </td>
                    <td className="p-2 border border-slate-300">{item.category}</td>
                    <td className="p-2 border border-slate-300 text-center font-medium">
                      <span
                        className={
                          item.condition === 'Baik'
                            ? 'text-emerald-700'
                            : item.condition === 'Rusak Ringan'
                            ? 'text-amber-700'
                            : 'text-rose-700 font-bold'
                        }
                      >
                        {item.condition}
                      </span>
                    </td>
                    <td className="p-2 border border-slate-300">{item.location}</td>
                    <td className="p-2 border border-slate-300 text-center font-mono">
                      {item.totalStock} {item.unit}
                    </td>
                    <td className="p-2 border border-slate-300 text-center font-mono font-bold">
                      {item.availableStock}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono">
                      Rp {item.price.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : reportType === 'stok' ? (
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-xs uppercase text-slate-700 mb-2">1. Ringkasan Status Stok Barang Fisik</h4>
              <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                    <th className="p-2 border border-slate-300 text-center w-10">No</th>
                    <th className="p-2 border border-slate-300">Kode</th>
                    <th className="p-2 border border-slate-300">Nama Barang</th>
                    <th className="p-2 border border-slate-300 text-center">Total Fisik</th>
                    <th className="p-2 border border-slate-300 text-center">Dipinjam</th>
                    <th className="p-2 border border-slate-300 text-center">Tersedia</th>
                    <th className="p-2 border border-slate-300 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item, idx) => (
                    <tr key={item.id} className="border-b border-slate-200">
                      <td className="p-2 border border-slate-300 text-center font-mono">{idx + 1}</td>
                      <td className="p-2 border border-slate-300 font-mono font-bold">{item.code}</td>
                      <td className="p-2 border border-slate-300 font-semibold">{item.name}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono">{item.totalStock} {item.unit}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono text-indigo-700">{item.borrowedStock}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono font-bold">{item.availableStock}</td>
                      <td className="p-2 border border-slate-300 text-center font-semibold">
                        {item.availableStock === 0 ? 'Habis' : item.availableStock <= item.minStockAlert ? 'Menipis' : 'Aman'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase text-slate-700 mb-2">2. Riwayat Mutasi Stok Terakhir</h4>
              <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                    <th className="p-2 border border-slate-300 text-center w-10">No</th>
                    <th className="p-2 border border-slate-300">Tanggal</th>
                    <th className="p-2 border border-slate-300">No. Ref</th>
                    <th className="p-2 border border-slate-300">Nama Barang</th>
                    <th className="p-2 border border-slate-300 text-center">Jenis</th>
                    <th className="p-2 border border-slate-300 text-center">Qty</th>
                    <th className="p-2 border border-slate-300 text-center">Stok Akhir</th>
                    <th className="p-2 border border-slate-300">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMutations.map((mut, idx) => (
                    <tr key={mut.id} className="border-b border-slate-200">
                      <td className="p-2 border border-slate-300 text-center font-mono">{idx + 1}</td>
                      <td className="p-2 border border-slate-300 font-mono">{mut.date}</td>
                      <td className="p-2 border border-slate-300 font-mono text-[11px]">{mut.referenceNumber}</td>
                      <td className="p-2 border border-slate-300 font-semibold">{mut.itemName}</td>
                      <td className="p-2 border border-slate-300 text-center font-bold">{mut.type}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono font-bold">{mut.quantity}</td>
                      <td className="p-2 border border-slate-300 text-center font-mono">{mut.currentStock}</td>
                      <td className="p-2 border border-slate-300 text-[11px]">{mut.sourceOrDestination} ({mut.notes})</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                  <th className="p-2 border border-slate-300 text-center w-10">No</th>
                  <th className="p-2 border border-slate-300">No Pinjam</th>
                  <th className="p-2 border border-slate-300">Nama Alat</th>
                  <th className="p-2 border border-slate-300">Nama Peminjam</th>
                  <th className="p-2 border border-slate-300 text-center">Tgl Pinjam</th>
                  <th className="p-2 border border-slate-300 text-center">Tenggat</th>
                  <th className="p-2 border border-slate-300 text-center">Tgl Kembali</th>
                  <th className="p-2 border border-slate-300 text-center">Status</th>
                  <th className="p-2 border border-slate-300">Keperluan</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.map((l, idx) => (
                  <tr key={l.id} className="border-b border-slate-200">
                    <td className="p-2 border border-slate-300 text-center font-mono">{idx + 1}</td>
                    <td className="p-2 border border-slate-300 font-mono font-bold">{l.loanCode}</td>
                    <td className="p-2 border border-slate-300">
                      <span className="font-semibold block">{l.itemName}</span>
                      <span className="text-[11px] text-slate-500 font-mono">{l.quantity} unit ({l.itemCode})</span>
                    </td>
                    <td className="p-2 border border-slate-300">
                      <span className="font-medium block">{l.borrowerName}</span>
                      <span className="text-[11px] text-slate-500">
                        {l.borrowerType} · {l.borrowerContact}
                      </span>
                    </td>
                    <td className="p-2 border border-slate-300 text-center font-mono">{l.loanDate}</td>
                    <td className="p-2 border border-slate-300 text-center font-mono font-bold text-rose-800">
                      {l.dueDate}
                    </td>
                    <td className="p-2 border border-slate-300 text-center font-mono">{l.returnDate || '-'}</td>
                    <td className="p-2 border border-slate-300 text-center font-bold">
                      <span
                        className={
                          l.status === 'Dipinjam'
                            ? 'text-blue-700'
                            : l.status === 'Terlambat'
                            ? 'text-rose-700'
                            : 'text-emerald-700'
                        }
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="p-2 border border-slate-300 text-[11px]">{l.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* KOLOM TANDA TANGAN RESMI */}
        <div className="grid grid-cols-2 gap-8 mt-12 pt-6 text-center text-xs print-break-inside-avoid">
          <div>
            <p>Mengetahui,</p>
            <p className="font-semibold">Kepala {settings.institutionName}</p>
            <div className="h-20" />
            <p className="font-bold underline text-sm">{settings.headmasterName}</p>
            <p className="text-slate-600 font-mono text-[11px]">NIP. {settings.headmasterNIP}</p>
          </div>

          <div>
            <p>
              {settings.city}, {todayIndo}
            </p>
            <p className="font-semibold">{settings.adminTitle}</p>
            <div className="h-20" />
            <p className="font-bold underline text-sm">{settings.adminName}</p>
            <p className="text-slate-600 font-mono text-[11px]">ID. PENGELOLA-SARPRAS-01</p>
          </div>
        </div>
      </div>
    </div>
  );
}
