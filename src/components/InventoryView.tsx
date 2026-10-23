import { useState, useMemo } from 'react';
import { InventoryItem, ItemCondition } from '../types/inventory';
import { CATEGORIES, LOCATIONS, PRESET_IMAGES } from '../data/mockData';
import { ItemImage } from './ItemImage';
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  ArrowUpRight,
  QrCode,
  Layers,
  MapPin,
  Calendar,
  X,
  Upload,
  Image as ImageIcon,
  Check,
} from 'lucide-react';

interface InventoryViewProps {
  items: InventoryItem[];
  onAddItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'borrowedStock' | 'availableStock'>) => void;
  onEditItem: (id: string, item: Partial<InventoryItem>) => void;
  onDeleteItem: (id: string) => void;
  onOpenNewLoanWithItem: (item: InventoryItem) => void;
  onOpenNewMutationWithItem: (item: InventoryItem) => void;
  onOpenBarcodeModal: (item: InventoryItem) => void;
}

export function InventoryView({
  items,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onOpenNewLoanWithItem,
  onOpenNewMutationWithItem,
  onOpenBarcodeModal,
}: InventoryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: CATEGORIES[0],
    brand: '',
    specs: '',
    condition: 'Baik' as ItemCondition,
    location: LOCATIONS[0],
    totalStock: 1,
    minStockAlert: 2,
    unit: 'Unit',
    purchaseDate: new Date().toISOString().split('T')[0],
    price: 0,
    imageUrl: PRESET_IMAGES[0].url,
    notes: '',
  });

  const [activeImageTab, setActiveImageTab] = useState<'preset' | 'upload' | 'url'>('preset');

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.specs.toLowerCase().includes(q);

      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchCondition = selectedCondition === 'all' || item.condition === selectedCondition;
      const matchLocation = selectedLocation === 'all' || item.location === selectedLocation;

      return matchSearch && matchCategory && matchCondition && matchLocation;
    });
  }, [items, searchQuery, selectedCategory, selectedCondition, selectedLocation]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    const nextCode = `INV-${new Date().getFullYear()}-${String(items.length + 1).padStart(3, '0')}`;
    setFormData({
      code: nextCode,
      name: '',
      category: CATEGORIES[0],
      brand: '',
      specs: '',
      condition: 'Baik',
      location: LOCATIONS[0],
      totalStock: 5,
      minStockAlert: 2,
      unit: 'Unit',
      purchaseDate: new Date().toISOString().split('T')[0],
      price: 1500000,
      imageUrl: PRESET_IMAGES[0].url,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      name: item.name,
      category: item.category,
      brand: item.brand,
      specs: item.specs,
      condition: item.condition,
      location: item.location,
      totalStock: item.totalStock,
      minStockAlert: item.minStockAlert,
      unit: item.unit,
      purchaseDate: item.purchaseDate,
      price: item.price,
      imageUrl: item.imageUrl,
      notes: item.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      alert('Nama dan Kode Barang wajib diisi.');
      return;
    }

    if (editingItem) {
      onEditItem(editingItem.id, {
        ...formData,
        availableStock: Math.max(0, formData.totalStock - editingItem.borrowedStock),
      });
    } else {
      onAddItem(formData);
    }
    setIsModalOpen(false);
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData((prev) => ({ ...prev, imageUrl: event.target!.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Filter & Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kode, nama barang, merk, lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
            />
          </div>

          {/* View Mode & Add Button */}
          <div className="flex items-center gap-2">
            <div className="p-1 bg-slate-100 rounded-lg flex items-center">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Grid Kartu"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Tabel Kompak"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Inventaris</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Kategori</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">Semua Kategori ({items.length})</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Kondisi Barang</label>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">Semua Kondisi</option>
              <option value="Baik">Kondisi Baik</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Rusak Berat">Rusak Berat</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Lokasi Ruangan</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">Semua Lokasi</option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content: Grid or Table */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <p className="text-sm font-semibold text-slate-700">Tidak ada barang yang cocok dengan kriteria pencarian</p>
          <p className="text-xs text-slate-500 mt-1">Silakan ubah filter atau tambahkan barang inventaris baru.</p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
          >
            Tambah Barang Sekarang
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW WITH PHOTOS */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
            >
              {/* Photo Area */}
              <div>
                <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                  <ItemImage
                    src={item.imageUrl}
                    alt={item.name}
                    category={item.category}
                    className="w-full h-full object-cover"
                  />
                  {/* Status Overlay Badge */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-900/80 text-white rounded backdrop-blur-xs">
                      {item.code}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded backdrop-blur-xs ${
                        item.condition === 'Baik'
                          ? 'bg-emerald-600 text-white'
                          : item.condition === 'Rusak Ringan'
                          ? 'bg-amber-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {item.condition}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-3">
                  <div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <span>{item.category}</span>
                      <span>·</span>
                      <span>{item.brand}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mt-0.5" title={item.name}>
                      {item.name}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded border border-slate-100">
                    {item.specs || 'Spesifikasi standar operasional.'}
                  </p>

                  <div className="text-xs text-slate-500 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Beli: {item.purchaseDate}</span>
                    </div>
                  </div>

                  {/* Stock Metrics Box */}
                  <div className="grid grid-cols-3 gap-1 p-2 bg-slate-50 rounded-lg text-center text-xs border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Total</span>
                      <span className="font-mono font-bold text-slate-800">{item.totalStock}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-indigo-500 block">Dipinjam</span>
                      <span className="font-mono font-bold text-indigo-600">{item.borrowedStock}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-600 block">Tersedia</span>
                      <span className={`font-mono font-bold ${item.availableStock === 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {item.availableStock}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenBarcodeModal(item)}
                    title="Cetak Stiker Barcode / QR Inventaris"
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onOpenNewMutationWithItem(item)}
                    title="Catat Mutasi Stok Barang Ini"
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    title="Edit Data Barang"
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Apakah Anda yakin ingin menghapus inventaris "${item.name}"?`)) {
                        onDeleteItem(item.id);
                      }
                    }}
                    title="Hapus Barang"
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => onOpenNewLoanWithItem(item)}
                  disabled={item.availableStock <= 0}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded font-semibold text-[11px] transition-colors cursor-pointer ${
                    item.availableStock > 0
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <ArrowUpRight className="w-3 h-3" />
                  <span>Pinjamkan</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-3 text-center w-12">No</th>
                  <th className="py-3 px-3 w-16">Foto</th>
                  <th className="py-3 px-3">Kode & Nama Barang</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3">Kondisi</th>
                  <th className="py-3 px-3">Lokasi</th>
                  <th className="py-3 px-3 text-center">Stok Fisik</th>
                  <th className="py-3 px-3 text-center">Dipinjam</th>
                  <th className="py-3 px-3 text-center">Tersedia</th>
                  <th className="py-3 px-3 text-right">Harga Satuan</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <div className="w-12 h-10 rounded overflow-hidden bg-slate-100 border border-slate-200">
                        <ItemImage
                          src={item.imageUrl}
                          alt={item.name}
                          category={item.category}
                          className="w-full h-full object-cover"
                          showZoom={false}
                        />
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-indigo-600 font-bold block">{item.code}</span>
                      <span className="font-semibold text-slate-900 block">{item.name}</span>
                      <span className="text-[11px] text-slate-400">{item.brand}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{item.category}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded ${
                          item.condition === 'Baik'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.condition === 'Rusak Ringan'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {item.condition}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{item.location}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-medium">{item.totalStock} {item.unit}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-indigo-600 font-medium">{item.borrowedStock}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">
                      <span className={item.availableStock === 0 ? 'text-rose-600' : 'text-emerald-700'}>
                        {item.availableStock}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                      Rp {item.price.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onOpenNewLoanWithItem(item)}
                          disabled={item.availableStock <= 0}
                          title="Pinjamkan"
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenBarcodeModal(item)}
                          title="Barcode Tag"
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          title="Edit"
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus ${item.name}?`)) onDeleteItem(item.id);
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

      {/* MODAL FORM TAMBAH / EDIT BARANG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">
                  {editingItem ? 'Edit Data Inventaris Barang' : 'Tambah Barang Inventaris Baru'}
                </h3>
                <p className="text-xs text-slate-400">
                  Pastikan informasi spesifikasi, kondisi, dan foto akurat.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kode Barang / Inventaris <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Contoh: INV-TIK-009"
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Barang / Aset <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Laptop Lenovo ThinkPad L14"
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Merk / Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Contoh: ASUS, Epson, Sony"
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kondisi</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value as ItemCondition })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Baik">Baik (Normal)</option>
                    <option value="Rusak Ringan">Rusak Ringan</option>
                    <option value="Rusak Berat">Rusak Berat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lokasi Penyimpanan / Lab</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Spesifikasi Detail</label>
                <textarea
                  rows={2}
                  value={formData.specs}
                  onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                  placeholder="Detail spesifikasi teknis, kelengkapan aksesoris, nomor seri pabrik..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Stok</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.totalStock}
                    onChange={(e) => setFormData({ ...formData, totalStock: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Satuan</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="Unit, Pcs, Set"
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Alert Menipis</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Harga Beli (Rp)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* FOTO BARANG (PRESET / UPLOAD / URL) */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-indigo-600" />
                    <span>Foto / Gambar Daftar Inventaris</span>
                  </label>
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setActiveImageTab('preset')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        activeImageTab === 'preset' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-600'
                      }`}
                    >
                      Pilih Preset
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveImageTab('upload')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        activeImageTab === 'upload' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-600'
                      }`}
                    >
                      Unggah File
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveImageTab('url')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        activeImageTab === 'url' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-600'
                      }`}
                    >
                      URL Link
                    </button>
                  </div>
                </div>

                {/* Preset Picker */}
                {activeImageTab === 'preset' && (
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                        className={`relative aspect-4/3 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                          formData.imageUrl === preset.url
                            ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 hover:border-slate-400'
                        }`}
                        title={preset.name}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        {formData.imageUrl === preset.url && (
                          <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* File Upload */}
                {activeImageTab === 'upload' && (
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-lg bg-white cursor-pointer transition-colors">
                      <Upload className="w-5 h-5 text-indigo-500 mb-1" />
                      <span className="text-xs font-semibold text-slate-700">Pilih foto dari komputer / HP</span>
                      <span className="text-[10px] text-slate-400">JPG, PNG, WebP (Maks 5MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {/* Image URL Input */}
                {activeImageTab === 'url' && (
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://domain.com/path-ke-gambar-barang.jpg"
                    className="w-full p-2 border border-slate-300 rounded bg-white"
                  />
                )}

                {/* Preview Thumbnail */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-16 h-12 rounded overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <ItemImage
                      src={formData.imageUrl}
                      alt={formData.name || 'Pratinjau'}
                      category={formData.category}
                      className="w-full h-full object-cover"
                      showZoom={false}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    Pratinjau visual inventaris: {formData.name || 'Barang Baru'}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Sumber pengadaan, hibah, nomor surat serah terima..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              {/* Form Actions */}
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
                  {editingItem ? 'Simpan Perubahan' : 'Simpan Barang Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
