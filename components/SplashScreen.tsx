import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  logoPath: string;
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({
  logoPath,
  onComplete,
}) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(onComplete, 1000);
    }, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-purple-100"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative w-28 h-28 mb-10 -mt-20"
          >
            <Image
              src={logoPath}
              alt="Origina Logo"
              layout="fill"
              objectFit="contain"
              priority
            />
          </motion.div>

          {/* あなたの色は何色？ */}
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-2xl md:text-3xl font-semibold text-indigo-300 mb-6 text-center"
          >
            あなたの色は何色？
          </motion.h2>

          {/* グラデーション横線 */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.8, ease: 'easeInOut' }}
            className="w-48 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mb-16"
            style={{ transformOrigin: 'left' }}
          />

          {/* フッター */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="text-gray-400 text-sm mt-8"
          >
            ©2025 Origina.
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
