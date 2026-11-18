import React, { useState } from 'react';
import { X } from 'lucide-react';
import { GalleryPhoto, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { SafeImage } from './SafeImage';

interface GallerySectionProps {
  lang: Language;
  photos: GalleryPhoto[];
}

export const GallerySection: React.FC<GallerySectionProps> = ({ lang, photos }) => {
  const t = TRANSLATIONS[lang];
  const visiblePhotos = photos.filter((p) => p.isVisible);
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhoto | null>(null);

  return (
    <section id="gallery" className="py-16 sm:py-20 bg-white border-b border-[#245A2A]/12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2B1E] tracking-tight mb-2">
            {t.gallery.heading}
          </h2>
          <p className="text-sm sm:text-base text-[#1B2B1E]/70 max-w-2xl">
            {t.gallery.subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {visiblePhotos.map((photo) => {
            const title = lang === 'ar' ? photo.titleAr : photo.titleEn;
            return (
              <button
                key={photo.id}
                type="button"
                onClick={() => setLightboxPhoto(photo)}
                className="group text-start bg-[#F4F6F5] border border-[#245A2A]/12 hover:border-[#245A2A]/35 rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#245A2A]"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-white">
                  <SafeImage
                    src={photo.imageUrl}
                    alt={title}
                    fallbackTitle={title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-3.5">
                  <p className="text-sm font-medium text-[#1B2B1E] line-clamp-1">{title}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-[#1B2B1E]/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxPhoto(null)}
              aria-label="Close"
              className="absolute top-3 end-3 z-10 w-10 h-10 rounded-full bg-white/95 text-[#1B2B1E] flex items-center justify-center shadow hover:bg-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-[16/10] bg-[#F4F6F5]">
              <SafeImage
                src={lightboxPhoto.imageUrl}
                alt={lang === 'ar' ? lightboxPhoto.titleAr : lightboxPhoto.titleEn}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 bg-white border-t border-[#245A2A]/12">
              <p className="text-sm sm:text-base font-semibold text-[#1B2B1E]">
                {lang === 'ar' ? lightboxPhoto.titleAr : lightboxPhoto.titleEn}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
