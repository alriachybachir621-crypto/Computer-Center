/**
 * Security test specification verifying the "Dirty Dozen" adversarial payloads
 * against Computer Center's Firestore security rules.
 * Designed for execution with @firebase/rules-unit-testing when a local emulator is running.
 */
export interface DirtyDozenScenario {
  id: number;
  name: string;
  collectionPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid: string; email?: string; email_verified?: boolean } | null;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_PAYLOADS: DirtyDozenScenario[] = [
  {
    id: 1,
    name: 'Unauthenticated Product Create',
    collectionPath: 'products/hacked-laptop',
    operation: 'create',
    auth: null,
    payload: { nameEn: 'Hack', priceUsd: 1 },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified Admin Email Spoof',
    collectionPath: 'shop_info/main',
    operation: 'update',
    auth: { uid: 'spoof-uid', email: 'alriachybachir621@gmail.com', email_verified: false },
    payload: { whatsappNumber: '+961000000' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Self-Assigned Admin Escalation',
    collectionPath: 'admins/attacker-uid',
    operation: 'create',
    auth: { uid: 'attacker-uid', email: 'attacker@example.com', email_verified: true },
    payload: { email: 'attacker@example.com', role: 'admin' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Shadow Field Injection on Product',
    collectionPath: 'products/prod-shadow',
    operation: 'create',
    auth: { uid: 'admin-uid', email: 'alriachybachir621@gmail.com', email_verified: true },
    payload: {
      nameEn: 'HP Laptop',
      nameAr: 'لابتوب اتش بي',
      category: 'Laptops',
      priceUsd: 450,
      stockStatus: 'available',
      imageUrl: '/src/assets/images/product_laptop_desktop.jpg',
      descriptionEn: 'Core i5',
      descriptionAr: 'معالج i5',
      isVisible: true,
      shadowFlag: true,
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Immutable createdAt Tampering',
    collectionPath: 'products/prod-1',
    operation: 'update',
    auth: { uid: 'admin-uid', email: 'alriachybachir621@gmail.com', email_verified: true },
    payload: { createdAt: '2020-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Client-Forged Timestamp Injection',
    collectionPath: 'products/prod-ts',
    operation: 'create',
    auth: { uid: 'admin-uid', email: 'alriachybachir621@gmail.com', email_verified: true },
    payload: { createdAt: '1999-01-01T00:00:00Z', updatedAt: '1999-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Document ID Poisoning',
    collectionPath: 'products/bad$id!with*chars',
    operation: 'create',
    auth: { uid: 'admin-uid', email: 'alriachybachir621@gmail.com', email_verified: true },
    payload: { nameEn: 'Bad ID' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Negative Price Manipulation',
    collectionPath: 'products/prod-neg',
    operation: 'create',
    auth: { uid: 'admin-uid', email: 'alriachybachir621@gmail.com', email_verified: true },
    payload: { priceUsd: -100 },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Oversized String Exhaustion',
    collectionPath: 'products/prod-big',
    operation: 'create',
    auth: { uid: 'admin-uid', email: 'alriachybachir621@gmail.com', email_verified: true },
    payload: { nameEn: 'A'.repeat(500) },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Invalid Category Enum',
    collectionPath: 'products/prod-cat',
    operation: 'create',
    auth: { uid: 'admin-uid', email: 'alriachybachir621@gmail.com', email_verified: true },
    payload: { category: 'UnauthorizedCategory' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Non-Admin PIN Secret Read',
    collectionPath: 'admin_settings/pin',
    operation: 'get',
    auth: { uid: 'visitor-uid', email: 'visitor@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Hidden Product Draft Leak',
    collectionPath: 'products/hidden-draft',
    operation: 'get',
    auth: null,
    expected: 'PERMISSION_DENIED',
  },
];
