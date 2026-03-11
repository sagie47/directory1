import { Link } from 'react-router-dom';
import { ArrowRight, Activity } from 'lucide-react';
import { motion } from 'motion/react';

export default function SignupPage() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#FAFAFA] min-h-screen py-24 text-zinc-900 font-sans relative"
    >
      <div className="absolute inset-0 z-0 opacity-50 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #f4f4f5 1px, transparent 1px), linear-gradient(to bottom, #f4f4f5 1px, transparent 1px)', backgroundSize: '4rem 4rem' }}></div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 border border-zinc-200 bg-white text-zinc-600 px-3 py-1.5 font-mono text-[10px] tracking-[0.15em] mb-8 uppercase rounded-sm shadow-sm">
            <Activity className="h-3.5 w-3.5 text-zinc-400" strokeWidth={1.5} /> Contractor Portal
          </div>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
            Initialize Asset Profile
          </h1>
          <p className="text-zinc-500 font-sans text-lg max-w-xl mx-auto leading-relaxed">
            Join the region's most precise operational directory for verified professionals.
          </p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="bg-white border border-zinc-200 p-8 md:p-12 shadow-sm rounded-sm">
          <form className="space-y-10">
            
            {/* Business Details */}
            <div>
              <h2 className="text-lg font-medium tracking-tight text-zinc-900 mb-6 border-b border-zinc-100 pb-4">Business Parameters</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block font-sans text-sm font-medium text-zinc-700 mb-2">Registered Entity Name</label>
                  <input 
                    type="text" 
                    className="w-full border border-zinc-200 bg-[#FAFAFA] px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors rounded-sm"
                    placeholder="e.g. Okanagan Electric Ltd."
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm font-medium text-zinc-700 mb-2">Primary Trade Classification</label>
                  <select className="w-full border border-zinc-200 bg-[#FAFAFA] px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors appearance-none rounded-sm cursor-pointer">
                    <option value="" disabled selected>Select Category</option>
                    <option value="electricians">Electricians</option>
                    <option value="plumbers">Plumbers</option>
                    <option value="general-contractors">General Contractors</option>
                    <option value="roofing">Roofing</option>
                  </select>
                </div>
                <div>
                  <label className="block font-sans text-sm font-medium text-zinc-700 mb-2">Operational Base</label>
                  <select className="w-full border border-zinc-200 bg-[#FAFAFA] px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors appearance-none rounded-sm cursor-pointer">
                    <option value="" disabled selected>Select Region</option>
                    <option value="kelowna">Kelowna</option>
                    <option value="vernon">Vernon</option>
                    <option value="penticton">Penticton</option>
                    <option value="west-kelowna">West Kelowna</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div>
              <h2 className="text-lg font-medium tracking-tight text-zinc-900 mb-6 border-b border-zinc-100 pb-4">Communication Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-sans text-sm font-medium text-zinc-700 mb-2">Primary Contact Number</label>
                  <input 
                    type="tel" 
                    className="w-full border border-zinc-200 bg-[#FAFAFA] px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors rounded-sm"
                    placeholder="(250) 555-0000"
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm font-medium text-zinc-700 mb-2">Official Email Address</label>
                  <input 
                    type="email" 
                    className="w-full border border-zinc-200 bg-[#FAFAFA] px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors rounded-sm"
                    placeholder="contact@enterprise.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-sans text-sm font-medium text-zinc-700 mb-2">Digital Presence (Website URL)</label>
                  <input 
                    type="url" 
                    className="w-full border border-zinc-200 bg-[#FAFAFA] px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors rounded-sm"
                    placeholder="https://www.enterprise.com"
                  />
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div>
              <h2 className="text-lg font-medium tracking-tight text-zinc-900 mb-6 border-b border-zinc-100 pb-4">Security Credentials</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-sans text-sm font-medium text-zinc-700 mb-2">Access Key</label>
                  <input 
                    type="password" 
                    className="w-full border border-zinc-200 bg-[#FAFAFA] px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors rounded-sm"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block font-sans text-sm font-medium text-zinc-700 mb-2">Verify Access Key</label>
                  <input 
                    type="password" 
                    className="w-full border border-zinc-200 bg-[#FAFAFA] px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors rounded-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button type="button" className="w-full bg-zinc-900 text-white px-8 py-4 font-sans text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 rounded-sm shadow-sm group">
                Deploy Profile <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
              </button>
              <p className="text-center text-zinc-400 text-xs mt-4">
                By initializing this profile, you agree to our structural Terms of Service and Privacy Policy.
              </p>
            </div>

          </form>
        </motion.div>

      </div>
    </motion.div>
  );
}
