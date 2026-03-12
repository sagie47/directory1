import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useState } from 'react';

interface FAQ {
  question: string;
  answer: string;
}

interface BusinessFAQProps {
  faqs: FAQ[];
  title?: string;
  eyebrow?: string;
}

export default function BusinessFAQ({ faqs, title = "Frequently Asked Questions", eyebrow = "Support" }: BusinessFAQProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  return (
    <section className="py-32 bg-white border-b border-zinc-200 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPC9zdmc+')] opacity-50 mix-blend-overlay"></div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row gap-16 lg:gap-24">
          <div className="md:w-1/3">
            <div className="sticky top-32">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 text-orange-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-6 rounded-full border border-orange-500/20">
                <HelpCircle className="w-3.5 h-3.5" /> {eyebrow}
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold uppercase tracking-tighter text-zinc-900 mb-6 leading-[1.1]">
                Common <br /> <span className="font-serif italic font-light text-zinc-400 normal-case">Inquiries.</span>
              </h2>
              <p className="text-zinc-500 text-lg leading-relaxed font-medium">
                Everything you need to know about scaling your regional trade presence.
              </p>
            </div>
          </div>

          <div className="md:w-2/3 space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={faq.question} 
                className={`group border rounded-sm transition-all duration-500 overflow-hidden ${activeIndex === index ? 'bg-zinc-50 border-zinc-200 shadow-sm' : 'bg-white border-zinc-100 hover:border-zinc-300'}`}
              >
                <button
                  onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                  className="w-full text-left px-8 py-7 flex items-center justify-between gap-4 group/btn"
                >
                  <span className={`text-xl font-bold uppercase tracking-tight transition-colors duration-300 ${activeIndex === index ? 'text-zinc-900' : 'text-zinc-500 group-hover/btn:text-zinc-900'}`}>
                    {faq.question}
                  </span>
                  <div className={`shrink-0 w-8 h-8 rounded-sm border flex items-center justify-center transition-all duration-500 ${activeIndex === index ? 'bg-zinc-900 border-zinc-900 text-white rotate-180' : 'border-zinc-200 text-zinc-400 group-hover/btn:border-zinc-900 group-hover/btn:text-zinc-900'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                
                <AnimatePresence>
                  {activeIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="px-8 pb-8">
                        <div className="h-px bg-zinc-200 mb-6 w-12"></div>
                        <p className="text-zinc-600 text-lg font-medium leading-relaxed max-w-2xl">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
