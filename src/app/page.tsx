'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScanLine, Package, Trophy, ChevronRight, BarChart3, Star, Ghost, Zap, Gamepad2, ShoppingBag, Tags, Gift, ScanBarcode } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const GAME_ITEMS = [
  { id: 1, Icon: ShoppingBag, label: 'Items', x: '10%', y: '15%', delay: 0, color: 'text-brand-pink' },
  { id: 2, Icon: Gamepad2, label: 'Play', x: '85%', y: '20%', delay: 0.5, color: 'text-brand-cyan' },
  { id: 3, Icon: Tags, label: 'Collect', x: '15%', y: '70%', delay: 1, color: 'text-brand-yellow' },
  { id: 4, Icon: ScanBarcode, label: 'Scan', x: '80%', y: '65%', delay: 1.5, color: 'text-brand-mint' },
  { id: 5, Icon: Gift, label: 'Rewards', x: '50%', y: '85%', delay: 0.8, color: 'text-orange-400' },
];

function FloatingItem({ Icon, label, x, y, delay, color }: { Icon: any; label: string; x: string; y: string; delay: number; color: string }) {
  return (
    <div
      className="animate-float hidden md:flex"
      style={{ animationDelay: `${delay}s`, position: 'absolute', left: x, top: y }}
    >
      <div className="card-bubbly px-5 py-3 flex items-center gap-3">
        <Icon className={`w-6 h-6 ${color}`} strokeWidth={2.5} />
        <span className="text-sm font-fredoka font-semibold text-slate-700 tracking-wide">{label}</span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const bentoRef = useRef<HTMLDivElement>(null);

  // Mouse parallax for the floating game items
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 30,
      });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  // GSAP scroll animations for Bento Grid
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.bento-cell',
        { opacity: 0, y: 100, scale: 0.8, rotation: -5 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotation: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: 'elastic.out(1, 0.6)',
          scrollTrigger: {
            trigger: bentoRef.current,
            start: 'top 80%',
          },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden relative pb-32">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-white rounded-[1rem] flex items-center justify-center card-bubbly">
              <ScanLine className="w-6 h-6 text-brand-cyan" />
            </div>
            <span className="font-fredoka font-bold text-2xl text-slate-800 tracking-tight hidden sm:block">
              Barcode Hunter
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="flex items-center gap-4"
          >
            <Link
              href="/admin"
              className="px-6 py-3 bg-white text-slate-600 rounded-full font-fredoka font-semibold text-base card-bubbly hover:scale-105 transition-transform"
            >
              Admin
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 px-6 overflow-hidden">
        {/* Floating Parallax Background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
        >
          {GAME_ITEMS.map((b) => (
            <FloatingItem key={b.id} {...b} />
          ))}
        </div>

        <motion.div 
          className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: 'spring', bounce: 0.4 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3, bounce: 0.6 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-cyan/10 border-2 border-brand-cyan/50 text-cyan-800 rounded-full mb-8 font-fredoka font-semibold text-lg"
          >
            <Gamepad2 className="w-5 h-5 text-brand-cyan" />
            Ready to Play?
          </motion.div>

          <h1 className="font-fredoka text-6xl md:text-8xl lg:text-[7.5rem] font-bold leading-[1.1] mb-8 text-slate-800">
            Scan. <span className="text-brand-pink">Discover.</span> <br className="hidden md:block"/>
            <span className="text-brand-cyan">Collect.</span>
          </h1>

          <p className="font-nunito text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto mb-12 font-medium">
            Turn your everyday shopping into a game. Scan any product barcode to unlock items, earn points, and build your collection!
          </p>

          <Link href="/scan" className="group">
            <button className="btn-bubbly bg-brand-cyan text-white px-10 py-5 text-2xl flex items-center gap-4 group-hover:bg-brand-cyan-light">
              <ScanLine className="w-8 h-8" />
              START GAME
              <ChevronRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
            </button>
          </Link>
        </motion.div>
      </section>

      {/* GAMEPLAY BENTO GRID */}
      <section ref={bentoRef} className="relative z-10 max-w-6xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 auto-rows-[280px]">
          
          {/* Card 1: Large Feature */}
          <div className="bento-cell card-bubbly md:col-span-2 bg-white flex flex-col md:flex-row items-center overflow-hidden">
            <div className="p-10 flex-1 flex flex-col justify-center h-full">
              <div className="w-14 h-14 bg-brand-pink/20 rounded-2xl flex items-center justify-center mb-6">
                <Package className="w-8 h-8 text-brand-pink" />
              </div>
              <h2 className="font-fredoka text-3xl font-bold text-slate-800 mb-3">Huge Database</h2>
              <p className="font-nunito text-lg text-slate-600">Instantly lookup millions of products globally. If it exists, we'll find it.</p>
            </div>
            <div className="flex-1 w-full h-full bg-brand-pink/10 relative hidden md:block overflow-hidden rounded-r-[2rem]">
              {/* Decorative graphic replacing placeholder image */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-pink rounded-full blur-3xl opacity-20" />
              
              {/* Abstract 3D Barcode Elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-end justify-center gap-3 w-48 h-48 rotate-12">
                <div className="w-6 h-32 bg-white rounded-full shadow-lg border-2 border-brand-pink/20" />
                <div className="w-8 h-40 bg-white rounded-full shadow-lg border-2 border-brand-pink/20" />
                <div className="w-4 h-24 bg-brand-pink rounded-full shadow-lg" />
                <div className="w-10 h-36 bg-white rounded-full shadow-lg border-2 border-brand-pink/20" />
                <div className="w-5 h-28 bg-brand-cyan rounded-full shadow-lg" />
                <div className="w-6 h-32 bg-white rounded-full shadow-lg border-2 border-brand-pink/20" />
              </div>
            </div>
          </div>

          {/* Card 2: Stats */}
          <div className="bento-cell card-bubbly bg-brand-yellow/10 flex flex-col items-center justify-center p-8 text-center border-none">
            <Trophy className="w-16 h-16 text-brand-yellow mb-4" />
            <h3 className="font-fredoka text-4xl font-bold text-slate-800 mb-2">High Scores</h3>
            <p className="font-nunito text-slate-600 font-medium">Track your personal scan records and compete with yourself.</p>
          </div>

          {/* Card 3: Magic Interaction */}
          <div className="bento-cell card-bubbly bg-brand-mint/20 p-8 flex flex-col justify-between border-none">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
              <Zap className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-fredoka text-2xl font-bold text-slate-800 mb-2">Lightning Fast</h3>
              <p className="font-nunito text-slate-600">Scan via your camera directly in the browser. No app install needed.</p>
            </div>
          </div>

          {/* Card 4: Wide Banner */}
          <div className="bento-cell card-bubbly md:col-span-2 bg-brand-cyan/10 p-10 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/4" />
            <div className="relative z-10 max-w-lg">
              <h2 className="font-fredoka text-3xl md:text-4xl font-bold mb-4 text-slate-800">Start your collection today</h2>
              <p className="font-nunito text-lg text-slate-600 mb-6 font-medium">Every scan is saved to your personal history log. Build the ultimate library of your favorite snacks and gadgets.</p>
              <Link href="/scan">
                <button className="btn-bubbly bg-brand-cyan text-white px-8 py-3 text-lg hover:brightness-110">
                  Let's Go!
                </button>
              </Link>
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}
