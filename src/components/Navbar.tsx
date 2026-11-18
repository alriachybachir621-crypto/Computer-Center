import React from 'react';
import { Droplets, Home, Laptop, Phone, Printer } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { BrandMark } from './BrandMark';

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
  onOpenAdmin: () => void;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  onOpenAdmin,
  activeSection,
  onNavigate,
}) => {
  const t = TRANSLATIONS[lang];

  const desktopLinks = [
    { id: 'home', label: t.nav.home },
    { id: 'products', label: t.nav.products },
    { id: 'ink-finder', label: t.nav.inkFinder },
    { id: 'printing', label: t.nav.printing },
    { id: 'contact', label: t.nav.contact },
  ];

  const mobileTabs = [
    { id: 'home', label: t.mobileNav.home, icon: Home },
    { id: 'products', label: t.mobileNav.products, icon: Laptop },
    { id: 'ink-finder', label: t.mobileNav.ink, icon: Droplets },
    { id: 'printing', label: t.mobileNav.print, icon: Printer },
    { id: 'contact', label: t.mobileNav.contact, icon: Phone },
  ];

  return (
    <>
      {/* Desktop & Mobile Top Header (3-Zone Top Bar Contract) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#245A2A]/12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 sm:h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Title */}
          <BrandMark label={t.brandName} onSecretTrigger={onOpenAdmin} size="sm" />

          {/* Zone 2: Clean Single-Line Text Navigation */}
          <nav
            className="hidden md:flex items-center gap-6 text-sm font-medium text-[#1B2B1E]/75"
            aria-label="Primary Navigation"
          >
            {desktopLinks.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(item.id);
                  }}
                  className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors duration-150 ${
                    isActive
                      ? 'border-[#245A2A] text-[#1B2B1E] font-semibold'
                      : 'border-transparent hover:text-[#245A2A] hover:border-[#5EE0A0]'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Header Action (Bilingual Toggle) */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onToggleLang}
              className="min-h-[40px] px-4 py-1.5 text-xs sm:text-sm font-semibold text-white bg-[#245A2A] hover:bg-[#1C4721] active:scale-[0.98] rounded-xl transition-all whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#245A2A] focus-visible:ring-offset-2"
              aria-label={lang === 'en' ? 'Switch to Arabic' : 'Switch to English'}
            >
              {t.langToggle}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Thumb Navigation Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#245A2A]/15"
        aria-label="Mobile Navigation"
      >
        <div className="grid grid-cols-5 h-14">
          {mobileTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onNavigate(tab.id)}
                className={`flex flex-col items-center justify-center min-h-[44px] gap-0.5 transition-colors ${
                  isActive ? 'text-[#245A2A] font-semibold' : 'text-[#1B2B1E]/60 hover:text-[#1B2B1E]'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 1.75} />
                <span className="text-[10px] leading-tight whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
