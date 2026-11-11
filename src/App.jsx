import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const WA_NUM = import.meta.env.VITE_WA_NUMBER || "5493814092807";

const C = {
  bg:"#0d0d0d", card:"#161616", border:"#252525",
  accent:"#f97316", text:"#f0f0f0", muted:"#737373",
  success:"#22c55e", danger:"#ef4444", warn:"#eab308", info:"#60a5fa", input:"#1f1f1f",
};

const gid = () => Math.random().toString(36).substr(2,9);
const hoy = () => new Date().toISOString().split("T")[0];
const fmt = n => `$${Number(n||0).toLocaleString("es-AR")}`;
const fmtHora = ts => ts ? new Date(ts).toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"}) : "--:--";
const minutos = (desde, hasta) => {
  if (!desde || !hasta) return null;
  return Math.round((new Date(hasta) - new Date(desde)) / 60000);
};

// Guardar datos offline en localStorage
const LOCAL_KEY = "foodies_cadete_pendientes";
const getPendientes = () => { try { return JSON.parse(localStorage.getItem(LOCAL_KEY)||"[]"); } catch { return []; } };
const setPendientes = d => { try { localStorage.setItem(LOCAL_KEY, JSON.stringify(d)); } catch {} };

const LOCAL_SESSION = "foodies_cadete_session";
const getSession = () => { try { return JSON.parse(localStorage.getItem(LOCAL_SESSION)||"null"); } catch { return null; } };
const setSession = d => { try { localStorage.setItem(LOCAL_SESSION, JSON.stringify(d)); } catch {} };
const clearSession = () => { try { localStorage.removeItem(LOCAL_SESSION); } catch {} };

