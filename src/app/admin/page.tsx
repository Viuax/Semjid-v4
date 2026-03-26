"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabaseAdmin } from "@/lib/supabase";
import { formatMNT } from "@/lib/data";
import {
  Calendar, TrendingUp, Clock, CheckCircle, XCircle,
  ArrowUpRight, MessageSquare, Send, Loader2, Settings,
  Upload, Save,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Booking = {
  id: string; ref: string; fname: string; lname: string; phone: string;
  check_in: string; check_out: string; room_id: string;
  total: number; status: string; created_at: string;
};
type Message = {
  id: string; session_id: string; sender: string;
  sender_name: string; message: string; created_at: string;
};
type Room = {
  id: string; name_mn: string; name_en: string;
  adult1: number | null; adult2: number | null; child02: number;
  img: string; total_rooms: number;
};
type Service = {
  id: string; name_mn: string; name_en: string;
  price: number; duration: string;
};

export default function AdminDashboard() {
  const [bookings, setBookings]           = useState<Booking[]>([]);
  const [loading, setLoading]             = useState(true);
  const [activeTab, setActiveTab]         = useState<"dashboard" | "chat" | "settings">("dashboard");

  // Chat state
  const [sessions, setSessions]           = useState<string[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [messages, setMessages]           = useState<Message[]>([]);
  const [reply, setReply]                 = useState("");
  const [sending, setSending]             = useState(false);
  const [unread, setUnread]               = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Settings state
  const [rooms, setRooms]                 = useState<Room[]>([]);
  const [services, setServices]           = useState<Service[]>([]);
  const [savingId, setSavingId]           = useState<string | null>(null);
  const [uploadingId, setUploadingId]     = useState<string | null>(null);
  const [savedId, setSavedId]             = useState<string | null>(null);

  // ── Load bookings ─────────────────────────────────────────
  const load = useCallback(async () => {
    const { data } = await supabaseAdmin
      .from("bookings").select("*").order("created_at", { ascending: false });
    setBookings(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    await supabaseAdmin.from("bookings").update({ status }).eq("id", id);
    load();
  };

  // ── Load settings ─────────────────────────────────────────
  const loadSettings = useCallback(async () => {
    const [{ data: r }, { data: s }] = await Promise.all([
      supabaseAdmin.from("rooms").select("*").order("id"),
      supabaseAdmin.from("services").select("*").order("id"),
    ]);
    setRooms(r || []);
    setServices(s || []);
  }, []);

  useEffect(() => {
    if (activeTab === "settings") loadSettings();
  }, [activeTab, loadSettings]);

  // ── Save room price ───────────────────────────────────────
  const saveRoom = async (room: Room) => {
    setSavingId(room.id);
    await supabaseAdmin.from("rooms").update({
      adult1: room.adult1,
      adult2: room.adult2,
      child02: room.child02,
      updated_at: new Date().toISOString(),
    }).eq("id", room.id);
    setSavingId(null);
    setSavedId(room.id);
    setTimeout(() => setSavedId(null), 2000);
  };

  // ── Save service price ────────────────────────────────────
  const saveService = async (svc: Service) => {
    setSavingId(svc.id);
    await supabaseAdmin.from("services").update({
      price: svc.price,
      updated_at: new Date().toISOString(),
    }).eq("id", svc.id);
    setSavingId(null);
    setSavedId(svc.id);
    setTimeout(() => setSavedId(null), 2000);
  };

  // ── Upload room image ─────────────────────────────────────
  const uploadImage = async (roomId: string, file: File) => {
    setUploadingId(roomId);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res  = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await supabaseAdmin.from("rooms").update({ img: data.url }).eq("id", roomId);
      setRooms(prev => prev.map(r => r.id === roomId ? { ...r, img: data.url } : r));
    } catch (err) {
      console.error("upload error:", err);
    }
    setUploadingId(null);
  };

  // ── Chat ──────────────────────────────────────────────────
  const loadSessions = useCallback(async () => {
    const { data } = await supabaseAdmin
      .from("chat_messages")
      .select("session_id, sender, created_at")
      .order("created_at", { ascending: false });
    if (!data) return;
    const unique = [...new Set(data.map(d => d.session_id))];
    setSessions(unique);
    setUnread(new Set(data.filter(m => m.sender === "client").map(m => m.session_id)).size);
  }, []);

  const loadMessages = useCallback(async (sid: string) => {
    const { data } = await supabaseAdmin
      .from("chat_messages").select("*")
      .eq("session_id", sid).order("created_at", { ascending: true });
    setMessages(data || []);
  }, []);

  useEffect(() => {
    if (activeTab !== "chat") return;
    loadSessions();
    const iv = setInterval(loadSessions, 5000);
    return () => clearInterval(iv);
  }, [activeTab, loadSessions]);

  useEffect(() => {
    if (!activeSession) return;
    loadMessages(activeSession);
    const iv = setInterval(() => loadMessages(activeSession), 3000);
    return () => clearInterval(iv);
  }, [activeSession, loadMessages]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendReply = async () => {
    if (!reply.trim() || !activeSession || sending) return;
    setSending(true);
    await supabaseAdmin.from("chat_messages").insert({
      session_id: activeSession, sender: "admin",
      sender_name: "Ажилтан", message: reply.trim(),
    });
    setReply("");
    await loadMessages(activeSession);
    setSending(false);
  };

  // ── Derived values ────────────────────────────────────────
  const confirmed = bookings.filter(b => b.status === "confirmed");
  const pending   = bookings.filter(b => b.status === "pending");
  const cancelled = bookings.filter(b => b.status === "cancelled");
  const revenue   = confirmed.reduce((s, b) => s + (b.total || 0), 0);
  const monthlyRevenue = Array(12).fill(0);
  confirmed.forEach(b => { const m = new Date(b.created_at).getMonth(); monthlyRevenue[m] += b.total || 0; });
  const maxRev = Math.max(...monthlyRevenue, 1);
  const roomCount: Record<string, number> = {};
  bookings.forEach(b => { if (b.room_id) roomCount[b.room_id] = (roomCount[b.room_id] || 0) + 1; });
  const topRooms = Object.entries(roomCount).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const statusBadge = (s: string) => s === "confirmed" ? "bg-emerald-100 text-emerald-700" : s === "cancelled" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700";
  const statusLabel = (s: string) => s === "confirmed" ? "Баталгаажсан" : s === "cancelled" ? "Цуцлагдсан" : "Хүлээгдэж буй";

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="space-y-8">

      {/* Tab switcher */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Хяналтын самбар</h1>
          <p className="text-[13px] text-slate-400 mt-1">
            {new Date().toLocaleDateString("mn-MN", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          {([
            { id: "dashboard", label: "Самбар",    icon: null },
            { id: "chat",      label: "Чат",       icon: <MessageSquare size={14}/> },
            { id: "settings",  label: "Тохиргоо",  icon: <Settings size={14}/> },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`relative px-4 py-2 rounded-xl text-[13px] font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === t.id ? "bg-teal text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {t.icon}
              {t.label}
              {t.id === "chat" && unread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center">{unread}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── SETTINGS TAB ──────────────────────────────────── */}
      {activeTab === "settings" && (
        <div className="space-y-8">

          {/* Room prices */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Өрөөний үнэ & Зураг</h2>
              <p className="text-[12px] text-slate-400 mt-1">Үнэ солиод "Хадгалах" дарна уу. Зураг оруулахад автоматаар хадгалагдана.</p>
            </div>
            <div className="divide-y divide-slate-50">
              {rooms.map(room => (
                <div key={room.id} className="px-6 py-5 flex items-start gap-6">
                  {/* Image */}
                  <div className="shrink-0">
                    <div className="w-24 h-20 rounded-xl overflow-hidden bg-slate-100 relative">
                      {room.img
                        ? <Image src={room.img} alt={room.name_mn} fill className="object-cover"/>
                        : <div className="w-full h-full flex items-center justify-center text-slate-300 text-[10px]">Зураг байхгүй</div>
                      }
                    </div>
                    <label className={`mt-2 flex items-center justify-center gap-1 text-[11px] cursor-pointer px-3 py-1.5 rounded-lg transition-colors ${uploadingId === room.id ? "bg-slate-100 text-slate-400" : "bg-teal/10 text-teal hover:bg-teal/20"}`}>
                      {uploadingId === room.id
                        ? <><Loader2 size={11} className="animate-spin"/> Байршуулж байна</>
                        : <><Upload size={11}/> Зураг солих</>
                      }
                      <input
                        type="file" accept="image/*" className="hidden"
                        disabled={uploadingId === room.id}
                        onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(room.id, f); }}
                      />
                    </label>
                  </div>

                  {/* Price fields */}
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 mb-3">{room.name_mn}</p>
                    <div className="grid grid-cols-3 gap-3">
                      {room.adult1 !== null && (
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">1 хүн (₮)</label>
                          <input
                            type="number"
                            value={room.adult1 ?? ""}
                            onChange={e => setRooms(prev => prev.map(r => r.id === room.id ? { ...r, adult1: parseInt(e.target.value) || 0 } : r))}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-teal"
                          />
                        </div>
                      )}
                      {room.adult2 !== null && (
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">2 хүн (₮)</label>
                          <input
                            type="number"
                            value={room.adult2 ?? ""}
                            onChange={e => setRooms(prev => prev.map(r => r.id === room.id ? { ...r, adult2: parseInt(e.target.value) || 0 } : r))}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-teal"
                          />
                        </div>
                      )}
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Хүүхэд (₮)</label>
                        <input
                          type="number"
                          value={room.child02}
                          onChange={e => setRooms(prev => prev.map(r => r.id === room.id ? { ...r, child02: parseInt(e.target.value) || 0 } : r))}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-teal"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save button */}
                  <button
                    onClick={() => saveRoom(room)}
                    disabled={savingId === room.id}
                    className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-colors cursor-pointer ${
                      savedId === room.id
                        ? "bg-emerald-500 text-white"
                        : "bg-teal text-white hover:bg-teal-dark disabled:opacity-50"
                    }`}
                  >
                    {savingId === room.id
                      ? <Loader2 size={14} className="animate-spin"/>
                      : savedId === room.id
                        ? <><CheckCircle size={14}/> Хадгалсан</>
                        : <><Save size={14}/> Хадгалах</>
                    }
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Service prices */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Эмчилгээний үнэ</h2>
              <p className="text-[12px] text-slate-400 mt-1">Үнэ солиод "Хадгалах" дарна уу.</p>
            </div>
            <div className="divide-y divide-slate-50">
              {services.map(svc => (
                <div key={svc.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 text-[14px]">{svc.name_mn}</p>
                    <p className="text-[11px] text-slate-400">{svc.duration}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={svc.price}
                      onChange={e => setServices(prev => prev.map(s => s.id === svc.id ? { ...s, price: parseInt(e.target.value) || 0 } : s))}
                      className="w-32 border border-slate-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-teal text-right"
                    />
                    <span className="text-[12px] text-slate-400">₮</span>
                  </div>
                  <button
                    onClick={() => saveService(svc)}
                    disabled={savingId === svc.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-colors cursor-pointer ${
                      savedId === svc.id
                        ? "bg-emerald-500 text-white"
                        : "bg-teal text-white hover:bg-teal-dark disabled:opacity-50"
                    }`}
                  >
                    {savingId === svc.id
                      ? <Loader2 size={14} className="animate-spin"/>
                      : savedId === svc.id
                        ? <><CheckCircle size={14}/> Хадгалсан</>
                        : <><Save size={14}/> Хадгалах</>
                    }
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CHAT TAB ──────────────────────────────────────── */}
      {activeTab === "chat" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" style={{ height: "600px" }}>
          <div className="flex h-full">
            <div className="w-64 border-r border-slate-100 flex flex-col">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Сессионууд ({sessions.length})</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {sessions.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare size={24} className="mx-auto text-slate-200 mb-2"/>
                    <p className="text-[12px] text-slate-300">Чат байхгүй</p>
                  </div>
                )}
                {sessions.map(sid => (
                  <button key={sid} onClick={() => setActiveSession(sid)}
                    className={`w-full text-left px-4 py-3 border-b border-slate-50 transition-colors cursor-pointer ${activeSession === sid ? "bg-teal/5 border-l-2 border-l-teal" : "hover:bg-slate-50"}`}>
                    <p className="text-[12px] font-medium text-slate-700 truncate">{sid.slice(0, 20)}...</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Сессион</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              {!activeSession ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare size={32} className="mx-auto text-slate-200 mb-3"/>
                    <p className="text-[13px] text-slate-400">Сессион сонгоно уу</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-[13px] font-semibold text-slate-700 truncate">{activeSession}</p>
                    <span className="text-[10px] text-slate-400">{messages.length} мессеж</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    {messages.map(m => (
                      <div key={m.id} className={`flex flex-col ${m.sender === "client" ? "items-end" : "items-start"}`}>
                        <span className="text-[10px] text-slate-400 mb-0.5">{m.sender === "client" ? "Зочин" : "Ажилтан"}</span>
                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-[13px] ${m.sender === "client" ? "bg-slate-100 text-slate-700 rounded-tr-sm" : "bg-teal text-white rounded-tl-sm"}`}>
                          {m.message}
                        </div>
                        <span className="text-[9px] text-slate-300 mt-0.5">
                          {new Date(m.created_at).toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    ))}
                    <div ref={bottomRef}/>
                  </div>
                  <div className="p-4 border-t border-slate-100 flex gap-2">
                    <input value={reply} onChange={e => setReply(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendReply()}
                      placeholder="Хариу бичнэ үү..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-teal transition-colors"/>
                    <button onClick={sendReply} disabled={sending || !reply.trim()}
                      className="bg-teal hover:bg-teal-dark text-white px-4 py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2">
                      {sending ? <Loader2 size={15} className="animate-spin"/> : <Send size={15}/>}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── DASHBOARD TAB ─────────────────────────────────── */}
      {activeTab === "dashboard" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label:"Нийт захиалга", value:bookings.length,    icon:Calendar,    light:"bg-blue-50",    text:"text-blue-600"    },
              { label:"Хүлээгдэж буй", value:pending.length,     icon:Clock,       light:"bg-amber-50",   text:"text-amber-600"   },
              { label:"Баталгаажсан",  value:confirmed.length,   icon:CheckCircle, light:"bg-emerald-50", text:"text-emerald-600" },
              { label:"Нийт орлого",   value:formatMNT(revenue), icon:TrendingUp,  light:"bg-teal/10",    text:"text-teal"        },
            ].map(({ label, value, icon:Icon, light, text }) => (
              <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <div className={`w-10 h-10 ${light} rounded-xl flex items-center justify-center mb-4`}><Icon size={19} className={text}/></div>
                <div className={`text-2xl font-bold ${text} mb-1`}>{value}</div>
                <div className="text-[12px] text-slate-400">{label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div><h2 className="font-semibold text-slate-800">Сарын орлого</h2><p className="text-[12px] text-slate-400 mt-0.5">Баталгаажсан захиалгаар</p></div>
                <div className="text-right"><div className="text-xl font-bold text-teal">{formatMNT(revenue)}</div><div className="text-[11px] text-slate-400">Нийт орлого</div></div>
              </div>
              <div className="flex items-end gap-1.5 h-40">
                {monthlyRevenue.map((rev, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full" style={{ height:"140px", display:"flex", alignItems:"flex-end" }}>
                      <div className="w-full bg-teal/10 hover:bg-teal transition-colors rounded-t-lg cursor-default"
                        style={{ height:`${Math.max((rev/maxRev)*140, rev>0?6:2)}px` }} title={formatMNT(rev)}/>
                    </div>
                    <span className="text-[8px] text-slate-400">{i+1}р</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="font-semibold text-slate-800 mb-1">Өрөөний эрэлт</h2>
              <p className="text-[12px] text-slate-400 mb-5">Нийт захиалгаар</p>
              {topRooms.length === 0
                ? <p className="text-[13px] text-slate-300 text-center py-8">Өгөгдөл байхгүй</p>
                : topRooms.map(([room, count]) => {
                    const pct = Math.round((count / Math.max(bookings.length,1)) * 100);
                    return (
                      <div key={room} className="mb-4">
                        <div className="flex justify-between mb-1.5"><span className="text-[12px] font-medium text-slate-600 capitalize">{room}</span><span className="text-[12px] text-teal font-semibold">{count}</span></div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-teal rounded-full" style={{ width:`${pct}%` }}/></div>
                      </div>
                    );
                  })
              }
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label:"Баталгаажсан", count:confirmed.length, icon:CheckCircle, color:"text-emerald-500", bg:"bg-emerald-50" },
              { label:"Хүлээгдэж буй", count:pending.length,  icon:Clock,       color:"text-amber-500",  bg:"bg-amber-50"   },
              { label:"Цуцлагдсан",   count:cancelled.length, icon:XCircle,     color:"text-red-500",    bg:"bg-red-50"     },
            ].map(({ label, count, icon:Icon, color, bg }) => (
              <div key={label} className={`${bg} rounded-2xl p-5 flex items-center gap-4`}>
                <Icon size={28} className={color}/>
                <div><div className="text-2xl font-bold text-slate-800">{count}</div><div className="text-[12px] text-slate-500">{label}</div></div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">Сүүлийн захиалгууд</h2>
              <Link href="/admin/guests" className="text-[12px] text-teal flex items-center gap-1 no-underline hover:underline">Бүгдийг харах <ArrowUpRight size={13}/></Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-slate-50 text-left">
                  {["Дугаар","Зочин","Утас","Өрөө","Ирэх","Явах","Дүн","Статус","Үйлдэл"].map(h => (
                    <th key={h} className="px-4 py-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {bookings.slice(0,10).map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-[12px] font-mono text-teal whitespace-nowrap">{b.ref}</td>
                      <td className="px-4 py-3 text-[13px] font-medium text-slate-700 whitespace-nowrap">{b.fname} {b.lname}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-500">{b.phone}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-500 capitalize">{b.room_id}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-500 whitespace-nowrap">{b.check_in}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-500 whitespace-nowrap">{b.check_out}</td>
                      <td className="px-4 py-3 text-[12px] font-semibold text-slate-700 whitespace-nowrap">{formatMNT(b.total||0)}</td>
                      <td className="px-4 py-3"><span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${statusBadge(b.status)}`}>{statusLabel(b.status)}</span></td>
                      <td className="px-4 py-3"><div className="flex gap-1.5">
                        {b.status!=="confirmed"&&<button onClick={()=>updateStatus(b.id,"confirmed")} className="text-[11px] bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap">✓ Батлах</button>}
                        {b.status!=="cancelled"&&<button onClick={()=>updateStatus(b.id,"cancelled")} className="text-[11px] bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap">✕ Цуцлах</button>}
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length===0&&<div className="text-center py-16 text-slate-400"><Calendar size={32} className="mx-auto mb-3 opacity-30"/><p className="text-[13px]">Захиалга байхгүй байна</p></div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
