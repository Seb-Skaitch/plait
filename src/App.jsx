import { useState, useEffect, useRef } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');`;

const C = {
  bg:"#f5f2ec", card:"#fff", ink:"#1c1a16", forest:"#2a4a35",
  forestLight:"#e6f0ea", clay:"#c4622d", gold:"#b89a4a",
  muted:"#7a7060", border:"#e4ddd2", cream:"#faf8f4",
  sky:"#dbeafe", skyText:"#1d4ed8", sage:"#d1e8d8", sageText:"#2a4a35",
  warn:"#fef3c7", warnText:"#92400e",
};

const MONTH = new Date().getMonth() + 1;
const SEA = ({
  1:{n:"January",e:"❄️",p:["leeks","kale","parsnips","celeriac","blood orange","cavolo nero"]},
  2:{n:"February",e:"🌨️",p:["purple sprouting broccoli","leeks","kale","forced rhubarb"]},
  3:{n:"March",e:"🌱",p:["purple sprouting broccoli","spring greens","radishes","watercress"]},
  4:{n:"April",e:"🌸",p:["asparagus","spring onions","spinach","jersey royals"]},
  5:{n:"May",e:"☀️",p:["asparagus","broad beans","peas","new potatoes"]},
  6:{n:"June",e:"🌻",p:["strawberries","courgettes","fennel","new potatoes"]},
  7:{n:"July",e:"🏖️",p:["tomatoes","courgettes","runner beans","sweetcorn"]},
  8:{n:"August",e:"🌞",p:["tomatoes","sweetcorn","aubergine","peppers"]},
  9:{n:"September",e:"🍂",p:["butternut squash","wild mushrooms","blackberries"]},
  10:{n:"October",e:"🎃",p:["pumpkin","celeriac","wild mushrooms","chestnuts"]},
  11:{n:"November",e:"🍁",p:["parsnips","swede","brussels sprouts","venison"]},
  12:{n:"December",e:"⛄",p:["turkey","parsnips","brussels sprouts","clementines"]},
})[MONTH] || {n:"Winter",e:"❄️",p:["leeks","kale","parsnips","celeriac"]};

const RETAILERS = {
  tesco:{name:"Tesco",logo:"🔵",mod:1.00},
  sainsburys:{name:"Sainsbury's",logo:"🟠",mod:1.12},
  waitrose:{name:"Waitrose",logo:"⚫",mod:1.35},
  aldi:{name:"Aldi",logo:"🔴",mod:0.72},
  ocado:{name:"Ocado",logo:"🟣",mod:1.18},
};

const AISLES = {
  protein:{label:"Meat & Fish",icon:"🥩",order:1},
  dairy:{label:"Dairy",icon:"🥛",order:2},
  produce:{label:"Fresh Produce",icon:"🥦",order:3},
  grains:{label:"Grains & Pasta",icon:"🌾",order:4},
  tins:{label:"Tins & Pulses",icon:"🥫",order:5},
  condiments:{label:"Oils & Sauces",icon:"🫙",order:6},
  bakery:{label:"Bakery",icon:"🍞",order:7},
  storecup:{label:"Store Cupboard",icon:"📦",order:8},
};

