export type Language = 'en' | 'ar';

export type ProductCategory =
  | 'Laptops'
  | 'Desktops'
  | 'Printers'
  | 'Ink & Toner'
  | 'Phones & iPads'
  | 'Accessories'
  | 'Gaming';

export type StockStatus = 'available' | 'on_request';

export interface Product {
  id: string;
  nameEn: string;
  nameAr: string;
  category: ProductCategory;
  priceUsd: number;
  stockStatus: StockStatus;
  imageUrl: string;
  descriptionEn?: string;
  descriptionAr?: string;
  isVisible: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface PrintingService {
  id: string;
  nameEn: string;
  nameAr: string;
  unitEn: string;
  unitAr: string;
  startingPriceUsd: number;
  descriptionEn?: string;
  descriptionAr?: string;
  sortOrder: number;
  isVisible: boolean;
  updatedAt?: unknown;
}

export interface GalleryPhoto {
  id: string;
  titleEn: string;
  titleAr: string;
  imageUrl: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt?: unknown;
}

export interface ShopInfo {
  whatsappNumber: string;
  landlinePhone: string;
  hoursEn: string;
  hoursAr: string;
  addressEn: string;
  addressAr: string;
  ispProvidersEn?: string;
  ispProvidersAr?: string;
  transferNoteEn?: string;
  transferNoteAr?: string;
  updatedAt?: unknown;
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Laptops',
  'Desktops',
  'Printers',
  'Ink & Toner',
  'Phones & iPads',
  'Accessories',
  'Gaming',
];
