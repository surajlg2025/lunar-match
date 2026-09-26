import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Beaker,
  Check,
  ChevronRight,
  CircleHelp,
  CloudUpload,
  Command,
  Database,
  Download,
  FileJson,
  FileImage,
  FlaskConical,
  Gauge,
  GitCompareArrows,
  Info,
  Layers3,
  Link2,
  LockKeyhole,
  Maximize2,
  Menu,
  Orbit,
  Play,
  RotateCcw,
  ScanLine,
  Satellite,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  SquareArrowOutUpRight,
  Upload,
  X,
} from "lucide-react";

type Tab = "compare" | "benchmark" | "method";
type CaseKey = "ohrc-tmc2" | "ohrc-stereo" | "iirs-control";
type Detector = "Lunar Fingerprint" | "SIFT baseline" | "ORB baseline";

type DemoCase = {
  label: string;
  subtitle: string;
  sensorA: string;
  sensorB: string;
  scene: string;
  sourceSize: string;
  targetSize: string;
  verified: number;
  candidates: number;
  rejected: number;
  ratio: string;
  error: string;
  confidence: string;
  scale: string;
  status: "DEMO CONSENSUS" | "REVIEW" | "REJECTED";
  note: string;
  terrain: "warm" | "cool" | "control";
};

const cases: Record<CaseKey, DemoCase> = {
  "ohrc-tmc2": {
    label: "OHRC → TMC-2",
    subtitle: "cross-sensor / scale transfer",
    sensorA: "OHRC",
    sensorB: "TMC-2",
    scene: "Aristarchus plateau · tile 07",
    sourceSize: "4,096 × 4,096 px",
    targetSize: "1,024 × 1,024 px",
    verified: 128,
    candidates: 412,
    rejected: 284,
    ratio: "31.1%",
    error: "0.82 px",
    confidence: "0.76",
    scale: "0.238×",
    status: "DEMO CONSENSUS",
    note: "A cross-sensor structural signal survives normalization and agrees with one similarity transform. This is a documented demo case, not a dataset-wide accuracy claim.",
    terrain: "warm",
  },
  "ohrc-stereo": {
    label: "OHRC stereo pair",
    subtitle: "same terrain / different illumination",
    sensorA: "OHRC-A",
    sensorB: "OHRC-B",
    scene: "South polar rim · stereo strip",
    sourceSize: "2,048 × 3,072 px",
    targetSize: "2,048 × 3,072 px",
    verified: 186,
    candidates: 468,
    rejected: 282,
    ratio: "39.7%",
    error: "0.54 px",
    confidence: "0.88",
    scale: "1.004×",
    status: "DEMO CONSENSUS",
    note: "The stereo pair shows the strongest geometric agreement in the demo library. Illumination changes are visible, but the ridge and crater structure remains coherent.",
    terrain: "cool",
  },
  "iirs-control": {
    label: "IIRS → TMC-2",
    subtitle: "non-overlap control / negative pair",
    sensorA: "IIRS",
    sensorB: "TMC-2",
    scene: "Control pair · no reference overlap",
    sourceSize: "512 × 512 px",
    targetSize: "1,024 × 1,024 px",
    verified: 4,
    candidates: 188,
    rejected: 184,
    ratio: "2.1%",
    error: "18.40 px",
    confidence: "0.08",
    scale: "—",
    status: "REJECTED",
    note: "The negative control is rejected because candidate points do not agree on a stable transformation. Conservative rejection is a core safety behavior.",
    terrain: "control",
  },
};

const pointSets = {
  warm: [
    [17, 28], [23, 64], [31, 42], [38, 73], [44, 22], [49, 55], [55, 35], [63, 66], [72, 26], [78, 51], [85, 75], [90, 38], [27, 84], [58, 86], [69, 60], [42, 48], [82, 20], [13, 50],
  ],
  cool: [
    [15, 22], [21, 57], [29, 78], [35, 35], [41, 63], [48, 26], [53, 73], [60, 46], [67, 19], [72, 61], [79, 37], [87, 70], [24, 89], [45, 86], [65, 82], [83, 24], [11, 42], [57, 15],
  ],
  control: [[20, 28], [44, 60], [71, 33], [81, 78]],
};

