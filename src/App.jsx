import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════
   PLAIT v4 — Mobile first
   Four modes: Today · Swap · Shop · Cook
   Designed for one hand, portrait, real life
═══════════════════════════════════════════════════════ */

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');`;

const C = {
  bg:          "#f7f4ef",
  card:        "#ffffff",
  ink:         "#1a1714",
  forest:      "#2a4a35",
  forestLight: "#e6f0ea",
  clay:        "#c4622d",
  clayLight:   "#fdf0e8",
  gold:        "#9a7f3a",
  goldLight:   "#fdf6e3",
  muted:       "#7a7060",
  border:      "#e8e0d4",
  cream:       "#faf8f4",
  sage:        "#c8dfc8",
  sageText:    "#2a4a35",
  warn:        "#fef3c7",
  warnText:    "#92400e",
  navBg:       "#1a1714",
};

// ── DATA ──────────────────────────────────────────────

const MONTH = new Date().getMonth() + 1;
const SEA = ({
  1:{n:"January",  e:"❄️", p:["leeks","kale","parsnips","celeriac","blood orange","cavolo nero"]},
  2:{n:"February", e:"🌨️", p:["purple sprouting broccoli","leeks","kale","forced rhubarb"]},
  3:{n:"March",    e:"🌱", p:["purple sprouting broccoli","spring greens","radishes","watercress"]},
  4:{n:"April",    e:"🌸", p:["asparagus","spring onions","spinach","jersey royals"]},
  5:{n:"May",      e:"☀️", p:["asparagus","broad beans","peas","new potatoes"]},
  6:{n:"June",     e:"🌻", p:["strawberries","courgettes","fennel","new potatoes"]},
  7:{n:"July",     e:"🏖️", p:["tomatoes","courgettes","runner beans","sweetcorn"]},
  8:{n:"August",   e:"🌞", p:["tomatoes","sweetcorn","aubergine","peppers"]},
  9:{n:"September",e:"🍂", p:["butternut squash","wild mushrooms","blackberries"]},
  10:{n:"October", e:"🎃", p:["pumpkin","celeriac","wild mushrooms","chestnuts"]},
  11:{n:"November",e:"🍁", p:["parsnips","swede","brussels sprouts","venison"]},
  12:{n:"December",e:"⛄", p:["turkey","parsnips","brussels sprouts","clementines"]},
})[MONTH] || {n:"Winter",e:"❄️",p:["leeks","kale","parsnips"]};

const isSeasonal = m => m?.seasonal?.some(s => SEA.p.includes(s));

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const TODAY_IDX = Math.min(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1, 6);

const PROFILES = {
  solo:  {label:"Solo",  icon:"🧑", cal:2000, prot:170},
  office:{label:"Office",icon:"🏢", cal:1800, prot:150},
  family:{label:"Family",icon:"👨‍👧", cal:3200, prot:220},
};

const CAL_EVENTS = {
  Mon:[{time:"09:00",title:"Standup",type:"work"},{time:"19:00",title:"Late call",type:"work"}],
  Tue:[{time:"08:30",title:"Office",type:"office"}],
  Wed:[{time:"18:00",title:"Gym",type:"personal"}],
  Thu:[{time:"16:00",title:"Kids home",type:"family"}],
  Fri:[{time:"16:00",title:"Kids home",type:"family"}],
  Sat:[{time:"10:00",title:"Football",type:"family"}],
  Sun:[{time:"14:00",title:"Batch cook",type:"prep"}],
};