const ALL_MEALS = [
  {id:"b1",slot:"breakfast",name:"Greek yoghurt, honey & walnuts",cal:280,prot:22,cost:2.8,time:5,tags:["quick"],seasonal:[],weather:["any"],
   ings:[{name:"Greek yoghurt",qty:"200g",aisle:"dairy"},{name:"Runny honey",qty:"1 tbsp",aisle:"condiments",staple:true},{name:"Walnuts",qty:"30g",aisle:"storecup"}]},
  {id:"b2",slot:"breakfast",name:"Smoked salmon & rye toast",cal:380,prot:32,cost:4.8,time:8,tags:["quick","high-prot"],seasonal:[],weather:["any"],
   ings:[{name:"Smoked salmon",qty:"100g",aisle:"protein"},{name:"Rye bread",qty:"2 slices",aisle:"bakery"},{name:"Cream cheese",qty:"2 tbsp",aisle:"dairy"}]},
  {id:"b3",slot:"breakfast",name:"Bircher muesli & seasonal fruit",cal:360,prot:14,cost:2.0,time:5,tags:["prep-ahead","family"],seasonal:[],weather:["any"],batch:true,batchNote:"Make a big batch Sunday night — lasts 4 days in the fridge",
   ings:[{name:"Rolled oats",qty:"80g",aisle:"grains"},{name:"Apple juice",qty:"150ml",aisle:"tins"},{name:"Natural yoghurt",qty:"100g",aisle:"dairy"},{name:"Mixed berries",qty:"80g",aisle:"produce"}]},
  {id:"b4",slot:"breakfast",name:"Porridge, banana & almond butter",cal:420,prot:18,cost:1.6,time:8,tags:["warming","family"],seasonal:[],weather:["cold","rainy"],
   ings:[{name:"Porridge oats",qty:"80g",aisle:"grains"},{name:"Whole milk",qty:"200ml",aisle:"dairy"},{name:"Banana",qty:"1",aisle:"produce"},{name:"Almond butter",qty:"1 tbsp",aisle:"condiments",staple:true}]},
  {id:"b5",slot:"breakfast",name:"Protein smoothie bowl",cal:310,prot:35,cost:3.2,time:8,tags:["quick","high-prot"],seasonal:[],weather:["mild","warm"],
   ings:[{name:"Protein powder",qty:"30g",aisle:"storecup"},{name:"Frozen berries",qty:"100g",aisle:"produce"},{name:"Banana",qty:"1",aisle:"produce"},{name:"Almond milk",qty:"150ml",aisle:"dairy"}]},
  {id:"l1",slot:"lunch",name:"Chicken & tabbouleh jar",cal:480,prot:42,cost:6.5,time:20,tags:["meal-prep","office"],seasonal:[],weather:["any"],batch:true,batchNote:"Prep 3 portions Sunday — keeps 4 days refrigerated",
   ings:[{name:"Chicken breast",qty:"150g",aisle:"protein"},{name:"Bulgur wheat",qty:"80g",aisle:"grains"},{name:"Flat-leaf parsley",qty:"1 bunch",aisle:"produce"},{name:"Cherry tomatoes",qty:"100g",aisle:"produce"},{name:"Lemon",qty:"1",aisle:"produce"}]},
  {id:"l2",slot:"lunch",name:"Roasted celeriac & lentil soup",cal:380,prot:22,cost:3.5,time:40,tags:["batch","warming"],seasonal:["celeriac"],weather:["cold","rainy"],batch:true,batchNote:"Big pot Sunday — 4 portions, freezes well",
   ings:[{name:"Celeriac",qty:"1 medium",aisle:"produce",seasonal:true},{name:"Red lentils",qty:"150g",aisle:"tins"},{name:"Vegetable stock",qty:"800ml",aisle:"storecup",staple:true},{name:"Onion",qty:"1",aisle:"produce"}]},
  {id:"l3",slot:"lunch",name:"Tuna Niçoise",cal:420,prot:38,cost:5.5,time:10,tags:["no-cook","quick"],seasonal:[],weather:["any"],
   ings:[{name:"Tuna in olive oil",qty:"2 tins",aisle:"tins"},{name:"Green beans",qty:"100g",aisle:"produce"},{name:"Olives",qty:"50g",aisle:"condiments",staple:true},{name:"Cherry tomatoes",qty:"100g",aisle:"produce"}]},
  {id:"l4",slot:"lunch",name:"Kale & cavolo nero caesar",cal:380,prot:28,cost:5.0,time:12,tags:["seasonal"],seasonal:["kale","cavolo nero"],weather:["any"],
   ings:[{name:"Kale",qty:"100g",aisle:"produce",seasonal:true},{name:"Cavolo nero",qty:"80g",aisle:"produce",seasonal:true},{name:"Parmesan",qty:"30g",aisle:"dairy"},{name:"Caesar dressing",qty:"3 tbsp",aisle:"condiments"},{name:"Chicken breast",qty:"120g",aisle:"protein"}]},
  {id:"l5",slot:"lunch",name:"Warm mezze & flatbread",cal:520,prot:24,cost:6.2,time:15,tags:["relaxed","family"],seasonal:[],weather:["any"],
   ings:[{name:"Hummus",qty:"200g",aisle:"tins"},{name:"Flatbreads",qty:"2",aisle:"bakery"},{name:"Feta",qty:"80g",aisle:"dairy"},{name:"Roasted peppers",qty:"100g",aisle:"tins"},{name:"Cucumber",qty:"half",aisle:"produce"}]},
  {id:"l6",slot:"lunch",name:"Leftover wrap",cal:450,prot:38,cost:1.5,time:5,tags:["quick","office"],seasonal:[],weather:["any"],
   ings:[{name:"Wholemeal wrap",qty:"1",aisle:"bakery"},{name:"Leftover protein",qty:"150g",aisle:"protein"},{name:"Spinach",qty:"40g",aisle:"produce"}]},
  {id:"d1",slot:"dinner",name:"Baked sea bass, capers & lemon",cal:520,prot:48,cost:12.0,time:25,tags:["quick","elegant"],seasonal:[],weather:["any"],
   ings:[{name:"Sea bass fillets",qty:"2",aisle:"protein"},{name:"Capers",qty:"2 tbsp",aisle:"condiments",staple:true},{name:"Lemon",qty:"1",aisle:"produce"},{name:"Cherry tomatoes",qty:"150g",aisle:"produce"}]},
  {id:"d2",slot:"dinner",name:"Slow-cooked lamb shoulder",cal:680,prot:56,cost:16.0,time:240,tags:["weekend","family"],seasonal:[],weather:["cold","rainy"],batch:true,batchNote:"One large shoulder — leftovers become wraps for 2 days",
   ings:[{name:"Lamb shoulder",qty:"1.5kg",aisle:"protein"},{name:"Garlic",qty:"6 cloves",aisle:"produce",staple:true},{name:"Rosemary",qty:"3 sprigs",aisle:"produce"},{name:"Tinned tomatoes",qty:"400g",aisle:"tins"},{name:"Onion",qty:"2",aisle:"produce"}]},
  {id:"d3",slot:"dinner",name:"Turkey meatballs & courgetti",cal:490,prot:52,cost:8.5,time:30,tags:["quick","high-prot"],seasonal:[],weather:["any"],batch:true,batchNote:"Double the batch — freeze half for next week",
   ings:[{name:"Turkey mince",qty:"400g",aisle:"protein"},{name:"Courgette",qty:"2",aisle:"produce"},{name:"Tinned tomatoes",qty:"400g",aisle:"tins"},{name:"Garlic",qty:"3 cloves",aisle:"produce",staple:true},{name:"Parmesan",qty:"30g",aisle:"dairy"}]},
  {id:"d4",slot:"dinner",name:"Grilled chicken souvlaki",cal:560,prot:55,cost:9.0,time:25,tags:["family","high-prot"],seasonal:[],weather:["any"],batch:true,batchNote:"Marinate overnight — much better flavour",
   ings:[{name:"Chicken thighs",qty:"600g",aisle:"protein"},{name:"Greek yoghurt",qty:"200g",aisle:"dairy"},{name:"Cucumber",qty:"half",aisle:"produce"},{name:"Pittas",qty:"4",aisle:"bakery"},{name:"Lemon",qty:"1",aisle:"produce"}]},
  {id:"d5",slot:"dinner",name:"Moroccan chickpea & parsnip tagine",cal:440,prot:24,cost:6.0,time:45,tags:["veggie","warming","family"],seasonal:["parsnips"],weather:["cold","rainy"],batch:true,batchNote:"Tastes better next day — make Sunday, reheat Monday",
   ings:[{name:"Parsnips",qty:"400g",aisle:"produce",seasonal:true},{name:"Chickpeas",qty:"400g",aisle:"tins"},{name:"Tinned tomatoes",qty:"400g",aisle:"tins"},{name:"Ras el hanout",qty:"2 tsp",aisle:"condiments",staple:true},{name:"Couscous",qty:"200g",aisle:"grains"},{name:"Onion",qty:"1",aisle:"produce"}]},
  {id:"d6",slot:"dinner",name:"Seared salmon, miso broth & kale",cal:510,prot:46,cost:11.0,time:20,tags:["quick","elegant"],seasonal:["kale"],weather:["cold","rainy"],
   ings:[{name:"Salmon fillets",qty:"2",aisle:"protein"},{name:"Kale",qty:"100g",aisle:"produce",seasonal:true},{name:"White miso paste",qty:"2 tbsp",aisle:"condiments"},{name:"Ginger",qty:"1 thumb",aisle:"produce"},{name:"Soy sauce",qty:"1 tbsp",aisle:"condiments",staple:true}]},
  {id:"d7",slot:"dinner",name:"Pork tenderloin & roasted celeriac",cal:600,prot:52,cost:10.0,time:40,tags:["weekend","family"],seasonal:["celeriac"],weather:["cold","rainy"],
   ings:[{name:"Pork tenderloin",qty:"600g",aisle:"protein"},{name:"Celeriac",qty:"1 medium",aisle:"produce",seasonal:true},{name:"Dijon mustard",qty:"2 tbsp",aisle:"condiments",staple:true},{name:"Thyme",qty:"3 sprigs",aisle:"produce"}]},
  {id:"d8",slot:"dinner",name:"Blood orange & fennel roasted chicken",cal:580,prot:54,cost:11.5,time:70,tags:["weekend","family"],seasonal:["blood orange"],weather:["cold"],batch:true,batchNote:"Roast a large bird — cold leftovers tomorrow, stock from carcass",
   ings:[{name:"Whole chicken",qty:"1.6kg",aisle:"protein"},{name:"Fennel bulb",qty:"2",aisle:"produce"},{name:"Blood oranges",qty:"2",aisle:"produce",seasonal:true},{name:"Garlic",qty:"4 cloves",aisle:"produce",staple:true}]},
];