function MiniBadge({ children, tone = "cyan" }: { children: React.ReactNode; tone?: "cyan" | "amber" | "red" | "slate" }) {
  return <span className={`mini-badge ${tone}`}>{children}</span>;
}

function MetricCard({ label, value, detail, tone = "cyan", icon: Icon }: { label: string; value: string | number; detail: string; tone?: "cyan" | "mint" | "amber" | "red"; icon: typeof Gauge }) {
  return (
    <div className={`metric-card ${tone}`}>
      <div className="metric-card-top"><span>{label}</span><Icon size={15} /></div>
      <div className="metric-value">{value}</div>
      <div className="metric-detail">{detail}</div>
    </div>
  );
}

function TerrainView({ side, demo, image, showPoints, showGrid, showRejected }: { side: "A" | "B"; demo: DemoCase; image?: string | null; showPoints: boolean; showGrid: boolean; showRejected: boolean }) {
  const points = pointSets[demo.terrain];
  const accent = demo.terrain === "warm" ? "#72e9dc" : demo.terrain === "cool" ? "#b4d6ff" : "#e99393";
  const base = demo.terrain === "warm" ? "#83694a" : demo.terrain === "cool" ? "#455b7a" : "#634f63";
  return (
    <div className={`terrain-view terrain-${demo.terrain}`}>
      {image ? <img className="uploaded-terrain" src={image} alt={`${side} uploaded lunar image`} /> : null}
      <svg className={`terrain-svg ${image ? "has-upload" : ""}`} viewBox="0 0 560 320" role="img" aria-label={`${side} synthetic lunar terrain preview`}>
        <defs>
          <radialGradient id={`surface-${side}-${demo.terrain}`} cx="48%" cy="40%" r="80%">
            <stop offset="0" stopColor={base} stopOpacity=".94" />
            <stop offset=".55" stopColor="#27384c" stopOpacity=".86" />
            <stop offset="1" stopColor="#0c1524" stopOpacity=".98" />
          </radialGradient>
          <filter id={`soft-${side}`}><feGaussianBlur stdDeviation="7" /></filter>
          <pattern id={`grid-${side}`} width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#9feee6" strokeOpacity=".18" strokeWidth=".6" /></pattern>
        </defs>
        <rect width="560" height="320" fill={`url(#surface-${side}-${demo.terrain})`} />
        <g opacity=".22" filter={`url(#soft-${side})`} fill={demo.terrain === "control" ? "#d79abd" : "#d8bb82"}>
          <ellipse cx={side === "A" ? 168 : 195} cy="130" rx="110" ry="42" transform="rotate(-16 168 130)" />
          <ellipse cx="397" cy="228" rx="146" ry="43" transform="rotate(19 397 228)" />
          <ellipse cx="320" cy="76" rx="88" ry="28" transform="rotate(-25 320 76)" />
        </g>
        <g fill="none" stroke="#d9c79b" strokeOpacity=".42">
          <ellipse cx={side === "A" ? 157 : 182} cy="129" rx="74" ry="39" strokeWidth="4" />
          <ellipse cx={side === "A" ? 157 : 182} cy="129" rx="53" ry="26" strokeWidth="2" />
          <ellipse cx="406" cy="228" rx="48" ry="23" strokeWidth="3" />
          <ellipse cx="406" cy="228" rx="28" ry="13" strokeWidth="1.5" />
          <path d="M18 250 C85 211 127 239 184 218 S283 185 344 214 S448 183 552 203" strokeWidth="3" />
          <path d="M15 267 C86 229 129 257 190 238 S279 208 353 237 S451 209 557 225" strokeWidth="1.3" />
          <path d="M266 19 C245 63 268 88 244 122 S258 178 237 212 S251 278 220 316" strokeWidth="2" />
          <path d="M334 0 C361 42 347 81 376 110 S363 165 393 202 S380 258 411 320" strokeWidth="1.2" />
        </g>
        <g fill="#f0d9a0" fillOpacity=".72">
          <circle cx="64" cy="92" r="7" /><circle cx="276" cy="172" r="6" /><circle cx="478" cy="94" r="9" /><circle cx="487" cy="274" r="5" /><circle cx="342" cy="266" r="4" />
        </g>
        {showGrid ? <rect width="560" height="320" fill={`url(#grid-${side})`} /> : null}
        {showPoints ? <g>{points.map(([x, y], index) => <g key={`${side}-${index}`} transform={`translate(${x * 5.6} ${y * 3.2})`}>
          <circle r={showRejected && index > points.length - 5 ? 4 : 3.4} fill={showRejected && index > points.length - 5 ? "#ed8e8e" : accent} fillOpacity=".24" />
          <circle r="1.8" fill={showRejected && index > points.length - 5 ? "#ed8e8e" : accent} />
          <path d="M-7 0H7M0-7V7" stroke={showRejected && index > points.length - 5 ? "#ed8e8e" : accent} strokeOpacity=".68" strokeWidth=".7" />
        </g>)}</g> : null}
      </svg>
      <div className="terrain-overlay" />
      <div className="terrain-label"><span>{side}</span><b>{side === "A" ? demo.sensorA : demo.sensorB}</b><small>{side === "A" ? "reference observation" : "query observation"}</small></div>
      <div className="terrain-coords">{side === "A" ? "18.41° N · 29.67° W" : "18.41° N · 29.67° W"}</div>
      <div className="terrain-scale"><span /><span /><span /> 5 km</div>
    </div>
  );
}

