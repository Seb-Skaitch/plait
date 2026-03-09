import { useState, useEffect, useRef } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300;1,9..144,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');`;

const C = {
  bg:"#f5f1ea",card:"#ffffff",ink:"#1a1612",
  forest:"#273d2f",forestMid:"#3a5944",forestLight:"#e5ede7",forestGhost:"#f0f5f1",
  clay:"#b85c2a",clayLight:"#fceee6",
  gold:"#8a7030",goldLight:"#fdf5e0",
  sage:"#7a9e80",sagePale:"#ddeade",
  muted:"#6b6355",mutedLight:"#a89e90",
  border:"#e2d8cc",borderLight:"#ede8e0",
  cream:"#faf7f2",nav:"#181410",
  aiBg:"#f4f0e8",aiBorder:"#7a9e80",aiText:"#273d2f",
};
const F = { serif:"'Fraunces', Georgia, serif", sans:"'DM Sans', system-ui, sans-serif" };
const DAYS_SHORT = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const DAYS_LONG  = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const TODAY_IDX  = Math.min(new Date().getDay()===0?6:new Date().getDay()-1,6);
const MONTH      = new Date().getMonth()+1;
const NOW_HOUR   = new Date().getHours();

const SEASON = ({
  1:{name:"January",  items:["leeks","kale","parsnips","celeriac","blood oranges"]},
  2:{name:"February", items:["purple sprouting broccoli","leeks","kale","forced rhubarb"]},
  3:{name:"March",    items:["purple sprouting broccoli","spring greens","radishes","watercress"]},
  4:{name:"April",    items:["asparagus","jersey royals","spinach","spring onions"]},
  5:{name:"May",      items:["asparagus","broad beans","peas","new potatoes"]},
  6:{name:"June",     items:["strawberries","courgettes","fennel","new potatoes"]},
  7:{name:"July",     items:["tomatoes","courgettes","runner beans","sweetcorn"]},
  8:{name:"August",   items:["tomatoes","sweetcorn","aubergine","peppers"]},
  9:{name:"September",items:["butternut squash","wild mushrooms","blackberries","damsons"]},
  10:{name:"October", items:["pumpkin","celeriac","wild mushrooms","chestnuts"]},
  11:{name:"November",items:["parsnips","swede","brussels sprouts","kale"]},
  12:{name:"December",items:["parsnips","brussels sprouts","clementines","chestnuts"]},
})[MONTH]||{name:"Spring",items:["asparagus","peas","new potatoes","spinach"]};