const getMeal = (slot,id) => ALL_MEALS.find(m=>m.slot===slot&&m.id===id);
const isSeasonal = m => m?.seasonal?.some(s=>SEA.p.includes(s));

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const DAY_LABELS = {Mon:"Monday",Tue:"Tuesday",Wed:"Wednesday",Thu:"Thursday",Fri:"Friday",Sat:"Saturday",Sun:"Sunday"};

const PROFILES = {
  solo:  {label:"Solo",  icon:"🧑", cal:2000,prot:170,budget:14,bg:"#e6f0ea",fg:"#2a4a35"},
  office:{label:"Office",icon:"🏢", cal:1800,prot:150,budget:12,bg:"#ede9fe",fg:"#5b21b6"},
  family:{label:"Family",icon:"👨‍👧", cal:3200,prot:220,budget:24,bg:"#fef3c7",fg:"#92400e"},
};

const CAL_EVENTS = {
  Mon:[{time:"09:00",title:"Team standup",type:"work"},{time:"19:00",title:"Late call",type:"work"}],
  Tue:[{time:"08:30",title:"Office day",type:"office"}],
  Wed:[{time:"18:00",title:"Gym",type:"personal"}],
  Thu:[{time:"16:00",title:"Kids home",type:"family"}],
  Fri:[{time:"16:00",title:"Kids home",type:"family"}],
  Sat:[{time:"10:00",title:"Kids football",type:"family"}],
  Sun:[{time:"14:00",title:"Batch cook",type:"prep"}],
};

const DEFAULT_WEEK = {
  Mon:{profile:"office",meals:{breakfast:"b2",lunch:"l1",dinner:"d3"}},
  Tue:{profile:"office",meals:{breakfast:"b4",lunch:"l1",dinner:"d6"}},
  Wed:{profile:"solo",  meals:{breakfast:"b1",lunch:"l3",dinner:"d3"}},
  Thu:{profile:"family",meals:{breakfast:"b4",lunch:"l5",dinner:"d4"}},
  Fri:{profile:"family",meals:{breakfast:"b3",lunch:"l5",dinner:"d5"}},
  Sat:{profile:"family",meals:{breakfast:"b3",lunch:"l2",dinner:"d2"}},
  Sun:{profile:"family",meals:{breakfast:"b4",lunch:"l2",dinner:"d7"}},
};

function dayTotals(day) {
  return ["breakfast","lunch","dinner"].reduce((a,s)=>{
    const m=getMeal(s,day.meals[s]);
    return m?{cal:a.cal+m.cal,prot:a.prot+m.prot,cost:a.cost+m.cost}:a;
  },{cal:0,prot:0,cost:0});
}
function weekTotals(week) {
  return DAYS.reduce((a,d)=>{const t=dayTotals(week[d]);return{cal:a.cal+t.cal,prot:a.prot+t.prot,cost:a.cost+t.cost}},{cal:0,prot:0,cost:0});
}
function wCode(code,max) {
  if(code>=80)return{icon:"🌦️",label:"Showers",mood:"rainy"};
  if(code>=51)return{icon:"🌧️",label:"Rainy",mood:"rainy"};
  if(code===3) return{icon:"☁️",label:"Overcast",mood:max<10?"cold":"mild"};
  if(code<=2)  return{icon:"☀️",label:"Clear",mood:"warm"};
  return{icon:"⛅",label:"Cloudy",mood:"mild"};
}

// ─── SHARED UI ────────────────────────────────────────────────
function Chip({children,bg=C.bg,fg=C.muted,xs}) {
  return <span style={{display:"inline-flex",alignItems:"center",padding:xs?"2px 7px":"4px 10px",borderRadius:100,background:bg,color:fg,fontFamily:"'DM Sans',sans-serif",fontSize:xs?10:11,fontWeight:500,whiteSpace:"nowrap"}}>{children}</span>;
}
function Bar({val,max,color="#22c55e"}) {
  const p=Math.min(100,(val/max)*100);
  return <div style={{background:"#ede8e0",borderRadius:4,height:5,overflow:"hidden"}}><div style={{width:`${p}%`,background:p>100?"#ef4444":color,height:"100%",borderRadius:4,transition:"width 0.4s"}}/></div>;
}
const SeaChip=()=><Chip bg={C.sage} fg={C.sageText} xs>🌿 Seasonal</Chip>;

