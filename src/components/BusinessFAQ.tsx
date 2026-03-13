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
    <section className="py-24 sm:py-32 lg:py-44 bg-white border-b border-zinc-100 relative overflow-hidden">
      {/* Sleek decorative background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          <div className="lg:w-1/3">
            <div className="sticky top-32">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-600 mb-8 shadow-sm">
                <HelpCircle className="w-3.5 h-3.5 text-orange-500" strokeWidth={2.5} /> {eyebrow}
              </div>
              <h2 className="text-4xl lg:text-6xl font-bold uppercase tracking-tighter text-zinc-900 mb-8 leading-[1.05]">
                Common <br /> <span className="font-serif italic font-light text-zinc-400 normal-case">Inquiries.</span>
              </h2>
              <p className="text-zinc-500 text-lg leading-relaxed font-medium max-w-sm">
                Everything you need to know about scaling your regional trade presence through our verified directory.
              </p>
            </div>
          </div>

          <div className="lg:w-2/3 space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={faq.question} 
                className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 ${activeIndex === index ? 'bg-[#FAFAFA] border-zinc-200 shadow-xl shadow-zinc-200/40' : 'bg-white border-zinc-100 hover:border-zinc-200 hover:shadow-lg hover:shadow-zinc-200/30'}`}
              >
                <button
                  onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                  className="w-full text-left px-8 py-8 flex items-center justify-between gap-6 group/btn"
                >
                  <span className={`text-xl font-bold uppercase tracking-tight transition-colors duration-300 ${activeIndex === index ? 'text-zinc-900' : 'text-zinc-500 group-hover/btn:text-zinc-900'}`}>
                    {faq.question}
                  </span>
                  <div className={`shrink-0 w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-500 ${activeIndex === index ? 'bg-zinc-900 border-zinc-900 text-white rotate-180' : 'bg-zinc-50 border-zinc-200 text-zinc-400 group-hover/btn:border-zinc-900 group-hover/btn:text-zinc-900 group-hover/btn:bg-white'}`}>
                    <ChevronDown className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                </button>
                
                <AnimatePresence>
                  {activeIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="px-8 pb-10">
                        <div className="h-px bg-zinc-200 mb-8 w-12 rounded-full"></div>
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
