import * as React from 'react'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    icon: React.ReactNode
    text: string
    type?: 'positive' | 'negative' | 'neutral'
  }
  className?: string
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: StatCardProps) {
  const getTrendColor = (type: string = 'neutral') => {
    switch (type) {
      case 'positive':
        return 'text-green-600'
      case 'negative':
        return 'text-red-600'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <Card className={`@container/card flex flex-col ${className || ''}`}>
      <CardHeader className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <CardDescription className="text-base font-medium">
            {title}
          </CardDescription>
          {icon && <div className="h-8 w-8 text-muted-foreground">{icon}</div>}
        </div>
        <CardTitle className="text-3xl font-bold tabular-nums text-primary">
          {value}
        </CardTitle>
      </CardHeader>
      <CardFooter className="pt-0 pb-2">
        {trend ? (
          <div className="flex items-center gap-1">
            <div className={`h-3 w-3 ${getTrendColor(trend.type)}`}>
              {trend.icon}
            </div>
            <span className="text-xs text-muted-foreground">{trend.text}</span>
          </div>
        ) : description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </CardFooter>
    </Card>
  )
}