// ─── SWAP MODAL ───────────────────────────────────────────────
function SwapModal({slot,onSelect,onClose}) {
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(28,26,20,0.55)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.card,borderRadius:20,padding:24,width:450,maxHeight:"80vh",overflowY:"auto",boxShadow:"0 40px 80px rgba(0,0,0,0.3)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h3 style={{fontFamily:"'Lora',serif",fontSize:20,color:C.ink,fontWeight:400}}>Choose {slot}</h3>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:C.muted}}>✕</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {ALL_MEALS.filter(m=>m.slot===slot).map(m=>(
            <div key={m.id} onClick={()=>{onSelect(m.id);onClose();}}
              style={{border:`1.5px solid ${C.border}`,borderRadius:12,padding:"12px 14px",cursor:"pointer",transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.forest;e.currentTarget.style.transform="translateX(3px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="";}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:C.ink,fontSize:13}}>{m.name}</div>
                {isSeasonal(m)&&<SeaChip/>}
              </div>
              <div style={{display:"flex",gap:10,marginBottom:5}}>
                {[["🔥",m.cal+"kcal"],["💪",m.prot+"g"],["⏱",m.time+"m"],["£",m.cost.toFixed(2)]].map(([ic,v])=>(
                  <span key={ic} style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.muted}}>{ic} {v}</span>
                ))}
              </div>
              {m.batchNote&&<div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.forest,background:C.forestLight,borderRadius:6,padding:"3px 8px"}}>📦 {m.batchNote.split("—")[0].trim()}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PLAN TAB ─────────────────────────────────────────────────
