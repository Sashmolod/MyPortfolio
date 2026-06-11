import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { soundSynth } from "../utils/audioSynth";

const WIN_PATTERNS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // cols
  [0, 4, 8],
  [2, 4, 6], // diagonals
];

export default function PageTear() {
  const [isOpen, setIsOpen] = useState(false);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState("user"); // 'user' or 'doodly'
  const [winner, setWinner] = useState(null); // 'X', 'O', 'draw' or null

  const checkGameWinner = (tempBoard) => {
    for (let pattern of WIN_PATTERNS) {
      const [a, b, c] = pattern;
      if (
        tempBoard[a] &&
        tempBoard[a] === tempBoard[b] &&
        tempBoard[a] === tempBoard[c]
      ) {
        return tempBoard[a];
      }
    }
    if (tempBoard.every((cell) => cell !== null)) {
      return "draw";
    }
    return null;
  };

  const handleCellClick = (index) => {
    if (board[index] || turn !== "user" || winner) return;

    soundSynth.playTap();
    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);

    const gameWinner = checkGameWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      triggerWinnerEvent(gameWinner);
    } else {
      setTurn("doodly");
    }
  };

  // Doodly AI / heuristic turn
  useEffect(() => {
    if (turn !== "doodly" || winner) return;

    const timer = setTimeout(() => {
      // Find Doodly's move
      const move = getDoodlyMove(board);
      if (move !== null && move !== undefined) {
        soundSynth.playTap();
        const newBoard = [...board];
        newBoard[move] = "O";
        setBoard(newBoard);

        const gameWinner = checkGameWinner(newBoard);
        if (gameWinner) {
          setWinner(gameWinner);
          triggerWinnerEvent(gameWinner);
        } else {
          setTurn("user");
        }
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [turn, board, winner]);

  const getDoodlyMove = (tempBoard) => {
    // 1. Can Doodly win?
    for (let pattern of WIN_PATTERNS) {
      const [a, b, c] = pattern;
      if (tempBoard[a] === "O" && tempBoard[b] === "O" && tempBoard[c] === null)
        return c;
      if (tempBoard[a] === "O" && tempBoard[c] === "O" && tempBoard[b] === null)
        return b;
      if (tempBoard[b] === "O" && tempBoard[c] === "O" && tempBoard[a] === null)
        return a;
    }

    // 2. Block user
    for (let pattern of WIN_PATTERNS) {
      const [a, b, c] = pattern;
      if (tempBoard[a] === "X" && tempBoard[b] === "X" && tempBoard[c] === null)
        return c;
      if (tempBoard[a] === "X" && tempBoard[c] === "X" && tempBoard[b] === null)
        return b;
      if (tempBoard[b] === "X" && tempBoard[c] === "X" && tempBoard[a] === null)
        return a;
    }

    // 3. Take center
    if (tempBoard[4] === null) return 4;

    // 4. Take corners
    const corners = [0, 2, 6, 8].filter((idx) => tempBoard[idx] === null);
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)];
    }

    // 5. Take sides
    const sides = [1, 3, 5, 7].filter((idx) => tempBoard[idx] === null);
    if (sides.length > 0) {
      return sides[Math.floor(Math.random() * sides.length)];
    }

    return null;
  };

  const triggerWinnerEvent = (result) => {
    if (result === "X") {
      window.dispatchEvent(new CustomEvent("ttt-win-user"));
    } else if (result === "O") {
      window.dispatchEvent(new CustomEvent("ttt-win-doodly"));
    } else if (result === "draw") {
      window.dispatchEvent(new CustomEvent("ttt-draw"));
    }
  };

  const handleReset = () => {
    soundSynth.playPageFlip();
    setBoard(Array(9).fill(null));
    setWinner(null);
    setTurn("user");
    window.dispatchEvent(new CustomEvent("ttt-start"));
  };

  return (
    <>
      {/* Corner flap visible at all times */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            role="button"
            tabIndex={0}
            aria-label="Secret folded paper corner. Click to tear and open game."
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsOpen(true);
                soundSynth.playTear();
                window.dispatchEvent(new CustomEvent("ttt-start"));
              }
            }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: "65px",
              height: "65px",
              zIndex: 100000,
              cursor: "pointer",
              pointerEvents: "auto",
              userSelect: "none",
            }}
            onClick={() => {
              setIsOpen(true);
              soundSynth.playTear();
              window.dispatchEvent(new CustomEvent("ttt-start"));
            }}
            whileHover={{ scale: 1.05, rotate: -2 }}
          >
            <svg viewBox="0 0 65 65" width="65" height="65">
              {/* Folded corner flap shadow */}
              <path
                d="M 65 0 L 0 0 C 15 25, 25 45, 65 65 Z"
                fill="var(--card-bg)"
                stroke="var(--text)"
                strokeWidth="2.5"
                style={{ filter: "url(#wobblyFilterTear)" }}
              />
              <path
                d="M 0 0 L 65 65"
                stroke="var(--text)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              {/* Fold line visual */}
              <path
                d="M 0 0 Q 30 15, 65 65"
                stroke="var(--text)"
                strokeWidth="1.5"
                fill="none"
              />
              <defs>
                <filter
                  id="wobblyFilterTear"
                  x="-10%"
                  y="-10%"
                  width="120%"
                  height="120%"
                >
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.04"
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Torn-off game container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: -300, opacity: 0, scale: 0.9, rotate: 2 }}
            animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
            exit={{ y: -300, opacity: 0, scale: 0.9, rotate: -2 }}
            transition={{ type: "spring", damping: 18, stiffness: 120 }}
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              width: "250px",
              background: "var(--card-bg)",
              border: "var(--border-style)",
              borderStyle: "solid",
              borderRadius: "var(--sketch-radius-2)",
              padding: "16px",
              boxShadow: "var(--shadow)",
              fontFamily: "'Architects Daughter', cursive",
              zIndex: 100000,
              color: "var(--text)",
              userSelect: "none",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
                borderBottom: "2px dashed var(--text)",
                paddingBottom: "6px",
              }}
            >
              <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                Крестики-Нолики ✏️
              </span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  soundSynth.playTear();
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "var(--text)",
                  padding: "2px 6px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Game Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "8px",
                width: "180px",
                height: "180px",
                margin: "12px auto",
                position: "relative",
              }}
            >
              {/* Pencil sketch board lines */}
              <div
                style={{
                  position: "absolute",
                  top: "33%",
                  left: 0,
                  width: "100%",
                  height: "2px",
                  background: "var(--text)",
                  opacity: 0.7,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "66%",
                  left: 0,
                  width: "100%",
                  height: "2px",
                  background: "var(--text)",
                  opacity: 0.7,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: "33%",
                  top: 0,
                  width: "2px",
                  height: "100%",
                  background: "var(--text)",
                  opacity: 0.7,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: "66%",
                  top: 0,
                  width: "2px",
                  height: "100%",
                  background: "var(--text)",
                  opacity: 0.7,
                }}
              />

              {board.map((cell, idx) => {
                const isClickable = !cell && !winner && turn !== "doodly";
                return (
                  <div
                    key={idx}
                    role="button"
                    tabIndex={isClickable ? 0 : -1}
                    aria-label={`Cell ${idx + 1}, ${cell || "empty"}`}
                    onKeyDown={(e) => {
                      if (isClickable && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        handleCellClick(idx);
                      }
                    }}
                    onClick={() => handleCellClick(idx)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: isClickable ? "pointer" : "default",
                      fontSize: "28px",
                      fontWeight: "bold",
                      fontFamily: "'Architects Daughter', cursive",
                    }}
                  >
                    {cell === "X" && (
                      <motion.span
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        style={{
                          color: "var(--primary)",
                          filter: "url(#wobblyFilterTear)",
                        }}
                      >
                        X
                      </motion.span>
                    )}
                    {cell === "O" && (
                      <motion.span
                        initial={{ scale: 0, rotate: 20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        style={{
                          color: "var(--secondary)",
                          filter: "url(#wobblyFilterTear)",
                        }}
                      >
                        O
                      </motion.span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Game Status & Control */}
            <div style={{ textAlign: "center", marginTop: "10px" }}>
              {winner && (
                <div
                  style={{
                    marginBottom: "8px",
                    fontSize: "13px",
                    fontWeight: "bold",
                  }}
                >
                  {winner === "draw" ? (
                    <span>Ничья! 🤝</span>
                  ) : winner === "X" ? (
                    <span style={{ color: "var(--primary)" }}>Победа! 🎉</span>
                  ) : (
                    <span style={{ color: "var(--secondary)" }}>
                      Дудли выиграл! 🦉
                    </span>
                  )}
                </div>
              )}

              <button
                className="btn"
                onClick={handleReset}
                style={{
                  fontSize: "11px",
                  padding: "4px 12px",
                  fontFamily: "'Architects Daughter', cursive",
                  width: "100%",
                }}
              >
                {winner ? "Сыграть ещё" : "Сбросить"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
