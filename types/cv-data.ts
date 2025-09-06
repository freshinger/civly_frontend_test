export interface CVData {
  id: string
  last_modified: Date
  created_at: Date
  user_id: string
  visibility: 'draft' | 'private' | 'public'
  password?: string
  layout_configs: LayoutConfigs
  personalInformation: PersonalInformation
  experience: ExperienceItem[]
  education: EducationItem[]
  skillGroups: SkillGroup[]
}

export interface LayoutConfigs {
  template_id: number
  color_id: number
  font_size: number
}

export interface PersonalInformation {
  name: string
  surname: string
  profile_url: string
  birthdate: string
  email?: string
  phone?: string
  location?: string
  linkedin?: string
  xing?: string
  website?: string
  professionalTitle?: string
  summary?: string
}

export interface ExperienceItem {
  role: string
  company: string
  startDate: Date
  currentlyWorkingHere: boolean
  endDate?: Date
  location?: string
  description?: string
}

export interface EducationItem {
  degree: string
  institution: string
  startDate: Date
  currentlyStudyingHere: boolean
  endDate?: Date
  location?: string
  description?: string
}

export interface SkillGroup {
  name: string
  order?: number
  skills: Skill[]
}

export interface Skill {
  order: number
  name: string
}
