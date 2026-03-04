import { useState, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   PLAIT v6 — The meal planner that plans around your life
   
   What's new:
   - Persona-routed onboarding (5 paths)
   - Three-layer avoid system: Medical / Dietary / Dislikes
   - SVG icon system (no emoji in UI chrome)
   - Illustrated meal cards (abstract SVG art, editorial)
   - "Day" screen with full context sentence
   - Recommendation narration ("why this meal")
   - Shop: Meal / Day / Week modes
   - Household-by-day mechanic visible in plan
   - Cuisine rotation in engine
═══════════════════════════════════════════════════════════════ */

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,300;1,9..144,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');`;

const C = {
  bg:          "#f5f1ea",
  card:        "#ffffff",
  ink:         "#1a1612",
  forest:      "#273d2f",
  forestMid:   "#3a5944",
  forestLight: "#e5ede7",
  forestGhost: "#f0f5f1",
  clay:        "#b85c2a",
  clayLight:   "#fceee6",
  gold:        "#8a7030",
  goldLight:   "#fdf5e0",
  sage:        "#7a9e80",
  sagePale:    "#ddeade",
  muted:       "#6b6355",
  mutedLight:  "#a89e90",
  border:      "#e2d8cc",
  borderLight: "#ede8e0",
  cream:       "#faf7f2",
  nav:         "#181410",
  navBorder:   "rgba(255,255,255,0.07)",
  white:       "#ffffff",
  warn:        "#fef3c7",
  warnText:    "#7c5a0a",
  blue:        "#dbeafe",
  blueText:    "#1d4ed8",
  red:         "#fee2e2",
  redText:     "#991b1b",
  purple:      "#ede9fe",
  purpleText:  "#5b21b6",
};

const F = {
  serif: "'Fraunces', Georgia, serif",
  sans:  "'DM Sans', system-ui, sans-serif",
};

// ── SVG ICON SYSTEM ────────────────────────────────────────────
const Icon = ({ name, size = 20, color = C.ink, strokeWidth = 1.5 }) => {
  const s = { width: size, height: size, flexShrink: 0 };
  const p = { stroke: color, strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };
  const icons = {
    sun:      <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" {...p}/><line x1="12" y1="2" x2="12" y2="4" {...p}/><line x1="12" y1="20" x2="12" y2="22" {...p}/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" {...p}/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" {...p}/><line x1="2" y1="12" x2="4" y2="12" {...p}/><line x1="20" y1="12" x2="22" y2="12" {...p}/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" {...p}/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" {...p}/></svg>,
    cloud:    <svg style={s} viewBox="0 0 24 24"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 0 1 0 9z" {...p}/></svg>,
    rain:     <svg style={s} viewBox="0 0 24 24"><line x1="16" y1="13" x2="16" y2="21" {...p}/><line x1="8" y1="13" x2="8" y2="21" {...p}/><line x1="12" y1="15" x2="12" y2="23" {...p}/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" {...p}/></svg>,
    snow:     <svg style={s} viewBox="0 0 24 24"><line x1="12" y1="2" x2="12" y2="22" {...p}/><path d="m20 17-8-5-8 5" {...p}/><path d="m20 7-8 5-8-5" {...p}/></svg>,
    calendar: <svg style={s} viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" {...p}/><line x1="16" y1="2" x2="16" y2="6" {...p}/><line x1="8" y1="2" x2="8" y2="6" {...p}/><line x1="3" y1="10" x2="21" y2="10" {...p}/></svg>,
    shopping: <svg style={s} viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" {...p}/><line x1="3" y1="6" x2="21" y2="6" {...p}/><path d="M16 10a4 4 0 0 1-8 0" {...p}/></svg>,
    chef:     <svg style={s} viewBox="0 0 24 24"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" {...p}/><line x1="6" y1="17" x2="18" y2="17" {...p}/></svg>,
    compass:  <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" {...p}/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" {...p}/></svg>,
    leaf:     <svg style={s} viewBox="0 0 24 24"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" {...p}/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" {...p}/></svg>,
    users:    <svg style={s} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" {...p}/><circle cx="9" cy="7" r="4" {...p}/><path d="M23 21v-2a4 4 0 0 0-3-3.87" {...p}/><path d="M16 3.13a4 4 0 0 1 0 7.75" {...p}/></svg>,
    user:     <svg style={s} viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" {...p}/><circle cx="12" cy="7" r="4" {...p}/></svg>,
    check:    <svg style={s} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" {...p}/></svg>,
    swap:     <svg style={s} viewBox="0 0 24 24"><polyline points="16 3 21 3 21 8" {...p}/><line x1="4" y1="20" x2="21" y2="3" {...p}/><polyline points="21 16 21 21 16 21" {...p}/><line x1="15" y1="15" x2="21" y2="21" {...p}/></svg>,
    clock:    <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" {...p}/><polyline points="12 6 12 12 16 14" {...p}/></svg>,
    flame:    <svg style={s} viewBox="0 0 24 24"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" {...p}/></svg>,
    muscle:   <svg style={s} viewBox="0 0 24 24"><path d="M6.5 6.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v1.5H9" {...p}/><path d="M15 10.5c0 .83-.67 1.5-1.5 1.5H12v-3h1.5c.83 0 1.5.67 1.5 1.5z" {...p}/><path d="M3 10h3v4H3z" {...p}/><path d="M18 10h3v4h-3z" {...p}/><path d="M6 10v4" {...p}/><path d="M18 10v4" {...p}/><path d="M9 14h6" {...p}/></svg>,
    pound:    <svg style={s} viewBox="0 0 24 24"><path d="M18 7H9.5a3.5 3.5 0 0 0 0 7H11v3H6" {...p}/><line x1="6" y1="17" x2="16" y2="17" {...p}/></svg>,
    arrow:    <svg style={s} viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" {...p}/><polyline points="12 5 19 12 12 19" {...p}/></svg>,
    back:     <svg style={s} viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12" {...p}/><polyline points="12 19 5 12 12 5" {...p}/></svg>,
    plus:     <svg style={s} viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" {...p}/><line x1="5" y1="12" x2="19" y2="12" {...p}/></svg>,
    info:     <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" {...p}/><line x1="12" y1="16" x2="12" y2="12" {...p}/><line x1="12" y1="8" x2="12.01" y2="8" {...p}/></svg>,
    star:     <svg style={s} viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" {...p}/></svg>,
    batch:    <svg style={s} viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" {...p}/></svg>,
    chevDown: <svg style={s} viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" {...p}/></svg>,
    chevUp:   <svg style={s} viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15" {...p}/></svg>,
    sparkle:  <svg style={s} viewBox="0 0 24 24"><path d="M12 3c-1 3-3 5-5 6 2 1 4 3 5 6 1-3 3-5 5-6-2-1-4-3-5-6z" {...p}/><path d="M5 10c-.5 1.5-1.5 2.5-3 3 1.5.5 2.5 1.5 3 3 .5-1.5 1.5-2.5 3-3-1.5-.5-2.5-1.5-3-3z" {...p}/></svg>,
    warning:  <svg style={s} viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" {...p}/><line x1="12" y1="9" x2="12" y2="13" {...p}/><line x1="12" y1="17" x2="12.01" y2="17" {...p}/></svg>,
    sunrise:  <svg style={s} viewBox="0 0 24 24"><path d="M17 18a5 5 0 0 0-10 0" {...p}/><line x1="12" y1="2" x2="12" y2="9" {...p}/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64" {...p}/><line x1="1" y1="18" x2="3" y2="18" {...p}/><line x1="21" y1="18" x2="23" y2="18" {...p}/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22" {...p}/><line x1="23" y1="22" x2="1" y2="22" {...p}/><polyline points="8 6 12 2 16 6" {...p}/></svg>,
    moon:     <svg style={s} viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" {...p}/></svg>,
    home:     <svg style={s} viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" {...p}/><polyline points="9 22 9 12 15 12 15 22" {...p}/></svg>,
  };
  return icons[name] || <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" {...p}/></svg>;
};

// ── MEAL ILLUSTRATIONS — abstract SVG art ─────────────────────
const MealIllustration = ({ type, size = 80 }) => {
  const illustrations = {
    // Breakfast — abstract sunrise + bowl
    breakfast: (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="48" r="22" fill={C.goldLight} opacity="0.9"/>
        <path d="M18 48 Q40 28 62 48" stroke={C.gold} strokeWidth="1.5" fill="none" opacity="0.5"/>
        <circle cx="40" cy="32" r="8" fill={C.gold} opacity="0.3"/>
        <circle cx="40" cy="32" r="4" fill={C.gold} opacity="0.5"/>
        <ellipse cx="40" cy="50" rx="14" ry="10" fill="white" opacity="0.6"/>
        <path d="M30 50 Q35 44 40 47 Q45 50 50 44" stroke={C.clay} strokeWidth="1.5" fill="none"/>
        <circle cx="34" cy="50" r="2" fill={C.clay} opacity="0.5"/>
        <circle cx="46" cy="48" r="1.5" fill={C.gold} opacity="0.6"/>
      </svg>
    ),
    // Lunch — abstract plate + leaves
    lunch: (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="42" r="24" fill={C.forestLight} opacity="0.8"/>
        <circle cx="40" cy="42" r="16" fill="white" opacity="0.7"/>
        <ellipse cx="36" cy="44" rx="8" ry="6" fill={C.sage} opacity="0.5"/>
        <ellipse cx="44" cy="40" rx="6" ry="8" fill={C.forestMid} opacity="0.3"/>
        <path d="M34 38 Q38 34 42 36 Q46 38 44 42" fill={C.forest} opacity="0.4"/>
        <circle cx="40" cy="42" r="3" fill={C.clay} opacity="0.5"/>
        <path d="M28 30 Q32 26 34 30" stroke={C.sage} strokeWidth="1.5" fill="none"/>
        <path d="M48 28 Q52 24 50 30" stroke={C.sage} strokeWidth="1.5" fill="none"/>
      </svg>
    ),
    // Dinner — abstract pan/plate with depth
    dinner: (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
        <ellipse cx="40" cy="52" rx="26" ry="8" fill={C.forest} opacity="0.1"/>
        <circle cx="40" cy="44" r="22" fill={C.clayLight} opacity="0.8"/>
        <ellipse cx="40" cy="44" rx="15" ry="12" fill="white" opacity="0.6"/>
        <path d="M28 44 Q32 36 40 38 Q48 40 50 44 Q48 50 40 52 Q32 50 28 44z" fill={C.clay} opacity="0.25"/>
        <circle cx="37" cy="42" r="3" fill={C.clay} opacity="0.5"/>
        <circle cx="44" cy="45" r="2" fill={C.gold} opacity="0.6"/>
        <circle cx="40" cy="38" r="1.5" fill={C.forest} opacity="0.4"/>
        <line x1="40" y1="22" x2="40" y2="30" stroke={C.muted} strokeWidth="2" strokeLinecap="round"/>
        <line x1="36" y1="26" x2="40" y2="22" stroke={C.muted} strokeWidth="2" strokeLinecap="round"/>
        <line x1="44" y1="26" x2="40" y2="22" stroke={C.muted} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    // Seasonal — abstract botanical
    seasonal: (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="28" fill={C.forestLight} opacity="0.6"/>
        <path d="M40 56 Q30 44 32 32 Q36 20 40 18 Q44 20 48 32 Q50 44 40 56z" fill={C.forest} opacity="0.3"/>
        <path d="M40 56 Q28 50 24 38 Q22 26 28 20 Q34 26 38 38 Q40 48 40 56z" fill={C.sage} opacity="0.4"/>
        <path d="M40 56 Q52 50 56 38 Q58 26 52 20 Q46 26 42 38 Q40 48 40 56z" fill={C.forestMid} opacity="0.3"/>
        <line x1="40" y1="56" x2="40" y2="20" stroke={C.forest} strokeWidth="1" opacity="0.4"/>
      </svg>
    ),
    // Batch — abstract containers
    batch: (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
        <rect x="20" y="36" width="22" height="26" rx="4" fill={C.forestLight} stroke={C.sage} strokeWidth="1.5"/>
        <rect x="24" y="32" width="14" height="6" rx="2" fill={C.sage} opacity="0.6"/>
        <rect x="36" y="30" width="22" height="26" rx="4" fill={C.goldLight} stroke={C.gold} strokeWidth="1.5"/>
        <rect x="40" y="26" width="14" height="6" rx="2" fill={C.gold} opacity="0.5"/>
        <path d="M24 46 Q31 42 38 46" stroke={C.forest} strokeWidth="1.5" fill="none" opacity="0.5"/>
        <path d="M40 40 Q47 36 54 40" stroke={C.gold} strokeWidth="1.5" fill="none" opacity="0.5"/>
      </svg>
    ),
  };
  return illustrations[type] || illustrations.dinner;
};

// ── DATA ───────────────────────────────────────────────────────
const DAYS_SHORT = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const DAYS_LONG  = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const TODAY_IDX  = Math.min(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1, 6);
const NOW_HOUR   = new Date().getHours();

const MONTH = new Date().getMonth() + 1;
const SEASON = ({
  1: { name:"January",  items:["leeks","kale","parsnips","celeriac","blood oranges","chicory"] },
  2: { name:"February", items:["purple sprouting broccoli","leeks","kale","forced rhubarb","chicory"] },
  3: { name:"March",    items:["purple sprouting broccoli","spring greens","radishes","watercress"] },
  4: { name:"April",    items:["asparagus","spring onions","spinach","jersey royals"] },
  5: { name:"May",      items:["asparagus","broad beans","peas","new potatoes"] },
  6: { name:"June",     items:["strawberries","courgettes","fennel","new potatoes"] },
  7: { name:"July",     items:["tomatoes","courgettes","runner beans","sweetcorn"] },
  8: { name:"August",   items:["tomatoes","sweetcorn","aubergine","peppers"] },
  9: { name:"September",items:["butternut squash","wild mushrooms","blackberries","damsons"] },
  10:{ name:"October",  items:["pumpkin","celeriac","wild mushrooms","chestnuts"] },
  11:{ name:"November", items:["parsnips","swede","brussels sprouts","venison"] },
  12:{ name:"December", items:["parsnips","brussels sprouts","clementines","chestnuts"] },
})[MONTH] || { name:"Spring", items:["asparagus","peas","spring greens"] };

// Three-layer avoid system
const AVOID_LAYERS = [
  {
    id: "medical",
    label: "Allergies & intolerances",
    desc: "These filter meals entirely",
    color: C.red,
    textColor: C.redText,
    options: [
      { id:"gluten",    label:"Gluten / Wheat", icon:"🌾" },
      { id:"dairy",     label:"Dairy",          icon:"🥛" },
      { id:"nuts",      label:"Tree nuts",       icon:"🌰" },
      { id:"peanuts",   label:"Peanuts",         icon:"🥜" },
      { id:"eggs",      label:"Eggs",            icon:"🥚" },
      { id:"fish",      label:"Fish",            icon:"🐟" },
      { id:"shellfish", label:"Shellfish",       icon:"🦐" },
      { id:"soya",      label:"Soya",            icon:"🫘" },
      { id:"sesame",    label:"Sesame",          icon:"✨" },
      { id:"celery",    label:"Celery",          icon:"🥬" },
      { id:"mustard",   label:"Mustard",         icon:"🟡" },
    ],
  },
  {
    id: "dietary",
    label: "Dietary choices",
    desc: "Values, religion, lifestyle",
    color: C.forestLight,
    textColor: C.forest,
    options: [
      { id:"vegetarian", label:"Vegetarian",  icon:"🥗" },
      { id:"vegan",      label:"Vegan",        icon:"🌱" },
      { id:"pescatarian",label:"Pescatarian",  icon:"🐠" },
      { id:"halal",      label:"Halal only",   icon:"☪️" },
      { id:"kosher",     label:"Kosher",       icon:"✡️" },
      { id:"no_pork",    label:"No pork",      icon:"🚫" },
      { id:"no_alcohol", label:"No alcohol in cooking", icon:"🍷" },
    ],
  },
  {
    id: "dislikes",
    label: "Strong dislikes",
    desc: "We'll avoid these where possible",
    color: C.goldLight,
    textColor: C.gold,
    options: [
      { id:"spicy",     label:"Spicy food",  icon:"🌶️" },
      { id:"offal",     label:"Offal",       icon:"🫀" },
      { id:"blue_cheese",label:"Blue cheese",icon:"🧀" },
      { id:"anchovies", label:"Anchovies",   icon:"🐟" },
      { id:"coriander", label:"Coriander",   icon:"🌿" },
      { id:"olives",    label:"Olives",      icon:"🫒" },
      { id:"mushrooms", label:"Mushrooms",   icon:"🍄" },
      { id:"onion_garlic",label:"Onion & garlic",icon:"🧅" },
    ],
  },
];

const GOALS = [
  { id:"wellbeing",  label:"Eat well",         desc:"Real food, good variety",       icon:"leaf",  personas:["conscious","coordinator"] },
  { id:"loseweight", label:"Lose weight",       desc:"Lighter, genuinely filling",    icon:"flame", personas:["restarter"] },
  { id:"muscle",     label:"Build muscle",      desc:"Protein-forward, every meal",   icon:"muscle",personas:["restarter"] },
  { id:"family",     label:"Feed the family",   desc:"Everyone happy, every night",   icon:"users", personas:["parent","coordinator"] },
  { id:"budget",     label:"Eat smart",         desc:"Less waste, better value",      icon:"pound", personas:["conscious","solo"] },
];

const HOUSEHOLD_OPTIONS = [
  { id:"solo",    label:"Just me",              desc:"Single-serve, no waste",        icon:"user",  servings:1, persona:"solo" },
  { id:"couple",  label:"Me & a partner",       desc:"For two, easy to scale",        icon:"users", servings:2, persona:"conscious" },
  { id:"family",  label:"Family with kids",     desc:"Kid-friendly, varied portions", icon:"home",  servings:4, persona:"parent" },
  { id:"varies",  label:"It changes day to day",desc:"I'll set it per day",           icon:"calendar", servings:2, persona:"coordinator" },
];

// Recipe library
const RECIPES = [
  // BREAKFASTS
  { id:"b1", slot:"breakfast", name:"Bircher muesli", cal:360, prot:14, cost:1.8, time:5,  tags:["batch","vegetarian"], seasonal:[], cuisine:"british",  goals:["wellbeing","budget","loseweight"], servings:1, batch:true, batchNote:"Prep Sunday — ready Mon–Fri", desc:"Overnight oats, apple juice, berries", why:"Zero effort in the morning — prep it Sunday", ings:[{n:"Rolled oats",q:"80g",a:"grains"},{n:"Apple juice",q:"150ml",a:"other"},{n:"Natural yoghurt",q:"100g",a:"dairy"},{n:"Mixed berries",q:"80g",a:"produce"}], steps:["Mix oats, apple juice and yoghurt in a jar or container","Cover and refrigerate overnight","In the morning, top with berries — done"] },
  { id:"b2", slot:"breakfast", name:"Smoked salmon & rye", cal:380, prot:32, cost:4.5, time:8,  tags:["quick","high-prot"], seasonal:[], cuisine:"british", goals:["muscle","wellbeing"], servings:1, desc:"Rye toast, cream cheese, smoked salmon, lemon", why:"32g protein before you've left the house", ings:[{n:"Smoked salmon",q:"100g",a:"protein"},{n:"Rye bread",q:"2 slices",a:"bakery"},{n:"Cream cheese",q:"2 tbsp",a:"dairy"},{n:"Lemon",q:"½",a:"produce"}], steps:["Toast the rye bread","Spread generously with cream cheese","Layer over smoked salmon","Squeeze over lemon — season with black pepper"] },
  { id:"b3", slot:"breakfast", name:"Greek yoghurt, walnuts & honey", cal:280, prot:22, cost:2.6, time:3, tags:["quick","no-cook","vegetarian"], seasonal:[], cuisine:"mediterranean", goals:["wellbeing","loseweight"], servings:1, desc:"Thick yoghurt, honey, walnuts, black pepper", why:"Three minutes, genuinely good", ings:[{n:"Greek yoghurt",q:"200g",a:"dairy"},{n:"Runny honey",q:"1 tbsp",a:"condiments"},{n:"Walnuts",q:"30g",a:"storecup"}], steps:["Spoon yoghurt into bowl","Drizzle honey over","Scatter walnuts — a grind of black pepper lifts the whole thing"] },
  { id:"b4", slot:"breakfast", name:"Porridge & almond butter", cal:420, prot:16, cost:1.4, time:8, tags:["warming","vegetarian","family"], seasonal:[], cuisine:"british", goals:["wellbeing","budget","family"], servings:1, desc:"Creamy oats, banana, almond butter", why:"Warming on cold mornings, kids love it", ings:[{n:"Porridge oats",q:"80g",a:"grains"},{n:"Whole milk",q:"250ml",a:"dairy"},{n:"Banana",q:"1",a:"produce"},{n:"Almond butter",q:"1 tbsp",a:"condiments"}], steps:["Combine oats and milk in a small pan","Cook on medium heat for 5 minutes, stirring frequently","Transfer to bowl, top with sliced banana and almond butter"] },
  { id:"b5", slot:"breakfast", name:"Protein smoothie bowl", cal:340, prot:36, cost:3.2, time:8, tags:["quick","high-prot"], seasonal:[], cuisine:"other", goals:["muscle","loseweight"], servings:1, desc:"Frozen berries, banana, protein powder, granola", why:"36g protein before you leave the house", ings:[{n:"Protein powder",q:"30g",a:"storecup"},{n:"Frozen berries",q:"100g",a:"produce"},{n:"Banana",q:"1",a:"produce"},{n:"Almond milk",q:"150ml",a:"other"},{n:"Granola",q:"30g",a:"grains"}], steps:["Blend protein powder, berries, banana and almond milk until thick — it should hold its shape","Pour into bowl","Top with granola"] },
  // LUNCHES
  { id:"l1", slot:"lunch", name:"Chicken & bulgur tabbouleh", cal:480, prot:42, cost:6.0, time:20, tags:["meal-prep","high-prot"], seasonal:[], cuisine:"middle-eastern", goals:["muscle","wellbeing"], servings:1, batch:true, batchNote:"Prep 3 portions — keeps 4 days in the fridge", desc:"Shredded chicken, bulgur, parsley, lemon", why:"42g protein, preps beautifully, better the next day", ings:[{n:"Chicken breast",q:"150g",a:"protein"},{n:"Bulgur wheat",q:"80g",a:"grains"},{n:"Flat-leaf parsley",q:"1 bunch",a:"produce"},{n:"Cherry tomatoes",q:"100g",a:"produce"},{n:"Lemon",q:"1",a:"produce"}], steps:["Cook bulgur per packet (about 15 mins), drain well","Shred pre-cooked or poached chicken","Finely chop parsley, halve tomatoes","Mix everything together with a good glug of olive oil and lemon juice","Season generously — it wants quite a lot of salt"] },
  { id:"l2", slot:"lunch", name:"Celeriac & lentil soup", cal:380, prot:22, cost:3.2, time:45, tags:["batch","warming","vegetarian"], seasonal:["celeriac","parsnips"], cuisine:"british", goals:["budget","wellbeing","loseweight"], servings:4, batch:true, batchNote:"Big pot — 4 portions, freezes perfectly", desc:"Roasted celeriac, red lentils, cumin", why:"In season. Costs almost nothing. Freezes brilliantly.", ings:[{n:"Celeriac",q:"1 medium",a:"produce",seasonal:true},{n:"Red lentils",q:"150g",a:"tins"},{n:"Vegetable stock",q:"1L",a:"storecup"},{n:"Onion",q:"1",a:"produce"},{n:"Cumin",q:"1 tsp",a:"condiments"}], steps:["Heat oven to 200°C. Cube celeriac, toss in oil and salt, roast 25 mins until golden","Soften onion in a large pot over medium heat — 8 minutes","Add cumin, stir 1 minute until fragrant","Add lentils, stock, and half the roasted celeriac","Simmer 20 minutes. Blend half the soup, stir back through for texture","Add remaining celeriac, season well"] },
  { id:"l3", slot:"lunch", name:"Tuna Niçoise", cal:420, prot:38, cost:5.0, time:12, tags:["quick","high-prot"], seasonal:[], cuisine:"french", goals:["muscle","loseweight","wellbeing"], servings:1, desc:"Tuna, green beans, olives, tomatoes, mustard dressing", why:"38g protein, no proper cooking required", ings:[{n:"Tuna in olive oil",q:"2 tins",a:"tins"},{n:"Green beans",q:"100g",a:"produce"},{n:"Olives",q:"50g",a:"condiments"},{n:"Cherry tomatoes",q:"100g",a:"produce"},{n:"Dijon mustard",q:"1 tsp",a:"condiments"}], steps:["Blanch green beans in boiling salted water — 3 minutes, then cold water to stop cooking","Drain tuna, keeping the oil for the dressing","Arrange on a plate with tomatoes and olives","Whisk reserved oil with mustard and a squeeze of lemon for dressing"] },
  { id:"l4", slot:"lunch", name:"Kale Caesar with chicken", cal:390, prot:35, cost:5.5, time:12, tags:["seasonal","high-prot"], seasonal:["kale"], cuisine:"british", goals:["muscle","loseweight"], servings:1, desc:"Massaged kale, grilled chicken, parmesan croutons", why:"Kale is at its peak right now — holds dressing unlike lettuce", ings:[{n:"Kale",q:"100g",a:"produce",seasonal:true},{n:"Chicken breast",q:"120g",a:"protein"},{n:"Parmesan",q:"30g",a:"dairy"},{n:"Caesar dressing",q:"3 tbsp",a:"condiments"},{n:"Sourdough",q:"1 slice",a:"bakery"}], steps:["Massage kale with a little dressing — really work it in for 2 minutes, it softens","Pan-fry or grill chicken breast 4 mins each side, rest 3 mins","Tear sourdough, toast in dry pan until crisp","Slice chicken over kale, top with parmesan and croutons"] },
  { id:"l5", slot:"lunch", name:"Leftover lamb wraps", cal:510, prot:38, cost:2.0, time:10, tags:["leftover","quick","family"], seasonal:[], cuisine:"middle-eastern", goals:["budget","family"], servings:2, desc:"Slow-cooked lamb, tzatziki, flatbread, pickled onion", why:"Uses Sunday's lamb. Better than the original.", ings:[{n:"Leftover lamb",q:"200g",a:"protein"},{n:"Flatbreads",q:"2",a:"bakery"},{n:"Greek yoghurt",q:"100g",a:"dairy"},{n:"Cucumber",q:"¼",a:"produce"},{n:"Red onion",q:"½",a:"produce"}], steps:["Warm lamb in pan with a splash of water — just to heat through, not re-cook","Quick tzatziki: grate cucumber into yoghurt, add chopped mint and garlic","Thinly slice red onion, toss with a tiny splash of red wine vinegar","Warm flatbreads in dry pan, assemble at table"] },
  { id:"l6", slot:"lunch", name:"Warm mezze board", cal:520, prot:22, cost:5.8, time:15, tags:["relaxed","family","vegetarian"], seasonal:[], cuisine:"middle-eastern", goals:["family","wellbeing"], servings:2, desc:"Hummus, feta, flatbreads, peppers, cucumber", why:"Kids love it. Zero cooking. Genuinely delicious.", ings:[{n:"Hummus",q:"200g",a:"tins"},{n:"Flatbreads",q:"4",a:"bakery"},{n:"Feta",q:"100g",a:"dairy"},{n:"Roasted peppers",q:"100g",a:"tins"},{n:"Cucumber",q:"½",a:"produce"}], steps:["Warm flatbreads in a dry pan — 1 minute each side","Spread hummus on a board or large plate","Add crumbled feta, sliced peppers, cucumber","Drizzle everything with good olive oil — a little dried oregano on top"] },
  // DINNERS
  { id:"d1", slot:"dinner", name:"Sea bass, capers & lemon", cal:520, prot:48, cost:12.0, time:25, tags:["quick","elegant","high-prot"], seasonal:[], cuisine:"mediterranean", goals:["wellbeing","muscle","loseweight"], servings:2, desc:"Pan-fried sea bass, cherry tomatoes, capers, lemon butter", why:"Restaurant quality in 25 minutes", ings:[{n:"Sea bass fillets",q:"2",a:"protein"},{n:"Cherry tomatoes",q:"150g",a:"produce"},{n:"Capers",q:"2 tbsp",a:"condiments"},{n:"Lemon",q:"1",a:"produce"},{n:"Butter",q:"20g",a:"dairy"}], steps:["Heat oven to 200°C. Roast tomatoes in a tray with oil and salt — 10 minutes","Score fish skin, pat dry, season both sides well","Heat oil in heavy pan until smoking — it must be very hot","Lay fish skin-down, press gently. Don't move it — 3 minutes","Flip, cook 1 minute. Remove to rest","Deglaze pan with lemon juice over medium heat, add capers and butter, swirl together","Pour over fish and tomatoes"] },
  { id:"d2", slot:"dinner", name:"Slow-cooked lamb shoulder", cal:680, prot:56, cost:15.0, time:250, tags:["weekend","family","batch"], seasonal:[], cuisine:"middle-eastern", goals:["family","wellbeing"], servings:4, batch:true, batchNote:"Makes Monday's wraps for free", desc:"4-hour braised lamb, garlic, rosemary, tomatoes", why:"Sunday ritual. The leftovers pay dividends all week.", ings:[{n:"Lamb shoulder",q:"1.5kg",a:"protein"},{n:"Garlic",q:"6 cloves",a:"produce"},{n:"Rosemary",q:"3 sprigs",a:"produce"},{n:"Tinned tomatoes",q:"400g",a:"tins"},{n:"Onion",q:"2",a:"produce"},{n:"Red wine",q:"200ml",a:"other"}], steps:["Heat oven to 160°C","Heat a large casserole or roasting tin until very hot. Brown shoulder all over — 10 minutes. It should have real colour.","Remove. Add halved onions, whole unpeeled garlic cloves, rosemary","Pour over tinned tomatoes and wine. Sit lamb on top","Cover tightly with lid or foil. Cook 4 hours — check it's not drying out at 3 hours","Rest 30 minutes. Shred with two forks — it should fall apart."] },
  { id:"d3", slot:"dinner", name:"Turkey meatballs & courgetti", cal:490, prot:52, cost:8.0, time:30, tags:["quick","high-prot","family"], seasonal:[], cuisine:"italian", goals:["muscle","loseweight","family"], servings:2, batch:true, batchNote:"Double the batch and freeze half", desc:"Turkey meatballs, tomato sauce, courgette noodles", why:"52g protein, kids eat it, freezes perfectly", ings:[{n:"Turkey mince",q:"400g",a:"protein"},{n:"Courgette",q:"2",a:"produce"},{n:"Tinned tomatoes",q:"400g",a:"tins"},{n:"Garlic",q:"3 cloves",a:"produce"},{n:"Parmesan",q:"30g",a:"dairy"}], steps:["Mix turkey mince with crushed garlic, grated parmesan, salt and pepper","Roll into golf ball-sized balls — wet your hands first","Brown all over in batches (don't crowd the pan) — about 4 mins per batch","Add tinned tomatoes, simmer 15 minutes","Spiralise courgette. Add to sauce raw in the last 2 minutes — it wilts in the heat"] },
  { id:"d4", slot:"dinner", name:"Chicken souvlaki", cal:560, prot:55, cost:9.0, time:25, tags:["family","high-prot","quick"], seasonal:[], cuisine:"mediterranean", goals:["family","muscle","wellbeing"], servings:4, desc:"Grilled chicken thighs, tzatziki, warm pittas", why:"Everyone eats it. Kids, adults, first-time guests.", ings:[{n:"Chicken thighs",q:"600g",a:"protein"},{n:"Greek yoghurt",q:"200g",a:"dairy"},{n:"Cucumber",q:"½",a:"produce"},{n:"Pittas",q:"4",a:"bakery"},{n:"Lemon",q:"1",a:"produce"},{n:"Dried oregano",q:"2 tsp",a:"condiments"}], steps:["Mix chicken with oil, oregano, lemon zest, crushed garlic — marinate if time allows","Grill on high heat 6 mins each side until charred","Rest 5 minutes — don't skip this","Tzatziki: grate cucumber, squeeze out moisture, mix with yoghurt, mint, garlic, lemon","Warm pittas, serve everything together at table"] },
  { id:"d5", slot:"dinner", name:"Chickpea & parsnip tagine", cal:440, prot:24, cost:5.5, time:45, tags:["vegetarian","warming","batch","family"], seasonal:["parsnips"], cuisine:"north-african", goals:["budget","wellbeing","family"], servings:4, batch:true, batchNote:"Better the next day. Make Sunday.", desc:"Parsnips, chickpeas, ras el hanout, couscous", why:"Parsnips in season. Costs almost nothing. Feeds four.", ings:[{n:"Parsnips",q:"400g",a:"produce",seasonal:true},{n:"Chickpeas",q:"400g",a:"tins"},{n:"Tinned tomatoes",q:"400g",a:"tins"},{n:"Ras el hanout",q:"2 tsp",a:"condiments"},{n:"Couscous",q:"200g",a:"grains"},{n:"Onion",q:"1",a:"produce"}], steps:["Soften onion in a large pan with oil over medium heat — 8 minutes","Add ras el hanout, stir 1 minute","Add parsnip chunks, chickpeas, tomatoes, 300ml water","Cover and simmer 30 minutes until parsnips are tender — check seasoning","Pour 250ml boiling water over couscous, cover 5 minutes, fluff with fork"] },
  { id:"d6", slot:"dinner", name:"Miso salmon & kale", cal:510, prot:46, cost:10.5, time:20, tags:["quick","elegant","seasonal"], seasonal:["kale"], cuisine:"asian", goals:["muscle","loseweight","wellbeing"], servings:2, desc:"White miso-glazed salmon, wilted kale, sesame", why:"Kale is at its best right now. 20 minutes.", ings:[{n:"Salmon fillets",q:"2",a:"protein"},{n:"Kale",q:"100g",a:"produce",seasonal:true},{n:"White miso paste",q:"2 tbsp",a:"condiments"},{n:"Ginger",q:"1 thumb",a:"produce"},{n:"Soy sauce",q:"1 tbsp",a:"condiments"},{n:"Sesame oil",q:"1 tsp",a:"condiments"}], steps:["Mix miso, soy, grated ginger and sesame oil into a glaze","Brush generously over salmon fillets","Bake at 200°C for 12 minutes — it should caramelise slightly","While it cooks, wilt kale in same pan with a splash of water and sesame oil","Serve with steamed rice or noodles"] },
  { id:"d7", slot:"dinner", name:"One-pan sausage & beans", cal:520, prot:34, cost:5.5, time:35, tags:["quick","family","budget"], seasonal:[], cuisine:"british", goals:["family","budget"], servings:4, desc:"Good sausages, cannellini beans, tomatoes, sage", why:"One pan, 35 minutes, kids eat it, costs almost nothing", ings:[{n:"Good sausages",q:"8",a:"protein"},{n:"Cannellini beans",q:"400g",a:"tins"},{n:"Tinned tomatoes",q:"400g",a:"tins"},{n:"Sage",q:"6 leaves",a:"produce"},{n:"Garlic",q:"2 cloves",a:"produce"}], steps:["Brown sausages all over in large oven-safe pan — about 8 minutes","Remove. Add sliced garlic and sage leaves to the sausage fat — 1 minute","Add tomatoes and beans, stir well","Nestle sausages back in. Cover, simmer 25 minutes","Taste for seasoning — needs more than you'd expect"] },
  { id:"d8", slot:"dinner", name:"Roast chicken & fennel", cal:580, prot:54, cost:11.0, time:90, tags:["weekend","family","batch"], seasonal:["blood oranges"], cuisine:"french", goals:["family","wellbeing"], servings:4, batch:true, batchNote:"Carcass makes stock. Cold leftovers tomorrow.", desc:"Whole roast chicken, fennel, blood oranges", why:"Sunday ritual. Leftovers all week.", ings:[{n:"Whole chicken",q:"1.6kg",a:"protein"},{n:"Fennel bulb",q:"2",a:"produce"},{n:"Blood oranges",q:"2",a:"produce",seasonal:true},{n:"Garlic",q:"4 cloves",a:"produce"},{n:"Butter",q:"40g",a:"dairy"}], steps:["Heat oven to 200°C","Quarter fennel lengthways, halve blood oranges, lay in roasting tin with whole garlic","Rub chicken generously all over with softened butter, season very well","Sit on vegetables. Roast 1 hour 10 minutes","Test: juices should run clear when you pierce the thigh","Rest 15 minutes before carving — non-negotiable","Use the tin juices as the jus"] },
  { id:"d9", slot:"dinner", name:"Prawn stir-fry", cal:420, prot:38, cost:9.0, time:15, tags:["quick","high-prot"], seasonal:[], cuisine:"asian", goals:["muscle","loseweight"], servings:2, desc:"King prawns, pak choi, ginger, garlic, soy noodles", why:"15 minutes. Faster than a takeaway.", ings:[{n:"King prawns",q:"300g",a:"protein"},{n:"Pak choi",q:"2",a:"produce"},{n:"Noodles",q:"200g",a:"grains"},{n:"Ginger",q:"1 thumb",a:"produce"},{n:"Garlic",q:"2 cloves",a:"produce"},{n:"Soy sauce",q:"2 tbsp",a:"condiments"}], steps:["Cook noodles per packet, drain, toss with a little sesame oil","Heat wok or large pan until smoking — really hot","Stir-fry prawns 2 minutes — just turning pink","Add garlic, ginger, pak choi — toss 2 minutes","Add noodles and soy, toss everything together over high heat"] },
  { id:"d10", slot:"dinner", name:"Pork tenderloin & celeriac", cal:600, prot:52, cost:10.0, time:45, tags:["weekend","elegant"], seasonal:["celeriac"], cuisine:"french", goals:["wellbeing","muscle"], servings:2, desc:"Roasted tenderloin, celeriac gratin, mustard jus", why:"Weekend cooking that feels like a restaurant", ings:[{n:"Pork tenderloin",q:"600g",a:"protein"},{n:"Celeriac",q:"1 medium",a:"produce",seasonal:true},{n:"Dijon mustard",q:"2 tbsp",a:"condiments"},{n:"Thyme",q:"3 sprigs",a:"produce"},{n:"Crème fraîche",q:"100ml",a:"dairy"}], steps:["Heat oven to 200°C. Cube celeriac, toss in oil and salt, roast 30 mins","Rub tenderloin all over with Dijon mustard and thyme leaves","Sear in very hot pan all over — 3 minutes total","Roast alongside celeriac for 15 minutes, rest 5","Deglaze pan with 100ml stock, add crème fraîche, simmer to sauce"] },
];

const AISLES = {
  protein:    { label:"Meat & Fish",    icon:"flame", order:1 },
  dairy:      { label:"Dairy",          icon:"info",  order:2 },
  produce:    { label:"Fresh Produce",  icon:"leaf",  order:3 },
  grains:     { label:"Grains & Pasta", icon:"batch", order:4 },
  tins:       { label:"Tins & Pulses",  icon:"batch", order:5 },
  condiments: { label:"Oils & Sauces",  icon:"star",  order:6 },
  bakery:     { label:"Bakery",         icon:"home",  order:7 },
  storecup:   { label:"Store Cupboard", icon:"batch", order:8 },
  other:      { label:"Other",          icon:"plus",  order:9 },
};

// Weather helpers
function wxDecode(code, max) {
  if (code >= 80) return { iconName:"rain",  label:"Showers",  mood:"rainy", cold: max < 12 };
  if (code >= 61) return { iconName:"rain",  label:"Rainy",    mood:"rainy", cold: max < 12 };
  if (code >= 51) return { iconName:"cloud", label:"Drizzle",  mood:"rainy", cold: max < 12 };
  if (code === 3)  return { iconName:"cloud", label:"Overcast", mood: max < 10 ? "cold" : "mild", cold: max < 10 };
  if (code <= 1)   return { iconName:"sun",   label:"Clear",    mood: max > 16 ? "warm" : "mild", cold: max < 8 };
  return { iconName:"cloud", label:"Cloudy", mood:"mild", cold: max < 10 };
}

function useWeather() {
  const [wx, setWx] = useState(null);
  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=51.5074&longitude=-0.1278&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Europe/London&forecast_days=7")
      .then(r => r.json())
      .then(d => {
        const days = DAYS_SHORT.map((day, i) => ({
          day,
          code: d.daily.weathercode[i],
          max:  Math.round(d.daily.temperature_2m_max[i]),
          min:  Math.round(d.daily.temperature_2m_min[i]),
        }));
        setWx({ days });
      })
      .catch(() => {
        const fallbackCodes = [63, 61, 3, 2, 80, 1, 2];
        const fallbackMax   = [9, 8, 11, 12, 10, 13, 14];
        const fallbackMin   = [4, 3, 5, 6, 4, 7, 8];
        setWx({
          days: DAYS_SHORT.map((day, i) => ({
            day,
            code: fallbackCodes[i],
            max:  fallbackMax[i],
            min:  fallbackMin[i],
          })),
        });
      });
  }, []);
  return wx;
}

