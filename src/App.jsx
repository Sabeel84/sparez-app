import { useState, useRef, useEffect } from "react";

const CATEGORIES = ["All","Body Parts","Engine & Drivetrain","Transmission","Suspension","Electrical","Interior","Brakes","Cooling","Exhaust","Wheels & Tires","Other"];
const CAR_MAKES  = ["Any","Toyota","Honda","Ford","Chevrolet","BMW","Mercedes","Audi","Nissan","Jeep","Dodge","Hyundai","Kia","Subaru","Mazda","Volkswagen","Other"];
const CAR_MODELS = {
  Toyota:    ["Camry","Corolla","RAV4","Highlander","Prius","Tacoma","Tundra","4Runner","Avalon","Sienna","Sequoia","Land Cruiser","FJ Cruiser","Yaris","C-HR","Venza","GR86","Supra"],
  Honda:     ["Civic","Accord","CR-V","Pilot","HR-V","Odyssey","Ridgeline","Passport","Insight","Fit","Element","S2000","NSX"],
  Ford:      ["F-150","F-250","F-350","Mustang","Explorer","Escape","Edge","Expedition","Bronco","Ranger","Maverick","Focus","Fusion","Taurus","EcoSport"],
  Chevrolet: ["Silverado","Colorado","Equinox","Traverse","Tahoe","Suburban","Blazer","Trax","Malibu","Impala","Camaro","Corvette","Spark","Sonic"],
  BMW:       ["3 Series","5 Series","7 Series","X1","X3","X5","X7","M3","M5","M8","4 Series","2 Series","Z4","i4","iX"],
  Mercedes:  ["C-Class","E-Class","S-Class","GLC","GLE","GLS","A-Class","CLA","GLA","GLB","AMG GT","EQS","Sprinter"],
  Audi:      ["A3","A4","A5","A6","A7","A8","Q3","Q5","Q7","Q8","TT","R8","e-tron","S4","S5","RS6"],
  Nissan:    ["Altima","Sentra","Maxima","Rogue","Pathfinder","Murano","Armada","Frontier","Titan","370Z","GT-R","Leaf","Kicks","Versa"],
  Jeep:      ["Wrangler","Cherokee","Grand Cherokee","Compass","Renegade","Gladiator","Wagoneer","Grand Wagoneer"],
  Dodge:     ["Charger","Challenger","Durango","Journey","Grand Caravan","RAM 1500","Viper","Dart"],
  Hyundai:   ["Elantra","Sonata","Tucson","Santa Fe","Palisade","Kona","Ioniq","Venue","Accent"],
  Kia:       ["Optima","Stinger","Sorento","Sportage","Telluride","Soul","Rio","Forte","Niro","EV6","Carnival"],
  Subaru:    ["Outback","Forester","Crosstrek","Impreza","Legacy","Ascent","WRX","BRZ","Solterra"],
  Mazda:     ["Mazda3","Mazda6","CX-3","CX-30","CX-5","CX-9","MX-5 Miata","CX-50","CX-90"],
  Volkswagen:["Golf","Jetta","Passat","Tiguan","Atlas","Taos","ID.4","Arteon","GTI","Beetle"],
  Other:     ["Other (not listed)"],
};
const CONDITIONS = ["Excellent","Good","Fair","Poor"];
const SORT_OPTS  = ["Newest","Oldest","Price: Low→High","Price: High→Low"];
const YEARS      = Array.from({length:35},(_,i)=>String(2024-i));
const DEF_FILTERS= {search:"",category:"All",make:"Any",model:"",yearFrom:"",yearTo:"",condition:"Any",priceMin:"",priceMax:"",partNumber:"",sortBy:"Newest",showSold:false};

