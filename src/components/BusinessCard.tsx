import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, MapPin, Globe, Phone, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Business, getBusinessCategoryTags, getBusinessServiceAreas, getPhoneHref, getWebsiteHref, getBusinessPhotos, getBusinessReviews } from '../business';
import { useDirectoryData } from '../directory-data';

interface BusinessCardProps {
  business: Business;
  contextCityName?: string;
}

export default function BusinessCard({ business, contextCityName }: BusinessCardProps) {
  const { categories, cities } = useDirectoryData();
  const category = categories.find(c => c.id === business.categoryId);
  const city = cities.find(c => c.id === business.cityId);
  const serviceAreas = getBusinessServiceAreas(business, city?.name ?? 'Local area');
  const phoneHref = getPhoneHref(business.contact.phone);
  const websiteHref = getWebsiteHref(business.contact.website);
  const rating = business.rating ?? 0;
  const reviewCount = business.reviewCount ?? 0;
  const categoryTags = getBusinessCategoryTags(business, 2);
  const photos = getBusinessPhotos(business);
  
  // Sort reviews to favor shorter, high-quality ones first
  const reviews = getBusinessReviews(business)
    .filter(r => r.rating >= 4 && r.text.trim().length > 10)
    .sort((a, b) => a.text.length - b.text.length);

  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  // Rotate through top reviews every 8 seconds
  useEffect(() => {
    if (reviews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentReviewIndex(prev => (prev + 1) % Math.min(reviews.length, 3));
    }, 8000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  const activeReview = reviews[currentReviewIndex];
  
  const imageSrc = photos[0];
  const isServiceAreaMatch = Boolean(
    contextCityName
    && city?.name
    && city.name !== contextCityName
    && serviceAreas.some((entry) => entry.toLowerCase() === contextCityName.toLowerCase())
  );
  const locationSummary = isServiceAreaMatch
    ? `Based in ${city?.name} · serves ${contextCityName}`
    : `${city?.name || business.cityId} · serving ${serviceAreas[0]}`;

  return (
    <div className="group bg-white rounded-sm border border-zinc-200 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] hover:border-zinc-300 hover:-translate-y-1 transition-all duration-500 flex flex-col h-full overflow-hidden relative">
      {/* Image Header */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-zinc-100 shrink-0">
        {imageSrc ? (
          <>
            <img 
              src={imageSrc} 
              alt={business.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[0.16,1,0.3,1]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-end bg-gradient-to-br from-zinc-50 via-white to-zinc-100 p-6">
            <div className="text-zinc-400">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-sm border border-zinc-200 bg-white shadow-sm">
                <ImageIcon className="h-5 w-5" />
              </div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                No business photos
              </p>
            </div>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 bg-white/95 backdrop-blur-md rounded-full border border-white/20 shadow-sm">
          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
          <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-zinc-700">{category?.name}</span>
        </div>

        {/* Photo Count Indicator */}
        {photos.length > 1 && (
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900/70 backdrop-blur-md rounded-lg text-white">
            <ImageIcon className="h-3 w-3" />
            <span className="font-sans text-[10px] font-medium">{photos.length}</span>
          </div>
        )}
      </div>

      <div className="relative p-6 lg:p-8 flex flex-col flex-grow">
        {/* Header: Rating */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
              <Star className="h-3 w-3 fill-orange-500 text-orange-500 mr-1" />
              <span className="font-sans text-[11px] font-bold text-orange-700">{rating.toFixed(1)}</span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 font-bold">{reviewCount} Reviews</span>
          </div>
        </div>

        {/* Title & City */}
        <div className="mb-5">
          <Link to={`/${business.cityId}/${business.categoryId}/${business.id}`} className="block">
            <h3 className="text-xl font-bold text-zinc-900 tracking-tight leading-[1.2] mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
              {business.name}
            </h3>
          </Link>
          <div className="flex items-center gap-2 text-zinc-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="font-sans text-sm font-medium truncate">{locationSummary}</span>
          </div>
        </div>

        {/* Tags/Features */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categoryTags.map((tag) => (
            <span key={tag} className="text-[11px] font-medium text-zinc-600 bg-zinc-50 px-2.5 py-1 rounded-md border border-zinc-200">
              {tag}
            </span>
          ))}
        </div>

        {/* Dynamic Review Snippet */}
        <div className="mt-auto mb-6 flex-grow flex flex-col justify-end">
          <div className="relative pt-6 border-t border-zinc-100 min-h-[102px]">
            <AnimatePresence mode="wait">
              {activeReview ? (
                <motion.div 
                  key={currentReviewIndex}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="relative z-10 pl-4 border-l-2 border-zinc-100"
                >
                  <p className="font-sans italic text-zinc-600 text-[13px] leading-relaxed line-clamp-3 tracking-tight">
                    {activeReview.text}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex shrink-0">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-2.5 w-2.5 ${i < activeReview.rating ? 'fill-orange-400 text-orange-400' : 'fill-zinc-200 text-zinc-200'}`} />
                      ))}
                    </div>
                    <span className="font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 truncate">
                      {activeReview.author}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <div key="empty" className="h-full"></div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Bar */}
        <div className="pt-5 border-t border-zinc-100 flex items-center justify-between shrink-0">
          <div className="flex gap-2">
            {phoneHref && (
              <a href={phoneHref} className="p-2.5 bg-zinc-50 text-zinc-500 hover:bg-zinc-900 hover:text-white rounded-xl border border-zinc-200 hover:border-zinc-900 transition-all duration-300" title="Call">
                <Phone className="h-4 w-4" />
              </a>
            )}
            {websiteHref && (
              <a href={websiteHref} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-zinc-50 text-zinc-500 hover:bg-zinc-900 hover:text-white rounded-xl border border-zinc-200 hover:border-zinc-900 transition-all duration-300" title="Website">
                <Globe className="h-4 w-4" />
              </a>
            )}
          </div>
          
          <Link 
            to={`/${business.cityId}/${business.categoryId}/${business.id}`}
            className="flex items-center gap-2 font-sans text-sm font-bold text-zinc-900 hover:text-orange-600 transition-colors group/link"
          >
            Full Profile <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