// Recommendation engine
function scoreRecipe(r, ctx) {
  let score = 50;
  const { goal, wxMood, cold, slot, isWeeknight, servings, recentIds = [], recentCuisines = [] } = ctx;
  if (r.goals?.includes(goal)) score += 20;
  if (cold && (wxMood === "rainy" || wxMood === "cold")) score += 12;
  if (!cold && r.tags?.includes("quick")) score += 5;
  if (r.seasonal?.some(s => SEASON.items.includes(s))) score += 15;
  if (isWeeknight && r.time <= 30) score += 10;
  if (isWeeknight && r.time > 90) score -= 15;
  if (recentIds.includes(r.id)) score -= 40;
  if (recentCuisines.includes(r.cuisine)) score -= 10;
  if (servings === 1 && r.tags?.includes("quick")) score += 8;
  if (servings >= 4 && r.tags?.includes("family")) score += 12;
  return score + Math.random() * 5; // small variance prevents lock-in
}

function recommend(slot, ctx, count = 6) {
  return RECIPES
    .filter(r => r.slot === slot)
    .map(r => ({ ...r, score: scoreRecipe(r, ctx) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}

function buildWeek(profile) {
  const { goal, servings = 2 } = profile;
  const usedIds = [];
  const usedCuisines = [];
  const week = {};
  DAYS_SHORT.forEach((day, i) => {
    const isWeeknight = i < 5;
    const wDay = { code: [63,61,3,2,80,1,2][i], max: [9,8,11,12,10,13,14][i] };
    const wx   = wxDecode(wDay.code, wDay.max);
    const ctx  = { goal, wxMood: wx.mood, cold: wx.cold, isWeeknight, servings, recentIds: [...usedIds], recentCuisines: [...usedCuisines] };
    const b = recommend("breakfast", ctx, 3)[0] || RECIPES.find(r => r.slot === "breakfast");
    const l = recommend("lunch",     ctx, 3)[0] || RECIPES.find(r => r.slot === "lunch");
    const d = recommend("dinner",    ctx, 3)[0] || RECIPES.find(r => r.slot === "dinner");
    [b, l, d].forEach(r => { if (r) { usedIds.push(r.id); if (r.cuisine && !usedCuisines.includes(r.cuisine)) usedCuisines.push(r.cuisine); } });
    week[day] = { breakfast: b?.id, lunch: l?.id, dinner: d?.id, servings };
  });
  return week;
}

function getMeal(id) { return RECIPES.find(r => r.id === id); }

function dayTotals(dayPlan) {
  return ["breakfast","lunch","dinner"].reduce((a, s) => {
    const m = getMeal(dayPlan?.[s]);
    return m ? { cal: a.cal + m.cal, prot: a.prot + m.prot, cost: a.cost + m.cost } : a;
  }, { cal: 0, prot: 0, cost: 0 });
}

// Generate "why" narration based on context
function getMealWhy(recipe, ctx) {
  if (!recipe) return null;
  const { wxMood, cold, isWeeknight, goal, isLeftover } = ctx;
  if (isLeftover) return "Uses what you've already got — nothing wasted";
  if (recipe.seasonal?.some(s => SEASON.items.includes(s))) return `${SEASON.name} seasonal — at its best right now`;
  if (cold && recipe.tags?.includes("warming")) return "Cold and wet today — this one warms you up";
  if (isWeeknight && recipe.time <= 20) return `${recipe.time} minutes — quick enough for a weeknight`;
  if (recipe.goals?.includes("muscle") && goal === "muscle") return `${recipe.prot}g protein — solid hit towards your goal`;
  if (recipe.goals?.includes("loseweight") && goal === "loseweight") return "Filling but lighter — fits your goal";
  if (recipe.goals?.includes("budget") && goal === "budget") return `£${recipe.cost.toFixed(2)} per serving — good value`;
  if (recipe.batch) return recipe.batchNote || "Make extra — pays off later in the week";
  return recipe.why || null;
}

// ── SHARED COMPONENTS ──────────────────────────────────────────
function Tag({ children, color = C.bg, textColor = C.muted, iconName }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:100, background:color, color:textColor, fontFamily:F.sans, fontSize:11, fontWeight:500, whiteSpace:"nowrap", lineHeight:1.4 }}>
      {iconName && <Icon name={iconName} size={11} color={textColor} strokeWidth={2}/>}
      {children}
    </span>
  );
}

