import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import React from "react";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { SettingsProvider, usePortfolioSettings } from "./SettingsContext";
import { AuthProvider, useAuth } from "./AuthContext";
import api from "../api";
import * as authApi from "../api/authApi";

// Mock audioSynth to avoid actual audio calls
vi.mock("../utils/audioSynth", () => ({
  soundSynth: {
    setSettingsMuted: vi.fn(),
  },
}));

// Mock API calls
vi.mock("../api", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("../api/authApi", () => ({
  getMe: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  changePassword: vi.fn(),
}));

describe("Context Providers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("ThemeContext", () => {
    function ThemeConsumer() {
      const { theme, toggleTheme } = useTheme();
      return (
        <div>
          <span data-testid="theme-val">{theme}</span>
          <button onClick={toggleTheme}>Toggle</button>
        </div>
      );
    }

    it("defaults to light theme and toggles theme on call", () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>,
      );

      const val = screen.getByTestId("theme-val");
      expect(val.textContent).toBe("light");
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");

      const btn = screen.getByText("Toggle");
      fireEvent.click(btn);

      expect(val.textContent).toBe("dark");
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
      expect(localStorage.getItem("theme")).toBe("dark");
    });
  });

  describe("SettingsContext", () => {
    function SettingsConsumer() {
      const { settings, loading } = usePortfolioSettings();
      if (loading) return <div>Loading Settings...</div>;
      return (
        <div data-testid="doodly-val">
          {settings.enableDoodly ? "enabled" : "disabled"}
        </div>
      );
    }

    it("fetches settings on mount", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: {
          enableDoodly: false,
          enableSounds: false,
        },
      });

      render(
        <SettingsProvider>
          <SettingsConsumer />
        </SettingsProvider>,
      );

      expect(screen.getByText("Loading Settings...")).toBeInTheDocument();

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith("/portfolio/settings");
        expect(screen.getByTestId("doodly-val").textContent).toBe("disabled");
      });
    });
  });

  describe("AuthContext", () => {
    function AuthConsumer() {
      const { user, isAuthenticated, isLoading } = useAuth();
      if (isLoading) return <div>Checking Auth...</div>;
      return (
        <div>
          <span data-testid="auth-state">{isAuthenticated ? "yes" : "no"}</span>
          <span data-testid="username">{user?.username || "none"}</span>
        </div>
      );
    }

    it("fetches profile on mount and sets user details", async () => {
      vi.mocked(authApi.getMe).mockResolvedValue({
        user: { id: 1, username: "super-admin", isActive: true },
      });

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>,
      );

      expect(screen.getByText("Checking Auth...")).toBeInTheDocument();

      await waitFor(() => {
        expect(authApi.getMe).toHaveBeenCalled();
        expect(screen.getByTestId("auth-state").textContent).toBe("yes");
        expect(screen.getByTestId("username").textContent).toBe("super-admin");
      });
    });

    it("sets user to null if profile fetch fails", async () => {
      vi.mocked(authApi.getMe).mockRejectedValue(new Error("Unauthorized"));

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("auth-state").textContent).toBe("no");
        expect(screen.getByTestId("username").textContent).toBe("none");
      });
    });
  });
});

// Small helper to simulate fires
import { fireEvent } from "@testing-library/react";
