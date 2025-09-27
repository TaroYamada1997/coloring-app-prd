import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Palette, Star } from 'lucide-react';
import { COLORINGMAP } from '@/constants/Image';

interface TopPageProps {
  onSelectColoring: (id: string) => void;
}

const difficultyConfig = {
  easy: { label: 'かんたん', color: 'bg-green-100 text-green-700', stars: 1 },
  medium: { label: 'ふつう', color: 'bg-yellow-100 text-yellow-700', stars: 2 },
  hard: { label: 'むずかしい', color: 'bg-red-100 text-red-700', stars: 3 },
};

const categoryConfig = {
  human: { name: 'ひと', icon: '/human.png' },
  flower: { name: 'はな', icon: '/flower.png' },
  building: { name: 'たてもの', icon: '/building.png' },
};

type Category = keyof typeof categoryConfig;

const TopPage: React.FC<TopPageProps> = ({ onSelectColoring }) => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
      {/* ヘッダー */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center py-6 px-4"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center justify-center mb-3"
        >
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-slate-800">
            ぬりえをえらぼう
          </h1>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-gray-600 text-base"
        >
          すきなカテゴリをタッチしてね！
        </motion.p>
      </motion.header>

      {/* カテゴリ選択 */}
      <div className="max-w-sm mx-auto px-4 pb-8">
        <div className="space-y-4">
          {Object.entries(categoryConfig).map(([categoryKey, categoryData], index) => (
            <motion.div
              key={categoryKey}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1 + 0.3,
                ease: "easeOut"
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectColoring(categoryKey)}
              className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer border-2 border-transparent active:border-gray-200 transition-all duration-200"
            >
              <div className="flex items-center p-6">
                {/* 左側アイコン */}
                <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={categoryData.icon}
                    alt={categoryData.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* 右側コンテンツ */}
                <div className="ml-4 flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-800 leading-tight mb-2">
                    {categoryData.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    タップして始めよう！
                  </p>
                </div>

                {/* 矢印 */}
                <div className="flex-shrink-0 ml-2">
                  <span className="text-gray-400 text-xl">▶</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* フローティングデコレーション */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 0,
            scale: 0,
          }}
          animate={{ 
            opacity: [0, 0.4, 0],
            scale: [0, 1, 0],
            rotate: 360,
          }}
          transition={{ 
            duration: 3, 
            delay: 1.5 + i * 0.3, 
            repeat: Infinity,
            repeatDelay: 4 + Math.random() * 2
          }}
          className={`fixed w-2 h-2 rounded-full pointer-events-none z-10`}
          style={{
            backgroundColor: [
              '#ff6b9d', '#ffd93d', '#6bcf7f', '#4ecdc4', 
              '#45b7d1', '#96ceb4'
            ][i % 6],
            left: `${15 + (i * 15) % 70}%`,
            top: `${25 + (i * 12) % 50}%`,
          }}
        ></motion.div>
      ))}
    </div>
  );
};

export default TopPage;