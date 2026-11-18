import React from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Award,
  Banknote,
  Car,
  Laptop,
  MessageCircle,
  Printer,
  Smartphone,
  Wifi,
  Layers,
} from 'lucide-react';
import { Language, ShopInfo } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { openWhatsApp } from '../lib/whatsapp';
import { BrandMark } from './BrandMark';
import { SafeImage } from './SafeImage';

interface HeroAndServicesProps {
  lang: Language;
  shopInfo: ShopInfo;
  onNavigate: (sectionId: string) => void;
  onOpenAdmin: () => void;
}

export const HeroAndServices: React.FC<HeroAndServicesProps> = ({
  lang,
  shopInfo,
  onNavigate,
  onOpenAdmin,
}) => {
  const t = TRANSLATIONS[lang];
  const isRtl = lang === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const serviceIcons = [Laptop, Printer, Layers, Smartphone, Banknote, Wifi];

  return (
    <section id="home" className="border-b border-[#245A2A]/12">
      {/* Split Hero with Logo Soft Light-Gray & Mint Wave Texture */}
      <div className="hero-mint-texture relative overflow-hidden">
        {/* Subtle curved line motif echoing the logo background */}
        <svg
          aria-hidden="true"
          viewBox="0 0 800 400"
          fill="none"
          className="pointer-events-none absolute -bottom-16 -end-16 w-[520px] h-[260px] opacity-45"
        >
          <path
            d="M40 360 C220 280, 420 120, 780 60"
            stroke="#5EE0A0"
            strokeWidth="2"
          />
          <path
            d="M80 390 C270 300, 460 150, 790 105"
            stroke="#FFFFFF"
            strokeWidth="2"
          />
          <path
            d="M140 400 C330 320, 520 190, 800 150"
            stroke="#5EE0A0"
            strokeWidth="1.5"
          />
        </svg>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-14 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <div className="mb-5 flex items-center gap-4">
                <BrandMark
                  label={t.brandName}
                  onSecretTrigger={onOpenAdmin}
                  size="lg"
                  showWordmark={false}
                />
                <div className="space-y-1">
                  <p className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#245A2A]">
                    <Award className="w-4 h-4 shrink-0" />
                    <span>{t.hero.since1998}</span>
                  </p>
                  <p className="text-xs sm:text-sm text-[#1B2B1E]/75">{t.hero.locationLine}</p>
                </div>
              </div>

              <h1
                className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-[#1B2B1E] leading-[1.15] mb-4"
                style={{ textWrap: 'balance' }}
              >
                {t.hero.headline}
              </h1>
              <p className="text-base text-[#1B2B1E]/80 leading-relaxed max-w-xl mb-6">
                {t.hero.subheadline}
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-5">
                <button
                  type="button"
                  onClick={() => onNavigate('products')}
                  className="min-h-[44px] px-6 py-3 rounded-xl bg-[#245A2A] hover:bg-[#1C4721] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#245A2A] focus-visible:ring-offset-2"
                >
                  <span>{t.hero.primaryCta}</span>
                  <ArrowIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => openWhatsApp(shopInfo.whatsappNumber, t.whatsappGeneralGreeting)}
                  className="min-h-[44px] px-5 py-3 rounded-xl border border-[#245A2A]/25 bg-white/90 hover:bg-white text-[#1B2B1E] text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#245A2A]"
                >
                  <MessageCircle className="w-4 h-4 text-[#245A2A]" />
                  <span>{t.hero.secondaryCta}</span>
                </button>
              </div>

              <p className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#245A2A]">
                <Car className="w-4 h-4 shrink-0" />
                <span>{t.hero.curbsideNote}</span>
              </p>
            </div>

            <div className="lg:col-span-6">
              <div className="h-64 sm:h-80 lg:h-full min-h-[310px] rounded-2xl overflow-hidden border border-[#245A2A]/15 bg-white shadow-sm">
                <SafeImage
                  src="/src/assets/images/hero_shop_showcase_1795023856613.jpg"
                  alt={t.brandName}
                  fallbackTitle={t.brandName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Service Cards */}
      <div className="bg-[#F4F6F5] border-t border-[#245A2A]/10 py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2B1E] tracking-tight mb-2">
              {t.services.heading}
            </h2>
            <p className="text-sm sm:text-base text-[#1B2B1E]/70 max-w-2xl">
              {t.services.subheading}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.services.items.map((service, index) => {
              const Icon = serviceIcons[index] || Laptop;
              const targetId = service.target.replace('#', '');

              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => onNavigate(targetId)}
                  className="group text-start bg-gradient-to-br from-white to-[#5EE0A0]/[0.07] border border-[#245A2A]/12 hover:border-[#245A2A]/45 rounded-2xl p-6 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm flex flex-col justify-between min-h-[152px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#245A2A]"
                >
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-[#5EE0A0]/25 text-[#245A2A] flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" strokeWidth={1.9} />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-[#1B2B1E] mb-1.5 group-hover:text-[#245A2A] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-sm text-[#1B2B1E]/70 leading-relaxed">{service.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