const ALL_MEALS = [
  // BREAKFAST
  {id:"b1",slot:"breakfast",name:"Greek yoghurt & walnuts",cal:280,prot:22,cost:2.8,time:5,tags:["quick"],seasonal:[],weather:["any"],
   steps:["Spoon yoghurt into bowl","Drizzle honey","Scatter walnuts"],
   ings:[{name:"Greek yoghurt",qty:"200g",aisle:"dairy"},{name:"Runny honey",qty:"1 tbsp",aisle:"condiments",staple:true},{name:"Walnuts",qty:"30g",aisle:"storecup"}]},
  {id:"b2",slot:"breakfast",name:"Smoked salmon & rye",cal:380,prot:32,cost:4.8,time:8,tags:["quick","high-prot"],seasonal:[],weather:["any"],
   steps:["Toast rye bread","Spread cream cheese","Layer smoked salmon","Squeeze lemon"],
   ings:[{name:"Smoked salmon",qty:"100g",aisle:"protein"},{name:"Rye bread",qty:"2 slices",aisle:"bakery"},{name:"Cream cheese",qty:"2 tbsp",aisle:"dairy"}]},
  {id:"b3",slot:"breakfast",name:"Bircher muesli",cal:360,prot:14,cost:2.0,time:5,tags:["prep-ahead"],seasonal:[],weather:["any"],batch:true,batchNote:"Make Sunday night — ready all week",
   steps:["Take from fridge","Top with fresh berries","Done"],
   ings:[{name:"Rolled oats",qty:"80g",aisle:"grains"},{name:"Apple juice",qty:"150ml",aisle:"tins"},{name:"Natural yoghurt",qty:"100g",aisle:"dairy"},{name:"Mixed berries",qty:"80g",aisle:"produce"}]},
  {id:"b4",slot:"breakfast",name:"Porridge & almond butter",cal:420,prot:18,cost:1.6,time:8,tags:["warming"],seasonal:[],weather:["cold","rainy"],
   steps:["Combine oats and milk in pan","Cook on medium 5 mins, stirring","Slice banana on top","Add almond butter"],
   ings:[{name:"Porridge oats",qty:"80g",aisle:"grains"},{name:"Whole milk",qty:"200ml",aisle:"dairy"},{name:"Banana",qty:"1",aisle:"produce"},{name:"Almond butter",qty:"1 tbsp",aisle:"condiments",staple:true}]},
  {id:"b5",slot:"breakfast",name:"Protein smoothie bowl",cal:310,prot:35,cost:3.2,time:8,tags:["quick","high-prot"],seasonal:[],weather:["mild","warm"],
   steps:["Blend protein powder, berries, banana and milk","Pour into bowl","Top with granola"],
   ings:[{name:"Protein powder",qty:"30g",aisle:"storecup"},{name:"Frozen berries",qty:"100g",aisle:"produce"},{name:"Banana",qty:"1",aisle:"produce"},{name:"Almond milk",qty:"150ml",aisle:"dairy"}]},
  // LUNCH
  {id:"l1",slot:"lunch",name:"Chicken tabbouleh jar",cal:480,prot:42,cost:6.5,time:20,tags:["meal-prep","office"],seasonal:[],weather:["any"],batch:true,batchNote:"Prep 3 Sunday — keeps 4 days",
   steps:["Cook bulgur wheat per packet","Shred pre-cooked chicken","Mix with parsley, tomatoes, lemon","Layer in jar"],
   ings:[{name:"Chicken breast",qty:"150g",aisle:"protein"},{name:"Bulgur wheat",qty:"80g",aisle:"grains"},{name:"Flat-leaf parsley",qty:"1 bunch",aisle:"produce"},{name:"Cherry tomatoes",qty:"100g",aisle:"produce"},{name:"Lemon",qty:"1",aisle:"produce"}]},
  {id:"l2",slot:"lunch",name:"Celeriac & lentil soup",cal:380,prot:22,cost:3.5,time:40,tags:["batch","warming"],seasonal:["celeriac"],weather:["cold","rainy"],batch:true,batchNote:"Big pot Sunday — 4 portions",
   steps:["Roast celeriac chunks at 200°C 25 mins","Soften onion in pot","Add lentils and stock, simmer 20 mins","Blend half, season well"],
   ings:[{name:"Celeriac",qty:"1 medium",aisle:"produce",seasonal:true},{name:"Red lentils",qty:"150g",aisle:"tins"},{name:"Vegetable stock",qty:"800ml",aisle:"storecup",staple:true},{name:"Onion",qty:"1",aisle:"produce"}]},
  {id:"l3",slot:"lunch",name:"Tuna Niçoise",cal:420,prot:38,cost:5.5,time:10,tags:["no-cook","quick"],seasonal:[],weather:["any"],
   steps:["Blanch green beans 3 mins","Drain tuna","Arrange everything on plate","Dress with olive oil and mustard"],
   ings:[{name:"Tuna in olive oil",qty:"2 tins",aisle:"tins"},{name:"Green beans",qty:"100g",aisle:"produce"},{name:"Olives",qty:"50g",aisle:"condiments",staple:true},{name:"Cherry tomatoes",qty:"100g",aisle:"produce"}]},
  {id:"l4",slot:"lunch",name:"Warm mezze",cal:520,prot:24,cost:6.2,time:15,tags:["relaxed","family"],seasonal:[],weather:["any"],
   steps:["Warm flatbreads in dry pan","Arrange hummus, feta, peppers","Slice cucumber","Drizzle olive oil on hummus"],
   ings:[{name:"Hummus",qty:"200g",aisle:"tins"},{name:"Flatbreads",qty:"2",aisle:"bakery"},{name:"Feta",qty:"80g",aisle:"dairy"},{name:"Roasted peppers",qty:"100g",aisle:"tins"},{name:"Cucumber",qty:"half",aisle:"produce"}]},
  {id:"l5",slot:"lunch",name:"Kale caesar",cal:380,prot:28,cost:5.0,time:12,tags:["seasonal"],seasonal:["kale"],weather:["any"],
   steps:["Massage kale with dressing 2 mins","Add cavolo nero torn","Top with parmesan and croutons","Add sliced chicken"],
   ings:[{name:"Kale",qty:"100g",aisle:"produce",seasonal:true},{name:"Cavolo nero",qty:"80g",aisle:"produce",seasonal:true},{name:"Parmesan",qty:"30g",aisle:"dairy"},{name:"Caesar dressing",qty:"3 tbsp",aisle:"condiments"},{name:"Chicken breast",qty:"120g",aisle:"protein"}]},
  // DINNER
  {id:"d1",slot:"dinner",name:"Sea bass, capers & lemon",cal:520,prot:48,cost:12.0,time:25,tags:["quick","elegant"],seasonal:[],weather:["any"],
   steps:["Heat oven to 200°C","Score fish, season","Roast tomatoes 10 mins","Pan-fry fish 3 mins each side","Finish with capers and lemon"],
   ings:[{name:"Sea bass fillets",qty:"2",aisle:"protein"},{name:"Capers",qty:"2 tbsp",aisle:"condiments",staple:true},{name:"Lemon",qty:"1",aisle:"produce"},{name:"Cherry tomatoes",qty:"150g",aisle:"produce"}]},
  {id:"d2",slot:"dinner",name:"Slow-cooked lamb shoulder",cal:680,prot:56,cost:16.0,time:240,tags:["weekend","family"],seasonal:[],weather:["cold","rainy"],batch:true,batchNote:"Makes enough for wraps 2 days",
   steps:["Heat oven to 160°C","Brown shoulder all over in casserole","Add onions, garlic, tomatoes, wine","Cover, cook 4 hours","Rest 30 mins, shred with forks"],
   ings:[{name:"Lamb shoulder",qty:"1.5kg",aisle:"protein"},{name:"Garlic",qty:"6 cloves",aisle:"produce",staple:true},{name:"Rosemary",qty:"3 sprigs",aisle:"produce"},{name:"Tinned tomatoes",qty:"400g",aisle:"tins"},{name:"Onion",qty:"2",aisle:"produce"}]},
  {id:"d3",slot:"dinner",name:"Turkey meatballs & courgetti",cal:490,prot:52,cost:8.5,time:30,tags:["quick","high-prot"],seasonal:[],weather:["any"],batch:true,batchNote:"Double batch — freeze half",
   steps:["Mix mince, garlic, parmesan","Roll into balls, chill 10 mins","Brown meatballs all over","Add tomatoes, simmer 15 mins","Spiralise courgette, toss raw into sauce"],
   ings:[{name:"Turkey mince",qty:"400g",aisle:"protein"},{name:"Courgette",qty:"2",aisle:"produce"},{name:"Tinned tomatoes",qty:"400g",aisle:"tins"},{name:"Garlic",qty:"3 cloves",aisle:"produce",staple:true},{name:"Parmesan",qty:"30g",aisle:"dairy"}]},
  {id:"d4",slot:"dinner",name:"Chicken souvlaki",cal:560,prot:55,cost:9.0,time:25,tags:["family","high-prot"],seasonal:[],weather:["any"],batch:true,batchNote:"Marinate overnight for best flavour",
   steps:["If marinated: straight to grill","Grill thighs 6 mins each side","Rest 5 mins, slice","Mix yoghurt, cucumber, mint for tzatziki","Warm pittas, assemble"],
   ings:[{name:"Chicken thighs",qty:"600g",aisle:"protein"},{name:"Greek yoghurt",qty:"200g",aisle:"dairy"},{name:"Cucumber",qty:"half",aisle:"produce"},{name:"Pittas",qty:"4",aisle:"bakery"},{name:"Lemon",qty:"1",aisle:"produce"}]},
  {id:"d5",slot:"dinner",name:"Chickpea & parsnip tagine",cal:440,prot:24,cost:6.0,time:45,tags:["veggie","warming","family"],seasonal:["parsnips"],weather:["cold","rainy"],batch:true,batchNote:"Better next day — make Sunday",
   steps:["Soften onion 8 mins","Add ras el hanout, toast 1 min","Add parsnips, chickpeas, tomatoes, stock","Simmer 30 mins","Serve on couscous"],
   ings:[{name:"Parsnips",qty:"400g",aisle:"produce",seasonal:true},{name:"Chickpeas",qty:"400g",aisle:"tins"},{name:"Tinned tomatoes",qty:"400g",aisle:"tins"},{name:"Ras el hanout",qty:"2 tsp",aisle:"condiments",staple:true},{name:"Couscous",qty:"200g",aisle:"grains"},{name:"Onion",qty:"1",aisle:"produce"}]},
  {id:"d6",slot:"dinner",name:"Salmon, miso & kale",cal:510,prot:46,cost:11.0,time:20,tags:["quick","elegant"],seasonal:["kale"],weather:["cold","rainy"],
   steps:["Mix miso, soy, ginger, sesame oil","Brush over salmon","Bake 12 mins at 200°C","Wilt kale in the miso pan with a splash of water","Serve together"],
   ings:[{name:"Salmon fillets",qty:"2",aisle:"protein"},{name:"Kale",qty:"100g",aisle:"produce",seasonal:true},{name:"White miso paste",qty:"2 tbsp",aisle:"condiments"},{name:"Ginger",qty:"1 thumb",aisle:"produce"},{name:"Soy sauce",qty:"1 tbsp",aisle:"condiments",staple:true}]},
  {id:"d7",slot:"dinner",name:"Pork tenderloin & celeriac",cal:600,prot:52,cost:10.0,time:40,tags:["weekend","family"],seasonal:["celeriac"],weather:["cold","rainy"],
   steps:["Heat oven to 200°C","Cube celeriac, toss in oil, roast 30 mins","Rub tenderloin with mustard and thyme","Sear all over 3 mins","Roast alongside celeriac 15 mins, rest 5"],
   ings:[{name:"Pork tenderloin",qty:"600g",aisle:"protein"},{name:"Celeriac",qty:"1 medium",aisle:"produce",seasonal:true},{name:"Dijon mustard",qty:"2 tbsp",aisle:"condiments",staple:true},{name:"Thyme",qty:"3 sprigs",aisle:"produce"}]},
  {id:"d8",slot:"dinner",name:"Roast chicken & fennel",cal:580,prot:54,cost:11.5,time:70,tags:["weekend","family"],seasonal:["blood orange"],weather:["cold"],batch:true,batchNote:"Use carcass for stock, cold leftovers tomorrow",
   steps:["Heat oven to 200°C","Quarter fennel and blood oranges, place in tin","Sit chicken on top, season generously","Roast 1 hour 10 mins","Rest 15 mins before carving"],
   ings:[{name:"Whole chicken",qty:"1.6kg",aisle:"protein"},{name:"Fennel bulb",qty:"2",aisle:"produce"},{name:"Blood oranges",qty:"2",aisle:"produce",seasonal:true},{name:"Garlic",qty:"4 cloves",aisle:"produce",staple:true}]},
];

