'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="h-screen w-full bg-[#050505] flex flex-col items-center justify-center text-white px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-6"
      >
        <h1 className="text-9xl font-black text-emerald-500 italic">404</h1>
        <p className="text-4xl font-bold tracking-tighter uppercase">Page Not Found</p>
        <p className="text-lg text-slate-400 max-w-md mx-auto">
          The page you're looking for seems to have wandered off to another dimension.
        </p>
        
        <motion.button
          onClick={() => router.push('/')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-8 px-12 py-4 bg-emerald-500 text-black font-bold text-lg uppercase rounded-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all"
        >
          Return Home
        </motion.button>
      </motion.div>
    </div>
  );
}
