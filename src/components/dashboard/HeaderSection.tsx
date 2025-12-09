'use client'

import { Activity } from 'lucide-react'

interface HeaderSectionProps {
  lastUpdated: string
}

export default function HeaderSection({ lastUpdated }: HeaderSectionProps) {
  const formatLastUpdated = (timestamp: string) => {
    if (!timestamp) return 'No data received'
    
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    
    if (diffSecs < 60) return `${diffSecs} seconds ago`
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)} minutes ago`
    return date.toLocaleTimeString()
  }

  return (
    <div className="bg-card border rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Real-Time Sensor Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitoring live data from Pfluna & FFS sensors
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Last Update</div>
          <div className="text-lg font-medium text-foreground">
            {formatLastUpdated(lastUpdated)}
          </div>
        </div>
      </div>
    </div>
  )
}
