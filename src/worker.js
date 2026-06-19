const VERSION = "0.0.5-guardrail-proxy";
const UPSTREAM = "https://afo-mobile-visual-runtime.jaredtechfit.workers.dev";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};
const BASELINE = {
  id: "stable-cockpit-baseline",
  version: "0.0.4-stable-cockpit",
  protected_routes: ["/", "/studio", "/preview"],
  required_routes: ["/", "/studio", "/preview", "/health", "/llms.txt", "/mcp/tools", "/mcp/schema", "/mcp/call", "/api/sample-scene", "/api/compile", "/api/smoke", "/api/receipt", "/api/visual-contract", "/api/promotion-check", "/api/scene-spec"],
  required_nodes: ["Design System", "Scene Compiler", "MCP Tools", "Visual Receipt", "Three Runtime", "Data Adapter", "Asset Adapter", "App Factory"],
  required_controls: ["Brake", "Reset", "Boost"],
  required_panels: ["Studio", "Tools", "Schema", "Sample", "Receipt"],
  forbidden_nodes: ["London", "Tokyo", "Dana Point", "Long Beach", "Los Angeles", "Sydney"]
};
const SCENE = {
  name: "Dogfoodma Stable Cockpit",
  version: "0.0.4-stable-cockpit",
  theme: "black_glass_gold",
  layout: "spherical_constellation",
  hud: "luxury_cockpit",
  controls: "mobile_fly_with_snap_focus",
  mobile: {
    pixelRatioCap: 2,
    targetFps: 45,
    lowPowerMode: true,
    maxObjects: 180
  },
  data: {
    source: "inline",
    binding: "dogfoodma:stable-cockpit",
    items: [
      { id: "design_system", title: "Design System", cluster: "Dogfoodma" },
      { id: "scene_compiler", title: "Scene Compiler", cluster: "Dogfoodma" },
      { id: "mcp_tools", title: "MCP Tools", cluster: "Agents" },
      { id: "visual_receipt", title: "Visual Receipt", cluster: "Receipts" },
      { id: "three_runtime", title: "Three Runtime", cluster: "Renderer" },
      { id: "data_adapter", title: "Data Adapter", cluster: "Data" },
      { id: "asset_adapter", title: "Asset Adapter", cluster: "Assets" },
      { id: "app_factory", title: "App Factory", cluster: "Next" }
    ]
  }
};
function json(value, status = 200) {
  return Response.json(value, { status, headers: CORS });
}
function nodeTitles() {
  return SCENE.data.items.map((item) => item.title);
}
function visualContract() {
  const actual = nodeTitles();
  const missing = BASELINE.required_nodes.filter((node) => !actual.includes(node));
  const forbidden = BASELINE.forbidden_nodes.filter((node) => actual.includes(node));
  const ok = missing.length === 0 && forbidden.length === 0;
  return {
    ok,
    sandbox_version: VERSION,
    baseline_version: BASELINE.version,
    upstream: UPSTREAM,
    visual_shell: "proxied-stable-cockpit",
    production_mutated: false,
    protected_routes: BASELINE.protected_routes,
    required_routes: BASELINE.required_routes,
    required_nodes: BASELINE.required_nodes,
    actual_nodes: actual,
    missing_nodes: missing,
    forbidden_nodes_present: forbidden,
    required_controls: BASELINE.required_controls,
    required_panels: BASELINE.required_panels
  };
}
function promotionCheck() {
  const contract = visualContract();
  return {
    ok: contract.ok,
    eligible: contract.ok,
    sandbox_version: VERSION,
    baseline_version: BASELINE.version,
    production_mutated: false,
    manual_approval_required: true,
    endpoint_checks_required: ["/health", "/api/smoke", "/api/visual-contract", "/api/promotion-check", "/api/scene-spec", "/mcp/tools", "/mcp/schema"],
    manual_checks_required: ["cockpit_renders", "drag_fly_works", "brake_works", "boost_works", "reset_works", "speed_label_updates", "crosshair_targeting_works", "tap_select_drawer_works", "route_panels_work"],
    checks: {
      visual_contract: contract.ok,
      missing_nodes: contract.missing_nodes.length,
      forbidden_nodes_present: contract.forbidden_nodes_present.length > 0,
      production_mutated: false
    },
    decision: contract.ok ? "manual_review_required" : "blocked"
  };
}
async function proxy(req) {
  const url = new URL(req.url);
  const upstream = new URL(url.pathname + url.search, UPSTREAM);
  const init = {
    method: req.method,
    headers: req.headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : req.body,
    redirect: "follow"
  };
  return fetch(new Request(upstream.toString(), init));
}
export default {
  async fetch(req) {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
    const url = new URL(req.url);
    if (url.pathname === "/api/visual-contract") return json(visualContract());
    if (url.pathname === "/api/promotion-check") return json(promotionCheck());
    if (url.pathname === "/api/scene-spec") return json({ ok: true, sandbox_version: VERSION, baseline: BASELINE, scene: SCENE });
    return proxy(req);
  }
};
