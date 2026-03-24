// app/dashboard/sampana/SampanaClient.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Sampana, Church, Profile, BranchType } from "@/lib/types";

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
  branchTypes: BranchType[];
}

interface SampanaUpdatePayload {
  name: string;
  church_id: string;
  branch_type_id: string | null;
  leader_id: string | null;
  color: string;
  description: string | null;
}

export default function SampanaClient({
  sampana: init,
  churches,
  leaders,
  branchTypes,
}: Props) {
  const [sampana, setSampana] = useState<Sampana[]>(init);
  const [name, setName] = useState("");
  const [churchId, setChurchId] = useState(churches[0]?.id ?? "");
  const [leaderId, setLeaderId] = useState("");
  const [branchTypeId, setBranchTypeId] = useState(branchTypes[0]?.id ?? "");
  const [color, setColor] = useState(COLORS[0]);
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const supabase = createClient();

  const add = async () => {
    if (
      name.trim().length === 0 ||
      churchId.length === 0 ||
      branchTypeId.length === 0
    ) {
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("sampana")
      .insert({
        name: name.trim(),
        church_id: churchId,
        leader_id: leaderId || null,
        branch_type_id: branchTypeId || null,
        color,
        description: desc || null,
      })
      .select("*, church:churches(*), leader:profiles(*), branch_type:branch_type(*)")
      .single();

    if (error == null && data) {
      setSampana((prev) => [...prev, data as Sampana]);
      setName("");
      setDesc("");
      setLeaderId("");
      setBranchTypeId(branchTypes[0]?.id ?? "");
    }

    setLoading(false);
  };

  const update = async (id: string, payload: SampanaUpdatePayload) => {
    if (
      payload.name.trim().length === 0 ||
      payload.church_id.length === 0 ||
      (payload.branch_type_id ?? "").length === 0
    ) {
      return;
    }

    setSavingId(id);
    const { data, error } = await supabase
      .from("sampana")
      .update({
        name: payload.name.trim(),
        church_id: payload.church_id,
        branch_type_id: payload.branch_type_id,
        leader_id: payload.leader_id,
        color: payload.color,
        description: payload.description,
      })
      .eq("id", id)
      .select("*, church:churches(*), leader:profiles(*), branch_type:branch_type(*)")
      .single();

    if (error == null && data) {
      setSampana((prev) => prev.map((s) => (s.id === id ? (data as Sampana) : s)));
      setEditId(null);
    }

    setSavingId(null);
  };

  const del = async (id: string) => {
    const shouldDelete = confirm(
      "Hamafa ity sampana ity? Ny programa sy fanasana rehetra ho voafafa koa!",
    );
    if (shouldDelete === false) {
      return;
    }

    const { error } = await supabase.from("sampana").delete().eq("id", id);
    if (error == null) {
      setSampana((prev) => prev.filter((s) => s.id !== id));
      if (editId === id) setEditId(null);
    }
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
          Hitantana sy hanova ny sampana rehetra sy ny mpitarika azy
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-brand-100 shadow-sm mb-6">
        <h2 className="font-display font-bold text-brand-800 text-base mb-4">
          ➕ Hanampy Sampana
        </h2>

        {branchTypes.length === 0 && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Tsy mbola misy karazana sampana. Mamorona aloha ao amin'ny{" "}
            <a href="/dashboard/branch-types" className="underline font-semibold">
              Branch Types
            </a>
            .
          </div>
        )}

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
              KARAZANA *
            </label>
            <select
              value={branchTypeId}
              onChange={(e) => setBranchTypeId(e.target.value)}
              className="input-base"
            >
              {branchTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
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
                  className={`w-7 h-7 rounded-full transition-all ${
                    color === c
                      ? "ring-2 ring-offset-2 ring-brand-500 scale-110"
                      : "hover:scale-110"
                  }`}
                  style={{ background: c }}
                  type="button"
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
          disabled={
            name.trim().length === 0 ||
            churchId.length === 0 ||
            branchTypeId.length === 0 ||
            loading
          }
          className="btn-primary"
        >
          {loading ? "⏳..." : "✅ Hanampy"}
        </button>
      </div>

      {groupedByChurch.map(({ church, items }) => (
        <div key={church.id} className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
              {church.name.charAt(0)}
            </div>
            <h2 className="font-display font-bold text-brand-700">{church.name}</h2>
            <span className="text-xs bg-brand-100 text-brand-600 rounded-full px-2.5 py-0.5 font-bold">
              {items.length}
            </span>
          </div>

          {items.length === 0 ? (
            <div className="text-brand-300 text-sm italic pl-11">Tsy misy sampana</div>
          ) : (
            <div className="space-y-3">
              {items.map((s) => (
                <SampanaRow
                  key={s.id}
                  sampana={s}
                  churches={churches}
                  leaders={leaders}
                  branchTypes={branchTypes}
                  isEditing={editId === s.id}
                  isSaving={savingId === s.id}
                  onEdit={() => setEditId(s.id)}
                  onCancel={() => setEditId(null)}
                  onSave={(payload) => update(s.id, payload)}
                  onDelete={() => del(s.id)}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SampanaRow({
  sampana,
  churches,
  leaders,
  branchTypes,
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onSave,
  onDelete,
}: {
  sampana: Sampana;
  churches: Church[];
  leaders: Profile[];
  branchTypes: BranchType[];
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (payload: SampanaUpdatePayload) => void;
  onDelete: () => void;
}) {
  const [nextName, setNextName] = useState(sampana.name);
  const [nextChurchId, setNextChurchId] = useState(sampana.church_id);
  const [nextBranchTypeId, setNextBranchTypeId] = useState(
    sampana.branch_type_id ?? branchTypes[0]?.id ?? "",
  );
  const [nextLeaderId, setNextLeaderId] = useState(sampana.leader_id ?? "");
  const [nextColor, setNextColor] = useState(sampana.color);
  const [nextDescription, setNextDescription] = useState(sampana.description ?? "");

  const handleSave = () => {
    onSave({
      name: nextName,
      church_id: nextChurchId,
      branch_type_id: nextBranchTypeId || null,
      leader_id: nextLeaderId || null,
      color: nextColor,
      description: nextDescription.trim() || null,
    });
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl border border-brand-100 shadow-sm p-5">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            value={nextName}
            onChange={(e) => setNextName(e.target.value)}
            className="input-base text-sm"
            placeholder="Anaran'ny sampana"
          />
          <select
            value={nextChurchId}
            onChange={(e) => setNextChurchId(e.target.value)}
            className="input-base text-sm"
          >
            {churches.map((church) => (
              <option key={church.id} value={church.id}>
                {church.name}
              </option>
            ))}
          </select>
          <select
            value={nextBranchTypeId}
            onChange={(e) => setNextBranchTypeId(e.target.value)}
            className="input-base text-sm"
          >
            {branchTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          <select
            value={nextLeaderId}
            onChange={(e) => setNextLeaderId(e.target.value)}
            className="input-base text-sm"
          >
            <option value="">— Tsy voatendry —</option>
            {leaders.map((leader) => (
              <option key={leader.id} value={leader.id}>
                {leader.full_name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="block text-[11px] font-bold text-brand-400 mb-1 tracking-wider">
            LOKO
          </label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setNextColor(c)}
                className={`w-7 h-7 rounded-full transition-all ${
                  nextColor === c
                    ? "ring-2 ring-offset-2 ring-brand-500 scale-110"
                    : "hover:scale-110"
                }`}
                style={{ background: c }}
                type="button"
              />
            ))}
          </div>
        </div>

        <input
          value={nextDescription}
          onChange={(e) => setNextDescription(e.target.value)}
          className="input-base text-sm mb-3"
          placeholder="Famaritana"
        />

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={
              isSaving ||
              nextName.trim().length === 0 ||
              nextChurchId.length === 0 ||
              nextBranchTypeId.length === 0
            }
            className="btn-primary text-xs"
          >
            {isSaving ? "⏳..." : "💾 Hitahiry"}
          </button>
          <button onClick={onCancel} disabled={isSaving} className="btn-ghost text-xs">
            Ajanona
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-brand-100 shadow-sm p-5 flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-base shadow"
        style={{
          background: `linear-gradient(135deg, ${sampana.color}dd, ${sampana.color}88)`,
        }}
      >
        {sampana.name.substring(0, 2).toUpperCase()}
      </div>
      <div className="flex-1">
        <div className="font-display font-bold text-brand-900">{sampana.name}</div>
        {sampana.description && (
          <div className="text-brand-400 text-xs mt-0.5">{sampana.description}</div>
        )}
        <div className="text-xs text-brand-300 mt-0.5">
          Karazana: {sampana.branch_type?.name ?? "— Tsy voafaritra —"}
        </div>
        <div className="text-xs text-brand-300 mt-0.5">
          Leader: {sampana.leader?.full_name ?? "— Tsy voatendry —"}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onEdit} className="btn-ghost text-xs">
          ✏️ Hanova
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-xl border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors text-sm"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