// ── ESTILOS BASE ──
const S = {
  page: { minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"system-ui,sans-serif", fontSize:15,
    paddingTop:"env(safe-area-inset-top,0px)", paddingBottom:"env(safe-area-inset-bottom,16px)" },
  center: { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", padding:"24px" },
  card: { background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20, marginBottom:14, width:"100%" },
  btn: (v="primary",big) => ({
    width:"100%", padding:big?"18px 0":"13px 0", borderRadius:12, border:"none", cursor:"pointer",
    fontWeight:800, fontSize:big?17:14, letterSpacing:"0.3px",
    background: v==="primary"?C.accent : v==="success"?"#15803d" : v==="danger"?C.danger : v==="warn"?"#ca8a04" : "#2a2a2a",
    color:"#fff", marginBottom:10,
  }),
  input: { width:"100%", padding:"13px 14px", borderRadius:10, border:`1px solid ${C.border}`,
    background:C.input, color:C.text, fontSize:15, outline:"none", boxSizing:"border-box", marginBottom:12 },
  label: { fontSize:11, color:C.muted, marginBottom:5, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.8px" },
  badge: (v) => ({ display:"inline-block", padding:"3px 10px", borderRadius:999, fontSize:11, fontWeight:700,
    background: v==="entregado"?"#14532d" : v==="en_camino"?"#1e3a5f" : v==="pendiente"?"#7c2d12" : "#2a2a2a",
    color: v==="entregado"?C.success : v==="en_camino"?C.info : v==="pendiente"?"#fb923c" : C.muted }),
  header: { background:"#111", borderBottom:`2px solid ${C.accent}`, padding:"14px 18px",
    display:"flex", alignItems:"center", justifyContent:"space-between",
    paddingTop:"calc(env(safe-area-inset-top,0px) + 14px)" },
};

// ══════════════════════════════════════════
// PANTALLA LOGIN
// ══════════════════════════════════════════
function LoginScreen({ onLogin }) {
  const [nombre, setNombre] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [verPass, setVerPass] = useState(false);

  const handleLogin = async () => {
    if (!nombre.trim()) return setError("Ingresá tu nombre");
    setCargando(true);
    setError("");
    try {
      const { data, error: err } = await supabase
        .from("empleados")
        .select("*")
        .eq("usuario", nombre.trim().toLowerCase())
        .eq("password", pass.trim().toLowerCase())
        .eq("rol", "Cadete")
        .eq("activo", true)
        .single();
      if (err || !data) {
        setError("Usuario o contraseña incorrectos");
      } else {
        const session = { id: data.id, nombre: data.nombre, usuario: data.usuario };
        setSession(session);
        onLogin(session);
      }
    } catch {
      setError("Sin conexión — verificá tu internet");
    }
    setCargando(false);
  };

  return (
    <div style={S.center}>
      <div style={{ textAlign:"center", marginBottom:32 }}>
        <div style={{ fontSize:48, marginBottom:8 }}>🛵</div>
        <div style={{ fontSize:26, fontWeight:800, color:C.accent }}>Foodies</div>
        <div style={{ fontSize:12, color:C.muted, letterSpacing:"2px", textTransform:"uppercase" }}>Cadetes</div>
      </div>
      <div style={{ width:"100%", maxWidth:340 }}>
        <div style={S.label}>Tu nombre</div>
        <input style={S.input} placeholder="agustin / yoel / mauricio"
          value={nombre} onChange={e=>setNombre(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&handleLogin()} autoCapitalize="off" autoCorrect="off" />
        <div style={S.label}>Contraseña</div>
        <div style={{ position:"relative", marginBottom:12 }}>
          <input style={{...S.input, marginBottom:0, paddingRight:44}} type={verPass?"text":"password"} placeholder="••••••••"
            value={pass} onChange={e=>setPass(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
          <button onClick={()=>setVerPass(v=>!v)} type="button"
            style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
              background:"none", border:"none", cursor:"pointer", color:C.muted, fontSize:18, padding:0 }}>
            {verPass ? "🙈" : "👁️"}
          </button>
        </div>
        {error && <div style={{ color:C.danger, fontSize:13, marginBottom:12, textAlign:"center" }}>{error}</div>}
        <button style={S.btn("primary",true)} onClick={handleLogin} disabled={cargando}>
          {cargando ? "Verificando..." : "Ingresar"}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// PANTALLA FICHADA (esperando habilitación)
// ══════════════════════════════════════════
function FichadaScreen({ cadete, onFichado }) {
  const [estado, setEstado] = useState("idle"); // idle | fichando | esperando | habilitado
  const [turnoId, setTurnoId] = useState(null);
  const [cargando, setCargando] = useState(false);

  // Ver si ya tiene turno activo hoy
  useEffect(() => {
    const checkTurno = async () => {
      const { data } = await supabase
        .from("turnos_cadete")
        .select("*")
        .eq("empleado_id", cadete.id)
        .eq("fecha", hoy())
        .is("hora_cierre", null)
        .order("created_at", { ascending:false })
        .limit(1)
        .single();
      if (data) {
        setTurnoId(data.id);
        if (data.estado === "habilitado") { onFichado(data); }
        else { setEstado("esperando"); }
      }
    };
    checkTurno();
    // Polling cada 10s para detectar habilitación
    const interval = setInterval(async () => {
      if (!turnoId) return;
      const { data } = await supabase.from("turnos_cadete").select("*").eq("id", turnoId).single();
      if (data?.estado === "habilitado") { clearInterval(interval); onFichado(data); }
    }, 10000);
    return () => clearInterval(interval);
  }, [turnoId]);

  const fichar = async () => {
    setCargando(true);
    // Detectar turno actual
    const hora = new Date().getHours();
    const turno = hora >= 6 && hora < 18 ? "Mañana" : "Noche";
    const id = gid();
    const { data, error } = await supabase.from("turnos_cadete").insert({
      id, empleado_id: cadete.id, nombre_cadete: cadete.nombre,
      fecha: hoy(), turno, estado: "esperando", hora_llegada: new Date().toISOString()
    }).select().single();
    if (!error && data) {
      setTurnoId(data.id);
      setEstado("esperando");
    }
    setCargando(false);
  };

  if (estado === "esperando") return (
    <div style={S.center}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>⏳</div>
        <div style={{ fontSize:18, fontWeight:800, color:C.text, marginBottom:8 }}>Fichada registrada</div>
        <div style={{ fontSize:14, color:C.muted, marginBottom:24 }}>
          Esperá que el vendedor te habilite para empezar
        </div>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:16, marginBottom:20 }}>
          <div style={{ fontSize:12, color:C.muted }}>Hora de llegada</div>
          <div style={{ fontSize:20, fontWeight:800, color:C.accent }}>{fmtHora(new Date().toISOString())}</div>
        </div>
        <div style={{ fontSize:12, color:C.muted }}>Actualizando automáticamente...</div>
      </div>
    </div>
  );

  return (
    <div style={S.center}>
      <div style={{ textAlign:"center", marginBottom:32 }}>
        <div style={{ fontSize:48, marginBottom:8 }}>👋</div>
        <div style={{ fontSize:20, fontWeight:800, color:C.text }}>Hola, {cadete.nombre}</div>
        <div style={{ fontSize:13, color:C.muted, marginTop:4 }}>
          {new Date().toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long"})}
        </div>
      </div>
      <div style={{ width:"100%", maxWidth:340 }}>
        <button style={S.btn("primary",true)} onClick={fichar} disabled={cargando}>
          {cargando ? "Registrando..." : "📍 Fichar ingreso"}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// PANTALLA PRINCIPAL DEL CADETE
// ══════════════════════════════════════════
function MainScreen({ cadete, turno, onCerrar }) {
  const [vista, setVista] = useState("home"); // home | nueva | detalle
  const [rendiciones, setRendiciones] = useState([]);
  const [rendSelec, setRendSelec] = useState(null);
  const [sinc, setSinc] = useState(false);

  useEffect(() => { cargarRendiciones(); }, []);

  // Sincronizar pendientes offline al tener conexión
  useEffect(() => {
    const syncPendientes = async () => {
      const pendientes = getPendientes();
      if (!pendientes.length) return;
      setSinc(true);
      const nuevos = [];
      for (const p of pendientes) {
        try {
          await supabase.from("rendiciones_cadete").upsert(p);
        } catch { nuevos.push(p); }
      }
      setPendientes(nuevos);
      setSinc(false);
      cargarRendiciones();
    };
    window.addEventListener("online", syncPendientes);
    syncPendientes();
    return () => window.removeEventListener("online", syncPendientes);
  }, []);

  const cargarRendiciones = async () => {
    const { data } = await supabase
      .from("rendiciones_cadete")
      .select("*")
      .eq("turno_cadete_id", turno.id)
      .order("created_at", { ascending:false });
    if (data) setRendiciones(data);
    // También mostrar los guardados offline
    const pendientes = getPendientes().filter(p => p.turno_cadete_id === turno.id);
    if (pendientes.length) {
      setRendiciones(prev => {
        const ids = new Set(prev.map(r=>r.id));
        return [...pendientes.filter(p=>!ids.has(p.id)), ...prev];
      });
    }
  };

  const totalEfectivo = rendiciones.filter(r=>r.medio_pago==="Efectivo"&&r.estado==="entregado").reduce((s,r)=>s+Number(r.monto||0),0);
  const totalTransfer = rendiciones.filter(r=>r.medio_pago==="Transferencia"&&r.estado==="entregado").reduce((s,r)=>s+Number(r.monto||0),0);
  const enCamino = rendiciones.filter(r=>r.estado==="en_camino");
  const entregadas = rendiciones.filter(r=>r.estado==="entregado");
  const pendientes = rendiciones.filter(r=>r.estado==="pendiente");

  const cerrarTurno = async () => {
    if (enCamino.length > 0) {
      alert(`Tenés ${enCamino.length} comanda(s) sin confirmar entrega. Confirmalas primero.`);
      return;
    }
    if (!confirm(`¿Cerrar turno?\n\nEfectivo a rendir: ${fmt(totalEfectivo)}\nTransferencias: ${fmt(totalTransfer)}`)) return;
    await supabase.from("turnos_cadete").update({ hora_cierre: new Date().toISOString(), estado:"cerrado" }).eq("id", turno.id);
    onCerrar();
  };

  if (vista === "nueva") return <NuevaEntrega cadete={cadete} turno={turno} onGuardar={() => { cargarRendiciones(); setVista("home"); }} onVolver={()=>setVista("home")} />;
  if (vista === "detalle" && rendSelec) return <DetalleEntrega rend={rendSelec} onVolver={()=>{ setVista("home"); setRendSelec(null); }} onActualizar={cargarRendiciones} />;

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div>
          <div style={{ fontSize:16, fontWeight:800, color:C.accent }}>🛵 {cadete.nombre}</div>
          <div style={{ fontSize:11, color:C.muted }}>Turno {turno.turno} · {fmtHora(turno.hora_habilitacion)}</div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {sinc && <div style={{ fontSize:11, color:C.warn }}>↑ Sincronizando...</div>}
          {!navigator.onLine && <div style={{ fontSize:11, color:C.danger }}>📵 Sin internet</div>}
        </div>
      </div>

      <div style={{ padding:"16px 16px 0" }}>
        {/* Resumen */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16 }}>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 12px", textAlign:"center" }}>
            <div style={{ fontSize:20, fontWeight:800, color:C.accent }}>{rendiciones.length}</div>
            <div style={{ fontSize:10, color:C.muted }}>Comandas</div>
          </div>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 12px", textAlign:"center" }}>
            <div style={{ fontSize:20, fontWeight:800, color:C.success }}>{fmt(totalEfectivo)}</div>
            <div style={{ fontSize:10, color:C.muted }}>Efectivo</div>
          </div>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 12px", textAlign:"center" }}>
            <div style={{ fontSize:20, fontWeight:800, color:C.info }}>{fmt(totalTransfer)}</div>
            <div style={{ fontSize:10, color:C.muted }}>Transfer</div>
          </div>
        </div>

        {/* Alerta en camino */}
        {enCamino.length > 0 && (
          <div style={{ background:"#1e3a5f", border:`1px solid ${C.info}44`, borderRadius:10, padding:"12px 14px", marginBottom:14 }}>
            <div style={{ fontWeight:800, color:C.info, marginBottom:6 }}>🚴 En camino ({enCamino.length})</div>
            {enCamino.map(r => (
              <div key={r.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                <span style={{ fontSize:13, color:C.text }}>Comanda #{r.comanda}</span>
                <button style={{ ...S.btn("success"), width:"auto", padding:"6px 14px", marginBottom:0, fontSize:12 }}
                  onClick={() => { setRendSelec(r); setVista("detalle"); }}>
                  Confirmar entrega
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Botón nueva comanda */}
        <button style={S.btn("primary",true)} onClick={()=>setVista("nueva")}>
          + Nueva comanda
        </button>

        {/* Lista de entregas */}
        {entregadas.length > 0 && (
          <div style={S.card}>
            <div style={{ fontSize:12, fontWeight:700, color:C.accent, marginBottom:12 }}>Entregadas hoy</div>
            {entregadas.map(r => (
              <div key={r.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                borderBottom:`1px solid ${C.border}`, paddingBottom:10, marginBottom:10 }}
                onClick={() => { setRendSelec(r); setVista("detalle"); }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:14 }}>Comanda #{r.comanda}</div>
                  <div style={{ fontSize:11, color:C.muted }}>{fmtHora(r.hora_entrega)} · {r.cliente_nombre||"Sin cliente"}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontWeight:800, color:r.medio_pago==="Efectivo"?C.success:C.info }}>{fmt(r.monto)}</div>
                  <div style={{ fontSize:10, color:C.muted }}>{r.medio_pago}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cerrar turno */}
        <button style={{ ...S.btn("danger"), marginTop:8 }} onClick={cerrarTurno}>
          Cerrar turno
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// NUEVA ENTREGA
// ══════════════════════════════════════════
function NuevaEntrega({ cadete, turno, onGuardar, onVolver }) {
  const [comanda, setComanda] = useState("");
  const [monto, setMonto] = useState("");
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteDireccion, setClienteDireccion] = useState("");
  const [foto, setFoto] = useState(null); // base64
  const [gps, setGps] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [buscandoGps, setBuscandoGps] = useState(false);
  const fileRef = useRef();

  // Buscar GPS al abrir
  useEffect(() => {
    if (!navigator.geolocation) return;
    setBuscandoGps(true);
    navigator.geolocation.getCurrentPosition(
      pos => { setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setBuscandoGps(false); },
      () => setBuscandoGps(false),
      { timeout:8000, enableHighAccuracy:true }
    );
  }, []);

  // Buscar cliente por número de comanda
  useEffect(() => {
    if (!comanda || comanda.length < 5) return;
    const buscarCliente = async () => {
      const { data } = await supabase.from("facturas").select("cliente,cliente_id").eq("comanda", comanda).limit(1).single();
      if (data?.cliente) setClienteNombre(data.cliente);
    };
    buscarCliente();
  }, [comanda]);

  const tomarFoto = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setFoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const salir = async () => {
    if (!comanda.trim()) return alert("Ingresá el número de comanda");
    if (!monto.trim()) return alert("Ingresá el monto");
    setCargando(true);
    const reg = {
      id: gid(),
      turno_cadete_id: turno.id,
      empleado_id: cadete.id,
      nombre_cadete: cadete.nombre,
      comanda: comanda.trim(),
      fecha: hoy(),
      turno: turno.turno,
      monto: parseFloat(monto.replace(/\D/g,"")) || 0,
      cliente_nombre: clienteNombre || null,
      cliente_direccion: clienteDireccion || null,
      foto_salida: foto || null,
      gps_salida_lat: gps?.lat || null,
      gps_salida_lng: gps?.lng || null,
      hora_salida: new Date().toISOString(),
      estado: "en_camino",
      medio_pago: null,
    };
    // Guardar en Supabase si hay conexión, si no, guardar offline
    if (navigator.onLine) {
      const { error } = await supabase.from("rendiciones_cadete").insert(reg);
      if (error) { const p = getPendientes(); setPendientes([...p, reg]); }
    } else {
      const p = getPendientes(); setPendientes([...p, reg]);
    }
    setCargando(false);
    onGuardar();
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={{ background:"none", border:"none", color:C.muted, fontSize:14, cursor:"pointer" }} onClick={onVolver}>← Volver</button>
        <div style={{ fontWeight:800, color:C.accent }}>Nueva comanda</div>
        <div style={{ width:60 }} />
      </div>
      <div style={{ padding:16 }}>
        <div style={S.label}>Número de comanda</div>
        <input style={S.input} type="number" placeholder="7973200" value={comanda} onChange={e=>setComanda(e.target.value)} />

        <div style={S.label}>Monto total</div>
        <input style={S.input} type="number" placeholder="25000" value={monto} onChange={e=>setMonto(e.target.value)} />

        <div style={S.label}>Cliente (opcional)</div>
        <input style={S.input} placeholder="Nombre del cliente" value={clienteNombre} onChange={e=>setClienteNombre(e.target.value)} />

        <div style={S.label}>Dirección (opcional)</div>
        <input style={S.input} placeholder="Dirección de entrega" value={clienteDireccion} onChange={e=>setClienteDireccion(e.target.value)} />

        {/* GPS */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", marginBottom:12 }}>
          {buscandoGps
            ? <div style={{ fontSize:12, color:C.warn }}>📍 Obteniendo ubicación...</div>
            : gps
              ? <div style={{ fontSize:12, color:C.success }}>📍 Ubicación registrada</div>
              : <div style={{ fontSize:12, color:C.muted }}>📍 Sin GPS disponible</div>
          }
        </div>

        {/* Foto */}
        <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display:"none" }} onChange={tomarFoto} />
        {foto
          ? <div style={{ marginBottom:12, position:"relative" }}>
              <img src={foto} alt="foto comanda" style={{ width:"100%", borderRadius:10, maxHeight:200, objectFit:"cover" }} />
              <button style={{ position:"absolute", top:8, right:8, background:C.danger, border:"none", color:"#fff", borderRadius:8, padding:"4px 10px", fontSize:12, cursor:"pointer" }}
                onClick={()=>setFoto(null)}>✕</button>
            </div>
          : <button style={{ ...S.btn("ghost"), background:C.card, border:`1px dashed ${C.border}`, color:C.muted, marginBottom:12 }}
              onClick={()=>fileRef.current.click()}>
              📷 Sacar foto de la comanda
            </button>
        }

        <button style={S.btn("primary",true)} onClick={salir} disabled={cargando}>
          {cargando ? "Registrando..." : "🛵 Salir a entregar"}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// DETALLE / CONFIRMAR ENTREGA
// ══════════════════════════════════════════
function DetalleEntrega({ rend, onVolver, onActualizar }) {
  const [medioPago, setMedioPago] = useState(null);
  const [fotoEntrega, setFotoEntrega] = useState(null);
  const [cargando, setCargando] = useState(false);
  const fileRef = useRef();

  const tiempoEntrega = rend.hora_salida && rend.hora_entrega
    ? minutos(rend.hora_salida, rend.hora_entrega)
    : null;

  const confirmarEntrega = async (pago) => {
    if (!pago) return alert("Seleccioná el medio de pago");
    setCargando(true);
    const ahora = new Date().toISOString();

    // GPS al entregar
    let gpsEntrega = null;
    if (navigator.geolocation) {
      await new Promise(res => navigator.geolocation.getCurrentPosition(
        pos => { gpsEntrega = { lat: pos.coords.latitude, lng: pos.coords.longitude }; res(); },
        () => res(), { timeout:5000 }
      ));
    }

    const update = {
      medio_pago: pago,
      estado: "entregado",
      hora_entrega: ahora,
      gps_entrega_lat: gpsEntrega?.lat || null,
      gps_entrega_lng: gpsEntrega?.lng || null,
      foto_entrega: fotoEntrega || null,
      whatsapp_enviado: false,
    };

    if (navigator.onLine) {
      await supabase.from("rendiciones_cadete").update(update).eq("id", rend.id);
    } else {
      // Actualizar offline
      const p = getPendientes();
      const idx = p.findIndex(x=>x.id===rend.id);
      if (idx>=0) p[idx] = {...p[idx], ...update};
      else p.push({...rend, ...update});
      setPendientes(p);
    }

    // WhatsApp al local
    const mins = tiempoEntrega || minutos(rend.hora_salida, ahora);
    const msg = `🛵 *Comanda #${rend.comanda} entregada*\n👤 Cadete: ${rend.nombre_cadete}\n💰 ${pago}: ${fmt(rend.monto)}${rend.cliente_nombre ? `\n📍 Cliente: ${rend.cliente_nombre}` : ""}${mins ? `\n⏱ Tiempo: ${mins} min` : ""}`;
    const waUrl = `https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");

    setCargando(false);
    onActualizar();
    onVolver();
  };

  if (rend.estado === "entregado") return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={{ background:"none", border:"none", color:C.muted, fontSize:14, cursor:"pointer" }} onClick={onVolver}>← Volver</button>
        <div style={{ fontWeight:800, color:C.accent }}>Comanda #{rend.comanda}</div>
        <div style={{ width:60 }} />
      </div>
      <div style={{ padding:16 }}>
        <div style={{ ...S.card, textAlign:"center" }}>
          <div style={{ fontSize:36, marginBottom:8 }}>✅</div>
          <div style={{ fontWeight:800, fontSize:16, color:C.success, marginBottom:4 }}>Entregada</div>
          <div style={{ fontSize:13, color:C.muted }}>{rend.medio_pago} · {fmt(rend.monto)}</div>
          {tiempoEntrega && <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>⏱ {tiempoEntrega} minutos</div>}
        </div>
        {rend.foto_salida && <img src={rend.foto_salida} alt="foto" style={{ width:"100%", borderRadius:10, marginBottom:12 }} />}
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <div style={S.header}>
        <button style={{ background:"none", border:"none", color:C.muted, fontSize:14, cursor:"pointer" }} onClick={onVolver}>← Volver</button>
        <div style={{ fontWeight:800, color:C.accent }}>Confirmar entrega</div>
        <div style={{ width:60 }} />
      </div>
      <div style={{ padding:16 }}>
        <div style={S.card}>
          <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>Comanda</div>
          <div style={{ fontSize:22, fontWeight:800, color:C.text, marginBottom:8 }}>#{rend.comanda}</div>
          {rend.cliente_nombre && <div style={{ fontSize:13, color:C.muted }}>👤 {rend.cliente_nombre}</div>}
          {rend.cliente_direccion && <div style={{ fontSize:13, color:C.muted }}>📍 {rend.cliente_direccion}</div>}
          <div style={{ fontSize:18, fontWeight:800, color:C.accent, marginTop:8 }}>{fmt(rend.monto)}</div>
          <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>Salida: {fmtHora(rend.hora_salida)}</div>
        </div>

        {rend.foto_salida && <img src={rend.foto_salida} alt="foto comanda" style={{ width:"100%", borderRadius:10, marginBottom:12 }} />}

        {/* Foto entrega opcional */}
        <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display:"none" }} onChange={e=>{
          const file=e.target.files[0]; if(!file) return;
          const r=new FileReader(); r.onload=ev=>setFotoEntrega(ev.target.result); r.readAsDataURL(file);
        }} />
        {fotoEntrega
          ? <div style={{ marginBottom:12, position:"relative" }}>
              <img src={fotoEntrega} alt="entrega" style={{ width:"100%", borderRadius:10, maxHeight:160, objectFit:"cover" }} />
              <button style={{ position:"absolute", top:8, right:8, background:C.danger, border:"none", color:"#fff", borderRadius:8, padding:"4px 10px", fontSize:12, cursor:"pointer" }}
                onClick={()=>setFotoEntrega(null)}>✕</button>
            </div>
          : <button style={{ ...S.btn("ghost"), background:C.card, border:`1px dashed ${C.border}`, color:C.muted, marginBottom:14 }}
              onClick={()=>fileRef.current.click()}>
              📷 Foto comprobante (opcional)
            </button>
        }

        <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:10 }}>¿Cómo pagó el cliente?</div>
        <button style={{ ...S.btn("success",true), marginBottom:10 }} onClick={()=>confirmarEntrega("Efectivo")} disabled={cargando}>
          💵 Efectivo
        </button>
        <button style={{ ...S.btn("info",true), background:"#1d4ed8" }} onClick={()=>confirmarEntrega("Transferencia")} disabled={cargando}>
          📱 Transferencia
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// APP ROOT
// ══════════════════════════════════════════
export default function App() {
  const [cadete, setCadete] = useState(() => getSession());
  const [turno, setTurno] = useState(null);

  const handleLogin = session => { setCadete(session); setTurno(null); };
  const handleFichado = turnoData => { setTurno(turnoData); };
  const handleCerrar = () => { clearSession(); setCadete(null); setTurno(null); };

  if (!cadete) return <LoginScreen onLogin={handleLogin} />;
  if (!turno) return <FichadaScreen cadete={cadete} onFichado={handleFichado} />;
  return <MainScreen cadete={cadete} turno={turno} onCerrar={handleCerrar} />;
}
