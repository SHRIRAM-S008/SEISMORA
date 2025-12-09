'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface LiveChartProps {
  data: Array<{
    time: string
    pressure: number
    flex: number
  }>
}

export default function LiveChart({ data }: LiveChartProps) {
  return (
    <div className="bg-card border rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground mb-4">Real-Time Sensor Data</h2>
      
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Waiting for data...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPressure" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorFlex" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              yAxisId="left" 
              orientation="left" 
              stroke="#8884d8"
              domain={[0, 200]}
              tick={{ fontSize: 12 }}
              label={{ value: 'Pressure (kPa)', angle: -90, position: 'insideLeft' }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="#82ca9d"
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              label={{ value: 'Flex (%)', angle: 90, position: 'insideRight' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="pressure"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorPressure)"
              name="Pressure (kPa)"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="flex"
              stroke="#82ca9d"
              fillOpacity={1}
              fill="url(#colorFlex)"
              name="Flex (%)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
      
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing last {data.length} data points</span>
        <span>Real-time updates</span>
      </div>
    </div>
  )
}
