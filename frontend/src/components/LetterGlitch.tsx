"use client";

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/cn';

interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

interface LetterState {
  char: string;
  color: ColorRGB;
  startColor: ColorRGB;
  targetColor: ColorRGB;
  colorProgress: number;
}

const hexToRgb = (hex: string): ColorRGB | null => {
  if (hex.startsWith('rgb')) {
    const match = hex.match(/\d+/g);
    return match
      ? {
          r: parseInt(match[0], 10),
          g: parseInt(match[1], 10),
          b: parseInt(match[2], 10)
        }
      : null;
  }

  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const normalizedHex = hex.replace(shorthandRegex, (_m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalizedHex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
};

const LetterGlitch = ({
  glitchColors = ['#2b4539', '#61dca3', '#61b3dc'],
  glitchSpeed = 50,
  centerVignette = false,
  outerVignette = true,
  smooth = true,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789',
  className = '',
  canvasClassName = ''
}: {
  glitchColors?: string[];
  glitchSpeed?: number;
  centerVignette?: boolean;
  outerVignette?: boolean;
  smooth?: boolean;
  characters?: string;
  className?: string;
  canvasClassName?: string;
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  
  // High performance: parsed colors stored as pre-calculated RGB objects
  const parsedColors = useRef<ColorRGB[]>([]);
  const letters = useRef<LetterState[]>([]);
  const grid = useRef({ columns: 0, rows: 0 });
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const lastGlitchTime = useRef(0);
  const isVisible = useRef(false);
  const isAnimating = useRef(false);

  const lettersAndSymbols = Array.from(characters);

  const fontSize = 16;
  const charWidth = 10;
  const charHeight = 20;

  const getRandomChar = () => {
    return lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)];
  };

  const getRandomColorObj = (): ColorRGB => {
    if (parsedColors.current.length === 0) return { r: 97, g: 220, b: 163 };
    return parsedColors.current[Math.floor(Math.random() * parsedColors.current.length)];
  };

  const calculateGrid = (width: number, height: number) => {
    const columns = Math.ceil(width / charWidth);
    const rows = Math.ceil(height / charHeight);
    return { columns, rows };
  };

  const initializeLetters = (columns: number, rows: number) => {
    grid.current = { columns, rows };
    const totalLetters = columns * rows;
    
    // Parse colors from prop once on initialize/change
    parsedColors.current = glitchColors.map(c => hexToRgb(c) || { r: 255, g: 255, b: 255 });
    
    const currentList: LetterState[] = [];
    for (let i = 0; i < totalLetters; i++) {
      const col = getRandomColorObj();
      currentList.push({
        char: getRandomChar(),
        color: { ...col },
        startColor: { ...col },
        targetColor: { ...col },
        colorProgress: 1
      });
    }
    letters.current = currentList;
  };

  const drawLetters = () => {
    const ctx = context.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas || letters.current.length === 0) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = 'top';

    const len = letters.current.length;
    const cols = grid.current.columns;
    
    for (let index = 0; index < len; index++) {
      const letter = letters.current[index];
      const x = (index % cols) * charWidth;
      const y = Math.floor(index / cols) * charHeight;
      
      // Zero string parsing here: extremely fast lookup
      ctx.fillStyle = `rgb(${letter.color.r},${letter.color.g},${letter.color.b})`;
      ctx.fillText(letter.char, x, y);
    }
  };

  const updateLetters = () => {
    const list = letters.current;
    if (!list || list.length === 0) return;

    // Sparser and more subtle glitches: update fewer cells per interval
    const updateCount = Math.max(1, Math.floor(list.length * 0.05));

    for (let i = 0; i < updateCount; i++) {
      const index = Math.floor(Math.random() * list.length);
      const letter = list[index];
      if (!letter) continue;

      letter.char = getRandomChar();
      letter.targetColor = getRandomColorObj();

      if (!smooth) {
        letter.color = { ...letter.targetColor };
        letter.colorProgress = 1;
      } else {
        letter.startColor = { ...letter.color };
        letter.colorProgress = 0;
      }
    }
  };

  const handleSmoothTransitions = () => {
    let needsRedraw = false;
    const list = letters.current;
    const len = list.length;
    
    for (let i = 0; i < len; i++) {
      const letter = list[i];
      if (letter.colorProgress < 1) {
        letter.colorProgress += 0.05;
        if (letter.colorProgress > 1) {
          letter.colorProgress = 1;
        }

        const factor = letter.colorProgress;
        const start = letter.startColor;
        const target = letter.targetColor;

        // Clean arithmetics on raw numbers
        letter.color.r = Math.round(start.r + (target.r - start.r) * factor);
        letter.color.g = Math.round(start.g + (target.g - start.g) * factor);
        letter.color.b = Math.round(start.b + (target.b - start.b) * factor);
        
        needsRedraw = true;
      }
    }

    if (needsRedraw) {
      drawLetters();
    }
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    if (context.current) {
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const { columns, rows } = calculateGrid(rect.width, rect.height);
    initializeLetters(columns, rows);
    drawLetters();
  };

  const animate = (time: number) => {
    if (!isAnimating.current) return;

    if (time - lastGlitchTime.current >= glitchSpeed) {
      updateLetters();
      drawLetters();
      lastGlitchTime.current = time;
    }

    if (smooth) {
      handleSmoothTransitions();
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    context.current = canvas.getContext('2d');
    
    // Parse colors initially
    parsedColors.current = glitchColors.map(c => hexToRgb(c) || { r: 255, g: 255, b: 255 });
    
    resizeCanvas();

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    const startAnimation = () => {
      if (isAnimating.current) return;
      isAnimating.current = true;
      animationRef.current = requestAnimationFrame(animate);
    };

    const stopAnimation = () => {
      isAnimating.current = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };

    // IntersectionObserver to pause processing completely when off-screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          startAnimation();
        } else {
          stopAnimation();
        }
      },
      { threshold: 0.01 }
    );

    observer.observe(canvas);

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const wasAnimating = isAnimating.current;
        stopAnimation();
        resizeCanvas();
        if (wasAnimating && isVisible.current) {
          startAnimation();
        }
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(resizeTimeout);
      stopAnimation();
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glitchSpeed, smooth, glitchColors]);

  return (
    <div 
      ref={containerRef}
      className={cn("relative w-full h-full overflow-hidden bg-transparent", className)}
    >
      <canvas ref={canvasRef} className={cn("block w-full h-full", canvasClassName)} />
      {outerVignette && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(circle,_rgba(0,0,0,0)_60%,_rgba(0,0,0,1)_100%)]"></div>
      )}
      {centerVignette && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(circle,_rgba(0,0,0,0.8)_0%,_rgba(0,0,0,0)_60%)]"></div>
      )}
    </div>
  );
};

export default LetterGlitch;