const getMeal = (slot, id) => ALL_MEALS.find(m => m.slot === slot && m.id === id);

const DEFAULT_WEEK = {
  Mon:{profile:"office",meals:{breakfast:"b2",lunch:"l1",dinner:"d3"}},
  Tue:{profile:"office",meals:{breakfast:"b4",lunch:"l1",dinner:"d6"}},
  Wed:{profile:"solo",  meals:{breakfast:"b1",lunch:"l3",dinner:"d3"}},
  Thu:{profile:"family",meals:{breakfast:"b4",lunch:"l4",dinner:"d4"}},
  Fri:{profile:"family",meals:{breakfast:"b3",lunch:"l4",dinner:"d5"}},
  Sat:{profile:"family",meals:{breakfast:"b3",lunch:"l2",dinner:"d2"}},
  Sun:{profile:"family",meals:{breakfast:"b4",lunch:"l2",dinner:"d7"}},
};

function dayTotals(day) {
  return ["breakfast","lunch","dinner"].reduce((a,s)=>{
    const m=getMeal(s,day.meals[s]);
    return m?{cal:a.cal+m.cal,prot:a.prot+m.prot,cost:a.cost+m.cost}:a;
  },{cal:0,prot:0,cost:0});
}

function wCode(code, max) {
  if(code>=80)return{icon:"🌦️",label:"Showers",mood:"rainy"};
  if(code>=51)return{icon:"🌧️",label:"Rainy",mood:"rainy"};
  if(code===3) return{icon:"☁️",label:"Overcast",mood:max<10?"cold":"mild"};
  if(code<=2)  return{icon:"☀️",label:"Clear",mood:"warm"};
  return{icon:"⛅",label:"Cloudy",mood:"mild"};
}

