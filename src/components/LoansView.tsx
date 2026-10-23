import { useState, useMemo } from 'react';
import { InventoryItem, LoanRecord, LoanStatus, BorrowerType, ItemCondition } from '../types/inventory';
import {
  ArrowUpRight,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Printer,
  Edit2,
  Trash2,
  Phone,
  User,
  Calendar,
  X,
  FileText,
} from 'lucide-react';
import { ItemImage } from './ItemImage';

interface LoansViewProps {
  items: InventoryItem[];
  loans: LoanRecord[];
  onAddLoan: (loan: Omit<LoanRecord, 'id' | 'createdAt' | 'status' | 'returnDate'>) => void;
  onReturnLoan: (
    loanId: string,
    returnDate: string,
    returnCondition: ItemCondition,
    notes: string,
    fineAmount?: number
  ) => void;
  onEditLoan: (loanId: string, updated: Partial<LoanRecord>) => void;
  onDeleteLoan: (loanId: string) => void;
  preselectedItem?: InventoryItem | null;
}

export function LoansView({
  items,
  loans,
  onAddLoan,
  onReturnLoan,
  onEditLoan,
  onDeleteLoan,
  preselectedItem,
}: LoansViewProps) {
  const [activeStatusFilter, setActiveStatusFilter] = useState<'all' | LoanStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [returningLoan, setReturningLoan] = useState<LoanRecord | null>(null);
  const [editingLoan, setEditingLoan] = useState<LoanRecord | null>(null);
  const [printingLoan, setPrintingLoan] = useState<LoanRecord | null>(null);

  // Add Form
  const [formData, setFormData] = useState({
    itemId: preselectedItem?.id || items.find((i) => i.availableStock > 0)?.id || '',
    borrowerName: '',
    borrowerType: 'Siswa' as BorrowerType,
    borrowerIdentifier: '',
    borrowerContact: '',
    quantity: 1,
    loanDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    purpose: '',
    initialCondition: 'Baik' as ItemCondition,
    notes: '',
  });

  // Return Form
  const [returnFormData, setReturnFormData] = useState({
    returnDate: new Date().toISOString().split('T')[0],
    returnCondition: 'Baik' as ItemCondition,
    notes: 'Alat dikembalikan lengkap dalam keadaan baik.',
    fineAmount: 0,
  });

  // Edit Form
  const [editFormData, setEditFormData] = useState({
    borrowerName: '',
    borrowerType: 'Siswa' as BorrowerType,
    borrowerIdentifier: '',
    borrowerContact: '',
    dueDate: '',
    purpose: '',
    notes: '',
  });

  const selectedItemForLoan = items.find((i) => i.id === formData.itemId);

  const handleOpenAddModal = (item?: InventoryItem) => {
    const itm = item || selectedItemForLoan || items.find((i) => i.availableStock > 0);
    setFormData({
      itemId: itm?.id || '',
      borrowerName: '',
      borrowerType: 'Siswa',
      borrowerIdentifier: '',
      borrowerContact: '',
      quantity: 1,
      loanDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      purpose: '',
      initialCondition: itm?.condition || 'Baik',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenReturnModal = (loan: LoanRecord) => {
    setReturningLoan(loan);
    setReturnFormData({
      returnDate: new Date().toISOString().split('T')[0],
      returnCondition: loan.initialCondition,
      notes: 'Pengembalian tepat waktu, unit diperiksa lengkap tanpa cacat.',
      fineAmount: 0,
    });
  };

  const handleOpenEditModal = (loan: LoanRecord) => {
    setEditingLoan(loan);
    setEditFormData({
      borrowerName: loan.borrowerName,
      borrowerType: loan.borrowerType,
      borrowerIdentifier: loan.borrowerIdentifier,
      borrowerContact: loan.borrowerContact,
      dueDate: loan.dueDate,
      purpose: loan.purpose,
      notes: loan.notes,
    });
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemId || !formData.borrowerName.trim()) {
      alert('Pilih alat inventaris dan isi nama peminjam.');
      return;
    }

    const currentItem = items.find((i) => i.id === formData.itemId);
    if (!currentItem) return;

    if (formData.quantity > currentItem.availableStock) {
      alert(`Stok tersedia hanya ${currentItem.availableStock} unit.`);
      return;
    }

    const loanCode = `PINJAM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    onAddLoan({
      loanCode,
      itemId: currentItem.id,
      itemCode: currentItem.code,
      itemName: currentItem.name,
      itemImage: currentItem.imageUrl,
      borrowerName: formData.borrowerName,
      borrowerType: formData.borrowerType,
      borrowerIdentifier: formData.borrowerIdentifier,
      borrowerContact: formData.borrowerContact,
      quantity: Number(formData.quantity),
      loanDate: formData.loanDate,
      dueDate: formData.dueDate,
      purpose: formData.purpose,
      initialCondition: formData.initialCondition,
      notes: formData.notes,
    });

    setIsAddModalOpen(false);
  };

  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returningLoan) return;

    onReturnLoan(
      returningLoan.id,
      returnFormData.returnDate,
      returnFormData.returnCondition,
      returnFormData.notes,
      returnFormData.fineAmount
    );

    setReturningLoan(null);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLoan) return;

    onEditLoan(editingLoan.id, editFormData);
    setEditingLoan(null);
  };

  // Filtered Loans
  const filteredLoans = useMemo(() => {
    return [...loans].reverse().filter((l) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        l.borrowerName.toLowerCase().includes(q) ||
        l.loanCode.toLowerCase().includes(q) ||
        l.itemName.toLowerCase().includes(q) ||
        l.borrowerIdentifier.toLowerCase().includes(q) ||
        l.borrowerContact.toLowerCase().includes(q);

      const matchStatus = activeStatusFilter === 'all' || l.status === activeStatusFilter;

      return matchSearch && matchStatus;
    });
  }, [loans, searchQuery, activeStatusFilter]);

  const activeCount = loans.filter((l) => l.status === 'Dipinjam').length;
  const overdueCount = loans.filter((l) => l.status === 'Terlambat').length;
  const returnedCount = loans.filter((l) => l.status === 'Kembali').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Status Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeStatusFilter === 'all'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({loans.length})
          </button>
          <button
            onClick={() => setActiveStatusFilter('Dipinjam')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeStatusFilter === 'Dipinjam'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sedang Dipinjam ({activeCount})
          </button>
          <button
            onClick={() => setActiveStatusFilter('Terlambat')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeStatusFilter === 'Terlambat'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lewat Tenggat ({overdueCount})
          </button>
          <button
            onClick={() => setActiveStatusFilter('Kembali')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeStatusFilter === 'Kembali'
                ? 'bg-white text-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Selesai Kembali ({returnedCount})
          </button>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={() => handleOpenAddModal()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Catat Peminjaman Baru</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode transaksi, nama peminjam, nama alat, NISN/NIP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
          />
        </div>
      </div>

      {/* Table Data Peminjaman */}
      {filteredLoans.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <p className="text-sm font-semibold text-slate-700">Tidak ada data peminjaman yang sesuai filter</p>
          <p className="text-xs text-slate-500 mt-1">Gunakan tombol "Catat Peminjaman Baru" untuk memulai transaksi peminjaman.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-3 text-center w-12">No</th>
                  <th className="py-3 px-3">Kode Pinjam</th>
                  <th className="py-3 px-3">Alat / Barang</th>
                  <th className="py-3 px-3">Peminjam</th>
                  <th className="py-3 px-3 text-center">Tgl Pinjam & Tenggat</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3">Keperluan & Catatan</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLoans.map((loan, idx) => (
                  <tr key={loan.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-3 font-mono">
                      <span className="font-bold text-slate-900 block">{loan.loanCode}</span>
                      <span className="text-[10px] text-slate-400">{loan.createdAt.split('T')[0]}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-8 rounded overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          <ItemImage
                            src={loan.itemImage}
                            alt={loan.itemName}
                            className="w-full h-full object-cover"
                            showZoom={false}
                          />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{loan.itemName}</span>
                          <span className="text-[11px] text-indigo-600 font-mono font-medium">
                            {loan.quantity} unit · {loan.itemCode}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900">{loan.borrowerName}</span>
                          <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                            {loan.borrowerType}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>{loan.borrowerIdentifier || 'No ID'}</span>
                          <span>·</span>
                          <span className="text-emerald-700 font-medium">{loan.borrowerContact}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      <span className="text-slate-600 block">{loan.loanDate}</span>
                      <span className="text-[11px] font-bold text-indigo-600 block">s/d {loan.dueDate}</span>
                      {loan.returnDate && (
                        <span className="text-[10px] text-emerald-600 block">Kembali: {loan.returnDate}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          loan.status === 'Dipinjam'
                            ? 'bg-blue-100 text-blue-800'
                            : loan.status === 'Terlambat'
                            ? 'bg-rose-100 text-rose-800 animate-pulse'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {loan.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 max-w-xs">
                      <p className="font-medium text-slate-800 line-clamp-1">{loan.purpose}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{loan.notes || '-'}</p>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {loan.status !== 'Kembali' && (
                          <button
                            onClick={() => handleOpenReturnModal(loan)}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                          >
                            Kembalikan
                          </button>
                        )}
                        <button
                          onClick={() => setPrintingLoan(loan)}
                          title="Cetak Bukti Peminjaman Resmi"
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(loan)}
                          title="Edit"
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus catatan peminjaman ${loan.loanCode}?`)) {
                              onDeleteLoan(loan.id);
                            }
                          }}
                          title="Hapus"
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: CATAT PEMINJAMAN BARU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Catat Peminjaman Alat Inventaris</h3>
                <p className="text-xs text-slate-400">Pastikan stok fisik tersedia dan identitas peminjam jelas.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Alat / Barang yang Dipinjam <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.itemId}
                  onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-medium"
                >
                  {items.map((i) => (
                    <option key={i.id} value={i.id} disabled={i.availableStock <= 0}>
                      {i.name} (Tersedia: {i.availableStock} {i.unit}) {i.availableStock <= 0 ? '— HABIS' : ''}
                    </option>
                  ))}
                </select>
                {selectedItemForLoan && (
                  <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded flex items-center gap-3">
                    <div className="w-12 h-10 rounded overflow-hidden bg-slate-100 shrink-0">
                      <ItemImage
                        src={selectedItemForLoan.imageUrl}
                        alt={selectedItemForLoan.name}
                        showZoom={false}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{selectedItemForLoan.name}</p>
                      <p className="text-[11px] text-slate-500">
                        Lokasi: {selectedItemForLoan.location} | Stok tersedia: <b className="text-emerald-700">{selectedItemForLoan.availableStock} unit</b>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jumlah Alat Dipinjam</label>
                  <input
                    type="number"
                    min={1}
                    max={selectedItemForLoan ? selectedItemForLoan.availableStock : 10}
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kondisi Awal Alat</label>
                  <select
                    value={formData.initialCondition}
                    onChange={(e) => setFormData({ ...formData, initialCondition: e.target.value as ItemCondition })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Baik">Kondisi Baik</option>
                    <option value="Rusak Ringan">Rusak Ringan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Peminjam <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.borrowerName}
                    onChange={(e) => setFormData({ ...formData, borrowerName: e.target.value })}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori Peminjam</label>
                  <select
                    value={formData.borrowerType}
                    onChange={(e) => setFormData({ ...formData, borrowerType: e.target.value as BorrowerType })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Siswa">Siswa</option>
                    <option value="Guru">Guru / Tenaga Pendidik</option>
                    <option value="Staf">Staf Tata Usaha</option>
                    <option value="Eksternal">Tamu / Pihak Eksternal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. Identitas (NISN / NIP)</label>
                  <input
                    type="text"
                    value={formData.borrowerIdentifier}
                    onChange={(e) => setFormData({ ...formData, borrowerIdentifier: e.target.value })}
                    placeholder="Contoh: NISN 0081293844"
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    No. WhatsApp / HP <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.borrowerContact}
                    onChange={(e) => setFormData({ ...formData, borrowerContact: e.target.value })}
                    placeholder="Contoh: 0812-3456-7890"
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Pinjam</label>
                  <input
                    type="date"
                    required
                    value={formData.loanDate}
                    onChange={(e) => setFormData({ ...formData, loanDate: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tenggat Pengembalian <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono font-bold text-indigo-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Keperluan / Tujuan Peminjaman <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="Contoh: Praktikum Pemrograman Web / Ujian Kompetensi"
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Kelengkapan kabel, tas charger, kondisi aksesoris..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer shadow-xs"
                >
                  Simpan Peminjaman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FORM PENGEMBALIAN ALAT */}
      {returningLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Proses Pengembalian Alat</h3>
                <p className="text-xs text-emerald-200">
                  {returningLoan.loanCode} · {returningLoan.itemName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReturningLoan(null)}
                className="p-1.5 text-emerald-300 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReturn} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <p className="font-semibold text-slate-900">{returningLoan.itemName} ({returningLoan.quantity} unit)</p>
                <p className="text-slate-500">Peminjam: {returningLoan.borrowerName} ({returningLoan.borrowerContact})</p>
                <p className="text-slate-500">Tenggat Waktu: {returningLoan.dueDate}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Dikembalikan</label>
                  <input
                    type="date"
                    required
                    value={returnFormData.returnDate}
                    onChange={(e) => setReturnFormData({ ...returnFormData, returnDate: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kondisi Saat Kembali</label>
                  <select
                    value={returnFormData.returnCondition}
                    onChange={(e) =>
                      setReturnFormData({ ...returnFormData, returnCondition: e.target.value as ItemCondition })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-medium"
                  >
                    <option value="Baik">Baik (Lengkap & Normal)</option>
                    <option value="Rusak Ringan">Rusak Ringan (Ada kendala fisik)</option>
                    <option value="Rusak Berat">Rusak Berat (Tidak berfungsi)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Pengecekan Fisik</label>
                <textarea
                  rows={2}
                  value={returnFormData.notes}
                  onChange={(e) => setReturnFormData({ ...returnFormData, notes: e.target.value })}
                  placeholder="Kondisi fungsi tombol, kelengkapan kabel charger..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setReturningLoan(null)}
                  className="px-4 py-2 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer shadow-xs"
                >
                  Konfirmasi Pengembalian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT DATA PEMINJAMAN */}
      {editingLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Edit Peminjaman {editingLoan.loanCode}</h3>
                <p className="text-xs text-slate-400">Koreksi identitas peminjam atau tenggat waktu.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingLoan(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Peminjam</label>
                <input
                  type="text"
                  required
                  value={editFormData.borrowerName}
                  onChange={(e) => setEditFormData({ ...editFormData, borrowerName: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={editFormData.borrowerType}
                    onChange={(e) => setEditFormData({ ...editFormData, borrowerType: e.target.value as BorrowerType })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Siswa">Siswa</option>
                    <option value="Guru">Guru</option>
                    <option value="Staf">Staf</option>
                    <option value="Eksternal">Eksternal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kontak WA</label>
                  <input
                    type="text"
                    required
                    value={editFormData.borrowerContact}
                    onChange={(e) => setEditFormData({ ...editFormData, borrowerContact: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. Identitas</label>
                  <input
                    type="text"
                    value={editFormData.borrowerIdentifier}
                    onChange={(e) => setEditFormData({ ...editFormData, borrowerIdentifier: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tenggat Waktu</label>
                  <input
                    type="date"
                    required
                    value={editFormData.dueDate}
                    onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono font-bold text-indigo-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keperluan Pinjam</label>
                <input
                  type="text"
                  required
                  value={editFormData.purpose}
                  onChange={(e) => setEditFormData({ ...editFormData, purpose: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan</label>
                <textarea
                  rows={2}
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingLoan(null)}
                  className="px-4 py-2 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CETAK BUKTI PEMINJAMAN ALAT (VOUCHER TANDA TERIMA) */}
      {printingLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 border border-slate-300 text-slate-900">
            {/* Kop Surat Singkat */}
            <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider">BUKTI TANDA TERIMA PEMINJAMAN ALAT</h2>
              <p className="text-[11px] text-slate-600 font-mono">Nomor Registrasi: {printingLoan.loanCode}</p>
            </div>

            {/* Voucher Details */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 block">Peminjam</span>
                  <span className="font-bold text-slate-900">{printingLoan.borrowerName}</span>
                  <span className="text-[11px] text-slate-500 block">({printingLoan.borrowerType} - {printingLoan.borrowerIdentifier})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">No. Kontak</span>
                  <span className="font-mono font-bold text-slate-900">{printingLoan.borrowerContact}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 block">Barang / Alat yang Dipinjam</span>
                <p className="font-bold text-sm text-slate-900">{printingLoan.itemName}</p>
                <p className="font-mono text-xs text-indigo-700">
                  Kode: {printingLoan.itemCode} | Jumlah: {printingLoan.quantity} Unit | Kondisi Awal: {printingLoan.initialCondition}
                </p>
                <p className="text-[11px] text-slate-600 mt-1">Keperluan: {printingLoan.purpose}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Tanggal Pinjam</span>
                  <span className="font-mono font-semibold">{printingLoan.loanDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Tenggat Waktu Kembali</span>
                  <span className="font-mono font-bold text-rose-700">{printingLoan.dueDate}</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 italic bg-amber-50 p-2 rounded border border-amber-200">
                * Peminjam bertanggung jawab penuh atas kebersihan, keutuhan, dan keselamatan alat yang dipinjam.
                Segala kerusakan akibat kelalaian wajib diganti sesuai spesifikasi asli.
              </p>

              {/* Signature section */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-center">
                <div>
                  <p className="text-[11px]">Yang Menyerahkan (Admin)</p>
                  <br /><br />
                  <p className="font-bold text-[11px] underline">Petugas Sarpras</p>
                </div>
                <div>
                  <p className="text-[11px]">Peminjam Alat</p>
                  <br /><br />
                  <p className="font-bold text-[11px] underline">{printingLoan.borrowerName}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-3 border-t border-slate-100 no-print">
              <button
                type="button"
                onClick={() => setPrintingLoan(null)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Lembar Tanda Terima</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
