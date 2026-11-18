import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import {
  DEFAULT_GALLERY_PHOTOS,
  DEFAULT_PRINTING_SERVICES,
  DEFAULT_PRODUCTS,
  DEFAULT_SHOP_INFO,
} from '../data/defaults';
import { GalleryPhoto, PrintingService, Product, ShopInfo } from '../types';
import { db, handleFirestoreError, OperationType, storage } from './firebase';

function makeSafeDocId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now()}-${rand}`.replace(/[^a-zA-Z0-9_-]/g, '');
}

export function subscribeProducts(
  includeHidden: boolean,
  onData: (items: Product[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'products';
  const colRef = collection(db, path);
  const q = includeHidden ? query(colRef) : query(colRef, where('isVisible', '==', true));

  return onSnapshot(
    q,
    (snap) => {
      const items: Product[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          nameEn: String(data.nameEn ?? ''),
          nameAr: String(data.nameAr ?? ''),
          category: data.category,
          priceUsd: Number(data.priceUsd ?? 0),
          stockStatus: data.stockStatus === 'on_request' ? 'on_request' : 'available',
          imageUrl: String(data.imageUrl ?? ''),
          descriptionEn: typeof data.descriptionEn === 'string' ? data.descriptionEn : '',
          descriptionAr: typeof data.descriptionAr === 'string' ? data.descriptionAr : '',
          isVisible: Boolean(data.isVisible ?? true),
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      });
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (e) {
        if (onError && e instanceof Error) onError(e);
      }
    }
  );
}

export function subscribePrintingServices(
  includeHidden: boolean,
  onData: (items: PrintingService[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'printing_services';
  const colRef = collection(db, path);
  const q = includeHidden ? query(colRef) : query(colRef, where('isVisible', '==', true));

  return onSnapshot(
    q,
    (snap) => {
      const items: PrintingService[] = snap.docs
        .map((d) => {
          const data = d.data();
          return {
            id: d.id,
            nameEn: String(data.nameEn ?? ''),
            nameAr: String(data.nameAr ?? ''),
            unitEn: String(data.unitEn ?? ''),
            unitAr: String(data.unitAr ?? ''),
            startingPriceUsd: Number(data.startingPriceUsd ?? 0),
            descriptionEn: typeof data.descriptionEn === 'string' ? data.descriptionEn : '',
            descriptionAr: typeof data.descriptionAr === 'string' ? data.descriptionAr : '',
            sortOrder: Number(data.sortOrder ?? 0),
            isVisible: Boolean(data.isVisible ?? true),
            updatedAt: data.updatedAt,
          };
        })
        .sort((a, b) => a.sortOrder - b.sortOrder);
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (e) {
        if (onError && e instanceof Error) onError(e);
      }
    }
  );
}

export function subscribeGalleryPhotos(
  includeHidden: boolean,
  onData: (items: GalleryPhoto[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'gallery_photos';
  const colRef = collection(db, path);
  const q = includeHidden ? query(colRef) : query(colRef, where('isVisible', '==', true));

  return onSnapshot(
    q,
    (snap) => {
      const items: GalleryPhoto[] = snap.docs
        .map((d) => {
          const data = d.data();
          return {
            id: d.id,
            titleEn: String(data.titleEn ?? ''),
            titleAr: String(data.titleAr ?? ''),
            imageUrl: String(data.imageUrl ?? ''),
            sortOrder: Number(data.sortOrder ?? 0),
            isVisible: Boolean(data.isVisible ?? true),
            createdAt: data.createdAt,
          };
        })
        .sort((a, b) => a.sortOrder - b.sortOrder);
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (e) {
        if (onError && e instanceof Error) onError(e);
      }
    }
  );
}

export function subscribeShopInfo(
  onData: (info: ShopInfo | null) => void,
  onError?: (err: Error) => void
) {
  const path = 'shop_info/main';
  return onSnapshot(
    doc(db, 'shop_info', 'main'),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      const data = snap.data();
      onData({
        whatsappNumber: String(data.whatsappNumber ?? DEFAULT_SHOP_INFO.whatsappNumber),
        landlinePhone: String(data.landlinePhone ?? DEFAULT_SHOP_INFO.landlinePhone),
        hoursEn: String(data.hoursEn ?? DEFAULT_SHOP_INFO.hoursEn),
        hoursAr: String(data.hoursAr ?? DEFAULT_SHOP_INFO.hoursAr),
        addressEn: String(data.addressEn ?? DEFAULT_SHOP_INFO.addressEn),
        addressAr: String(data.addressAr ?? DEFAULT_SHOP_INFO.addressAr),
        ispProvidersEn: typeof data.ispProvidersEn === 'string' ? data.ispProvidersEn : DEFAULT_SHOP_INFO.ispProvidersEn,
        ispProvidersAr: typeof data.ispProvidersAr === 'string' ? data.ispProvidersAr : DEFAULT_SHOP_INFO.ispProvidersAr,
        transferNoteEn: typeof data.transferNoteEn === 'string' ? data.transferNoteEn : DEFAULT_SHOP_INFO.transferNoteEn,
        transferNoteAr: typeof data.transferNoteAr === 'string' ? data.transferNoteAr : DEFAULT_SHOP_INFO.transferNoteAr,
        updatedAt: data.updatedAt,
      });
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch (e) {
        if (onError && e instanceof Error) onError(e);
      }
    }
  );
}

export async function saveProduct(
  product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<string> {
  const id = existingId ? existingId.replace(/[^a-zA-Z0-9_-]/g, '') : makeSafeDocId('prod');
  const path = `products/${id}`;

  const payload = {
    nameEn: product.nameEn.trim().slice(0, 140),
    nameAr: product.nameAr.trim().slice(0, 140),
    category: product.category,
    priceUsd: Math.min(100000, Math.max(0, Number(product.priceUsd) || 0)),
    stockStatus: product.stockStatus === 'on_request' ? 'on_request' : 'available',
    imageUrl: product.imageUrl.trim().slice(0, 2048),
    descriptionEn: (product.descriptionEn ?? '').trim().slice(0, 500),
    descriptionAr: (product.descriptionAr ?? '').trim().slice(0, 500),
    isVisible: Boolean(product.isVisible),
    updatedAt: serverTimestamp(),
  };

  try {
    if (existingId) {
      await updateDoc(doc(db, 'products', id), payload);
    } else {
      await setDoc(doc(db, 'products', id), {
        ...payload,
        createdAt: serverTimestamp(),
      });
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, existingId ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function removeProduct(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function savePrintingService(
  service: Omit<PrintingService, 'id' | 'updatedAt'>,
  existingId?: string
): Promise<string> {
  const id = existingId ? existingId.replace(/[^a-zA-Z0-9_-]/g, '') : makeSafeDocId('print');
  const path = `printing_services/${id}`;

  const payload = {
    nameEn: service.nameEn.trim().slice(0, 120),
    nameAr: service.nameAr.trim().slice(0, 120),
    unitEn: service.unitEn.trim().slice(0, 60),
    unitAr: service.unitAr.trim().slice(0, 60),
    startingPriceUsd: Math.min(10000, Math.max(0, Number(service.startingPriceUsd) || 0)),
    descriptionEn: (service.descriptionEn ?? '').trim().slice(0, 400),
    descriptionAr: (service.descriptionAr ?? '').trim().slice(0, 400),
    sortOrder: Math.min(1000, Math.max(0, Number(service.sortOrder) || 0)),
    isVisible: Boolean(service.isVisible),
    updatedAt: serverTimestamp(),
  };

  try {
    if (existingId) {
      await updateDoc(doc(db, 'printing_services', id), payload);
    } else {
      await setDoc(doc(db, 'printing_services', id), payload);
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, existingId ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function removePrintingService(serviceId: string): Promise<void> {
  const path = `printing_services/${serviceId}`;
  try {
    await deleteDoc(doc(db, 'printing_services', serviceId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveGalleryPhoto(
  photo: Omit<GalleryPhoto, 'id' | 'createdAt'>,
  existingId?: string
): Promise<string> {
  const id = existingId ? existingId.replace(/[^a-zA-Z0-9_-]/g, '') : makeSafeDocId('gal');
  const path = `gallery_photos/${id}`;

  const payload = {
    titleEn: photo.titleEn.trim().slice(0, 120),
    titleAr: photo.titleAr.trim().slice(0, 120),
    imageUrl: photo.imageUrl.trim().slice(0, 2048),
    sortOrder: Math.min(1000, Math.max(0, Number(photo.sortOrder) || 0)),
    isVisible: Boolean(photo.isVisible),
  };

  try {
    if (existingId) {
      await updateDoc(doc(db, 'gallery_photos', id), payload);
    } else {
      await setDoc(doc(db, 'gallery_photos', id), {
        ...payload,
        createdAt: serverTimestamp(),
      });
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, existingId ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function removeGalleryPhoto(photoId: string): Promise<void> {
  const path = `gallery_photos/${photoId}`;
  try {
    await deleteDoc(doc(db, 'gallery_photos', photoId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveShopInfo(info: ShopInfo): Promise<void> {
  const path = 'shop_info/main';
  try {
    await setDoc(doc(db, 'shop_info', 'main'), {
      whatsappNumber: info.whatsappNumber.trim().slice(0, 32),
      landlinePhone: info.landlinePhone.trim().slice(0, 32),
      hoursEn: info.hoursEn.trim().slice(0, 200),
      hoursAr: info.hoursAr.trim().slice(0, 200),
      addressEn: info.addressEn.trim().slice(0, 240),
      addressAr: info.addressAr.trim().slice(0, 240),
      ispProvidersEn: (info.ispProvidersEn ?? '').trim().slice(0, 400),
      ispProvidersAr: (info.ispProvidersAr ?? '').trim().slice(0, 400),
      transferNoteEn: (info.transferNoteEn ?? '').trim().slice(0, 400),
      transferNoteAr: (info.transferNoteAr ?? '').trim().slice(0, 400),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getAdminPin(): Promise<string> {
  const path = 'admin_settings/pin';
  try {
    const snap = await getDoc(doc(db, 'admin_settings', 'pin'));
    if (snap.exists() && typeof snap.data().pinCode === 'string') {
      return snap.data().pinCode;
    }
    return '0880';
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function updateAdminPin(pinCode: string): Promise<void> {
  if (!/^[0-9]{4}$/.test(pinCode)) {
    throw new Error('PIN code must be exactly 4 digits.');
  }
  const path = 'admin_settings/pin';
  try {
    await setDoc(doc(db, 'admin_settings', 'pin'), {
      pinCode,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function seedDefaultsToCloud(): Promise<void> {
  const batch = writeBatch(db);
  try {
    for (const p of DEFAULT_PRODUCTS) {
      batch.set(doc(db, 'products', p.id), {
        nameEn: p.nameEn.slice(0, 140),
        nameAr: p.nameAr.slice(0, 140),
        category: p.category,
        priceUsd: p.priceUsd,
        stockStatus: p.stockStatus,
        imageUrl: p.imageUrl.slice(0, 2048),
        descriptionEn: (p.descriptionEn ?? '').slice(0, 500),
        descriptionAr: (p.descriptionAr ?? '').slice(0, 500),
        isVisible: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    for (const s of DEFAULT_PRINTING_SERVICES) {
      batch.set(doc(db, 'printing_services', s.id), {
        nameEn: s.nameEn.slice(0, 120),
        nameAr: s.nameAr.slice(0, 120),
        unitEn: s.unitEn.slice(0, 60),
        unitAr: s.unitAr.slice(0, 60),
        startingPriceUsd: s.startingPriceUsd,
        descriptionEn: (s.descriptionEn ?? '').slice(0, 400),
        descriptionAr: (s.descriptionAr ?? '').slice(0, 400),
        sortOrder: s.sortOrder,
        isVisible: true,
        updatedAt: serverTimestamp(),
      });
    }
    for (const g of DEFAULT_GALLERY_PHOTOS) {
      batch.set(doc(db, 'gallery_photos', g.id), {
        titleEn: g.titleEn.slice(0, 120),
        titleAr: g.titleAr.slice(0, 120),
        imageUrl: g.imageUrl.slice(0, 2048),
        sortOrder: g.sortOrder,
        isVisible: true,
        createdAt: serverTimestamp(),
      });
    }
    batch.set(doc(db, 'shop_info', 'main'), {
      ...DEFAULT_SHOP_INFO,
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'batch_seed');
  }
}

export async function uploadImageToFirebaseStorage(
  file: File,
  folder: 'products' | 'gallery'
): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileRef = ref(storage, `${folder}/${Date.now()}-${safeName}`);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}
