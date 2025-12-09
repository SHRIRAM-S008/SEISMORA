'use client'

import { Wifi, WifiOff, Clock, Package, Activity } from 'lucide-react'

interface DeviceStatusCardProps {
  status: 'online' | 'offline'
  lastPacketTime: string
}

export default function DeviceStatusCard({ status, lastPacketTime }: DeviceStatusCardProps) {
  const formatLastPacket = (timestamp: string) => {
    if (!timestamp) return 'Never'
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <div className="bg-card border rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Device Status</h2>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
          status === 'online' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {status === 'online' ? (
            <>
              <Wifi className="h-4 w-4" />
              Online
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              Offline
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Device ID</div>
            <div className="font-medium text-foreground">ESP32</div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Last Packet</div>
            <div className="font-medium text-foreground">
              {formatLastPacket(lastPacketTime)}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Connection</div>
            <div className={`font-medium capitalize ${
              status === 'online' ? 'text-green-600' : 'text-red-600'
            }`}>
              {status}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
