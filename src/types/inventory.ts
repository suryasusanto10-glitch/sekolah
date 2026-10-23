export type ItemCondition = 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
export type StockStatus = 'Aman' | 'Menipis' | 'Habis';
export type MutationType = 'Masuk' | 'Keluar' | 'Opname';
export type LoanStatus = 'Dipinjam' | 'Kembali' | 'Terlambat';
export type BorrowerType = 'Guru' | 'Siswa' | 'Staf' | 'Eksternal';

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: string;
  brand: string;
  specs: string;
  condition: ItemCondition;
  location: string;
  totalStock: number;
  borrowedStock: number;
  availableStock: number;
  minStockAlert: number;
  unit: string;
  purchaseDate: string;
  price: number;
  imageUrl: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockMutation {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  type: MutationType;
  quantity: number;
  previousStock: number;
  currentStock: number;
  date: string;
  referenceNumber: string;
  sourceOrDestination: string;
  operator: string;
  notes: string;
}

export interface LoanRecord {
  id: string;
  loanCode: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  itemImage?: string;
  borrowerName: string;
  borrowerType: BorrowerType;
  borrowerIdentifier: string;
  borrowerContact: string;
  quantity: number;
  loanDate: string;
  dueDate: string;
  returnDate: string | null;
  status: LoanStatus;
  purpose: string;
  initialCondition: ItemCondition;
  returnCondition?: ItemCondition;
  fineAmount?: number;
  notes: string;
  createdAt: string;
}

export interface InstitutionSettings {
  institutionName: string;
  subTitle: string;
  address: string;
  contact: string;
  adminName: string;
  adminTitle: string;
  headmasterName: string;
  headmasterNIP: string;
  city: string;
}

export type ActiveTab = 'dashboard' | 'inventory' | 'stock' | 'loans' | 'reports';
