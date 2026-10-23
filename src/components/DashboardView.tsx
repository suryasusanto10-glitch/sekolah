import { InventoryItem, LoanRecord, StockMutation, ActiveTab } from '../types/inventory';
import {
  Package,
  Layers,
  ArrowUpRight,
  Clock,
  AlertTriangle,
  Coins,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Plus,
  ArrowDownLeft,
  Calendar,
  User,
  ShieldCheck,
} from 'lucide-react';
import { ItemImage } from './ItemImage';

interface DashboardViewProps {
  items: InventoryItem[];
  loans: LoanRecord[];
  mutations: StockMutation[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewLoan: () => void;
  onOpenNewMutation: (itemId?: string) => void;
  onOpenNewItem: () => void;
  onReturnLoan: (loan: LoanRecord) => void;
}

export function DashboardView({
  items,
  loans,
  mutations,
  setActiveTab,
  onOpenNewLoan,
  onOpenNewMutation,
  onOpenNewItem,
  onReturnLoan,
}: DashboardViewProps) {
  // Real-time calculations
  const totalItemKinds = items.length;
  const totalPhysicalStock = items.reduce((acc, item) => acc + item.totalStock, 0);
  const totalAvailableStock = items.reduce((acc, item) => acc + item.availableStock, 0);
  const totalBorrowedStock = items.reduce((acc, item) => acc + item.borrowedStock, 0);
  const totalAssetValue = items.reduce((acc, item) => acc + item.price * item.totalStock, 0);

  const activeLoans = loans.filter((l) => l.status === 'Dipinjam');
  const overdueLoans = loans.filter((l) => l.status === 'Terlambat');
  const completedLoans = loans.filter((l) => l.status === 'Kembali');

  const lowStockItems = items.filter(
    (item) => item.availableStock > 0 && item.availableStock <= item.minStockAlert
  );
  const outOfStockItems = items.filter((item) => item.availableStock === 0);

  // Condition counts
  const goodCondition = items.filter((i) => i.condition === 'Baik').length;
  const minorDamage = items.filter((i) => i.condition === 'Rusak Ringan').length;
  const severeDamage = items.filter((i) => i.condition === 'Rusak Berat').length;

  const goodPercent = totalItemKinds ? Math.round((goodCondition / totalItemKinds) * 100) : 0;
  const minorPercent = totalItemKinds ? Math.round((minorDamage / totalItemKinds) * 100) : 0;
  const severePercent = totalItemKinds ? Math.round((severeDamage / totalItemKinds) * 100) : 0;

  // Recent 5 loans & 5 mutations
  const recentLoans = [...loans].reverse().slice(0, 5);
  const recentMutations = [...mutations].reverse().slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Real-time Alert Banner for Overdue Loans */}
      {overdueLoans.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-950">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-700 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                Perhatian: Terdapat {overdueLoans.length} Peminjaman Alat Terlambat / Melewati Jatuh Tempo!
              </p>
              <p className="text-xs text-rose-700">
                Segera hubungi peminjam untuk memastikan kondisi dan pengembalian unit alat.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('loans')}
            className="text-xs font-semibold px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Lihat Daftar Terlambat
          </button>
        </div>
      )}

      {/* Real-time Alert Banner for Out of Stock or Low Stock */}
      {outOfStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                Peringatan Stok: {outOfStockItems.length} Barang Habis Dipinjam / Kosong!
              </p>
              <p className="text-xs text-amber-700">
                {outOfStockItems.map((i) => i.name).slice(0, 2).join(', ')}
                {outOfStockItems.length > 2 ? ` dan ${outOfStockItems.length - 2} lainnya` : ''}.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('stock')}
            className="text-xs font-semibold px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Kelola Stok
          </button>
        </div>
      )}

      {/* Real-time Metric Grid (SaaS Single-elevation) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Barang */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Jenis Inventaris</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {totalItemKinds}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Item terdaftar</div>
          </div>
        </div>

        {/* Total Kuantitas Fisik */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Unit Fisik</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {totalPhysicalStock}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">
              {totalAvailableStock} unit tersedia
            </div>
          </div>
        </div>

        {/* Sedang Dipinjam */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Sedang Dipinjam</span>
            <ArrowUpRight className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-indigo-600 font-mono tabular-nums">
              {totalBorrowedStock}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {activeLoans.length} transaksi aktif
            </div>
          </div>
        </div>

        {/* Peminjaman Terlambat */}
        <div className={`border rounded-xl p-4 flex flex-col justify-between ${
          overdueLoans.length > 0
            ? 'bg-rose-50/60 border-rose-300'
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Lewat Tenggat</span>
            <AlertTriangle className={`w-4 h-4 ${overdueLoans.length > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
          </div>
          <div>
            <div className={`text-2xl font-bold font-mono tabular-nums ${
              overdueLoans.length > 0 ? 'text-rose-600' : 'text-slate-900'
            }`}>
              {overdueLoans.length}
            </div>
            <div className="text-[11px] text-rose-600 font-medium mt-1">
              {overdueLoans.length > 0 ? 'Perlu tindakan' : 'Semua tepat waktu'}
            </div>
          </div>
        </div>

        {/* Stok Kritis / Menipis */}
        <div className={`border rounded-xl p-4 flex flex-col justify-between ${
          lowStockItems.length + outOfStockItems.length > 0
            ? 'bg-amber-50/60 border-amber-300'
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Stok Kritis</span>
            <Clock className={`w-4 h-4 ${lowStockItems.length + outOfStockItems.length > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
          </div>
          <div>
            <div className={`text-2xl font-bold font-mono tabular-nums ${
              lowStockItems.length + outOfStockItems.length > 0 ? 'text-amber-600' : 'text-slate-900'
            }`}>
              {lowStockItems.length + outOfStockItems.length}
            </div>
            <div className="text-[11px] text-amber-700 font-medium mt-1">
              {outOfStockItems.length} habis · {lowStockItems.length} menipis
            </div>
          </div>
        </div>

        {/* Total Nilai Aset */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Estimasi Nilai Aset</span>
            <Coins className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-base font-bold text-slate-900 font-mono tabular-nums truncate">
              Rp {(totalAssetValue / 1000000).toFixed(1)} Jt
            </div>
            <div className="text-[11px] text-slate-500 mt-1 truncate" title={`Rp ${totalAssetValue.toLocaleString('id-ID')}`}>
              Rp {totalAssetValue.toLocaleString('id-ID')}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Aksi Cepat Manajemen Inventaris</h2>
            <p className="text-xs text-slate-500">Pintasan operasional harian admin sarana dan prasarana</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenNewLoan}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Pinjamkan Alat</span>
            </button>
            <button
              onClick={() => onOpenNewMutation()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Catat Mutasi Stok</span>
            </button>
            <button
              onClick={onOpenNewItem}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Aset Baru</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Laporan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Analysis Split: Kondisi Aset & Kategori */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kondisi Aset Barang */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Kondisi Fisik Barang</h3>
            <span className="text-xs font-mono text-slate-500">{totalItemKinds} jenis</span>
          </div>

          <div className="space-y-4">
            {/* Visual ratio bar */}
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${goodPercent}%` }}
                className="bg-emerald-500 h-full"
                title={`Kondisi Baik: ${goodPercent}%`}
              />
              <div
                style={{ width: `${minorPercent}%` }}
                className="bg-amber-500 h-full"
                title={`Rusak Ringan: ${minorPercent}%`}
              />
              <div
                style={{ width: `${severePercent}%` }}
                className="bg-rose-500 h-full"
                title={`Rusak Berat: ${severePercent}%`}
              />
            </div>

            {/* Condition rows */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 border border-emerald-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-slate-800">Kondisi Baik (Siap Pakai)</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold text-slate-900">{goodCondition}</span>
                  <span className="text-slate-500">({goodPercent}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/50 border border-amber-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="font-medium text-slate-800">Rusak Ringan (Perlu Servis)</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold text-slate-900">{minorDamage}</span>
                  <span className="text-slate-500">({minorPercent}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50/50 border border-rose-100">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span className="font-medium text-slate-800">Rusak Berat (Usul Afkir)</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold text-slate-900">{severeDamage}</span>
                  <span className="text-slate-500">({severePercent}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Inventory Highlight with Photo */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Sampel Foto Inventaris & Ketersediaan</h3>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
            >
              Lihat Semua Galeri →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {items.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveTab('inventory')}
                className="group border border-slate-200 rounded-lg overflow-hidden hover:border-indigo-400 transition-colors cursor-pointer flex flex-col"
              >
                <div className="aspect-4/3 w-full overflow-hidden bg-slate-100">
                  <ItemImage
                    src={item.imageUrl}
                    alt={item.name}
                    category={item.category}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    showZoom={false}
                  />
                </div>
                <div className="p-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-medium text-indigo-600">{item.code}</span>
                    <p className="text-xs font-semibold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {item.name}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100">
                    <span className="text-slate-500">Tersedia</span>
                    <span className="font-mono font-bold text-slate-900">
                      {item.availableStock} / {item.totalStock} {item.unit}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Section: Aktivitas Peminjaman & Mutasi Terakhir */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peminjaman Terkini */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Sirkulasi Peminjaman Terkini</h3>
            </div>
            <button
              onClick={() => setActiveTab('loans')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
            >
              Lihat Semua ({loans.length}) →
            </button>
          </div>

          {recentLoans.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">Belum ada data peminjaman alat</div>
          ) : (
            <div className="space-y-3">
              {recentLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/50 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-slate-900">{loan.loanCode}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          loan.status === 'Dipinjam'
                            ? 'bg-blue-100 text-blue-800'
                            : loan.status === 'Terlambat'
                            ? 'bg-rose-100 text-rose-800 font-bold animate-pulse'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {loan.status}
                      </span>
                    </div>
                    <p className="font-medium text-slate-800">{loan.itemName} ({loan.quantity} unit)</p>
                    <div className="text-slate-500 flex items-center gap-2 text-[11px]">
                      <span>Peminjam: {loan.borrowerName}</span>
                      <span>·</span>
                      <span>Tenggat: {loan.dueDate}</span>
                    </div>
                  </div>

                  {loan.status !== 'Kembali' && (
                    <button
                      onClick={() => onReturnLoan(loan)}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap ml-2"
                    >
                      Kembalikan
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mutasi Stok Terkini */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">Riwayat Mutasi Stok Terkini</h3>
            </div>
            <button
              onClick={() => setActiveTab('stock')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
            >
              Lihat Log ({mutations.length}) →
            </button>
          </div>

          {recentMutations.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">Belum ada riwayat mutasi stok</div>
          ) : (
            <div className="space-y-3">
              {recentMutations.map((mut) => (
                <div
                  key={mut.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/50 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          mut.type === 'Masuk'
                            ? 'bg-emerald-100 text-emerald-800'
                            : mut.type === 'Keluar'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {mut.type} (+{mut.quantity})
                      </span>
                      <span className="font-semibold text-slate-900">{mut.itemName}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate max-w-xs">{mut.sourceOrDestination}</p>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Ref: {mut.referenceNumber} · {mut.date}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400">Stok Akhir</span>
                    <p className="text-sm font-bold font-mono text-slate-800">{mut.currentStock}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
