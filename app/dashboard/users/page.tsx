// app/dashboard/users/page.tsx
import { createClient } from '@/lib/supabase/server'
import UsersClient from './UsersClient'
import { redirect } from 'next/navigation'

export default async function UsersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!['super_admin','church_admin'].includes(profile?.role ?? '')) redirect('/dashboard')

  let usersQuery = supabase.from('profiles').select('*, church:churches(*)').order('full_name')
  if (profile?.role === 'church_admin') {
    usersQuery = usersQuery.eq('church_id', profile.church_id!)
  }
  const { data: users } = await usersQuery

  let churchesQuery = supabase.from('churches').select('*').order('name')
  if (profile?.role === 'church_admin') {
    churchesQuery = churchesQuery.eq('id', profile.church_id!)
  }
  const { data: churches } = await churchesQuery

  return <UsersClient users={users ?? []} churches={churches ?? []} myRole={profile?.role ?? 'church_admin'} />
}
