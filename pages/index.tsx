// pages/index.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Download,
  Palette,
  X,
  HelpCircle,
} from 'lucide-react';
import SplashScreen from '@/components/SplashScreen';
import ColorPicker from '@/components/ColorPicker';
import { COLOR_CATEGORIES } from '@/constants/Colors';
import { COLORINGMAP } from '@/constants/Image';
import NavigationGuide from '@/components/NavigationGuide';

type Tool = 'brush' | 'eraser' | 'fill' | 'pan';

export default function Home() {
  const [color, setColor] = useState('#FF5733');
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool] = useState<Tool>('fill');
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [scale, setScale] = useState(1.7);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const lastTouchDistanceRef = useRef(0);
  const lastTouchCenterRef = useRef({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [isPanning, setIsPanning] = useState(false);

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const lastPanRef = useRef({ x: 0, y: 0 });
  const [showColorPopup, setShowColorPopup] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colors, setColors] = useState<string[]>(
    COLOR_CATEGORIES.spring.colors,
  );
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [showNavigationGuide, setShowNavigationGuide] = useState(false);
  const [colorMode, setColorMode] = useState<'seasonal' | 'recent'>('seasonal');

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), imageData]);
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previousState = history[historyIndex - 1];
    ctx.putImageData(previousState, 0, 0);
    setHistoryIndex((prev) => prev - 1);
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nextState = history[historyIndex + 1];
    ctx.putImageData(nextState, 0, 0);
    setHistoryIndex((prev) => prev + 1);
  }, [history, historyIndex]);

  const reset = useCallback(() => {
    if (history.length === 0 || historyIndex < 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const initialState = history[0];
    ctx.putImageData(initialState, 0, 0);
    setHistoryIndex(0);
  }, [history, historyIndex]);

  const handleUndoTouch = (e: React.TouchEvent) => {
    e.preventDefault();
    undo();
  };

  const handleRedoTouch = (e: React.TouchEvent) => {
    e.preventDefault();
    redo();
  };

  const handleResetTouch = (e: React.TouchEvent) => {
    e.preventDefault();
    if (window.confirm('塗り絵を最初の状態に戻しますか？')) {
      reset();
    }
  };

  const floodFill = useCallback(
    (startX: number, startY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      const startPos = (startY * canvas.width + startX) * 4;
      const startR = pixels[startPos];
      const startG = pixels[startPos + 1];
      const startB = pixels[startPos + 2];
      const startA = pixels[startPos + 3];

      const isOutline = (r: number, g: number, b: number, a: number) =>
        r < 30 && g < 30 && b < 30 && a > 0;

      if (isOutline(startR, startG, startB, startA)) return;

      const fillColor = {
        r: parseInt(color.slice(1, 3), 16),
        g: parseInt(color.slice(3, 5), 16),
        b: parseInt(color.slice(5, 7), 16),
        a: 255,
      };

      const stack = [[startX, startY]];
      const tolerance = 10;

      while (stack.length > 0) {
        const [x, y] = stack.pop()!;
        const pos = (y * canvas.width + x) * 4;

        if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;
        if (pixels[pos + 3] === 0) continue;

        const r = pixels[pos];
        const g = pixels[pos + 1];
        const b = pixels[pos + 2];
        const a = pixels[pos + 3];

        if (isOutline(r, g, b, a)) continue;

        if (
          Math.abs(r - startR) <= tolerance &&
          Math.abs(g - startG) <= tolerance &&
          Math.abs(b - startB) <= tolerance &&
          !(
            pixels[pos] === fillColor.r &&
            pixels[pos + 1] === fillColor.g &&
            pixels[pos + 2] === fillColor.b
          )
        ) {
          pixels[pos] = fillColor.r;
          pixels[pos + 1] = fillColor.g;
          pixels[pos + 2] = fillColor.b;
          pixels[pos + 3] = fillColor.a;

          stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }
      }

      ctx.putImageData(imageData, 0, 0);
      saveState();
    },
    [color, saveState],
  );

  const getCoordinates = (event: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in event) {
      x = event.touches[0].clientX - rect.left;
      y = event.touches[0].clientY - rect.top;
    } else {
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: Math.floor(x * scaleX),
      y: Math.floor(y * scaleY),
    };
  };

  const handlePanStart = (event: React.TouchEvent) => {
    if (event.touches.length === 1 && (tool === 'pan' || !isDrawing)) {
      event.preventDefault();
      setIsPanning(true);
      panStartRef.current = {
        x: event.touches[0].clientX - lastPanRef.current.x,
        y: event.touches[0].clientY - lastPanRef.current.y,
      };
    }
  };

  const handlePanMove = (event: React.TouchEvent) => {
    if (
      event.touches.length === 1 &&
      (tool === 'pan' || !isDrawing) &&
      isPanning
    ) {
      event.preventDefault();
      const newX = event.touches[0].clientX - panStartRef.current.x;
      const newY = event.touches[0].clientY - panStartRef.current.y;

      requestAnimationFrame(() => {
        setPan({ x: newX, y: newY });
        lastPanRef.current = { x: newX, y: newY };
      });
    }
  };

  const handlePinchZoomStart = (event: React.TouchEvent) => {
    if (event.touches.length === 2) {
      event.preventDefault();
      setIsZooming(true);

      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      lastTouchDistanceRef.current = Math.sqrt(dx * dx + dy * dy);

      lastTouchCenterRef.current = {
        x: (event.touches[0].clientX + event.touches[1].clientX) / 2,
        y: (event.touches[0].clientY + event.touches[1].clientY) / 2,
      };
    } else {
      handlePanStart(event);
    }
  };

  const handlePinchZoomMove = (event: React.TouchEvent) => {
    if (event.touches.length === 2 && isZooming) {
      event.preventDefault();

      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      const touchDistance = Math.sqrt(dx * dx + dy * dy);

      const scaleChange = touchDistance / lastTouchDistanceRef.current;
      const newScale = Math.min(Math.max(scale * scaleChange, 0.5), 3);

      requestAnimationFrame(() => {
        setScale(newScale);
        lastTouchDistanceRef.current = touchDistance;
      });
    } else {
      handlePanMove(event);
    }
  };

  const handlePinchZoomEnd = () => {
    setIsZooming(false);
    setIsPanning(false);
  };

  const startDrawing = (event: React.TouchEvent | React.MouseEvent) => {
    if (isZooming) return;
    if (tool === 'pan') return;

    event.preventDefault();
    const coords = getCoordinates(event);
    if (!coords) return;

    if (tool === 'fill') {
      floodFill(coords.x, coords.y);
      return;
    }

    if (tool === 'brush' || tool === 'eraser') {
      setIsDrawing(true);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    }
  };

  const draw = (event: React.TouchEvent | React.MouseEvent) => {
    if (isZooming) return;

    event.preventDefault();
    if (!isDrawing || tool === 'fill') return;

    const coords = getCoordinates(event);
    if (!coords) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      saveState();
    }
    setIsDrawing(false);
  };

  const saveImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    try {
      if (isIOS && navigator.share) {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            throw new Error('Blob creation failed');
          }

          const file = new File([blob], 'Originaのぬりえ.png', {
            type: 'image/png',
          });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: '塗り絵の保存',
              text: '写真に保存するには「写真に追加」を選択してください',
            });
          } else {
            const dataUrl = canvas.toDataURL('image/png');
            window.open(dataUrl, '_blank');
            setTimeout(() => {
              alert('画像を長押しして「写真に保存」を選択してください。');
            }, 500);
          }
        }, 'image/png');
      } else if (isAndroid) {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            throw new Error('Blob creation failed');
          }

          try {
            if (navigator.share) {
              const file = new File([blob], 'Originaのぬりえ.png', {
                type: 'image/png',
              });

              if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                  files: [file],
                  title: '塗り絵の保存',
                  text: 'ギャラリーに保存するには「保存」を選択してください',
                });
                return;
              }
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'Originaのぬりえ.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => {
              const dataUrl = canvas.toDataURL('image/png');
              const newTab = window.open(dataUrl, '_blank');

              if (newTab) {
                setTimeout(() => {
                  alert('画像を長押しして「画像を保存」を選択してください。');
                }, 500);
              } else {
                alert(
                  'ポップアップがブロックされました。設定を確認して再度お試しください。',
                );
              }
            }, 1000);
          } catch (error) {
            console.error('保存に失敗しました:', error);

            const dataUrl = canvas.toDataURL('image/png');
            window.open(dataUrl, '_blank');
            setTimeout(() => {
              alert('画像を長押しして「画像を保存」を選択してください。');
            }, 500);
          }
        }, 'image/png');
      } else {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'Originaのぬりえ.png';
        link.href = dataUrl;
        link.click();
      }
    } catch (error) {
      console.error('保存処理に失敗しました:', error);
      alert('画像の保存に失敗しました。別の方法をお試しください。');

      try {
        const dataUrl = canvas.toDataURL('image/png');
        window.open(dataUrl, '_blank');
        setTimeout(() => {
          alert('画像を長押しして保存してください。');
        }, 500);
      } catch (e) {
        console.error('代替保存方法も失敗:', e);
        alert(
          '画像の保存に失敗しました。お手数ですがスクリーンショットをご利用ください。',
        );
      }
    }
  };

  const handleOpenColorPalette = () => {
    setShowColorPopup(true);
  };

  const handleSelectCategory = (categoryKey: keyof typeof COLOR_CATEGORIES) => {
    setColors(COLOR_CATEGORIES[categoryKey].colors);
    setColorMode('seasonal');
    setShowColorPopup(false);
  };

  const handleSelectOriginal = () => {
    setShowColorPicker(true);
    setShowColorPopup(false);
  };

  const handleSelectColor = (selectedColor: string) => {
    setColor(selectedColor);
    setRecentColors((prev) => {
      const filteredColors = prev.filter((c) => c !== selectedColor);
      return [selectedColor, ...filteredColors].slice(0, 5);
    });
  };

  const handleColorPickerSelect = (selectedColor: string) => {
    handleSelectColor(selectedColor);
    setColorMode('recent');
  };

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('hasSeenColoringGuide');
    if (!hasSeenGuide && !showSplash) {
      setShowNavigationGuide(true);
      localStorage.setItem('hasSeenColoringGuide', 'true');
    }
  }, [showSplash]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = COLORINGMAP['2'].path;

    img.onload = () => {
      // 元の画像サイズを保持
      const originalWidth = img.width;
      const originalHeight = img.height;

      // キャンバスのサイズをデバイスピクセル比を考慮して設定
      canvas.width = originalWidth;
      canvas.height = originalHeight;

      // 画像を描画
      ctx.drawImage(img, 0, 0, originalWidth, originalHeight);

      // 初期状態を履歴に保存
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([imageData]);
      setHistoryIndex(0);

      // 初期スケールを調整（画面に合わせる）
      const canvasWrapper = canvasWrapperRef.current;
      if (canvasWrapper) {
        const wrapperWidth = canvasWrapper.clientWidth;
        const wrapperHeight = canvasWrapper.clientHeight;

        // 幅と高さの両方に基づいてスケールを計算
        const scaleX = (wrapperWidth / canvas.width) * 0.9;
        const scaleY = (wrapperHeight / canvas.height) * 0.9;

        // 小さい方のスケールを使用して、キャンバス全体が表示されるようにする
        const initialScale = Math.min(1.7, Math.min(scaleX, scaleY) * 2.5);
        setScale(initialScale);

        // 中央に配置するためのパン位置を計算
        setPan({ x: 0, y: 0 });
      }
    };
  }, []); // 依存配列を空にして初回のみ実行

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Originaのぬりえ</title>
        <meta name="description" content="オリジナルの塗り絵を楽しもう" />
      </Head>

      {/* スプラッシュ画面 */}
      {showSplash && (
        <SplashScreen
          logoPath="/Origina-logo_tate.png"
          onComplete={() => setShowSplash(false)}
        />
      )}

      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        {/* ヘッダーツールバー */}
        <div className="flex justify-between items-center p-3">
          <div className="flex space-x-2">
            <button
              onClick={undo}
              onTouchStart={handleUndoTouch}
              disabled={historyIndex <= 0}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                historyIndex <= 0
                  ? 'bg-gray-200 cursor-not-allowed'
                  : 'bg-gray-300 active:bg-gray-400'
              }`}
            >
              <ChevronLeft
                className={`w-6 h-6 ${historyIndex <= 0 ? 'text-gray-400' : 'text-gray-600'}`}
              />
            </button>
            <button
              onClick={redo}
              onTouchStart={handleRedoTouch}
              disabled={historyIndex >= history.length - 1}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                historyIndex >= history.length - 1
                  ? 'bg-gray-200 cursor-not-allowed'
                  : 'bg-gray-300 active:bg-gray-400'
              }`}
            >
              <ChevronRight
                className={`w-6 h-6 ${historyIndex >= history.length - 1 ? 'text-gray-400' : 'text-gray-600'}`}
              />
            </button>
            <button
              onClick={() => {
                if (window.confirm('塗り絵を最初の状態に戻しますか？')) {
                  reset();
                }
              }}
              onTouchStart={handleResetTouch}
              disabled={historyIndex === 0}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                historyIndex === 0
                  ? 'bg-gray-200 cursor-not-allowed'
                  : 'bg-gray-300 active:bg-gray-400'
              }`}
            >
              <RotateCcw
                className={`w-6 h-6 ${historyIndex === 0 ? 'text-gray-400' : 'text-gray-600'}`}
              />
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowNavigationGuide(true)}
              className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center"
            >
              <HelpCircle className="w-6 h-6 text-gray-600" />
            </button>
            <button
              onClick={saveImage}
              className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center"
            >
              <Download className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* キャンバス部分 - 高さだけ調整 */}
        <div
          ref={canvasWrapperRef}
          className="relative w-full overflow-hidden h-[calc(75vh-120px)]"
          onTouchStart={handlePinchZoomStart}
          onTouchMove={handlePinchZoomMove}
          onTouchEnd={handlePinchZoomEnd}
          onTouchCancel={handlePinchZoomEnd}
        >
          <div
            className="min-w-[100%] flex justify-center items-center h-full"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px)`,
              transition:
                isPanning || isZooming ? 'none' : 'transform 0.1s ease-out',
              willChange: 'transform',
            }}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="touch-none"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
                transition: isZooming ? 'none' : 'transform 0.1s ease-out',
                willChange: 'transform',
                maxWidth: '100%',
                height: 'auto',
                imageRendering: 'pixelated',
                WebkitFontSmoothing: 'none',
                MozOsxFontSmoothing: 'grayscale',
              }}
            />
          </div>
        </div>

        {/* カラーパレット */}
        <div className="flex justify-center p-3 border-t">
          <button
            onClick={handleOpenColorPalette}
            className="w-10 h-10 rounded-full mx-1 flex items-center justify-center bg-gray-200"
            aria-label="カラーパレットを開く"
          >
            <Palette className="w-6 h-6 text-gray-600" />
          </button>

          {/* 季節カラーまたは最近使用した色を表示 */}
          {colorMode === 'seasonal'
            ? colors.map((colorOption, index) => (
                <button
                  key={`seasonal-${index}`}
                  onClick={() => setColor(colorOption)}
                  className={`w-10 h-10 rounded-full mx-1 transition-transform ${
                    color === colorOption
                      ? 'scale-110 ring-2 ring-gray-400'
                      : ''
                  }`}
                  style={{
                    backgroundColor: colorOption,
                    border:
                      colorOption === '#FFFFFF' ? '1px solid #ddd' : 'none',
                  }}
                  aria-label={`色を${colorOption}に変更`}
                />
              ))
            : recentColors.map((recentColor, index) => (
                <button
                  key={`recent-${index}`}
                  onClick={() => handleSelectColor(recentColor)}
                  className={`w-10 h-10 rounded-full mx-1 transition-transform ${
                    color === recentColor
                      ? 'scale-110 ring-2 ring-gray-400'
                      : ''
                  }`}
                  style={{
                    backgroundColor: recentColor,
                    border:
                      recentColor === '#FFFFFF' ? '1px solid #ddd' : 'none',
                  }}
                  aria-label={`最近使用した色${recentColor}に変更`}
                />
              ))}
        </div>

        {/* 下部の余白を追加 */}
        <div className="h-4"></div>

        {/* カラーポップアップ */}
        {showColorPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center">
            <div
              className="bg-white rounded-t-xl w-full max-w-md p-5 transform transition-all duration-300 ease-out animate-slide-up"
              style={{ height: '60vh' }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Originaパレット</h3>
                <button
                  onClick={() => setShowColorPopup(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                  aria-label="閉じる"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div
                className="space-y-3 overflow-y-auto"
                style={{ maxHeight: 'calc(60vh - 120px)' }}
              >
                {Object.entries(COLOR_CATEGORIES).map(([key, category]) => (
                  <button
                    key={key}
                    onClick={() =>
                      handleSelectCategory(key as keyof typeof COLOR_CATEGORIES)
                    }
                    className="w-full py-4 px-6 text-left text-lg font-medium hover:bg-gray-100 rounded-md transition-colors flex justify-between items-center"
                  >
                    <span>{category.name}</span>
                    <span className="text-gray-400">▶</span>
                  </button>
                ))}

                <button
                  onClick={handleSelectOriginal}
                  className="w-full py-4 px-6 text-left text-lg font-medium hover:bg-gray-100 rounded-md transition-colors flex justify-between items-center"
                >
                  <span>Original</span>
                  <span className="text-gray-400">▶</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* カラーピッカー */}
        <ColorPicker
          isOpen={showColorPicker}
          onClose={() => setShowColorPicker(false)}
          onSelectColor={handleColorPickerSelect}
          initialColor={color}
        />

        {/* 操作ガイド */}
        <NavigationGuide
          isOpen={showNavigationGuide}
          onClose={() => setShowNavigationGuide(false)}
        />
      </div>
    </div>
  );
}
