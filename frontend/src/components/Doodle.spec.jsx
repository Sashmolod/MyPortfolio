import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import DoodleCanvas from "./DoodleCanvas";
import DoodleControls from "./DoodleControls";
import DoodlyHelper from "./DoodlyHelper";
import { SettingsProvider } from "../contexts/SettingsContext";
import { ThemeProvider } from "../contexts/ThemeContext";

// Mock audioSynth and api
vi.mock("../utils/audioSynth", () => ({
  soundSynth: {
    startScribble: vi.fn(),
    stopScribble: vi.fn(),
    playPop: vi.fn(),
    setSettingsMuted: vi.fn(),
  },
}));

vi.mock("../api", () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: {
        enableDoodly: true,
        enableSounds: true,
        enableBug: true,
        enablePageTear: true,
        enableInkLeak: true,
        enableCoffeeSpill: true,
        enableDrawSkills: true,
        enableEraser: true,
        enableCrumpledPageTransition: true,
        showAdminLink: true,
      },
    }),
    post: vi.fn(),
  },
}));

// Mock framer-motion to bypass animation lag/async rendering using a Proxy
vi.mock("framer-motion", () => {
  const React = require("react");
  const Dummy = React.forwardRef(({ children, ...props }, ref) => {
    return React.createElement("div", { ref, ...props }, children);
  });
  const motionProxy = new Proxy(
    {},
    {
      get: (target, key) => {
        return Dummy;
      },
    },
  );
  return {
    motion: motionProxy,
    AnimatePresence: ({ children }) => children,
  };
});

