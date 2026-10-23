import { useState } from 'react';
import { InstitutionSettings } from '../types/inventory';
import { storageService } from '../services/storageService';
import {
  X,
  Building2,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Save,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: InstitutionSettings;
  onSaveSettings: (settings: InstitutionSettings) => void;
  onDataReload: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onDataReload,
}: SettingsModalProps) {
  const [formData, setFormData] = useState<InstitutionSettings>(settings);
  const [activeTab, setActiveTab] = useState<'profile' | 'backup'>('profile');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setStatusMessage({ text: 'Pengaturan lembaga berhasil disimpan!', type: 'success' });
    setTimeout(() => {
      setStatusMessage(null);
      onClose();
    }, 1200);
  };

  const handleExportBackup = () => {
    const jsonStr = storageService.exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_inventaris_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusMessage({ text: 'File backup JSON berhasil diunduh.', type: 'success' });
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const success = storageService.importBackupJSON(content);
        if (success) {
          setStatusMessage({ text: 'Data inventaris berhasil dipulihkan dari cadangan!', type: 'success' });
          onDataReload();
          setTimeout(() => onClose(), 1500);
        } else {
          setStatusMessage({ text: 'Format file cadangan tidak valid.', type: 'error' });
        }
      } catch {
        setStatusMessage({ text: 'Gagal memproses file cadangan.', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm('PERINGATAN: Apakah Anda yakin ingin mengatur ulang data ke data demo bawaan? Semua data baru akan diganti.')) {
      storageService.resetToDefault();
      onDataReload();
      setStatusMessage({ text: 'Data berhasil direset ke pengaturan awal.', type: 'success' });
      setTimeout(() => onClose(), 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold">Pengaturan Instansi & Cadangan Data</h3>
              <p className="text-[11px] text-slate-400">Kelola identitas Kop Surat laporan dan backup data admin</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 text-xs">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-4 font-semibold border-b-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Profil Kop Surat & Pejabat
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`py-2 px-4 font-semibold border-b-2 cursor-pointer ${
              activeTab === 'backup'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Cadangan & Pemulihan (Backup)
          </button>
        </div>

        {statusMessage && (
          <div
            className={`p-3 text-xs flex items-center gap-2 mx-5 mt-4 rounded-lg ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Tab 1: Profile & Kop Surat */}
        {activeTab === 'profile' ? (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Instansi / Sekolah</label>
              <input
                type="text"
                required
                value={formData.institutionName}
                onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg font-bold uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit Pengelola / Subtitle</label>
              <input
                type="text"
                required
                value={formData.subTitle}
                onChange={(e) => setFormData({ ...formData, subTitle: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kontak / Telp & Email</label>
                <input
                  type="text"
                  required
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kota Tempat Terbit</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <h4 className="font-bold text-slate-800 mb-2">Pejabat Penandatangan Laporan</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Nama Kepala Sekolah / Pimpinan</label>
                  <input
                    type="text"
                    required
                    value={formData.headmasterName}
                    onChange={(e) => setFormData({ ...formData, headmasterName: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">NIP Kepala Sekolah</label>
                  <input
                    type="text"
                    value={formData.headmasterNIP}
                    onChange={(e) => setFormData({ ...formData, headmasterNIP: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Nama Petugas Admin Sarpras</label>
                  <input
                    type="text"
                    required
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">Jabatan Admin</label>
                  <input
                    type="text"
                    required
                    value={formData.adminTitle}
                    onChange={(e) => setFormData({ ...formData, adminTitle: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Pengaturan</span>
              </button>
            </div>
          </form>
        ) : (
          /* Tab 2: Backup & Restore */
          <div className="p-5 space-y-5 text-xs">
            {/* Unduh Backup */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-slate-900 text-sm">Unduh File Cadangan (Backup JSON)</p>
                <p className="text-slate-500 mt-0.5">
                  Simpan seluruh data inventaris, mutasi stok, peminjaman alat, dan pengaturan instansi ke komputer Anda.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportBackup}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer shrink-0 shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Cadangan</span>
              </button>
            </div>

            {/* Unggah Restore */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-slate-900 text-sm">Pulihkan Data (Restore JSON)</p>
                <p className="text-slate-500 mt-0.5">
                  Unggah file cadangan JSON yang pernah Anda unduh sebelumnya untuk mengembalikan seluruh basis data.
                </p>
              </div>
              <label className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg cursor-pointer shrink-0">
                <Upload className="w-4 h-4 text-slate-600" />
                <span>Pilih File JSON</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>

            {/* Reset ke Demo Data */}
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-rose-900 text-sm">Reset ke Data Awal Demo</p>
                <p className="text-rose-700 mt-0.5">
                  Kembalikan ke data bawaan lengkap (alat-alat lab, proyektor, kamera, riwayat mutasi dan peminjaman).
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetData}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer shrink-0"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset Data</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