function PlanTab({week,setWeek,weather}) {
  const [activeDay,setActiveDay]=useState("Mon");
  const [swap,setSwap]=useState(null);
  const day=week[activeDay];
  const prof=PROFILES[day.profile];
  const nut=dayTotals(day);
  const wDay=weather?.days?.find(d=>d.day===activeDay);
  const wx=wDay?wCode(wDay.code,wDay.max):null;
  const events=CAL_EVENTS[activeDay]||[];
  const evColors={work:{bg:"#ede9fe",fg:"#5b21b6"},office:{bg:C.sky,fg:C.skyText},family:{bg:C.warn,fg:C.warnText},prep:{bg:C.sage,fg:C.sageText},personal:{bg:"#fce7f3",fg:"#9d174d"}};
  const slotBg={breakfast:"#fef9e6",lunch:"#f0f7f0",dinner:"#f0edf8"};
  const slotIc={breakfast:"🌅",lunch:"☀️",dinner:"🌙"};

  function setMeal(d,slot,id){setWeek(w=>({...w,[d]:{...w[d],meals:{...w[d].meals,[slot]:id}}}))}
  function setProf(d,p){setWeek(w=>({...w,[d]:{...w[d],profile:p}}))}

  return (
    <div style={{display:"flex",height:"100%",overflow:"hidden"}}>
      {/* Day list */}
      <div style={{width:168,borderRight:`1px solid ${C.border}`,overflowY:"auto",flexShrink:0}}>
        {DAYS.map(d=>{
          const t=dayTotals(week[d]);
          const wd=weather?.days?.find(x=>x.day===d);
          const wx2=wd?wCode(wd.code,wd.max):null;
          const isA=d===activeDay;
          return (
            <div key={d} onClick={()=>setActiveDay(d)} style={{padding:"10px 13px",cursor:"pointer",borderBottom:`1px solid ${C.border}`,borderLeft:`3px solid ${isA?C.forest:"transparent"}`,background:isA?C.forestLight:"transparent",transition:"all 0.15s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontWeight:isA?600:400,fontSize:14,color:isA?C.forest:C.ink}}>{d}</span>
                <div style={{display:"flex",gap:3}}>
                  {(CAL_EVENTS[d]||[]).some(e=>e.type==="family")&&<span style={{fontSize:10}}>👧</span>}
                  {wx2&&<span style={{fontSize:11}}>{wx2.icon}</span>}
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:11,color:C.muted}}>{PROFILES[week[d].profile].label}</span>
                <span style={{fontSize:11,color:C.muted}}>£{t.cost.toFixed(0)}</span>
              </div>
              {wd&&<div style={{fontSize:10,color:C.muted,marginTop:1}}>{wd.max}°C</div>}
            </div>
          );
        })}
      </div>

      {/* Detail */}
      <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:13}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <h2 style={{fontFamily:"'Lora',serif",fontSize:26,fontWeight:400,color:C.ink}}>{DAY_LABELS[activeDay]}</h2>
              <Chip bg={prof.bg} fg={prof.fg}>{prof.icon} {prof.label}</Chip>
              {wx&&<Chip bg="#f0ebe0" fg={C.muted}>{wx.icon} {wDay?.max}°C</Chip>}
            </div>
            {wx&&<div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.muted}}>
              {wx.mood==="cold"||wx.mood==="rainy"?"💡 Warming meals recommended — slow-cooker weather":"💡 Light and fresh — good for grilled or cold dishes"}
            </div>}
          </div>
          <div style={{display:"flex",gap:5}}>
            {Object.entries(PROFILES).map(([k,p])=>(
              <button key={k} onClick={()=>setProf(activeDay,k)} style={{padding:"6px 11px",borderRadius:8,border:`1.5px solid`,borderColor:day.profile===k?C.forest:C.border,background:day.profile===k?C.forest:C.card,color:day.profile===k?C.cream:C.muted,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,cursor:"pointer",transition:"all 0.15s"}}>{p.icon} {p.label}</button>
            ))}
          </div>
        </div>

        {events.length>0&&(
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:13}}>
            {events.map((ev,i)=>{
              const c=evColors[ev.type]||evColors.work;
              return <Chip key={i} bg={c.bg} fg={c.fg} xs>📅 {ev.time} {ev.title}</Chip>;
            })}
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:11,marginBottom:17}}>
          {[
            {label:"Calories",val:nut.cal,max:prof.cal,unit:"kcal",color:"#f97316"},
            {label:"Protein", val:nut.prot,max:prof.prot,unit:"g",color:"#06b6d4"},
            {label:"Cost",    val:nut.cost,max:prof.budget,unit:"",color:"#22c55e",pre:"£",dec:true},
          ].map(m=>(
            <div key={m.label} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:11,padding:"11px 13px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.muted}}>{m.label}</span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:C.ink}}>{m.pre}{m.dec?m.val.toFixed(2):m.val}/{m.pre}{m.max}{!m.pre?m.unit:""}</span>
              </div>
              <Bar val={m.val} max={m.max} color={m.color}/>
            </div>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:11,marginBottom:24}}>
          {["breakfast","lunch","dinner"].map(slot=>{
            const meal=getMeal(slot,day.meals[slot]);
            return (
              <div key={slot} onClick={()=>setSwap({day:activeDay,slot})}
                style={{background:slotBg[slot],borderRadius:12,padding:"12px 14px",cursor:"pointer",border:"1.5px solid transparent",transition:"all 0.2s"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.borderColor=C.border;e.currentTarget.style.boxShadow="0 5px 16px rgba(0,0,0,0.07)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.borderColor="transparent";e.currentTarget.style.boxShadow="";}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em"}}>{slotIc[slot]} {slot}</span>
                  {meal&&isSeasonal(meal)&&<SeaChip/>}
                </div>
                {meal
                  ?<><div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:C.ink,fontSize:13,lineHeight:1.4,marginBottom:7}}>{meal.name}</div>
                    <div style={{display:"flex",gap:7}}><span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.muted}}>🔥{meal.cal}</span><span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.muted}}>💪{meal.prot}g</span><span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.muted}}>⏱{meal.time}m</span></div></>
                  :<div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.border,fontStyle:"italic"}}>+ Add meal</div>
                }
              </div>
            );
          })}
        </div>

        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:13,padding:17}}>
          <div style={{fontFamily:"'Lora',serif",fontSize:16,color:C.ink,marginBottom:13}}>Week overview</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:7}}>
            {DAYS.map(d=>{
              const t=dayTotals(week[d]);
              const wd=weather?.days?.find(x=>x.day===d);
              const wx2=wd?wCode(wd.code,wd.max):null;
              const isA=d===activeDay;
              return (
                <div key={d} onClick={()=>setActiveDay(d)}
                  style={{borderRadius:9,padding:"9px 7px",cursor:"pointer",border:`2px solid ${isA?C.forest:C.border}`,background:isA?C.forest:C.card,transition:"all 0.15s"}}
                  onMouseEnter={e=>{if(!isA)e.currentTarget.style.borderColor=C.muted;}}
                  onMouseLeave={e=>{if(!isA)e.currentTarget.style.borderColor=C.border;}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12,color:isA?C.cream:C.ink}}>{d}</span>
                    <span style={{fontSize:9}}>{wx2?.icon}</span>
                  </div>
                  {wd&&<div style={{fontSize:9,color:isA?"rgba(250,247,242,0.45)":C.muted,marginBottom:4}}>{wd.max}°</div>}
                  {["breakfast","lunch","dinner"].map(s=>{
                    const m=getMeal(s,week[d].meals[s]);
                    return m?<div key={s} style={{fontSize:9,color:isA?"rgba(250,247,242,0.5)":C.muted,marginBottom:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>· {m.name}</div>:null;
                  })}
                  <div style={{marginTop:5,display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:9,color:isA?"rgba(250,247,242,0.4)":C.muted}}>{t.cal}cal</span>
                    <span style={{fontSize:9,color:isA?"rgba(250,247,242,0.4)":C.muted}}>£{t.cost.toFixed(0)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {swap&&<SwapModal slot={swap.slot} onSelect={id=>setMeal(swap.day,swap.slot,id)} onClose={()=>setSwap(null)}/>}
    </div>
  );
}

// ─── SHOPPING TAB ─────────────────────────────────────────────
function ShoppingTab({week}) {
  const [retailer,setRetailer]=useState("tesco");
  const [checked,setChecked]=useState({});
  const mod=RETAILERS[retailer].mod;

  const raw={};
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

  const byAisle={};
  Object.values(raw).forEach(item=>{
    const a=item.aisle||"storecup";
    if(!byAisle[a])byAisle[a]=[];
    byAisle[a].push(item);
  });

  const allItems=Object.values(byAisle).flat();
  const estTotal=allItems.reduce((a,i)=>a+(i.count*3.5*mod),0);
  const sorted=Object.entries(byAisle).sort((a,b)=>(AISLES[a[0]]?.order||99)-(AISLES[b[0]]?.order||99));

  return (
    <div style={{padding:"20px 26px",maxWidth:860,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div>
          <h2 style={{fontFamily:"'Lora',serif",fontSize:24,fontWeight:400,color:C.ink,marginBottom:3}}>Shopping list</h2>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.muted}}>All 21 meals consolidated · sorted by aisle · tap to tick off</p>
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {Object.entries(RETAILERS).map(([k,r])=>(
            <button key={k} onClick={()=>setRetailer(k)} style={{padding:"6px 10px",borderRadius:7,border:`1.5px solid`,borderColor:retailer===k?C.forest:C.border,background:retailer===k?C.forest:C.card,color:retailer===k?"#fff":C.muted,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,cursor:"pointer",transition:"all 0.15s"}}>{r.logo} {r.name}</button>
          ))}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:11,marginBottom:22}}>
        {[
          {icon:"💰",label:"Est. weekly spend",val:`£${estTotal.toFixed(0)}`,sub:`at ${RETAILERS[retailer].name}`},
          {icon:"💡",label:"Aldi saving",val:`~£${(estTotal-estTotal*RETAILERS.aldi.mod/mod).toFixed(0)}`,sub:"if you switch"},
          {icon:"📋",label:"Unique ingredients",val:allItems.length,sub:"across 21 meals"},
          {icon:"🌿",label:"Seasonal items",val:allItems.filter(i=>i.seasonal).length,sub:`${SEA.n}`},
        ].map(s=>(
          <div key={s.label} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:11,padding:"12px 14px"}}>
            <div style={{fontSize:17,marginBottom:4}}>{s.icon}</div>
            <div style={{fontFamily:"'Lora',serif",fontSize:20,color:C.forest,fontWeight:500}}>{s.val}</div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.muted,marginTop:2}}>{s.label}</div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.muted}}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {sorted.map(([aisle,items])=>{
          const ai=AISLES[aisle]||{label:aisle,icon:"📦"};
          const doneCount=items.filter(i=>checked[i.name]).length;
          return (
            <div key={aisle} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:13,overflow:"hidden"}}>
              <div style={{padding:"10px 15px",background:"#faf8f4",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <span style={{fontSize:16}}>{ai.icon}</span>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:C.ink,fontSize:13}}>{ai.label}</span>
                  <Chip bg={C.bg} fg={C.muted} xs>{doneCount}/{items.length}</Chip>
                </div>
              </div>
              {items.map((item,ii)=>{
                const done=checked[item.name];
                return (
                  <div key={item.name} onClick={()=>setChecked(c=>({...c,[item.name]:!c[item.name]}))}
                    style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 15px",cursor:"pointer",background:done?"#f0f7f0":"transparent",opacity:done?0.6:1,borderBottom:ii<items.length-1?`1px solid ${C.border}`:"none",transition:"background 0.1s"}}
                    onMouseEnter={e=>{if(!done)e.currentTarget.style.background="#faf8f4";}}
                    onMouseLeave={e=>{e.currentTarget.style.background=done?"#f0f7f0":"transparent";}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:18,height:18,borderRadius:5,border:`2px solid ${done?C.forest:C.border}`,background:done?C.forest:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        {done&&<span style={{color:"#fff",fontSize:10,fontWeight:700}}>✓</span>}
                      </div>
                      <div>
                        <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:500,color:C.ink,fontSize:13,textDecoration:done?"line-through":"none"}}>{item.name}</div>
                        <div style={{display:"flex",gap:5,marginTop:2,flexWrap:"wrap",alignItems:"center"}}>
                          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.muted}}>{item.qty}</span>
                          {item.count>1&&<Chip bg={C.bg} fg={C.muted} xs>×{item.count}</Chip>}
                          {item.seasonal&&<SeaChip/>}
                          {item.staple&&<Chip bg="#fdf8ec" fg={C.gold} xs>pantry staple</Chip>}
                        </div>
                        <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"#94a3b8",marginTop:1}}>{item.meals.slice(0,2).join(", ")}{item.meals.length>2?` +${item.meals.length-2} more`:""}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PREP TAB ─────────────────────────────────────────────────
function PrepTab({week}) {
  const seen=new Set();
  const batchMeals=[];
  DAYS.forEach(d=>["breakfast","lunch","dinner"].forEach(slot=>{
    const m=getMeal(slot,week[d].meals[slot]);
    if(m?.batch&&!seen.has(m.id)){seen.add(m.id);batchMeals.push(m);}
  }));

  const timeline=[
    {time:"1:00 pm",dur:"4h passive / 20min active",task:"Start the big cook",note:"Lamb shoulder or whole chicken in the oven first. Everything else fits around it.",icon:"🍖",bg:C.warn,fg:C.warnText},
    {time:"1:30 pm",dur:"40 min",task:"Batch soup or stew",note:"Big pot — portion into containers for Mon–Wed lunches, freeze one for later.",icon:"🍲",bg:C.forestLight,fg:C.forest},
    {time:"2:30 pm",dur:"20 min",task:"Prep and portion proteins",note:"Marinate chicken for souvlaki tonight. Weigh and label mince portions for the week.",icon:"⚖️",bg:C.sky,fg:C.skyText},
    {time:"3:00 pm",dur:"15 min",task:"Pack office lunches",note:"Assemble 3 tabbouleh jars for Tue–Thu. Into the fridge, good for 4 days.",icon:"🥗",bg:C.forestLight,fg:C.forest},
    {time:"Before bed",dur:"5 min",task:"Set the bircher muesli",note:"Oats, apple juice, yoghurt — soak overnight. Zero morning effort all week.",icon:"🥣",bg:"#f0edf8",fg:"#5b21b6"},
  ];

  return (
    <div style={{padding:"20px 26px",maxWidth:860,margin:"0 auto"}}>
      <div style={{marginBottom:20}}>
        <h2 style={{fontFamily:"'Lora',serif",fontSize:24,fontWeight:400,color:C.ink,marginBottom:3}}>Sunday prep plan</h2>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.muted}}>90 minutes on Sunday makes the entire week effortless.</p>
      </div>

      <div style={{background:C.forestLight,border:`1px solid ${C.sage}`,borderRadius:11,padding:"12px 15px",marginBottom:20,display:"flex",gap:11,alignItems:"center"}}>
        <span style={{fontSize:18}}>💡</span>
        <div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:C.forest,fontSize:13}}>Batch cooking saves ~3 hours of weekday cooking time</div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#3d6b4f",marginTop:1}}>The lamb, batch soup, and prepped lunches cover 8 of your 21 meals.</div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:22}}>
        <div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:C.ink,fontSize:13,marginBottom:13}}>📅 Sunday session</div>
          {timeline.map((item,i)=>(
            <div key={i} style={{display:"flex",gap:0}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:32,flexShrink:0}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:C.forest,marginTop:14,flexShrink:0,zIndex:1}}/>
                {i<timeline.length-1&&<div style={{width:2,flex:1,background:C.border}}/>}
              </div>
              <div style={{flex:1,paddingBottom:16}}>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.muted,marginTop:10,marginBottom:3}}>{item.time} · {item.dur}</div>
                <div style={{background:item.bg,borderRadius:9,padding:"10px 12px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                    <span style={{fontSize:14}}>{item.icon}</span>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:item.fg,fontSize:12}}>{item.task}</span>
                  </div>
                  <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.muted,lineHeight:1.5}}>{item.note}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:C.ink,fontSize:13,marginBottom:13}}>📦 What to batch cook</div>
          <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:20}}>
            {batchMeals.length===0
              ?<div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.muted,fontStyle:"italic"}}>No batch meals in your current plan</div>
              :batchMeals.map(m=>(
                <div key={m.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px"}}>
                  <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:C.ink,fontSize:13,marginBottom:4}}>{m.name}</div>
                  <div style={{display:"flex",gap:6,marginBottom:6,flexWrap:"wrap"}}>
                    <Chip bg={C.bg} fg={C.muted} xs>⏱ {m.time>=60?`${Math.round(m.time/60)}h`:m.time+"m"}</Chip>
                    <Chip bg={C.forestLight} fg={C.forest} xs>📦 Batchable</Chip>
                    {isSeasonal(m)&&<SeaChip/>}
                  </div>
                  {m.batchNote&&<div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.muted,background:"#faf8f4",borderRadius:5,padding:"4px 8px",lineHeight:1.5}}>{m.batchNote}</div>}
                </div>
              ))
            }
          </div>

          <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:C.ink,fontSize:13,marginBottom:9}}>🗓 Day by day</div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:11,overflow:"hidden"}}>
            {DAYS.map((d,i)=>{
              const day=week[d];
              const prof=PROFILES[day.profile];
              const dinner=getMeal("dinner",day.meals.dinner);
              const ev=CAL_EVENTS[d]||[];
              const lateCall=ev.find(e=>e.type==="work"&&parseInt(e.time)>=18);
              const familyDay=ev.some(e=>e.type==="family");
              return (
                <div key={d} style={{display:"flex",gap:11,alignItems:"flex-start",padding:"10px 13px",borderBottom:i<6?`1px solid ${C.border}`:"none"}}>
                  <div style={{width:52,flexShrink:0}}>
                    <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12,color:C.ink}}>{d}</div>
                    <Chip bg={prof.bg} fg={prof.fg} xs>{prof.label}</Chip>
                  </div>
                  <div style={{flex:1}}>
                    {dinner&&<div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.ink,marginBottom:3}}>🌙 <strong>{dinner.name}</strong> · {dinner.time}m</div>}
                    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                      {lateCall&&<Chip bg={C.warn} fg={C.warnText} xs>⚠️ Late call — quick dinner</Chip>}
                      {familyDay&&<Chip bg={C.sage} fg={C.sageText} xs>👨‍👧 Family portions</Chip>}
                      {d==="Sun"&&<Chip bg={C.forestLight} fg={C.forest} xs>📦 Batch cook day</Chip>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AI PANEL ─────────────────────────────────────────────────
function AIPanel({week,weather,onClose}) {
  const [msgs,setMsgs]=useState([{role:"assistant",content:`Hello! I can see your full week, the weather forecast, and what's in season (${SEA.n}: ${SEA.p.slice(0,3).join(", ")}).\n\nTry:\n• "It's cold Thursday — what should I cook for the kids?"\n• "I have leftover lamb — what can I do with it?"\n• "Give me a cheaper swap for Saturday dinner"\n• "What's the quickest high-protein dinner this week?"`}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{ref.current?.scrollIntoView({behavior:"smooth"})},[msgs]);

  const ctx=DAYS.map(d=>{
    const t=dayTotals(week[d]);
    const ev=(CAL_EVENTS[d]||[]).map(e=>e.title).join(", ");
    return `${d}(${week[d].profile}): B=${getMeal("breakfast",week[d].meals.breakfast)?.name||"none"}, L=${getMeal("lunch",week[d].meals.lunch)?.name||"none"}, D=${getMeal("dinner",week[d].meals.dinner)?.name||"none"} | ${t.cal}kcal £${t.cost.toFixed(2)} | ${ev||"no events"}`;
  }).join("\n");
  const wxCtx=weather?.days?.map(d=>`${d.day}:${wCode(d.code,d.max).label} ${d.max}°C`).join(", ")||"unavailable";

  async function send(){
    if(!input.trim()||loading)return;
    const um={role:"user",content:input};
    setMsgs(m=>[...m,um]);setInput("");setLoading(true);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        model:"claude-sonnet-4-20250514",max_tokens:600,
        system:`You are a smart meal planning assistant.\n\nWEEK:\n${ctx}\n\nWEATHER: ${wxCtx}\n\nSEASON: ${SEA.n} — in season: ${SEA.p.join(", ")}\n\nPROFILES: Solo=2000kcal/£14, Office=1800kcal/£12, Family=3200kcal/£24\n\nBe specific, practical, brief (3-4 sentences max). Name actual meals.`,
        messages:[...msgs,um].map(m=>({role:m.role,content:m.content}))
      })});
      const data=await res.json();
      setMsgs(m=>[...m,{role:"assistant",content:data.content?.[0]?.text||"Couldn't respond right now."}]);
    }catch{setMsgs(m=>[...m,{role:"assistant",content:"Connection issue — try again in a moment."}]);}
    setLoading(false);
  }

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(28,26,20,0.45)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"flex-end",padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{width:380,height:520,background:C.card,borderRadius:18,display:"flex",flexDirection:"column",boxShadow:"0 40px 80px rgba(0,0,0,0.3)",overflow:"hidden"}}>
        <div style={{background:C.forest,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:26,height:26,borderRadius:"50%",background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🌿</div>
            <div>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:C.cream,fontSize:13}}>Meal assistant</div>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"rgba(250,247,242,0.4)"}}>Live weather · {SEA.n} · your full week</div>
            </div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(250,247,242,0.4)",fontSize:16,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"13px 15px",display:"flex",flexDirection:"column",gap:8}}>
          {msgs.map((msg,i)=>(
            <div key={i} style={{display:"flex",justifyContent:msg.role==="user"?"flex-end":"flex-start"}}>
              <div style={{maxWidth:"88%",padding:"8px 12px",borderRadius:msg.role==="user"?"13px 13px 3px 13px":"13px 13px 13px 3px",background:msg.role==="user"?C.forest:"#f2ede4",color:msg.role==="user"?C.cream:C.ink,fontFamily:"'DM Sans',sans-serif",fontSize:13,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{msg.content}</div>
            </div>
          ))}
          {loading&&<div style={{display:"flex"}}><div style={{padding:"8px 12px",background:"#f2ede4",borderRadius:"13px 13px 13px 3px",display:"flex",gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:C.muted,animation:`pulse 1.2s ease ${i*0.2}s infinite`}}/>)}</div></div>}
          <div ref={ref}/>
        </div>
        <div style={{padding:"8px 12px",borderTop:`1px solid ${C.border}`,display:"flex",gap:6}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask about your week..."
            style={{flex:1,padding:"7px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontFamily:"'DM Sans',sans-serif",fontSize:13,background:C.bg,color:C.ink,outline:"none"}}/>
          <button onClick={send} disabled={loading} style={{padding:"7px 13px",borderRadius:8,border:"none",background:loading?C.border:C.forest,color:C.cream,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,cursor:loading?"not-allowed":"pointer"}}>Send</button>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────
export default function App() {
  const [week,setWeek]=useState(DEFAULT_WEEK);
  const [tab,setTab]=useState("plan");
  const [showAI,setShowAI]=useState(false);
  const [weather,setWeather]=useState(null);
  const wt=weekTotals(week);

  useEffect(()=>{
    fetch("https://api.open-meteo.com/v1/forecast?latitude=51.5074&longitude=-0.1278&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Europe/London&forecast_days=7")
      .then(r=>r.json())
      .then(d=>setWeather({days:DAYS.map((day,i)=>({day,code:d.daily.weathercode[i],max:Math.round(d.daily.temperature_2m_max[i]),min:Math.round(d.daily.temperature_2m_min[i]),rain:d.daily.precipitation_sum[i]}))}))
      .catch(()=>setWeather({days:DAYS.map((day,i)=>({day,code:[63,61,3,2,80,1,2][i],max:[9,8,11,12,10,13,14][i],min:[4,3,5,6,4,7,8][i],rain:[4.2,2.1,0,0,1.8,0,0][i]}))}));
  },[]);

  const todayW=weather?.days?.[0];
  const todayWx=todayW?wCode(todayW.code,todayW.max):null;
  const tabs=[
    {id:"plan",label:"📅 Plan",desc:"Weekly meal planner"},
    {id:"shopping",label:"🛒 Shopping",desc:"Consolidated ingredient list by aisle"},
    {id:"prep",label:"📦 Prep plan",desc:"Sunday batch cook & day-by-day guide"},
  ];

  return (
    <div style={{display:"flex",height:"100vh",background:C.bg,overflow:"hidden"}}>
      <style>{FONTS}</style>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}input:focus{outline:none}`}</style>

      <div style={{width:210,background:C.forest,display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"19px 17px 14px",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
          <div style={{fontFamily:"'Lora',serif",fontSize:22,color:C.cream,letterSpacing:"-0.02em"}}>Plait</div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"rgba(250,247,242,0.3)",marginTop:1}}>Week of 3 Mar 2026</div>
        </div>
        <div style={{margin:"10px 10px 0",background:"rgba(184,151,74,0.12)",border:"1px solid rgba(184,151,74,0.18)",borderRadius:8,padding:"8px 10px"}}>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"#c4a85a",fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:2}}>{SEA.e} {SEA.n}</div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"rgba(250,247,242,0.4)",lineHeight:1.5}}>{SEA.p.slice(0,4).join(" · ")}</div>
        </div>
        {weather&&(
          <div style={{margin:"8px 10px 0",display:"flex",gap:4}}>
            {weather.days.slice(0,5).map(d=>{
              const wx=wCode(d.code,d.max);
              return <div key={d.day} style={{flex:1,textAlign:"center",padding:"5px 0",borderRadius:7,background:"rgba(255,255,255,0.05)"}}>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:"rgba(250,247,242,0.3)"}}>{d.day}</div>
                <div style={{fontSize:11}}>{wx.icon}</div>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:"rgba(250,247,242,0.4)"}}>{d.max}°</div>
              </div>;
            })}
          </div>
        )}
        <div style={{flex:1,padding:"13px 8px 9px"}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"block",width:"100%",textAlign:"left",padding:"8px 10px",borderRadius:8,border:"none",cursor:"pointer",marginBottom:3,background:tab===t.id?"rgba(250,247,242,0.1)":"transparent",borderLeft:`3px solid ${tab===t.id?C.cream:"transparent"}`,transition:"all 0.15s"}}>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:tab===t.id?600:400,fontSize:13,color:tab===t.id?C.cream:"rgba(250,247,242,0.44)"}}>{t.label}</div>
            </button>
          ))}
        </div>
        <div style={{padding:"10px 14px",borderTop:"1px solid rgba(255,255,255,0.07)"}}>
          {[{l:"food spend",v:`£${wt.cost.toFixed(0)}`},{l:"calories",v:`${(wt.cal/1000).toFixed(1)}k`},{l:"protein",v:`${wt.prot}g`}].map(s=>(
            <div key={s.l} style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"rgba(250,247,242,0.27)"}}>{s.l}</span>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,color:C.cream}}>{s.v}</span>
            </div>
          ))}
        </div>
        <button onClick={()=>setShowAI(true)} style={{margin:"0 10px 13px",padding:"9px",borderRadius:8,background:"rgba(196,98,45,0.17)",border:"1px solid rgba(196,98,45,0.24)",color:"#e8a87a",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"all 0.2s"}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(196,98,45,0.28)"}
          onMouseLeave={e=>e.currentTarget.style.background="rgba(196,98,45,0.17)"}
        >🌿 Meal assistant</button>
      </div>

      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{background:C.card,borderBottom:`1px solid ${C.border}`,padding:"0 22px",display:"flex",alignItems:"center",justifyContent:"space-between",height:46,flexShrink:0}}>
          <span style={{fontFamily:"'Lora',serif",fontSize:15,color:C.ink}}>{tabs.find(t=>t.id===tab)?.desc}</span>
          {todayWx&&todayW&&<div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",background:C.bg,borderRadius:7}}><span style={{fontSize:12}}>{todayWx.icon}</span><span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.muted}}>London · {todayW.max}°C today</span></div>}
        </div>
        <div style={{flex:1,overflow:"hidden"}}>
          {tab==="plan"&&<PlanTab week={week} setWeek={setWeek} weather={weather}/>}
          {tab==="shopping"&&<ShoppingTab week={week}/>}
          {tab==="prep"&&<PrepTab week={week}/>}
        </div>
      </div>
      {showAI&&<AIPanel week={week} weather={weather} onClose={()=>setShowAI(false)}/>}
    </div>
  );
}
</div>
  );
}
