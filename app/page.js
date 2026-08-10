"use client";

import { useState, useEffect } from "react";
import { WEEKDAY_HABITS, WEEKEND_HABITS, MONTHS, habitApplies } from "./habitsData";

export default function Home() {
  const [theme, setTheme] = useState("dark");
  const [activeTab, setActiveTab] = useState("current"); // "current", "history", "backup"
  const [tableMode, setTableMode] = useState("weekday"); // "weekday" or "weekend"
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(0); // 0 is Aug 2026
  const [data, setData] = useState({}); // { "2026-08-10_wake_7am": true }
  const [identityText, setIdentityText] = useState(
    "I am disciplined, clear, and intentional. I do what I say. Every time."
  );
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [todayStr, setTodayStr] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setTodayStr(`${yyyy}-${mm}-${dd}`);

    const savedData = localStorage.getItem("habit_tracker_data");
    if (savedData) {
      try { setData(JSON.parse(savedData)); } catch (e) {}
    }

    const savedTheme = localStorage.getItem("habit_tracker_theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }

    const savedIdentity = localStorage.getItem("habit_tracker_identity");
    if (savedIdentity) setIdentityText(savedIdentity);

    // Set month index matching current month if within range
    const currentMonth = MONTHS.findIndex(
      (m) => m.year === yyyy && m.month === today.getMonth() + 1
    );
    if (currentMonth !== -1) setSelectedMonthIdx(currentMonth);
  }, []);

  // Save data to localStorage
  const toggleHabit = (dateStr, habitId) => {
    const key = `${dateStr}_${habitId}`;
    const newData = { ...data, [key]: !data[key] };
    setData(newData);
    localStorage.setItem("habit_tracker_data", JSON.stringify(newData));
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("habit_tracker_theme", newTheme);
  };

  const handleSaveIdentity = () => {
    setIsEditingIdentity(false);
    localStorage.setItem("habit_tracker_identity", identityText);
  };

  // Export JSON backup
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ identity: identityText, habits: data }, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `habit_tracker_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
  };

  // Import JSON backup
  const importJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (json.habits) {
          setData(json.habits);
          localStorage.setItem("habit_tracker_data", JSON.stringify(json.habits));
        }
        if (json.identity) {
          setIdentityText(json.identity);
          localStorage.setItem("habit_tracker_identity", json.identity);
        }
        alert("Backup restored successfully!");
      } catch (err) {
        alert("Invalid JSON backup file.");
      }
    };
    reader.readAsText(file);
  };

  // Generate days for selected month
  const currentMonthInfo = MONTHS[selectedMonthIdx] || MONTHS[0];
  const daysInMonth = new Date(currentMonthInfo.year, currentMonthInfo.month, 0).getDate();
  
  const allDays = [];
  const weekdayDays = [];
  const weekendDays = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(currentMonthInfo.year, currentMonthInfo.month - 1, d);
    const dayOfWeek = dateObj.getDay();
    const mmStr = String(currentMonthInfo.month).padStart(2, "0");
    const ddStr = String(d).padStart(2, "0");
    const dateStr = `${currentMonthInfo.year}-${mmStr}-${ddStr}`;

    const dayMeta = {
      day: d,
      dateStr,
      dateObj,
      dayOfWeek,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      dayLabel: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][dayOfWeek]
    };

    allDays.push(dayMeta);
    if (dayMeta.isWeekend) weekendDays.push(dayMeta);
    else weekdayDays.push(dayMeta);
  }

  const activeDays = tableMode === "weekday" ? weekdayDays : weekendDays;
  const activeHabits = tableMode === "weekday" ? WEEKDAY_HABITS : WEEKEND_HABITS;

  // Compute Stats
  const computeDayScore = (dayMeta) => {
    const habitsList = dayMeta.isWeekend ? WEEKEND_HABITS : WEEKDAY_HABITS;
    let done = 0;
    let applicable = 0;

    habitsList.forEach((h) => {
      if (habitApplies(h.applies, dayMeta.dateObj)) {
        applicable++;
        if (data[`${dayMeta.dateStr}_${h.id}`]) done++;
      }
    });

    return { done, applicable, pct: applicable ? Math.round((done / applicable) * 100) : 0 };
  };

  const computeMonthStats = (monthObj) => {
    const days = new Date(monthObj.year, monthObj.month, 0).getDate();
    let totalDone = 0;
    let totalApplicable = 0;

    for (let d = 1; d <= days; d++) {
      const dateObj = new Date(monthObj.year, monthObj.month - 1, d);
      const mmStr = String(monthObj.month).padStart(2, "0");
      const ddStr = String(d).padStart(2, "0");
      const dateStr = `${monthObj.year}-${mmStr}-${ddStr}`;
      const isWe = dateObj.getDay() === 0 || dateObj.getDay() === 6;
      const habitsList = isWe ? WEEKEND_HABITS : WEEKDAY_HABITS;

      habitsList.forEach((h) => {
        if (habitApplies(h.applies, dateObj)) {
          totalApplicable++;
          if (data[`${dateStr}_${h.id}`]) totalDone++;
        }
      });
    }

    return {
      done: totalDone,
      applicable: totalApplicable,
      pct: totalApplicable ? Math.round((totalDone / totalApplicable) * 100) : 0
    };
  };

  const todayScore = todayStr ? computeDayScore({
    dateStr: todayStr,
    dateObj: new Date(),
    isWeekend: new Date().getDay() === 0 || new Date().getDay() === 6
  }) : { done: 0, applicable: 0, pct: 0 };

  const currentMonthStats = computeMonthStats(currentMonthInfo);

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px" }}>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
            boxShadow: "0 0 16px rgba(139, 92, 246, 0.4)"
          }}>
            🎯
          </div>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "700", letterSpacing: "-0.5px" }}>Life Design Habit Tracker</h1>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Science-backed WFH Routine & Performance System</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={toggleTheme}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border: "1px solid var(--border-color)",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "500"
            }}
          >
            {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </header>

      {/* Identity Banner */}
      <div className="glass-card" style={{ padding: "16px 20px", marginBottom: "24px", borderLeft: "4px solid #8b5cf6" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: "#8b5cf6" }}>
            🪞 CORE IDENTITY STATEMENT
          </span>
          <button
            onClick={() => isEditingIdentity ? handleSaveIdentity() : setIsEditingIdentity(true)}
            style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "12px", textDecoration: "underline" }}
          >
            {isEditingIdentity ? "Save" : "Edit"}
          </button>
        </div>

        {isEditingIdentity ? (
          <textarea
            value={identityText}
            onChange={(e) => setIdentityText(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              background: "rgba(0,0,0,0.2)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-color)",
              fontSize: "15px",
              fontStyle: "italic"
            }}
            rows={2}
          />
        ) : (
          <p style={{ fontSize: "16px", fontStyle: "italic", fontWeight: "500" }}>
            "{identityText}"
          </p>
        )}
      </div>

      {/* Quick Stats Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div className="glass-card" style={{ padding: "16px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Today's Progress</span>
          <div style={{ fontSize: "28px", fontWeight: "800", color: "#10b981", marginTop: "4px" }}>
            {todayScore.pct}% <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: "400" }}>({todayScore.done}/{todayScore.applicable})</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "16px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{currentMonthInfo.name} Rate</span>
          <div style={{ fontSize: "28px", fontWeight: "800", color: "#8b5cf6", marginTop: "4px" }}>
            {currentMonthStats.pct}% <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: "400" }}>({currentMonthStats.done} habits)</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "16px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Schedule Anchor</span>
          <div style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", marginTop: "6px" }}>
            07:00 AM → 11:00 AM Desk
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "20px" }}>
        <button
          onClick={() => setActiveTab("current")}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            background: activeTab === "current" ? "#8b5cf6" : "transparent",
            color: activeTab === "current" ? "#fff" : "var(--text-secondary)",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px"
          }}
        >
          📅 Current Month Grid
        </button>

        <button
          onClick={() => setActiveTab("history")}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            background: activeTab === "history" ? "#8b5cf6" : "transparent",
            color: activeTab === "history" ? "#fff" : "var(--text-secondary)",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px"
          }}
        >
          📊 History & 12-Month Trends
        </button>

        <button
          onClick={() => setActiveTab("backup")}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            background: activeTab === "backup" ? "#8b5cf6" : "transparent",
            color: activeTab === "backup" ? "#fff" : "var(--text-secondary)",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px"
          }}
        >
          💾 Backup & Notion Export
        </button>
      </div>

      {/* TAB 1: CURRENT MONTH */}
      {activeTab === "current" && (
        <div>
          {/* Controls Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            {/* Month Navigator */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                disabled={selectedMonthIdx === 0}
                onClick={() => setSelectedMonthIdx((prev) => Math.max(0, prev - 1))}
                style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)", cursor: "pointer" }}
              >
                ◀ Prev
              </button>
              <h2 style={{ fontSize: "18px", fontWeight: "700", minWidth: "160px", textAlign: "center" }}>
                {currentMonthInfo.name}
              </h2>
              <button
                disabled={selectedMonthIdx === MONTHS.length - 1}
                onClick={() => setSelectedMonthIdx((prev) => Math.min(MONTHS.length - 1, prev + 1))}
                style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)", cursor: "pointer" }}
              >
                Next ▶
              </button>
            </div>

            {/* Table Mode Switch (Weekday vs Weekend) */}
            <div style={{ display: "flex", background: "rgba(0,0,0,0.3)", padding: "4px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
              <button
                onClick={() => setTableMode("weekday")}
                style={{
                  padding: "6px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: tableMode === "weekday" ? "#8b5cf6" : "transparent",
                  color: tableMode === "weekday" ? "#fff" : "var(--text-secondary)",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "13px"
                }}
              >
                💼 Weekdays ({weekdayDays.length} days)
              </button>
              <button
                onClick={() => setTableMode("weekend")}
                style={{
                  padding: "6px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: tableMode === "weekend" ? "#8b5cf6" : "transparent",
                  color: tableMode === "weekend" ? "#fff" : "var(--text-secondary)",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "13px"
                }}
              >
                🌅 Weekends ({weekendDays.length} days)
              </button>
            </div>
          </div>

          {/* Grid Table */}
          <div className="glass-card" style={{ overflowX: "auto", position: "relative" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)", textAlign: "center" }}>
                  <th className="sticky-col" style={{ padding: "14px 16px", textAlign: "left", minWidth: "260px" }}>HABIT</th>
                  <th style={{ padding: "14px 8px", width: "70px", color: "var(--text-secondary)" }}>TIME</th>
                  {activeDays.map((d) => {
                    const isToday = d.dateStr === todayStr;
                    return (
                      <th
                        key={d.dateStr}
                        className={isToday ? "today-col" : ""}
                        style={{ padding: "12px 8px", minWidth: "48px" }}
                      >
                        <div style={{ fontSize: "11px", color: isToday ? "#8b5cf6" : "var(--text-secondary)" }}>{d.dayLabel}</div>
                        <div style={{ fontSize: "15px", fontWeight: "700" }}>{d.day}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {activeHabits.map((habit) => (
                  <tr key={habit.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td className="sticky-col" style={{ padding: "12px 16px", fontWeight: "500" }}>
                      {habit.name}
                    </td>
                    <td style={{ padding: "12px 8px", textAlignment: "center", color: "var(--text-secondary)", fontSize: "11px", textAlign: "center" }}>
                      {habit.time}
                    </td>
                    {activeDays.map((d) => {
                      const isToday = d.dateStr === todayStr;
                      const applies = habitApplies(habit.applies, d.dateObj);
                      const isChecked = data[`${d.dateStr}_${habit.id}`];

                      return (
                        <td
                          key={d.dateStr}
                          className={isToday ? "today-col" : ""}
                          style={{ padding: "10px 4px", textAlign: "center" }}
                        >
                          {applies ? (
                            <button
                              onClick={() => toggleHabit(d.dateStr, habit.id)}
                              className={`checkbox-btn ${isChecked ? "checked" : ""}`}
                            >
                              {isChecked && <span style={{ color: "#fff", fontSize: "13px", fontWeight: "bold" }}>✓</span>}
                            </button>
                          ) : (
                            <span style={{ color: "var(--text-secondary)", opacity: 0.3 }}>—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "2px solid var(--border-color)", fontWeight: "700" }}>
                  <td className="sticky-col" style={{ padding: "12px 16px" }}>DAILY SCORE</td>
                  <td></td>
                  {activeDays.map((d) => {
                    const score = computeDayScore(d);
                    const isToday = d.dateStr === todayStr;
                    return (
                      <td key={d.dateStr} className={isToday ? "today-col" : ""} style={{ padding: "12px 4px", textAlign: "center", fontSize: "11px" }}>
                        <div style={{ color: score.pct >= 80 ? "#10b981" : score.pct >= 50 ? "#f59e0b" : "var(--text-secondary)" }}>
                          {score.done}/{score.applicable}
                        </div>
                        <div>{score.pct}%</div>
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: HISTORY & TRENDS */}
      {activeTab === "history" && (
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>12-Month Progress Cards</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
            {MONTHS.map((mObj, idx) => {
              const stats = computeMonthStats(mObj);
              const circumference = 2 * Math.PI * 38;
              const strokeOffset = circumference - (stats.pct / 100) * circumference;

              return (
                <div
                  key={mObj.name}
                  className="glass-card glass-card-hover"
                  style={{ padding: "20px", cursor: "pointer" }}
                  onClick={() => {
                    setSelectedMonthIdx(idx);
                    setActiveTab("current");
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "700" }}>{mObj.name}</h3>
                    <span style={{ fontSize: "12px", color: "#8b5cf6" }}>View Grid →</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    {/* SVG Progress Ring */}
                    <svg width="90" height="90">
                      <circle cx="45" cy="45" r="38" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="transparent" />
                      <circle
                        cx="45"
                        cy="45"
                        r="38"
                        stroke={stats.pct >= 80 ? "#10b981" : stats.pct >= 50 ? "#8b5cf6" : "#f59e0b"}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeOffset}
                        strokeLinecap="round"
                        className="progress-ring-circle"
                      />
                      <text x="45" y="50" textAnchor="middle" fill="var(--text-primary)" fontSize="18" fontWeight="800">
                        {stats.pct}%
                      </text>
                    </svg>

                    <div>
                      <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Completed</div>
                      <div style={{ fontSize: "20px", fontWeight: "700" }}>{stats.done} habits</div>
                      <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>out of {stats.applicable} possible</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: BACKUP & NOTION EXPORT */}
      {activeTab === "backup" && (
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div className="glass-card" style={{ padding: "24px", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>💾 Export / Backup Data</h2>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
              Download a full backup of all your checkmarks and custom identity statement.
            </p>
            <button
              onClick={exportJSON}
              style={{
                padding: "10px 20px",
                borderRadius: "10px",
                border: "none",
                background: "#8b5cf6",
                color: "#fff",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Download JSON Backup File
            </button>
          </div>

          <div className="glass-card" style={{ padding: "24px", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>📥 Restore Data from Backup</h2>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
              Upload a previously exported JSON backup file.
            </p>
            <input type="file" accept=".json" onChange={importJSON} style={{ fontSize: "13px" }} />
          </div>

          <div className="glass-card" style={{ padding: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>🚀 Deploy to Vercel Guide</h2>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "12px" }}>
              To host this app for free on your own URL:
            </p>
            <ol style={{ fontSize: "13px", color: "var(--text-secondary)", paddingLeft: "20px", lineHeight: "1.8" }}>
              <li>Push this project directory to your GitHub repository.</li>
              <li>Go to <a href="https://vercel.com" target="_blank" rel="noreferrer" style={{ color: "#8b5cf6" }}>Vercel.com</a> and sign in.</li>
              <li>Click <strong>"Add New" → "Project"</strong> → Import your GitHub repository.</li>
              <li>Click <strong>Deploy</strong> — your app will be live in 60 seconds!</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
