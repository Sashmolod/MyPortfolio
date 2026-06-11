import { useEffect, useRef, useState } from 'react';
import { soundSynth } from '../utils/audioSynth';

export default function DoodleCanvas({
  active,
  color,
  brushWidth,
  paths,
  setPaths,
}) {
  const resolveColor = (c) => {
    if (c === 'eraser') {
      const bg = getComputedStyle(document.documentElement)
        .getPropertyValue('--bg')
        .trim();
      return bg || '#fcfaf2';
    }
    return c;
  };
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const currentPathRef = useRef([]);

  // 1. ResizeObserver to keep canvas sized to full scroll height
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = (entries) => {
      for (let entry of entries) {
        const { width, height } = entry.target.getBoundingClientRect();
        // Use scrollHeight for height to cover the whole document height
        const scrollHeight = entry.target.scrollHeight;

        setDimensions({
          width: width,
          height: scrollHeight,
        });
      }
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(document.body);

    return () => observer.disconnect();
  }, []);

  // 2. Handle DPI Scaling and Redrawing Paths
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Set display size
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;

    // Set backing store size scaled for high-DPI
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;

    // Normalize coordinate system to match display size
    ctx.scale(dpr, dpr);

    // Set drawing styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Redraw all saved paths
    paths.forEach((path) => {
      if (path.points.length < 1) return;
      ctx.beginPath();
      ctx.strokeStyle = resolveColor(path.color);
      ctx.lineWidth = path.width;

      const [start, ...rest] = path.points;
      ctx.moveTo(start.x, start.y);

      rest.forEach((pt) => {
        ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
    });
  }, [dimensions, paths]);

  // 3. Mouse / Touch Helpers
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    // For touches
    if (e.touches && e.touches[0]) {
      // clientX/Y are relative to viewport, so we add window scroll coordinates to get page-relative position
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;
      return { x, y };
    }

    // For mouse
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return { x, y };
  };

  const startDrawing = (e) => {
    if (!active) return;
    setIsDrawing(true);
    soundSynth.startScribble();

    // Dispatch doodle drawing start event
    window.dispatchEvent(new CustomEvent('doodle-draw-start'));

    const { x, y } = getCoordinates(e);
    currentPathRef.current = [{ x, y }];

    // Draw single dot initially
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(x, y, brushWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = resolveColor(color);
    ctx.fill();
  };

  const draw = (e) => {
    if (!active || !isDrawing) return;

    // Prevent scrolling on mobile touch when drawing
    if (e.cancelable) {
      e.preventDefault();
    }

    const { x, y } = getCoordinates(e);

    // Check if erasing Doodly Helper in bottom-left viewport
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    if (
      color === 'eraser' &&
      clientX >= 15 &&
      clientX <= 120 &&
      clientY >= window.innerHeight - 150 &&
      clientY <= window.innerHeight
    ) {
      const now = Date.now();
      if (
        !window.lastDoodlyEraseTime ||
        now - window.lastDoodlyEraseTime > 8000
      ) {
        window.lastDoodlyEraseTime = now;
        window.dispatchEvent(new CustomEvent('doodly-erased'));
      }
    }

    const prevPoints = currentPathRef.current;

    if (prevPoints.length > 0) {
      const lastPoint = prevPoints[prevPoints.length - 1];

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.strokeStyle = resolveColor(color);
      ctx.lineWidth = brushWidth;
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    currentPathRef.current = [...prevPoints, { x, y }];
  };

  const stopDrawing = () => {
    if (!active || !isDrawing) return;
    setIsDrawing(false);
    soundSynth.stopScribble();

    if (currentPathRef.current.length > 0) {
      const newPath = {
        points: currentPathRef.current,
        color: color,
        width: brushWidth,
      };
      setPaths((prev) => [...prev, newPath]);
    }
    currentPathRef.current = [];
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: active ? 9999 : -1, // Sits above content when active, else completely below
        pointerEvents: active ? 'auto' : 'none',
        display: 'block',
        cursor: active ? 'crosshair' : 'default',
        touchAction: active ? 'none' : 'auto',
      }}
    />
  );
}
