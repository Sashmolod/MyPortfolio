import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";
import { MailIcon } from "./SvgIllustrations";
import { soundSynth } from "../utils/audioSynth";

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    nickname: "",
    captchaAnswer: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [captcha, setCaptcha] = useState(null);
  const [captchaLoading, setCaptchaLoading] = useState(true);
  const [captchaError, setCaptchaError] = useState(false);

  const fetchCaptcha = async () => {
    setCaptchaLoading(true);
    setCaptchaError(false);
    try {
      const res = await api.get("/portfolio/captcha");
      setCaptcha(res.data);
    } catch (err) {
      console.error("Failed to fetch captcha:", err);
      setCaptchaError(true);
    } finally {
      setCaptchaLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const validate = (field, value) => {
    switch (field) {
      case "name":
        return !value.trim()
          ? "Name is required"
          : value.trim().length < 2
            ? "Name must be at least 2 characters"
            : "";
      case "email":
        return !value.trim()
          ? "Email is required"
          : !validateEmail(value)
            ? "Invalid email format"
            : "";
      case "subject":
        return !value.trim()
          ? "Subject is required"
          : value.trim().length < 3
            ? "Subject must be at least 3 characters"
            : "";
      case "message":
        return !value.trim()
          ? "Message is required"
          : value.trim().length < 10
            ? "Message must be at least 10 characters"
            : "";
      case "captchaAnswer":
        return !value.trim() ? "Please solve the math puzzle" : "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      const fieldError = validate(name, value);
      setErrors((prev) => ({ ...prev, [name]: fieldError }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name !== "nickname") {
      setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
    }
  };

  const handleFocus = () => {
    const now = Date.now();
    if (!window.lastFormFocusTime || now - window.lastFormFocusTime > 15000) {
      window.lastFormFocusTime = now;
      window.dispatchEvent(new CustomEvent("form-focus"));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const fieldsToValidate = [
      "name",
      "email",
      "subject",
      "message",
      "captchaAnswer",
    ];
    for (const field of fieldsToValidate) {
      const error = validate(field, formData[field] || "");
      if (error) newErrors[field] = error;
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    setIsFlying(true);
    soundSynth.playWhoosh();
    window.dispatchEvent(new CustomEvent("form-airplane-sent"));

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        nickname: formData.nickname,
        captchaAnswer: formData.captchaAnswer,
        captchaToken: captcha?.token,
      };
      await api.post("/portfolio/message", payload);
      setTimeout(() => {
        window.toast?.("Message sent successfully!", "success");
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          nickname: "",
          captchaAnswer: "",
        });
        setErrors({});
        setIsFlying(false);
        setIsSubmitting(false);
        fetchCaptcha();
      }, 1500);
    } catch (err) {
      const serverMsg =
        err.response?.data?.message ||
        "Failed to send message. Please try again.";
      window.toast?.(serverMsg, "error");
      setIsFlying(false);
      setIsSubmitting(false);
      fetchCaptcha();
      if (serverMsg.toLowerCase().includes("captcha")) {
        setErrors((prev) => ({
          ...prev,
          captchaAnswer: "Неверный ответ на капчу",
        }));
      }
    }
  };

  const errMsg = (field) =>
    errors[field] && (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          color: "var(--danger)",
          fontSize: "12px",
          margin: "2px 0 10px",
          fontFamily: "'Architects Daughter', cursive",
        }}
      >
        {errors[field]}
      </motion.p>
    );

  return (
    <section id="contact">
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 0.4, type: "Spring" }}
          viewport={{ once: true }}
          style={{ display: "inline-block", marginBottom: "0.5rem" }}
        >
          <MailIcon size={64} />
        </motion.div>
      </div>
      <h2>Contact</h2>
      <div
        className="contact-form-container"
        style={{
          minHeight: "300px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AnimatePresence mode="wait">
          {!isFlying ? (
            <motion.form
              key="form-fields"
              onSubmit={handleSubmit}
              className="contact-form"
              noValidate
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ duration: 0.4 }}
              style={{ width: "100%" }}
            >
              {/* Невидимое поле для ботов (Honeypot) */}
              <div
                style={{
                  position: "absolute",
                  left: "-9999px",
                  top: "-9999px",
                  opacity: 0,
                  height: 0,
                  width: 0,
                  overflow: "hidden",
                }}
                aria-hidden="true"
              >
                <label htmlFor="honeypot-nickname">
                  Leave this field blank
                </label>
                <input
                  id="honeypot-nickname"
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  tabIndex="-1"
                  autoComplete="off"
                />
              </div>

              <label htmlFor="contact-name" className="sr-only">
                Name
              </label>
              <input
                id="contact-name"
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                className={errors.name ? "input-error" : ""}
                required
              />
              {errMsg("name")}

              <label htmlFor="contact-email" className="sr-only">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                className={errors.email ? "input-error" : ""}
                required
              />
              {errMsg("email")}

              <label htmlFor="contact-subject" className="sr-only">
                Subject
              </label>
              <input
                id="contact-subject"
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                className={errors.subject ? "input-error" : ""}
                required
              />
              {errMsg("subject")}

              <label htmlFor="contact-message" className="sr-only">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                placeholder="Message"
                value={formData.message}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                className={errors.message ? "input-error" : ""}
                required
              />
              {errMsg("message")}

              {/* Математическая скетч-капча с обработкой ошибок загрузки */}
              {captchaLoading ? (
                <div
                  style={{
                    marginBottom: "15px",
                    opacity: 0.6,
                    fontFamily: "'Architects Daughter', cursive",
                    fontSize: "0.95rem",
                    color: "var(--text)",
                  }}
                >
                  Загрузка проверочного кода...
                </div>
              ) : captchaError ? (
                <div
                  style={{
                    color: "var(--danger)",
                    marginBottom: "15px",
                    fontFamily: "'Architects Daughter', cursive",
                    fontSize: "0.95rem",
                  }}
                >
                  Не удалось загрузить проверочный код.{" "}
                  <button
                    type="button"
                    onClick={fetchCaptcha}
                    style={{
                      textDecoration: "underline",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text)",
                      fontFamily: "'Architects Daughter', cursive",
                      fontSize: "0.95rem",
                      padding: 0,
                    }}
                  >
                    Обновить пример
                  </button>
                </div>
              ) : captcha ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "15px",
                    fontFamily: "'Architects Daughter', cursive",
                    fontSize: "0.95rem",
                    color: "var(--text)",
                    userSelect: "none",
                  }}
                >
                  <span>Решите пример:</span>
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                      letterSpacing: "1px",
                    }}
                  >
                    {captcha.question.replace(" = ?", "")} =
                  </span>
                  <label htmlFor="contact-captcha" className="sr-only">
                    Ответ на проверочный вопрос
                  </label>
                  <input
                    id="contact-captcha"
                    type="text"
                    name="captchaAnswer"
                    placeholder="Ответ"
                    value={formData.captchaAnswer || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.captchaAnswer ? "input-error" : ""}
                    style={{
                      width: "60px",
                      padding: "6px",
                      textAlign: "center",
                      margin: 0,
                      borderRadius: "6px",
                      fontFamily: "'Architects Daughter', cursive",
                      fontSize: "1rem",
                      border: "var(--border-style)",
                      background: "var(--input-bg)",
                      color: "var(--text)",
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={fetchCaptcha}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1.25rem",
                      padding: "4px",
                      color: "var(--text)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "transform 0.2s ease",
                      outline: "none",
                    }}
                    title="Обновить пример"
                    aria-label="Обновить проверочный код"
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "rotate(45deg)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "rotate(0deg)")
                    }
                  >
                    ↻
                  </button>
                </div>
              ) : null}
              {errMsg("captchaAnswer")}

              <button
                type="submit"
                className="btn"
                disabled={isSubmitting}
                style={{ opacity: isSubmitting ? 0.7 : 1 }}
              >
                {isSubmitting ? "Sending..." : "Send"}
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="airplane"
              initial={{ opacity: 0, scale: 0.2, x: 0, y: 100, rotate: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0.2, 1.2, 1.2, 0.4],
                x: [0, 0, 80, 500],
                y: [100, 0, -60, -400],
                rotate: [0, -10, -15, -35],
              }}
              transition={{
                duration: 1.5,
                times: [0, 0.3, 0.6, 1],
                ease: "easeInOut",
              }}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "250px",
                width: "100%",
              }}
            >
              <svg
                viewBox="0 0 100 80"
                width="120"
                height="96"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M 10 40 L 90 10 L 50 70 L 45 50 L 10 40 Z"
                  fill="var(--card-bg)"
                  stroke="var(--text)"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  style={{ filter: "url(#wobblyFilter)" }}
                />
                <path
                  d="M 90 10 L 45 50"
                  fill="none"
                  stroke="var(--text)"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <path
                  d="M 50 70 L 45 50 L 43 62 Z"
                  fill="rgba(0,0,0,0.15)"
                  stroke="var(--text)"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <defs>
                  <filter
                    id="wobblyFilter"
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
                      scale="2"
                      xChannelSelector="R"
                      yChannelSelector="G"
                    />
                  </filter>
                </defs>
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
