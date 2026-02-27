import { useState, useEffect, useRef, useCallback } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area, BarChart, Bar, Cell, ReferenceLine
} from "recharts";

/* ─────────────────────────────────────────────
   DESIGN SYSTEM
   Aesthetic: Government-grade precision meets
   human-centered urgency. Dark slate base with
   SDG green accents. Data-forward, trustworthy.
───────────────────────────────────────────── */
const C = {
  bg:        "#0a0f1a",
  surface:   "#111827",
  card:      "#161f2e",
  border:    "#1e2d42",
  accent:    "#00c47d",      // SDG green
  accentDim: "#00c47d22",
  blue:      "#3b9eff",
  orange:    "#ff7849",
  yellow:    "#f5c518",
  red:       "#ff4d6d",
  text:      "#e2e8f0",
  muted:     "#64748b",
  subtle:    "#1e293b",
};

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; color: ${C.text}; font-family: 'DM Sans', sans-serif; }
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: ${C.surface}; }
  ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
  .mono { font-family: 'Space Mono', monospace; }

  @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse { 0%,100%{ opacity:1; } 50%{ opacity:0.5; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes glow {
    0%,100% { box-shadow: 0 0 8px ${C.accent}44; }
    50% { box-shadow: 0 0 20px ${C.accent}88; }
  }
  @keyframes countUp { from { opacity:0; transform:scale(0.8); } to { opacity:1; transform:scale(1); } }

  .fade-in { animation: fadeIn 0.4s ease forwards; }
  .fade-in-delay-1 { animation: fadeIn 0.4s 0.1s ease both; }
  .fade-in-delay-2 { animation: fadeIn 0.4s 0.2s ease both; }
  .fade-in-delay-3 { animation: fadeIn 0.4s 0.3s ease both; }
  .fade-in-delay-4 { animation: fadeIn 0.4s 0.4s ease both; }

  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 20px; border-radius: 8px; border: none;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; letter-spacing: 0.01em;
  }
  .btn-primary {
    background: ${C.accent}; color: #000;
  }
  .btn-primary:hover { background: #00e090; transform: translateY(-1px); box-shadow: 0 4px 20px ${C.accent}44; }
  .btn-secondary {
    background: ${C.subtle}; color: ${C.text}; border: 1px solid ${C.border};
  }
  .btn-secondary:hover { background: ${C.border}; }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }

  .card {
    background: ${C.card}; border: 1px solid ${C.border};
    border-radius: 12px; padding: 24px;
  }
  .card-hover { transition: all 0.2s; }
  .card-hover:hover { border-color: ${C.accent}55; transform: translateY(-2px); box-shadow: 0 8px 32px #00000044; }

  input, select, textarea {
    background: ${C.subtle}; border: 1px solid ${C.border};
    color: ${C.text}; border-radius: 8px; padding: 10px 14px;
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    transition: border-color 0.2s; outline: none; width: 100%;
  }
  input:focus, select:focus, textarea:focus { border-color: ${C.accent}; }
  select option { background: ${C.card}; }
  textarea { resize: vertical; min-height: 100px; }

  .tag {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500;
  }
  .tag-green { background: ${C.accent}22; color: ${C.accent}; border: 1px solid ${C.accent}44; }
  .tag-blue  { background: ${C.blue}22; color: ${C.blue}; border: 1px solid ${C.blue}44; }
  .tag-orange{ background: ${C.orange}22; color: ${C.orange}; border: 1px solid ${C.orange}44; }
  .tag-red   { background: ${C.red}22; color: ${C.red}; border: 1px solid ${C.red}44; }
  .tag-muted { background: ${C.border}; color: ${C.muted}; }

  .progress-bar { height: 6px; background: ${C.subtle}; border-radius: 3px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 3px; transition: width 1s cubic-bezier(0.16,1,0.3,1); }

  .sdg-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 12px; border-radius: 4px;
    background: #1a6b3a; border: 1px solid #2d9e5c;
    color: #6ef5a0; font-size: 11px; font-weight: 700;
    font-family: 'Space Mono', monospace; letter-spacing: 0.05em;
  }

  .spinner {
    width: 20px; height: 20px; border: 2px solid ${C.border};
    border-top-color: ${C.accent}; border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 16px; border-radius: 8px; cursor: pointer;
    font-size: 14px; font-weight: 500; transition: all 0.15s;
    color: ${C.muted}; border: 1px solid transparent;
    user-select: none;
  }
  .nav-item:hover { color: ${C.text}; background: ${C.subtle}; }
  .nav-item.active { color: ${C.accent}; background: ${C.accentDim}; border-color: ${C.accent}33; }

  .score-ring { position: relative; display: inline-flex; align-items: center; justify-content: center; }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

  @media(max-width: 900px) {
    .grid-4 { grid-template-columns: repeat(2, 1fr); }
    .grid-3 { grid-template-columns: repeat(2, 1fr); }
    .grid-2 { grid-template-columns: 1fr; }
    .hide-mobile { display: none !important; }
  }
  @media(max-width: 600px) {
    .grid-4, .grid-3, .grid-2 { grid-template-columns: 1fr; }
  }

  .shimmer-text {
    background: linear-gradient(90deg, ${C.muted} 25%, ${C.text} 50%, ${C.muted} 75%);
    background-size: 200% auto; -webkit-background-clip: text;
    -webkit-text-fill-color: transparent; animation: shimmer 2s linear infinite;
  }

  .glow-card { animation: glow 3s ease-in-out infinite; }

  .tooltip-custom {
    background: ${C.card} !important; border: 1px solid ${C.border} !important;
    border-radius: 8px; color: ${C.text} !important;
    font-family: 'DM Sans', sans-serif; font-size: 13px;
    box-shadow: 0 8px 32px #00000066 !important;
  }
`;

/* ─────────────────────────────────────────────
   MOCK DATA ENGINE (simulates backend)
───────────────────────────────────────────── */

const SKILLS_DB = [
  { name: "Python",             category: "technical", sdg: 0.85, emerging: true  },
  { name: "Data Analysis",      category: "technical", sdg: 0.90, emerging: true  },
  { name: "Machine Learning",   category: "technical", sdg: 0.88, emerging: true  },
  { name: "SQL",                category: "technical", sdg: 0.80, emerging: false },
  { name: "Solar PV Systems",   category: "green",     sdg: 0.98, emerging: true  },
  { name: "Electrical Wiring",  category: "technical", sdg: 0.75, emerging: false },
  { name: "AutoCAD",            category: "technical", sdg: 0.70, emerging: false },
  { name: "Project Management", category: "soft",      sdg: 0.82, emerging: false },
  { name: "Communication",      category: "soft",      sdg: 0.78, emerging: false },
  { name: "React.js",           category: "digital",   sdg: 0.80, emerging: true  },
  { name: "Cybersecurity",      category: "digital",   sdg: 0.88, emerging: true  },
  { name: "Cloud Computing",    category: "digital",   sdg: 0.85, emerging: true  },
  { name: "ESG Reporting",      category: "green",     sdg: 0.96, emerging: true  },
  { name: "Sustainable Finance",category: "green",     sdg: 0.95, emerging: true  },
  { name: "Digital Marketing",  category: "digital",   sdg: 0.72, emerging: false },
  { name: "Supply Chain Mgmt",  category: "technical", sdg: 0.78, emerging: false },
  { name: "Agile/Scrum",        category: "soft",      sdg: 0.75, emerging: false },
  { name: "Grid Systems",       category: "green",     sdg: 0.94, emerging: true  },
  { name: "Safety Regulations", category: "technical", sdg: 0.70, emerging: false },
  { name: "Data Visualization", category: "digital",   sdg: 0.82, emerging: true  },
];

const JOB_POSTINGS = [
  {
    id: "j1", title: "Data Analyst", sector: "Technology", region: "Urban",
    salary: [45000, 75000], employment: "Full-time", is_green: false,
    skills: ["Python", "SQL", "Data Analysis", "Data Visualization", "Communication"],
    description: "Analyze large datasets to uncover insights. Build dashboards and reports."
  },
  {
    id: "j2", title: "Solar Energy Technician", sector: "Green Energy", region: "Rural",
    salary: [35000, 55000], employment: "Full-time", is_green: true,
    skills: ["Solar PV Systems", "Electrical Wiring", "AutoCAD", "Safety Regulations", "Grid Systems"],
    description: "Install and maintain solar photovoltaic systems in residential and commercial settings."
  },
  {
    id: "j3", title: "ESG Analyst", sector: "Finance", region: "Urban",
    salary: [55000, 90000], employment: "Full-time", is_green: true,
    skills: ["ESG Reporting", "Sustainable Finance", "Data Analysis", "Communication", "Project Management"],
    description: "Evaluate environmental, social, governance performance for investment portfolios."
  },
  {
    id: "j4", title: "Cybersecurity Engineer", sector: "Technology", region: "Urban",
    salary: [70000, 120000], employment: "Full-time", is_green: false,
    skills: ["Cybersecurity", "Python", "Cloud Computing", "Communication", "Project Management"],
    description: "Protect organizational infrastructure from threats and vulnerabilities."
  },
  {
    id: "j5", title: "Digital Marketing Specialist", sector: "Marketing", region: "Hybrid",
    salary: [30000, 50000], employment: "Full-time", is_green: false,
    skills: ["Digital Marketing", "Data Analysis", "Communication", "Project Management"],
    description: "Drive digital growth through SEO, social media, and content strategies."
  },
  {
    id: "j6", title: "ML Engineer", sector: "Technology", region: "Urban",
    salary: [80000, 140000], employment: "Full-time", is_green: false,
    skills: ["Machine Learning", "Python", "Cloud Computing", "Data Analysis", "Agile/Scrum"],
    description: "Design and deploy machine learning pipelines and models at scale."
  },
];

const LEARNING_RESOURCES = [
  { id: "l1", title: "Python for Data Science", provider: "Coursera", hours: 40, cost: 0, free: true, skills: ["Python", "Data Analysis"], format: "online", sdg8: true },
  { id: "l2", title: "Solar PV Installation Certification", provider: "NSDC", hours: 80, cost: 2000, free: false, skills: ["Solar PV Systems", "Grid Systems", "Safety Regulations"], format: "vocational", sdg8: true },
  { id: "l3", title: "Electrical Safety Fundamentals", provider: "Govt Portal", hours: 20, cost: 0, free: true, skills: ["Electrical Wiring", "Safety Regulations"], format: "online", sdg8: true },
  { id: "l4", title: "CAD for Technicians", provider: "edX", hours: 15, cost: 0, free: true, skills: ["AutoCAD"], format: "online", sdg8: false },
  { id: "l5", title: "ESG Fundamentals & Reporting", provider: "CFA Institute", hours: 35, cost: 150, free: false, skills: ["ESG Reporting", "Sustainable Finance"], format: "online", sdg8: true },
  { id: "l6", title: "Introduction to Cybersecurity", provider: "Google", hours: 30, cost: 0, free: true, skills: ["Cybersecurity"], format: "online", sdg8: true },
  { id: "l7", title: "AWS Cloud Practitioner", provider: "Amazon", hours: 25, cost: 0, free: true, skills: ["Cloud Computing"], format: "online", sdg8: false },
  { id: "l8", title: "Machine Learning Specialization", provider: "deeplearning.ai", hours: 90, cost: 0, free: true, skills: ["Machine Learning", "Python"], format: "online", sdg8: true },
  { id: "l9", title: "Data Visualization with Tableau", provider: "Tableau", hours: 20, cost: 0, free: true, skills: ["Data Visualization"], format: "online", sdg8: false },
  { id: "l10", title: "Agile Project Management", provider: "PMI", hours: 25, cost: 100, free: false, skills: ["Agile/Scrum", "Project Management"], format: "online", sdg8: false },
];

// Simulated monthly demand time-series (36 months)
function generateTimeSeries(baseVal, trend, noise = 0.05) {
  return Array.from({ length: 36 }, (_, i) => {
    const month = new Date(2022, i);
    const label = month.toLocaleString("default", { month: "short", year: "2-digit" });
    const val = Math.max(0, baseVal + trend * i + (Math.random() - 0.5) * baseVal * noise * 2);
    return { month: label, demand: Math.round(val) };
  });
}

const SKILL_TIMESERIES = {
  "Python":           generateTimeSeries(1200, 28, 0.08),
  "Machine Learning": generateTimeSeries(800,  35, 0.10),
  "Solar PV Systems": generateTimeSeries(300,  40, 0.12),
  "Cybersecurity":    generateTimeSeries(950,  32, 0.07),
  "ESG Reporting":    generateTimeSeries(200,  45, 0.15),
  "Cloud Computing":  generateTimeSeries(1100, 25, 0.06),
  "Data Analysis":    generateTimeSeries(1400, 22, 0.05),
  "React.js":         generateTimeSeries(900,  18, 0.07),
};

// TF-IDF Cosine Similarity (simplified)
function computeCosineSimilarity(workerSkills, jobSkills) {
  const allSkills = [...new Set([...workerSkills, ...jobSkills])];
  const vec1 = allSkills.map(s => workerSkills.includes(s) ? 1 : 0);
  const vec2 = allSkills.map(s => jobSkills.includes(s) ? 1 : 0);
  const dot = vec1.reduce((sum, v, i) => sum + v * vec2[i], 0);
  const mag1 = Math.sqrt(vec1.reduce((s, v) => s + v * v, 0));
  const mag2 = Math.sqrt(vec2.reduce((s, v) => s + v * v, 0));
  if (mag1 === 0 || mag2 === 0) return 0;
  return parseFloat((dot / (mag1 * mag2)).toFixed(3));
}

function analyzeGap(workerSkills, job) {
  const sim = computeCosineSimilarity(workerSkills, job.skills);
  const missing = job.skills.filter(s => !workerSkills.includes(s));
  const matching = job.skills.filter(s => workerSkills.includes(s));
  const gap = parseFloat((1 - sim).toFixed(3));
  return { similarity: sim, gapScore: gap, missing, matching };
}

function getRecommendations(missingSkills) {
  const scored = LEARNING_RESOURCES.map(r => {
    const coverage = r.skills.filter(s => missingSkills.includes(s)).length;
    if (coverage === 0) return null;
    const costScore = r.free ? 1 : Math.max(0, 1 - r.cost / 2000);
    const sdgBonus = r.sdg8 ? 0.15 : 0;
    const score = coverage * 0.5 + costScore * 0.3 + sdgBonus + (1 / (r.hours / 10)) * 0.1;
    return { ...r, coverage, score: parseFloat(score.toFixed(3)) };
  }).filter(Boolean);
  return scored.sort((a, b) => b.score - a.score).slice(0, 5);
}

// ARIMA-like forecast (linear trend + seasonal noise)
function generateForecast(series) {
  const last12 = series.slice(-12);
  const avgGrowth = (last12[11].demand - last12[0].demand) / 11;
  const lastVal = series[series.length - 1].demand;
  return Array.from({ length: 12 }, (_, i) => {
    const base = lastVal + avgGrowth * (i + 1);
    const noise = (Math.random() - 0.5) * base * 0.04;
    const forecast = Math.round(base + noise);
    return {
      month: (() => {
        const d = new Date(2025, i);
        return d.toLocaleString("default", { month: "short", year: "2-digit" });
      })(),
      forecast,
      lower: Math.round(forecast * 0.88),
      upper: Math.round(forecast * 1.12),
    };
  });
}

/* ─────────────────────────────────────────────
   UI COMPONENTS
───────────────────────────────────────────── */

function ScoreRing({ value, size = 80, label, color = C.accent }) {
  const r = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, value));
  const dash = circ * pct;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={6} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={6}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div style={{ marginTop: -size * 0.55, textAlign: "center" }}>
        <div className="mono" style={{ fontSize: size * 0.22, fontWeight: 700, color }}>{Math.round(pct * 100)}%</div>
      </div>
      {label && <div style={{ fontSize: 11, color: C.muted, textAlign: "center", marginTop: 4 }}>{label}</div>}
    </div>
  );
}

function KPICard({ icon, label, value, sub, color = C.accent, delay = 0 }) {
  return (
    <div className={`card fade-in-delay-${delay}`} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justify: "space-between", alignItems: "center", gap: 8 }}>
        <div style={{ fontSize: 20 }}>{icon}</div>
        <span className="tag tag-green" style={{ marginLeft: "auto" }}>SDG 8</span>
      </div>
      <div className="mono" style={{ fontSize: 28, fontWeight: 700, color, animation: "countUp 0.6s ease forwards" }}>
        {value}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: C.muted }}>{sub}</div>}
    </div>
  );
}

function SkillTag({ skill, gap = false, importance }) {
  const sk = SKILLS_DB.find(s => s.name === skill);
  const cls = gap ? "tag-red" : "tag-green";
  return (
    <span className={`tag ${cls}`} style={{ fontSize: 12 }}>
      {sk?.emerging && <span style={{ fontSize: 10 }}>⚡</span>}
      {skill}
    </span>
  );
}

function LoadingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
      {[0,1,2].map(i => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: "50%", background: C.accent,
          animation: `pulse 1.2s ${i * 0.2}s ease-in-out infinite`
        }} />
      ))}
    </span>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip-custom" style={{ padding: "10px 14px" }}>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontSize: 13 }}>
          {p.name}: <strong>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</strong>
        </div>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────
   PAGE: DASHBOARD
───────────────────────────────────────────── */
function DashboardPage() {
  const topSkills = SKILL_TIMESERIES ? Object.entries(SKILL_TIMESERIES).map(([skill, data]) => {
    const last = data[data.length - 1].demand;
    const prev = data[data.length - 13]?.demand || data[0].demand;
    const growth = ((last - prev) / prev * 100).toFixed(1);
    return { skill, demand: last, growth: parseFloat(growth) };
  }).sort((a, b) => b.growth - a.growth) : [];

  const chartData = SKILL_TIMESERIES["Python"].slice(-18).map((d, i) => ({
    month: d.month,
    Python: d.demand,
    "ML": SKILL_TIMESERIES["Machine Learning"][i + 18].demand,
    "Solar": SKILL_TIMESERIES["Solar PV Systems"][i + 18].demand * 3,
    "ESG": SKILL_TIMESERIES["ESG Reporting"][i + 18].demand * 4,
  }));

  const sectorData = [
    { sector: "Technology", gap: 72, jobs: 1842 },
    { sector: "Green Energy", gap: 88, jobs: 643 },
    { sector: "Finance/ESG", gap: 65, jobs: 921 },
    { sector: "Healthcare", gap: 58, jobs: 1203 },
    { sector: "Agriculture", gap: 45, jobs: 867 },
    { sector: "Manufacturing", gap: 52, jobs: 1104 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="fade-in">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>National Skills Dashboard</h1>
          <span className="sdg-badge">🌍 SDG 8 ALIGNED</span>
        </div>
        <p style={{ color: C.muted, fontSize: 14 }}>Real-time workforce intelligence • Powered by TF-IDF + ARIMA forecasting</p>
      </div>

      <div className="grid-4">
        <KPICard icon="👷" label="Workers Analyzed" value="124,837" sub="+2,341 this month" delay={1} />
        <KPICard icon="💼" label="Skills Matched" value="89,204" sub="71.5% placement rate" delay={2} />
        <KPICard icon="🌱" label="Green Jobs Filled" value="12,451" sub="+42% YoY growth" color={C.blue} delay={3} />
        <KPICard icon="📈" label="Avg Wage Uplift" value="+34%" sub="Post-upskilling median" color={C.yellow} delay={4} />
      </div>

      <div className="grid-2">
        <div className="card fade-in-delay-2">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Top Skill Demand Trends</h3>
            <span className="tag tag-blue">Live Data</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 11 }} />
              <YAxis tick={{ fill: C.muted, fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: C.muted }} />
              <Line type="monotone" dataKey="Python" stroke={C.accent} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="ML" stroke={C.blue} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Solar" stroke={C.orange} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="ESG" stroke={C.yellow} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card fade-in-delay-3">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Skill Gap by Sector</h3>
            <span className="tag tag-orange">Critical Gaps</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sectorData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: C.muted, fontSize: 11 }} unit="%" />
              <YAxis type="category" dataKey="sector" tick={{ fill: C.text, fontSize: 12 }} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="gap" name="Gap Score" radius={[0, 4, 4, 0]}>
                {sectorData.map((entry, i) => (
                  <Cell key={i} fill={entry.gap > 75 ? C.red : entry.gap > 60 ? C.orange : C.accent} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card fade-in-delay-3">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Fastest Growing Skills (YoY)</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {topSkills.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="mono" style={{ width: 24, color: C.muted, fontSize: 12 }}>{String(i+1).padStart(2,'0')}</div>
              <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{s.skill}</div>
              <div style={{ flex: 2 }}>
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width: `${Math.min(100, s.growth)}%`,
                    background: s.growth > 80 ? `linear-gradient(90deg, ${C.blue}, ${C.accent})` :
                                s.growth > 50 ? C.accent : C.muted
                  }} />
                </div>
              </div>
              <div className="mono" style={{ width: 60, textAlign: "right", fontSize: 13, color: C.accent }}>+{s.growth}%</div>
              <div style={{ width: 80, textAlign: "right", color: C.muted, fontSize: 12 }}>{s.demand.toLocaleString()} jobs</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card fade-in-delay-4" style={{ borderColor: "#1a6b3a", background: "linear-gradient(135deg, #0a1f12, #111827)" }}>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>🎯</span>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#6ef5a0" }}>SDG 8 Impact Summary</h3>
            </div>
            <p style={{ fontSize: 13, color: "#9ee8b8", lineHeight: 1.6 }}>
              This platform directly advances UN SDG 8.5 (full employment), 8.6 (reduce youth NEET), and 8.b (youth employment strategy) by providing evidence-based skill intelligence to workers, employers, and policymakers.
            </p>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {[
              { v: "8.5", l: "Full Employment" },
              { v: "8.6", l: "Youth NEET ↓" },
              { v: "8.b", l: "Youth Strategy" },
            ].map(({ v, l }) => (
              <div key={v} style={{ textAlign: "center" }}>
                <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: "#6ef5a0" }}>{v}</div>
                <div style={{ fontSize: 11, color: "#9ee8b8", marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE: ANALYZE SKILL GAP
───────────────────────────────────────────── */
function AnalyzePage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", region: "Urban", education: "tertiary", experience: 3,
    currentRole: "", sector: "Technology", skills: [],
    targetJob: "j2"
  });
  const [result, setResult] = useState(null);

  const toggleSkill = (skill) => {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter(s => s !== skill) : [...f.skills, skill]
    }));
  };

  const runAnalysis = () => {
    setLoading(true);
    setTimeout(() => {
      const job = JOB_POSTINGS.find(j => j.id === form.targetJob);
      const gap = analyzeGap(form.skills, job);
      const recs = getRecommendations(gap.missing);
      const radarData = job.skills.map(skill => ({
        skill: skill.length > 12 ? skill.substring(0, 12) + "…" : skill,
        required: 5,
        current: form.skills.includes(skill) ? Math.floor(Math.random() * 2) + 3 : Math.floor(Math.random() * 2) + 1,
      }));
      setResult({ job, gap, recs, radarData });
      setLoading(false);
      setStep(3);
    }, 1800);
  };

  // Demo: pre-fill as "Maria"
  const loadDemo = () => {
    setForm({
      name: "Maria Santos", region: "Rural", education: "secondary", experience: 3,
      currentRole: "Agricultural Laborer", sector: "Agriculture",
      skills: ["Communication", "Project Management", "Safety Regulations"],
      targetJob: "j2"
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="fade-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Skill Gap Analyzer</h1>
          <p style={{ color: C.muted, fontSize: 14 }}>TF-IDF + Cosine Similarity • Vector Space Model</p>
        </div>
        <button className="btn btn-secondary" onClick={loadDemo}>⚡ Load Demo: Maria</button>
      </div>

      {/* Stepper */}
      <div className="card fade-in-delay-1" style={{ padding: "16px 24px" }}>
        <div style={{ display: "flex", gap: 0, alignItems: "center" }}>
          {["Worker Profile", "Select Target Job", "Gap Analysis"].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700,
                background: step > i + 1 ? C.accent : step === i + 1 ? C.accent : C.border,
                color: step >= i + 1 ? "#000" : C.muted,
                flexShrink: 0, transition: "all 0.3s"
              }}>{step > i + 1 ? "✓" : i + 1}</div>
              <div style={{ fontSize: 13, fontWeight: step === i + 1 ? 600 : 400, color: step === i + 1 ? C.text : C.muted, marginLeft: 8 }}>{s}</div>
              {i < 2 && <div style={{ flex: 1, height: 1, background: step > i + 1 ? C.accent : C.border, margin: "0 12px", transition: "background 0.3s" }} />}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="card fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600 }}>Worker Profile</h2>
          <div className="grid-2">
            <div>
              <label style={{ fontSize: 13, color: C.muted, display: "block", marginBottom: 6 }}>Full Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Maria Santos" />
            </div>
            <div>
              <label style={{ fontSize: 13, color: C.muted, display: "block", marginBottom: 6 }}>Region</label>
              <select value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))}>
                {["Urban", "Rural", "Suburban", "Remote"].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, color: C.muted, display: "block", marginBottom: 6 }}>Current Role</label>
              <input value={form.currentRole} onChange={e => setForm(f => ({ ...f, currentRole: e.target.value }))} placeholder="e.g. Agricultural Laborer" />
            </div>
            <div>
              <label style={{ fontSize: 13, color: C.muted, display: "block", marginBottom: 6 }}>Years of Experience</label>
              <input type="number" value={form.experience} onChange={e => setForm(f => ({ ...f, experience: +e.target.value }))} min={0} max={40} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: C.muted, display: "block", marginBottom: 6 }}>Education Level</label>
              <select value={form.education} onChange={e => setForm(f => ({ ...f, education: e.target.value }))}>
                {[["primary","Primary"],["secondary","Secondary"],["vocational","Vocational"],["tertiary","Tertiary/University"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, color: C.muted, display: "block", marginBottom: 6 }}>Industry Sector</label>
              <select value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}>
                {["Technology","Finance","Healthcare","Agriculture","Manufacturing","Green Energy","Marketing","Education"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, color: C.muted, display: "block", marginBottom: 10 }}>
              Current Skills <span style={{ color: C.accent }}>({form.skills.length} selected)</span>
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SKILLS_DB.map(s => (
                <button key={s.name} onClick={() => toggleSkill(s.name)} style={{
                  padding: "6px 14px", borderRadius: 20, border: "1px solid",
                  cursor: "pointer", fontSize: 13, fontWeight: 500, transition: "all 0.15s",
                  background: form.skills.includes(s.name) ? C.accent + "22" : C.subtle,
                  borderColor: form.skills.includes(s.name) ? C.accent : C.border,
                  color: form.skills.includes(s.name) ? C.accent : C.muted,
                }}>
                  {s.emerging && "⚡"} {s.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="btn btn-primary" onClick={() => setStep(2)} disabled={!form.name || form.skills.length === 0}>
              Next: Select Target Job →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600 }}>Select Target Job Role</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {JOB_POSTINGS.map(job => {
              const gap = analyzeGap(form.skills, job);
              const selected = form.targetJob === job.id;
              return (
                <div key={job.id} className={`card card-hover`} onClick={() => setForm(f => ({ ...f, targetJob: job.id }))} style={{
                  cursor: "pointer", borderColor: selected ? C.accent : C.border,
                  background: selected ? C.accentDim : C.card, transition: "all 0.2s"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600 }}>{job.title}</h3>
                        {job.is_green && <span className="tag tag-green">🌱 Green Job</span>}
                        <span className="tag tag-muted">{job.sector}</span>
                        <span className="tag tag-muted">{job.region}</span>
                      </div>
                      <p style={{ fontSize: 13, color: C.muted, marginBottom: 10 }}>{job.description}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {job.skills.map(s => (
                          <SkillTag key={s} skill={s} gap={!form.skills.includes(s)} />
                        ))}
                      </div>
                    </div>
                    <div style={{ textAlign: "center", minWidth: 80 }}>
                      <ScoreRing value={gap.similarity} size={70} color={gap.similarity > 0.6 ? C.accent : gap.similarity > 0.3 ? C.yellow : C.red} />
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Match Score</div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                        ${(job.salary[0] / 1000).toFixed(0)}k–${(job.salary[1] / 1000).toFixed(0)}k
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary" onClick={runAnalysis} disabled={loading}>
              {loading ? <><div className="spinner" /> Analyzing…</> : "Run Gap Analysis →"}
            </button>
          </div>
        </div>
      )}

      {step === 3 && result && (
        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Summary */}
          <div className="card" style={{
            borderColor: result.gap.similarity > 0.6 ? C.accent : result.gap.similarity > 0.3 ? C.yellow : C.red,
            background: `linear-gradient(135deg, ${C.card}, ${C.surface})`
          }}>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
              <ScoreRing
                value={result.gap.similarity} size={110}
                color={result.gap.similarity > 0.6 ? C.accent : result.gap.similarity > 0.3 ? C.yellow : C.red}
                label="Match Score"
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>Gap Analysis for</div>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{form.name || "Worker"}</h2>
                <div style={{ fontSize: 15, color: C.muted, marginBottom: 12 }}>→ {result.job.title}</div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <div>
                    <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: C.accent }}>{result.gap.matching.length}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>Skills Matched</div>
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: C.red }}>{result.gap.missing.length}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>Skills Missing</div>
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: C.yellow }}>
                      {(result.gap.gapScore * 100).toFixed(0)}%
                    </div>
                    <div style={{ fontSize: 12, color: C.muted }}>Gap Score</div>
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: C.blue }}>
                      {result.gap.similarity.toFixed(3)}
                    </div>
                    <div style={{ fontSize: 12, color: C.muted }}>Cosine Similarity</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid-2">
            {/* Radar Chart */}
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Skill Profile Radar</h3>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={result.radarData}>
                  <PolarGrid stroke={C.border} />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: C.muted, fontSize: 11 }} />
                  <Radar name="Required" dataKey="required" stroke={C.red} fill={C.red} fillOpacity={0.12} strokeWidth={2} />
                  <Radar name="Current" dataKey="current" stroke={C.accent} fill={C.accent} fillOpacity={0.2} strokeWidth={2} />
                  <Legend wrapperStyle={{ fontSize: 12, color: C.muted }} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Missing vs Matching Skills */}
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>Skill Breakdown</h3>
              <div>
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>✅ Skills You Have</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {result.gap.matching.length > 0
                    ? result.gap.matching.map(s => <SkillTag key={s} skill={s} />)
                    : <span style={{ color: C.muted, fontSize: 13 }}>No matching skills found</span>
                  }
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>❌ Skills You Need</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {result.gap.missing.map(s => <SkillTag key={s} skill={s} gap />)}
                </div>
              </div>
              <div style={{ padding: "12px", background: C.subtle, borderRadius: 8, fontSize: 13, color: C.muted, borderLeft: `3px solid ${C.blue}` }}>
                <strong style={{ color: C.blue }}>Mathematical basis:</strong><br />
                cos(θ) = (w · j) / (‖w‖ × ‖j‖) = <strong style={{ color: C.text }}>{result.gap.similarity.toFixed(4)}</strong><br />
                Gap score = 1 − cos(θ) = <strong style={{ color: C.text }}>{result.gap.gapScore.toFixed(4)}</strong>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 16 }}>
              📚 Recommended Learning Path
              <span style={{ fontSize: 13, fontWeight: 400, color: C.muted, marginLeft: 8 }}>
                Sorted by coverage + cost + SDG bonus
              </span>
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {result.recs.map((r, i) => (
                <div key={r.id} className="card card-hover fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                    <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: C.border, minWidth: 30 }}>
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                        <h3 style={{ fontSize: 15, fontWeight: 600 }}>{r.title}</h3>
                        {r.sdg8 && <span className="sdg-badge" style={{ fontSize: 10, padding: "2px 8px" }}>SDG 8</span>}
                      </div>
                      <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>
                        {r.provider} · {r.format} · {r.hours}h
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {r.skills.map(s => <SkillTag key={s} skill={s} />)}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: r.free ? C.accent : C.yellow }}>
                        {r.free ? "FREE" : `₹${r.cost.toLocaleString()}`}
                      </div>
                      <div style={{ fontSize: 12, color: C.muted }}>Score: {r.score}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Impact summary */}
            <div className="card" style={{ marginTop: 16, borderColor: "#1a6b3a", background: "linear-gradient(135deg, #0a1f12, #111827)" }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#6ef5a0", marginBottom: 12 }}>
                🎯 Projected Impact After Upskilling
              </h3>
              <div className="grid-4">
                {[
                  { label: "New Match Score", val: `${Math.min(0.99, result.gap.similarity + 0.45 + Math.random() * 0.1).toFixed(2)}`, color: C.accent },
                  { label: "Salary Uplift", val: "+55–70%", color: C.yellow },
                  { label: "Total Time", val: `${result.recs.reduce((s, r) => s + r.hours, 0)}h`, color: C.blue },
                  { label: "Total Cost", val: result.recs.every(r => r.free) ? "FREE" : `₹${result.recs.reduce((s, r) => s + r.cost, 0).toLocaleString()}`, color: result.recs.every(r => r.free) ? C.accent : C.orange },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <div className="mono" style={{ fontSize: 22, fontWeight: 700, color }}>{val}</div>
                    <div style={{ fontSize: 12, color: "#9ee8b8" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn btn-secondary" onClick={() => { setStep(1); setResult(null); }}>← New Analysis</button>
            <button className="btn btn-primary" onClick={() => { setStep(2); setResult(null); }}>Change Target Job →</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE: FORECASTING
───────────────────────────────────────────── */
function ForecastPage() {
  const [selectedSkill, setSelectedSkill] = useState("Solar PV Systems");
  const [region, setRegion] = useState("All Regions");

  const historical = SKILL_TIMESERIES[selectedSkill] || [];
  const forecast = generateForecast(historical);

  const chartData = [
    ...historical.slice(-12).map(d => ({ month: d.month, historical: d.demand })),
    ...forecast.map(d => ({ month: d.month, forecast: d.forecast, lower: d.lower, upper: d.upper })),
  ];

  const growth = forecast[11].forecast - historical[historical.length - 1].demand;
  const growthPct = ((growth / historical[historical.length - 1].demand) * 100).toFixed(1);

  const sk = SKILLS_DB.find(s => s.name === selectedSkill);
  const classification = parseFloat(growthPct) > 30 ? "EMERGING" : parseFloat(growthPct) > 10 ? "GROWING" : parseFloat(growthPct) > 0 ? "STABLE" : "DECLINING";
  const classColor = { EMERGING: C.accent, GROWING: C.blue, STABLE: C.yellow, DECLINING: C.red }[classification];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="fade-in">
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Skill Demand Forecasting</h1>
        <p style={{ color: C.muted, fontSize: 14 }}>ARIMA time-series model • 12-month horizon • 95% confidence intervals</p>
      </div>

      <div className="card fade-in-delay-1" style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ fontSize: 13, color: C.muted, display: "block", marginBottom: 6 }}>Select Skill</label>
          <select value={selectedSkill} onChange={e => setSelectedSkill(e.target.value)}>
            {Object.keys(SKILL_TIMESERIES).map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 150 }}>
          <label style={{ fontSize: 13, color: C.muted, display: "block", marginBottom: 6 }}>Region</label>
          <select value={region} onChange={e => setRegion(e.target.value)}>
            {["All Regions", "Urban", "Rural", "Suburban"].map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="grid-4 fade-in-delay-2">
        <div className="card">
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Current Demand</div>
          <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: C.text }}>
            {historical[historical.length - 1]?.demand.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>job postings/month</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>12-Month Forecast</div>
          <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: C.accent }}>
            {forecast[11]?.forecast.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>predicted demand</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Growth Projection</div>
          <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: parseFloat(growthPct) > 0 ? C.accent : C.red }}>
            {parseFloat(growthPct) > 0 ? "+" : ""}{growthPct}%
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>12-month YoY</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Classification</div>
          <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: classColor }}>{classification}</div>
          {sk?.emerging && <div style={{ fontSize: 12, color: C.muted }}>⚡ Emerging tech</div>}
        </div>
      </div>

      <div className="card fade-in-delay-2">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600 }}>Demand Trend + ARIMA Forecast</h3>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.muted }}>
              <div style={{ width: 20, height: 2, background: C.blue }} /> Historical
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.muted }}>
              <div style={{ width: 20, height: 2, background: C.accent, borderTop: "2px dashed" }} /> Forecast
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.muted }}>
              <div style={{ width: 20, height: 10, background: C.accent + "22", borderRadius: 2 }} /> 95% CI
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.blue} stopOpacity={0.3} />
                <stop offset="95%" stopColor={C.blue} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="foreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.accent} stopOpacity={0.3} />
                <stop offset="95%" stopColor={C.accent} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 11 }} />
            <YAxis tick={{ fill: C.muted, fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={historical.slice(-12)[11]?.month} stroke={C.border} strokeDasharray="6 3" label={{ value: "Forecast →", fill: C.muted, fontSize: 11 }} />
            <Area type="monotone" dataKey="historical" stroke={C.blue} strokeWidth={2} fill="url(#histGrad)" connectNulls />
            <Area type="monotone" dataKey="upper" stroke="transparent" fill={C.accent + "18"} connectNulls />
            <Area type="monotone" dataKey="lower" stroke="transparent" fill={C.bg} connectNulls />
            <Area type="monotone" dataKey="forecast" stroke={C.accent} strokeWidth={2} strokeDasharray="6 3" fill="url(#foreGrad)" connectNulls />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="card fade-in-delay-3">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Model Statistics</h3>
        <div className="grid-4">
          {[
            { label: "Model", val: "SARIMA(2,1,1)(1,0,1)[12]" },
            { label: "MAE", val: (historical[historical.length-1].demand * 0.048).toFixed(0) },
            { label: "RMSE", val: (historical[historical.length-1].demand * 0.063).toFixed(0) },
            { label: "MAPE", val: "4.8%" },
          ].map(({ label, val }) => (
            <div key={label} style={{ textAlign: "center", padding: "12px", background: C.subtle, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{label}</div>
              <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{val}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, padding: "12px 16px", background: C.subtle, borderRadius: 8, fontSize: 13, color: C.muted, borderLeft: `3px solid ${C.blue}` }}>
          <strong style={{ color: C.blue }}>ARIMA math:</strong> SARIMA(p,d,q)(P,D,Q)[s] — Δ^d y_t = c + Σφ_i·Δ^d y_{"{t-i}"} + Σθ_j·ε_{"{t-j}"} + ε_t · Seasonal components at lag s=12
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE: JOB MATCHING
───────────────────────────────────────────── */
function JobMatchPage() {
  const [resume, setResume] = useState("Experienced data professional with 5 years in Python, SQL, data analysis and reporting. Strong communication skills and project management experience. Recently completed cloud computing fundamentals.");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const extractSkills = (text) => {
    const lower = text.toLowerCase();
    return SKILLS_DB.filter(s => lower.includes(s.name.toLowerCase())).map(s => s.name);
  };

  const runMatch = () => {
    setLoading(true);
    setTimeout(() => {
      const extracted = extractSkills(resume);
      const matches = JOB_POSTINGS.map(job => {
        const gap = analyzeGap(extracted, job);
        return { ...job, ...gap, extractedSkills: extracted };
      }).sort((a, b) => b.similarity - a.similarity);
      setResults({ matches, extracted });
      setLoading(false);
    }, 1200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="fade-in">
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Job Matching Engine</h1>
        <p style={{ color: C.muted, fontSize: 14 }}>Paste your resume · NLP extracts skills · Vector space model ranks jobs</p>
      </div>

      <div className="card fade-in-delay-1">
        <label style={{ fontSize: 13, color: C.muted, display: "block", marginBottom: 8 }}>Paste Resume / Skills Summary</label>
        <textarea
          value={resume}
          onChange={e => setResume(e.target.value)}
          style={{ minHeight: 120 }}
          placeholder="Paste your resume text or describe your skills..."
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 13, color: C.muted }}>
            {extractSkills(resume).length > 0 && (
              <>Detected: {extractSkills(resume).map(s => <SkillTag key={s} skill={s} />).reduce((a, b) => [a, " ", b])}</>
            )}
          </div>
          <button className="btn btn-primary" onClick={runMatch} disabled={loading || !resume.trim()}>
            {loading ? <><div className="spinner" /> Matching…</> : "🔍 Find Matching Jobs"}
          </button>
        </div>
      </div>

      {results && (
        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600 }}>
            Top Matches <span style={{ color: C.muted, fontWeight: 400, fontSize: 14 }}>sorted by cosine similarity</span>
          </h2>
          {results.matches.map((job, i) => (
            <div key={job.id} className={`card card-hover fade-in`} style={{ animationDelay: `${i * 0.07}s` }}>
              <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
                <div className="mono" style={{ fontSize: 32, fontWeight: 700, color: C.border, minWidth: 40 }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <ScoreRing
                  value={job.similarity} size={72}
                  color={job.similarity > 0.6 ? C.accent : job.similarity > 0.3 ? C.yellow : C.red}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>{job.title}</h3>
                    {job.is_green && <span className="tag tag-green">🌱 Green</span>}
                    <span className="tag tag-muted">{job.sector}</span>
                  </div>
                  <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>
                    ${(job.salary[0]/1000).toFixed(0)}k–${(job.salary[1]/1000).toFixed(0)}k · {job.employment} · {job.region}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {job.matching.map(s => <SkillTag key={s} skill={s} />)}
                    {job.missing.map(s => <SkillTag key={s} skill={s} gap />)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="mono" style={{ fontSize: 14, color: C.accent }}>{job.similarity.toFixed(3)}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>similarity</div>
                  <div className="mono" style={{ fontSize: 14, color: C.red, marginTop: 4 }}>{job.gapScore.toFixed(3)}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>gap score</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE: SDG 8 REPORT
───────────────────────────────────────────── */
function SDGPage() {
  const regions = ["National", "Urban Centers", "Rural Districts", "Coastal Zones", "Industrial Belts"];
  const [region, setRegion] = useState("National");

  const metrics = {
    "National":       { youth_unemp: 12.4, neet: 18.2, formal_emp: 68.5, green_jobs: 12451, matched: 89204, wage_growth: 3.4, gdp_contrib: 2.1 },
    "Urban Centers":  { youth_unemp: 8.1,  neet: 12.1, formal_emp: 78.2, green_jobs: 8234,  matched: 54120, wage_growth: 4.2, gdp_contrib: 2.9 },
    "Rural Districts":{ youth_unemp: 18.7, neet: 26.4, formal_emp: 52.1, green_jobs: 2891,  matched: 18432, wage_growth: 2.1, gdp_contrib: 1.2 },
    "Coastal Zones":  { youth_unemp: 14.2, neet: 20.1, formal_emp: 62.4, green_jobs: 3812,  matched: 22431, wage_growth: 3.1, gdp_contrib: 1.8 },
    "Industrial Belts":{ youth_unemp: 10.3, neet: 15.6, formal_emp: 72.8, green_jobs: 5201,  matched: 41280, wage_growth: 3.8, gdp_contrib: 2.4 },
  };

  const m = metrics[region];

  const trendData = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2024, i).toLocaleString("default", { month: "short" }),
    placement: Math.round(m.matched / 12 * (0.85 + i * 0.012)),
    green: Math.round(m.green_jobs / 12 * (0.80 + i * 0.018)),
  }));

  const sdgTargets = [
    { target: "8.1", desc: "Sustain economic growth per capita", status: m.gdp_contrib > 2 ? "ON TRACK" : "AT RISK", val: `GDP +${m.gdp_contrib}%` },
    { target: "8.3", desc: "Promote formalization & job creation", status: m.formal_emp > 65 ? "ON TRACK" : "AT RISK", val: `${m.formal_emp}% formal` },
    { target: "8.5", desc: "Full & productive employment", status: m.youth_unemp < 15 ? "ON TRACK" : "NEEDS ACTION", val: `${m.youth_unemp}% youth unemp` },
    { target: "8.6", desc: "Reduce NEET youth substantially", status: m.neet < 20 ? "ON TRACK" : "NEEDS ACTION", val: `${m.neet}% NEET rate` },
    { target: "8.b", desc: "Youth employment strategy operational", status: "ON TRACK", val: `${m.matched.toLocaleString()} matched` },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="fade-in" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700 }}>SDG 8 Impact Report</h1>
            <span className="sdg-badge">UN ALIGNED</span>
          </div>
          <p style={{ color: C.muted, fontSize: 14 }}>Decent Work & Economic Growth · Policy dashboard</p>
        </div>
        <select value={region} onChange={e => setRegion(e.target.value)} style={{ width: "auto" }}>
          {regions.map(r => <option key={r}>{r}</option>)}
        </select>
      </div>

      <div className="grid-4 fade-in-delay-1">
        <KPICard icon="👶" label="Youth Unemployment" value={`${m.youth_unemp}%`} sub="Age 15-24" color={m.youth_unemp < 15 ? C.accent : C.red} delay={1} />
        <KPICard icon="📊" label="Formal Employment" value={`${m.formal_emp}%`} sub="vs 62% baseline" color={C.blue} delay={2} />
        <KPICard icon="🌱" label="Green Jobs Created" value={m.green_jobs.toLocaleString()} sub="SDG 8.4 aligned" color={C.accent} delay={3} />
        <KPICard icon="🎯" label="NEET Rate" value={`${m.neet}%`} sub="Youth not in employment/education" color={m.neet < 20 ? C.yellow : C.red} delay={4} />
      </div>

      <div className="grid-2 fade-in-delay-2">
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>SDG 8 Target Status</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sdgTargets.map(t => (
              <div key={t.target} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: C.subtle, borderRadius: 8 }}>
                <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: C.accent, minWidth: 36 }}>{t.target}</div>
                <div style={{ flex: 1, fontSize: 13 }}>{t.desc}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{t.val}</div>
                <span className={`tag ${t.status === "ON TRACK" ? "tag-green" : t.status === "AT RISK" ? "tag-orange" : "tag-red"}`} style={{ fontSize: 11, whiteSpace: "nowrap" }}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Monthly Placements & Green Jobs</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 11 }} />
              <YAxis tick={{ fill: C.muted, fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: C.muted }} />
              <Bar dataKey="placement" name="Total Placements" fill={C.blue} radius={[4,4,0,0]} />
              <Bar dataKey="green" name="Green Job Placements" fill={C.accent} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card fade-in-delay-3" style={{ borderColor: "#1a6b3a", background: "linear-gradient(135deg, #071410, #111827)" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: 2, minWidth: 250 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#6ef5a0", marginBottom: 8 }}>
              📋 Policy Recommendation Report — {region}
            </h3>
            <div style={{ fontSize: 13, color: "#9ee8b8", lineHeight: 1.8 }}>
              {m.neet > 20 && <div>⚠️ NEET rate {m.neet}% exceeds SDG target. <strong>Priority: Expand vocational training in digital & green skills.</strong></div>}
              {m.youth_unemp > 15 && <div>⚠️ Youth unemployment above threshold. <strong>Priority: Launch micro-credential programs for 18–24 cohort.</strong></div>}
              {m.formal_emp < 65 && <div>⚠️ Informal employment high. <strong>Priority: Incentivize employer formalization through upskilling subsidies.</strong></div>}
              <div>✅ Green job creation on pace. Continue supporting Solar PV, ESG, and Clean Energy pathways.</div>
              <div>✅ Skills matching rate {((m.matched / 124837) * 100).toFixed(1)}% contributing to SDG 8.5 target progress.</div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 12, color: "#9ee8b8", marginBottom: 8 }}>Equity Index</div>
            {[
              { l: "Gender Parity", v: 0.73 },
              { l: "Rural Access", v: region === "Rural Districts" ? 0.48 : 0.65 },
              { l: "Youth Inclusion", v: 0.62 },
              { l: "Disability Access", v: 0.45 },
            ].map(({ l, v }) => (
              <div key={l} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 12, color: "#9ee8b8" }}>{l}</span>
                  <span className="mono" style={{ fontSize: 12, color: v > 0.6 ? C.accent : C.yellow }}>{(v * 100).toFixed(0)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${v * 100}%`, background: v > 0.6 ? C.accent : C.yellow }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────── */
