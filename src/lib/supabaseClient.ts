import { supabase } from './supabase'

export interface SensorData {
  id: string
  timestamp: string
  pressure: number
  flex: number
  device_id: string
}

// Helper to map DB row (with created_at) into SensorData shape expected by the UI
function normalizeRow(row: any): SensorData {
  return {
    id: row.id,
    pressure: row.pressure,
    flex: row.flex,
    device_id: row.device_id,
    // Prefer explicit timestamp column if present, otherwise fall back to created_at
    timestamp: row.timestamp ?? row.created_at,
  }
}

export async function getLatestData(): Promise<SensorData | null> {
  try {
    const { data, error } = await supabase
      .from('sensor_data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Error fetching latest data:', error)
      return null
    }

    const row = data?.[0]
    return row ? normalizeRow(row) : null
  } catch (error) {
    console.error('Unexpected error:', error)
    return null
  }
}

export async function getHistory(limit: number = 50): Promise<SensorData[]> {
  try {
    const { data, error } = await supabase
      .from('sensor_data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching history:', error)
      return []
    }

    if (!data) return []
    return data.map(normalizeRow)
  } catch (error) {
    console.error('Unexpected error:', error)
    return []
  }
}

export function subscribeToRealtime(callback: (data: SensorData) => void) {
  const channel = supabase
    .channel('sensor-data-realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'sensor_data' },
      (payload) => {
        const row = (payload as any).new
        callback(normalizeRow(row))
      }
    )
    .subscribe()

  return channel
}

export async function insertSensorData(data: Omit<SensorData, 'id' | 'timestamp'>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('sensor_data')
      .insert({
        ...data,
        // If your table has a created_at default, this is optional.
        // Keeping timestamp here for compatibility if the column exists.
        timestamp: new Date().toISOString(),
      })

    if (error) {
      console.error('Error inserting sensor data:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Unexpected error:', error)
    return false
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('sensor_data')
      .select('id')
      .limit(1)

    if (error) {
      if ((error as any).code === 'PGRST116') {
        // Table doesn't exist, but connection works
        return true
      }
      console.error('Connection test failed:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Connection test failed:', error)
    return false
  }
}
