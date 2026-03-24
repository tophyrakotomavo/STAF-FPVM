// app/dashboard/churches/ChurchesClient.tsx
"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Church } from "@/lib/types";

interface Props {
  churches: Church[];
  sampanaCounts: Record<string, number>;
}

export default function ChurchesClient({
  churches: init,
  sampanaCounts,
}: Props) {
  const [churches, setChurches] = useState<Church[]>(init);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const supabase = createClient();

  const add = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("churches")
      .insert({ name: name.trim(), city: city.trim() || null })
      .select()
      .single();
    if (!error && data) {
      setChurches((prev) => [...prev, data]);
      setName("");
      setCity("");
    }
    setLoading(false);
  };

  const update = async (id: string, newName: string, newCity: string) => {
    const { data, error } = await supabase
      .from("churches")
      .update({ name: newName, city: newCity || null })
      .eq("id", id)
      .select()
      .single();
    if (!error && data)
      setChurches((prev) => prev.map((c) => (c.id === id ? data : c)));
    setEditId(null);
  };

  const del = async (id: string) => {
    if (
      !confirm(
        "Hamafa ity fiangonana ity? Hamafa ny sampana rehetra ao aminy koa!",
      )
    )
      return;
    const { error } = await supabase.from("churches").delete().eq("id", id);
    if (!error) setChurches((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-brand-900 mb-1">
          🏛️ Fiangonana
        </h1>
        <p className="text-brand-400 text-sm">
          Hitantana ny fiangonana rehetra ao amin'ny app
        </p>
      </div>

      {/* Add form */}
      <div className="bg-white rounded-2xl p-6 border border-brand-100 shadow-sm mb-6">
        <h2 className="font-display font-bold text-brand-800 text-base mb-4">
          ➕ Hanampy Fiangonana
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-brand-400 mb-1.5 tracking-wider">
              ANARANA *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="FJKM Antananarivo..."
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-brand-400 mb-1.5 tracking-wider">
              TANÀNA
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Antananarivo..."
              className="input-base"
            />
          </div>
        </div>
        <button
          onClick={add}
          disabled={!name.trim() || loading}
          className="btn-primary"
        >
          {loading ? "⏳..." : "✅ Hanampy"}
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {churches.map((ch) => (
          <ChurchRow
            key={ch.id}
            church={ch}
            sampanaCount={sampanaCounts[ch.id] ?? 0}
            isEditing={editId === ch.id}
            onEdit={() => setEditId(ch.id)}
            onSave={(n, c) => update(ch.id, n, c)}
            onCancel={() => setEditId(null)}
            onDelete={() => del(ch.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ChurchRow({
  church,
  sampanaCount,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}: {
  church: Church;
  sampanaCount: number;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (n: string, c: string) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [n, setN] = useState(church.name);
  const [c, setC] = useState(church.city ?? "");

  return (
    <div className="bg-white rounded-2xl border border-brand-100 shadow-sm p-5">
      {isEditing ? (
        <div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              value={n}
              onChange={(e) => setN(e.target.value)}
              className="input-base text-sm"
            />
            <input
              value={c}
              onChange={(e) => setC(e.target.value)}
              className="input-base text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onSave(n, c)}
              className="btn-primary text-xs"
            >
              💾 Hitahiry
            </button>
            <button onClick={onCancel} className="btn-ghost text-xs">
              Ajanona
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800
            flex items-center justify-center text-white font-display font-bold text-xl shadow-sm"
          >
            {church.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="font-display font-bold text-brand-900">
              {church.name}
            </div>
            <div className="text-brand-400 text-xs">
              {church.city ?? "Tanàna tsy voafaritra"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-brand-700 font-display">
              {sampanaCount}
            </div>
            <div className="text-xs text-brand-400">sampana</div>
          </div>
          <div className="flex gap-2">
            <button onClick={onEdit} className="btn-ghost text-xs">
              ✏️ Hanova
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-xs font-semibold transition-colors"
            >
              🗑️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
