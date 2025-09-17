'use client'

import {
  IconDotsVertical,
  IconLogout,
  IconUserCircle,
} from '@tabler/icons-react'
import { useEffect, useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/use-auth'
import { useUserProfile } from '@/hooks/use-user-profile'
import { getDisplayName } from '@/services/user-profile.service'
import { generateInitials } from '@/utils/user-avatar'
import { createClient } from '@/utils/supabase/client'

export function NavUser() {
  const { isMobile } = useSidebar()
  const { signOut } = useAuth()
  const { profile, loading, user } = useUserProfile()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const supabase = createClient()

  // Get user display data from profile
  const userName = getDisplayName(profile)
  const userEmail = user?.email || ''

  // Download avatar image like ProfilePicturePicker does
  useEffect(() => {
    async function downloadImage(path: string) {
      try {
        const { data, error } = await supabase.storage
          .from('avatars')
          .download(path)

        if (error) {
          setAvatarUrl(null)
          return
        }

        const url = URL.createObjectURL(data)
        setAvatarUrl(url)
      } catch {
        setAvatarUrl(null)
      }
    }

    const avatarPath =
      profile?.avatar_url || user?.user_metadata?.avatar_url || ''

    if (avatarPath && !avatarPath.startsWith('http')) {
      // Only download if it's a storage path, not a full URL
      downloadImage(avatarPath)
    } else if (avatarPath.startsWith('http')) {
      // If it's already a full URL, use it directly
      setAvatarUrl(avatarPath)
    } else {
      setAvatarUrl(null)
    }
  }, [profile?.avatar_url, user?.user_metadata?.avatar_url, supabase])

  const userInitials = generateInitials(userName)

  // Show loading state while auth is loading
  if (loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="h-8 w-8 rounded-lg bg-gray-200 animate-pulse" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 rounded animate-pulse mt-1" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  // Show guest state when no user
  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback
                className="rounded-lg text-white font-semibold text-xs"
                style={{ backgroundColor: 'var(--primary-300)' }}
              >
                G
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Guest</span>
              <span className="text-muted-foreground truncate text-xs">
                Not signed in
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:!bg-primary/10"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={avatarUrl || ''} alt={userName} />
                <AvatarFallback
                  className="rounded-lg text-white font-semibold text-xs"
                  style={{ backgroundColor: 'var(--primary-300)' }}
                >
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userName}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {userEmail}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={avatarUrl || ''} alt={userName} />
                  <AvatarFallback
                    className="rounded-lg text-white font-semibold text-xs"
                    style={{ backgroundColor: 'var(--primary-300)' }}
                  >
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{userName}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {userEmail}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <a href="/account">
                <DropdownMenuItem className="hover:!bg-primary/10">
                  <IconUserCircle />
                  Account
                </DropdownMenuItem>
              </a>
            </DropdownMenuGroup>

            <DropdownMenuItem
              className="hover:!bg-primary/10 cursor-pointer"
              onClick={() => signOut()}
            >
              <IconLogout />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
