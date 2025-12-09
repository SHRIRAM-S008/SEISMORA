# Database Setup for Sensor Dashboard

## Quick Start with Mock Data

The dashboard is configured to use mock data by default, so you can see it working immediately without setting up the database.

## Setting Up Supabase Database

To use real data from your ESP32, you need to create the `sensor_data` table in your Supabase project.

### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the following SQL:

```sql
-- Create sensor_data table
CREATE TABLE IF NOT EXISTS sensor_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  pressure DECIMAL(10,2) NOT NULL,
  flex DECIMAL(10,2) NOT NULL,
  device_id VARCHAR(50) DEFAULT 'ESP32' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sensor_data_timestamp ON sensor_data(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_data_device_id ON sensor_data(device_id);

-- Enable Row Level Security
ALTER TABLE sensor_data ENABLE ROW LEVEL SECURITY;

-- Allow anonymous reads (for dashboard)
CREATE POLICY "Allow anonymous reads" ON sensor_data
  FOR SELECT USING (auth.role() = 'anon');

-- Allow anonymous inserts (for ESP32 data)
CREATE POLICY "Allow anonymous inserts" ON sensor_data
  FOR INSERT WITH CHECK (auth.role() = 'anon');

-- Grant permissions
GRANT SELECT ON sensor_data TO anon;
GRANT INSERT ON sensor_data TO anon;
```

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase migration new create_sensor_data_table
```

Then paste the SQL above into the generated migration file and run:

```bash
supabase db push
```

## ESP32 Data Format

Your ESP32 should send data in this format:

```json
{
  "pressure": 75.5,
  "flex": 45.2,
  "device_id": "ESP32"
}
```

## Testing the Connection

1. Toggle from "Mock Data" to "Live Supabase" in the dashboard
2. If no table exists, it will automatically fall back to mock data
3. Once the table is created, the dashboard will show real-time data

## Real-time Features

The dashboard uses Supabase Realtime for instant updates:
- New data appears immediately in charts and tables
- Device status updates based on last packet time
- Alerts trigger when thresholds are exceeded

## Data Thresholds

- **Pressure**: Warning at 80kPa, Critical at 100kPa
- **Flex**: Warning at 70%, Critical at 80%

These can be customized in the `MetricCard` component.
