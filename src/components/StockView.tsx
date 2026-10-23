import { useState, useMemo } from 'react';
import { InventoryItem, StockMutation, MutationType } from '../types/inventory';
import {
  Layers,
  Search,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  ClipboardList,
  AlertTriangle,
  FileSpreadsheet,
  X,
  Filter,
} from 'lucide-react';
import { exportService } from '../services/exportService';

interface StockViewProps {
  items: InventoryItem[];
  mutations: StockMutation[];
  onAddMutation: (mutation: Omit<StockMutation, 'id' | 'currentStock' | 'previousStock'>) => void;
  preselectedItemId?: string;
}

export function StockView({ items, mutations, onAddMutation, preselectedItemId }: StockViewProps) {
  const [activeTab, setActiveTab] = useState<'status' | 'history'>('status');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMutationType, setSelectedMutationType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    itemId: preselectedItemId || (items[0]?.id || ''),
    type: 'Masuk' as MutationType,
    quantity: 1,
    date: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    sourceOrDestination: '',
    operator: 'Surya Susanto, S.Kom.',
    notes: '',
  });

  const selectedItem = items.find((i) => i.id === formData.itemId);

  const handleOpenModal = (itemId?: string) => {
    const targetId = itemId || items[0]?.id || '';
    const itm = items.find((i) => i.id === targetId);
    setFormData({
      itemId: targetId,
      type: 'Masuk',
      quantity: 1,
      date: new Date().toISOString().split('T')[0],
      referenceNumber: `MUT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      sourceOrDestination: 'Pengadaan Sarpras Baru',
      operator: 'Surya Susanto, S.Kom.',
      notes: itm ? `Mutasi penambahan stok untuk ${itm.name}` : '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemId || formData.quantity <= 0) {
      alert('Pilih barang dan masukkan jumlah kuantitas yang valid (minimal 1).');
      return;
    }

    const currentItem = items.find((i) => i.id === formData.itemId);
    if (!currentItem) return;

    if (formData.type === 'Keluar' && formData.quantity > currentItem.availableStock) {
      alert(`Stok tersedia hanya ${currentItem.availableStock} unit. Tidak dapat mengeluarkan lebih banyak.`);
      return;
    }

    onAddMutation({
      itemId: currentItem.id,
      itemCode: currentItem.code,
      itemName: currentItem.name,
      type: formData.type,
      quantity: Number(formData.quantity),
      date: formData.date,
      referenceNumber: formData.referenceNumber || `MUT-${Date.now().toString().slice(-6)}`,
      sourceOrDestination: formData.sourceOrDestination || 'Mutasi Internal',
      operator: formData.operator,
      notes: formData.notes,
    });

    setIsModalOpen(false);
  };

  // Filtered Stock Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q)
      );
    });
  }, [items, searchQuery]);

  // Filtered Mutations Log
  const filteredMutations = useMemo(() => {
    return [...mutations].reverse().filter((m) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        m.itemName.toLowerCase().includes(q) ||
        m.itemCode.toLowerCase().includes(q) ||
        m.referenceNumber.toLowerCase().includes(q) ||
        m.sourceOrDestination.toLowerCase().includes(q);
      const matchType = selectedMutationType === 'all' || m.type === selectedMutationType;
      return matchSearch && matchType;
    });
  }, [mutations, searchQuery, selectedMutationType]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Sub Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'status'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monitoring Stok Real-Time ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Log Riwayat Mutasi ({mutations.length})
          </button>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Catat Mutasi Stok</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={
              activeTab === 'status'
                ? 'Cari nama barang, kode, ruangan...'
                : 'Cari no referensi, nama barang, sumber...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
          />
        </div>

        {activeTab === 'history' && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedMutationType}
              onChange={(e) => setSelectedMutationType(e.target.value)}
              className="text-xs p-2 border border-slate-200 rounded-lg bg-white"
            >
              <option value="all">Semua Jenis Mutasi</option>
              <option value="Masuk">Masuk (Penambahan)</option>
              <option value="Keluar">Keluar (Pengurangan/Afkir)</option>
              <option value="Opname">Opname (Koreksi Fisik)</option>
            </select>
          </div>
        )}
      </div>

      {/* Tab 1: Real-time Stock Monitoring Table */}
      {activeTab === 'status' ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-3 text-center w-12">No</th>
                  <th className="py-3 px-3">Kode Barang</th>
                  <th className="py-3 px-3">Nama Barang & Lokasi</th>
                  <th className="py-3 px-3 text-center">Stok Total</th>
                  <th className="py-3 px-3 text-center">Sedang Dipinjam</th>
                  <th className="py-3 px-3 text-center">Stok Tersedia</th>
                  <th className="py-3 px-3 text-center">Batas Minimum</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item, idx) => {
                  const isOut = item.availableStock === 0;
                  const isLow = !isOut && item.availableStock <= item.minStockAlert;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-3 font-mono font-bold text-indigo-600">{item.code}</td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-900 block">{item.name}</span>
                        <span className="text-[11px] text-slate-500">{item.location} · {item.category}</span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-medium text-slate-700">
                        {item.totalStock} {item.unit}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-semibold text-indigo-600">
                        {item.borrowedStock}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold">
                        <span
                          className={`text-sm ${
                            isOut ? 'text-rose-600 font-extrabold' : isLow ? 'text-amber-600' : 'text-emerald-700'
                          }`}
                        >
                          {item.availableStock}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-500">
                        {item.minStockAlert} {item.unit}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                            isOut
                              ? 'bg-rose-100 text-rose-800'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isOut ? 'Habis' : isLow ? 'Menipis' : 'Aman'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenModal(item.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
                        >
                          + Mutasi
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Tab 2: Stock Mutation History Log */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-3 text-center w-12">No</th>
                  <th className="py-3 px-3">Tanggal & Ref</th>
                  <th className="py-3 px-3">Barang</th>
                  <th className="py-3 px-3 text-center">Jenis Mutasi</th>
                  <th className="py-3 px-3 text-center">Jumlah (Qty)</th>
                  <th className="py-3 px-3 text-center">Stok Awal</th>
                  <th className="py-3 px-3 text-center">Stok Akhir</th>
                  <th className="py-3 px-3">Asal / Tujuan & Keterangan</th>
                  <th className="py-3 px-3">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMutations.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-900 block">{m.date}</span>
                      <span className="font-mono text-[11px] text-slate-400">{m.referenceNumber}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{m.itemName}</span>
                      <span className="font-mono text-[11px] text-indigo-600">{m.itemCode}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          m.type === 'Masuk'
                            ? 'bg-emerald-100 text-emerald-800'
                            : m.type === 'Keluar'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {m.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-sm">
                      {m.type === 'Masuk' ? `+${m.quantity}` : m.type === 'Keluar' ? `-${m.quantity}` : m.quantity}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-500">{m.previousStock}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">{m.currentStock}</td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-800 block">{m.sourceOrDestination}</span>
                      <span className="text-[11px] text-slate-500">{m.notes}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{m.operator}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL CATAT MUTASI STOK */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Catat Mutasi Stok Barang</h3>
                <p className="text-xs text-slate-400">Pembaruan stok masuk, keluar, atau opname fisik.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Barang Inventaris <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.itemId}
                  onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-medium"
                >
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.code} - {i.name} (Tersedia: {i.availableStock} / Total: {i.totalStock})
                    </option>
                  ))}
                </select>
                {selectedItem && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Lokasi: <b>{selectedItem.location}</b> | Stok saat ini: <b>{selectedItem.totalStock} {selectedItem.unit}</b>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Mutasi</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as MutationType })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-semibold"
                  >
                    <option value="Masuk">Masuk (Pengadaan / Pembelian / Hibah)</option>
                    <option value="Keluar">Keluar (Afkir / Pemusnahan / Rusak)</option>
                    <option value="Opname">Opname (Koreksi / Penyesuaian Fisik)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {formData.type === 'Opname' ? 'Hasil Hitung Fisik' : 'Jumlah (Qty)'}{' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Mutasi</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. Dokumen / Surat Jalan</label>
                  <input
                    type="text"
                    value={formData.referenceNumber}
                    onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                    placeholder="Contoh: BA-TERIMA/10/2026"
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sumber Pengadaan / Tujuan Distribusi</label>
                <input
                  type="text"
                  value={formData.sourceOrDestination}
                  onChange={(e) => setFormData({ ...formData, sourceOrDestination: e.target.value })}
                  placeholder="Contoh: Dana BOS 2026 / Pemusnahan Aset Usang / Hibah Industri"
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan / Keterangan</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Keterangan kondisi fisik, nomor seri, atau kelengkapan..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Simpan Mutasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
