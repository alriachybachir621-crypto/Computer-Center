import React, { useEffect, useState } from 'react';
import { User, signInWithPopup, signOut } from 'firebase/auth';
import {
  Check,
  Database,
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
import { auth, BOOTSTRAPPED_ADMIN_EMAIL, googleProvider } from '../lib/firebase';
import {
  getAdminPin,
  removeGalleryPhoto,
  removePrintingService,
  removeProduct,
  saveGalleryPhoto,
  savePrintingService,
  saveProduct,
  saveShopInfo,
  seedDefaultsToCloud,
  updateAdminPin,
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

type AdminTab = 'products' | 'printing' | 'gallery' | 'settings';

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
  const [pinInput, setPinInput] = useState('');
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [expectedPin, setExpectedPin] = useState('0880');
  const [pinError, setPinError] = useState('');

  const [activeTab, setActiveTab] = useState<AdminTab>('products');
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
  const [prodImage, setProdImage] = useState('/src/assets/images/product_laptop_desktop_1795023857667.jpg');
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
  const [galImage, setGalImage] = useState('/src/assets/images/hero_shop_showcase_1795023856613.jpg');
  const [galOrder, setGalOrder] = useState('1');

  // Shop Info & PIN Form State
  const [infoForm, setInfoForm] = useState<ShopInfo>(shopInfo);
  const [newPin, setNewPin] = useState('');

  useEffect(() => {
    setInfoForm(shopInfo);
  }, [shopInfo]);

  const isAuthorizedAdmin =
    Boolean(user) &&
    user?.emailVerified === true &&
    user?.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    if (isAuthorizedAdmin) {
      getAdminPin()
        .then((pin) => setExpectedPin(pin))
        .catch(() => {
          // Fallback to default pin if doc not yet initialized
        });
    }
  }, [isAuthorizedAdmin]);

  if (!isOpen) return null;

  const notify = (msg: string) => {
    setErrorMsg('');
    setStatusMsg(msg);
    window.setTimeout(() => setStatusMsg(''), 3500);
  };

  const fail = (err: unknown) => {
    setStatusMsg('');
    setErrorMsg(err instanceof Error ? err.message : String(err));
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === expectedPin) {
      setPinError('');
      setPinUnlocked(true);
    } else {
      setPinError(isAr ? 'الرمز السري غير صحيح' : 'Incorrect 4-digit passcode');
    }
  };

  const handleGoogleSignIn = async () => {
    setBusy(true);
    setErrorMsg('');
    try {
      await signInWithPopup(auth, googleProvider);
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
      fail(isAr ? 'يرجى إدخال اسم المنتج بالعربية والإنكليزية' : 'Please enter both English and Arabic product names.');
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
      notify(isAr ? 'تم حفظ المنتج بنجاح' : 'Product saved to Firestore.');
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
      notify(isAr ? 'تم رفع الصورة بنجاح' : 'Image uploaded to Firebase Storage.');
    } catch (err) {
      fail(
        err instanceof Error
          ? `Firebase Storage upload failed (${err.message}). You can paste an image URL directly.`
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
      await updateAdminPin(newPin);
      setExpectedPin(newPin);
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
      notify(isAr ? 'تمت مزامنة البيانات الأساسية إلى السحابة' : 'Starter catalog & info synced to Firestore.');
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Shop Admin Panel"
    >
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#245A2A] text-[#5EE0A0] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isAr ? 'لوحة إدارة كمبيوتر سنتر' : 'Computer Center Admin'}
              </h2>
              <p className="text-xs text-slate-500">
                {isAuthorizedAdmin ? user?.email : isAr ? 'منطقة محمية' : 'Protected Management Console'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <button
                type="button"
                onClick={() => signOut(auth)}
                className="min-h-[36px] px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200/60 rounded-lg inline-flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isAr ? 'خروج' : 'Sign Out'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close admin panel"
              className="w-9 h-9 rounded-lg text-slate-600 hover:bg-slate-200/70 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {!pinUnlocked ? (
            <form onSubmit={handlePinSubmit} className="max-w-xs mx-auto py-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#5EE0A0]/25 text-[#245A2A] flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {isAr ? 'أدخل الرمز السري (4 أرقام)' : 'Enter 4-Digit Passcode'}
              </h3>
              <p className="text-xs text-slate-500 mb-5">
                {isAr ? 'الرمز الافتراضي: 0880' : 'Default shop passcode: 0880'}
              </p>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4));
                  setPinError('');
                }}
                placeholder="••••"
                className="w-full text-center tracking-[0.6em] text-2xl font-mono font-bold min-h-[52px] px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#245A2A] mb-3"
                autoFocus
              />
              {pinError && <p className="text-xs text-red-600 font-medium mb-3">{pinError}</p>}
              <button
                type="submit"
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#245A2A] hover:bg-[#1C4721] text-white text-sm font-semibold"
              >
                {isAr ? 'فتح' : 'Unlock'}
              </button>
            </form>
          ) : !isAuthorizedAdmin ? (
            <div className="max-w-md mx-auto py-8 text-center">
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {isAr ? 'تسجيل دخول المدير' : 'Verify Admin Google Account'}
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                {isAr
                  ? `للتعديل على قاعدة البيانات السحابية، يرجى تسجيل الدخول بحساب المدير (${BOOTSTRAPPED_ADMIN_EMAIL}).`
                  : `To modify Firestore products, pricing, and Firebase Storage images, sign in with the authorized admin account (${BOOTSTRAPPED_ADMIN_EMAIL}).`}
              </p>
              {user && !isAuthorizedAdmin && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                  Signed in as {user.email}, which is not an authorized admin account.
                </p>
              )}
              {errorMsg && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                  {errorMsg}
                </p>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={handleGoogleSignIn}
                className="min-h-[46px] px-6 py-2.5 rounded-xl bg-[#245A2A] hover:bg-[#1C4721] disabled:opacity-50 text-white text-sm font-semibold"
              >
                {isAr ? 'تسجيل الدخول عبر Google' : 'Sign in with Google'}
              </button>
            </div>
          ) : (
            <div>
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
                <div className="mb-5 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {isAr ? 'قاعدة البيانات السحابية فارغة حالياً' : 'Cloud Firestore Catalog Not Initialized Yet'}
                    </p>
                    <p className="text-xs text-slate-600">
                      {isAr
                        ? 'اضغط هنا لرفع المنتجات وأسعار الطباعة الافتراضية إلى Firebase لتتمكن من تعديلها.'
                        : 'Upload the starter products, printing rates, gallery, and shop info into Firestore so you can edit them.'}
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

              {/* Admin Sub-Navigation */}
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
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900">
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
                          className="text-xs font-medium text-slate-600 hover:text-slate-900"
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
                      <label className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-800 inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0">
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
                      <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
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
                            <SafeImage src={p.imageUrl} alt={p.nameEn} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {isAr ? p.nameAr : p.nameEn}
                            </p>
                            <p className="text-xs text-slate-500 tabular-nums">
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
                            className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700"
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
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3"
                  >
                    <h3 className="text-sm font-bold text-slate-900">
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
                          className="min-h-[40px] px-4 py-2 text-xs font-medium text-slate-600"
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
                          <p className="text-sm font-semibold text-slate-900">
                            {isAr ? s.nameAr : s.nameEn}
                          </p>
                          <p className="text-xs text-slate-500 tabular-nums">
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
                            className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700"
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
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3"
                  >
                    <h3 className="text-sm font-bold text-slate-900">
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
                        <label className="flex-1 min-h-[42px] px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-800 inline-flex items-center justify-center gap-1.5 cursor-pointer">
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
                            <SafeImage src={g.imageUrl} alt={g.titleEn} className="w-full h-full object-cover" />
                          </div>
                          <p className="text-sm font-medium text-slate-900 truncate">
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

              {/* TAB 4: SHOP INFO & PIN */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <form
                    onSubmit={handleSaveShopInfo}
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3"
                  >
                    <h3 className="text-sm font-bold text-slate-900">
                      {isAr ? 'تحديث بيانات المحل' : 'Shop Contact & Hours'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
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
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Landline Phone
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
                        <label className="block text-xs font-medium text-slate-600 mb-1">
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
                        <label className="block text-xs font-medium text-slate-600 mb-1">
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
                        <label className="block text-xs font-medium text-slate-600 mb-1">
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
                        <label className="block text-xs font-medium text-slate-600 mb-1">
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
                        <label className="block text-xs font-medium text-slate-600 mb-1">
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
                        <label className="block text-xs font-medium text-slate-600 mb-1">
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
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3"
                  >
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isAr ? 'تغيير رمز الدخول السري (4 أرقام)' : 'Change 4-Digit Admin Passcode'}
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
                      className="min-h-[42px] px-5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-900 text-xs sm:text-sm font-semibold"
                    >
                      {isAr ? 'تحديث الرمز' : 'Update Passcode'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
