import React from 'react';
import { Award, Car, Clock, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Language, ShopInfo } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { openWhatsApp } from '../lib/whatsapp';
import { BrandMark } from './BrandMark';

interface ContactFooterProps {
  lang: Language;
  shopInfo: ShopInfo;
  onOpenAdmin: () => void;
}

export const ContactFooter: React.FC<ContactFooterProps> = ({
  lang,
  shopInfo,
  onOpenAdmin,
}) => {
  const t = TRANSLATIONS[lang];
  const hours = lang === 'ar' ? shopInfo.hoursAr : shopInfo.hoursEn;
  const address = lang === 'ar' ? shopInfo.addressAr : shopInfo.addressEn;
  const telHref = `tel:+961${shopInfo.landlinePhone.replace(/[^\d]/g, '').replace(/^0/, '')}`;

  return (
    <footer id="contact" className="bg-[#1B2B1E] text-[#F4F6F5] pt-16 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
          {/* Contact Details */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-[#245A2A]/25 border border-[#5EE0A0]/20 rounded-2xl p-6 sm:p-8">
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <BrandMark
                  label={t.brandName}
                  onSecretTrigger={onOpenAdmin}
                  size="md"
                  tone="dark"
                />
              </div>

              <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5EE0A0] mb-2">
                <Award className="w-4 h-4 shrink-0" />
                <span>{t.contact.since1998}</span>
              </p>

              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
                {t.contact.heading}
              </h2>
              <p className="text-sm text-[#F4F6F5]/80 leading-relaxed mb-6">
                {t.contact.subheading}
              </p>

              <dl className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#5EE0A0] shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-xs font-medium text-[#5EE0A0]/85">
                      {t.contact.addressLabel}
                    </dt>
                    <dd className="text-white mt-0.5">{address}</dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#5EE0A0] shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-xs font-medium text-[#5EE0A0]/85">
                      {t.contact.hoursLabel}
                    </dt>
                    <dd className="text-white mt-0.5">{hours}</dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#5EE0A0] shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-xs font-medium text-[#5EE0A0]/85">
                      {t.contact.phoneLabel}
                    </dt>
                    <dd className="text-white mt-0.5 tabular-nums" dir="ltr">
                      <a href={telHref} className="hover:text-[#5EE0A0] transition-colors">
                        {shopInfo.landlinePhone}
                      </a>
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-[#5EE0A0] shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-xs font-medium text-[#5EE0A0]/85">
                      {t.contact.whatsappLabel}
                    </dt>
                    <dd className="text-white mt-0.5 tabular-nums" dir="ltr">
                      {shopInfo.whatsappNumber}
                    </dd>
                  </div>
                </div>
              </dl>

              <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-[#1B2B1E]/60 border border-[#5EE0A0]/25 p-3.5 text-xs text-[#F4F6F5]/90 leading-relaxed">
                <Car className="w-4 h-4 text-[#5EE0A0] shrink-0 mt-0.5" />
                <span>{t.contact.curbsideNote}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                onClick={() => openWhatsApp(shopInfo.whatsappNumber, t.whatsappGeneralGreeting)}
                className="min-h-[46px] px-4 py-2.5 rounded-xl bg-[#5EE0A0] hover:bg-[#4BD390] text-[#1B2B1E] text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t.contact.whatsappBtn}</span>
              </button>
              <a
                href={telHref}
                className="min-h-[46px] px-4 py-2.5 rounded-xl border border-[#5EE0A0]/35 hover:border-[#5EE0A0] bg-[#1B2B1E]/60 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4 text-[#5EE0A0]" />
                <span>{t.contact.callBtn}</span>
              </a>
            </div>
          </div>

          {/* Google Maps Embed — Hraoui Bldg, Ksara Main Road, Zahle */}
          <div className="lg:col-span-7 min-h-[300px] lg:min-h-[380px] rounded-2xl overflow-hidden border border-[#5EE0A0]/20 bg-[#1B2B1E]">
            <iframe
              title={t.contact.mapTitle}
              src="https://maps.google.com/maps?q=Hraoui%20Bldg%20Ksara%20Main%20Road%20Zahle%20Lebanon&t=&z=16&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full min-h-[300px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>

        <div className="pt-6 border-t border-[#5EE0A0]/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#F4F6F5]/65">
          <p>{t.contact.copyright}</p>
          <p className="tabular-nums" dir="ltr">
            {shopInfo.landlinePhone} · {shopInfo.whatsappNumber}
          </p>
        </div>
      </div>
    </footer>
  );
};
