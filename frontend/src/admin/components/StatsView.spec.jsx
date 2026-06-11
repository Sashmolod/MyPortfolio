import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import StatsView from "./StatsView";

describe("StatsView Component", () => {
  const mockOverview = {
    totalVisits: 150,
    uniqueVisitors: 42,
    todayVisits: 10,
    thisWeekVisits: 70,
    thisMonthVisits: 140,
    deviceBreakdown: [
      { deviceType: "desktop", count: 100 },
      { deviceType: "mobile", count: 45 },
      { deviceType: "tablet", count: 5 },
    ],
    browserBreakdown: [
      { browser: "Chrome", count: 90 },
      { browser: "Firefox", count: 40 },
      { browser: "Safari", count: 20 },
    ],
    topPages: [
      { path: "/", count: 120 },
      { path: "/projects", count: 30 },
    ],
    projectViews: [
      { id: 1, title: "Portfolio Site", viewCount: 15 },
      { id: 2, title: "Chat App", viewCount: 25 },
    ],
  };

  const mockVisits = [
    {
      id: 1,
      visitedAt: "2026-06-09T10:00:00.000Z",
      path: "/projects",
      deviceType: "desktop",
      browser: "Chrome",
      os: "macOS",
      referrer: "https://github.com/someuser",
    },
    {
      id: 2,
      visitedAt: "2026-06-09T10:05:00.000Z",
      path: "/",
      deviceType: "mobile",
      browser: "Safari",
      os: "iOS",
      referrer: "",
    },
  ];

  const mockVisitsMeta = {
    totalPages: 3,
    total: 30,
  };

  const defaultProps = {
    statsOverview: mockOverview,
    visitsList: mockVisits,
    visitsMeta: mockVisitsMeta,
    statsPage: 1,
    statsLoading: false,
    onFetchOverview: vi.fn(),
    onFetchVisits: vi.fn(),
    onCleanup: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading text when statsLoading is true and statsOverview is null", () => {
    render(
      <StatsView {...defaultProps} statsOverview={null} statsLoading={true} />,
    );
    expect(screen.getByText("Загрузка...")).toBeInTheDocument();
  });

  it("renders overview stats cards and tables correctly", () => {
    render(<StatsView {...defaultProps} />);

    // Check overview card values
    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.getByText("Всего визитов")).toBeInTheDocument();

    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Уникальных")).toBeInTheDocument();

    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("Сегодня")).toBeInTheDocument();

    // Device breakdown
    expect(screen.getByText("🖥️ Десктоп")).toBeInTheDocument();
    expect(screen.getByText("📱 Мобильные")).toBeInTheDocument();
    expect(screen.getByText("📱 Планшеты")).toBeInTheDocument();

    // Browser breakdown
    expect(screen.getByText("Chrome")).toBeInTheDocument();
    expect(screen.getByText("Firefox")).toBeInTheDocument();
    expect(screen.getByText("Safari")).toBeInTheDocument();

    // Top Pages
    expect(screen.getByText("/")).toBeInTheDocument();
    expect(screen.getByText("/projects")).toBeInTheDocument();

    // Project Views
    expect(screen.getByText("Portfolio Site")).toBeInTheDocument();
    expect(screen.getByText("Chat App")).toBeInTheDocument();
  });

  it("renders empty breakdowns message when arrays are empty", () => {
    const emptyOverview = {
      ...mockOverview,
      deviceBreakdown: [],
      browserBreakdown: [],
      topPages: [],
      projectViews: [],
    };
    render(<StatsView {...defaultProps} statsOverview={emptyOverview} />);

    // Should display 'Нет данных' where lists are empty. Since they are multiple, we check for presence
    const noDataElements = screen.getAllByText("Нет данных");
    expect(noDataElements.length).toBeGreaterThanOrEqual(3);
  });

  it("switches to Visits tab and renders visit list", () => {
    render(<StatsView {...defaultProps} />);

    const visitsTabBtn = screen.getByRole("button", { name: "Визиты" });
    fireEvent.click(visitsTabBtn);

    // Should render visits table headers
    expect(screen.getByText("Дата")).toBeInTheDocument();
    expect(screen.getByText("Страница")).toBeInTheDocument();
    expect(screen.getByText("Реферер")).toBeInTheDocument();

    // Check visit row data
    expect(screen.getByText("/projects")).toBeInTheDocument();
    expect(screen.getByText("desktop")).toBeInTheDocument();
    expect(screen.getByText("Chrome")).toBeInTheDocument();
    expect(screen.getByText("macOS")).toBeInTheDocument();
    expect(screen.getByText("github.com")).toBeInTheDocument(); // extracted from https://github.com/someuser
  });

  it("paginates visits when next/prev buttons are clicked", () => {
    render(<StatsView {...defaultProps} statsPage={2} />);

    // Switch to visits tab
    const visitsTabBtn = screen.getByRole("button", { name: "Визиты" });
    fireEvent.click(visitsTabBtn);

    expect(screen.getByText("Стр. 2 из 3 (30)")).toBeInTheDocument();

    const backBtn = screen.getByRole("button", { name: "← Назад" });
    const forwardBtn = screen.getByRole("button", { name: "Вперед →" });

    fireEvent.click(backBtn);
    expect(defaultProps.onFetchVisits).toHaveBeenCalledWith(1);

    fireEvent.click(forwardBtn);
    expect(defaultProps.onFetchVisits).toHaveBeenCalledWith(3);
  });

  it("triggers onCleanup with the selected days value", () => {
    render(<StatsView {...defaultProps} />);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "7" } });

    const cleanupBtn = screen.getByRole("button", { name: "🗑️ Очистить" });
    fireEvent.click(cleanupBtn);

    expect(defaultProps.onCleanup).toHaveBeenCalledWith(7);
  });
});
