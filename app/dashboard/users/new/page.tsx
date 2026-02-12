// app/dashboard/users/new/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewUserClient from './NewUserClient'

export default async function NewUserPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!['super_admin', 'church_admin'].includes(profile?.role ?? '')) redirect('/dashboard')

  let churchesQuery = supabase.from('churches').select('*').order('name')
  if (profile?.role === 'church_admin') {
    churchesQuery = churchesQuery.eq('id', profile.church_id!)
  }
  const { data: churches } = await churchesQuery

  return <NewUserClient churches={churches ?? []} callerRole={profile?.role ?? 'church_admin'} callerChurchId={profile?.church_id} />
}