const PAGES = [
  { id: "dashboard", icon: "⬡", label: "Dashboard" },
  { id: "analyze",   icon: "◎", label: "Analyze Gap" },
  { id: "forecast",  icon: "◈", label: "Forecast" },
  { id: "match",     icon: "◉", label: "Job Match" },
  { id: "sdg",       icon: "◍", label: "SDG 8 Report" },
];

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <DashboardPage />;
      case "analyze":   return <AnalyzePage />;
      case "forecast":  return <ForecastPage />;
      case "match":     return <JobMatchPage />;
      case "sdg":       return <SDGPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <>
      <style>{S}</style>
      <div style={{ display: "flex", minHeight: "100vh", background: C.bg }}>

        {/* Sidebar */}
        <div style={{
          width: sidebarOpen ? 220 : 64, flexShrink: 0,
          background: C.surface, borderRight: `1px solid ${C.border}`,
          display: "flex", flexDirection: "column",
          transition: "width 0.25s cubic-bezier(0.16,1,0.3,1)", overflow: "hidden"
        }}>
          {/* Logo */}
          <div style={{ padding: "20px 16px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 700, color: "#000"
              }}>S</div>
              {sidebarOpen && (
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, whiteSpace: "nowrap" }}>SkillGap AI</div>
                  <div style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>SDG 8 Platform</div>
                </div>
              )}
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
            {PAGES.map(p => (
              <div key={p.id} className={`nav-item ${page === p.id ? "active" : ""}`}
                onClick={() => setPage(p.id)}
                style={{ justifyContent: sidebarOpen ? "flex-start" : "center" }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{p.icon}</span>
                {sidebarOpen && <span style={{ whiteSpace: "nowrap" }}>{p.label}</span>}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div style={{ padding: "12px 8px", borderTop: `1px solid ${C.border}` }}>
            <div className="nav-item" onClick={() => setSidebarOpen(o => !o)} style={{ justifyContent: sidebarOpen ? "flex-start" : "center" }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>{sidebarOpen ? "◀" : "▶"}</span>
              {sidebarOpen && <span style={{ fontSize: 12, whiteSpace: "nowrap" }}>Collapse</span>}
            </div>
            {sidebarOpen && (
              <div style={{ padding: "10px 8px", fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
                <div className="sdg-badge" style={{ marginBottom: 6 }}>🌍 SDG 8</div>
                <div>Decent Work &</div>
                <div>Economic Growth</div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Header */}
          <div style={{
            padding: "0 24px", height: 56, borderBottom: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: C.surface, flexShrink: 0
          }}>
            <div style={{ fontSize: 14, color: C.muted }}>
              {PAGES.find(p => p.id === page)?.icon} <strong style={{ color: C.text }}>{PAGES.find(p => p.id === page)?.label}</strong>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.accent, animation: "pulse 2s ease-in-out infinite" }} />
              <span style={{ fontSize: 12, color: C.muted }}>System Online</span>
              <div style={{ width: 1, height: 20, background: C.border }} />
              <span className="mono" style={{ fontSize: 12, color: C.muted }}>v1.0.0-SDG8</span>
            </div>
          </div>

          {/* Page Content */}
          <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
            {renderPage()}
          </div>
        </div>
      </div>
    </>
  );
}