// ─── Shared component styles (defined early so all components can use them) ───
const C={
  btnRed:  {background:"#e8172c",color:"#fff",border:"none",borderRadius:12,padding:"13px 20px",fontWeight:700,fontSize:15,cursor:"pointer",width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 4px 12px rgba(232,23,44,0.25)"},
  btnGhost:{background:"#fff",color:"#444",border:"1.5px solid #e0e0e0",borderRadius:12,padding:"12px 20px",fontWeight:600,fontSize:14,cursor:"pointer",width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:6},
  input:   {background:"#f5f5f5",border:"1.5px solid #efefef",borderRadius:10,padding:"12px 14px",color:"#111",fontSize:14,width:"100%",boxSizing:"border-box",outline:"none",fontFamily:"inherit"},
  select:  {background:"#f5f5f5",border:"1.5px solid #efefef",borderRadius:10,padding:"10px 12px",color:"#111",fontSize:13,width:"100%",boxSizing:"border-box",outline:"none",fontFamily:"inherit",marginBottom:14},
};

const CURRENCIES=[
  {code:"USD",sym:"$",   name:"US Dollar",         flag:"🇺🇸"},
  {code:"EUR",sym:"€",   name:"Euro",               flag:"🇪🇺"},
  {code:"GBP",sym:"£",   name:"British Pound",      flag:"🇬🇧"},
  {code:"AED",sym:"AED", name:"UAE Dirham",         flag:"🇦🇪"},
  {code:"SAR",sym:"SAR", name:"Saudi Riyal",        flag:"🇸🇦"},
  {code:"CAD",sym:"C$",  name:"Canadian Dollar",    flag:"🇨🇦"},
  {code:"AUD",sym:"A$",  name:"Australian Dollar",  flag:"🇦🇺"},
  {code:"JPY",sym:"¥",   name:"Japanese Yen",       flag:"🇯🇵"},
  {code:"CNY",sym:"¥",   name:"Chinese Yuan",       flag:"🇨🇳"},
  {code:"INR",sym:"₹",   name:"Indian Rupee",       flag:"🇮🇳"},
  {code:"MXN",sym:"MX$", name:"Mexican Peso",       flag:"🇲🇽"},
  {code:"BRL",sym:"R$",  name:"Brazilian Real",     flag:"🇧🇷"},
  {code:"ZAR",sym:"R",   name:"South African Rand", flag:"🇿🇦"},
  {code:"NGN",sym:"₦",   name:"Nigerian Naira",     flag:"🇳🇬"},
  {code:"KWD",sym:"KWD", name:"Kuwaiti Dinar",      flag:"🇰🇼"},
  {code:"QAR",sym:"QAR", name:"Qatari Riyal",       flag:"🇶🇦"},
  {code:"OMR",sym:"OMR", name:"Omani Rial",         flag:"🇴🇲"},
  {code:"BHD",sym:"BHD", name:"Bahraini Dinar",     flag:"🇧🇭"},
  {code:"PKR",sym:"Rs",  name:"Pakistani Rupee",    flag:"🇵🇰"},
  {code:"SGD",sym:"S$",  name:"Singapore Dollar",   flag:"🇸🇬"},
  {code:"MYR",sym:"RM",  name:"Malaysian Ringgit",  flag:"🇲🇾"},
  {code:"THB",sym:"฿",   name:"Thai Baht",          flag:"🇹🇭"},
  {code:"KRW",sym:"₩",   name:"South Korean Won",   flag:"🇰🇷"},
  {code:"TRY",sym:"₺",   name:"Turkish Lira",       flag:"🇹🇷"},
  {code:"CHF",sym:"Fr",  name:"Swiss Franc",        flag:"🇨🇭"},
  {code:"SEK",sym:"kr",  name:"Swedish Krona",      flag:"🇸🇪"},
  {code:"NOK",sym:"kr",  name:"Norwegian Krone",    flag:"🇳🇴"},
  {code:"NZD",sym:"NZ$", name:"New Zealand Dollar", flag:"🇳🇿"},
  {code:"HKD",sym:"HK$", name:"Hong Kong Dollar",   flag:"🇭🇰"},
  {code:"EGP",sym:"E£",  name:"Egyptian Pound",     flag:"🇪🇬"},
];
const RATES={USD:1,EUR:1.08,GBP:1.27,AED:0.272,SAR:0.267,CAD:0.74,AUD:0.65,JPY:0.0067,CNY:0.138,INR:0.012,MXN:0.058,BRL:0.20,ZAR:0.054,NGN:0.00065,KWD:3.25,QAR:0.274,OMR:2.60,BHD:2.65,PKR:0.0036,SGD:0.74,MYR:0.21,THB:0.028,KRW:0.00075,TRY:0.031,CHF:1.12,SEK:0.096,NOK:0.095,NZD:0.61,HKD:0.128,EGP:0.021};
// ── Timezone → currency auto-detection ───────────────────────────────────────
const TZ_CURRENCY={
  "Asia/Dubai":"AED","Asia/Abu_Dhabi":"AED","Asia/Muscat":"OMR",
  "Asia/Riyadh":"SAR","Asia/Kuwait":"KWD","Asia/Bahrain":"BHD",
  "Asia/Qatar":"QAR","Asia/Doha":"QAR","Asia/Baghdad":"USD",
  "Asia/Karachi":"PKR","Asia/Kolkata":"INR","Asia/Calcutta":"INR",
  "Asia/Dhaka":"USD","Asia/Colombo":"USD","Asia/Kathmandu":"USD",
  "Asia/Singapore":"SGD","Asia/Kuala_Lumpur":"MYR","Asia/Bangkok":"THB",
  "Asia/Jakarta":"USD","Asia/Manila":"USD","Asia/Ho_Chi_Minh":"USD",
  "Asia/Tokyo":"JPY","Asia/Seoul":"KRW","Asia/Shanghai":"CNY",
  "Asia/Hong_Kong":"HKD","Asia/Taipei":"USD",
  "Europe/London":"GBP","Europe/Paris":"EUR","Europe/Berlin":"EUR",
  "Europe/Madrid":"EUR","Europe/Rome":"EUR","Europe/Amsterdam":"EUR",
  "Europe/Brussels":"EUR","Europe/Vienna":"EUR","Europe/Zurich":"CHF",
  "Europe/Stockholm":"SEK","Europe/Oslo":"NOK","Europe/Helsinki":"EUR",
  "Europe/Warsaw":"EUR","Europe/Prague":"EUR","Europe/Budapest":"EUR",
  "Europe/Istanbul":"TRY",
  "America/New_York":"USD","America/Chicago":"USD","America/Denver":"USD",
  "America/Los_Angeles":"USD","America/Toronto":"CAD","America/Vancouver":"CAD",
  "America/Mexico_City":"MXN","America/Sao_Paulo":"BRL","America/Buenos_Aires":"USD",
  "America/Bogota":"USD","America/Lima":"USD","America/Santiago":"USD",
  "Australia/Sydney":"AUD","Australia/Melbourne":"AUD","Australia/Perth":"AUD",
  "Pacific/Auckland":"NZD","Africa/Cairo":"EGP","Africa/Lagos":"NGN",
  "Africa/Johannesburg":"ZAR","Africa/Nairobi":"USD","Africa/Accra":"USD",
};
function detectCurrency(){
  try{
    const tz=Intl.DateTimeFormat().resolvedOptions().timeZone;
    if(TZ_CURRENCY[tz])return TZ_CURRENCY[tz];
    // fallback: match by region prefix
    const region=tz.split("/")[0];
    if(region==="Asia"&&tz.includes("Gulf"))return"AED";
    return"USD";
  }catch{return"USD";}
}
const getCur=(code)=>CURRENCIES.find(c=>c.code===code)||CURRENCIES[0];
const fmtPrice=(amt,code)=>{const c=getCur(code);const n=parseFloat(amt);if(isNaN(n))return`${c.sym}—`;if(["JPY","KRW","NGN"].includes(code))return`${c.sym}${Math.round(n).toLocaleString()}`;return`${c.sym}${n.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;};
const cvtPrice=(amt,from,to)=>{const n=parseFloat(amt);if(isNaN(n)||from===to)return n;return n*(RATES[from]||1)/(RATES[to]||1);};

const TERMS=`TERMS AND CONDITIONS – SPAREZ

1. PLATFORM ROLE: SPAREZ is a listing platform only. We do NOT facilitate, process, or guarantee any transaction.

2. TRANSACTIONS: All purchases are conducted solely between buyer and seller. SPAREZ bears no responsibility.

3. LIABILITY: SPAREZ is NOT liable for fraud, misrepresentation, defective parts, loss, damage, or disputes.

4. SOLD STATUS: Sellers must mark items SOLD promptly. Listings auto-remove from browse after being marked sold.

5. CHAT PRIVACY: All conversations are strictly private. Only the two parties can view messages.

6. RATINGS: Buyers may rate sellers 1–5 stars with a written review. Chat content remains private.

7. VERIFICATION: Email and phone verification are required.

8. ACCEPTANCE: By creating an account you unconditionally accept these terms.`;

const INIT_LISTINGS=[
  {id:"l1",sellerId:"u2",sellerName:"Mike's Auto Salvage",sellerPhone:"+1-555-0142",sellerEmail:"mike@salvage.com",sellerLocation:"Houston, TX",
   make:"Toyota",model:"Camry",year:"2018",vin:"4T1BF1FK3JU123456",partName:"Front Bumper Assembly",category:"Body Parts",
   condition:"Good",price:"185",currency:"USD",description:"Minor scratches, all mounting points intact. Fits 2018–2020 Camry.",partNumber:"52119-06030",
   photos:["https://placehold.co/400x300/e8172c/ffffff?text=Bumper+Front","https://placehold.co/400x300/cc0000/ffffff?text=Bumper+Side"],
   createdAt:Date.now()-86400000,sold:false},
  {id:"l2",sellerId:"u2",sellerName:"Mike's Auto Salvage",sellerPhone:"+1-555-0142",sellerEmail:"mike@salvage.com",sellerLocation:"Houston, TX",
   make:"Honda",model:"Civic",year:"2019",vin:"2HGFC2F59KH123789",partName:"Engine 1.5L Turbo",category:"Engine & Drivetrain",
   condition:"Excellent",price:"1200",currency:"USD",description:"Low mileage pull, runs perfectly. Tested before removal.",partNumber:"10002-5BA-A00",
   photos:["https://placehold.co/400x300/111111/ffffff?text=Engine+Photo"],
   createdAt:Date.now()-43200000,sold:false},
  {id:"l3",sellerId:"u2",sellerName:"Mike's Auto Salvage",sellerPhone:"+1-555-0142",sellerEmail:"mike@salvage.com",sellerLocation:"Houston, TX",
   make:"Ford",model:"F-150",year:"2020",vin:"1FTEW1E53LFB12345",partName:"Tailgate Assembly",category:"Body Parts",
   condition:"Good",price:"1175",currency:"AED",description:"OEM tailgate with handle, minor scuff on bottom.",partNumber:"JL3Z-9940700-A",
   photos:["https://placehold.co/400x300/555555/ffffff?text=Tailgate"],
   createdAt:Date.now()-7200000,sold:true,soldAt:Date.now()-3600000},
];
const INIT_USERS=[
  {id:"u1",name:"Alex Buyer",email:"alex@example.com",phone:"+1-555-0101",role:"buyer",verified:true,password:"pass123",ratings:[],
   carPrefs:[{id:"cp1",make:"Toyota",model:"Camry",year:"2018"},{id:"cp2",make:"Honda",model:"Civic",year:"2019"}]},
  {id:"u2",name:"Mike's Auto Salvage",email:"mike@salvage.com",phone:"+1-555-0142",role:"seller",verified:true,password:"pass123",
   ratings:[{buyerId:"u1",buyerName:"Alex Buyer",stars:5,review:"Great seller, part exactly as described!",createdAt:Date.now()-172800000}],
   carPrefs:[]},
];

function genId(){return Math.random().toString(36).slice(2,10);}
function timeAgo(ts){
  if(!ts)return"";
  const ms=typeof ts==="string"?new Date(ts).getTime():Number(ts);
  const d=(Date.now()-ms)/1000;
  if(isNaN(d)||d<0)return"just now";
  if(d<60)return"just now";
  if(d<3600)return`${Math.floor(d/60)}m ago`;
  if(d<86400)return`${Math.floor(d/3600)}h ago`;
  return`${Math.floor(d/86400)}d ago`;
}
function avgRating(r=[]){if(!r.length)return null;return(r.reduce((s,x)=>s+x.stars,0)/r.length).toFixed(1);}

// ─── Image Compression ────────────────────────────────────────────────────────
// Resizes to max 1024px longest side + re-encodes JPEG at 0.75 quality
// Typical output: raw 4MB phone photo → 80–140 KB (95%+ reduction)
const IMG_MAX_PX = 1024;
const IMG_QUALITY = 0.75;

async function compressImage(source){
  // source = dataURL string OR File/Blob
  return new Promise(resolve=>{
    const img = new Image();
    img.onload = ()=>{
      let w = img.naturalWidth, h = img.naturalHeight;
      if(w > IMG_MAX_PX || h > IMG_MAX_PX){
        if(w >= h){ h = Math.round(h * IMG_MAX_PX / w); w = IMG_MAX_PX; }
        else       { w = Math.round(w * IMG_MAX_PX / h); h = IMG_MAX_PX; }
      }
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#fff"; // white bg so PNGs don't go black
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL("image/jpeg", IMG_QUALITY));
    };
    img.onerror = ()=>resolve(null);
    if(typeof source === "string"){
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = e=>{ img.src = e.target.result; };
      reader.readAsDataURL(source);
    }
  });
}

async function compressAll(sources){
  const results = await Promise.all(sources.map(s=>compressImage(s)));
  return results.filter(Boolean);
}

// ─── Stars ────────────────────────────────────────────────────────────────────
function Stars({value,size=16,interactive=false,onRate}){
  const [hover,setHover]=useState(0);
  return(
    <div style={{display:"flex",gap:2}}>
      {[1,2,3,4,5].map(i=>(
        <span key={i}
          style={{fontSize:size,cursor:interactive?"pointer":"default",color:i<=(hover||value)?"#f59e0b":"#ddd",transition:"color .1s"}}
          onMouseEnter={()=>interactive&&setHover(i)}
          onMouseLeave={()=>interactive&&setHover(0)}
          onClick={()=>interactive&&onRate&&onRate(i)}>★</span>
      ))}
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function Icon({name,size=20,color="currentColor"}){
  const paths={
    search:<><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></>,
    car:<><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>,
    plus:<><path d="M12 5v14M5 12h14"/></>,
    chat:<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>,
    user:<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    home:<><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    list:<><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
    pin:<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>,
    phone:<><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.1 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/></>,
    mail:<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
    send:<><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
    back:<><polyline points="15 18 9 12 15 6"/></>,
    x:<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    img:<><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>,
    check:<><polyline points="20 6 9 17 4 12"/></>,
    warning:<><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    filter:<><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></>,
    trash:<><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></>,
    star:<><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
    lock:<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    sold:<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
  };
  return(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

// ─── Currency Selector ────────────────────────────────────────────────────────
function CurrencySelector({value,onChange,compact=false}){
  const [open,setOpen]=useState(false);
  const [search,setSearch]=useState("");
  const cur=getCur(value);
  const filtered=CURRENCIES.filter(c=>c.code.toLowerCase().includes(search.toLowerCase())||c.name.toLowerCase().includes(search.toLowerCase()));
  return(
    <div style={{position:"relative"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:5,background:"#f5f5f5",border:"1.5px solid #e0e0e0",borderRadius:8,padding:compact?"5px 10px":"8px 12px",cursor:"pointer",color:"#111",fontSize:compact?12:13,fontWeight:700}}>
        <span>{cur.flag}</span><span>{cur.code}</span><span style={{color:"#999",fontSize:10}}>▾</span>
      </button>
      {open&&(
        <>
          <div style={{position:"fixed",inset:0,zIndex:499}} onClick={()=>{setOpen(false);setSearch("");}}/>
          <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:"#fff",border:"1px solid #e0e0e0",borderRadius:16,width:320,maxHeight:"70vh",display:"flex",flexDirection:"column",zIndex:500,boxShadow:"0 20px 60px rgba(0,0,0,0.15)"}}>
            <div style={{padding:"14px 16px 10px",borderBottom:"1px solid #f0f0f0"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span style={{color:"#111",fontWeight:800,fontSize:15}}>Select Currency</span>
                <button style={{background:"transparent",border:"none",cursor:"pointer",color:"#999",fontSize:20,lineHeight:1,padding:0}} onClick={()=>{setOpen(false);setSearch("");}}>×</button>
              </div>
              <input style={{background:"#f5f5f5",border:"1.5px solid #e0e0e0",borderRadius:8,padding:"8px 12px",color:"#111",fontSize:13,width:"100%",boxSizing:"border-box",outline:"none",fontFamily:"inherit"}} placeholder="Search currency..." value={search} onChange={e=>setSearch(e.target.value)} autoFocus/>
            </div>
            <div style={{overflowY:"auto",flex:1}}>
              {filtered.map(c=>(
                <button key={c.code} onClick={()=>{onChange(c.code);setOpen(false);setSearch("");}}
                  style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"10px 16px",background:c.code===value?"#fff5f5":"#fff",border:"none",borderBottom:"1px solid #f5f5f5",cursor:"pointer",textAlign:"left"}}>
                  <span style={{fontSize:20,minWidth:28}}>{c.flag}</span>
                  <div style={{flex:1}}>
                    <p style={{color:"#111",margin:0,fontSize:13,fontWeight:c.code===value?700:400}}>{c.name}</p>
                    <p style={{color:"#888",margin:0,fontSize:11}}>{c.code} · {c.sym}</p>
                  </div>
                  {c.code===value&&<span style={{color:"#e8172c",fontSize:16,fontWeight:700}}>✓</span>}
                </button>
              ))}
              {filtered.length===0&&<p style={{color:"#aaa",textAlign:"center",padding:20,fontSize:13}}>No currencies found</p>}
            </div>
            <div style={{padding:"10px 16px",borderTop:"1px solid #f0f0f0",background:"#fafafa",borderRadius:"0 0 16px 16px"}}>
              <p style={{color:"#aaa",fontSize:10,margin:0,textAlign:"center"}}>⚠️ Rates are approximate for display only.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── SPAREZ Brake Disc Logo ───────────────────────────────────────────────────
function SparezLogo({size=40}){
  const toRad=(d)=>(d*Math.PI)/180;
  const pt=(r,deg)=>({x:50+r*Math.cos(toRad(deg-90)),y:50+r*Math.sin(toRad(deg-90))});
  const outerR=44,innerRingR=32,gapStart=28,gapEnd=100;
  const p1=pt(outerR,gapEnd),p2=pt(outerR,gapStart),p3=pt(innerRingR,gapStart),p4=pt(innerRingR,gapEnd);
  const discPath=`M${p1.x},${p1.y} A${outerR},${outerR} 0 1 1 ${p2.x},${p2.y} L${p3.x},${p3.y} A${innerRingR},${innerRingR} 0 1 0 ${p4.x},${p4.y} Z`;
  const calR1=46,calR2=30,calStart=30,calEnd=98;
  const c1=pt(calR1,calEnd),c2=pt(calR1,calStart),c3=pt(calR2,calStart),c4=pt(calR2,calEnd);
  const caliperPath=`M${c1.x},${c1.y} A${calR1},${calR1} 0 0 1 ${c2.x},${c2.y} Q${50+26*Math.cos(toRad(calStart-90))},${50+24*Math.sin(toRad(calStart-90))} ${c3.x},${c3.y} A${calR2},${calR2} 0 0 0 ${c4.x},${c4.y} Q${50+28*Math.cos(toRad(calEnd-90))},${50+28*Math.sin(toRad(calEnd-90))} ${c1.x},${c1.y} Z`;
  const boltAngles=[0,72,144,216,288];
  const slots=[130,160,190,220,250,280,310,340,10];
  return(
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <path d={discPath} fill="#111"/>
      {slots.map((deg,i)=>{
        if(deg>gapStart-5&&deg<gapEnd+5)return null;
        const a=pt(innerRingR+1,deg),b=pt(outerR-1,deg);
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#fff" strokeWidth="1.2" opacity="0.18"/>;
      })}
      <path d={caliperPath} fill="#111"/>
      <path d={`M${pt(calR1-1,calEnd-10).x},${pt(calR1-1,calEnd-10).y} A${calR1-1},${calR1-1} 0 0 1 ${pt(calR1-1,calStart+10).x},${pt(calR1-1,calStart+10).y}`} stroke="#e8172c" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <circle cx="50" cy="50" r="18" fill="#111"/>
      {boltAngles.map((deg,i)=>{const b=pt(11,deg);return <circle key={i} cx={b.x} cy={b.y} r="3.5" fill="#fff"/>;} )}
      <circle cx="50" cy="50" r="5.5" fill="#fff"/>
    </svg>
  );
}

// ─── AR Fitment Preview ───────────────────────────────────────────────────────
const PART_SHAPES = {
  "Body Parts": {
    label: "Body Panel",
    icon: "🚗",
    // SVG path for a generic front bumper silhouette
    shape: "bumper",
    defaultW: 280, defaultH: 90,
    svgPath: `M10,20 Q10,5 25,5 L255,5 Q270,5 270,20 L278,55 Q280,70 265,72 L15,72 Q0,70 2,55 Z`,
    vw:"0 0 280 80",
  },
  "Brakes": {
    label: "Brake Disc",
    icon: "🔴",
    shape: "disc",
    defaultW: 140, defaultH: 140,
    svgPath: null, // drawn with circles
    vw:"0 0 140 140",
  },
  "Interior": {
    label: "Interior Panel",
    icon: "🪑",
    shape: "door-inner",
    defaultW: 200, defaultH: 260,
    svgPath: `M20,10 Q10,10 10,20 L10,240 Q10,255 25,258 L175,258 Q190,255 190,240 L190,60 Q190,40 175,25 L55,10 Z`,
    vw:"0 0 200 270",
  },
  "Wheels & Tires": {
    label: "Wheel",
    icon: "⚫",
    shape: "wheel",
    defaultW: 150, defaultH: 150,
    svgPath: null,
    vw:"0 0 150 150",
  },
  "Engine & Drivetrain": {
    label: "Engine Cover",
    icon: "⚙️",
    shape: "engine",
    defaultW: 220, defaultH: 150,
    svgPath: `M15,15 Q15,5 25,5 L195,5 Q205,5 205,15 L215,130 Q215,145 200,145 L20,145 Q5,145 5,130 Z`,
    vw:"0 0 220 150",
  },
  "default": {
    label: "Part",
    icon: "🔧",
    shape: "generic",
    defaultW: 180, defaultH: 100,
    svgPath: `M10,10 L170,10 L170,90 L10,90 Z`,
    vw:"0 0 180 100",
  },
};

const SCAN_LINES = Array.from({length:8},(_,i)=>i);

function ARPartShape({shape, w, h, color, opacity}){
  const toRad=(d)=>(d*Math.PI)/180;
  const pt=(r,deg,cx=70,cy=70)=>({x:cx+r*Math.cos(toRad(deg-90)),y:cy+r*Math.sin(toRad(deg-90))});

  if(shape==="disc"){
    const outerR=44,innerRingR=32,gapStart=28,gapEnd=100;
    const p1=pt(outerR,gapEnd),p2=pt(outerR,gapStart),p3=pt(innerRingR,gapStart),p4=pt(innerRingR,gapEnd);
    const disc=`M${p1.x},${p1.y} A${outerR},${outerR} 0 1 1 ${p2.x},${p2.y} L${p3.x},${p3.y} A${innerRingR},${innerRingR} 0 1 0 ${p4.x},${p4.y} Z`;
    return(
      <svg width={w} height={h} viewBox="0 0 140 140" style={{filter:`drop-shadow(0 0 18px ${color}99)`}}>
        <path d={disc} fill={color} opacity={opacity}/>
        <circle cx="70" cy="70" r="18" fill={color} opacity={opacity}/>
        {[0,72,144,216,288].map((deg,i)=>{const b=pt(11,deg);return<circle key={i} cx={b.x} cy={b.y} r="3.5" fill="rgba(255,255,255,0.8)" opacity={opacity}/>;} )}
        <circle cx="70" cy="70" r="5.5" fill="rgba(255,255,255,0.9)" opacity={opacity}/>
      </svg>
    );
  }
  if(shape==="wheel"){
    return(
      <svg width={w} height={h} viewBox="0 0 150 150" style={{filter:`drop-shadow(0 0 18px ${color}99)`}}>
        <circle cx="75" cy="75" r="70" fill={color} opacity={opacity}/>
        <circle cx="75" cy="75" r="45" fill="rgba(30,30,30,0.85)" opacity={opacity}/>
        <circle cx="75" cy="75" r="12" fill={color} opacity={opacity}/>
        {[0,60,120,180,240,300].map((deg,i)=>{
          const inner=pt(12,deg,75,75),outer=pt(43,deg,75,75);
          return<line key={i} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={color} strokeWidth="8" opacity={opacity}/>;
        })}
      </svg>
    );
  }
  const ps = Object.values(PART_SHAPES).find(p=>p.shape===shape)||PART_SHAPES.default;
  return(
    <svg width={w} height={h} viewBox={ps.vw} style={{filter:`drop-shadow(0 0 20px ${color}bb)`}}>
      <path d={ps.svgPath} fill={color} opacity={opacity} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
      {/* shine overlay */}
      <path d={ps.svgPath} fill="url(#shine)" opacity={opacity*0.4}/>
      <defs>
        <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.6)"/>
          <stop offset="50%" stopColor="rgba(255,255,255,0)"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function ARFitmentModal({listing, onClose, onShareCapture}){
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const streamRef = useRef(null);
  const dragRef = useRef({dragging:false, startX:0, startY:0, origX:0, origY:0});

  const [camReady, setCamReady] = useState(false);
  const [camError, setCamError] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [partColor, setPartColor] = useState("#e8172c");
  const [partOpacity, setPartOpacity] = useState(0.72);
  const [partScale, setPartScale] = useState(1.0);
  const [pos, setPos] = useState({x:null,y:null}); // null = centered
  const [captured, setCaptured] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const [matchScore] = useState(()=>Math.floor(82+Math.random()*15));
  const [fitScore] = useState(()=>Math.floor(88+Math.random()*11));
  const [facingMode, setFacingMode] = useState("environment");

  const ps = PART_SHAPES[listing.category] || PART_SHAPES.default;
  const partW = ps.defaultW * partScale;
  const partH = ps.defaultH * partScale;

  // Start camera
  const startCam = async (mode) => {
    if(streamRef.current){ streamRef.current.getTracks().forEach(t=>t.stop()); }
    try{
      const stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:mode,width:{ideal:1280},height:{ideal:720}}});
      streamRef.current = stream;
      if(videoRef.current){ videoRef.current.srcObject=stream; await videoRef.current.play(); }
      setCamReady(true); setCamError(false);
      setTimeout(()=>setScanning(false), 2200);
    }catch(e){ setCamError(true); setScanning(false); }
  };

  useEffect(()=>{
    startCam(facingMode);
    return ()=>{ if(streamRef.current) streamRef.current.getTracks().forEach(t=>t.stop()); };
  },[facingMode]);

  // Drag handlers
  const onDragStart = (e) => {
    const clientX = e.touches?.[0]?.clientX ?? e.clientX;
    const clientY = e.touches?.[0]?.clientY ?? e.clientY;
    const rect = containerRef.current?.getBoundingClientRect();
    dragRef.current = { dragging:true, startX:clientX, startY:clientY,
      origX: pos.x ?? (rect?.width??300)/2, origY: pos.y ?? (rect?.height??600)/2 };
    e.preventDefault();
  };
  const onDragMove = (e) => {
    if(!dragRef.current.dragging) return;
    const clientX = e.touches?.[0]?.clientX ?? e.clientX;
    const clientY = e.touches?.[0]?.clientY ?? e.clientY;
    const dx = clientX - dragRef.current.startX;
    const dy = clientY - dragRef.current.startY;
    setPos({x: dragRef.current.origX + dx, y: dragRef.current.origY + dy});
  };
  const onDragEnd = () => { dragRef.current.dragging = false; };

  // Capture
  const capture = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if(!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.drawImage(video, 0, 0);
    // watermark
    ctx.fillStyle="rgba(232,23,44,0.9)";
    ctx.fillRect(0, canvas.height-44, canvas.width, 44);
    ctx.fillStyle="#fff"; ctx.font="bold 18px system-ui"; ctx.textAlign="center";
    ctx.fillText(`SPAREZ AR · ${listing.partName} · ${ps.label}`, canvas.width/2, canvas.height-16);
    setCaptured(canvas.toDataURL("image/jpeg",0.92));
  };

  const rect = containerRef.current?.getBoundingClientRect();
  const cx = pos.x ?? ((rect?.width??340)/2);
  const cy = pos.y ?? ((rect?.height??600)/2 - 40);

  const COLORS = ["#e8172c","#111111","#ffffff","#3b82f6","#16a34a","#f59e0b","#7c3aed","#64748b","#b45309"];

  return(
    <div style={{position:"fixed",inset:0,zIndex:600,background:"#000",display:"flex",flexDirection:"column"}}>

      {/* camera / fallback bg */}
      <div ref={containerRef} style={{flex:1,position:"relative",overflow:"hidden",background:"#000"}}
        onMouseMove={onDragMove} onTouchMove={onDragMove}
        onMouseUp={onDragEnd} onTouchEnd={onDragEnd}
        onMouseLeave={onDragEnd}>

        {/* Live video */}
        <video ref={videoRef} autoPlay playsInline muted style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity: camReady?1:0, transition:"opacity .5s"}}/>

        {/* Fallback when no camera */}
        {camError&&(
          <div style={{position:"absolute",inset:0,background:"linear-gradient(160deg,#0a0a14,#0f172a,#0a0a14)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {/* animated car silhouette scene */}
            <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" style={{maxHeight:"100%"}}>
              {/* ground */}
              <rect x="0" y="240" width="400" height="60" fill="#0f172a"/>
              <line x1="0" y1="242" x2="400" y2="242" stroke="#1e293b" strokeWidth="2"/>
              {/* road markings */}
              {[0,80,160,240,320].map(x=><rect key={x} x={x+30} y="255" width="40" height="6" rx="3" fill="#1e3a5f" opacity="0.6"/>)}
              {/* car body */}
              <path d="M60,200 L60,165 Q62,140 80,130 L140,118 Q165,112 190,112 Q215,112 235,118 L285,130 Q305,140 310,165 L320,200 Z" fill="#1e293b" stroke="#334155" strokeWidth="1.5"/>
              {/* windows */}
              <path d="M95,165 Q97,142 108,134 L148,124 Q168,120 188,120 L188,165 Z" fill="#0ea5e9" opacity="0.25"/>
              <path d="M192,120 L232,124 Q252,130 262,140 L270,165 L192,165 Z" fill="#0ea5e9" opacity="0.25"/>
              {/* wheels */}
              <circle cx="120" cy="202" r="22" fill="#0f172a" stroke="#334155" strokeWidth="2"/>
              <circle cx="120" cy="202" r="12" fill="#1e293b"/>
              <circle cx="270" cy="202" r="22" fill="#0f172a" stroke="#334155" strokeWidth="2"/>
              <circle cx="270" cy="202" r="12" fill="#1e293b"/>
              {/* headlights */}
              <ellipse cx="318" cy="170" rx="8" ry="5" fill="#fbbf24" opacity="0.6"/>
              <path d="M326,168 L380,155 M326,172 L380,178" stroke="#fbbf24" strokeWidth="1" opacity="0.3"/>
            </svg>
            <div style={{position:"absolute",bottom:60,left:0,right:0,textAlign:"center"}}>
              <p style={{color:"#475569",fontSize:12,margin:0}}>📷 Camera unavailable — demo mode active</p>
            </div>
          </div>
        )}

        {/* Scanning animation */}
        {scanning&&(
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.55)"}}>
            <div style={{position:"relative",width:220,height:220}}>
              {/* corner brackets */}
              {[[0,0,1,1],[1,0,-1,1],[0,1,1,-1],[1,1,-1,-1]].map(([rx,ry,sx,sy],i)=>(
                <div key={i} style={{position:"absolute",right:rx?0:"auto",left:rx?undefined:0,bottom:ry?0:"auto",top:ry?undefined:0,width:32,height:32,
                  borderTop:`3px solid ${sy===-1?"transparent":"#e8172c"}`,
                  borderBottom:`3px solid ${sy===1?"transparent":"#e8172c"}`,
                  borderLeft:`3px solid ${sx===-1?"transparent":"#e8172c"}`,
                  borderRight:`3px solid ${sx===1?"transparent":"#e8172c"}`}}/>
              ))}
              {/* scan line */}
              <div style={{position:"absolute",left:4,right:4,height:2,background:"linear-gradient(90deg,transparent,#e8172c,transparent)",
                animation:"scanline 1.4s ease-in-out infinite",top:"50%"}}>
                <style>{`@keyframes scanline{0%{top:4px;opacity:1}100%{top:216px;opacity:0.3}}`}</style>
              </div>
            </div>
            <p style={{color:"#e8172c",fontWeight:700,fontSize:13,letterSpacing:2,textTransform:"uppercase",marginTop:20,animation:"pulse 1s ease-in-out infinite"}}>
              Scanning vehicle...
              <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
            </p>
          </div>
        )}

        {/* Corner bracket HUD (always visible after scan) */}
        {!scanning&&(
          <>
            {[[0,0],[1,0],[0,1],[1,1]].map(([r,b],i)=>(
              <div key={i} style={{position:"absolute",
                right:r?14:"auto",left:r?undefined:14,
                bottom:b?80:"auto",top:b?undefined:80,
                width:24,height:24,
                borderTop:`2px solid ${b?"transparent":"rgba(232,23,44,0.5)"}`,
                borderBottom:`2px solid ${b?"rgba(232,23,44,0.5)":"transparent"}`,
                borderLeft:`2px solid ${r?"transparent":"rgba(232,23,44,0.5)"}`,
                borderRight:`2px solid ${r?"rgba(232,23,44,0.5)":"transparent"}`
              }}/>
            ))}
          </>
        )}

        {/* AR Part Overlay — draggable */}
        {!scanning&&(
          <div
            onMouseDown={onDragStart} onTouchStart={onDragStart}
            style={{position:"absolute", left:cx - partW/2, top:cy - partH/2,
              width:partW, height:partH, cursor:"grab", userSelect:"none", touchAction:"none",
              filter:"drop-shadow(0 4px 24px rgba(0,0,0,0.5))",
              transition: dragRef.current.dragging?"none":"filter .2s"}}>
            <ARPartShape shape={ps.shape} w={partW} h={partH} color={partColor} opacity={partOpacity}/>
            {/* drag handle indicator */}
            <div style={{position:"absolute",top:-22,left:"50%",transform:"translateX(-50%)",
              background:"rgba(0,0,0,0.7)",borderRadius:20,padding:"3px 10px",
              display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap"}}>
              <span style={{fontSize:10,color:"rgba(255,255,255,0.7)"}}>⊹ drag to position</span>
            </div>
          </div>
        )}

        {/* Fit score HUD */}
        {!scanning&&camReady&&(
          <div style={{position:"absolute",top:90,right:14,display:"flex",flexDirection:"column",gap:6}}>
            <div style={{background:"rgba(0,0,0,0.75)",borderRadius:10,padding:"8px 12px",border:"1px solid rgba(22,163,74,0.4)",backdropFilter:"blur(8px)"}}>
              <p style={{color:"rgba(255,255,255,0.5)",fontSize:8,fontWeight:800,textTransform:"uppercase",letterSpacing:1,margin:"0 0 3px"}}>Fit Score</p>
              <p style={{color:"#6ee7b7",fontWeight:900,fontSize:18,margin:0,lineHeight:1}}>{fitScore}<span style={{fontSize:10,color:"#4ade80"}}>/100</span></p>
            </div>
            <div style={{background:"rgba(0,0,0,0.75)",borderRadius:10,padding:"8px 12px",border:"1px solid rgba(59,130,246,0.4)",backdropFilter:"blur(8px)"}}>
              <p style={{color:"rgba(255,255,255,0.5)",fontSize:8,fontWeight:800,textTransform:"uppercase",letterSpacing:1,margin:"0 0 3px"}}>Color Match</p>
              <p style={{color:"#93c5fd",fontWeight:900,fontSize:18,margin:0,lineHeight:1}}>{matchScore}<span style={{fontSize:10,color:"#7dd3fc"}}>/100</span></p>
            </div>
          </div>
        )}

        {/* Part info badge */}
        {!scanning&&(
          <div style={{position:"absolute",bottom:100,left:14,right:14,background:"rgba(0,0,0,0.8)",borderRadius:14,padding:"10px 14px",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#e8172c,#ff6b6b)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:16}}>{ps.icon}</div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{color:"#fff",fontWeight:700,fontSize:13,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{listing.partName}</p>
              <p style={{color:"rgba(255,255,255,0.5)",fontSize:11,margin:0}}>{listing.year} {listing.make} {listing.model} · {listing.condition}</p>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <p style={{color:"#e8172c",fontWeight:900,fontSize:14,margin:0}}>{fmtPrice(listing.price,listing.currency||"USD")}</p>
            </div>
          </div>
        )}

        {/* Top header */}
        <div style={{position:"absolute",top:0,left:0,right:0,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"48px 14px 14px",background:"linear-gradient(to bottom,rgba(0,0,0,0.75),transparent)"}}>
          <button onClick={onClose} style={{width:38,height:38,borderRadius:"50%",background:"rgba(0,0,0,0.6)",border:"1px solid rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",backdropFilter:"blur(8px)"}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <div style={{background:"rgba(0,0,0,0.65)",borderRadius:20,padding:"5px 14px",backdropFilter:"blur(8px)",border:"1px solid rgba(232,23,44,0.3)",display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#e8172c",animation:"pulse 1.2s ease-in-out infinite"}}/>
            <span style={{color:"#fff",fontSize:11,fontWeight:700,letterSpacing:0.5}}>AR FITMENT</span>
          </div>
          <button onClick={()=>setFacingMode(f=>f==="environment"?"user":"environment")}
            style={{width:38,height:38,borderRadius:"50%",background:"rgba(0,0,0,0.6)",border:"1px solid rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",backdropFilter:"blur(8px)"}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M20 7h-3a2 2 0 0 1-2-2V2"/><path d="M9 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l4 4v10a2 2 0 0 1-2 2z"/><circle cx="12" cy="13" r="3"/></svg>
          </button>
        </div>

        <canvas ref={canvasRef} style={{display:"none"}}/>
      </div>

      {/* ── Controls Panel ── */}
      <div style={{background:"#0a0a0a",borderTop:"1px solid #1a1a1a",padding:"14px 16px 28px",flexShrink:0}}>

        {/* Color swatches */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <span style={{color:"#444",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,flexShrink:0}}>Color</span>
          <div style={{display:"flex",gap:6,flex:1,flexWrap:"nowrap",overflowX:"auto"}}>
            {COLORS.map(c=>(
              <button key={c} onClick={()=>setPartColor(c)} style={{width:26,height:26,borderRadius:"50%",background:c,border:`2.5px solid ${partColor===c?"#fff":"transparent"}`,flexShrink:0,cursor:"pointer",boxShadow:partColor===c?"0 0 0 1px rgba(255,255,255,0.3)":"none",transition:"border .15s"}}/>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <span style={{color:"#444",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8}}>Opacity</span>
              <span style={{color:"#e8172c",fontSize:10,fontWeight:700}}>{Math.round(partOpacity*100)}%</span>
            </div>
            <input type="range" min="15" max="95" value={Math.round(partOpacity*100)}
              onChange={e=>setPartOpacity(parseInt(e.target.value)/100)}
              style={{width:"100%",accentColor:"#e8172c",cursor:"pointer"}}/>
          </div>
          <div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <span style={{color:"#444",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8}}>Size</span>
              <span style={{color:"#e8172c",fontSize:10,fontWeight:700}}>{Math.round(partScale*100)}%</span>
            </div>
            <input type="range" min="40" max="180" value={Math.round(partScale*100)}
              onChange={e=>setPartScale(parseInt(e.target.value)/100)}
              style={{width:"100%",accentColor:"#e8172c",cursor:"pointer"}}/>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setPos({x:null,y:null})} style={{flex:1,background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:10,padding:"10px 0",color:"#666",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0"/><path d="M12 8v4l3 3"/></svg>
            Reset
          </button>
          <button onClick={capture} style={{flex:2,background:"#1a1a1a",border:"1px solid #333",borderRadius:10,padding:"10px 0",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            Capture
          </button>
          {captured&&(
            <button onClick={()=>onShareCapture&&onShareCapture(captured)} style={{flex:2,background:"#e8172c",border:"none",borderRadius:10,padding:"10px 0",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,boxShadow:"0 4px 14px rgba(232,23,44,0.4)"}}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              Send to Seller
            </button>
          )}
        </div>

        {/* Captured preview */}
        {captured&&(
          <div style={{marginTop:10,borderRadius:10,overflow:"hidden",border:"1px solid #2a2a2a",position:"relative"}}>
            <img src={captured} alt="AR capture" style={{width:"100%",maxHeight:120,objectFit:"cover",display:"block"}}/>
            <div style={{position:"absolute",top:6,right:6,background:"rgba(22,163,74,0.9)",borderRadius:20,padding:"3px 10px"}}>
              <span style={{color:"#fff",fontSize:10,fontWeight:700}}>✓ Ready to send</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// ─── End AR Fitment ───────────────────────────────────────────────────────────

// ─── Notification Bell ────────────────────────────────────────────────────────
function NotificationBell({count,onClick}){
  return(
    <button onClick={onClick} style={{position:"relative",background:"transparent",border:"none",cursor:"pointer",padding:4,display:"flex",alignItems:"center",justifyContent:"center",width:36,height:36,borderRadius:8}}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        stroke={count>0?"#e8172c":"#bbb"}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      {count>0&&(
        <span style={{position:"absolute",top:0,right:0,background:"#e8172c",color:"#fff",fontSize:9,fontWeight:900,
          minWidth:15,height:15,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px",lineHeight:1,border:"2px solid #fff"}}>
          {count>9?"9+":count}
        </span>
      )}
    </button>
  );
}

// ─── Notification Panel ───────────────────────────────────────────────────────
function NotificationPanel({notifications,onClose,onMarkRead,onMarkAllRead,onClearAll,onNavigate,currentUser}){
  const unread=notifications.filter(n=>!n.read).length;
  return(
    <div style={{position:"fixed",inset:0,zIndex:500,display:"flex",flexDirection:"column",justifyContent:"flex-end"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.45)"}} onClick={onClose}/>
      <div style={{position:"relative",background:"#fff",borderRadius:"22px 22px 0 0",maxHeight:"78vh",display:"flex",flexDirection:"column",boxShadow:"0 -6px 40px rgba(0,0,0,0.18)"}}>
        {/* drag handle */}
        <div style={{width:36,height:4,background:"#e0e0e0",borderRadius:2,margin:"10px auto 0",flexShrink:0}}/>

        {/* header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px 10px",borderBottom:"1px solid #f0f0f0",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{color:"#111",fontWeight:900,fontSize:17}}>Notifications</span>
            {unread>0&&<span style={{background:"#e8172c",color:"#fff",fontSize:10,fontWeight:800,padding:"2px 7px",borderRadius:20}}>{unread} new</span>}
          </div>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            {unread>0&&<button onClick={onMarkAllRead} style={{background:"none",border:"none",color:"#e8172c",fontSize:12,fontWeight:700,cursor:"pointer",padding:0}}>Mark all read</button>}
            {notifications.length>0&&<button onClick={onClearAll} style={{background:"none",border:"none",color:"#bbb",fontSize:12,cursor:"pointer",padding:0}}>Clear all</button>}
            <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:"#bbb",fontSize:24,lineHeight:1,padding:0,marginLeft:4}}>×</button>
          </div>
        </div>

        {/* list */}
        <div style={{overflowY:"auto",flex:1,paddingBottom:24}}>
          {notifications.length===0?(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,padding:"44px 24px",textAlign:"center"}}>
              <div style={{width:56,height:56,borderRadius:"50%",background:"#f5f5f5",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </div>
              <p style={{color:"#bbb",margin:0,fontSize:14,fontWeight:600}}>All caught up!</p>
              <p style={{color:"#ddd",fontSize:12,margin:0,maxWidth:220,lineHeight:1.6}}>
                {currentUser?.role==="seller"
                  ?"You'll be notified when a buyer messages you."
                  :"You'll be notified when new parts match your cars, or when a seller replies."}
              </p>
            </div>
          ):notifications.map(n=>(
            <div key={n.id} onClick={()=>{onMarkRead(n.id);if(n.action)onNavigate(n.action);onClose();}}
              style={{display:"flex",alignItems:"flex-start",gap:12,padding:"13px 18px",borderBottom:"1px solid #f8f8f8",
                background:n.read?"#fff":"#fff5f5",cursor:"pointer",transition:"background .15s"}}>
              {/* icon circle */}
              <div style={{width:42,height:42,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",
                background:n.type==="message"?"#fff0f0":n.type==="listing"?"#eff6ff":"#f0fdf4",
                border:`1.5px solid ${n.type==="message"?"#fca5a5":n.type==="listing"?"#93c5fd":"#86efac"}`}}>
                {n.type==="message"&&(
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8172c" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                )}
                {n.type==="listing"&&(
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                )}
              </div>
              {/* text */}
              <div style={{flex:1,minWidth:0}}>
                <p style={{color:"#111",fontWeight:n.read?500:700,fontSize:13,margin:0,lineHeight:1.4}}>{n.title}</p>
                <p style={{color:"#888",fontSize:12,margin:"3px 0 2px",lineHeight:1.45,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{n.body}</p>
                <p style={{color:"#ccc",fontSize:10,margin:0}}>{timeAgo(n.ts)}</p>
              </div>
              {/* unread dot */}
              {!n.read&&<div style={{width:8,height:8,borderRadius:"50%",background:"#e8172c",flexShrink:0,marginTop:5}}/>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Car Prefs Manager (for buyers) ──────────────────────────────────────────
function CarPrefsManager({currentUser,users,setUsers}){
  const me=users.find(u=>u.id===currentUser.id)||currentUser;
  const prefs=me.carPrefs||[];
  const [make,setMake]=useState("");
  const [model,setModel]=useState("");
  const [year,setYear]=useState("");
  const models=make&&CAR_MODELS[make]?[...CAR_MODELS[make],"Any model"]:[];

  const addPref=async()=>{
    if(!make)return;
    const pref={id:genId(),make,model:model||"Any model",year:year||"Any year"};
    const newPrefs=[...(prefs),pref];
    setUsers(us=>us.map(u=>u.id===currentUser.id?{...u,carPrefs:newPrefs}:u));
    setMake("");setModel("");setYear("");
    try{const sb=await getSB();await sb.from("profiles").update({car_prefs:newPrefs}).eq("id",currentUser.id);}catch(e){console.error(e);}
  };
  const removePref=async(id)=>{
    const newPrefs=prefs.filter(p=>p.id!==id);
    setUsers(us=>us.map(u=>u.id===currentUser.id?{...u,carPrefs:newPrefs}:u));
    try{const sb=await getSB();await sb.from("profiles").update({car_prefs:newPrefs}).eq("id",currentUser.id);}catch(e){console.error(e);}
  };

  return(
    <div style={{background:"#fff",margin:"0 16px 16px",borderRadius:14,padding:16,border:"1px solid #f0f0f0"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
        <div style={{width:32,height:32,borderRadius:8,background:"#eff6ff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        </div>
        <div>
          <p style={{color:"#111",fontWeight:700,margin:0,fontSize:14}}>My Car Watchlist</p>
          <p style={{color:"#aaa",fontSize:11,margin:0}}>Get notified when matching parts are listed</p>
        </div>
      </div>

      {/* existing prefs */}
      {prefs.length>0&&(
        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
          {prefs.map(p=>(
            <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,background:"#f8faff",borderRadius:10,padding:"9px 12px",border:"1px solid #dbeafe"}}>
              <span style={{fontSize:16}}>🚗</span>
              <div style={{flex:1}}>
                <span style={{color:"#1d4ed8",fontSize:13,fontWeight:700}}>{p.make} {p.model!=="Any model"?p.model:""}</span>
                {p.year!=="Any year"&&<span style={{color:"#93c5fd",fontSize:12}}> · {p.year}</span>}
              </div>
              <button onClick={()=>removePref(p.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#fca5a5",fontSize:18,lineHeight:1,padding:0,display:"flex"}}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* add new pref */}
      {prefs.length<8&&(
        <div style={{display:"flex",flexDirection:"column",gap:8,background:"#f9fafb",borderRadius:10,padding:12,border:"1px dashed #e5e7eb"}}>
          <p style={{color:"#aaa",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,margin:0}}>Add a car to watch</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <select style={C.select} value={make} onChange={e=>{setMake(e.target.value);setModel("");}}>
              <option value="">Select Make</option>
              {CAR_MAKES.filter(m=>m!=="Any").map(m=><option key={m}>{m}</option>)}
            </select>
            <select style={C.select} value={model} onChange={e=>setModel(e.target.value)} disabled={!make}>
              <option value="">Any Model</option>
              {models.map(m=><option key={m}>{m}</option>)}
            </select>
          </div>
          <select style={C.select} value={year} onChange={e=>setYear(e.target.value)}>
            <option value="">Any Year</option>
            {YEARS.map(y=><option key={y}>{y}</option>)}
          </select>
          <button onClick={addPref} disabled={!make} style={{...C.btnRed,opacity:make?1:0.4,cursor:make?"pointer":"not-allowed",padding:"10px"}}>
            + Add to Watchlist
          </button>
        </div>
      )}
      {prefs.length===0&&<p style={{color:"#bbb",fontSize:12,textAlign:"center",margin:"4px 0 0"}}>No cars watched yet — add one above</p>}
    </div>
  );
}

// ─── Supabase Client ──────────────────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

let _sb = null;
async function getSB(){
  if(_sb) return _sb;
  if(!window.__sbLoaded){
    await new Promise((res,rej)=>{
      const s=document.createElement("script");
      s.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js";
      s.onload=()=>{window.__sbLoaded=true;res();};
      s.onerror=rej;
      document.head.appendChild(s);
    });
  }
  _sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
  return _sb;
}

// ─── DB mappers ───────────────────────────────────────────────────────────────
function listingToRow(l){
  return{
    id:l.id, seller_id:l.sellerId, seller_name:l.sellerName,
    seller_phone:l.sellerPhone, seller_email:l.sellerEmail,
    seller_location:l.sellerLocation, make:l.make, model:l.model,
    year:l.year, vin:l.vin||null, part_name:l.partName,
    part_number:l.partNumber||null, category:l.category,
    condition:l.condition, price:l.price, currency:l.currency||"USD",
    description:l.description, photos:l.photos,
    sold:l.sold||false, sold_at:l.soldAt||null, created_at:l.createdAt||new Date().toISOString(),
  };
}
function rowToListing(r){
  return{
    id:r.id, sellerId:r.seller_id, sellerName:r.seller_name,
    sellerPhone:r.seller_phone, sellerEmail:r.seller_email,
    sellerLocation:r.seller_location, make:r.make, model:r.model,
    year:r.year, vin:r.vin, partName:r.part_name,
    partNumber:r.part_number, category:r.category,
    condition:r.condition, price:r.price, currency:r.currency||"USD",
    description:r.description, photos:r.photos||[],
    sold:r.sold, soldAt:r.sold_at, createdAt:r.created_at,
  };
}
// Profile row → app user object (merges auth email)
function profileToUser(profile, authEmail="", emailConfirmed=false){
  return{
    id:profile.id,
    name:profile.name,
    email:authEmail||profile.email||"",
    phone:profile.phone||"",
    role:profile.role,
    emailVerified:emailConfirmed,
    ratings:profile.ratings||[],
    carPrefs:profile.car_prefs||[],
    currency:profile.currency||"USD",
  };
}

// ─── localStorage cache ───────────────────────────────────────────────────────
function lsGet(key,fallback){
  try{const v=localStorage.getItem(key);return v?JSON.parse(v):fallback;}catch{return fallback;}
}
function lsSet(key,val){
  try{localStorage.setItem(key,JSON.stringify(val));}catch(e){console.warn("ls full",e);}
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App(){
  const [screen,setScreen]         = useState(()=>lsGet("sparez_currentUser",null)?"home":"splash");
  const [authMode,setAuthMode]     = useState("login");
  const [currentUser,setCurrentUser] = useState(()=>lsGet("sparez_currentUser",null));
  const [users,setUsers]           = useState(()=>lsGet("sparez_users",[]));
  const [listings,setListings]     = useState(()=>lsGet("sparez_listings",[]).map(l=>({...l,currency:l.currency||"USD",photos:l.photos||[]})));
  const [chats,setChats]           = useState(()=>lsGet("sparez_chats",{}));
  const [notifs,setNotifs]         = useState(()=>lsGet("sparez_notifs",[]));
  const [activeListing,setActiveListing] = useState(null);
  const [activeChatKey,setActiveChatKey] = useState(null);
  const [toast,setToast]           = useState(null);
  const [filters,setFilters]       = useState(DEF_FILTERS);
  const [showFilters,setShowFilters] = useState(false);
  const [ratingModal,setRatingModal] = useState(null);
  const [prevScreen,setPrevScreen] = useState("home");
  const [viewCur,setViewCur]       = useState(()=>detectCurrency());
  const [showNotifs,setShowNotifs] = useState(false);

  // Keep localStorage cache synced
  useEffect(()=>lsSet("sparez_currentUser",currentUser),[currentUser]);
  useEffect(()=>lsSet("sparez_users",users),[users]);
  useEffect(()=>lsSet("sparez_listings",listings),[listings]);
  useEffect(()=>lsSet("sparez_chats",chats),[chats]);
  useEffect(()=>lsSet("sparez_notifs",notifs),[notifs]);

  const prevChatsRef   = useRef({});
  const seenListingIds = useRef(new Set());

  // ── Boot: Supabase Auth session + load data + realtime ─────────────────────
  useEffect(()=>{
    let subs=[];
    (async()=>{
      const sb=await getSB();

      // ── Restore session if user was already logged in ─────────────────────
      const {data:{session}}=await sb.auth.getSession();
      if(session){
        const {data:profile}=await sb.from("profiles").select("*").eq("id",session.user.id).single();
        if(profile){
          const u=profileToUser(profile,session.user.email,!!session.user.email_confirmed_at);
          setCurrentUser(u);
          setScreen("home");
        }
        // onAuthStateChange will fire SIGNED_IN right after this and re-fetch listings
        // so we skip a duplicate fetch here
      }

      // ── Listen for auth state changes ─────────────────────────────────────
      sb.auth.onAuthStateChange(async(event,session)=>{
        if((event==="SIGNED_IN"||event==="TOKEN_REFRESHED"||event==="USER_UPDATED")&&session){
          // Fetch profile - retry once in case it was just created
          let profile=null;
          for(let attempt=0;attempt<3;attempt++){
            const {data:p}=await sb.from("profiles").select("*").eq("id",session.user.id).single();
            if(p){profile=p;break;}
            await new Promise(r=>setTimeout(r,800)); // wait 800ms and retry
          }
          if(profile){
            const u=profileToUser(profile,session.user.email,!!session.user.email_confirmed_at);
            setCurrentUser(u);
            setUsers(us=>us.find(x=>x.id===u.id)?us.map(x=>x.id===u.id?u:x):[...us,u]);
            setScreen("home");
          } else {
            // Profile missing — create it from auth metadata
            const meta=session.user.user_metadata||{};
            const newProfile={
              id:session.user.id,
              name:meta.name||session.user.email,
              phone:meta.phone||"",
              role:meta.role||"buyer",
              currency:meta.currency||"USD",
              ratings:[],
              car_prefs:[],
            };
            await sb.from("profiles").upsert(newProfile,{onConflict:"id"});
            const u=profileToUser(newProfile,session.user.email,!!session.user.email_confirmed_at);
            setCurrentUser(u);
            setUsers(us=>us.find(x=>x.id===u.id)?us.map(x=>x.id===u.id?u:x):[...us,u]);
            setScreen("home");
          }
          // ── Always re-fetch fresh listings on sign-in ──────────────────────
          const {data:lRows}=await sb.from("listings").select("*").order("created_at",{ascending:false});
          if(lRows){
            const mapped=lRows.map(rowToListing);
            setListings(mapped);
            mapped.forEach(l=>seenListingIds.current.add(l.id));
          }
        }
        if(event==="SIGNED_OUT"){
          setCurrentUser(null);
          lsSet("sparez_currentUser",null);
          setListings([]);
          setNotifs([]);
          lsSet("sparez_listings",[]);
          lsSet("sparez_notifs",[]);
          setScreen("splash");
        }
      });

      // ── Load profiles ─────────────────────────────────────────────────────
      const {data:profileRows}=await sb.from("profiles").select("*");
      if(profileRows){
        const mapped=profileRows.map(p=>profileToUser(p));
        setUsers(mapped);
      }

      // ── Load listings ─────────────────────────────────────────────────────
      const {data:lRows}=await sb.from("listings").select("*").order("created_at",{ascending:false});
      if(lRows){
        const mapped=lRows.map(rowToListing);
        setListings(mapped);
        mapped.forEach(l=>seenListingIds.current.add(l.id));
      }

      // ── Load chats ────────────────────────────────────────────────────────
      const {data:cRows}=await sb.from("chats").select("*");
      if(cRows){
        const mapped={};
        cRows.forEach(r=>{mapped[r.chat_key]=r.messages||[];});
        setChats(mapped);
      }

      // ── Realtime: listings ────────────────────────────────────────────────
      const listingSub=sb.channel("listings_rt")
        .on("postgres_changes",{event:"*",schema:"public",table:"listings"},payload=>{
          if(payload.eventType==="INSERT"||payload.eventType==="UPDATE"){
            const l=rowToListing(payload.new);
            setListings(ls=>{
              const exists=ls.find(x=>x.id===l.id);
              return exists?ls.map(x=>x.id===l.id?l:x):[l,...ls];
            });
          }
          if(payload.eventType==="DELETE")
            setListings(ls=>ls.filter(x=>x.id!==payload.old.id));
        }).subscribe();

      // ── Realtime: chats ───────────────────────────────────────────────────
      const chatSub=sb.channel("chats_rt")
        .on("postgres_changes",{event:"*",schema:"public",table:"chats"},payload=>{
          if(payload.new){
            const key=payload.new.chat_key;
            setChats(c=>({...c,[key]:payload.new.messages||[]}));
          }
        }).subscribe();

      // ── Realtime: profiles ────────────────────────────────────────────────
      const profileSub=sb.channel("profiles_rt")
        .on("postgres_changes",{event:"*",schema:"public",table:"profiles"},payload=>{
          if(payload.new){
            const u=profileToUser(payload.new);
            setUsers(us=>us.map(x=>x.id===u.id?u:x));
            setCurrentUser(cu=>cu?.id===u.id?{...cu,...u}:cu);
          }
        }).subscribe();

      subs=[listingSub,chatSub,profileSub];
    })();
    return()=>{subs.forEach(s=>s.unsubscribe?.());};
  },[]);

  const unreadCount=notifs.filter(n=>!n.read).length;
  const pushNotif=(type,title,body,action=null)=>{
    setNotifs(ns=>[{id:genId(),type,title,body,action,ts:Date.now(),read:false},...ns].slice(0,60));
  };

  // Chat notifications
  useEffect(()=>{
    if(!currentUser)return;
    const prev=prevChatsRef.current;
    Object.keys(chats).forEach(key=>{
      const msgs=chats[key]||[];
      const prevLen=(prev[key]||[]).length;
      if(msgs.length<=prevLen)return;
      msgs.slice(prevLen).forEach(m=>{
        if(m.senderId===currentUser.id)return;
        const parts=key.split("_");
        if(currentUser.id!==parts[0]&&currentUser.id!==parts[1])return;
        if(activeChatKey?.key===key)return;
        pushNotif("message",`💬 ${m.senderName} sent you a message`,
          `"${m.text.length>80?m.text.slice(0,80)+"\u2026":m.text}"`,{screen:"chat",chatKey:key});
      });
    });
    prevChatsRef.current=chats;
  },[chats,currentUser]);

  // New listing match notifications
  useEffect(()=>{
    if(!currentUser||currentUser.role!=="buyer")return;
    const me=users.find(u=>u.id===currentUser.id);
    const prefs=me?.carPrefs||[];
    listings.forEach(l=>{
      if(seenListingIds.current.has(l.id))return;
      seenListingIds.current.add(l.id);
      if(l.sold||l.sellerId===currentUser.id||!prefs.length)return;
      const matched=prefs.find(p=>{
        const makeOk=l.make.toLowerCase()===p.make.toLowerCase();
        const modelOk=p.model==="Any model"||l.model.toLowerCase().includes(p.model.toLowerCase());
        const yearOk=p.year==="Any year"||l.year===p.year;
        return makeOk&&modelOk&&yearOk;
      });
      if(matched)pushNotif("listing",
        `🔍 New part for your ${matched.make}${matched.model!=="Any model"?" "+matched.model:""}`,
        `${l.partName} \u00B7 ${l.condition} \u00B7 ${fmtPrice(l.price,l.currency||"USD")} \u00B7 by ${l.sellerName}`,
        {screen:"listing",listingId:l.id});
    });
  },[listings,currentUser,users]);

  const notify=(msg,type="info")=>{setToast({msg,type});setTimeout(()=>setToast(null),3500);};
  const openListing=(l)=>{setPrevScreen(screen);setActiveListing(l);setScreen("listing");};
  const openChat=(listing)=>{
    const buyerId=currentUser.role==="buyer"?currentUser.id:listing.sellerId;
    const key=`${buyerId}_${listing.sellerId}_${listing.id}`;
    setPrevScreen(screen);setActiveChatKey({key,listing});setScreen("chat");
  };

  const markSold=async(id)=>{
    const soldNow=new Date().toISOString();
    setListings(ls=>ls.map(l=>l.id===id?{...l,sold:true,soldAt:soldNow}:l));
    notify("Marked as SOLD \u2014 listing will be removed shortly.","success");
    const sb=await getSB();
    await sb.from("listings").update({sold:true,sold_at:soldNow}).eq("id",id);
    setTimeout(async()=>{
      setListings(ls=>ls.filter(l=>l.id!==id));
      await sb.from("listings").delete().eq("id",id);
      if(activeListing?.id===id){setActiveListing(null);setScreen("mylistings");}
    },5000);
  };

  const deleteListing=async(id)=>{
    setListings(ls=>ls.filter(l=>l.id!==id));
    notify("Listing deleted.","info");
    const sb=await getSB();
    await sb.from("listings").delete().eq("id",id);
    if(activeListing?.id===id){setActiveListing(null);setScreen("mylistings");}
  };

  const submitRating=async(sellerId,stars,review)=>{
    const sb=await getSB();
    const seller=users.find(u=>u.id===sellerId);
    const existing=(seller?.ratings||[]).filter(r=>r.buyerId!==currentUser.id);
    const newRatings=[...existing,{buyerId:currentUser.id,buyerName:currentUser.name,stars,review,createdAt:Date.now()}];
    setUsers(us=>us.map(u=>u.id===sellerId?{...u,ratings:newRatings}:u));
    await sb.from("profiles").update({ratings:newRatings}).eq("id",sellerId);
    setRatingModal(null);notify("Rating submitted! Thank you.","success");
  };

  const signOut=async()=>{
    const sb=await getSB();
    await sb.auth.signOut();
    setCurrentUser(null);
    setActiveListing(null);
    setActiveChatKey(null);
    setListings([]);
    setNotifs([]);
    lsSet("sparez_currentUser",null);
    lsSet("sparez_listings",[]);
    lsSet("sparez_notifs",[]);
    setScreen("splash");
  };

  const activeFilterCount=Object.entries(filters).filter(([k,v])=>{
    if(k==="sortBy")return v!=="Newest";if(k==="category")return v!=="All";
    if(k==="make")return v!=="Any";if(k==="condition")return v!=="Any";
    if(k==="showSold")return v===true;return v!=="";
  }).length;

  const filteredListings=listings.filter(l=>{
    if(!filters.showSold&&l.sold)return false;
    const q=filters.search.toLowerCase();
    if(q&&!l.partName.toLowerCase().includes(q)&&!l.make.toLowerCase().includes(q)&&!l.model.toLowerCase().includes(q)&&!l.year.includes(q)&&!(l.partNumber||"").toLowerCase().includes(q))return false;
    if(filters.category!=="All"&&l.category!==filters.category)return false;
    if(filters.make!=="Any"&&l.make!==filters.make)return false;
    if(filters.model&&!l.model.toLowerCase().includes(filters.model.toLowerCase()))return false;
    if(filters.yearFrom&&parseInt(l.year)<parseInt(filters.yearFrom))return false;
    if(filters.yearTo&&parseInt(l.year)>parseInt(filters.yearTo))return false;
    if(filters.condition!=="Any"&&l.condition!==filters.condition)return false;
    const priceInViewCur=cvtPrice(l.price,l.currency||"USD",viewCur);
    if(filters.priceMin&&priceInViewCur<parseFloat(filters.priceMin))return false;
    if(filters.priceMax&&priceInViewCur>parseFloat(filters.priceMax))return false;
    if(filters.partNumber&&!(l.partNumber||"").toLowerCase().includes(filters.partNumber.toLowerCase()))return false;
    return true;
  }).sort((a,b)=>{
    if(filters.sortBy==="Oldest")return a.createdAt-b.createdAt;
    if(filters.sortBy==="Price: Low\u2192High")return cvtPrice(a.price,a.currency||"USD","USD")-cvtPrice(b.price,b.currency||"USD","USD");
    if(filters.sortBy==="Price: High\u2192Low")return cvtPrice(b.price,b.currency||"USD","USD")-cvtPrice(a.price,a.currency||"USD","USD");
    return b.createdAt-a.createdAt;
  });

  const myListings=listings.filter(l=>l.sellerId===currentUser?.id);
  const myChats=Object.keys(chats).filter(k=>{const parts=k.split("_");return parts[0]===currentUser?.id||parts[1]===currentUser?.id;});

  // ── Splash screen ──────────────────────────────────────────────────────────
  if(screen==="splash") return(
    <div style={{minHeight:"100vh",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16,maxWidth:400,width:"100%"}}>
        <div style={{width:96,height:96,borderRadius:24,background:"#f5f5f5",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 8px 32px rgba(0,0,0,0.12)",border:"1px solid #eee"}}>
          <SparezLogo size={72}/>
        </div>
        <h1 style={{color:"#111",fontSize:34,fontWeight:900,margin:0,letterSpacing:-1.5,fontStyle:"italic"}}>SPARE<span style={{color:"#e8172c"}}>Z</span></h1>
        <p style={{color:"#666",textAlign:"center",fontSize:14,margin:0}}>Buy & Sell Used Auto Parts — Direct. Simple. Safe.</p>
        <div style={{display:"flex",flexDirection:"column",gap:8,width:"100%"}}>
          {[{e:"🔒",t:"Private Chats",d:"Only buyer & seller can read messages"},
            {e:"⭐",t:"Seller Ratings",d:"Buyers rate sellers 1–5 stars"},
            {e:"✅",t:"Sold Status",d:"Mark sold → listing auto-removed"}
          ].map((f,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,background:"#fafafa",borderRadius:12,padding:"12px 14px",border:"1px solid #f0f0f0"}}>
              <span style={{fontSize:20}}>{f.e}</span>
              <div><p style={{color:"#111",margin:0,fontSize:13,fontWeight:700}}>{f.t}</p><p style={{color:"#888",margin:0,fontSize:11}}>{f.d}</p></div>
            </div>
          ))}
        </div>
        <button style={C.btnRed} onClick={()=>{setAuthMode("register");setScreen("auth");}}>Get Started</button>
        <button style={C.btnGhost} onClick={()=>{setAuthMode("login");setScreen("auth");}}>Sign In</button>
        <p style={{color:"#bbb",fontSize:11,textAlign:"center",maxWidth:300,lineHeight:1.6,margin:0}}>⚠️ All transactions are between buyer & seller only. SPAREZ is not liable for any purchase.</p>
      </div>
    </div>
  );

  if(screen==="auth") return <AuthScreen authMode={authMode} setAuthMode={setAuthMode} setCurrentUser={setCurrentUser} setUsers={setUsers} setScreen={setScreen} notify={notify} TERMS={TERMS}/>;

  return(
    <div style={{background:"#f5f5f5",minHeight:"100vh",maxWidth:430,margin:"0 auto",position:"relative",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      {toast&&<div style={{position:"fixed",top:18,left:"50%",transform:"translateX(-50%)",color:"#fff",padding:"11px 22px",borderRadius:12,fontWeight:600,fontSize:13,zIndex:999,background:toast.type==="error"?"#e8172c":toast.type==="success"?"#16a34a":"#2563eb",boxShadow:"0 4px 20px rgba(0,0,0,0.2)",maxWidth:"88vw",textAlign:"center"}}>{toast.msg}</div>}
      {ratingModal&&<RatingModal modal={ratingModal} onClose={()=>setRatingModal(null)} onSubmit={submitRating} users={users}/>}
      {showNotifs&&<NotificationPanel
        notifications={notifs}
        currentUser={currentUser}
        onClose={()=>setShowNotifs(false)}
        onMarkRead={id=>setNotifs(ns=>ns.map(n=>n.id===id?{...n,read:true}:n))}
        onMarkAllRead={()=>setNotifs(ns=>ns.map(n=>({...n,read:true})))}
        onClearAll={()=>setNotifs([])}
        onNavigate={action=>{
          if(!action)return;
          if(action.screen==="chat"){
            const key=action.chatKey;
            const parts=key.split("_");
            const listingId=parts[2];
            const listing=listings.find(l=>l.id===listingId)||{id:listingId,partName:"Part",sellerName:"Seller",sellerId:parts[1]};
            setActiveChatKey({key,listing});setScreen("chat");
          } else if(action.screen==="listing"){
            const l=listings.find(x=>x.id===action.listingId);
            if(l){setActiveListing(l);setScreen("listing");}
          }
        }}
      />}

      {screen==="home"       &&<HomeScreen listings={filteredListings} filters={filters} setFilters={setFilters} showFilters={showFilters} setShowFilters={setShowFilters} activeFilterCount={activeFilterCount} openListing={openListing} viewCur={viewCur} setViewCur={setViewCur}/>}
      {screen==="listing"    &&activeListing&&<ListingScreen listing={activeListing} currentUser={currentUser} onBack={()=>setScreen(prevScreen||"home")} openChat={openChat} markSold={markSold} deleteListing={deleteListing} openRating={()=>setRatingModal({sellerId:activeListing.sellerId,sellerName:activeListing.sellerName})} users={users} viewCur={viewCur} setViewCur={setViewCur} chats={chats}/>}
      {screen==="addlisting" &&<AddListingScreen currentUser={currentUser} setListings={setListings} notify={notify} setScreen={setScreen}/>}
      {screen==="chat"       &&activeChatKey&&<ChatScreen chatKey={activeChatKey} currentUser={currentUser} chats={chats} setChats={setChats} onBack={()=>setScreen(prevScreen||"home")} openRating={()=>setRatingModal({sellerId:activeChatKey.listing.sellerId,sellerName:activeChatKey.listing.sellerName})} users={users}/>}
      {screen==="mylistings" &&<MyListingsScreen listings={myListings} openListing={openListing} setScreen={setScreen} markSold={markSold} deleteListing={deleteListing}/>}
      {screen==="profile"    &&<ProfileScreen currentUser={currentUser} users={users} setUsers={setUsers} setCurrentUser={setCurrentUser} setScreen={setScreen} viewCur={viewCur} setViewCur={setViewCur} setActiveListing={setActiveListing} setActiveChatKey={setActiveChatKey} signOut={signOut}/>}
      {screen==="inbox"      &&<InboxScreen chats={chats} chatKeys={myChats} currentUser={currentUser} setActiveChatKey={setActiveChatKey} setScreen={setScreen} listings={listings}/>}

      <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"#fff",borderTop:"1px solid #f0f0f0",display:"flex",justifyContent:"space-around",alignItems:"center",padding:"8px 0 20px",zIndex:20,boxShadow:"0 -2px 12px rgba(0,0,0,0.06)"}}>
        {[{s:"home",icon:"home",label:"Browse"},
          ...(currentUser?.role==="seller"?[{s:"mylistings",icon:"list",label:"My Parts"},{s:"addlisting",icon:"plus",label:"Add Part"}]:[]),
          {s:"inbox",icon:"chat",label:"Messages"},
          {s:"profile",icon:"user",label:"Profile"},
        ].map(item=>(
          <button key={item.s} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"transparent",border:"none",cursor:"pointer",padding:"4px 10px"}} onClick={()=>setScreen(item.s)}>
            <Icon name={item.icon} size={22} color={screen===item.s?"#e8172c":"#bbb"}/>
            <span style={{fontSize:10,color:screen===item.s?"#e8172c":"#bbb",fontWeight:screen===item.s?700:400}}>{item.label}</span>
          </button>
        ))}
        <button style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"transparent",border:"none",cursor:"pointer",padding:"4px 10px"}} onClick={()=>setShowNotifs(true)}>
          <div style={{position:"relative"}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke={showNotifs?"#e8172c":unreadCount>0?"#e8172c":"#bbb"}>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unreadCount>0&&<span style={{position:"absolute",top:-4,right:-6,background:"#e8172c",color:"#fff",fontSize:8,fontWeight:900,minWidth:14,height:14,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 2px",border:"1.5px solid #fff"}}>{unreadCount>9?"9+":unreadCount}</span>}
          </div>
          <span style={{fontSize:10,color:unreadCount>0||showNotifs?"#e8172c":"#bbb",fontWeight:unreadCount>0?700:400}}>Alerts</span>
        </button>
      </nav>
    </div>
  );
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
function AuthScreen({authMode,setAuthMode,setCurrentUser,setUsers,setScreen,notify,TERMS}){
  const [f,sf]=useState({name:"",email:"",phone:"",password:"",role:"buyer",currency:"USD",termsAccepted:false});
  const [showTerms,setShowTerms]=useState(false);
  const [loading,setLoading]=useState(false);
  const [verifyStep,setVerifyStep]=useState(false);
  const [errors,setErrors]=useState({});
  const set=(k,v)=>{sf(p=>({...p,[k]:v}));setErrors(e=>({...e,[k]:false}));};

  // Input style — red border when field has error
  const inp=(field)=>({...C.input,borderColor:errors[field]?"#e8172c":"#e0e0e0",background:errors[field]?"#fff5f5":"#fff",transition:"border-color .2s,background .2s"});

  const submit=async()=>{
    if(loading)return;

    if(authMode==="register"){
      // Validate all fields and mark errors
      const e={};
      if(!f.name.trim())       e.name=true;
      if(!f.email.trim())      e.email=true;
      if(!f.phone.trim())      e.phone=true;
      if(!f.password.trim())   e.password=true;
      if(!f.termsAccepted)     e.terms=true;
      if(f.phone.trim()&&!f.phone.match(/^\+?[\d\s\-]{7,}/)) e.phone=true;
      if(Object.keys(e).length>0){
        setErrors(e);
        notify("Please fill all required fields","error");
        return;
      }
    } else {
      const e={};
      if(!f.email.trim())    e.email=true;
      if(!f.password.trim()) e.password=true;
      if(Object.keys(e).length>0){
        setErrors(e);
        notify("Please enter your email and password","error");
        return;
      }
    }

    setLoading(true);
    try{
      const sb=await getSB();
      if(authMode==="login"){
        const {data,error}=await sb.auth.signInWithPassword({email:f.email,password:f.password});
        if(error){
          if(error.message.toLowerCase().includes("email not confirmed")||
             error.message.toLowerCase().includes("not confirmed")){
            notify("Please verify your email first — check your inbox ✉️","error");
          } else if(error.message.toLowerCase().includes("invalid login")||
                    error.message.toLowerCase().includes("invalid credentials")||
                    error.message.toLowerCase().includes("wrong password")){
            setErrors({email:true,password:true});
            notify("Incorrect email or password","error");
          } else {
            notify(error.message||"Sign in failed — try again","error");
          }
          return;
        }
      }else{
        const {data,error}=await sb.auth.signUp({
          email:f.email,
          password:f.password,
          options:{
            emailRedirectTo:window.location.origin,
            data:{name:f.name,role:f.role,phone:f.phone},
          }
        });
        if(error){notify(error.message,"error");return;}
        if(data.user){
          await sb.from("profiles").upsert({
            id:data.user.id,
            name:f.name,
            phone:f.phone,
            role:f.role,
            currency:f.role==="seller"?f.currency||"USD":"USD",
            ratings:[],
            car_prefs:[],
          },{onConflict:"id"});
        }
        setVerifyStep(true);
      }
    }catch(e){notify("Something went wrong — try again","error");console.error(e);}
    finally{setLoading(false);}
  };

  if(verifyStep) return(
    <div style={{minHeight:"100vh",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16,maxWidth:380,width:"100%",textAlign:"center"}}>
        <div style={{width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,#fff5f5,#fecaca)",border:"2px solid #fca5a5",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#e8172c" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        </div>
        <h2 style={{color:"#111",margin:0,fontSize:22}}>Check your email!</h2>
        <p style={{color:"#666",margin:0,lineHeight:1.7}}>
          We sent a verification link to<br/>
          <strong style={{color:"#e8172c"}}>{f.email}</strong>
        </p>
        <div style={{background:"#f0fdf4",borderRadius:12,padding:"12px 16px",border:"1px solid #bbf7d0",width:"100%",boxSizing:"border-box"}}>
          <p style={{color:"#16a34a",fontSize:13,fontWeight:700,margin:"0 0 4px"}}>✅ What to do next:</p>
          <p style={{color:"#4ade80",fontSize:12,margin:0,lineHeight:1.6}}>
            1. Open your email inbox<br/>
            2. Click the <strong>"Confirm your email"</strong> link<br/>
            3. Come back here and sign in
          </p>
        </div>
        <p style={{color:"#bbb",fontSize:12,margin:0}}>Didn't receive it? Check your spam folder.</p>
        <button style={C.btnGhost} onClick={()=>{setVerifyStep(false);setAuthMode("login");}}>
          \u2190 Back to Sign In
        </button>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <div style={{display:"flex",flexDirection:"column",gap:12,maxWidth:380,width:"100%"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
          <SparezLogo size={36}/>
          <span style={{color:"#111",fontSize:22,fontWeight:900,letterSpacing:-1,fontStyle:"italic"}}>SPARE<span style={{color:"#e8172c"}}>Z</span></span>
        </div>
        <div style={{display:"flex",background:"#f5f5f5",borderRadius:10,padding:4,marginBottom:4}}>
          {["login","register"].map(m=>(
            <button key={m} style={{flex:1,padding:"10px",border:"none",borderRadius:8,background:authMode===m?"#e8172c":"transparent",color:authMode===m?"#fff":"#888",fontWeight:600,cursor:"pointer",fontSize:14,transition:"all .2s"}} onClick={()=>{setAuthMode(m);setErrors({});}}>{m==="login"?"Sign In":"Register"}</button>
          ))}
        </div>
        {authMode==="register"&&<>
          <div>
            <input style={inp("name")} placeholder="Full Name / Business Name *" value={f.name} onChange={e=>set("name",e.target.value)}/>
            {errors.name&&<p style={{color:"#e8172c",fontSize:11,margin:"4px 0 0 4px"}}>⚠ Name is required</p>}
          </div>
          <div style={{display:"flex",gap:8}}>
            {["buyer","seller"].map(r=>(
              <button key={r} style={{flex:1,padding:"12px 8px",border:`1.5px solid ${f.role===r?"#e8172c":"#e0e0e0"}`,borderRadius:10,background:f.role===r?"#fff5f5":"#fff",color:f.role===r?"#e8172c":"#666",cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:3}} onClick={()=>set("role",r)}>
                <span style={{fontSize:24}}>{r==="buyer"?"🛒":"🏪"}</span>
                <span style={{fontWeight:700,fontSize:14}}>{r==="buyer"?"Buyer":"Seller"}</span>
                <span style={{fontSize:10,color:f.role===r?"#e8172c":"#aaa",fontWeight:400}}>{r==="buyer"?"Browse & buy parts":"List & sell parts"}</span>
              </button>
            ))}
          </div>
          <div>
            <input style={inp("phone")} placeholder="Phone Number *" value={f.phone} onChange={e=>set("phone",e.target.value)} type="tel"/>
            {errors.phone&&<p style={{color:"#e8172c",fontSize:11,margin:"4px 0 0 4px"}}>⚠ Valid phone number required</p>}
          </div>
          {f.role==="seller"&&(
            <div style={{background:"#f8faff",border:"1.5px solid #dbeafe",borderRadius:10,padding:"12px 14px"}}>
              <p style={{color:"#1d4ed8",fontSize:12,fontWeight:700,margin:"0 0 4px",fontFamily:"inherit"}}>💱 Your Selling Currency</p>
              <p style={{color:"#888",fontSize:11,margin:"0 0 10px",fontFamily:"inherit"}}>All your listings will use this currency automatically</p>
              <CurrencySelector value={f.currency} onChange={v=>set("currency",v)}/>
            </div>
          )}
        </>}
        <div>
          <input style={inp("email")} placeholder="Email Address *" value={f.email} onChange={e=>set("email",e.target.value)} type="email" autoComplete="email"/>
          {errors.email&&<p style={{color:"#e8172c",fontSize:11,margin:"4px 0 0 4px"}}>⚠ {authMode==="login"?"Incorrect email or password":"Email is required"}</p>}
        </div>
        <div>
          <input style={inp("password")} placeholder="Password *" value={f.password} onChange={e=>set("password",e.target.value)} type="password" autoComplete={authMode==="login"?"current-password":"new-password"}/>
          {errors.password&&!errors.email&&<p style={{color:"#e8172c",fontSize:11,margin:"4px 0 0 4px"}}>⚠ {authMode==="login"?"Incorrect email or password":"Password is required"}</p>}
        </div>
        {authMode==="register"&&(
          <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
            <div style={{width:20,height:20,minWidth:20,border:`2px solid ${errors.terms?"#e8172c":f.termsAccepted?"#e8172c":"#ddd"}`,borderRadius:5,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",background:f.termsAccepted?"#e8172c":errors.terms?"#fff5f5":"#fff"}} onClick={()=>set("termsAccepted",!f.termsAccepted)}>
              {f.termsAccepted&&<Icon name="check" size={13} color="#fff"/>}
            </div>
            <div style={{flex:1}}>
              <p style={{color:"#666",fontSize:13,margin:0}}>I agree to the <span style={{color:"#e8172c",cursor:"pointer",fontWeight:600}} onClick={()=>setShowTerms(true)}>Terms & Conditions</span></p>
              {errors.terms&&<p style={{color:"#e8172c",fontSize:11,margin:"3px 0 0"}}>⚠ You must accept the Terms & Conditions</p>}
            </div>
          </div>
        )}
        <button style={{...C.btnRed,opacity:loading?0.7:1,cursor:loading?"not-allowed":"pointer"}} onClick={submit} disabled={loading}>
          {loading?(authMode==="login"?"Signing in...":"Creating account..."):(authMode==="login"?"Sign In":"Create Account")}
        </button>
        {showTerms&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:20}}>
            <div style={{background:"#fff",borderRadius:16,padding:24,width:"100%",maxWidth:400,boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <h3 style={{color:"#111",margin:0,fontSize:16}}>Terms & Conditions</h3>
                <button style={{background:"transparent",border:"none",cursor:"pointer",color:"#999",fontSize:20,padding:0}} onClick={()=>setShowTerms(false)}>\u00D7</button>
              </div>
              <pre style={{color:"#444",fontSize:12,whiteSpace:"pre-wrap",overflowY:"auto",maxHeight:300,lineHeight:1.7,margin:0}}>{TERMS}</pre>
              <button style={{...C.btnRed,marginTop:16}} onClick={()=>{set("termsAccepted",true);setShowTerms(false);}}>I Accept</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// ─── Home ─────────────────────────────────────────────────────────────────────
function HomeScreen({listings,filters,setFilters,showFilters,setShowFilters,activeFilterCount,openListing,viewCur,setViewCur}){
  const set=(k,v)=>setFilters(f=>({...f,[k]:v}));
  const clearAll=()=>setFilters(DEF_FILTERS);
  return(
    <div style={{overflowY:"auto",height:"100vh",background:"#f5f5f5"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",paddingTop:48,background:"#fff",position:"sticky",top:0,zIndex:10,borderBottom:"1px solid #f0f0f0",boxShadow:"0 1px 6px rgba(0,0,0,0.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <SparezLogo size={30}/>
          <span style={{color:"#111",fontWeight:900,fontSize:20,letterSpacing:-1,fontStyle:"italic"}}>SPARE<span style={{color:"#e8172c"}}>Z</span></span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <CurrencySelector value={viewCur} onChange={setViewCur} compact/>
          <button style={{background:"transparent",border:"none",cursor:"pointer",padding:6,display:"flex",alignItems:"center",justifyContent:"center",width:36,height:36,borderRadius:8,position:"relative"}} onClick={()=>setShowFilters(v=>!v)}>
            <Icon name="filter" size={20} color={showFilters||activeFilterCount>0?"#e8172c":"#999"}/>
            {activeFilterCount>0&&<span style={{position:"absolute",top:2,right:2,background:"#e8172c",color:"#fff",fontSize:9,fontWeight:800,width:15,height:15,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>{activeFilterCount}</span>}
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{display:"flex",alignItems:"center",gap:10,margin:"12px 16px",background:"#fff",borderRadius:12,padding:"10px 14px",border:"1.5px solid #efefef",boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
        <Icon name="search" size={18} color="#bbb"/>
        <input style={{flex:1,background:"transparent",border:"none",outline:"none",color:"#111",fontSize:14,fontFamily:"inherit"}} placeholder="Search parts, make, model, part no..." value={filters.search} onChange={e=>set("search",e.target.value)}/>
        {filters.search&&<button style={{background:"transparent",border:"none",cursor:"pointer",padding:0,display:"flex",color:"#bbb"}} onClick={()=>set("search","")}><Icon name="x" size={14} color="#bbb"/></button>}
      </div>

      {/* Active filter chips */}
      {activeFilterCount>0&&(
        <div style={{display:"flex",gap:6,padding:"0 16px 8px",flexWrap:"wrap",alignItems:"center"}}>
          {filters.category!=="All"&&<Chip label={filters.category} onRemove={()=>set("category","All")}/>}
          {filters.make!=="Any"&&<Chip label={filters.make} onRemove={()=>set("make","Any")}/>}
          {filters.model&&<Chip label={`Model: ${filters.model}`} onRemove={()=>set("model","")}/>}
          {(filters.yearFrom||filters.yearTo)&&<Chip label={`${filters.yearFrom||"Any"}–${filters.yearTo||"Any"}`} onRemove={()=>{set("yearFrom","");set("yearTo","");}}/>}
          {filters.condition!=="Any"&&<Chip label={filters.condition} onRemove={()=>set("condition","Any")}/>}
          {(filters.priceMin||filters.priceMax)&&<Chip label={`${getCur(viewCur).sym}${filters.priceMin||"0"}–${getCur(viewCur).sym}${filters.priceMax||"∞"}`} onRemove={()=>{set("priceMin","");set("priceMax","");}}/>}
          {filters.partNumber&&<Chip label={`#${filters.partNumber}`} onRemove={()=>set("partNumber","")}/>}
          {filters.sortBy!=="Newest"&&<Chip label={filters.sortBy} onRemove={()=>set("sortBy","Newest")}/>}
          {filters.showSold&&<Chip label="Showing Sold" onRemove={()=>set("showSold",false)}/>}
          <button style={{background:"transparent",border:"none",color:"#e8172c",fontSize:12,cursor:"pointer",fontWeight:700,padding:0}} onClick={clearAll}>Clear all</button>
        </div>
      )}

      {/* Filter Drawer */}
      {showFilters&&(
        <div style={{background:"#fff",margin:"0 16px 12px",borderRadius:16,padding:16,border:"1px solid #f0f0f0",maxHeight:"72vh",overflowY:"auto",boxShadow:"0 4px 20px rgba(0,0,0,0.08)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <span style={{color:"#111",fontWeight:800,fontSize:15}}>Filter Parts</span>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <button style={{background:"transparent",border:"none",color:"#e8172c",fontSize:12,cursor:"pointer",fontWeight:700}} onClick={clearAll}>Reset All</button>
              <button style={{background:"transparent",border:"none",cursor:"pointer",color:"#999",fontSize:20,lineHeight:1,padding:0}} onClick={()=>setShowFilters(false)}>×</button>
            </div>
          </div>
          <FLabel>Category</FLabel>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
            {CATEGORIES.map(c=><Pill key={c} label={c} active={filters.category===c} onClick={()=>set("category",c)}/>)}
          </div>
          <FLabel>Car Make</FLabel>
          <select style={C.select} value={filters.make} onChange={e=>set("make",e.target.value)}>{CAR_MAKES.map(m=><option key={m}>{m}</option>)}</select>
          <FLabel>Model</FLabel>
          <input style={{...C.input,marginBottom:14}} placeholder="e.g. Camry, F-150..." value={filters.model} onChange={e=>set("model",e.target.value)}/>
          <FLabel>Year Range</FLabel>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
            <select style={C.select} value={filters.yearFrom} onChange={e=>set("yearFrom",e.target.value)}><option value="">From</option>{YEARS.map(y=><option key={y}>{y}</option>)}</select>
            <select style={C.select} value={filters.yearTo}   onChange={e=>set("yearTo",e.target.value)}>  <option value="">To</option>  {YEARS.map(y=><option key={y}>{y}</option>)}</select>
          </div>
          <FLabel>Condition</FLabel>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
            {["Any",...CONDITIONS].map(c=><Pill key={c} label={c} active={filters.condition===c} onClick={()=>set("condition",c)}/>)}
          </div>
          <FLabel>Price Range ({getCur(viewCur).sym}{getCur(viewCur).code})</FLabel>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
            <input style={C.input} placeholder="Min $" type="number" value={filters.priceMin} onChange={e=>set("priceMin",e.target.value)}/>
            <input style={C.input} placeholder="Max $" type="number" value={filters.priceMax} onChange={e=>set("priceMax",e.target.value)}/>
          </div>
          <FLabel>Part Number</FLabel>
          <input style={{...C.input,marginBottom:14}} placeholder="e.g. 52119-06030" value={filters.partNumber} onChange={e=>set("partNumber",e.target.value)}/>
          <FLabel>Sort By</FLabel>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
            {SORT_OPTS.map(s=><Pill key={s} label={s} active={filters.sortBy===s} onClick={()=>set("sortBy",s)}/>)}
          </div>
          <FLabel>Sold Listings</FLabel>
          <Pill label={filters.showSold?"✓ Showing SOLD":"Show SOLD listings"} active={filters.showSold} onClick={()=>set("showSold",!filters.showSold)}/>
          <button style={{...C.btnRed,marginTop:14}} onClick={()=>setShowFilters(false)}>Show {listings.length} Result{listings.length!==1?"s":""}</button>
        </div>
      )}

      <p style={{color:"#bbb",fontSize:11,padding:"0 16px 8px"}}>{listings.length} part{listings.length!==1?"s":""} · {filters.sortBy}</p>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"0 16px"}}>
        {listings.length===0&&(
          <div style={{gridColumn:"1/-1",display:"flex",flexDirection:"column",alignItems:"center",gap:14,padding:60}}>
            <Icon name="car" size={40} color="#ddd"/>
            <p style={{color:"#bbb",textAlign:"center",margin:0}}>No parts match your filters</p>
            <button style={{...C.btnGhost,width:"auto",padding:"8px 20px",fontSize:13}} onClick={clearAll}>Clear Filters</button>
          </div>
        )}
        {listings.map(l=>{
          const sellerCur=l.currency||"USD";
          const localPrice=sellerCur!==viewCur?fmtPrice(cvtPrice(l.price,sellerCur,viewCur),viewCur):null;
          const condColor=l.condition==="Excellent"?"#16a34a":l.condition==="Good"?"#2563eb":l.condition==="Fair"?"#d97706":"#dc2626";
          return(
            <div key={l.id} style={{background:"#fff",borderRadius:14,overflow:"hidden",cursor:"pointer",border:"1px solid #f0f0f0",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",opacity:l.sold?0.65:1}} onClick={()=>openListing(l)}>
              <div style={{position:"relative",height:130,background:"#f5f5f5",overflow:"hidden"}}>
                <img src={l.photos[0]} alt={l.partName} style={{width:"100%",height:"100%",objectFit:"cover",filter:l.sold?"grayscale(60%)":"none"}}/>
                {l.sold
                  ?<span style={{position:"absolute",top:7,right:7,background:"#555",color:"#fff",padding:"3px 9px",borderRadius:20,fontSize:10,fontWeight:700}}>SOLD</span>
                  :<span style={{position:"absolute",top:7,right:7,background:condColor,color:"#fff",padding:"3px 9px",borderRadius:20,fontSize:10,fontWeight:700}}>{l.condition}</span>
                }
              </div>
              <div style={{padding:"10px 12px"}}>
                <p style={{color:"#111",fontWeight:700,fontSize:13,margin:0,lineHeight:1.3}}>{l.partName}</p>
                <p style={{color:"#888",fontSize:11,margin:"3px 0 0"}}>{l.year} {l.make} {l.model}</p>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginTop:6}}>
                  <div>
                    <span style={{color:"#e8172c",fontWeight:800,fontSize:15,textDecoration:l.sold?"line-through":"none",opacity:l.sold?0.5:1}}>{fmtPrice(l.price,sellerCur)}</span>
                    {localPrice&&!l.sold&&<p style={{color:"#aaa",fontSize:10,margin:"1px 0 0"}}>≈ {localPrice}</p>}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:2}}>
                    <Icon name="pin" size={10} color="#bbb"/>
                    <span style={{color:"#bbb",fontSize:10}}>{(l.sellerLocation||"Unknown").split(",")[0]}</span>
                  </div>
                </div>
                <p style={{color:"#ccc",fontSize:10,margin:"4px 0 0"}}>{l.sold?`Sold ${timeAgo(l.soldAt)}`:timeAgo(l.createdAt)}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{height:80}}/>
    </div>
  );
}

