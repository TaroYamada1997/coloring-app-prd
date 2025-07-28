import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  Palette,
  Download,
  RotateCcw,
  ZoomIn,
  Move,
  Hand,
} from 'lucide-react';

interface NavigationGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const NavigationGuide: React.FC<NavigationGuideProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const guideSteps = [
    {
      title: '🎨 ぬりえのつかいかた',
      content: 'たのしいぬりえのつかいかたを\nおしえるよ！\n\nいっしょにおぼえよう✨',
      icon: <Hand className="w-12 h-12 text-purple-500 mx-auto mb-4" />,
    },
    {
      title: '🌈 いろをえらぼう',
      content:
        'パレットのマークをタッチすると、\nきれいないろがたくさんでてくるよ！\nすきないろをえらんでね😊',
      icon: <Palette className="w-12 h-12 text-pink-500 mx-auto mb-4" />,
    },
    {
      title: '🔍 おおきくしてみよう',
      content:
        'ゆびを2ほんつかって、がめんを\nひろげると、ぬりえがおおきくなるよ！\nちいさいところもぬりやすくなるね🎯',
      icon: <ZoomIn className="w-12 h-12 text-blue-500 mx-auto mb-4" />,
    },
    {
      title: '👆 がめんをうごかそう',
      content:
        'おおきくしたあと、ゆび1ぽんで\nがめんをうごかせるよ！\nいろんなところがみえるね👀',
      icon: <Move className="w-12 h-12 text-green-500 mx-auto mb-4" />,
    },
    {
      title: '↩️ まちがえてもだいじょうぶ',
      content:
        'ひだりうえのやじるしボタンをおすと、\nまえにもどったり、やりなおしたり\nできるよ。あんしんしてね💖',
      icon: <ChevronLeft className="w-12 h-12 text-orange-500 mx-auto mb-4" />,
    },
    {
      title: '🔄 さいしょからやりなおし',
      content:
        'ひだりうえのくるくるボタンをおすと、\nぬりえがさいしょのじょうたいに\nもどるよ！',
      icon: <RotateCcw className="w-12 h-12 text-red-500 mx-auto mb-4" />,
    },
    {
      title: '💾 さくひんをほぞんしよう',
      content:
        'みぎうえのダウンロードボタンをおすと、\nできあがったぬりえをほぞんできるよ！\nおうちのひとにみせてあげよう🎉',
      icon: <Download className="w-12 h-12 text-teal-500 mx-auto mb-4" />,
    },
  ];

  const nextStep = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-lg w-full max-w-md p-6 relative"
        style={{ height: '420px' }}
      >
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100"
          aria-label="閉じる"
        >
          <X className="w-5 h-5" />
        </button>

        {/* プログレスバー */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-6 mt-6">
          <div
            className="h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-300"
            style={{
              width: `${(currentStep / (guideSteps.length - 1)) * 100}%`,
            }}
          ></div>
        </div>

        {/* ガイド内容 - 固定高さのコンテナ */}
        <div className="text-center py-4" style={{ height: '280px' }}>
          {guideSteps[currentStep].icon}
          <h3 className="text-xl font-bold mb-4">
            {guideSteps[currentStep].title}
          </h3>
          <p
            className="text-gray-600 whitespace-pre-line leading-relaxed"
            style={{ height: '120px', overflow: 'auto' }}
          >
            {guideSteps[currentStep].content}
          </p>
        </div>

        {/* ナビゲーションボタン */}
        <div className="flex justify-between absolute bottom-6 left-6 right-6">
          <button
            onClick={prevStep}
            className={`px-4 py-2 rounded-lg ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-purple-500'
            }`}
            disabled={currentStep === 0}
          >
            ◀ まえ
          </button>
          <button
            onClick={nextStep}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg"
          >
            {currentStep === guideSteps.length - 1 ? '🎉 できた！' : 'つぎ ▶'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavigationGuide;
