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
      <div className="lg:hidden">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: city.name, to: `/${city.id}` },
            { label: category.name, to: `/${city.id}/${category.id}` },
            { label: business.name },
          ]}
        />
      </div>

      {/* Hero Header Section */}
      <div className="relative overflow-hidden bg-white pt-8 pb-10 sm:pt-10 sm:pb-12 lg:pt-8 lg:pb-0">
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
          <div className="hidden lg:block mb-8">
            <nav className="flex items-center text-[10px] font-mono tracking-[0.1em] text-zinc-400 overflow-x-auto whitespace-nowrap uppercase">
              {[
                { label: 'Home', to: '/' },
                { label: city.name, to: `/${city.id}` },
                { label: category.name, to: `/${city.id}/${category.id}` },
                { label: business.name },
              ].map((item, index, array) => (
                <div key={`${item.label}-${index}`} className="flex items-center">
                  {item.to ? (
                    <Link to={item.to} className="hover:text-zinc-900 transition-colors">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-zinc-900 font-medium">{item.label}</span>
                  )}
                  {index < array.length - 1 && <span className="mx-2 text-zinc-300">/</span>}
                </div>
              ))}
            </nav>
          </div>

          <div className="flex flex-col items-start justify-between gap-8 sm:gap-10 lg:flex-row lg:gap-8">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-zinc-900 text-white text-[10px] font-mono font-bold uppercase tracking-widest shadow-sm rounded-sm">
                  {category.name}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-zinc-900 mb-3 leading-[1.05]">
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
            <div className="hidden lg:flex flex-col gap-3 min-w-[280px] shrink-0">
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

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:pt-6 lg:pb-10">
        <div className="grid grid-cols-1 items-start gap-10 sm:gap-12 lg:grid-cols-12 lg:gap-16">
          
          {/* Main Content */}
          <div className="space-y-10 sm:space-y-12 lg:col-span-8 lg:space-y-24">
            
            {/* Gallery Section */}
            {photos.length > 0 ? (
              <div className="bg-white border border-zinc-200 p-1.5 rounded-sm shadow-sm">
                <GalleryLightbox images={photos} businessName={business.name} />
              </div>
            ) : null}

            <section>
              <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-4">
                <span className="w-8 h-[1px] bg-zinc-300"></span>
                Company Overview
              </h2>
              <div className="max-w-none">
                <p className="text-xl lg:text-2xl text-zinc-800 leading-[1.6] font-medium tracking-tight">
                  {description}
                </p>
              </div>
              
              {categoryTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-zinc-200">
                  {categoryTags.map((tag) => (
                    <span key={tag} className="text-[11px] font-medium text-zinc-600 bg-white border border-zinc-200 px-3 py-1.5 rounded-full shadow-sm hover:border-zinc-300 hover:bg-zinc-50 transition-colors">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </section>

            {specialties.length > 0 && (
              <section>
                <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-zinc-400 mb-8 flex items-center gap-4">
                  <span className="w-8 h-[1px] bg-zinc-300"></span>
                  {business.specialties && business.specialties.length > 0 ? 'Core Capabilities' : 'Services Offered'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {specialties.map((specialty, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-white border border-zinc-200 shadow-sm hover:border-orange-200 hover:shadow-md transition-all group">
                      <div className="mt-0.5 flex-shrink-0 bg-zinc-50 border border-zinc-200 w-6 h-6 rounded-full flex items-center justify-center group-hover:bg-orange-500 group-hover:border-orange-500 group-hover:text-white transition-colors">
                        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </div>
                      <span className="text-zinc-800 font-medium leading-tight">{specialty}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {reviews.length > 0 && (
              <section>
                <div className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-center lg:mb-10">
                  <h2 className="flex items-center gap-4 text-xl font-black uppercase tracking-tight text-zinc-900 lg:text-sm lg:font-mono lg:font-bold lg:tracking-widest lg:text-zinc-400">
                    <span className="h-[2px] w-8 bg-zinc-900 lg:h-[1px] lg:bg-zinc-300"></span>
                    Verified Feedback
                  </h2>
                  {mapsHref && (
                    <a
                      href={mapsHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[10px] font-bold font-mono uppercase tracking-widest text-zinc-500 transition-colors hover:text-orange-600 lg:rounded-lg lg:border lg:border-zinc-200 lg:bg-white lg:px-4 lg:py-2 lg:text-[11px] lg:text-zinc-600 lg:shadow-sm lg:hover:bg-zinc-50 lg:hover:text-zinc-900"
                    >
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

                <div className="hidden lg:grid lg:grid-cols-1 lg:gap-8">
                  {reviews.map((review, idx) => (
                    <div key={idx} className="relative rounded-xl border border-zinc-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md lg:p-10">
                      <div className="absolute -top-3 -left-3 w-8 h-8 bg-orange-50 rounded-full border border-orange-100 flex items-center justify-center">
                        <span className="font-serif text-3xl leading-none text-orange-400 mt-2">"</span>
                      </div>
                      <div className="relative z-10">
                        <p className="text-lg lg:text-xl text-zinc-700 leading-relaxed tracking-tight mb-8">
                          {review.text}
                        </p>
                        <div className="flex items-center justify-between pt-6 border-t border-zinc-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 flex items-center justify-center text-xs font-mono font-bold">
                              {review.author.charAt(0)}
                            </div>
                            <span className="font-sans font-bold text-zinc-900 tracking-tight text-sm">{review.author}</span>
                          </div>
                          <div className="flex gap-1 bg-zinc-50 px-2.5 py-1.5 rounded-full border border-zinc-200 shadow-inner">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-orange-400 text-orange-400' : 'fill-zinc-200 text-zinc-200'}`} strokeWidth={1} />
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
            <div className="lg:hidden flex flex-col gap-3 mb-8">
              {phoneHref && (
                <a href={phoneHref} className="group flex items-center justify-between w-full bg-zinc-900 text-white px-6 py-4 rounded-xl leading-none font-mono text-sm font-semibold uppercase tracking-widest shadow-sm border border-zinc-900 hover:bg-orange-500 hover:border-orange-500 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
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

            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
              <section className="p-6 lg:p-8">
                <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-6 pb-4 border-b border-zinc-100">Contact Details</h3>

                <div className="space-y-5">
                  {business.contact.phone && (
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-zinc-400 mb-1.5">Phone</p>
                      <a href={phoneHref} className="text-[15px] font-medium text-zinc-900 hover:text-orange-600 transition-colors block">{business.contact.phone}</a>
                    </div>
                  )}
                  {business.contact.website && (
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-zinc-400 mb-1.5">Website</p>
                      <a href={websiteHref} target="_blank" rel="noopener noreferrer" className="text-[15px] font-medium text-zinc-900 hover:text-orange-600 transition-colors block break-all">
                        {business.contact.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </a>
                    </div>
                  )}
                  {business.contact.email && (
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-zinc-400 mb-1.5">Email</p>
                      <a href={`mailto:${business.contact.email}`} className="text-[15px] font-medium text-zinc-900 hover:text-orange-600 transition-colors block break-all">
                        {business.contact.email}
                      </a>
                    </div>
                  )}
                  <div className="pt-5 mt-5 border-t border-zinc-100">
                      <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-zinc-400 mb-2">HQ Location</p>
                      <p className="text-[15px] font-medium text-zinc-700 leading-tight">{business.contact.address || `${city.name}, BC`}</p>
                  </div>
                </div>
              </section>

              {hours.length > 0 && (
                <section className="p-6 lg:p-8 border-t border-zinc-100 bg-zinc-50/50">
                  <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-5">Operating Hours</h3>
                  <ul className="space-y-2.5">
                    {hours.map(([day, dayHours]) => (
                      <li key={day} className="flex justify-between items-center text-[13px]">
                        <span className="font-mono text-zinc-500 uppercase tracking-wide">{day}</span>
                        <span className={`font-medium ${dayHours === 'Closed' ? 'text-zinc-400' : 'text-zinc-900'}`}>{dayHours}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="p-6 lg:p-8 border-t border-zinc-100">
                <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-5">Service Zones</h3>
                <div className="flex flex-wrap gap-1.5">
                  {serviceAreas.map((area, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded-md text-[11px] font-medium tracking-wide">
                      {area}
                    </span>
                  ))}
                </div>
              </section>
            </div>

            {mapEmbedUrl && (
              <section className="bg-white border border-zinc-200 p-1.5 rounded-xl shadow-sm">
                <div className="relative">
                  <div className="absolute inset-0 border border-zinc-200 rounded-lg z-10 pointer-events-none mix-blend-overlay"></div>
                  <iframe
                    src={mapEmbedUrl}
                    title={`${business.name} location map`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-[280px] rounded-lg"
                  />
                  <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="absolute bottom-3 right-3 z-20 bg-zinc-900/90 backdrop-blur-md px-3.5 py-2 rounded-lg text-[11px] font-mono font-bold uppercase tracking-widest text-white shadow-sm hover:bg-orange-500 hover:-translate-y-0.5 hover:shadow-md transition-all flex items-center gap-2">
                    <Navigation className="w-3 h-3" /> Get Directions
                  </a>
                </div>
              </section>
            )}

            <div className="mt-8 bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              <div className="p-6 lg:p-8 relative z-10">
                <AlertCircle className="w-5 h-5 text-zinc-400 mb-4" />
                <h4 className="font-mono font-bold text-[11px] text-zinc-900 uppercase tracking-widest mb-2">Is this your business?</h4>
                <p className="text-[13px] text-zinc-500 mb-6 font-medium leading-relaxed tracking-wide text-pretty">Claim this page to update your services, hours, and contact info.</p>
                <div className="space-y-3">
                  <Link to={`/claim?businessId=${encodeURIComponent(business.id)}`} className="group/btn flex items-center justify-between w-full bg-zinc-900 text-white rounded-lg shadow-sm px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-widest hover:bg-orange-500 hover:-translate-y-0.5 hover:shadow-md transition-all">
                    <span>Claim Business</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link to="/never-miss-a-lead" className="group/btn flex items-center justify-between w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-widest text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 hover:-translate-y-0.5 hover:shadow-sm hover:bg-zinc-50 transition-all">
                    <span>Handling Leads?</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
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
