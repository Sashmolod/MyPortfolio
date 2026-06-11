import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import Skills from "./Skills";

// Mock SettingsContext hook
vi.mock("../contexts/SettingsContext", () => ({
  usePortfolioSettings: () => ({
    settings: { enableDrawSkills: false },
  }),
}));

// Mock framer-motion
vi.mock("framer-motion", () => {
  const React = require("react");
  const DummyDiv = React.forwardRef(
    (
      { children, whileInView, viewport, initial, transition, ...props },
      ref,
    ) => {
      return React.createElement("div", { ref, ...props }, children);
    },
  );
  return {
    motion: {
      div: DummyDiv,
    },
  };
});

describe("Skills Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders default skills when none are provided", () => {
    render(<Skills skills={[]} />);
    expect(screen.getByText("JavaScript")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("ES6+, TypeScript")).toBeInTheDocument();
  });

  it("renders custom skills with correct level styling", () => {
    const customSkills = [
      {
        id: 1,
        name: "WebAssembly",
        icon: "wasm",
        level: 95,
        description: "Super fast execution",
      },
      {
        id: 2,
        name: "GraphQL",
        icon: "graphql",
        level: 75,
        description: "Query api",
      },
    ];

    const { container } = render(<Skills skills={customSkills} />);
    expect(screen.getByText("WebAssembly")).toBeInTheDocument();
    expect(screen.getByText("Super fast execution")).toBeInTheDocument();
    expect(screen.getByText("GraphQL")).toBeInTheDocument();

    // Verify progress bar levels are applied to widths
    const progressFills = container.querySelectorAll(".level-fill");
    expect(progressFills).toHaveLength(2);
    expect(progressFills[0].style.width).toBe("95%");
    expect(progressFills[1].style.width).toBe("75%");
  });
});