function MealCard({ recipe, compact, showWhy, whyText, onSwap, onCook }) {
  if (!recipe) return null;
  const isSeasonal = recipe.seasonal?.some(s => SEASON.items.includes(s));
  const illustType = recipe.slot === "breakfast" ? "breakfast" : recipe.slot === "lunch" ? "lunch" : isSeasonal ? "seasonal" : recipe.batch ? "batch" : "dinner";

  return (
    <div style={{ background: C.card, borderRadius: 18, overflow:"hidden", border:`1px solid ${C.border}`, position:"relative" }}>
      {/* Illustration strip */}
      <div style={{ background:`linear-gradient(135deg, ${C.cream} 0%, ${C.bg} 100%)`, padding:"16px 16px 0", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ flex:1, paddingRight:8 }}>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:7 }}>
            {isSeasonal && <Tag color={C.sagePale} textColor={C.forest} iconName="leaf">Seasonal</Tag>}
            {recipe.batch && <Tag color={C.forestLight} textColor={C.forestMid} iconName="batch">Batch</Tag>}
            {recipe.time <= 20 && <Tag color={C.warn} textColor={C.warnText} iconName="clock">Quick</Tag>}
          </div>
          <div style={{ fontFamily:F.serif, fontSize: compact ? 17 : 21, color:C.ink, fontWeight:400, lineHeight:1.25, marginBottom:4 }}>{recipe.name}</div>
          {!compact && <div style={{ fontFamily:F.sans, fontSize:12, color:C.muted, lineHeight:1.5 }}>{recipe.desc}</div>}
        </div>
        <div style={{ flexShrink:0, opacity:0.9 }}>
          <MealIllustration type={illustType} size={compact ? 56 : 72} />
        </div>
      </div>

      <div style={{ padding:"12px 16px 14px" }}>
        {/* Stats row */}
        <div style={{ display:"flex", gap:14, marginBottom: (showWhy && whyText) ? 10 : 0 }}>
          <span style={{ display:"flex", alignItems:"center", gap:4, fontFamily:F.sans, fontSize:12, color:C.muted }}>
            <Icon name="flame" size={13} color={C.clay} strokeWidth={2}/>{recipe.cal}kcal
          </span>
          <span style={{ display:"flex", alignItems:"center", gap:4, fontFamily:F.sans, fontSize:12, color:C.muted }}>
            <Icon name="muscle" size={13} color={C.forestMid} strokeWidth={2}/>{recipe.prot}g
          </span>
          <span style={{ display:"flex", alignItems:"center", gap:4, fontFamily:F.sans, fontSize:12, color:C.muted }}>
            <Icon name="clock" size={13} color={C.muted} strokeWidth={2}/>{recipe.time}m
          </span>
          <span style={{ display:"flex", alignItems:"center", gap:4, fontFamily:F.sans, fontSize:12, color:C.muted }}>
            <Icon name="pound" size={13} color={C.gold} strokeWidth={2}/>£{recipe.cost.toFixed(2)}
          </span>
        </div>

        {/* Why narration */}
        {showWhy && whyText && (
          <div style={{ display:"flex", alignItems:"flex-start", gap:7, background:C.forestGhost, borderRadius:10, padding:"8px 10px", marginBottom:10 }}>
            <Icon name="sparkle" size={14} color={C.forest} strokeWidth={2}/>
            <span style={{ fontFamily:F.sans, fontSize:12, color:C.forest, lineHeight:1.4 }}>{whyText}</span>
          </div>
        )}

        {/* Batch note */}
        {!compact && recipe.batchNote && (
          <div style={{ display:"flex", alignItems:"flex-start", gap:7, background:C.goldLight, borderRadius:10, padding:"8px 10px", marginBottom:10 }}>
            <Icon name="batch" size={14} color={C.gold} strokeWidth={2}/>
            <span style={{ fontFamily:F.sans, fontSize:12, color:C.gold, lineHeight:1.4 }}>{recipe.batchNote}</span>
          </div>
        )}

        {/* Actions */}
        {(onSwap || onCook) && (
          <div style={{ display:"flex", gap:8, marginTop:4 }}>
            {onSwap && (
              <button onClick={onSwap} style={{ flex:1, padding:"9px", borderRadius:10, border:`1.5px solid ${C.border}`, background:"transparent", color:C.muted, fontFamily:F.sans, fontSize:12, fontWeight:500, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
                <Icon name="swap" size={13} color={C.muted} strokeWidth={2}/>Swap
              </button>
            )}
            {onCook && (
              <button onClick={onCook} style={{ flex:2, padding:"9px", borderRadius:10, border:"none", background:C.forest, color:C.cream, fontFamily:F.sans, fontSize:12, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
                <Icon name="chef" size={13} color={C.cream} strokeWidth={2}/>Start cooking
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── ONBOARDING ─────────────────────────────────────────────────
function Onboarding({ onComplete }) {
  const [step, setStep]       = useState(0);
  const [profile, setProfile] = useState({ goal: null, household: null, servings: 2, avoidMedical: [], avoidDietary: [], avoidDislikes: [], persona: null });

  const set = (updates) => setProfile(p => ({ ...p, ...updates }));
  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  // Derive persona from goal + household
  function derivePersona(goal, household) {
    if (household === "family") return "parent";
    if (household === "solo") return "solo";
    if (goal === "loseweight" || goal === "muscle") return "restarter";
    if (goal === "budget") return "conscious";
    if (household === "varies") return "coordinator";
    return "conscious";
  }

  // Persona-specific step 4 configs
  const personaStep = {
    parent: {
      title: "Which days are the kids home?",
      subtitle: "Plait adjusts meals, portions and timing based on who's around",
      type: "days",
    },
    restarter: {
      title: "Anything we should know?",
      subtitle: "Optional — helps Plait surface the right meals",
      type: "health",
      options: [
        { id:"glp1",      label:"Taking GLP-1 medication",    desc:"High protein, nutrient-dense meals" },
        { id:"training",  label:"Training most days",          desc:"Higher protein and calorie targets" },
        { id:"recovering",label:"Recovering from injury",      desc:"Anti-inflammatory, gentle nutrition" },
        { id:"none",      label:"None of the above",           desc:"" },
      ],
    },
    conscious: {
      title: "Where do you usually shop?",
      subtitle: "Plait splits your list by store",
      type: "shops",
      options: [
        { id:"supermarket", label:"Mostly supermarket",  desc:"Tesco, Sainsbury's, Waitrose, etc." },
        { id:"mixed",       label:"Supermarket + market",desc:"Farmers market or butcher too" },
        { id:"budget",      label:"Budget shops",         desc:"Aldi, Lidl, Co-op" },
        { id:"online",      label:"Mainly online",        desc:"Ocado, supermarket delivery" },
      ],
    },
    solo: {
      title: "What's your biggest food frustration?",
      subtitle: "We'll focus on solving this first",
      type: "frustration",
      options: [
        { id:"waste",   label:"Ingredients going to waste", desc:"Half a cabbage, brown herbs" },
        { id:"effort",  label:"Cooking for one feels pointless", desc:"Too much effort for too little reward" },
        { id:"variety", label:"Eating the same things",     desc:"Stuck in a boring rotation" },
        { id:"cost",    label:"Spending too much",          desc:"Food bill doesn't match the meals" },
      ],
    },
    coordinator: {
      title: "Anyone with dietary needs?",
      subtitle: "You can add per-person details — Plait handles it silently",
      type: "household-constraints",
      options: [
        { id:"kids",      label:"Kids who are picky",         desc:"Simple, kid-approved options on those nights" },
        { id:"allergies", label:"Someone with allergies",     desc:"We'll handle it per person" },
        { id:"diets",     label:"Different diets in the house", desc:"Vegetarian, dairy-free, etc." },
        { id:"none",      label:"We're all pretty flexible",  desc:"" },
      ],
    },
  };

  const totalSteps = 6;
  const progress = step / totalSteps;

  const screenStyle = {
    height: "100vh", background: "#1a1612", display: "flex", flexDirection: "column",
    overflow: "hidden", position: "relative",
  };
  const headStyle = { padding: "52px 24px 20px", flexShrink: 0 };
  const bodyStyle = { flex: 1, overflowY: "auto", padding: "0 24px" };
  const footStyle = { padding: "16px 24px 44px", flexShrink: 0 };

  const progressBar = (
    <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"rgba(255,255,255,0.08)" }}>
      <div style={{ height:"100%", background:C.clay, width:`${progress * 100}%`, transition:"width 0.4s ease" }}/>
    </div>
  );
  const backBtn = step > 0 && step < totalSteps && (
    <button onClick={back} style={{ position:"absolute", top:14, left:16, background:"none", border:"none", color:"rgba(250,248,244,0.35)", cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontFamily:F.sans, fontSize:13, zIndex:10 }}>
      <Icon name="back" size={16} color="rgba(250,248,244,0.35)" strokeWidth={1.5}/>
    </button>
  );

  // Step 0 — Welcome
  if (step === 0) return (
    <div style={screenStyle}>
      <style>{FONTS}</style>
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 28px", textAlign:"center" }}>
        <div style={{ width:68, height:68, borderRadius:22, background:C.forest, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:28 }}>
          <Icon name="leaf" size={30} color={C.cream} strokeWidth={1.5}/>
        </div>
        <div style={{ fontFamily:F.serif, fontSize:40, color:C.cream, fontWeight:300, lineHeight:1.1, marginBottom:16, letterSpacing:"-0.02em" }}>
          Meet Plait.
        </div>
        <div style={{ fontFamily:F.sans, fontSize:15, color:"rgba(250,248,244,0.5)", lineHeight:1.7, maxWidth:260 }}>
          The meal planner that plans around your life, not just your diet.
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:32, width:"100%", maxWidth:280 }}>
          {[
            { icon:"calendar", text:"Knows who's home when" },
            { icon:"cloud",    text:"Weather and season aware" },
            { icon:"sparkle",  text:"Learns your household over time" },
          ].map(f => (
            <div key={f.text} style={{ display:"flex", alignItems:"center", gap:12, background:"rgba(255,255,255,0.05)", borderRadius:12, padding:"11px 14px" }}>
              <Icon name={f.icon} size={16} color={C.sage} strokeWidth={1.5}/>
              <span style={{ fontFamily:F.sans, fontSize:13, color:"rgba(250,248,244,0.55)" }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={footStyle}>
        <button onClick={next} style={{ width:"100%", padding:"16px", borderRadius:14, border:"none", background:C.clay, color:C.cream, fontFamily:F.sans, fontSize:16, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          Get started <Icon name="arrow" size={18} color={C.cream} strokeWidth={2}/>
        </button>
        <div style={{ fontFamily:F.sans, fontSize:11, color:"rgba(250,248,244,0.2)", textAlign:"center", marginTop:10 }}>Three questions. No account needed.</div>
      </div>
    </div>
  );

  // Step 1 — Goal
  if (step === 1) return (
    <div style={screenStyle}>
      <style>{FONTS}</style>
      {progressBar}{backBtn}
      <div style={headStyle}>
        <div style={{ fontFamily:F.sans, fontSize:11, color:"rgba(250,248,244,0.3)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>1 of 3</div>
        <div style={{ fontFamily:F.serif, fontSize:30, color:C.cream, fontWeight:300, lineHeight:1.2, marginBottom:5 }}>What do you want from your food?</div>
        <div style={{ fontFamily:F.sans, fontSize:13, color:"rgba(250,248,244,0.4)" }}>This shapes everything Plait suggests</div>
      </div>
      <div style={{ ...bodyStyle, display:"flex", flexDirection:"column", gap:9, paddingBottom:24 }}>
        {GOALS.map(g => (
          <button key={g.id} onClick={() => { set({ goal: g.id }); next(); }}
            style={{ padding:"15px 16px", borderRadius:14, border:`1.5px solid ${profile.goal===g.id ? C.forest : "rgba(255,255,255,0.07)"}`, background: profile.goal===g.id ? "rgba(42,74,53,0.45)" : "rgba(255,255,255,0.03)", cursor:"pointer", textAlign:"left", transition:"all 0.15s" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:"rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Icon name={g.icon} size={18} color={profile.goal===g.id ? C.sage : "rgba(250,248,244,0.4)"} strokeWidth={1.5}/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:F.sans, fontSize:15, color:C.cream, fontWeight:600, marginBottom:2 }}>{g.label}</div>
                <div style={{ fontFamily:F.sans, fontSize:12, color:"rgba(250,248,244,0.4)" }}>{g.desc}</div>
              </div>
              {profile.goal === g.id && <Icon name="check" size={16} color={C.sage} strokeWidth={2.5}/>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // Step 2 — Household
  if (step === 2) return (
    <div style={screenStyle}>
      <style>{FONTS}</style>
      {progressBar}{backBtn}
      <div style={headStyle}>
        <div style={{ fontFamily:F.sans, fontSize:11, color:"rgba(250,248,244,0.3)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>2 of 3</div>
        <div style={{ fontFamily:F.serif, fontSize:30, color:C.cream, fontWeight:300, lineHeight:1.2, marginBottom:5 }}>Who are you usually cooking for?</div>
        <div style={{ fontFamily:F.sans, fontSize:13, color:"rgba(250,248,244,0.4)" }}>You can adjust this day by day later</div>
      </div>
      <div style={{ ...bodyStyle, display:"flex", flexDirection:"column", gap:9, paddingBottom:24 }}>
        {HOUSEHOLD_OPTIONS.map(h => (
          <button key={h.id} onClick={() => { const persona = derivePersona(profile.goal, h.id); set({ household: h.id, servings: h.servings, persona }); next(); }}
            style={{ padding:"15px 16px", borderRadius:14, border:`1.5px solid ${profile.household===h.id ? C.forest : "rgba(255,255,255,0.07)"}`, background: profile.household===h.id ? "rgba(42,74,53,0.45)" : "rgba(255,255,255,0.03)", cursor:"pointer", textAlign:"left", transition:"all 0.15s" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:"rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Icon name={h.icon} size={18} color={profile.household===h.id ? C.sage : "rgba(250,248,244,0.4)"} strokeWidth={1.5}/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:F.sans, fontSize:15, color:C.cream, fontWeight:600, marginBottom:2 }}>{h.label}</div>
                <div style={{ fontFamily:F.sans, fontSize:12, color:"rgba(250,248,244,0.4)" }}>{h.desc}</div>
              </div>
              {profile.household === h.id && <Icon name="check" size={16} color={C.sage} strokeWidth={2.5}/>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // Step 3 — Persona pivot
  if (step === 3) {
    const persona = profile.persona || "conscious";
    const ps = personaStep[persona];
    if (!ps) { next(); return null; }
    return (
      <div style={screenStyle}>
        <style>{FONTS}</style>
        {progressBar}{backBtn}
        <div style={headStyle}>
          <div style={{ fontFamily:F.sans, fontSize:11, color:"rgba(250,248,244,0.3)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>Almost there</div>
          <div style={{ fontFamily:F.serif, fontSize:28, color:C.cream, fontWeight:300, lineHeight:1.2, marginBottom:5 }}>{ps.title}</div>
          <div style={{ fontFamily:F.sans, fontSize:13, color:"rgba(250,248,244,0.4)" }}>{ps.subtitle}</div>
        </div>
        <div style={{ ...bodyStyle, paddingBottom:24 }}>
          {ps.type === "days" && (
            <div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {DAYS_SHORT.map(d => {
                  const sel = profile.kidsHome?.includes(d);
                  return (
                    <button key={d} onClick={() => set({ kidsHome: sel ? (profile.kidsHome||[]).filter(x=>x!==d) : [...(profile.kidsHome||[]),d] })}
                      style={{ padding:"12px 16px", borderRadius:12, border:`1.5px solid ${sel?C.forest:"rgba(255,255,255,0.1)"}`, background:sel?"rgba(42,74,53,0.45)":"rgba(255,255,255,0.03)", color:sel?C.cream:"rgba(250,248,244,0.5)", fontFamily:F.sans, fontSize:14, fontWeight:500, cursor:"pointer", transition:"all 0.15s" }}>
                      {d}{sel && " ✓"}
                    </button>
                  );
                })}
              </div>
              <div style={{ marginTop:12, fontFamily:F.sans, fontSize:12, color:"rgba(250,248,244,0.3)" }}>Tap to select — you can change this anytime</div>
            </div>
          )}
          {(ps.type !== "days") && ps.options?.map(opt => (
            <button key={opt.id} onClick={() => { set({ personaExtra: opt.id }); next(); }}
              style={{ display:"block", width:"100%", marginBottom:8, padding:"15px 16px", borderRadius:14, border:"1.5px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.03)", cursor:"pointer", textAlign:"left" }}>
              <div style={{ fontFamily:F.sans, fontSize:15, color:C.cream, fontWeight:600, marginBottom: opt.desc ? 2 : 0 }}>{opt.label}</div>
              {opt.desc && <div style={{ fontFamily:F.sans, fontSize:12, color:"rgba(250,248,244,0.4)" }}>{opt.desc}</div>}
            </button>
          ))}
        </div>
        {ps.type === "days" && (
          <div style={footStyle}>
            <button onClick={next} style={{ width:"100%", padding:"15px", borderRadius:14, border:"none", background:C.clay, color:C.cream, fontFamily:F.sans, fontSize:15, fontWeight:600, cursor:"pointer" }}>
              Continue →
            </button>
          </div>
        )}
      </div>
    );
  }

  // Step 4 — Avoid: Medical
  if (step === 4) {
    const layer = AVOID_LAYERS[0];
    return (
      <div style={screenStyle}>
        <style>{FONTS}</style>
        {progressBar}{backBtn}
        <div style={headStyle}>
          <div style={{ fontFamily:F.sans, fontSize:11, color:"rgba(250,248,244,0.3)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>Allergies & intolerances</div>
          <div style={{ fontFamily:F.serif, fontSize:28, color:C.cream, fontWeight:300, lineHeight:1.2, marginBottom:5 }}>Any medical dietary needs?</div>
          <div style={{ fontFamily:F.sans, fontSize:13, color:"rgba(250,248,244,0.4)" }}>These will filter meals entirely — safety first</div>
        </div>
        <div style={{ ...bodyStyle, paddingBottom:24 }}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {layer.options.map(o => {
              const sel = profile.avoidMedical?.includes(o.id);
              return (
                <button key={o.id} onClick={() => set({ avoidMedical: sel ? profile.avoidMedical.filter(x=>x!==o.id) : [...(profile.avoidMedical||[]),o.id] })}
                  style={{ padding:"9px 14px", borderRadius:100, border:`1.5px solid ${sel?C.clay:"rgba(255,255,255,0.1)"}`, background:sel?"rgba(184,92,42,0.3)":"rgba(255,255,255,0.04)", color:sel?C.cream:"rgba(250,248,244,0.55)", fontFamily:F.sans, fontSize:13, fontWeight:500, cursor:"pointer", transition:"all 0.15s", display:"flex", alignItems:"center", gap:5 }}>
                  <span>{o.icon}</span>{o.label}{sel && <Icon name="check" size={11} color={C.cream} strokeWidth={2.5}/>}
                </button>
              );
            })}
          </div>
        </div>
        <div style={footStyle}>
          <button onClick={next} style={{ width:"100%", padding:"15px", borderRadius:14, border:"none", background:C.clay, color:C.cream, fontFamily:F.sans, fontSize:15, fontWeight:600, cursor:"pointer" }}>
            {profile.avoidMedical?.length ? "Got it →" : "None — continue →"}
          </button>
        </div>
      </div>
    );
  }

  // Step 5 — Avoid: Dietary + Dislikes
  if (step === 5) {
    return (
      <div style={screenStyle}>
        <style>{FONTS}</style>
        {progressBar}{backBtn}
        <div style={headStyle}>
          <div style={{ fontFamily:F.sans, fontSize:11, color:"rgba(250,248,244,0.3)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>Preferences</div>
          <div style={{ fontFamily:F.serif, fontSize:28, color:C.cream, fontWeight:300, lineHeight:1.2, marginBottom:5 }}>Anything else to know?</div>
          <div style={{ fontFamily:F.sans, fontSize:13, color:"rgba(250,248,244,0.4)" }}>Dietary choices and strong dislikes</div>
        </div>
        <div style={{ ...bodyStyle, paddingBottom:24 }}>
          {AVOID_LAYERS.slice(1).map(layer => (
            <div key={layer.id} style={{ marginBottom:24 }}>
              <div style={{ marginBottom:10 }}>
                <div style={{ fontFamily:F.sans, fontSize:13, color:"rgba(250,248,244,0.5)", fontWeight:600, marginBottom:2 }}>{layer.label}</div>
                <div style={{ fontFamily:F.sans, fontSize:11, color:"rgba(250,248,244,0.3)" }}>{layer.desc}</div>
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                {layer.options.map(o => {
                  const field = layer.id === "dietary" ? "avoidDietary" : "avoidDislikes";
                  const sel = profile[field]?.includes(o.id);
                  return (
                    <button key={o.id} onClick={() => set({ [field]: sel ? profile[field].filter(x=>x!==o.id) : [...(profile[field]||[]),o.id] })}
                      style={{ padding:"8px 13px", borderRadius:100, border:`1.5px solid ${sel?"rgba(122,158,128,0.8)":"rgba(255,255,255,0.09)"}`, background:sel?"rgba(122,158,128,0.2)":"rgba(255,255,255,0.03)", color:sel?C.cream:"rgba(250,248,244,0.5)", fontFamily:F.sans, fontSize:12, fontWeight:500, cursor:"pointer", transition:"all 0.15s" }}>
                      {o.icon} {o.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div style={footStyle}>
          <button onClick={() => onComplete(profile)} style={{ width:"100%", padding:"15px", borderRadius:14, border:"none", background:C.clay, color:C.cream, fontFamily:F.sans, fontSize:15, fontWeight:600, cursor:"pointer" }}>
            Build my first plan →
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// ── DAY SCREEN ─────────────────────────────────────────────────
function DayScreen({ week, weather, profile, onSwap, onCook }) {
  const [dayIdx, setDayIdx] = useState(TODAY_IDX);
  const dayKey   = DAYS_SHORT[dayIdx];
  const dayPlan  = week[dayKey];
  const totals   = dayTotals(dayPlan);
  const wDay     = weather?.days?.[dayIdx];
  const wx       = wDay ? wxDecode(wDay.code, wDay.max) : null;
  const isToday  = dayIdx === TODAY_IDX;
  const isWeekend = dayIdx >= 5;

  // Context sentence
  const timeOfDay = NOW_HOUR < 12 ? "morning" : NOW_HOUR < 17 ? "afternoon" : "evening";
  const contextParts = [
    isToday ? `${DAYS_LONG[dayIdx]} ${timeOfDay}` : DAYS_LONG[dayIdx],
    profile.household === "solo" ? "Just you" : profile.household === "family" ? "Family night" : null,
    wx ? `${wDay.max}°C · ${wx.label}` : null,
  ].filter(Boolean);

  const slotConfig = [
    { slot:"breakfast", label:"Breakfast", icon:"sunrise" },
    { slot:"lunch",     label:"Lunch",     icon:"sun" },
    { slot:"dinner",    label:"Dinner",    icon:"moon" },
  ];

  return (
    <div style={{ flex:1, overflowY:"auto", paddingBottom:80 }}>
      {/* Header */}
      <div style={{ background:C.forest, padding:"52px 20px 0", position:"relative", overflow:"hidden" }}>
        {/* Subtle background texture */}
        <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, borderRadius:"50%", background:"rgba(255,255,255,0.03)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", top:20, right:20, width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,0.02)", pointerEvents:"none" }}/>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14, position:"relative" }}>
          <div>
            <div style={{ fontFamily:F.sans, fontSize:11, color:"rgba(250,248,244,0.35)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:5 }}>
              {SEASON.name} · London
            </div>
            <div style={{ fontFamily:F.serif, fontSize:36, color:C.cream, fontWeight:300, letterSpacing:"-0.02em", lineHeight:1.1 }}>
              {isToday ? "Today" : DAYS_LONG[dayIdx]}
            </div>
            <div style={{ fontFamily:F.sans, fontSize:13, color:"rgba(250,248,244,0.4)", marginTop:5 }}>
              {contextParts.join(" · ")}
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
            {wx && (
              <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.1)", borderRadius:10, padding:"7px 10px" }}>
                <Icon name={wx.iconName} size={16} color={C.cream} strokeWidth={1.5}/>
                <span style={{ fontFamily:F.sans, fontSize:13, color:C.cream, fontWeight:500 }}>{wDay.max}°C</span>
              </div>
            )}
          </div>
        </div>

        {/* Day strip */}
        <div style={{ display:"flex", gap:5, overflowX:"auto", paddingBottom:16, position:"relative" }}>
          {DAYS_SHORT.map((d, i) => {
            const wd  = weather?.days?.[i];
            const wx2 = wd ? wxDecode(wd.code, wd.max) : null;
            const active = i === dayIdx;
            const isT = i === TODAY_IDX;
            return (
              <div key={d} onClick={() => setDayIdx(i)} style={{ flexShrink:0, minWidth:46, textAlign:"center", padding:"8px 8px 10px", borderRadius:12, background: active ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.05)", border:`1.5px solid ${active ? "rgba(255,255,255,0.25)" : "transparent"}`, cursor:"pointer", transition:"all 0.15s" }}>
                <div style={{ fontFamily:F.sans, fontSize:10, color: active ? C.cream : "rgba(250,248,244,0.3)", fontWeight: active ? 600 : 400, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4 }}>{d}</div>
                {wx2 && <Icon name={wx2.iconName} size={14} color={active ? C.cream : "rgba(250,248,244,0.3)"} strokeWidth={1.5}/>}
                <div style={{ fontFamily:F.sans, fontSize:10, color: active ? C.cream : "rgba(250,248,244,0.25)", marginTop:3 }}>{wd ? `${wd.max}°` : ""}</div>
                {isT && <div style={{ width:3, height:3, borderRadius:"50%", background:C.clay, margin:"3px auto 0" }}/>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Weather-based smart nudge */}
      {wx && isToday && (
        <div style={{ margin:"12px 16px 0", borderRadius:12, padding:"10px 14px", display:"flex", alignItems:"center", gap:10, background: wx.cold ? C.blue : wx.mood === "warm" ? C.goldLight : C.forestGhost }}>
          <Icon name={wx.cold || wx.mood==="rainy" ? "flame" : "leaf"} size={16} color={wx.cold ? C.blueText : C.forest} strokeWidth={2}/>
          <span style={{ fontFamily:F.sans, fontSize:12, color: wx.cold ? C.blueText : C.forest, lineHeight:1.5 }}>
            {wx.cold && wx.mood==="rainy" ? "Cold and wet today — warming meals surfaced for you"
              : wx.cold ? "Chilly today — Plait's weighted towards hearty meals"
              : wx.mood==="warm" ? "Nice day — lighter meals are featured"
              : `${SEASON.name} seasonal ingredients are woven through your plan`}
          </span>
        </div>
      )}

      {/* Macro bar */}
      <div style={{ margin:"12px 16px 0", background:C.card, borderRadius:14, padding:"12px 16px", border:`1px solid ${C.border}`, display:"flex" }}>
        {[
          { label:"Calories", val:`${totals.cal}`, unit:"kcal", icon:"flame",  color:C.clay },
          { label:"Protein",  val:`${totals.prot}`,unit:"g",    icon:"muscle", color:C.forestMid },
          { label:"Cost",     val:`£${totals.cost.toFixed(0)}`, unit:"", icon:"pound", color:C.gold },
        ].map((m, i) => (
          <div key={m.label} style={{ flex:1, textAlign:"center", borderRight: i < 2 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:4, marginBottom:2 }}>
              <Icon name={m.icon} size={13} color={m.color} strokeWidth={2}/>
              <span style={{ fontFamily:F.serif, fontSize:20, color:C.ink, fontWeight:400 }}>{m.val}</span>
              <span style={{ fontFamily:F.sans, fontSize:10, color:C.muted }}>{m.unit}</span>
            </div>
            <div style={{ fontFamily:F.sans, fontSize:10, color:C.muted }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Meal cards */}
      <div style={{ padding:"14px 16px 0", display:"flex", flexDirection:"column", gap:14 }}>
        {slotConfig.map(({ slot, label, icon }) => {
          const recipe = getMeal(dayPlan?.[slot]);
          const wxCtx  = wx ? { wxMood: wx.mood, cold: wx.cold } : {};
          const whyText = recipe ? getMealWhy(recipe, { ...wxCtx, goal: profile.goal, isWeeknight: !isWeekend }) : null;
          return (
            <div key={slot}>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                <Icon name={icon} size={14} color={C.muted} strokeWidth={1.5}/>
                <span style={{ fontFamily:F.sans, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:500 }}>{label}</span>
              </div>
              <MealCard
                recipe={recipe}
                showWhy
                whyText={whyText}
                onSwap={() => onSwap(dayKey, slot)}
                onCook={isToday ? () => onCook(slot, dayPlan?.[slot]) : null}
              />
            </div>
          );
        })}
      </div>

      {/* Seasonal strip */}
      <div style={{ margin:"16px 16px 0", background:C.forestLight, borderRadius:16, padding:"14px 16px", display:"flex", gap:12, alignItems:"center" }}>
        <Icon name="leaf" size={18} color={C.forest} strokeWidth={1.5}/>
        <div>
          <div style={{ fontFamily:F.sans, fontSize:11, color:C.forest, fontWeight:600, marginBottom:5 }}>In season · {SEASON.name}</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
            {SEASON.items.map(item => (
              <span key={item} style={{ background:C.sagePale, color:C.forest, fontFamily:F.sans, fontSize:11, padding:"3px 8px", borderRadius:100 }}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── WEEK SCREEN ────────────────────────────────────────────────
function WeekScreen({ week, weather, profile, onSwap }) {
  const [expanded, setExpanded] = useState(TODAY_IDX);

  return (
    <div style={{ flex:1, overflowY:"auto", paddingBottom:80 }}>
      <div style={{ background:C.forest, padding:"52px 20px 20px" }}>
        <div style={{ fontFamily:F.sans, fontSize:11, color:"rgba(250,248,244,0.35)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>Your week</div>
        <div style={{ fontFamily:F.serif, fontSize:34, color:C.cream, fontWeight:300, letterSpacing:"-0.01em" }}>The plan</div>
        <div style={{ fontFamily:F.sans, fontSize:13, color:"rgba(250,248,244,0.4)", marginTop:4 }}>Tap any day to expand. Tap swap to change any meal.</div>
      </div>

      <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:8 }}>
        {DAYS_SHORT.map((day, i) => {
          const dayPlan  = week[day];
          const totals   = dayTotals(dayPlan);
          const wDay     = weather?.days?.[i];
          const wx       = wDay ? wxDecode(wDay.code, wDay.max) : null;
          const isOpen   = expanded === i;
          const isToday  = i === TODAY_IDX;
          const isWeekend = i >= 5;

          return (
            <div key={day} style={{ background:C.card, borderRadius:16, overflow:"hidden", border:`2px solid ${isToday ? C.forest : C.border}`, transition:"border-color 0.2s" }}>
              <div onClick={() => setExpanded(isOpen ? -1 : i)} style={{ padding:"14px 16px", display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}>
                {/* Day + weather */}
                <div style={{ width:48, flexShrink:0 }}>
                  <div style={{ fontFamily:F.sans, fontSize:11, color: isToday ? C.forest : C.muted, fontWeight: isToday ? 700 : 400, textTransform:"uppercase", letterSpacing:"0.05em" }}>{day}</div>
                  {wx && <Icon name={wx.iconName} size={16} color={isToday ? C.forest : C.muted} strokeWidth={1.5}/>}
                  {isToday && <div style={{ width:4, height:4, borderRadius:"50%", background:C.clay, marginTop:2 }}/>}
                </div>
                {/* Meal names */}
                <div style={{ flex:1, display:"flex", gap:5, flexWrap:"wrap" }}>
                  {["breakfast","lunch","dinner"].map(s => {
                    const r = getMeal(dayPlan?.[s]);
                    return r ? (
                      <span key={s} style={{ fontFamily:F.sans, fontSize:11, color:C.muted, background:C.bg, borderRadius:6, padding:"2px 7px", lineHeight:1.5 }}>
                        {r.name.split(" ").slice(0,2).join(" ")}
                      </span>
                    ) : null;
                  })}
                </div>
                {/* Cost + toggle */}
                <div style={{ flexShrink:0, textAlign:"right" }}>
                  <div style={{ fontFamily:F.sans, fontSize:12, color:C.muted }}>£{totals.cost.toFixed(0)}</div>
                  <div style={{ fontFamily:F.sans, fontSize:10, color:C.mutedLight }}>{totals.cal}kcal</div>
                </div>
                <Icon name={isOpen ? "chevUp" : "chevDown"} size={16} color={C.muted} strokeWidth={2}/>
              </div>

              {isOpen && (
                <div style={{ borderTop:`1px solid ${C.border}`, padding:"12px 14px", display:"flex", flexDirection:"column", gap:10 }}>
                  {[
                    { slot:"breakfast", icon:"sunrise" },
                    { slot:"lunch",     icon:"sun" },
                    { slot:"dinner",    icon:"moon" },
                  ].map(({ slot, icon }) => {
                    const recipe = getMeal(dayPlan?.[slot]);
                    const wxCtx  = wx ? { wxMood: wx.mood, cold: wx.cold } : {};
                    const whyText = recipe ? getMealWhy(recipe, { ...wxCtx, goal: profile.goal, isWeeknight: !isWeekend }) : null;
                    return (
                      <div key={slot}>
                        <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:6 }}>
                          <Icon name={icon} size={12} color={C.muted} strokeWidth={1.5}/>
                          <span style={{ fontFamily:F.sans, fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em" }}>{slot}</span>
                        </div>
                        <MealCard recipe={recipe} compact showWhy whyText={whyText} onSwap={() => onSwap(day, slot)}/>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── SWAP SCREEN ────────────────────────────────────────────────
function SwapScreen({ target, week, setWeek, weather, profile, onDone }) {
  const [filter, setFilter] = useState("recommended");
  if (!target) return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40, paddingBottom:80 }}>
      <Icon name="swap" size={40} color={C.border} strokeWidth={1}/>
      <div style={{ fontFamily:F.serif, fontSize:22, color:C.ink, marginTop:16, marginBottom:8 }}>Swap a meal</div>
      <div style={{ fontFamily:F.sans, fontSize:14, color:C.muted, textAlign:"center" }}>Tap "Swap" on any meal in the Day or Week view</div>
    </div>
  );

  const { day, slot } = target;
  const wDay  = weather?.days?.find(d => d.day === day);
  const wx    = wDay ? wxDecode(wDay.code, wDay.max) : null;
  const current = getMeal(week[day]?.[slot]);
  const isWeekend = DAYS_SHORT.indexOf(day) >= 5;
  const ctx = { goal: profile.goal, wxMood: wx?.mood, cold: wx?.cold, slot, isWeeknight: !isWeekend, servings: profile.servings, recentIds:[], recentCuisines:[] };

  const filterDefs = [
    { id:"recommended", label:"For you",    icon:"sparkle" },
    { id:"quick",       label:"Quick",      icon:"clock" },
    { id:"seasonal",    label:"Seasonal",   icon:"leaf" },
    { id:"highprot",    label:"Protein",    icon:"muscle" },
    { id:"batch",       label:"Batch",      icon:"batch" },
    { id:"budget",      label:"Budget",     icon:"pound" },
  ];

  const allMeals = RECIPES
    .filter(r => r.slot === slot)
    .map(r => ({ ...r, score: scoreRecipe(r, ctx) }))
    .sort((a, b) => b.score - a.score);

  const filtered = allMeals.filter(m => {
    if (filter === "recommended") return true;
    if (filter === "quick")    return m.time <= 20;
    if (filter === "seasonal") return m.seasonal?.some(s => SEASON.items.includes(s));
    if (filter === "highprot") return m.prot >= 35;
    if (filter === "batch")    return m.batch;
    if (filter === "budget")   return m.cost <= 5;
    return true;
  });

  return (
    <div style={{ flex:1, overflowY:"auto", paddingBottom:80 }}>
      <div style={{ background:C.forest, padding:"52px 20px 20px" }}>
        <div style={{ fontFamily:F.sans, fontSize:11, color:"rgba(250,248,244,0.35)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>{day} · {slot}</div>
        <div style={{ fontFamily:F.serif, fontSize:30, color:C.cream, fontWeight:300, marginBottom:4 }}>Choose a {slot}</div>
        {current && <div style={{ fontFamily:F.sans, fontSize:13, color:"rgba(250,248,244,0.4)" }}>Replacing: {current.name}</div>}
        {wx && <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:8 }}><Icon name={wx.iconName} size={13} color="rgba(250,248,244,0.4)" strokeWidth={1.5}/><span style={{ fontFamily:F.sans, fontSize:12, color:"rgba(250,248,244,0.35)" }}>Recommendations adjusted for {wDay.max}°C</span></div>}
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:7, overflowX:"auto", padding:"12px 16px" }}>
        {filterDefs.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{ flexShrink:0, padding:"8px 14px", borderRadius:100, border:`1.5px solid ${filter===f.id ? C.forest : C.border}`, background: filter===f.id ? C.forest : C.card, color: filter===f.id ? C.cream : C.muted, fontFamily:F.sans, fontSize:12, fontWeight:500, cursor:"pointer", transition:"all 0.15s", display:"flex", alignItems:"center", gap:5 }}>
            <Icon name={f.icon} size={12} color={filter===f.id ? C.cream : C.muted} strokeWidth={2}/>{f.label}
          </button>
        ))}
      </div>

      <div style={{ padding:"0 16px", display:"flex", flexDirection:"column", gap:10 }}>
        {filtered.map(m => {
          const isCurrent = m.id === week[day]?.[slot];
          const whyText = getMealWhy(m, { wxMood: wx?.mood, cold: wx?.cold, goal: profile.goal, isWeeknight: !isWeekend });
          return (
            <div key={m.id} onClick={() => { setWeek(w => ({ ...w, [day]:{ ...w[day], [slot]:m.id } })); onDone(); }}
              style={{ background: isCurrent ? C.forestGhost : C.card, border:`2px solid ${isCurrent ? C.forest : C.border}`, borderRadius:16, cursor:"pointer", overflow:"hidden", transition:"all 0.15s" }}>
              {isCurrent && (
                <div style={{ background:C.forest, padding:"5px 14px" }}>
                  <span style={{ fontFamily:F.sans, fontSize:11, color:C.cream, fontWeight:600 }}>Current selection</span>
                </div>
              )}
              <div style={{ padding:"14px" }}>
                <MealCard recipe={m} compact showWhy whyText={whyText}/>
                {m.goals?.includes(profile.goal) && (
                  <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:5 }}>
                    <Icon name="check" size={12} color={C.forest} strokeWidth={2.5}/>
                    <span style={{ fontFamily:F.sans, fontSize:11, color:C.forest }}>Matches your goal</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── SHOP SCREEN ────────────────────────────────────────────────
function ShopScreen({ week, weather }) {
  const [mode, setMode]       = useState("week");
  const [dayIdx, setDayIdx]   = useState(TODAY_IDX);
  const [mealSlot, setMealSlot] = useState("dinner");
  const [checked, setChecked] = useState({});

  // Compute which days/meals to include
  function getMealsToList() {
    if (mode === "week") return DAYS_SHORT.flatMap(d => ["breakfast","lunch","dinner"].map(s => getMeal(week[d]?.[s])).filter(Boolean));
    if (mode === "day")  return ["breakfast","lunch","dinner"].map(s => getMeal(week[DAYS_SHORT[dayIdx]]?.[s])).filter(Boolean);
    if (mode === "meal") return [getMeal(week[DAYS_SHORT[dayIdx]]?.[mealSlot])].filter(Boolean);
    return [];
  }

  const meals = getMealsToList();
  const raw = {};
  meals.forEach(r => {
    (r.ings || []).forEach(ing => {
      const key = ing.n.toLowerCase();
      if (!raw[key]) raw[key] = { ...ing, count:0, meals:[] };
      raw[key].count++;
      if (!raw[key].meals.includes(r.name)) raw[key].meals.push(r.name);
    });
  });

  const byAisle = {};
  Object.values(raw).forEach(item => {
    const a = item.a || "storecup";
    if (!byAisle[a]) byAisle[a] = [];
    byAisle[a].push(item);
  });

  const sorted = Object.entries(byAisle).sort(([a],[b]) => (AISLES[a]?.order||99)-(AISLES[b]?.order||99));
  const allItems = Object.values(byAisle).flat();
  const doneCount = allItems.filter(i => checked[i.n]).length;
  const pct = allItems.length > 0 ? (doneCount / allItems.length) * 100 : 0;

  return (
    <div style={{ flex:1, overflowY:"auto", paddingBottom:80 }}>
      <div style={{ background:C.forest, padding:"52px 20px 20px" }}>
        <div style={{ fontFamily:F.sans, fontSize:11, color:"rgba(250,248,244,0.35)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>Shopping</div>
        <div style={{ fontFamily:F.serif, fontSize:34, color:C.cream, fontWeight:300, marginBottom:14, letterSpacing:"-0.01em" }}>Your list</div>
        {/* Progress */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
          <div style={{ flex:1, background:"rgba(255,255,255,0.1)", borderRadius:100, height:5, overflow:"hidden" }}>
            <div style={{ width:`${pct}%`, background: pct===100 ? C.clay : C.cream, height:"100%", borderRadius:100, transition:"width 0.3s" }}/>
          </div>
          <span style={{ fontFamily:F.sans, fontSize:12, color:"rgba(250,248,244,0.5)", whiteSpace:"nowrap" }}>{doneCount} / {allItems.length}</span>
        </div>
        {/* Mode switcher */}
        <div style={{ display:"flex", gap:6 }}>
          {[
            { id:"meal", label:"One meal" },
            { id:"day",  label:"One day" },
            { id:"week", label:"Full week" },
          ].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)} style={{ flex:1, padding:"9px 4px", borderRadius:10, border:`1.5px solid ${mode===m.id ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)"}`, background: mode===m.id ? "rgba(255,255,255,0.14)" : "transparent", color: mode===m.id ? C.cream : "rgba(250,248,244,0.4)", fontFamily:F.sans, fontSize:12, fontWeight: mode===m.id ? 600 : 400, cursor:"pointer", transition:"all 0.15s" }}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Day + meal selectors when needed */}
      {(mode === "day" || mode === "meal") && (
        <div style={{ padding:"12px 16px 0", display:"flex", gap:5, overflowX:"auto" }}>
          {DAYS_SHORT.map((d, i) => (
            <button key={d} onClick={() => setDayIdx(i)} style={{ flexShrink:0, padding:"7px 12px", borderRadius:100, border:`1.5px solid ${dayIdx===i ? C.forest : C.border}`, background: dayIdx===i ? C.forest : C.card, color: dayIdx===i ? C.cream : C.muted, fontFamily:F.sans, fontSize:12, fontWeight:500, cursor:"pointer", transition:"all 0.15s" }}>{d}</button>
          ))}
        </div>
      )}
      {mode === "meal" && (
        <div style={{ padding:"8px 16px 0", display:"flex", gap:5 }}>
          {["breakfast","lunch","dinner"].map(s => (
            <button key={s} onClick={() => setMealSlot(s)} style={{ flex:1, padding:"8px", borderRadius:10, border:`1.5px solid ${mealSlot===s ? C.forest : C.border}`, background: mealSlot===s ? C.forest : C.card, color: mealSlot===s ? C.cream : C.muted, fontFamily:F.sans, fontSize:12, fontWeight:500, cursor:"pointer", transition:"all 0.15s", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
              <Icon name={s==="breakfast"?"sunrise":s==="lunch"?"sun":"moon"} size={13} color={mealSlot===s ? C.cream : C.muted} strokeWidth={1.5}/>{s}
            </button>
          ))}
        </div>
      )}

      <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:10 }}>
        {sorted.map(([aisle, items]) => {
          const ai = AISLES[aisle] || { label:aisle, icon:"batch" };
          const aisleDone = items.filter(i => checked[i.n]).length;
          return (
            <div key={aisle} style={{ background:C.card, borderRadius:16, overflow:"hidden", border:`1px solid ${C.border}` }}>
              <div style={{ padding:"11px 16px", background:C.cream, borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:8 }}>
                <Icon name={ai.icon} size={15} color={C.muted} strokeWidth={1.5}/>
                <span style={{ fontFamily:F.sans, fontWeight:600, color:C.ink, fontSize:14, flex:1 }}>{ai.label}</span>
                <span style={{ fontFamily:F.sans, fontSize:12, color: aisleDone===items.length ? C.forest : C.muted }}>{aisleDone}/{items.length}</span>
              </div>
              {items.map((item, ii) => {
                const done = checked[item.n];
                return (
                  <div key={item.n} onClick={() => setChecked(c => ({ ...c, [item.n]:!c[item.n] }))} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", borderBottom: ii<items.length-1 ? `1px solid ${C.borderLight}` : "none", background: done ? C.forestGhost : "transparent", cursor:"pointer", transition:"background 0.15s", minHeight:56 }}>
                    <div style={{ width:22, height:22, borderRadius:6, border:`2px solid ${done ? C.forest : C.border}`, background: done ? C.forest : "transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s" }}>
                      {done && <Icon name="check" size={12} color="white" strokeWidth={2.5}/>}
                    </div>
                    <div style={{ flex:1 }}>
                      <span style={{ fontFamily:F.sans, fontWeight:500, color: done ? C.mutedLight : C.ink, fontSize:15, textDecoration: done ? "line-through" : "none" }}>{item.n}</span>
                      <div style={{ display:"flex", gap:5, marginTop:2, flexWrap:"wrap", alignItems:"center" }}>
                        <span style={{ fontFamily:F.sans, fontSize:12, color:C.muted }}>{item.q}</span>
                        {item.count > 1 && <span style={{ fontFamily:F.sans, fontSize:11, color:C.mutedLight, background:C.bg, borderRadius:4, padding:"1px 6px" }}>×{item.count} meals</span>}
                        {item.seasonal && <Tag color={C.sagePale} textColor={C.forest} iconName="leaf">Seasonal</Tag>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
        {allItems.length === 0 && (
          <div style={{ textAlign:"center", padding:"40px 0" }}>
            <Icon name="shopping" size={32} color={C.border} strokeWidth={1}/>
            <div style={{ fontFamily:F.sans, fontSize:14, color:C.muted, marginTop:12 }}>No items for this selection</div>
          </div>
        )}
        {doneCount === allItems.length && allItems.length > 0 && (
          <div style={{ background:C.forest, borderRadius:16, padding:"24px", textAlign:"center" }}>
            <Icon name="check" size={28} color={C.cream} strokeWidth={2}/>
            <div style={{ fontFamily:F.serif, fontSize:22, color:C.cream, marginTop:10, marginBottom:4 }}>You've got everything</div>
            <div style={{ fontFamily:F.sans, fontSize:13, color:"rgba(250,248,244,0.5)" }}>Good week ahead.</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── COOK SCREEN ────────────────────────────────────────────────
function CookScreen({ week, weather }) {
  const [dayIdx, setDayIdx] = useState(TODAY_IDX);
  const [slot, setSlot]     = useState("dinner");
  const [stepIdx, setStepIdx] = useState(0);
  const dayKey = DAYS_SHORT[dayIdx];
  const recipe = getMeal(week[dayKey]?.[slot]);

  return (
    <div style={{ flex:1, overflowY:"auto", paddingBottom:80 }}>
      <div style={{ background:C.forest, padding:"52px 20px 20px" }}>
        <div style={{ fontFamily:F.sans, fontSize:11, color:"rgba(250,248,244,0.35)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>Cook mode</div>
        <div style={{ fontFamily:F.serif, fontSize:34, color:C.cream, fontWeight:300, marginBottom:16, letterSpacing:"-0.01em" }}>Let's cook</div>
        {/* Day selector */}
        <div style={{ display:"flex", gap:5, overflowX:"auto", marginBottom:12 }}>
          {DAYS_SHORT.map((d, i) => (
            <button key={d} onClick={() => { setDayIdx(i); setStepIdx(0); }} style={{ flexShrink:0, padding:"6px 12px", borderRadius:100, border:"none", background: dayIdx===i ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)", color: dayIdx===i ? C.cream : "rgba(250,248,244,0.35)", fontFamily:F.sans, fontSize:12, fontWeight: dayIdx===i ? 600 : 400, cursor:"pointer", transition:"all 0.15s" }}>{d}</button>
          ))}
        </div>
        {/* Slot picker */}
        <div style={{ display:"flex", gap:8 }}>
          {[{s:"breakfast",icon:"sunrise"},{s:"lunch",icon:"sun"},{s:"dinner",icon:"moon"}].map(({ s, icon }) => {
            const r = getMeal(week[dayKey]?.[s]);
            const active = slot === s;
            return (
              <button key={s} onClick={() => { setSlot(s); setStepIdx(0); }} style={{ flex:1, padding:"10px 6px", borderRadius:12, border:`1.5px solid ${active ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.07)"}`, background: active ? "rgba(255,255,255,0.14)" : "transparent", cursor:"pointer", textAlign:"center", transition:"all 0.15s" }}>
                <Icon name={icon} size={16} color={active ? C.cream : "rgba(250,248,244,0.3)"} strokeWidth={1.5}/>
                <div style={{ fontFamily:F.sans, fontSize:9, color: active ? C.cream : "rgba(250,248,244,0.3)", textTransform:"uppercase", letterSpacing:"0.04em", marginTop:4, marginBottom:2 }}>{s}</div>
                <div style={{ fontFamily:F.sans, fontSize:9, color:"rgba(250,248,244,0.25)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r?.name.split(" ").slice(0,2).join(" ") || "—"}</div>
              </button>
            );
          })}
        </div>
      </div>

      {recipe ? (
        <div style={{ padding:"16px 16px 0", display:"flex", flexDirection:"column", gap:12 }}>
          {/* Recipe header with illustration */}
          <div style={{ background:C.card, borderRadius:18, overflow:"hidden", border:`1px solid ${C.border}` }}>
            <div style={{ background:`linear-gradient(135deg, ${C.cream} 0%, ${C.bg} 100%)`, padding:"18px 18px 0", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div style={{ flex:1, paddingRight:8 }}>
                <div style={{ display:"flex", gap:5, marginBottom:8, flexWrap:"wrap" }}>
                  {recipe.seasonal?.some(s=>SEASON.items.includes(s)) && <Tag color={C.sagePale} textColor={C.forest} iconName="leaf">Seasonal</Tag>}
                  {recipe.batch && <Tag color={C.forestLight} textColor={C.forestMid} iconName="batch">Batch cook</Tag>}
                </div>
                <div style={{ fontFamily:F.serif, fontSize:22, color:C.ink, fontWeight:400, lineHeight:1.25 }}>{recipe.name}</div>
                <div style={{ display:"flex", gap:12, marginTop:8, flexWrap:"wrap" }}>
                  <span style={{ display:"flex", gap:4, alignItems:"center", fontFamily:F.sans, fontSize:12, color:C.muted }}><Icon name="clock" size={13} color={C.muted} strokeWidth={2}/>{recipe.time} mins</span>
                  <span style={{ display:"flex", gap:4, alignItems:"center", fontFamily:F.sans, fontSize:12, color:C.muted }}><Icon name="muscle" size={13} color={C.forestMid} strokeWidth={2}/>{recipe.prot}g protein</span>
                </div>
              </div>
              <MealIllustration type={recipe.slot === "breakfast" ? "breakfast" : recipe.batch ? "batch" : recipe.seasonal?.length ? "seasonal" : "dinner"} size={72}/>
            </div>
            <div style={{ padding:"0 18px 16px", marginTop:12 }}>
              {recipe.batchNote && (
                <div style={{ display:"flex", alignItems:"flex-start", gap:7, background:C.goldLight, borderRadius:10, padding:"8px 10px" }}>
                  <Icon name="batch" size={14} color={C.gold} strokeWidth={2}/>
                  <span style={{ fontFamily:F.sans, fontSize:12, color:C.gold, lineHeight:1.4 }}>{recipe.batchNote}</span>
                </div>
              )}
            </div>
          </div>

          {/* Ingredients */}
          <div style={{ background:C.card, borderRadius:16, overflow:"hidden", border:`1px solid ${C.border}` }}>
            <div style={{ padding:"12px 16px", background:C.cream, borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:8 }}>
              <Icon name="leaf" size={15} color={C.muted} strokeWidth={1.5}/>
              <span style={{ fontFamily:F.sans, fontWeight:600, color:C.ink, fontSize:13 }}>You'll need</span>
            </div>
            {recipe.ings?.map((ing, ii) => (
              <div key={ii} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"13px 16px", borderBottom: ii<recipe.ings.length-1 ? `1px solid ${C.borderLight}` : "none" }}>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <span style={{ fontFamily:F.sans, fontSize:14, color:C.ink }}>{ing.n}</span>
                  {ing.seasonal && <Tag color={C.sagePale} textColor={C.forest} iconName="leaf">Seasonal</Tag>}
                </div>
                <span style={{ fontFamily:F.sans, fontSize:13, color:C.muted, fontWeight:500 }}>{ing.q}</span>
              </div>
            ))}
          </div>

          {/* Steps */}
          {recipe.steps?.length > 0 && (
            <div style={{ background:C.card, borderRadius:16, padding:"18px", border:`1px solid ${C.border}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <Icon name="chef" size={16} color={C.forest} strokeWidth={1.5}/>
                  <span style={{ fontFamily:F.sans, fontWeight:600, color:C.ink, fontSize:13 }}>Step by step</span>
                </div>
                <span style={{ fontFamily:F.sans, fontSize:12, color:C.muted }}>{stepIdx+1} of {recipe.steps.length}</span>
              </div>
              {/* Progress dots */}
              <div style={{ display:"flex", gap:5, marginBottom:16 }}>
                {recipe.steps.map((_, i) => (
                  <div key={i} onClick={() => setStepIdx(i)} style={{ flex:1, height:3, borderRadius:2, background: i<=stepIdx ? C.forest : C.border, cursor:"pointer", transition:"background 0.2s" }}/>
                ))}
              </div>
              {/* Current step */}
              <div style={{ background:C.forestLight, borderRadius:14, padding:"20px 18px", marginBottom:16, minHeight:80, display:"flex", alignItems:"flex-start", gap:12 }}>
                <div style={{ width:26, height:26, borderRadius:8, background:C.forest, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span style={{ fontFamily:F.sans, fontSize:12, color:C.cream, fontWeight:700 }}>{stepIdx+1}</span>
                </div>
                <div style={{ fontFamily:F.serif, fontSize:18, color:C.forest, fontWeight:400, lineHeight:1.6 }}>
                  {recipe.steps[stepIdx]}
                </div>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setStepIdx(s => Math.max(0,s-1))} disabled={stepIdx===0} style={{ flex:1, padding:"13px", borderRadius:12, border:`1.5px solid ${stepIdx===0 ? C.border : C.forest}`, background:"transparent", color: stepIdx===0 ? C.border : C.forest, fontFamily:F.sans, fontSize:13, fontWeight:600, cursor: stepIdx===0 ? "not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                  <Icon name="back" size={15} color={stepIdx===0 ? C.border : C.forest} strokeWidth={2}/>Back
                </button>
                {stepIdx < recipe.steps.length-1
                  ? <button onClick={() => setStepIdx(s => s+1)} style={{ flex:2, padding:"13px", borderRadius:12, border:"none", background:C.forest, color:C.cream, fontFamily:F.sans, fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                      Next<Icon name="arrow" size={15} color={C.cream} strokeWidth={2}/>
                    </button>
                  : <button style={{ flex:2, padding:"13px", borderRadius:12, border:"none", background:C.clay, color:C.cream, fontFamily:F.sans, fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                      <Icon name="check" size={15} color={C.cream} strokeWidth={2.5}/>Done
                    </button>
                }
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ padding:40, textAlign:"center" }}>
          <Icon name="chef" size={32} color={C.border} strokeWidth={1}/>
          <div style={{ fontFamily:F.sans, fontSize:14, color:C.muted, marginTop:12 }}>No meal planned here</div>
        </div>
      )}
    </div>
  );
}

// ── ROOT APP ───────────────────────────────────────────────────
export default function App() {
  const [onboarded, setOnboarded] = useState(false);
  const [profile,   setProfile]   = useState(null);
  const [week,      setWeek]      = useState(null);
  const [tab,       setTab]       = useState("day");
  const [swapTarget, setSwapTarget] = useState(null);
  const weather = useWeather();

  function completeOnboarding(p) {
    setProfile(p);
    setWeek(buildWeek(p));
    setOnboarded(true);
  }

  function handleSwap(day, slot) {
    setSwapTarget({ day, slot });
    setTab("swap");
  }

  function handleCook(slot) {
    setTab("cook");
  }

  function handleSwapDone() {
    setSwapTarget(null);
    setTab("day");
  }

  if (!onboarded) return <Onboarding onComplete={completeOnboarding}/>;

  const tabs = [
    { id:"day",      icon:"sun",      label:"Day" },
    { id:"week",     icon:"calendar", icon2:"chevDown", label:"Week" },
    { id:"shop",     icon:"shopping", label:"Shop" },
    { id:"cook",     icon:"chef",     label:"Cook" },
    { id:"discover", icon:"compass",  label:"Discover" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", maxWidth:430, margin:"0 auto", background:C.bg, overflow:"hidden", fontFamily:F.sans }}>
      <style>{FONTS}</style>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{display:none}body{background:#181410}button{-webkit-tap-highlight-color:transparent;outline:none}`}</style>

      <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", minHeight:0 }}>
        {tab === "day"      && <DayScreen  week={week} weather={weather} profile={profile} onSwap={handleSwap} onCook={handleCook}/>}
        {tab === "week"     && <WeekScreen week={week} weather={weather} profile={profile} onSwap={handleSwap}/>}
        {tab === "swap"     && <SwapScreen target={swapTarget} week={week} setWeek={setWeek} weather={weather} profile={profile} onDone={handleSwapDone}/>}
        {tab === "shop"     && <ShopScreen week={week} weather={weather}/>}
        {tab === "cook"     && <CookScreen week={week} weather={weather}/>}
        {tab === "discover" && (
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40 }}>
            <Icon name="compass" size={36} color={C.border} strokeWidth={1}/>
            <div style={{ fontFamily:F.serif, fontSize:22, color:C.ink, marginTop:16, marginBottom:8 }}>Discover</div>
            <div style={{ fontFamily:F.sans, fontSize:14, color:C.muted, textAlign:"center" }}>Seasonal picks, cuisine discovery, and what's good right now — coming soon</div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ background:C.nav, paddingBottom:"max(10px, env(safe-area-inset-bottom))", paddingTop:10, display:"flex", borderTop:`1px solid ${C.navBorder}`, flexShrink:0 }}>
        {tabs.map(t => {
          const active = tab === t.id || (tab === "swap" && t.id === "day");
          return (
            <button key={t.id} onClick={() => { if (t.id !== "swap") setTab(t.id); }} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"4px 0", background:"none", border:"none", cursor:"pointer" }}>
              <Icon name={t.icon} size={20} color={active ? C.cream : "rgba(250,248,244,0.25)"} strokeWidth={active ? 1.5 : 1.5}/>
              <span style={{ fontFamily:F.sans, fontSize:9, fontWeight: active ? 600 : 400, color: active ? C.cream : "rgba(250,248,244,0.25)", letterSpacing:"0.05em", textTransform:"uppercase", transition:"all 0.15s" }}>{t.label}</span>
              {active && <div style={{ width:3, height:3, borderRadius:"50%", background:C.clay }}/>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
