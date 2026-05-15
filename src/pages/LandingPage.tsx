import { Navbar } from '../components/navbar';
import { CountdownTimer } from '../components/countdown-timer';
import { InteractivePreview } from '../components/interactive-preview';
import { motion } from 'motion/react';
import { Users, LockKeyhole, MapPin, MailCheck, Lock } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper text-ink overflow-x-hidden selection:bg-brand selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 px-4 flex flex-col items-center text-center overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[10%] w-[40%] h-[60%] bg-brand opacity-[0.05] rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[10%] w-[30%] h-[50%] bg-[#D48995] opacity-[0.1] rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-grid-pattern mix-blend-overlay opacity-30"></div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 border border-brand/10 bg-white/50 backdrop-blur-md rounded-full shadow-sm text-brand text-[10px] md:text-xs font-semibold tracking-wide uppercase mb-10"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
          </span>
          Secure Digital Preservation
        </motion.div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[48px] md:text-[80px] lg:text-[100px] leading-[1.05] font-semibold tracking-tighter mb-6 max-w-5xl"
        >
           Preserve tomorrow. <br className="hidden md:block"/>
          <span className="text-brand-light">Today.</span>
        </motion.h1>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 md:mt-8 text-base md:text-xl text-ink-muted max-w-2xl mx-auto leading-relaxed"
        >
          Create a bridge to the future. Store your messages, media, and records in an encrypted vault that only reveals itself when the time is right.
        </motion.p>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 w-full max-w-2xl mx-auto flex flex-col items-center"
        >
          <CountdownTimer />
        </motion.div>

      </section>

      {/* Interactive UI Demo Section */}
      <section className="px-4 py-8 md:py-24 relative z-10 w-full flex items-center justify-center">
        <InteractivePreview />
      </section>

      {/* Features Grid - Clean & Minimal */}
      <section id="features" className="px-6 py-24 md:py-32 w-full flex justify-center bg-white border-y border-black/5 relative z-10">
        <div className="max-w-6xl w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-24 space-y-8 md:space-y-0">
             <h2 className="text-[32px] md:text-[56px] font-semibold leading-[1.1] tracking-tight max-w-2xl text-ink">
               Everything you need to <br className="hidden md:block"/><span className="text-brand">pause time.</span>
             </h2>
             <p className="text-ink-muted text-base md:text-lg max-w-xs md:text-right">
                Built with bank-grade encryption and reliable delivery systems so your legacy is safe.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              { 
                icon: LockKeyhole, 
                title: "Time-Based Locks",
                description: "Seal your capsules until a specific date. Perfect for birthdays, graduations, or speaking to your future self." 
              },
              { 
                icon: Users, 
                title: "Group Capabilities",
                description: "Organizations, clubs, and NGOs can collaborate to build collective capsules for milestones and campaigns." 
              },
              { 
                icon: MapPin, 
                title: "Location Unlocks",
                description: "Only allow access when the recipient reaches a specific geographic coordinate. Turn memories into a treasure hunt." 
              },
              { 
                icon: MailCheck, 
                title: "Assured Delivery",
                description: "Recipients are notified instantly when a capsule becomes available to them. You'll know when they open it." 
              }
            ].map((feature, idx) => (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                key={feature.title} 
                className="group border border-black/5 p-8 rounded-[2rem] bg-paper hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-brand mb-8 group-hover:scale-110 transition-transform">
                  <feature.icon strokeWidth={2} className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-ink">{feature.title}</h3>
                  <p className="text-[13px] text-ink-muted leading-relaxed mt-3">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Epic CTA Section */}
      <section className="px-6 py-32 md:py-40 flex justify-center text-center relative overflow-hidden bg-paper">
        <div className="max-w-3xl relative z-10 space-y-10">
          <h2 className="text-[40px] md:text-[80px] font-semibold leading-[1.05] tracking-tight">
            Ready to <span className="text-brand">start?</span>
          </h2>
          <p className="text-base md:text-xl text-ink-muted max-w-lg mx-auto leading-relaxed">
            Join thousands of individuals and organizations who are safely storing their most valuable moments for the future.
          </p>
          <div className="pt-8">
             <button className="px-8 py-4 bg-ink text-white rounded-full text-base font-semibold transition-all hover:bg-black hover:scale-105 active:scale-95 shadow-xl">
                Create Free Capsule
             </button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="w-full bg-white pt-12 pb-12 border-t border-black/5 z-10 relative">
        <div className="w-full max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-0 md:divide-x divide-black/5">
          <div className="flex flex-col justify-center md:px-8">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-ink-muted mb-3">Platform</span>
            <div className="flex flex-col gap-1 text-sm font-semibold text-ink">
               TimeNest
               <span className="font-normal text-ink-muted text-[11px]">v1.2.0</span>
            </div>
          </div>
          
          <div className="flex flex-col justify-center md:px-8">
             <span className="text-[10px] uppercase font-semibold tracking-wider text-ink-muted mb-3">Legal</span>
             <div className="flex flex-col gap-3">
               <a href="#" className="text-[13px] font-medium hover:text-brand transition-colors text-ink">Privacy Policy</a>
               <a href="#" className="text-[13px] font-medium hover:text-brand transition-colors text-ink">Terms of Service</a>
             </div>
          </div>

          <div className="flex flex-col justify-center md:px-8">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-ink-muted mb-3">Security Standard</span>
            <span className="text-[13px] font-mono font-medium text-ink">AES-256 / JWT-SEC</span>
          </div>

          <div className="flex flex-col justify-center md:px-8">
             <span className="text-[10px] uppercase font-semibold tracking-wider text-ink-muted mb-3">System Status</span>
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                <span className="text-[13px] font-medium text-ink">Synchronized</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
