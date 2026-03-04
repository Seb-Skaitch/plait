import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   PLAIT v5 — The meal planner that plans around your life
   
   Designed for 5 personas:
   1. Spinning Plates Parent — household by day, fast weeknights
   2. Health Restarter — goal-aware, protein-forward, gentle progress  
   3. Conscious Shopper — seasonal, waste-reducing, shop-by-store
   4. Solo Adult — single-serve, batch cook, Tonight-first
   5. Household Coordinator — constraints per person, shareable
   
   Onboarding → Today → Plan → Shop → Cook → Discover
═══════════════════════════════════════════════════════════════ */

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,300;1,9..144,400&family=DM+Sans:wght@300;400;500;600&display=swap');`;

// ── DESIGN TOKENS ──────────────────────────────────────────────
const C = {
  bg:          "#f7f4ef",
  card:        "#ffffff",
  ink:         "#1c1814",
  forest:      "#2a4a35",
  forestMid:   "#3d6b4f",
  forestLight: "#e8f2eb",
  clay:        "#c4622d",
  clayLight:   "#fdf0e8",
  gold:        "#9a7f3a",
  goldLight:   "#fdf6e3",
  muted:       "#7a7060",
  mutedLight:  "#b8afa0",
  border:      "#e8e0d4",
  cream:       "#faf8f4",
  sage:        "#c8dfc8",
  sageText:    "#2a4a35",
  warn:        "#fef3c7",
  warnText:    "#92400e",
  navBg:       "#1c1814",
  purple:      "#ede9fe",
  purpleText:  "#5b21b6",
  blue:        "#dbeafe",
  blueText:    "#1d4ed8",
  pink:        "#fce7f3",
  pinkText:    "#9d174d",
};

// ── SEASONAL DATA ──────────────────────────────────────────────
const MONTH = new Date().getMonth() + 1;
const SEASON = ({
  1:{e:"❄️",n:"January",items:["leeks","kale","parsnips","celeriac","blood oranges","cavolo nero","chicory"]},
  2:{e:"🌨️",n:"February",items:["purple sprouting broccoli","leeks","kale","forced rhubarb","chicory"]},
  3:{e:"🌱",n:"March",items:["purple sprouting broccoli","spring greens","radishes","watercress","wild garlic"]},
  4:{e:"🌸",n:"April",items:["asparagus","spring onions","spinach","jersey royals","morels"]},
  5:{e:"☀️",n:"May",items:["asparagus","broad beans","peas","new potatoes","elderflower"]},
  6:{e:"🌻",n:"June",items:["strawberries","courgettes","fennel","new potatoes","gooseberries"]},
  7:{e:"🏖️",n:"July",items:["tomatoes","courgettes","runner beans","sweetcorn","raspberries"]},
  8:{e:"🌞",n:"August",items:["tomatoes","sweetcorn","aubergine","peppers","plums"]},
  9:{e:"🍂",n:"September",items:["butternut squash","wild mushrooms","blackberries","cobnuts","damsons"]},
  10:{e:"🎃",n:"October",items:["pumpkin","celeriac","wild mushrooms","chestnuts","quince"]},
  11:{e:"🍁",n:"November",items:["parsnips","swede","brussels sprouts","venison","quince"]},
  12:{e:"⛄",n:"December",items:["turkey","parsnips","brussels sprouts","clementines","chestnuts"]},
})[MONTH] || {e:"🌿",n:"Spring",items:["asparagus","peas","spring greens"]};

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const TODAY_IDX = Math.min(new Date().getDay()===0?6:new Date().getDay()-1,6);

// ── GOALS ──────────────────────────────────────────────────────
const GOALS = [
  {id:"wellbeing", label:"Eat well", desc:"Real food, good variety", icon:"🥗", protMod:1.0, calMod:1.0},
  {id:"loseweight",label:"Lose weight",desc:"Lighter, filling meals", icon:"⚖️", protMod:1.1, calMod:0.85},
  {id:"muscle",    label:"Build muscle",desc:"Protein-forward plans", icon:"💪", protMod:1.3, calMod:1.1},
  {id:"budget",    label:"Save money",  desc:"Smart, waste-free week",icon:"💷", protMod:1.0, calMod:1.0},
  {id:"family",    label:"Feed the family",desc:"Everyone happy",      icon:"👨‍👧", protMod:1.0, calMod:1.2},
];

