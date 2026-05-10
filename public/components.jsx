// components.jsx — Layout pieces: Header, Garden canvas, Today rail,
// TaskDetail side panel, AddTask flow, end-of-week harvest view.

const { useState, useEffect, useRef, useMemo } = React;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0,0,0,0);
  const dow = d.getDay(); // 0 sun
  const diff = (dow + 6) % 7; // make Mon = 0
  d.setDate(d.getDate() - diff);
  return d;
}
function startOfMonth(date) {
  const d = new Date(date);
  d.setHours(0,0,0,0);
  d.setDate(1);
  return d;
}
function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0,0,0,0);
  return d;
}
function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}
function fmtShort(d) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Returns completions in current period for a recurring task
function periodCompletions(task, now) {
  if (!task.completions) return 0;
  let start;
  if (task.period === "day")   start = startOfDay(now);
  else if (task.period === "week")  start = startOfWeek(now);
  else if (task.period === "month") start = startOfMonth(now);
  else return task.completions.length;
  return task.completions.filter((t) => new Date(t) >= start).length;
}

// Growth fraction (0..1) for plant rendering
function growthFor(task, now) {
  if (task.kind === "oneoff") return task.done ? 1 : 0.4;
  if (task.kind === "progress") {
    const p = task.progress || { current: 0, total: 1 };
    return Math.max(0.05, Math.min(1, p.current / p.total));
  }
  const c = periodCompletions(task, now);
  return Math.max(0, Math.min(1, c / Math.max(1, task.target)));
}

function targetFor(task) {
  if (task.kind === "oneoff") return 1;
  if (task.kind === "progress") return 1;
  return 1; // growth is already normalized
}