// ── WEATHER HOOK ─────────────────────────────────────

function useWeather() {
  const [weather, setWeather] = useState(null);
  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=51.5074&longitude=-0.1278&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Europe/London&forecast_days=7")
      .then(r=>r.json())
      .then(d=>setWeather({days:DAYS.map((day,i)=>({day,code:d.daily.weathercode[i],max:Math.round(d.daily.temperature_2m_max[i]),min:Math.round(d.daily.temperature_2m_min[i]),rain:d.daily.precipitation_sum[i]}))}))
      .catch(()=>setWeather({days:DAYS.map((day,i)=>({day,code:[63,61,3,2,80,1,2][i],max:[9,8,11,12,10,13,14][i],min:[4,3,5,6,4,7,8][i],rain:[4.2,2.1,0,0,1.8,0,0][i]}))}));
  },[]);
  return weather;
}

// ── SHARED UI ─────────────────────────────────────────

function Chip({children,bg=C.bg,fg=C.muted,sm}) {
  return <span style={{display:"inline-flex",alignItems:"center",padding:sm?"2px 8px":"4px 12px",borderRadius:100,background:bg,color:fg,fontFamily:"'DM Sans',sans-serif",fontSize:sm?10:12,fontWeight:500,whiteSpace:"nowrap"}}>{children}</span>;
}

const SeaChip = () => <Chip bg={C.sage} fg={C.sageText} sm>🌿 Seasonal</Chip>;

// ── TODAY SCREEN ──────────────────────────────────────

