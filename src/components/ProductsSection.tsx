import React, { useMemo, useState } from 'react';
import { CheckCircle2, Clock, MessageCircle, Search, X } from 'lucide-react';
import { Language, PRODUCT_CATEGORIES, Product, ProductCategory, ShopInfo, StockStatus } from '../types';
import { CATEGORY_LABELS, TRANSLATIONS } from '../i18n/translations';
import { openWhatsApp } from '../lib/whatsapp';
import { SafeImage } from './SafeImage';

interface ProductsSectionProps {
  lang: Language;
  products: Product[];
  shopInfo: ShopInfo;
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  lang,
  products,
  shopInfo,
}) => {
  const t = TRANSLATIONS[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | ProductCategory>('all');
  const [stockFilter, setStockFilter] = useState<'all' | StockStatus>('all');

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((item) => {
      if (!item.isVisible) return false;
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (stockFilter !== 'all' && item.stockStatus !== stockFilter) return false;
      if (!q) return true;
      return (
        item.nameEn.toLowerCase().includes(q) ||
        item.nameAr.toLowerCase().includes(q) ||
        (item.descriptionEn ?? '').toLowerCase().includes(q) ||
        (item.descriptionAr ?? '').toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  const resetAll = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setStockFilter('all');
  };

  return (
    <section id="products" className="py-16 sm:py-20 bg-white border-b border-[#245A2A]/12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2B1E] tracking-tight mb-2">
              {t.products.heading}
            </h2>
            <p className="text-sm sm:text-base text-[#1B2B1E]/70">{t.products.subheading}</p>
          </div>

          {/* Search & Stock Controls */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-[#1B2B1E]/45 absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.products.searchPlaceholder}
                className="w-full min-h-[44px] ps-10 pe-9 py-2 text-sm bg-[#F4F6F5] border border-[#245A2A]/15 rounded-xl text-[#1B2B1E] placeholder:text-[#1B2B1E]/45 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#245A2A]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute top-1/2 -translate-y-1/2 end-2.5 p-1 text-[#1B2B1E]/45 hover:text-[#1B2B1E]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="inline-flex p-1 bg-[#F4F6F5] border border-[#245A2A]/12 rounded-xl shrink-0">
              {(['all', 'available', 'on_request'] as const).map((status) => {
                const active = stockFilter === status;
                const label =
                  status === 'all'
                    ? t.products.allStock
                    : status === 'available'
                      ? t.products.available
                      : t.products.onRequest;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStockFilter(status)}
                    className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-white text-[#1B2B1E] shadow-xs border border-[#245A2A]/10'
                        : 'text-[#1B2B1E]/65 hover:text-[#1B2B1E]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Interactive Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`min-h-[40px] px-4 py-2 text-xs sm:text-sm font-medium rounded-xl border transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-[#245A2A] text-white border-[#245A2A]'
                : 'bg-[#F4F6F5] text-[#1B2B1E]/80 border-[#245A2A]/15 hover:bg-[#5EE0A0]/15'
            }`}
          >
            {t.products.allCategories}
          </button>
          {PRODUCT_CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`min-h-[40px] px-4 py-2 text-xs sm:text-sm font-medium rounded-xl border transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#245A2A] text-white border-[#245A2A]'
                    : 'bg-[#F4F6F5] text-[#1B2B1E]/80 border-[#245A2A]/15 hover:bg-[#5EE0A0]/15'
                }`}
              >
                {CATEGORY_LABELS[category][lang]}
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="border border-[#245A2A]/15 bg-[#F4F6F5] rounded-2xl py-12 px-6 text-center">
            <p className="text-sm sm:text-base text-[#1B2B1E]/75 mb-4">{t.products.emptyState}</p>
            <button
              type="button"
              onClick={resetAll}
              className="min-h-[44px] px-5 py-2.5 text-sm font-semibold text-white bg-[#245A2A] hover:bg-[#1C4721] rounded-xl transition-colors"
            >
              {t.products.resetFilters}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const title = lang === 'ar' ? product.nameAr : product.nameEn;
              const desc = lang === 'ar' ? product.descriptionAr : product.descriptionEn;
              const categoryLabel = CATEGORY_LABELS[product.category]?.[lang] ?? product.category;
              const isAvailable = product.stockStatus === 'available';

              return (
                <article
                  key={product.id}
                  className="bg-white border border-[#245A2A]/12 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-150 hover:-translate-y-0.5 hover:border-[#245A2A]/35 hover:shadow-sm"
                >
                  <div>
                    <div className="aspect-[4/3] w-full bg-[#F4F6F5] overflow-hidden border-b border-[#245A2A]/10">
                      <SafeImage
                        src={product.imageUrl}
                        alt={title}
                        fallbackTitle={title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-5">
                      {/* Clean Unboxed Metadata */}
                      <div className="flex items-center justify-between gap-2 text-xs mb-2">
                        <span className="font-medium text-[#1B2B1E]/60">{categoryLabel}</span>
                        <span
                          className={`inline-flex items-center gap-1 font-medium whitespace-nowrap ${
                            isAvailable ? 'text-[#245A2A]' : 'text-amber-700'
                          }`}
                        >
                          {isAvailable ? (
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                          )}
                          <span>{isAvailable ? t.products.available : t.products.onRequest}</span>
                        </span>
                      </div>

                      <h3 className="text-base font-semibold text-[#1B2B1E] leading-snug mb-1.5">
                        {title}
                      </h3>

                      {desc && (
                        <p className="text-xs sm:text-sm text-[#1B2B1E]/70 leading-relaxed line-clamp-2 mb-3">
                          {desc}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-3 flex items-center justify-between gap-3 border-t border-[#245A2A]/10 mt-auto">
                    <span className="text-lg font-bold text-[#1B2B1E] tabular-nums">
                      ${product.priceUsd.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        openWhatsApp(
                          shopInfo.whatsappNumber,
                          t.products.whatsappTemplate(title, product.priceUsd)
                        )
                      }
                      className="min-h-[42px] px-4 py-2 rounded-xl bg-[#245A2A] hover:bg-[#1C4721] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                    >
                      <MessageCircle className="w-4 h-4 shrink-0" />
                      <span>{t.products.askWhatsApp}</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