// ── RECIPE LIBRARY ─────────────────────────────────────────────
const RECIPES = [
  // BREAKFAST
  {id:"b1",slot:"breakfast",name:"Bircher muesli",cal:360,prot:14,cost:1.8,time:5,effort:1,
   tags:["prep-ahead","vegetarian"],seasonal:[],weather:["any"],
   goals:["wellbeing","loseweight","budget"],servings:1,
   batch:true,batchNote:"Make Sunday night — ready Mon–Fri",
   desc:"Creamy overnight oats with apple and berries",
   why:"Zero morning effort. Prep once, eat all week.",
   ings:[{n:"Rolled oats",q:"80g",a:"grains"},{n:"Apple juice",q:"150ml",a:"tins"},{n:"Natural yoghurt",q:"100g",a:"dairy"},{n:"Mixed berries",q:"80g",a:"produce"}],
   steps:["Mix oats, apple juice and yoghurt in a jar","Refrigerate overnight","Top with berries in the morning"]},
  {id:"b2",slot:"breakfast",name:"Smoked salmon & rye",cal:380,prot:32,cost:4.5,time:8,effort:1,
   tags:["quick","high-prot"],seasonal:[],weather:["any"],
   goals:["muscle","wellbeing"],servings:1,
   desc:"Rye toast, cream cheese, smoked salmon, lemon",
   why:"High protein, zero cooking. Perfect before the gym.",
   ings:[{n:"Smoked salmon",q:"100g",a:"protein"},{n:"Rye bread",q:"2 slices",a:"bakery"},{n:"Cream cheese",q:"2 tbsp",a:"dairy"},{n:"Lemon",q:"½",a:"produce"}],
   steps:["Toast rye bread","Spread cream cheese","Layer salmon, squeeze lemon","Done"]},
  {id:"b3",slot:"breakfast",name:"Protein smoothie bowl",cal:340,prot:36,cost:3.2,time:8,effort:1,
   tags:["quick","high-prot"],seasonal:[],weather:["mild","warm"],
   goals:["muscle","loseweight"],servings:1,
   desc:"Frozen berries, banana, protein powder, granola",
   why:"35g protein before you've left the house.",
   ings:[{n:"Protein powder",q:"30g",a:"storecup"},{n:"Frozen berries",q:"100g",a:"produce"},{n:"Banana",q:"1",a:"produce"},{n:"Almond milk",q:"150ml",a:"dairy"},{n:"Granola",q:"30g",a:"grains"}],
   steps:["Blend protein, berries, banana and milk","Pour into bowl — thick, not drinkable","Top with granola"]},
  {id:"b4",slot:"breakfast",name:"Porridge & almond butter",cal:420,prot:16,cost:1.4,time:8,effort:1,
   tags:["warming","vegetarian"],seasonal:[],weather:["cold","rainy"],
   goals:["wellbeing","budget","family"],servings:1,
   desc:"Creamy oats, sliced banana, almond butter",
   why:"Warming and filling on cold mornings.",
   ings:[{n:"Porridge oats",q:"80g",a:"grains"},{n:"Whole milk",q:"250ml",a:"dairy"},{n:"Banana",q:"1",a:"produce"},{n:"Almond butter",q:"1 tbsp",a:"condiments"}],
   steps:["Combine oats and milk in pan","Cook 5 mins on medium, stirring","Top with sliced banana and almond butter"]},
  {id:"b5",slot:"breakfast",name:"Greek yoghurt & walnuts",cal:280,prot:22,cost:2.6,time:3,effort:1,
   tags:["quick","no-cook","vegetarian"],seasonal:[],weather:["any"],
   goals:["wellbeing","loseweight"],servings:1,
   desc:"Thick yoghurt, honey, walnuts, a grind of black pepper",
   why:"Three minutes. Genuinely good.",
   ings:[{n:"Greek yoghurt",q:"200g",a:"dairy"},{n:"Runny honey",q:"1 tbsp",a:"condiments"},{n:"Walnuts",q:"30g",a:"storecup"}],
   steps:["Spoon yoghurt into bowl","Drizzle honey","Scatter walnuts"]},
  // LUNCH  
  {id:"l1",slot:"lunch",name:"Chicken tabbouleh",cal:480,prot:42,cost:6.0,time:20,effort:2,
   tags:["meal-prep","high-prot"],seasonal:[],weather:["any"],
   goals:["muscle","wellbeing"],servings:1,
   batch:true,batchNote:"Prep 3 portions Sunday — keeps 4 days",
   desc:"Shredded chicken, bulgur, parsley, lemon",
   why:"42g protein. Meal-preps beautifully. Tastes better next day.",
   ings:[{n:"Chicken breast",q:"150g",a:"protein"},{n:"Bulgur wheat",q:"80g",a:"grains"},{n:"Flat-leaf parsley",q:"1 bunch",a:"produce"},{n:"Cherry tomatoes",q:"100g",a:"produce"},{n:"Lemon",q:"1",a:"produce"}],
   steps:["Cook bulgur per packet — about 15 mins","Shred pre-cooked chicken","Chop parsley and halve tomatoes","Mix everything with lemon juice and olive oil","Season well"]},
  {id:"l2",slot:"lunch",name:"Celeriac & lentil soup",cal:380,prot:22,cost:3.2,time:45,effort:2,
   tags:["batch","warming","vegetarian"],seasonal:["celeriac"],weather:["cold","rainy"],
   goals:["budget","wellbeing","loseweight"],servings:4,
   batch:true,batchNote:"Big pot — 4 portions. Freezes well.",
   desc:"Roasted celeriac, red lentils, warming spices",
   why:"In season now. Costs almost nothing. Freezes perfectly.",
   ings:[{n:"Celeriac",q:"1 medium",a:"produce",seasonal:true},{n:"Red lentils",q:"150g",a:"tins"},{n:"Vegetable stock",q:"1L",a:"storecup"},{n:"Onion",q:"1",a:"produce"},{n:"Cumin",q:"1 tsp",a:"condiments"}],
   steps:["Roast celeriac chunks at 200°C for 25 mins","Soften onion in large pot, add cumin","Add lentils and stock, simmer 20 mins","Add half the roasted celeriac","Blend half the soup, stir through, season well"]},
  {id:"l3",slot:"lunch",name:"Tuna Niçoise",cal:420,prot:38,cost:5.0,time:12,effort:1,
   tags:["quick","no-cook","high-prot"],seasonal:[],weather:["any"],
   goals:["muscle","loseweight","wellbeing"],servings:1,
   desc:"Tuna, green beans, olives, tomatoes, mustard dressing",
   why:"No cooking. 38g protein. Done in 12 minutes.",
   ings:[{n:"Tuna in olive oil",q:"2 tins",a:"tins"},{n:"Green beans",q:"100g",a:"produce"},{n:"Olives",q:"50g",a:"condiments"},{n:"Cherry tomatoes",q:"100g",a:"produce"},{n:"Dijon mustard",q:"1 tsp",a:"condiments"}],
   steps:["Blanch green beans 3 mins in boiling water","Drain tuna","Arrange on plate with tomatoes and olives","Whisk oil, mustard, lemon for dressing"]},
  {id:"l4",slot:"lunch",name:"Warm mezze",cal:520,prot:22,cost:5.8,time:15,effort:1,
   tags:["relaxed","family","vegetarian"],seasonal:[],weather:["any"],
   goals:["family","wellbeing"],servings:2,
   desc:"Hummus, feta, flatbreads, roasted peppers, cucumber",
   why:"Kids love it. Adults love it. Zero cooking.",
   ings:[{n:"Hummus",q:"200g",a:"tins"},{n:"Flatbreads",q:"4",a:"bakery"},{n:"Feta",q:"100g",a:"dairy"},{n:"Roasted peppers",q:"100g",a:"tins"},{n:"Cucumber",q:"½",a:"produce"}],
   steps:["Warm flatbreads in dry pan 1 min each side","Arrange hummus, crumbled feta, peppers","Slice cucumber","Drizzle good olive oil over everything"]},
  {id:"l5",slot:"lunch",name:"Kale & chicken Caesar",cal:390,prot:35,cost:5.5,time:12,effort:1,
   tags:["seasonal","high-prot"],seasonal:["kale"],weather:["any"],
   goals:["muscle","loseweight"],servings:1,
   desc:"Massaged kale, grilled chicken, parmesan, sourdough croutons",
   why:"Kale is perfect right now. Holds dressing better than lettuce.",
   ings:[{n:"Kale",q:"100g",a:"produce",seasonal:true},{n:"Chicken breast",q:"120g",a:"protein"},{n:"Parmesan",q:"30g",a:"dairy"},{n:"Caesar dressing",q:"3 tbsp",a:"condiments"},{n:"Sourdough",q:"1 slice",a:"bakery"}],
   steps:["Massage kale with dressing for 2 mins — it softens","Grill or pan-fry chicken 4 mins each side","Tear sourdough, toast in dry pan for croutons","Slice chicken over kale, top with parmesan"]},
  {id:"l6",slot:"lunch",name:"Leftover lamb wraps",cal:510,prot:38,cost:2.0,time:10,effort:1,
   tags:["leftover","quick","family"],seasonal:[],weather:["any"],
   goals:["budget","family"],servings:2,
   desc:"Slow-cooked lamb, tzatziki, flatbread, pickled red onion",
   why:"Uses Sunday's lamb. Practically free. Better than the original.",
   ings:[{n:"Leftover lamb",q:"200g",a:"protein"},{n:"Flatbreads",q:"2",a:"bakery"},{n:"Greek yoghurt",q:"100g",a:"dairy"},{n:"Cucumber",q:"¼",a:"produce"},{n:"Red onion",q:"½",a:"produce"}],
   steps:["Warm lamb in pan with a splash of water","Make quick tzatziki: yoghurt, grated cucumber, mint","Thinly slice red onion","Warm flatbreads, assemble"]},
  // DINNER
  {id:"d1",slot:"dinner",name:"Sea bass, capers & lemon",cal:520,prot:48,cost:12.0,time:25,effort:2,
   tags:["quick","elegant","high-prot"],seasonal:[],weather:["any"],
   goals:["wellbeing","muscle","loseweight"],servings:2,
   desc:"Pan-fried sea bass, cherry tomatoes, capers, lemon butter",
   why:"Restaurant quality. 25 minutes. Worth every penny.",
   ings:[{n:"Sea bass fillets",q:"2",a:"protein"},{n:"Cherry tomatoes",q:"150g",a:"produce"},{n:"Capers",q:"2 tbsp",a:"condiments"},{n:"Lemon",q:"1",a:"produce"},{n:"Butter",q:"20g",a:"dairy"}],
   steps:["Roast tomatoes at 200°C for 10 mins","Score fish skin, pat dry, season well","Heat oil in pan until smoking","Fish skin-down 3 mins — don't move it","Flip, 1 min, then rest","Deglaze pan with lemon juice, add capers and butter"]},
  {id:"d2",slot:"dinner",name:"Slow lamb shoulder",cal:680,prot:56,cost:15.0,time:250,effort:2,
   tags:["weekend","family","batch"],seasonal:[],weather:["cold","rainy"],
   goals:["family","wellbeing"],servings:4,
   batch:true,batchNote:"Enough for wraps on Monday — see lunch",
   desc:"4-hour braised lamb, garlic, rosemary, tomatoes",
   why:"Sunday magic. Makes Monday's lunch for free.",
   ings:[{n:"Lamb shoulder",q:"1.5kg",a:"protein"},{n:"Garlic",q:"6 cloves",a:"produce"},{n:"Rosemary",q:"3 sprigs",a:"produce"},{n:"Tinned tomatoes",q:"400g",a:"tins"},{n:"Onion",q:"2",a:"produce"},{n:"Red wine",q:"200ml",a:"other"}],
   steps:["Heat oven to 160°C","Brown shoulder all over in casserole — 10 mins","Add halved onions, whole garlic, rosemary","Pour over tomatoes and wine","Cover tightly, cook 4 hours","Rest 30 mins, shred with two forks"]},
  {id:"d3",slot:"dinner",name:"Turkey meatballs & courgetti",cal:490,prot:52,cost:8.0,time:30,effort:2,
   tags:["quick","high-prot","family"],seasonal:[],weather:["any"],
   goals:["muscle","loseweight","family"],servings:2,
   batch:true,batchNote:"Double batch and freeze half",
   desc:"Turkey meatballs in tomato sauce, courgette noodles",
   why:"52g protein. Kids love it. Freezes perfectly.",
   ings:[{n:"Turkey mince",q:"400g",a:"protein"},{n:"Courgette",q:"2",a:"produce"},{n:"Tinned tomatoes",q:"400g",a:"tins"},{n:"Garlic",q:"3 cloves",a:"produce"},{n:"Parmesan",q:"30g",a:"dairy"}],
   steps:["Mix mince with garlic, parmesan, salt","Roll into golf balls, chill 10 mins","Brown all over in batches — don't crowd","Add tomatoes, simmer 15 mins","Spiralise courgette, fold into sauce raw — it wilts in the heat"]},
  {id:"d4",slot:"dinner",name:"Chicken souvlaki",cal:560,prot:55,cost:9.0,time:25,effort:2,
   tags:["family","high-prot"],seasonal:[],weather:["any"],
   goals:["family","muscle","wellbeing"],servings:4,
   desc:"Grilled chicken thighs, tzatziki, warm pittas, lemon",
   why:"Everyone eats it. Kids. Adults. First-time guests.",
   ings:[{n:"Chicken thighs",q:"600g",a:"protein"},{n:"Greek yoghurt",q:"200g",a:"dairy"},{n:"Cucumber",q:"½",a:"produce"},{n:"Pittas",q:"4",a:"bakery"},{n:"Lemon",q:"1",a:"produce"},{n:"Dried oregano",q:"2 tsp",a:"condiments"}],
   steps:["Mix chicken with oil, oregano, lemon zest, garlic — marinate if time","Grill 6 mins each side","Rest 5 mins, slice","Tzatziki: yoghurt, grated cucumber, mint, garlic","Warm pittas, assemble at table"]},
  {id:"d5",slot:"dinner",name:"Chickpea & parsnip tagine",cal:440,prot:24,cost:5.5,time:45,effort:2,
   tags:["vegetarian","warming","batch","family"],seasonal:["parsnips"],weather:["cold","rainy"],
   goals:["budget","wellbeing","family"],servings:4,
   batch:true,batchNote:"Better the next day. Make Sunday.",
   desc:"Parsnips, chickpeas, ras el hanout, couscous",
   why:"Parsnips are in season. This costs almost nothing and feeds four.",
   ings:[{n:"Parsnips",q:"400g",a:"produce",seasonal:true},{n:"Chickpeas",q:"400g",a:"tins"},{n:"Tinned tomatoes",q:"400g",a:"tins"},{n:"Ras el hanout",q:"2 tsp",a:"condiments"},{n:"Couscous",q:"200g",a:"grains"},{n:"Onion",q:"1",a:"produce"}],
   steps:["Soften onion in large pan 8 mins","Add ras el hanout, stir 1 min","Add parsnips, chickpeas, tomatoes, 300ml water","Simmer 30 mins until parsnips are tender","Pour boiling water over couscous, cover 5 mins, fluff with fork"]},
  {id:"d6",slot:"dinner",name:"Miso salmon & kale",cal:510,prot:46,cost:10.5,time:20,effort:1,
   tags:["quick","elegant","seasonal"],seasonal:["kale"],weather:["cold","rainy"],
   goals:["muscle","loseweight","wellbeing"],servings:2,
   desc:"White miso-glazed salmon, wilted kale, sesame",
   why:"Kale is at its best right now. 20 minutes. Feels special.",
   ings:[{n:"Salmon fillets",q:"2",a:"protein"},{n:"Kale",q:"100g",a:"produce",seasonal:true},{n:"White miso paste",q:"2 tbsp",a:"condiments"},{n:"Ginger",q:"1 thumb",a:"produce"},{n:"Soy sauce",q:"1 tbsp",a:"condiments"},{n:"Sesame oil",q:"1 tsp",a:"condiments"}],
   steps:["Mix miso, soy, ginger, sesame oil into glaze","Brush over salmon fillets","Bake at 200°C for 12 mins","Wilt kale in same pan with splash of water","Serve together with rice or noodles"]},
  {id:"d7",slot:"dinner",name:"Pork tenderloin & celeriac",cal:600,prot:52,cost:10.0,time:45,effort:2,
   tags:["weekend","elegant"],seasonal:["celeriac"],weather:["cold","rainy"],
   goals:["wellbeing","muscle"],servings:2,
   desc:"Roasted tenderloin, celeriac gratin, mustard jus",
   why:"Weekend cooking that feels like a restaurant. Celeriac is the star.",
   ings:[{n:"Pork tenderloin",q:"600g",a:"protein"},{n:"Celeriac",q:"1 medium",a:"produce",seasonal:true},{n:"Dijon mustard",q:"2 tbsp",a:"condiments"},{n:"Thyme",q:"3 sprigs",a:"produce"},{n:"Crème fraîche",q:"100ml",a:"dairy"}],
   steps:["Heat oven to 200°C","Cube celeriac, toss in oil, roast 30 mins","Rub tenderloin with mustard and thyme","Sear all over 3 mins in hot pan","Roast alongside celeriac 15 mins, rest 5","Deglaze pan with stock and crème fraîche for sauce"]},
  {id:"d8",slot:"dinner",name:"Roast chicken & fennel",cal:580,prot:54,cost:11.0,time:75,effort:2,
   tags:["weekend","family","batch"],seasonal:["blood oranges"],weather:["cold"],
   goals:["family","wellbeing"],servings:4,
   batch:true,batchNote:"Carcass becomes stock. Cold leftovers tomorrow.",
   desc:"Whole roast chicken over fennel and blood oranges",
   why:"Sunday ritual. The leftovers pay dividends all week.",
   ings:[{n:"Whole chicken",q:"1.6kg",a:"protein"},{n:"Fennel bulb",q:"2",a:"produce"},{n:"Blood oranges",q:"2",a:"produce",seasonal:true},{n:"Garlic",q:"4 cloves",a:"produce"},{n:"Butter",q:"40g",a:"dairy"}],
   steps:["Heat oven to 200°C","Quarter fennel, halve blood oranges, lay in tin","Rub chicken all over with butter, season generously","Sit on vegetables, roast 1hr 10mins","Rest 15 mins before carving — this matters","Use tin juices as jus"]},
  {id:"d9",slot:"dinner",name:"One-pan sausage & beans",cal:520,prot:34,cost:5.5,time:35,effort:1,
   tags:["quick","family","budget"],seasonal:[],weather:["cold","rainy"],
   goals:["family","budget"],servings:4,
   desc:"Good sausages, cannellini beans, tomatoes, sage",
   why:"One pan. 35 minutes. Kids eat it. Costs almost nothing.",
   ings:[{n:"Good sausages",q:"8",a:"protein"},{n:"Cannellini beans",q:"400g",a:"tins"},{n:"Tinned tomatoes",q:"400g",a:"tins"},{n:"Sage",q:"6 leaves",a:"produce"},{n:"Garlic",q:"2 cloves",a:"produce"}],
   steps:["Brown sausages all over in large pan","Remove, add garlic and sage to fat","Add tomatoes and beans","Nestle sausages back in","Cover and simmer 25 mins"]},
  {id:"d10",slot:"dinner",name:"Prawn stir-fry",cal:420,prot:38,cost:9.0,time:15,effort:1,
   tags:["quick","high-prot"],seasonal:[],weather:["any"],
   goals:["muscle","loseweight"],servings:2,
   desc:"King prawns, pak choi, ginger, garlic, soy noodles",
   why:"15 minutes. 38g protein. Faster than a takeaway.",
   ings:[{n:"King prawns",q:"300g",a:"protein"},{n:"Pak choi",q:"2",a:"produce"},{n:"Noodles",q:"200g",a:"grains"},{n:"Ginger",q:"1 thumb",a:"produce"},{n:"Garlic",q:"2 cloves",a:"produce"},{n:"Soy sauce",q:"2 tbsp",a:"condiments"}],
   steps:["Cook noodles per packet, drain","Heat wok until smoking","Stir-fry prawns 2 mins — just pink","Add garlic, ginger, pak choi — 2 mins","Add noodles and soy, toss everything together"]},
];

