// app/dashboard/sampana/SampanaClient.tsx
"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Sampana, Church, Profile } from "@/lib/types";

const COLORS = [
  "#7C3AED",
  "#0891B2",
  "#059669",
  "#DC2626",
  "#D97706",
  "#DB2777",
  "#7C3AED",
  "#0284C7",
  "#65A30D",
];

interface Props {
  sampana: Sampana[];
  churches: Church[];
  leaders: Profile[];
}

export default function SampanaClient({
  sampana: init,
  churches,
  leaders,
}: Props) {
  const [sampana, setSampana] = useState<Sampana[]>(init);
  const [name, setName] = useState("");
  const [churchId, setChurchId] = useState(churches[0]?.id ?? "");
  const [leaderId, setLeaderId] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const add = async () => {
    if (!name.trim() || !churchId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("sampana")
      .insert({
        name: name.trim(),
        church_id: churchId,
        leader_id: leaderId || null,
        color,
        description: desc || null,
      })
      .select("*, church:churches(*), leader:profiles(*)")
      .single();
    if (!error && data) {
      setSampana((prev) => [...prev, data as any]);
      setName("");
      setDesc("");
      setLeaderId("");
    }
    setLoading(false);
  };

  const del = async (id: string) => {
    if (
      !confirm(
        "Hamafa ity sampana ity? Ny programa sy fanasana rehetra ho voafafa koa!",
      )
    )
      return;
    const { error } = await supabase.from("sampana").delete().eq("id", id);
    if (!error) setSampana((prev) => prev.filter((s) => s.id !== id));
  };

  const assignLeader = async (sampanaId: string, newLeaderId: string) => {
    const { data, error } = await supabase
      .from("sampana")
      .update({ leader_id: newLeaderId || null })
      .eq("id", sampanaId)
      .select("*, church:churches(*), leader:profiles(*)")
      .single();
    if (!error && data)
      setSampana((prev) =>
        prev.map((s) => (s.id === sampanaId ? (data as any) : s)),
      );
  };

  const groupedByChurch = churches
    .map((ch) => ({
      church: ch,
      items: sampana.filter((s) => s.church_id === ch.id),
    }))
    .filter((g) => g.items.length > 0 || churches.length === 1);

  return (
    <div className="animate-fade-in max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-brand-900 mb-1">
          👥 Sampana
        </h1>
        <p className="text-brand-400 text-sm">
          Hitantana ny sampana rehetra sy ny mpitarika azy
        </p>
      </div>

      {/* Add form */}
      <div className="bg-white rounded-2xl p-6 border border-brand-100 shadow-sm mb-6">
        <h2 className="font-display font-bold text-brand-800 text-base mb-4">
          ➕ Hanampy Sampana
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-brand-400 mb-1.5 tracking-wider">
              ANARANA *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ambohipo, Kanana..."
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-brand-400 mb-1.5 tracking-wider">
              FIANGONANA *
            </label>
            <select
              value={churchId}
              onChange={(e) => setChurchId(e.target.value)}
              className="input-base"
            >
              {churches.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-brand-400 mb-1.5 tracking-wider">
              LEADER (TENA RANA)
            </label>
            <select
              value={leaderId}
              onChange={(e) => setLeaderId(e.target.value)}
              className="input-base"
            >
              <option value="">— Tsy voatendry —</option>
              {leaders.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.full_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-brand-400 mb-1.5 tracking-wider">
              LOKO
            </label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${color === c ? "ring-2 ring-offset-2 ring-brand-500 scale-110" : "hover:scale-110"}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-bold text-brand-400 mb-1.5 tracking-wider">
            FAMARITANA
          </label>
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Antsipiriany momba ity sampana ity..."
            className="input-base"
          />
        </div>
        <button
          onClick={add}
          disabled={!name.trim() || !churchId || loading}
          className="btn-primary"
        >
          {loading ? "⏳..." : "✅ Hanampy"}
        </button>
      </div>

      {/* Grouped by church */}
      {groupedByChurch.map(({ church, items }) => (
        <div key={church.id} className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
              {church.name.charAt(0)}
            </div>
            <h2 className="font-display font-bold text-brand-700">
              {church.name}
            </h2>
            <span className="text-xs bg-brand-100 text-brand-600 rounded-full px-2.5 py-0.5 font-bold">
              {items.length}
            </span>
          </div>

          {items.length === 0 ? (
            <div className="text-brand-300 text-sm italic pl-11">
              Tsy misy sampana
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((s) => (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl border border-brand-100 shadow-sm p-5 flex items-center gap-4"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-base shadow"
                    style={{
                      background: `linear-gradient(135deg, ${s.color}dd, ${s.color}88)`,
                    }}
                  >
                    {s.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-display font-bold text-brand-900">
                      {s.name}
                    </div>
                    {s.description && (
                      <div className="text-brand-400 text-xs mt-0.5">
                        {s.description}
                      </div>
                    )}
                    <div className="text-xs text-brand-300 mt-0.5">
                      Leader:{" "}
                      {(s as any).leader?.full_name ?? "— Tsy voatendry —"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={(s as any).leader?.id ?? ""}
                      onChange={(e) => assignLeader(s.id, e.target.value)}
                      className="text-xs border border-brand-200 rounded-lg px-2 py-1.5 text-brand-700 bg-white outline-none focus:border-brand-400"
                    >
                      <option value="">— Tsy voatendry —</option>
                      {leaders.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.full_name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => del(s.id)}
                      className="p-2 rounded-xl border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
