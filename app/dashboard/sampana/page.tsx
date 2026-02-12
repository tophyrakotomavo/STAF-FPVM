// app/dashboard/sampana/page.tsx
import { createClient } from '@/lib/supabase/server'
import SampanaClient from './SampanaClient'
import { redirect } from 'next/navigation'

export default async function SampanaPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!['super_admin','church_admin'].includes(profile?.role ?? '')) redirect('/dashboard')

  // Get churches for dropdown
  let churchesQuery = supabase.from('churches').select('*').order('name')
  if (profile?.role === 'church_admin') {
    churchesQuery = churchesQuery.eq('id', profile.church_id!)
  }
  const { data: churches } = await churchesQuery

  // Get sampana
  let sampanaQuery = supabase.from('sampana')
    .select('*, church:churches(*), leader:profiles(*)')
    .order('name')
  if (profile?.role === 'church_admin') {
    sampanaQuery = sampanaQuery.eq('church_id', profile.church_id!)
  }
  const { data: sampana } = await sampanaQuery

  // Get leaders (profiles with role=leader not yet assigned)
  let leadersQuery = supabase.from('profiles').select('*').eq('role', 'leader')
  if (profile?.role === 'church_admin') {
    leadersQuery = leadersQuery.eq('church_id', profile.church_id!)
  }
  const { data: leaders } = await leadersQuery

  return <SampanaClient sampana={sampana ?? []} churches={churches ?? []} leaders={leaders ?? []} />
}
