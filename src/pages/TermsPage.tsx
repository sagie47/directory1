import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { LayoutGrid } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

export default function TermsPage() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#FAFAFA] min-h-screen py-24 text-zinc-900 font-sans relative"
    >
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #f4f4f5 1px, transparent 1px), linear-gradient(to bottom, #f4f4f5 1px, transparent 1px)', backgroundSize: '4rem 4rem' }}></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-12 border-b border-zinc-200 pb-6">
          <div className="inline-flex items-center gap-2 border border-zinc-200 bg-white text-zinc-600 px-3 py-1.5 font-mono text-[10px] tracking-[0.15em] mb-6 uppercase rounded-sm shadow-sm">
            <LayoutGrid className="h-3.5 w-3.5 text-zinc-400" strokeWidth={1.5} /> Documentation
          </div>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">Terms of Service</h1>
          <p className="text-zinc-500 font-mono text-[10px] tracking-[0.15em] uppercase">Last updated: March 2026</p>
        </div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          <motion.section variants={itemVariants} className="bg-white border border-zinc-200 p-8 rounded-sm shadow-sm">
            <h2 className="text-xl font-medium tracking-tight text-zinc-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-zinc-600 leading-relaxed text-sm">
              By accessing and using Okanagan Trades, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </motion.section>

          <motion.section variants={itemVariants} className="bg-white border border-zinc-200 p-8 rounded-sm shadow-sm">
            <h2 className="text-xl font-medium tracking-tight text-zinc-900 mb-4">2. Description of Service</h2>
            <p className="text-zinc-600 leading-relaxed mb-4 text-sm">
              Okanagan Trades provides a directory service connecting users with trades professionals across the Okanagan Valley. 
              We list contractor information including contact details, ratings, and service areas.
            </p>
            <p className="text-zinc-600 leading-relaxed text-sm">
              We strive to maintain accurate information but cannot guarantee the completeness or accuracy of all listings.
            </p>
          </motion.section>

          <motion.section variants={itemVariants} className="bg-white border border-zinc-200 p-8 rounded-sm shadow-sm">
            <h2 className="text-xl font-medium tracking-tight text-zinc-900 mb-4">3. User Responsibilities</h2>
            <p className="text-zinc-600 leading-relaxed mb-4 text-sm">
              You agree to use this service for lawful purposes only. You may not:
            </p>
            <ul className="list-disc list-inside text-zinc-600 leading-relaxed space-y-2 text-sm ml-2">
              <li>Submit false or misleading business information</li>
              <li>Attempt to gain unauthorized access to any part of the service</li>
              <li>Use the service for any illegal or unauthorized purpose</li>
              <li>Interfere with the proper operation of the platform</li>
            </ul>
          </motion.section>

          <motion.section variants={itemVariants} className="bg-white border border-zinc-200 p-8 rounded-sm shadow-sm">
            <h2 className="text-xl font-medium tracking-tight text-zinc-900 mb-4">4. Business Listings</h2>
            <p className="text-zinc-600 leading-relaxed mb-4 text-sm">
              Listed businesses are responsible for the accuracy of their information. Okanagan Trades reserves the right 
              to remove or modify listings at our sole discretion.
            </p>
            <p className="text-zinc-600 leading-relaxed text-sm">
              Inclusion in the directory does not constitute endorsement or recommendation by Okanagan Trades.
            </p>
          </motion.section>

          <motion.section variants={itemVariants} className="bg-white border border-zinc-200 p-8 rounded-sm shadow-sm">
            <h2 className="text-xl font-medium tracking-tight text-zinc-900 mb-4">5. Limitation of Liability</h2>
            <p className="text-zinc-600 leading-relaxed mb-4 text-sm">
              Okanagan Trades is provided "as is" without warranties of any kind. We do not guarantee:
            </p>
            <ul className="list-disc list-inside text-zinc-600 leading-relaxed space-y-2 text-sm ml-2">
              <li>The accuracy or completeness of any listing</li>
              <li>The quality of work performed by listed businesses</li>
              <li>The availability of any business at any given time</li>
            </ul>
          </motion.section>

          <motion.section variants={itemVariants} className="bg-white border border-zinc-200 p-8 rounded-sm shadow-sm">
            <h2 className="text-xl font-medium tracking-tight text-zinc-900 mb-4">6. Intellectual Property</h2>
            <p className="text-zinc-600 leading-relaxed text-sm">
              All content on this website, including logos, text, and design, is the property of Okanagan Trades 
              and may not be reproduced without prior written consent.
            </p>
          </motion.section>

          <motion.section variants={itemVariants} className="bg-white border border-zinc-200 p-8 rounded-sm shadow-sm">
            <h2 className="text-xl font-medium tracking-tight text-zinc-900 mb-4">7. Changes to Terms</h2>
            <p className="text-zinc-600 leading-relaxed text-sm">
              We reserve the right to modify these terms at any time. Continued use of the service constitutes 
              acceptance of any changes.
            </p>
          </motion.section>

          <motion.section variants={itemVariants} className="bg-white border border-zinc-200 p-8 rounded-sm shadow-sm">
            <h2 className="text-xl font-medium tracking-tight text-zinc-900 mb-4">8. Contact Information</h2>
            <p className="text-zinc-600 leading-relaxed mb-6 text-sm">
              For questions about these terms, please contact us.
            </p>
            <div className="flex gap-4">
              <Link to="/contact" className="inline-block bg-zinc-900 text-white px-6 py-3 font-sans text-sm font-medium hover:bg-zinc-800 transition-colors rounded-sm shadow-sm">
                Contact Us
              </Link>
            </div>
          </motion.section>
        </motion.div>
      </div>
    </motion.div>
  );
}
