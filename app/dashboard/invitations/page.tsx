// app/dashboard/invitations/page.tsx
import { createClient } from '@/lib/supabase/server'
import InvitationsClient from './InvitationsClient'
import { redirect } from 'next/navigation'

export default async function InvitationsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  // Get my sampana
  const { data: mySampana } = await supabase
    .from('sampana').select('*').eq('leader_id', user.id).single()

  if (profile?.role === 'leader' && !mySampana) {
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

  let invitations: any[] = []

  if (profile?.role === 'leader' && mySampana) {
    // Get all invitations involving my sampana
    const { data } = await supabase
      .from('invitations')
      .select(`
        *,
        inviter_sampana:sampana!inviter_sampana_id(*, church:churches(*)),
        invitee_sampana:sampana!invitee_sampana_id(*, church:churches(*))
      `)
      .or(`inviter_sampana_id.eq.${mySampana.id},invitee_sampana_id.eq.${mySampana.id}`)
      .order('created_at', { ascending: false })
    invitations = data ?? []
  } else {
    // Admin: see all
    const { data } = await supabase
      .from('invitations')
      .select(`
        *,
        inviter_sampana:sampana!inviter_sampana_id(*, church:churches(*)),
        invitee_sampana:sampana!invitee_sampana_id(*, church:churches(*))
      `)
      .order('created_at', { ascending: false })
    invitations = data ?? []
  }

  return (
    <InvitationsClient
      invitations={invitations}
      mySampanaId={mySampana?.id ?? null}
      role={profile?.role ?? 'leader'}
    />
  )
}
