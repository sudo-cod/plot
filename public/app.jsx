// app.jsx — main App, state, sample data, tweaks
const { useState: useStateA, useEffect: useEffectA, useMemo: useMemoA, useCallback: useCallbackA } = React;

// ─────────────────────────────────────────────────────────────────────────────
// Sample data — anchored to a "now" we control so completions are realistic
// ─────────────────────────────────────────────────────────────────────────────

// Anchor "now" - May 11 2026 (Monday). Mid-day Monday so we have full-week ahead.
const NOW = new Date(2026, 4, 11, 14, 30);

// Helper: build a date relative to NOW
function rel(daysAgo, hour = 8, min = 0) {
  const d = new Date(NOW);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

const SAMPLE_TASKS = [
  // -- Recurring weekly: gym 4x/week
  {
    id: "t-gym",
    title: "Go to the gym",
    kind: "weekly",
    target: 4,
    period: "week",
    paletteKey: "rose",
    notes: "Any 4 days, doesn't matter which.",
    completions: [
      // last week: 4 sessions
      rel(8, 7, 30), rel(10, 18, 0), rel(12, 7, 30), rel(14, 18, 0),
      // 2 weeks ago: 3 sessions
      rel(16, 8), rel(19, 18), rel(20, 7),
      // this week (Mon-Sun): nothing yet — Sunday is "tomorrow" for current week start
    ],
    position: { x: 0.18, y: 0, depth: 0, yj: -0.2 },
  },

  // -- Long progress: online course
  {
    id: "t-course",
    title: "Machine Learning Specialization",
    kind: "progress",
    progress: { current: 6, total: 14, unit: "modules" },
    paletteKey: "sage",
    notes: "Andrew Ng, Coursera. Two modules a week is the goal.",
    completions: [
      rel(2, 21), rel(5, 21), rel(9, 22), rel(13, 21), rel(17, 21), rel(20, 22),
    ],
    position: { x: 0.32, y: 0, depth: 0, yj: 0 },
  },

  // -- Daily habit: read 30 min
  {
    id: "t-read",
    title: "Read 30 minutes",
    kind: "daily",
    target: 1,
    period: "day",
    paletteKey: "lavender",
    completions: [
      rel(0, 22), // today already done
      rel(1, 21), rel(2, 22), rel(3, 22), rel(5, 21),
      rel(7, 22), rel(8, 22), rel(9, 21), rel(10, 22),
    ],
    position: { x: 0.45, y: 0, depth: 0, yj: 0.1 },
  },

  // -- Daily habit: meditate (twice a day)
  {
    id: "t-medit",
    title: "Meditate",
    kind: "daily",
    target: 2,
    period: "day",
    paletteKey: "sky",
    notes: "Morning and evening, 10 min each.",
    completions: [
      rel(0, 7),  // morning today
      rel(1, 7), rel(1, 21),
      rel(2, 7), rel(2, 21),
      rel(3, 7),
      rel(5, 7), rel(5, 21),
      rel(7, 7), rel(7, 21),
    ],
    position: { x: 0.58, y: 0, depth: 0, yj: -0.3 },
  },

  // -- Monthly: call parents
  {
    id: "t-call",
    title: "Call mom & dad",
    kind: "monthly",
    target: 2,
    period: "month",
    paletteKey: "terra",
    completions: [
      rel(4, 19), // earlier this month
    ],
    position: { x: 0.72, y: 0, depth: 0, yj: 0.2 },
  },

  // -- One-off (incomplete): write blog post
  {
    id: "t-blog",
    title: "Draft blog post",
    kind: "oneoff",
    paletteKey: "butter",
    notes: "On the garden metaphor. Rough draft, then polish.",
    completions: [],
    done: false,
    position: { x: 0.85, y: 0, depth: 0, yj: 0 },
  },

  // -- One-off (done): tax return
  {
    id: "t-tax",
    title: "Submit tax return",
    kind: "oneoff",
    paletteKey: "butter",
    completions: [rel(11, 20)],
    done: true,
    position: { x: 0.94, y: 0, depth: 1, yj: 0.3 },
  },

  // -- Background: weekly chore
  {
    id: "t-water",
    title: "Water houseplants",
    kind: "weekly",
    target: 2,
    period: "week",
    paletteKey: "sage",
    completions: [
      rel(0, 9), // today
      rel(8, 9), rel(11, 9),
      rel(15, 9), rel(18, 9),
    ],
    position: { x: 0.07, y: 0, depth: 1, yj: 0 },
  },

  // -- Weekly: long run
  {
    id: "t-run",
    title: "Long run",
    kind: "weekly",
    target: 1,
    period: "week",
    paletteKey: "terra",
    notes: "10k or more.",
    completions: [
      rel(9, 7),  // last week ✓
      rel(15, 7), // 2 weeks ago ✓
    ],
    position: { x: 0.25, y: 0, depth: 1, yj: 0.1 },
  },

  // -- A second progress thing
  {
    id: "t-book",
    title: "Finish 'Anna Karenina'",
    kind: "progress",
    progress: { current: 412, total: 864, unit: "pages" },
    paletteKey: "pink",
    completions: [],
    position: { x: 0.51, y: 0, depth: 1, yj: -0.2 },
  },

  // -- Lower density background plants
  {
    id: "t-stretch",
    title: "Stretch",
    kind: "daily",
    target: 1,
    period: "day",
    paletteKey: "butter",
    completions: [
      rel(0, 8), rel(1, 8), rel(2, 8), rel(4, 8), rel(7, 8), rel(8, 8), rel(11, 8),
    ],
    position: { x: 0.66, y: 0, depth: 1, yj: 0.4 },
  },
  {
    id: "t-write",
    title: "Journal",
    kind: "daily",
    target: 1,
    period: "day",
    paletteKey: "lavender",
    completions: [
      rel(1, 22), rel(2, 22), rel(4, 22), rel(7, 22), rel(8, 22),
    ],
    position: { x: 0.79, y: 0, depth: 1, yj: -0.1 },
  },
  // Hint: gym needs to also include rose-pink palette key handled
];

// Patch palette: "pink" alias  (we use rose for pink)
const PALETTE_ALIAS = { pink: "rose" };
function paletteKey(k) { return PALETTE_ALIAS[k] || k; }

// ─────────────────────────────────────────────────────────────────────────────
// Tweaks defaults
// ─────────────────────────────────────────────────────────────────────────────

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "scheme": "meadow",
  "density": "regular",
  "showLabels": false,
  "showWildlife": true,
  "fastForward": 0
}/*EDITMODE-END*/;

