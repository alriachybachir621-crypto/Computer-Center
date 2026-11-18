import React, { useState } from 'react';
import { Droplets, MessageCircle } from 'lucide-react';
import { Language, ShopInfo } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { openWhatsApp } from '../lib/whatsapp';

interface InkFinderSectionProps {
  lang: Language;
  shopInfo: ShopInfo;
}

export const InkFinderSection: React.FC<InkFinderSectionProps> = ({ lang, shopInfo }) => {
  const t = TRANSLATIONS[lang];
  const [printerModel, setPrinterModel] = useState('');
  const [cartridgeIndex, setCartridgeIndex] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const cartridgeType = t.inkFinder.colors[cartridgeIndex] ?? t.inkFinder.colors[0];

  const previewText = t.inkFinder.whatsappTemplate(
    printerModel.trim() || 'HP LaserJet Pro M102a',
    cartridgeType,
    notes.trim()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!printerModel.trim()) {
      setError(t.inkFinder.missingModel);
      return;
    }
    setError('');
    openWhatsApp(
      shopInfo.whatsappNumber,
      t.inkFinder.whatsappTemplate(printerModel.trim(), cartridgeType, notes.trim())
    );
  };

  return (
    <section
      id="ink-finder"
      className="py-16 sm:py-20 bg-gradient-to-br from-[#F4F6F5] via-[#F4F6F5] to-[#5EE0A0]/15 border-b border-[#245A2A]/12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Intro & Quick Models */}
          <div className="lg:col-span-5">
            <div className="w-11 h-11 rounded-xl bg-[#245A2A] text-[#5EE0A0] flex items-center justify-center mb-4">
              <Droplets className="w-5 h-5" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2B1E] tracking-tight mb-3">
              {t.inkFinder.heading}
            </h2>
            <p className="text-sm sm:text-base text-[#1B2B1E]/75 leading-relaxed mb-6">
              {t.inkFinder.subheading}
            </p>

            <div>
              <p className="text-xs font-semibold text-[#1B2B1E]/60 mb-2.5">
                {t.inkFinder.quickModelsLabel}
              </p>
              <div className="flex flex-wrap gap-2">
                {t.inkFinder.quickModels.map((model) => (
                  <button
                    key={model}
                    type="button"
                    onClick={() => {
                      setPrinterModel(model);
                      setError('');
                    }}
                    className={`min-h-[38px] px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      printerModel === model
                        ? 'bg-[#245A2A] text-white border-[#245A2A]'
                        : 'bg-white text-[#1B2B1E] border-[#245A2A]/15 hover:border-[#245A2A]'
                    }`}
                  >
                    {model}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="lg:col-span-7 bg-white border border-[#245A2A]/12 rounded-2xl p-6 sm:p-7">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="printer-model-input"
                  className="block text-sm font-medium text-[#1B2B1E] mb-1.5"
                >
                  {t.inkFinder.modelLabel}
                </label>
                <input
                  id="printer-model-input"
                  type="text"
                  value={printerModel}
                  onChange={(e) => {
                    setPrinterModel(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder={t.inkFinder.modelPlaceholder}
                  className="w-full min-h-[44px] px-4 py-2.5 text-sm bg-[#F4F6F5] border border-[#245A2A]/15 rounded-xl text-[#1B2B1E] placeholder:text-[#1B2B1E]/45 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#245A2A]"
                />
                {error && <p className="text-xs text-red-600 mt-1.5 font-medium">{error}</p>}
              </div>

              <div>
                <span className="block text-sm font-medium text-[#1B2B1E] mb-1.5">
                  {t.inkFinder.colorLabel}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {t.inkFinder.colors.map((opt, idx) => {
                    const active = cartridgeIndex === idx;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setCartridgeIndex(idx)}
                        className={`min-h-[42px] px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl border text-start transition-colors ${
                          active
                            ? 'bg-[#5EE0A0]/25 text-[#1B2B1E] border-[#245A2A]'
                            : 'bg-white text-[#1B2B1E]/80 border-[#245A2A]/15 hover:bg-[#F4F6F5]'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  htmlFor="ink-notes-input"
                  className="block text-sm font-medium text-[#1B2B1E] mb-1.5"
                >
                  {t.inkFinder.notesLabel}
                </label>
                <input
                  id="ink-notes-input"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.inkFinder.notesPlaceholder}
                  className="w-full min-h-[44px] px-4 py-2.5 text-sm bg-[#F4F6F5] border border-[#245A2A]/15 rounded-xl text-[#1B2B1E] placeholder:text-[#1B2B1E]/45 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#245A2A]"
                />
              </div>

              <div className="bg-[#F4F6F5] border border-[#245A2A]/12 rounded-xl p-3.5">
                <p className="text-xs font-medium text-[#1B2B1E]/60 mb-1">
                  {t.inkFinder.previewLabel}
                </p>
                <p className="text-xs text-[#1B2B1E]/85 whitespace-pre-line leading-relaxed">
                  {previewText}
                </p>
              </div>

              <button
                type="submit"
                className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#245A2A] hover:bg-[#1C4721] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t.inkFinder.submitBtn}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
