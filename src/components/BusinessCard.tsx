import { Link } from 'react-router-dom';
import { Star, ArrowRight, MapPin, Globe, Phone, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { Business, getBusinessCategoryTags, getBusinessServiceAreas, getPhoneHref, getWebsiteHref, getBusinessPhotos } from '../business';
import { useDirectoryData } from '../directory-data';
import { getCategoryHeroImage } from '../category-hero-images';

interface BusinessCardProps {
  business: Business;
}

export default function BusinessCard({ business }: BusinessCardProps) {
  const { categories, cities, businesses } = useDirectoryData();
  const category = categories.find(c => c.id === business.categoryId);
  const city = cities.find(c => c.id === business.cityId);
  const serviceAreas = getBusinessServiceAreas(business, city?.name ?? 'Local area');
  const phoneHref = getPhoneHref(business.contact.phone);
  const websiteHref = getWebsiteHref(business.contact.website);
  const rating = business.rating ?? 0;
  const reviewCount = business.reviewCount ?? 0;
  const categoryTags = getBusinessCategoryTags(business, 2);
  const photos = getBusinessPhotos(business);
  
  const imageSrc = photos[0] || getCategoryHeroImage({
    categoryId: business.categoryId,
    groupId: category?.groupId,
    cityId: business.cityId,
    businesses: businesses
  });

  return (
    <div className="group bg-white rounded-2xl border border-zinc-100 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 flex flex-col h-full overflow-hidden relative">
      {/* Image Header */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-zinc-100">
        <img 
          src={imageSrc} 
          alt={business.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
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
          <div className="flex items-center gap-1.5">
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
            </div>
            <span className="font-sans text-sm font-bold text-zinc-900">{rating.toFixed(1)}</span>
            <span className="text-zinc-300 mx-1">•</span>
            <span className="font-sans text-xs font-medium text-zinc-500">{reviewCount} reviews</span>
          </div>
        </div>

        {/* Title & City */}
        <div className="mb-6">
          <Link to={`/${business.cityId}/${business.categoryId}/${business.id}`} className="block">
            <h3 className="text-xl font-semibold text-zinc-900 tracking-tight leading-tight mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
              {business.name}
            </h3>
          </Link>
          <div className="flex items-center gap-2 text-zinc-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="font-sans text-sm font-medium truncate">{city?.name || business.cityId}</span>
            <span className="italic font-serif text-sm text-zinc-400 shrink-0">· serving {serviceAreas[0]}</span>
          </div>
        </div>

        {/* Tags/Features */}
        <div className="flex flex-wrap gap-2 mb-8 mt-auto">
          {categoryTags.map((tag) => (
            <span key={tag} className="text-[11px] font-medium text-zinc-600 bg-zinc-50 px-2.5 py-1 rounded-md border border-zinc-200">
              {tag}
            </span>
          ))}
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 ml-auto bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="uppercase tracking-wider">Verified</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="pt-5 border-t border-zinc-100 flex items-center justify-between">
          <div className="flex gap-2">
            {phoneHref && (
              <a href={phoneHref} className="p-2.5 bg-zinc-50 text-zinc-500 hover:bg-orange-500 hover:text-white rounded-xl border border-zinc-100 hover:border-orange-500 transition-all duration-300" title="Call">
                <Phone className="h-4 w-4" />
              </a>
            )}
            {websiteHref && (
              <a href={websiteHref} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-zinc-50 text-zinc-500 hover:bg-orange-500 hover:text-white rounded-xl border border-zinc-100 hover:border-orange-500 transition-all duration-300" title="Website">
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