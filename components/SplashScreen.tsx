import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface SplashScreenProps {
  logoPath: string;
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({
  logoPath,
  onComplete,
}) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [currentPhase, setCurrentPhase] = useState(0); // 0: 初期, 1: イラストとロゴ同時表示, 2: 完了

  useEffect(() => {
    // フェーズ0 → フェーズ1 (1秒後)
    const timer1 = setTimeout(() => {
      setCurrentPhase(1);
    }, 1000);

    // フェーズ1 → フェーズ2 (5秒後)
    const timer2 = setTimeout(() => {
      setCurrentPhase(2);
      setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onComplete, 500);
      }, 1000);
    }, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-start pt-20 min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 overflow-hidden px-4"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* メインのスプラッシュイラスト */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={currentPhase >= 1 ? { scale: 1, opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            className="relative z-20 mb-8"
          >
            {/* 背景の光る効果 */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={currentPhase >= 1 ? { scale: 1.5, opacity: 0.3 } : {}}
              transition={{ duration: 2, ease: "easeOut", delay: 0.8 }}
              className="absolute inset-0 bg-gradient-radial from-yellow-200 via-orange-200 to-transparent rounded-full blur-xl transform -translate-x-4 -translate-y-4"
            ></motion.div>

            <Image
              src="/splash.png"
              alt="Splash Illustration"
              width={350}
              height={350}
              className="relative z-10 drop-shadow-lg"
              priority
            />
          </motion.div>


          {/* キャンバス画像と同時にロゴを表示 */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={currentPhase >= 1 ? {
              scale: [0, 1.2, 1],
              opacity: [0, 1, 1]
            } : {}}
            transition={{
              duration: 1.5,
              ease: "easeOut",
              delay: 0.5,
              times: [0, 0.6, 1]
            }}
            className="relative z-30 flex justify-center"
          >
            <Image
              src={logoPath}
              alt="Origina Logo"
              width={80}
              height={80}
              className="object-contain"
            />
          </motion.div>

          {/* 没入感を演出する光のパーティクル */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                scale: 0, 
                opacity: 0, 
                x: Math.random() * 400 - 200,
                y: Math.random() * 400 - 200
              }}
              animate={currentPhase >= 1 ? { 
                scale: [0, 1, 0.5], 
                opacity: [0, 0.8, 0], 
                x: Math.random() * 600 - 300,
                y: Math.random() * 600 - 300,
                rotate: 360 
              } : {}}
              transition={{ 
                duration: 3, 
                delay: 0.5 + i * 0.2, 
                repeat: Infinity,
                repeatDelay: 2 + Math.random() * 2
              }}
              className={`absolute w-2 h-2 rounded-full`}
              style={{
                backgroundColor: [
                  '#ff6b9d', '#ffd93d', '#6bcf7f', '#4ecdc4', 
                  '#45b7d1', '#96ceb4', '#ffeaa7', '#fab1a0'
                ][i % 8]
              }}
            ></motion.div>
          ))}

          {/* 色の波紋エフェクト */}
          {currentPhase >= 1 && (
            <>
              <motion.div
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 2, ease: "easeOut", delay: 1 }}
                className="absolute inset-0 bg-gradient-radial from-gray-200 via-slate-100 to-transparent rounded-full"
              ></motion.div>
              <motion.div
                initial={{ scale: 0, opacity: 0.6 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{ duration: 2.5, ease: "easeOut", delay: 1.3 }}
                className="absolute inset-0 bg-gradient-radial from-slate-200 via-gray-100 to-transparent rounded-full"
              ></motion.div>
            </>
          )}


          {/* 周囲から舞い散る絵の具エフェクト */}
          {currentPhase >= 1 && (
            <>
              {/* 左から */}
              <motion.div
                initial={{ x: -100, y: 0, opacity: 0 }}
                animate={{ x: 0, y: -20, opacity: [0, 1, 0] }}
                transition={{ duration: 2, ease: "easeOut", delay: 1 }}
                className="absolute left-10 top-1/3 w-4 h-4 bg-green-400 rounded-full"
              ></motion.div>
              {/* 右から */}
              <motion.div
                initial={{ x: 100, y: 0, opacity: 0 }}
                animate={{ x: 0, y: -15, opacity: [0, 1, 0] }}
                transition={{ duration: 2, ease: "easeOut", delay: 1.2 }}
                className="absolute right-10 top-1/2 w-3 h-3 bg-orange-400 rounded-full"
              ></motion.div>
              {/* 下から */}
              <motion.div
                initial={{ x: 0, y: 80, opacity: 0 }}
                animate={{ x: -10, y: 0, opacity: [0, 1, 0] }}
                transition={{ duration: 2, ease: "easeOut", delay: 1.4 }}
                className="absolute left-1/3 bottom-1/3 w-3 h-3 bg-blue-400 rounded-full"
              ></motion.div>
              <motion.div
                initial={{ x: 0, y: 80, opacity: 0 }}
                animate={{ x: 15, y: 0, opacity: [0, 1, 0] }}
                transition={{ duration: 2, ease: "easeOut", delay: 1.6 }}
                className="absolute right-1/3 bottom-1/3 w-4 h-4 bg-red-400 rounded-full"
              ></motion.div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
