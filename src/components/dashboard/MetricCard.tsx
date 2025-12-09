'use client'

import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: number
  previousValue: number
  unit: string
  threshold: {
    warning: number
    critical: number
  }
}

export default function MetricCard({ title, value, previousValue, unit, threshold }: MetricCardProps) {
  const trend = value - previousValue
  const isIncreasing = trend > 0
  const trendPercentage = previousValue !== 0 ? ((trend / previousValue) * 100).toFixed(1) : '0'

  const getHealthStatus = () => {
    if (value >= threshold.critical) return { status: 'critical', icon: AlertTriangle, color: 'text-red-600' }
    if (value >= threshold.warning) return { status: 'warning', icon: AlertTriangle, color: 'text-yellow-600' }
    return { status: 'safe', icon: CheckCircle, color: 'text-green-600' }
  }

  const health = getHealthStatus()
  const HealthIcon = health.icon

  return (
    <div className="bg-card border rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <HealthIcon className={`h-4 w-4 ${health.color}`} />
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-foreground">
            {value.toFixed(1)}
          </span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>

        <div className="flex items-center space-x-2">
          {isIncreasing ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
          <span className={`text-sm font-medium ${
            isIncreasing ? 'text-green-600' : 'text-red-600'
          }`}>
            {isIncreasing ? '+' : ''}{trendPercentage}%
          </span>
          <span className="text-sm text-muted-foreground">vs previous</span>
        </div>

        <div className="pt-2 border-t">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Safe</span>
            <span>Warning</span>
            <span>Critical</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="flex h-2 rounded-full overflow-hidden">
              <div 
                className="bg-green-500"
                style={{ width: `${(threshold.warning / threshold.critical) * 100}%` }}
              />
              <div 
                className="bg-yellow-500"
                style={{ width: `${((threshold.critical - threshold.warning) / threshold.critical) * 100}%` }}
              />
              <div 
                className="bg-red-500"
                style={{ width: `${((Math.max(value, threshold.critical) - threshold.critical) / Math.max(value, threshold.critical)) * 100}%` }}
              />
            </div>
          </div>
          <div 
            className="h-1 bg-primary rounded-full mt-1 transition-all duration-300"
            style={{ width: `${Math.min((value / threshold.critical) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