function MiniPipeline({ stage }: { stage: number }) {
  const nodes = ["Ingest", "Normalize", "Fingerprint", "Verify", "Report"];
  return <div className="mini-pipeline">{nodes.map((node, index) => <div key={node} className={index < stage ? "done" : index === stage ? "active" : ""}><span>{index < stage ? <Check size={11} /> : String(index + 1).padStart(2, "0")}</span><b>{node}</b>{index < nodes.length - 1 ? <i /> : null}</div>)}</div>;
}

function BenchmarkView({ selectedCase }: { selectedCase: DemoCase }) {
  const rows = [
    { name: "Lunar Fingerprint", matches: "128", inlier: "31.1%", error: "0.82 px", decision: "DEMO CONSENSUS", tone: "best" },
    { name: "SIFT + ratio test", matches: "94", inlier: "22.8%", error: "1.67 px", decision: "REVIEW", tone: "mid" },
    { name: "ORB + ratio test", matches: "61", inlier: "14.2%", error: "2.94 px", decision: "REVIEW", tone: "low" },
    { name: "Brightness correlation", matches: "—", inlier: "—", error: "not geometric", decision: "NOT VERIFIED", tone: "bad" },
  ];
  return <section className="benchmark-view">
    <div className="section-intro"><div><div className="eyebrow">03 / BENCHMARK CONSOLE</div><h2>Evidence over appearance.</h2><p>Compare the proposed structure-first pipeline with classical baselines. Values below describe the selected demo pair and are not dataset-wide accuracy claims.</p></div><MiniBadge tone="amber"><Info size={12} /> TEST CONDITION: {selectedCase.sensorA} → {selectedCase.sensorB}</MiniBadge></div>
    <div className="benchmark-hero-grid"><div className="benchmark-score-card"><div className="card-overline"><BarChart3 size={15} /> SELECTED CASE SCORECARD</div><div className="score-ring"><div><strong>{selectedCase.confidence}</strong><span>confidence</span></div></div><div className="score-caption"><b>Geometry survives</b><span>after cross-modal normalization</span></div><div className="score-foot"><span>support</span><b>{selectedCase.verified} inliers</b><span>residual</span><b>{selectedCase.error}</b></div></div><div className="chart-card"><div className="card-overline"><Activity size={15} /> INLIER RATIO BY METHOD</div><div className="bar-chart">{[{ n: "Lunar Fingerprint", v: 78, value: "31.1%", best: true }, { n: "SIFT", v: 57, value: "22.8%" }, { n: "ORB", v: 36, value: "14.2%" }, { n: "Brightness", v: 5, value: "n/a" }].map((item) => <div className="bar-row" key={item.n}><span>{item.n}</span><div><i style={{ width: `${item.v}%` }} className={item.best ? "best" : ""} /></div><b>{item.value}</b></div>)}</div><div className="chart-note"><span className="legend-dot best" /> structural support <span className="legend-dot" /> baseline comparator</div></div></div>
    <div className="table-card"><div className="table-head"><div><div className="card-overline"><GitCompareArrows size={15} /> BASELINE MATRIX</div><p>Same input pair · same candidate pool · geometric verification enabled where applicable.</p></div><button className="small-button"><Download size={13} /> Export benchmark</button></div><div className="benchmark-table"><div className="table-row table-labels"><span>METHOD</span><span>INLIERS</span><span>INLIER RATIO</span><span>REPROJECTION</span><span>DECISION</span></div>{rows.map((row) => <div className={`table-row ${row.tone}`} key={row.name}><strong>{row.name}</strong><span>{row.matches}</span><span>{row.inlier}</span><span>{row.error}</span><span><MiniBadge tone={row.tone === "best" ? "cyan" : row.tone === "bad" ? "red" : "amber"}>{row.decision}</MiniBadge></span></div>)}</div></div>
  </section>;
}

