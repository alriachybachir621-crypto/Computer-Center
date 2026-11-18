import React, { useCallback, useEffect, useState } from 'react';
import { User, signOut } from 'firebase/auth';
import {
  Check,
  Database,
  Delete,
  Image as ImageIcon,
  Lock,
  LogOut,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  GalleryPhoto,
  Language,
  PRODUCT_CATEGORIES,
  PrintingService,
  Product,
  ProductCategory,
  ShopInfo,
  StockStatus,
} from '../types';
import {
  auth,
  isShopManagerUser,
  signInWithShopPin,
  updateShopPinPassword,
} from '../lib/firebase';
import {
  removeGalleryPhoto,
  removePrintingService,
  removeProduct,
  saveGalleryPhoto,
  savePrintingService,
  saveProduct,
  saveShopInfo,
  seedDefaultsToCloud,
  uploadImageToFirebaseStorage,
} from '../lib/storefrontService';
import { SafeImage } from './SafeImage';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  user: User | null;
  products: Product[];
  printingServices: PrintingService[];
  galleryPhotos: GalleryPhoto[];
  shopInfo: ShopInfo;
  hasCloudProducts: boolean;
}

type PanelTab = 'products' | 'printing' | 'gallery' | 'settings';

const ATTEMPTS_KEY = 'cc_pin_attempts';
const LOCK_UNTIL_KEY = 'cc_pin_lock_until';
const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 5 * 60 * 1000;

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  lang,
  user,
  products,
  printingServices,
  galleryPhotos,
  shopInfo,
  hasCloudProducts,
}) => {
  const isAr = lang === 'ar';
  const [pinDigits, setPinDigits] = useState('');
  const [pinError, setPinError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  const [attempts, setAttempts] = useState<number>(() => {
    try {
      return Number(window.localStorage.getItem(ATTEMPTS_KEY) || '0') || 0;
    } catch {
      return 0;
    }
  });
  const [lockUntil, setLockUntil] = useState<number>(() => {
    try {
      return Number(window.localStorage.getItem(LOCK_UNTIL_KEY) || '0') || 0;
    } catch {
      return 0;
    }
  });
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  const [activeTab, setActiveTab] = useState<PanelTab>('products');
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [busy, setBusy] = useState(false);

  // Product Form State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodNameEn, setProdNameEn] = useState('');
  const [prodNameAr, setProdNameAr] = useState('');
  const [prodCategory, setProdCategory] = useState<ProductCategory>('Laptops');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState<StockStatus>('available');
  const [prodImage, setProdImage] = useState(
    '/src/assets/images/product_laptop_desktop_1795023857667.jpg'
  );
  const [prodDescEn, setProdDescEn] = useState('');
  const [prodDescAr, setProdDescAr] = useState('');
  const [prodVisible, setProdVisible] = useState(true);

  // Printing Service Form State
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [svcNameEn, setSvcNameEn] = useState('');
  const [svcNameAr, setSvcNameAr] = useState('');
  const [svcUnitEn, setSvcUnitEn] = useState('per m²');
  const [svcUnitAr, setSvcUnitAr] = useState('للمتر المربع');
  const [svcPrice, setSvcPrice] = useState('');
  const [svcDescEn, setSvcDescEn] = useState('');
  const [svcDescAr, setSvcDescAr] = useState('');
  const [svcOrder, setSvcOrder] = useState('1');

  // Gallery Form State
  const [galTitleEn, setGalTitleEn] = useState('');
  const [galTitleAr, setGalTitleAr] = useState('');
  const [galImage, setGalImage] = useState(
    '/src/assets/images/hero_shop_showcase_1795023856613.jpg'
  );
  const [galOrder, setGalOrder] = useState('1');

  // Shop Info & Passcode Form State
  const [infoForm, setInfoForm] = useState<ShopInfo>(shopInfo);
  const [newPin, setNewPin] = useState('');

  useEffect(() => {
    setInfoForm(shopInfo);
  }, [shopInfo]);

  const isSignedIn = isShopManagerUser(user);
  const remainingLockMs = Math.max(0, lockUntil - nowMs);
  const isLocked = remainingLockMs > 0;

  useEffect(() => {
    if (!isOpen || !isLocked) return;
    const interval = window.setInterval(() => {
      const current = Date.now();
      setNowMs(current);
      if (current >= lockUntil) {
        setLockUntil(0);
        setAttempts(0);
        try {
          window.localStorage.removeItem(LOCK_UNTIL_KEY);
          window.localStorage.removeItem(ATTEMPTS_KEY);
        } catch {
          // ignore storage errors
        }
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isOpen, isLocked, lockUntil]);

  const submitPin = useCallback(
    async (code: string) => {
      if (signingIn || isLocked || code.length !== 4) return;
      setSigningIn(true);
      setPinError('');
      try {
        await signInWithShopPin(code);
        setPinDigits('');
        setAttempts(0);
        setLockUntil(0);
        try {
          window.localStorage.removeItem(ATTEMPTS_KEY);
          window.localStorage.removeItem(LOCK_UNTIL_KEY);
        } catch {
          // ignore storage errors
        }
      } catch {
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);
        setPinDigits('');
        try {
          window.localStorage.setItem(ATTEMPTS_KEY, String(nextAttempts));
        } catch {
          // ignore storage errors
        }

        if (nextAttempts >= MAX_ATTEMPTS) {
          const until = Date.now() + LOCK_DURATION_MS;
          setLockUntil(until);
          setNowMs(Date.now());
          try {
            window.localStorage.setItem(LOCK_UNTIL_KEY, String(until));
          } catch {
            // ignore storage errors
          }
          setPinError('');
        } else {
          setPinError(isAr ? 'رمز خاطئ' : 'Wrong code');
        }
      } finally {
        setSigningIn(false);
      }
    },
    [attempts, isAr, isLocked, signingIn]
  );

  const handleDigitPress = useCallback(
    (digit: string) => {
      if (signingIn || isLocked) return;
      setPinError('');
      setPinDigits((prev) => {
        if (prev.length >= 4) return prev;
        const next = `${prev}${digit}`;
        if (next.length === 4) {
          void submitPin(next);
        }
        return next;
      });
    },
    [isLocked, signingIn, submitPin]
  );

  const handleBackspace = useCallback(() => {
    if (signingIn || isLocked) return;
    setPinDigits((prev) => prev.slice(0, -1));
  }, [isLocked, signingIn]);

  const handleClearPin = useCallback(() => {
    if (signingIn || isLocked) return;
    setPinDigits('');
    setPinError('');
  }, [isLocked, signingIn]);

  useEffect(() => {
    if (!isOpen || isSignedIn) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleDigitPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleBackspace, handleDigitPress, isOpen, isSignedIn, onClose]);

  if (!isOpen) return null;

  const formatCountdown = (ms: number) => {
    const totalSec = Math.ceil(ms / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const notify = (msg: string) => {
    setErrorMsg('');
    setStatusMsg(msg);
    window.setTimeout(() => setStatusMsg(''), 3500);
  };

  const fail = (err: unknown) => {
    setStatusMsg('');
    setErrorMsg(err instanceof Error ? err.message : String(err));
  };

  const handleLogout = async () => {
    setBusy(true);
    try {
      await signOut(auth);
      setPinDigits('');
      setPinError('');
      onClose();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setProdNameEn('');
    setProdNameAr('');
    setProdCategory('Laptops');
    setProdPrice('');
    setProdStock('available');
    setProdImage('/src/assets/images/product_laptop_desktop_1795023857667.jpg');
    setProdDescEn('');
    setProdDescAr('');
    setProdVisible(true);
  };

  const handleEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setProdNameEn(p.nameEn);
    setProdNameAr(p.nameAr);
    setProdCategory(p.category);
    setProdPrice(String(p.priceUsd));
    setProdStock(p.stockStatus);
    setProdImage(p.imageUrl);
    setProdDescEn(p.descriptionEn ?? '');
    setProdDescAr(p.descriptionAr ?? '');
    setProdVisible(p.isVisible);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodNameEn.trim() || !prodNameAr.trim()) {
      fail(
        isAr
          ? 'يرجى إدخال اسم المنتج بالعربية والإنكليزية'
          : 'Please enter both English and Arabic product names.'
      );
      return;
    }
    setBusy(true);
    try {
      await saveProduct(
        {
          nameEn: prodNameEn,
          nameAr: prodNameAr,
          category: prodCategory,
          priceUsd: Number(prodPrice) || 0,
          stockStatus: prodStock,
          imageUrl: prodImage,
          descriptionEn: prodDescEn,
          descriptionAr: prodDescAr,
          isVisible: prodVisible,
        },
        editingProductId ?? undefined
      );
      resetProductForm();
      notify(isAr ? 'تم حفظ المنتج بنجاح' : 'Product saved.');
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const handleToggleStock = async (p: Product) => {
    setBusy(true);
    try {
      await saveProduct(
        {
          nameEn: p.nameEn,
          nameAr: p.nameAr,
          category: p.category,
          priceUsd: p.priceUsd,
          stockStatus: p.stockStatus === 'available' ? 'on_request' : 'available',
          imageUrl: p.imageUrl,
          descriptionEn: p.descriptionEn,
          descriptionAr: p.descriptionAr,
          isVisible: p.isVisible,
        },
        p.id
      );
      notify(isAr ? 'تم تحديث حالة التوفر' : 'Stock status updated.');
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const handleImageUpload = async (
    file: File | undefined,
    folder: 'products' | 'gallery',
    onUrl: (url: string) => void
  ) => {
    if (!file) return;
    setBusy(true);
    setErrorMsg('');
    try {
      const url = await uploadImageToFirebaseStorage(file, folder);
      onUrl(url);
      notify(isAr ? 'تم رفع الصورة بنجاح' : 'Image uploaded to storage.');
    } catch (err) {
      fail(
        err instanceof Error
          ? `Upload failed (${err.message}). You can paste an image URL directly.`
          : 'Upload failed'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!svcNameEn.trim() || !svcNameAr.trim()) {
      fail(isAr ? 'يرجى إدخال اسم الخدمة' : 'Please enter service names.');
      return;
    }
    setBusy(true);
    try {
      await savePrintingService(
        {
          nameEn: svcNameEn,
          nameAr: svcNameAr,
          unitEn: svcUnitEn,
          unitAr: svcUnitAr,
          startingPriceUsd: Number(svcPrice) || 0,
          descriptionEn: svcDescEn,
          descriptionAr: svcDescAr,
          sortOrder: Number(svcOrder) || 1,
          isVisible: true,
        },
        editingServiceId ?? undefined
      );
      setEditingServiceId(null);
      setSvcNameEn('');
      setSvcNameAr('');
      setSvcPrice('');
      setSvcDescEn('');
      setSvcDescAr('');
      notify(isAr ? 'تم حفظ خدمة الطباعة' : 'Printing service saved.');
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galTitleEn.trim() || !galTitleAr.trim() || !galImage.trim()) {
      fail(isAr ? 'يرجى تعبئة بيانات الصورة' : 'Please provide titles and an image.');
      return;
    }
    setBusy(true);
    try {
      await saveGalleryPhoto({
        titleEn: galTitleEn,
        titleAr: galTitleAr,
        imageUrl: galImage,
        sortOrder: Number(galOrder) || 1,
        isVisible: true,
      });
      setGalTitleEn('');
      setGalTitleAr('');
      notify(isAr ? 'تمت إضافة الصورة للمعرض' : 'Gallery photo added.');
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const handleSaveShopInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await saveShopInfo(infoForm);
      notify(isAr ? 'تم حفظ معلومات المحل' : 'Shop info updated.');
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[0-9]{4}$/.test(newPin)) {
      fail(isAr ? 'يجب أن يتكون الرمز من 4 أرقام' : 'Passcode must be 4 digits.');
      return;
    }
    setBusy(true);
    try {
      await updateShopPinPassword(newPin);
      setNewPin('');
      notify(isAr ? 'تم تحديث الرمز السري' : '4-digit passcode updated.');
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const handleSeedCloud = async () => {
    setBusy(true);
    try {
      await seedDefaultsToCloud();
      notify(isAr ? 'تمت مزامنة البيانات الأساسية' : 'Starter catalog & info synced.');
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  // Simple 4-digit PIN pad modal when not signed in
  if (!isSignedIn) {
    return (
      <div
        className="fixed inset-0 z-50 bg-[#1B2B1E]/75 backdrop-blur-sm flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Enter 4-Digit Code"
        onClick={onClose}
      >
        <div
          className="bg-white border border-[#245A2A]/15 rounded-2xl w-full max-w-xs p-6 shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3.5 end-3.5 w-9 h-9 rounded-lg text-[#1B2B1E]/60 hover:bg-[#F4F6F5] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center pt-1 pb-5">
            <div className="w-11 h-11 rounded-xl bg-[#5EE0A0]/25 text-[#245A2A] flex items-center justify-center mx-auto mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-[#1B2B1E]">
              {isAr ? 'أدخل الرمز المكون من 4 أرقام' : 'Enter 4-Digit Code'}
            </h2>
          </div>

          {/* 4-dot PIN indicator */}
          <div className="flex items-center justify-center gap-3.5 mb-4" dir="ltr">
            {[0, 1, 2, 3].map((slot) => {
              const filled = slot < pinDigits.length;
              return (
                <div
                  key={slot}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    filled
                      ? 'bg-[#245A2A] border-[#245A2A] scale-110'
                      : 'bg-[#F4F6F5] border-[#245A2A]/25'
                  }`}
                />
              );
            })}
          </div>

          {/* Error / Lockout Message */}
          <div className="min-h-[24px] text-center mb-3">
            {isLocked ? (
              <p className="text-xs font-semibold text-red-600 tabular-nums">
                {isAr
                  ? `تم القفل لمدة ${formatCountdown(remainingLockMs)}`
                  : `Too many attempts. Try again in ${formatCountdown(remainingLockMs)}`}
              </p>
            ) : pinError ? (
              <p className="text-xs font-semibold text-red-600">{pinError}</p>
            ) : signingIn ? (
              <p className="text-xs font-medium text-[#245A2A]">
                {isAr ? 'جارٍ التحقق...' : 'Checking...'}
              </p>
            ) : null}
          </div>

          {/* 4-Digit Keypad */}
          <div className="grid grid-cols-3 gap-2.5" dir="ltr">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                disabled={signingIn || isLocked}
                onClick={() => handleDigitPress(digit)}
                className="min-h-[52px] rounded-xl bg-[#F4F6F5] hover:bg-[#5EE0A0]/25 active:scale-[0.97] disabled:opacity-40 text-lg font-bold text-[#1B2B1E] tabular-nums transition-all"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              disabled={signingIn || isLocked}
              onClick={handleClearPin}
              className="min-h-[52px] rounded-xl bg-[#F4F6F5] hover:bg-slate-200/70 disabled:opacity-40 text-xs font-semibold text-[#1B2B1E]/75 transition-colors"
            >
              {isAr ? 'مسح' : 'Clear'}
            </button>
            <button
              type="button"
              disabled={signingIn || isLocked}
              onClick={() => handleDigitPress('0')}
              className="min-h-[52px] rounded-xl bg-[#F4F6F5] hover:bg-[#5EE0A0]/25 active:scale-[0.97] disabled:opacity-40 text-lg font-bold text-[#1B2B1E] tabular-nums transition-all"
            >
              0
            </button>
            <button
              type="button"
              disabled={signingIn || isLocked}
              onClick={handleBackspace}
              aria-label="Backspace"
              className="min-h-[52px] rounded-xl bg-[#F4F6F5] hover:bg-slate-200/70 disabled:opacity-40 text-[#1B2B1E]/75 flex items-center justify-center transition-colors"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Signed-in Management Console
  return (
    <div
      className="fixed inset-0 z-50 bg-[#1B2B1E]/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Store Management"
    >
      <div className="bg-white border border-[#245A2A]/15 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-[#F4F6F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#245A2A] text-[#5EE0A0] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1B2B1E]">
                {isAr ? 'إدارة كمبيوتر سنتر' : 'Store Management'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={handleLogout}
              className="min-h-[38px] px-3.5 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg inline-flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isAr ? 'تسجيل الخروج' : 'Logout'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close panel"
              className="w-9 h-9 rounded-lg text-[#1B2B1E]/70 hover:bg-slate-200/70 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* Status Banners */}
          {statusMsg && (
            <div className="mb-4 px-4 py-2.5 rounded-xl bg-[#5EE0A0]/20 border border-[#245A2A]/25 text-[#1B2B1E] text-xs sm:text-sm font-medium flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium">
              {errorMsg}
            </div>
          )}

          {!hasCloudProducts && (
            <div className="mb-5 p-4 rounded-xl bg-[#F4F6F5] border border-[#245A2A]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#1B2B1E]">
                  {isAr ? 'قاعدة البيانات السحابية فارغة حالياً' : 'Cloud Catalog Not Initialized Yet'}
                </p>
                <p className="text-xs text-[#1B2B1E]/70">
                  {isAr
                    ? 'اضغط هنا لرفع المنتجات وأسعار الطباعة الافتراضية لتتمكن من تعديلها.'
                    : 'Upload the starter products, printing rates, gallery, and shop info so you can edit them.'}
                </p>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={handleSeedCloud}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-[#245A2A] hover:bg-[#1C4721] text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Database className="w-4 h-4" />
                <span>{isAr ? 'تهيئة البيانات السحابية' : 'Initialize Cloud Data'}</span>
              </button>
            </div>
          )}

          {/* Sub-Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-5 border-b border-slate-200">
            {(
              [
                { id: 'products', label: isAr ? 'المنتجات' : 'Products' },
                { id: 'printing', label: isAr ? 'أسعار الطباعة' : 'Printing Rates' },
                { id: 'gallery', label: isAr ? 'معرض الصور' : 'Gallery' },
                { id: 'settings', label: isAr ? 'معلومات المحل والرمز' : 'Shop Info & PIN' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[38px] px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap shrink-0 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#245A2A] text-white'
                    : 'bg-[#F4F6F5] text-[#1B2B1E]/80 hover:bg-slate-200/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <form
                onSubmit={handleSaveProduct}
                className="bg-[#F4F6F5] border border-[#245A2A]/12 rounded-2xl p-4 sm:p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#1B2B1E]">
                    {editingProductId
                      ? isAr
                        ? 'تعديل المنتج'
                        : 'Edit Product'
                      : isAr
                        ? 'إضافة منتج جديد'
                        : 'Add New Product'}
                  </h3>
                  {editingProductId && (
                    <button
                      type="button"
                      onClick={resetProductForm}
                      className="text-xs font-medium text-[#1B2B1E]/70 hover:text-[#1B2B1E]"
                    >
                      {isAr ? 'إلغاء التعديل' : 'Cancel Edit'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={prodNameEn}
                    onChange={(e) => setProdNameEn(e.target.value)}
                    placeholder="Product Name (English)"
                    className="min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                    required
                  />
                  <input
                    type="text"
                    value={prodNameAr}
                    onChange={(e) => setProdNameAr(e.target.value)}
                    placeholder="اسم المنتج (عربي)"
                    dir="rtl"
                    className="min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                    required
                  />
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as ProductCategory)}
                    className="min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      placeholder="Price (USD)"
                      className="min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl tabular-nums"
                      required
                    />
                    <select
                      value={prodStock}
                      onChange={(e) => setProdStock(e.target.value as StockStatus)}
                      className="min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                    >
                      <option value="available">{isAr ? 'متوفر' : 'Available'}</option>
                      <option value="on_request">{isAr ? 'حسب الطلب' : 'On Request'}</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    value={prodDescEn}
                    onChange={(e) => setProdDescEn(e.target.value)}
                    placeholder="Short Description (English)"
                    className="min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                  />
                  <input
                    type="text"
                    value={prodDescAr}
                    onChange={(e) => setProdDescAr(e.target.value)}
                    placeholder="وصف مختصر (عربي)"
                    dir="rtl"
                    className="min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                  />
                </div>

                {/* Image Upload + URL */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <input
                    type="text"
                    value={prodImage}
                    onChange={(e) => setProdImage(e.target.value)}
                    placeholder="Image URL"
                    className="flex-1 min-h-[42px] px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                    required
                  />
                  <label className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-[#1B2B1E] inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0">
                    <Upload className="w-4 h-4 text-[#245A2A]" />
                    <span>{isAr ? 'رفع صورة' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleImageUpload(e.target.files?.[0], 'products', setProdImage)
                      }
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-[#1B2B1E] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodVisible}
                      onChange={(e) => setProdVisible(e.target.checked)}
                      className="rounded border-slate-300 text-[#245A2A]"
                    />
                    <span>{isAr ? 'إظهار في المتجر' : 'Visible in Storefront'}</span>
                  </label>
                  <button
                    type="submit"
                    disabled={busy}
                    className="min-h-[42px] px-5 py-2 rounded-xl bg-[#245A2A] hover:bg-[#1C4721] disabled:opacity-50 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>
                      {editingProductId
                        ? isAr
                          ? 'تحديث المنتج'
                          : 'Update Product'
                        : isAr
                          ? 'حفظ المنتج'
                          : 'Save Product'}
                    </span>
                  </button>
                </div>
              </form>

              {/* Product List */}
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-11 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        <SafeImage
                          src={p.imageUrl}
                          alt={p.nameEn}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#1B2B1E] truncate">
                          {isAr ? p.nameAr : p.nameEn}
                        </p>
                        <p className="text-xs text-[#1B2B1E]/60 tabular-nums">
                          {p.category} · ${p.priceUsd}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleToggleStock(p)}
                        className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold border ${
                          p.stockStatus === 'available'
                            ? 'bg-[#5EE0A0]/20 text-[#1B2B1E] border-[#245A2A]/30'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {p.stockStatus === 'available'
                          ? isAr
                            ? 'متوفر'
                            : 'Available'
                          : isAr
                            ? 'حسب الطلب'
                            : 'On Request'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditProduct(p)}
                        aria-label="Edit product"
                        className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-[#1B2B1E]"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={async () => {
                          setBusy(true);
                          try {
                            await removeProduct(p.id);
                            notify('Product deleted.');
                          } catch (err) {
                            fail(err);
                          } finally {
                            setBusy(false);
                          }
                        }}
                        aria-label="Delete product"
                        className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-red-50 flex items-center justify-center text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PRINTING SERVICES */}
          {activeTab === 'printing' && (
            <div className="space-y-6">
              <form
                onSubmit={handleSaveService}
                className="bg-[#F4F6F5] border border-[#245A2A]/12 rounded-2xl p-4 sm:p-5 space-y-3"
              >
                <h3 className="text-sm font-bold text-[#1B2B1E]">
                  {editingServiceId ? 'Edit Printing Service' : 'Add / Edit Printing Service'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={svcNameEn}
                    onChange={(e) => setSvcNameEn(e.target.value)}
                    placeholder="Service Name (EN)"
                    className="min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                    required
                  />
                  <input
                    type="text"
                    value={svcNameAr}
                    onChange={(e) => setSvcNameAr(e.target.value)}
                    placeholder="اسم الخدمة (AR)"
                    dir="rtl"
                    className="min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                    required
                  />
                  <input
                    type="text"
                    value={svcUnitEn}
                    onChange={(e) => setSvcUnitEn(e.target.value)}
                    placeholder="Unit EN (e.g. per m²)"
                    className="min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                    required
                  />
                  <input
                    type="text"
                    value={svcUnitAr}
                    onChange={(e) => setSvcUnitAr(e.target.value)}
                    placeholder="الوحدة AR (مثال: للمتر المربع)"
                    dir="rtl"
                    className="min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                    required
                  />
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={svcPrice}
                    onChange={(e) => setSvcPrice(e.target.value)}
                    placeholder="Starting Price (USD)"
                    className="min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl tabular-nums"
                    required
                  />
                  <input
                    type="number"
                    min="1"
                    value={svcOrder}
                    onChange={(e) => setSvcOrder(e.target.value)}
                    placeholder="Sort Order"
                    className="min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl tabular-nums"
                  />
                  <input
                    type="text"
                    value={svcDescEn}
                    onChange={(e) => setSvcDescEn(e.target.value)}
                    placeholder="Description (EN)"
                    className="min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                  />
                  <input
                    type="text"
                    value={svcDescAr}
                    onChange={(e) => setSvcDescAr(e.target.value)}
                    placeholder="الوصف (AR)"
                    dir="rtl"
                    className="min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  {editingServiceId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingServiceId(null);
                        setSvcNameEn('');
                        setSvcNameAr('');
                        setSvcPrice('');
                      }}
                      className="min-h-[40px] px-4 py-2 text-xs font-medium text-[#1B2B1E]/70"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={busy}
                    className="min-h-[40px] px-5 py-2 rounded-xl bg-[#245A2A] hover:bg-[#1C4721] text-white text-xs sm:text-sm font-semibold"
                  >
                    {editingServiceId ? 'Update Rate' : 'Save Service'}
                  </button>
                </div>
              </form>

              <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden">
                {printingServices.map((s) => (
                  <div key={s.id} className="p-3.5 bg-white flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#1B2B1E]">
                        {isAr ? s.nameAr : s.nameEn}
                      </p>
                      <p className="text-xs text-[#1B2B1E]/60 tabular-nums">
                        ${s.startingPriceUsd} · {isAr ? s.unitAr : s.unitEn}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingServiceId(s.id);
                          setSvcNameEn(s.nameEn);
                          setSvcNameAr(s.nameAr);
                          setSvcUnitEn(s.unitEn);
                          setSvcUnitAr(s.unitAr);
                          setSvcPrice(String(s.startingPriceUsd));
                          setSvcDescEn(s.descriptionEn ?? '');
                          setSvcDescAr(s.descriptionAr ?? '');
                          setSvcOrder(String(s.sortOrder));
                        }}
                        className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-[#1B2B1E]"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={async () => {
                          setBusy(true);
                          try {
                            await removePrintingService(s.id);
                            notify('Printing service deleted.');
                          } catch (err) {
                            fail(err);
                          } finally {
                            setBusy(false);
                          }
                        }}
                        className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-red-50 flex items-center justify-center text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <form
                onSubmit={handleAddGallery}
                className="bg-[#F4F6F5] border border-[#245A2A]/12 rounded-2xl p-4 sm:p-5 space-y-3"
              >
                <h3 className="text-sm font-bold text-[#1B2B1E]">
                  {isAr ? 'إضافة صورة للمعرض' : 'Add Gallery Photo'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={galTitleEn}
                    onChange={(e) => setGalTitleEn(e.target.value)}
                    placeholder="Caption (EN)"
                    className="min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                    required
                  />
                  <input
                    type="text"
                    value={galTitleAr}
                    onChange={(e) => setGalTitleAr(e.target.value)}
                    placeholder="العنوان (AR)"
                    dir="rtl"
                    className="min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                    required
                  />
                  <input
                    type="text"
                    value={galImage}
                    onChange={(e) => setGalImage(e.target.value)}
                    placeholder="Image URL"
                    className="min-h-[42px] px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                    required
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      value={galOrder}
                      onChange={(e) => setGalOrder(e.target.value)}
                      placeholder="Order"
                      className="w-24 min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl tabular-nums"
                    />
                    <label className="flex-1 min-h-[42px] px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-[#1B2B1E] inline-flex items-center justify-center gap-1.5 cursor-pointer">
                      <ImageIcon className="w-4 h-4 text-[#245A2A]" />
                      <span>{isAr ? 'رفع صورة' : 'Upload Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleImageUpload(e.target.files?.[0], 'gallery', setGalImage)
                        }
                      />
                    </label>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={busy}
                    className="min-h-[40px] px-5 py-2 rounded-xl bg-[#245A2A] hover:bg-[#1C4721] text-white text-xs sm:text-sm font-semibold"
                  >
                    {isAr ? 'إضافة للمعرض' : 'Add Photo'}
                  </button>
                </div>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {galleryPhotos.map((g) => (
                  <div
                    key={g.id}
                    className="border border-slate-200 rounded-2xl overflow-hidden bg-white flex items-center justify-between p-3 gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        <SafeImage
                          src={g.imageUrl}
                          alt={g.titleEn}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-sm font-medium text-[#1B2B1E] truncate">
                        {isAr ? g.titleAr : g.titleEn}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={async () => {
                        setBusy(true);
                        try {
                          await removeGalleryPhoto(g.id);
                          notify('Photo removed.');
                        } catch (err) {
                          fail(err);
                        } finally {
                          setBusy(false);
                        }
                      }}
                      className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-red-50 flex items-center justify-center text-red-600 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SHOP INFO & PASSCODE */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <form
                onSubmit={handleSaveShopInfo}
                className="bg-[#F4F6F5] border border-[#245A2A]/12 rounded-2xl p-4 sm:p-5 space-y-3"
              >
                <h3 className="text-sm font-bold text-[#1B2B1E]">
                  {isAr ? 'تحديث بيانات المحل' : 'Shop Contact & Hours'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#1B2B1E]/75 mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={infoForm.whatsappNumber}
                      onChange={(e) =>
                        setInfoForm({ ...infoForm, whatsappNumber: e.target.value })
                      }
                      className="w-full min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl tabular-nums"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1B2B1E]/75 mb-1">
                      Shop Phone
                    </label>
                    <input
                      type="text"
                      value={infoForm.landlinePhone}
                      onChange={(e) =>
                        setInfoForm({ ...infoForm, landlinePhone: e.target.value })
                      }
                      className="w-full min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl tabular-nums"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1B2B1E]/75 mb-1">
                      Opening Hours (EN)
                    </label>
                    <input
                      type="text"
                      value={infoForm.hoursEn}
                      onChange={(e) => setInfoForm({ ...infoForm, hoursEn: e.target.value })}
                      className="w-full min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1B2B1E]/75 mb-1">
                      Opening Hours (AR)
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={infoForm.hoursAr}
                      onChange={(e) => setInfoForm({ ...infoForm, hoursAr: e.target.value })}
                      className="w-full min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1B2B1E]/75 mb-1">
                      Address (EN)
                    </label>
                    <input
                      type="text"
                      value={infoForm.addressEn}
                      onChange={(e) => setInfoForm({ ...infoForm, addressEn: e.target.value })}
                      className="w-full min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1B2B1E]/75 mb-1">
                      Address (AR)
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={infoForm.addressAr}
                      onChange={(e) => setInfoForm({ ...infoForm, addressAr: e.target.value })}
                      className="w-full min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1B2B1E]/75 mb-1">
                      Internet Providers Note (EN)
                    </label>
                    <input
                      type="text"
                      value={infoForm.ispProvidersEn ?? ''}
                      onChange={(e) =>
                        setInfoForm({ ...infoForm, ispProvidersEn: e.target.value })
                      }
                      className="w-full min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1B2B1E]/75 mb-1">
                      Internet Providers Note (AR)
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={infoForm.ispProvidersAr ?? ''}
                      onChange={(e) =>
                        setInfoForm({ ...infoForm, ispProvidersAr: e.target.value })
                      }
                      className="w-full min-h-[42px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={busy}
                    className="min-h-[42px] px-5 py-2 rounded-xl bg-[#245A2A] hover:bg-[#1C4721] text-white text-xs sm:text-sm font-semibold"
                  >
                    {isAr ? 'حفظ معلومات المحل' : 'Save Shop Info'}
                  </button>
                </div>
              </form>

              <form
                onSubmit={handleUpdatePin}
                className="bg-[#F4F6F5] border border-[#245A2A]/12 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3"
              >
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[#1B2B1E] mb-1">
                    {isAr ? 'تغيير رمز الدخول (4 أرقام)' : 'Change 4-Digit Code'}
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="New 4-digit code"
                    className="w-full sm:w-48 min-h-[42px] px-3 py-2 text-sm font-mono bg-white border border-slate-200 rounded-xl"
                  />
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="min-h-[42px] px-5 py-2 rounded-xl border border-[#245A2A]/25 bg-white hover:bg-slate-100 text-[#1B2B1E] text-xs sm:text-sm font-semibold"
                >
                  {isAr ? 'تحديث الرمز' : 'Update Code'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