// ── HELPERS ────────────────────────────────────────────────────
const AISLES = {
  protein:    {label:"Meat & Fish",    icon:"🥩", order:1},
  dairy:      {label:"Dairy",          icon:"🥛", order:2},
  produce:    {label:"Fresh Produce",  icon:"🥦", order:3},
  grains:     {label:"Grains & Pasta", icon:"🌾", order:4},
  tins:       {label:"Tins & Pulses",  icon:"🥫", order:5},
  condiments: {label:"Oils & Sauces",  icon:"🫙", order:6},
  bakery:     {label:"Bakery",         icon:"🍞", order:7},
  storecup:   {label:"Store Cupboard", icon:"📦", order:8},
  other:      {label:"Other",          icon:"🛒", order:9},
};

function wCode(code, max) {
  if(code>=80) return{icon:"🌦️",label:"Showers",  mood:"rainy"};
  if(code>=51) return{icon:"🌧️",label:"Rainy",    mood:"rainy"};
  if(code===3)  return{icon:"☁️", label:"Overcast",mood:max<10?"cold":"mild"};
  if(code<=2)   return{icon:"☀️", label:"Clear",   mood:max>16?"warm":"mild"};
  return{icon:"⛅",label:"Cloudy",mood:"mild"};
}

function useWeather() {
  const [wx, setWx] = useState(null);
  useEffect(()=>{
    fetch("https://api.open-meteo.com/v1/forecast?latitude=51.5074&longitude=-0.1278&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Europe/London&forecast_days=7")
      .then(r=>r.json())
      .then(d=>setWx({days:DAYS.map((day,i)=>({day,code:d.daily.weathercode[i],max:Math.round(d.daily.temperature_2m_max[i]),min:Math.round(d.daily.temperature_2m_min[i])}))}))
      .catch(()=>{
        const codes=[63,61,3,2,80,1,2];
        const maxes=[9,8,11,12,10,13,14];
        const mins=[4,3,5,6,4,7,8];
        setWx({days:DAYS.map((day,i)=>({day,code:codes[i],max:maxes[i],min:mins[i]}))});
      });
  },[]);
  return wx;
}

// Recommendation engine — scores recipes for a given context
function scoreRecipe(r, context) {
  let score = 50;
  const {goal, wx, slot, tonight, servings, avoidIds, recentIds} = context;
  
  // Goal alignment
  if(r.goals?.includes(goal)) score += 20;
  
  // Weather alignment
  const mood = wx?.mood || "mild";
  if(r.weather?.includes(mood)) score += 10;
  if(r.weather?.includes("any")) score += 5;
  
  // Seasonal bonus
  if(r.seasonal?.some(s => SEASON.items.includes(s))) score += 15;
  
  // Tonight urgency — quick meals score higher on weeknights
  if(tonight && r.time <= 30) score += 10;
  if(tonight && r.time > 60) score -= 10;
  
  // Avoid recently seen
  if(recentIds?.includes(r.id)) score -= 30;
  
  // Servings match
  if(servings === 1 && r.tags?.includes("quick")) score += 5;
  if(servings >= 4 && r.tags?.includes("family")) score += 10;
  
  return score;
}

function getRecommendations(slot, context, count=6) {
  return RECIPES
    .filter(r => r.slot === slot && !context.avoidIds?.includes(r.id))
    .map(r => ({...r, score: scoreRecipe(r, context)}))
    .sort((a,b) => b.score - a.score)
    .slice(0, count);
}

// Build a full week plan
function buildWeekPlan(profile) {
  const {goal, servings, avoidFoods=[]} = profile;
  const week = {};
  const usedIds = [];
  
  DAYS.forEach((day, i) => {
    const isWeekend = i >= 5;
    const isTonight = i === TODAY_IDX;
    const context = {goal, servings, tonight: !isWeekend, recentIds: usedIds};
    
    const breakfast = getRecommendations("breakfast", context, 3)[0];
    const lunch = getRecommendations("lunch", context, 3)[0];
    const dinner = getRecommendations("dinner", {...context, tonight: !isWeekend}, 3)[0];
    
    if(breakfast) usedIds.push(breakfast.id);
    if(lunch) usedIds.push(lunch.id);
    if(dinner) usedIds.push(dinner.id);
    
    week[day] = {
      breakfast: breakfast?.id || "b5",
      lunch: lunch?.id || "l3",
      dinner: dinner?.id || "d3",
      servings: servings || 1,
    };
  });
  
  return week;
}

function getMeal(id) { return RECIPES.find(r => r.id === id); }

function dayTotals(dayPlan) {
  return ["breakfast","lunch","dinner"].reduce((a,s) => {
    const m = getMeal(dayPlan[s]);
    return m ? {cal:a.cal+m.cal, prot:a.prot+m.prot, cost:a.cost+m.cost} : a;
  }, {cal:0, prot:0, cost:0});
}