function TodayScreen({week, setWeek, weather, onSwap}) {
  const [dayIdx, setDayIdx] = useState(TODAY_IDX);
  const dayKey = DAYS[dayIdx];
  const day = week[dayKey];
  const prof = PROFILES[day.profile];
  const totals = dayTotals(day);
  const wDay = weather?.days?.[dayIdx];
  const wx = wDay ? wCode(wDay.code, wDay.max) : null;
  const events = CAL_EVENTS[dayKey] || [];
  const slotBg = {breakfast:"#fef9e6",lunch:"#f0f7f0",dinner:"#f0edf8"};
  const slotIc = {breakfast:"🌅",lunch:"☀️",dinner:"🌙"};

  function setProf(p) { setWeek(w=>({...w,[dayKey]:{...w[dayKey],profile:p}})); }

  return (
    <div style={{flex:1,overflowY:"auto",padding:"0 0 80px"}}>
      {/* Header */}
      <div style={{background:C.forest,padding:"52px 20px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"rgba(250,248,244,0.5)",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>
              {SEA.e} {SEA.n} · {wx ? `${wx.icon} ${wDay?.max}°C` : "London"}
            </div>
            <div style={{fontFamily:"'Fraunces',serif",fontSize:32,color:C.cream,fontWeight:300,letterSpacing:"-0.02em"}}>
              {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"][dayIdx]}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
            <Chip bg="rgba(255,255,255,0.12)" fg={C.cream}>{prof.icon} {prof.label}</Chip>
            {wx && <Chip bg="rgba(255,255,255,0.08)" fg="rgba(250,248,244,0.6)" sm>{wx.label}</Chip>}
          </div>
        </div>

        {/* Day scroller */}
        <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
          {DAYS.map((d,i)=>{
            const wd=weather?.days?.[i];
            const wx2=wd?wCode(wd.code,wd.max):null;
            const isToday=i===TODAY_IDX;
            const isActive=i===dayIdx;
            return (
              <div key={d} onClick={()=>setDayIdx(i)} style={{flexShrink:0,textAlign:"center",padding:"8px 12px",borderRadius:12,background:isActive?"rgba(255,255,255,0.18)":"rgba(255,255,255,0.06)",border:`1.5px solid ${isActive?"rgba(255,255,255,0.3)":"transparent"}`,cursor:"pointer",transition:"all 0.15s",minWidth:52}}>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:isActive?C.cream:"rgba(250,248,244,0.4)",fontWeight:isActive?600:400,marginBottom:2}}>{d}</div>
                <div style={{fontSize:14}}>{wx2?.icon||"•"}</div>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:isActive?C.cream:"rgba(250,248,244,0.4)",marginTop:2}}>{wd?`${wd.max}°`:""}</div>
                {isToday&&<div style={{width:4,height:4,borderRadius:"50%",background:C.clay,margin:"3px auto 0"}}/>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Events */}
      {events.length>0&&(
        <div style={{padding:"12px 20px 0",display:"flex",gap:6,flexWrap:"wrap"}}>
          {events.map((ev,i)=>{
            const cols={work:{bg:"#ede9fe",fg:"#5b21b6"},office:{bg:"#dbeafe",fg:"#1d4ed8"},family:{bg:C.warn,fg:C.warnText},prep:{bg:C.sage,fg:C.sageText},personal:{bg:"#fce7f3",fg:"#9d174d"}};
            const c=cols[ev.type]||cols.work;
            return <Chip key={i} bg={c.bg} fg={c.fg} sm>📅 {ev.time} {ev.title}</Chip>;
          })}
        </div>
      )}

      {/* Profile switcher */}
      <div style={{padding:"12px 20px 0",display:"flex",gap:6}}>
        {Object.entries(PROFILES).map(([k,p])=>(
          <button key={k} onClick={()=>setProf(k)} style={{flex:1,padding:"8px 0",borderRadius:10,border:`1.5px solid`,borderColor:day.profile===k?C.forest:C.border,background:day.profile===k?C.forest:C.card,color:day.profile===k?C.cream:C.muted,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,cursor:"pointer",transition:"all 0.15s"}}>
            {p.icon} {p.label}
          </button>
        ))}
      </div>

      {/* Macro bar */}
      <div style={{margin:"14px 20px 0",background:C.card,borderRadius:14,padding:"14px 16px",border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
          {[
            {label:"Calories",val:totals.cal,max:prof.cal,unit:"kcal",color:"#f97316"},
            {label:"Protein", val:totals.prot,max:prof.prot,unit:"g",color:"#06b6d4"},
            {label:"Cost",    val:`£${totals.cost.toFixed(0)}`,color:"#22c55e"},
          ].map(m=>(
            <div key={m.label} style={{textAlign:"center"}}>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:20,color:C.ink,fontWeight:400}}>{m.val}{m.unit?<span style={{fontSize:11,color:C.muted}}>{m.unit}</span>:""}</div>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.muted}}>{m.label}</div>
            </div>
          ))}
        </div>
        {wx&&<div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.muted,textAlign:"center",paddingTop:8,borderTop:`1px solid ${C.border}`}}>
          {wx.mood==="cold"||wx.mood==="rainy"?"💡 Good day for something warming":"💡 Light and fresh works well today"}
        </div>}
      </div>

      {/* Meal cards */}
      <div style={{padding:"14px 20px 0",display:"flex",flexDirection:"column",gap:10}}>
        {["breakfast","lunch","dinner"].map(slot=>{
          const meal=getMeal(slot,day.meals[slot]);
          return (
            <div key={slot} style={{background:slotBg[slot],borderRadius:16,padding:"16px",border:`1px solid ${C.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em"}}>{slotIc[slot]} {slot}</div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  {meal&&isSeasonal(meal)&&<SeaChip/>}
                  <button onClick={()=>onSwap(dayKey,slot)} style={{background:C.forest,border:"none",borderRadius:8,padding:"5px 12px",color:C.cream,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,cursor:"pointer"}}>swap</button>
                </div>
              </div>
              {meal
                ?<>
                  <div style={{fontFamily:"'Fraunces',serif",fontSize:18,color:C.ink,fontWeight:400,lineHeight:1.3,marginBottom:8}}>{meal.name}</div>
                  <div style={{display:"flex",gap:12}}>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.muted}}>🔥 {meal.cal}kcal</span>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.muted}}>💪 {meal.prot}g</span>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.muted}}>⏱ {meal.time}m</span>
                  </div>
                </>
                :<div style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:C.border,fontStyle:"italic"}}>+ Add meal</div>
              }
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── SWAP SCREEN ───────────────────────────────────────

function SwapScreen({swapTarget, week, setWeek, weather, onDone}) {
  const [filter, setFilter] = useState("all");
  if (!swapTarget) return (
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40}}>
      <div style={{fontSize:40,marginBottom:16}}>🔄</div>
      <div style={{fontFamily:"'Fraunces',serif",fontSize:22,color:C.ink,marginBottom:8,textAlign:"center"}}>Nothing to swap</div>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:C.muted,textAlign:"center"}}>Tap "swap" on any meal in Today to change it</div>
    </div>
  );

  const {day, slot} = swapTarget;
  const wDay = weather?.days?.find(d=>d.day===day);
  const wx = wDay ? wCode(wDay.code, wDay.max) : null;
  const current = getMeal(slot, week[day].meals[slot]);
  const meals = ALL_MEALS.filter(m => m.slot === slot);

  const filters = [
    {id:"all",label:"All"},
    {id:"quick",label:"⚡ Quick"},
    {id:"seasonal",label:"🌿 Seasonal"},
    {id:"high-prot",label:"💪 High protein"},
    {id:"batch",label:"📦 Batchable"},
  ];

  const filtered = meals.filter(m => {
    if(filter==="all")return true;
    if(filter==="quick")return m.time<=15;
    if(filter==="seasonal")return isSeasonal(m);
    if(filter==="high-prot")return m.prot>=35;
    if(filter==="batch")return m.batch;
    return true;
  });

  function selectMeal(id) {
    setWeek(w=>({...w,[day]:{...w[day],meals:{...w[day].meals,[slot]:id}}}));
    onDone();
  }

  return (
    <div style={{flex:1,overflowY:"auto",padding:"0 0 80px"}}>
      {/* Header */}
      <div style={{background:C.forest,padding:"52px 20px 20px"}}>
        <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"rgba(250,248,244,0.5)",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>
          {day} · {slot}
        </div>
        <div style={{fontFamily:"'Fraunces',serif",fontSize:28,color:C.cream,fontWeight:300,marginBottom:8}}>Choose a {slot}</div>
        {current&&<div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"rgba(250,248,244,0.5)"}}>Currently: {current.name}</div>}
        {wx&&<div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"rgba(250,248,244,0.45)",marginTop:4}}>{wx.icon} {wDay?.max}°C · {wx.label}</div>}
      </div>

      {/* Filters */}
      <div style={{padding:"14px 20px",display:"flex",gap:8,overflowX:"auto"}}>
        {filters.map(f=>(
          <button key={f.id} onClick={()=>setFilter(f.id)} style={{flexShrink:0,padding:"8px 14px",borderRadius:100,border:"none",background:filter===f.id?C.forest:C.card,color:filter===f.id?C.cream:C.muted,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,cursor:"pointer",border:`1.5px solid ${filter===f.id?C.forest:C.border}`,transition:"all 0.15s"}}>{f.label}</button>
        ))}
      </div>

      {/* Meal options */}
      <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:10}}>
        {filtered.map(m=>{
          const isCurrent = m.id === week[day].meals[slot];
          return (
            <div key={m.id} onClick={()=>selectMeal(m.id)} style={{background:isCurrent?"#f0f7f0":C.card,border:`2px solid ${isCurrent?C.forest:C.border}`,borderRadius:16,padding:"16px",cursor:"pointer",transition:"all 0.15s",position:"relative"}}
              onTouchStart={e=>e.currentTarget.style.transform="scale(0.98)"}
              onTouchEnd={e=>e.currentTarget.style.transform=""}>
              {isCurrent&&<div style={{position:"absolute",top:12,right:12,background:C.forest,borderRadius:100,padding:"2px 10px",fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.cream,fontWeight:600}}>current</div>}
              <div style={{display:"flex",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                {isSeasonal(m)&&<SeaChip/>}
                {m.batch&&<Chip bg={C.forestLight} fg={C.forest} sm>📦 Batchable</Chip>}
                {m.time<=15&&<Chip bg={C.warn} fg={C.warnText} sm>⚡ Quick</Chip>}
              </div>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:18,color:C.ink,fontWeight:400,lineHeight:1.3,marginBottom:10}}>{m.name}</div>
              <div style={{display:"flex",gap:12,marginBottom:m.batchNote?8:0}}>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.muted}}>🔥 {m.cal}kcal</span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.muted}}>💪 {m.prot}g</span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.muted}}>⏱ {m.time}m</span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.muted}}>£{m.cost.toFixed(2)}</span>
              </div>
              {m.batchNote&&<div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.forest,background:C.forestLight,borderRadius:8,padding:"5px 10px"}}>{m.batchNote}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── SHOP SCREEN ───────────────────────────────────────

function ShopScreen({week}) {
  const [checked, setChecked] = useState({});
  const [aisleFilter, setAisleFilter] = useState("all");

  const AISLES = {
    protein:   {label:"Meat & Fish",icon:"🥩",order:1},
    dairy:     {label:"Dairy",icon:"🥛",order:2},
    produce:   {label:"Fresh Produce",icon:"🥦",order:3},
    grains:    {label:"Grains & Pasta",icon:"🌾",order:4},
    tins:      {label:"Tins & Pulses",icon:"🥫",order:5},
    condiments:{label:"Oils & Sauces",icon:"🫙",order:6},
    bakery:    {label:"Bakery",icon:"🍞",order:7},
    storecup:  {label:"Store Cupboard",icon:"📦",order:8},
  };

  const raw = {};
  DAYS.forEach(d=>["breakfast","lunch","dinner"].forEach(slot=>{
    const meal=getMeal(slot,week[d].meals[slot]);
    if(!meal)return;
    (meal.ings||[]).forEach(ing=>{
      const key=ing.name.toLowerCase();
      if(!raw[key])raw[key]={...ing,count:0,meals:[]};
      raw[key].count++;
      if(!raw[key].meals.includes(meal.name))raw[key].meals.push(meal.name);
    });
  }));

  const byAisle = {};
  Object.values(raw).forEach(item=>{
    const a=item.aisle||"storecup";
    if(!byAisle[a])byAisle[a]=[];
    byAisle[a].push(item);
  });

  const sorted = Object.entries(byAisle).sort((a,b)=>(AISLES[a[0]]?.order||99)-(AISLES[b[0]]?.order||99));
  const allItems = Object.values(byAisle).flat();
  const doneCount = allItems.filter(i=>checked[i.name]).length;
  const totalCount = allItems.length;

  const aislesWithItems = sorted.map(([key])=>key);
  const displaySorted = aisleFilter==="all" ? sorted : sorted.filter(([k])=>k===aisleFilter);

  return (
    <div style={{flex:1,overflowY:"auto",padding:"0 0 80px"}}>
      {/* Header */}
      <div style={{background:C.forest,padding:"52px 20px 20px"}}>
        <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"rgba(250,248,244,0.5)",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>Shopping list</div>
        <div style={{fontFamily:"'Fraunces',serif",fontSize:32,color:C.cream,fontWeight:300,marginBottom:12}}>This week</div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{flex:1,background:"rgba(255,255,255,0.1)",borderRadius:100,height:6,overflow:"hidden"}}>
            <div style={{width:`${totalCount>0?(doneCount/totalCount)*100:0}%`,background:C.cream,height:"100%",borderRadius:100,transition:"width 0.3s"}}/>
          </div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"rgba(250,248,244,0.6)",whiteSpace:"nowrap"}}>{doneCount} / {totalCount}</div>
        </div>
      </div>

      {/* Aisle filter */}
      <div style={{padding:"12px 16px",display:"flex",gap:7,overflowX:"auto"}}>
        <button onClick={()=>setAisleFilter("all")} style={{flexShrink:0,padding:"7px 14px",borderRadius:100,border:`1.5px solid ${aisleFilter==="all"?C.forest:C.border}`,background:aisleFilter==="all"?C.forest:C.card,color:aisleFilter==="all"?C.cream:C.muted,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,cursor:"pointer"}}>All</button>
        {aislesWithItems.map(key=>{
          const ai=AISLES[key];
          return <button key={key} onClick={()=>setAisleFilter(key)} style={{flexShrink:0,padding:"7px 14px",borderRadius:100,border:`1.5px solid ${aisleFilter===key?C.forest:C.border}`,background:aisleFilter===key?C.forest:C.card,color:aisleFilter===key?C.cream:C.muted,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,cursor:"pointer"}}>{ai?.icon} {ai?.label}</button>;
        })}
      </div>

      {/* Items */}
      <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:10}}>
        {displaySorted.map(([aisle,items])=>{
          const ai=AISLES[aisle]||{label:aisle,icon:"📦"};
          const aisleItems = aisleFilter==="all" ? items : items;
          const aisleChecked=aisleItems.filter(i=>checked[i.name]).length;
          return (
            <div key={aisle} style={{background:C.card,borderRadius:16,overflow:"hidden",border:`1px solid ${C.border}`}}>
              <div style={{padding:"12px 16px",background:"#faf8f4",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:18}}>{ai.icon}</span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:C.ink,fontSize:14,flex:1}}>{ai.label}</span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.muted}}>{aisleChecked}/{aisleItems.length}</span>
              </div>
              {aisleItems.map((item,ii)=>{
                const done=checked[item.name];
                return (
                  <div key={item.name} onClick={()=>setChecked(c=>({...c,[item.name]:!c[item.name]}))}
                    style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderBottom:ii<aisleItems.length-1?`1px solid ${C.border}`:"none",background:done?"#f8fdf8":"transparent",transition:"background 0.15s",cursor:"pointer",minHeight:60}}>
                    <div style={{width:24,height:24,borderRadius:7,border:`2px solid ${done?C.forest:C.border}`,background:done?C.forest:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}>
                      {done&&<span style={{color:"#fff",fontSize:12,fontWeight:700}}>✓</span>}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:500,color:done?"#94a3b8":C.ink,fontSize:15,textDecoration:done?"line-through":"none",marginBottom:2}}>{item.name}</div>
                      <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                        <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.muted}}>{item.qty}</span>
                        {item.count>1&&<Chip bg={C.bg} fg={C.muted} sm>×{item.count} this week</Chip>}
                        {item.seasonal&&<SeaChip/>}
                        {item.staple&&<Chip bg={C.goldLight} fg={C.gold} sm>pantry staple</Chip>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Done banner */}
      {doneCount===totalCount&&totalCount>0&&(
        <div style={{margin:"16px",background:C.forest,borderRadius:16,padding:"20px",textAlign:"center"}}>
          <div style={{fontSize:28,marginBottom:8}}>🎉</div>
          <div style={{fontFamily:"'Fraunces',serif",fontSize:20,color:C.cream,marginBottom:4}}>All done</div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"rgba(250,248,244,0.6)"}}>You've got everything for the week</div>
        </div>
      )}
    </div>
  );
}

// ── COOK SCREEN ───────────────────────────────────────

function CookScreen({week, weather}) {
  const [dayIdx, setDayIdx] = useState(TODAY_IDX);
  const [activeSlot, setActiveSlot] = useState("dinner");
  const [step, setStep] = useState(0);
  const dayKey = DAYS[dayIdx];
  const day = week[dayKey];
  const meal = getMeal(activeSlot, day.meals[activeSlot]);
  const wDay = weather?.days?.[dayIdx];
  const wx = wDay ? wCode(wDay.code, wDay.max) : null;

  const slotIc = {breakfast:"🌅",lunch:"☀️",dinner:"🌙"};

  return (
    <div style={{flex:1,overflowY:"auto",padding:"0 0 80px"}}>
      {/* Header */}
      <div style={{background:C.forest,padding:"52px 20px 20px"}}>
        <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"rgba(250,248,244,0.5)",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>
          {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"][dayIdx]}
          {wx&&` · ${wx.icon} ${wDay?.max}°C`}
        </div>
        <div style={{fontFamily:"'Fraunces',serif",fontSize:28,color:C.cream,fontWeight:300,marginBottom:16}}>What am I cooking?</div>

        {/* Day selector */}
        <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:16}}>
          {DAYS.map((d,i)=>(
            <button key={d} onClick={()=>{setDayIdx(i);setStep(0);}} style={{flexShrink:0,padding:"6px 12px",borderRadius:100,border:"none",background:dayIdx===i?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.06)",color:dayIdx===i?C.cream:"rgba(250,248,244,0.4)",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:dayIdx===i?600:400,cursor:"pointer"}}>{d}</button>
          ))}
        </div>

        {/* Slot selector */}
        <div style={{display:"flex",gap:8}}>
          {["breakfast","lunch","dinner"].map(s=>{
            const m=getMeal(s,day.meals[s]);
            return (
              <button key={s} onClick={()=>{setActiveSlot(s);setStep(0);}} style={{flex:1,padding:"10px 8px",borderRadius:12,border:`1.5px solid`,borderColor:activeSlot===s?"rgba(255,255,255,0.4)":"rgba(255,255,255,0.1)",background:activeSlot===s?"rgba(255,255,255,0.15)":"transparent",cursor:"pointer",textAlign:"center"}}>
                <div style={{fontSize:16,marginBottom:2}}>{slotIc[s]}</div>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:activeSlot===s?C.cream:"rgba(250,248,244,0.4)",fontWeight:500,marginBottom:2}}>{s}</div>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:"rgba(250,248,244,0.35)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m?.name.split(" ").slice(0,2).join(" ")||"—"}</div>
              </button>
            );
          })}
        </div>
      </div>

      {meal ? (
        <div style={{padding:"16px 16px 0"}}>
          {/* Meal info */}
          <div style={{background:C.card,borderRadius:16,padding:"18px",marginBottom:14,border:`1px solid ${C.border}`}}>
            <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
              {isSeasonal(meal)&&<SeaChip/>}
              {meal.batch&&<Chip bg={C.forestLight} fg={C.forest} sm>📦 Batchable</Chip>}
            </div>
            <div style={{fontFamily:"'Fraunces',serif",fontSize:22,color:C.ink,fontWeight:400,lineHeight:1.3,marginBottom:10}}>{meal.name}</div>
            <div style={{display:"flex",gap:14,marginBottom:meal.batchNote?10:0}}>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.muted}}>⏱ {meal.time} min total</span>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.muted}}>🔥 {meal.cal} kcal</span>
            </div>
            {meal.batchNote&&<div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.forest,background:C.forestLight,borderRadius:8,padding:"6px 10px"}}>{meal.batchNote}</div>}
          </div>

          {/* Ingredients */}
          <div style={{background:C.card,borderRadius:16,padding:"16px",marginBottom:14,border:`1px solid ${C.border}`}}>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:C.ink,fontSize:13,marginBottom:12}}>You'll need</div>
            {(meal.ings||[]).map((ing,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",paddingBottom:8,marginBottom:8,borderBottom:i<meal.ings.length-1?`1px solid ${C.border}`:"none"}}>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:C.ink}}>{ing.name}</span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.muted}}>{ing.qty}</span>
              </div>
            ))}
          </div>

          {/* Step by step */}
          {meal.steps&&meal.steps.length>0&&(
            <div style={{background:C.card,borderRadius:16,padding:"16px",border:`1px solid ${C.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:C.ink,fontSize:13}}>Step by step</div>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.muted}}>{step+1} / {meal.steps.length}</div>
              </div>

              {/* Progress dots */}
              <div style={{display:"flex",gap:6,marginBottom:16}}>
                {meal.steps.map((_,i)=>(
                  <div key={i} onClick={()=>setStep(i)} style={{flex:1,height:4,borderRadius:2,background:i<=step?C.forest:C.border,cursor:"pointer",transition:"background 0.2s"}}/>
                ))}
              </div>

              {/* Current step */}
              <div style={{background:C.forestLight,borderRadius:12,padding:"20px",marginBottom:14,minHeight:80,display:"flex",alignItems:"center"}}>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:20,color:C.forest,fontWeight:400,lineHeight:1.4}}>{meal.steps[step]}</div>
              </div>

              {/* Navigation */}
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0} style={{flex:1,padding:"14px",borderRadius:12,border:`1.5px solid ${C.border}`,background:step===0?"#f0ebe3":C.card,color:step===0?C.border:C.ink,fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:500,cursor:step===0?"not-allowed":"pointer"}}>← Back</button>
                {step<meal.steps.length-1
                  ?<button onClick={()=>setStep(s=>s+1)} style={{flex:2,padding:"14px",borderRadius:12,border:"none",background:C.forest,color:C.cream,fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,cursor:"pointer"}}>Next step →</button>
                  :<button style={{flex:2,padding:"14px",borderRadius:12,border:"none",background:C.clay,color:C.cream,fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,cursor:"pointer"}}>Done 🎉</button>
                }
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{padding:32,textAlign:"center"}}>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:C.muted}}>No meal planned for {activeSlot}</div>
        </div>
      )}
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────

