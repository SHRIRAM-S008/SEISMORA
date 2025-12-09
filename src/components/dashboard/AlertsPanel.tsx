'use client'

import { AlertTriangle, X, WifiOff } from 'lucide-react'

interface Alert {
  id: number
  type: 'high-pressure' | 'high-flex' | 'connection-lost'
  message: string
  timestamp: string
}

interface AlertsPanelProps {
  alerts: Alert[]
}

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'high-pressure':
      case 'high-flex':
        return AlertTriangle
      case 'connection-lost':
        return WifiOff
      default:
        return AlertTriangle
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'high-pressure':
      case 'high-flex':
        return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
      case 'connection-lost':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <div className="bg-card border rounded-lg shadow-sm">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold text-foreground">Alerts</h2>
        <p className="text-sm text-muted-foreground mt-1">System notifications</p>
      </div>
      
      <div className="p-6">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              <AlertTriangle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-foreground">No alerts</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              All systems operating normally
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const Icon = getAlertIcon(alert.type)
              const colorClass = getAlertColor(alert.type)
              
              return (
                <div
                  key={alert.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${colorClass} transition-all duration-300`}
                >
                  <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {alert.message}
                    </p>
                    <p className="text-xs opacity-75 mt-1">
                      {formatTimestamp(alert.timestamp)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