// ── SHARED UI ──────────────────────────────────────────────────
const S = {
  fontSerif: "'Fraunces', Georgia, serif",
  fontSans:  "'DM Sans', system-ui, sans-serif",
};

function Pill({children, bg=C.bg, fg=C.muted, sm, onClick}) {
  return (
    <span onClick={onClick} style={{display:"inline-flex",alignItems:"center",gap:3,padding:sm?"2px 8px":"4px 12px",borderRadius:100,background:bg,color:fg,fontFamily:S.fontSans,fontSize:sm?10:12,fontWeight:500,whiteSpace:"nowrap",cursor:onClick?"pointer":"default",userSelect:"none"}}>
      {children}
    </span>
  );
}

function SeasonalPill({sm}) {
  return <Pill bg={C.sage} fg={C.sageText} sm={sm}>🌿 Seasonal</Pill>;
}

function MealCard({recipe, compact, onSwap, onCook, isToday}) {
  if(!recipe) return null;
  const isSeasonal = recipe.seasonal?.some(s => SEASON.items.includes(s));
  return (
    <div style={{background:C.card,borderRadius:16,padding:compact?"14px":"18px",border:`1px solid ${C.border}`,position:"relative"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",flex:1}}>
          {isSeasonal && <SeasonalPill sm/>}
          {recipe.batch && <Pill bg={C.forestLight} fg={C.forest} sm>📦 Batch</Pill>}
          {recipe.time<=15 && <Pill bg={C.warn} fg={C.warnText} sm>⚡ Quick</Pill>}
        </div>
        <div style={{display:"flex",gap:6}}>
          {onCook && <button onClick={onCook} style={{background:C.forestLight,border:"none",borderRadius:8,padding:"5px 10px",color:C.forest,fontFamily:S.fontSans,fontSize:11,fontWeight:600,cursor:"pointer"}}>cook</button>}
          {onSwap && <button onClick={onSwap} style={{background:C.forest,border:"none",borderRadius:8,padding:"5px 10px",color:C.cream,fontFamily:S.fontSans,fontSize:11,fontWeight:600,cursor:"pointer"}}>swap</button>}
        </div>
      </div>
      <div style={{fontFamily:S.fontSerif,fontSize:compact?16:19,color:C.ink,fontWeight:400,lineHeight:1.3,marginBottom:6}}>{recipe.name}</div>
      {!compact && <div style={{fontFamily:S.fontSans,fontSize:12,color:C.muted,marginBottom:8,lineHeight:1.4}}>{recipe.desc}</div>}
      <div style={{display:"flex",gap:12}}>
        <span style={{fontFamily:S.fontSans,fontSize:12,color:C.muted}}>🔥 {recipe.cal}kcal</span>
        <span style={{fontFamily:S.fontSans,fontSize:12,color:C.muted}}>💪 {recipe.prot}g</span>
        <span style={{fontFamily:S.fontSans,fontSize:12,color:C.muted}}>⏱ {recipe.time}m</span>
        <span style={{fontFamily:S.fontSans,fontSize:12,color:C.muted}}>£{recipe.cost.toFixed(2)}</span>
      </div>
      {!compact && recipe.why && (
        <div style={{marginTop:8,fontFamily:S.fontSans,fontSize:11,color:C.forest,background:C.forestLight,borderRadius:8,padding:"5px 10px"}}>
          💡 {recipe.why}
        </div>
      )}
      {!compact && recipe.batchNote && (
        <div style={{marginTop:6,fontFamily:S.fontSans,fontSize:11,color:C.gold,background:C.goldLight,borderRadius:8,padding:"5px 10px"}}>
          📦 {recipe.batchNote}
        </div>
      )}
    </div>
  );
}

// ── ONBOARDING ─────────────────────────────────────────────────
function Onboarding({onComplete}) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({goal:"wellbeing", servings:2, avoidFoods:[]});
  const avoidOptions = ["Fish","Meat","Dairy","Gluten","Nuts","Shellfish","Spicy food"];

  function toggleAvoid(item) {
    setProfile(p => ({
      ...p,
      avoidFoods: p.avoidFoods.includes(item)
        ? p.avoidFoods.filter(x => x!==item)
        : [...p.avoidFoods, item]
    }));
  }

  const steps = [
    // Step 0 — Welcome
    <div key="welcome" style={{display:"flex",flexDirection:"column",height:"100%",justifyContent:"space-between"}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px"}}>
        <div style={{width:72,height:72,borderRadius:24,background:C.forest,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:24,fontSize:32}}>🌿</div>
        <div style={{fontFamily:S.fontSerif,fontSize:36,color:C.cream,fontWeight:300,textAlign:"center",lineHeight:1.2,marginBottom:16}}>
          Meet Plait.
        </div>
        <div style={{fontFamily:S.fontSans,fontSize:16,color:"rgba(250,248,244,0.6)",textAlign:"center",lineHeight:1.6,maxWidth:280}}>
          The meal planner that plans around your life, not just your diet.
        </div>
      </div>
      <div style={{padding:"0 24px 48px"}}>
        <button onClick={()=>setStep(1)} style={{width:"100%",padding:"16px",borderRadius:14,border:"none",background:C.clay,color:C.cream,fontFamily:S.fontSans,fontSize:16,fontWeight:600,cursor:"pointer"}}>
          Get started →
        </button>
        <div style={{fontFamily:S.fontSans,fontSize:12,color:"rgba(250,248,244,0.3)",textAlign:"center",marginTop:12}}>
          Three quick questions. No account needed.
        </div>
      </div>
    </div>,

    // Step 1 — Goal
    <div key="goal" style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{padding:"52px 24px 24px"}}>
        <div style={{fontFamily:S.fontSans,fontSize:12,color:"rgba(250,248,244,0.4)",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>1 of 3</div>
        <div style={{fontFamily:S.fontSerif,fontSize:28,color:C.cream,fontWeight:300,lineHeight:1.2,marginBottom:6}}>What's the main thing you want from your food?</div>
        <div style={{fontFamily:S.fontSans,fontSize:13,color:"rgba(250,248,244,0.45)"}}>Plait uses this to recommend the right meals</div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 24px"}}>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {GOALS.map(g => (
            <button key={g.id} onClick={()=>{setProfile(p=>({...p,goal:g.id}));setStep(2);}}
              style={{padding:"16px",borderRadius:14,border:`2px solid ${profile.goal===g.id?C.forest:"rgba(255,255,255,0.08)"}`,background:profile.goal===g.id?"rgba(42,74,53,0.5)":"rgba(255,255,255,0.04)",cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:24}}>{g.icon}</span>
                <div>
                  <div style={{fontFamily:S.fontSans,fontSize:15,color:C.cream,fontWeight:600,marginBottom:2}}>{g.label}</div>
                  <div style={{fontFamily:S.fontSans,fontSize:12,color:"rgba(250,248,244,0.45)"}}>{g.desc}</div>
                </div>
                {profile.goal===g.id && <div style={{marginLeft:"auto",color:C.sage,fontSize:18}}>✓</div>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>,

    // Step 2 — Household size
    <div key="household" style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{padding:"52px 24px 24px"}}>
        <div style={{fontFamily:S.fontSans,fontSize:12,color:"rgba(250,248,244,0.4)",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>2 of 3</div>
        <div style={{fontFamily:S.fontSerif,fontSize:28,color:C.cream,fontWeight:300,lineHeight:1.2,marginBottom:6}}>How many people are you usually cooking for?</div>
        <div style={{fontFamily:S.fontSans,fontSize:13,color:"rgba(250,248,244,0.45)"}}>You can change this day by day later</div>
      </div>
      <div style={{flex:1,padding:"0 24px",display:"flex",flexDirection:"column",gap:10}}>
        {[
          {n:1,label:"Just me",icon:"🧑",desc:"Single-serve meals, batch options"},
          {n:2,label:"Me & one other",icon:"👫",desc:"Couples and easy halving"},
          {n:4,label:"Family",icon:"👨‍👧",desc:"Kid-friendly, bigger portions"},
          {n:0,label:"It varies",icon:"🔄",desc:"I'll set it day by day"},
        ].map(opt => (
          <button key={opt.n} onClick={()=>{setProfile(p=>({...p,servings:opt.n}));setStep(3);}}
            style={{padding:"16px",borderRadius:14,border:`2px solid ${profile.servings===opt.n?C.forest:"rgba(255,255,255,0.08)"}`,background:profile.servings===opt.n?"rgba(42,74,53,0.5)":"rgba(255,255,255,0.04)",cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:24}}>{opt.icon}</span>
              <div>
                <div style={{fontFamily:S.fontSans,fontSize:15,color:C.cream,fontWeight:600,marginBottom:2}}>{opt.label}</div>
                <div style={{fontFamily:S.fontSans,fontSize:12,color:"rgba(250,248,244,0.45)"}}>{opt.desc}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>,

    // Step 3 — Avoid
    <div key="avoid" style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{padding:"52px 24px 24px"}}>
        <div style={{fontFamily:S.fontSans,fontSize:12,color:"rgba(250,248,244,0.4)",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>3 of 3</div>
        <div style={{fontFamily:S.fontSerif,fontSize:28,color:C.cream,fontWeight:300,lineHeight:1.2,marginBottom:6}}>Anything nobody eats?</div>
        <div style={{fontFamily:S.fontSans,fontSize:13,color:"rgba(250,248,244,0.45)"}}>Allergies, strong dislikes, dietary choices</div>
      </div>
      <div style={{flex:1,padding:"0 24px",display:"flex",flexDirection:"column",gap:10}}>
        <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
          {avoidOptions.map(item => {
            const sel = profile.avoidFoods.includes(item);
            return (
              <button key={item} onClick={()=>toggleAvoid(item)}
                style={{padding:"10px 16px",borderRadius:100,border:`2px solid ${sel?C.clay:"rgba(255,255,255,0.1)"}`,background:sel?"rgba(196,98,45,0.3)":"rgba(255,255,255,0.04)",color:sel?C.cream:"rgba(250,248,244,0.6)",fontFamily:S.fontSans,fontSize:13,fontWeight:500,cursor:"pointer",transition:"all 0.15s"}}>
                {sel?"✓ ":""}{item}
              </button>
            );
          })}
        </div>
        <div style={{marginTop:8,fontFamily:S.fontSans,fontSize:12,color:"rgba(250,248,244,0.3)"}}>
          Tap to select any that apply. You can always update this later.
        </div>
      </div>
      <div style={{padding:"0 24px 48px"}}>
        <button onClick={()=>onComplete(profile)}
          style={{width:"100%",padding:"16px",borderRadius:14,border:"none",background:C.clay,color:C.cream,fontFamily:S.fontSans,fontSize:16,fontWeight:600,cursor:"pointer"}}>
          {profile.avoidFoods.length===0 ? "Nothing to avoid — let's go →" : `Got it — let's go →`}
        </button>
      </div>
    </div>,
  ];

  return (
    <div style={{height:"100vh",background:"#1c1814",display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
      <style>{FONTS}</style>
      {/* Progress bar */}
      {step>0 && (
        <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"rgba(255,255,255,0.1)"}}>
          <div style={{height:"100%",background:C.clay,width:`${(step/3)*100}%`,transition:"width 0.4s ease"}}/>
        </div>
      )}
      {step>0 && (
        <button onClick={()=>setStep(s=>s-1)} style={{position:"absolute",top:16,left:16,background:"none",border:"none",color:"rgba(250,248,244,0.4)",fontFamily:S.fontSans,fontSize:14,cursor:"pointer",zIndex:10}}>← back</button>
      )}
      {steps[step]}
    </div>
  );
}

// ── TODAY SCREEN ───────────────────────────────────────────────
function TodayScreen({week, setWeek, weather, profile, onSwap, onCook}) {
  const [dayIdx, setDayIdx] = useState(TODAY_IDX);
  const dayKey = DAYS[dayIdx];
  const dayPlan = week[dayKey];
  const totals = dayTotals(dayPlan);
  const wDay = weather?.days?.[dayIdx];
  const wx = wDay ? wCode(wDay.code, wDay.max) : null;
  const goal = GOALS.find(g=>g.id===profile.goal);
  const isToday = dayIdx === TODAY_IDX;

  const slotMeta = {
    breakfast:{icon:"🌅",bg:"#fffbeb",label:"Breakfast"},
    lunch:    {icon:"☀️",bg:"#f0f9f0",label:"Lunch"},
    dinner:   {icon:"🌙",bg:"#f3f0f9",label:"Dinner"},
  };

  return (
    <div style={{flex:1,overflowY:"auto",paddingBottom:80}}>
      {/* Header */}
      <div style={{background:C.forest,padding:"52px 20px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div>
            <div style={{fontFamily:S.fontSans,fontSize:11,color:"rgba(250,248,244,0.45)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>
              {SEASON.e} {SEASON.n} · London
            </div>
            <div style={{fontFamily:S.fontSerif,fontSize:34,color:C.cream,fontWeight:300,letterSpacing:"-0.02em"}}>
              {isToday ? "Today" : ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"][dayIdx]}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}>
            {wx && <Pill bg="rgba(255,255,255,0.12)" fg={C.cream}>{wx.icon} {wDay?.max}°C</Pill>}
            <Pill bg="rgba(255,255,255,0.08)" fg="rgba(250,248,244,0.5)" sm>{goal?.icon} {goal?.label}</Pill>
          </div>
        </div>

        {/* Day strip */}
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:16}}>
          {DAYS.map((d,i) => {
            const wd = weather?.days?.[i];
            const wx2 = wd ? wCode(wd.code, wd.max) : null;
            const active = i===dayIdx;
            const isT = i===TODAY_IDX;
            return (
              <div key={d} onClick={()=>setDayIdx(i)} style={{flexShrink:0,minWidth:50,textAlign:"center",padding:"8px 10px",borderRadius:12,background:active?"rgba(255,255,255,0.18)":"rgba(255,255,255,0.05)",border:`1.5px solid ${active?"rgba(255,255,255,0.3)":"transparent"}`,cursor:"pointer",transition:"all 0.15s"}}>
                <div style={{fontFamily:S.fontSans,fontSize:10,color:active?C.cream:"rgba(250,248,244,0.35)",fontWeight:active?600:400,marginBottom:2}}>{d}</div>
                <div style={{fontSize:13}}>{wx2?.icon||"·"}</div>
                <div style={{fontFamily:S.fontSans,fontSize:9,color:active?C.cream:"rgba(250,248,244,0.35)",marginTop:1}}>{wd?`${wd.max}°`:""}</div>
                {isT && <div style={{width:3,height:3,borderRadius:"50%",background:C.clay,margin:"3px auto 0"}}/>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Macro ring */}
      <div style={{margin:"14px 16px 0",background:C.card,borderRadius:16,padding:"14px 16px",border:`1px solid ${C.border}`,display:"flex",gap:0}}>
        {[
          {label:"Calories",val:totals.cal,unit:"kcal",color:"#f97316"},
          {label:"Protein", val:totals.prot,unit:"g",  color:"#06b6d4"},
          {label:"Cost",    val:`£${totals.cost.toFixed(0)}`,color:"#22c55e"},
        ].map((m,i) => (
          <div key={m.label} style={{flex:1,textAlign:"center",borderRight:i<2?`1px solid ${C.border}`:"none"}}>
            <div style={{fontFamily:S.fontSerif,fontSize:22,color:C.ink,fontWeight:400}}>
              {m.val}{typeof m.val==="number"?<span style={{fontSize:10,color:C.muted,fontFamily:S.fontSans}}>{m.unit}</span>:""}
            </div>
            <div style={{fontFamily:S.fontSans,fontSize:10,color:C.muted,marginTop:1}}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Recommendation nudge */}
      {wx && (
        <div style={{margin:"10px 16px 0",background:wx.mood==="cold"||wx.mood==="rainy"?C.blue:C.goldLight,borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:16}}>{wx.mood==="cold"||wx.mood==="rainy"?"🔥":"🌿"}</span>
          <span style={{fontFamily:S.fontSans,fontSize:12,color:wx.mood==="cold"||wx.mood==="rainy"?C.blueText:C.gold,flex:1}}>
            {wx.mood==="cold"||wx.mood==="rainy"
              ? "Cold and wet today — Plait's surfaced warming meals for you"
              : wx.mood==="warm"
              ? "Nice day ahead — lighter meals featured today"
              : "Seasonal picks are highlighted in your plan today"}
          </span>
        </div>
      )}

      {/* Meal cards */}
      <div style={{padding:"14px 16px 0",display:"flex",flexDirection:"column",gap:10}}>
        {["breakfast","lunch","dinner"].map(slot => {
          const meta = slotMeta[slot];
          const recipe = getMeal(dayPlan[slot]);
          return (
            <div key={slot}>
              <div style={{fontFamily:S.fontSans,fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>{meta.icon} {meta.label}</div>
              <MealCard
                recipe={recipe}
                isToday={isToday}
                onSwap={()=>onSwap(dayKey, slot)}
                onCook={isToday?()=>onCook(slot, dayPlan[slot]):null}
              />
            </div>
          );
        })}
      </div>

      {/* Seasonal spotlight */}
      <div style={{margin:"16px 16px 0",background:C.forestLight,borderRadius:16,padding:"16px"}}>
        <div style={{fontFamily:S.fontSans,fontSize:11,color:C.forest,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>🌿 In season right now</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {SEASON.items.slice(0,6).map(item => (
            <Pill key={item} bg={C.sage} fg={C.sageText} sm>{item}</Pill>
          ))}
        </div>
        <div style={{fontFamily:S.fontSans,fontSize:11,color:C.forest,marginTop:8,opacity:0.7}}>
          Plait is using these in your plan this week
        </div>
      </div>
    </div>
  );
}

// ── PLAN SCREEN ────────────────────────────────────────────────
function PlanScreen({week, setWeek, weather, profile, onSwap}) {
  const [expanded, setExpanded] = useState(TODAY_IDX);

  return (
    <div style={{flex:1,overflowY:"auto",paddingBottom:80}}>
      <div style={{background:C.forest,padding:"52px 20px 20px"}}>
        <div style={{fontFamily:S.fontSans,fontSize:11,color:"rgba(250,248,244,0.45)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>Your week</div>
        <div style={{fontFamily:S.fontSerif,fontSize:32,color:C.cream,fontWeight:300,marginBottom:4}}>The plan</div>
        <div style={{fontFamily:S.fontSans,fontSize:13,color:"rgba(250,248,244,0.45)"}}>Tap any day to see meals. Tap swap to change anything.</div>
      </div>

      <div style={{padding:"14px 16px 0",display:"flex",flexDirection:"column",gap:8}}>
        {DAYS.map((day,i) => {
          const dayPlan = week[day];
          const totals = dayTotals(dayPlan);
          const wDay = weather?.days?.[i];
          const wx = wDay ? wCode(wDay.code, wDay.max) : null;
          const isOpen = expanded === i;
          const isToday = i === TODAY_IDX;

          return (
            <div key={day} style={{background:C.card,borderRadius:16,overflow:"hidden",border:`2px solid ${isToday?C.forest:C.border}`,transition:"border-color 0.2s"}}>
              {/* Day header — always visible */}
              <div onClick={()=>setExpanded(isOpen?-1:i)} style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
                <div style={{width:40,textAlign:"center"}}>
                  <div style={{fontFamily:S.fontSans,fontSize:11,color:isToday?C.forest:C.muted,fontWeight:isToday?700:400,textTransform:"uppercase",letterSpacing:"0.05em"}}>{day}</div>
                  {wx && <div style={{fontSize:16,marginTop:2}}>{wx.icon}</div>}
                  {isToday && <div style={{width:4,height:4,borderRadius:"50%",background:C.clay,margin:"2px auto 0"}}/>}
                </div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {["breakfast","lunch","dinner"].map(slot => {
                      const r = getMeal(dayPlan[slot]);
                      return r ? (
                        <div key={slot} style={{fontFamily:S.fontSans,fontSize:11,color:C.muted,background:C.bg,borderRadius:6,padding:"2px 7px"}}>{r.name.split(" ").slice(0,2).join(" ")}</div>
                      ) : null;
                    })}
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:S.fontSans,fontSize:12,color:C.muted}}>£{totals.cost.toFixed(0)}</div>
                  <div style={{fontFamily:S.fontSans,fontSize:11,color:C.mutedLight}}>{totals.cal}kcal</div>
                </div>
                <div style={{color:C.muted,fontSize:12,transform:isOpen?"rotate(180deg)":"",transition:"transform 0.2s"}}>▼</div>
              </div>

              {/* Expanded meals */}
              {isOpen && (
                <div style={{borderTop:`1px solid ${C.border}`,padding:"12px 16px",display:"flex",flexDirection:"column",gap:8}}>
                  {["breakfast","lunch","dinner"].map(slot => {
                    const r = getMeal(dayPlan[slot]);
                    const icons = {breakfast:"🌅",lunch:"☀️",dinner:"🌙"};
                    return (
                      <div key={slot}>
                        <div style={{fontFamily:S.fontSans,fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{icons[slot]} {slot}</div>
                        <MealCard recipe={r} compact onSwap={()=>onSwap(day,slot)}/>
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
function SwapScreen({target, week, setWeek, weather, profile, onDone}) {
  const [filter, setFilter] = useState("recommended");

  if(!target) return (
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40,paddingBottom:80}}>
      <div style={{fontSize:48,marginBottom:16}}>🔄</div>
      <div style={{fontFamily:S.fontSerif,fontSize:22,color:C.ink,marginBottom:8,textAlign:"center"}}>Nothing to swap</div>
      <div style={{fontFamily:S.fontSans,fontSize:14,color:C.muted,textAlign:"center"}}>Tap "swap" on any meal in Today or Plan to change it</div>
    </div>
  );

  const {day, slot} = target;
  const wDay = weather?.days?.find(d=>d.day===day);
  const wx = wDay ? wCode(wDay.code, wDay.max) : null;
  const current = getMeal(week[day][slot]);

  const filters = [
    {id:"recommended", label:"For you"},
    {id:"quick",       label:"⚡ Quick"},
    {id:"seasonal",    label:"🌿 Seasonal"},
    {id:"high-prot",   label:"💪 Protein"},
    {id:"batch",       label:"📦 Batch"},
    {id:"budget",      label:"💷 Budget"},
  ];

  const context = {goal:profile.goal, wx, slot, tonight:true, servings:profile.servings, recentIds:[]};
  
  const allMeals = RECIPES.filter(r => r.slot === slot)
    .map(r => ({...r, score: scoreRecipe(r, context)}))
    .sort((a,b) => b.score - a.score);

  const filtered = allMeals.filter(m => {
    if(filter==="recommended") return true;
    if(filter==="quick")       return m.time <= 20;
    if(filter==="seasonal")    return m.seasonal?.some(s => SEASON.items.includes(s));
    if(filter==="high-prot")   return m.prot >= 35;
    if(filter==="batch")       return m.batch;
    if(filter==="budget")      return m.cost <= 5;
    return true;
  });

  function select(id) {
    setWeek(w => ({...w,[day]:{...w[day],[slot]:id}}));
    onDone();
  }

  return (
    <div style={{flex:1,overflowY:"auto",paddingBottom:80}}>
      <div style={{background:C.forest,padding:"52px 20px 20px"}}>
        <div style={{fontFamily:S.fontSans,fontSize:11,color:"rgba(250,248,244,0.45)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{day} · {slot}</div>
        <div style={{fontFamily:S.fontSerif,fontSize:28,color:C.cream,fontWeight:300,marginBottom:6}}>Choose a {slot}</div>
        {current && <div style={{fontFamily:S.fontSans,fontSize:13,color:"rgba(250,248,244,0.45)"}}>Currently: {current.name}</div>}
        {wx && <div style={{fontFamily:S.fontSans,fontSize:12,color:"rgba(250,248,244,0.35)",marginTop:4}}>{wx.icon} {wDay?.max}°C · recommendations adjusted</div>}
      </div>

      {/* Filter chips */}
      <div style={{padding:"12px 16px",display:"flex",gap:7,overflowX:"auto"}}>
        {filters.map(f => (
          <button key={f.id} onClick={()=>setFilter(f.id)} style={{flexShrink:0,padding:"8px 14px",borderRadius:100,border:`1.5px solid ${filter===f.id?C.forest:C.border}`,background:filter===f.id?C.forest:C.card,color:filter===f.id?C.cream:C.muted,fontFamily:S.fontSans,fontSize:12,fontWeight:500,cursor:"pointer",transition:"all 0.15s"}}>
            {f.label}
          </button>
        ))}
      </div>

      <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:10}}>
        {filtered.map(m => {
          const isCurrent = m.id === week[day][slot];
          const isSeasonal = m.seasonal?.some(s => SEASON.items.includes(s));
          return (
            <div key={m.id} onClick={()=>select(m.id)}
              style={{background:isCurrent?"#f0f7f0":C.card,border:`2px solid ${isCurrent?C.forest:C.border}`,borderRadius:16,padding:"16px",cursor:"pointer",position:"relative",transition:"all 0.15s"}}
              onTouchStart={e=>e.currentTarget.style.transform="scale(0.98)"}
              onTouchEnd={e=>e.currentTarget.style.transform=""}>
              {isCurrent && <div style={{position:"absolute",top:12,right:12,background:C.forest,borderRadius:100,padding:"2px 10px",fontFamily:S.fontSans,fontSize:10,color:C.cream,fontWeight:600}}>current</div>}
              <div style={{display:"flex",gap:6,marginBottom:6,flexWrap:"wrap"}}>
                {isSeasonal && <SeasonalPill sm/>}
                {m.batch && <Pill bg={C.forestLight} fg={C.forest} sm>📦 Batch</Pill>}
                {m.time<=20 && <Pill bg={C.warn} fg={C.warnText} sm>⚡ Quick</Pill>}
                {m.goals?.includes(profile.goal) && <Pill bg={C.blue} fg={C.blueText} sm>✓ Matches your goal</Pill>}
              </div>
              <div style={{fontFamily:S.fontSerif,fontSize:18,color:C.ink,fontWeight:400,lineHeight:1.3,marginBottom:4}}>{m.name}</div>
              <div style={{fontFamily:S.fontSans,fontSize:12,color:C.muted,marginBottom:8}}>{m.desc}</div>
              <div style={{display:"flex",gap:12}}>
                <span style={{fontFamily:S.fontSans,fontSize:12,color:C.muted}}>🔥 {m.cal}kcal</span>
                <span style={{fontFamily:S.fontSans,fontSize:12,color:C.muted}}>💪 {m.prot}g</span>
                <span style={{fontFamily:S.fontSans,fontSize:12,color:C.muted}}>⏱ {m.time}m</span>
                <span style={{fontFamily:S.fontSans,fontSize:12,color:C.muted}}>£{m.cost.toFixed(2)}</span>
              </div>
              {m.why && <div style={{marginTop:8,fontFamily:S.fontSans,fontSize:11,color:C.forest,background:C.forestLight,borderRadius:8,padding:"5px 10px"}}>💡 {m.why}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── SHOP SCREEN ────────────────────────────────────────────────
function ShopScreen({week}) {
  const [checked, setChecked] = useState({});
  const [aisleFilter, setAisleFilter] = useState("all");

  // Consolidate ingredients
  const raw = {};
  DAYS.forEach(d => ["breakfast","lunch","dinner"].forEach(slot => {
    const r = getMeal(week[d][slot]);
    if(!r) return;
    (r.ings||[]).forEach(ing => {
      const key = ing.n.toLowerCase();
      if(!raw[key]) raw[key] = {...ing, count:0, meals:[]};
      raw[key].count++;
      if(!raw[key].meals.includes(r.name)) raw[key].meals.push(r.name);
    });
  }));

  const byAisle = {};
  Object.values(raw).forEach(item => {
    const a = item.a || "storecup";
    if(!byAisle[a]) byAisle[a] = [];
    byAisle[a].push(item);
  });

  const sorted = Object.entries(byAisle).sort((a,b) => (AISLES[a[0]]?.order||99)-(AISLES[b[0]]?.order||99));
  const allItems = Object.values(byAisle).flat();
  const doneCount = allItems.filter(i => checked[i.n]).length;
  const totalCount = allItems.length;
  const pct = totalCount > 0 ? (doneCount/totalCount)*100 : 0;

  const display = aisleFilter==="all" ? sorted : sorted.filter(([k])=>k===aisleFilter);

  return (
    <div style={{flex:1,overflowY:"auto",paddingBottom:80}}>
      <div style={{background:C.forest,padding:"52px 20px 20px"}}>
        <div style={{fontFamily:S.fontSans,fontSize:11,color:"rgba(250,248,244,0.45)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>Shopping</div>
        <div style={{fontFamily:S.fontSerif,fontSize:32,color:C.cream,fontWeight:300,marginBottom:12}}>This week's list</div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{flex:1,background:"rgba(255,255,255,0.1)",borderRadius:100,height:6,overflow:"hidden"}}>
            <div style={{width:`${pct}%`,background:pct===100?C.clay:C.cream,height:"100%",borderRadius:100,transition:"width 0.3s"}}/>
          </div>
          <div style={{fontFamily:S.fontSans,fontSize:12,color:"rgba(250,248,244,0.6)",whiteSpace:"nowrap"}}>{doneCount}/{totalCount}</div>
        </div>
      </div>

      {/* Aisle filter */}
      <div style={{padding:"12px 16px",display:"flex",gap:6,overflowX:"auto"}}>
        <button onClick={()=>setAisleFilter("all")} style={{flexShrink:0,padding:"7px 14px",borderRadius:100,border:`1.5px solid ${aisleFilter==="all"?C.forest:C.border}`,background:aisleFilter==="all"?C.forest:C.card,color:aisleFilter==="all"?C.cream:C.muted,fontFamily:S.fontSans,fontSize:12,fontWeight:500,cursor:"pointer"}}>All</button>
        {sorted.map(([key]) => {
          const ai = AISLES[key];
          return (
            <button key={key} onClick={()=>setAisleFilter(key)} style={{flexShrink:0,padding:"7px 14px",borderRadius:100,border:`1.5px solid ${aisleFilter===key?C.forest:C.border}`,background:aisleFilter===key?C.forest:C.card,color:aisleFilter===key?C.cream:C.muted,fontFamily:S.fontSans,fontSize:12,fontWeight:500,cursor:"pointer"}}>
              {ai?.icon} {ai?.label}
            </button>
          );
        })}
      </div>

      <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:10}}>
        {display.map(([aisle, items]) => {
          const ai = AISLES[aisle] || {label:aisle,icon:"🛒"};
          const aisleDone = items.filter(i => checked[i.n]).length;
          return (
            <div key={aisle} style={{background:C.card,borderRadius:16,overflow:"hidden",border:`1px solid ${C.border}`}}>
              <div style={{padding:"12px 16px",background:C.cream,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:18}}>{ai.icon}</span>
                <span style={{fontFamily:S.fontSans,fontWeight:600,color:C.ink,fontSize:14,flex:1}}>{ai.label}</span>
                <span style={{fontFamily:S.fontSans,fontSize:12,color:aisleDone===items.length?C.forest:C.muted}}>{aisleDone}/{items.length}</span>
              </div>
              {items.map((item, ii) => {
                const done = checked[item.n];
                const isSeasonal = item.seasonal;
                return (
                  <div key={item.n} onClick={()=>setChecked(c=>({...c,[item.n]:!c[item.n]}))}
                    style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderBottom:ii<items.length-1?`1px solid ${C.border}`:"none",background:done?"#f8fdf8":"transparent",cursor:"pointer",minHeight:58,transition:"background 0.15s"}}>
                    <div style={{width:24,height:24,borderRadius:7,border:`2px solid ${done?C.forest:C.border}`,background:done?C.forest:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}>
                      {done && <span style={{color:"#fff",fontSize:11,fontWeight:800}}>✓</span>}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:S.fontSans,fontWeight:500,color:done?"#94a3b8":C.ink,fontSize:15,textDecoration:done?"line-through":"none",marginBottom:2}}>{item.n}</div>
                      <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
                        <span style={{fontFamily:S.fontSans,fontSize:12,color:C.muted}}>{item.q}</span>
                        {item.count>1 && <Pill bg={C.bg} fg={C.muted} sm>×{item.count} this week</Pill>}
                        {isSeasonal && <SeasonalPill sm/>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {doneCount===totalCount && totalCount>0 && (
        <div style={{margin:"16px",background:C.forest,borderRadius:16,padding:"24px",textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:8}}>🎉</div>
          <div style={{fontFamily:S.fontSerif,fontSize:22,color:C.cream,marginBottom:4}}>You've got everything</div>
          <div style={{fontFamily:S.fontSans,fontSize:13,color:"rgba(250,248,244,0.55)"}}>Good week ahead.</div>
        </div>
      )}
    </div>
  );
}

// ── COOK SCREEN ────────────────────────────────────────────────
function CookScreen({cookTarget, week, weather}) {
  const [dayIdx, setDayIdx] = useState(TODAY_IDX);
  const [slot, setSlot] = useState(cookTarget?.slot || "dinner");
  const [step, setStep] = useState(0);
  const dayKey = DAYS[dayIdx];
  const recipe = getMeal(week[dayKey][slot]);
  const wDay = weather?.days?.[dayIdx];
  const wx = wDay ? wCode(wDay.code, wDay.max) : null;
  const slotIcons = {breakfast:"🌅",lunch:"☀️",dinner:"🌙"};

  return (
    <div style={{flex:1,overflowY:"auto",paddingBottom:80}}>
      <div style={{background:C.forest,padding:"52px 20px 20px"}}>
        <div style={{fontFamily:S.fontSans,fontSize:11,color:"rgba(250,248,244,0.45)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>Cook mode</div>
        <div style={{fontFamily:S.fontSerif,fontSize:30,color:C.cream,fontWeight:300,marginBottom:16}}>Let's cook</div>

        {/* Day selector */}
        <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:12}}>
          {DAYS.map((d,i) => (
            <button key={d} onClick={()=>{setDayIdx(i);setStep(0);}} style={{flexShrink:0,padding:"6px 12px",borderRadius:100,border:"none",background:dayIdx===i?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.06)",color:dayIdx===i?C.cream:"rgba(250,248,244,0.4)",fontFamily:S.fontSans,fontSize:12,fontWeight:dayIdx===i?600:400,cursor:"pointer",transition:"all 0.15s"}}>{d}</button>
          ))}
        </div>

        {/* Slot selector */}
        <div style={{display:"flex",gap:8}}>
          {["breakfast","lunch","dinner"].map(s => {
            const r = getMeal(week[dayKey][s]);
            const active = slot===s;
            return (
              <button key={s} onClick={()=>{setSlot(s);setStep(0);}} style={{flex:1,padding:"10px 6px",borderRadius:12,border:`1.5px solid ${active?"rgba(255,255,255,0.4)":"rgba(255,255,255,0.08)"}`,background:active?"rgba(255,255,255,0.15)":"transparent",cursor:"pointer",textAlign:"center",transition:"all 0.15s"}}>
                <div style={{fontSize:16,marginBottom:2}}>{slotIcons[s]}</div>
                <div style={{fontFamily:S.fontSans,fontSize:9,color:active?C.cream:"rgba(250,248,244,0.35)",fontWeight:500,marginBottom:2,textTransform:"uppercase",letterSpacing:"0.04em"}}>{s}</div>
                <div style={{fontFamily:S.fontSans,fontSize:9,color:"rgba(250,248,244,0.3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r?.name.split(" ").slice(0,2).join(" ")||"—"}</div>
              </button>
            );
          })}
        </div>
      </div>

      {recipe ? (
        <div style={{padding:"16px 16px 0",display:"flex",flexDirection:"column",gap:12}}>
          {/* Meal header */}
          <div style={{background:C.card,borderRadius:16,padding:"18px",border:`1px solid ${C.border}`}}>
            <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
              {recipe.seasonal?.some(s=>SEASON.items.includes(s)) && <SeasonalPill sm/>}
              {recipe.batch && <Pill bg={C.forestLight} fg={C.forest} sm>📦 Batch</Pill>}
            </div>
            <div style={{fontFamily:S.fontSerif,fontSize:24,color:C.ink,fontWeight:400,lineHeight:1.3,marginBottom:8}}>{recipe.name}</div>
            <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
              <span style={{fontFamily:S.fontSans,fontSize:13,color:C.muted}}>⏱ {recipe.time} mins total</span>
              <span style={{fontFamily:S.fontSans,fontSize:13,color:C.muted}}>🔥 {recipe.cal}kcal</span>
              <span style={{fontFamily:S.fontSans,fontSize:13,color:C.muted}}>💪 {recipe.prot}g protein</span>
            </div>
            {recipe.batchNote && (
              <div style={{marginTop:10,fontFamily:S.fontSans,fontSize:12,color:C.gold,background:C.goldLight,borderRadius:8,padding:"6px 10px"}}>{recipe.batchNote}</div>
            )}
          </div>

          {/* Ingredients */}
          <div style={{background:C.card,borderRadius:16,overflow:"hidden",border:`1px solid ${C.border}`}}>
            <div style={{padding:"12px 16px",background:C.cream,borderBottom:`1px solid ${C.border}`}}>
              <div style={{fontFamily:S.fontSans,fontWeight:600,color:C.ink,fontSize:13}}>You'll need</div>
            </div>
            {recipe.ings?.map((ing,i) => (
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:i<recipe.ings.length-1?`1px solid ${C.border}`:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontFamily:S.fontSans,fontSize:14,color:C.ink}}>{ing.n}</span>
                  {ing.seasonal && <SeasonalPill sm/>}
                </div>
                <span style={{fontFamily:S.fontSans,fontSize:13,color:C.muted}}>{ing.q}</span>
              </div>
            ))}
          </div>

          {/* Step by step */}
          {recipe.steps?.length > 0 && (
            <div style={{background:C.card,borderRadius:16,padding:"18px",border:`1px solid ${C.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{fontFamily:S.fontSans,fontWeight:600,color:C.ink,fontSize:13}}>Step by step</div>
                <div style={{fontFamily:S.fontSans,fontSize:12,color:C.muted}}>{step+1} of {recipe.steps.length}</div>
              </div>

              {/* Progress */}
              <div style={{display:"flex",gap:5,marginBottom:16}}>
                {recipe.steps.map((_,i) => (
                  <div key={i} onClick={()=>setStep(i)} style={{flex:1,height:4,borderRadius:2,background:i<=step?C.forest:C.border,cursor:"pointer",transition:"background 0.2s"}}/>
                ))}
              </div>

              {/* Current step */}
              <div style={{background:C.forestLight,borderRadius:14,padding:"20px",marginBottom:14,minHeight:90,display:"flex",alignItems:"center"}}>
                <div style={{fontFamily:S.fontSerif,fontSize:20,color:C.forest,fontWeight:400,lineHeight:1.5}}>
                  {recipe.steps[step]}
                </div>
              </div>

              {/* Nav */}
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0} style={{flex:1,padding:"14px",borderRadius:12,border:`1.5px solid ${step===0?C.border:C.forest}`,background:"transparent",color:step===0?C.border:C.forest,fontFamily:S.fontSans,fontSize:14,fontWeight:600,cursor:step===0?"not-allowed":"pointer",transition:"all 0.15s"}}>
                  ← Back
                </button>
                {step < recipe.steps.length-1
                  ? <button onClick={()=>setStep(s=>s+1)} style={{flex:2,padding:"14px",borderRadius:12,border:"none",background:C.forest,color:C.cream,fontFamily:S.fontSans,fontSize:14,fontWeight:600,cursor:"pointer"}}>
                      Next →
                    </button>
                  : <button style={{flex:2,padding:"14px",borderRadius:12,border:"none",background:C.clay,color:C.cream,fontFamily:S.fontSans,fontSize:14,fontWeight:600,cursor:"pointer"}}>
                      Done 🎉
                    </button>
                }
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{padding:40,textAlign:"center"}}>
          <div style={{fontFamily:S.fontSans,fontSize:14,color:C.muted}}>No meal planned</div>
        </div>
      )}
    </div>
  );
}

// ── DISCOVER SCREEN ────────────────────────────────────────────
function DiscoverScreen({profile, week, setWeek, weather, onSwap}) {
  const wx = weather?.days?.[TODAY_IDX];
  const wxData = wx ? wCode(wx.code, wx.max) : null;
  const context = {goal:profile.goal, wx:wxData, servings:profile.servings, recentIds:[]};

  const seasonalMeals = RECIPES.filter(r => r.seasonal?.some(s => SEASON.items.includes(s)));
  const goalMeals = RECIPES.filter(r => r.goals?.includes(profile.goal)).slice(0,4);
  const quickMeals = RECIPES.filter(r => r.time<=20).slice(0,4);
  const batchMeals = RECIPES.filter(r => r.batch).slice(0,4);

  function Section({title, subtitle, meals}) {
    return (
      <div style={{marginBottom:24}}>
        <div style={{padding:"0 16px",marginBottom:10}}>
          <div style={{fontFamily:S.fontSerif,fontSize:20,color:C.ink,fontWeight:400,marginBottom:2}}>{title}</div>
          {subtitle && <div style={{fontFamily:S.fontSans,fontSize:12,color:C.muted}}>{subtitle}</div>}
        </div>
        <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:8}}>
          {meals.map(m => {
            const isSeasonal = m.seasonal?.some(s => SEASON.items.includes(s));
            return (
              <div key={m.id} style={{background:C.card,borderRadius:14,padding:"14px",border:`1px solid ${C.border}`,display:"flex",gap:12,alignItems:"flex-start"}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:5,marginBottom:5,flexWrap:"wrap"}}>
                    {isSeasonal && <SeasonalPill sm/>}
                    {m.time<=20 && <Pill bg={C.warn} fg={C.warnText} sm>⚡ Quick</Pill>}
                    {m.goals?.includes(profile.goal) && <Pill bg={C.blue} fg={C.blueText} sm>✓ Your goal</Pill>}
                  </div>
                  <div style={{fontFamily:S.fontSerif,fontSize:16,color:C.ink,fontWeight:400,marginBottom:3}}>{m.name}</div>
                  <div style={{fontFamily:S.fontSans,fontSize:11,color:C.muted,marginBottom:5}}>{m.desc}</div>
                  <div style={{display:"flex",gap:10}}>
                    <span style={{fontFamily:S.fontSans,fontSize:11,color:C.muted}}>⏱ {m.time}m</span>
                    <span style={{fontFamily:S.fontSans,fontSize:11,color:C.muted}}>£{m.cost.toFixed(2)}</span>
                    <span style={{fontFamily:S.fontSans,fontSize:11,color:C.muted}}>💪 {m.prot}g</span>
                  </div>
                </div>
                <button onClick={()=>onSwap(null, m.slot, m.id)} style={{flexShrink:0,background:C.forestLight,border:"none",borderRadius:8,padding:"6px 12px",color:C.forest,fontFamily:S.fontSans,fontSize:11,fontWeight:600,cursor:"pointer",marginTop:4}}>
                  + Add
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{flex:1,overflowY:"auto",paddingBottom:80}}>
      <div style={{background:C.forest,padding:"52px 20px 20px"}}>
        <div style={{fontFamily:S.fontSans,fontSize:11,color:"rgba(250,248,244,0.45)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>Discover</div>
        <div style={{fontFamily:S.fontSerif,fontSize:32,color:C.cream,fontWeight:300,marginBottom:4}}>What to cook</div>
        <div style={{fontFamily:S.fontSans,fontSize:13,color:"rgba(250,248,244,0.45)"}}>Recommendations based on your goals, the season, and the weather.</div>
      </div>

      {/* Seasonal banner */}
      <div style={{margin:"16px 16px 0",background:C.forest,borderRadius:16,padding:"18px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-10,right:-10,fontSize:60,opacity:0.15}}>{SEASON.e}</div>
        <div style={{fontFamily:S.fontSans,fontSize:11,color:"rgba(250,248,244,0.5)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>In season · {SEASON.n}</div>
        <div style={{fontFamily:S.fontSerif,fontSize:18,color:C.cream,fontWeight:300,marginBottom:10}}>What's good right now</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {SEASON.items.map(item => <Pill key={item} bg="rgba(200,223,200,0.2)" fg={C.sage} sm>{item}</Pill>)}
        </div>
      </div>

      <div style={{marginTop:20}}>
        {seasonalMeals.length>0 && <Section title={`${SEASON.e} Seasonal picks`} subtitle="Using the best ingredients right now" meals={seasonalMeals.slice(0,3)}/>}
        <Section title="For your goal" subtitle={`Matched to: ${GOALS.find(g=>g.id===profile.goal)?.label}`} meals={goalMeals}/>
        <Section title="⚡ Quick wins" subtitle="On the table in 20 minutes or less" meals={quickMeals}/>
        <Section title="📦 Batch & batch again" subtitle="Cook once, eat all week" meals={batchMeals}/>
      </div>
    </div>
  );
}

// ── ROOT APP ───────────────────────────────────────────────────
export default function App() {
  const [onboarded, setOnboarded] = useState(false);
  const [profile, setProfile] = useState(null);
  const [week, setWeek] = useState(null);
  const [tab, setTab] = useState("today");
  const [swapTarget, setSwapTarget] = useState(null);
  const [cookTarget, setCookTarget] = useState(null);
  const weather = useWeather();

  function completeOnboarding(p) {
    setProfile(p);
    setWeek(buildWeekPlan(p));
    setOnboarded(true);
  }

  function handleSwap(day, slot, directId) {
    if(directId) {
      // Direct add from Discover
      return;
    }
    setSwapTarget({day, slot});
    setTab("swap");
  }

  function handleCook(slot, recipeId) {
    setCookTarget({slot, recipeId});
    setTab("cook");
  }

  function handleSwapDone() {
    setSwapTarget(null);
    setTab("today");
  }

  if(!onboarded) return <Onboarding onComplete={completeOnboarding}/>;

  const tabs = [
    {id:"today",    icon:"☀️",  label:"Today"},
    {id:"plan",     icon:"📅",  label:"Plan"},
    {id:"shop",     icon:"🛒",  label:"Shop"},
    {id:"cook",     icon:"🍳",  label:"Cook"},
    {id:"discover", icon:"🔍",  label:"Discover"},
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100vh",maxWidth:430,margin:"0 auto",background:C.bg,overflow:"hidden"}}>
      <style>{FONTS}</style>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{display:none}body{background:#1c1814}button{-webkit-tap-highlight-color:transparent}`}</style>

      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",minHeight:0}}>
        {tab==="today"    && <TodayScreen    week={week} setWeek={setWeek} weather={weather} profile={profile} onSwap={handleSwap} onCook={handleCook}/>}
        {tab==="plan"     && <PlanScreen     week={week} setWeek={setWeek} weather={weather} profile={profile} onSwap={handleSwap}/>}
        {tab==="swap"     && <SwapScreen     target={swapTarget} week={week} setWeek={setWeek} weather={weather} profile={profile} onDone={handleSwapDone}/>}
        {tab==="shop"     && <ShopScreen     week={week}/>}
        {tab==="cook"     && <CookScreen     cookTarget={cookTarget} week={week} weather={weather}/>}
        {tab==="discover" && <DiscoverScreen profile={profile} week={week} setWeek={setWeek} weather={weather} onSwap={handleSwap}/>}
      </div>

      {/* Bottom nav */}
      <div style={{background:C.navBg,paddingBottom:"calc(10px + env(safe-area-inset-bottom))",paddingTop:10,display:"flex",borderTop:"1px solid rgba(255,255,255,0.06)",flexShrink:0}}>
        {tabs.map(t => {
          const active = tab===t.id || (tab==="swap" && t.id==="today");
          return (
            <button key={t.id} onClick={()=>{if(t.id!=="swap")setTab(t.id);}} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"4px 0",background:"none",border:"none",cursor:"pointer"}}>
              <div style={{fontSize:19,opacity:active?1:0.3,transition:"opacity 0.15s"}}>{t.icon}</div>
              <div style={{fontFamily:S.fontSans,fontSize:9,fontWeight:active?600:400,color:active?C.cream:"rgba(250,248,244,0.3)",letterSpacing:"0.04em",textTransform:"uppercase",transition:"all 0.15s"}}>{t.label}</div>
              {active && <div style={{width:3,height:3,borderRadius:"50%",background:C.clay}}/>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
