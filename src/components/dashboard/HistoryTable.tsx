'use client'

import { Clock, AlertTriangle } from 'lucide-react'

interface SensorData {
  id: string
  timestamp: string
  pressure: number
  flex: number
  device_id: string
}

interface HistoryTableProps {
  data: SensorData[]
}

export default function HistoryTable({ data }: HistoryTableProps) {
  const getCondition = (pressure: number, flex: number) => {
    if (pressure > 100 || flex > 80) {
      return { status: 'High', color: 'text-red-600 bg-red-50 dark:bg-red-900/20' }
    }
    if (pressure > 80 || flex > 70) {
      return { status: 'Warning', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' }
    }
    return { status: 'Normal', color: 'text-green-600 bg-green-50 dark:bg-green-900/20' }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="bg-card border rounded-lg shadow-sm">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold text-foreground">Recent History</h2>
        <p className="text-sm text-muted-foreground mt-1">Last {data.length} sensor readings</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Timestamp</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Pressure (kPa)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Flex (%)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Condition
              </th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const condition = getCondition(row.pressure, row.flex)
                return (
                  <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {formatTimestamp(row.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-medium ${
                        row.pressure > 100 ? 'text-red-600' : 
                        row.pressure > 80 ? 'text-yellow-600' : 
                        'text-foreground'
                      }`}>
                        {row.pressure.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-medium ${
                        row.flex > 80 ? 'text-red-600' : 
                        row.flex > 70 ? 'text-yellow-600' : 
                        'text-foreground'
                      }`}>
                        {row.flex.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${condition.color}`}>
                        {condition.status === 'High' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {condition.status}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
