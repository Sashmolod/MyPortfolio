import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  beforeAll,
} from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import React, { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LoginPage } from "./pages/LoginPage";
import AdminDashboard from "./admin/pages/AdminDashboard";
import DoodlyHelper from "./components/DoodlyHelper";
import CoffeeCup from "./components/CoffeeCup";
import SketchyBug from "./components/SketchyBug";
import PageTear from "./components/PageTear";
import * as authApi from "./api/authApi";
import api from "./api";

// Mock contexts and apis
vi.mock("./utils/audioSynth", () => ({
  soundSynth: {
    playPop: vi.fn(),
    playSlosh: vi.fn(),
    playSplat: vi.fn(),
    playWhoosh: vi.fn(),
    playTear: vi.fn(),
    playTap: vi.fn(),
    playCrumple: vi.fn(),
    playPageFlip: vi.fn(),
    startScribble: vi.fn(),
    stopScribble: vi.fn(),
    setMuted: vi.fn(),
    setSettingsMuted: vi.fn(),
  },
}));

vi.mock("./api", () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    put: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("./api/authApi", () => ({
  getMe: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}));

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: "/login", state: null }),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));

// Mock framer-motion to bypass animation lag/async rendering using a Proxy (supports all tag types)
vi.mock("framer-motion", () => {
  const React = require("react");
  const Dummy = React.forwardRef(
    ({ children, onAnimationComplete, ...props }, ref) => {
      React.useEffect(() => {
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, [onAnimationComplete]);
      return React.createElement("div", { ref, ...props }, children);
    },
  );
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

// Mock nested dashboard subcomponents to keep test clean
vi.mock("./admin/components/ConfirmDialog", () => ({ default: () => null }));
vi.mock("./admin/components/MediaTab", () => ({ default: () => null }));
vi.mock("./admin/components/TrashView", () => ({ default: () => null }));
vi.mock("./admin/components/SkillForm", () => ({ default: () => null }));
vi.mock("./admin/components/ProjectForm", () => ({ default: () => null }));
vi.mock("./admin/components/HeroForm", () => ({ default: () => null }));
vi.mock("./admin/components/SocialLinkForm", () => ({ default: () => null }));
vi.mock("./admin/components/StatsView", () => ({ default: () => null }));

describe("Frontend Login-to-Dashboard Integration Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Dynamically mock api.get to return valid settings
    vi.mocked(api.get).mockImplementation((url) => {
      if (url === "/portfolio/settings") {
        return Promise.resolve({
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
        });
      }
      return Promise.resolve({ data: [] });
    });
  });

  // Simple integration wrapper that switches between Login and Dashboard based on AuthContext state
  function AppIntegrationWrapper() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return <div>Loading integration...</div>;
    }

    return isAuthenticated ? <AdminDashboard /> : <LoginPage />;
  }

  it("navigates the user from LoginPage to AdminDashboard upon successful login", async () => {
    // 1. Initial auth check returns null (not authenticated)
    vi.mocked(authApi.getMe).mockRejectedValueOnce(new Error("No token"));
    // 2. Successful login credentials check
    vi.mocked(authApi.login).mockResolvedValueOnce(undefined);
    // 3. Post-login getMe profile retrieval returns the user details
    vi.mocked(authApi.getMe).mockResolvedValueOnce({
      user: { id: 1, username: "administrator", isActive: true },
    });

    const { container } = render(
      <AuthProvider>
        <SettingsProvider>
          <AppIntegrationWrapper />
        </SettingsProvider>
      </AuthProvider>,
    );

    // Initial check: LoginPage is rendered
    await waitFor(() => {
      expect(screen.getByText("Войти в систему")).toBeInTheDocument();
    });

    const usernameInput = container.querySelector('input[type="text"]');
    const passwordInput = container.querySelector('input[type="password"]');
    const submitBtn = screen.getByRole("button", { name: "Войти" });

    // Enter valid details and submit
    fireEvent.change(usernameInput, { target: { value: "administrator" } });
    fireEvent.change(passwordInput, { target: { value: "correct-pass" } });
    fireEvent.click(submitBtn);

    // Assert transitions into the AdminDashboard layout
    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        username: "administrator",
        password: "correct-pass",
      });
      expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
      expect(screen.queryByText("Войти в систему")).not.toBeInTheDocument();
    });
  });

  it("allows switching dashboard tabs and toggling settings", async () => {
    // Mock getMe to return user details immediately so integration starts logged in
    vi.mocked(authApi.getMe).mockResolvedValue({
      user: { id: 1, username: "administrator", isActive: true },
    });

    render(
      <AuthProvider>
        <SettingsProvider>
          <AppIntegrationWrapper />
        </SettingsProvider>
      </AuthProvider>,
    );

    // Should load straight to AdminDashboard
    await waitFor(() => {
      expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    });

    // Switch to Settings tab
    const settingsTabBtn = screen.getByRole("button", { name: "Settings" });
    fireEvent.click(settingsTabBtn);

    // Settings title should be visible
    expect(
      screen.getByText("Интерактивные функции и анимации"),
    ).toBeInTheDocument();

    // Toggle sounds setting
    const checkbox = screen.getByLabelText("Звуковые эффекты (Web Audio API)");
    expect(checkbox).toBeChecked(); // default is true

    // Mock API put request
    vi.mocked(api.put).mockResolvedValueOnce({ data: { success: true } });

    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith("/admin/settings", {
        enableSounds: false,
      });
    });
  });

  describe("Doodly Helper and Interactive Components Integration", () => {
    beforeEach(() => {
      vi.stubGlobal("requestAnimationFrame", (cb) => setTimeout(cb, 16));
      vi.stubGlobal("cancelAnimationFrame", (id) => clearTimeout(id));
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("updates Doodly Helper bubble when coffee is spilled", async () => {
      vi.useFakeTimers();
      render(
        <ThemeProvider>
          <SettingsProvider>
            <DoodlyHelper />
            <CoffeeCup />
          </SettingsProvider>
        </ThemeProvider>,
      );

      // Let mount effects run
      await act(async () => {
        await vi.runAllTicks();
      });

      // Initial greeting (triggers after 3000ms)
      await act(async () => {
        vi.advanceTimersByTime(3000);
        await vi.runAllTicks();
      });
      expect(screen.getByText(/Привет! Нажми на меня/)).toBeInTheDocument();

      // Find the coffee cup
      const cupSvg = document.querySelector('svg[viewBox="0 0 80 80"]');
      const cupContainer = cupSvg.parentElement;

      // Click 5 times to spill coffee
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          fireEvent.click(cupContainer);
          await vi.runAllTicks();
        });
      }

      // Doodly Helper should react to coffee-spill
      expect(screen.getByText(/Кофе пролился/)).toBeInTheDocument();
      vi.useRealTimers();
    });

    it("updates Doodly Helper bubble when a bug is squashed", async () => {
      vi.useFakeTimers();
      render(
        <ThemeProvider>
          <SettingsProvider>
            <DoodlyHelper />
            <SketchyBug />
          </SettingsProvider>
        </ThemeProvider>,
      );

      await act(async () => {
        await vi.runAllTicks();
      });

      // Advance 12 seconds to spawn the bug
      await act(async () => {
        vi.advanceTimersByTime(12000);
        await vi.runAllTicks();
      });

      // Find the bug
      const bugSvg = document.querySelector('svg[viewBox="0 0 30 30"]');
      expect(bugSvg).toBeInTheDocument();

      // Click the bug to squash it
      await act(async () => {
        fireEvent.click(bugSvg.parentElement);
        await vi.runAllTicks();
      });

      // Doodly Helper should react to bug-squashed
      expect(screen.getByText(/Бедный жучок/)).toBeInTheDocument();
      vi.useRealTimers();
    });

    it("updates Doodly Helper bubble during Tic-Tac-Toe game events", async () => {
      vi.useFakeTimers();
      render(
        <ThemeProvider>
          <SettingsProvider>
            <DoodlyHelper />
            <PageTear />
          </SettingsProvider>
        </ThemeProvider>,
      );

      await act(async () => {
        await vi.runAllTicks();
      });

      // Find the corner flap and click it
      const flap = document.querySelector('svg[viewBox="0 0 65 65"]');
      await act(async () => {
        fireEvent.click(flap.parentElement);
        await vi.runAllTicks();
      });

      // Doodly Helper should react to ttt-start
      expect(screen.getByText(/Сыграем в крестики-нолики/)).toBeInTheDocument();

      // Get cells
      const grid = document.querySelector('div[style*="width: 180px"]');
      const allDivs = grid.querySelectorAll("div");
      const cells = Array.from(allDivs).slice(-9);

      // Play moves to let Doodly win
      // 1. Click 0
      await act(async () => {
        fireEvent.click(cells[0]);
        await vi.runAllTicks();
      });
      // Let Doodly AI effect run and schedule timer
      await act(async () => {
        await vi.runAllTicks();
      });
      // Advance 600ms for Doodly move
      await act(async () => {
        vi.advanceTimersByTime(600);
        await vi.runAllTicks();
      });

      // 2. Click 1
      await act(async () => {
        fireEvent.click(cells[1]);
        await vi.runAllTicks();
      });
      await act(async () => {
        await vi.runAllTicks();
      });
      await act(async () => {
        vi.advanceTimersByTime(600);
        await vi.runAllTicks();
      });

      // 3. Click 3
      await act(async () => {
        fireEvent.click(cells[3]);
        await vi.runAllTicks();
      });
      await act(async () => {
        await vi.runAllTicks();
      });
      await act(async () => {
        vi.advanceTimersByTime(600);
        await vi.runAllTicks();
      });

      // Doodly Helper should react to ttt-win-doodly
      expect(
        screen.getByText(/Умная скрепка побеждает человека/),
      ).toBeInTheDocument();
      vi.useRealTimers();
    });
  });
});
