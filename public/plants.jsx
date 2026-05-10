// plants.jsx — flower / plant SVG primitives.
// Each plant takes (growth: 0..1, target: 0..1, accent, kind, sway).
// Built from circles + thin rects to keep the look minimal & paper-cut.

const PALETTES = {
  rose:     { petal: "var(--pink)",      petal2: "#EFC9C9", center: "#E8D49C", leaf: "var(--sage)",      leaf2: "var(--sage-deep)" },
  butter:   { petal: "var(--butter)",    petal2: "#F0DEAA", center: "#D9A593", leaf: "var(--sage)",      leaf2: "var(--sage-deep)" },
  lavender: { petal: "var(--lavender)",  petal2: "#D6CEE2", center: "#A99FBE", leaf: "var(--sage)",      leaf2: "var(--sage-deep)" },
  sky:      { petal: "var(--sky)",       petal2: "#C9D7DD", center: "#E8D49C", leaf: "var(--sage)",      leaf2: "var(--sage-deep)" },
  terra:    { petal: "var(--terracotta)",petal2: "#E0B5A4", center: "#3A352B", leaf: "var(--sage)",      leaf2: "var(--sage-deep)" },
  sage:     { petal: "#B6C7B5",          petal2: "#A2B6A1", center: "#E8D49C", leaf: "var(--sage)",      leaf2: "var(--sage-deep)" },
};

// ---- Stem helper ------------------------------------------------------------

const Stem = ({ height, color = "var(--sage-deep)" }) => (
  <rect x="-0.7" y={-height} width="1.4" height={height} rx="0.7" fill={color} />
);

// ---- Leaf (a teardrop made of two circles) ---------------------------------

const Leaf = ({ x, y, size = 5, side = 1, color }) => (
  <g transform={`translate(${x},${y}) rotate(${side * 35}) scale(${size/5})`}>
    <ellipse cx="0" cy="-3" rx="2.6" ry="4.2" fill={color} />
    <ellipse cx="-0.4" cy="-3" rx="0.5" ry="3.4" fill="rgba(0,0,0,.08)" />
  </g>
);

// =============================================================================
// DAISY — for weekly recurring (e.g. gym 4x/week)
// growth maps to petals appearing one at a time around the center
// =============================================================================
function Daisy({ growth = 1, target = 1, palette = PALETTES.rose, swayClass = "sway", scale = 1 }) {
  const stemH = 38 + 12 * Math.min(1, growth + 0.1);
  const totalPetals = 8;
  // petals shown = ceil(growth * totalPetals); show min 0
  const shownPetals = Math.max(0, Math.round(growth * totalPetals));
  const petalSize = 4 + 1.2 * scale;
  const blooming = growth >= target && target > 0;

  return (
    <svg width={64*scale} height={92*scale} viewBox="-22 -68 44 90" overflow="visible" style={{ display: "block" }}>
      {/* leaves on stem */}
      <g transform={`translate(0, ${22 - stemH * 0.45})`}>
        <Leaf x="0" y="0" size="6" side="-1" color={palette.leaf2} />
      </g>
      <g transform={`translate(0, ${22 - stemH * 0.7})`}>
        <Leaf x="0" y="0" size="5" side="1" color={palette.leaf} />
      </g>
      <g transform={`translate(0, ${22})`}>
        <Stem height={stemH} />
      </g>

      {/* flower head */}
      <g transform={`translate(0, ${22 - stemH})`} style={{ animation: `${swayClass} 5.5s ease-in-out infinite`, transformOrigin: "center" }}>
        {/* petals */}
        {Array.from({ length: shownPetals }).map((_, i) => {
          const ang = (i / totalPetals) * Math.PI * 2 - Math.PI / 2;
          const r = 6.2;
          return (
            <circle
              key={i}
              cx={Math.cos(ang) * r}
              cy={Math.sin(ang) * r}
              r={petalSize}
              fill={i % 2 === 0 ? palette.petal : palette.petal2}
              style={{ animation: blooming ? `bloom-pop .5s ${i * 0.04}s both` : undefined }}
            />
          );
        })}
        {/* center */}
        {shownPetals > 0 && (
          <circle cx="0" cy="0" r={3 + (blooming ? 0.6 : 0)} fill={palette.center} />
        )}
        {/* seed (no petals) */}
        {shownPetals === 0 && (
          <g>
            <ellipse cx="0" cy="-1" rx="2" ry="3" fill={palette.leaf2} />
            <ellipse cx="-2" cy="-2" rx="1.5" ry="2.4" fill={palette.leaf} transform="rotate(-30, -2, -2)" />
            <ellipse cx="2" cy="-2" rx="1.5" ry="2.4" fill={palette.leaf} transform="rotate(30, 2, -2)" />
          </g>
        )}
      </g>
    </svg>
  );
}

