// app/dashboard/programme/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProgrammeClient from './ProgrammeClient'

export default async function ProgrammePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'leader') redirect('/dashboard')

  const { data: sampana } = await supabase.from('sampana').select('*').eq('leader_id', user.id).single()
  if (!sampana) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-5xl mb-4">🔗</div>
          <h2 className="font-display font-bold text-brand-800 text-xl mb-2">Tsy misy sampana voafaritra</h2>
          <p className="text-brand-400">Mifandraisa amin'ny admin fiangonana anao</p>
        </div>
      </div>
    )
  }

  const { data: events } = await supabase
    .from('programme_events')
    .select('*')
    .eq('sampana_id', sampana.id)
    .order('event_date', { ascending: true })

  return <ProgrammeClient sampana={sampana} events={events ?? []} />
}