export default function App() {
  const [week, setWeek] = useState(DEFAULT_WEEK);
  const [tab, setTab] = useState("today");
  const [swapTarget, setSwapTarget] = useState(null);
  const weather = useWeather();

  function handleSwap(day, slot) {
    setSwapTarget({day, slot});
    setTab("swap");
  }

  function handleSwapDone() {
    setSwapTarget(null);
    setTab("today");
  }

  const tabs = [
    {id:"today", icon:"☀️", label:"Today"},
    {id:"swap",  icon:"🔄", label:"Swap"},
    {id:"shop",  icon:"🛒", label:"Shop"},
    {id:"cook",  icon:"🍳", label:"Cook"},
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100vh",maxWidth:430,margin:"0 auto",background:C.bg,position:"relative",overflow:"hidden"}}>
      <style>{FONTS}</style>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{display:none}
        body{background:#1a1714}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
      `}</style>

      {/* Screen content */}
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>
        {tab==="today" && <TodayScreen week={week} setWeek={setWeek} weather={weather} onSwap={handleSwap}/>}
        {tab==="swap"  && <SwapScreen swapTarget={swapTarget} week={week} setWeek={setWeek} weather={weather} onDone={handleSwapDone}/>}
        {tab==="shop"  && <ShopScreen week={week}/>}
        {tab==="cook"  && <CookScreen week={week} weather={weather}/>}
      </div>

      {/* Bottom nav */}
      <div style={{background:C.navBg,padding:"10px 0 calc(10px + env(safe-area-inset-bottom))",display:"flex",borderTop:"1px solid rgba(255,255,255,0.06)",flexShrink:0}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"4px 0",background:"none",border:"none",cursor:"pointer",transition:"all 0.15s"}}>
            <div style={{fontSize:20,opacity:tab===t.id?1:0.35,transition:"opacity 0.15s"}}>{t.icon}</div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:tab===t.id?600:400,color:tab===t.id?C.cream:"rgba(250,248,244,0.35)",letterSpacing:"0.03em",transition:"all 0.15s"}}>{t.label}</div>
            {tab===t.id&&<div style={{width:4,height:4,borderRadius:"50%",background:C.clay}}/>}
          </button>
        ))}
      </div>
    </div>
  );
}