function periodLabel(task) {
  if (task.kind === "oneoff") return "One-off";
  if (task.kind === "progress") return "In progress";
  const per = task.period === "day" ? "day" : task.period === "week" ? "week" : "month";
  return `${task.target}× per ${per}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────────────────────

function Header({ now, view, setView, onAdd, weeklyDone }) {
  const dateStr = fmtDate(now);
  return (
    <header style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "22px 36px 10px", maxWidth: 1440, margin: "0 auto",
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
        <span className="serif" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em" }}>
          plot
          <span style={{ color: "var(--sage-deep)" }}>.</span>
        </span>
        <span style={{ fontSize: 13, color: "var(--ink-2)" }}>{dateStr}</span>
      </div>

      <nav style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,.5)", border: "1px solid var(--line)", padding: 3, borderRadius: 999 }}>
        {[
          { id: "garden", label: "Garden" },
          { id: "list",   label: "List" },
          { id: "harvest",label: "Harvest" },
        ].map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            style={{
              border: 0, background: view === v.id ? "var(--ink)" : "transparent",
              color: view === v.id ? "var(--bg)" : "var(--ink-2)",
              padding: "7px 16px", borderRadius: 999, fontSize: 12.5, fontWeight: 500,
              transition: "all .2s ease",
            }}
          >
            {v.label}
          </button>
        ))}
      </nav>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontSize: 12, color: "var(--ink-2)" }}>
          <span className="serif" style={{ fontStyle: "italic", marginRight: 4 }}>this week</span>
          <span className="mono-num" style={{ color: "var(--ink)", fontWeight: 500 }}>{weeklyDone}</span>
          <span style={{ color: "var(--ink-3)" }}> blooms</span>
        </span>
        <button onClick={onAdd} style={{
          border: 0, background: "var(--ink)", color: "var(--bg)",
          padding: "9px 18px", borderRadius: 999, fontSize: 13, fontWeight: 500,
          display: "flex", alignItems: "center", gap: 6,
          boxShadow: "0 2px 6px rgba(58,53,43,.15)",
        }}>
          <span style={{ fontSize: 16, lineHeight: 1, marginTop: -1 }}>＋</span> Plant
        </button>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Garden canvas — primary UI
// ─────────────────────────────────────────────────────────────────────────────

function Garden({ tasks, now, onSelect, selectedId, scale = 1, dense = "regular" }) {
  // density adjusts canvas height & plant scale
  const density = { compact: { plant: 0.85, canvas: 460 }, regular: { plant: 1, canvas: 540 }, comfy: { plant: 1.12, canvas: 600 } }[dense];

  // assign positions based on task.position (deterministic 0..1)
  // ground band y range
  const groundY = density.canvas - 88; // baseline
  const groundY2 = density.canvas - 48; // far back row baseline

  // sort tasks by depth for proper layering (back row first)
  const placed = useMemo(() => {
    return tasks.map((t, i) => {
      const px = (t.position?.x ?? ((i + 1) / (tasks.length + 1))) * 100;
      const depth = t.position?.depth ?? 0; // 0 = front, 1 = back
      const y = depth > 0.5 ? groundY2 : groundY;
      // height jitter so they don't all align
      const yJitter = (t.position?.yj ?? 0) * 8;
      return { task: t, px, y: y + yJitter, depth };
    }).sort((a, b) => b.depth - a.depth || a.y - b.y);
  }, [tasks, density.canvas]);

  return (
    <div style={{
      position: "relative",
      maxWidth: 1440, margin: "10px auto 0", padding: "0 36px",
    }}>
      {/* canvas */}
      <div style={{
        position: "relative",
        height: density.canvas,
        borderRadius: 24,
        overflow: "hidden",
        background: "linear-gradient(to bottom, #F4EFE5 0%, #F4EFE5 55%, #EFE5D0 80%, #E5D6B7 100%)",
        boxShadow: "inset 0 0 0 1px var(--line-2), 0 1px 0 rgba(255,255,255,.7) inset",
      }}>
        {/* sun */}
        <div style={{
          position: "absolute", top: 36, right: 60, width: 84, height: 84,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, #F1E4B8 0%, #EAD79C 60%, rgba(234,215,156,0) 78%)",
          opacity: 0.55,
          animation: "drift 9s ease-in-out infinite",
        }} />

        {/* far hills */}
        <svg width="100%" height="100%" viewBox="0 0 1400 600" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <path d="M 0 380 Q 200 340 380 360 T 760 350 T 1100 365 T 1400 350 L 1400 600 L 0 600 Z" fill="#E8DDC4" opacity="0.7" />
          <path d="M 0 420 Q 250 390 460 405 T 880 395 T 1400 405 L 1400 600 L 0 600 Z" fill="#DECFB1" opacity="0.85" />
        </svg>

        {/* soil band */}
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: 0, height: 60,
          background: "linear-gradient(to bottom, #C9B79A 0%, #B49E7A 100%)",
        }}>
          {/* speckles */}
          <svg width="100%" height="100%" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
            {Array.from({ length: 60 }).map((_, i) => (
              <circle key={i} cx={`${(i * 17) % 100}%`} cy={`${20 + (i * 13) % 60}%`} r="1" fill="rgba(58,53,43,.15)" />
            ))}
          </svg>
        </div>

        {/* a couple of rocks for texture */}
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} preserveAspectRatio="none" viewBox={`0 0 1400 ${density.canvas}`}>
          <ellipse cx="120" cy={density.canvas - 30} rx="22" ry="8" fill="#9D8866" opacity=".7" />
          <ellipse cx="1280" cy={density.canvas - 26} rx="28" ry="9" fill="#9D8866" opacity=".7" />
          <ellipse cx="640" cy={density.canvas - 22} rx="14" ry="5" fill="#A89576" opacity=".6" />
        </svg>

        {/* butterflies */}
        <div style={{ position: "absolute", left: "12%", top: "22%", animation: "butterfly 14s ease-in-out infinite" }}>
          <Butterfly color="var(--lavender)" />
        </div>
        <div style={{ position: "absolute", right: "18%", top: "38%", animation: "butterfly 18s ease-in-out infinite reverse" }}>
          <Butterfly color="var(--pink)" />
        </div>

        {/* plants */}
        {placed.map(({ task, px, y, depth }) => {
          const isSelected = task.id === selectedId;
          const plantScale = scale * density.plant * (depth > 0.5 ? 0.78 : 1);
          return (
            <PlantSlot
              key={task.id}
              task={task}
              now={now}
              x={px}
              y={y}
              scale={plantScale}
              depth={depth}
              selected={isSelected}
              onClick={() => onSelect(task.id)}
            />
          );
        })}
      </div>

      {/* caption underneath */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 8px 4px", color: "var(--ink-3)", fontSize: 11.5, letterSpacing: ".04em", textTransform: "uppercase" }}>
        <span>your plot · {tasks.length} plants</span>
        <span className="serif" style={{ fontStyle: "italic", textTransform: "none", fontSize: 13, letterSpacing: 0, color: "var(--ink-2)" }}>tend, don't rush.</span>
      </div>
    </div>
  );
}

function Butterfly({ color = "var(--lavender)" }) {
  return (
    <svg width="24" height="18" viewBox="-12 -9 24 18">
      <ellipse cx="-4" cy="-2" rx="4" ry="5" fill={color} opacity=".85" />
      <ellipse cx="-4" cy="3"  rx="3" ry="3.5" fill={color} opacity=".7" />
      <ellipse cx="4"  cy="-2" rx="4" ry="5" fill={color} opacity=".85" />
      <ellipse cx="4"  cy="3"  rx="3" ry="3.5" fill={color} opacity=".7" />
      <rect x="-0.4" y="-4" width="0.8" height="8" rx="0.4" fill="var(--ink)" />
    </svg>
  );
}

function PlantSlot({ task, now, x, y, scale, depth, selected, onClick }) {
  const [hover, setHover] = useState(false);
  const [pulse, setPulse] = useState(0);
  const lastCompCount = useRef(task.completions?.length ?? 0);

  // Trigger pulse when completion count grows
  useEffect(() => {
    const cur = task.completions?.length ?? 0;
    if (cur > lastCompCount.current) setPulse((p) => p + 1);
    lastCompCount.current = cur;
  }, [task.completions?.length]);

  const growth = growthFor(task, now);
  const target = targetFor(task);
  const pCount = task.kind === "oneoff" || task.kind === "progress" ? null : periodCompletions(task, now);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "absolute",
        left: `${x}%`,
        top: y,
        transform: "translate(-50%, -100%)",
        cursor: "default",
        filter: depth > 0.5 ? "saturate(.85) brightness(1.02)" : "none",
        zIndex: selected ? 10 : (depth > 0.5 ? 1 : 2),
        transition: "transform .25s ease",
        ...(hover ? { transform: "translate(-50%, calc(-100% - 4px))" } : {}),
      }}
    >
      {/* selection halo */}
      {selected && (
        <div style={{
          position: "absolute", left: "50%", top: "100%",
          width: 70 * scale, height: 14 * scale,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(143,166,142,.45) 0%, rgba(143,166,142,0) 70%)",
          pointerEvents: "none",
        }} />
      )}

      {/* petal-burst when pulse increments */}
      {pulse > 0 && <PetalBurst key={pulse} paletteKey={task.paletteKey} />}

      <Plant
        kind={task.kind}
        growth={growth}
        target={target}
        paletteKey={task.paletteKey}
        scale={scale}
        done={task.done}
      />

      {/* hover tooltip */}
      {hover && (
        <div style={{
          position: "absolute",
          left: "50%", bottom: "100%",
          transform: "translate(-50%, 8px)",
          background: "var(--ink)",
          color: "var(--bg)",
          padding: "6px 10px",
          borderRadius: 8,
          fontSize: 11.5,
          whiteSpace: "nowrap",
          boxShadow: "0 4px 12px rgba(58,53,43,.2)",
          pointerEvents: "none",
          animation: "fade-in .15s ease",
        }}>
          <div style={{ fontWeight: 500 }}>{task.title}</div>
          <div style={{ opacity: .7, marginTop: 2 }}>
            {task.kind === "oneoff" && (task.done ? "completed" : "to do")}
            {task.kind === "progress" && task.progress && `${task.progress.current}/${task.progress.total} ${task.progress.unit || ""}`}
            {(task.kind === "weekly" || task.kind === "daily" || task.kind === "monthly") && `${pCount}/${task.target} this ${task.period}`}
          </div>
          <div style={{ position: "absolute", left: "50%", bottom: -4, width: 8, height: 8, background: "var(--ink)", transform: "translate(-50%, 0) rotate(45deg)" }} />
        </div>
      )}
    </div>
  );
}

function PetalBurst({ paletteKey = "rose" }) {
  const palette = PALETTES[paletteKey] || PALETTES.rose;
  return (
    <div style={{ position: "absolute", left: "50%", top: 18, pointerEvents: "none" }}>
      {Array.from({ length: 8 }).map((_, i) => {
        const ang = (i / 8) * Math.PI * 2;
        const r = 38 + (i % 3) * 8;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 8, height: 8,
              borderRadius: "50%",
              background: i % 2 === 0 ? palette.petal : palette.petal2,
              left: 0, top: 0,
              "--dx": `${Math.cos(ang) * r}px`,
              "--dy": `${Math.sin(ang) * r - 10}px`,
              animation: `petal-burst .9s ease-out ${i * 0.02}s both`,
              transform: "translate(-50%, -50%)",
            }}
          />
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Today rail — compact list of what's actionable today
// ─────────────────────────────────────────────────────────────────────────────

function TodayRail({ tasks, now, onComplete, onSelect, onProgress }) {
  // Surface: today's daily habits, weekly tasks not yet at target, monthly under target,
  // any one-off that's not done, and progress tasks.
  const items = tasks.filter((t) => {
    if (t.kind === "oneoff") return !t.done;
    if (t.kind === "progress") return t.progress.current < t.progress.total;
    const c = periodCompletions(t, now);
    return c < t.target;
  });

  // Mark items already completed today (for daily tasks) or at target this period
  return (
    <aside style={{
      position: "sticky", top: 16,
      width: 308, flexShrink: 0,
      background: "rgba(255,255,255,.55)",
      border: "1px solid var(--line)",
      borderRadius: 18,
      padding: "18px 18px 14px",
      boxShadow: "var(--shadow)",
      maxHeight: "calc(100vh - 140px)",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
        <h2 className="serif" style={{ margin: 0, fontSize: 20, fontWeight: 500 }}>Today</h2>
        <span style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: ".06em", textTransform: "uppercase" }}>{items.length} pending</span>
      </div>

      <div className="scroll" style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingRight: 2 }}>
        {items.length === 0 && (
          <div style={{ padding: "26px 8px", textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
            <div className="serif" style={{ fontStyle: "italic", fontSize: 18, color: "var(--ink-2)", marginBottom: 6 }}>all tended.</div>
            <div>nothing more for today.</div>
          </div>
        )}
        {items.map((t) => (
          <TaskRow key={t.id} task={t} now={now} onComplete={onComplete} onSelect={onSelect} onProgress={onProgress} />
        ))}
      </div>
    </aside>
  );
}

function TaskRow({ task, now, onComplete, onSelect, onProgress }) {
  const palette = PALETTES[task.paletteKey] || PALETTES.rose;
  const pCount = (task.kind === "weekly" || task.kind === "daily" || task.kind === "monthly") ? periodCompletions(task, now) : null;
  const sub =
    task.kind === "oneoff" ? "one-off" :
    task.kind === "progress" ? `${task.progress.current}/${task.progress.total} ${task.progress.unit || ""}` :
    `${pCount} of ${task.target} this ${task.period}`;

  const isProgress = task.kind === "progress";

  return (
    <div
      onClick={() => onSelect(task.id)}
      style={{
        display: "flex", alignItems: "center", gap: 11,
        padding: "10px 10px",
        background: "rgba(255,255,255,.4)",
        borderRadius: 12,
        border: "1px solid var(--line-2)",
        transition: "background .15s ease",
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,.7)"}
      onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,.4)"}
    >
      {/* check / progress affordance */}
      {!isProgress ? (
        <button
          onClick={(e) => { e.stopPropagation(); onComplete(task.id); }}
          aria-label="Complete"
          style={{
            width: 22, height: 22, borderRadius: "50%",
            border: `1.5px solid ${palette.leaf2}`,
            background: "rgba(255,255,255,.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            transition: "all .2s ease",
            position: "relative",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = palette.petal;
            e.currentTarget.style.borderColor = palette.center;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,.5)";
            e.currentTarget.style.borderColor = palette.leaf2;
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: palette.petal2 }} />
        </button>
      ) : (
        <div style={{
          width: 22, height: 22, borderRadius: "50%",
          background: `conic-gradient(${palette.leaf} ${(task.progress.current/task.progress.total)*360}deg, var(--line) 0deg)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: "var(--bg)" }} />
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</div>
        <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 1 }}>{sub}</div>
      </div>

      {/* tiny species swatch */}
      <div style={{ width: 18, height: 18, flexShrink: 0, opacity: .9 }}>
        <SpeciesGlyph kind={task.kind} paletteKey={task.paletteKey} />
      </div>
    </div>
  );
}

