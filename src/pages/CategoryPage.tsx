import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { MapPin, ArrowRight, Search } from 'lucide-react';
import * as Icons from 'lucide-react';
import BusinessCard from '../components/BusinessCard';
import Breadcrumbs from '../components/Breadcrumbs';
import Seo from '../components/Seo';
import { motion } from 'motion/react';
import { Business, businessServesCity } from '../business';
import { getCategoryHeroFallbackImage, getCategoryHeroImage } from '../category-hero-images';
import { useDirectoryData } from '../directory-data';
import { createImageFallbackHandler } from '../supabase-images';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

export default function CategoryPage() {
  const { cityId, categoryId } = useParams<{ cityId: string, categoryId: string }>();
  const { cities, categories, businesses, isLoading } = useDirectoryData();
  const [sortBy, setSortBy] = useState('Highest Rated');

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#FAFAFA] px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900"></div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Loading category</p>
        </div>
      </div>
    );
  }
  
  const city = cities.find(c => c.id === cityId);
  const category = categories.find(c => c.id === categoryId);

  if (!city || !category) {
    return <Navigate to="/" replace />;
  }

  const filteredBusinesses = businesses.filter(
    (business) => business.categoryId === categoryId && businessServesCity(business, city.id, city.name)
  ) as Business[];

  const categoryBusinesses = [...filteredBusinesses].sort((left, right) => {
    if (sortBy === 'Most Reviewed') {
      return (right.reviewCount ?? 0) - (left.reviewCount ?? 0);
    }

    if (sortBy === 'A-Z') {
      return left.name.localeCompare(right.name);
    }

    return (right.rating ?? 0) - (left.rating ?? 0) || (right.reviewCount ?? 0) - (left.reviewCount ?? 0);
  });

  const IconComponent = (Icons as any)[category.icon] || Icons.Wrench;
  const heroImage = getCategoryHeroImage({
    categoryId: category.id,
    groupId: category.groupId,
    cityId: city.id,
    businesses,
  });
  const categoryHeroFallback = getCategoryHeroFallbackImage({
    groupId: category.groupId,
    cityId: city.id,
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#FAFAFA] min-h-screen text-zinc-900 font-sans"
    >
      <Seo
        title={`${category.name} in ${city.name} | Okanagan Trades`}
        description={`Browse verified ${category.name.toLowerCase()} professionals in ${city.name}. Compare businesses, reviews, and contact details.`}
        path={`/${city.id}/${category.id}`}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `${category.name} in ${city.name}`,
            description: `Browse verified ${category.name.toLowerCase()} professionals in ${city.name}.`,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: categoryBusinesses.slice(0, 10).map((business, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: `/${city.id}/${category.id}/${business.id}`,
              name: business.name,
            })),
          },
        ]}
      />

      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: city.name, to: `/${city.id}` },
          { label: category.name },
        ]}
      />

      {/* Category Hero */}
      <section className={`relative border-b-2 border-zinc-900 overflow-hidden py-24 md:py-32 flex items-center bg-zinc-900 text-white`}>
        {heroImage && (
          <div className="absolute inset-0 z-0">
            <motion.img 
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.6 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              src={heroImage}
              alt={city.name}
              className="w-full h-full object-cover"
              onError={createImageFallbackHandler(categoryHeroFallback)}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-900/40 to-transparent z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent z-10"></div>
          </div>
        )}

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col md:flex-row gap-12 items-start md:items-end justify-between">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-4xl text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-zinc-100 border border-white/20 font-mono text-[10px] tracking-[0.3em] uppercase px-4 py-2 mb-8 shadow-sm rounded-sm">
                <IconComponent className="w-3.5 h-3.5 text-zinc-300" strokeWidth={1.5} /> {category.name}
              </div>
              
              <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-medium tracking-tighter mb-8 leading-[1.05] drop-shadow-2xl uppercase">
                {category.name} <span className="font-serif italic font-light text-zinc-200 normal-case block md:inline">Experts.</span>
              </h1>

              <div className="text-xl md:text-2xl text-zinc-300 font-sans flex items-center gap-3 drop-shadow-md">
                <MapPin className="h-6 w-6 text-orange-500" strokeWidth={2} /> 
                <span>Verified Professionals in <strong className="text-white font-bold">{city.name}</strong></span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="shrink-0 flex flex-col items-start md:items-end gap-6">
              <Link to="/claim" className="inline-flex items-center justify-center gap-3 bg-white text-zinc-950 px-8 py-4 font-sans text-sm font-bold uppercase tracking-wider transition-all hover:bg-zinc-100 hover:-translate-y-1 active:scale-95 rounded-md shadow-xl group">
                List Your Business <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
              </Link>
              <p className="text-sm font-sans max-w-[240px] text-left md:text-right leading-relaxed text-zinc-400">
                Are you a verified {category.name.toLowerCase()} professional? Join the regional network.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Business Listings */}
      <section className="py-16 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4 border-b border-zinc-200 pb-6">
            <div className="font-mono text-[10px] tracking-[0.15em] text-zinc-500 uppercase">
              Results: {categoryBusinesses.length}
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-[10px] font-mono tracking-[0.15em] text-zinc-400 uppercase">Sort:</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="flex-1 sm:flex-none border border-zinc-200 bg-white px-4 py-2 text-sm font-sans text-zinc-900 outline-none focus:border-zinc-400 cursor-pointer transition-colors rounded-sm shadow-sm">
                <option>Highest Rated</option>
                <option>Most Reviewed</option>
                <option>A-Z</option>
              </select>
            </div>
          </div>

          {categoryBusinesses.length === 0 ? (
            <div className="bg-white border border-zinc-200 p-16 text-center rounded-sm shadow-sm">
              <div className="w-12 h-12 border border-zinc-200 bg-[#FAFAFA] flex items-center justify-center mx-auto mb-6 rounded-sm">
                <Search className="h-5 w-5 text-zinc-400" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-medium tracking-tight text-zinc-900 mb-4">No Data Found</h3>
              <p className="text-zinc-500 font-sans text-sm mb-8 max-w-md mx-auto leading-relaxed">We couldn't locate any {category.name.toLowerCase()} in {city.name} matching your criteria.</p>
              <Link to={`/${city.id}`} className="inline-flex items-center justify-center gap-2 bg-zinc-100 text-zinc-900 px-6 py-3 font-sans text-sm font-medium hover:bg-zinc-200 transition-colors rounded-sm shadow-sm">
                <ArrowRight className="h-4 w-4 rotate-180" strokeWidth={1.5} /> Return to {city.name}
              </Link>
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            >
              {categoryBusinesses.map((business) => (
                <motion.div key={business.id} variants={itemVariants} className="h-full">
                  <BusinessCard business={business} contextCityName={city.name} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </motion.div>
  );
}
