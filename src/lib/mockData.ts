export interface SensorData {
  id: string
  timestamp: string
  pressure: number
  flex: number
  device_id: string
}

// Generate mock sensor data for testing
export function generateMockData(count: number = 50): SensorData[] {
  const data: SensorData[] = []
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  
  const yesterdayCount = Math.min(7, count)

  for (let i = 0; i < count; i++) {
    let timestamp: Date

    if (i < yesterdayCount) {
      // Spread 7 readings across yesterday
      const hoursOffset = Math.floor((24 / yesterdayCount) * i)
      timestamp = new Date(yesterday)
      timestamp.setHours(0 + hoursOffset, 0, 0, 0)
    } else {
      // Remaining readings are from today
      const indexToday = i - yesterdayCount
      const todayCount = count - yesterdayCount
      const minutesOffset = Math.floor((24 * 60 / Math.max(todayCount, 1)) * indexToday)
      timestamp = new Date(now)
      timestamp.setHours(0, 0, 0, 0)
      timestamp = new Date(timestamp.getTime() + minutesOffset * 60 * 1000)
    }

    data.push({
      id: `mock-${i}`,
      timestamp: timestamp.toISOString(),
      pressure: 50 + Math.random() * 80 + Math.sin(i * 0.1) * 20, // 30-130 range with some variation
      flex: 20 + Math.random() * 60 + Math.cos(i * 0.15) * 15, // 5-80 range with some variation
      device_id: 'ESP32'
    })
  }
  
  return data
}

// Generate single mock data point
export function generateMockDataPoint(): SensorData {
  return {
    id: `mock-${Date.now()}`,
    timestamp: new Date().toISOString(),
    pressure: 50 + Math.random() * 80 + Math.random() * 20,
    flex: 20 + Math.random() * 60 + Math.random() * 15,
    device_id: 'ESP32'
  }
}
