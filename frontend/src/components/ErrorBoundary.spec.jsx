import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import ErrorBoundary from "./ErrorBoundary";

function BrokenComponent({ shouldThrow }) {
  if (shouldThrow) {
    throw new Error("Test component crashed!");
  }
  return <div>Component is fine</div>;
}

describe("ErrorBoundary Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Prevent console.error from cluttering the test logs during expected crashes
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("renders children normally when there are no errors", () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Component is fine")).toBeInTheDocument();
    expect(
      screen.queryByText(/Oops! Something ripped!/),
    ).not.toBeInTheDocument();
  });

  it("catches render errors and renders fallback UI with reload button", () => {
    // Mock window.location.reload
    const reloadSpy = vi.fn();
    const originalLocation = window.location;
    delete window.location;
    window.location = { ...originalLocation, reload: reloadSpy };

    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    // Verify fallback UI is shown
    expect(screen.getByText(/Oops! Something ripped!/)).toBeInTheDocument();
    expect(screen.getByText(/Test component crashed!/)).toBeInTheDocument();

    // Verify reload click
    const reloadBtn = screen.getByText(/Glue It Back!/);
    fireEvent.click(reloadBtn);

    expect(reloadSpy).toHaveBeenCalled();

    // Cleanup location mock
    window.location = originalLocation;
  });
});
