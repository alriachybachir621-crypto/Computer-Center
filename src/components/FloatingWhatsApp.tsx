import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Language, ShopInfo } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { openWhatsApp } from '../lib/whatsapp';

interface FloatingWhatsAppProps {
  lang: Language;
  shopInfo: ShopInfo;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ lang, shopInfo }) => {
  const t = TRANSLATIONS[lang];

  return (
    <button
      type="button"
      onClick={() => openWhatsApp(shopInfo.whatsappNumber, t.whatsappGeneralGreeting)}
      aria-label={t.floatingWhatsapp}
      className="fixed bottom-18 end-4 md:bottom-6 md:end-6 z-40 min-h-[48px] px-4 py-3 rounded-full bg-[#245A2A] hover:bg-[#1C4721] active:scale-[0.97] text-white border border-[#5EE0A0]/40 shadow-lg shadow-[#1B2B1E]/25 inline-flex items-center gap-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#245A2A] focus-visible:ring-offset-2"
    >
      <MessageCircle className="w-5 h-5 text-[#5EE0A0] shrink-0" />
      <span className="hidden sm:inline text-sm font-semibold whitespace-nowrap">
        {t.floatingWhatsapp}
      </span>
    </button>
  );
};
