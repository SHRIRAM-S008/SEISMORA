"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import HeaderSection from "@/components/dashboard/HeaderSection"
import DeviceStatusCard from "@/components/dashboard/DeviceStatusCard"
import MetricCard from "@/components/dashboard/MetricCard"
import LiveChart from "@/components/dashboard/LiveChart"
import HistoryTable from "@/components/dashboard/HistoryTable"
import AlertsPanel from "@/components/dashboard/AlertsPanel"
import { getLatestData, getHistory, subscribeToRealtime } from "@/lib/supabaseClient"
import { generateMockData, generateMockDataPoint } from "@/lib/mockData"

interface SensorData {
  id: string
  timestamp: string
  pressure: number
  flex: number
  device_id: string
}

interface Alert {
  id: number
  type: 'high-pressure' | 'high-flex' | 'connection-lost'
  message: string
  timestamp: string
}

export default function SensorDashboard() {
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [deviceStatus, setDeviceStatus] = useState<"online" | "offline">("offline")
  const [currentPressure, setCurrentPressure] = useState<number>(0)
  const [currentFlex, setCurrentFlex] = useState<number>(0)
  const [previousPressure, setPreviousPressure] = useState<number>(0)
  const [previousFlex, setPreviousFlex] = useState<number>(0)
  const [graphData, setGraphData] = useState<Array<{time: string, pressure: number, flex: number}>>([])
  const [tableData, setTableData] = useState<SensorData[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [useMockData, setUseMockData] = useState(false) // Toggle for testing

  useEffect(() => {
    // Test getLatestData function
    getLatestData().then(res => console.log("TEST LATEST:", res))
    
    if (useMockData) {
      // Use mock data for testing
      const mockHistory = generateMockData(50)
      setTableData(mockHistory)
      
      const graphPoints = mockHistory.slice(-50).reverse().map((item: SensorData) => ({
        time: new Date(item.timestamp).toLocaleTimeString(),
        pressure: item.pressure,
        flex: item.flex
      }))
      setGraphData(graphPoints)
      
      // Simulate real-time updates with mock data
      const mockInterval = setInterval(() => {
        const newData = generateMockDataPoint()
        handleNewData(newData)
      }, 2000) // Every 2 seconds

      return () => clearInterval(mockInterval)
    }

    // Real Supabase connection
    const fetchInitialData = async () => {
      try {
        const latest = await getLatestData()
        if (latest) {
          handleNewData(latest)
        }

        const history = await getHistory(50)
        setTableData(history)
        
        const graphPoints = history.slice(-50).reverse().map((item: SensorData) => ({
          time: new Date(item.timestamp).toLocaleTimeString(),
          pressure: item.pressure,
          flex: item.flex
        }))
        setGraphData(graphPoints)
      } catch (error) {
        console.error("Error fetching initial data:", error)
      }
    }

    fetchInitialData()

    const subscription = subscribeToRealtime((newData: SensorData) => {
      handleNewData(newData)
    })

    const statusChecker = setInterval(() => {
      const timeSinceLastUpdate = lastUpdated ? Date.now() - new Date(lastUpdated).getTime() : Infinity
      setDeviceStatus(timeSinceLastUpdate < 10000 ? 'online' : 'offline')
    }, 2000)

    return () => {
      subscription?.unsubscribe()
      clearInterval(statusChecker)
    }
  }, [lastUpdated, useMockData])

  const handleNewData = (newData: SensorData) => {
    // Update last updated time
    setLastUpdated(newData.timestamp)

    // Update metrics with trend comparison
    setPreviousPressure(currentPressure)
    setPreviousFlex(currentFlex)
    setCurrentPressure(newData.pressure)
    setCurrentFlex(newData.flex)

    // Update graph data
    setGraphData(prev => {
      const newGraphData = [...prev, {
        time: new Date(newData.timestamp).toLocaleTimeString(),
        pressure: newData.pressure,
        flex: newData.flex
      }]
      // Keep only last 50 points
      return newGraphData.slice(-50)
    })

    // Update table data
    setTableData(prev => [newData, ...prev.slice(0, 49)])

    // Check for alerts
    checkAlerts(newData)
  }

  const checkAlerts = (data: SensorData) => {
    const newAlerts: Alert[] = []

    if (data.pressure > 100) {
      newAlerts.push({
        id: Date.now(),
        type: 'high-pressure',
        message: `High pressure detected: ${data.pressure.toFixed(1)}`,
        timestamp: data.timestamp
      })
    }

    if (data.flex > 80) {
      newAlerts.push({
        id: Date.now() + 1,
        type: 'high-flex',
        message: `High flex detected: ${data.flex.toFixed(1)}`,
        timestamp: data.timestamp
      })
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev.slice(0, 4)]) // Keep max 5 alerts
      
      // Auto-hide alerts after 5 seconds
      setTimeout(() => {
        setAlerts(prev => prev.filter(alert => !newAlerts.some(newAlert => newAlert.id === alert.id)))
      }, 5000)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-background p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          
          {/* Header */}
          <HeaderSection lastUpdated={lastUpdated} />

          {/* Device Status */}
          <DeviceStatusCard status={deviceStatus} lastPacketTime={lastUpdated} />

          {/* Metric Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Pressure"
              value={currentPressure}
              previousValue={previousPressure}
              unit="kPa"
              threshold={{ warning: 80, critical: 100 }}
            />
            <MetricCard
              title="Flex"
              value={currentFlex}
              previousValue={previousFlex}
              unit="%"
              threshold={{ warning: 70, critical: 80 }}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Live Chart */}
            <div className="lg:col-span-2">
              <LiveChart data={graphData} />
            </div>

            {/* Alerts Panel */}
            <div className="lg:col-span-1">
              <AlertsPanel alerts={alerts} />
            </div>
          </div>

          {/* History Table */}
          <HistoryTable data={tableData} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