// =============================================================================
// LAVENDER — for daily habits, frequent tasks
// growth maps to dots up the stalk (small buds)
// =============================================================================
function LavenderPlant({ growth = 1, target = 1, palette = PALETTES.lavender, swayClass = "sway-2", scale = 1 }) {
  const stemH = 50 + 8 * Math.min(1, growth);
  const buds = 7;
  const shown = Math.max(0, Math.round(growth * buds));

  return (
    <svg width={48*scale} height={92*scale} viewBox="-16 -72 32 90" overflow="visible">
      <g transform="translate(0, 22)">
        <Stem height={stemH} />
      </g>
      {/* leaves */}
      <g transform={`translate(0, ${22 - stemH * 0.4})`}>
        <Leaf x="-1" y="0" size="5" side="-1" color={palette.leaf2} />
        <Leaf x="1" y="2" size="4" side="1" color={palette.leaf} />
      </g>
      {/* buds going up */}
      <g style={{ animation: `${swayClass} 6s ease-in-out infinite`, transformOrigin: `0 ${22 - stemH * 0.3}px` }}>
        {Array.from({ length: shown }).map((_, i) => {
          const yy = 22 - stemH + 4 + i * 5;
          const off = (i % 2 === 0 ? -2.2 : 2.2);
          return (
            <ellipse
              key={i}
              cx={off}
              cy={yy}
              rx="2"
              ry="2.6"
              fill={i % 3 === 0 ? palette.petal2 : palette.petal}
              style={{ animation: `bloom-pop .45s ${i * 0.04}s both` }}
            />
          );
        })}
        {shown === 0 && (
          <ellipse cx="0" cy={22 - stemH + 6} rx="1.6" ry="2.2" fill={palette.leaf2} />
        )}
      </g>
    </svg>
  );
}

// =============================================================================
// TULIP — for monthly recurring (less frequent, single big bloom)
// =============================================================================
function Tulip({ growth = 1, target = 1, palette = PALETTES.terra, swayClass = "sway", scale = 1 }) {
  const stemH = 44 + 10 * Math.min(1, growth);
  const open = Math.max(0, Math.min(1, growth)); // 0..1 how open
  const bloomed = growth >= target && target > 0;

  return (
    <svg width={48*scale} height={92*scale} viewBox="-16 -72 32 90" overflow="visible">
      <g transform={`translate(0, ${22 - stemH * 0.45})`}>
        <Leaf x="-1" y="0" size="7" side="-1" color={palette.leaf2} />
      </g>
      <g transform={`translate(0, ${22 - stemH * 0.65})`}>
        <Leaf x="1" y="0" size="6" side="1" color={palette.leaf} />
      </g>
      <g transform="translate(0, 22)">
        <Stem height={stemH} />
      </g>

      {/* tulip cup */}
      <g
        transform={`translate(0, ${22 - stemH})`}
        style={{ animation: `${swayClass} 5s ease-in-out infinite`, transformOrigin: "center" }}
      >
        {open === 0 ? (
          <ellipse cx="0" cy="-2" rx="2.2" ry="3.2" fill={palette.leaf2} />
        ) : (
          <g style={{ animation: bloomed ? `bloom-pop .5s both` : undefined, transformOrigin: "0 0" }}>
            {/* back petals */}
            <ellipse cx={-3*open} cy={-3} rx={3*open + 1} ry={6} fill={palette.petal2} transform={`rotate(${-15*open}, ${-3*open}, -3)`} />
            <ellipse cx={3*open}  cy={-3} rx={3*open + 1} ry={6} fill={palette.petal2} transform={`rotate(${15*open}, ${3*open}, -3)`} />
            {/* front petal */}
            <ellipse cx="0" cy="-2" rx={3.2} ry={6} fill={palette.petal} />
            {/* highlight */}
            <ellipse cx="-0.8" cy="-3" rx="0.5" ry="3" fill="rgba(255,255,255,.35)" />
          </g>
        )}
      </g>
    </svg>
  );
}

// =============================================================================
// SPROUT — for one-off tasks. Small, tidy. Becomes a single flower when done.
// =============================================================================
function Sprout({ growth = 0, target = 1, palette = PALETTES.butter, swayClass = "sway-2", scale = 1, done = false }) {
  const stemH = done ? 28 : 12 + 12 * growth;
  return (
    <svg width={42*scale} height={64*scale} viewBox="-14 -48 28 62" overflow="visible">
      <g transform="translate(0, 14)">
        <Stem height={stemH} />
      </g>
      {!done ? (
        <g transform={`translate(0, ${14 - stemH * 0.6})`}>
          <Leaf x="-1" y="0" size={4 + 2 * growth} side="-1" color={palette.leaf2} />
          <Leaf x="1" y="-1" size={4 + 2 * growth} side="1" color={palette.leaf} />
        </g>
      ) : (
        <g transform={`translate(0, ${14 - stemH})`} style={{ animation: `${swayClass} 5.5s ease-in-out infinite`, transformOrigin: "center" }}>
          {/* small 5-petal flower */}
          {[0,1,2,3,4].map((i) => {
            const ang = (i / 5) * Math.PI * 2 - Math.PI / 2;
            return (
              <circle
                key={i}
                cx={Math.cos(ang) * 4.5}
                cy={Math.sin(ang) * 4.5}
                r="3.2"
                fill={i % 2 === 0 ? palette.petal : palette.petal2}
                style={{ animation: `bloom-pop .5s ${i * 0.05}s both` }}
              />
            );
          })}
          <circle cx="0" cy="0" r="2.1" fill={palette.center} />
        </g>
      )}
    </svg>
  );
}

