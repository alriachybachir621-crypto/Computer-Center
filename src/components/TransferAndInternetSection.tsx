import React from 'react';
import { Banknote, Check, MessageCircle, Wifi } from 'lucide-react';
import { Language, ShopInfo } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { openWhatsApp } from '../lib/whatsapp';

interface TransferAndInternetSectionProps {
  lang: Language;
  shopInfo: ShopInfo;
}

export const TransferAndInternetSection: React.FC<TransferAndInternetSectionProps> = ({
  lang,
  shopInfo,
}) => {
  const t = TRANSLATIONS[lang];
  const transferNote = lang === 'ar' ? shopInfo.transferNoteAr : shopInfo.transferNoteEn;
  const ispNote = lang === 'ar' ? shopInfo.ispProvidersAr : shopInfo.ispProvidersEn;

  return (
    <section id="services-info" className="py-16 sm:py-20 bg-[#F4F6F5] border-b border-[#245A2A]/12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2B1E] tracking-tight mb-2">
            {t.transferInternet.heading}
          </h2>
          <p className="text-sm sm:text-base text-[#1B2B1E]/70 max-w-2xl">
            {t.transferInternet.subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* OMT & Western Union */}
          <div className="bg-gradient-to-br from-white to-[#5EE0A0]/[0.07] border border-[#245A2A]/12 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#5EE0A0]/25 text-[#245A2A] flex items-center justify-center shrink-0">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1B2B1E]">
                    {t.transferInternet.transferTitle}
                  </h3>
                  <p className="text-xs font-medium text-[#1B2B1E]/60">
                    {t.transferInternet.transferSubtitle}
                  </p>
                </div>
              </div>

              <ul className="space-y-2.5 mb-5">
                {t.transferInternet.transferBullets.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[#1B2B1E]/85">
                    <Check className="w-4 h-4 text-[#245A2A] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {transferNote && (
                <p className="text-xs text-[#1B2B1E]/75 bg-[#F4F6F5] border border-[#245A2A]/12 rounded-xl p-3.5 mb-5">
                  {transferNote}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                openWhatsApp(
                  shopInfo.whatsappNumber,
                  lang === 'ar'
                    ? 'مرحباً كمبيوتر سنتر، أود الاستفسار عن خدمات OMT / ويسترن يونيون.'
                    : 'Hello Computer Center, I would like to ask about OMT / Western Union services.'
                )
              }
              className="min-h-[44px] px-5 py-2.5 rounded-xl border border-[#245A2A]/25 bg-white hover:bg-[#5EE0A0]/15 text-[#1B2B1E] text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors w-full sm:w-auto self-start"
            >
              <MessageCircle className="w-4 h-4 text-[#245A2A]" />
              <span>{t.transferInternet.transferCta}</span>
            </button>
          </div>

          {/* Internet Subscriptions */}
          <div className="bg-gradient-to-br from-white to-[#5EE0A0]/[0.07] border border-[#245A2A]/12 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#5EE0A0]/25 text-[#245A2A] flex items-center justify-center shrink-0">
                  <Wifi className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1B2B1E]">
                    {t.transferInternet.internetTitle}
                  </h3>
                  <p className="text-xs font-medium text-[#1B2B1E]/60">
                    {t.transferInternet.internetSubtitle}
                  </p>
                </div>
              </div>

              <ul className="space-y-2.5 mb-5">
                {t.transferInternet.internetBullets.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[#1B2B1E]/85">
                    <Check className="w-4 h-4 text-[#245A2A] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {ispNote && (
                <p className="text-xs text-[#1B2B1E]/75 bg-[#F4F6F5] border border-[#245A2A]/12 rounded-xl p-3.5 mb-5">
                  {ispNote}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                openWhatsApp(
                  shopInfo.whatsappNumber,
                  lang === 'ar'
                    ? 'مرحباً كمبيوتر سنتر، أود الاستفسار عن اشتراكات الإنترنت والتغطية في منطقتي.'
                    : 'Hello Computer Center, I would like to inquire about internet subscriptions and coverage.'
                )
              }
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#245A2A] hover:bg-[#1C4721] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors w-full sm:w-auto self-start"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t.transferInternet.internetCta}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
