import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import Lenis from '@studio-freight/lenis'; // Lenis package name
import { useSpring, a } from '@react-spring/web'; // using framer-motion for smooth vfx maybe
import 'hairline-css/hairline.css'; // assuming hairline provides CSS class

// Simple VFX placeholder using sakura-like particles (sakuga)
import sakuga from 'sakuga'; // placeholder import, actual usage may vary

export default function Landing({ onProceed }) {
  const containerRef = useRef(null);
  const lenisRef = useRef(null);

  useEffect(() => {
    // GSAP entry animation
    gsap.from(containerRef.current, { opacity: 0, y: -50, duration: 1, ease: 'power3.out' });

    // Initialize Lenis for smooth scrolling
    lenisRef.current = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    function raf(time) {
      lenisRef.current?.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Simple sakuga VFX background (e.g., animated gradient)
    const el = document.body;
    sakuga(el, { particles: 30, colors: ['#ff6b6b', '#ffd93d', '#6bc1ff'] });

    return () => {
      // cleanup if needed
    };
  }, []);

  return (
    <section ref={containerRef} className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
      <motion.h1
        className="text-5xl md:text-6xl font-bold mb-6 hairline"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        RecruitFlow Platform
      </motion.h1>
      <motion.p
        className="text-lg md:text-xl text-center max-w-2xl mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        HR Action Control Cockpit &amp; Core REST API – an all‑in‑one solution for recruiting, interview scheduling, and robotic process automation.
      </motion.p>
      <motion.button
        onClick={onProceed}
        className="px-6 py-3 bg-indigo-600 rounded hover:bg-indigo-500 transition"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Get Started
      </motion.button>
    </section>
  );
}
