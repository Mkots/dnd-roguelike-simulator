import { j as jsxRuntimeExports } from './jsx-runtime-BTSpV5jZ.js';
import { C as Coins, T as Trophy, Z as Zap } from './lucide-react-CUqtwrv2.js';
import './index-BicV1jb_.js';

function PlayerStats({ playerState }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-6 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "size-4 text-yellow-400" }), label: "Gold", value: playerState.gold }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "size-4 text-amber-400" }), label: "Best run", value: playerState.bestRun }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "size-4 text-muted-foreground" }), label: "Runs", value: playerState.totalRuns })
  ] });
}
function Stat({ icon, label, value }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-muted-foreground", children: [
      icon,
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-wide", children: label })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-semibold", children: value })
  ] });
}

export { PlayerStats };
//# sourceMappingURL=PlayerStats-y2fyDmd3.js.map
