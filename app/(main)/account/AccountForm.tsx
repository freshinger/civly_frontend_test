'use client'
import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { type User } from '@supabase/supabase-js'
import ProfilePicturePicker from './ProfilePicturePicker'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon, User as UserIcon, LogOut, Save } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export default function AccountForm({ user }: { user: User | null }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState<string | null>(null)
  const [surname, setSurname] = useState<string | null>(null)
  const [birthdate, setBirthdate] = useState<Date | undefined>(undefined)
  const [website, setWebsite] = useState<string | null>(null)
  const [avatar_url, setAvatarUrl] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [phone, setPhone] = useState<string | null>(null)
  const [location, setLocation] = useState<string | null>(null)
  const [summary, setSummary] = useState<string | null>(null)

  const getProfile = useCallback(async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase.functions.invoke(
        'restful-api/profile/' + user?.id,
        {
          method: 'GET',
        },
      )
      const { profile } = data
      if (error) {
        console.log(error)
        throw error
      }

      if (profile) {
        setName(profile.name)
        setSurname(profile.surname)
        setWebsite(profile.website)
        setBirthdate(profile.birthday)
        setEmail(profile.email)
        setPhone(profile.phone)
        setLocation(profile.location)
        setSummary(profile.summary)
        setAvatarUrl(profile.avatar_url)
      }
    } catch (error) {
      alert('Error loading user data!')
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    getProfile()
  }, [user, getProfile])

  async function updateProfile({
    name,
    surname,
    birthdate,
    email,
    phone,
    location,
    summary,
    website,
    avatar_url,
  }: {
    name: string | null
    surname: string | null
    birthdate: Date | undefined
    email: string | null
    phone: string | null
    location: string | null
    summary: string | null
    website: string | null
    avatar_url: string | null
  }) {
    try {
      setLoading(true)

      const { error } = await supabase.functions.invoke(
        'restful-api/profile/' + user?.id,
        {
          method: 'PUT',
          body: {
            profile: {
              id: user?.id as string,
              name,
              surname,
              birthday: birthdate ? birthdate.toISOString() : null,
              email,
              phone,
              location,
              summary,
              website,
              avatar_url,
              updated_at: new Date().toISOString(),
            },
          },
        },
      )
      if (error) throw error
      alert('Profile updated!')
    } catch (error) {
      console.log('Error updating profile:', error)
      alert('Error updating the data!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Account Settings
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage your account settings and profile information.
        </p>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Personal Information</CardTitle>
          <CardDescription>
            Update your personal details and contact information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture Section */}
          <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg border">
            <div className="flex flex-col items-center space-y-1">
              <ProfilePicturePicker
                uid={user?.id ?? null}
                url={avatar_url}
                size={80}
                onUpload={(url) => {
                  setAvatarUrl(url)
                  updateProfile({
                    name,
                    surname,
                    birthdate,
                    email,
                    phone,
                    location,
                    summary,
                    website,
                    avatar_url: url,
                  })
                }}
              />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground text-sm">
                Profile Picture
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Click to change • JPG, PNG, GIF • Max 5MB
              </p>
            </div>
          </div>

          {/* Username and Birthdate in same row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthdate" className="text-sm font-medium">
                Birthdate
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal focus-visible:ring-primary',
                      !birthdate && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {birthdate ? (
                      format(birthdate, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={birthdate}
                    captionLayout="dropdown"
                    onSelect={(date) => setBirthdate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Name and Surname in same row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                First Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name || ''}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your first name"
                className="focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="surname" className="text-sm font-medium">
                Last Name
              </Label>
              <Input
                id="surname"
                type="text"
                value={surname || ''}
                onChange={(e) => setSurname(e.target.value)}
                placeholder="Enter your last name"
                className="focus-visible:ring-primary"
              />
            </div>
          </div>

          {/* Email and Phone in same row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email || ''}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone || ''}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="focus-visible:ring-primary"
              />
            </div>
          </div>

          {/* Location and Website in same row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">
                Location
              </Label>
              <Input
                id="location"
                type="text"
                value={location || ''}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter your location"
                className="focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm font-medium">
                Website
              </Label>
              <Input
                id="website"
                type="url"
                value={website || ''}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="Enter your website URL"
                className="focus-visible:ring-primary"
              />
            </div>
          </div>

          {/* Summary - full width */}
          <div className="space-y-2">
            <Label htmlFor="summary" className="text-sm font-medium">
              Summary
            </Label>
            <Textarea
              id="summary"
              value={summary || ''}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Write a brief summary about yourself"
              rows={4}
              className="focus-visible:ring-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Button
          onClick={() =>
            updateProfile({
              name,
              surname,
              birthdate,
              email,
              phone,
              location,
              summary,
              website,
              avatar_url,
            })
          }
          disabled={loading}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90"
        >
          <Save className="h-4 w-4" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>

        <form action="/auth/signout" method="post">
          <Button
            variant="outline"
            type="submit"
            className="flex items-center gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  )
}
