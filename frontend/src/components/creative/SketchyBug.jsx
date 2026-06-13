import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundSynth } from '../../utils/audioSynth';

export default function SketchyBug() {
  const [bug, setBug] = useState(null);
  const [frame, setFrame] = useState(0);
  const requestRef = useRef();
  const stateRef = useRef();

  // Spawns a bug from offscreen
  const spawnBug = () => {
    if (bug) return; // Only one bug at a time

    const sides = ['left', 'right', 'top', 'bottom'];
    const startSide = sides[Math.floor(Math.random() * sides.length)];
    let x = 0;
    let y = 0;
    const padding = 50;

    const width = window.innerWidth;
    const height = window.innerHeight;

    if (startSide === 'left') {
      x = -padding;
      y = Math.random() * (height - 100) + 50;
    } else if (startSide === 'right') {
      x = width + padding;
      y = Math.random() * (height - 100) + 50;
    } else if (startSide === 'top') {
      x = Math.random() * (width - 100) + 50;
      y = -padding;
    } else {
      x = Math.random() * (width - 100) + 50;
      y = height + padding;
    }

    // Set initial target inside screen
    const targetX = Math.random() * (width - 200) + 100;
    const targetY = Math.random() * (height - 200) + 100;

    const angle = Math.atan2(targetY - y, targetX - x);
    const speed = 1.8;

    const newBug = {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      angle: (angle * 180) / Math.PI + 90,
      targetX,
      targetY,
      speed,
      squashed: false,
      opacity: 1,
      stepsLeft: 200 + Math.random() * 200, // moves for a while, then leaves
      turningCooldown: 0,
    };

    setBug(newBug);
    stateRef.current = newBug;
  };

  // Spawn bug 10s after initial render, then every 45s
  useEffect(() => {
    const initialTimer = setTimeout(spawnBug, 12000);
    const intervalTimer = setInterval(spawnBug, 45000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [bug]);

  // Bug movement loop
  useEffect(() => {
    if (!bug || bug.squashed) return;

    const updateBug = () => {
      const current = stateRef.current;
      if (!current || current.squashed) return;

      let {
        x,
        y,
        vx,
        vy,
        angle,
        targetX,
        targetY,
        speed,
        stepsLeft,
        turningCooldown,
      } = current;

      // Increment frame for leg animation
      setFrame((prev) => prev + 1);

      // Move bug
      x += vx;
      y += vy;
      stepsLeft -= 1;
      turningCooldown -= 1;

      const width = window.innerWidth;
      const height = window.innerHeight;

      // Check if we reached target or need new target
      const distToTarget = Math.hypot(targetX - x, targetY - y);

      if (distToTarget < 30 || turningCooldown <= 0) {
        if (stepsLeft > 0) {
          // New random target inside screen
          targetX = Math.random() * (width - 200) + 100;
          targetY = Math.random() * (height - 200) + 100;
          turningCooldown = 80 + Math.random() * 80;
        } else {
          // Leave screen (target far offscreen)
          const leaveAngle = Math.random() * Math.PI * 2;
          targetX = x + Math.cos(leaveAngle) * 800;
          targetY = y + Math.sin(leaveAngle) * 800;
          turningCooldown = 500; // don't change until gone
        }

        // Calculate new velocities
        const newAngleRad = Math.atan2(targetY - y, targetX - x);
        vx = Math.cos(newAngleRad) * speed;
        vy = Math.sin(newAngleRad) * speed;
        angle = (newAngleRad * 180) / Math.PI + 90;
      }

      // If leaving and completely off-screen, remove bug
      const padding = 100;
      if (
        stepsLeft <= 0 &&
        (x < -padding ||
          x > width + padding ||
          y < -padding ||
          y > height + padding)
      ) {
        setBug(null);
        stateRef.current = null;
        return;
      }

      const updated = {
        ...current,
        x,
        y,
        vx,
        vy,
        angle,
        targetX,
        targetY,
        stepsLeft,
        turningCooldown,
      };

      setBug(updated);
      stateRef.current = updated;

      requestRef.current = requestAnimationFrame(updateBug);
    };

    requestRef.current = requestAnimationFrame(updateBug);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [bug === null, bug?.squashed]);

  const handleSquash = (e) => {
    e.stopPropagation();
    if (!bug || bug.squashed) return;

    soundSynth.playTap();
    window.dispatchEvent(new CustomEvent('bug-squashed'));

    const squashedBug = {
      ...bug,
      squashed: true,
      vx: 0,
      vy: 0,
    };
    setBug(squashedBug);
    stateRef.current = squashedBug;

    // Fade out and remove
    setTimeout(() => {
      setBug(null);
      stateRef.current = null;
    }, 1500);
  };

  if (!bug) return null;

  const legPath =
    frame % 6 < 3
      ? 'M 4 8 L 15 15 L 26 8 M 2 15 L 15 15 L 28 15 M 4 22 L 15 15 L 26 22'
      : 'M 4 12 L 15 15 L 26 12 M 4 15 L 15 15 L 26 15 M 4 18 L 15 15 L 26 18';

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9998, // just under drawing controls, above standard UI
      }}
    >
      <AnimatePresence>
        {bug && (
          <motion.div
            key="bug-element"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: bug.squashed ? [1, 1, 0] : 1,
              scale: bug.squashed ? 1.1 : 1,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: bug.squashed ? 1.5 : 0.2 }}
            style={{
              position: 'absolute',
              left: bug.x,
              top: bug.y,
              width: '40px',
              height: '40px',
              marginLeft: '-20px',
              marginTop: '-20px',
              pointerEvents: 'auto',
              cursor: bug.squashed ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              userSelect: 'none',
            }}
            role={bug.squashed ? undefined : 'button'}
            tabIndex={bug.squashed ? -1 : 0}
            aria-label={
              bug.squashed
                ? 'Squashed bug'
                : 'Squashable bug crawling on screen'
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSquash(e);
              }
            }}
            onClick={handleSquash}
          >
            {!bug.squashed ? (
              <svg
                viewBox="0 0 30 30"
                width="34"
                height="34"
                style={{
                  transform: `rotate(${bug.angle}deg)`,
                  transition: 'transform 0.15s linear',
                }}
              >
                {/* Wiggle Legs */}
                <path
                  d={legPath}
                  stroke="var(--text)"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Body */}
                <ellipse
                  cx="15"
                  cy="15"
                  rx="5"
                  ry="7.5"
                  fill="var(--card-bg)"
                  stroke="var(--text)"
                  strokeWidth="2"
                  style={{ filter: 'url(#wobblyFilterBug)' }}
                />
                {/* Head */}
                <circle cx="15" cy="6.5" r="2.8" fill="var(--text)" />
                {/* Antennae */}
                <path
                  d="M 13.5 4.5 Q 11 1.5, 8 3 M 16.5 4.5 Q 19 1.5, 22 3"
                  stroke="var(--text)"
                  strokeWidth="1.2"
                  fill="none"
                  strokeLinecap="round"
                />
                <defs>
                  <filter
                    id="wobblyFilterBug"
                    x="-10%"
                    y="-10%"
                    width="120%"
                    height="120%"
                  >
                    <feTurbulence
                      type="fractalNoise"
                      baseFrequency="0.08"
                      numOctaves="2"
                      result="noise"
                    />
                    <feDisplacementMap
                      in="SourceGraphic"
                      in2="noise"
                      scale="1.5"
                      xChannelSelector="R"
                      yChannelSelector="G"
                    />
                  </filter>
                </defs>
              </svg>
            ) : (
              // Squashed Ink Splat
              <svg viewBox="0 0 30 30" width="36" height="36">
                <path
                  d="M 15 5 C 19 3, 24 7, 26 12 C 28 17, 23 23, 17 25 C 12 27, 6 24, 4 18 C 2 12, 10 7, 15 5 Z"
                  fill="var(--text)"
                  opacity="0.8"
                  style={{ filter: 'url(#splatFilter)' }}
                />
                {/* Splash droplets */}
                <circle cx="7" cy="8" r="2" fill="var(--text)" opacity="0.8" />
                <circle
                  cx="23"
                  cy="22"
                  r="1.5"
                  fill="var(--text)"
                  opacity="0.8"
                />
                <circle
                  cx="12"
                  cy="27"
                  r="1"
                  fill="var(--text)"
                  opacity="0.8"
                />
                <circle
                  cx="25"
                  cy="6"
                  r="1.8"
                  fill="var(--text)"
                  opacity="0.8"
                />

                {/* Cute X eyes to indicate squashed bug */}
                <path
                  d="M 12 13 L 15 16 M 15 13 L 12 16"
                  stroke="var(--card-bg)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <path
                  d="M 17 13 L 20 16 M 20 13 L 17 16"
                  stroke="var(--card-bg)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />

                <defs>
                  <filter
                    id="splatFilter"
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                  >
                    <feTurbulence
                      type="fractalNoise"
                      baseFrequency="0.1"
                      numOctaves="3"
                      result="noise"
                    />
                    <feDisplacementMap
                      in="SourceGraphic"
                      in2="noise"
                      scale="3"
                      xChannelSelector="R"
                      yChannelSelector="G"
                    />
                  </filter>
                </defs>
              </svg>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
