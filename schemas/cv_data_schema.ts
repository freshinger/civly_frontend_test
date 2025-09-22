import z from 'zod'
import { EducationItem, educationItemSchema } from './education_schema'
import { ExperienceItem, experienceItemSchema } from './experience_schema'
import { LayoutConfigs, layoutConfigsSchema } from './layout_schema'
import {
  PersonalInformation,
  personalInformationSchema,
} from './personal_information_schema'
import { SkillGroup, skillGroupSchema } from './skills_schema'

export const cvDataSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().min(1),
  userId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  visibility: z.enum(['draft', 'private', 'public']).optional(),
  password: z.string().optional(),
  // Subschemas
  layoutConfigs: layoutConfigsSchema,
  personalInformation: personalInformationSchema,
  experience: z.array(experienceItemSchema),
  education: z.array(educationItemSchema),
  skillGroups: z.array(skillGroupSchema),
})

export type CvData = z.infer<typeof cvDataSchema>

export const defaultCvData: CvData = {
  id: '',
  name: '',
  userId: '',
  createdAt: '',
  updatedAt: '',
  visibility: 'draft',
  password: '',
  // Subschemas
  layoutConfigs: {
    templateId: 1,
    colorId: 1,
    fontId: 1,
    fontSizeId: 11,
  } as LayoutConfigs,
  personalInformation: {
    name: '',
    surname: '',
    profileUrl: '',
    birthdate: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    xing: '',
    website: '',
    professionalTitle: '',
    summary: '',
  } as PersonalInformation,
  experience: [] as ExperienceItem[],
  education: [] as EducationItem[],
  skillGroups: [] as SkillGroup[],
}
