import { useState, useEffect, useTransition } from 'react';
import {
  InventoryItem,
  StockMutation,
  LoanRecord,
  InstitutionSettings,
  ActiveTab,
  ItemCondition,
} from './types/inventory';
import { storageService } from './services/storageService';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { StockView } from './components/StockView';
import { LoansView } from './components/LoansView';
import { ReportsView } from './components/ReportsView';
import { SettingsModal } from './components/SettingsModal';
import { BarcodeModal } from './components/BarcodeModal';

export default function App() {
  const [, startTransition] = useTransition();

  // Primary persistent state
  const [items, setItems] = useState<InventoryItem[]>(() => storageService.getInventory());
  const [mutations, setMutations] = useState<StockMutation[]>(() => storageService.getMutations());
  const [loans, setLoans] = useState<LoanRecord[]>(() => storageService.getLoans());
  const [settings, setSettings] = useState<InstitutionSettings>(() => storageService.getSettings());

  // UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [barcodeItem, setBarcodeItem] = useState<InventoryItem | null>(null);

  // Preselection helpers for inter-view navigation
  const [preselectedLoanItem, setPreselectedLoanItem] = useState<InventoryItem | null>(null);
  const [preselectedMutationItemId, setPreselectedMutationItemId] = useState<string | undefined>(undefined);

  // Real-time automatic overdue loan status check
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    let hasChanges = false;

    const updatedLoans = loans.map((loan) => {
      if (loan.status === 'Dipinjam' && loan.dueDate < today) {
        hasChanges = true;
        return { ...loan, status: 'Terlambat' as const };
      }
      return loan;
    });

    if (hasChanges) {
      setLoans(updatedLoans);
      storageService.saveLoans(updatedLoans);
    }
  }, [loans]);

  // Sync to storage
  const updateItems = (newItems: InventoryItem[]) => {
    setItems(newItems);
    storageService.saveInventory(newItems);
  };

  const updateMutations = (newMutations: StockMutation[]) => {
    setMutations(newMutations);
    storageService.saveMutations(newMutations);
  };

  const updateLoans = (newLoans: LoanRecord[]) => {
    setLoans(newLoans);
    storageService.saveLoans(newLoans);
  };

  // --- CRUD: INVENTORY ---
  const handleAddItem = (
    itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'borrowedStock' | 'availableStock'>
  ) => {
    const now = new Date().toISOString();
    const newItem: InventoryItem = {
      ...itemData,
      id: `item-${Date.now()}`,
      borrowedStock: 0,
      availableStock: itemData.totalStock,
      createdAt: now,
      updatedAt: now,
    };

    const newItems = [...items, newItem];
    updateItems(newItems);

    // Automatically record an initial Stock Mutation for the audit trail
    const initialMutation: StockMutation = {
      id: `mut-${Date.now()}`,
      itemId: newItem.id,
      itemCode: newItem.code,
      itemName: newItem.name,
      type: 'Masuk',
      quantity: newItem.totalStock,
      previousStock: 0,
      currentStock: newItem.totalStock,
      date: newItem.purchaseDate,
      referenceNumber: `INIT-${newItem.code}`,
      sourceOrDestination: 'Registrasi Barang Baru',
      operator: settings.adminName,
      notes: `Pendaftaran aset baru ${newItem.name}`,
    };
    updateMutations([...mutations, initialMutation]);
  };

  const handleEditItem = (id: string, updatedFields: Partial<InventoryItem>) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        const merged = { ...item, ...updatedFields, updatedAt: new Date().toISOString() };
        merged.availableStock = Math.max(0, merged.totalStock - merged.borrowedStock);
        return merged;
      }
      return item;
    });
    updateItems(updated);
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    updateItems(updated);
  };

  // --- CRUD: MUTASI STOK ---
  const handleAddMutation = (
    mutationData: Omit<StockMutation, 'id' | 'currentStock' | 'previousStock'>
  ) => {
    const targetItem = items.find((i) => i.id === mutationData.itemId);
    if (!targetItem) return;

    let previousStock = targetItem.totalStock;
    let newTotalStock = targetItem.totalStock;

    if (mutationData.type === 'Masuk') {
      newTotalStock = targetItem.totalStock + mutationData.quantity;
    } else if (mutationData.type === 'Keluar') {
      newTotalStock = Math.max(0, targetItem.totalStock - mutationData.quantity);
    } else if (mutationData.type === 'Opname') {
      newTotalStock = mutationData.quantity;
    }

    const newAvailableStock = Math.max(0, newTotalStock - targetItem.borrowedStock);

    const updatedItem: InventoryItem = {
      ...targetItem,
      totalStock: newTotalStock,
      availableStock: newAvailableStock,
      updatedAt: new Date().toISOString(),
    };

    const updatedItems = items.map((i) => (i.id === targetItem.id ? updatedItem : i));
    updateItems(updatedItems);

    const newMutation: StockMutation = {
      ...mutationData,
      id: `mut-${Date.now()}`,
      previousStock,
      currentStock: newTotalStock,
    };

    updateMutations([...mutations, newMutation]);
  };

  // --- CRUD: PEMINJAMAN ALAT ---
  const handleAddLoan = (
    loanData: Omit<LoanRecord, 'id' | 'createdAt' | 'status' | 'returnDate'>
  ) => {
    const targetItem = items.find((i) => i.id === loanData.itemId);
    if (!targetItem) return;

    const newLoan: LoanRecord = {
      ...loanData,
      id: `loan-${Date.now()}`,
      status: 'Dipinjam',
      returnDate: null,
      createdAt: new Date().toISOString(),
    };

    // Atomically reduce available stock and increase borrowed stock
    const updatedItem: InventoryItem = {
      ...targetItem,
      borrowedStock: targetItem.borrowedStock + loanData.quantity,
      availableStock: Math.max(0, targetItem.availableStock - loanData.quantity),
      updatedAt: new Date().toISOString(),
    };

    updateItems(items.map((i) => (i.id === targetItem.id ? updatedItem : i)));
    updateLoans([...loans, newLoan]);
  };

  const handleReturnLoan = (
    loanId: string,
    returnDate: string,
    returnCondition: ItemCondition,
    notes: string,
    fineAmount?: number
  ) => {
    const targetLoan = loans.find((l) => l.id === loanId);
    if (!targetLoan) return;

    const updatedLoan: LoanRecord = {
      ...targetLoan,
      status: 'Kembali',
      returnDate,
      returnCondition,
      notes: `${targetLoan.notes ? targetLoan.notes + ' | ' : ''}Kembali: ${notes}`,
      fineAmount,
    };

    // Restore stock to inventory
    const targetItem = items.find((i) => i.id === targetLoan.itemId);
    if (targetItem) {
      const updatedItem: InventoryItem = {
        ...targetItem,
        borrowedStock: Math.max(0, targetItem.borrowedStock - targetLoan.quantity),
        availableStock: targetItem.availableStock + targetLoan.quantity,
        condition: returnCondition !== 'Baik' ? returnCondition : targetItem.condition,
        updatedAt: new Date().toISOString(),
      };
      updateItems(items.map((i) => (i.id === targetItem.id ? updatedItem : i)));
    }

    updateLoans(loans.map((l) => (l.id === loanId ? updatedLoan : l)));
  };

  const handleEditLoan = (loanId: string, updatedFields: Partial<LoanRecord>) => {
    const updated = loans.map((l) => (l.id === loanId ? { ...l, ...updatedFields } : l));
    updateLoans(updated);
  };

  const handleDeleteLoan = (loanId: string) => {
    const targetLoan = loans.find((l) => l.id === loanId);
    if (targetLoan && targetLoan.status !== 'Kembali') {
      // Revert borrowed stock
      const targetItem = items.find((i) => i.id === targetLoan.itemId);
      if (targetItem) {
        const updatedItem: InventoryItem = {
          ...targetItem,
          borrowedStock: Math.max(0, targetItem.borrowedStock - targetLoan.quantity),
          availableStock: targetItem.availableStock + targetLoan.quantity,
        };
        updateItems(items.map((i) => (i.id === targetItem.id ? updatedItem : i)));
      }
    }
    updateLoans(loans.filter((l) => l.id !== loanId));
  };

  // Quick action navigation helpers
  const handleOpenNewLoanWithItem = (item: InventoryItem) => {
    setPreselectedLoanItem(item);
    setActiveTab('loans');
  };

  const handleOpenNewMutationWithItem = (item: InventoryItem) => {
    setPreselectedMutationItemId(item.id);
    setActiveTab('stock');
  };

  // Reload all data after JSON restore or reset
  const handleReloadData = () => {
    setItems(storageService.getInventory());
    setMutations(storageService.getMutations());
    setLoans(storageService.getLoans());
    setSettings(storageService.getSettings());
  };

  // Count summaries for badges
  const overdueCount = loans.filter((l) => l.status === 'Terlambat').length;
  const lowStockCount = items.filter((i) => i.availableStock <= i.minStockAlert).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <div className="no-print">
        <Navbar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            startTransition(() => {
              setActiveTab(tab);
            });
          }}
          onOpenNewItem={() => {
            setActiveTab('inventory');
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenReports={() => setActiveTab('reports')}
          settings={settings}
          overdueCount={overdueCount}
          lowStockCount={lowStockCount}
        />
      </div>

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            items={items}
            loans={loans}
            mutations={mutations}
            setActiveTab={setActiveTab}
            onOpenNewLoan={() => {
              setPreselectedLoanItem(null);
              setActiveTab('loans');
            }}
            onOpenNewMutation={(itemId) => {
              setPreselectedMutationItemId(itemId);
              setActiveTab('stock');
            }}
            onOpenNewItem={() => setActiveTab('inventory')}
            onReturnLoan={(loan) => {
              setActiveTab('loans');
            }}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            items={items}
            onAddItem={handleAddItem}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            onOpenNewLoanWithItem={handleOpenNewLoanWithItem}
            onOpenNewMutationWithItem={handleOpenNewMutationWithItem}
            onOpenBarcodeModal={(item) => setBarcodeItem(item)}
          />
        )}

        {activeTab === 'stock' && (
          <StockView
            items={items}
            mutations={mutations}
            onAddMutation={handleAddMutation}
            preselectedItemId={preselectedMutationItemId}
          />
        )}

        {activeTab === 'loans' && (
          <LoansView
            items={items}
            loans={loans}
            onAddLoan={handleAddLoan}
            onReturnLoan={handleReturnLoan}
            onEditLoan={handleEditLoan}
            onDeleteLoan={handleDeleteLoan}
            preselectedItem={preselectedLoanItem}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            items={items}
            mutations={mutations}
            loans={loans}
            settings={settings}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-slate-700">SI-INVENTARIS</span> · {settings.institutionName}
          </div>
          <div>
            Pengelola Aset: <span className="font-medium text-slate-700">{settings.adminName}</span> ({settings.adminTitle})
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          storageService.saveSettings(newSettings);
        }}
        onDataReload={handleReloadData}
      />

      <BarcodeModal
        item={barcodeItem}
        settings={settings}
        onClose={() => setBarcodeItem(null)}
      />
    </div>
  );
}
