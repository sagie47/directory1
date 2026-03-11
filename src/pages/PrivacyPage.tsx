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

export default function PrivacyPage() {
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
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-zinc-500 font-mono text-[10px] tracking-[0.15em] uppercase">Last updated: March 2026</p>
        </div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          <motion.section variants={itemVariants} className="bg-white border border-zinc-200 p-8 rounded-sm shadow-sm">
            <h2 className="text-xl font-medium tracking-tight text-zinc-900 mb-4">1. Information We Collect</h2>
            <p className="text-zinc-600 leading-relaxed mb-4 text-sm">
              Okanagan Trades collects information to provide and improve our directory service. This includes:
            </p>
            <ul className="list-disc list-inside text-zinc-600 leading-relaxed space-y-2 text-sm ml-2">
              <li><strong>Business Information:</strong> Contact details, service areas, ratings, and descriptions provided by businesses</li>
              <li><strong>Public Data:</strong> Business listings from public sources such as Google Maps</li>
              <li><strong>Usage Data:</strong> Anonymous analytics about how visitors use our site</li>
            </ul>
          </motion.section>

          <motion.section variants={itemVariants} className="bg-white border border-zinc-200 p-8 rounded-sm shadow-sm">
            <h2 className="text-xl font-medium tracking-tight text-zinc-900 mb-4">2. How We Use Information</h2>
            <p className="text-zinc-600 leading-relaxed mb-4 text-sm">
              We use collected information for the following purposes:
            </p>
            <ul className="list-disc list-inside text-zinc-600 leading-relaxed space-y-2 text-sm ml-2">
              <li>Providing directory services to users seeking trades professionals</li>
              <li>Displaying business information including contact details and ratings</li>
              <li>Improving our website and user experience</li>
              <li>Responding to user inquiries and support requests</li>
            </ul>
          </motion.section>

          <motion.section variants={itemVariants} className="bg-white border border-zinc-200 p-8 rounded-sm shadow-sm">
            <h2 className="text-xl font-medium tracking-tight text-zinc-900 mb-4">3. Information Sharing</h2>
            <p className="text-zinc-600 leading-relaxed mb-4 text-sm">
              We may share information in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-zinc-600 leading-relaxed space-y-2 text-sm ml-2">
              <li><strong>With Users:</strong> Business information is publicly displayed in our directory</li>
              <li><strong>Service Providers:</strong> We may use third-party services for hosting and analytics</li>
              <li><strong>Legal Requirements:</strong> When required by law or in response to valid requests</li>
            </ul>
          </motion.section>

          <motion.section variants={itemVariants} className="bg-white border border-zinc-200 p-8 rounded-sm shadow-sm">
            <h2 className="text-xl font-medium tracking-tight text-zinc-900 mb-4">4. Data Security</h2>
            <p className="text-zinc-600 leading-relaxed mb-4 text-sm">
              We implement appropriate security measures to protect your information. However, no method of 
              transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
            <p className="text-zinc-600 leading-relaxed text-sm">
              We use industry-standard encryption and security practices to protect data in our possession.
            </p>
          </motion.section>

          <motion.section variants={itemVariants} className="bg-white border border-zinc-200 p-8 rounded-sm shadow-sm">
            <h2 className="text-xl font-medium tracking-tight text-zinc-900 mb-4">5. Cookies and Tracking</h2>
            <p className="text-zinc-600 leading-relaxed mb-4 text-sm">
              Our website may use cookies and similar tracking technologies to:
            </p>
            <ul className="list-disc list-inside text-zinc-600 leading-relaxed space-y-2 text-sm ml-2">
              <li>Understand user preferences and improve experience</li>
              <li>Analyze traffic and usage patterns</li>
              <li>Remember your preferences for future visits</li>
            </ul>
          </motion.section>

          <motion.section variants={itemVariants} className="bg-white border border-zinc-200 p-8 rounded-sm shadow-sm">
            <h2 className="text-xl font-medium tracking-tight text-zinc-900 mb-4">6. Third-Party Links</h2>
            <p className="text-zinc-600 leading-relaxed mb-4 text-sm">
              Our website contains links to third-party websites, including business websites. We are not 
              responsible for the privacy practices of these external sites.
            </p>
            <p className="text-zinc-600 leading-relaxed text-sm">
              We encourage you to review the privacy policies of any third-party sites you visit.
            </p>
          </motion.section>

          <motion.section variants={itemVariants} className="bg-white border border-zinc-200 p-8 rounded-sm shadow-sm">
            <h2 className="text-xl font-medium tracking-tight text-zinc-900 mb-4">7. Children's Privacy</h2>
            <p className="text-zinc-600 leading-relaxed text-sm">
              Our service is not intended for children under 13. We do not knowingly collect personal information 
              from children under 13.
            </p>
          </motion.section>

          <motion.section variants={itemVariants} className="bg-white border border-zinc-200 p-8 rounded-sm shadow-sm">
            <h2 className="text-xl font-medium tracking-tight text-zinc-900 mb-4">8. Your Rights</h2>
            <p className="text-zinc-600 leading-relaxed mb-4 text-sm">
              Depending on your location, you may have rights regarding your information, including:
            </p>
            <ul className="list-disc list-inside text-zinc-600 leading-relaxed space-y-2 text-sm ml-2">
              <li>Access to personal information we hold about you</li>
              <li>Correction of inaccurate personal information</li>
              <li>Deletion of personal information in certain circumstances</li>
              <li>Opt-out of certain data collection or uses</li>
            </ul>
          </motion.section>

          <motion.section variants={itemVariants} className="bg-white border border-zinc-200 p-8 rounded-sm shadow-sm">
            <h2 className="text-xl font-medium tracking-tight text-zinc-900 mb-4">9. Changes to Policy</h2>
            <p className="text-zinc-600 leading-relaxed mb-4 text-sm">
              We may update this privacy policy periodically. We will post any changes on this page and 
              update the "Last updated" date.
            </p>
            <p className="text-zinc-600 leading-relaxed text-sm">
              We encourage you to review this policy regularly to stay informed about our practices.
            </p>
          </motion.section>

          <motion.section variants={itemVariants} className="bg-white border border-zinc-200 p-8 rounded-sm shadow-sm">
            <h2 className="text-xl font-medium tracking-tight text-zinc-900 mb-4">10. Contact Us</h2>
            <p className="text-zinc-600 leading-relaxed mb-6 text-sm">
              For questions about this privacy policy or to exercise your rights, please contact us.
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
