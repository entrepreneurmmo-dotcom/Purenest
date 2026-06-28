import { useState, useMemo } from "react";

// ─── DATA ───────────────────────────────────────────────────────────────────
const SERVICES = [
  { id: "fauteuil",     label: "Fauteuil",             category: "canapé",  price: 40,  duration: 45 },
  { id: "canape2",      label: "Canapé 2 places",       category: "canapé",  price: 60,  duration: 60 },
  { id: "canape3",      label: "Canapé 3 places",       category: "canapé",  price: 80,  duration: 75 },
  { id: "canape_angle", label: "Canapé d'angle",        category: "canapé",  price: 120, duration: 90 },
  { id: "tapis_sm",     label: "Petit tapis (< 2m²)",   category: "tapis",   price: 30,  duration: 30 },
  { id: "tapis_md",     label: "Tapis moyen (2–6m²)",   category: "tapis",   price: 50,  duration: 45 },
  { id: "tapis_lg",     label: "Grand tapis / moquette",category: "tapis",   price: 90,  duration: 60 },
  { id: "matelas_1p",   label: "Matelas 1 personne",    category: "matelas", price: 50,  duration: 45 },
  { id: "matelas_2p",   label: "Matelas 2 personnes",   category: "matelas", price: 70,  duration: 60 },
  { id: "matelas_king", label: "Matelas King Size",      category: "matelas", price: 90,  duration: 75 },
  { id: "oreiller",     label: "Oreiller",              category: "matelas", price: 15,  duration: 15 },
  { id: "traversin",    label: "Traversin",             category: "matelas", price: 20,  duration: 20 },
];

const CAT_ICONS  = { "canapé": "🛋️", tapis: "🪣", matelas: "🛏️" };
const CAT_COLORS = {
  "canapé": { bg: "#e8f4fd", accent: "#0077b6", light: "#caf0f8" },
  tapis:    { bg: "#fef3e8", accent: "#e07b1a", light: "#fde3be" },
  matelas:  { bg: "#f3f0ff", accent: "#8b5cf6", light: "#ddd6fe" },
};

const STATUS_CFG = {
  "confirmé":   { color: "#1a936f", bg: "#edf7f0", label: "Confirmé"   },
  "en attente": { color: "#e07b1a", bg: "#fef3e8", label: "En attente" },
  "terminé":    { color: "#0077b6", bg: "#e8f4fd", label: "Terminé"    },
  "annulé":     { color: "#e05252", bg: "#fdeaea", label: "Annulé"     },
};

const PAY_METHODS = [
  { id: "carte",   label: "Carte bancaire", icon: "💳", color: "#6366f1", bg: "#eef2ff", hint: "Via Stripe"          },
  { id: "paypal",  label: "PayPal",         icon: "🅿️", color: "#003087", bg: "#e8f0fb", hint: "Lien PayPal.Me"      },
  { id: "especes", label: "Espèces",        icon: "💵", color: "#1a936f", bg: "#edf7f0", hint: "Sur place"           },
  { id: "cheque",  label: "Chèque",         icon: "📝", color: "#e07b1a", bg: "#fef3e8", hint: "À l'ordre de PureNest" },
];

const PAY_STATUS = {
  "impayé": { color: "#e05252", bg: "#fdeaea", label: "Impayé"   },
  "partiel":{ color: "#e07b1a", bg: "#fef3e8", label: "Partiel"  },
  "payé":   { color: "#1a936f", bg: "#edf7f0", label: "Payé ✓"   },
};

// ─── AUTH ────────────────────────────────────────────────────────────────────
const DEFAULT_PRO_CREDENTIALS = { user: "admin", password: "PureNest1" };

// Comptes clients : identifiant → { password, name }
const INITIAL_CLIENT_ACCOUNTS = {
  "hotel.campanile": { password: "Hotel2024!", name: "Hôtel Campanile SQY" },
  "airbnb.leroy":    { password: "Airbnb2024!", name: "Résidence Les Acacias" },
};

const validatePassword = (pwd) => {
  if (pwd.length < 8) return "Au moins 8 caractères requis";
  if (!/[A-Z]/.test(pwd)) return "Au moins 1 lettre majuscule requise";
  if (!/[a-z]/.test(pwd)) return "Au moins 1 lettre minuscule requise";
  if (!/[0-9]/.test(pwd)) return "Au moins 1 chiffre requis";
  return null;
};

const today = new Date();
const fmt   = (d) => d.toISOString().split("T")[0];

const SAMPLE_RDV = [
  { id:1, client:"Marie Dupont",   phone:"06 12 34 56 78", service:"canape3",      date:fmt(today),                                   time:"09:00", status:"confirmé",   address:"12 rue des Lilas, Paris",    note:"",               paymentStatus:"payé",      paymentMethod:"carte",   paidAmount:80,  discount:0  },
  { id:2, client:"Thomas Martin",  phone:"07 45 67 89 01", service:"berline",       date:fmt(today),                                   time:"11:30", status:"en attente", address:"5 av. Victor Hugo, Paris",   note:"Taches de café", paymentStatus:"impayé",    paymentMethod:"",        paidAmount:0,   discount:0  },
  { id:3, client:"Sophie Bernard", phone:"06 98 76 54 32", service:"canape_angle",  date:fmt(new Date(today.getTime()+86400000)),       time:"14:00", status:"confirmé",   address:"8 bd Haussmann, Paris",      note:"",               paymentStatus:"impayé",    paymentMethod:"",        paidAmount:0,   discount:10 },
  { id:4, client:"Luc Moreau",     phone:"07 11 22 33 44", service:"tapis_md",      date:fmt(new Date(today.getTime()+86400000*2)),     time:"10:00", status:"confirmé",   address:"23 rue Oberkampf, Paris",    note:"Tapis persan",   paymentStatus:"partiel",   paymentMethod:"especes", paidAmount:25,  discount:0  },
  { id:5, client:"Emma Petit",     phone:"06 55 44 33 22", service:"citadine",      date:fmt(new Date(today.getTime()-86400000)),       time:"15:00", status:"terminé",    address:"1 place Vendôme, Paris",     note:"",               paymentStatus:"payé",      paymentMethod:"paypal",  paidAmount:80,  discount:0  },
];

// ─── HELPERS ────────────────────────────────────────────────────────────────
const getSvc       = (id)  => SERVICES.find(s => s.id === id);
const getFinalPrice= (r)   => Math.round((getSvc(r.service)?.price||0)*(1-(r.discount||0)/100));
const fmtDate      = (d)   => { const [,m,day]=d.split("-"); return `${parseInt(day)} ${["jan","fév","mar","avr","mai","jun","jul","aoû","sep","oct","nov","déc"][parseInt(m)-1]}`; };
const isToday      = (d)   => d === fmt(today);
const isTomorrow   = (d)   => d === fmt(new Date(today.getTime()+86400000));
const dayLabel     = (d)   => isToday(d)?"Aujourd'hui":isTomorrow(d)?"Demain":fmtDate(d);

// ════════════════════════════════════════════════════════════════════════════
//  ROOT — choix de la vue
// ════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [mode, setMode]             = useState("landing");
  const [clientName, setClientName] = useState("");
  const [rdvList, setRdvList]       = useState(SAMPLE_RDV);
  const [accounts, setAccounts]     = useState(INITIAL_CLIENT_ACCOUNTS);
  const [proCreds, setProCreds]     = useState(DEFAULT_PRO_CREDENTIALS);

  const registerClient = (id, password, name) => {
    setAccounts(prev => ({ ...prev, [id]: { password, name } }));
  };
  const changeProPassword = (newPwd) => {
    setProCreds(prev => ({ ...prev, password: newPwd }));
  };

  if (mode === "pro")
    return <ProView rdvList={rdvList} setRdvList={setRdvList} onExit={() => setMode("landing")} onChangePassword={changeProPassword} />;
  if (mode === "client")
    return <ClientView rdvList={rdvList} setRdvList={setRdvList} clientName={clientName} onExit={() => setMode("landing")} />;
  return <LandingView
    accounts={accounts}
    proCreds={proCreds}
    onProAccess={() => setMode("pro")}
    onClientAccess={(name) => { setClientName(name); setMode("client"); }}
    onRegister={registerClient}
  />;
}

