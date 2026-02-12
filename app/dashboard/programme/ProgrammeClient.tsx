// app/dashboard/programme/ProgrammeClient.tsx
'use client'
import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sampana, ProgrammeEvent } from '@/lib/types'

const MOIS = ['Janoary','Febroary','Martsa','Aprily','Mey','Jona','Jolay','Aogositra','Septambra','Oktobra','Novambra','Desambra']
const MOIS_SHORT = ['Jan','Fév','Mar','Avr','May','Jôn','Jôl','Aog','Sep','Okt','Nov','Des']

interface Props { sampana: Sampana; events: ProgrammeEvent[] }

export default function ProgrammeClient({ sampana, events: initialEvents }: Props) {
  const [events, setEvents] = useState<ProgrammeEvent[]>(initialEvents)
  const [newDate, setNewDate] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeMonth, setActiveMonth] = useState<number | null>(null)
  const supabase = createClient()

  const eventsByMonth = useMemo(() => {
    const m: Record<number, ProgrammeEvent[]> = {}
    events.forEach(e => {
      const month = new Date(e.event_date).getMonth()
      if (!m[month]) m[month] = []
      m[month].push(e)
    })
    return m
  }, [events])

  const addEvent = async () => {
    if (!newDate) return
    setLoading(true)
    const { data, error } = await supabase
      .from('programme_events')
      .insert({ sampana_id: sampana.id, event_date: newDate, title: newTitle || null, description: newDesc || null })
      .select().single()
    if (!error && data) {
      setEvents(prev => [...prev, data].sort((a,b) => a.event_date.localeCompare(b.event_date)))
      setNewDate(''); setNewTitle(''); setNewDesc('')
    }
    setLoading(false)
  }

  const removeEvent = async (id: string) => {
    const { error } = await supabase.from('programme_events').delete().eq('id', id)
    if (!error) setEvents(prev => prev.filter(e => e.id !== id))
  }

  const fmt = (d: string) => {
    const date = new Date(d + 'T00:00:00')
    return `${date.getDate()} ${MOIS_SHORT[date.getMonth()]}`
  }

  return (
    <div className="animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg"
          style={{ background: `linear-gradient(135deg, ${sampana.color}dd, ${sampana.color}88)` }}>
          {sampana.name.substring(0,2).toUpperCase()}
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-900">{sampana.name}</h1>
          <p className="text-brand-400 text-sm">{events.length} fotoana voasoratra amin'ny 2026</p>
        </div>
      </div>

      {/* Add event form */}
      <div className="bg-white rounded-2xl p-6 border border-brand-100 shadow-sm mb-6">
        <h2 className="font-display font-bold text-brand-800 text-base mb-4">➕ Hanampy fotoana vaovao</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-brand-400 mb-1.5 tracking-wider">DATY *</label>
            <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
              min="2026-01-01" max="2026-12-31"
              className="input-base" />
          </div>
          <div>
            <label className="block text-xs font-bold text-brand-400 mb-1.5 tracking-wider">TITLE (TENA RANA)</label>
            <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)}
              placeholder="Fanasana lehibe, Fivoriana..." className="input-base" />
          </div>
          <div>
            <label className="block text-xs font-bold text-brand-400 mb-1.5 tracking-wider">FAMARITANA</label>
            <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)}
              placeholder="Antsipiriany fanampiny..." className="input-base" />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={addEvent} disabled={!newDate || loading} className="btn-primary">
            {loading ? '⏳ Miandry...' : '✅ Hanampy'}
          </button>
        </div>
      </div>

      {/* Year overview */}
      <div className="bg-white rounded-2xl p-6 border border-brand-100 shadow-sm">
        <h2 className="font-display font-bold text-brand-800 text-base mb-5">📅 Fandaharam-potoana 2026</h2>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-6">
          {MOIS_SHORT.map((m, idx) => {
            const count = eventsByMonth[idx]?.length ?? 0
            return (
              <button key={idx}
                onClick={() => setActiveMonth(activeMonth === idx ? null : idx)}
                className={`p-3 rounded-xl text-left transition-all duration-150 border-2 ${
                  activeMonth === idx
                    ? 'border-brand-500 bg-brand-50'
                    : count > 0
                    ? 'border-brand-200 hover:border-brand-300 bg-white'
                    : 'border-gray-100 bg-gray-50'
                }`}>
                <div className={`text-xs font-bold tracking-wider ${activeMonth === idx ? 'text-brand-700' : count > 0 ? 'text-brand-500' : 'text-gray-300'}`}>{m}</div>
                {count > 0
                  ? <div className="text-lg font-bold mt-1" style={{ color: sampana.color }}>{count}</div>
                  : <div className="text-xs text-gray-300 mt-1">—</div>}
              </button>
            )
          })}
        </div>

        {/* Expanded month */}
        {activeMonth !== null && (
          <div className="animate-slide-up border-t border-brand-100 pt-5">
            <h3 className="font-bold text-brand-700 mb-3">{MOIS[activeMonth]}</h3>
            {(eventsByMonth[activeMonth] ?? []).length === 0 ? (
              <p className="text-brand-300 text-sm italic">Tsy misy programa amin'ity volana ity</p>
            ) : (
              <div className="space-y-2">
                {(eventsByMonth[activeMonth] ?? []).map(ev => (
                  <div key={ev.id} className="flex items-center gap-3 p-3 rounded-xl border"
                    style={{ borderColor: sampana.color + '33', background: sampana.color + '0a' }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ background: sampana.color }}>
                      {new Date(ev.event_date + 'T00:00:00').getDate()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-brand-800 text-sm">{fmt(ev.event_date)}</div>
                      {ev.title && <div className="text-brand-500 text-xs truncate">{ev.title}</div>}
                    </div>
                    <button onClick={() => removeEvent(ev.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg
                        text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors text-base font-bold">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeMonth === null && events.length === 0 && (
          <div className="text-center py-8 text-brand-300">
            <div className="text-4xl mb-3">📋</div>
            <div className="font-medium">Tsindrio ny volana iray mba hijery ny programa</div>
          </div>
        )}
      </div>
    </div>
  )
}
