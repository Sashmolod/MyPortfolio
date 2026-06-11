import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import Footer from "./Footer";

describe("Footer Component", () => {
  it("renders copyright text and current year", () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument();
    expect(
      screen.getByText(/MyPortfolio\. All rights reserved\./),
    ).toBeInTheDocument();
  });
});