// Mock ResizeObserver since jsdom doesn't support it
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("Doodle Feature Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("DoodleCanvas", () => {
    it("does not draw when not active", () => {
      const setPaths = vi.fn();
      render(
        <DoodleCanvas
          active={false}
          color="black"
          brushWidth={4}
          paths={[]}
          setPaths={setPaths}
        />,
      );

      const canvas = document.querySelector("canvas");
      expect(canvas).toBeInTheDocument();
      expect(canvas.style.pointerEvents).toBe("none");

      fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 });
      expect(setPaths).not.toHaveBeenCalled();
    });

    it("draws and records path when active", async () => {
      const setPaths = vi.fn();
      const drawStartSpy = vi.fn();
      window.addEventListener("doodle-draw-start", drawStartSpy);

      // Mock getBoundingClientRect
      const originalGetBoundingClientRect =
        HTMLCanvasElement.prototype.getBoundingClientRect;
      HTMLCanvasElement.prototype.getBoundingClientRect = () => ({
        left: 0,
        top: 0,
        width: 500,
        height: 500,
        right: 500,
        bottom: 500,
      });

      // Mock canvas getContext
      const mockStroke = vi.fn();
      const mockBeginPath = vi.fn();
      const mockArc = vi.fn();
      const mockFill = vi.fn();
      const mockMoveTo = vi.fn();
      const mockLineTo = vi.fn();
      HTMLCanvasElement.prototype.getContext = () => ({
        beginPath: mockBeginPath,
        arc: mockArc,
        fill: mockFill,
        moveTo: mockMoveTo,
        lineTo: mockLineTo,
        stroke: mockStroke,
        clearRect: vi.fn(),
        scale: vi.fn(),
      });

      render(
        <DoodleCanvas
          active={true}
          color="rgba(74, 85, 104, 0.85)"
          brushWidth={4}
          paths={[]}
          setPaths={setPaths}
        />,
      );

      const canvas = document.querySelector("canvas");
      expect(canvas.style.pointerEvents).toBe("auto");

      // 1. Mouse down triggers drawing start & dot drawing
      fireEvent.mouseDown(canvas, { clientX: 50, clientY: 50 });
      expect(mockBeginPath).toHaveBeenCalled();
      expect(mockArc).toHaveBeenCalledWith(50, 50, 2, 0, Math.PI * 2);
      expect(drawStartSpy).toHaveBeenCalled();

      // 2. Mouse move draws line to coordinates
      fireEvent.mouseMove(canvas, { clientX: 60, clientY: 65 });
      expect(mockLineTo).toHaveBeenCalledWith(60, 65);
      expect(mockStroke).toHaveBeenCalled();

      // 3. Mouse up stops drawing and saves path
      fireEvent.mouseUp(canvas);
      expect(setPaths).toHaveBeenCalled();

      HTMLCanvasElement.prototype.getBoundingClientRect =
        originalGetBoundingClientRect;
      window.removeEventListener("doodle-draw-start", drawStartSpy);
    });
  });

  describe("DoodleControls", () => {
    it("renders in minimized state and allows expanding", () => {
      render(
        <SettingsProvider>
          <DoodleControls
            active={false}
            setActive={vi.fn()}
            color="black"
            setColor={vi.fn()}
            brushWidth={4}
            setBrushWidth={vi.fn()}
            onUndo={vi.fn()}
            onClear={vi.fn()}
            onGuessDrawing={vi.fn()}
            isGuessing={false}
          />
        </SettingsProvider>,
      );

      // Default should be expanded, click minimize button
      const minimizeBtn = screen.getByTitle("Minimize toolbar");
      fireEvent.click(minimizeBtn);

      // Minimized button appears
      const openBtn = screen.getByTitle("Open drawing panel");
      expect(openBtn).toBeInTheDocument();

      // Click open -> expands again
      fireEvent.click(openBtn);
      expect(screen.getByText("🎨 Doodles / Рисование")).toBeInTheDocument();
    });

    it("triggers color/tool switches and clear/undo clicks", () => {
      const setActive = vi.fn();
      const setColor = vi.fn();
      const setBrushWidth = vi.fn();
      const onUndo = vi.fn();
      const onClear = vi.fn();
      const onGuess = vi.fn();

      render(
        <SettingsProvider>
          <DoodleControls
            active={true}
            setActive={setActive}
            color="rgba(74, 85, 104, 0.85)"
            brushWidth={3}
            setColor={setColor}
            setBrushWidth={setBrushWidth}
            onUndo={onUndo}
            onClear={onClear}
            onGuessDrawing={onGuess}
            isGuessing={false}
          />
        </SettingsProvider>,
      );

      // Toggle active
      const toggleBtn = screen.getByText("📴 Disable Drawing / Навигация");
      fireEvent.click(toggleBtn);
      expect(setActive).toHaveBeenCalledWith(false);

      // Change tool preset
      const redPenBtn = screen.getByText("🖊️ Red Pen");
      fireEvent.click(redPenBtn);
      expect(setColor).toHaveBeenCalledWith("rgba(229, 62, 62, 0.9)");
      expect(setBrushWidth).toHaveBeenCalledWith(3);

      // Undo & Clear clicks
      const undoBtn = screen.getByTitle("Remove last stroke");
      const clearBtn = screen.getByTitle("Clear all doodles");
      fireEvent.click(undoBtn);
      fireEvent.click(clearBtn);

      expect(onUndo).toHaveBeenCalled();
      expect(onClear).toHaveBeenCalled();

      // Guess click
      const guessBtn = screen.getByText(/Дудли, угадай!/);
      fireEvent.click(guessBtn);
      expect(onGuess).toHaveBeenCalled();
    });
  });

  describe("DoodlyHelper", () => {
    let originalSetTimeout;
    beforeEach(() => {
      originalSetTimeout = global.setTimeout;
      global.setTimeout = (cb, ms) => {
        // Run with 0 delay so tests are instant and we don't need fake timers
        return originalSetTimeout(cb, 0);
      };
    });

    afterEach(() => {
      global.setTimeout = originalSetTimeout;
    });

    it("greets user and responds to document copy/custom events", async () => {
      render(
        <ThemeProvider>
          <DoodlyHelper />
        </ThemeProvider>,
      );

      // Greeting message should render immediately
      await waitFor(() => {
        expect(
          screen.getByText(/Привет! Нажми на меня, чтобы поболтать/),
        ).toBeInTheDocument();
      });

      // Trigger copy event
      fireEvent.copy(document);
      await waitFor(() => {
        expect(screen.getByText(/Опа, копируешь\?/)).toBeInTheDocument();
      });

      // Trigger coffee slosh event
      window.dispatchEvent(new CustomEvent("coffee-slosh"));
      await waitFor(() => {
        expect(screen.getByText(/Осторожнее с кофе!/)).toBeInTheDocument();
      });

      // Trigger tic-tac-toe win event
      window.dispatchEvent(new CustomEvent("ttt-win-doodly"));
      await waitFor(() => {
        expect(
          screen.getByText(/Умная скрепка побеждает человека!/),
        ).toBeInTheDocument();
      });
    });

    it("submits query to chatbot and displays response", async () => {
      const mockChatResponse = { response: "Привет, я скрепка!" };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockChatResponse),
      });

      render(
        <ThemeProvider>
          <DoodlyHelper />
        </ThemeProvider>,
      );

      // Helper character element
      const clipSvg = document.querySelector(".doodly-character");
      fireEvent.click(clipSvg);

      // Chat input form
      const input = screen.getByPlaceholderText("Спроси меня...");
      const form = input.closest("form");

      fireEvent.change(input, { target: { value: "Как дела?" } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
        expect(screen.getByText("Привет, я скрепка!")).toBeInTheDocument();
      });
    });
  });
});
