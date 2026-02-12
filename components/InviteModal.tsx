// components/InviteModal.tsx
"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Sampana } from "@/lib/types";

interface Props {
  inviterSampanaId: string;
  targetSampana: Sampana;
  date: string;
  onClose: () => void;
}

const MOIS_SHORT = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "May",
  "Jôn",
  "Jôl",
  "Aog",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export default function InviteModal({
  inviterSampanaId,
  targetSampana,
  date,
  onClose,
}: Props) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const fmt = (d: string) => {
    const [, m, day] = d.split("-");
    return `${parseInt(day)} ${MOIS_SHORT[parseInt(m) - 1]} ${new Date().getFullYear()}`;
  };

  const handleSend = async () => {
    setLoading(true);
    setError("");
    // Check for existing invitation
    const { data: existing } = await supabase
      .from("invitations")
      .select("id")
      .eq("inviter_sampana_id", inviterSampanaId)
      .eq("invitee_sampana_id", targetSampana.id)
      .eq("event_date", date)
      .single();

    if (existing) {
      setError(
        "Efa nisy fanasana nalefa ho ity sampana ity amin'ity daty ity!",
      );
      setLoading(false);
      return;
    }

    const { error: err } = await supabase.from("invitations").insert({
      inviter_sampana_id: inviterSampanaId,
      invitee_sampana_id: targetSampana.id,
      event_date: date,
      message: message || null,
      status: "pending",
    });
    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(46,16,101,0.7)", backdropFilter: "blur(6px)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up overflow-hidden">
        {/* Header */}
        <div
          className="p-6 border-b border-brand-100"
          style={{
            background: `linear-gradient(135deg, ${targetSampana.color}15, ${targetSampana.color}05)`,
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black shadow"
              style={{
                background: `linear-gradient(135deg, ${targetSampana.color}dd, ${targetSampana.color}88)`,
              }}
            >
              {targetSampana.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-display font-bold text-brand-900 text-lg">
                {targetSampana.name}
              </div>
              <div className="text-brand-400 text-xs">
                {targetSampana.church?.name}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-brand-600 font-medium text-sm">
            <span>📅</span>
            <span>{fmt(date)}</span>
          </div>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="font-display font-bold text-brand-900 text-xl mb-2">
              Nalefa ny fanasana!
            </h3>
            <p className="text-brand-400 text-sm mb-6">
              Miandry ny valin'ny leader an'i {targetSampana.name}
            </p>
            <button onClick={onClose} className="btn-primary px-8">
              Tsara
            </button>
          </div>
        ) : (
          <div className="p-6">
            <h3 className="font-display font-bold text-brand-900 text-lg mb-4">
              📨 Hanasa Sampana
            </h3>
            <div className="mb-4">
              <label className="block text-xs font-bold text-brand-400 mb-2 tracking-wider">
                HAFATRA (TENA RANA)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Midira eto ny antony na antsipiriany momba ny fanasana..."
                rows={3}
                className="input-base resize-none"
              />
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                ⚠️ {error}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={onClose} className="btn-ghost flex-1">
                Ajanona
              </button>
              <button
                onClick={handleSend}
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? "⏳ Miandry..." : "📤 Halefa"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
