import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import ContactForm from "./ContactForm";

// Mock the API client
vi.mock("../api", () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
    },
  };
});

// Mock soundSynth
vi.mock("../utils/audioSynth", () => {
  return {
    soundSynth: {
      playWhoosh: vi.fn(),
    },
  };
});

// Mock framer-motion to render plain HTML elements in tests
vi.mock("framer-motion", () => {
  const React = require("react");

  const DummyDiv = React.forwardRef(
    (
      {
        children,
        animate,
        initial,
        exit,
        transition,
        whileInView,
        viewport,
        ...props
      },
      ref,
    ) => {
      return React.createElement("div", { ref, ...props }, children);
    },
  );

  const DummyForm = React.forwardRef(
    (
      {
        children,
        animate,
        initial,
        exit,
        transition,
        whileInView,
        viewport,
        ...props
      },
      ref,
    ) => {
      return React.createElement("form", { ref, ...props }, children);
    },
  );

  const DummyP = React.forwardRef(
    (
      {
        children,
        animate,
        initial,
        exit,
        transition,
        whileInView,
        viewport,
        ...props
      },
      ref,
    ) => {
      return React.createElement("p", { ref, ...props }, children);
    },
  );

  return {
    motion: {
      div: DummyDiv,
      form: DummyForm,
      p: DummyP,
    },
    AnimatePresence: ({ children }) => children,
  };
});

import api from "../api";

describe("ContactForm Component", () => {
  const mockCaptcha = {
    question: "5 + 3 = ?",
    token: "test-token-123",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    window.toast = vi.fn();
    window.lastFormFocusTime = null;

    // Default GET response for captcha
    api.get.mockResolvedValue({ data: mockCaptcha });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders fields and fetches captcha on load", async () => {
    render(<ContactForm />);

    expect(screen.getByText("Contact")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Subject")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Message")).toBeInTheDocument();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/portfolio/captcha");
      expect(screen.getByText("5 + 3 =")).toBeInTheDocument();
    });
  });

  it("displays validation errors on empty submission", async () => {
    render(<ContactForm />);

    // Wait for captcha to load
    await waitFor(() => {
      expect(screen.getByText("5 + 3 =")).toBeInTheDocument();
    });

    const submitBtn = screen.getByRole("button", { name: /Send/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
      expect(screen.getByText("Email is required")).toBeInTheDocument();
      expect(screen.getByText("Subject is required")).toBeInTheDocument();
      expect(screen.getByText("Message is required")).toBeInTheDocument();
      expect(
        screen.getByText("Please solve the math puzzle"),
      ).toBeInTheDocument();
    });

    expect(api.post).not.toHaveBeenCalled();
  });

  it("validates invalid email format and length requirements", async () => {
    render(<ContactForm />);

    await waitFor(() => {
      expect(screen.getByText("5 + 3 =")).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText("Name");
    const emailInput = screen.getByPlaceholderText("Email");
    const subjectInput = screen.getByPlaceholderText("Subject");
    const messageInput = screen.getByPlaceholderText("Message");
    const captchaInput = screen.getByPlaceholderText("Ответ");

    fireEvent.change(nameInput, { target: { value: "A" } }); // < 2 chars
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.change(subjectInput, { target: { value: "Hi" } }); // < 3 chars
    fireEvent.change(messageInput, { target: { value: "Short" } }); // < 10 chars
    fireEvent.change(captchaInput, { target: { value: "8" } });

    fireEvent.blur(nameInput);
    fireEvent.blur(emailInput);
    fireEvent.blur(subjectInput);
    fireEvent.blur(messageInput);

    await waitFor(() => {
      expect(
        screen.getByText("Name must be at least 2 characters"),
      ).toBeInTheDocument();
      expect(screen.getByText("Invalid email format")).toBeInTheDocument();
      expect(
        screen.getByText("Subject must be at least 3 characters"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Message must be at least 10 characters"),
      ).toBeInTheDocument();
    });
  });

  it("triggers form-focus event on focusing inputs", async () => {
    const focusSpy = vi.fn();
    window.addEventListener("form-focus", focusSpy);

    render(<ContactForm />);

    await waitFor(() => {
      expect(screen.getByText("5 + 3 =")).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText("Name");
    fireEvent.focus(nameInput);

    expect(focusSpy).toHaveBeenCalled();
    window.removeEventListener("form-focus", focusSpy);
  });

  it("submits successfully with valid data and calls post API", async () => {
    api.post.mockResolvedValue({});

    render(<ContactForm />);

    await waitFor(() => {
      expect(screen.getByText("5 + 3 =")).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText("Name");
    const emailInput = screen.getByPlaceholderText("Email");
    const subjectInput = screen.getByPlaceholderText("Subject");
    const messageInput = screen.getByPlaceholderText("Message");
    const captchaInput = screen.getByPlaceholderText("Ответ");

    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(subjectInput, { target: { value: "Test Subject" } });
    fireEvent.change(messageInput, {
      target: { value: "This is a long message for testing." },
    });
    fireEvent.change(captchaInput, { target: { value: "8" } });

    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });

    const form = nameInput.closest("form");
    await act(async () => {
      fireEvent.submit(form);
      await vi.runAllTicks();
    });

    expect(api.post).toHaveBeenCalledWith("/portfolio/message", {
      name: "John Doe",
      email: "john@example.com",
      subject: "Test Subject",
      message: "This is a long message for testing.",
      nickname: "",
      captchaAnswer: "8",
      captchaToken: "test-token-123",
    });

    // Fast-forward timers for the success timeout in ContactForm (1500ms)
    await act(async () => {
      vi.advanceTimersByTime(1600);
      await vi.runAllTicks();
    });

    expect(window.toast).toHaveBeenCalledWith(
      "Message sent successfully!",
      "success",
    );
    expect(screen.getByPlaceholderText("Name").value).toBe("");
  });

  it("handles submission errors and displays server captcha errors", async () => {
    api.post.mockRejectedValue({
      response: {
        data: {
          message: "Incorrect captcha answer",
        },
      },
    });

    render(<ContactForm />);

    await waitFor(() => {
      expect(screen.getByText("5 + 3 =")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Subject"), {
      target: { value: "Test Subject" },
    });
    fireEvent.change(screen.getByPlaceholderText("Message"), {
      target: { value: "This is a long message for testing." },
    });
    fireEvent.change(screen.getByPlaceholderText("Ответ"), {
      target: { value: "9" },
    });

    const form = screen.getByPlaceholderText("Name").closest("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(window.toast).toHaveBeenCalledWith(
        "Incorrect captcha answer",
        "error",
      );
      expect(screen.getByText("Неверный ответ на капчу")).toBeInTheDocument();
    });
  });
});
