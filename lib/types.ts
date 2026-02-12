// lib/types.ts

export type UserRole = 'super_admin' | 'church_admin' | 'leader'
export type InvitationStatus = 'pending' | 'accepted' | 'refused'

export interface Church {
  id: string
  name: string
  city: string | null
  logo_url: string | null
  created_at: string
}

export interface Profile {
  id: string
  full_name: string
  email: string
  role: UserRole
  church_id: string | null
  created_at: string
  church?: Church
}

export interface Sampana {
  id: string
  name: string
  church_id: string
  leader_id: string | null
  color: string
  description: string | null
  created_at: string
  church?: Church
  leader?: Profile
  _event_count?: number
}

export interface ProgrammeEvent {
  id: string
  sampana_id: string
  event_date: string
  title: string | null
  description: string | null
  created_at: string
  sampana?: Sampana
}

export interface Invitation {
  id: string
  inviter_sampana_id: string
  invitee_sampana_id: string
  event_date: string
  message: string | null
  status: InvitationStatus
  responded_at: string | null
  response_note: string | null
  created_at: string
  inviter_sampana?: Sampana
  invitee_sampana?: Sampana
}
