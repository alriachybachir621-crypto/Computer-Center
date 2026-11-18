import React, { useEffect, useState } from 'react';
import { MessageCircle, Printer } from 'lucide-react';
import { Language, PrintingService, ShopInfo } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { openWhatsApp } from '../lib/whatsapp';

interface PrintingSectionProps {
  lang: Language;
  services: PrintingService[];
  shopInfo: ShopInfo;
}

export const PrintingSection: React.FC<PrintingSectionProps> = ({
  lang,
  services,
  shopInfo,
}) => {
  const t = TRANSLATIONS[lang];
  const visibleServices = services.filter((s) => s.isVisible);

  const [name, setName] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    visibleServices[0]?.id ?? ''
  );
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (
      visibleServices.length > 0 &&
      !visibleServices.some((s) => s.id === selectedServiceId)
    ) {
      setSelectedServiceId(visibleServices[0].id);
    }
  }, [visibleServices, selectedServiceId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chosen = visibleServices.find((s) => s.id === selectedServiceId);
    if (!name.trim() || !chosen) {
      setError(t.printing.formError);
      return;
    }
    setError('');
    const serviceName = lang === 'ar' ? chosen.nameAr : chosen.nameEn;
    openWhatsApp(
      shopInfo.whatsappNumber,
      t.printing.whatsappTemplate(
        name.trim(),
        serviceName,
        size.trim(),
        quantity.trim(),
        notes.trim()
      )
    );
  };

  return (
    <section id="printing" className="py-16 sm:py-20 bg-white border-b border-[#245A2A]/12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2B1E] tracking-tight mb-2">
            {t.printing.heading}
          </h2>
          <p className="text-sm sm:text-base text-[#1B2B1E]/70 max-w-2xl">
            {t.printing.subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Services & Starting Rates */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {visibleServices.map((service) => {
              const title = lang === 'ar' ? service.nameAr : service.nameEn;
              const unit = lang === 'ar' ? service.unitAr : service.unitEn;
              const desc = lang === 'ar' ? service.descriptionAr : service.descriptionEn;
              const isSelected = selectedServiceId === service.id;

              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setSelectedServiceId(service.id)}
                  className={`text-start rounded-2xl p-5 border transition-all flex flex-col justify-between min-h-[146px] ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#5EE0A0]/20 to-white border-[#245A2A]'
                      : 'bg-[#F4F6F5]/75 border-[#245A2A]/12 hover:border-[#245A2A]/35'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-base font-semibold text-[#1B2B1E]">{title}</h3>
                      <Printer
                        className={`w-4 h-4 shrink-0 mt-1 ${
                          isSelected ? 'text-[#245A2A]' : 'text-[#1B2B1E]/40'
                        }`}
                      />
                    </div>
                    {desc && (
                      <p className="text-xs sm:text-sm text-[#1B2B1E]/70 leading-relaxed mb-3">
                        {desc}
                      </p>
                    )}
                  </div>
                  <div className="pt-2.5 border-t border-[#245A2A]/10 flex items-baseline justify-between gap-2">
                    <span className="text-xs text-[#1B2B1E]/60">
                      {t.printing.startingAt} · {unit}
                    </span>
                    <span className="text-base font-bold text-[#1B2B1E] tabular-nums">
                      ${service.startingPriceUsd.toFixed(2).replace(/\.00$/, '')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Printing Order Form */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#F4F6F5] to-[#5EE0A0]/12 border border-[#245A2A]/15 rounded-2xl p-6 sm:p-7">
            <h3 className="text-lg font-bold text-[#1B2B1E] mb-4">{t.printing.formTitle}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="print-name"
                  className="block text-sm font-medium text-[#1B2B1E] mb-1.5"
                >
                  {t.printing.nameLabel}
                </label>
                <input
                  id="print-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder={t.printing.namePlaceholder}
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-white border border-[#245A2A]/15 rounded-xl text-[#1B2B1E] focus:outline-none focus:ring-2 focus:ring-[#245A2A]"
                />
              </div>

              <div>
                <label
                  htmlFor="print-service"
                  className="block text-sm font-medium text-[#1B2B1E] mb-1.5"
                >
                  {t.printing.serviceLabel}
                </label>
                <select
                  id="print-service"
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-white border border-[#245A2A]/15 rounded-xl text-[#1B2B1E] focus:outline-none focus:ring-2 focus:ring-[#245A2A]"
                >
                  {visibleServices.map((s) => (
                    <option key={s.id} value={s.id}>
                      {lang === 'ar' ? s.nameAr : s.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="print-size"
                    className="block text-sm font-medium text-[#1B2B1E] mb-1.5"
                  >
                    {t.printing.sizeLabel}
                  </label>
                  <input
                    id="print-size"
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder={t.printing.sizePlaceholder}
                    className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-white border border-[#245A2A]/15 rounded-xl text-[#1B2B1E] focus:outline-none focus:ring-2 focus:ring-[#245A2A]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="print-qty"
                    className="block text-sm font-medium text-[#1B2B1E] mb-1.5"
                  >
                    {t.printing.quantityLabel}
                  </label>
                  <input
                    id="print-qty"
                    type="text"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder={t.printing.quantityPlaceholder}
                    className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-white border border-[#245A2A]/15 rounded-xl text-[#1B2B1E] focus:outline-none focus:ring-2 focus:ring-[#245A2A]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="print-notes"
                  className="block text-sm font-medium text-[#1B2B1E] mb-1.5"
                >
                  {t.printing.notesLabel}
                </label>
                <textarea
                  id="print-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.printing.notesPlaceholder}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#245A2A]/15 rounded-xl text-[#1B2B1E] focus:outline-none focus:ring-2 focus:ring-[#245A2A]"
                />
              </div>

              {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

              <button
                type="submit"
                className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#245A2A] hover:bg-[#1C4721] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t.printing.submitBtn}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
