import { useState } from "react";

export default function StatsView({
  statsOverview,
  visitsList,
  visitsMeta,
  statsPage,
  statsLoading,
  onFetchOverview,
  onFetchVisits,
  onCleanup,
}) {
  const [activeStatsTab, setActiveStatsTab] = useState("overview");

  const [cleanupDays, setCleanupDays] = useState(30);

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  const OverviewCard = ({ title, value, icon, color }) => (
    <div
      className="card"
      style={{ textAlign: "center", borderLeft: `4px solid ${color}` }}
    >
      <div style={{ fontSize: "2rem", marginBottom: "8px" }}>{icon}</div>
      <h3
        style={{
          margin: "0 0 8px 0",
          fontSize: "2rem",
          fontWeight: "bold",
          color,
        }}
      >
        {value}
      </h3>
      <p style={{ margin: 0, opacity: 0.7 }}>{title}</p>
    </div>
  );

  if (statsLoading && !statsOverview)
    return (
      <div className="card">
        <p>Загрузка...</p>
      </div>
    );

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <button
          className={`btn ${activeStatsTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveStatsTab("overview")}
        >
          Обзор
        </button>
        <button
          className={`btn ${activeStatsTab === "visits" ? "active" : ""}`}
          onClick={() => setActiveStatsTab("visits")}
        >
          Визиты
        </button>
      </div>

      {activeStatsTab === "overview" && (
        <div>
          <div className="grid" style={{ marginBottom: "30px" }}>
            <OverviewCard
              title="Всего визитов"
              value={statsOverview?.totalVisits || 0}
              icon="👥"
              color="#4CAF50"
            />
            <OverviewCard
              title="Уникальных"
              value={statsOverview?.uniqueVisitors || 0}
              icon="🎯"
              color="#2196F3"
            />
            <OverviewCard
              title="Сегодня"
              value={statsOverview?.todayVisits || 0}
              icon="📅"
              color="#FF9800"
            />
            <OverviewCard
              title="Неделя"
              value={statsOverview?.thisWeekVisits || 0}
              icon="📆"
              color="#9C27B0"
            />
            <OverviewCard
              title="Месяц"
              value={statsOverview?.thisMonthVisits || 0}
              icon="🗓️"
              color="#F44336"
            />
          </div>

          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            <div className="card">
              <h3 style={{ marginBottom: "12px" }}>📱 Устройства</h3>
              {statsOverview?.deviceBreakdown?.length > 0 ? (
                statsOverview.deviceBreakdown.map((i, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span>
                      {i.deviceType === "mobile"
                        ? "📱 Мобильные"
                        : i.deviceType === "tablet"
                          ? "📱 Планшеты"
                          : "🖥️ Десктоп"}
                    </span>
                    <span style={{ fontWeight: "bold" }}>{i.count}</span>
                  </div>
                ))
              ) : (
                <p style={{ opacity: 0.6 }}>Нет данных</p>
              )}
            </div>
            <div className="card">
              <h3 style={{ marginBottom: "12px" }}>🌐 Браузеры</h3>
              {statsOverview?.browserBreakdown?.length > 0 ? (
                statsOverview.browserBreakdown.map((i, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span>{i.browser}</span>
                    <span style={{ fontWeight: "bold" }}>{i.count}</span>
                  </div>
                ))
              ) : (
                <p style={{ opacity: 0.6 }}>Нет данных</p>
              )}
            </div>
          </div>

          <div className="card" style={{ marginTop: "20px" }}>
            <h3 style={{ marginBottom: "12px" }}>📄 Популярные страницы</h3>
            {statsOverview?.topPages?.length > 0 ? (
              statsOverview.topPages.map((i, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{ fontFamily: "monospace", fontSize: "0.85rem" }}
                  >
                    {i.path}
                  </span>
                  <span style={{ fontWeight: "bold" }}>{i.count}</span>
                </div>
              ))
            ) : (
              <p style={{ opacity: 0.6 }}>Нет данных</p>
            )}
          </div>

          {statsOverview?.projectViews?.length > 0 && (
            <div className="card" style={{ marginTop: "20px" }}>
              <h3 style={{ marginBottom: "12px" }}>🎨 Просмотры проектов</h3>
              {statsOverview.projectViews.map((i) => (
                <div
                  key={i.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                  }}
                >
                  <span>{i.title}</span>
                  <span style={{ fontWeight: "bold" }}>{i.viewCount}</span>
                </div>
              ))}
            </div>
          )}

          <div
            style={{
              marginTop: "20px",
              display: "flex",
              gap: "8px",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "0.9rem", opacity: 0.8 }}>
              Удалить визиты старше:
            </span>
            <select
              value={cleanupDays}
              onChange={(e) => setCleanupDays(Number(e.target.value))}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--sketch-radius-2)",
                border: "var(--border-style)",
                background: "var(--card-bg)",
                color: "var(--text)",
                fontFamily: "'Architects Daughter', cursive",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              <option value={0}>Все (0 дней)</option>
              <option value={7}>7 дней</option>
              <option value={30}>30 дней</option>
              <option value={90}>90 дней</option>
              <option value={365}>365 дней (1 год)</option>
            </select>
            <button
              className="btn btn-danger"
              onClick={() => onCleanup(cleanupDays)}
              style={{ margin: 0 }}
            >
              🗑️ Очистить
            </button>
          </div>
        </div>
      )}

      {activeStatsTab === "visits" && (
        <div className="card">
          <h3 style={{ marginBottom: "16px" }}>📋 Последние визиты</h3>
          {visitsList?.length > 0 ? (
            <div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border)" }}>
                      <th style={{ padding: "8px", textAlign: "left" }}>
                        Дата
                      </th>
                      <th style={{ padding: "8px", textAlign: "left" }}>
                        Страница
                      </th>
                      <th style={{ padding: "8px", textAlign: "left" }}>
                        Устр.
                      </th>
                      <th style={{ padding: "8px", textAlign: "left" }}>
                        Браузер
                      </th>
                      <th style={{ padding: "8px", textAlign: "left" }}>OS</th>
                      <th style={{ padding: "8px", textAlign: "left" }}>
                        Реферер
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitsList.map((v) => (
                      <tr
                        key={v.id}
                        style={{ borderBottom: "1px solid var(--border)" }}
                      >
                        <td style={{ padding: "8px" }}>
                          {formatDate(v.visitedAt)}
                        </td>
                        <td
                          style={{
                            padding: "8px",
                            fontFamily: "monospace",
                            fontSize: "0.8rem",
                          }}
                        >
                          {v.path || "-"}
                        </td>
                        <td style={{ padding: "8px" }}>
                          {v.deviceType || "-"}
                        </td>
                        <td style={{ padding: "8px" }}>{v.browser || "-"}</td>
                        <td style={{ padding: "8px" }}>{v.os || "-"}</td>
                        <td style={{ padding: "8px", fontSize: "0.8rem" }}>
                          {v.referrer
                            ? (() => {
                                try {
                                  return new URL(v.referrer).hostname;
                                } catch {
                                  return "-";
                                }
                              })()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {visitsMeta?.totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "8px",
                    marginTop: "16px",
                  }}
                >
                  <button
                    className="btn"
                    disabled={statsPage <= 1}
                    onClick={() => onFetchVisits(statsPage - 1)}
                  >
                    ← Назад
                  </button>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "0 16px",
                    }}
                  >
                    Стр. {statsPage} из {visitsMeta.totalPages} (
                    {visitsMeta.total})
                  </span>
                  <button
                    className="btn"
                    disabled={statsPage >= visitsMeta.totalPages}
                    onClick={() => onFetchVisits(statsPage + 1)}
                  >
                    Вперед →
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p style={{ opacity: 0.6 }}>Нет данных</p>
          )}
        </div>
      )}
    </div>
  );
}
