import {
  InventoryItem,
  StockMutation,
  LoanRecord,
  InstitutionSettings,
} from '../types/inventory';
import {
  INITIAL_INVENTORY_ITEMS,
  INITIAL_STOCK_MUTATIONS,
  INITIAL_LOAN_RECORDS,
  DEFAULT_SETTINGS,
} from '../data/mockData';

const STORAGE_KEYS = {
  INVENTORY: 'si_inventaris_items_v1',
  MUTATIONS: 'si_inventaris_mutations_v1',
  LOANS: 'si_inventaris_loans_v1',
  SETTINGS: 'si_inventaris_settings_v1',
};

export const storageService = {
  getInventory(): InventoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INVENTORY);
      if (!data) {
        this.saveInventory(INITIAL_INVENTORY_ITEMS);
        return INITIAL_INVENTORY_ITEMS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_INVENTORY_ITEMS;
    }
  },

  saveInventory(items: InventoryItem[]): void {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items));
  },

  getMutations(): StockMutation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MUTATIONS);
      if (!data) {
        this.saveMutations(INITIAL_STOCK_MUTATIONS);
        return INITIAL_STOCK_MUTATIONS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_STOCK_MUTATIONS;
    }
  },

  saveMutations(mutations: StockMutation[]): void {
    localStorage.setItem(STORAGE_KEYS.MUTATIONS, JSON.stringify(mutations));
  },

  getLoans(): LoanRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOANS);
      if (!data) {
        this.saveLoans(INITIAL_LOAN_RECORDS);
        return INITIAL_LOAN_RECORDS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_LOAN_RECORDS;
    }
  },

  saveLoans(loans: LoanRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
  },

  getSettings(): InstitutionSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        this.saveSettings(DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: InstitutionSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  exportBackupJSON(): string {
    const backup = {
      app: 'SI-INVENTARIS',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      items: this.getInventory(),
      mutations: this.getMutations(),
      loans: this.getLoans(),
      settings: this.getSettings(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackupJSON(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.items) && Array.isArray(parsed.loans)) {
        this.saveInventory(parsed.items);
        if (Array.isArray(parsed.mutations)) this.saveMutations(parsed.mutations);
        this.saveLoans(parsed.loans);
        if (parsed.settings) this.saveSettings(parsed.settings);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEYS.INVENTORY);
    localStorage.removeItem(STORAGE_KEYS.MUTATIONS);
    localStorage.removeItem(STORAGE_KEYS.LOANS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  },
};