// ════════════════════════════════════════════════════════════════════════════
//  CLIENT VIEW
// ════════════════════════════════════════════════════════════════════════════
function ClientView({ rdvList, setRdvList, clientName, onExit }) {
  const [tab, setTab]           = useState("formule");
  const [phone, setPhone]       = useState("");
  const [myRdv, setMyRdv]       = useState(null);

  const [bookForm, setBookForm] = useState({ name:"", phone:"", service:"canape3", date:fmt(today), time:"09:00", address:"", note:"" });
  const [booked, setBooked]     = useState(false);
  const [toast, setToast]       = useState(null);

  const showToast = (msg, color="#1a936f") => { setToast({msg,color}); setTimeout(()=>setToast(null),3000); };

  const FREQS_F = [
    { id:"ponctuel",     label:"Ponctuel",      remise:0  },
    { id:"mensuel",      label:"Mensuel",       remise:10 },
    { id:"bimensuel",    label:"2x / mois",     remise:15 },
    { id:"hebdomadaire", label:"Hebdomadaire",  remise:20 },
  ];

  const toggleItem = (id) => setSelItems(prev => {
    const n = {...prev};
    if (n[id]) delete n[id]; else n[id] = 1;
    return n;
  });
  const setQty = (id, qty) => setSelItems(prev => ({...prev, [id]: Math.max(1, qty)}));

  const PART_CATS = ["canapé","tapis","matelas"];
  const PRO_CATS  = ["matelas","canapé","tapis"];

  const calcFormuleTotal = () => {
    const fr = FREQS_F.find(f=>f.id===formuleFreq)||FREQS_F[0];
    let base = 0;
    Object.entries(selItems).forEach(([id, qty]) => {
      const svc = getSvc(id);
      if (svc) base += svc.price * qty * (formuleType==="pro" ? formuleUnits : 1);
    });
    const remise = fr.remise + (formuleType==="pro" && formuleUnits>=10 ? 5 : 0) + (formuleType==="pro" && formuleUnits>=20 ? 5 : 0);
    return { base, remise: Math.min(remise, 30), total: Math.round(base*(1-Math.min(remise,30)/100)) };
  };

  const submitFormule = () => {
    if (Object.keys(selItems).length === 0) return;
    const tot = calcFormuleTotal();
    const desc = Object.entries(selItems).map(([id,qty])=>`${getSvc(id)?.label} x${qty}`).join(", ");
    const newRdv = {
      id: Date.now(), client: clientName || bookForm.name || "Client",
      phone: bookForm.phone || "", service: Object.keys(selItems)[0],
      date: fmt(today), time: "09:00", status: "en attente",
      address: bookForm.address || "", note: `Formule ${formuleType==="pro"?"Pro":"Particulier"} — ${desc} — ${formuleFreq} — Total: ${tot.total}€`,
      paymentStatus: "impayé", paymentMethod: "", paidAmount: 0, discount: tot.remise
    };
    setRdvList(prev => [...prev, newRdv]);
    setFormuleBooked(true);
    showToast("Formule envoyée ! Nous confirmons sous 24h.");
  };

  const submitBook = () => {
    if (!bookForm.name || !bookForm.phone || !bookForm.date) return;
    const newRdv = { id: Date.now(), client: bookForm.name, phone: bookForm.phone, service: bookForm.service, date: bookForm.date, time: bookForm.time, status: "en attente", address: bookForm.address, note: bookForm.note, paymentStatus: "impayé", paymentMethod: "", paidAmount: 0, discount: 0 };
    setRdvList(prev => [...prev, newRdv]);
    setBooked(true);
    showToast("Demande envoyée ! Nous vous confirmons rapidement.");
  };

  const searchRdv = () => {
    const found = rdvList.filter(r => r.phone.replace(/\s/g,"") === phone.replace(/\s/g,""));
    setMyRdv(found.length ? found : []);
  };



  return (
    <div style={{ fontFamily:"'Segoe UI',Arial,sans-serif", background:"#f0f8ff", minHeight:"100vh", maxWidth:480, margin:"0 auto" }}>
      {toast && <Toast msg={toast.msg} color={toast.color} />}

      {/* HEADER CLIENT */}
      <div style={{ background:"linear-gradient(135deg,#0077b6,#00b4d8)", padding:"24px 20px 0", boxShadow:"0 2px 20px rgba(0,100,180,0.2)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
          <div>
            <div style={{ color:"rgba(255,255,255,0.7)", fontSize:11, letterSpacing:2, textTransform:"uppercase" }}>Nettoyage Pro</div>
            <div style={{ color:"#fff", fontSize:26, fontWeight:800, letterSpacing:-1 }}>Pure<span style={{ color:"#caf0f8" }}>Nest</span></div>
            <div style={{ color:"rgba(255,255,255,0.75)", fontSize:11, marginTop:2, fontStyle:"italic" }}>L'eau au service de votre intérieur</div>
          </div>
          <button onClick={onExit} style={{ background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.3)", color:"rgba(255,255,255,0.7)", borderRadius:20, padding:"6px 12px", fontSize:10, cursor:"pointer", letterSpacing:1 }}>🚪 Quitter</button>
        </div>
        <div style={{ display:"flex", gap:2 }}>
          {[["formule","💡 Formules"],["reserver","📅 Réserver"],["mes-rdv","🔍 Mes RDV"],["tarifs","💰 Tarifs"]].map(([k,l]) => (
            <button key={k} onClick={()=>setTab(k)} style={{ background:tab===k?"#fff":"transparent", color:tab===k?"#0077b6":"rgba(255,255,255,0.8)", border:"none", borderRadius:"10px 10px 0 0", padding:"9px 14px", fontWeight:tab===k?700:400, fontSize:12, cursor:"pointer" }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ padding:16 }}>

        {/* ── FORMULES ── */}
        {tab === "formule" && (
          <div>
            {/* Toggle Particulier / Pro */}
            {!formuleBooked && (
              <>
                <div style={{ display:"flex", background:"#fff", borderRadius:14, padding:6, marginBottom:14, boxShadow:"0 2px 10px rgba(0,0,0,0.06)", gap:6 }}>
                  {[["particulier","🏠 Particulier","Pour votre domicile"],["pro","🏨 Professionnel","Hôtel, Airbnb, Résidence"]].map(([id,label,sub])=>(
                    <button key={id} onClick={()=>{ setFormuleType(id); setSelItems({}); setFormuleFreq("ponctuel"); setFormuleUnits(1); }}
                      style={{ flex:1, background:formuleType===id?"linear-gradient(135deg,#0077b6,#00b4d8)":"transparent", color:formuleType===id?"#fff":"#888", border:"none", borderRadius:10, padding:"10px 8px", cursor:"pointer", transition:"all 0.2s" }}>
                      <div style={{ fontSize:13, fontWeight:700 }}>{label}</div>
                      <div style={{ fontSize:10, opacity:0.8, marginTop:2 }}>{sub}</div>
                    </button>
                  ))}
                </div>

                {/* Sélecteur de services */}
                {(formuleType==="particulier" ? PART_CATS : PRO_CATS).map(cat => {
                  const c = CAT_COLORS[cat];
                  const svcs = SERVICES.filter(s=>s.category===cat);
                  return (
                    <div key={cat} style={{ background:"#fff", borderRadius:14, marginBottom:12, overflow:"hidden", boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
                      <div style={{ background:c.bg, padding:"10px 14px", display:"flex", alignItems:"center", gap:8, borderBottom:`1px solid ${c.light}` }}>
                        <span style={{ fontSize:16 }}>{CAT_ICONS[cat]}</span>
                        <span style={{ fontWeight:800, color:c.accent, fontSize:13, textTransform:"capitalize" }}>{cat}</span>
                      </div>
                      {svcs.map(svc => {
                        const sel = !!selItems[svc.id];
                        const qty = selItems[svc.id] || 1;
                        return (
                          <div key={svc.id} style={{ padding:"10px 14px", borderBottom:"1px solid #f5f5f5", background:sel?c.bg:"#fff" }}>
                            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                              <div style={{ display:"flex", alignItems:"center", gap:10, flex:1 }}>
                                <button onClick={()=>toggleItem(svc.id)}
                                  style={{ width:22, height:22, borderRadius:6, border:`2px solid ${sel?c.accent:"#ccc"}`, background:sel?c.accent:"#fff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, fontSize:13, color:"#fff" }}>
                                  {sel?"✓":""}
                                </button>
                                <div>
                                  <div style={{ fontSize:12, fontWeight:sel?700:400, color:sel?c.accent:"#333" }}>{svc.label}</div>
                                  <div style={{ fontSize:10, color:"#aaa" }}>⏱ {svc.duration} min · {svc.price} €{formuleType==="pro"?" / unité":""}</div>
                                </div>
                              </div>
                              {sel && (
                                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                  <button onClick={()=>setQty(svc.id, qty-1)} style={{ width:26, height:26, borderRadius:6, border:"1.5px solid #e0e8f0", background:"#f5f8fc", cursor:"pointer", fontSize:14, fontWeight:700, color:"#555" }}>−</button>
                                  <span style={{ fontSize:13, fontWeight:700, color:c.accent, minWidth:20, textAlign:"center" }}>{qty}</span>
                                  <button onClick={()=>setQty(svc.id, qty+1)} style={{ width:26, height:26, borderRadius:6, border:"1.5px solid #e0e8f0", background:"#f5f8fc", cursor:"pointer", fontSize:14, fontWeight:700, color:"#555" }}>+</button>
                                </div>
                              )}
                              {!sel && <span style={{ fontSize:13, fontWeight:700, color:c.accent }}>{svc.price} €</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

                {/* Nb unités (pro) */}
                {formuleType==="pro" && (
                  <div style={{ background:"#fff", borderRadius:14, padding:14, marginBottom:12, boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontSize:12, fontWeight:700, color:"#023e8a", marginBottom:10 }}>🏨 Nombre d'unités (chambres / appartements)</div>
                    <div style={{ display:"flex", alignItems:"center", gap:12, justifyContent:"center" }}>
                      <button onClick={()=>setFormuleUnits(u=>Math.max(1,u-1))} style={{ width:36, height:36, borderRadius:10, border:"1.5px solid #e0e8f0", background:"#f5f8fc", cursor:"pointer", fontSize:20, fontWeight:700, color:"#0077b6" }}>−</button>
                      <input type="number" value={formuleUnits} min={1} onChange={e=>setFormuleUnits(Math.max(1,Number(e.target.value)))}
                        style={{ width:70, textAlign:"center", border:"1.5px solid #e0e8f0", borderRadius:10, padding:"8px", fontSize:18, fontWeight:800, color:"#023e8a", outline:"none" }} />
                      <button onClick={()=>setFormuleUnits(u=>u+1)} style={{ width:36, height:36, borderRadius:10, border:"1.5px solid #e0e8f0", background:"#f5f8fc", cursor:"pointer", fontSize:20, fontWeight:700, color:"#0077b6" }}>+</button>
                    </div>
                    <div style={{ textAlign:"center", marginTop:8, fontSize:11, color:"#888" }}>
                      {formuleUnits>=20?"🎉 -10% volume supplémentaire":formuleUnits>=10?"✨ -5% volume supplémentaire":"Remise à partir de 10 unités"}
                    </div>
                    <div style={{ display:"flex", gap:6, marginTop:10, flexWrap:"wrap", justifyContent:"center" }}>
                      {[5,10,20,30,50].map(n=>(
                        <button key={n} onClick={()=>setFormuleUnits(n)} style={{ background:formuleUnits===n?"#0077b6":"#f0f8ff", color:formuleUnits===n?"#fff":"#0077b6", border:"1.5px solid "+(formuleUnits===n?"#0077b6":"#cae0f0"), borderRadius:20, padding:"4px 12px", fontSize:11, fontWeight:600, cursor:"pointer" }}>{n}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fréquence */}
                <div style={{ background:"#fff", borderRadius:14, padding:14, marginBottom:12, boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"#023e8a", marginBottom:10 }}>🔁 Fréquence</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    {FREQS_F.map(f=>(
                      <button key={f.id} onClick={()=>setFormuleFreq(f.id)}
                        style={{ border:`1.5px solid ${formuleFreq===f.id?"#0077b6":"#e0e8f0"}`, background:formuleFreq===f.id?"#e8f4fd":"#fff", borderRadius:10, padding:"10px 8px", cursor:"pointer", textAlign:"center" }}>
                        <div style={{ fontSize:12, fontWeight:700, color:formuleFreq===f.id?"#0077b6":"#333" }}>{f.label}</div>
                        {f.remise>0 && <div style={{ fontSize:10, color:"#1a936f", marginTop:2 }}>−{f.remise}%</div>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Récap prix */}
                {Object.keys(selItems).length > 0 && (() => {
                  const tot = calcFormuleTotal();
                  return (
                    <div style={{ background:"linear-gradient(135deg,#023e8a,#0077b6)", borderRadius:16, padding:16, marginBottom:14 }}>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", marginBottom:10, letterSpacing:1, textTransform:"uppercase" }}>Récapitulatif</div>
                      {Object.entries(selItems).map(([id,qty])=>{
                        const svc = getSvc(id);
                        const units = formuleType==="pro" ? formuleUnits : 1;
                        return (
                          <div key={id} style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                            <span style={{ fontSize:11, color:"rgba(255,255,255,0.8)" }}>{svc?.label} ×{qty*units}</span>
                            <span style={{ fontSize:11, color:"#fff" }}>{svc.price * qty * units} €</span>
                          </div>
                        );
                      })}
                      {tot.remise > 0 && (
                        <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, paddingTop:6, borderTop:"1px solid rgba(255,255,255,0.15)" }}>
                          <span style={{ fontSize:11, color:"#90efcc" }}>Remise ({tot.remise}%)</span>
                          <span style={{ fontSize:11, color:"#90efcc" }}>−{tot.base - tot.total} €</span>
                        </div>
                      )}
                      <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, paddingTop:8, borderTop:"1px solid rgba(255,255,255,0.2)" }}>
                        <span style={{ fontSize:16, fontWeight:800, color:"#fff" }}>TOTAL</span>
                        <span style={{ fontSize:22, fontWeight:900, color:"#caf0f8" }}>{tot.total} €</span>
                      </div>
                      {formuleFreq!=="ponctuel" && <div style={{ fontSize:10, color:"rgba(255,255,255,0.5)", marginTop:4, textAlign:"right" }}>par intervention</div>}
                    </div>
                  );
                })()}

                {/* Infos contact si pas connecté */}
                {!clientName && (
                  <div style={{ background:"#fff", borderRadius:14, padding:14, marginBottom:12, boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontSize:12, fontWeight:700, color:"#023e8a", marginBottom:10 }}>📋 Vos coordonnées</div>
                    {[
                      { label:"Nom *", key:"name", type:"text", placeholder:"Prénom et nom" },
                      { label:"Téléphone *", key:"phone", type:"tel", placeholder:"06 xx xx xx xx" },
                      { label:"Adresse", key:"address", type:"text", placeholder:"Adresse d'intervention" },
                    ].map(f=>(
                      <div key={f.key} style={{ marginBottom:10 }}>
                        <label style={{ fontSize:11, color:"#888", display:"block", marginBottom:3 }}>{f.label}</label>
                        <input type={f.type} value={bookForm[f.key]} placeholder={f.placeholder}
                          onChange={e=>setBookForm(p=>({...p,[f.key]:e.target.value}))}
                          style={{ width:"100%", border:"1.5px solid #e0e8f0", borderRadius:10, padding:"9px 12px", fontSize:13, outline:"none", boxSizing:"border-box" }} />
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={submitFormule} disabled={Object.keys(selItems).length===0}
                  style={{ width:"100%", background:Object.keys(selItems).length>0?"linear-gradient(135deg,#0077b6,#00b4d8)":"#e0e8f0", color:Object.keys(selItems).length>0?"#fff":"#aaa", border:"none", borderRadius:14, padding:16, fontWeight:800, fontSize:15, cursor:Object.keys(selItems).length>0?"pointer":"default", boxShadow:Object.keys(selItems).length>0?"0 4px 20px rgba(0,119,182,0.3)":"none" }}>
                  {Object.keys(selItems).length===0 ? "Sélectionnez au moins une prestation" : `Demander un devis — ${calcFormuleTotal().total} €`}
                </button>
              </>
            )}

            {/* Confirmation */}
            {formuleBooked && (
              <div style={{ background:"#fff", borderRadius:16, padding:28, textAlign:"center", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
                <div style={{ fontSize:18, fontWeight:800, color:"#023e8a", marginBottom:8 }}>Demande envoyée !</div>
                <div style={{ fontSize:13, color:"#666", marginBottom:20 }}>Nous vous recontactons sous 24h pour confirmer et préciser votre formule.</div>
                <div style={{ background:"#f0f8ff", borderRadius:12, padding:"12px 16px", marginBottom:20, textAlign:"left" }}>
                  <div style={{ fontSize:11, color:"#888", marginBottom:8 }}>Votre formule</div>
                  {Object.entries(selItems).map(([id,qty])=>{
                    const svc=getSvc(id); const units=formuleType==="pro"?formuleUnits:1;
                    return <div key={id} style={{ fontSize:12, color:"#333", marginBottom:4 }}>✓ {svc?.label} ×{qty*units} — {svc.price*qty*units} €</div>;
                  })}
                  <div style={{ marginTop:8, paddingTop:8, borderTop:"1px solid #e0e8f0", fontSize:14, fontWeight:800, color:"#0077b6" }}>
                    Total : {calcFormuleTotal().total} €{calcFormuleTotal().remise>0?` (−${calcFormuleTotal().remise}% appliqué)`:""}
                  </div>
                </div>
                <button onClick={()=>{ setFormuleBooked(false); setSelItems({}); setFormuleFreq("ponctuel"); setFormuleUnits(1); }}
                  style={{ background:"#f0f8ff", color:"#0077b6", border:"none", borderRadius:12, padding:"10px 20px", fontWeight:600, fontSize:13, cursor:"pointer" }}>
                  Nouvelle demande
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── RÉSERVER ── */}
        {tab === "reserver" && !booked && (
          <div>
            <div style={{ background:"#fff", borderRadius:16, padding:20, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", marginBottom:14 }}>
              <div style={{ fontSize:15, fontWeight:800, color:"#023e8a", marginBottom:4 }}>Prendre un rendez-vous</div>
              <div style={{ fontSize:12, color:"#888", marginBottom:18 }}>Remplissez le formulaire, nous confirmons sous 24h.</div>

              {[
                { label:"Votre nom *",    key:"name",    type:"text", placeholder:"Prénom et nom" },
                { label:"Téléphone *",    key:"phone",   type:"tel",  placeholder:"06 xx xx xx xx" },
                { label:"Adresse",        key:"address", type:"text", placeholder:"Adresse d'intervention" },
              ].map(f => (
                <div key={f.key} style={{ marginBottom:12 }}>
                  <label style={{ fontSize:11, color:"#888", display:"block", marginBottom:4 }}>{f.label}</label>
                  <input type={f.type} value={bookForm[f.key]} placeholder={f.placeholder}
                    onChange={e => setBookForm(p=>({...p,[f.key]:e.target.value}))}
                    style={{ width:"100%", border:"1.5px solid #e0e8f0", borderRadius:10, padding:"10px 12px", fontSize:13, outline:"none", boxSizing:"border-box" }} />
                </div>
              ))}

              <div style={{ marginBottom:12 }}>
                <label style={{ fontSize:11, color:"#888", display:"block", marginBottom:4 }}>Prestation *</label>
                <select value={bookForm.service} onChange={e=>setBookForm(p=>({...p,service:e.target.value}))}
                  style={{ width:"100%", border:"1.5px solid #e0e8f0", borderRadius:10, padding:"10px 12px", fontSize:13, outline:"none" }}>
                  {["canapé","tapis","matelas"].map(cat => (
                    <optgroup key={cat} label={`${CAT_ICONS[cat]} ${cat.charAt(0).toUpperCase()+cat.slice(1)}`}>
                      {SERVICES.filter(s=>s.category===cat).map(s => (
                        <option key={s.id} value={s.id}>{s.label} — {s.price} €</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {bookForm.service && (
                <div style={{ background:"#f0f8ff", borderRadius:10, padding:"8px 14px", marginBottom:12, display:"flex", justifyContent:"space-between", fontSize:12, color:"#0077b6" }}>
                  <span>💰 <strong>{getSvc(bookForm.service)?.price} €</strong></span>
                  <span>⏱ <strong>{getSvc(bookForm.service)?.duration} min</strong></span>
                </div>
              )}

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
                <div>
                  <label style={{ fontSize:11, color:"#888", display:"block", marginBottom:4 }}>Date souhaitée *</label>
                  <input type="date" value={bookForm.date} min={fmt(today)} onChange={e=>setBookForm(p=>({...p,date:e.target.value}))}
                    style={{ width:"100%", border:"1.5px solid #e0e8f0", borderRadius:10, padding:"10px 12px", fontSize:13, outline:"none", boxSizing:"border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize:11, color:"#888", display:"block", marginBottom:4 }}>Heure</label>
                  <input type="time" value={bookForm.time} onChange={e=>setBookForm(p=>({...p,time:e.target.value}))}
                    style={{ width:"100%", border:"1.5px solid #e0e8f0", borderRadius:10, padding:"10px 12px", fontSize:13, outline:"none", boxSizing:"border-box" }} />
                </div>
              </div>

              <div style={{ marginBottom:18 }}>
                <label style={{ fontSize:11, color:"#888", display:"block", marginBottom:4 }}>Message (optionnel)</label>
                <textarea value={bookForm.note} onChange={e=>setBookForm(p=>({...p,note:e.target.value}))} placeholder="Type de taches, matière du tissu..."
                  style={{ width:"100%", border:"1.5px solid #e0e8f0", borderRadius:10, padding:"10px 12px", fontSize:13, outline:"none", resize:"vertical", minHeight:60, boxSizing:"border-box", fontFamily:"inherit" }} />
              </div>

              <button onClick={submitBook} style={{ width:"100%", background:"linear-gradient(135deg,#0077b6,#00b4d8)", color:"#fff", border:"none", borderRadius:12, padding:14, fontWeight:700, fontSize:15, cursor:"pointer", boxShadow:"0 4px 16px rgba(0,119,182,0.3)" }}>
                Envoyer ma demande →
              </button>
            </div>
          </div>
        )}

        {tab === "reserver" && booked && (
          <div style={{ background:"#fff", borderRadius:16, padding:28, textAlign:"center", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
            <div style={{ fontSize:18, fontWeight:800, color:"#023e8a", marginBottom:8 }}>Demande envoyée !</div>
            <div style={{ fontSize:13, color:"#666", marginBottom:20 }}>Nous vous confirmons le rendez-vous sous 24h par téléphone.</div>
            <div style={{ background:"#f0f8ff", borderRadius:12, padding:"12px 16px", marginBottom:20, textAlign:"left" }}>
              <div style={{ fontSize:11, color:"#888", marginBottom:6 }}>Récapitulatif</div>
              <div style={{ fontSize:13, color:"#333" }}>👤 {bookForm.name}</div>
              <div style={{ fontSize:13, color:"#333", marginTop:4 }}>🛠️ {getSvc(bookForm.service)?.label}</div>
              <div style={{ fontSize:13, color:"#333", marginTop:4 }}>📅 {dayLabel(bookForm.date)} à {bookForm.time}</div>
              <div style={{ fontSize:13, color:"#0077b6", marginTop:4, fontWeight:700 }}>💰 {getSvc(bookForm.service)?.price} €</div>
            </div>
            <button onClick={()=>{ setBooked(false); setBookForm({name:"",phone:"",service:"canape3",date:fmt(today),time:"09:00",address:"",note:""}); }}
              style={{ background:"#f0f8ff", color:"#0077b6", border:"none", borderRadius:12, padding:"10px 20px", fontWeight:600, fontSize:13, cursor:"pointer" }}>
              Nouvelle réservation
            </button>
          </div>
        )}

        {/* ── MES RDV ── */}
        {tab === "mes-rdv" && (
          <div>
            <div style={{ background:"#fff", borderRadius:14, padding:16, marginBottom:14, boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#023e8a", marginBottom:10 }}>🔍 Retrouver mes réservations</div>
              <div style={{ display:"flex", gap:8 }}>
                <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Votre numéro de téléphone"
                  style={{ flex:1, border:"1.5px solid #e0e8f0", borderRadius:10, padding:"10px 12px", fontSize:13, outline:"none" }} />
                <button onClick={searchRdv} style={{ background:"#0077b6", color:"#fff", border:"none", borderRadius:10, padding:"10px 16px", fontWeight:700, fontSize:13, cursor:"pointer" }}>OK</button>
              </div>
            </div>

            {myRdv === null && (
              <div style={{ textAlign:"center", color:"#bbb", fontSize:13, padding:30 }}>Entrez votre numéro pour voir vos RDV</div>
            )}
            {myRdv !== null && myRdv.length === 0 && (
              <div style={{ background:"#fff", borderRadius:14, padding:24, textAlign:"center", color:"#aaa" }}>
                <div style={{ fontSize:32, marginBottom:8 }}>📭</div>
                Aucun RDV trouvé pour ce numéro
              </div>
            )}
            {myRdv !== null && myRdv.length > 0 && myRdv.map(r => {
              const svc = getSvc(r.service);
              const cat = svc?.category || "canapé";
              const c   = CAT_COLORS[cat];
              const st  = STATUS_CFG[r.status];
              const ps  = PAY_STATUS[r.paymentStatus];
              const finalPrice = getFinalPrice(r);
              return (
                <div key={r.id} style={{ background:"#fff", borderRadius:14, marginBottom:12, overflow:"hidden", boxShadow:"0 2px 10px rgba(0,0,0,0.06)", borderLeft:`3px solid ${c.accent}` }}>
                  <div style={{ padding:"14px 16px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div>
                        <div style={{ fontSize:14, fontWeight:700, color:"#1a1a2e", marginBottom:4 }}>{svc?.label}</div>
                        <div style={{ fontSize:12, color:"#888" }}>📅 {dayLabel(r.date)} à {r.time}</div>
                        {r.address && <div style={{ fontSize:12, color:"#888", marginTop:2 }}>📍 {r.address}</div>}
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontWeight:800, fontSize:16, color:c.accent }}>{finalPrice} €</div>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:8, marginTop:10 }}>
                      <span style={{ background:st.bg, color:st.color, fontSize:11, fontWeight:600, padding:"4px 10px", borderRadius:20 }}>{st.label}</span>
                      <span style={{ background:ps.bg, color:ps.color, fontSize:11, fontWeight:600, padding:"4px 10px", borderRadius:20 }}>{ps.label}</span>
                    </div>
                    {r.paymentStatus === "partiel" && (
                      <div style={{ marginTop:10, background:"#fef3e8", borderRadius:10, padding:"8px 12px", fontSize:12 }}>
                        <span style={{ color:"#e07b1a" }}>Acompte versé : <strong>{r.paidAmount} €</strong></span>
                        <span style={{ color:"#888", marginLeft:10 }}>Reste : <strong>{finalPrice - r.paidAmount} €</strong></span>
                      </div>
                    )}
                    {r.paymentStatus === "payé" && (
                      <div style={{ marginTop:10, background:"#edf7f0", borderRadius:10, padding:"8px 12px", fontSize:12, color:"#1a936f" }}>
                        ✓ Paiement reçu — Merci !
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── TARIFS ── */}
        {tab === "tarifs" && (
          <div>
            {["canapé","tapis","matelas"].map(cat => {
              const c = CAT_COLORS[cat];
              return (
                <div key={cat} style={{ background:"#fff", borderRadius:16, marginBottom:14, overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
                  <div style={{ background:c.bg, borderBottom:`1px solid ${c.light}`, padding:"12px 16px", display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:18 }}>{CAT_ICONS[cat]}</span>
                    <span style={{ fontWeight:800, color:c.accent, fontSize:14, textTransform:"capitalize" }}>{cat}</span>
                  </div>
                  {SERVICES.filter(s=>s.category===cat).map((s,i,arr) => (
                    <div key={s.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 16px", borderBottom:i<arr.length-1?"1px solid #f0f4f8":"none" }}>
                      <div>
                        <div style={{ fontSize:13, color:"#333", fontWeight:500 }}>{s.label}</div>
                        <div style={{ fontSize:11, color:"#aaa", marginTop:1 }}>⏱ {s.duration} min</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontWeight:800, fontSize:16, color:c.accent }}>{s.price} €</div>
                        <div style={{ fontSize:10, color:"#bbb" }}>à partir de</div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
            <div style={{ background:"linear-gradient(135deg,#e8f4fd,#caf0f8)", border:"1.5px solid #90d5f0", borderRadius:14, padding:16, textAlign:"center" }}>
              <div style={{ fontSize:11, color:"#0077b6", letterSpacing:1.5, textTransform:"uppercase", marginBottom:4 }}>💧 Offre combinée</div>
              <div style={{ fontWeight:800, fontSize:16, color:"#023e8a" }}>Canapé + Tapis = <span style={{ color:"#0096c7" }}>−10%</span></div>
            </div>
            <div style={{ marginTop:14, background:"#fff", borderRadius:14, padding:"14px 16px", boxShadow:"0 2px 10px rgba(0,0,0,0.05)", textAlign:"center" }}>
              <div style={{ fontSize:12, color:"#888", marginBottom:10 }}>Prêt à réserver ?</div>
              <button onClick={()=>setTab("reserver")} style={{ background:"linear-gradient(135deg,#0077b6,#00b4d8)", color:"#fff", border:"none", borderRadius:12, padding:"12px 28px", fontWeight:700, fontSize:14, cursor:"pointer" }}>
                Prendre un RDV →
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  PRO VIEW
// ════════════════════════════════════════════════════════════════════════════
function ProView({ rdvList, setRdvList, onExit, onChangePassword }) {
  const [tab, setTab]             = useState("dashboard");
  const [showModal, setShowModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(null);
  const [editRdv, setEditRdv]     = useState(null);
  const [filterDate, setFilterDate]   = useState("");
  const [filterStatus, setFilterStatus] = useState("tous");
  const [filterPay, setFilterPay] = useState("tous");
  const [form, setForm]           = useState({ client:"", phone:"", service:"canape3", date:fmt(today), time:"09:00", status:"confirmé", address:"", note:"", paymentStatus:"impayé", paymentMethod:"", paidAmount:0, discount:0 });
  const [payForm, setPayForm]     = useState({ method:"", amount:0, discount:0 });
  const [stripeLink, setStripeLink]   = useState("");
  const [paypalLink, setPaypalLink]   = useState("paypal.me/PureNest");
  const [toast, setToast]         = useState(null);

  const showToast = (msg, color="#1a936f") => { setToast({msg,color}); setTimeout(()=>setToast(null),3000); };

  // Formule state (pro defaults to pro mode)
  const [formuleType, setFormuleType] = useState("pro");
  const [selItems, setSelItems]       = useState({});   // { serviceId: qty }
  const [formuleFreq, setFormuleFreq] = useState("ponctuel");
  const [formuleUnits, setFormuleUnits] = useState(1); // nb chambres / unités (pro)
  const [formuleBooked, setFormuleBooked] = useState(false);

  const FREQS_F = [
    { id:"ponctuel",     label:"Ponctuel",      remise:0  },
    { id:"mensuel",      label:"Mensuel",       remise:10 },
    { id:"bimensuel",    label:"2x / mois",     remise:15 },
    { id:"hebdomadaire", label:"Hebdomadaire",  remise:20 },
  ];

  const toggleItem = (id) => setSelItems(prev => {
    const n = {...prev};
    if (n[id]) delete n[id]; else n[id] = 1;
    return n;
  });
  const setQty = (id, qty) => setSelItems(prev => ({...prev, [id]: Math.max(1, qty)}));

  const PART_CATS = ["canapé","tapis","matelas"];
  const PRO_CATS  = ["matelas","canapé","tapis"];

  const calcFormuleTotal = () => {
    const fr = FREQS_F.find(f=>f.id===formuleFreq)||FREQS_F[0];
    let base = 0;
    Object.entries(selItems).forEach(([id, qty]) => {
      const svc = getSvc(id);
      if (svc) base += svc.price * qty * (formuleType==="pro" ? formuleUnits : 1);
    });
    const remise = fr.remise + (formuleType==="pro" && formuleUnits>=10 ? 5 : 0) + (formuleType==="pro" && formuleUnits>=20 ? 5 : 0);
    return { base, remise: Math.min(remise, 30), total: Math.round(base*(1-Math.min(remise,30)/100)) };
  };

  const submitFormule = () => {
    if (Object.keys(selItems).length === 0) return;
    const tot = calcFormuleTotal();
    const desc = Object.entries(selItems).map(([id,qty])=>`${getSvc(id)?.label} x${qty}`).join(", ");
    const newRdv = {
      id: Date.now(), client: bookForm.name || "Client Pro",
      phone: bookForm.phone || "", service: Object.keys(selItems)[0],
      date: fmt(today), time: "09:00", status: "en attente",
      address: bookForm.address || "", note: `Formule ${formuleType==="pro"?"Pro":"Particulier"} — ${desc} — ${formuleFreq} — Total: ${tot.total}€`,
      paymentStatus: "impayé", paymentMethod: "", paidAmount: 0, discount: tot.remise
    };
    setRdvList(prev => [...prev, newRdv]);
    setFormuleBooked(true);
    showToast("Formule envoyée ! Nous confirmons sous 24h.");
  };

  const stats = useMemo(() => {
    const monthKey   = fmt(today).slice(0,7);
    const monthRev   = rdvList.filter(r=>r.date.startsWith(monthKey)&&r.paymentStatus==="payé").reduce((s,r)=>s+getFinalPrice(r),0);
    const totalRev   = rdvList.filter(r=>r.paymentStatus==="payé").reduce((s,r)=>s+getFinalPrice(r),0);
    const unpaid     = rdvList.filter(r=>r.paymentStatus==="impayé"&&r.status!=="annulé").reduce((s,r)=>s+getFinalPrice(r),0);
    const todayCount = rdvList.filter(r=>r.date===fmt(today)&&r.status!=="annulé").length;
    const confirmed  = rdvList.filter(r=>r.status==="confirmé").length;
    const byMethod   = PAY_METHODS.reduce((acc,m)=>{ acc[m.id]=rdvList.filter(r=>r.paymentMethod===m.id&&r.paymentStatus==="payé").reduce((s,r)=>s+getFinalPrice(r),0); return acc; },{});
    return { monthRev, totalRev, unpaid, todayCount, confirmed, byMethod };
  }, [rdvList]);

  const filtered = useMemo(() => rdvList.filter(r => {
    const mD = filterDate ? r.date===filterDate : true;
    const mS = filterStatus==="tous" ? true : r.status===filterStatus;
    const mP = filterPay==="tous" ? true : r.paymentStatus===filterPay;
    return mD && mS && mP;
  }).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)), [rdvList,filterDate,filterStatus,filterPay]);

  const openNew  = () => { setEditRdv(null); setForm({client:"",phone:"",service:"canape3",date:fmt(today),time:"09:00",status:"confirmé",address:"",note:"",paymentStatus:"impayé",paymentMethod:"",paidAmount:0,discount:0}); setShowModal(true); };
  const openEdit = (r) => { setEditRdv(r.id); setForm({...r}); setShowModal(true); };
  const openPay  = (r) => { setShowPayModal(r); setPayForm({method:r.paymentMethod||"carte",amount:getFinalPrice(r)-(r.paidAmount||0),discount:r.discount||0}); };

  const saveRdv  = () => {
    if (!form.client||!form.date) return;
    if (editRdv) setRdvList(prev=>prev.map(r=>r.id===editRdv?{...r,...form}:r));
    else setRdvList(prev=>[...prev,{id:Date.now(),...form}]);
    setShowModal(false);
  };

  const savePay = () => {
    const r = showPayModal;
    const base       = getSvc(r.service)?.price||0;
    const finalPrice = Math.round(base*(1-payForm.discount/100));
    const newPaid    = (r.paidAmount||0)+Number(payForm.amount);
    const newStatus  = newPaid>=finalPrice?"payé":newPaid>0?"partiel":"impayé";
    setRdvList(prev=>prev.map(x=>x.id===r.id?{...x,paymentMethod:payForm.method,paidAmount:Math.min(newPaid,finalPrice),paymentStatus:newStatus,discount:payForm.discount}:x));
    if (newStatus==="payé") showToast(`✓ Paiement de ${finalPrice} € enregistré !`);
    else showToast(`Acompte de ${payForm.amount} € enregistré`,"#e07b1a");
    setShowPayModal(null);
  };

  const deleteRdv = (id) => setRdvList(prev=>prev.filter(r=>r.id!==id));
  const markDone  = (id) => setRdvList(prev=>prev.map(r=>r.id===id?{...r,status:"terminé"}:r));

  return (
    <div style={{ fontFamily:"'Segoe UI',Arial,sans-serif", background:"#f5f8fc", minHeight:"100vh", maxWidth:480, margin:"0 auto" }}>
      {toast && <Toast msg={toast.msg} color={toast.color} />}

      {/* HEADER PRO */}
      <div style={{ background:"linear-gradient(135deg,#1a1a2e,#16213e)", padding:"20px 20px 0", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 20px rgba(0,0,0,0.3)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <div>
            <div style={{ color:"rgba(255,255,255,0.4)", fontSize:10, letterSpacing:2, textTransform:"uppercase" }}>Vue Professionnelle</div>
            <div style={{ color:"#fff", fontSize:22, fontWeight:800, letterSpacing:-0.5 }}>Pure<span style={{ color:"#00b4d8" }}>Nest</span> <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)", fontWeight:400 }}>PRO</span></div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={openNew} style={{ background:"#00b4d8", color:"#fff", border:"none", borderRadius:12, padding:"9px 14px", fontWeight:700, fontSize:12, cursor:"pointer" }}>+ RDV</button>
            <button onClick={onExit} style={{ background:"rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.7)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:12, padding:"9px 12px", fontSize:12, cursor:"pointer" }}>🚪</button>
          </div>
        </div>
        <div style={{ display:"flex", gap:2, overflowX:"auto", paddingBottom:2 }}>
          {[["dashboard","📊"],["rdv","📅 RDV"],["devis","📄 Devis"],["paiements","💳"],["tarifs","💰"],["params","⚙️"]].map(([k,l]) => (
            <button key={k} onClick={()=>setTab(k)} style={{ background:tab===k?"rgba(255,255,255,0.12)":"transparent", color:tab===k?"#fff":"rgba(255,255,255,0.5)", border:tab===k?"1px solid rgba(255,255,255,0.15)":"1px solid transparent", borderRadius:10, padding:"7px 10px", fontWeight:tab===k?700:400, fontSize:11, cursor:"pointer", whiteSpace:"nowrap" }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ padding:16 }}>

        {/* ── DASHBOARD ── */}
        {tab==="dashboard" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
              {[
                { label:"CA ce mois",    value:`${stats.monthRev} €`, icon:"💶", color:"#1a936f", bg:"#edf7f0" },
                { label:"RDV aujourd'hui",value:stats.todayCount,     icon:"📅", color:"#0077b6", bg:"#e8f4fd" },
                { label:"À encaisser",   value:`${stats.unpaid} €`,   icon:"⏳", color:"#e05252", bg:"#fdeaea" },
                { label:"CA total",      value:`${stats.totalRev} €`, icon:"🏆", color:"#e07b1a", bg:"#fef3e8" },
              ].map((s,i) => (
                <div key={i} style={{ background:"#fff", borderRadius:16, padding:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontSize:22 }}>{s.icon}</div>
                  <div style={{ fontSize:24, fontWeight:800, color:s.color, marginTop:6 }}>{s.value}</div>
                  <div style={{ fontSize:11, color:"#888", marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Nouvelles demandes clients */}
            {rdvList.filter(r=>r.status==="en attente").length>0 && (
              <div style={{ background:"#fef3e8", border:"1.5px solid #fde3be", borderRadius:14, padding:"12px 16px", marginBottom:14 }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#e07b1a", marginBottom:8 }}>🔔 Nouvelles demandes à confirmer</div>
                {rdvList.filter(r=>r.status==="en attente").map(r => (
                  <div key={r.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color:"#333" }}>{r.client}</div>
                      <div style={{ fontSize:11, color:"#888" }}>{getSvc(r.service)?.label} · {dayLabel(r.date)} {r.time}</div>
                    </div>
                    <button onClick={()=>setRdvList(prev=>prev.map(x=>x.id===r.id?{...x,status:"confirmé"}:x))}
                      style={{ background:"#e07b1a", color:"#fff", border:"none", borderRadius:8, padding:"5px 12px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                      Confirmer
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Impayés */}
            {rdvList.filter(r=>r.paymentStatus==="impayé"&&r.status==="terminé").length>0 && (
              <div style={{ background:"#fdeaea", border:"1.5px solid #f5c0c0", borderRadius:14, padding:"12px 16px", marginBottom:14 }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#e05252", marginBottom:8 }}>⚠️ Paiements en attente</div>
                {rdvList.filter(r=>r.paymentStatus==="impayé"&&r.status==="terminé").map(r => (
                  <div key={r.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                    <span style={{ fontSize:12, color:"#333" }}>{r.client}</span>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <span style={{ fontSize:12, fontWeight:700, color:"#e05252" }}>{getFinalPrice(r)} €</span>
                      <button onClick={()=>openPay(r)} style={{ background:"#e05252", color:"#fff", border:"none", borderRadius:8, padding:"4px 10px", fontSize:11, fontWeight:600, cursor:"pointer" }}>Encaisser</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#023e8a", marginBottom:10 }}>📆 Aujourd'hui</div>
              {rdvList.filter(r=>isToday(r.date)&&r.status!=="annulé").length===0
                ? <div style={{ background:"#fff", borderRadius:14, padding:20, textAlign:"center", color:"#aaa", fontSize:13 }}>Aucun RDV aujourd'hui 🎉</div>
                : rdvList.filter(r=>isToday(r.date)&&r.status!=="annulé").sort((a,b)=>a.time.localeCompare(b.time)).map(r =>
                  <ProRdvCard key={r.id} r={r} onEdit={openEdit} onDone={markDone} onDelete={deleteRdv} onPay={openPay} />
                )}
            </div>

            <div>
              <div style={{ fontSize:13, fontWeight:700, color:"#023e8a", marginBottom:10 }}>📌 À venir</div>
              {rdvList.filter(r=>r.date>fmt(today)&&r.status!=="annulé").sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(0,3).map(r =>
                <ProRdvCard key={r.id} r={r} onEdit={openEdit} onDone={markDone} onDelete={deleteRdv} onPay={openPay} />
              )}
            </div>
          </div>
        )}

        {/* ── RDV PRO ── */}
        {tab==="rdv" && (
          <div>
            <div style={{ background:"#fff", borderRadius:14, padding:14, marginBottom:14, boxShadow:"0 2px 10px rgba(0,0,0,0.05)", display:"flex", gap:8, flexWrap:"wrap" }}>
              <input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)} style={{ border:"1px solid #e0e8f0", borderRadius:8, padding:"6px 10px", fontSize:12, flex:1, minWidth:120 }} />
              <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{ border:"1px solid #e0e8f0", borderRadius:8, padding:"6px 10px", fontSize:12, flex:1 }}>
                <option value="tous">Tous statuts</option>
                {Object.entries(STATUS_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
              </select>
              <select value={filterPay} onChange={e=>setFilterPay(e.target.value)} style={{ border:"1px solid #e0e8f0", borderRadius:8, padding:"6px 10px", fontSize:12, flex:1 }}>
                <option value="tous">Tous paiements</option>
                {Object.entries(PAY_STATUS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div style={{ fontSize:11, color:"#999", marginBottom:10 }}>{filtered.length} rendez-vous</div>
            {filtered.map(r => <ProRdvCard key={r.id} r={r} onEdit={openEdit} onDone={markDone} onDelete={deleteRdv} onPay={openPay} />)}
          </div>
        )}

        {/* ── PAIEMENTS ── */}
        {tab==="paiements" && (
          <div>
            <div style={{ background:"#fff", borderRadius:16, padding:16, marginBottom:14, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#023e8a", marginBottom:12 }}>Répartition par moyen</div>
              {PAY_METHODS.map(m => {
                const total  = stats.byMethod[m.id]||0;
                const maxVal = Math.max(...Object.values(stats.byMethod),1);
                return (
                  <div key={m.id} style={{ marginBottom:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ fontSize:12, color:"#555" }}>{m.icon} {m.label}</span>
                      <span style={{ fontSize:12, fontWeight:700, color:m.color }}>{total} €</span>
                    </div>
                    <div style={{ background:"#f0f4f8", borderRadius:20, height:8, overflow:"hidden" }}>
                      <div style={{ width:`${(total/maxVal)*100}%`, background:m.color, height:"100%", borderRadius:20 }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ background:"#fff", borderRadius:16, padding:16, marginBottom:14, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#023e8a", marginBottom:12 }}>🔗 Liens de paiement</div>
              <div style={{ marginBottom:10 }}>
                <label style={{ fontSize:11, color:"#888", display:"block", marginBottom:4 }}>Lien Stripe</label>
                <input value={stripeLink} onChange={e=>setStripeLink(e.target.value)} placeholder="https://buy.stripe.com/votre-lien" style={{ width:"100%", border:"1.5px solid #e0e8f0", borderRadius:10, padding:"9px 12px", fontSize:12, boxSizing:"border-box", outline:"none" }} />
              </div>
              <div>
                <label style={{ fontSize:11, color:"#888", display:"block", marginBottom:4 }}>Lien PayPal.Me</label>
                <input value={paypalLink} onChange={e=>setPaypalLink(e.target.value)} placeholder="paypal.me/VotrePseudo" style={{ width:"100%", border:"1.5px solid #e0e8f0", borderRadius:10, padding:"9px 12px", fontSize:12, boxSizing:"border-box", outline:"none" }} />
              </div>
            </div>

            <div style={{ background:"#fff", borderRadius:16, overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ padding:"14px 16px", borderBottom:"1px solid #f0f4f8", fontSize:12, fontWeight:700, color:"#023e8a" }}>Historique</div>
              {rdvList.filter(r=>r.paymentStatus!=="impayé"||r.status==="terminé").sort((a,b)=>b.date.localeCompare(a.date)).map((r,i,arr) => {
                const ps = PAY_STATUS[r.paymentStatus];
                const pm = PAY_METHODS.find(m=>m.id===r.paymentMethod);
                return (
                  <div key={r.id} style={{ padding:"12px 16px", borderBottom:i<arr.length-1?"1px solid #f5f5f5":"none", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:"#1a1a2e" }}>{r.client}</div>
                      <div style={{ fontSize:11, color:"#aaa", marginTop:2 }}>{fmtDate(r.date)} · {getSvc(r.service)?.label} {pm?`· ${pm.icon}`:""}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:14, fontWeight:800, color:ps.color }}>{getFinalPrice(r)} €</div>
                      <div style={{ fontSize:10, background:ps.bg, color:ps.color, padding:"2px 8px", borderRadius:20, marginTop:2 }}>{ps.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── DEVIS & CONTRATS ── */}
        {tab==="devis" && <DevisContrats showToast={showToast} />}

        {/* ── TARIFS PRO ── */}
        {tab==="tarifs" && (
          <div>
            {["canapé","tapis","matelas"].map(cat => {
              const c = CAT_COLORS[cat];
              return (
                <div key={cat} style={{ background:"#fff", borderRadius:16, marginBottom:14, overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
                  <div style={{ background:c.bg, borderBottom:`1px solid ${c.light}`, padding:"12px 16px", display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:18 }}>{CAT_ICONS[cat]}</span>
                    <span style={{ fontWeight:800, color:c.accent, fontSize:14, textTransform:"capitalize" }}>{cat}</span>
                  </div>
                  {SERVICES.filter(s=>s.category===cat).map((s,i,arr) => (
                    <div key={s.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 16px", borderBottom:i<arr.length-1?"1px solid #f0f4f8":"none" }}>
                      <div>
                        <div style={{ fontSize:13, color:"#333", fontWeight:500 }}>{s.label}</div>
                        <div style={{ fontSize:11, color:"#aaa", marginTop:1 }}>⏱ {s.duration} min</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontWeight:800, fontSize:16, color:c.accent }}>{s.price} €</div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
        {/* ── PARAMÈTRES ── */}
        {tab==="params" && <ProSettings onChangePassword={onChangePassword} showToast={showToast} onExit={onExit} />}

      </div>

      {/* MODAL RDV PRO */}
      {showModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,20,60,0.5)", zIndex:1000, display:"flex", alignItems:"flex-end" }} onClick={()=>setShowModal(false)}>
          <div style={{ background:"#fff", borderRadius:"20px 20px 0 0", padding:20, width:"100%", maxWidth:480, margin:"0 auto", maxHeight:"90vh", overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <div style={{ fontWeight:800, fontSize:17, color:"#023e8a" }}>{editRdv?"Modifier le RDV":"Nouveau RDV"}</div>
              <button onClick={()=>setShowModal(false)} style={{ background:"#f0f4f8", border:"none", borderRadius:20, width:30, height:30, cursor:"pointer", fontSize:16 }}>×</button>
            </div>
            {[{label:"Client *",key:"client",type:"text",placeholder:"Nom du client"},{label:"Téléphone",key:"phone",type:"tel",placeholder:"06 xx xx xx xx"},{label:"Adresse",key:"address",type:"text",placeholder:"Adresse d'intervention"}].map(f => (
              <div key={f.key} style={{ marginBottom:12 }}>
                <label style={{ fontSize:11, color:"#888", display:"block", marginBottom:4 }}>{f.label}</label>
                <input type={f.type} value={form[f.key]} placeholder={f.placeholder} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} style={{ width:"100%", border:"1.5px solid #e0e8f0", borderRadius:10, padding:"10px 12px", fontSize:13, outline:"none", boxSizing:"border-box" }} />
              </div>
            ))}
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:11, color:"#888", display:"block", marginBottom:4 }}>Prestation *</label>
              <select value={form.service} onChange={e=>setForm(p=>({...p,service:e.target.value}))} style={{ width:"100%", border:"1.5px solid #e0e8f0", borderRadius:10, padding:"10px 12px", fontSize:13, outline:"none" }}>
                {["canapé","tapis","matelas"].map(cat => (
                  <optgroup key={cat} label={`${CAT_ICONS[cat]} ${cat.charAt(0).toUpperCase()+cat.slice(1)}`}>
                    {SERVICES.filter(s=>s.category===cat).map(s=><option key={s.id} value={s.id}>{s.label} — {s.price} €</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
            {form.service && (
              <div style={{ background:"#f0f8ff", borderRadius:10, padding:"8px 12px", marginBottom:12, fontSize:12, color:"#0077b6", display:"flex", justifyContent:"space-between" }}>
                <span>💰 <strong>{getSvc(form.service)?.price} €</strong></span>
                <span>⏱ <strong>{getSvc(form.service)?.duration} min</strong></span>
              </div>
            )}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
              <div>
                <label style={{ fontSize:11, color:"#888", display:"block", marginBottom:4 }}>Date *</label>
                <input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} style={{ width:"100%", border:"1.5px solid #e0e8f0", borderRadius:10, padding:"10px 12px", fontSize:13, outline:"none", boxSizing:"border-box" }} />
              </div>
              <div>
                <label style={{ fontSize:11, color:"#888", display:"block", marginBottom:4 }}>Heure</label>
                <input type="time" value={form.time} onChange={e=>setForm(p=>({...p,time:e.target.value}))} style={{ width:"100%", border:"1.5px solid #e0e8f0", borderRadius:10, padding:"10px 12px", fontSize:13, outline:"none", boxSizing:"border-box" }} />
              </div>
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:11, color:"#888", display:"block", marginBottom:4 }}>Statut</label>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {Object.entries(STATUS_CFG).map(([k,v]) => (
                  <button key={k} onClick={()=>setForm(p=>({...p,status:k}))} style={{ border:`1.5px solid ${form.status===k?v.color:"#e0e8f0"}`, background:form.status===k?v.bg:"#fff", color:form.status===k?v.color:"#888", borderRadius:20, padding:"5px 12px", fontSize:11, fontWeight:form.status===k?700:400, cursor:"pointer" }}>{v.label}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:18 }}>
              <label style={{ fontSize:11, color:"#888", display:"block", marginBottom:4 }}>Note</label>
              <textarea value={form.note} onChange={e=>setForm(p=>({...p,note:e.target.value}))} placeholder="Taches, demandes spéciales..." style={{ width:"100%", border:"1.5px solid #e0e8f0", borderRadius:10, padding:"10px 12px", fontSize:13, outline:"none", resize:"vertical", minHeight:60, boxSizing:"border-box", fontFamily:"inherit" }} />
            </div>
            <div style={{ display:"flex", gap:10 }}>
              {editRdv && <button onClick={()=>{deleteRdv(editRdv);setShowModal(false);}} style={{ background:"#fdeaea", color:"#e05252", border:"none", borderRadius:12, padding:"12px 16px", fontWeight:700, fontSize:13, cursor:"pointer" }}>Supprimer</button>}
              <button onClick={saveRdv} style={{ flex:1, background:"linear-gradient(135deg,#0077b6,#00b4d8)", color:"#fff", border:"none", borderRadius:12, padding:14, fontWeight:700, fontSize:14, cursor:"pointer" }}>{editRdv?"Enregistrer":"Créer le RDV"}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PAIEMENT */}
      {showPayModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,20,60,0.5)", zIndex:1000, display:"flex", alignItems:"flex-end" }} onClick={()=>setShowPayModal(null)}>
          <div style={{ background:"#fff", borderRadius:"20px 20px 0 0", padding:20, width:"100%", maxWidth:480, margin:"0 auto" }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ fontWeight:800, fontSize:17, color:"#023e8a" }}>Encaisser</div>
              <button onClick={()=>setShowPayModal(null)} style={{ background:"#f0f4f8", border:"none", borderRadius:20, width:30, height:30, cursor:"pointer", fontSize:16 }}>×</button>
            </div>
            <div style={{ background:"#f0f8ff", borderRadius:12, padding:"10px 14px", marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#023e8a" }}>{showPayModal.client}</div>
              <div style={{ fontSize:11, color:"#888", marginTop:2 }}>{getSvc(showPayModal.service)?.label} · {fmtDate(showPayModal.date)}</div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, paddingTop:6, borderTop:"1px solid #cae0f0" }}>
                <span style={{ fontSize:13, fontWeight:700, color:"#023e8a" }}>Total</span>
                <span style={{ fontSize:15, fontWeight:800, color:"#0077b6" }}>{Math.round((getSvc(showPayModal.service)?.price||0)*(1-payForm.discount/100))} €</span>
              </div>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, color:"#888", display:"block", marginBottom:6 }}>Remise</label>
              <div style={{ display:"flex", gap:6 }}>
                {[0,5,10,15,20].map(d => (
                  <button key={d} onClick={()=>setPayForm(p=>({...p,discount:d}))} style={{ flex:1, border:`1.5px solid ${payForm.discount===d?"#0077b6":"#e0e8f0"}`, background:payForm.discount===d?"#e8f4fd":"#fff", color:payForm.discount===d?"#0077b6":"#888", borderRadius:8, padding:"6px 0", fontSize:11, fontWeight:payForm.discount===d?700:400, cursor:"pointer" }}>
                    {d===0?"Aucune":`-${d}%`}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, color:"#888", display:"block", marginBottom:8 }}>Moyen de paiement</label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {PAY_METHODS.map(m => (
                  <button key={m.id} onClick={()=>setPayForm(p=>({...p,method:m.id}))} style={{ border:`1.5px solid ${payForm.method===m.id?m.color:"#e0e8f0"}`, background:payForm.method===m.id?m.bg:"#fff", borderRadius:12, padding:"10px 12px", cursor:"pointer", textAlign:"left" }}>
                    <div style={{ fontSize:18, marginBottom:2 }}>{m.icon}</div>
                    <div style={{ fontSize:12, fontWeight:700, color:payForm.method===m.id?m.color:"#333" }}>{m.label}</div>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, color:"#888", display:"block", marginBottom:4 }}>Montant reçu (€)</label>
              <input type="number" value={payForm.amount} onChange={e=>setPayForm(p=>({...p,amount:Number(e.target.value)}))} style={{ width:"100%", border:"1.5px solid #e0e8f0", borderRadius:10, padding:"10px 12px", fontSize:16, fontWeight:700, outline:"none", boxSizing:"border-box", textAlign:"center" }} />
              <div style={{ display:"flex", gap:6, marginTop:8 }}>
                {[Math.round((getSvc(showPayModal.service)?.price||0)*(1-payForm.discount/100)-(showPayModal.paidAmount||0)),50,30].filter(v=>v>0).map(v => (
                  <button key={v} onClick={()=>setPayForm(p=>({...p,amount:v}))} style={{ flex:1, background:"#f0f8ff", color:"#0077b6", border:"1px solid #cae0f0", borderRadius:8, padding:"6px", fontSize:12, fontWeight:600, cursor:"pointer" }}>{v} €</button>
                ))}
              </div>
            </div>
            <button onClick={savePay} style={{ width:"100%", background:"linear-gradient(135deg,#1a936f,#34d399)", color:"#fff", border:"none", borderRadius:12, padding:14, fontWeight:700, fontSize:15, cursor:"pointer" }}>✓ Valider</button>
          </div>
        </div>
      )}
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
//  DEVIS & CONTRATS
// ════════════════════════════════════════════════════════════════════════════
const CLIENT_TYPES = [
  { id: "hotel",     label: "Hôtel",              icon: "🏨", color: "#0077b6", bg: "#e8f4fd" },
  { id: "airbnb",    label: "Airbnb / Location",  icon: "🏠", color: "#e07b1a", bg: "#fef3e8" },
  { id: "flotte",    label: "Flotte voiture",      icon: "🚗", color: "#1a936f", bg: "#edf7f0" },
  { id: "bureau",    label: "Bureau / Coworking",  icon: "🏢", color: "#8b5cf6", bg: "#f3f0ff" },
  { id: "clinique",  label: "Clinique / Cabinet",  icon: "🏥", color: "#e05252", bg: "#fdeaea" },
  { id: "autre",     label: "Autre",               icon: "📋", color: "#555",    bg: "#f5f5f5" },
];

const FREQUENCES = [
  { id: "ponctuel",     label: "Ponctuel",       mult: 1,    remise: 0  },
  { id: "mensuel",      label: "Mensuel",        mult: 12,   remise: 10 },
  { id: "bimensuel",    label: "2x / mois",      mult: 24,   remise: 15 },
  { id: "hebdomadaire", label: "Hebdomadaire",   mult: 52,   remise: 20 },
];

const DOC_TYPES = [
  { id: "devis",   label: "Devis",    icon: "📄", color: "#0077b6" },
  { id: "contrat", label: "Contrat",  icon: "📝", color: "#1a936f" },
];

const SAMPLE_DOCS = [
  { id: 101, type: "contrat", clientType: "hotel",  clientName: "Hôtel Campanile SQY",   contact: "M. Durand", email: "contact@campanile-sqy.fr", phone: "01 30 12 34 56", address: "5 av. des Nations, Trappes", rooms: 42, lignes: [{label:"Chambre double (canapé 2pl)",qty:42,pu:50,freq:"mensuel"},{label:"Couloir moquette",qty:1,pu:120,freq:"mensuel"}], freq: "mensuel", dateDoc: "2024-06-01", dateStart: "2024-07-01", status: "signé",    note: "Intervention le 1er lundi du mois" },
  { id: 102, type: "devis",   clientType: "airbnb", clientName: "Résidence Les Acacias", contact: "Mme Leroy",  email: "leroy@gmail.com",           phone: "06 77 88 99 00", address: "12 rue des Acacias, Montigny", rooms: 8, lignes: [{label:"Canapé 2 places par appart",qty:8,pu:55,freq:"bimensuel"},{label:"Tapis salon",qty:8,pu:40,freq:"bimensuel"}], freq: "bimensuel", dateDoc: "2024-06-10", dateStart: "2024-07-01", status: "en attente", note: "Nettoyage entre chaque locataire" },
];

const DOC_STATUS = {
  "en attente": { color: "#e07b1a", bg: "#fef3e8", label: "En attente" },
  "signé":      { color: "#1a936f", bg: "#edf7f0", label: "Signé ✓"    },
  "refusé":     { color: "#e05252", bg: "#fdeaea", label: "Refusé"      },
  "expiré":     { color: "#888",    bg: "#f0f4f8", label: "Expiré"      },
};

const numDoc = (type, id) => `PN-${type === "devis" ? "D" : "C"}-${String(id).padStart(4, "0")}`;
const fmtDate2 = (d) => { if (!d) return "—"; const [y,m,day]=d.split("-"); return `${day}/${m}/${y}`; };

function DevisContrats({ showToast }) {
  const [docs, setDocs]           = useState(SAMPLE_DOCS);
  const [view, setView]           = useState("list"); // "list" | "form" | "preview"
  const [editDoc, setEditDoc]     = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [filterType, setFilterType] = useState("tous");

  const emptyDoc = () => ({
    id: Date.now(), type: "devis", clientType: "hotel",
    clientName: "", contact: "", email: "", phone: "", address: "", rooms: 1,
    lignes: [{ label: "", qty: 1, pu: 80, freq: "mensuel" }],
    freq: "mensuel", dateDoc: fmt(today), dateStart: "", status: "en attente", note: ""
  });

  const openNew  = () => { setEditDoc(emptyDoc()); setView("form"); };
  const openEdit = (d) => { setEditDoc({ ...d, lignes: d.lignes.map(l=>({...l})) }); setView("form"); };
  const openPrev = (d) => { setPreviewDoc(d); setView("preview"); };

  const saveDoc = () => {
    setDocs(prev => prev.find(d => d.id === editDoc.id)
      ? prev.map(d => d.id === editDoc.id ? editDoc : d)
      : [...prev, editDoc]);
    showToast("Document enregistré ✓");
    setView("list");
  };

  const deleteDoc = (id) => { setDocs(prev => prev.filter(d => d.id !== id)); showToast("Supprimé", "#e05252"); };
  const signDoc   = (id) => { setDocs(prev => prev.map(d => d.id === id ? { ...d, status: "signé" } : d)); showToast("Contrat marqué signé ✓"); };

  const calcLigne = (l) => {
    const fr = FREQUENCES.find(f => f.id === l.freq) || FREQUENCES[0];
    const base = l.qty * l.pu;
    return { mensuel: Math.round(base * (fr.mult / 12) * (1 - fr.remise / 100)), annuel: Math.round(base * fr.mult * (1 - fr.remise / 100)) };
  };

  const calcTotal = (doc) => doc.lignes.reduce((acc, l) => {
    const c = calcLigne(l); return { mensuel: acc.mensuel + c.mensuel, annuel: acc.annuel + c.annuel };
  }, { mensuel: 0, annuel: 0 });

  const filtered = docs.filter(d => filterType === "tous" || d.type === filterType);

  // ── LIST ──
  if (view === "list") return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ display:"flex", gap:6 }}>
          {[["tous","Tous"],["devis","Devis"],["contrat","Contrats"]].map(([k,l]) => (
            <button key={k} onClick={()=>setFilterType(k)} style={{ background:filterType===k?"#0077b6":"#fff", color:filterType===k?"#fff":"#555", border:"1.5px solid "+(filterType===k?"#0077b6":"#e0e8f0"), borderRadius:20, padding:"5px 12px", fontSize:11, fontWeight:filterType===k?700:400, cursor:"pointer" }}>{l}</button>
          ))}
        </div>
        <button onClick={openNew} style={{ background:"linear-gradient(135deg,#0077b6,#00b4d8)", color:"#fff", border:"none", borderRadius:10, padding:"8px 14px", fontWeight:700, fontSize:12, cursor:"pointer" }}>+ Créer</button>
      </div>

      {filtered.length === 0 && (
        <div style={{ background:"#fff", borderRadius:16, padding:32, textAlign:"center", color:"#aaa", boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize:36, marginBottom:8 }}>📄</div>
          <div style={{ fontSize:13 }}>Aucun document</div>
          <button onClick={openNew} style={{ marginTop:12, background:"#0077b6", color:"#fff", border:"none", borderRadius:10, padding:"9px 18px", fontWeight:700, fontSize:13, cursor:"pointer" }}>Créer mon premier devis</button>
        </div>
      )}

      {filtered.map(doc => {
        const ct  = CLIENT_TYPES.find(c => c.id === doc.clientType) || CLIENT_TYPES[5];
        const dt  = DOC_TYPES.find(d => d.id === doc.type);
        const st  = DOC_STATUS[doc.status];
        const tot = calcTotal(doc);
        return (
          <div key={doc.id} style={{ background:"#fff", borderRadius:14, marginBottom:10, overflow:"hidden", boxShadow:"0 2px 10px rgba(0,0,0,0.06)", borderLeft:`3px solid ${ct.color}` }}>
            <div style={{ padding:"12px 14px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3, flexWrap:"wrap" }}>
                    <span style={{ fontSize:13, fontWeight:700, color:"#1a1a2e" }}>{doc.clientName || "Sans nom"}</span>
                    <span style={{ background:ct.bg, color:ct.color, fontSize:9, fontWeight:600, padding:"2px 7px", borderRadius:20 }}>{ct.icon} {ct.label}</span>
                    <span style={{ background:st.bg, color:st.color, fontSize:9, fontWeight:600, padding:"2px 7px", borderRadius:20 }}>{st.label}</span>
                  </div>
                  <div style={{ fontSize:11, color:"#888" }}>
                    {dt?.icon} {numDoc(doc.type, doc.id)} · {fmtDate2(doc.dateDoc)} · {FREQUENCES.find(f=>f.id===doc.freq)?.label}
                  </div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0, marginLeft:8 }}>
                  <div style={{ fontWeight:800, fontSize:14, color:ct.color }}>{tot.mensuel} €<span style={{ fontSize:10, fontWeight:400, color:"#aaa" }}>/mois</span></div>
                  <div style={{ fontSize:10, color:"#bbb" }}>{tot.annuel} €/an</div>
                </div>
              </div>
              <div style={{ display:"flex", gap:6, marginTop:10 }}>
                <button onClick={()=>openPrev(doc)} style={{ flex:1, background:"#f0f8ff", color:"#0077b6", border:"none", borderRadius:8, padding:"7px", fontSize:11, fontWeight:600, cursor:"pointer" }}>👁 Aperçu</button>
                <button onClick={()=>openEdit(doc)} style={{ flex:1, background:"#f5f5f5", color:"#555", border:"none", borderRadius:8, padding:"7px", fontSize:11, fontWeight:600, cursor:"pointer" }}>✏️ Modifier</button>
                {doc.status !== "signé" && <button onClick={()=>signDoc(doc.id)} style={{ flex:1, background:"#edf7f0", color:"#1a936f", border:"none", borderRadius:8, padding:"7px", fontSize:11, fontWeight:700, cursor:"pointer" }}>✅ Signé</button>}
                <button onClick={()=>deleteDoc(doc.id)} style={{ background:"#fdeaea", color:"#e05252", border:"none", borderRadius:8, padding:"7px 10px", fontSize:11, cursor:"pointer" }}>🗑️</button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Stats rapides */}
      {docs.length > 0 && (
        <div style={{ background:"#fff", borderRadius:14, padding:14, marginTop:4, boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize:11, color:"#888", marginBottom:8, letterSpacing:1, textTransform:"uppercase" }}>Résumé contrats signés</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[
              { label:"CA mensuel garanti", value: docs.filter(d=>d.status==="signé").reduce((s,d)=>s+calcTotal(d).mensuel,0)+" €", color:"#1a936f" },
              { label:"CA annuel projeté",  value: docs.filter(d=>d.status==="signé").reduce((s,d)=>s+calcTotal(d).annuel,0)+" €",  color:"#0077b6" },
            ].map((s,i) => (
              <div key={i} style={{ background:"#f5f8fc", borderRadius:10, padding:"10px 12px" }}>
                <div style={{ fontSize:16, fontWeight:800, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:10, color:"#888", marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ── FORM ──
  if (view === "form" && editDoc) {
    const addLigne = () => setEditDoc(d=>({...d,lignes:[...d.lignes,{label:"",qty:1,pu:80,freq:d.freq}]}));
    const delLigne = (i) => setEditDoc(d=>({...d,lignes:d.lignes.filter((_,j)=>j!==i)}));
    const setLigne = (i,k,v) => setEditDoc(d=>({...d,lignes:d.lignes.map((l,j)=>j===i?{...l,[k]:v}:l)}));
    const tot = calcTotal(editDoc);

    return (
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
          <button onClick={()=>setView("list")} style={{ background:"#f0f4f8", border:"none", borderRadius:8, padding:"7px 12px", fontSize:12, cursor:"pointer", color:"#555" }}>← Retour</button>
          <div style={{ fontWeight:800, fontSize:16, color:"#023e8a" }}>{editDoc.id && docs.find(d=>d.id===editDoc.id) ? "Modifier" : "Nouveau"} document</div>
        </div>

        {/* Type doc */}
        <div style={{ background:"#fff", borderRadius:14, padding:14, marginBottom:12, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize:11, color:"#888", marginBottom:8, fontWeight:600 }}>TYPE DE DOCUMENT</div>
          <div style={{ display:"flex", gap:8 }}>
            {DOC_TYPES.map(dt => (
              <button key={dt.id} onClick={()=>setEditDoc(d=>({...d,type:dt.id}))}
                style={{ flex:1, border:`1.5px solid ${editDoc.type===dt.id?dt.color:"#e0e8f0"}`, background:editDoc.type===dt.id?dt.color:"#fff", color:editDoc.type===dt.id?"#fff":"#555", borderRadius:10, padding:"10px", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                {dt.icon} {dt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Type client */}
        <div style={{ background:"#fff", borderRadius:14, padding:14, marginBottom:12, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize:11, color:"#888", marginBottom:8, fontWeight:600 }}>TYPE DE CLIENT</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6 }}>
            {CLIENT_TYPES.map(ct => (
              <button key={ct.id} onClick={()=>setEditDoc(d=>({...d,clientType:ct.id}))}
                style={{ border:`1.5px solid ${editDoc.clientType===ct.id?ct.color:"#e0e8f0"}`, background:editDoc.clientType===ct.id?ct.bg:"#fff", color:editDoc.clientType===ct.id?ct.color:"#888", borderRadius:10, padding:"8px 4px", fontSize:10, fontWeight:editDoc.clientType===ct.id?700:400, cursor:"pointer", textAlign:"center" }}>
                <div style={{ fontSize:16 }}>{ct.icon}</div>
                <div style={{ marginTop:2 }}>{ct.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Infos client */}
        <div style={{ background:"#fff", borderRadius:14, padding:14, marginBottom:12, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize:11, color:"#888", marginBottom:10, fontWeight:600 }}>INFORMATIONS CLIENT</div>
          {[
            { label:"Nom de l'établissement *", key:"clientName", type:"text", placeholder:"Hôtel Campanile SQY" },
            { label:"Contact",                  key:"contact",    type:"text", placeholder:"M. Dupont" },
            { label:"Email",                     key:"email",      type:"email",placeholder:"contact@hotel.fr" },
            { label:"Téléphone",                 key:"phone",      type:"tel",  placeholder:"01 xx xx xx xx" },
            { label:"Adresse",                   key:"address",    type:"text", placeholder:"5 av. des Nations, Trappes" },
          ].map(f => (
            <div key={f.key} style={{ marginBottom:10 }}>
              <label style={{ fontSize:10, color:"#888", display:"block", marginBottom:3 }}>{f.label}</label>
              <input type={f.type} value={editDoc[f.key]} placeholder={f.placeholder}
                onChange={e=>setEditDoc(d=>({...d,[f.key]:e.target.value}))}
                style={{ width:"100%", border:"1.5px solid #e0e8f0", borderRadius:8, padding:"8px 10px", fontSize:12, outline:"none", boxSizing:"border-box" }} />
            </div>
          ))}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div>
              <label style={{ fontSize:10, color:"#888", display:"block", marginBottom:3 }}>Date du document</label>
              <input type="date" value={editDoc.dateDoc} onChange={e=>setEditDoc(d=>({...d,dateDoc:e.target.value}))}
                style={{ width:"100%", border:"1.5px solid #e0e8f0", borderRadius:8, padding:"8px 10px", fontSize:12, outline:"none", boxSizing:"border-box" }} />
            </div>
            <div>
              <label style={{ fontSize:10, color:"#888", display:"block", marginBottom:3 }}>Début de prestation</label>
              <input type="date" value={editDoc.dateStart} onChange={e=>setEditDoc(d=>({...d,dateStart:e.target.value}))}
                style={{ width:"100%", border:"1.5px solid #e0e8f0", borderRadius:8, padding:"8px 10px", fontSize:12, outline:"none", boxSizing:"border-box" }} />
            </div>
          </div>
        </div>

        {/* Prestations */}
        <div style={{ background:"#fff", borderRadius:14, padding:14, marginBottom:12, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ fontSize:11, color:"#888", fontWeight:600 }}>PRESTATIONS</div>
            <button onClick={addLigne} style={{ background:"#e8f4fd", color:"#0077b6", border:"none", borderRadius:8, padding:"5px 10px", fontSize:11, fontWeight:700, cursor:"pointer" }}>+ Ligne</button>
          </div>

          {editDoc.lignes.map((l, i) => (
            <div key={i} style={{ background:"#f5f8fc", borderRadius:10, padding:10, marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <div style={{ fontSize:11, color:"#888", fontWeight:600 }}>Ligne {i+1}</div>
                {editDoc.lignes.length > 1 && (
                  <button onClick={()=>delLigne(i)} style={{ background:"#fdeaea", color:"#e05252", border:"none", borderRadius:6, padding:"3px 8px", fontSize:11, cursor:"pointer" }}>✕</button>
                )}
              </div>
              <input value={l.label} placeholder="Description (ex: Chambre double - canapé)" onChange={e=>setLigne(i,"label",e.target.value)}
                style={{ width:"100%", border:"1.5px solid #e0e8f0", borderRadius:8, padding:"7px 10px", fontSize:12, outline:"none", boxSizing:"border-box", marginBottom:6 }} />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 2fr", gap:6 }}>
                <div>
                  <label style={{ fontSize:9, color:"#888", display:"block", marginBottom:2 }}>Qté</label>
                  <input type="number" value={l.qty} min={1} onChange={e=>setLigne(i,"qty",Number(e.target.value))}
                    style={{ width:"100%", border:"1.5px solid #e0e8f0", borderRadius:8, padding:"7px 8px", fontSize:12, outline:"none", boxSizing:"border-box", textAlign:"center" }} />
                </div>
                <div>
                  <label style={{ fontSize:9, color:"#888", display:"block", marginBottom:2 }}>PU (€)</label>
                  <input type="number" value={l.pu} min={0} onChange={e=>setLigne(i,"pu",Number(e.target.value))}
                    style={{ width:"100%", border:"1.5px solid #e0e8f0", borderRadius:8, padding:"7px 8px", fontSize:12, outline:"none", boxSizing:"border-box", textAlign:"center" }} />
                </div>
                <div>
                  <label style={{ fontSize:9, color:"#888", display:"block", marginBottom:2 }}>Fréquence</label>
                  <select value={l.freq} onChange={e=>setLigne(i,"freq",e.target.value)}
                    style={{ width:"100%", border:"1.5px solid #e0e8f0", borderRadius:8, padding:"7px 8px", fontSize:11, outline:"none" }}>
                    {FREQUENCES.map(f=><option key={f.id} value={f.id}>{f.label} {f.remise>0?`(-${f.remise}%)`:""}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginTop:6, fontSize:11, color:"#0077b6", textAlign:"right" }}>
                → {calcLigne(l).mensuel} €/mois · {calcLigne(l).annuel} €/an
              </div>
            </div>
          ))}

          <div style={{ background:"linear-gradient(135deg,#e8f4fd,#caf0f8)", borderRadius:10, padding:"10px 14px", marginTop:4 }}>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:13, fontWeight:800, color:"#023e8a" }}>TOTAL</span>
              <span style={{ fontSize:13, fontWeight:800, color:"#0077b6" }}>{tot.mensuel} €/mois · {tot.annuel} €/an</span>
            </div>
          </div>
        </div>

        {/* Note */}
        <div style={{ background:"#fff", borderRadius:14, padding:14, marginBottom:16, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
          <label style={{ fontSize:10, color:"#888", display:"block", marginBottom:6, fontWeight:600 }}>NOTE / CONDITIONS PARTICULIÈRES</label>
          <textarea value={editDoc.note} onChange={e=>setEditDoc(d=>({...d,note:e.target.value}))} placeholder="Ex: Intervention le lundi matin, accès par entrée de service..."
            style={{ width:"100%", border:"1.5px solid #e0e8f0", borderRadius:8, padding:"8px 10px", fontSize:12, outline:"none", resize:"vertical", minHeight:70, boxSizing:"border-box", fontFamily:"inherit" }} />
        </div>

        <button onClick={saveDoc} style={{ width:"100%", background:"linear-gradient(135deg,#0077b6,#00b4d8)", color:"#fff", border:"none", borderRadius:12, padding:14, fontWeight:700, fontSize:15, cursor:"pointer", boxShadow:"0 4px 16px rgba(0,119,182,0.25)" }}>
          💾 Enregistrer le document
        </button>
      </div>
    );
  }

  // ── PREVIEW ──
  if (view === "preview" && previewDoc) {
    const ct  = CLIENT_TYPES.find(c => c.id === previewDoc.clientType) || CLIENT_TYPES[5];
    const tot = calcTotal(previewDoc);
    const st  = DOC_STATUS[previewDoc.status];
    const isContrat = previewDoc.type === "contrat";

    return (
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
          <button onClick={()=>setView("list")} style={{ background:"#f0f4f8", border:"none", borderRadius:8, padding:"7px 12px", fontSize:12, cursor:"pointer", color:"#555" }}>← Retour</button>
          <div style={{ fontWeight:800, fontSize:15, color:"#023e8a" }}>Aperçu du document</div>
          <span style={{ background:st.bg, color:st.color, fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:20 }}>{st.label}</span>
        </div>

        {/* Document preview */}
        <div style={{ background:"#fff", borderRadius:16, overflow:"hidden", boxShadow:"0 4px 20px rgba(0,0,0,0.1)" }}>
          {/* Header doc */}
          <div style={{ background:`linear-gradient(135deg,#1a1a2e,#023e8a)`, padding:"20px 20px 16px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ color:"rgba(255,255,255,0.5)", fontSize:9, letterSpacing:2, textTransform:"uppercase", marginBottom:4 }}>PureNest · Nettoyage Pro</div>
                <div style={{ color:"#fff", fontSize:24, fontWeight:800, letterSpacing:-1 }}>Pure<span style={{ color:"#00b4d8" }}>Nest</span></div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ color:"#fff", fontSize:16, fontWeight:800 }}>{isContrat?"CONTRAT":"DEVIS"}</div>
                <div style={{ color:"rgba(255,255,255,0.6)", fontSize:10, marginTop:2 }}>N° {numDoc(previewDoc.type, previewDoc.id)}</div>
                <div style={{ color:"rgba(255,255,255,0.6)", fontSize:10 }}>Du {fmtDate2(previewDoc.dateDoc)}</div>
              </div>
            </div>
          </div>

          <div style={{ padding:"16px 18px" }}>
            {/* Parties */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
              <div style={{ background:"#f5f8fc", borderRadius:10, padding:10 }}>
                <div style={{ fontSize:9, color:"#888", letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>Prestataire</div>
                <div style={{ fontSize:13, fontWeight:700, color:"#023e8a" }}>PureNest</div>
                <div style={{ fontSize:11, color:"#555", marginTop:2 }}>Trappes (78190)</div>
                <div style={{ fontSize:11, color:"#555" }}>Auto-entrepreneur</div>
              </div>
              <div style={{ background:"#f5f8fc", borderRadius:10, padding:10 }}>
                <div style={{ fontSize:9, color:"#888", letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>Client</div>
                <div style={{ fontSize:12, fontWeight:700, color:"#023e8a" }}>{previewDoc.clientName}</div>
                {previewDoc.contact && <div style={{ fontSize:11, color:"#555", marginTop:2 }}>{previewDoc.contact}</div>}
                {previewDoc.address && <div style={{ fontSize:10, color:"#888", marginTop:1 }}>{previewDoc.address}</div>}
                {previewDoc.email   && <div style={{ fontSize:10, color:"#0077b6", marginTop:1 }}>{previewDoc.email}</div>}
              </div>
            </div>

            {/* Objet */}
            <div style={{ background:"#e8f4fd", borderRadius:10, padding:"8px 12px", marginBottom:14 }}>
              <span style={{ fontSize:11, color:"#023e8a", fontWeight:600 }}>Objet : </span>
              <span style={{ fontSize:11, color:"#333" }}>
                {isContrat?"Contrat de nettoyage professionnel":"Devis de nettoyage professionnel"} — {ct.icon} {ct.label}
                {previewDoc.dateStart ? ` — À partir du ${fmtDate2(previewDoc.dateStart)}` : ""}
              </span>
            </div>

            {/* Lignes */}
            <div style={{ marginBottom:14 }}>
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:0, background:"#023e8a", borderRadius:"8px 8px 0 0", padding:"6px 10px" }}>
                {["Prestation","Qté","PU","Mois"].map(h=><div key={h} style={{ fontSize:9, color:"rgba(255,255,255,0.8)", fontWeight:700, textTransform:"uppercase", textAlign:h!=="Prestation"?"center":"left" }}>{h}</div>)}
              </div>
              {previewDoc.lignes.map((l,i)=>{
                const fr = FREQUENCES.find(f=>f.id===l.freq)||FREQUENCES[0];
                return (
                  <div key={i} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:0, background:i%2===0?"#f5f8fc":"#fff", padding:"7px 10px", borderBottom:"1px solid #eee" }}>
                    <div>
                      <div style={{ fontSize:11, color:"#333", fontWeight:500 }}>{l.label||"—"}</div>
                      <div style={{ fontSize:9, color:"#0077b6" }}>{fr.label}{fr.remise>0?` (-${fr.remise}%)`:""}</div>
                    </div>
                    <div style={{ fontSize:11, color:"#555", textAlign:"center", alignSelf:"center" }}>{l.qty}</div>
                    <div style={{ fontSize:11, color:"#555", textAlign:"center", alignSelf:"center" }}>{l.pu} €</div>
                    <div style={{ fontSize:11, fontWeight:700, color:"#0077b6", textAlign:"center", alignSelf:"center" }}>{calcLigne(l).mensuel} €</div>
                  </div>
                );
              })}
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", background:"#023e8a", borderRadius:"0 0 8px 8px", padding:"8px 10px" }}>
                <div style={{ fontSize:11, color:"#fff", fontWeight:800, gridColumn:"1/4" }}>TOTAL MENSUEL</div>
                <div style={{ fontSize:13, color:"#caf0f8", fontWeight:800, textAlign:"center" }}>{tot.mensuel} €</div>
              </div>
            </div>

            {/* Projection annuelle */}
            <div style={{ background:"#edf7f0", border:"1px solid #c3e6d5", borderRadius:10, padding:"8px 12px", marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:11, color:"#1a936f", fontWeight:600 }}>CA annuel projeté</span>
                <span style={{ fontSize:14, fontWeight:800, color:"#1a936f" }}>{tot.annuel} €</span>
              </div>
            </div>

            {/* Note */}
            {previewDoc.note && (
              <div style={{ background:"#fef3e8", border:"1px solid #fde3be", borderRadius:10, padding:"8px 12px", marginBottom:14 }}>
                <div style={{ fontSize:9, color:"#e07b1a", fontWeight:700, textTransform:"uppercase", marginBottom:4 }}>Conditions particulières</div>
                <div style={{ fontSize:11, color:"#555" }}>{previewDoc.note}</div>
              </div>
            )}

            {/* Clauses contrat */}
            {isContrat && (
              <div style={{ border:"1px solid #e0e8f0", borderRadius:10, padding:"10px 12px", marginBottom:14 }}>
                <div style={{ fontSize:9, color:"#888", fontWeight:700, textTransform:"uppercase", marginBottom:8 }}>Clauses contractuelles</div>
                {[
                  "Paiement à 30 jours fin de mois sur facture.",
                  "Résiliation possible avec préavis de 30 jours par lettre recommandée.",
                  "PureNest s'engage à utiliser des produits professionnels adaptés aux textiles.",
                  "En cas d'annulation de dernière minute (<24h), une indemnité de 50% sera facturée.",
                  "Le présent contrat est conclu pour une durée d'un an, renouvelable par tacite reconduction.",
                ].map((c,i)=>(
                  <div key={i} style={{ display:"flex", gap:8, marginBottom:5 }}>
                    <span style={{ color:"#0077b6", fontWeight:700, fontSize:11, flexShrink:0 }}>{i+1}.</span>
                    <span style={{ fontSize:10, color:"#555", lineHeight:1.5 }}>{c}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Signatures */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {["Le Client","PureNest"].map(who=>(
                <div key={who} style={{ border:"1.5px dashed #ccc", borderRadius:10, padding:12, textAlign:"center" }}>
                  <div style={{ fontSize:9, color:"#888", marginBottom:20 }}>{who}</div>
                  <div style={{ height:30, borderBottom:"1px solid #ccc", marginBottom:4 }}></div>
                  <div style={{ fontSize:9, color:"#aaa" }}>Signature & date</div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display:"flex", gap:8, marginTop:16 }}>
              <button onClick={()=>openEdit(previewDoc)} style={{ flex:1, background:"#f0f4f8", color:"#555", border:"none", borderRadius:10, padding:"10px", fontSize:12, fontWeight:600, cursor:"pointer" }}>✏️ Modifier</button>
              {previewDoc.status!=="signé" && (
                <button onClick={()=>{ signDoc(previewDoc.id); setPreviewDoc(d=>({...d,status:"signé"})); }}
                  style={{ flex:1, background:"linear-gradient(135deg,#1a936f,#34d399)", color:"#fff", border:"none", borderRadius:10, padding:"10px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                  ✅ Marquer signé
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}


// ════════════════════════════════════════════════════════════════════════════
//  LANDING — Choix du portail (Pro ou Client)
// ════════════════════════════════════════════════════════════════════════════
function LandingView({ onProAccess, onClientAccess, onRegister, accounts, proCreds }) {
  const [portal, setPortal]   = useState(null); // null | "pro" | "client" | "signup"
  const [user, setUser]       = useState("");
  const [pwd, setPwd]         = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr]         = useState("");
  const [pwdHints, setPwdHints] = useState([]);
  // Signup fields
  const [signupName, setSignupName]     = useState("");
  const [signupId, setSignupId]         = useState("");
  const [signupPwd, setSignupPwd]       = useState("");
  const [signupPwd2, setSignupPwd2]     = useState("");
  const [signupEmail, setSignupEmail]   = useState("");
  const [signupPhone, setSignupPhone]   = useState("");
  const [showSignupPwd, setShowSignupPwd] = useState(false);
  const [signupDone, setSignupDone]     = useState(false);
  const [signupHints, setSignupHints]   = useState([]);

  const checkPwdHints = (p) => {
    const hints = [];
    if (p.length < 8)       hints.push("Au moins 8 caractères");
    if (!/[A-Z]/.test(p))   hints.push("1 majuscule");
    if (!/[a-z]/.test(p))   hints.push("1 minuscule");
    if (!/[0-9]/.test(p))   hints.push("1 chiffre");
    setPwdHints(hints);
  };

  const submitPro = () => {
    const validErr = validatePassword(pwd);
    if (validErr) { setErr(validErr); return; }
    if (user === proCreds.user && pwd === proCreds.password) {
      onProAccess();
    } else {
      setErr("Identifiant ou mot de passe incorrect.");
    }
  };

  const submitClient = () => {
    if (!user || !pwd) { setErr("Remplissez tous les champs."); return; }
    const account = accounts[user.toLowerCase().trim()];
    if (account && account.password === pwd) {
      onClientAccess(account.name);
    } else {
      setErr("Identifiant ou mot de passe incorrect.");
    }
  };

  const submitSignup = () => {
    if (!signupName || !signupId || !signupPwd || !signupEmail) { setErr("Tous les champs obligatoires (*) doivent être remplis."); return; }
    const idClean = signupId.toLowerCase().trim().replace(/\s+/g, ".");
    if (accounts[idClean]) { setErr("Cet identifiant est déjà utilisé. Choisissez-en un autre."); return; }
    const pwdErr = validatePassword(signupPwd);
    if (pwdErr) { setErr(pwdErr); return; }
    if (signupPwd !== signupPwd2) { setErr("Les mots de passe ne correspondent pas."); return; }
    onRegister(idClean, signupPwd, signupName);
    setSignupDone(true);
    setErr("");
  };

  const checkSignupHints = (p) => {
    const h = [];
    if (p.length < 8)       h.push({ ok: false, label: "8 car." });    else h.push({ ok: true, label: "8 car." });
    if (!/[A-Z]/.test(p))   h.push({ ok: false, label: "MAJ" });       else h.push({ ok: true, label: "MAJ" });
    if (!/[a-z]/.test(p))   h.push({ ok: false, label: "min" });       else h.push({ ok: true, label: "min" });
    if (!/[0-9]/.test(p))   h.push({ ok: false, label: "Chiffre" });   else h.push({ ok: true, label: "Chiffre" });
    setSignupHints(h);
  };

  const inputStyle = { width:"100%", border:"1.5px solid #e0e8f0", borderRadius:10, padding:"11px 14px", fontSize:13, outline:"none", boxSizing:"border-box" };

  return (
    <div style={{ fontFamily:"'Segoe UI',Arial,sans-serif", background:"linear-gradient(160deg,#0077b6,#00b4d8,#48cae4)", minHeight:"100vh", maxWidth:480, margin:"0 auto", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, position:"relative", overflow:"hidden" }}>

      {/* Bulles déco */}
      {[[60,60,"top:20px","right:20px",0.2],[35,35,"top:80px","right:75px",0.15],[20,20,"top:30px","right:110px",0.1],[50,50,"bottom:60px","left:20px",0.15],[25,25,"bottom:100px","left:65px",0.1]].map(([w,h,t,r,o],i)=>(
        <div key={i} style={{ position:"absolute", width:w, height:h, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.3)", background:`radial-gradient(circle at 30% 30%, rgba(255,255,255,${o+0.1}), rgba(255,255,255,0.02))`, ...(t.startsWith("top")?{top:parseInt(t.split(":")[1])}:{bottom:parseInt(t.split(":")[1])}), ...(r.startsWith("right")?{right:parseInt(r.split(":")[1])}:{left:parseInt(r.split(":")[1])}) }} />
      ))}

      {/* Logo */}
      <div style={{ textAlign:"center", marginBottom:36 }}>
        <div style={{ fontSize:52, fontWeight:900, color:"#fff", letterSpacing:-2, textShadow:"0 4px 20px rgba(0,40,100,0.3)" }}>
          Pure<span style={{ color:"#caf0f8" }}>Nest</span>
        </div>
        <div style={{ color:"rgba(255,255,255,0.8)", fontSize:13, fontStyle:"italic", marginTop:4 }}>Nettoyage Professionnel</div>
      </div>

      {/* Choix portail */}
      {!portal && (
        <div style={{ width:"100%" }}>
          <div style={{ color:"rgba(255,255,255,0.9)", fontSize:13, textAlign:"center", marginBottom:20, fontWeight:500 }}>Qui êtes-vous ?</div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <button onClick={()=>{ setPortal("client"); setErr(""); setUser(""); setPwd(""); }}
              style={{ background:"#fff", color:"#0077b6", border:"none", borderRadius:16, padding:"18px 20px", fontWeight:700, fontSize:15, cursor:"pointer", boxShadow:"0 8px 24px rgba(0,40,100,0.2)", display:"flex", alignItems:"center", gap:14, textAlign:"left" }}>
              <div style={{ width:44, height:44, borderRadius:12, background:"#e8f4fd", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🏨</div>
              <div>
                <div style={{ fontSize:15, fontWeight:800, color:"#023e8a" }}>Espace Client Pro</div>
                <div style={{ fontSize:11, color:"#888", marginTop:2, fontWeight:400 }}>Hôtels, Airbnb, Résidences — suivi de vos contrats</div>
              </div>
              <div style={{ marginLeft:"auto", color:"#ccc", fontSize:18 }}>›</div>
            </button>
            <button onClick={()=>{ setPortal("pro"); setErr(""); setUser(""); setPwd(""); }}
              style={{ background:"rgba(255,255,255,0.15)", color:"#fff", border:"1.5px solid rgba(255,255,255,0.3)", borderRadius:16, padding:"18px 20px", fontWeight:700, fontSize:15, cursor:"pointer", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", gap:14, textAlign:"left" }}>
              <div style={{ width:44, height:44, borderRadius:12, background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>⚙️</div>
              <div>
                <div style={{ fontSize:15, fontWeight:800, color:"#fff" }}>Espace Administrateur</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.7)", marginTop:2, fontWeight:400 }}>Gestion RDV, paiements, devis et contrats</div>
              </div>
              <div style={{ marginLeft:"auto", color:"rgba(255,255,255,0.4)", fontSize:18 }}>›</div>
            </button>
          </div>
        </div>
      )}

      {/* Formulaire connexion */}
      {portal && (
        <div style={{ background:"#fff", borderRadius:20, padding:24, width:"100%", boxShadow:"0 20px 60px rgba(0,40,100,0.25)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
            <button onClick={()=>{ setPortal(null); setErr(""); }} style={{ background:"#f0f4f8", border:"none", borderRadius:8, padding:"6px 10px", fontSize:12, cursor:"pointer", color:"#555" }}>←</button>
            <div>
              <div style={{ fontSize:16, fontWeight:800, color:"#023e8a" }}>
                {portal==="pro" ? "🔐 Connexion Admin" : "🏨 Espace Client"}
              </div>
              <div style={{ fontSize:11, color:"#888", marginTop:1 }}>
                {portal==="pro" ? "Accès réservé à PureNest" : "Connectez-vous avec vos identifiants"}
              </div>
            </div>
          </div>

          {/* Identifiant */}
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:11, color:"#888", display:"block", marginBottom:4, fontWeight:600 }}>
              {portal==="pro" ? "Identifiant" : "Identifiant client"}
            </label>
            <input value={user} onChange={e=>{ setUser(e.target.value); setErr(""); }}
              placeholder={portal==="pro" ? "admin" : "ex: hotel.campanile"}
              style={inputStyle} autoComplete="username" />
            {portal==="client" && (
              <div style={{ fontSize:10, color:"#aaa", marginTop:4 }}>Votre identifiant vous a été communiqué par PureNest</div>
            )}
          </div>

          {/* Mot de passe */}
          <div style={{ marginBottom:8 }}>
            <label style={{ fontSize:11, color:"#888", display:"block", marginBottom:4, fontWeight:600 }}>Mot de passe</label>
            <div style={{ position:"relative" }}>
              <input type={showPwd?"text":"password"} value={pwd}
                onChange={e=>{ setPwd(e.target.value); checkPwdHints(e.target.value); setErr(""); }}
                placeholder="••••••••"
                style={{ ...inputStyle, paddingRight:44 }} autoComplete="current-password" />
              <button onClick={()=>setShowPwd(p=>!p)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:16, color:"#aaa" }}>
                {showPwd ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* Indicateurs de force mdp */}
          {pwd.length > 0 && (
            <div style={{ marginBottom:12 }}>
              <div style={{ display:"flex", gap:4, marginBottom:6 }}>
                {[
                  { ok: pwd.length >= 8,     label: "8 car." },
                  { ok: /[A-Z]/.test(pwd),   label: "MAJ"    },
                  { ok: /[a-z]/.test(pwd),   label: "min"    },
                  { ok: /[0-9]/.test(pwd),   label: "Chiffre"},
                ].map((h,i) => (
                  <div key={i} style={{ flex:1, textAlign:"center" }}>
                    <div style={{ height:4, borderRadius:4, background:h.ok?"#1a936f":"#e0e8f0", marginBottom:3 }} />
                    <div style={{ fontSize:9, color:h.ok?"#1a936f":"#aaa", fontWeight:h.ok?700:400 }}>{h.ok?"✓":""} {h.label}</div>
                  </div>
                ))}
              </div>
              {pwdHints.length === 0 && <div style={{ fontSize:11, color:"#1a936f", fontWeight:600 }}>✓ Mot de passe valide</div>}
            </div>
          )}

          {err && (
            <div style={{ background:"#fdeaea", border:"1px solid #f5c0c0", borderRadius:10, padding:"8px 12px", marginBottom:12, fontSize:12, color:"#e05252" }}>
              ⚠ {err}
            </div>
          )}

          <button onClick={portal==="pro" ? submitPro : submitClient}
            style={{ width:"100%", background:"linear-gradient(135deg,#0077b6,#00b4d8)", color:"#fff", border:"none", borderRadius:12, padding:14, fontWeight:700, fontSize:15, cursor:"pointer", boxShadow:"0 4px 16px rgba(0,119,182,0.3)", marginTop:4 }}>
            Se connecter →
          </button>

          {portal==="client" && (
            <div style={{ textAlign:"center", marginTop:14, fontSize:11, color:"#888" }}>
              Pas encore de compte ?{" "}
              <span onClick={()=>{ setPortal("signup"); setErr(""); }} style={{ color:"#0077b6", fontWeight:700, cursor:"pointer", textDecoration:"underline" }}>Créer mon espace client →</span>
            </div>
          )}
        </div>
      )}

      {/* SIGNUP FORM */}
      {portal === "signup" && (
        <div style={{ background:"#fff", borderRadius:20, padding:24, width:"100%", boxShadow:"0 20px 60px rgba(0,40,100,0.25)" }}>
          {!signupDone ? (
            <>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                <button onClick={()=>{ setPortal("client"); setErr(""); setSignupName(""); setSignupId(""); setSignupPwd(""); setSignupPwd2(""); setSignupEmail(""); setSignupPhone(""); setSignupDone(false); }} style={{ background:"#f0f4f8", border:"none", borderRadius:8, padding:"6px 10px", fontSize:12, cursor:"pointer", color:"#555" }}>←</button>
                <div>
                  <div style={{ fontSize:16, fontWeight:800, color:"#023e8a" }}>🏨 Créer mon compte</div>
                  <div style={{ fontSize:11, color:"#888", marginTop:1 }}>Espace réservé aux professionnels</div>
                </div>
              </div>

              {[
                { label:"Nom de l'établissement *", val:signupName, set:setSignupName, ph:"Hôtel Campanile SQY", type:"text" },
                { label:"Email *",                  val:signupEmail, set:setSignupEmail, ph:"contact@hotel.fr", type:"email" },
                { label:"Téléphone",                val:signupPhone, set:setSignupPhone, ph:"01 xx xx xx xx", type:"tel" },
              ].map(f => (
                <div key={f.label} style={{ marginBottom:10 }}>
                  <label style={{ fontSize:11, color:"#888", display:"block", marginBottom:4, fontWeight:600 }}>{f.label}</label>
                  <input type={f.type} value={f.val} placeholder={f.ph} onChange={e=>{ f.set(e.target.value); setErr(""); }}
                    style={{ width:"100%", border:"1.5px solid #e0e8f0", borderRadius:10, padding:"10px 12px", fontSize:13, outline:"none", boxSizing:"border-box" }} />
                </div>
              ))}

              <div style={{ marginBottom:10 }}>
                <label style={{ fontSize:11, color:"#888", display:"block", marginBottom:4, fontWeight:600 }}>Identifiant *</label>
                <input value={signupId} placeholder="ex: hotel.campanile" onChange={e=>{ setSignupId(e.target.value.toLowerCase().replace(/\s+/g,".")); setErr(""); }}
                  style={{ width:"100%", border:"1.5px solid #e0e8f0", borderRadius:10, padding:"10px 12px", fontSize:13, outline:"none", boxSizing:"border-box" }} />
                {signupId && <div style={{ fontSize:10, color:"#0077b6", marginTop:3 }}>→ Votre identifiant sera : <strong>{signupId.toLowerCase().replace(/\s+/g,".")}</strong></div>}
              </div>

              <div style={{ marginBottom:6 }}>
                <label style={{ fontSize:11, color:"#888", display:"block", marginBottom:4, fontWeight:600 }}>Mot de passe *</label>
                <div style={{ position:"relative" }}>
                  <input type={showSignupPwd?"text":"password"} value={signupPwd} placeholder="••••••••"
                    onChange={e=>{ setSignupPwd(e.target.value); checkSignupHints(e.target.value); setErr(""); }}
                    style={{ width:"100%", border:"1.5px solid #e0e8f0", borderRadius:10, padding:"10px 42px 10px 12px", fontSize:13, outline:"none", boxSizing:"border-box" }} />
                  <button onClick={()=>setShowSignupPwd(p=>!p)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:15, color:"#aaa" }}>{showSignupPwd?"🙈":"👁"}</button>
                </div>
              </div>

              {signupPwd.length > 0 && (
                <div style={{ marginBottom:10 }}>
                  <div style={{ display:"flex", gap:4, marginBottom:4 }}>
                    {signupHints.map((h,i) => (
                      <div key={i} style={{ flex:1, textAlign:"center" }}>
                        <div style={{ height:4, borderRadius:4, background:h.ok?"#1a936f":"#e0e8f0", marginBottom:2 }} />
                        <div style={{ fontSize:9, color:h.ok?"#1a936f":"#aaa", fontWeight:h.ok?700:400 }}>{h.label}</div>
                      </div>
                    ))}
                  </div>
                  {signupHints.every(h=>h.ok) && <div style={{ fontSize:10, color:"#1a936f", fontWeight:700 }}>✓ Mot de passe valide</div>}
                </div>
              )}

              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:11, color:"#888", display:"block", marginBottom:4, fontWeight:600 }}>Confirmer le mot de passe *</label>
                <input type="password" value={signupPwd2} placeholder="••••••••"
                  onChange={e=>{ setSignupPwd2(e.target.value); setErr(""); }}
                  style={{ width:"100%", border:`1.5px solid ${signupPwd2&&signupPwd2!==signupPwd?"#e05252":"#e0e8f0"}`, borderRadius:10, padding:"10px 12px", fontSize:13, outline:"none", boxSizing:"border-box" }} />
                {signupPwd2 && signupPwd2 !== signupPwd && <div style={{ fontSize:10, color:"#e05252", marginTop:3 }}>Les mots de passe ne correspondent pas</div>}
                {signupPwd2 && signupPwd2 === signupPwd && signupPwd.length >= 8 && <div style={{ fontSize:10, color:"#1a936f", marginTop:3 }}>✓ Mots de passe identiques</div>}
              </div>

              {err && <div style={{ background:"#fdeaea", border:"1px solid #f5c0c0", borderRadius:10, padding:"8px 12px", marginBottom:12, fontSize:12, color:"#e05252" }}>⚠ {err}</div>}

              <button onClick={submitSignup}
                style={{ width:"100%", background:"linear-gradient(135deg,#0077b6,#00b4d8)", color:"#fff", border:"none", borderRadius:12, padding:14, fontWeight:700, fontSize:15, cursor:"pointer", boxShadow:"0 4px 16px rgba(0,119,182,0.3)" }}>
                Créer mon compte →
              </button>

              <div style={{ textAlign:"center", marginTop:12, fontSize:11, color:"#888" }}>
                En créant un compte, votre demande sera examinée par PureNest.
              </div>
            </>
          ) : (
            <div style={{ textAlign:"center", padding:"10px 0" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
              <div style={{ fontSize:18, fontWeight:800, color:"#023e8a", marginBottom:8 }}>Compte créé !</div>
              <div style={{ background:"#f0f8ff", borderRadius:12, padding:"12px 16px", marginBottom:16, textAlign:"left" }}>
                <div style={{ fontSize:11, color:"#888", marginBottom:6 }}>Vos identifiants de connexion</div>
                <div style={{ fontSize:13, color:"#333", fontWeight:600 }}>🏨 {signupName}</div>
                <div style={{ fontSize:13, color:"#0077b6", marginTop:4 }}>Identifiant : <strong>{signupId.toLowerCase().replace(/\s+/g,".")}</strong></div>
                <div style={{ fontSize:12, color:"#888", marginTop:4 }}>Mot de passe : celui que vous avez choisi</div>
              </div>
              <button onClick={()=>{ setPortal("client"); setSignupDone(false); setUser(signupId.toLowerCase().replace(/\s+/g,".")); setPwd(""); setErr(""); }}
                style={{ width:"100%", background:"linear-gradient(135deg,#0077b6,#00b4d8)", color:"#fff", border:"none", borderRadius:12, padding:13, fontWeight:700, fontSize:14, cursor:"pointer" }}>
                Se connecter maintenant →
              </button>
            </div>
          )}
        </div>
      )}

      <div style={{ color:"rgba(255,255,255,0.5)", fontSize:10, marginTop:24, textAlign:"center" }}>
        PureNest · Trappes (78190) · Nettoyage Pro
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  PRO SETTINGS — Changement de mot de passe admin
// ════════════════════════════════════════════════════════════════════════════
function ProSettings({ onChangePassword, showToast, onExit }) {
  const [oldPwd,    setOldPwd]    = useState("");
  const [newPwd,    setNewPwd]    = useState("");
  const [newPwd2,   setNewPwd2]   = useState("");
  const [showOld,   setShowOld]   = useState(false);
  const [showNew,   setShowNew]   = useState(false);
  const [err,       setErr]       = useState("");
  const [hints,     setHints]     = useState([]);
  const [success,   setSuccess]   = useState(false);

  const checkHints = (p) => setHints([
    { ok: p.length >= 8,     label: "8 car." },
    { ok: /[A-Z]/.test(p),  label: "MAJ"    },
    { ok: /[a-z]/.test(p),  label: "min"    },
    { ok: /[0-9]/.test(p),  label: "Chiffre"},
  ]);

  const submit = () => {
    setErr("");
    if (!oldPwd || !newPwd || !newPwd2) { setErr("Tous les champs sont obligatoires."); return; }
    const pwdErr = validatePassword(newPwd);
    if (pwdErr) { setErr(pwdErr); return; }
    if (newPwd !== newPwd2) { setErr("Les nouveaux mots de passe ne correspondent pas."); return; }
    if (oldPwd === newPwd)  { setErr("Le nouveau mot de passe doit être différent de l'ancien."); return; }
    onChangePassword(newPwd);
    setSuccess(true);
    showToast("Mot de passe modifié avec succès ✓");
    setOldPwd(""); setNewPwd(""); setNewPwd2(""); setHints([]);
  };

  const inp = (extra={}) => ({ width:"100%", border:"1.5px solid #e0e8f0", borderRadius:10, padding:"11px 42px 11px 14px", fontSize:13, outline:"none", boxSizing:"border-box", ...extra });

  return (
    <div>
      {/* Profil */}
      <div style={{ background:"linear-gradient(135deg,#1a1a2e,#023e8a)", borderRadius:16, padding:"20px", marginBottom:16, display:"flex", alignItems:"center", gap:14 }}>
        <div style={{ width:52, height:52, borderRadius:"50%", background:"rgba(0,180,216,0.3)", border:"2px solid #00b4d8", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>⚙️</div>
        <div>
          <div style={{ color:"#fff", fontWeight:800, fontSize:16 }}>Administrateur</div>
          <div style={{ color:"rgba(255,255,255,0.5)", fontSize:11, marginTop:2 }}>Identifiant : <span style={{ color:"#00b4d8" }}>admin</span></div>
          <div style={{ color:"rgba(255,255,255,0.5)", fontSize:11, marginTop:1 }}>PureNest · Trappes (78190)</div>
        </div>
      </div>

      {/* Changer mot de passe */}
      <div style={{ background:"#fff", borderRadius:16, padding:20, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", marginBottom:14 }}>
        <div style={{ fontSize:14, fontWeight:800, color:"#023e8a", marginBottom:4 }}>🔐 Changer le mot de passe</div>
        <div style={{ fontSize:11, color:"#888", marginBottom:18 }}>Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre.</div>

        {success && (
          <div style={{ background:"#edf7f0", border:"1.5px solid #c3e6d5", borderRadius:10, padding:"10px 14px", marginBottom:14, fontSize:12, color:"#1a936f", fontWeight:600 }}>
            ✅ Mot de passe modifié ! Utilisez-le lors de votre prochaine connexion.
          </div>
        )}

        {/* Ancien mdp */}
        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:11, color:"#888", display:"block", marginBottom:4, fontWeight:600 }}>Mot de passe actuel</label>
          <div style={{ position:"relative" }}>
            <input type={showOld?"text":"password"} value={oldPwd} placeholder="••••••••"
              onChange={e=>{ setOldPwd(e.target.value); setErr(""); setSuccess(false); }}
              style={inp()} />
            <button onClick={()=>setShowOld(p=>!p)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:15, color:"#aaa" }}>
              {showOld?"🙈":"👁"}
            </button>
          </div>
        </div>

        {/* Nouveau mdp */}
        <div style={{ marginBottom:6 }}>
          <label style={{ fontSize:11, color:"#888", display:"block", marginBottom:4, fontWeight:600 }}>Nouveau mot de passe</label>
          <div style={{ position:"relative" }}>
            <input type={showNew?"text":"password"} value={newPwd} placeholder="••••••••"
              onChange={e=>{ setNewPwd(e.target.value); checkHints(e.target.value); setErr(""); setSuccess(false); }}
              style={inp()} />
            <button onClick={()=>setShowNew(p=>!p)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:15, color:"#aaa" }}>
              {showNew?"🙈":"👁"}
            </button>
          </div>
        </div>

        {/* Indicateurs force */}
        {newPwd.length > 0 && (
          <div style={{ display:"flex", gap:4, marginBottom:10 }}>
            {hints.map((h,i) => (
              <div key={i} style={{ flex:1, textAlign:"center" }}>
                <div style={{ height:4, borderRadius:4, background:h.ok?"#1a936f":"#e0e8f0", marginBottom:2, transition:"background 0.3s" }} />
                <div style={{ fontSize:9, color:h.ok?"#1a936f":"#aaa", fontWeight:h.ok?700:400 }}>{h.ok?"✓":""} {h.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Confirmation mdp */}
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:11, color:"#888", display:"block", marginBottom:4, fontWeight:600 }}>Confirmer le nouveau mot de passe</label>
          <input type="password" value={newPwd2} placeholder="••••••••"
            onChange={e=>{ setNewPwd2(e.target.value); setErr(""); setSuccess(false); }}
            style={inp({ border:`1.5px solid ${newPwd2 && newPwd2!==newPwd?"#e05252":newPwd2&&newPwd2===newPwd&&newPwd.length>=8?"#1a936f":"#e0e8f0"}`, paddingRight:14 })} />
          {newPwd2 && newPwd2 !== newPwd && <div style={{ fontSize:10, color:"#e05252", marginTop:3 }}>Les mots de passe ne correspondent pas</div>}
          {newPwd2 && newPwd2 === newPwd && hints.every(h=>h.ok) && <div style={{ fontSize:10, color:"#1a936f", marginTop:3 }}>✓ Identiques</div>}
        </div>

        {err && (
          <div style={{ background:"#fdeaea", border:"1px solid #f5c0c0", borderRadius:10, padding:"8px 12px", marginBottom:12, fontSize:12, color:"#e05252" }}>
            ⚠ {err}
          </div>
        )}

        <button onClick={submit}
          style={{ width:"100%", background:"linear-gradient(135deg,#0077b6,#00b4d8)", color:"#fff", border:"none", borderRadius:12, padding:14, fontWeight:700, fontSize:14, cursor:"pointer", boxShadow:"0 4px 14px rgba(0,119,182,0.3)" }}>
          🔐 Mettre à jour le mot de passe
        </button>
      </div>

      {/* Déconnexion */}
      <div style={{ background:"#fff", borderRadius:14, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}>
        <div style={{ fontSize:13, fontWeight:700, color:"#023e8a", marginBottom:4 }}>Session</div>
        <div style={{ fontSize:11, color:"#888", marginBottom:12 }}>Quitter la vue administrateur et retourner à la page d'accueil.</div>
        <button onClick={onExit}
          style={{ width:"100%", background:"#fdeaea", color:"#e05252", border:"1.5px solid #f5c0c0", borderRadius:12, padding:12, fontWeight:700, fontSize:13, cursor:"pointer" }}>
          🚪 Se déconnecter
        </button>
      </div>
    </div>
  );
}

// ── PRO RDV CARD ─────────────────────────────────────────────────────────────
function ProRdvCard({ r, onEdit, onDone, onDelete, onPay }) {
  const [expanded, setExpanded] = useState(false);
  const svc = getSvc(r.service);
  const cat = svc?.category||"canapé";
  const c   = CAT_COLORS[cat];
  const st  = STATUS_CFG[r.status];
  const ps  = PAY_STATUS[r.paymentStatus];
  const fp  = getFinalPrice(r);

  return (
    <div style={{ background:"#fff", borderRadius:14, marginBottom:10, overflow:"hidden", boxShadow:"0 2px 10px rgba(0,0,0,0.06)", borderLeft:`3px solid ${c.accent}` }}>
      <div style={{ padding:"12px 14px", cursor:"pointer" }} onClick={()=>setExpanded(e=>!e)}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:3, flexWrap:"wrap" }}>
              <span style={{ fontSize:14, fontWeight:700, color:"#1a1a2e" }}>{r.client}</span>
              <span style={{ background:st.bg, color:st.color, fontSize:10, fontWeight:600, padding:"2px 7px", borderRadius:20 }}>{st.label}</span>
              <span style={{ background:ps.bg, color:ps.color, fontSize:10, fontWeight:600, padding:"2px 7px", borderRadius:20 }}>{ps.label}</span>
            </div>
            <div style={{ fontSize:12, color:"#888" }}>⏰ {dayLabel(r.date)} {r.time} · {CAT_ICONS[cat]} {svc?.label}</div>
          </div>
          <div style={{ textAlign:"right", flexShrink:0, marginLeft:8 }}>
            <div style={{ fontWeight:800, fontSize:15, color:c.accent }}>{fp} €</div>
            <div style={{ fontSize:10, color:"#ccc" }}>{expanded?"▲":"▼"}</div>
          </div>
        </div>
      </div>
      {expanded && (
        <div style={{ padding:"0 14px 12px", borderTop:"1px solid #f5f5f5" }}>
          {r.phone   && <div style={{ fontSize:12, color:"#555", marginTop:8 }}>📞 {r.phone}</div>}
          {r.address && <div style={{ fontSize:12, color:"#555", marginTop:4 }}>📍 {r.address}</div>}
          {r.paidAmount>0 && r.paymentStatus!=="payé" && <div style={{ fontSize:12, color:"#e07b1a", marginTop:4 }}>💰 Acompte : {r.paidAmount} € · Reste : {fp-r.paidAmount} €</div>}
          {r.note    && <div style={{ fontSize:12, color:"#888", marginTop:4, fontStyle:"italic" }}>💬 {r.note}</div>}
          <div style={{ display:"flex", gap:8, marginTop:12 }}>
            <button onClick={()=>onEdit(r)} style={{ flex:1, background:"#f0f8ff", color:"#0077b6", border:"none", borderRadius:8, padding:"8px", fontSize:12, fontWeight:600, cursor:"pointer" }}>✏️</button>
            {r.status!=="terminé"&&r.status!=="annulé" && <button onClick={()=>onDone(r.id)} style={{ flex:1, background:"#edf7f0", color:"#1a936f", border:"none", borderRadius:8, padding:"8px", fontSize:12, fontWeight:600, cursor:"pointer" }}>✅ Terminé</button>}
            {r.paymentStatus!=="payé" && <button onClick={()=>onPay(r)} style={{ flex:1, background:"linear-gradient(135deg,#1a936f,#34d399)", color:"#fff", border:"none", borderRadius:8, padding:"8px", fontSize:12, fontWeight:700, cursor:"pointer" }}>💳 Encaisser</button>}
            <button onClick={()=>onDelete(r.id)} style={{ background:"#fdeaea", color:"#e05252", border:"none", borderRadius:8, padding:"8px 10px", fontSize:12, cursor:"pointer" }}>🗑️</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ msg, color }) {
  return (
    <div style={{ position:"fixed", top:16, left:"50%", transform:"translateX(-50%)", background:color, color:"#fff", padding:"10px 20px", borderRadius:20, fontSize:13, fontWeight:600, zIndex:9999, boxShadow:"0 4px 20px rgba(0,0,0,0.2)", whiteSpace:"nowrap" }}>
      {msg}
    </div>
  );
}