function MethodView() {
  const stages = [
    ["01", "Radiometric normalization", "Percentile clipping and local gradient emphasis suppress global brightness shifts without pretending to reconstruct missing information."],
    ["02", "Lunar Fingerprint", "Crater rims, ridge intersections, edges and spatial arrangements become repeatable structural signatures across sensor modalities."],
    ["03", "Correspondence matching", "Descriptor distances are ranked with mutual nearest-neighbour and ratio-test filters to remove ambiguous candidates."],
    ["04", "Geometric verification", "RANSAC estimates a similarity or affine model. Inliers are kept only when one physically plausible transform explains them."],
    ["05", "Evidence report", "The result is a decision record: inliers, rejected matches, reprojection residual, confidence, conditions and exportable provenance."],
  ];
  return <section className="method-view"><div className="section-intro"><div><div className="eyebrow">04 / METHOD NOTEBOOK</div><h2>Structure before similarity.</h2><p>The differentiator is not a larger number. It is a more defensible chain of evidence from image input to geometric decision.</p></div><MiniBadge tone="cyan"><Sparkles size={12} /> LUNAR FINGERPRINT / v0.4</MiniBadge></div><div className="method-flow">{stages.map(([number, title, description], index) => <div className="method-stage" key={number}><div className="stage-number">{number}</div><div className="stage-content"><div className="stage-line"><span /><span /><span /></div><h3>{title}</h3><p>{description}</p></div>{index < stages.length - 1 ? <ChevronRight className="stage-arrow" size={17} /> : null}</div>)}</div><div className="method-columns"><div className="notebook-card"><div className="card-overline"><FlaskConical size={15} /> AI / ML CONTRIBUTION</div><h3>Automated structural representation and confidence ranking</h3><p>The prototype separates the model contribution from the interface: computer vision extracts repeatable local signatures, a matcher ranks candidate correspondences, and RANSAC verifies global geometry. A learned or CNSF-inspired descriptor can replace the local descriptor once verified training pairs are available.</p><div className="code-note"><span>INPUT</span><code>OHRC tile + TMC-2 tile</code><span>OUTPUT</span><code>inliers + transform + audit trail</code></div></div><div className="notebook-card"><div className="card-overline"><Database size={15} /> REPRODUCIBILITY CHECK</div><div className="repro-list"><div><Check size={14} /><span>Sensor pair recorded</span><b>yes</b></div><div><Check size={14} /><span>Preprocessing recorded</span><b>yes</b></div><div><Check size={14} /><span>Baseline selected</span><b>yes</b></div><div><Check size={14} /><span>Reference transform</span><b>pending</b></div><div><Check size={14} /><span>Dataset-wide accuracy</span><b>pending</b></div></div></div></div></section>;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("compare");
  const [caseKey, setCaseKey] = useState<CaseKey>("ohrc-tmc2");
  const [detector, setDetector] = useState<Detector>("Lunar Fingerprint");
  const [ratio, setRatio] = useState(0.72);
  const [showPoints, setShowPoints] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [showRejected, setShowRejected] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(100);
  const [notice, setNotice] = useState("Demo pair loaded. Review test conditions before interpreting the score.");
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [targetImage, setTargetImage] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState("ohrc_aristarchus_tile07.tif");
  const [targetName, setTargetName] = useState("tmc2_aristarchus_tile07.tif");
  const [mobileNav, setMobileNav] = useState(false);
  const sourceInput = useRef<HTMLInputElement>(null);
  const targetInput = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<number | null>(null);
  const demo = cases[caseKey];
  const points = pointSets[demo.terrain];
  const acceptedCount = useMemo(() => detector === "Lunar Fingerprint" ? demo.verified : detector === "SIFT baseline" ? Math.max(38, demo.verified - 34) : Math.max(21, demo.verified - 67), [demo, detector]);

  useEffect(() => () => { if (intervalRef.current) window.clearInterval(intervalRef.current); }, []);

  const loadCase = (key: CaseKey) => {
    setCaseKey(key); setSourceImage(null); setTargetImage(null); setSourceName(`${key.replaceAll("-", "_")}_reference.tif`); setTargetName(`${key.replaceAll("-", "_")}_query.tif`); setNotice(`${cases[key].label} loaded. This is a documented demo scenario, not a dataset-wide accuracy claim.`); setTab("compare");
  };

  const handleFile = (file: File | undefined, side: "source" | "target") => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setNotice("Please choose a PNG, JPEG, WebP, or TIFF image."); return; }
    const reader = new FileReader();
    reader.onload = () => { if (side === "source") { setSourceImage(String(reader.result)); setSourceName(file.name); } else { setTargetImage(String(reader.result)); setTargetName(file.name); } setNotice(`${side === "source" ? "Reference" : "Query"} image staged. Run correspondence when both sides are ready.`); };
    reader.readAsDataURL(file);
  };

  const runAnalysis = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    setRunning(true); setProgress(8); setNotice("Ingesting files and reading sensor metadata…");
    let current = 8;
    intervalRef.current = window.setInterval(() => {
      current += 12;
      setProgress(Math.min(current, 100));
      if (current < 30) setNotice("Normalizing radiometry, scale and modality differences…");
      else if (current < 56) setNotice("Extracting structural keypoints and Lunar Fingerprint descriptors…");
      else if (current < 80) setNotice("Ranking candidate correspondences and applying ratio-test filtering…");
      else if (current < 100) setNotice("Estimating geometric transform with RANSAC and checking residuals…");
      else { if (intervalRef.current) window.clearInterval(intervalRef.current); setRunning(false); setNotice(`${demo.status}. Evidence is ready for inspection.`); }
    }, 130);
  };

  const resetRun = () => { setSourceImage(null); setTargetImage(null); setSourceName("ohrc_aristarchus_tile07.tif"); setTargetName("tmc2_aristarchus_tile07.tif"); setProgress(100); setNotice("Workspace reset to the documented demo pair."); };

  const exportEvidence = () => {
    const payload = { project: "LunarMatch", team: "SEMICODERS", mode: "client-side prototype", generatedAt: new Date().toISOString(), case: demo.label, sensorA: demo.sensorA, sensorB: demo.sensorB, detector, ratioThreshold: ratio, files: { source: sourceName, target: targetName }, metrics: { verifiedInliers: acceptedCount, candidateMatches: demo.candidates, inlierRatio: demo.ratio, reprojectionError: demo.error, confidence: demo.confidence }, note: "Replace illustrative metrics with verified experiment logs before publication." };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "lunarmatch-evidence.json"; anchor.click(); URL.revokeObjectURL(url); setNotice("Evidence JSON exported locally.");
  };

  const nav = (next: Tab) => { setTab(next); setMobileNav(false); window.setTimeout(() => document.getElementById(next)?.scrollIntoView({ behavior: "smooth", block: "start" }), 20); };

  return <div className="lab-shell">
    <header className="lab-header"><div className="lab-brand"><div className="brand-orbit"><Orbit size={20} /><span /></div><div><div className="eyebrow">CHANDRAYAAN-2 / MISSION DATA LAB</div><div className="brand-title">LunarMatch <span>·</span> <b>SEMICODERS</b></div></div></div><nav className={`lab-nav ${mobileNav ? "open" : ""}`}>{([ ["compare", "Workspace", ScanLine], ["benchmark", "Benchmark", BarChart3], ["method", "Method", Beaker] ] as const).map(([key, label, Icon]) => <button className={tab === key ? "active" : ""} onClick={() => nav(key)} key={key}><Icon size={14} /> {label}</button>)}</nav><div className="header-actions"><span className="system-live"><i /> prototype online</span><button className="icon-button" title="Help"><CircleHelp size={16} /></button><button className="menu-button icon-button" onClick={() => setMobileNav((value) => !value)} title="Open navigation"><Menu size={17} /></button></div></header>

    <main className="lab-main">
      <section className="lab-hero"><div className="hero-copy"><MiniBadge tone="cyan"><Satellite size={12} /> ORBITAL INSTRUMENT PANEL / v0.4</MiniBadge><h1>Find the same terrain<br /><em>across different eyes.</em></h1><p>LunarMatch is an explainable correspondence workspace for Chandrayaan-2 imagery. It tests structure, not brightness, and leaves a geometric evidence trail behind every decision.</p><div className="hero-actions"><button className="primary-button" onClick={() => nav("compare")}><ScanLine size={15} /> Open analysis workspace</button><button className="secondary-button" onClick={exportEvidence}><FileJson size={15} /> Export sample evidence</button></div><div className="hero-statline"><span><b>03</b> sensors in scope</span><span><b>05</b> evidence stages</span><span><b>01</b> conservative decision</span></div></div><div className="mission-visual"><div className="visual-chrome"><span>LIVE / SYNTHETIC TERRAIN PREVIEW</span><span>18.41° N · 29.67° W</span></div><svg viewBox="0 0 560 300" className="mission-svg"><defs><radialGradient id="moon"><stop offset="0" stopColor="#b99562" /><stop offset=".4" stopColor="#6d7184" /><stop offset="1" stopColor="#172234" /></radialGradient><filter id="glow"><feGaussianBlur stdDeviation="7" /></filter></defs><rect width="560" height="300" fill="#0b1627" /><circle cx="310" cy="150" r="112" fill="url(#moon)" opacity=".86" /><circle cx="310" cy="150" r="128" fill="none" stroke="#68e1d7" strokeOpacity=".18" /><circle cx="310" cy="150" r="147" fill="none" stroke="#68e1d7" strokeOpacity=".1" strokeDasharray="2 8" /><g fill="none" stroke="#dfc487" strokeOpacity=".65"><ellipse cx="270" cy="126" rx="47" ry="23" strokeWidth="4" /><ellipse cx="270" cy="126" rx="30" ry="13" strokeWidth="2" /><ellipse cx="357" cy="195" rx="29" ry="14" strokeWidth="3" /><path d="M202 175 C253 145 290 184 327 161 S400 128 436 155" strokeWidth="2" /><path d="M229 93 C258 74 284 84 308 69 S351 55 388 76" /></g><g fill="#78eee0"><circle cx="246" cy="111" r="3" /><circle cx="289" cy="150" r="3" /><circle cx="330" cy="177" r="3" /><circle cx="387" cy="151" r="3" /><circle cx="357" cy="216" r="3" /></g><circle cx="315" cy="145" r="154" fill="none" stroke="#67e2d9" strokeOpacity=".34" strokeDasharray="4 11" /><path d="M70 248 H500" stroke="#6ce4dc" strokeOpacity=".25" /><path d="M92 248 V239M500 248 V239" stroke="#6ce4dc" strokeOpacity=".45" /><g fill="#83dcd6" fontFamily="monospace" fontSize="9"><text x="72" y="266">SENSOR FUSION / STRUCTURAL SIGNATURE</text><text x="430" y="266">01 / 03</text></g><circle cx="310" cy="150" r="26" fill="none" stroke="#65e5db" strokeOpacity=".24" filter="url(#glow)" /></svg><div className="visual-footer"><span><i className="green-dot" /> OHRC · TMC-2 · IIRS</span><span>synthetic visual / replace with verified imagery</span></div></div></section>

      <section className="workspace-shell" id="compare"><aside className="control-rail"><div className="rail-head"><span className="eyebrow">WORKSPACE</span><button className="icon-button" onClick={resetRun} title="Reset workspace"><RotateCcw size={14} /></button></div><div className="rail-section"><div className="rail-label">DEMO LIBRARY <span>03</span></div>{(Object.keys(cases) as CaseKey[]).map((key, index) => <button className={`case-tile ${key === caseKey ? "selected" : ""}`} key={key} onClick={() => loadCase(key)}><span className="case-number">0{index + 1}</span><span><b>{cases[key].label}</b><small>{cases[key].subtitle}</small></span><ChevronRight size={14} /></button>)}</div><div className="rail-section config-section"><div className="rail-label">RUN CONFIGURATION <Settings2 size={13} /></div><label className="field-label">FEATURE REPRESENTATION<select value={detector} onChange={(event) => setDetector(event.target.value as Detector)}><option>Lunar Fingerprint</option><option>SIFT baseline</option><option>ORB baseline</option></select></label><label className="field-label">RATIO TEST THRESHOLD<div className="range-wrap"><input type="range" min="0.55" max="0.9" step="0.01" value={ratio} onChange={(event) => setRatio(Number(event.target.value))} /><b>{ratio.toFixed(2)}</b></div></label><div className="toggle-row"><span>Show match candidates</span><button className={`toggle ${showPoints ? "on" : ""}`} onClick={() => setShowPoints((value) => !value)} aria-label="Toggle points"><i /></button></div><div className="toggle-row"><span>Reference grid</span><button className={`toggle ${showGrid ? "on" : ""}`} onClick={() => setShowGrid((value) => !value)} aria-label="Toggle grid"><i /></button></div></div><div className="rail-foot"><div><LockKeyhole size={13} /><span>Local files only</span></div><small>No data leaves this browser in prototype mode.</small></div></aside>

        <section className="analysis-panel"><div className="panel-topline"><div><div className="eyebrow">01 / CORRESPONDENCE WORKSPACE</div><h2>{demo.label} <span>· {demo.scene}</span></h2></div><div className="panel-status"><span className="status-led" /> {running ? `PROCESSING ${progress}%` : "READY FOR ANALYSIS"}</div></div><div className="notice-bar"><Activity size={15} /><span>{notice}</span><span className="notice-tag">{detector.toUpperCase()}</span></div><div className="pipeline-wrap"><MiniPipeline stage={running ? Math.min(4, Math.floor(progress / 22)) : 5} /><div className="pipeline-copy"><b>Evidence pipeline</b><span>{running ? "Processing client-side" : "All stages ready"}</span></div></div><div className="comparison-toolbar"><div><span className="eyebrow">OBSERVATION PAIR</span><b>{demo.sensorA} → {demo.sensorB}</b></div><div className="toolbar-actions"><button className="small-button" onClick={() => sourceInput.current?.click()}><Upload size={13} /> Add reference</button><button className="small-button" onClick={() => targetInput.current?.click()}><Upload size={13} /> Add query</button><button className="primary-button compact" onClick={runAnalysis} disabled={running}>{running ? <RotateCcw className="spin" size={14} /> : <Play size={14} />}{running ? "Processing" : "Run correspondence"}</button></div></div><div className="pair-meta"><div><FileImage size={13} /><span>{sourceName}</span><small>{demo.sourceSize}</small></div><div className="pair-arrow"><Link2 size={14} /></div><div><FileImage size={13} /><span>{targetName}</span><small>{demo.targetSize}</small></div></div><div className="terrain-grid"><TerrainView side="A" demo={demo} image={sourceImage} showPoints={showPoints} showGrid={showGrid} showRejected={showRejected} /><div className="terrain-center"><div className="center-pulse"><GitCompareArrows size={18} /></div><b>{acceptedCount}</b><span>verified<br />inliers</span><i /></div><TerrainView side="B" demo={demo} image={targetImage} showPoints={showPoints} showGrid={showGrid} showRejected={showRejected} /></div><div className="visual-controls"><label><input type="checkbox" checked={showPoints} onChange={(event) => setShowPoints(event.target.checked)} /> Show structural points</label><label><input type="checkbox" checked={showGrid} onChange={(event) => setShowGrid(event.target.checked)} /> Show coordinate grid</label><label><input type="checkbox" checked={showRejected} onChange={(event) => setShowRejected(event.target.checked)} /> Show rejected candidates</label><span className="legend-key"><i className="accepted" /> accepted <i className="rejected" /> rejected</span></div><div className="result-block"><div className="result-heading"><div><div className="eyebrow">02 / GEOMETRIC EVIDENCE</div><h3>Decision record</h3></div><MiniBadge tone={demo.status === "REJECTED" ? "red" : demo.status === "REVIEW" ? "amber" : "cyan"}><ShieldCheck size={12} /> {demo.status}</MiniBadge></div><div className="metrics-grid"><MetricCard label="Verified inliers" value={acceptedCount} detail={`of ${demo.candidates} candidates`} tone="mint" icon={GitCompareArrows} /><MetricCard label="Inlier ratio" value={demo.ratio} detail="accepted / candidates" tone="cyan" icon={BarChart3} /><MetricCard label="Reprojection" value={demo.error} detail="median residual" tone={caseKey === "iirs-control" ? "red" : "amber"} icon={Maximize2} /><MetricCard label="Confidence" value={demo.confidence} detail="not calibrated probability" tone={caseKey === "iirs-control" ? "red" : "mint"} icon={Gauge} /><MetricCard label="Scale estimate" value={demo.scale} detail="similarity transform" tone="cyan" icon={Layers3} /></div><div className="audit-grid"><div className="audit-card"><div className="card-overline"><ShieldCheck size={15} /> INTERPRETATION</div><p>{demo.note}</p><div className="callout"><span /> Accepted only when support, geometry and scale evidence agree.</div></div><div className="audit-card"><div className="card-overline"><SlidersHorizontal size={15} /> TEST CONDITIONS</div><div className="condition-grid"><span>Detector</span><b>{detector}</b><span>Match rule</span><b>mutual nearest + {ratio.toFixed(2)} ratio</b><span>Model</span><b>similarity + RANSAC</b><span>Pair scope</span><b>{demo.sensorA} → {demo.sensorB}</b></div></div></div><div className="result-actions"><button className="secondary-button" onClick={exportEvidence}><Download size={14} /> Download evidence JSON</button><button className="ghost-link" onClick={() => setNotice("Share links are disabled in client-only prototype mode.")}><SquareArrowOutUpRight size={14} /> Copy share link</button><span><Info size={13} /> Prototype values require dataset validation.</span></div></div></section></section>

      {tab === "benchmark" ? <div id="benchmark"><BenchmarkView selectedCase={demo} /></div> : null}
      {tab === "method" ? <div id="method"><MethodView /></div> : null}
      {tab === "compare" ? <section className="lower-brief"><div className="brief-card"><div className="card-overline"><Sparkles size={15} /> WHY LUNAR FINGERPRINT</div><h3>Brightness is a condition.<br />Geometry is an identity signal.</h3><p>Across sensors, the same terrain may change tone, contrast and scale. LunarMatch makes that instability explicit, then asks whether the arrangement of structures remains consistent.</p><button className="text-link" onClick={() => nav("method")}>Read the method notebook <ArrowUpRight size={14} /></button></div><div className="brief-card provenance"><div className="card-overline"><Database size={15} /> PROVENANCE STATUS</div><div className="provenance-row"><span>Chandrayaan-2 payloads</span><b>OHRC · TMC-2 · IIRS</b></div><div className="provenance-row"><span>Reference transform</span><b className="pending">pending final dataset</b></div><div className="provenance-row"><span>Backend mode</span><b>client-side simulation</b></div><div className="provenance-row"><span>Export format</span><b>JSON / evidence record</b></div></div></section> : null}
    </main><footer className="lab-footer"><div><span className="footer-orbit"><Orbit size={12} /></span><b>SEMICODERS / LUNARMATCH</b><span>·</span><span>SIH 2026 prototype</span></div><div><a href="https://lunarmatch-jy3fptr2.manus.space" target="_blank" rel="noreferrer">live deployment <ArrowUpRight size={12} /></a><span>·</span><span>local files only</span></div></footer>
    <input ref={sourceInput} type="file" accept="image/png,image/jpeg,image/webp,image/tiff" hidden onChange={(event) => handleFile(event.target.files?.[0], "source")} /><input ref={targetInput} type="file" accept="image/png,image/jpeg,image/webp,image/tiff" hidden onChange={(event) => handleFile(event.target.files?.[0], "target")} />
  </div>;
}
