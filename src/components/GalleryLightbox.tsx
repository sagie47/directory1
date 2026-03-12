import { useState, useEffect, useCallback, useRef, type TouchEvent } from 'react';
import { X, ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GalleryLightboxProps {
  images: string[];
  businessName: string;
}

const SWIPE_THRESHOLD = 40;

export default function GalleryLightbox({ images, businessName }: GalleryLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
  };

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    touchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    const touchStartX = touchStartXRef.current;
    const touchEndX = event.changedTouches[0]?.clientX;

    if (touchStartX === null || touchEndX === undefined) {
      touchStartXRef.current = null;
      return;
    }

    const horizontalDistance = touchStartX - touchEndX;

    if (Math.abs(horizontalDistance) < SWIPE_THRESHOLD) {
      touchStartXRef.current = null;
      return;
    }

    if (horizontalDistance > 0) {
      goToNext();
    } else {
      goToPrevious();
    }

    touchStartXRef.current = null;
  };

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLightbox();
      }

      if (event.key === 'ArrowLeft') {
        goToPrevious();
      }

      if (event.key === 'ArrowRight') {
        goToNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [goToNext, goToPrevious, isOpen]);

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <section className="overflow-hidden bg-white shadow-sm md:rounded-sm md:border md:border-zinc-200">
        <div className="flex flex-col gap-4 p-0 md:gap-4 md:p-5">
          <div className="hidden md:flex md:flex-row md:items-center md:justify-end">
            <button
              type="button"
              onClick={() => openLightbox(currentIndex)}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 shadow-sm text-[11px] font-mono uppercase tracking-[0.1em] text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
            >
              <Expand className="h-3.5 w-3.5" strokeWidth={1.5} />
              Expand Gallery
            </button>
          </div>

          <div
            className="relative overflow-hidden bg-zinc-100 md:rounded-xl md:border md:border-zinc-200"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <button
              type="button"
              onClick={goToPrevious}
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/45 p-2 text-white transition-colors hover:bg-black/65"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
            </button>

            <button
              type="button"
              onClick={() => openLightbox(currentIndex)}
              className="block w-full cursor-zoom-in"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentIndex}
                  initial={{ opacity: 0.2 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0.2 }}
                  transition={{ duration: 0.2 }}
                  src={images[currentIndex]}
                  alt={`${businessName} image ${currentIndex + 1}`}
                  className="h-[320px] w-full object-cover md:h-[460px]"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
            </button>

            <button
              type="button"
              onClick={goToNext}
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/45 p-2 text-white transition-colors hover:bg-black/65"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
            </button>

            <div className="absolute bottom-3 left-3 rounded-md bg-black/55 backdrop-blur-sm px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.12em] text-white">
              {currentIndex + 1} / {images.length}
            </div>

            {images.length > 1 && (
              <div className="absolute bottom-3 right-3 rounded-md bg-black/55 backdrop-blur-sm px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.12em] text-white md:hidden">
                Swipe
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="overflow-x-auto pb-1">
              <div className="flex min-w-max gap-2">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-lg border transition-all ${
                      index === currentIndex
                        ? 'border-zinc-900 shadow-sm'
                        : 'border-zinc-200 opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`Preview image ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt={`${businessName} preview ${index + 1}`}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {index === currentIndex && (
                      <div className="absolute inset-0 ring-2 ring-inset ring-zinc-900" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col bg-black/95"
            onClick={closeLightbox}
          >
            <div className="flex items-center justify-between bg-black/50 px-6 py-4">
              <div className="text-white/80">
                <div className="font-sans text-sm">{businessName}</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/50">
                  {currentIndex + 1} / {images.length}
                </div>
              </div>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  closeLightbox();
                }}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-[11px] font-mono uppercase tracking-[0.1em] text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-6 w-6" strokeWidth={1.5} />
                <span>Close</span>
              </button>
            </div>

            <div
              className="flex flex-1 items-center justify-center p-4 md:p-8"
              onClick={(event) => event.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 rounded-full border border-white/20 bg-black/45 p-3 text-white/80 transition-colors hover:bg-white/10 hover:text-white md:left-8"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-8 w-8" strokeWidth={1.5} />
              </button>

              <AnimatePresence mode="wait">
                <motion.img
                  key={`lightbox-${currentIndex}`}
                  initial={{ opacity: 0.2, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0.2, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  src={images[currentIndex]}
                  alt={`${businessName} expanded image ${currentIndex + 1}`}
                  className="max-h-[72vh] max-w-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 rounded-full border border-white/20 bg-black/45 p-3 text-white/80 transition-colors hover:bg-white/10 hover:text-white md:right-8"
                aria-label="Next image"
              >
                <ChevronRight className="h-8 w-8" strokeWidth={1.5} />
              </button>
            </div>

            {images.length > 1 && (
              <div className="overflow-x-auto bg-black/50 px-4 pb-4 pt-2" onClick={(event) => event.stopPropagation()}>
                <div className="flex justify-center gap-2">
                  {images.map((image, index) => (
                    <button
                      key={`thumb-${image}-${index}`}
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      className={`h-16 w-16 shrink-0 overflow-hidden rounded-md transition-all md:h-20 md:w-20 ${
                        index === currentIndex
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-black'
                          : 'opacity-50 hover:opacity-80'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