const SCHEMES = {
  meadow:  { bg: "#F4EFE5", bg2: "#EDE6D8", soil: "#C9B79A", ink: "#3A352B" },
  twilight:{ bg: "#E8E4ED", bg2: "#DEDAE6", soil: "#A8A0BD", ink: "#2D2A3D" },
  dawn:    { bg: "#F6EAE2", bg2: "#EFDFD3", soil: "#D2A28A", ink: "#3D2C26" },
  moss:    { bg: "#E8EEDF", bg2: "#DDE5D0", soil: "#A8B894", ink: "#2D362B" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Main App with i18n wrapper
// ─────────────────────────────────────────────────────────────────────────────

function AppContent() {
  const { t, lang, setLang } = useLanguage();
  const [tweak, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [tasks, setTasks] = useStateA(() => {
    const saved = localStorage.getItem("plot-tasks");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn("Failed to load tasks from localStorage", e);
      }
    }
    return SAMPLE_TASKS.map(t => ({ ...t, paletteKey: paletteKey(t.paletteKey) }));
  });
  const [view, setView] = useStateA("garden");
  const [selectedId, setSelectedId] = useStateA(null);
  const [adding, setAdding] = useStateA(false);

  // Persist tasks to localStorage whenever they change
  useEffectA(() => {
    localStorage.setItem("plot-tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Apply scheme to root css vars
  useEffectA(() => {
    const sc = SCHEMES[tweak.scheme] || SCHEMES.meadow;
    const root = document.documentElement;
    root.style.setProperty("--bg", sc.bg);
    root.style.setProperty("--bg-2", sc.bg2);
    root.style.setProperty("--soil", sc.soil);
    root.style.setProperty("--ink", sc.ink);
  }, [tweak.scheme]);

  // "now" — base it on NOW + fastForward days
  const now = useMemoA(() => {
    const n = new Date(NOW);
    n.setDate(n.getDate() + (tweak.fastForward || 0));
    return n;
  }, [tweak.fastForward]);

  const selected = tasks.find((x) => x.id === selectedId) || null;

  // Counts for header
  const weeklyDone = useMemoA(() => {
    const ws = startOfWeek(now);
    let c = 0;
    tasks.forEach((tk) => {
      if (tk.kind === "oneoff") {
        if (tk.done && tk.completions?.[0] && new Date(tk.completions[0]) >= ws) c++;
        return;
      }
      (tk.completions || []).forEach((ts) => { if (new Date(ts) >= ws) c++; });
    });
    return c;
  }, [tasks, now]);

  // Mutations
  const completeTask = useCallbackA((id) => {
    setTasks((cur) => cur.map((tk) => {
      if (tk.id !== id) return tk;
      if (tk.kind === "oneoff") {
        return { ...tk, done: true, completions: [...(tk.completions || []), now.toISOString()] };
      }
      return { ...tk, completions: [...(tk.completions || []), now.toISOString()] };
    }));
  }, [now]);

  const uncompleteTask = useCallbackA((id) => {
    setTasks((cur) => cur.map((tk) => {
      if (tk.id !== id) return tk;
      if (tk.kind === "oneoff") {
        return { ...tk, done: false, completions: [] };
      }
      const c = [...(tk.completions || [])];
      c.pop();
      return { ...tk, completions: c };
    }));
  }, []);

  const updateProgress = useCallbackA((id, delta) => {
    setTasks((cur) => cur.map((tk) => {
      if (tk.id !== id || tk.kind !== "progress") return tk;
      const next = Math.max(0, Math.min(tk.progress.total, tk.progress.current + delta));
      const completions = delta > 0 ? [...(tk.completions || []), now.toISOString()] : tk.completions;
      return { ...tk, progress: { ...tk.progress, current: next }, completions };
    }));
  }, [now]);

  const deleteTask = useCallbackA((id) => {
    setTasks((cur) => cur.filter((tk) => tk.id !== id));
    setSelectedId(null);
  }, []);

  const clearDoneOneoffs = useCallbackA(() => {
    setTasks((cur) => cur.filter((tk) => !(tk.kind === "oneoff" && tk.done)));
  }, []);

  const createTask = useCallbackA((data) => {
    const id = "t-" + Math.random().toString(36).slice(2, 8);
    // place it in an empty-ish spot; just append at right edge for now
    const newTask = {
      id,
      ...data,
      completions: [],
      done: false,
      position: { x: 0.4 + Math.random() * 0.4, y: 0, depth: Math.random() < 0.4 ? 1 : 0, yj: (Math.random() - 0.5) },
    };
    setTasks((cur) => [...cur, newTask]);
    setSelectedId(id);
  }, []);

  return (
    <>
      <Header now={now} view={view} setView={setView} onAdd={() => setAdding(true)} weeklyDone={weeklyDone} />

      {view === "garden" && (
        <main style={{ maxWidth: 1440, margin: "0 auto", padding: "0 36px", display: "flex", gap: 22, alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Garden
              tasks={tasks}
              now={now}
              onSelect={setSelectedId}
              selectedId={selectedId}
              dense={tweak.density}
            />
            <Footnote now={now} />
          </div>
          <TodayRail
            tasks={tasks}
            now={now}
            onComplete={completeTask}
            onSelect={setSelectedId}
            onProgress={updateProgress}
          />
        </main>
      )}

      {view === "list" && (
        <ListView
          tasks={tasks}
          now={now}
          onSelect={setSelectedId}
          onComplete={completeTask}
          onProgress={updateProgress}
          onClearDone={clearDoneOneoffs}
        />
      )}

      {view === "harvest" && (
        <HarvestView tasks={tasks} now={now} />
      )}

      {selected && (
        <TaskDetail
          task={selected}
          now={now}
          onClose={() => setSelectedId(null)}
          onComplete={completeTask}
          onUncomplete={uncompleteTask}
          onProgress={updateProgress}
          onDelete={deleteTask}
        />
      )}

      {adding && <AddTask onClose={() => setAdding(false)} onCreate={createTask} />}

      {/* Tweaks */}
      <TweaksPanel>
        <TweakSection label={t("atmosphere")} />
        <TweakRadio
          label={t("colorScheme")}
          value={tweak.scheme}
          options={[
            { value: "meadow",   label: t("scheme.meadow") },
            { value: "twilight", label: t("scheme.twilight") },
            { value: "dawn",     label: t("scheme.dawn") },
            { value: "moss",     label: t("scheme.moss") },
          ]}
          onChange={(v) => setTweak("scheme", v)}
        />
        <TweakRadio
          label={t("density")}
          value={tweak.density}
          options={[
            { value: "compact", label: t("compact") },
            { value: "regular", label: t("regular") },
            { value: "comfy", label: t("comfy") },
          ]}
          onChange={(v) => setTweak("density", v)}
        />
        <TweakSection label={t("language")} />
        <TweakRadio
          label={t("language")}
          value={lang}
          options={[
            { value: "en", label: t("english") },
            { value: "zh", label: t("chinese") },
          ]}
          onChange={(v) => setLang(v)}
        />
        <TweakSection label={t("time")} />
        <TweakSlider
          label={t("fastForward")}
          value={tweak.fastForward}
          min={0}
          max={28}
          step={1}
          unit="d"
          onChange={(v) => setTweak("fastForward", v)}
        />
        <div style={{ fontSize: 10.5, color: "rgba(41,38,27,.55)", marginTop: -4, lineHeight: 1.4 }}>
          {t("fastForwardHelp")}
        </div>
      </TweaksPanel>
    </>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

function Footnote({ now }) {
  const { t } = useLanguage();
  const day = t("days")[new Date(now).getDay()];
  return (
    <div style={{ maxWidth: 1440, margin: "20px auto 40px", textAlign: "center", color: "var(--ink-3)", fontSize: 12 }}>
      <span className="serif" style={{ fontStyle: "italic" }}>{t("itIs")} {day}.</span> {t("plantsMessage")}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("app")).render(<App />);
