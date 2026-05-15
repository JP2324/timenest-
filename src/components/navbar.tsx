import { motion, AnimatePresence } from 'motion/react';
import { Lock, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState, useEffect } from 'react';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-500",
        scrolled ? "py-3 md:py-4" : "py-6"
      )}
    >
      <nav className={cn(
        "flex items-center justify-between w-full max-w-5xl px-5 md:px-6 py-3 rounded-[2rem] transition-all duration-500",
        scrolled ? "bg-white/70 backdrop-blur-xl shadow-sm border border-black/5" : "bg-transparent border-transparent"
      )}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand text-white flex flex-col items-center justify-center shadow-md">
            <Lock className="w-4 h-4 ml-[1px] mb-[1px]" />
          </div>
          <span className="font-semibold tracking-tight text-lg text-ink">TimeNest</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-ink-muted">
          <a href="#features" className="hover:text-ink transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-ink transition-colors">Concept</a>
          <a href="#use-cases" className="hover:text-ink transition-colors">Archive</a>
        </div>

        <div className="hidden md:flex items-center gap-4 text-sm font-medium">
          <button className="hidden md:flex items-center gap-2 hover:text-brand text-[13px] transition-colors font-medium text-ink">
            Sign In
          </button>
          <button className="px-5 py-2.5 bg-ink text-white rounded-full text-[13px] font-medium hover:bg-black transition-transform hover:scale-105 active:scale-95 shadow-sm">
            Create Capsule
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden w-10 h-10 flex flex-col items-center justify-center text-ink"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>
    </motion.header>

    {/* Mobile Menu Popup */}
    <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-x-4 top-20 z-40 md:hidden bg-white/95 backdrop-blur-2xl rounded-[2rem] p-6 shadow-2xl border border-black/5 flex flex-col gap-6"
        >
          <div className="flex flex-col gap-4 text-center">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-ink p-2">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-ink p-2">Concept</a>
            <a href="#use-cases" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-ink p-2">Archive</a>
          </div>
          <div className="flex flex-col gap-3 pt-4 border-t border-black/5">
            <button className="w-full py-3.5 text-ink font-medium rounded-2xl hover:bg-black/5 transition-colors">
              Sign In
            </button>
            <button className="w-full py-3.5 bg-brand text-white font-medium rounded-[1.5rem] shadow-md hover:bg-brand-light transition-colors">
              Create Capsule
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