const Icon = ({name,size=20,color=C.ink,sw=1.5}) => {
  const s={width:size,height:size,flexShrink:0,display:"block"};
  const p={stroke:color,strokeWidth:sw,strokeLinecap:"round",strokeLinejoin:"round",fill:"none"};
  const icons = {
    leaf:    <svg style={s} viewBox="0 0 24 24"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" {...p}/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" {...p}/></svg>,
    calendar:<svg style={s} viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" {...p}/><line x1="16" y1="2" x2="16" y2="6" {...p}/><line x1="8" y1="2" x2="8" y2="6" {...p}/><line x1="3" y1="10" x2="21" y2="10" {...p}/></svg>,
    bag:     <svg style={s} viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" {...p}/><line x1="3" y1="6" x2="21" y2="6" {...p}/><path d="M16 10a4 4 0 0 1-8 0" {...p}/></svg>,
    chef:    <svg style={s} viewBox="0 0 24 24"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" {...p}/><line x1="6" y1="17" x2="18" y2="17" {...p}/></svg>,
    sun:     <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" {...p}/><line x1="12" y1="2" x2="12" y2="4" {...p}/><line x1="12" y1="20" x2="12" y2="22" {...p}/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" {...p}/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" {...p}/><line x1="2" y1="12" x2="4" y2="12" {...p}/><line x1="20" y1="12" x2="22" y2="12" {...p}/></svg>,
    moon:    <svg style={s} viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" {...p}/></svg>,
    sunrise: <svg style={s} viewBox="0 0 24 24"><path d="M17 18a5 5 0 0 0-10 0" {...p}/><line x1="12" y1="2" x2="12" y2="9" {...p}/><line x1="1" y1="18" x2="3" y2="18" {...p}/><line x1="21" y1="18" x2="23" y2="18" {...p}/><line x1="23" y1="22" x2="1" y2="22" {...p}/><polyline points="8 6 12 2 16 6" {...p}/></svg>,
    clock:   <svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" {...p}/><polyline points="12 6 12 12 16 14" {...p}/></svg>,
    flame:   <svg style={s} viewBox="0 0 24 24"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" {...p}/></svg>,
    zap:     <svg style={s} viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" {...p}/></svg>,
    check:   <svg style={s} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" {...p}/></svg>,
    swap:    <svg style={s} viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9" {...p}/><path d="M3 11V9a4 4 0 0 1 4-4h14" {...p}/><polyline points="7 23 3 19 7 15" {...p}/><path d="M21 13v2a4 4 0 0 1-4 4H3" {...p}/></svg>,
    back:    <svg style={s} viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12" {...p}/><polyline points="12 19 5 12 12 5" {...p}/></svg>,
    arrow:   <svg style={s} viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" {...p}/><polyline points="12 5 19 12 12 19" {...p}/></svg>,
    users:   <svg style={s} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" {...p}/><circle cx="9" cy="7" r="4" {...p}/><path d="M23 21v-2a4 4 0 0 0-3-3.87" {...p}/><path d="M16 3.13a4 4 0 0 1 0 7.75" {...p}/></svg>,
    user:    <svg style={s} viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" {...p}/><circle cx="12" cy="7" r="4" {...p}/></svg>,
    home:    <svg style={s} viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" {...p}/><polyline points="9 22 9 12 15 12 15 22" {...p}/></svg>,
    pound:   <svg style={s} viewBox="0 0 24 24"><path d="M18 7H9.5a3.5 3.5 0 0 0 0 7H11v3H6" {...p}/><line x1="6" y1="17" x2="16" y2="17" {...p}/></svg>,
    sparkle: <svg style={s} viewBox="0 0 24 24"><path d="M12 3c-1 3-3 5-5 6 2 1 4 3 5 6 1-3 3-5 5-6-2-1-4-3-5-6z" {...p}/><path d="M5 10c-.5 1.5-1.5 2.5-3 3 1.5.5 2.5 1.5 3 3 .5-1.5 1.5-2.5 3-3-1.5-.5-2.5-1.5-3-3z" {...p}/></svg>,
    batch:   <svg style={s} viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" {...p}/></svg>,
    chevD:   <svg style={s} viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" {...p}/></svg>,
    chevU:   <svg style={s} viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15" {...p}/></svg>,
    cart:    <svg style={s} viewBox="0 0 24 24"><circle cx="9" cy="21" r="1" {...p}/><circle cx="20" cy="21" r="1" {...p}/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" {...p}/></svg>,
    muscle:  <svg style={s} viewBox="0 0 24 24"><path d="M6.5 6.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5V9H9" {...p}/><rect x="3" y="10" width="3" height="4" rx="1" {...p}/><rect x="18" y="10" width="3" height="4" rx="1" {...p}/><line x1="6" y1="10" x2="6" y2="14" {...p}/><line x1="18" y1="10" x2="18" y2="14" {...p}/><line x1="9" y1="14" x2="15" y2="14" {...p}/></svg>,
    mic:     <svg style={s} viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="11" rx="3" {...p}/><path d="M19 10a7 7 0 0 1-14 0" {...p}/><line x1="12" y1="19" x2="12" y2="22" {...p}/><line x1="8" y1="22" x2="16" y2="22" {...p}/></svg>,
    bell:    <svg style={s} viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" {...p}/><path d="M13.73 21a2 2 0 0 1-3.46 0" {...p}/></svg>,
    toggle:  <svg style={s} viewBox="0 0 24 24"><rect x="1" y="5" width="22" height="14" rx="7" {...p}/><circle cx="16" cy="12" r="3" fill={color} stroke="none"/></svg>,
  };
  return icons[name]||<svg style={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" {...p}/></svg>;
};

const StepIll = ({type,size=64}) => {
  const s={width:size,height:size,display:"block"};
  const ills = {
    chop:(
      <svg style={s} viewBox="0 0 64 64" fill="none">
        <rect x="8" y="38" width="48" height="18" rx="4" fill="#e5ede7"/>
        <rect x="16" y="28" width="8" height="13" rx="3" fill="#fdf5e0" stroke="#8a7030" strokeWidth="1"/>
        <rect x="28" y="22" width="8" height="19" rx="3" fill="#fceee6" stroke="#b85c2a" strokeWidth="1"/>
        <rect x="40" y="30" width="8" height="11" rx="3" fill="#fdf5e0" stroke="#8a7030" strokeWidth="1"/>
        <path d="M46 8 L54 16 L32 38 L24 38 L24 30 Z" fill="#6b6355" opacity="0.35"/>
        <line x1="50" y1="6" x2="56" y2="12" stroke="#6b6355" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
    sear:(
      <svg style={s} viewBox="0 0 64 64" fill="none">
        <ellipse cx="32" cy="54" rx="26" ry="6" fill="#e5ede7" opacity="0.7"/>
        <path d="M10 54 Q10 40 32 38 Q54 40 54 54" fill="white" stroke="#e2d8cc" strokeWidth="1.5"/>
        <rect x="20" y="26" width="24" height="14" rx="4" fill="#b85c2a" opacity="0.25"/>
        <path d="M20 30 Q32 24 44 30" stroke="#b85c2a" strokeWidth="2" fill="none"/>
        <path d="M22 14 Q20 8 24 4" stroke="#b85c2a" strokeWidth="1.5" strokeLinecap="round" opacity="0.45"/>
        <path d="M32 12 Q30 6 34 2" stroke="#b85c2a" strokeWidth="1.5" strokeLinecap="round" opacity="0.65"/>
        <path d="M42 14 Q40 8 44 4" stroke="#b85c2a" strokeWidth="1.5" strokeLinecap="round" opacity="0.45"/>
      </svg>
    ),
    boil:(
      <svg style={s} viewBox="0 0 64 64" fill="none">
        <rect x="8" y="30" width="48" height="26" rx="5" fill="#dbeafe"/>
        <rect x="8" y="30" width="48" height="8" fill="white" opacity="0.5" rx="2"/>
        <ellipse cx="16" cy="28" rx="2.5" ry="4" fill="white" opacity="0.4"/>
        <ellipse cx="24" cy="26" rx="2.5" ry="4" fill="white" opacity="0.45"/>
        <ellipse cx="32" cy="28" rx="2.5" ry="4" fill="white" opacity="0.5"/>
        <ellipse cx="40" cy="26" rx="2.5" ry="4" fill="white" opacity="0.45"/>
        <ellipse cx="48" cy="28" rx="2.5" ry="4" fill="white" opacity="0.4"/>
        <rect x="4" y="52" width="56" height="5" rx="2.5" fill="#273d2f" opacity="0.12"/>
      </svg>
    ),
    stir:(
      <svg style={s} viewBox="0 0 64 64" fill="none">
        <ellipse cx="32" cy="48" rx="22" ry="12" fill="#fdf5e0"/>
        <ellipse cx="32" cy="46" rx="16" ry="8" fill="#8a7030" opacity="0.12"/>
        <path d="M32 10 Q38 22 32 34 Q26 46 32 54" stroke="#273d2f" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <circle cx="32" cy="10" r="4" fill="#273d2f" opacity="0.5"/>
        <path d="M14 40 Q22 34 32 44 Q42 54 52 44" stroke="#8a7030" strokeWidth="1.5" fill="none" opacity="0.5"/>
      </svg>
    ),
    rest:(
      <svg style={s} viewBox="0 0 64 64" fill="none">
        <rect x="10" y="36" width="44" height="20" rx="5" fill="#e5ede7"/>
        <rect x="10" y="36" width="44" height="10" rx="4" fill="#273d2f" opacity="0.1"/>
        <path d="M18 36 Q32 26 46 36" fill="#b85c2a" opacity="0.18"/>
        <path d="M14 14 L22 14 L14 24 L22 24" stroke="#6b6355" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4"/>
        <path d="M28 12 L36 12 L28 22 L36 22" stroke="#6b6355" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4"/>
        <path d="M42 14 L50 14 L42 24 L50 24" stroke="#6b6355" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4"/>
      </svg>
    ),
    mix:(
      <svg style={s} viewBox="0 0 64 64" fill="none">
        <path d="M12 54 Q12 36 32 30 Q52 36 52 54 Z" fill="#fdf5e0" stroke="#8a7030" strokeWidth="1.5"/>
        <circle cx="24" cy="44" r="4" fill="#b85c2a" opacity="0.32"/>
        <circle cx="38" cy="46" r="3.5" fill="#273d2f" opacity="0.22"/>
        <circle cx="31" cy="38" r="3" fill="#8a7030" opacity="0.42"/>
        <path d="M32 12 Q36 22 32 30 Q28 38 32 44" stroke="#6b6355" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.45"/>
      </svg>
    ),
    heat:(
      <svg style={s} viewBox="0 0 64 64" fill="none">
        <rect x="8" y="30" width="48" height="26" rx="6" fill="#fdf5e0" stroke="#8a7030" strokeWidth="1.5"/>
        <path d="M16 44 Q24 38 32 44 Q40 50 48 44" stroke="#8a7030" strokeWidth="2" fill="none"/>
        <path d="M18 24 Q16 16 20 10" stroke="#b85c2a" strokeWidth="2" strokeLinecap="round" opacity="0.45"/>
        <path d="M32 22 Q30 14 34 8" stroke="#b85c2a" strokeWidth="2" strokeLinecap="round" opacity="0.65"/>
        <path d="M46 24 Q44 16 48 10" stroke="#b85c2a" strokeWidth="2" strokeLinecap="round" opacity="0.45"/>
      </svg>
    ),
    season:(
      <svg style={s} viewBox="0 0 64 64" fill="none">
        <rect x="14" y="40" width="36" height="16" rx="5" fill="#fceee6"/>
        <circle cx="24" cy="34" r="8" fill="white" stroke="#e2d8cc" strokeWidth="1.5"/>
        <circle cx="40" cy="34" r="8" fill="white" stroke="#e2d8cc" strokeWidth="1.5"/>
        <line x1="20" y1="28" x2="20" y2="26" stroke="#6b6355" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        <line x1="24" y1="28" x2="24" y2="26" stroke="#6b6355" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        <line x1="28" y1="28" x2="28" y2="26" stroke="#6b6355" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        <line x1="36" y1="28" x2="36" y2="26" stroke="#6b6355" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        <line x1="40" y1="28" x2="40" y2="26" stroke="#6b6355" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        <line x1="44" y1="28" x2="44" y2="26" stroke="#6b6355" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
    plate:(
      <svg style={s} viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="38" r="22" fill="#faf7f2" stroke="#e2d8cc" strokeWidth="1.5"/>
        <circle cx="32" cy="38" r="16" fill="#f5f1ea" stroke="#e2d8cc" strokeWidth="1"/>
        <circle cx="26" cy="36" r="5" fill="#b85c2a" opacity="0.22"/>
        <circle cx="37" cy="33" r="6" fill="#273d2f" opacity="0.16"/>
        <circle cx="32" cy="43" r="4" fill="#8a7030" opacity="0.28"/>
        <path d="M32 16 Q34 10 32 6" stroke="#6b6355" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
      </svg>
    ),
    default:(
      <svg style={s} viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="24" fill="#e5ede7"/>
        <path d="M20 32 Q26 24 32 32 Q38 40 44 32" stroke="#273d2f" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </svg>
    ),
  };
  return ills[type]||ills.default;
};

function stepType(text) {
  const t=text.toLowerCase();
  if(t.match(/chop|slice|dice|cut|mince|trim|shred/)) return "chop";
  if(t.match(/sear|brown|fry|golden|crisp|caramel/)) return "sear";
  if(t.match(/boil|simmer|blanch|poach|reduce/)) return "boil";
  if(t.match(/stir|toss|fold|mix.*pan/)) return "stir";
  if(t.match(/rest|leave.*aside|stand/)) return "rest";
  if(t.match(/season|salt|pepper/)) return "season";
  if(t.match(/heat|warm|roast|bake|oven/)) return "heat";
  if(t.match(/mix|whisk|combine|blend/)) return "mix";
  if(t.match(/serve|plate|dish|assemble/)) return "plate";
  return "default";
}

const RECIPES = [
  {id:"b1",slot:"breakfast",name:"Bircher muesli",emoji:"🥣",color:"#f5e6c8",cal:340,prot:14,fat:8,carbs:52,cost:1.40,time:5,
   tags:["batch","vegetarian"],seasonal:[],cuisine:"british",goals:["wellbeing","budget","loseweight"],batch:true,
   batchNote:"Make four jars on Sunday and breakfast is sorted through to Thursday.",
   why:"Five seconds in the morning. You did the work the night before.",servings:1,
   ings:[{n:"Rolled oats",q:"80g",a:"grains"},{n:"Apple juice",q:"150ml",a:"other"},{n:"Natural yoghurt",q:"100g",a:"dairy"},{n:"Mixed berries",q:"80g",a:"produce"},{n:"Runny honey",q:"1 tsp",a:"condiments"}],
   steps:["Measure oats into a jar, pour over the apple juice. The oats absorb nearly all of it overnight.","Stir in yoghurt, cover and refrigerate overnight.","Top with berries and a drizzle of honey in the morning."]},
  {id:"b2",slot:"breakfast",name:"Smoked salmon on rye",emoji:"🐟",color:"#ffe4d4",cal:385,prot:32,fat:14,carbs:28,cost:4.20,time:8,
   tags:["quick","high-prot"],seasonal:[],cuisine:"nordic",goals:["muscle","wellbeing"],batch:false,
   why:"32g protein before you have made a single decision today.",servings:1,
   ings:[{n:"Smoked salmon",q:"100g",a:"protein"},{n:"Rye bread",q:"2 slices",a:"bakery"},{n:"Full-fat cream cheese",q:"2 tbsp",a:"dairy"},{n:"Capers",q:"1 tsp",a:"condiments"},{n:"Lemon",q:"half",a:"produce"}],
   steps:["Toast rye until firm. It needs to hold the weight without going soft.","Spread generously with cream cheese while still warm.","Lay over salmon, scatter capers, squeeze lemon, grind over black pepper."]},
  {id:"b3",slot:"breakfast",name:"Porridge with almond butter",emoji:"🫙",color:"#f0e8d0",cal:420,prot:16,fat:14,carbs:58,cost:1.30,time:8,
   tags:["warming","vegetarian","family"],seasonal:[],cuisine:"british",goals:["wellbeing","budget","family"],batch:false,
   why:"The most dependable breakfast there is.",servings:1,
   ings:[{n:"Porridge oats",q:"80g",a:"grains"},{n:"Whole milk",q:"280ml",a:"dairy"},{n:"Banana",q:"1",a:"produce"},{n:"Almond butter",q:"1 tbsp",a:"condiments"}],
   steps:["Combine oats, milk and a pinch of salt in a pan over medium heat.","Stir constantly for 5 to 6 minutes until thick and creamy.","Pour into bowls, top with sliced banana and almond butter."]},
  {id:"l1",slot:"lunch",name:"Chicken and bulgur tabbouleh",emoji:"🌿",color:"#d4edda",cal:470,prot:42,fat:12,carbs:46,cost:5.80,time:20,
   tags:["meal-prep","high-prot"],seasonal:[],cuisine:"middle-eastern",goals:["muscle","wellbeing"],batch:true,
   batchNote:"Make three portions. It is genuinely better the next day and keeps for four days.",
   why:"42g protein. Better the next day.",servings:1,
   ings:[{n:"Chicken breast",q:"150g",a:"protein"},{n:"Bulgur wheat",q:"75g",a:"grains"},{n:"Flat-leaf parsley",q:"large bunch",a:"produce"},{n:"Cherry tomatoes",q:"100g",a:"produce"},{n:"Lemon",q:"1",a:"produce"},{n:"Extra virgin olive oil",q:"2 tbsp",a:"condiments"}],
   steps:["Pour boiling water over bulgur, season, cover for 15 minutes then drain any excess.","Poach chicken in simmering salted water for 12 to 14 minutes, rest, then shred with two forks.","Chop parsley finely, stalks included, and halve the tomatoes.","Combine everything and dress with olive oil and the whole lemon. It wants to be sharp and well seasoned."]},
  {id:"l2",slot:"lunch",name:"Roasted tomato soup",emoji:"🍅",color:"#fde8d8",cal:280,prot:8,fat:10,carbs:38,cost:2.80,time:45,
   tags:["batch","warming","vegetarian"],seasonal:["tomatoes"],cuisine:"british",goals:["budget","wellbeing","loseweight"],batch:true,
   batchNote:"Doubles easily. Freeze half in portions.",
   why:"Roasting concentrates everything. This is why tinned soup disappoints.",servings:4,
   ings:[{n:"Vine tomatoes",q:"1kg",a:"produce",seasonal:true},{n:"Garlic",q:"1 head",a:"produce"},{n:"Basil",q:"large bunch",a:"produce"},{n:"Vegetable stock",q:"500ml",a:"storecup"},{n:"Double cream",q:"3 tbsp",a:"dairy"},{n:"Olive oil",q:"3 tbsp",a:"condiments"}],
   steps:["Heat oven to 200C. Halve tomatoes, break garlic into unpeeled cloves, spread on a tray with oil and salt.","Roast for 35 to 40 minutes until collapsed and caramelised at the edges.","Squeeze garlic from skins into a blender with tomatoes, stock and basil. Blend smooth.","Reheat gently, stir in cream before serving."]},
  {id:"l3",slot:"lunch",name:"Tuna Nicoise",emoji:"🥗",color:"#e8f4e8",cal:430,prot:40,fat:18,carbs:22,cost:5.20,time:12,
   tags:["quick","high-prot"],seasonal:[],cuisine:"french",goals:["muscle","loseweight","wellbeing"],batch:false,
   why:"40g protein. Barely any cooking.",servings:1,
   ings:[{n:"Tuna in olive oil",q:"2 x 80g tins",a:"tins"},{n:"Green beans",q:"100g",a:"produce"},{n:"Cherry tomatoes",q:"80g",a:"produce"},{n:"Black olives",q:"30g",a:"condiments"},{n:"Dijon mustard",q:"1 tsp",a:"condiments"},{n:"Red wine vinegar",q:"1 tsp",a:"condiments"}],
   steps:["Blanch green beans in well-salted boiling water for 3 minutes, then into cold water to keep them green.","Drain tuna and keep the oil from one tin for your dressing.","Whisk reserved oil with mustard, vinegar and salt into a sharp dressing.","Arrange everything and dress just before eating."]},
  {id:"l4",slot:"lunch",name:"Kale Caesar",emoji:"🥬",color:"#c8e6d4",cal:390,prot:34,fat:20,carbs:18,cost:5.60,time:14,
   tags:["seasonal","high-prot"],seasonal:["kale"],cuisine:"british",goals:["muscle","loseweight"],batch:false,
   why:"Kale holds dressing in a way lettuce never does.",servings:1,
   ings:[{n:"Kale",q:"100g",a:"produce",seasonal:true},{n:"Cooked chicken breast",q:"120g",a:"protein"},{n:"Parmesan",q:"25g",a:"dairy"},{n:"Sourdough",q:"1 thick slice",a:"bakery"},{n:"Caesar dressing",q:"3 tbsp",a:"condiments"},{n:"Lemon",q:"half",a:"produce"}],
   steps:["Tear kale into a bowl, add half the dressing and lemon. Massage firmly for 2 minutes until softened.","Tear sourdough into chunks, toss in oil, toast in a dry pan until golden and crisp.","Add sliced chicken, croutons, remaining dressing and shaved parmesan."]},
  {id:"d1",slot:"dinner",name:"Pan-fried sea bass",emoji:"🐟",color:"#e8f4f8",cal:520,prot:46,fat:28,carbs:12,cost:11.50,time:22,
   tags:["quick","elegant","high-prot"],seasonal:[],cuisine:"mediterranean",goals:["wellbeing","muscle","loseweight"],batch:false,
   why:"Restaurant quality. The technique is just a very hot pan.",servings:2,
   ings:[{n:"Sea bass fillets",q:"2 x 150g",a:"protein"},{n:"Cherry tomatoes",q:"200g",a:"produce"},{n:"Capers",q:"2 tbsp",a:"condiments"},{n:"Lemon",q:"1",a:"produce"},{n:"Unsalted butter",q:"25g",a:"dairy"},{n:"Olive oil",q:"2 tbsp",a:"condiments"}],
   steps:["Roast tomatoes on a tray with oil and salt at 200C for 12 minutes.","Score fish skin three times and pat completely dry. Moisture kills crisp skin.","Heat oil in a heavy pan until it shimmers and just smokes.","Lay fish skin-down, press gently for 30 seconds. Cook for 3 minutes without moving.","Flip, cook for 1 minute, rest on a warm plate.","Off the heat, add lemon juice and swirl in butter and capers until it emulsifies.","Pour over the fish and serve with the tomatoes."]},
  {id:"d2",slot:"dinner",name:"Slow-cooked lamb shoulder",emoji:"🍖",color:"#f5e0d0",cal:680,prot:58,fat:42,carbs:8,cost:14.50,time:260,
   tags:["weekend","family","batch"],seasonal:[],cuisine:"middle-eastern",goals:["family","wellbeing"],batch:true,
   batchNote:"Leftovers make excellent wraps the next day. Cook once, eat twice.",
   why:"Sunday ritual. Gets better every hour.",servings:4,
   ings:[{n:"Lamb shoulder",q:"about 1.8kg",a:"protein"},{n:"Garlic",q:"1 head",a:"produce"},{n:"Rosemary",q:"4 sprigs",a:"produce"},{n:"Tinned chopped tomatoes",q:"400g",a:"tins"},{n:"Red wine",q:"200ml",a:"other"},{n:"Brown onions",q:"2 large",a:"produce"}],
   steps:["Take lamb from the fridge an hour before. It cooks more evenly from room temperature.","Heat oven to 160C. Brown the shoulder all over in a hot casserole, 10 to 12 minutes with real colour.","Remove lamb, cook halved onions and garlic in the fat for 5 minutes.","Add wine, reduce by half, then add tomatoes and rosemary.","Sit lamb on top, cover tightly and cook for 4 hours in the oven.","Check at 3 hours. It should yield to a fork.","Rest uncovered for 20 minutes, then shred with two forks."]},
  {id:"d3",slot:"dinner",name:"Turkey meatballs",emoji:"🍝",color:"#fde8d8",cal:490,prot:54,fat:14,carbs:40,cost:8.50,time:35,
   tags:["quick","high-prot","family"],seasonal:[],cuisine:"italian",goals:["muscle","loseweight","family"],batch:true,
   batchNote:"Double the batch and freeze half before adding sauce.",
   why:"54g protein. Everyone eats it. Freezes perfectly.",servings:4,
   ings:[{n:"Turkey mince",q:"500g",a:"protein"},{n:"Rigatoni",q:"320g",a:"grains"},{n:"Tinned chopped tomatoes",q:"2 x 400g",a:"tins"},{n:"Garlic",q:"4 cloves",a:"produce"},{n:"Parmesan",q:"50g",a:"dairy"},{n:"Dried oregano",q:"1 tsp",a:"condiments"}],
   steps:["Season mince with salt, pepper, oregano and half the parmesan.","Roll into golf-ball-sized meatballs with damp hands.","Brown in batches in oil over high heat, 3 minutes per batch. Do not crowd the pan.","Fry crushed garlic for 1 minute in the same pan, add tomatoes, simmer for 10 minutes.","Return meatballs, cover and simmer gently for 15 minutes.","Cook pasta in well-salted water. Serve with remaining parmesan."]},
  {id:"d4",slot:"dinner",name:"Chicken souvlaki and tzatziki",emoji:"🫓",color:"#fdf0d0",cal:560,prot:52,fat:16,carbs:48,cost:9.80,time:25,
   tags:["family","high-prot","quick"],seasonal:[],cuisine:"mediterranean",goals:["family","muscle","wellbeing"],batch:false,
   why:"Everyone eats it. Adults, kids, first-time guests.",servings:4,
   ings:[{n:"Chicken thighs, boneless",q:"600g",a:"protein"},{n:"Greek yoghurt",q:"250g",a:"dairy"},{n:"Cucumber",q:"half",a:"produce"},{n:"Pittas",q:"4",a:"bakery"},{n:"Lemon",q:"1",a:"produce"},{n:"Dried oregano",q:"2 tsp",a:"condiments"},{n:"Garlic",q:"3 cloves",a:"produce"}],
   steps:["Mix chicken with olive oil, lemon zest, 2 crushed garlic cloves, oregano, salt and pepper. Twenty minutes minimum.","Grill on the highest heat for 5 to 6 minutes each side until charred in places.","Rest for 5 minutes while you make tzatziki: grate cucumber, squeeze out water, mix with yoghurt, remaining garlic and lemon.","Warm pittas in a dry pan and let everyone assemble their own at the table."]},
  {id:"d5",slot:"dinner",name:"Parsnip and chickpea tagine",emoji:"🫙",color:"#f5e8c0",cal:440,prot:20,fat:12,carbs:64,cost:5.20,time:50,
   tags:["vegetarian","warming","batch","family"],seasonal:["parsnips"],cuisine:"north-african",goals:["budget","wellbeing","family"],batch:true,
   batchNote:"Better the second day. Make Sunday, eat Monday too.",
   why:"Parsnips at their sweetest. Costs almost nothing.",servings:4,
   ings:[{n:"Parsnips",q:"600g",a:"produce",seasonal:true},{n:"Chickpeas",q:"2 x 400g tins",a:"tins"},{n:"Tinned tomatoes",q:"400g",a:"tins"},{n:"Ras el hanout",q:"2 tsp",a:"condiments"},{n:"Couscous",q:"250g",a:"grains"},{n:"Brown onion",q:"1 large",a:"produce"},{n:"Preserved lemon",q:"1",a:"condiments"}],
   steps:["Chunk parsnips, toss with oil and a pinch of ras el hanout, roast at 200C for 25 minutes until golden.","Soften onion in oil for 8 minutes. Add remaining ras el hanout, stir for 1 minute.","Add chickpeas, tomatoes and 200ml water. Simmer for 15 minutes.","Add roasted parsnips and chopped preserved lemon. Check seasoning.","Couscous: pour 300ml boiling salted water over, cover for 5 minutes, fluff with a fork."]},
  {id:"d6",slot:"dinner",name:"Miso salmon and kale",emoji:"🍣",color:"#d4e8e0",cal:500,prot:46,fat:22,carbs:26,cost:10.80,time:20,
   tags:["quick","elegant","high-prot"],seasonal:["kale"],cuisine:"asian",goals:["muscle","loseweight","wellbeing"],batch:false,
   why:"20 minutes. The miso caramelises in the oven and it is remarkable for the effort.",servings:2,
   ings:[{n:"Salmon fillets",q:"2 x 160g",a:"protein"},{n:"White miso paste",q:"2 tbsp",a:"condiments"},{n:"Kale",q:"150g",a:"produce",seasonal:true},{n:"Fresh ginger",q:"thumb piece",a:"produce"},{n:"Soy sauce",q:"1 tbsp",a:"condiments"},{n:"Sesame oil",q:"2 tsp",a:"condiments"},{n:"Jasmine rice",q:"160g",a:"grains"}],
   steps:["Heat oven to 200C. Mix miso with soy sauce and a little sesame oil.","Brush salmon generously, place on a lined tray, roast for 12 minutes until caramelised at the edges.","Start rice. Shred kale off its stalks.","Stir-fry kale in a hot wok with oil and grated ginger for 3 minutes.","Serve salmon on rice with kale, drizzle with remaining sesame oil."]},
  {id:"d7",slot:"dinner",name:"Sausage, bean and kale stew",emoji:"🫘",color:"#e8f0d8",cal:580,prot:38,fat:28,carbs:42,cost:6.80,time:38,
   tags:["quick","family","budget","warming"],seasonal:["kale"],cuisine:"british",goals:["family","budget"],batch:true,
   batchNote:"Makes four portions and reheats brilliantly the next day.",
   why:"One pan. Under 40 minutes. Costs very little.",servings:4,
   ings:[{n:"Pork sausages",q:"8",a:"protein"},{n:"Cannellini beans",q:"2 x 400g tins",a:"tins"},{n:"Tinned tomatoes",q:"400g",a:"tins"},{n:"Kale",q:"100g",a:"produce",seasonal:true},{n:"Sage",q:"6 leaves",a:"produce"},{n:"Garlic",q:"3 cloves",a:"produce"}],
   steps:["Brown sausages all over for 7 to 8 minutes. Set aside.","Fry sliced garlic and sage in the sausage fat for 1 minute until sage crisps.","Add drained beans and tomatoes. Season well.","Return sausages, cover and simmer for 20 minutes.","Stir in shredded kale, cover for 3 minutes until wilted.","Taste. It needs more salt than you expect. Serve with crusty bread."]},
  {id:"d8",slot:"dinner",name:"Roast chicken with fennel",emoji:"🍗",color:"#fdf0d0",cal:620,prot:58,fat:34,carbs:14,cost:12.50,time:90,
   tags:["weekend","family","batch"],seasonal:[],cuisine:"french",goals:["family","wellbeing"],batch:true,
   batchNote:"The carcass makes stock. Leftovers are excellent cold in a salad.",
   why:"Sunday ritual. Takes care of Monday too.",servings:4,
   ings:[{n:"Whole chicken",q:"about 1.6kg",a:"protein"},{n:"Fennel bulbs",q:"2",a:"produce"},{n:"Lemon",q:"2",a:"produce"},{n:"Garlic",q:"1 head",a:"produce"},{n:"Unsalted butter",q:"50g",a:"dairy"},{n:"Thyme",q:"small bunch",a:"produce"}],
   steps:["Take chicken from the fridge 1 hour before. It cooks more evenly from room temperature.","Heat oven to 200C. Quarter fennel, halve lemons, break garlic into unpeeled cloves and spread in a roasting tin.","Rub chicken all over with softened butter, season very generously, stuff cavity with thyme and a lemon half.","Sit on the vegetables and roast for 1 hour 15 minutes until juices run clear from the thigh.","Rest for 15 minutes before carving. Non-negotiable.","Squeeze soft garlic from skins into the tin juices for a simple sauce."]},
];

const AISLES = {
  protein:{label:"Meat and Fish",order:1},dairy:{label:"Dairy",order:2},produce:{label:"Fresh Produce",order:3},
  grains:{label:"Grains and Pasta",order:4},tins:{label:"Tins and Pulses",order:5},
  condiments:{label:"Oils and Sauces",order:6},bakery:{label:"Bakery",order:7},
  storecup:{label:"Store Cupboard",order:8},other:{label:"Other",order:9},
};
function useWeatherSilent() {
  const [wx,setWx]=useState({cold:false,mood:"mild"});
  useEffect(()=>{
    fetch("https://api.open-meteo.com/v1/forecast?latitude=51.5074&longitude=-0.1278&daily=weathercode,temperature_2m_max&timezone=Europe/London&forecast_days=1")
      .then(r=>r.json()).then(d=>{
        const code=d.daily.weathercode[0],max=d.daily.temperature_2m_max[0];
        setWx({cold:max<12,mood:code>=61?"rainy":max>18?"warm":max<12?"cold":"mild"});
      }).catch(()=>{});
  },[]);
  return wx;
}

function scoreR(r,ctx){
  let s=50;
  const{goal,wxCold,wxMood,isWeekend,servings,recentIds=[],recentCuisines=[]}=ctx;
  if(r.goals?.includes(goal)) s+=22;
  if(wxCold&&(r.tags?.includes("warming")||r.time>30)) s+=14;
  if(!wxCold&&wxMood==="warm"&&r.time<=20) s+=8;
  if(r.seasonal?.some(x=>SEASON.items.includes(x))) s+=16;
  if(!isWeekend&&r.time<=30) s+=12;
  if(!isWeekend&&r.time>90) s-=20;
  if(recentIds.includes(r.id)) s-=45;
  if(recentCuisines.includes(r.cuisine)) s-=8;
  if(servings===1&&r.tags?.includes("quick")) s+=7;
  if(servings>=4&&r.tags?.includes("family")) s+=14;
  return s+Math.random()*4;
}
function rec(slot,ctx,n=8){
  return RECIPES.filter(r=>r.slot===slot).map(r=>({...r,sc:scoreR(r,ctx)})).sort((a,b)=>b.sc-a.sc).slice(0,n);
}
function buildWeek(profile,wx){
  const{goal,servings=2}=profile;
  const ids=[],cuis=[];
  return DAYS_SHORT.reduce((week,day,i)=>{
    const isWeekend=i>=5;
    const ctx={goal,wxCold:wx.cold,wxMood:wx.mood,isWeekend,servings,recentIds:[...ids],recentCuisines:[...cuis]};
    const b=rec("breakfast",ctx,3)[0]||RECIPES.find(r=>r.slot==="breakfast");
    const l=rec("lunch",ctx,3)[0]||RECIPES.find(r=>r.slot==="lunch");
    const d=rec("dinner",ctx,3)[0]||RECIPES.find(r=>r.slot==="dinner");
    [b,l,d].forEach(r=>{if(r){ids.push(r.id);if(r.cuisine&&!cuis.includes(r.cuisine))cuis.push(r.cuisine);}});
    return{...week,[day]:{breakfast:b?.id,lunch:l?.id,dinner:d?.id,servings}};
  },{});
}

function getWhy(recipe,ctx){
  if(!recipe) return null;
  const{goal,isWeekend,servings,kidsHome=[],day,kidName}=ctx;
  const isSeasonal=recipe.seasonal?.some(s=>SEASON.items.includes(s));
  if(isSeasonal&&recipe.seasonal[0]) return `${recipe.seasonal[0]} is at its best right now`;
  if(!isWeekend&&recipe.time<=20) return `${recipe.time} minutes. Nothing to think about on a ${DAYS_LONG[DAYS_SHORT.indexOf(day)]||"weeknight"}.`;
  if(recipe.goals?.includes("muscle")&&goal==="muscle") return `Your strongest protein meal of the week. ${recipe.prot}g without really trying.`;
  if(recipe.goals?.includes("loseweight")&&goal==="loseweight") return `${recipe.cal} calories. Fits your target without feeling like it.`;
  if(recipe.goals?.includes("budget")&&goal==="budget") return `Just over ${recipe.cost.toFixed(2)} a head. Tastes like it cost more.`;
  if(recipe.batch) return recipe.batchNote||"Make extra. It pays off later in the week.";
  if(kidsHome?.includes(day)&&recipe.tags?.includes("family")) return kidName?`${kidName} is home tonight and will eat this without argument.`:"Everyone home tonight. This one works for all of them.";
  if(servings===1&&recipe.tags?.includes("quick")) return "Scales down perfectly for one.";
  if(isWeekend&&recipe.time>60) return "Worth the time on a weekend.";
  return recipe.why||null;
}

function getDayBrief(profile,dayKey,week,weekNum=1){
  const dayIdx=DAYS_SHORT.indexOf(dayKey);
  const isWeekend=dayIdx>=5;
  const isToday=dayIdx===TODAY_IDX;
  const kidsHome=profile.kidsHome||[];
  const kidName=profile.kidName||null;
  const hasKidsToday=kidsHome.includes(dayKey);
  const dp=week[dayKey];
  const dinner=RECIPES.find(r=>r.id===dp?.dinner);
  const isLongCook=dinner&&dinner.time>60;
  const isBatch=dinner&&dinner.batch;
  const isSeasonal=dinner&&dinner.seasonal?.some(s=>SEASON.items.includes(s));
  const dayName=DAYS_LONG[dayIdx]||dayKey;

  if(weekNum===1){
    return "First week, so I am still finding my feet with you. Here is what feels right and if anything is off, just swap it out.";
  }
  if(hasKidsToday&&kidName){
    if(isLongCook) return `${kidName} is home tonight. I have gone for something they will eat and it only needs about half an hour.`;
    return `${kidName} is home tonight. I have kept it straightforward.`;
  }
  if(hasKidsToday){
    return "Everyone is home tonight. I have made it easy and chosen something that tends to go down well across the board.";
  }
  if(!isWeekend&&dinner&&dinner.time<=20){
    return `It is a ${dayName}. Here is something that will not make you think twice.`;
  }
  if(isWeekend&&isLongCook){
    return "You have got the weekend. I have given you something worth sitting down for.";
  }
  if(isSeasonal&&dinner){
    return `${dinner.seasonal[0].charAt(0).toUpperCase()+dinner.seasonal[0].slice(1)} are genuinely at their best right now. It seemed like the obvious choice.`;
  }
  if(isBatch){
    return "If you do the batch cook tonight it takes most of the pressure off the middle of the week.";
  }
  if(profile.goal==="muscle"){
    return "You are well over your protein target today. I have made sure of it without making every meal feel like a gym lunch.";
  }
  if(profile.goal==="loseweight"){
    return "A lighter day today. Stays within your target and still feels like proper food.";
  }
  return "Here is your day. Let me know if anything is not right.";
}

function getWeekSummary(week,profile){
  const meals=DAYS_SHORT.flatMap(d=>["breakfast","lunch","dinner"].map(s=>RECIPES.find(r=>r.id===week[d]?.[s])).filter(Boolean));
  const totalCost=meals.reduce((s,r)=>s+r.cost,0);
  const avgProt=Math.round(meals.reduce((s,r)=>s+r.prot,0)/7);
  const hasBatch=meals.some(r=>r.batch);
  if(profile.goal==="budget") return `${totalCost.toFixed(0)} pounds across all seven days. ${hasBatch?"The batch cook on Sunday makes Tuesday and Wednesday almost effortless.":"A well-planned week tends to cost about this."}`;
  if(profile.goal==="muscle") return `You are averaging ${avgProt}g of protein a day this week. I have made sure of it without making every meal feel like a gym lunch.`;
  if(hasBatch) return `A solid week. ${DAYS_SHORT.filter(d=>RECIPES.find(r=>r.id===week[d]?.dinner)?.batch).length>1?"Two batch cooks":"One batch cook"} on the weekend sets you up and takes most of the pressure off the middle of the week.`;
  return `A good week ahead. Runs lean Monday to Wednesday and then more generous at the weekend.`;
}

function getMeal(id){return RECIPES.find(r=>r.id===id);}
function dayTotals(p){
  return["breakfast","lunch","dinner"].reduce((a,s)=>{
    const m=getMeal(p?.[s]);return m?{cal:a.cal+m.cal,prot:a.prot+m.prot,cost:a.cost+m.cost}:a;
  },{cal:0,prot:0,cost:0});
}

function AIBrief({text,style={},dark=false}){
  if(!text) return null;
  const textColor=dark?"rgba(250,248,244,0.82)":C.aiText;
  const bg=dark?"rgba(255,255,255,0.07)":C.aiBg;
  const border=dark?"rgba(122,158,128,0.5)":C.aiBorder;
  return(
    <div style={{background:bg,borderRadius:14,padding:"14px 16px 14px 18px",borderLeft:`3px solid ${border}`,position:"relative",...style}}>
      <div style={{fontFamily:F.serif,fontStyle:"italic",fontWeight:300,fontSize:15,color:textColor,lineHeight:1.75,letterSpacing:"0.01em"}}>
        {text}
      </div>
    </div>
  );
}

function Tag({children,bg=C.bg,fg=C.muted,icon}){
  return(<span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:100,background:bg,color:fg,fontFamily:F.sans,fontSize:11,fontWeight:500,whiteSpace:"nowrap",lineHeight:1.4}}>{icon&&<Icon name={icon} size={11} color={fg} sw={2}/>}{children}</span>);
}

// Bespoke illustrated scenes per recipe — each reads as the actual dish
const RECIPE_SCENES = {
  // Bircher muesli — jar with layers, scattered berries
  b1: (w,h) => (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height:"100%"}} preserveAspectRatio="xMidYMid slice">
      <rect width={w} height={h} fill="#f5e6c8"/>
      <ellipse cx={w*0.5} cy={h*0.78} rx={w*0.22} ry={h*0.07} fill="#c8a96e" opacity="0.35"/>
      {/* Jar body */}
      <rect x={w*0.32} y={h*0.25} width={w*0.36} height={h*0.52} rx="8" fill="rgba(255,255,255,0.75)" stroke="#c8a96e" strokeWidth="1.5"/>
      {/* Oat layer */}
      <rect x={w*0.32} y={h*0.52} width={w*0.36} height={h*0.25} rx="0 0 8 8" fill="#e8d5a0" opacity="0.8"/>
      {/* Yoghurt layer */}
      <rect x={w*0.32} y={h*0.38} width={w*0.36} height={h*0.15} fill="rgba(255,255,255,0.9)" opacity="0.9"/>
      {/* Berry dots on top */}
      <circle cx={w*0.44} cy={h*0.32} r="5" fill="#c0392b" opacity="0.85"/>
      <circle cx={w*0.53} cy={h*0.30} r="4" fill="#8e44ad" opacity="0.75"/>
      <circle cx={w*0.60} cy={h*0.33} r="4.5" fill="#c0392b" opacity="0.7"/>
      <circle cx={w*0.48} cy={h*0.29} r="3.5" fill="#e74c3c" opacity="0.8"/>
      {/* Honey drizzle */}
      <path d={`M${w*0.55} ${h*0.26} Q${w*0.58} ${h*0.31} ${w*0.55} ${h*0.36}`} stroke="#f39c12" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Jar lid */}
      <rect x={w*0.30} y={h*0.21} width={w*0.40} height={h*0.07} rx="4" fill="#c8a96e" opacity="0.7"/>
      {/* Scattered oats */}
      <ellipse cx={w*0.25} cy={h*0.6} rx="6" ry="2.5" fill="#c8a96e" opacity="0.3" transform={`rotate(-20,${w*0.25},${h*0.6})`}/>
      <ellipse cx={w*0.76} cy={h*0.55} rx="5" ry="2" fill="#c8a96e" opacity="0.3" transform={`rotate(15,${w*0.76},${h*0.55})`}/>
    </svg>
  ),
  // Smoked salmon on rye — layered open sandwich
  b2: (w,h) => (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height:"100%"}} preserveAspectRatio="xMidYMid slice">
      <rect width={w} height={h} fill="#ffe4d4"/>
      <ellipse cx={w*0.5} cy={h*0.85} rx={w*0.38} ry={h*0.06} fill="#c9856e" opacity="0.25"/>
      {/* Rye bread slice */}
      <rect x={w*0.15} y={h*0.55} width={w*0.70} height={h*0.22} rx="6" fill="#6b4c35"/>
      <rect x={w*0.15} y={h*0.55} width={w*0.70} height={h*0.06} rx="6 6 0 0" fill="#7d5a42"/>
      {/* Cream cheese layer */}
      <rect x={w*0.18} y={h*0.52} width={w*0.64} height={h*0.07} rx="4" fill="rgba(255,255,255,0.88)"/>
      {/* Salmon folds */}
      <path d={`M${w*0.18} ${h*0.46} Q${w*0.28} ${h*0.38} ${w*0.38} ${h*0.45} Q${w*0.48} ${h*0.52} ${w*0.38} ${h*0.52} Q${w*0.28} ${h*0.52} ${w*0.18} ${h*0.46}Z`} fill="#e8856e" opacity="0.9"/>
      <path d={`M${w*0.35} ${h*0.44} Q${w*0.45} ${h*0.36} ${w*0.55} ${h*0.43} Q${w*0.65} ${h*0.50} ${w*0.55} ${h*0.51} Q${w*0.45} ${h*0.51} ${w*0.35} ${h*0.44}Z`} fill="#d4705a" opacity="0.85"/>
      <path d={`M${w*0.52} ${h*0.45} Q${w*0.62} ${h*0.38} ${w*0.72} ${h*0.44} Q${w*0.80} ${h*0.50} ${w*0.72} ${h*0.52} Q${w*0.62} ${h*0.52} ${w*0.52} ${h*0.45}Z`} fill="#e8856e" opacity="0.8"/>
      {/* Capers */}
      <circle cx={w*0.30} cy={h*0.47} r="3" fill="#4a7c4e" opacity="0.8"/>
      <circle cx={w*0.50} cy={h*0.43} r="3" fill="#4a7c4e" opacity="0.8"/>
      <circle cx={w*0.68} cy={h*0.46} r="2.5" fill="#4a7c4e" opacity="0.7"/>
      {/* Lemon wedge */}
      <path d={`M${w*0.74} ${h*0.30} L${w*0.84} ${h*0.38} L${w*0.76} ${h*0.42} Z`} fill="#f9e04b" opacity="0.85"/>
      <path d={`M${w*0.74} ${h*0.30} L${w*0.84} ${h*0.38}`} stroke="#c8b400" strokeWidth="1" fill="none"/>
    </svg>
  ),
  // Porridge — steaming bowl with banana
  b3: (w,h) => (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height:"100%"}} preserveAspectRatio="xMidYMid slice">
      <rect width={w} height={h} fill="#f0e8d0"/>
      {/* Steam wisps */}
      <path d={`M${w*0.38} ${h*0.15} Q${w*0.35} ${h*0.08} ${w*0.38} ${h*0.02}`} stroke="rgba(255,255,255,0.6)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d={`M${w*0.50} ${h*0.12} Q${w*0.47} ${h*0.05} ${w*0.50} ${h*0.0}`} stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d={`M${w*0.62} ${h*0.15} Q${w*0.59} ${h*0.08} ${w*0.62} ${h*0.02}`} stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Bowl shadow */}
      <ellipse cx={w*0.5} cy={h*0.82} rx={w*0.32} ry={h*0.06} fill="#c8a96e" opacity="0.3"/>
      {/* Bowl */}
      <path d={`M${w*0.18} ${h*0.42} Q${w*0.18} ${h*0.78} ${w*0.50} ${h*0.78} Q${w*0.82} ${h*0.78} ${w*0.82} ${h*0.42} Z`} fill="white" stroke="#e0d0b0" strokeWidth="1.5"/>
      <ellipse cx={w*0.5} cy={h*0.42} rx={w*0.32} ry={h*0.07} fill="white" stroke="#e0d0b0" strokeWidth="1.5"/>
      {/* Porridge surface */}
      <ellipse cx={w*0.5} cy={h*0.42} rx={w*0.29} ry={h*0.065} fill="#e8d5a0"/>
      {/* Almond butter swirl */}
      <path d={`M${w*0.45} ${h*0.40} Q${w*0.52} ${h*0.38} ${w*0.56} ${h*0.42} Q${w*0.52} ${h*0.46} ${w*0.45} ${h*0.44}Z`} fill="#8B6914" opacity="0.7"/>
      {/* Banana slices */}
      <ellipse cx={w*0.36} cy={h*0.40} rx="9" ry="6" fill="#f9d423" stroke="#e8c000" strokeWidth="0.5"/>
      <ellipse cx={w*0.64} cy={h*0.41} rx="8" ry="5.5" fill="#f9d423" stroke="#e8c000" strokeWidth="0.5"/>
      <ellipse cx={w*0.50} cy={h*0.37} rx="7" ry="5" fill="#f9d423" stroke="#e8c000" strokeWidth="0.5"/>
    </svg>
  ),
  // Chicken tabbouleh — green herb bowl
  l1: (w,h) => (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height:"100%"}} preserveAspectRatio="xMidYMid slice">
      <rect width={w} height={h} fill="#d4edda"/>
      <ellipse cx={w*0.5} cy={h*0.82} rx={w*0.34} ry={h*0.06} fill="#5a8a60" opacity="0.2"/>
      {/* Bowl */}
      <path d={`M${w*0.15} ${h*0.38} Q${w*0.15} ${h*0.76} ${w*0.50} ${h*0.76} Q${w*0.85} ${h*0.76} ${w*0.85} ${h*0.38} Z`} fill="white" stroke="#c8e0cc" strokeWidth="1.5"/>
      <ellipse cx={w*0.5} cy={h*0.38} rx={w*0.35} ry={h*0.075} fill="white" stroke="#c8e0cc" strokeWidth="1.5"/>
      {/* Bulgur base */}
      <ellipse cx={w*0.5} cy={h*0.38} rx={w*0.32} ry={h*0.065} fill="#e8d89e"/>
      {/* Herb mass (parsley) */}
      <circle cx={w*0.40} cy={h*0.36} r={w*0.10} fill="#2ecc71" opacity="0.75"/>
      <circle cx={w*0.54} cy={h*0.34} r={w*0.09} fill="#27ae60" opacity="0.8"/>
      <circle cx={w*0.46} cy={h*0.32} r={w*0.07} fill="#2ecc71" opacity="0.65"/>
      {/* Chicken shreds */}
      <path d={`M${w*0.60} ${h*0.40} Q${w*0.68} ${h*0.36} ${w*0.72} ${h*0.40}`} stroke="#f5deb3" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.9"/>
      <path d={`M${w*0.62} ${h*0.44} Q${w*0.70} ${h*0.41} ${w*0.74} ${h*0.45}`} stroke="#ffe4b5" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.85"/>
      {/* Tomato halves */}
      <circle cx={w*0.30} cy={h*0.42} r="7" fill="#e74c3c" opacity="0.8"/>
      <circle cx={w*0.32} cy={h*0.37} r="6" fill="#c0392b" opacity="0.7"/>
      {/* Lemon squeeze drops */}
      <circle cx={w*0.72} cy={h*0.32} r="3" fill="#f9e04b" opacity="0.7"/>
      <circle cx={w*0.76} cy={h*0.36} r="2" fill="#f9e04b" opacity="0.6"/>
    </svg>
  ),
  // Tomato soup — rustic bowl with cream swirl
  l2: (w,h) => (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height:"100%"}} preserveAspectRatio="xMidYMid slice">
      <rect width={w} height={h} fill="#fde8d8"/>
      <ellipse cx={w*0.5} cy={h*0.83} rx={w*0.32} ry={h*0.055} fill="#a0402a" opacity="0.2"/>
      {/* Bowl */}
      <path d={`M${w*0.16} ${h*0.38} Q${w*0.16} ${h*0.77} ${w*0.50} ${h*0.77} Q${w*0.84} ${h*0.77} ${w*0.84} ${h*0.38} Z`} fill="white" stroke="#f0c8b0" strokeWidth="1.5"/>
      <ellipse cx={w*0.5} cy={h*0.38} rx={w*0.34} ry={h*0.075} fill="white" stroke="#f0c8b0" strokeWidth="1.5"/>
      {/* Soup surface */}
      <ellipse cx={w*0.5} cy={h*0.38} rx={w*0.31} ry={h*0.065} fill="#d45a3a"/>
      {/* Cream swirl */}
      <path d={`M${w*0.50} ${h*0.33} Q${w*0.58} ${h*0.35} ${w*0.56} ${h*0.40} Q${w*0.54} ${h*0.45} ${w*0.46} ${h*0.43} Q${w*0.40} ${h*0.40} ${w*0.44} ${h*0.35}Z`} fill="rgba(255,255,255,0.85)" opacity="0.9"/>
      {/* Basil leaf */}
      <ellipse cx={w*0.42} cy={h*0.36} rx="8" ry="5" fill="#2ecc71" opacity="0.85" transform={`rotate(-30,${w*0.42},${h*0.36})`}/>
      <line x1={w*0.39} y1={h*0.33} x2={w*0.45} y2={h*0.39} stroke="#27ae60" strokeWidth="0.8"/>
      {/* Bread slice leaning */}
      <rect x={w*0.68} y={h*0.22} width={w*0.16} height={h*0.22} rx="4" fill="#c8a060" transform={`rotate(8,${w*0.76},${h*0.33})`}/>
      <rect x={w*0.68} y={h*0.22} width={w*0.16} height={h*0.04} rx="4 4 0 0" fill="#a06030" opacity="0.6" transform={`rotate(8,${w*0.76},${h*0.33})`}/>
    </svg>
  ),
  // Tuna Nicoise — composed salad
  l3: (w,h) => (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height:"100%"}} preserveAspectRatio="xMidYMid slice">
      <rect width={w} height={h} fill="#e8f4e8"/>
      <ellipse cx={w*0.5} cy={h*0.82} rx={w*0.36} ry={h*0.055} fill="#4a7c4e" opacity="0.15"/>
      {/* Plate */}
      <ellipse cx={w*0.5} cy={h*0.54} rx={w*0.37} ry={h*0.37} fill="white" stroke="#d8e8d8" strokeWidth="1.5"/>
      <ellipse cx={w*0.5} cy={h*0.54} rx={w*0.30} ry={h*0.30} fill="#f0f8f0" stroke="#d8e8d8" strokeWidth="0.5"/>
      {/* Green beans */}
      <line x1={w*0.30} y1={h*0.38} x2={w*0.38} y2={h*0.56} stroke="#27ae60" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1={w*0.35} y1={h*0.36} x2={w*0.43} y2={h*0.54} stroke="#2ecc71" strokeWidth="3" strokeLinecap="round"/>
      <line x1={w*0.28} y1={h*0.42} x2={w*0.36} y2={h*0.60} stroke="#27ae60" strokeWidth="3" strokeLinecap="round"/>
      {/* Tuna chunks */}
      <rect x={w*0.48} y={h*0.40} width={w*0.15} height={h*0.10} rx="4" fill="#d4a574" opacity="0.9"/>
      <rect x={w*0.50} y={h*0.52} width={w*0.12} height={h*0.09} rx="3" fill="#c49060" opacity="0.85"/>
      {/* Cherry tomatoes */}
      <circle cx={w*0.38} cy={h*0.64} r="8" fill="#e74c3c" opacity="0.85"/>
      <circle cx={w*0.52} cy={h*0.66} r="7" fill="#c0392b" opacity="0.8"/>
      {/* Black olives */}
      <ellipse cx={w*0.64} cy={h*0.46} rx="6" ry="5" fill="#2c2c2c" opacity="0.8"/>
      <ellipse cx={w*0.66} cy={h*0.58} rx="5" ry="4.5" fill="#2c2c2c" opacity="0.7"/>
      {/* Mustard dressing pool */}
      <ellipse cx={w*0.58} cy={h*0.68} rx="12" ry="5" fill="#d4a800" opacity="0.35"/>
    </svg>
  ),
  // Kale Caesar — dark green salad with croutons
  l4: (w,h) => (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height:"100%"}} preserveAspectRatio="xMidYMid slice">
      <rect width={w} height={h} fill="#c8e6d4"/>
      <ellipse cx={w*0.5} cy={h*0.82} rx={w*0.34} ry={h*0.055} fill="#2d5a3a" opacity="0.18"/>
      {/* Bowl */}
      <path d={`M${w*0.16} ${h*0.36} Q${w*0.16} ${h*0.76} ${w*0.50} ${h*0.76} Q${w*0.84} ${h*0.76} ${w*0.84} ${h*0.36} Z`} fill="white" stroke="#b0d0bc" strokeWidth="1.5"/>
      <ellipse cx={w*0.5} cy={h*0.36} rx={w*0.34} ry={h*0.07} fill="white" stroke="#b0d0bc" strokeWidth="1.5"/>
      {/* Kale leaves — jagged dark green shapes */}
      <path d={`M${w*0.28} ${h*0.40} Q${w*0.22} ${h*0.34} ${w*0.30} ${h*0.30} Q${w*0.34} ${h*0.26} ${w*0.40} ${h*0.32} Q${w*0.44} ${h*0.38} ${w*0.36} ${h*0.42}Z`} fill="#1a5c2e" opacity="0.85"/>
      <path d={`M${w*0.40} ${h*0.38} Q${w*0.36} ${h*0.30} ${w*0.46} ${h*0.27} Q${w*0.54} ${h*0.24} ${w*0.56} ${h*0.32} Q${w*0.52} ${h*0.40} ${w*0.44} ${h*0.40}Z`} fill="#236b38" opacity="0.9"/>
      <path d={`M${w*0.54} ${h*0.38} Q${w*0.52} ${h*0.30} ${w*0.62} ${h*0.28} Q${w*0.70} ${h*0.26} ${w*0.70} ${h*0.36} Q${w*0.68} ${h*0.42} ${w*0.58} ${h*0.42}Z`} fill="#1a5c2e" opacity="0.8"/>
      {/* Parmesan shavings */}
      <ellipse cx={w*0.44} cy={h*0.35} rx="10" ry="3.5" fill="rgba(255,248,220,0.9)" transform={`rotate(-15,${w*0.44},${h*0.35})`}/>
      <ellipse cx={w*0.60} cy={h*0.38} rx="8" ry="3" fill="rgba(255,248,220,0.85)" transform={`rotate(10,${w*0.60},${h*0.38})`}/>
      {/* Croutons */}
      <rect x={w*0.30} y={h*0.45} width="14" height="11" rx="3" fill="#c8a060" opacity="0.9"/>
      <rect x={w*0.56} y={h*0.46} width="12" height="10" rx="3" fill="#b89050" opacity="0.85"/>
      <rect x={w*0.44} y={h*0.50} width="11" height="10" rx="3" fill="#c8a060" opacity="0.8"/>
      {/* Dressing */}
      <path d={`M${w*0.26} ${h*0.52} Q${w*0.40} ${h*0.56} ${w*0.60} ${h*0.52} Q${w*0.72} ${h*0.50} ${w*0.74} ${h*0.56}`} stroke="rgba(220,200,140,0.5)" strokeWidth="2.5" fill="none"/>
    </svg>
  ),
  // Sea bass — seared fillet on plate with capers
  d1: (w,h) => (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height:"100%"}} preserveAspectRatio="xMidYMid slice">
      <rect width={w} height={h} fill="#e8f4f8"/>
      <ellipse cx={w*0.5} cy={h*0.84} rx={w*0.36} ry={h*0.055} fill="#4a7c9e" opacity="0.15"/>
      {/* Plate */}
      <ellipse cx={w*0.5} cy={h*0.56} rx={w*0.37} ry={h*0.35} fill="white" stroke="#d0e4f0" strokeWidth="1.5"/>
      <ellipse cx={w*0.5} cy={h*0.56} rx={w*0.29} ry={h*0.27} fill="#f8fcff" stroke="#d0e4f0" strokeWidth="0.5"/>
      {/* Fish fillet — scored skin */}
      <path d={`M${w*0.24} ${h*0.52} Q${w*0.32} ${h*0.42} ${w*0.56} ${h*0.44} Q${w*0.74} ${h*0.46} ${w*0.76} ${h*0.54} Q${w*0.68} ${h*0.64} ${w*0.44} ${h*0.62} Q${w*0.28} ${h*0.60} ${w*0.24} ${h*0.52}Z`} fill="#d4a870"/>
      {/* Skin side — darker with score marks */}
      <path d={`M${w*0.24} ${h*0.52} Q${w*0.32} ${h*0.42} ${w*0.56} ${h*0.44} Q${w*0.66} ${h*0.45} ${w*0.70} ${h*0.48} Q${w*0.50} ${h*0.46} ${w*0.32} ${h*0.50}Z`} fill="#8B6330" opacity="0.65"/>
      {/* Score lines */}
      <line x1={w*0.38} y1={h*0.44} x2={w*0.36} y2={h*0.58} stroke="rgba(0,0,0,0.2)" strokeWidth="1.2"/>
      <line x1={w*0.50} y1={h*0.44} x2={w*0.48} y2={h*0.60} stroke="rgba(0,0,0,0.18)" strokeWidth="1.2"/>
      <line x1={w*0.62} y1={h*0.46} x2={w*0.60} y2={h*0.60} stroke="rgba(0,0,0,0.15)" strokeWidth="1.2"/>
      {/* Capers */}
      <circle cx={w*0.32} cy={h*0.65} r="3" fill="#4a7c4e" opacity="0.9"/>
      <circle cx={w*0.44} cy={h*0.67} r="2.5" fill="#4a7c4e" opacity="0.8"/>
      <circle cx={w*0.60} cy={h*0.64} r="3" fill="#4a7c4e" opacity="0.85"/>
      {/* Butter sauce pool */}
      <ellipse cx={w*0.50} cy={h*0.68} rx={w*0.18} ry={h*0.04} fill="#f5d87a" opacity="0.45"/>
      {/* Roast tomatoes */}
      <circle cx={w*0.72} cy={h*0.62} r="7" fill="#c0392b" opacity="0.8"/>
      <circle cx={w*0.78} cy={h*0.56} r="6" fill="#e74c3c" opacity="0.7"/>
      {/* Lemon */}
      <path d={`M${w*0.70} ${h*0.36} L${w*0.80} ${h*0.44} L${w*0.72} ${h*0.48}Z`} fill="#f9e04b" opacity="0.85"/>
    </svg>
  ),
  // Lamb shoulder — rustic braise in casserole
  d2: (w,h) => (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height:"100%"}} preserveAspectRatio="xMidYMid slice">
      <rect width={w} height={h} fill="#f5e0d0"/>
      {/* Casserole shadow */}
      <ellipse cx={w*0.5} cy={h*0.85} rx={w*0.38} ry={h*0.06} fill="#7a3a1e" opacity="0.2"/>
      {/* Casserole body */}
      <path d={`M${w*0.12} ${h*0.45} Q${w*0.12} ${h*0.80} ${w*0.50} ${h*0.80} Q${w*0.88} ${h*0.80} ${w*0.88} ${h*0.45} Z`} fill="#c8764a"/>
      <ellipse cx={w*0.5} cy={h*0.45} rx={w*0.38} ry={h*0.09} fill="#d4855a"/>
      {/* Braising liquid */}
      <ellipse cx={w*0.5} cy={h*0.45} rx={w*0.33} ry={h*0.075} fill="#8B3A1A" opacity="0.85"/>
      {/* Lamb shoulder mass */}
      <path d={`M${w*0.28} ${h*0.50} Q${w*0.26} ${h*0.40} ${w*0.40} ${h*0.37} Q${w*0.58} ${h*0.34} ${w*0.68} ${h*0.40} Q${w*0.74} ${h*0.48} ${w*0.66} ${h*0.54} Q${w*0.50} ${h*0.58} ${w*0.34} ${h*0.56}Z`} fill="#6B2D0A" opacity="0.9"/>
      {/* Fat/caramel patches */}
      <path d={`M${w*0.38} ${h*0.40} Q${w*0.46} ${h*0.37} ${w*0.52} ${h*0.41} Q${w*0.48} ${h*0.46} ${w*0.40} ${h*0.44}Z`} fill="#c8764a" opacity="0.6"/>
      {/* Rosemary sprigs */}
      <line x1={w*0.30} y1={h*0.46} x2={w*0.26} y2={h*0.36} stroke="#2d5a1e" strokeWidth="1.5"/>
      <line x1={w*0.27} y1={h*0.42} x2={w*0.22} y2={h*0.40} stroke="#2d5a1e" strokeWidth="1"/>
      <line x1={w*0.27} y1={h*0.39} x2={w*0.23} y2={h*0.37} stroke="#2d5a1e" strokeWidth="1"/>
      {/* Tomato in sauce */}
      <circle cx={w*0.64} cy={h*0.48} r="6" fill="#c0392b" opacity="0.7"/>
      {/* Handles */}
      <ellipse cx={w*0.10} cy={h*0.50} rx={h*0.04} ry={h*0.03} fill="none" stroke="#c8764a" strokeWidth="3"/>
      <ellipse cx={w*0.90} cy={h*0.50} rx={h*0.04} ry={h*0.03} fill="none" stroke="#c8764a" strokeWidth="3"/>
    </svg>
  ),
  // Turkey meatballs — rigatoni with tomato sauce
  d3: (w,h) => (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height:"100%"}} preserveAspectRatio="xMidYMid slice">
      <rect width={w} height={h} fill="#fde8d8"/>
      <ellipse cx={w*0.5} cy={h*0.83} rx={w*0.34} ry={h*0.055} fill="#a03020" opacity="0.2"/>
      {/* Bowl */}
      <path d={`M${w*0.16} ${h*0.38} Q${w*0.16} ${h*0.77} ${w*0.50} ${h*0.77} Q${w*0.84} ${h*0.77} ${w*0.84} ${h*0.38} Z`} fill="white" stroke="#f0c8b0" strokeWidth="1.5"/>
      <ellipse cx={w*0.5} cy={h*0.38} rx={w*0.34} ry={h*0.075} fill="white" stroke="#f0c8b0" strokeWidth="1.5"/>
      {/* Pasta rigatoni tubes */}
      {[[0.28,0.44],[0.40,0.42],[0.52,0.43],[0.36,0.54],[0.48,0.56],[0.60,0.52],[0.44,0.64],[0.56,0.62]].map(([cx,cy],i)=>(
        <g key={i}>
          <ellipse cx={w*cx} cy={h*cy} rx="9" ry="6" fill="#f5c890" stroke="#d4a060" strokeWidth="0.8"/>
          <ellipse cx={w*cx} cy={h*cy} rx="5" ry="3.5" fill="rgba(0,0,0,0.08)"/>
        </g>
      ))}
      {/* Meatballs */}
      <circle cx={w*0.34} cy={h*0.36} r="12" fill="#8B4513" opacity="0.9"/>
      <circle cx={w*0.54} cy={h*0.34} r="13" fill="#7a3a10" opacity="0.85"/>
      <circle cx={w*0.68} cy={h*0.40} r="11" fill="#8B4513" opacity="0.88"/>
      {/* Tomato sauce */}
      <path d={`M${w*0.25} ${h*0.50} Q${w*0.45} ${h*0.46} ${w*0.70} ${h*0.52}`} stroke="#c0392b" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.4"/>
      {/* Parmesan */}
      <ellipse cx={w*0.46} cy={h*0.33} rx="8" ry="3" fill="rgba(255,248,220,0.9)" transform={`rotate(-10,${w*0.46},${h*0.33})`}/>
    </svg>
  ),
  // Chicken souvlaki — wrapped pitta on board
  d4: (w,h) => (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height:"100%"}} preserveAspectRatio="xMidYMid slice">
      <rect width={w} height={h} fill="#fdf0d0"/>
      {/* Wooden board */}
      <rect x={w*0.10} y={h*0.42} width={w*0.80} height={h*0.38} rx="8" fill="#c8a060" opacity="0.35"/>
      {/* Pitta wraps */}
      <path d={`M${w*0.22} ${h*0.38} Q${w*0.22} ${h*0.70} ${w*0.42} ${h*0.70} Q${w*0.52} ${h*0.70} ${w*0.52} ${h*0.58} L${w*0.52} ${h*0.38} Q${w*0.52} ${h*0.30} ${w*0.37} ${h*0.30} Q${w*0.22} ${h*0.30} ${w*0.22} ${h*0.38}Z`} fill="#f5dfa0" stroke="#c8a050" strokeWidth="1"/>
      <path d={`M${w*0.48} ${h*0.35} Q${w*0.48} ${h*0.67} ${w*0.68} ${h*0.67} Q${w*0.78} ${h*0.67} ${w*0.78} ${h*0.55} L${w*0.78} ${h*0.35} Q${w*0.78} ${h*0.27} ${w*0.63} ${h*0.27} Q${w*0.48} ${h*0.27} ${w*0.48} ${h*0.35}Z`} fill="#ecd080" stroke="#c8a050" strokeWidth="1"/>
      {/* Charred chicken visible at top */}
      <path d={`M${w*0.26} ${h*0.36} Q${w*0.34} ${h*0.32} ${w*0.44} ${h*0.36}`} stroke="#5a3010" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.8"/>
      <path d={`M${w*0.52} ${h*0.33} Q${w*0.62} ${h*0.29} ${w*0.70} ${h*0.33}`} stroke="#5a3010" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.8"/>
      {/* Tzatziki drip */}
      <path d={`M${w*0.36} ${h*0.34} Q${w*0.36} ${h*0.40} ${w*0.34} ${h*0.46}`} stroke="rgba(255,255,255,0.8)" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* Herbs scattered */}
      <circle cx={w*0.30} cy={h*0.72} r="3" fill="#27ae60" opacity="0.7"/>
      <circle cx={w*0.45} cy={h*0.74} r="2.5" fill="#2ecc71" opacity="0.6"/>
      <circle cx={w*0.68} cy={h*0.72} r="3" fill="#27ae60" opacity="0.65"/>
      {/* Lemon half */}
      <path d={`M${w*0.80} ${h*0.60} Q${w*0.88} ${h*0.56} ${w*0.88} ${h*0.68} Q${w*0.88} ${h*0.75} ${w*0.80} ${h*0.75}Z`} fill="#f9e04b" opacity="0.85"/>
      <line x1={w*0.80} y1={h*0.60} x2={w*0.80} y2={h*0.75} stroke="#c8b000" strokeWidth="1"/>
    </svg>
  ),
  // Parsnip tagine — earthy bowl with couscous
  d5: (w,h) => (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height:"100%"}} preserveAspectRatio="xMidYMid slice">
      <rect width={w} height={h} fill="#f5e8c0"/>
      <ellipse cx={w*0.5} cy={h*0.83} rx={w*0.36} ry={h*0.055} fill="#8B6010" opacity="0.2"/>
      {/* Tagine base */}
      <path d={`M${w*0.14} ${h*0.50} Q${w*0.14} ${h*0.80} ${w*0.50} ${h*0.80} Q${w*0.86} ${h*0.80} ${w*0.86} ${h*0.50} Z`} fill="#c8904a"/>
      <ellipse cx={w*0.5} cy={h*0.50} rx={w*0.36} ry={h*0.08} fill="#d4a060"/>
      {/* Tagine lid */}
      <path d={`M${w*0.18} ${h*0.50} Q${w*0.22} ${h*0.30} ${w*0.50} ${h*0.20} Q${w*0.78} ${h*0.30} ${w*0.82} ${h*0.50} Z`} fill="#b87030"/>
      <circle cx={w*0.50} cy={h*0.20} r={h*0.04} fill="#8B5010"/>
      {/* Sauce visible around lid edge */}
      <ellipse cx={w*0.5} cy={h*0.50} rx={w*0.33} ry={h*0.065} fill="#c04010" opacity="0.7"/>
      {/* Couscous visible at side */}
      <ellipse cx={w*0.76} cy={h*0.62} rx={w*0.10} ry={h*0.10} fill="#f0d888" opacity="0.9"/>
      {/* Parsnip chunk visible */}
      <path d={`M${w*0.66} ${h*0.55} Q${w*0.64} ${h*0.50} ${w*0.70} ${h*0.48} Q${w*0.76} ${h*0.50} ${w*0.74} ${h*0.56}Z`} fill="#f5e0a0" opacity="0.8"/>
      {/* Chickpeas */}
      <circle cx={w*0.24} cy={h*0.60} r="5" fill="#d4a050" opacity="0.7"/>
      <circle cx={w*0.30} cy={h*0.65} r="5.5" fill="#c89040" opacity="0.75"/>
      {/* Preserved lemon */}
      <path d={`M${w*0.20} ${h*0.52} Q${w*0.24} ${h*0.48} ${w*0.28} ${h*0.52} Q${w*0.26} ${h*0.58} ${w*0.20} ${h*0.56}Z`} fill="#f9e04b" opacity="0.75"/>
    </svg>
  ),
  // Miso salmon — glazed fillet on rice with kale
  d6: (w,h) => (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height:"100%"}} preserveAspectRatio="xMidYMid slice">
      <rect width={w} height={h} fill="#d4e8e0"/>
      <ellipse cx={w*0.5} cy={h*0.83} rx={w*0.34} ry={h*0.055} fill="#2d5a4a" opacity="0.2"/>
      {/* Rice bowl */}
      <path d={`M${w*0.16} ${h*0.42} Q${w*0.16} ${h*0.78} ${w*0.50} ${h*0.78} Q${w*0.84} ${h*0.78} ${w*0.84} ${h*0.42} Z`} fill="white" stroke="#b0d0c0" strokeWidth="1.5"/>
      <ellipse cx={w*0.5} cy={h*0.42} rx={w*0.34} ry={h*0.075} fill="white" stroke="#b0d0c0" strokeWidth="1.5"/>
      {/* Rice surface */}
      <ellipse cx={w*0.5} cy={h*0.42} rx={w*0.31} ry={h*0.065} fill="#f8f4ec"/>
      {/* Rice grain texture */}
      {[[0.36,0.40],[0.44,0.39],[0.52,0.41],[0.60,0.40],[0.40,0.44],[0.56,0.43]].map(([cx,cy],i)=>(
        <ellipse key={i} cx={w*cx} cy={h*cy} rx="4" ry="2" fill="rgba(220,210,190,0.7)" transform={`rotate(${i*30},${w*cx},${h*cy})`}/>
      ))}
      {/* Kale pile */}
      <path d={`M${w*0.22} ${h*0.50} Q${w*0.18} ${h*0.42} ${w*0.28} ${h*0.38} Q${w*0.36} ${h*0.34} ${w*0.40} ${h*0.42} Q${w*0.38} ${h*0.52} ${w*0.28} ${h*0.54}Z`} fill="#1a5c2e" opacity="0.85"/>
      <path d={`M${w*0.26} ${h*0.48} Q${w*0.22} ${h*0.40} ${w*0.32} ${h*0.36} Q${w*0.40} ${h*0.34} ${w*0.38} ${h*0.44}Z`} fill="#236b38" opacity="0.8"/>
      {/* Salmon fillet — miso caramelised */}
      <path d={`M${w*0.42} ${h*0.46} Q${w*0.44} ${h*0.36} ${w*0.64} ${h*0.38} Q${w*0.76} ${h*0.40} ${w*0.74} ${h*0.52} Q${w*0.64} ${h*0.58} ${w*0.46} ${h*0.56}Z`} fill="#e87840"/>
      {/* Miso caramel top */}
      <path d={`M${w*0.44} ${h*0.38} Q${w*0.54} ${h*0.35} ${w*0.66} ${h*0.38} Q${w*0.72} ${h*0.40} ${w*0.66} ${h*0.43} Q${w*0.54} ${h*0.40} ${w*0.44} ${h*0.43}Z`} fill="#8B4010" opacity="0.65"/>
      {/* Sesame seeds */}
      <circle cx={w*0.54} cy={h*0.47} r="2" fill="#f5e0a0" opacity="0.9"/>
      <circle cx={w*0.60} cy={h*0.44} r="1.8" fill="#f5e0a0" opacity="0.85"/>
      <circle cx={w*0.58} cy={h*0.50} r="2" fill="rgba(0,0,0,0.7)" opacity="0.7"/>
      {/* Sesame oil drizzle */}
      <path d={`M${w*0.46} ${h*0.56} Q${w*0.54} ${h*0.60} ${w*0.64} ${h*0.56}`} stroke="#d4a000" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5"/>
    </svg>
  ),
  // Sausage bean kale stew — rustic pan
  d7: (w,h) => (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height:"100%"}} preserveAspectRatio="xMidYMid slice">
      <rect width={w} height={h} fill="#e8f0d8"/>
      <ellipse cx={w*0.5} cy={h*0.84} rx={w*0.38} ry={h*0.055} fill="#3a5a1e" opacity="0.18"/>
      {/* Pan */}
      <path d={`M${w*0.10} ${h*0.42} Q${w*0.10} ${h*0.78} ${w*0.50} ${h*0.78} Q${w*0.90} ${h*0.78} ${w*0.90} ${h*0.42} Z`} fill="#3a3a3a"/>
      <ellipse cx={w*0.5} cy={h*0.42} rx={w*0.40} ry={h*0.09} fill="#4a4a4a"/>
      {/* Tomato stew */}
      <ellipse cx={w*0.5} cy={h*0.42} rx={w*0.36} ry={h*0.075} fill="#c0392b" opacity="0.8"/>
      {/* Sausages */}
      <path d={`M${w*0.24} ${h*0.46} Q${w*0.28} ${h*0.38} ${w*0.44} ${h*0.40} Q${w*0.48} ${h*0.44} ${w*0.44} ${h*0.50} Q${w*0.30} ${h*0.52} ${w*0.24} ${h*0.46}Z`} fill="#8B4513" opacity="0.92"/>
      <path d={`M${w*0.44} ${h*0.44} Q${w*0.50} ${h*0.36} ${w*0.64} ${h*0.38} Q${w*0.70} ${h*0.42} ${w*0.66} ${h*0.50} Q${w*0.52} ${h*0.52} ${w*0.44} ${h*0.50}Z`} fill="#7a3a10" opacity="0.9"/>
      {/* Crispy sage leaves */}
      <ellipse cx={w*0.30} cy={h*0.36} rx="10" ry="4" fill="#5a8a3a" opacity="0.8" transform={`rotate(-20,${w*0.30},${h*0.36})`}/>
      <ellipse cx={w*0.56} cy={h*0.34} rx="9" ry="4" fill="#4a7a2a" opacity="0.75" transform={`rotate(15,${w*0.56},${h*0.34})`}/>
      {/* Cannellini beans */}
      {[[0.36,0.56],[0.46,0.60],[0.58,0.56],[0.68,0.60]].map(([cx,cy],i)=>(
        <ellipse key={i} cx={w*cx} cy={h*cy} rx="7" ry="5" fill="#f5f0e0" stroke="#d4c8a0" strokeWidth="0.5" opacity="0.9"/>
      ))}
      {/* Kale wilted in */}
      <path d={`M${w*0.62} ${h*0.46} Q${w*0.68} ${h*0.40} ${w*0.76} ${h*0.42} Q${w*0.80} ${h*0.48} ${w*0.74} ${h*0.54}Z`} fill="#1a5c2e" opacity="0.8"/>
      {/* Pan handle */}
      <rect x={w*0.88} y={h*0.50} width={w*0.10} height={h*0.04} rx="3" fill="#3a3a3a"/>
    </svg>
  ),
  // Roast chicken with fennel — golden bird in tin
  d8: (w,h) => (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height:"100%"}} preserveAspectRatio="xMidYMid slice">
      <rect width={w} height={h} fill="#fdf0d0"/>
      {/* Roasting tin */}
      <rect x={w*0.08} y={h*0.46} width={w*0.84} height={h*0.36} rx="6" fill="#8B7040" opacity="0.8"/>
      <rect x={w*0.08} y={h*0.46} width={w*0.84} height={h*0.08} rx="6 6 0 0" fill="#a08050" opacity="0.7"/>
      {/* Juices in tin */}
      <ellipse cx={w*0.5} cy={h*0.64} rx={w*0.36} ry={h*0.12} fill="#c8840a" opacity="0.55"/>
      {/* Fennel quarters */}
      <path d={`M${w*0.14} ${h*0.54} Q${w*0.14} ${h*0.66} ${w*0.26} ${h*0.66} Q${w*0.28} ${h*0.58} ${w*0.22} ${h*0.52}Z`} fill="#c8d890" opacity="0.85"/>
      <path d={`M${w*0.74} ${h*0.54} Q${w*0.72} ${h*0.66} ${w*0.86} ${h*0.66} Q${w*0.86} ${h*0.58} ${w*0.80} ${h*0.52}Z`} fill="#b8c880" opacity="0.8"/>
      {/* Chicken body */}
      <path d={`M${w*0.28} ${h*0.52} Q${w*0.26} ${h*0.38} ${w*0.50} ${h*0.32} Q${w*0.74} ${h*0.38} ${w*0.72} ${h*0.52} Q${w*0.70} ${h*0.62} ${w*0.50} ${h*0.64} Q${w*0.30} ${h*0.62} ${w*0.28} ${h*0.52}Z`} fill="#c87820"/>
      {/* Golden skin highlights */}
      <path d={`M${w*0.34} ${h*0.44} Q${w*0.46} ${h*0.38} ${w*0.58} ${h*0.42} Q${w*0.54} ${h*0.50} ${w*0.40} ${h*0.50}Z`} fill="#e8a040" opacity="0.6"/>
      {/* Crispy drumstick ends */}
      <circle cx={w*0.32} cy={h*0.60} r="9" fill="#a05810" opacity="0.85"/>
      <circle cx={w*0.68} cy={h*0.60} r="9" fill="#a05810" opacity="0.85"/>
      {/* Garlic cloves */}
      <ellipse cx={w*0.46} cy={h*0.66} rx="6" ry="5" fill="#f5f0e0" opacity="0.8"/>
      <ellipse cx={w*0.56} cy={h*0.67} rx="5.5" ry="4.5" fill="#f0ead8" opacity="0.75"/>
      {/* Thyme sprigs */}
      <line x1={w*0.50} y1={h*0.38} x2={w*0.48} y2={h*0.28} stroke="#4a7a2a" strokeWidth="1.5"/>
      <line x1={w*0.48} y1={h*0.35} x2={w*0.44} y2={h*0.33} stroke="#4a7a2a" strokeWidth="1"/>
      <line x1={w*0.48} y1={h*0.31} x2={w*0.52} y2={h*0.29} stroke="#4a7a2a" strokeWidth="1"/>
    </svg>
  ),
};

