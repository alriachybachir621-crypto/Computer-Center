import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  DEFAULT_GALLERY_PHOTOS,
  DEFAULT_PRINTING_SERVICES,
  DEFAULT_PRODUCTS,
  DEFAULT_SHOP_INFO,
} from './data/defaults';
import { GalleryPhoto, Language, PrintingService, Product, ShopInfo } from './types';
import { auth, BOOTSTRAPPED_ADMIN_EMAIL } from './lib/firebase';
import {
  subscribeGalleryPhotos,
  subscribePrintingServices,
  subscribeProducts,
  subscribeShopInfo,
} from './lib/storefrontService';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { HeroAndServices } from './components/HeroAndServices';
import { ProductsSection } from './components/ProductsSection';
import { InkFinderSection } from './components/InkFinderSection';
import { PrintingSection } from './components/PrintingSection';
import { TransferAndInternetSection } from './components/TransferAndInternetSection';
import { GallerySection } from './components/GallerySection';
import { ContactFooter } from './components/ContactFooter';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { AdminPanelModal } from './components/AdminPanelModal';

function StorefrontApp() {
  const [lang, setLang] = useState<Language>('en');
  const [activeSection, setActiveSection] = useState<string>('home');
  const [adminOpen, setAdminOpen] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [cloudProducts, setCloudProducts] = useState<Product[]>([]);
  const [cloudServices, setCloudServices] = useState<PrintingService[]>([]);
  const [cloudGallery, setCloudGallery] = useState<GalleryPhoto[]>([]);
  const [cloudShopInfo, setCloudShopInfo] = useState<ShopInfo | null>(null);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const isBootstrappedAdmin =
    authReady &&
    Boolean(user) &&
    user?.emailVerified === true &&
    user?.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    const unsubProducts = subscribeProducts(isBootstrappedAdmin, setCloudProducts, () => {});
    const unsubServices = subscribePrintingServices(isBootstrappedAdmin, setCloudServices, () => {});
    const unsubGallery = subscribeGalleryPhotos(isBootstrappedAdmin, setCloudGallery, () => {});
    const unsubInfo = subscribeShopInfo(setCloudShopInfo, () => {});

    return () => {
      unsubProducts();
      unsubServices();
      unsubGallery();
      unsubInfo();
    };
  }, [isBootstrappedAdmin]);

  const products = cloudProducts.length > 0 ? cloudProducts : DEFAULT_PRODUCTS;
  const printingServices =
    cloudServices.length > 0 ? cloudServices : DEFAULT_PRINTING_SERVICES;
  const galleryPhotos = cloudGallery.length > 0 ? cloudGallery : DEFAULT_GALLERY_PHOTOS;
  const shopInfo = cloudShopInfo ?? DEFAULT_SHOP_INFO;

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F5] text-[#1B2B1E]">
      <Navbar
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === 'en' ? 'ar' : 'en'))}
        onOpenAdmin={() => setAdminOpen(true)}
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      <main className="flex-1">
        <HeroAndServices
          lang={lang}
          shopInfo={shopInfo}
          onNavigate={handleNavigate}
          onOpenAdmin={() => setAdminOpen(true)}
        />
        <ProductsSection lang={lang} products={products} shopInfo={shopInfo} />
        <InkFinderSection lang={lang} shopInfo={shopInfo} />
        <PrintingSection lang={lang} services={printingServices} shopInfo={shopInfo} />
        <TransferAndInternetSection lang={lang} shopInfo={shopInfo} />
        <GallerySection lang={lang} photos={galleryPhotos} />
      </main>

      <ContactFooter
        lang={lang}
        shopInfo={shopInfo}
        onOpenAdmin={() => setAdminOpen(true)}
      />

      <FloatingWhatsApp lang={lang} shopInfo={shopInfo} />

      <AdminPanelModal
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        lang={lang}
        user={user}
        products={products}
        printingServices={printingServices}
        galleryPhotos={galleryPhotos}
        shopInfo={shopInfo}
        hasCloudProducts={cloudProducts.length > 0}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <StorefrontApp />
    </ErrorBoundary>
  );
}
