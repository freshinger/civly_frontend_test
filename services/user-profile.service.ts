import { createClient } from '@/utils/supabase/client'

export interface UserProfile {
  id: string
  name?: string
  surname?: string
  avatarUrl?: string
  email?: string
}

export async function fetchUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

export function getDisplayName(profile: UserProfile | null): string {
  if (!profile) return 'User'

  const firstName = profile.name || ''
  const lastName = profile.surname || ''
  const fullName = `${firstName} ${lastName}`.trim()

  return fullName || profile.email || 'User'
}
