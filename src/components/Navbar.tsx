import { ActiveTab, InstitutionSettings } from '../types/inventory';
import { Settings, FileSpreadsheet, PlusCircle, AlertCircle } from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewItem: () => void;
  onOpenSettings: () => void;
  onOpenReports: () => void;
  settings: InstitutionSettings;
  overdueCount: number;
  lowStockCount: number;
}

export function Navbar({
  activeTab,
  setActiveTab,
  onOpenNewItem,
  onOpenSettings,
  onOpenReports,
  settings,
  overdueCount,
  lowStockCount,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand wordmark (single text element) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-left group cursor-pointer"
            >
              <div className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors whitespace-nowrap">
                SI-INVENTARIS
              </div>
              <div className="text-[11px] text-slate-600 truncate max-w-[200px] sm:max-w-[280px]">
                {settings.institutionName}
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation links (single-line text) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                  : ''
              }`}
            >
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
                activeTab === 'inventory'
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                  : ''
              }`}
            >
              Daftar Inventaris
            </button>

            <button
              onClick={() => setActiveTab('stock')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'stock'
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                  : ''
              }`}
            >
              <span>Stok Barang</span>
              {lowStockCount > 0 && (
                <span className="text-[11px] font-mono text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-semibold">
                  {lowStockCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('loans')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'loans'
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                  : ''
              }`}
            >
              <span>Peminjaman Alat</span>
              {overdueCount > 0 && (
                <span className="text-[11px] font-mono text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded font-semibold">
                  {overdueCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
                activeTab === 'reports'
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                  : ''
              }`}
            >
              Laporan & Cetak
            </button>
          </nav>

          {/* Zone 3: 1 primary action zone with utility affordances */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenReports}
              title="Cetak & Ekspor Laporan (Word/Excel/PDF)"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
              <span>Ekspor</span>
            </button>

            <button
              onClick={onOpenSettings}
              title="Pengaturan Lembaga & Backup"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenNewItem}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Tambah Barang</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex items-center justify-between border-t border-slate-100 py-2 overflow-x-auto text-xs font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'dashboard' ? 'text-indigo-600 font-semibold bg-indigo-50' : ''
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'inventory' ? 'text-indigo-600 font-semibold bg-indigo-50' : ''
            }`}
          >
            Inventaris
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-2.5 py-1 rounded whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'stock' ? 'text-indigo-600 font-semibold bg-indigo-50' : ''
            }`}
          >
            <span>Stok</span>
            {lowStockCount > 0 && <span className="text-[10px] text-amber-700 font-mono">({lowStockCount})</span>}
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className={`px-2.5 py-1 rounded whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'loans' ? 'text-indigo-600 font-semibold bg-indigo-50' : ''
            }`}
          >
            <span>Peminjaman</span>
            {overdueCount > 0 && <span className="text-[10px] text-rose-700 font-mono">({overdueCount})</span>}
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'reports' ? 'text-indigo-600 font-semibold bg-indigo-50' : ''
            }`}
          >
            Laporan
          </button>
        </div>
      </div>
    </header>
  );
}