function RecipeVisual({recipe,height=140}){
  if(!recipe) return null;
  const scene=RECIPE_SCENES[recipe.id];
  return(
    <div style={{height,position:"relative",overflow:"hidden",flexShrink:0,background:recipe.color}}>
      {scene
        ? <div style={{position:"absolute",inset:0}}>{scene(280,height)}</div>
        : <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:height>120?52:38,filter:"drop-shadow(0 4px 12px rgba(0,0,0,0.2))",userSelect:"none"}}>{recipe.emoji}</div>
      }
      {/* Gradient overlay for text legibility */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:height*0.52,background:"linear-gradient(transparent,rgba(0,0,0,0.42))"}}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"10px 14px 11px"}}>
        <div style={{fontFamily:F.serif,fontSize:15,color:"rgba(255,255,255,0.94)",fontWeight:400,lineHeight:1.2,letterSpacing:"0.01em"}}>{recipe.name}</div>
        <div style={{fontFamily:F.sans,fontSize:10,color:"rgba(255,255,255,0.52)",marginTop:2,textTransform:"uppercase",letterSpacing:"0.06em"}}>{recipe.time}m · {recipe.cuisine}</div>
      </div>
    </div>
  );
}

function MealCard({recipe,compact=false,why,onSwap,onCook}){
  if(!recipe) return(<div style={{background:C.card,borderRadius:16,border:`1.5px dashed ${C.border}`,padding:"20px",textAlign:"center",color:C.muted,fontFamily:F.sans,fontSize:13}}>No meal planned</div>);
  const isSeasonal=recipe.seasonal?.some(s=>SEASON.items.includes(s));
  return(
    <div style={{background:C.card,borderRadius:16,overflow:"hidden",border:`1px solid ${C.border}`}}>
      {!compact&&<RecipeVisual recipe={recipe} height={150}/>}
      {compact&&(
        <div style={{background:recipe.color,padding:"11px 13px",display:"flex",alignItems:"center",gap:11,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",right:-20,top:-20,width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,0.12)"}}/>
          <div style={{fontSize:32,lineHeight:1,userSelect:"none",filter:"drop-shadow(0 2px 6px rgba(0,0,0,0.15))",flexShrink:0}}>{recipe.emoji}</div>
          <div style={{flex:1,position:"relative"}}>
            <div style={{fontFamily:F.serif,fontSize:15,color:"rgba(0,0,0,0.7)",fontWeight:400,lineHeight:1.2}}>{recipe.name}</div>
            <div style={{fontFamily:F.sans,fontSize:10,color:"rgba(0,0,0,0.38)",marginTop:2,textTransform:"uppercase",letterSpacing:"0.05em"}}>{recipe.time}m</div>
          </div>
        </div>
      )}
      <div style={{padding:"11px 13px 13px"}}>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:7}}>
          {isSeasonal&&<Tag bg={C.sagePale} fg={C.forest} icon="leaf">In season</Tag>}
          {recipe.batch&&<Tag bg={C.forestLight} fg={C.forestMid} icon="batch">Batch</Tag>}
          {recipe.time<=20&&<Tag bg={C.goldLight} fg={C.gold} icon="clock">Quick</Tag>}
          {recipe.tags?.includes("high-prot")&&<Tag bg="#e8f0f8" fg="#1a4a6a" icon="zap">High protein</Tag>}
        </div>
        <div style={{display:"flex",gap:12,marginBottom:why?9:0}}>
          {[{i:"flame",v:`${recipe.cal}kcal`,c:C.clay},{i:"muscle",v:`${recipe.prot}g`,c:C.forestMid},{i:"clock",v:`${recipe.time}m`,c:C.muted},{i:"pound",v:`£${recipe.cost.toFixed(2)}`,c:C.gold}].map(s=>(
            <span key={s.i} style={{display:"flex",alignItems:"center",gap:3,fontFamily:F.sans,fontSize:12,color:C.muted}}>
              <Icon name={s.i} size={12} color={s.c} sw={2}/>{s.v}
            </span>
          ))}
        </div>
        {why&&(
          <div style={{background:C.aiBg,borderRadius:10,padding:"8px 10px 8px 13px",marginBottom:9,borderLeft:`2.5px solid ${C.aiBorder}`}}>
            <span style={{fontFamily:F.serif,fontStyle:"italic",fontWeight:300,fontSize:12,color:C.aiText,lineHeight:1.6,opacity:0.9}}>{why}</span>
          </div>
        )}
        {recipe.batch&&recipe.batchNote&&!compact&&(
          <div style={{display:"flex",alignItems:"flex-start",gap:7,background:C.goldLight,borderRadius:10,padding:"8px 10px",marginBottom:9}}>
            <Icon name="batch" size={13} color={C.gold} sw={2}/>
            <span style={{fontFamily:F.sans,fontSize:12,color:C.gold,lineHeight:1.5}}>{recipe.batchNote}</span>
          </div>
        )}
        {(onSwap||onCook)&&(
          <div style={{display:"flex",gap:8,marginTop:6}}>
            {onSwap&&(<button onClick={onSwap} style={{flex:1,padding:"9px",borderRadius:10,border:`1.5px solid ${C.border}`,background:"transparent",color:C.muted,fontFamily:F.sans,fontSize:12,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}><Icon name="swap" size={12} color={C.muted} sw={2}/>Swap</button>)}
            {onCook&&(<button onClick={onCook} style={{flex:2,padding:"9px",borderRadius:10,border:"none",background:C.forest,color:C.cream,fontFamily:F.sans,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><Icon name="chef" size={13} color={C.cream} sw={2}/>Start cooking</button>)}
          </div>
        )}
      </div>
    </div>
  );
}

const GOAL_CHIPS=[
  {id:"wellbeing",label:"Eating well and not overthinking it"},
  {id:"loseweight",label:"Losing some weight without living on salad"},
  {id:"muscle",label:"Serious about protein and building"},
  {id:"family",label:"Getting the family fed and everyone happy"},
  {id:"budget",label:"Spending less and wasting less"},
];
const AVOID_MEDICAL=["Gluten","Dairy","Nuts","Eggs","Fish","Soya","Sesame","Peanuts"];
const AVOID_DIETARY=["Vegetarian","Vegan","Halal only","No pork","No alcohol in cooking"];
const AVOID_DISLIKES=["Coriander","Anchovies","Mushrooms","Olives","Blue cheese","Offal"];

function parseOnboarding(household,goalsRules){
  const ht=household.toLowerCase();
  let profile={goal:"wellbeing",servings:2,household:"varies",kidsHome:[],avoidMedical:[],avoidDietary:[],avoidDislikes:[],kidName:null};
  if(ht.includes("just me")||ht.includes("only me")||ht.includes("solo")||ht.includes("myself")){profile.household="solo";profile.servings=1;}
  else if(ht.includes("partner")||ht.includes("husband")||ht.includes("wife")||ht.includes("two of us")){profile.household="couple";profile.servings=2;}
  else if(ht.includes("famil")||ht.includes("kids")||ht.includes("children")||ht.includes("child")){profile.household="family";profile.servings=4;}
  const gt=goalsRules.toLowerCase();
  if(gt.includes("protein")||gt.includes("muscle")||gt.includes("build")||gt.includes("gym")) profile.goal="muscle";
  else if(gt.includes("lose")||gt.includes("weight")||gt.includes("lighter")||gt.includes("lean")) profile.goal="loseweight";
  else if(gt.includes("budget")||gt.includes("cheaper")||gt.includes("spend less")||gt.includes("waste")) profile.goal="budget";
  else if(gt.includes("famil")||gt.includes("kids")||gt.includes("children")) profile.goal="family";
  AVOID_MEDICAL.forEach(a=>{if(gt.includes(a.toLowerCase()))profile.avoidMedical.push(a);});
  AVOID_DIETARY.forEach(a=>{if(gt.includes(a.toLowerCase().split(" ")[0]))profile.avoidDietary.push(a);});
  AVOID_DISLIKES.forEach(a=>{if(gt.includes(a.toLowerCase()))profile.avoidDislikes.push(a);});
  const nameMatch=household.match(/\b([A-Z][a-z]{2,})\b/);
  if(nameMatch&&!["Mon","Tue","Wed","Thu","Fri","Sat","Sun","Just","Only","Some"].includes(nameMatch[1])) profile.kidName=nameMatch[1];
  return profile;
}

function Toggle({on,onToggle,label,desc}){
  return(
    <div onClick={onToggle} style={{display:"flex",alignItems:"flex-start",gap:14,padding:"14px 0",cursor:"pointer",borderBottom:`1px solid rgba(255,255,255,0.06)`}}>
      <div style={{flex:1}}>
        <div style={{fontFamily:F.sans,fontSize:15,color:"rgba(250,248,244,0.85)",fontWeight:500,marginBottom:3}}>{label}</div>
        <div style={{fontFamily:F.sans,fontSize:12,color:"rgba(250,248,244,0.35)",lineHeight:1.55}}>{desc}</div>
      </div>
      <div style={{width:44,height:26,borderRadius:13,background:on?"#7a9e80":"rgba(255,255,255,0.1)",position:"relative",flexShrink:0,marginTop:2,transition:"background 0.2s"}}>
        <div style={{position:"absolute",top:3,left:on?20:3,width:20,height:20,borderRadius:"50%",background:"white",transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}/>
      </div>
    </div>
  );
}

function Onboarding({onComplete}){
  const[step,setStep]=useState(0);
  const[householdText,setHouseholdText]=useState("");
  const[goalText,setGoalText]=useState("");
  const[goalChips,setGoalChips]=useState([]);
  const[avoidChips,setAvoidChips]=useState([]);
  const[dislikeChips,setDislikeChips]=useState([]);
  const[kidsHome,setKidsHome]=useState([]);
  const[showDays,setShowDays]=useState(false);
  const[calOn,setCalOn]=useState(false);
  const[notifOn,setNotifOn]=useState(false);
  const inputRef=useRef(null);
  const dk={height:"100vh",background:"#181410",display:"flex",flexDirection:"column",overflow:"hidden"};
  const hd={padding:"52px 24px 0",flexShrink:0};
  const bd={flex:1,overflowY:"auto",padding:"0 24px 24px"};
  const ft={padding:"12px 24px 44px",flexShrink:0};

  const aiStyle={fontFamily:F.serif,fontStyle:"italic",fontWeight:300,fontSize:17,color:"rgba(250,248,244,0.85)",lineHeight:1.8,letterSpacing:"0.01em"};

  function ChipRow({items,selected,onToggle,label}){
    return(
      <div style={{marginBottom:18}}>
        {label&&<div style={{fontFamily:F.sans,fontSize:10,color:"rgba(250,248,244,0.3)",textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:600,marginBottom:8}}>{label}</div>}
        <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
          {items.map(item=>{
            const sel=selected.includes(item);
            return(<button key={item} onClick={()=>onToggle(item)} style={{padding:"8px 13px",borderRadius:100,border:`1.5px solid ${sel?"rgba(122,158,128,0.7)":"rgba(255,255,255,0.09)"}`,background:sel?"rgba(122,158,128,0.18)":"rgba(255,255,255,0.04)",color:sel?"rgba(250,248,244,0.9)":"rgba(250,248,244,0.45)",fontFamily:F.sans,fontSize:12,fontWeight:500,cursor:"pointer"}}>{item}{sel?" ✓":""}</button>);
          })}
        </div>
      </div>
    );
  }

  function toggleChip(arr,setArr,item){setArr(prev=>prev.includes(item)?prev.filter(x=>x!==item):[...prev,item]);}

  const detectVaried=(text)=>{
    const t=text.toLowerCase();
    return t.includes("varies")||t.includes("alternate")||t.includes("every other")||t.includes("some days")||t.includes("changes")||t.includes("custody")||t.includes("part time")||t.includes("some weeks");
  };

  function handleHouseholdNext(){
    if(detectVaried(householdText)) setShowDays(true);
    setStep(1);
  }

  function handleComplete(){
    const combined=goalText+" "+goalChips.join(" ")+" "+avoidChips.join(" ")+" "+dislikeChips.join(" ");
    const parsed=parseOnboarding(householdText,combined);
    parsed.kidsHome=kidsHome;
    parsed.calendarOn=calOn;
    parsed.notificationsOn=notifOn;
    onComplete(parsed);
  }

  if(step===0) return(
    <div style={dk}><style>{FONTS}</style>
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 28px 60px"}}>
        <div style={{width:56,height:56,borderRadius:18,background:C.forest,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:36}}>
          <Icon name="leaf" size={26} color={C.cream} sw={1.5}/>
        </div>
        <div style={aiStyle}>
          Hi. I am Plait.
          <br/><br/>
          I will plan your meals around your actual week. Who is home, what is in season, how much time you have got. The more you tell me, the better I get at it.
          <br/><br/>
          This will take about two minutes. You can type, talk, or just tap.
        </div>
      </div>
      <div style={ft}>
        <button onClick={()=>setStep(0.5)} style={{width:"100%",padding:"16px",borderRadius:14,border:"none",background:C.clay,color:C.cream,fontFamily:F.sans,fontSize:16,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          Let us go<Icon name="arrow" size={18} color={C.cream} sw={2}/>
        </button>
      </div>
    </div>
  );

  if(step===0.5) return(
    <div style={dk}><style>{FONTS}</style>
      <div style={hd}>
        <div style={{fontFamily:F.sans,fontSize:10,color:"rgba(250,248,244,0.2)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:20}}>1 of 3</div>
        <div style={aiStyle}>Tell me about your week. Who are you usually cooking for, and does it change much day to day?</div>
      </div>
      <div style={{...bd,paddingTop:24}}>
        <div style={{position:"relative",marginBottom:20}}>
          <textarea
            ref={inputRef}
            value={householdText}
            onChange={e=>setHouseholdText(e.target.value)}
            placeholder="e.g. just me most nights, but my kids are home every other weekend and some Thursdays..."
            style={{width:"100%",minHeight:110,background:"rgba(255,255,255,0.05)",border:"1.5px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"14px 44px 14px 16px",color:"rgba(250,248,244,0.85)",fontFamily:F.sans,fontSize:14,lineHeight:1.6,resize:"none",outline:"none",boxSizing:"border-box",caretColor:C.clay}}
          />
          <button style={{position:"absolute",right:12,bottom:12,background:"none",border:"none",cursor:"pointer",opacity:0.4}}>
            <Icon name="mic" size={18} color="rgba(250,248,244,0.8)" sw={1.5}/>
          </button>
        </div>
        <div style={{fontFamily:F.sans,fontSize:11,color:"rgba(250,248,244,0.25)",marginBottom:12}}>Or just tap what fits</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:20}}>
          {["Just me","Me and a partner","Family with kids","It varies a lot"].map(opt=>{
            const sel=householdText===opt;
            return(<button key={opt} onClick={()=>setHouseholdText(opt)} style={{padding:"9px 15px",borderRadius:100,border:`1.5px solid ${sel?"rgba(122,158,128,0.7)":"rgba(255,255,255,0.09)"}`,background:sel?"rgba(122,158,128,0.18)":"rgba(255,255,255,0.04)",color:sel?"rgba(250,248,244,0.9)":"rgba(250,248,244,0.45)",fontFamily:F.sans,fontSize:13,fontWeight:500,cursor:"pointer"}}>{opt}</button>);
          })}
        </div>
        {(detectVaried(householdText)||showDays)&&(
          <div style={{background:"rgba(255,255,255,0.04)",borderRadius:14,padding:"16px",marginBottom:16}}>
            <div style={{fontFamily:F.serif,fontStyle:"italic",fontWeight:300,fontSize:14,color:"rgba(250,248,244,0.6)",lineHeight:1.65,marginBottom:14}}>
              That is fine. Which days do you usually have people home?
            </div>
            <div style={{fontFamily:F.sans,fontSize:11,color:"rgba(250,248,244,0.25)",marginBottom:10}}>Tap the days. You can always change this later.</div>
            <div style={{display:"flex",gap:6}}>
              {DAYS_SHORT.map(d=>{
                const sel=kidsHome.includes(d);
                return(<button key={d} onClick={()=>setKidsHome(prev=>sel?prev.filter(x=>x!==d):[...prev,d])} style={{flex:1,padding:"10px 4px",borderRadius:10,border:`1.5px solid ${sel?"rgba(122,158,128,0.7)":"rgba(255,255,255,0.09)"}`,background:sel?"rgba(122,158,128,0.22)":"rgba(255,255,255,0.04)",color:sel?"rgba(250,248,244,0.9)":"rgba(250,248,244,0.3)",fontFamily:F.sans,fontSize:12,fontWeight:sel?600:400,cursor:"pointer"}}>{d}</button>);
              })}
            </div>
          </div>
        )}
      </div>
      <div style={ft}>
        <button onClick={handleHouseholdNext} disabled={!householdText.trim()} style={{width:"100%",padding:"15px",borderRadius:14,border:"none",background:householdText.trim()?C.clay:"rgba(255,255,255,0.08)",color:householdText.trim()?C.cream:"rgba(250,248,244,0.3)",fontFamily:F.sans,fontSize:15,fontWeight:600,cursor:householdText.trim()?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          That is my week<Icon name="arrow" size={16} color={householdText.trim()?C.cream:"rgba(250,248,244,0.3)"} sw={2}/>
        </button>
      </div>
    </div>
  );

  if(step===1) return(
    <div style={dk}><style>{FONTS}</style>
      <div style={hd}>
        <div style={{fontFamily:F.sans,fontSize:10,color:"rgba(250,248,244,0.2)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:20}}>2 of 3</div>
        <div style={aiStyle}>What matters most to you about how you eat? And is there anything I absolutely need to know, allergies, things you do not eat, things you would rather avoid?</div>
      </div>
      <div style={{...bd,paddingTop:24}}>
        <div style={{position:"relative",marginBottom:20}}>
          <textarea
            value={goalText}
            onChange={e=>setGoalText(e.target.value)}
            placeholder="e.g. trying to lose a bit of weight, my daughter is dairy-free, I hate coriander..."
            style={{width:"100%",minHeight:90,background:"rgba(255,255,255,0.05)",border:"1.5px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"14px 44px 14px 16px",color:"rgba(250,248,244,0.85)",fontFamily:F.sans,fontSize:14,lineHeight:1.6,resize:"none",outline:"none",boxSizing:"border-box",caretColor:C.clay}}
          />
          <button style={{position:"absolute",right:12,bottom:12,background:"none",border:"none",cursor:"pointer",opacity:0.4}}>
            <Icon name="mic" size={18} color="rgba(250,248,244,0.8)" sw={1.5}/>
          </button>
        </div>
        <div style={{fontFamily:F.sans,fontSize:11,color:"rgba(250,248,244,0.25)",marginBottom:12}}>Or tap anything that applies</div>
        <ChipRow items={GOAL_CHIPS.map(g=>g.label)} selected={goalChips} onToggle={item=>toggleChip(goalChips,setGoalChips,item)} label="What a good week looks like"/>
        <ChipRow items={AVOID_MEDICAL} selected={avoidChips} onToggle={item=>toggleChip(avoidChips,setAvoidChips,item)} label="Avoid entirely"/>
        <ChipRow items={AVOID_DIETARY} selected={avoidChips} onToggle={item=>toggleChip(avoidChips,setAvoidChips,item)}/>
        <ChipRow items={AVOID_DISLIKES} selected={dislikeChips} onToggle={item=>toggleChip(dislikeChips,setDislikeChips,item)} label="Not a fan of"/>
      </div>
      <div style={ft}>
        <button onClick={()=>setStep(2)} style={{width:"100%",padding:"15px",borderRadius:14,border:"none",background:C.clay,color:C.cream,fontFamily:F.sans,fontSize:15,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          Got it<Icon name="arrow" size={16} color={C.cream} sw={2}/>
        </button>
      </div>
    </div>
  );

  if(step===2) return(
    <div style={dk}><style>{FONTS}</style>
      <div style={hd}>
        <div style={{fontFamily:F.sans,fontSize:10,color:"rgba(250,248,244,0.2)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:20}}>3 of 3</div>
        <div style={aiStyle}>Nearly there. Two things that make me noticeably more useful. Completely your call on both.</div>
      </div>
      <div style={{...bd,paddingTop:28}}>
        <Toggle on={calOn} onToggle={()=>setCalOn(v=>!v)} label="My calendar" desc="I will know when your week is hectic and plan around it. A busy Wednesday, a free Sunday afternoon."/>
        <Toggle on={notifOn} onToggle={()=>setNotifOn(v=>!v)} label="Reminders" desc="I can nudge you to defrost something, suggest a batch cook on Sunday, or check in when it is useful. Nothing noisy."/>
        <div style={{fontFamily:F.sans,fontSize:11,color:"rgba(250,248,244,0.2)",marginTop:16}}>You can change either of these any time.</div>
      </div>
      <div style={ft}>
        <button onClick={handleComplete} style={{width:"100%",padding:"16px",borderRadius:14,border:"none",background:C.clay,color:C.cream,fontFamily:F.sans,fontSize:16,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          Build my plan<Icon name="arrow" size={18} color={C.cream} sw={2}/>
        </button>
      </div>
    </div>
  );

  return null;
}
function DayScreen({week,profile,wx,onSwap,onCook,weekNum}){
  const[dayIdx,setDayIdx]=useState(TODAY_IDX);
  const dayKey=DAYS_SHORT[dayIdx],dayPlan=week[dayKey],totals=dayTotals(dayPlan);
  const isToday=dayIdx===TODAY_IDX,isWeekend=dayIdx>=5;
  const tod=NOW_HOUR<12?"Morning":NOW_HOUR<17?"Afternoon":"Evening";
  const kidsHome=profile.kidsHome||[];
  const kidName=profile.kidName||null;
  const hasKids=kidsHome.includes(dayKey);
  const householdLine=profile.household==="solo"?"Just you":profile.household==="family"?"Family home":hasKids?"People home tonight":"Just you tonight";
  const brief=getDayBrief(profile,dayKey,week,weekNum||1);
  const slots=[{slot:"breakfast",label:"Breakfast",icon:"sunrise"},{slot:"lunch",label:"Lunch",icon:"sun"},{slot:"dinner",label:"Dinner",icon:"moon"}];
  return(
    <div style={{flex:1,overflowY:"auto",paddingBottom:88}}>
      <div style={{background:C.forest,padding:"0 16px 0",paddingTop:"max(44px, calc(env(safe-area-inset-top, 0px) + 12px))",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:160,height:160,borderRadius:"50%",background:"rgba(255,255,255,0.025)",pointerEvents:"none"}}/>
        {/* Compact header row — title + macros side by side */}
        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:10,position:"relative"}}>
          <div>
            <div style={{fontFamily:F.sans,fontSize:9,color:"rgba(250,248,244,0.28)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:2}}>
              {isToday?tod:DAYS_LONG[dayIdx]}{householdLine?` · ${householdLine}`:""}
            </div>
            <div style={{fontFamily:F.serif,fontSize:28,color:C.cream,fontWeight:400,letterSpacing:"-0.01em",lineHeight:1.05}}>
              {isToday?"Today":DAYS_LONG[dayIdx]}
            </div>
          </div>
          <div style={{display:"flex",gap:12,paddingBottom:3}}>
            {[{i:"flame",v:`${totals.cal}`,u:"kcal",c:C.clay},{i:"muscle",v:`${totals.prot}`,u:"g",c:"rgba(250,248,244,0.45)"},{i:"pound",v:`£${totals.cost.toFixed(0)}`,u:"",c:C.gold}].map(s=>(
              <div key={s.i} style={{display:"flex",alignItems:"center",gap:3}}>
                <Icon name={s.i} size={11} color={s.c} sw={2}/>
                <span style={{fontFamily:F.sans,fontSize:12,color:C.cream,fontWeight:500}}>{s.v}</span>
                {s.u&&<span style={{fontFamily:F.sans,fontSize:10,color:"rgba(250,248,244,0.3)"}}>{s.u}</span>}
              </div>
            ))}
          </div>
        </div>
        {/* Day tabs — thinner */}
        <div style={{display:"flex",gap:3,overflowX:"auto",paddingBottom:10}}>
          {DAYS_SHORT.map((d,i)=>{
            const active=i===dayIdx,isT=i===TODAY_IDX,hasK=kidsHome.includes(d);
            return(
              <div key={d} onClick={()=>setDayIdx(i)} style={{flexShrink:0,minWidth:34,textAlign:"center",padding:"5px 4px 7px",borderRadius:8,background:active?"rgba(255,255,255,0.16)":"rgba(255,255,255,0.05)",border:`1px solid ${active?"rgba(255,255,255,0.22)":"transparent"}`,cursor:"pointer"}}>
                <div style={{fontFamily:F.sans,fontSize:9,color:active?C.cream:"rgba(250,248,244,0.3)",fontWeight:active?600:400,textTransform:"uppercase",letterSpacing:"0.04em"}}>{d}</div>
                <div style={{display:"flex",justifyContent:"center",gap:2,marginTop:3}}>
                  {isT&&<div style={{width:2.5,height:2.5,borderRadius:"50%",background:C.clay}}/>}
                  {hasK&&<div style={{width:2.5,height:2.5,borderRadius:"50%",background:C.sage,opacity:0.7}}/>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{padding:"12px 16px 0",display:"flex",flexDirection:"column",gap:14}}>
        <AIBrief text={brief}/>
        <div style={{margin:"0 0 2px",background:C.forestLight,borderRadius:12,padding:"9px 13px",display:"flex",gap:8,alignItems:"center"}}>
          <Icon name="leaf" size={13} color={C.forest} sw={1.5}/>
          <span style={{fontFamily:F.sans,fontSize:11,color:C.forest,fontWeight:600}}>{SEASON.name} · </span>
          <span style={{fontFamily:F.sans,fontSize:11,color:C.forestMid}}>{SEASON.items.slice(0,4).join(", ")}</span>
        </div>
        {slots.map(({slot,label,icon})=>{
          const recipe=getMeal(dayPlan?.[slot]);
          const why=getWhy(recipe,{goal:profile.goal,isWeekend,servings:profile.servings,kidsHome,day:dayKey,kidName,wx});
          return(
            <div key={slot}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                <Icon name={icon} size={14} color={C.muted} sw={1.5}/>
                <span style={{fontFamily:F.sans,fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:500}}>{label}</span>
              </div>
              <MealCard recipe={recipe} why={why} onSwap={()=>onSwap(dayKey,slot)} onCook={isToday?()=>onCook(dayKey,slot):null}/>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekScreen({week,profile,wx,onSwap,weekNum}){
  const[expanded,setExpanded]=useState(TODAY_IDX);
  const summary=getWeekSummary(week,profile);
  return(
    <div style={{flex:1,overflowY:"auto",paddingBottom:88}}>
      <div style={{background:C.forest,paddingTop:"max(44px, calc(env(safe-area-inset-top, 0px) + 12px))",paddingLeft:"16px",paddingRight:"16px",paddingBottom:"20px"}}>
        <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:12}}>
          <div style={{fontFamily:F.serif,fontSize:28,color:C.cream,fontWeight:400,letterSpacing:"-0.01em"}}>The plan</div>
          <div style={{fontFamily:F.sans,fontSize:9,color:"rgba(250,248,244,0.28)",letterSpacing:"0.1em",textTransform:"uppercase"}}>Your week</div>
        </div>
        <AIBrief text={summary} dark/>
      </div>
      <div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:8}}>
        {DAYS_SHORT.map((day,i)=>{
          const dp=week[day],tots=dayTotals(dp),isOpen=expanded===i,isT=i===TODAY_IDX,isWeekend=i>=5;
          const kidsHome=profile.kidsHome||[];
          const hasKids=kidsHome.includes(day);
          return(
            <div key={day} style={{background:C.card,borderRadius:16,overflow:"hidden",border:`2px solid ${isT?C.forest:C.border}`}}>
              <div onClick={()=>setExpanded(isOpen?-1:i)} style={{padding:"13px 15px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
                <div style={{width:40,flexShrink:0}}>
                  <div style={{fontFamily:F.sans,fontSize:11,color:isT?C.forest:C.muted,fontWeight:isT?700:400,textTransform:"uppercase",letterSpacing:"0.05em"}}>{day}</div>
                  <div style={{display:"flex",gap:3,marginTop:3}}>
                    {isT&&<div style={{width:4,height:4,borderRadius:"50%",background:C.clay}}/>}
                    {hasKids&&<div style={{width:4,height:4,borderRadius:"50%",background:C.sage,opacity:0.6}}/>}
                  </div>
                </div>
                <div style={{flex:1,display:"flex",gap:7,alignItems:"center"}}>
                  {["breakfast","lunch","dinner"].map(s=>{const r=getMeal(dp?.[s]);return r?<span key={s} style={{fontSize:22,lineHeight:1,userSelect:"none"}}>{r.emoji}</span>:null;})}
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontFamily:F.sans,fontSize:12,color:C.ink,fontWeight:500}}>£{tots.cost.toFixed(0)}</div>
                  <div style={{fontFamily:F.sans,fontSize:10,color:C.muted}}>{tots.cal}kcal</div>
                </div>
                <Icon name={isOpen?"chevU":"chevD"} size={16} color={C.muted} sw={2}/>
              </div>
              {isOpen&&(
                <div style={{borderTop:`1px solid ${C.border}`,padding:"10px 12px",display:"flex",flexDirection:"column",gap:8}}>
                  {[{slot:"breakfast",icon:"sunrise"},{slot:"lunch",icon:"sun"},{slot:"dinner",icon:"moon"}].map(({slot,icon})=>{
                    const recipe=getMeal(dp?.[slot]);
                    const why=getWhy(recipe,{goal:profile.goal,isWeekend,servings:profile.servings,kidsHome,day,kidName:profile.kidName,wx});
                    return(
                      <div key={slot}>
                        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:5}}>
                          <Icon name={icon} size={11} color={C.muted} sw={1.5}/>
                          <span style={{fontFamily:F.sans,fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em"}}>{slot}</span>
                        </div>
                        <MealCard recipe={recipe} compact why={why} onSwap={()=>onSwap(day,slot)}/>
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

function SwapScreen({target,week,setWeek,profile,wx,onDone}){
  const[filter,setFilter]=useState("recommended");
  if(!target) return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40,paddingBottom:88}}>
      <div style={{fontSize:48,marginBottom:16}}>🔄</div>
      <div style={{fontFamily:F.serif,fontSize:22,color:C.ink,marginBottom:8}}>Swap a meal</div>
      <div style={{fontFamily:F.sans,fontSize:14,color:C.muted,textAlign:"center"}}>Tap Swap on any meal card</div>
    </div>
  );
  const{day,slot}=target,isWeekend=DAYS_SHORT.indexOf(day)>=5;
  const ctx={goal:profile.goal,wxCold:wx.cold,wxMood:wx.mood,isWeekend,servings:profile.servings,recentIds:[],recentCuisines:[]};
  const current=getMeal(week[day]?.[slot]);
  const all=RECIPES.filter(r=>r.slot===slot).map(r=>({...r,sc:scoreR(r,ctx)})).sort((a,b)=>b.sc-a.sc);
  const filters=[{id:"recommended",label:"For you"},{id:"quick",label:"Quick"},{id:"seasonal",label:"Seasonal"},{id:"protein",label:"High protein"},{id:"batch",label:"Batch"},{id:"budget",label:"Budget"}];
  const filtered=all.filter(m=>{
    if(filter==="quick") return m.time<=20;
    if(filter==="seasonal") return m.seasonal?.some(s=>SEASON.items.includes(s));
    if(filter==="protein") return m.prot>=35;
    if(filter==="batch") return m.batch;
    if(filter==="budget") return m.cost<=5;
    return true;
  });
  const showAll=filtered.length===0;
  const displayList=showAll?all:filtered;
  return(
    <div style={{flex:1,overflowY:"auto",paddingBottom:88}}>
      <div style={{background:C.forest,paddingTop:"max(44px, calc(env(safe-area-inset-top, 0px) + 12px))",paddingLeft:"16px",paddingRight:"16px",paddingBottom:"14px"}}>
        <div style={{fontFamily:F.sans,fontSize:9,color:"rgba(250,248,244,0.28)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3}}>{day} · {slot}</div>
        <div style={{fontFamily:F.serif,fontSize:26,color:C.cream,fontWeight:400,marginBottom:current?3:0}}>Choose a {slot}</div>
        {current&&<div style={{fontFamily:F.sans,fontSize:12,color:"rgba(250,248,244,0.38)"}}>Currently: {current.name}</div>}
      </div>
      <div style={{display:"flex",gap:6,overflowX:"auto",padding:"10px 16px"}}>
        {filters.map(f=>(<button key={f.id} onClick={()=>setFilter(f.id)} style={{flexShrink:0,padding:"7px 14px",borderRadius:100,border:`1.5px solid ${filter===f.id?C.forest:C.border}`,background:filter===f.id?C.forest:C.card,color:filter===f.id?C.cream:C.muted,fontFamily:F.sans,fontSize:12,fontWeight:500,cursor:"pointer"}}>{f.label}</button>))}
      </div>
      <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:10}}>
        {showAll&&filter!=="recommended"&&<div style={{fontFamily:F.sans,fontSize:12,color:C.muted,padding:"4px 2px 2px"}}>No exact matches for this slot — showing all options.</div>}
        {displayList.map(m=>{
          const isCurrent=m.id===week[day]?.[slot];
          const why=getWhy(m,{goal:profile.goal,isWeekend,servings:profile.servings,kidsHome:profile.kidsHome||[],day,kidName:profile.kidName,wx});
          return(
            <div key={m.id} onClick={()=>{setWeek(w=>({...w,[day]:{...w[day],[slot]:m.id}}));onDone();}} style={{border:`2px solid ${isCurrent?C.forest:C.border}`,borderRadius:16,overflow:"hidden",cursor:"pointer"}}>
              {isCurrent&&<div style={{background:C.forest,padding:"5px 14px"}}><span style={{fontFamily:F.sans,fontSize:11,color:C.cream,fontWeight:600}}>Current choice</span></div>}
              <MealCard recipe={m} compact why={why}/>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function ShopScreen({week}){
  const[mode,setMode]=useState("week");
  const[dayIdx,setDayIdx]=useState(TODAY_IDX);
  const[mealSlot,setSlot]=useState("dinner");
  const[checked,setChecked]=useState({});
  const[showBasket,setShowBasket]=useState(false);
  const[chosenSM,setChosenSM]=useState(null);
  function getMeals(){
    if(mode==="week") return DAYS_SHORT.flatMap(d=>["breakfast","lunch","dinner"].map(s=>getMeal(week[d]?.[s])).filter(Boolean));
    if(mode==="day")  return["breakfast","lunch","dinner"].map(s=>getMeal(week[DAYS_SHORT[dayIdx]]?.[s])).filter(Boolean);
    return[getMeal(week[DAYS_SHORT[dayIdx]]?.[mealSlot])].filter(Boolean);
  }
  const meals=getMeals();
  const raw={};
  meals.forEach(r=>(r.ings||[]).forEach(ing=>{const k=ing.n.toLowerCase();if(!raw[k])raw[k]={...ing,count:0,meals:[]};raw[k].count++;if(!raw[k].meals.includes(r.name))raw[k].meals.push(r.name);}));
  const byAisle={};
  Object.values(raw).forEach(item=>{const a=item.a||"storecup";if(!byAisle[a])byAisle[a]=[];byAisle[a].push(item);});
  const sorted=Object.entries(byAisle).sort(([a],[b])=>(AISLES[a]?.order||99)-(AISLES[b]?.order||99));
  const allItems=Object.values(byAisle).flat();
  const doneCount=allItems.filter(i=>checked[i.n]).length;
  const totalCost=meals.reduce((s,r)=>s+r.cost,0);
  const pct=allItems.length>0?(doneCount/allItems.length)*100:0;
  const supermarkets=[
    {id:"tesco",name:"Tesco",color:"#005CA8",emoji:"🔵"},
    {id:"sainsburys",name:"Sainsbury's",color:"#F06B00",emoji:"🟠"},
    {id:"ocado",name:"Ocado",color:"#672D87",emoji:"🟣"},
    {id:"waitrose",name:"Waitrose",color:"#74a341",emoji:"🟢"},
  ];
  if(showBasket) return(
    <div style={{flex:1,overflowY:"auto",paddingBottom:88}}>
      <div style={{background:C.forest,paddingTop:"max(44px, calc(env(safe-area-inset-top, 0px) + 12px))",paddingLeft:"16px",paddingRight:"16px",paddingBottom:"20px"}}>
        <button onClick={()=>{setShowBasket(false);setChosenSM(null);}} style={{background:"none",border:"none",color:"rgba(250,248,244,0.5)",cursor:"pointer",display:"flex",alignItems:"center",gap:6,marginBottom:12,padding:0}}>
          <Icon name="back" size={16} color="rgba(250,248,244,0.5)" sw={1.5}/><span style={{fontFamily:F.sans,fontSize:13}}>Back to list</span>
        </button>
        <div style={{fontFamily:F.serif,fontSize:26,color:C.cream,fontWeight:400}}>Add to basket</div>
        <div style={{fontFamily:F.sans,fontSize:12,color:"rgba(250,248,244,0.38)",marginTop:3}}>{allItems.length} items · approx £{totalCost.toFixed(2)}</div>
      </div>
      {!chosenSM?(
        <div style={{padding:"20px 16px"}}>
          <div style={{fontFamily:F.sans,fontSize:14,color:C.muted,marginBottom:14}}>Choose your supermarket</div>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {supermarkets.map(sm=>(
              <button key={sm.id} onClick={()=>setChosenSM(sm)} style={{padding:"15px 16px",borderRadius:16,border:`1.5px solid ${C.border}`,background:C.card,cursor:"pointer",display:"flex",alignItems:"center",gap:13,textAlign:"left"}}>
                <div style={{width:44,height:44,borderRadius:12,background:sm.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{sm.emoji}</div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:F.sans,fontSize:16,color:C.ink,fontWeight:600}}>{sm.name}</div>
                  <div style={{fontFamily:F.sans,fontSize:12,color:C.muted,marginTop:1}}>Add {allItems.length} items to your basket</div>
                </div>
                <Icon name="arrow" size={16} color={C.muted} sw={1.5}/>
              </button>
            ))}
          </div>
        </div>
      ):(
        <div style={{padding:"24px 16px",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center"}}>
          <div style={{width:80,height:80,borderRadius:24,background:chosenSM.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,marginBottom:20}}>{chosenSM.emoji}</div>
          <div style={{fontFamily:F.serif,fontSize:26,color:C.ink,marginBottom:8}}>Opening {chosenSM.name}...</div>
          <div style={{fontFamily:F.sans,fontSize:14,color:C.muted,lineHeight:1.65,maxWidth:280,marginBottom:24}}>
            Plait is sending your {allItems.length} items to your {chosenSM.name} basket. Review and adjust before you checkout.
          </div>
          <div style={{background:C.cream,borderRadius:14,padding:"14px 16px",width:"100%",marginBottom:14,border:`1px solid ${C.border}`}}>
            <div style={{fontFamily:F.sans,fontSize:12,color:C.forest,fontWeight:600,marginBottom:8}}>Items being added</div>
            {allItems.slice(0,6).map(item=>(
              <div key={item.n} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.borderLight}`}}>
                <span style={{fontFamily:F.sans,fontSize:13,color:C.ink}}>{item.n}</span>
                <span style={{fontFamily:F.sans,fontSize:12,color:C.muted}}>{item.q}</span>
              </div>
            ))}
            {allItems.length>6&&<div style={{fontFamily:F.sans,fontSize:11,color:C.muted,marginTop:6,textAlign:"center"}}>+{allItems.length-6} more</div>}
          </div>
          <button style={{width:"100%",padding:"15px",borderRadius:14,border:"none",background:chosenSM.color,color:"white",fontFamily:F.sans,fontSize:15,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <Icon name="cart" size={18} color="white" sw={2}/>Open {chosenSM.name} basket
          </button>
          <div style={{fontFamily:F.sans,fontSize:11,color:C.muted,marginTop:10}}>You will review and confirm before checkout</div>
        </div>
      )}
    </div>
  );
  return(
    <div style={{flex:1,overflowY:"auto",paddingBottom:88}}>
      <div style={{background:C.forest,paddingTop:"max(44px, calc(env(safe-area-inset-top, 0px) + 12px))",paddingLeft:"16px",paddingRight:"16px",paddingBottom:"14px"}}>
        <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:10}}>
          <div style={{fontFamily:F.serif,fontSize:26,color:C.cream,fontWeight:400}}>Your list</div>
          <div style={{fontFamily:F.sans,fontSize:9,color:"rgba(250,248,244,0.28)",letterSpacing:"0.1em",textTransform:"uppercase"}}>Shopping</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{flex:1,background:"rgba(255,255,255,0.1)",borderRadius:100,height:4,overflow:"hidden"}}>
            <div style={{width:`${pct}%`,background:pct===100?C.clay:C.cream,height:"100%",borderRadius:100,transition:"width 0.3s"}}/>
          </div>
          <span style={{fontFamily:F.sans,fontSize:12,color:"rgba(250,248,244,0.5)",whiteSpace:"nowrap"}}>{doneCount}/{allItems.length}</span>
        </div>
        <div style={{display:"flex",gap:6}}>
          {[{id:"meal",label:"One meal"},{id:"day",label:"One day"},{id:"week",label:"Full week"}].map(m=>(
            <button key={m.id} onClick={()=>setMode(m.id)} style={{flex:1,padding:"9px 4px",borderRadius:10,border:`1.5px solid ${mode===m.id?"rgba(255,255,255,0.3)":"rgba(255,255,255,0.08)"}`,background:mode===m.id?"rgba(255,255,255,0.14)":"transparent",color:mode===m.id?C.cream:"rgba(250,248,244,0.38)",fontFamily:F.sans,fontSize:12,fontWeight:mode===m.id?600:400,cursor:"pointer"}}>{m.label}</button>
          ))}
        </div>
      </div>
      {(mode==="day"||mode==="meal")&&(
        <div style={{display:"flex",gap:5,overflowX:"auto",padding:"10px 16px 0"}}>
          {DAYS_SHORT.map((d,i)=>(<button key={d} onClick={()=>setDayIdx(i)} style={{flexShrink:0,padding:"6px 12px",borderRadius:100,border:`1.5px solid ${dayIdx===i?C.forest:C.border}`,background:dayIdx===i?C.forest:C.card,color:dayIdx===i?C.cream:C.muted,fontFamily:F.sans,fontSize:12,fontWeight:500,cursor:"pointer"}}>{d}</button>))}
        </div>
      )}
      {mode==="meal"&&(
        <div style={{display:"flex",gap:5,padding:"8px 16px 0"}}>
          {[{s:"breakfast",icon:"sunrise"},{s:"lunch",icon:"sun"},{s:"dinner",icon:"moon"}].map(({s,icon})=>(
            <button key={s} onClick={()=>setSlot(s)} style={{flex:1,padding:"8px",borderRadius:10,border:`1.5px solid ${mealSlot===s?C.forest:C.border}`,background:mealSlot===s?C.forest:C.card,color:mealSlot===s?C.cream:C.muted,fontFamily:F.sans,fontSize:12,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
              <Icon name={icon} size={13} color={mealSlot===s?C.cream:C.muted} sw={1.5}/>{s}
            </button>
          ))}
        </div>
      )}
      {allItems.length>0&&(
        <div style={{margin:"12px 16px 0"}}>
          <button onClick={()=>setShowBasket(true)} style={{width:"100%",padding:"14px 16px",borderRadius:14,border:"none",background:C.ink,color:C.cream,fontFamily:F.sans,fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <Icon name="cart" size={16} color={C.cream} sw={2}/>Send to supermarket · {allItems.length} items · £{totalCost.toFixed(2)}
          </button>
        </div>
      )}
      <div style={{padding:"10px 16px",display:"flex",flexDirection:"column",gap:8}}>
        {sorted.map(([aisle,items])=>{
          const ai=AISLES[aisle]||{label:aisle};
          const ad=items.filter(i=>checked[i.n]).length;
          return(
            <div key={aisle} style={{background:C.card,borderRadius:16,overflow:"hidden",border:`1px solid ${C.border}`}}>
              <div style={{padding:"10px 14px",background:C.cream,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontFamily:F.sans,fontWeight:600,color:C.ink,fontSize:13}}>{ai.label}</span>
                <span style={{fontFamily:F.sans,fontSize:12,color:ad===items.length?C.forest:C.muted}}>{ad}/{items.length}</span>
              </div>
              {items.map((item,ii)=>{
                const done=checked[item.n];
                return(
                  <div key={item.n} onClick={()=>setChecked(c=>({...c,[item.n]:!c[item.n]}))} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 14px",borderBottom:ii<items.length-1?`1px solid ${C.borderLight}`:"none",background:done?C.forestGhost:"transparent",cursor:"pointer",minHeight:52}}>
                    <div style={{width:22,height:22,borderRadius:6,border:`2px solid ${done?C.forest:C.border}`,background:done?C.forest:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {done&&<Icon name="check" size={12} color="white" sw={2.5}/>}
                    </div>
                    <div style={{flex:1}}>
                      <span style={{fontFamily:F.sans,fontWeight:500,color:done?C.mutedLight:C.ink,fontSize:15,textDecoration:done?"line-through":"none"}}>{item.n}</span>
                      <div style={{display:"flex",gap:6,marginTop:2,flexWrap:"wrap",alignItems:"center"}}>
                        <span style={{fontFamily:F.sans,fontSize:12,color:C.muted}}>{item.q}</span>
                        {item.count>1&&<span style={{fontFamily:F.sans,fontSize:11,color:C.mutedLight,background:C.bg,borderRadius:4,padding:"1px 6px"}}>in {item.count} meals</span>}
                        {item.seasonal&&<Tag bg={C.sagePale} fg={C.forest} icon="leaf">Seasonal</Tag>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
        {allItems.length===0&&(<div style={{textAlign:"center",padding:"40px 0"}}><div style={{fontSize:40,marginBottom:12}}>🛒</div><div style={{fontFamily:F.sans,fontSize:14,color:C.muted}}>No items for this selection</div></div>)}
        {doneCount===allItems.length&&allItems.length>0&&(
          <div style={{background:C.forest,borderRadius:16,padding:"24px",textAlign:"center"}}>
            <div style={{fontFamily:F.serif,fontStyle:"italic",fontWeight:300,fontSize:20,color:C.cream,marginBottom:4}}>All done.</div>
            <div style={{fontFamily:F.sans,fontSize:13,color:"rgba(250,248,244,0.5)"}}>Good week ahead.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function CookScreen({week,profile}){
  const[dayIdx,setDayIdx]=useState(TODAY_IDX);
  const[slot,setSlot]=useState("dinner");
  const[stepIdx,setStepIdx]=useState(0);
  const dayKey=DAYS_SHORT[dayIdx];
  const recipe=getMeal(week[dayKey]?.[slot]);
  return(
    <div style={{flex:1,overflowY:"auto",paddingBottom:88}}>
      <div style={{background:C.forest,paddingTop:"max(44px, calc(env(safe-area-inset-top, 0px) + 12px))",paddingLeft:"16px",paddingRight:"16px",paddingBottom:"14px"}}>
        <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:12}}>
          <div style={{fontFamily:F.serif,fontSize:26,color:C.cream,fontWeight:400}}>Let us cook</div>
          <div style={{fontFamily:F.sans,fontSize:9,color:"rgba(250,248,244,0.28)",letterSpacing:"0.1em",textTransform:"uppercase"}}>Cook mode</div>
        </div>
        <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:10}}>
          {DAYS_SHORT.map((d,i)=>(<button key={d} onClick={()=>{setDayIdx(i);setStepIdx(0);}} style={{flexShrink:0,padding:"6px 12px",borderRadius:100,border:"none",background:dayIdx===i?"rgba(255,255,255,0.18)":"rgba(255,255,255,0.06)",color:dayIdx===i?C.cream:"rgba(250,248,244,0.35)",fontFamily:F.sans,fontSize:12,fontWeight:dayIdx===i?600:400,cursor:"pointer"}}>{d}</button>))}
        </div>
        <div style={{display:"flex",gap:8}}>
          {[{s:"breakfast",icon:"sunrise"},{s:"lunch",icon:"sun"},{s:"dinner",icon:"moon"}].map(({s,icon})=>{
            const r=getMeal(week[dayKey]?.[s]);
            return(
              <button key={s} onClick={()=>{setSlot(s);setStepIdx(0);}} style={{flex:1,padding:"10px 6px",borderRadius:12,border:`1.5px solid ${slot===s?"rgba(255,255,255,0.35)":"rgba(255,255,255,0.07)"}`,background:slot===s?"rgba(255,255,255,0.14)":"transparent",cursor:"pointer",textAlign:"center"}}>
                <Icon name={icon} size={14} color={slot===s?C.cream:"rgba(250,248,244,0.3)"} sw={1.5}/>
                <div style={{fontFamily:F.sans,fontSize:9,color:slot===s?C.cream:"rgba(250,248,244,0.3)",textTransform:"uppercase",letterSpacing:"0.04em",marginTop:3}}>{s}</div>
                <div style={{fontFamily:F.sans,fontSize:11,color:"rgba(250,248,244,0.3)",marginTop:2}}>{r?.emoji||"..."}</div>
              </button>
            );
          })}
        </div>
      </div>
      {recipe?(
        <div style={{padding:"14px 16px 0",display:"flex",flexDirection:"column",gap:12}}>
          <RecipeVisual recipe={recipe} height={180}/>
          <div style={{background:C.card,borderRadius:14,padding:"14px 16px",border:`1px solid ${C.border}`,display:"flex",gap:14,flexWrap:"wrap"}}>
            {[{i:"clock",v:`${recipe.time} mins`,c:C.muted},{i:"flame",v:`${recipe.cal}kcal`,c:C.clay},{i:"muscle",v:`${recipe.prot}g protein`,c:C.forestMid},{i:"users",v:`Serves ${recipe.servings}`,c:C.muted}].map(s=>(
              <span key={s.i} style={{display:"flex",alignItems:"center",gap:5,fontFamily:F.sans,fontSize:12,color:C.muted}}>
                <Icon name={s.i} size={13} color={s.c} sw={2}/>{s.v}
              </span>
            ))}
          </div>
          <div style={{background:C.card,borderRadius:16,overflow:"hidden",border:`1px solid ${C.border}`}}>
            <div style={{padding:"12px 16px",background:C.cream,borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontFamily:F.sans,fontWeight:600,color:C.ink,fontSize:13}}>You will need</span>
            </div>
            {recipe.ings?.map((ing,ii)=>(
              <div key={ii} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:ii<recipe.ings.length-1?`1px solid ${C.borderLight}`:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <span style={{fontFamily:F.sans,fontSize:14,color:C.ink}}>{ing.n}</span>
                  {ing.seasonal&&<Tag bg={C.sagePale} fg={C.forest} icon="leaf">Seasonal</Tag>}
                </div>
                <span style={{fontFamily:F.sans,fontSize:13,color:C.muted,fontWeight:500}}>{ing.q}</span>
              </div>
            ))}
          </div>
          {recipe.steps?.length>0&&(
            <div style={{background:C.card,borderRadius:16,padding:"18px",border:`1px solid ${C.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <Icon name="chef" size={16} color={C.forest} sw={1.5}/>
                  <span style={{fontFamily:F.sans,fontWeight:600,color:C.ink,fontSize:13}}>Step by step</span>
                </div>
                <span style={{fontFamily:F.sans,fontSize:12,color:C.muted}}>{stepIdx+1} of {recipe.steps.length}</span>
              </div>
              <div style={{display:"flex",gap:4,marginBottom:18}}>
                {recipe.steps.map((_,i)=>(<div key={i} onClick={()=>setStepIdx(i)} style={{flex:1,height:3,borderRadius:2,background:i<=stepIdx?C.forest:C.border,cursor:"pointer",transition:"background 0.2s"}}/>))}
              </div>
              <div style={{background:C.forestLight,borderRadius:16,overflow:"hidden",marginBottom:16}}>
                <div style={{background:`linear-gradient(135deg,${C.forestLight} 0%,${C.sagePale} 100%)`,padding:"20px",display:"flex",justifyContent:"center",borderBottom:`1px solid ${C.border}`}}>
                  <StepIll type={stepType(recipe.steps[stepIdx])} size={72}/>
                </div>
                <div style={{padding:"16px 18px",display:"flex",gap:12,alignItems:"flex-start"}}>
                  <div style={{width:28,height:28,borderRadius:8,background:C.forest,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontFamily:F.sans,fontSize:13,color:C.cream,fontWeight:700}}>{stepIdx+1}</span>
                  </div>
                  <div style={{fontFamily:F.serif,fontSize:17,color:C.forest,fontWeight:400,lineHeight:1.65,flex:1}}>
                    {recipe.steps[stepIdx]}
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setStepIdx(s=>Math.max(0,s-1))} disabled={stepIdx===0} style={{flex:1,padding:"13px",borderRadius:12,border:`1.5px solid ${stepIdx===0?C.border:C.forest}`,background:"transparent",color:stepIdx===0?C.border:C.forest,fontFamily:F.sans,fontSize:13,fontWeight:600,cursor:stepIdx===0?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  <Icon name="back" size={14} color={stepIdx===0?C.border:C.forest} sw={2}/>Back
                </button>
                {stepIdx<recipe.steps.length-1
                  ?<button onClick={()=>setStepIdx(s=>s+1)} style={{flex:2,padding:"13px",borderRadius:12,border:"none",background:C.forest,color:C.cream,fontFamily:F.sans,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>Next step<Icon name="arrow" size={14} color={C.cream} sw={2}/></button>
                  :<button onClick={()=>setStepIdx(0)} style={{flex:2,padding:"13px",borderRadius:12,border:"none",background:C.clay,color:C.cream,fontFamily:F.sans,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><Icon name="check" size={14} color={C.cream} sw={2.5}/>That is that</button>
                }
              </div>
            </div>
          )}
        </div>
      ):(
        <div style={{padding:40,textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:12}}>🍳</div>
          <div style={{fontFamily:F.sans,fontSize:14,color:C.muted}}>No meal planned here</div>
        </div>
      )}
    </div>
  );
}

export default function App(){
  const[onboarded,setOnboarded]=useState(false);
  const[profile,setProfile]=useState(null);
  const[week,setWeek]=useState(null);
  const[tab,setTab]=useState("day");
  const[swapTarget,setSwapTarget]=useState(null);
  const[weekNum]=useState(1);
  const wx=useWeatherSilent();
  function complete(p){setProfile(p);setWeek(buildWeek(p,wx));setOnboarded(true);}
  function handleSwap(day,slot){setSwapTarget({day,slot});setTab("swap");}
  function handleCook(){setTab("cook");}
  function handleSwapDone(){setSwapTarget(null);setTab("day");}
  if(!onboarded) return <Onboarding onComplete={complete}/>;
  const tabs=[{id:"day",icon:"sun",label:"Day"},{id:"week",icon:"calendar",label:"Week"},{id:"shop",icon:"bag",label:"Shop"},{id:"cook",icon:"chef",label:"Cook"}];
  return(
    <div style={{display:"flex",flexDirection:"column",height:"100vh",maxWidth:430,margin:"0 auto",background:C.bg,overflow:"hidden"}}>
      <style>{FONTS}</style>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{display:none}html{height:100%;background:#181410}body{background:#181410;height:100%;overscroll-behavior:none}button{-webkit-tap-highlight-color:transparent;outline:none}textarea{outline:none;}`}</style>
      <style>{`@supports(padding-top: env(safe-area-inset-top)){:root{--sat:env(safe-area-inset-top,0px)}}`}</style>
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",minHeight:0}}>
        {tab==="day"  &&<DayScreen  week={week} profile={profile} wx={wx} onSwap={handleSwap} onCook={handleCook} weekNum={weekNum}/>}
        {tab==="week" &&<WeekScreen week={week} profile={profile} wx={wx} onSwap={handleSwap} weekNum={weekNum}/>}
        {tab==="swap" &&<SwapScreen target={swapTarget} week={week} setWeek={setWeek} profile={profile} wx={wx} onDone={handleSwapDone}/>}
        {tab==="shop" &&<ShopScreen week={week}/>}
        {tab==="cook" &&<CookScreen week={week} profile={profile}/>}
      </div>
      <div style={{background:C.nav,paddingBottom:"max(10px,env(safe-area-inset-bottom))",paddingTop:10,display:"flex",borderTop:"1px solid rgba(255,255,255,0.06)",flexShrink:0}}>
        {tabs.map(t=>{
          const active=tab===t.id||(tab==="swap"&&t.id==="day");
          return(
            <button key={t.id} onClick={()=>{if(t.id!=="swap")setTab(t.id);}} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"4px 0",background:"none",border:"none",cursor:"pointer"}}>
              <Icon name={t.icon} size={20} color={active?C.cream:"rgba(250,248,244,0.22)"} sw={1.5}/>
              <span style={{fontFamily:F.sans,fontSize:9,fontWeight:active?600:400,color:active?C.cream:"rgba(250,248,244,0.22)",letterSpacing:"0.05em",textTransform:"uppercase"}}>{t.label}</span>
              {active&&<div style={{width:3,height:3,borderRadius:"50%",background:C.clay}}/>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
