"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BranchType } from "@/lib/types";

interface Props {
  branchTypes: BranchType[];
  usageCounts: Record<string, number>;
}

export default function BranchTypesClient({
  branchTypes: init,
  usageCounts: initialUsage,
}: Props) {
  const [branchTypes, setBranchTypes] = useState<BranchType[]>(init);
  const [usageCounts, setUsageCounts] = useState<Record<string, number>>(initialUsage);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const supabase = createClient();

  const add = async () => {
    if (!name.trim()) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("branch_type")
      .insert({
        name: name.trim(),
        description: description.trim() || null,
      })
      .select()
      .single();

    if (!error && data) {
      setBranchTypes((prev) => [...prev, data]);
      setName("");
      setDescription("");
    }

    setLoading(false);
  };

  const update = async (
    id: string,
    nextName: string,
    nextDescription: string,
  ) => {
    if (!nextName.trim()) return;

    const { data, error } = await supabase
      .from("branch_type")
      .update({
        name: nextName.trim(),
        description: nextDescription.trim() || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (!error && data) {
      setBranchTypes((prev) => prev.map((item) => (item.id === id ? data : item)));
      setEditId(null);
    }
  };

  const del = async (id: string) => {
    const linked = usageCounts[id] ?? 0;
    const warning =
      linked > 0
        ? `Hamafa ity karazana sampana ity? Misy sampana ${linked} mampiasa azy (ho lasa tsy voafaritra ny type).`
        : "Hamafa ity karazana sampana ity?";

    if (!confirm(warning)) return;

    const { error } = await supabase.from("branch_type").delete().eq("id", id);

    if (!error) {
      setBranchTypes((prev) => prev.filter((item) => item.id !== id));
      setUsageCounts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-brand-900 mb-1">
          🏷️ Karazana Sampana
        </h1>
        <p className="text-brand-400 text-sm">
          Hitantana ny branch type (type sampana) ho an'ny famoronana sampana
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-brand-100 shadow-sm mb-6">
        <h2 className="font-display font-bold text-brand-800 text-base mb-4">
          ➕ Hanampy Karazana Sampana
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-brand-400 mb-1.5 tracking-wider">
              ANARANA *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mpamakilay, Vehivavy..."
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-brand-400 mb-1.5 tracking-wider">
              FANAZAVANA
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Famaritana fohy"
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

      <div className="space-y-3">
        {branchTypes.map((item) => (
          <BranchTypeRow
            key={item.id}
            branchType={item}
            isEditing={editId === item.id}
            usageCount={usageCounts[item.id] ?? 0}
            onEdit={() => setEditId(item.id)}
            onSave={(nextName, nextDescription) =>
              update(item.id, nextName, nextDescription)
            }
            onCancel={() => setEditId(null)}
            onDelete={() => del(item.id)}
          />
        ))}

        {branchTypes.length === 0 && (
          <div className="text-sm text-brand-400 italic bg-white rounded-2xl p-5 border border-brand-100 shadow-sm">
            Tsy mbola misy karazana sampana voasoratra.
          </div>
        )}
      </div>
    </div>
  );
}

function BranchTypeRow({
  branchType,
  isEditing,
  usageCount,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}: {
  branchType: BranchType;
  isEditing: boolean;
  usageCount: number;
  onEdit: () => void;
  onSave: (nextName: string, nextDescription: string) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [nextName, setNextName] = useState(branchType.name);
  const [nextDescription, setNextDescription] = useState(
    branchType.description ?? "",
  );

  return (
    <div className="bg-white rounded-2xl border border-brand-100 shadow-sm p-5">
      {isEditing ? (
        <div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              value={nextName}
              onChange={(e) => setNextName(e.target.value)}
              className="input-base text-sm"
            />
            <input
              value={nextDescription}
              onChange={(e) => setNextDescription(e.target.value)}
              className="input-base text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onSave(nextName, nextDescription)}
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white font-display font-bold text-xl shadow-sm">
            {branchType.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-brand-900">
              {branchType.name}
            </div>
            <div className="text-brand-400 text-xs truncate">
              {branchType.description ?? "Tsy misy famaritana"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-brand-700 font-display">
              {usageCount}
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
