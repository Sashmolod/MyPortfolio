import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import Header from "./Header";

// Mock contexts
vi.mock("../contexts/ThemeContext", () => ({
  useTheme: () => ({
    theme: "light",
    toggleTheme: vi.fn(),
  }),
}));

vi.mock("../contexts/SettingsContext", () => ({
  usePortfolioSettings: () => ({
    settings: { showAdminLink: true },
  }),
}));

// Mock audioSynth
vi.mock("../utils/audioSynth", () => ({
  soundSynth: {
    setMuted: vi.fn(),
    playPageFlip: vi.fn(),
  },
}));

describe("Header Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders navigation links and admin button when settings enable it", () => {
    render(<Header />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Skills")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("dispatches custom event on double click", () => {
    const dispatchSpy = vi.fn();
    window.addEventListener("ink-leak-triggered", dispatchSpy);

    render(<Header />);
    const h1 = screen.getByText("MyPortfolio");
    fireEvent.doubleClick(h1);

    expect(dispatchSpy).toHaveBeenCalled();
    window.removeEventListener("ink-leak-triggered", dispatchSpy);
  });
});
