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
  
  for (let i = 0; i < count; i++) {
    const timestamp = new Date(now.getTime() - (count - i) * 2000) // 2 seconds apart
    
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
