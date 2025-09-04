import {
  IconTrendingUp,
  IconEye,
  IconCalendar,
  IconTrophy,
} from '@tabler/icons-react'

import { StatCard } from '@/components/custom/stat-card'

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-3">
      <StatCard
        title="Total Views"
        value={152}
        description="All-time views"
        icon={<IconEye className="h-8 w-8" />}
      />

      <StatCard
        title="Views (7 days)"
        value={23}
        icon={<IconCalendar className="h-8 w-8" />}
        trend={{
          icon: <IconTrendingUp className="h-3 w-3" />,
          text: '+20% from last month',
          type: 'positive',
        }}
      />

      <StatCard
        title="Resume Most Viewed"
        value="Marketing Manager Zalando"
        description="12 views last week"
        icon={<IconTrophy className="h-8 w-8" />}
        className="[&_.text-3xl]:text-lg [&_.text-3xl]:leading-tight [&_.text-3xl]:line-clamp-2"
      />
    </div>
  )
}