function SpeciesGlyph({ kind, paletteKey }) {
  const palette = PALETTES[paletteKey] || PALETTES.rose;
  if (kind === "weekly")
    return (
      <svg width="18" height="18" viewBox="-9 -9 18 18">
        {[0,1,2,3,4,5,6,7].map((i) => {
          const a = (i/8)*Math.PI*2;
          return <circle key={i} cx={Math.cos(a)*5} cy={Math.sin(a)*5} r="2.6" fill={i%2===0?palette.petal:palette.petal2} />;
        })}
        <circle cx="0" cy="0" r="1.8" fill={palette.center} />
      </svg>
    );
  if (kind === "daily")
    return (
      <svg width="18" height="18" viewBox="-9 -9 18 18">
        <rect x="-0.5" y="-7" width="1" height="14" fill={palette.leaf2} />
        {[-5,-2,1,4].map((y, i) => <ellipse key={i} cx={i%2===0?-2:2} cy={y} rx="1.6" ry="2" fill={palette.petal} />)}
      </svg>
    );
  if (kind === "monthly")
    return (
      <svg width="18" height="18" viewBox="-9 -9 18 18">
        <ellipse cx="0" cy="-1" rx="3.5" ry="5" fill={palette.petal} />
        <ellipse cx="-2" cy="-1" rx="2" ry="5" fill={palette.petal2} />
        <ellipse cx="2" cy="-1" rx="2" ry="5" fill={palette.petal2} />
        <rect x="-0.4" y="3" width=".8" height="5" fill={palette.leaf2} />
      </svg>
    );
  if (kind === "progress")
    return (
      <svg width="18" height="18" viewBox="-9 -9 18 18">
        <rect x="-0.5" y="-7" width="1" height="14" fill={palette.leaf2} />
        <ellipse cx="-3" cy="-2" rx="2.5" ry="1.4" fill={palette.leaf} transform="rotate(-30, -3, -2)" />
        <ellipse cx="3"  cy="0"  rx="2.5" ry="1.4" fill={palette.leaf2} transform="rotate(30, 3, 0)" />
        <ellipse cx="-2" cy="3"  rx="2"   ry="1.2" fill={palette.leaf} transform="rotate(-25, -2, 3)" />
      </svg>
    );
  // oneoff
  return (
    <svg width="18" height="18" viewBox="-9 -9 18 18">
      {[0,1,2,3,4].map((i) => {
        const a = (i/5)*Math.PI*2 - Math.PI/2;
        return <circle key={i} cx={Math.cos(a)*4.5} cy={Math.sin(a)*4.5} r="3" fill={i%2===0?palette.petal:palette.petal2} />;
      })}
      <circle cx="0" cy="0" r="2" fill={palette.center} />
    </svg>
  );
}

Object.assign(window, {
  Header, Garden, TodayRail, TaskRow, SpeciesGlyph, Butterfly, PetalBurst,
  startOfWeek, startOfMonth, startOfDay, fmtDate, fmtShort,
  periodCompletions, growthFor, targetFor, periodLabel,
});