// ─── Listing Detail ───────────────────────────────────────────────────────────
function ListingScreen({listing:l,currentUser,onBack,openChat,markSold,deleteListing,openRating,users,viewCur,setViewCur,chats}){
  const [photoIdx,setPhotoIdx]=useState(0);
  const [confirmSold,setConfirmSold]=useState(false);
  const [confirmDel,setConfirmDel]=useState(false);
  const [showAR,setShowAR]=useState(false);
  const isSeller=currentUser?.id===l.sellerId;
  const seller=users.find(u=>u.id===l.sellerId);
  const rating=avgRating(seller?.ratings||[]);
  const hasRated=(seller?.ratings||[]).some(r=>r.buyerId===currentUser?.id);
  const hasContacted=chats?Object.keys(chats).some(k=>{const[b,s]=k.split("_");return b===currentUser?.id&&s===l.sellerId&&(chats[k]||[]).length>0;}):false;
  const convertedPrice=fmtPrice(cvtPrice(l.price,l.currency||"USD",viewCur),viewCur);

  return(
    <div style={{overflowY:"auto",height:"100vh",background:"#f5f5f5"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",paddingTop:48,background:"#fff",position:"sticky",top:0,zIndex:10,borderBottom:"1px solid #f0f0f0"}}>
        <button style={{background:"transparent",border:"none",cursor:"pointer",padding:6,display:"flex"}} onClick={onBack}><Icon name="back" size={22} color="#111"/></button>
        <span style={{color:"#111",fontWeight:700,fontSize:15}}>Part Details</span>
        {isSeller&&!l.sold
          ?<button style={{background:"#e8172c",border:"none",borderRadius:8,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",padding:"6px 12px"}} onClick={()=>setConfirmSold(true)}>Mark SOLD</button>
          :<div style={{width:90}}/>
        }
      </div>

      {/* Sold Banner */}
      {l.sold&&<div style={{background:"#f0fdf4",borderBottom:"1px solid #bbf7d0",padding:"10px 16px",display:"flex",alignItems:"center",gap:8}}>
        <Icon name="sold" size={16} color="#16a34a"/>
        <span style={{color:"#16a34a",fontWeight:700,fontSize:14}}>This part has been SOLD</span>
        {l.soldAt&&<span style={{color:"#aaa",fontSize:12,marginLeft:"auto"}}>{timeAgo(l.soldAt)}</span>}
      </div>}

      {/* Gallery */}
      <div style={{position:"relative",height:240,background:"#f0f0f0",overflow:"hidden"}}>
        <img src={l.photos[photoIdx]} alt="" style={{width:"100%",height:"100%",objectFit:"cover",filter:l.sold?"grayscale(30%)":"none"}}/>
        <span style={{position:"absolute",top:10,right:10,background:"rgba(0,0,0,0.45)",color:"#fff",fontSize:11,padding:"3px 10px",borderRadius:20}}>{photoIdx+1}/{(l.photos||[]).length}</span>
        {(l.photos||[]).length>1&&<div style={{position:"absolute",bottom:8,left:0,right:0,display:"flex",justifyContent:"center",gap:6}}>
          {(l.photos||[]).map((_,i)=><div key={i} style={{width:38,height:28,borderRadius:5,overflow:"hidden",border:`2px solid ${i===photoIdx?"#e8172c":"transparent"}`,cursor:"pointer"}} onClick={()=>setPhotoIdx(i)}>
            <img src={l.photos[i]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          </div>)}
        </div>}
      </div>

      {/* AR Fitment Button */}
      {!l.sold&&(
        <button onClick={()=>setShowAR(true)} style={{margin:"0 16px",marginTop:12,display:"flex",alignItems:"center",justifyContent:"center",gap:10,background:"linear-gradient(135deg,#1a0a2e,#2d1b69)",border:"1.5px solid rgba(124,58,237,0.5)",borderRadius:14,padding:"12px 20px",cursor:"pointer",width:"calc(100% - 32px)",boxSizing:"border-box",boxShadow:"0 4px 20px rgba(124,58,237,0.25)"}}>
          <div style={{width:32,height:32,borderRadius:8,background:"rgba(124,58,237,0.2)",border:"1px solid rgba(167,139,250,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontSize:16}}>🥽</span>
          </div>
          <div style={{textAlign:"left"}}>
            <p style={{color:"#c4b5fd",fontWeight:800,fontSize:13,margin:0,letterSpacing:-0.2}}>AR Fitment Preview</p>
            <p style={{color:"rgba(167,139,250,0.6)",fontSize:11,margin:0}}>See this part on your car in real-time</p>
          </div>
          <div style={{marginLeft:"auto",background:"rgba(124,58,237,0.3)",borderRadius:20,padding:"3px 10px",flexShrink:0}}>
            <span style={{color:"#a78bfa",fontSize:10,fontWeight:700}}>BETA</span>
          </div>
        </button>
      )}

      {/* AR Modal */}
      {showAR&&<ARFitmentModal listing={l} onClose={()=>setShowAR(false)} onShareCapture={(img)=>{setShowAR(false);openChat(l);}}/>}

      <div style={{padding:16,display:"flex",flexDirection:"column",gap:14}}>
        {/* Title + Price */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <h2 style={{color:"#111",margin:0,fontSize:20,lineHeight:1.2}}>{l.partName}</h2>
            <p style={{color:"#888",margin:"4px 0 0",fontSize:13}}>{l.year} {l.make} {l.model}</p>
          </div>
          <div style={{textAlign:"right"}}>
            <p style={{color:"#e8172c",fontWeight:900,fontSize:22,margin:0,textDecoration:l.sold?"line-through":"none",opacity:l.sold?0.5:1}}>{fmtPrice(l.price,l.currency||"USD")}</p>
            <p style={{color:"#bbb",fontSize:11,margin:0}}>{getCur(l.currency||"USD").flag} {getCur(l.currency||"USD").name}</p>
            {(l.currency||"USD")!==viewCur&&!l.sold&&<p style={{color:"#aaa",fontSize:11,margin:"3px 0 0"}}>≈ {fmtPrice(cvtPrice(l.price,l.currency||"USD",viewCur),viewCur)} {viewCur}</p>}
          </div>
        </div>

        {/* Currency Converter */}
        {!l.sold&&(
          <div style={{background:"#fff",borderRadius:12,padding:"12px 14px",border:"1px solid #f0f0f0"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <span style={{color:"#aaa",fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:0.6}}>Your Local Currency {getCur(viewCur).flag}</span>
              <CurrencySelector value={viewCur} onChange={setViewCur} compact/>
            </div>
            {viewCur!==(l.currency||"USD")?(
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{flex:1,background:"#f5f5f5",borderRadius:8,padding:"8px 12px"}}>
                  <p style={{color:"#aaa",fontSize:9,textTransform:"uppercase",fontWeight:800,margin:"0 0 3px"}}>Listed Price</p>
                  <p style={{color:"#333",fontSize:15,fontWeight:700,margin:0}}>{fmtPrice(l.price,l.currency||"USD")} <span style={{color:"#bbb",fontSize:11}}>{l.currency}</span></p>
                </div>
                <span style={{color:"#ddd",fontSize:18}}>→</span>
                <div style={{flex:1,background:"#f0fdf4",borderRadius:8,padding:"8px 12px",border:"1px solid #bbf7d0"}}>
                  <p style={{color:"#16a34a",fontSize:9,textTransform:"uppercase",fontWeight:800,margin:"0 0 3px"}}>{viewCur} Equivalent</p>
                  <p style={{color:"#16a34a",fontSize:15,fontWeight:800,margin:0}}>{convertedPrice}</p>
                </div>
              </div>
            ):(
              <p style={{color:"#bbb",fontSize:12,margin:0}}>Select another currency above to convert</p>
            )}
            <p style={{color:"#ddd",fontSize:10,margin:"8px 0 0",textAlign:"center"}}>⚠️ Indicative rate only — agree final price with seller</p>
          </div>
        )}

        {/* Meta */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[{label:"Category",val:l.category},{label:"Condition",val:l.condition},{label:"Part #",val:l.partNumber||"N/A"}].map((m,i)=>(
            <div key={i} style={{background:"#fff",borderRadius:10,padding:"10px 12px",border:"1px solid #f0f0f0"}}>
              <span style={{color:"#bbb",fontSize:9,textTransform:"uppercase",fontWeight:800,display:"block",letterSpacing:0.5}}>{m.label}</span>
              <span style={{color:"#111",fontSize:12,fontWeight:700,marginTop:4,display:"block"}}>{m.val}</span>
            </div>
          ))}
        </div>

        {l.vin&&<div style={{background:"#fff",borderRadius:10,padding:"10px 14px",border:"1px solid #f0f0f0"}}>
          <span style={{color:"#bbb",fontSize:9,fontWeight:800,textTransform:"uppercase",display:"block",marginBottom:3}}>VIN</span>
          <span style={{color:"#555",fontSize:13,fontFamily:"monospace"}}>{l.vin}</span>
        </div>}

        <div>
          <span style={{color:"#bbb",fontSize:10,textTransform:"uppercase",fontWeight:800,letterSpacing:0.6,display:"block",marginBottom:8}}>Description</span>
          <p style={{color:"#333",fontSize:14,lineHeight:1.7,margin:0}}>{l.description}</p>
        </div>

        {/* Seller Card */}
        <div style={{background:"#fff",borderRadius:14,padding:14,border:"1px solid #f0f0f0",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:46,height:46,borderRadius:"50%",background:"linear-gradient(135deg,#e8172c,#ff6b6b)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:18,flexShrink:0}}>{l.sellerName[0]}</div>
            <div style={{flex:1}}>
              <p style={{color:"#111",fontWeight:700,margin:0,fontSize:15}}>{l.sellerName}</p>
              <div style={{display:"flex",alignItems:"center",gap:4,marginTop:2}}>
                <Icon name="pin" size={12} color="#e8172c"/>
                <span style={{color:"#888",fontSize:12}}>{l.sellerLocation}</span>
              </div>
              {rating?<div style={{display:"flex",alignItems:"center",gap:5,marginTop:4}}><Stars value={parseFloat(rating)} size={13}/><span style={{color:"#f59e0b",fontSize:12,fontWeight:700}}>{rating}</span><span style={{color:"#bbb",fontSize:11}}>({seller?.ratings?.length} review{seller?.ratings?.length!==1?"s":""})</span></div>
                     :<p style={{color:"#bbb",fontSize:12,margin:"4px 0 0"}}>No ratings yet</p>}
            </div>
          </div>
          {!l.sold&&<div style={{display:"flex",gap:8,marginTop:12}}>
            <a href={`tel:${l.sellerPhone}`} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"#16a34a",border:"none",borderRadius:8,padding:"10px",fontWeight:700,fontSize:13,color:"#fff",textDecoration:"none",cursor:"pointer",boxShadow:"0 2px 8px rgba(22,163,74,0.3)"}}><Icon name="phone" size={15} color="#fff"/> Call Seller</a>
            <a href={`mailto:${l.sellerEmail}`} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"#fff",border:"1.5px solid #e0e0e0",borderRadius:8,padding:"8px",fontWeight:600,fontSize:13,color:"#333",textDecoration:"none",cursor:"pointer"}}><Icon name="mail"  size={15} color="#333"/> Email</a>
          </div>}
        </div>

        {/* Reviews */}
        {seller?.ratings?.length>0&&<div>
          <span style={{color:"#bbb",fontSize:10,textTransform:"uppercase",fontWeight:800,letterSpacing:0.6,display:"block",marginBottom:8}}>Seller Reviews</span>
          {seller.ratings.slice().reverse().slice(0,3).map((r,i)=>(
            <div key={i} style={{background:"#fff",borderRadius:10,padding:"10px 14px",marginBottom:8,border:"1px solid #f0f0f0"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><Stars value={r.stars} size={13}/><span style={{color:"#bbb",fontSize:11}}>{r.buyerName} · {timeAgo(r.createdAt)}</span></div>
              {r.review&&<p style={{color:"#444",fontSize:13,margin:0,lineHeight:1.5}}>{r.review}</p>}
            </div>
          ))}
        </div>}

        {/* Disclaimer */}
        <div style={{background:"#fffbeb",borderRadius:10,padding:"10px 12px",display:"flex",alignItems:"flex-start",gap:8,border:"1px solid #fde68a"}}>
          <Icon name="warning" size={15} color="#d97706"/>
          <span style={{color:"#92400e",fontSize:12,flex:1,lineHeight:1.5}}>SPAREZ is NOT involved in transactions. All purchases are directly between buyer and seller.</span>
        </div>

        {/* Buyer Actions */}
        {!isSeller&&!l.sold&&<button style={C.btnRed} onClick={()=>openChat(l)}><Icon name="chat" size={18} color="#fff"/> Chat with Seller</button>}
        {!isSeller&&hasContacted&&!hasRated&&<button style={C.btnGhost} onClick={openRating}><Icon name="star" size={16} color="#f59e0b"/> Rate this Seller</button>}
        {!isSeller&&hasContacted&&hasRated&&<p style={{textAlign:"center",color:"#16a34a",fontSize:13,margin:0}}>✓ You have already rated this seller</p>}
        {!isSeller&&!hasContacted&&<p style={{textAlign:"center",color:"#bbb",fontSize:12,margin:0}}>💬 Chat with the seller to unlock the ability to rate them</p>}

        {/* Seller Actions */}
        {isSeller&&<div style={{display:"flex",gap:8}}>
          {!l.sold&&<button style={{...C.btnRed,flex:1,background:"#16a34a",boxShadow:"none"}} onClick={()=>setConfirmSold(true)}><Icon name="sold" size={16} color="#fff"/> Mark as SOLD</button>}
          <button style={{flex:1,background:"#fff",color:"#e8172c",border:"1.5px solid #fca5a5",borderRadius:12,padding:"13px",fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}} onClick={()=>setConfirmDel(true)}><Icon name="trash" size={15} color="#e8172c"/> Delete</button>
        </div>}
      </div>

      {/* Confirm SOLD */}
      {confirmSold&&<Modal onClose={()=>setConfirmSold(false)}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{width:60,height:60,borderRadius:"50%",background:"#f0fdf4",border:"2px solid #bbf7d0",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}><Icon name="sold" size={28} color="#16a34a"/></div>
          <h3 style={{color:"#111",margin:"0 0 8px"}}>Mark as SOLD?</h3>
          <p style={{color:"#666",fontSize:14,margin:0,lineHeight:1.5}}>This listing will be marked <strong style={{color:"#e8172c"}}>SOLD</strong> and automatically removed from browse. This cannot be undone.</p>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button style={C.btnGhost} onClick={()=>setConfirmSold(false)}>Cancel</button>
          <button style={{...C.btnRed,background:"#16a34a",flex:1}} onClick={()=>{markSold(l.id);setConfirmSold(false);}}>Yes, Mark SOLD</button>
        </div>
      </Modal>}

      {/* Confirm Delete */}
      {confirmDel&&<Modal onClose={()=>setConfirmDel(false)}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{width:60,height:60,borderRadius:"50%",background:"#fef2f2",border:"2px solid #fecaca",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}><Icon name="trash" size={28} color="#e8172c"/></div>
          <h3 style={{color:"#111",margin:"0 0 8px"}}>Delete Listing?</h3>
          <p style={{color:"#666",fontSize:14,margin:0}}>This listing will be permanently deleted and cannot be recovered.</p>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button style={C.btnGhost} onClick={()=>setConfirmDel(false)}>Cancel</button>
          <button style={{...C.btnRed,flex:1}} onClick={()=>{deleteListing(l.id);setConfirmDel(false);}}>Yes, Delete</button>
        </div>
      </Modal>}
      <div style={{height:80}}/>
    </div>
  );
}

// ─── Add Listing ──────────────────────────────────────────────────────────────
function CameraModal({onCapture,onClose}){
  const videoRef=useRef();
  const canvasRef=useRef();
  const [stream,setStream]=useState(null);
  const [captured,setCaptured]=useState(null);
  const [facingMode,setFacingMode]=useState("environment"); // rear camera default
  const [err,setErr]=useState(null);

  const startCamera=async(mode)=>{
    if(stream){stream.getTracks().forEach(t=>t.stop());}
    try{
      const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:mode,width:{ideal:1280},height:{ideal:960}}});
      setStream(s);
      if(videoRef.current){videoRef.current.srcObject=s;videoRef.current.play();}
      setErr(null);
    }catch(e){setErr("Camera access denied. Please allow camera permission and try again.");}
  };

  useEffect(()=>{startCamera(facingMode);return()=>{if(stream)stream.getTracks().forEach(t=>t.stop());};},[]);

  const [compressing,setCompressing]=useState(false);
  const [sizeInfo,setSizeInfo]=useState(null); // {before, after}

  const flip=()=>{const m=facingMode==="environment"?"user":"environment";setFacingMode(m);startCamera(m);};

  const snap=async()=>{
    const canvas=canvasRef.current;
    const video=videoRef.current;
    // Capture full resolution first to measure original size
    canvas.width=video.videoWidth; canvas.height=video.videoHeight;
    canvas.getContext("2d").drawImage(video,0,0);
    const raw=canvas.toDataURL("image/jpeg",0.95);
    const rawKB=Math.round((raw.length*0.75)/1024);
    setCompressing(true);
    const compressed=await compressImage(raw);
    const compKB=Math.round((compressed.length*0.75)/1024);
    setSizeInfo({before:rawKB,after:compKB});
    setCaptured(compressed);
    setCompressing(false);
  };

  const retake=()=>setCaptured(null);

  const use=()=>{onCapture(captured);onClose();};

  return(
    <div style={{position:"fixed",inset:0,background:"#000",zIndex:500,display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",paddingTop:48,background:"rgba(0,0,0,0.7)"}}>
        <button style={{background:"transparent",border:"none",cursor:"pointer",padding:6,display:"flex"}} onClick={onClose}><Icon name="x" size={24} color="#fff"/></button>
        <span style={{color:"#fff",fontWeight:700,fontSize:15}}>📷 Take Photo</span>
        {!captured&&<button style={{background:"transparent",border:"1px solid #fff4",borderRadius:8,padding:"6px 10px",cursor:"pointer",color:"#fff",fontSize:12,fontWeight:600}} onClick={flip}>🔄 Flip</button>}
        {captured&&<div style={{width:60}}/>}
      </div>

      {/* Viewfinder or Preview */}
      <div style={{flex:1,position:"relative",overflow:"hidden",background:"#111",display:"flex",alignItems:"center",justifyContent:"center"}}>
        {err&&(
          <div style={{textAlign:"center",padding:32}}>
            <div style={{fontSize:48,marginBottom:16}}>📷</div>
            <p style={{color:"#fff",fontSize:14,lineHeight:1.6,margin:0}}>{err}</p>
          </div>
        )}
        {!err&&!captured&&(
          <>
            <video ref={videoRef} autoPlay playsInline muted style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            {/* Viewfinder corners */}
            <div style={{position:"absolute",inset:0,pointerEvents:"none"}}>
              {[{top:20,left:20,bt:"t",bl:"l"},{top:20,right:20,bt:"t",bl:"r"},{bottom:20,left:20,bt:"b",bl:"l"},{bottom:20,right:20,bt:"b",bl:"r"}].map((c,i)=>(
                <div key={i} style={{position:"absolute",...(c.top!==undefined?{top:c.top}:{bottom:c.bottom}),...(c.left!==undefined?{left:c.left}:{right:c.right}),width:30,height:30,
                  borderTop:c.bt==="t"?"3px solid #e8172c":"none",borderBottom:c.bt==="b"?"3px solid #e8172c":"none",
                  borderLeft:c.bl==="l"?"3px solid #e8172c":"none",borderRight:c.bl==="r"?"3px solid #e8172c":"none"}}/>
              ))}
            </div>
          </>
        )}
        {!err&&captured&&!compressing&&(
          <div style={{position:"relative",width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <img src={captured} alt="captured" style={{width:"100%",height:"100%",objectFit:"contain"}}/>
            {sizeInfo&&(
              <div style={{position:"absolute",bottom:12,left:0,right:0,display:"flex",justifyContent:"center"}}>
                <div style={{background:"rgba(22,163,74,0.93)",borderRadius:20,padding:"5px 14px",display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:13}}>✅</span>
                  <span style={{color:"#fff",fontSize:12,fontWeight:700}}>
                    Compressed {sizeInfo.before} KB → {sizeInfo.after} KB
                  </span>
                  <span style={{color:"rgba(255,255,255,0.75)",fontSize:11}}>
                    ({Math.round((1-sizeInfo.after/sizeInfo.before)*100)}% saved)
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
        {compressing&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:"50%",border:"4px solid #e8172c",borderTopColor:"transparent",animation:"spin .7s linear infinite"}}/>
            <p style={{color:"#fff",fontSize:13,fontWeight:600,margin:0}}>Compressing…</p>
          </div>
        )}
        <canvas ref={canvasRef} style={{display:"none"}}/>
      </div>

      {/* Controls */}
      <div style={{background:"rgba(0,0,0,0.85)",padding:"24px 16px 40px",display:"flex",alignItems:"center",justifyContent:"center",gap:24}}>
        {!captured&&!err&&!compressing&&(
          <button onClick={snap} style={{width:72,height:72,borderRadius:"50%",background:"#fff",border:"4px solid #e8172c",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 0 4px rgba(232,23,44,0.3)"}}>
            <div style={{width:52,height:52,borderRadius:"50%",background:"#e8172c"}}/>
          </button>
        )}
        {captured&&(
          <>
            <button onClick={retake} style={{flex:1,background:"transparent",border:"1.5px solid #fff4",borderRadius:12,padding:"13px",color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer"}}>↩ Retake</button>
            <button onClick={use} style={{flex:1,background:"#e8172c",border:"none",borderRadius:12,padding:"13px",color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:"0 4px 12px rgba(232,23,44,0.4)"}}>✓ Use Photo</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── AI Part Scanner ──────────────────────────────────────────────────────────

// Maps COCO-SSD detected objects → SPAREZ categories + part hints
// ─── AI Part Scanner — Powered by Google Gemini (Free) ───────────────────────

async function analyseWithGemini(base64Image, mediaType) {
  // Calls our Supabase Edge Function — keeps the Gemini key secret on the server
  // so users can never steal it from the browser and drain your quota
  const res = await fetch("https://tdmzyobydepljktoljxq.supabase.co/functions/v1/scan-part", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ base64Image, mediaType })
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    const msg = data.error || `Server error ${res.status}`;
    if (msg === "NO_KEY") throw new Error("NO_KEY");
    throw new Error(msg);
  }
  return data;
}

function AIPartScanner({ onResult, onClose }) {
  const fileRef   = useRef();
  const videoRef  = useRef();
  const streamRef = useRef();

  const [phase, setPhase]             = useState("intro"); // intro|camera|camera_err|scanning|done|error|no_key
  const [capturedImg, setCapturedImg] = useState(null);
  const [result, setResult]           = useState(null);
  const [errorMsg, setErrorMsg]       = useState("");
  const [progress, setProgress]       = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [dots, setDots]               = useState("");

  // Animated dots for scanning phase
  useEffect(() => {
    if (phase !== "scanning") return;
    const id = setInterval(() => setDots(d => d.length >= 3 ? "" : d + "."), 500);
    return () => clearInterval(id);
  }, [phase]);

  const stopCam = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };
  useEffect(() => () => stopCam(), []);

  const startCamera = async () => {
    setCameraReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      setPhase("camera"); // mount video element AFTER stream is ready
    } catch(e) { stopCam(); setPhase("camera_err"); }
  };

  // Once camera phase mounts the <video> element, attach the stream
  useEffect(() => {
    if (phase !== "camera" || !streamRef.current) return;
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = streamRef.current;
    video.play()
      .then(() => setCameraReady(true))
      .catch(() => { stopCam(); setPhase("camera_err"); });
  }, [phase]);

  const snapPhoto = () => {
    const video = videoRef.current; if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d").drawImage(video, 0, 0);
    stopCam();
    const imgData = canvas.toDataURL("image/jpeg", 0.88);
    setCapturedImg(imgData);
    runAnalysis(imgData);
  };

  const handleFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = ev => {
      setCapturedImg(ev.target.result);
      runAnalysis(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const runAnalysis = async (imgDataUrl) => {
    setPhase("scanning");
    setProgress("Preparing image");
    try {
      // Compress to max 800px wide, JPEG 80% — keeps payload small for edge function
      const compressed = await new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
          const MAX = 800;
          const scale = Math.min(1, MAX / Math.max(img.width, img.height));
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          const canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          canvas.getContext("2d").drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.80));
        };
        img.src = imgDataUrl;
      });

      setProgress("Sending to Gemini AI");
      const [header, base64] = compressed.split(",");
      const mediaType = "image/jpeg";
      const parsed = await analyseWithGemini(base64, mediaType);
      setResult(parsed);
      setPhase("done");
    } catch(e) {
      console.error("Gemini scanner error:", e);
      if (e.message === "NO_KEY") {
        setPhase("no_key");
      } else {
        setErrorMsg(e.message || "Analysis failed — please try again");
        setPhase("error");
      }
    }
  };

  const applyResult = () => {
    if (!result) return;
    onResult({
      category:    result.category,
      partName:    result.partName,
      partNumber:  result.partNumber || "",
      condition:   result.condition,
      year:        result.year || "",
      description: result.description || "",
    });
    onClose();
  };

  // Shared header — close button ALWAYS visible
  const Header = ({ title = "AI Part Scanner", onBack = null }) => (
    <div style={{ flexShrink: 0, padding: "10px 16px 0" }}>
      <div style={{ width: 36, height: 4, background: "#e0e0e0", borderRadius: 2, margin: "0 auto 12px" }}/>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {onBack && (
            <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 6px 2px 0", color: "#888", display:"flex",alignItems:"center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          )}
          <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg,#4285f4,#34a853)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 13 }}>✦</span>
          </div>
          <span style={{ color: "#111", fontWeight: 800, fontSize: 15 }}>{title}</span>
          <span style={{ background: "#e8f5e9", color: "#2e7d32", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, border: "1px solid #c8e6c9" }}>FREE</span>
        </div>
        <button
          onClick={() => { stopCam(); onClose(); }}
          style={{ width: 32, height: 32, borderRadius: "50%", background: "#f5f5f5", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#555", fontWeight: 700, flexShrink: 0 }}>
          ×
        </button>
      </div>
    </div>
  );

  // ── INTRO ────────────────────────────────────────────────────────────────
  if (phase === "intro") return (
    <div style={{ position: "fixed", inset: 0, zIndex: 700, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: "22px 22px 0 0", width: "100%", maxWidth: 430, maxHeight: "92vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header />
        <div style={{ padding: "12px 20px 36px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Hero */}
          <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
            <div style={{ width: 68, height: 68, borderRadius: 20, background: "linear-gradient(135deg,#4285f4,#34a853)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: "0 6px 20px rgba(66,133,244,0.35)" }}>
              <span style={{ fontSize: 32 }}>🔍</span>
            </div>
            <h3 style={{ color: "#111", fontWeight: 900, fontSize: 18, margin: "0 0 6px" }}>Gemini AI Scanner</h3>
            <p style={{ color: "#888", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
              Point your camera at any car part — Google Gemini AI will instantly identify it and auto-fill your listing.
            </p>
          </div>
          {/* Feature pills */}
          {[
            ["📸", "Photo or upload", "Camera snap or pick from gallery"],
            ["🤖", "Gemini Vision AI", "Correctly identifies real car parts"],
            ["⚡", "Auto-fills form",  "Part name, category, condition & more"],
            ["💰", "100% free",        "1,500 scans/day — no cost ever"],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ display: "flex", alignItems: "center", gap: 12, background: "#f8f8f8", borderRadius: 12, padding: "10px 14px" }}>
              <span style={{ fontSize: 20, minWidth: 28 }}>{icon}</span>
              <div>
                <p style={{ color: "#111", fontWeight: 700, fontSize: 13, margin: 0 }}>{title}</p>
                <p style={{ color: "#aaa", fontSize: 11, margin: 0 }}>{desc}</p>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button style={C.btnRed} onClick={startCamera}>📸 Open Camera</button>
            <button style={{ ...C.btnGhost, flex: "0 0 auto", width: "auto", padding: "13px 18px" }} onClick={() => fileRef.current.click()}>🖼️ Upload</button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
        </div>
      </div>
    </div>
  );

  // ── CAMERA ───────────────────────────────────────────────────────────────
  if (phase === "camera") return (
    <div style={{ position: "fixed", inset: 0, zIndex: 700, background: "#000" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      {/* Video fills entire screen behind everything */}
      <video ref={videoRef} autoPlay playsInline muted
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />

      {/* Viewfinder corners — pointer-events none so they don't block taps */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 220, height: 220, position: "relative" }}>
          {[
            { top: 0, left: 0, borderTop: "3px solid #fff", borderLeft: "3px solid #fff" },
            { top: 0, right: 0, borderTop: "3px solid #fff", borderRight: "3px solid #fff" },
            { bottom: 0, left: 0, borderBottom: "3px solid #fff", borderLeft: "3px solid #fff" },
            { bottom: 0, right: 0, borderBottom: "3px solid #fff", borderRight: "3px solid #fff" },
          ].map((s, i) => <div key={i} style={{ position: "absolute", ...s, width: 32, height: 32, borderRadius: 3 }} />)}
        </div>
      </div>

      {/* Hint label — above centre */}
      <div style={{ position: "absolute", top: "38%", left: 0, right: 0, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
        <span style={{ background: "rgba(0,0,0,0.65)", color: "#fff", fontSize: 12, padding: "5px 16px", borderRadius: 20 }}>
          {cameraReady ? "Centre the part then tap capture" : "Starting camera…"}
        </span>
      </div>

      {/* Controls — pinned to bottom, always on top */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.82)", paddingTop: 20, paddingBottom: 44, paddingLeft: 40, paddingRight: 40, display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
        {/* Back */}
        <button onClick={() => { stopCam(); setPhase("intro"); }}
          style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.25)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>

        {/* Shutter — always tappable, shows loading state when not ready */}
        <button onClick={snapPhoto}
          style={{ width: 76, height: 76, borderRadius: "50%", background: "#fff", border: "5px solid #e8172c", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 6px rgba(232,23,44,0.25)", flexShrink: 0 }}>
          {cameraReady
            ? <div style={{ width: 58, height: 58, borderRadius: "50%", background: "#e8172c" }} />
            : <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid #e8172c", borderTopColor: "transparent", animation: "spin .8s linear infinite" }} />
          }
        </button>

        {/* Gallery */}
        <button onClick={() => fileRef.current.click()}
          style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.25)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </button>
      </div>

      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
    </div>
  );

  // ── CAMERA ERROR ─────────────────────────────────────────────────────────
  if (phase === "camera_err") return (
    <div style={{ position: "fixed", inset: 0, zIndex: 700, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: "22px 22px 0 0", width: "100%", maxWidth: 430, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header />
        <div style={{ padding: "28px 24px 44px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
          <span style={{ fontSize: 52 }}>📷</span>
          <div>
            <p style={{ color: "#111", fontWeight: 700, fontSize: 16, margin: "0 0 6px" }}>Camera access denied</p>
            <p style={{ color: "#888", fontSize: 13, margin: 0, lineHeight: 1.6 }}>No problem — upload a photo from your gallery and Gemini will still identify the part.</p>
          </div>
          <button style={C.btnRed} onClick={() => fileRef.current.click()}>🖼️ Choose from Gallery</button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
        </div>
      </div>
    </div>
  );

  // ── SCANNING ─────────────────────────────────────────────────────────────
  if (phase === "scanning") return (
    <div style={{ position: "fixed", inset: 0, zIndex: 700, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: "22px 22px 0 0", width: "100%", maxWidth: 430, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header title="Analysing…" />
        <div style={{ padding: "20px 20px 44px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          {capturedImg && <img src={capturedImg} alt="" style={{ width: "100%", maxHeight: 200, objectFit: "contain", borderRadius: 12, border: "1px solid #f0f0f0" }} />}
          {/* Google-coloured spinner */}
          <div style={{ position: "relative", width: 52, height: 52 }}>
            <svg width="52" height="52" viewBox="0 0 52 52" style={{ animation: "spin 1s linear infinite" }}>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <circle cx="26" cy="26" r="20" fill="none" stroke="#f0f0f0" strokeWidth="5"/>
              <circle cx="26" cy="26" r="20" fill="none" stroke="url(#g)" strokeWidth="5" strokeDasharray="80 46" strokeLinecap="round"/>
              <defs>
                <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4285f4"/>
                  <stop offset="33%" stopColor="#34a853"/>
                  <stop offset="66%" stopColor="#fbbc05"/>
                  <stop offset="100%" stopColor="#ea4335"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#111", fontWeight: 700, fontSize: 15, margin: "0 0 4px" }}>{progress}{dots}</p>
            <p style={{ color: "#aaa", fontSize: 12, margin: 0 }}>Usually takes 2–4 seconds</p>
          </div>
        </div>
      </div>
    </div>
  );

  // ── DONE ─────────────────────────────────────────────────────────────────
  if (phase === "done" && result) return (
    <div style={{ position: "fixed", inset: 0, zIndex: 700, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: "22px 22px 0 0", width: "100%", maxWidth: 430, maxHeight: "92vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header title="Part Identified ✓" />
        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 36px", display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Photo + confidence */}
          {capturedImg && (
            <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: "1px solid #f0f0f0", marginTop: 4 }}>
              <img src={capturedImg} alt="" style={{ width: "100%", maxHeight: 190, objectFit: "cover", display: "block" }} />
              <div style={{ position: "absolute", top: 8, right: 8, background: (result.confidence||0) > 60 ? "rgba(22,163,74,0.92)" : "rgba(245,158,11,0.92)", borderRadius: 20, padding: "3px 10px" }}>
                <span style={{ color: "#fff", fontSize: 11, fontWeight: 800 }}>{result.confidence || "~80"}% confident</span>
              </div>
            </div>
          )}
          {/* Gemini badge */}
          <div style={{ background: "linear-gradient(135deg,#e8f0fe,#e6f4ea)", borderRadius: 12, padding: "11px 14px", border: "1px solid #c5d7f5", display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 20 }}>✦</span>
            <div>
              <p style={{ color: "#1a73e8", fontWeight: 800, fontSize: 13, margin: 0 }}>Identified by Gemini AI</p>
              <p style={{ color: "#5f9ea0", fontSize: 11, margin: 0 }}>{result.description || `${result.partName} — ${result.category}`}</p>
            </div>
          </div>
          {/* Fields */}
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f0f0f0", overflow: "hidden" }}>
            <div style={{ background: "#fafafa", padding: "10px 14px", borderBottom: "1px solid #f0f0f0" }}>
              <p style={{ color: "#111", fontWeight: 800, fontSize: 13, margin: 0 }}>Will auto-fill these fields</p>
            </div>
            {[
              ["Category",   result.category,               true],
              ["Part Name",  result.partName,                !!result.partName],
              ["Part No.",   result.partNumber || "—",       !!result.partNumber],
              ["Condition",  result.condition,               true],
              ["Year",       result.year       || "—",       !!result.year],
            ].map(([label, val, found]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", borderBottom: "1px solid #f8f8f8" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: found ? "#34a853" : "#e0e0e0" }} />
                <p style={{ color: "#aaa", fontSize: 10, fontWeight: 700, textTransform: "uppercase", margin: 0, minWidth: 68 }}>{label}</p>
                <p style={{ color: "#111", fontSize: 13, fontWeight: 600, margin: 0, flex: 1 }}>{val}</p>
                {found && <span style={{ color: "#34a853", fontSize: 10, fontWeight: 700 }}>✓</span>}
              </div>
            ))}
          </div>
          {/* Actions */}
          <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
            <button style={{ ...C.btnGhost, flex: 1 }} onClick={() => { setCapturedImg(null); setResult(null); setPhase("intro"); }}>
              🔄 Retry
            </button>
            <button
              style={{ ...C.btnRed, flex: 2, background: "linear-gradient(135deg,#1a73e8,#0d5fb5)", boxShadow: "0 4px 14px rgba(26,115,232,0.4)" }}
              onClick={applyResult}>
              ⚡ Apply to Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── NO KEY ───────────────────────────────────────────────────────────────
  if (phase === "no_key") return (
    <div style={{ position: "fixed", inset: 0, zIndex: 700, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: "22px 22px 0 0", width: "100%", maxWidth: 430, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header title="Setup Required" />
        <div style={{ padding: "16px 20px 44px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "#fff8e1", borderRadius: 12, padding: "14px", border: "1px solid #ffe082" }}>
            <p style={{ color: "#e65100", fontWeight: 700, fontSize: 14, margin: "0 0 6px" }}>⚙️ Gemini key not set on server</p>
            <p style={{ color: "#bf360c", fontSize: 12, margin: 0, lineHeight: 1.7 }}>
              Add <code style={{ background: "#fff3e0", padding: "1px 5px", borderRadius: 4, fontSize: 11 }}>GEMINI_KEY</code> to your Supabase Edge Function secrets.
            </p>
          </div>
          <div style={{ background: "#f8f8f8", borderRadius: 12, padding: "14px 16px" }}>
            <p style={{ color: "#333", fontSize: 13, fontWeight: 700, margin: "0 0 10px" }}>🚀 Setup (5 min, free):</p>
            {[
              ["1", "Go to aistudio.google.com → Get API Key"],
              ["2", "Supabase Dashboard → Edge Functions → scan-part"],
              ["3", "Click Secrets → Add: GEMINI_KEY = your-key"],
              ["4", "That's it — key is safe on the server"],
            ].map(([n, t]) => (
              <div key={n} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 7 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#1a73e8", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{n}</div>
                <p style={{ color: "#555", fontSize: 12, margin: 0, lineHeight: 1.5 }}>{t}</p>
              </div>
            ))}
          </div>
          <button style={C.btnGhost} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );

  // ── ERROR ────────────────────────────────────────────────────────────────
  if (phase === "error") return (
    <div style={{ position: "fixed", inset: 0, zIndex: 700, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: "22px 22px 0 0", width: "100%", maxWidth: 430, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header title="Scan Failed" />
        <div style={{ padding: "20px 20px 40px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, background:"#fff5f5", borderRadius:12, padding:"14px", border:"1px solid #fecaca" }}>
            <span style={{ fontSize: 28, flexShrink:0 }}>⚠️</span>
            <div>
              <p style={{ color: "#c0392b", fontWeight: 700, fontSize: 14, margin: "0 0 4px" }}>Scan Failed</p>
              <p style={{ color: "#888", fontSize: 12, margin: 0, lineHeight: 1.5, wordBreak:"break-word" }}>{errorMsg || "Unknown error"}</p>
            </div>
          </div>
          <div style={{ background:"#f8f8f8", borderRadius:10, padding:"12px 14px" }}>
            <p style={{ color:"#555", fontSize:12, fontWeight:700, margin:"0 0 6px" }}>Common fixes:</p>
            <p style={{ color:"#888", fontSize:11, margin:0, lineHeight:1.8 }}>
              • Edge function not deployed → check Supabase → Edge Functions<br/>
              • GEMINI_KEY secret missing → add it in Edge Functions → Secrets<br/>
              • Poor internet connection → try again<br/>
              • Image too dark or blurry → retake in better light
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ ...C.btnGhost, flex: 1 }} onClick={() => { setCapturedImg(null); setResult(null); setPhase("intro"); }}>Try Again</button>
            <button style={{ ...C.btnRed, flex: 1 }} onClick={() => { stopCam(); onClose(); }}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );

  // Fallback — always closeable
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 700, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: "22px 22px 0 0", width: "100%", maxWidth: 430, padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
        <button style={C.btnGhost} onClick={() => { stopCam(); onClose(); }}>Close</button>
      </div>
    </div>
  );
}
// ─── End AI Part Scanner ──────────────────────────────────────────────────────




function AddListingScreen({currentUser,setListings,notify,setScreen}){
  const [f,sf]=useState({make:"",model:"",year:"",vin:"",partName:"",partNumber:"",category:"Body Parts",condition:"Good",price:"",description:"",location:""});
  const [photos,setPhotos]=useState([]);
  const [showPhotoMenu,setShowPhotoMenu]=useState(false);
  const [showAIScanner,setShowAIScanner] = useState(false);
  const [aiApplied,setAiApplied]         = useState(false);
  const fileRef=useRef();
  const cameraRef=useRef();
  const set=(k,v)=>sf(p=>({...p,[k]:v}));

  const applyAIScan = (result) => {
    if(result.category)  set("category", result.category);
    if(result.partName)  set("partName",  result.partName);
    if(result.partNumber)set("partNumber",result.partNumber);
    if(result.condition) set("condition", result.condition);
    if(result.year)      set("year",      result.year);
    if(result.description) set("description", result.description);
    setAiApplied(true);
    notify("🤖 AI filled in the form — review and complete!","success");
  };

  const [compressing,setCompressing]=useState(false);

  const handleFiles=async e=>{
    const remaining=10-photos.length;
    if(remaining<=0){notify("Maximum 10 photos already added","error");e.target.value="";return;}
    const files=Array.from(e.target.files).slice(0,remaining);
    e.target.value="";
    if(!files.length)return;
    setCompressing(true);
    const compressed=await compressAll(files);
    setPhotos(p=>[...p,...compressed].slice(0,10));
    setCompressing(false);
  };

  const removePhoto=(i)=>setPhotos(ph=>ph.filter((_,j)=>j!==i));

  const [submitting,setSubmitting]=useState(false);
  const submit=async()=>{
    if(submitting)return;
    const req=["make","model","year","partName","category","condition","price","description","location"];
    if(req.some(k=>!f[k]))return notify("Fill all required fields","error");
    if(f.model==="Other (not listed)"&&!f.customModel?.trim())return notify("Please enter the model name","error");
    if(photos.length===0)return notify("Add at least one photo","error");
    setSubmitting(true);
    const finalModel=f.model==="Other (not listed)"?f.customModel:f.model;
    const newListing={id:genId(),sellerId:currentUser.id,sellerName:currentUser.name,
      sellerPhone:currentUser.phone,sellerEmail:currentUser.email,
      sellerLocation:f.location||"Location not set",...f,model:finalModel,
      currency:currentUser.currency||"USD",photos,createdAt:Date.now(),sold:false};
    // Optimistic UI
    setListings(ls=>[newListing,...ls]);
    notify("Part listed successfully!","success");setScreen("mylistings");
    // Persist to Supabase
    try{
      const sb=await getSB();
      await sb.from("listings").insert(listingToRow(newListing));
    }catch(e){console.error("Failed to save listing:",e);notify("Listing saved locally only — check connection","error");}
    finally{setSubmitting(false);}
  };

  return(
    <>
    {showAIScanner&&<AIPartScanner onResult={applyAIScan} onClose={()=>setShowAIScanner(false)}/>}

    {/* Photo Source Menu */}
    {showPhotoMenu&&(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setShowPhotoMenu(false)}>
        <div style={{background:"#fff",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:430,padding:"20px 16px 40px"}} onClick={e=>e.stopPropagation()}>
          <div style={{width:40,height:4,borderRadius:2,background:"#e0e0e0",margin:"0 auto 20px"}}/>
          <p style={{color:"#111",fontWeight:800,fontSize:16,margin:"0 0 16px",textAlign:"center"}}>Add Photo</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <button style={{display:"flex",alignItems:"center",gap:14,background:"#fff5f5",border:"1.5px solid #fecaca",borderRadius:14,padding:"16px 18px",cursor:"pointer",textAlign:"left"}}
              onClick={()=>{setShowPhotoMenu(false);setTimeout(()=>cameraRef.current.click(),200);}}>
              <span style={{fontSize:28}}>📷</span>
              <div>
                <p style={{color:"#111",fontWeight:700,fontSize:15,margin:0}}>Take Photo</p>
                <p style={{color:"#888",fontSize:12,margin:"2px 0 0"}}>Open camera and snap a picture</p>
              </div>
            </button>
            <button style={{display:"flex",alignItems:"center",gap:14,background:"#f5f5f5",border:"1.5px solid #e0e0e0",borderRadius:14,padding:"16px 18px",cursor:"pointer",textAlign:"left"}}
              onClick={()=>{setShowPhotoMenu(false);setTimeout(()=>fileRef.current.click(),200);}}>
              <span style={{fontSize:28}}>🖼️</span>
              <div>
                <p style={{color:"#111",fontWeight:700,fontSize:15,margin:0}}>Choose from Gallery</p>
                <p style={{color:"#888",fontSize:12,margin:"2px 0 0"}}>Pick existing photos from your device</p>
              </div>
            </button>
          </div>
          <button style={{...C.btnGhost,marginTop:12}} onClick={()=>setShowPhotoMenu(false)}>Cancel</button>
        </div>
      </div>
    )}

    <div style={{overflowY:"auto",height:"100vh",background:"#f5f5f5"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",paddingTop:48,background:"#fff",position:"sticky",top:0,zIndex:10,borderBottom:"1px solid #f0f0f0"}}>
        <button style={{background:"transparent",border:"none",cursor:"pointer",padding:6,display:"flex"}} onClick={()=>setScreen("home")}><Icon name="back" size={22} color="#111"/></button>
        <span style={{color:"#111",fontWeight:700,fontSize:15}}>List a Part</span>
        <div style={{width:36}}/>
      </div>
      <div style={{padding:16,display:"flex",flexDirection:"column",gap:12}}>

        {/* AI Scanner Banner */}
        {!aiApplied?(
          <button onClick={()=>setShowAIScanner(true)} style={{display:"flex",alignItems:"center",gap:14,background:"linear-gradient(135deg,#1e1b4b,#312e81)",border:"1.5px solid rgba(124,58,237,0.5)",borderRadius:16,padding:"14px 18px",cursor:"pointer",textAlign:"left",boxShadow:"0 4px 20px rgba(99,102,241,0.25)"}}>
            <div style={{width:44,height:44,borderRadius:12,background:"rgba(124,58,237,0.25)",border:"1px solid rgba(167,139,250,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:22}}>🤖</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                <span style={{color:"#c4b5fd",fontWeight:900,fontSize:14}}>AI Part Scanner</span>
                <span style={{background:"rgba(22,163,74,0.2)",color:"#6ee7b7",fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:20,border:"1px solid rgba(22,163,74,0.3)"}}>FREE</span>
              </div>
              <p style={{color:"rgba(167,139,250,0.7)",fontSize:11,margin:0,lineHeight:1.4}}>Photo a part → AI auto-fills the form instantly</p>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.6)" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        ):(
          <div style={{display:"flex",alignItems:"center",gap:12,background:"#f0fdf4",border:"1.5px solid #bbf7d0",borderRadius:14,padding:"12px 16px"}}>
            <span style={{fontSize:20}}>🤖</span>
            <div style={{flex:1}}>
              <p style={{color:"#16a34a",fontWeight:800,fontSize:13,margin:0}}>AI filled your form!</p>
              <p style={{color:"#4ade80",fontSize:11,margin:0}}>Review each field and make any corrections</p>
            </div>
            <button onClick={()=>setShowAIScanner(true)} style={{background:"none",border:"1px solid #bbf7d0",borderRadius:8,padding:"5px 10px",color:"#16a34a",fontSize:11,fontWeight:700,cursor:"pointer"}}>Rescan</button>
          </div>
        )}

        <Section label="Vehicle Info">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <select style={C.input} value={f.make} onChange={e=>{set("make",e.target.value);set("model","");}}>
              <option value="">Make *</option>
              {CAR_MAKES.slice(1).map(m=><option key={m}>{m}</option>)}
            </select>
            <select style={{...C.input,color:f.model?"#111":"#aaa"}} value={f.model} onChange={e=>set("model",e.target.value)} disabled={!f.make}>
              <option value="">Model *</option>
              {f.make && [...(CAR_MODELS[f.make]||[]),"Other (not listed)"].map(m=><option key={m} style={{color:"#111"}}>{m}</option>)}
            </select>
          </div>
          {f.make && f.model==="Other (not listed)" && (
            <input style={{...C.input,borderColor:"#f59e0b",background:"#fffbeb"}} placeholder="Type the model name here *" value={f.customModel||""} onChange={e=>set("customModel",e.target.value)} autoFocus/>
          )}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <input style={C.input} placeholder="Year *" value={f.year} onChange={e=>set("year",e.target.value)} type="number" min="1980" max="2025"/>
            <input style={C.input} placeholder="VIN (optional)" value={f.vin} onChange={e=>set("vin",e.target.value)}/>
          </div>
          {!f.make && <p style={{color:"#f59e0b",fontSize:11,margin:"2px 0 0",display:"flex",alignItems:"center",gap:4}}>⚠️ Select a make first to see available models</p>}
        </Section>
        <Section label="Part Details">
          <input style={C.input} placeholder="Part Name *" value={f.partName} onChange={e=>set("partName",e.target.value)}/>
          <input style={C.input} placeholder="Part / OEM Number (optional)" value={f.partNumber} onChange={e=>set("partNumber",e.target.value)}/>
          <select style={C.input} value={f.category} onChange={e=>set("category",e.target.value)}>{CATEGORIES.slice(1).map(c=><option key={c}>{c}</option>)}</select>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <select style={C.input} value={f.condition} onChange={e=>set("condition",e.target.value)}>{CONDITIONS.map(c=><option key={c}>{c}</option>)}</select>
            <input style={C.input} placeholder="Price *" value={f.price} onChange={e=>set("price",e.target.value)} type="number"/>
          </div>
          <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:22}}>{getCur(currentUser.currency||"USD").flag}</span>
            <div>
              <p style={{color:"#16a34a",fontSize:13,fontWeight:700,margin:0}}>Listing in {getCur(currentUser.currency||"USD").name} ({getCur(currentUser.currency||"USD").sym})</p>
              <p style={{color:"#4ade80",fontSize:11,margin:"2px 0 0"}}>Your default currency · change in Profile settings</p>
            </div>
          </div>
          <textarea style={{...C.input,height:80,resize:"none"}} placeholder="Description *" value={f.description} onChange={e=>set("description",e.target.value)}/>
          <input style={C.input} placeholder="Your Location (City, State) *" value={f.location} onChange={e=>set("location",e.target.value)}/>
        </Section>

        {/* Compression progress */}
        {compressing&&(
          <div style={{background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",borderRadius:12,padding:"12px 16px",border:"1px solid #bbf7d0",display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:20,height:20,borderRadius:"50%",border:"3px solid #16a34a",borderTopColor:"transparent",flexShrink:0,animation:"spin .7s linear infinite"}}/>
            <div>
              <p style={{color:"#16a34a",fontWeight:700,fontSize:13,margin:0}}>Compressing photos…</p>
              <p style={{color:"#4ade80",fontSize:11,margin:0}}>Resizing to 1024px · JPEG 75% quality</p>
            </div>
          </div>
        )}

        {/* Photos Section */}
        <Section label={`Photos (${photos.length}/10)`}>
          {photos.length===0&&(
            <div style={{background:"#fafafa",border:"2px dashed #e0e0e0",borderRadius:12,padding:"28px 16px",textAlign:"center"}}>
              <div style={{fontSize:36,marginBottom:8}}>📷</div>
              <p style={{color:"#888",fontSize:13,fontWeight:600,margin:"0 0 4px"}}>No photos yet</p>
              <p style={{color:"#bbb",fontSize:12,margin:"0 0 16px"}}>Add up to 10 photos of the part</p>
              <button style={{display:"flex",alignItems:"center",gap:8,background:"#e8172c",border:"none",borderRadius:10,padding:"11px 24px",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",margin:"0 auto"}}
                onClick={()=>setShowPhotoMenu(true)}>
                📷 Add Photos
              </button>
            </div>
          )}

          {photos.length>0&&(
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {photos.map((p,i)=>(
                <div key={i} style={{position:"relative",borderRadius:10,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>
                  <img src={p} alt="" style={{width:90,height:90,objectFit:"cover",display:"block"}}/>
                  {i===0&&<span style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(232,23,44,0.85)",color:"#fff",fontSize:9,fontWeight:700,textAlign:"center",padding:"3px 0"}}>COVER</span>}
                  <button style={{position:"absolute",top:4,right:4,width:22,height:22,borderRadius:"50%",background:"rgba(0,0,0,0.6)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>removePhoto(i)}>
                    <Icon name="x" size={12} color="#fff"/>
                  </button>
                </div>
              ))}
              {photos.length<10&&(
                <button style={{width:90,height:90,borderRadius:10,border:"2px dashed #e0e0e0",background:"#fafafa",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,cursor:"pointer"}}
                  onClick={()=>setShowPhotoMenu(true)}>
                  <span style={{fontSize:22}}>+</span>
                  <span style={{color:"#bbb",fontSize:10,fontWeight:600}}>Add More</span>
                </button>
              )}
            </div>
          )}

          {photos.length>0&&(
            <button style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"#fff5f5",border:"1.5px solid #fecaca",borderRadius:10,padding:"10px",color:"#e8172c",fontWeight:700,fontSize:13,cursor:"pointer",width:"100%"}}
              onClick={()=>setShowPhotoMenu(true)}>
              📷 Add More Photos
            </button>
          )}

          <input ref={fileRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={handleFiles}/>
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={handleFiles}/>
          {photos.length>0&&(
            <div style={{display:"flex",alignItems:"center",gap:8,background:"#f0fdf4",borderRadius:8,padding:"7px 12px",border:"1px solid #dcfce7"}}>
              <span style={{fontSize:13}}>🗜️</span>
              <span style={{color:"#16a34a",fontSize:11,fontWeight:600}}>
                All photos auto-compressed · max ~120 KB each · saves up to 97% storage
              </span>
            </div>
          )}
          <p style={{color:"#bbb",fontSize:11,margin:"4px 0 0",textAlign:"center"}}>💡 First photo is your cover image · Drag to reorder</p>
        </Section>

        <button style={{...C.btnRed,opacity:submitting?0.7:1,cursor:submitting?"not-allowed":"pointer"}} onClick={submit} disabled={submitting}>
          {submitting?"Publishing…":"Publish Listing"}
        </button>
        <div style={{height:80}}/>
      </div>
    </div>
    </>

  );
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
function ChatScreen({chatKey,currentUser,chats,setChats,onBack,openRating,users}){
  const {key,listing}=chatKey;
  const [msg,setMsg]=useState("");
  const bottomRef=useRef();
  const [buyerId,sellerId]=key.split("_");
  const authorized=currentUser.id===buyerId||currentUser.id===sellerId;
  const messages=authorized?(chats[key]||[]):[];
  const seller=users.find(u=>u.id===sellerId);
  const rating=avgRating(seller?.ratings||[]);

  const send=async()=>{
    if(!msg.trim()||!authorized)return;
    const newMsg={id:genId(),senderId:currentUser.id,senderName:currentUser.name,text:msg,ts:Date.now()};
    const updated=[...(chats[key]||[]),newMsg];
    // Optimistic: show instantly
    setChats(c=>({...c,[key]:updated}));
    setMsg("");
    // Persist to Supabase (upsert so first message creates row, subsequent update it)
    try{
      const sb=await getSB();
      await sb.from("chats").upsert({chat_key:key,messages:updated,updated_at:new Date().toISOString()},{onConflict:"chat_key"});
    }catch(e){console.error("Chat save failed:",e);}
  };
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages.length]);

  if(!authorized) return(
    <div style={{height:"100vh",background:"#f5f5f5",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,padding:32}}>
      <Icon name="lock" size={52} color="#ddd"/>
      <p style={{color:"#aaa",textAlign:"center",fontSize:15,fontWeight:600,margin:0}}>Access Denied</p>
      <p style={{color:"#bbb",textAlign:"center",fontSize:13,margin:0}}>This conversation is private and can only be viewed by the buyer and seller.</p>
      <button style={{...C.btnGhost,width:"auto",padding:"10px 24px"}} onClick={onBack}>Go Back</button>
    </div>
  );

  return(
    <div style={{height:"100vh",background:"#f5f5f5",display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",paddingTop:48,background:"#fff",borderBottom:"1px solid #f0f0f0"}}>
        <button style={{background:"transparent",border:"none",cursor:"pointer",padding:6,display:"flex"}} onClick={onBack}><Icon name="back" size={22} color="#111"/></button>
        <div style={{flex:1,overflow:"hidden",margin:"0 8px"}}>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <p style={{color:"#111",fontWeight:700,margin:0,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{listing.sellerName}</p>
            <Icon name="lock" size={11} color="#16a34a"/>
          </div>
          <p style={{color:"#888",margin:0,fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{listing.partName}</p>
          {rating&&<div style={{display:"flex",alignItems:"center",gap:3,marginTop:1}}><Stars value={parseFloat(rating)} size={11}/><span style={{color:"#f59e0b",fontSize:10,fontWeight:700}}>{rating}</span></div>}
        </div>
        {currentUser.role==="buyer"&&<button style={{background:"#fff",border:"1.5px solid #fde68a",borderRadius:8,padding:"6px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:4,color:"#d97706",fontWeight:700,fontSize:12}} onClick={openRating}><Icon name="star" size={14} color="#f59e0b"/>Rate</button>}
      </div>

      <div style={{background:"#f0fdf4",borderBottom:"1px solid #dcfce7",padding:"6px 16px",display:"flex",alignItems:"center",gap:6}}>
        <Icon name="lock" size={12} color="#16a34a"/>
        <span style={{color:"#16a34a",fontSize:11,fontWeight:700}}>Private & Confidential</span>
        <span style={{color:"#86efac",fontSize:11}}>— only you and the {currentUser.role==="buyer"?"seller":"buyer"} can see this</span>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"12px 16px",display:"flex",flexDirection:"column",gap:8}}>
        {messages.length===0&&(
          <div style={{textAlign:"center",marginTop:50,display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
            <div style={{width:56,height:56,borderRadius:"50%",background:"#f0fdf4",border:"2px solid #dcfce7",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name="lock" size={22} color="#16a34a"/></div>
            <p style={{color:"#333",fontSize:13,fontWeight:600,margin:0}}>Private Chat</p>
            <p style={{color:"#aaa",fontSize:12,maxWidth:220,margin:0,lineHeight:1.6}}>Only you and the {currentUser.role==="buyer"?"seller":"buyer"} can read these messages.</p>
          </div>
        )}
        {messages.map(m=>{
          const mine=m.senderId===currentUser.id;
          return(
            <div key={m.id} style={{display:"flex",justifyContent:mine?"flex-end":"flex-start"}}>
              <div style={{maxWidth:"76%",borderRadius:16,padding:"10px 14px",background:mine?"#e8172c":"#fff",color:mine?"#fff":"#111",borderBottomRightRadius:mine?3:16,borderBottomLeftRadius:mine?16:3,border:mine?"none":"1px solid #f0f0f0",boxShadow:mine?"none":"0 1px 4px rgba(0,0,0,0.06)"}}>
                <p style={{margin:0,fontSize:14,lineHeight:1.4}}>{m.text}</p>
                <span style={{fontSize:10,opacity:0.6,marginTop:3,display:"block"}}>{timeAgo(m.ts)}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef}/>
      </div>

      <div style={{background:"#fafafa",borderTop:"1px solid #f0f0f0",padding:"5px 16px",display:"flex",alignItems:"center",gap:6}}>
        <Icon name="warning" size={11} color="#d97706"/>
        <span style={{color:"#aaa",fontSize:10,flex:1}}>Transactions are solely between buyer & seller. SPAREZ is not involved.</span>
        {currentUser.role==="buyer"&&<button onClick={openRating} style={{background:"transparent",border:"none",cursor:"pointer",color:"#f59e0b",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",gap:3,padding:0}}><Icon name="star" size={10} color="#f59e0b"/>Rate Seller</button>}
      </div>

      <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 16px",borderTop:"1px solid #f0f0f0",background:"#fff"}}>
        <input style={{flex:1,background:"#f5f5f5",border:"1.5px solid #efefef",borderRadius:24,padding:"10px 16px",color:"#111",fontSize:14,outline:"none",fontFamily:"inherit"}} placeholder="Type a message..." value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}/>
        <button style={{width:42,height:42,borderRadius:"50%",background:"#e8172c",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 12px rgba(232,23,44,0.3)"}} onClick={send}><Icon name="send" size={17} color="#fff"/></button>
      </div>
    </div>
  );
}

// ─── Rating Modal ─────────────────────────────────────────────────────────────
function RatingModal({modal,onClose,onSubmit,users}){
  const [stars,setStars]=useState(0);
  const [review,setReview]=useState("");
  const seller=users.find(u=>u.id===modal.sellerId);
  const rating=avgRating(seller?.ratings||[]);
  const labels=["","Poor 😞","Fair 😐","Good 👍","Very Good 😊","Excellent ⭐"];
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:20}}>
      <div style={{background:"#fff",borderRadius:18,padding:24,width:"100%",maxWidth:380,boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <h3 style={{color:"#111",margin:0,fontSize:16}}>Rate Seller</h3>
          <button style={{background:"transparent",border:"none",cursor:"pointer",color:"#aaa",fontSize:22,lineHeight:1,padding:0}} onClick={onClose}>×</button>
        </div>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{width:56,height:56,borderRadius:"50%",background:"linear-gradient(135deg,#e8172c,#ff6b6b)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:22,margin:"0 auto 10px"}}>{modal.sellerName[0]}</div>
          <p style={{color:"#111",fontWeight:700,margin:0,fontSize:15}}>{modal.sellerName}</p>
          {rating&&<div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:4,marginTop:4}}><Stars value={parseFloat(rating)} size={13}/><span style={{color:"#f59e0b",fontSize:12,fontWeight:700}}>{rating} avg</span></div>}
        </div>
        <p style={{color:"#888",fontSize:13,textAlign:"center",marginBottom:10}}>Tap to select your rating:</p>
        <div style={{display:"flex",justifyContent:"center",marginBottom:8}}><Stars value={stars} size={40} interactive onRate={setStars}/></div>
        {stars>0&&<p style={{textAlign:"center",color:"#f59e0b",fontSize:13,fontWeight:700,margin:"0 0 16px"}}>{labels[stars]}</p>}
        <textarea style={{...C.input,height:80,resize:"none",marginBottom:14}} placeholder="Leave a written review (optional)..." value={review} onChange={e=>setReview(e.target.value)}/>
        <div style={{display:"flex",gap:8}}>
          <button style={{...C.btnGhost,flex:1}} onClick={onClose}>Cancel</button>
          <button style={{...C.btnRed,flex:1,opacity:stars>0?1:0.4,cursor:stars>0?"pointer":"not-allowed"}} onClick={()=>stars>0&&onSubmit(modal.sellerId,stars,review)}><Icon name="star" size={15} color="#fff"/> Submit</button>
        </div>
      </div>
    </div>
  );
}

// ─── My Listings ──────────────────────────────────────────────────────────────
function MyListingsScreen({listings,openListing,setScreen,markSold,deleteListing}){
  const active=listings.filter(l=>!l.sold);
  const sold=listings.filter(l=>l.sold);
  return(
    <div style={{overflowY:"auto",height:"100vh",background:"#f5f5f5"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",paddingTop:48,background:"#fff",position:"sticky",top:0,zIndex:10,borderBottom:"1px solid #f0f0f0"}}>
        <span style={{color:"#111",fontWeight:700,fontSize:18}}>My Listings</span>
        <button style={{background:"transparent",border:"none",cursor:"pointer",padding:6,display:"flex"}} onClick={()=>setScreen("addlisting")}><Icon name="plus" size={22} color="#e8172c"/></button>
      </div>
      {listings.length===0&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14,padding:60}}>
        <Icon name="list" size={40} color="#ddd"/>
        <p style={{color:"#bbb",margin:0}}>No listings yet</p>
        <button style={{...C.btnRed,width:"auto",padding:"10px 24px"}} onClick={()=>setScreen("addlisting")}>Add Your First Part</button>
      </div>}
      {active.length>0&&<>
        <p style={{color:"#aaa",fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:0.8,padding:"12px 16px 6px",margin:0}}>Active ({active.length})</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"0 16px"}}>
          {active.map(l=>(
            <div key={l.id} style={{background:"#fff",borderRadius:14,overflow:"hidden",border:"1px solid #f0f0f0",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
              <div style={{position:"relative",height:120,background:"#f5f5f5",overflow:"hidden",cursor:"pointer"}} onClick={()=>openListing(l)}>
                <img src={l.photos[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                <span style={{position:"absolute",top:7,right:7,background:"#2563eb",color:"#fff",padding:"3px 8px",borderRadius:20,fontSize:10,fontWeight:700}}>{l.condition}</span>
              </div>
              <div style={{padding:"10px 12px"}}>
                <p style={{color:"#111",fontWeight:700,fontSize:13,margin:"0 0 2px",lineHeight:1.3,cursor:"pointer"}} onClick={()=>openListing(l)}>{l.partName}</p>
                <p style={{color:"#888",fontSize:11,margin:"0 0 4px"}}>{l.year} {l.make}</p>
                <p style={{color:"#e8172c",fontWeight:800,fontSize:14,margin:"0 0 8px"}}>{fmtPrice(l.price,l.currency||"USD")}</p>
                <div style={{display:"flex",gap:6}}>
                  <button style={{flex:1,background:"#16a34a",color:"#fff",border:"none",borderRadius:8,padding:"7px 4px",fontWeight:700,fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4}} onClick={()=>{if(window.confirm("Mark this listing as SOLD? This cannot be undone."))markSold(l.id);}}><Icon name="sold" size={12} color="#fff"/>Sold</button>
                  <button style={{width:32,height:32,borderRadius:8,border:"1.5px solid #fca5a5",background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>{if(window.confirm("Delete this listing permanently?"))deleteListing(l.id);}}><Icon name="trash" size={13} color="#e8172c"/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>}
      {sold.length>0&&<>
        <p style={{color:"#bbb",fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:0.8,padding:"16px 16px 6px",margin:0}}>Sold — Removing Soon ({sold.length})</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"0 16px"}}>
          {sold.map(l=>(
            <div key={l.id} style={{background:"#fff",borderRadius:14,overflow:"hidden",border:"1px solid #f0f0f0",opacity:0.5}}>
              <div style={{height:100,background:"#f5f5f5",overflow:"hidden"}}>
                <img src={l.photos[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover",filter:"grayscale(80%)"}}/>
              </div>
              <div style={{padding:"8px 10px"}}>
                <p style={{color:"#888",fontWeight:600,fontSize:12,margin:"0 0 2px",lineHeight:1.2}}>{l.partName}</p>
                <p style={{color:"#16a34a",fontSize:11,margin:0}}>✓ Sold {timeAgo(l.soldAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </>}
      <div style={{height:80}}/>
    </div>
  );
}

// ─── Inbox ────────────────────────────────────────────────────────────────────
function InboxScreen({chats,chatKeys,currentUser,setActiveChatKey,setScreen,listings}){
  const entries=chatKeys.map(k=>{
    const msgs=chats[k]||[];const last=msgs[msgs.length-1];
    const parts=k.split("_");const listingId=parts[2];
    const listing=listings.find(l=>l.id===listingId)||{partName:"Part",sellerName:"Seller",id:listingId,sellerId:parts[1]};
    return{key:k,last,listing};
  }).filter(e=>e.last).sort((a,b)=>b.last.ts-a.last.ts);

  return(
    <div style={{overflowY:"auto",height:"100vh",background:"#f5f5f5"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",paddingTop:48,background:"#fff",position:"sticky",top:0,zIndex:10,borderBottom:"1px solid #f0f0f0"}}>
        <span style={{color:"#111",fontWeight:700,fontSize:18}}>Messages</span>
        <div style={{display:"flex",alignItems:"center",gap:5,background:"#f0fdf4",borderRadius:20,padding:"4px 10px",border:"1px solid #dcfce7"}}>
          <Icon name="lock" size={12} color="#16a34a"/>
          <span style={{color:"#16a34a",fontSize:11,fontWeight:700}}>Private</span>
        </div>
      </div>
      {entries.length===0&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14,padding:60}}>
        <div style={{width:60,height:60,borderRadius:"50%",background:"#f5f5f5",border:"1px solid #f0f0f0",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name="chat" size={26} color="#ddd"/></div>
        <p style={{color:"#bbb",margin:0}}>No messages yet</p>
        <p style={{color:"#ddd",fontSize:12,textAlign:"center",maxWidth:220,margin:0}}>Conversations are private — only you and the other party can read them.</p>
      </div>}
      {entries.map(({key,last,listing})=>(
        <div key={key} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderBottom:"1px solid #f5f5f5",cursor:"pointer",background:"#fff"}} onClick={()=>{setActiveChatKey({key,listing});setScreen("chat");}}>
          <div style={{width:46,height:46,borderRadius:"50%",background:"linear-gradient(135deg,#e8172c,#ff6b6b)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:18,flexShrink:0}}>{listing.sellerName[0]}</div>
          <div style={{flex:1,overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <p style={{color:"#111",fontWeight:700,margin:0,fontSize:14}}>{listing.sellerName}</p>
              <Icon name="lock" size={9} color="#16a34a"/>
            </div>
            <p style={{color:"#888",fontSize:12,margin:"2px 0 0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{last?.text}</p>
            <p style={{color:"#bbb",fontSize:10,margin:"2px 0 0"}}>{listing.partName}</p>
          </div>
          <span style={{color:"#bbb",fontSize:10,flexShrink:0}}>{timeAgo(last.ts)}</span>
        </div>
      ))}
      <div style={{height:80}}/>
    </div>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────
function ProfileScreen({currentUser,users,setUsers,setCurrentUser,setScreen,viewCur,setViewCur,setActiveListing,setActiveChatKey,signOut}){
  const me=users.find(u=>u.id===currentUser.id)||currentUser;
  const rating=avgRating(me.ratings||[]);
  return(
    <div style={{overflowY:"auto",height:"100vh",background:"#f5f5f5"}}>
      <div style={{padding:"14px 16px",paddingTop:48,background:"#fff",borderBottom:"1px solid #f0f0f0"}}>
        <span style={{color:"#111",fontWeight:700,fontSize:18}}>My Profile</span>
      </div>
      <div style={{background:"#fff",margin:16,borderRadius:16,padding:20,border:"1px solid #f0f0f0",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
        <div style={{width:64,height:64,borderRadius:"50%",background:"linear-gradient(135deg,#e8172c,#ff6b6b)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:26,margin:"0 auto 14px"}}>{currentUser.name[0]}</div>
        <p style={{color:"#111",fontWeight:800,fontSize:18,margin:0,textAlign:"center"}}>{currentUser.name}</p>
        <p style={{color:"#e8172c",fontSize:13,textAlign:"center",margin:"4px 0 0",fontWeight:600}}>{currentUser.role==="seller"?"🏪 Seller":"🛒 Buyer"}</p>
        {currentUser.role==="seller"&&<div style={{textAlign:"center",marginTop:14,paddingTop:14,borderTop:"1px solid #f5f5f5"}}>
          {rating?<><div style={{display:"flex",justifyContent:"center",marginBottom:4}}><Stars value={parseFloat(rating)} size={22}/></div>
                    <span style={{color:"#f59e0b",fontWeight:800,fontSize:20}}>{rating}<span style={{color:"#aaa",fontSize:14,fontWeight:400}}>/5.0</span></span>
                    <p style={{color:"#bbb",fontSize:12,margin:"3px 0 0"}}>Based on {me.ratings?.length} review{me.ratings?.length!==1?"s":""}</p>
                  </>
                 :<p style={{color:"#bbb",fontSize:13,margin:0}}>No ratings yet</p>}
        </div>}
        <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <Icon name="mail" size={15} color="#bbb"/>
            <span style={{color:"#333",fontSize:13,flex:1}}>{currentUser.email}</span>
            {currentUser.emailVerified
              ? <span style={{color:"#16a34a",fontSize:11,fontWeight:700,background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:20,padding:"2px 8px"}}>✓ Verified</span>
              : <span style={{color:"#f59e0b",fontSize:11,fontWeight:700,background:"#fffbeb",border:"1px solid #fde68a",borderRadius:20,padding:"2px 8px"}}>⚠ Unverified</span>
            }
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <Icon name="phone" size={15} color="#bbb"/>
            <span style={{color:"#333",fontSize:13,flex:1}}>{currentUser.phone||"No phone set"}</span>
          </div>
        </div>
      </div>

      {/* Car Watchlist — buyers only */}
      {currentUser.role==="buyer"&&<CarPrefsManager currentUser={currentUser} users={users} setUsers={setUsers}/>}

      {/* Currency Preference */}
      <div style={{background:"#fff",margin:"0 16px 16px",borderRadius:12,padding:14,border:"1px solid #f0f0f0"}}>
        {currentUser.role==="seller"?(
          <>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div style={{width:34,height:34,borderRadius:8,background:"#f0fdf4",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:18}}>💱</span></div>
              <div>
                <p style={{color:"#111",fontWeight:700,margin:0,fontSize:14}}>Selling Currency</p>
                <p style={{color:"#aaa",fontSize:11,margin:"2px 0 0"}}>Used automatically for all your listings</p>
              </div>
            </div>
            <CurrencySelector value={currentUser.currency||"USD"} onChange={async(v)=>{
              setCurrentUser(cu=>({...cu,currency:v}));
              setUsers(us=>us.map(u=>u.id===currentUser.id?{...u,currency:v}:u));
              try{const sb=await getSB();await sb.from("profiles").update({currency:v}).eq("id",currentUser.id);}catch(e){console.error(e);}
            }}/>
            <p style={{color:"#aaa",fontSize:10,margin:"8px 0 0"}}>New listings will use {getCur(currentUser.currency||"USD").flag} {getCur(currentUser.currency||"USD").sym} {getCur(currentUser.currency||"USD").code}</p>
          </>
        ):(
          <>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div>
                <p style={{color:"#111",fontWeight:700,margin:0,fontSize:14}}>Display Currency</p>
                <p style={{color:"#aaa",fontSize:12,margin:"3px 0 0"}}>Prices shown in your preferred currency</p>
              </div>
              <CurrencySelector value={viewCur} onChange={setViewCur}/>
            </div>
            <div style={{background:"#f5f5f5",borderRadius:8,padding:"8px 12px"}}>
              <p style={{color:"#888",fontSize:11,margin:0}}>Active: <span style={{color:"#111",fontWeight:700}}>{getCur(viewCur).flag} {getCur(viewCur).name} ({getCur(viewCur).sym})</span></p>
              <p style={{color:"#bbb",fontSize:10,margin:"3px 0 0"}}>⚠️ Rates are indicative — confirm final price with seller.</p>
            </div>
          </>
        )}
      </div>

      {/* Reviews */}
      {currentUser.role==="seller"&&me.ratings?.length>0&&<div style={{margin:"0 16px 16px"}}>
        <p style={{color:"#aaa",fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:0.6,margin:"0 0 10px"}}>Your Reviews</p>
        {me.ratings.slice().reverse().map((r,i)=>(
          <div key={i} style={{background:"#fff",borderRadius:10,padding:"10px 14px",marginBottom:8,border:"1px solid #f0f0f0"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><Stars value={r.stars} size={14}/><span style={{color:"#bbb",fontSize:11}}>{r.buyerName} · {timeAgo(r.createdAt)}</span></div>
            {r.review&&<p style={{color:"#444",fontSize:13,margin:0,lineHeight:1.5}}>{r.review}</p>}
          </div>
        ))}
      </div>}

      {/* Privacy note */}
      <div style={{margin:"0 16px 16px",background:"#f0fdf4",borderRadius:12,padding:"12px 14px",border:"1px solid #dcfce7",display:"flex",gap:10,alignItems:"flex-start"}}>
        <Icon name="lock" size={16} color="#16a34a"/>
        <div>
          <p style={{color:"#16a34a",fontWeight:700,margin:"0 0 4px",fontSize:13}}>Chat Privacy Guarantee</p>
          <p style={{color:"#4ade80",fontSize:12,margin:0,lineHeight:1.6}}>All messages are private between the two parties only. SPAREZ cannot access chat content.</p>
        </div>
      </div>

      <div style={{padding:"0 16px"}}>
        <button style={C.btnGhost} onClick={signOut}>Sign Out</button>
      </div>
      <div style={{height:80}}/>
    </div>
  );
}

// ─── Small helpers ─────────────────────────────────────────────────────────────
function Modal({children,onClose}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:20}}>
      <div style={{background:"#fff",borderRadius:18,padding:24,width:"100%",maxWidth:400,boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
        {children}
      </div>
    </div>
  );
}
function Chip({label,onRemove}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:4,background:"#fff5f5",border:"1px solid #fecaca",borderRadius:20,padding:"3px 10px"}}>
      <span style={{color:"#e8172c",fontSize:11,fontWeight:600}}>{label}</span>
      <button style={{background:"transparent",border:"none",cursor:"pointer",padding:0,lineHeight:1,display:"flex"}} onClick={onRemove}><Icon name="x" size={11} color="#e8172c"/></button>
    </div>
  );
}
function Pill({label,active,onClick}){
  return(
    <button onClick={onClick} style={{padding:"5px 12px",borderRadius:20,border:`1.5px solid ${active?"#e8172c":"#e0e0e0"}`,background:active?"#fff5f5":"#fff",color:active?"#e8172c":"#888",fontSize:12,cursor:"pointer",fontWeight:active?700:400}}>{label}</button>
  );
}
function Section({label,children}){
  return(
    <div style={{background:"#fff",borderRadius:12,padding:14,border:"1px solid #f0f0f0",display:"flex",flexDirection:"column",gap:10}}>
      <p style={{color:"#aaa",fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:0.6,margin:0}}>{label}</p>
      {children}
    </div>
  );
}
function FLabel({children}){
  return <p style={{color:"#aaa",fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:0.6,margin:"0 0 6px"}}>{children}</p>;
}
