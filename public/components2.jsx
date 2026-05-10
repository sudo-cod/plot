// components2.jsx — TaskDetail, AddTask, ListView, HarvestView
const { useState: useState2, useEffect: useEffect2, useMemo: useMemo2 } = React;

// ─────────────────────────────────────────────────────────────────────────────
// TaskDetail — slide-in side panel from the right
// ─────────────────────────────────────────────────────────────────────────────

function TaskDetail({ task, now, onClose, onComplete, onUncomplete, onProgress, onDelete, onUpdate }) {
  if (!task) return null;
  const { t } = useLanguage();
  const palette = PALETTES[task.paletteKey] || PALETTES.rose;

  const isProgress = task.kind === "progress";
  const isOneoff = task.kind === "oneoff";
  const pCount = (!isProgress && !isOneoff) ? periodCompletions(task, now) : 0;
  const target = task.target || 1;

  // Build a 7-day strip showing this week's completions (for weekly/daily)
  const weekDays = useMemo2(() => {
    const start = startOfWeek(now);
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start); d.setDate(start.getDate() + i);
      return d;
    });
  }, [now]);

  const completionsByDay = useMemo2(() => {
    if (!task.completions) return {};
    const map = {};
    task.completions.forEach((ts) => {
      const k = startOfDay(ts).toISOString();
      map[k] = (map[k] || 0) + 1;
    });
    return map;
  }, [task.completions]);

  // Recent log entries
  const recent = (task.completions || []).slice(-8).reverse();

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(58,53,43,.16)",
        backdropFilter: "blur(2px)",
        zIndex: 100,
        animation: "fade-in .2s ease",
      }}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute", right: 0, top: 0, bottom: 0,
          width: 420,
          background: "var(--bg)",
          borderLeft: "1px solid var(--line)",
          boxShadow: "-12px 0 40px rgba(58,53,43,.1)",
          display: "flex", flexDirection: "column",
          animation: "panel-in .25s ease",
        }}
      >
        {/* Header band */}
        <div style={{
          padding: "22px 24px 18px",
          background: `linear-gradient(135deg, ${palette.petal2}50, ${palette.leaf}30)`,
          borderBottom: "1px solid var(--line-2)",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, color: "var(--ink-2)", fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase" }}>
              <SpeciesGlyph kind={task.kind} paletteKey={task.paletteKey} />
              <span>{task.kind === "weekly" ? "daisy" : task.kind === "monthly" ? "tulip" : task.kind === "daily" ? "lavender" : task.kind === "progress" ? "sapling" : "sprout"}</span>
              <span style={{ color: "var(--ink-3)" }}>·</span>
              <span>{periodLabel(task)}</span>
            </div>
            <h2 className="serif" style={{ margin: 0, fontSize: 26, fontWeight: 500, lineHeight: 1.15, color: "var(--ink)" }}>{task.title}</h2>
            {task.notes && <div style={{ marginTop: 8, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>{task.notes}</div>}
          </div>
          <button onClick={onClose} style={{ border: 0, background: "transparent", color: "var(--ink-2)", fontSize: 22, lineHeight: 1, padding: 4, marginTop: -4 }}>×</button>
        </div>

        {/* Plant viz */}
        <div style={{
          padding: "20px 24px",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          minHeight: 180,
          background: "linear-gradient(to bottom, transparent 0%, transparent 60%, #EFE5D0 90%, #E5D6B7 100%)",
          borderBottom: "1px solid var(--line-2)",
        }}>
          <Plant
            kind={task.kind}
            growth={growthFor(task, now)}
            target={targetFor(task)}
            paletteKey={task.paletteKey}
            scale={1.5}
            done={task.done}
          />
        </div>

        {/* Progress section */}
        <div className="scroll" style={{ flex: 1, overflowY: "auto", padding: "20px 24px 30px" }}>
          {/* status / progress */}
          {isOneoff && (
            <Section label={t("statusHeader")}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  onClick={() => task.done ? onUncomplete(task.id) : onComplete(task.id)}
                  style={{
                    flex: 1, padding: "12px 16px", borderRadius: 10,
                    border: "1px solid " + (task.done ? "var(--sage-deep)" : "var(--line)"),
                    background: task.done ? "var(--sage)" : "var(--bg-2)",
                    color: task.done ? "white" : "var(--ink)",
                    fontSize: 13, fontWeight: 500,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "all .2s ease",
                  }}
                >
                  {task.done ? "✓ " + t("completedUndo") : t("markComplete")}
                </button>
              </div>
            </Section>
          )}

          {!isOneoff && !isProgress && (
            <Section label={`This ${task.period}`} right={<span style={{ fontSize: 11, color: "var(--ink-3)" }}>{pCount}/{target}</span>}>
              <ProgressDots done={pCount} total={target} palette={palette} />
              <button
                onClick={() => onComplete(task.id)}
                disabled={false}
                style={{
                  marginTop: 14, width: "100%",
                  padding: "12px 16px", borderRadius: 10,
                  border: 0,
                  background: pCount >= target ? palette.center : "var(--ink)",
                  color: pCount >= target ? "var(--ink)" : "var(--bg)",
                  fontSize: 13, fontWeight: 500,
                  boxShadow: "0 2px 6px rgba(58,53,43,.12)",
                }}
              >
                {pCount >= target ? "✓ Bloomed for this " + task.period + " — log another?" : "Log a session"}
              </button>
              {/* week strip */}
              {(task.period === "week" || task.period === "day") && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 8 }}>Mon–Sun</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5 }}>
                    {weekDays.map((d, i) => {
                      const k = startOfDay(d).toISOString();
                      const c = completionsByDay[k] || 0;
                      const isFuture = startOfDay(d) > startOfDay(now);
                      const isToday = startOfDay(d).getTime() === startOfDay(now).getTime();
                      return (
                        <div key={i} style={{
                          padding: "8px 4px",
                          textAlign: "center",
                          borderRadius: 8,
                          background: c > 0 ? palette.petal : "var(--bg-2)",
                          border: isToday ? "1.5px solid var(--ink)" : "1px solid var(--line-2)",
                          opacity: isFuture ? 0.5 : 1,
                        }}>
                          <div style={{ fontSize: 9.5, color: "var(--ink-3)", letterSpacing: ".06em", textTransform: "uppercase" }}>
                            {["m","t","w","t","f","s","s"][i]}
                          </div>
                          <div className="mono-num" style={{ fontSize: 13, fontWeight: 500, color: c > 0 ? "var(--ink)" : "var(--ink-3)", marginTop: 2 }}>
                            {c > 0 ? c : "·"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Section>
          )}

          {isProgress && (
            <Section label="Progress">
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10 }}>
                <span className="serif mono-num" style={{ fontSize: 32, fontWeight: 500, color: "var(--ink)" }}>{task.progress.current}</span>
                <span style={{ fontSize: 13, color: "var(--ink-2)" }}>/ {task.progress.total} {task.progress.unit}</span>
                <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--ink-3)" }}>{Math.round(task.progress.current/task.progress.total*100)}%</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: "var(--bg-2)", overflow: "hidden" }}>
                <div style={{
                  width: `${task.progress.current/task.progress.total*100}%`,
                  height: "100%",
                  background: `linear-gradient(to right, ${palette.leaf}, ${palette.leaf2})`,
                  transition: "width .4s ease",
                }} />
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <button
                  onClick={() => onProgress(task.id, -1)}
                  style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--bg-2)", color: "var(--ink)", fontSize: 13, fontWeight: 500 }}
                >−1</button>
                <button
                  onClick={() => onProgress(task.id, +1)}
                  style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: 0, background: "var(--ink)", color: "var(--bg)", fontSize: 13, fontWeight: 500 }}
                >+ Log {task.progress.unit ? task.progress.unit.replace(/s$/, "") : "step"}</button>
              </div>
            </Section>
          )}

          {/* Recent log */}
          {(task.completions && task.completions.length > 0) && (
            <Section label="Recent" right={<span style={{ fontSize: 11, color: "var(--ink-3)" }}>{(task.completions || []).length} total</span>}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {recent.map((ts, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", background: "rgba(255,255,255,.45)", borderRadius: 8, border: "1px solid var(--line-2)" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: palette.petal }} />
                    <span style={{ fontSize: 12.5, color: "var(--ink)" }}>{fmtShort(ts)}</span>
                    <span style={{ fontSize: 11, color: "var(--ink-3)", marginLeft: "auto" }}>
                      {new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* All-time stats */}
          <Section label="All time">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Stat label="Total" value={(task.completions || []).length || (task.done ? 1 : 0)} />
              <Stat label="Streak" value={computeStreak(task, now)} />
            </div>
          </Section>

          {/* Delete (subtle) */}
          <button
            onClick={() => onDelete(task.id)}
            style={{
              marginTop: 6, alignSelf: "flex-start",
              border: 0, background: "transparent", color: "var(--ink-3)",
              fontSize: 11.5, padding: "4px 0", textDecoration: "underline",
              textDecorationColor: "var(--line)",
              textUnderlineOffset: 3,
            }}
          >
            uproot this plant
          </button>
        </div>
      </aside>
    </div>
  );
}

function Section({ label, right, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-3)", fontWeight: 500 }}>{label}</span>
        {right}
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ padding: "10px 12px", background: "var(--bg-2)", borderRadius: 10, border: "1px solid var(--line-2)" }}>
      <div className="serif mono-num" style={{ fontSize: 22, color: "var(--ink)", fontWeight: 500 }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{label}</div>
    </div>
  );
}

function ProgressDots({ done, total, palette }) {
  // up to 14 dots, then collapse to bar style
  const items = Math.min(total, 14);
  return (
    <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
      {Array.from({ length: items }).map((_, i) => {
        const filled = i < done;
        return (
          <div key={i} style={{
            width: 26, height: 26, borderRadius: "50%",
            background: filled ? palette.petal : "transparent",
            border: filled ? `1px solid ${palette.petal2}` : `1.5px dashed ${palette.leaf2}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all .25s ease",
          }}>
            {filled && <div style={{ width: 8, height: 8, borderRadius: "50%", background: palette.center }} />}
          </div>
        );
      })}
      {total > 14 && <span style={{ fontSize: 11, color: "var(--ink-3)" }}>+{total - 14}</span>}
    </div>
  );
}

function computeStreak(task, now) {
  if (task.kind === "progress") return task.progress.current;
  if (task.kind === "oneoff") return task.done ? 1 : 0;
  if (!task.completions || task.completions.length === 0) return 0;
  // count consecutive periods (week/day/month) with at least target completions, walking back
  const days = (task.completions || []).map((t) => startOfDay(t).getTime());
  const set = new Set(days);
  let streak = 0;
  let d = startOfDay(now);
  if (task.period === "day") {
    while (set.has(d.getTime())) { streak++; const nd = new Date(d); nd.setDate(d.getDate() - 1); d = nd; }
    return streak;
  }
  // week / month: count units back
  let cursor = task.period === "week" ? startOfWeek(now) : startOfMonth(now);
  while (true) {
    const start = new Date(cursor);
    const end = new Date(cursor);
    if (task.period === "week") end.setDate(start.getDate() + 7);
    else end.setMonth(start.getMonth() + 1);
    const count = (task.completions || []).filter((t) => {
      const tt = new Date(t).getTime();
      return tt >= start.getTime() && tt < end.getTime();
    }).length;
    if (count >= task.target) {
      streak++;
      const nc = new Date(cursor);
      if (task.period === "week") nc.setDate(cursor.getDate() - 7);
      else nc.setMonth(cursor.getMonth() - 1);
      cursor = nc;
    } else break;
    if (streak > 52) break;
  }
  return streak;
}

// ─────────────────────────────────────────────────────────────────────────────
// AddTask — modal flow
// ─────────────────────────────────────────────────────────────────────────────

function AddTask({ onClose, onCreate }) {
  const { t } = useLanguage();
  const [step, setStep] = useState2(1);
  const [kind, setKind] = useState2("weekly");
  const [title, setTitle] = useState2("");
  const [target, setTarget] = useState2(3);
  const [period, setPeriod] = useState2("week");
  const [progressTotal, setProgressTotal] = useState2(10);
  const [progressUnit, setProgressUnit] = useState2("modules");
  const [paletteKey, setPaletteKey] = useState2("rose");
  const [notes, setNotes] = useState2("");

  // Sync period with kind when selecting
  useEffect2(() => {
    if (kind === "weekly") setPeriod("week");
    if (kind === "daily") setPeriod("day");
    if (kind === "monthly") setPeriod("month");
  }, [kind]);

  const canSubmit = title.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onCreate({
      title: title.trim(),
      kind,
      target: kind === "weekly" || kind === "daily" || kind === "monthly" ? target : undefined,
      period: kind === "weekly" || kind === "daily" || kind === "monthly" ? period : undefined,
      progress: kind === "progress" ? { current: 0, total: progressTotal, unit: progressUnit } : undefined,
      paletteKey,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(58,53,43,.25)",
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "fade-in .2s ease", padding: 20,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "var(--bg)",
        borderRadius: 18,
        width: 560, maxWidth: "100%",
        maxHeight: "90vh",
        boxShadow: "0 24px 60px rgba(58,53,43,.18), 0 1px 0 rgba(255,255,255,.7) inset",
        border: "1px solid var(--line)",
        display: "flex", flexDirection: "column",
        animation: "scale-in .25s ease",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "24px 28px 18px", borderBottom: "1px solid var(--line-2)", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 4 }}>{t("plantSeed")}</div>
            <h2 className="serif" style={{ margin: 0, fontSize: 24, fontWeight: 500 }}>{t("whatGrowing")}</h2>
          </div>
          <button onClick={onClose} style={{ border: 0, background: "transparent", color: "var(--ink-2)", fontSize: 22, lineHeight: 1 }}>×</button>
        </div>

        <div className="scroll" style={{ overflowY: "auto", padding: "22px 28px 0" }}>
          {/* Title */}
          <FormRow label="Name your plant">
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. go to the gym"
              style={{
                width: "100%",
                padding: "12px 14px",
                fontSize: 15,
                fontFamily: "Newsreader, serif",
                borderRadius: 10,
                border: "1px solid var(--line)",
                background: "var(--bg-2)",
                outline: "none",
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--sage)"}
              onBlur={(e) => e.target.style.borderColor = "var(--line)"}
            />
          </FormRow>

          {/* Kind picker */}
          <FormRow label="Species">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
              {[
                { id: "weekly",  label: "Daisy",   sub: "weekly" },
                { id: "daily",   label: "Lavender",sub: "daily"  },
                { id: "monthly", label: "Tulip",   sub: "monthly"},
                { id: "progress",label: "Sapling", sub: "progress"},
                { id: "oneoff",  label: "Sprout",  sub: "one-off"},
              ].map((k) => (
                <button key={k.id} onClick={() => setKind(k.id)} style={{
                  border: kind === k.id ? "1.5px solid var(--ink)" : "1px solid var(--line)",
                  background: kind === k.id ? "var(--bg-2)" : "rgba(255,255,255,.5)",
                  borderRadius: 10,
                  padding: "12px 6px 10px",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  cursor: "default",
                  transition: "all .15s ease",
                }}>
                  <div style={{ height: 36, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                    <SpeciesGlyph kind={k.id} paletteKey={paletteKey} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--ink)" }}>{k.label}</div>
                  <div style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: ".04em", textTransform: "uppercase" }}>{k.sub}</div>
                </button>
              ))}
            </div>
          </FormRow>

          {/* Recurrence config */}
          {(kind === "weekly" || kind === "daily" || kind === "monthly") && (
            <FormRow label="How often?">
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--bg-2)", borderRadius: 10, border: "1px solid var(--line)" }}>
                <Stepper value={target} setValue={setTarget} min={1} max={kind === "daily" ? 12 : kind === "weekly" ? 14 : 31} />
                <span style={{ fontSize: 14, color: "var(--ink-2)" }}>times per</span>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 14 }}
                >
                  <option value="day">day</option>
                  <option value="week">week</option>
                  <option value="month">month</option>
                </select>
              </div>
            </FormRow>
          )}

          {kind === "progress" && (
            <FormRow label="Total to complete">
              <div style={{ display: "flex", gap: 8 }}>
                <Stepper value={progressTotal} setValue={setProgressTotal} min={1} max={500} />
                <input
                  type="text"
                  value={progressUnit}
                  onChange={(e) => setProgressUnit(e.target.value)}
                  placeholder="modules"
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    fontSize: 14,
                    borderRadius: 10,
                    border: "1px solid var(--line)",
                    background: "var(--bg-2)",
                    outline: "none",
                  }}
                />
              </div>
            </FormRow>
          )}

          {/* Color */}
          <FormRow label="Bloom color">
            <div style={{ display: "flex", gap: 10 }}>
              {Object.keys(PALETTES).map((p) => (
                <button key={p} onClick={() => setPaletteKey(p)} style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: PALETTES[p].petal,
                  border: paletteKey === p ? "2px solid var(--ink)" : "2px solid transparent",
                  boxShadow: paletteKey === p ? "0 0 0 2px var(--bg)" : "none",
                  position: "relative",
                  transition: "all .15s ease",
                }}>
                  <span style={{ position: "absolute", inset: "30%", borderRadius: "50%", background: PALETTES[p].center }} />
                </button>
              ))}
            </div>
          </FormRow>

          {/* Notes */}
          <FormRow label="Notes (optional)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="anything to remember…"
              rows={2}
              style={{
                width: "100%",
                padding: "10px 14px",
                fontSize: 13,
                fontFamily: "DM Sans, sans-serif",
                borderRadius: 10,
                border: "1px solid var(--line)",
                background: "var(--bg-2)",
                outline: "none",
                resize: "none",
              }}
            />
          </FormRow>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 28px", borderTop: "1px solid var(--line-2)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "var(--bg-2)" }}>
          <div style={{ fontSize: 12, color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 8 }}>
            <Plant kind={kind} growth={kind === "progress" ? 0.4 : 0.6} target={1} paletteKey={paletteKey} scale={0.55} />
            <span style={{ fontStyle: "italic" }} className="serif">preview</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={{ padding: "10px 16px", borderRadius: 999, border: "1px solid var(--line)", background: "transparent", color: "var(--ink-2)", fontSize: 13 }}>cancel</button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                padding: "10px 22px", borderRadius: 999,
                border: 0,
                background: canSubmit ? "var(--ink)" : "var(--line)",
                color: canSubmit ? "var(--bg)" : "var(--ink-3)",
                fontSize: 13, fontWeight: 500,
                boxShadow: canSubmit ? "0 2px 6px rgba(58,53,43,.15)" : "none",
              }}
            >
              Plant it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormRow({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-3)", fontWeight: 500, marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

function Stepper({ value, setValue, min, max }) {
  return (
    <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--line)", borderRadius: 8, background: "var(--bg)" }}>
      <button onClick={() => setValue(Math.max(min, value - 1))} style={{ width: 28, height: 32, border: 0, background: "transparent", color: "var(--ink-2)", fontSize: 16 }}>−</button>
      <span className="mono-num" style={{ minWidth: 26, textAlign: "center", fontSize: 14, fontWeight: 500 }}>{value}</span>
      <button onClick={() => setValue(Math.min(max, value + 1))} style={{ width: 28, height: 32, border: 0, background: "transparent", color: "var(--ink-2)", fontSize: 16 }}>+</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ListView — alternative tabular view of all tasks
// ─────────────────────────────────────────────────────────────────────────────

function ListView({ tasks, now, onSelect, onComplete, onProgress, onClearDone }) {
  // group by kind — one-offs first
  const groups = useMemo2(() => {
    const order = ["oneoff", "weekly", "daily", "monthly", "progress"];
    const map = {};
    tasks.forEach((t) => { (map[t.kind] = map[t.kind] || []).push(t); });
    return order.filter((k) => map[k]).map((k) => ({ kind: k, items: map[k] }));
  }, [tasks]);

  const labels = { weekly: "Daisies — weekly", daily: "Lavender — daily", monthly: "Tulips — monthly", progress: "Saplings — long progress", oneoff: "Sprouts — one-off" };

  const doneOneoffs = (groups.find(g => g.kind === "oneoff")?.items || []).filter((t) => t.done);

  return (
    <div style={{ maxWidth: 1100, margin: "10px auto 60px", padding: "0 36px", display: "flex", flexDirection: "column", gap: 30 }}>
      {groups.map(({ kind, items }) => {
        const isOneoff = kind === "oneoff";
        const doneCount = isOneoff ? items.filter(t => t.done).length : 0;
        // Sort: pending one-offs first, then done at the bottom
        const sorted = isOneoff
          ? [...items].sort((a, b) => (a.done ? 1 : 0) - (b.done ? 1 : 0))
          : items;
        return (
          <section key={kind}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid var(--line)", gap: 12 }}>
              <h3 className="serif" style={{ margin: 0, fontSize: 22, fontWeight: 500 }}>{labels[kind]}</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {isOneoff && doneCount > 0 && (
                  <button
                    onClick={onClearDone}
                    style={{
                      border: "1px solid var(--line)",
                      background: "rgba(255,255,255,.5)",
                      color: "var(--ink-2)",
                      padding: "5px 11px",
                      borderRadius: 999,
                      fontSize: 11.5,
                      letterSpacing: ".02em",
                      display: "flex", alignItems: "center", gap: 6,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--ink)"; e.currentTarget.style.color = "var(--bg)"; e.currentTarget.style.borderColor = "var(--ink)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.5)"; e.currentTarget.style.color = "var(--ink-2)"; e.currentTarget.style.borderColor = "var(--line)"; }}
                  >
                    <span style={{ fontSize: 13, lineHeight: 1 }}>↺</span>
                    clear {doneCount} done
                  </button>
                )}
                <span style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: ".06em", textTransform: "uppercase" }}>{items.length}</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
              {sorted.map((t) => <ListCard key={t.id} task={t} now={now} onSelect={onSelect} onComplete={onComplete} onProgress={onProgress} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ListCard({ task, now, onSelect, onComplete, onProgress }) {
  const palette = PALETTES[task.paletteKey] || PALETTES.rose;
  const isProgress = task.kind === "progress";
  const isOneoff = task.kind === "oneoff";
  const pCount = (!isProgress && !isOneoff) ? periodCompletions(task, now) : 0;

  return (
    <div onClick={() => onSelect(task.id)} style={{
      background: "rgba(255,255,255,.55)",
      border: "1px solid var(--line)",
      borderRadius: 14,
      padding: "14px 16px 14px 14px",
      display: "flex", gap: 12,
      alignItems: "stretch",
      transition: "all .15s ease",
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.85)"; e.currentTarget.style.borderColor = palette.leaf2; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.55)"; e.currentTarget.style.borderColor = "var(--line)"; }}
    >
      <div style={{ width: 50, flexShrink: 0, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
        <Plant kind={task.kind} growth={growthFor(task, now)} target={1} paletteKey={task.paletteKey} scale={0.6} done={task.done} />
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</div>
        <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>
          {isOneoff ? (task.done ? "completed" : "to do") :
           isProgress ? `${task.progress.current}/${task.progress.total} ${task.progress.unit || ""}` :
           `${pCount}/${task.target} this ${task.period}`}
        </div>
        {/* mini progress strip */}
        {!isOneoff && (
          <div style={{ marginTop: 8, height: 4, borderRadius: 2, background: "var(--line-2)", overflow: "hidden" }}>
            <div style={{
              width: `${isProgress ? (task.progress.current/task.progress.total)*100 : Math.min(100, (pCount/(task.target||1))*100)}%`,
              height: "100%",
              background: palette.petal,
            }} />
          </div>
        )}
      </div>
      {!isProgress ? (
        <button
          onClick={(e) => { e.stopPropagation(); isOneoff ? onComplete(task.id) : onComplete(task.id); }}
          style={{
            alignSelf: "center",
            width: 32, height: 32, borderRadius: "50%",
            border: `1.5px solid ${palette.leaf2}`,
            background: (isOneoff && task.done) ? palette.petal : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--ink)", fontSize: 14,
          }}
        >
          {isOneoff && task.done ? "✓" : "＋"}
        </button>
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); onProgress(task.id, +1); }}
          style={{
            alignSelf: "center",
            padding: "6px 12px", borderRadius: 999,
            border: `1px solid ${palette.leaf2}`,
            background: "transparent",
            fontSize: 12, color: "var(--ink)",
          }}
        >+1</button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HarvestView — end-of-week garden showing accumulated blooms
// ─────────────────────────────────────────────────────────────────────────────

function HarvestView({ tasks, now }) {
  // collect bloom events: for each completion in current week (and prior weeks summary)
  const weekStart = startOfWeek(now);
  const thisWeek = useMemo2(() => {
    const blooms = [];
    tasks.forEach((t) => {
      if (t.kind === "oneoff") {
        if (t.done && t.completions && t.completions.length > 0) {
          if (new Date(t.completions[0]) >= weekStart) blooms.push({ task: t, ts: t.completions[0] });
        }
        return;
      }
      (t.completions || []).forEach((ts) => {
        if (new Date(ts) >= weekStart) blooms.push({ task: t, ts });
      });
    });
    if (tasks.find(t => t.kind === "progress")) {
      tasks.filter(t => t.kind === "progress").forEach(t => {
        // give one bloom per ~5% of progress as a stand-in (decorative)
      });
    }
    return blooms;
  }, [tasks, weekStart]);

  // last 4 weeks summary
  const weekly = useMemo2(() => {
    const result = [];
    for (let i = 0; i < 6; i++) {
      const start = new Date(weekStart); start.setDate(weekStart.getDate() - 7 * i);
      const end = new Date(start); end.setDate(start.getDate() + 7);
      let count = 0;
      tasks.forEach((t) => {
        if (t.kind === "oneoff") {
          if (t.done && t.completions && t.completions[0]) {
            const d = new Date(t.completions[0]);
            if (d >= start && d < end) count++;
          }
          return;
        }
        (t.completions || []).forEach((ts) => {
          const d = new Date(ts);
          if (d >= start && d < end) count++;
        });
      });
      result.push({ start, end, count });
    }
    return result.reverse();
  }, [tasks, weekStart]);

  const targetThisWeek = tasks.reduce((s, t) => s + ((t.kind === "weekly") ? t.target : (t.kind === "daily") ? t.target * 7 : 0), 0);

  return (
    <div style={{ maxWidth: 1100, margin: "10px auto 60px", padding: "0 36px" }}>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, rgba(227,182,182,.25), rgba(232,212,156,.2), rgba(201,191,217,.25))",
        border: "1px solid var(--line)",
        borderRadius: 22,
        padding: "30px 36px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 30 }}>
          <div style={{ maxWidth: 540 }}>
            <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-2)", marginBottom: 8 }}>this week's harvest</div>
            <h2 className="serif" style={{ margin: 0, fontSize: 38, fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              <span className="mono-num">{thisWeek.length}</span>{" "}
              <span style={{ fontStyle: "italic" }}>blooms</span> gathered
              <span style={{ color: "var(--ink-3)" }}> from </span>
              <span className="mono-num">{tasks.length}</span> plants.
            </h2>
            <p style={{ marginTop: 14, fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6, maxWidth: 460 }}>
              Each bloom is a moment you tended your plot. Some weeks are abundant.
              Some weeks are quiet. The garden keeps growing either way.
            </p>
          </div>
          {/* big bouquet svg */}
          <Bouquet tasks={tasks} thisWeek={thisWeek} />
        </div>
      </div>

      {/* harvest grid: every bloom this week */}
      <Section2 label="Every bloom this week">
        {thisWeek.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--ink-3)" }}>
            <div className="serif" style={{ fontStyle: "italic", fontSize: 22, color: "var(--ink-2)", marginBottom: 6 }}>still seeded.</div>
            <div style={{ fontSize: 13 }}>your blooms will appear here as you tend.</div>
          </div>
        ) : (
          <div style={{
            background: "rgba(255,255,255,.45)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: 20,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))",
            gap: 14,
          }}>
            {thisWeek.map(({ task, ts }, i) => (
              <div key={i} title={`${task.title} · ${fmtShort(ts)}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, animation: `bloom-pop .5s ${i * 0.04}s both` }}>
                <HarvestedFlower paletteKey={task.paletteKey} spin={(i * 13) % 60} />
                <div style={{ fontSize: 9.5, color: "var(--ink-3)", letterSpacing: ".04em", textTransform: "uppercase" }}>{new Date(ts).toLocaleDateString("en-US", { weekday: "short" })}</div>
              </div>
            ))}
          </div>
        )}
      </Section2>

      {/* History */}
      <Section2 label="Six weeks back">
        <div style={{ background: "rgba(255,255,255,.45)", border: "1px solid var(--line)", borderRadius: 16, padding: 22 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 18, height: 140 }}>
            {weekly.map((w, i) => {
              const max = Math.max(...weekly.map(x => x.count), 8);
              const h = Math.max(8, (w.count / max) * 110);
              const isCurrent = i === weekly.length - 1;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <span className="mono-num serif" style={{ fontSize: 18, color: isCurrent ? "var(--ink)" : "var(--ink-2)", fontWeight: 500 }}>{w.count}</span>
                  <div style={{
                    width: "100%", maxWidth: 60,
                    height: h,
                    borderRadius: 8,
                    background: isCurrent
                      ? "linear-gradient(to top, var(--sage-deep), var(--sage))"
                      : "linear-gradient(to top, #B49E7A, #C9B79A)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,.3)",
                    position: "relative",
                  }}>
                    {/* tiny flower at top */}
                    {w.count > 0 && (
                      <div style={{ position: "absolute", left: "50%", top: -10, transform: "translateX(-50%) scale(.55)" }}>
                        <HarvestedFlower paletteKey={i % 2 === 0 ? "pink" : "butter"} spin={i * 20} />
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 10.5, color: "var(--ink-3)", letterSpacing: ".04em", textTransform: "uppercase" }}>
                    {isCurrent ? "this week" : fmtShort(w.start)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Section2>
    </div>
  );
}

function Section2({ label, children }) {
  return (
    <section style={{ marginTop: 30 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
        <h3 className="serif" style={{ margin: 0, fontSize: 22, fontWeight: 500 }}>{label}</h3>
      </div>
      {children}
    </section>
  );
}

function Bouquet({ tasks, thisWeek }) {
  // Render up to 12 flowers in an arc
  const flowers = thisWeek.slice(0, 14);
  if (flowers.length === 0) {
    return (
      <div style={{ width: 220, height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-3)" }}>
        <span className="serif" style={{ fontStyle: "italic", fontSize: 16 }}>—</span>
      </div>
    );
  }
  return (
    <div style={{ width: 240, height: 180, position: "relative", flexShrink: 0 }}>
      {flowers.map((f, i) => {
        const cols = 5;
        const row = Math.floor(i / cols);
        const col = i % cols;
        const x = 30 + col * 38 + (row % 2 === 0 ? 0 : 18);
        const y = 20 + row * 36;
        return (
          <div key={i} style={{
            position: "absolute", left: x, top: y,
            animation: `bloom-pop .6s ${i * 0.04}s both`,
          }}>
            <HarvestedFlower paletteKey={f.task.paletteKey} spin={(i * 22) % 60} />
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { TaskDetail, AddTask, ListView, HarvestView, computeStreak, ProgressDots });