// =============================================================================
// SAPLING — for long-progress tasks (course, book). Tall stalk that grows
// taller as % progress increases, with leaf pairs at intervals.
// =============================================================================
function Sapling({ growth = 0, palette = PALETTES.sage, swayClass = "sway", scale = 1 }) {
  // growth 0..1; stem grows from 18 to 100
  const stemH = 18 + 82 * growth;
  // a leaf pair every 14 units of stem; only show those below current top
  const totalPairs = 6;
  const shownPairs = Math.floor((stemH - 18) / 14) + 1;
  const palette2 = palette;

  return (
    <svg width={56*scale} height={130*scale} viewBox="-18 -110 36 130" overflow="visible">
      <g transform="translate(0, 20)" style={{ animation: `${swayClass} 7s ease-in-out infinite`, transformOrigin: "0 20px" }}>
        <Stem height={stemH} color={palette2.leaf2} />
        {Array.from({ length: Math.min(shownPairs, totalPairs) }).map((_, i) => {
          const yy = -10 - i * 14;
          const side = i % 2 === 0 ? 1 : -1;
          return (
            <g key={i} style={{ animation: `bloom-pop .5s ${i * 0.06}s both` }}>
              <Leaf x={side * 2} y={yy} size="6" side={side} color={i % 2 === 0 ? palette2.leaf : palette2.leaf2} />
              <Leaf x={-side * 2} y={yy + 2} size="4.5" side={-side} color={palette2.leaf2} />
            </g>
          );
        })}
        {/* tip bud / blossom when nearly done */}
        {growth > 0.85 && (
          <g transform={`translate(0, ${-stemH + 4})`} style={{ animation: `bloom-pop .6s both` }}>
            <circle cx="0" cy="0" r="3.5" fill={palette.petal} />
            <circle cx="-2" cy="-1" r="2.5" fill={palette.petal2} />
            <circle cx="2" cy="-1" r="2.5" fill={palette.petal2} />
            <circle cx="0" cy="0" r="1.4" fill={palette.center} />
          </g>
        )}
      </g>
    </svg>
  );
}

// =============================================================================
// Plant — switches species based on kind
// =============================================================================
function Plant({ kind, growth, target, paletteKey, scale = 1, done = false, swayClass = "sway" }) {
  const palette = PALETTES[paletteKey] || PALETTES.rose;
  switch (kind) {
    case "weekly":  return <Daisy   growth={growth} target={target} palette={palette} scale={scale} swayClass={swayClass} />;
    case "daily":   return <LavenderPlant growth={growth} target={target} palette={palette} scale={scale} swayClass={swayClass} />;
    case "monthly": return <Tulip   growth={growth} target={target} palette={palette} scale={scale} swayClass={swayClass} />;
    case "oneoff":  return <Sprout  growth={growth} target={target} palette={palette} scale={scale} swayClass={swayClass} done={done} />;
    case "progress":return <Sapling growth={growth}                  palette={palette} scale={scale} swayClass={swayClass} />;
    default: return null;
  }
}

// Tiny "harvested flower" for the end-of-week garden — just a head, no stem
function HarvestedFlower({ paletteKey = "rose", spin = 0 }) {
  const palette = PALETTES[paletteKey] || PALETTES.rose;
  return (
    <svg width="36" height="36" viewBox="-12 -12 24 24" style={{ display: "block" }}>
      <g transform={`rotate(${spin})`}>
        {[0,1,2,3,4,5,6,7].map((i) => {
          const ang = (i / 8) * Math.PI * 2;
          return (
            <circle
              key={i}
              cx={Math.cos(ang) * 6}
              cy={Math.sin(ang) * 6}
              r="4.5"
              fill={i % 2 === 0 ? palette.petal : palette.petal2}
            />
          );
        })}
        <circle cx="0" cy="0" r="3.2" fill={palette.center} />
      </g>
    </svg>
  );
}

Object.assign(window, { Plant, HarvestedFlower, PALETTES, Daisy, Tulip, Sprout, Sapling, LavenderPlant });
