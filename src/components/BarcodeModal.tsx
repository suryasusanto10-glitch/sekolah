import { InventoryItem, InstitutionSettings } from '../types/inventory';
import { X, Printer, QrCode } from 'lucide-react';

interface BarcodeModalProps {
  item: InventoryItem | null;
  settings: InstitutionSettings;
  onClose: () => void;
}

export function BarcodeModal({ item, settings, onClose }: BarcodeModalProps) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold">Stiker Label Barcode Inventaris</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {/* STIKER LABEL FISIK YANG SIAP DICETAK */}
          <div className="border-2 border-dashed border-slate-400 p-4 rounded-lg bg-white space-y-2.5 print:border-solid print:border-black">
            {/* Header label */}
            <div className="text-center border-b border-slate-300 pb-2">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">PROPERTI ASET / MILIK RESMI</p>
              <p className="text-xs font-bold uppercase text-slate-900 truncate">{settings.institutionName}</p>
            </div>

            {/* Simulated Clean Barcode Lines */}
            <div className="flex flex-col items-center justify-center py-2 bg-slate-50 border border-slate-200 rounded">
              <div className="flex items-end justify-center gap-0.5 h-12 w-full max-w-[240px] px-2">
                {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 4, 2, 1, 2, 3, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2].map(
                  (width, idx) => (
                    <div
                      key={idx}
                      style={{ width: `${width * 2}px` }}
                      className={`h-full ${idx % 2 === 0 ? 'bg-black' : 'bg-transparent'}`}
                    />
                  )
                )}
              </div>
              <p className="font-mono text-sm font-bold tracking-widest text-slate-900 mt-1">{item.code}</p>
            </div>

            {/* Item Details */}
            <div className="text-xs space-y-1 pt-1">
              <div className="flex justify-between">
                <span className="text-[11px] text-slate-500">Nama Barang:</span>
                <span className="font-bold text-slate-900 text-right truncate max-w-[200px]">{item.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[11px] text-slate-500">Kategori:</span>
                <span className="font-medium text-slate-700 text-right">{item.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[11px] text-slate-500">Lokasi Lab/Ruang:</span>
                <span className="font-semibold text-slate-800 text-right">{item.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[11px] text-slate-500">Tahun Perolehan:</span>
                <span className="font-mono text-slate-700 text-right">{item.purchaseDate.split('-')[0]}</span>
              </div>
            </div>

            <div className="text-center pt-2 border-t border-slate-200">
              <p className="text-[9px] text-slate-400 italic">Dilarang memindahkan atau merusak label aset ini tanpa izin tertulis.</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 no-print">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Label Stiker</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
