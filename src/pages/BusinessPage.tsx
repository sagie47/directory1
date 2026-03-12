import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { MapPin, Star, Phone, Globe, Mail, Clock, Check, ArrowRight, ShieldCheck, AlertCircle, Image as ImageIcon, Navigation } from 'lucide-react';
import { motion } from 'motion/react';
import {
  getBusinessCapabilities,
  getBusinessCategoryTags,
  getBusinessDescription,
  getBusinessHours,
  getBusinessPhotos,
  getBusinessReviews,
  getBusinessServiceAreas,
  getMapEmbedUrl,
  getMapsHref,
  getPhoneHref,
  getWebsiteHref,
} from '../business';
import Breadcrumbs from '../components/Breadcrumbs';
import GalleryLightbox from '../components/GalleryLightbox';
import { useDirectoryData } from '../directory-data';

const INITIAL_MOBILE_REVIEW_COUNT = 1;
const MOBILE_REVIEW_BATCH_SIZE = 2;

export default function BusinessPage() {
  const { cityId, categoryId, businessId } = useParams<{ cityId: string, categoryId: string, businessId: string }>();
  const { cities, categories, businesses, isLoading } = useDirectoryData();
  
  const city = cities.find(c => c.id === cityId);
  const category = categories.find(c => c.id === categoryId);
  const business = businesses.find(
    (candidate) =>
      candidate.id === businessId
      && candidate.cityId === cityId
      && candidate.categoryId === categoryId,
  );

  if (isLoading && !business) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-[#FAFAFA] min-h-screen flex items-center justify-center px-6"
      >
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-zinc-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="mt-4 text-[11px] font-mono uppercase tracking-widest text-zinc-500">Loading profile...</p>
        </div>
      </motion.div>
    );
  }

  if (!city || !category || !business) {
    return <Navigate to="/" replace />;
  }

  const description = getBusinessDescription(business, city.name, category.name);
  const mapsHref = getMapsHref(business);
  const mapEmbedUrl = getMapEmbedUrl(business);
  const phoneHref = getPhoneHref(business.contact.phone);
  const websiteHref = getWebsiteHref(business.contact.website);
  const photos = getBusinessPhotos(business);
  const specialties = getBusinessCapabilities(business);
  const categoryTags = getBusinessCategoryTags(business);
  const reviews = getBusinessReviews(business);
  const hours = getBusinessHours(business);
  const serviceAreas = getBusinessServiceAreas(business, city.name);
  const rating = business.rating ?? 0;
  const reviewCount = business.reviewCount ?? 0;
  const [visibleMobileReviewCount, setVisibleMobileReviewCount] = useState(INITIAL_MOBILE_REVIEW_COUNT);

  useEffect(() => {
    setVisibleMobileReviewCount(INITIAL_MOBILE_REVIEW_COUNT);
  }, [business.id]);

  const visibleMobileReviews = reviews.slice(0, visibleMobileReviewCount);
  const hasMoreMobileReviews = visibleMobileReviewCount < reviews.length;

  const showMoreMobileReviews = () => {
    setVisibleMobileReviewCount((previous) => Math.min(previous + MOBILE_REVIEW_BATCH_SIZE, reviews.length));
  };

  const heroImageSrc = photos[0];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-orange-500/20 selection:text-zinc-900"
    >
      <Breadcrumbs
            items={[
              { label: 'Home', to: '/' },
              { label: city.name, to: `/${city.id}` },
              { label: category.name, to: `/${city.id}/${category.id}` },
              { label: business.name },
            ]}
          />

      {/* Hero Header Section */}
      <div className="relative overflow-hidden border-b border-zinc-200 bg-white pt-8 pb-10 sm:pt-10 sm:pb-12 lg:pt-20 lg:pb-24">
        <div className="absolute inset-0 z-0 bg-white">
          {heroImageSrc && (
            <img 
              src={heroImageSrc} 
              alt="" 
              className="w-full h-full object-cover opacity-[0.15] mix-blend-luminosity" 
              aria-hidden="true" 
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-white/95" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-8 sm:gap-10 lg:flex-row lg:gap-12">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-3 py-1.5 bg-zinc-900 text-white text-[10px] font-mono font-bold uppercase tracking-widest shadow-sm rounded-sm">
                  {category.name}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white text-[10px] font-mono font-bold uppercase tracking-widest shadow-sm rounded-sm">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-zinc-900 mb-6 leading-[1.05]">
                {business.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm font-mono tracking-wide text-zinc-500">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-orange-500 text-orange-500" />
                  <span className="text-zinc-950 font-medium">{rating.toFixed(1)}</span>
                  <span>({reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {mapsHref ? (
                    <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-950 transition-colors underline decoration-zinc-300 underline-offset-4">
                      {business.contact.address || city.name}
                    </a>
                  ) : (
                    <span>{business.contact.address || city.name}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions Desktop */}
            <div className="hidden lg:flex flex-col gap-4 min-w-[280px] shrink-0 pt-4">
              {phoneHref && (
                <a href={phoneHref} className="group flex items-center justify-between w-full bg-zinc-900 text-white px-6 py-4 rounded-xl leading-none font-mono text-sm font-semibold uppercase tracking-widest border border-zinc-900 shadow-sm hover:bg-orange-500 hover:border-orange-500 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                  <span>Call Now</span>
                  <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
              )}
              {websiteHref && (
                <a href={websiteHref} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between w-full bg-white border border-zinc-200 text-zinc-900 rounded-xl px-6 py-4 font-mono text-sm font-semibold uppercase tracking-widest shadow-sm hover:bg-zinc-50 hover:border-zinc-300 hover:-translate-y-1 hover:shadow-md transition-colors">
                  <span>Website</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-0 py-6 sm:px-6 sm:py-12 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 items-start gap-8 sm:gap-12 lg:grid-cols-12 lg:gap-16">
          
          {/* Main Content */}
          <div className="space-y-8 sm:space-y-12 lg:col-span-8 lg:space-y-24">
            
            {/* Gallery Section */}
            {photos.length > 0 ? (
              <div className="sm:px-0">
                <GalleryLightbox images={photos} businessName={business.name} />
              </div>
            ) : null}

            <section>
              <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 mb-8 flex items-center gap-4">
                <span className="w-8 h-[2px] bg-zinc-900"></span>
                Company Overview
              </h2>
              <div className="max-w-none">
                <p className="text-xl lg:text-2xl text-zinc-800 leading-[1.6] font-medium tracking-tight">
                  {description}
                </p>
              </div>
              
              {categoryTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-10 pt-10 border-t border-zinc-200">
                  {categoryTags.map((tag) => (
                    <span key={tag} className="text-xs font-mono uppercase tracking-widest text-zinc-500 bg-zinc-100 px-3 py-2 rounded-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </section>

            {specialties.length > 0 && (
              <section>
                <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 mb-10 flex items-center gap-4">
                  <span className="w-8 h-[2px] bg-zinc-900"></span>
                  {business.specialties && business.specialties.length > 0 ? 'Core Capabilities' : 'Services Offered'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  {specialties.map((specialty, idx) => (
                    <div key={idx} className="flex items-start gap-4 pb-6 border-b border-zinc-200/60 group">
                      <div className="mt-0.5 flex-shrink-0 bg-zinc-100 w-6 h-6 rounded-full flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      </div>
                      <span className="text-zinc-800 font-medium leading-relaxed">{specialty}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {reviews.length > 0 && (
              <section>
                <div className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                  <h2 className="flex items-center gap-4 text-xl font-black uppercase tracking-tight text-zinc-900">
                    <span className="h-[2px] w-8 bg-zinc-900"></span>
                    Verified Feedback
                  </h2>
                  {mapsHref && (
                    <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-bold font-mono uppercase tracking-widest text-zinc-500 transition-colors hover:text-orange-600">
                      View Source <ArrowRight className="h-3 w-3" />
                    </a>
                  )}
                </div>

                <div className="lg:hidden">
                  <div className="space-y-5">
                    {visibleMobileReviews.map((review, idx) => (
                      <article key={`${review.author}-${idx}`} className="rounded-sm border border-zinc-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-sm font-mono font-bold text-white">
                              {review.author.charAt(0)}
                            </div>
                            <span className="text-sm font-bold uppercase tracking-wide text-zinc-900">{review.author}</span>
                          </div>
                          <div className="flex gap-1 rounded-full bg-zinc-50 px-3 py-1.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-orange-500 text-orange-500' : 'fill-zinc-300 text-zinc-300'}`} strokeWidth={1} />
                            ))}
                          </div>
                        </div>
                        <p className="text-base leading-relaxed text-zinc-700">{review.text}</p>
                      </article>
                    ))}

                    {hasMoreMobileReviews && (
                      <button
                        type="button"
                        onClick={showMoreMobileReviews}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-sm border border-zinc-300 bg-white px-4 py-3 text-[11px] font-mono font-bold uppercase tracking-[0.12em] text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900"
                      >
                        Show More Reviews
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="hidden space-y-16 lg:block">
                  {reviews.map((review, idx) => (
                    <div key={idx} className={`relative ${idx !== reviews.length - 1 ? 'border-b border-zinc-200/60 pb-16' : ''}`}>
                      <div className="absolute -left-4 -top-6 select-none font-serif text-[8rem] leading-none text-zinc-100 opacity-40">"</div>
                      <div className="relative z-10 border-l-2 border-orange-500 pl-6 lg:pl-10">
                        <p className="mb-8 text-xl leading-[1.5] tracking-tight text-zinc-800 text-pretty lg:text-2xl">
                          {review.text}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-sm font-mono font-bold text-white">
                              {review.author.charAt(0)}
                            </div>
                            <span className="text-sm font-bold uppercase tracking-wide text-zinc-900">{review.author}</span>
                          </div>
                          <div className="flex gap-1 rounded-full bg-zinc-50 px-3 py-1.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-orange-500 text-orange-500' : 'fill-zinc-300 text-zinc-300'}`} strokeWidth={1} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
            
            {/* Mobile Actions */}
            <div className="mb-2 flex flex-col gap-3 lg:hidden">
              {phoneHref && (
                <a href={phoneHref} className="flex items-center justify-between w-full bg-zinc-900 text-white px-6 py-4 rounded-xl leading-none font-mono text-sm font-semibold uppercase tracking-widest shadow-sm border border-zinc-900">
                  <span>Call Now</span>
                  <Phone className="w-4 h-4" />
                </a>
              )}
              {websiteHref && (
                <a href={websiteHref} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full bg-white border border-zinc-200 text-zinc-900 rounded-xl px-6 py-4 font-mono text-sm font-semibold uppercase tracking-widest shadow-sm">
                  <span>Website</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>

            <section className="pt-2 pb-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-6">Contact Details</h3>
              
              <div className="space-y-6">
                {business.contact.phone && (
                  <div>
                    <p className="text-[10px] font-mono text-zinc-600 mb-1">PHONE</p>
                    <a href={phoneHref} className="text-sm font-mono text-zinc-900 hover:text-orange-500 transition-colors block">{business.contact.phone}</a>
                  </div>
                )}
                {business.contact.website && (
                  <div>
                    <p className="text-[10px] font-mono text-zinc-600 mb-1">WEB</p>
                    <a href={websiteHref} target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-zinc-900 hover:text-orange-500 transition-colors block break-all">
                      {business.contact.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                  </div>
                )}
                {business.contact.email && (
                  <div>
                    <p className="text-[10px] font-mono text-zinc-600 mb-1">EMAIL</p>
                    <a href={`mailto:${business.contact.email}`} className="text-sm font-mono text-zinc-900 hover:text-orange-500 transition-colors block break-all">
                      {business.contact.email}
                    </a>
                  </div>
                )}
                <div className="pt-6 border-t border-zinc-200">
                    <p className="text-[10px] font-mono text-zinc-600 mb-2">HQ LOCATION</p>
                    <p className="text-sm font-mono text-zinc-600">{business.contact.address || `${city.name}, BC`}</p>
                </div>
              </div>
            </section>

            {hours.length > 0 && (
              <section className="py-6 border-t border-zinc-200">
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-6">Operating Hours</h3>
                <ul className="space-y-3">
                  {hours.map(([day, dayHours]) => (
                    <li key={day} className="flex justify-between items-end border-b border-zinc-200 pb-2">
                      <span className="text-xs font-mono text-zinc-500 uppercase">{day}</span>
                      <span className={`text-sm font-mono ${dayHours === 'Closed' ? 'text-zinc-400' : 'text-zinc-900'}`}>{dayHours}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="py-6 border-t border-zinc-200">
              <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-6">Service Zones</h3>
              <div className="flex flex-wrap gap-2">
                {serviceAreas.map((area, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-600 text-xs font-medium tracking-wide">
                    {area}
                  </span>
                ))}
              </div>
            </section>

            {mapEmbedUrl && (
              <section className="bg-white border border-zinc-200 p-1.5 rounded-sm shadow-sm mt-6">
                <div className="relative">
                  <div className="absolute inset-0 border border-zinc-300 z-10 pointer-events-none mix-blend-overlay"></div>
                  <iframe
                    src={mapEmbedUrl}
                    title={`${business.name} location map`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-[300px] rounded-xl"
                  />
                  <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="absolute bottom-4 right-4 z-20 bg-zinc-900 px-4 py-2.5 rounded-xl text-xs font-sans font-semibold text-white shadow-sm hover:bg-orange-500 hover:-translate-y-0.5 hover:shadow-md transition-all flex items-center gap-2">
                    <Navigation className="w-3 h-3" /> Get Directions
                  </a>
                </div>
              </section>
            )}

            <div className="mt-8 p-8 border border-zinc-200 rounded-sm bg-zinc-50 shadow-sm">
              <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                <AlertCircle className="w-5 h-5 text-zinc-500 mb-4" />
                <h4 className="font-black text-sm text-zinc-900 uppercase tracking-widest mb-2">Is this your business?</h4>
                <p className="text-sm text-zinc-600 mb-6 font-medium leading-relaxed">Claim this page to update your services, hours, and contact info.</p>
                <div className="space-y-3">
                  <Link to={`/claim?businessId=${encodeURIComponent(business.id)}`} className="inline-flex items-center justify-between w-full bg-zinc-900 text-white rounded-lg shadow-sm px-4 py-3 font-sans text-xs font-semibold tracking-wide hover:bg-orange-500 hover:-translate-y-0.5 hover:shadow-md transition-all">
                    <span>Claim Business</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                  <Link to="/never-miss-a-lead" className="inline-flex items-center justify-between w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 font-sans text-xs font-semibold tracking-wide text-zinc-900 hover:border-zinc-900 hover:-translate-y-0.5 hover:shadow-md transition-all">
                    <span>Need help handling leads?</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
