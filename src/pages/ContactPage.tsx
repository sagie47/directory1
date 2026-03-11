import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, ArrowRight, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#FAFAFA] min-h-screen py-24 text-zinc-900 font-sans relative"
    >
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #f4f4f5 1px, transparent 1px), linear-gradient(to bottom, #f4f4f5 1px, transparent 1px)', backgroundSize: '4rem 4rem' }}></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 border border-zinc-200 bg-white text-zinc-600 px-3 py-1.5 font-mono text-[10px] tracking-[0.15em] font-semibold mb-8 uppercase rounded-sm shadow-sm">
            <MessageSquare className="h-3.5 w-3.5 text-zinc-400" strokeWidth={1.5} /> Get in Touch
          </div>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
            Contact Us
          </h1>
          <p className="text-zinc-600 font-sans text-lg max-w-xl mx-auto leading-relaxed">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="bg-white border border-zinc-200 p-8 rounded-sm shadow-sm">
              <h2 className="text-xl font-medium tracking-tight text-zinc-900 mb-6">Directory Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#FAFAFA] border border-zinc-100 flex items-center justify-center shrink-0 rounded-sm">
                    <MapPin className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.1em] text-zinc-500 uppercase mb-1">Location</p>
                    <p className="text-zinc-700 text-sm leading-relaxed font-medium">
                      Okanagan Valley<br />
                      British Columbia, Canada
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#FAFAFA] border border-zinc-100 flex items-center justify-center shrink-0 rounded-sm">
                    <Mail className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.1em] text-zinc-500 uppercase mb-1">Email</p>
                    <p className="text-zinc-700 text-sm leading-relaxed font-medium">
                      info@okanagantrades.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#FAFAFA] border border-zinc-100 flex items-center justify-center shrink-0 rounded-sm">
                    <Phone className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.1em] text-zinc-500 uppercase mb-1">Phone</p>
                    <p className="text-zinc-700 text-sm leading-relaxed font-medium">
                      (250) 555-0000
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="bg-white border border-zinc-200 p-8 rounded-sm shadow-sm">
              <h2 className="text-xl font-medium tracking-tight text-zinc-900 mb-4">Quick Links</h2>
              <ul className="space-y-4">
                <li>
                  <Link to="/signup" className="text-zinc-600 hover:text-zinc-900 text-sm transition-colors flex items-center gap-2 group">
                    <ArrowRight className="h-3 w-3 text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-all" strokeWidth={1.5} />
                    List Your Business
                  </Link>
                </li>
                <li>
                  <Link to="/verified" className="text-zinc-600 hover:text-zinc-900 text-sm transition-colors flex items-center gap-2 group">
                    <ArrowRight className="h-3 w-3 text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-all" strokeWidth={1.5} />
                    Browse Verified Companies
                  </Link>
                </li>
                <li>
                  <Link to="/regions" className="text-zinc-600 hover:text-zinc-900 text-sm transition-colors flex items-center gap-2 group">
                    <ArrowRight className="h-3 w-3 text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-all" strokeWidth={1.5} />
                    Browse by Region
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-zinc-600 hover:text-zinc-900 text-sm transition-colors flex items-center gap-2 group">
                    <ArrowRight className="h-3 w-3 text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-all" strokeWidth={1.5} />
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-zinc-600 hover:text-zinc-900 text-sm transition-colors flex items-center gap-2 group">
                    <ArrowRight className="h-3 w-3 text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-all" strokeWidth={1.5} />
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="bg-white border border-zinc-200 p-8 md:p-12 shadow-sm rounded-sm">
              {submitted ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-zinc-50 border border-zinc-200 flex items-center justify-center mx-auto mb-6 rounded-sm shadow-sm">
                    <ArrowRight className="h-6 w-6 text-zinc-900" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-2xl font-medium text-zinc-900 tracking-tight mb-2">Message Transmitted!</h2>
                  <p className="text-zinc-600 mb-8 max-w-md mx-auto">
                    Thank you for reaching out. We will process your request and respond accordingly.
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="text-zinc-900 hover:text-zinc-600 font-sans text-sm font-medium transition-colors underline decoration-zinc-300 underline-offset-4"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <h2 className="text-xl font-medium tracking-tight text-zinc-900 mb-6 border-b border-zinc-100 pb-4">Communication Interface</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block font-sans text-sm font-medium text-zinc-700 mb-2">First Name</label>
                        <input 
                          type="text" 
                          required
                          className="w-full border border-zinc-200 bg-[#FAFAFA] px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors rounded-sm"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block font-sans text-sm font-medium text-zinc-700 mb-2">Last Name</label>
                        <input 
                          type="text" 
                          required
                          className="w-full border border-zinc-200 bg-[#FAFAFA] px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors rounded-sm"
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block font-sans text-sm font-medium text-zinc-700 mb-2">Email Address</label>
                        <input 
                          type="email" 
                          required
                          className="w-full border border-zinc-200 bg-[#FAFAFA] px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors rounded-sm"
                          placeholder="john@enterprise.com"
                        />
                      </div>
                      <div>
                        <label className="block font-sans text-sm font-medium text-zinc-700 mb-2">Phone (Optional)</label>
                        <input 
                          type="tel" 
                          className="w-full border border-zinc-200 bg-[#FAFAFA] px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors rounded-sm"
                          placeholder="(250) 555-0000"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-sans text-sm font-medium text-zinc-700 mb-2">Subject</label>
                    <select 
                      required
                      className="w-full border border-zinc-200 bg-[#FAFAFA] px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors appearance-none rounded-sm cursor-pointer"
                    >
                      <option value="" disabled selected>Select a subject classification</option>
                      <option value="general">General Inquiry</option>
                      <option value="listing">Business Listing</option>
                      <option value="support">Technical Support</option>
                      <option value="advertising">Advertising</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-sans text-sm font-medium text-zinc-700 mb-2">Message</label>
                    <textarea 
                      required
                      rows={6}
                      className="w-full border border-zinc-200 bg-[#FAFAFA] px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-colors resize-none rounded-sm"
                      placeholder="Detail your request here."
                    />
                  </div>

                  <div className="pt-4">
                    <button type="submit" className="w-full bg-zinc-900 text-white px-8 py-4 font-sans text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 rounded-sm shadow-sm group">
                      Transmit Message <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
                    </button>
                    <p className="text-center text-zinc-400 text-xs mt-4">
                      By submitting this form, you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </div>
                </form>
              )}
            </motion.div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
