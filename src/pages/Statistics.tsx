import { useEffect, useState } from 'react'
import { useDuckDB } from '@/hooks/useDuckDB'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  // Legend,
  ResponsiveContainer
} from 'recharts'

interface VersionData {
  version: string
  performance: number
  feature: number
  bug: number
  maintenance: number
  reliability: number
  total: number
}

// Color scheme matching the Python code
const PATCH_COLORS = {
  performance: '#2E86AB',
  feature: '#A23B72',
  bug: '#F18F01',
  maintenance: '#C73E1D',
  reliability: '#5D737E'
}

const PATCH_TYPE_ORDER = ['performance', 'feature', 'bug', 'maintenance', 'reliability']

export default function Statistics() {
  const { connection, loading, error, isReady } = useDuckDB()
  const [data, setData] = useState<VersionData[]>([])
  const [queryLoading, setQueryLoading] = useState(false)
  const [queryError, setQueryError] = useState<string | null>(null)

  useEffect(() => {
    if (!isReady || !connection) return

    async function fetchData() {
      setQueryLoading(true)
      setQueryError(null)

      try {
        console.log('[Statistics] Fetching commit data by version and patch type...')

        const query = `
          SELECT 
            version,
            patch_type,
            COUNT(*) as commit_count
          FROM commits
          WHERE 
            version IS NOT NULL 
            AND patch_type IS NOT NULL
            AND patch_type IN ('performance', 'feature', 'bug', 'maintenance', 'reliability')
          GROUP BY version, patch_type
          ORDER BY version
        `

        const result = await connection!.query(query)
        const rows = result.toArray()

        console.log(`[Statistics] Fetched ${rows.length} records`)

        // Transform data into chart format
        const versionMap = new Map<string, VersionData>()

        rows.forEach((row: any) => {
          const version = row.version
          const patchType = row.patch_type
          const count = typeof row.commit_count === 'bigint' 
            ? Number(row.commit_count) 
            : row.commit_count

          if (!versionMap.has(version)) {
            versionMap.set(version, {
              version,
              performance: 0,
              feature: 0,
              bug: 0,
              maintenance: 0,
              reliability: 0,
              total: 0
            })
          }

          const versionData = versionMap.get(version)!
          versionData[patchType as keyof Omit<VersionData, 'version' | 'total'>] = count
          versionData.total += count
        })

        // Sort versions
        const sortedData = Array.from(versionMap.values()).sort((a, b) => {
          return compareVersions(a.version, b.version)
        })

        console.log('[Statistics] Data processed:', sortedData.length, 'versions')
        setData(sortedData)

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data'
        console.error('[Statistics] Query error:', err)
        setQueryError(errorMessage)
      } finally {
        setQueryLoading(false)
      }
    }

    fetchData()
  }, [isReady, connection])

  // Version comparison function
  function compareVersions(a: string, b: string): number {
    const parseVersion = (v: string) => {
      const parts = v.split('.').map(p => parseInt(p) || 0)
      return {
        major: parts[0] || 0,
        minor: parts[1] || 0,
        patch: parts[2] || 0
      }
    }

    const vA = parseVersion(a)
    const vB = parseVersion(b)

    if (vA.major !== vB.major) return vA.major - vB.major
    if (vA.minor !== vB.minor) return vA.minor - vB.minor
    return vA.patch - vB.patch
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0)
      
      return (
        <div className="bg-white p-4 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">Version {label}</p>
          <div className="space-y-1">
            {payload.reverse().map((entry: any) => (
              <div key={entry.name} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm capitalize text-gray-700">{entry.name}:</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{entry.value}</span>
              </div>
            ))}
            <div className="border-t pt-1 mt-2 flex justify-between gap-4">
              <span className="text-sm font-semibold text-gray-900">Total:</span>
              <span className="text-sm font-semibold text-gray-900">{total}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  if (loading || !isReady) {
    return (
      <div className="space-y-6 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Ext4 Filesystem Evolution Statistics</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Initializing database...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Ext4 Filesystem Evolution Statistics</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Database Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ext4 Filesystem Evolution Statistics</h1>
        <p className="text-gray-600">
          Distribution of commits by patch type across Linux kernel versions (2006-2024)
        </p>
      </div>

      {queryLoading ? (
        <div className="flex items-center justify-center h-96 bg-white rounded-lg shadow">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading commit data...</p>
          </div>
        </div>
      ) : queryError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Query Error: {queryError}</p>
        </div>
      ) : data.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">No data available</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <ResponsiveContainer width="100%" height={450}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis
                dataKey="version"
                angle={-90}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12, fontFamily: 'Times New Roman' }}
                stroke="#374151"
                label={{ 
                  value: 'Linux Kernel Versions',
                  position: 'insideBottom', 
                  // offset: -70,
                  style: { fontSize: 16, fontWeight: 600, fontFamily: 'Times New Roman' }
                }}
              />
              <YAxis
                tick={{ fontSize: 14, fontFamily: 'Times New Roman' }}
                stroke="#374151"
                label={{ 
                  value: '# Commits', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fontSize: 16, fontWeight: 600, fontFamily: 'Times New Roman' }
                }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
              {/* <Legend
                wrapperStyle={{
                  paddingTop: '20px',
                  fontFamily: 'Times New Roman',
                  fontSize: '14px'
                }}
                iconType="rect"
                formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
              /> */}
              
              {PATCH_TYPE_ORDER.map((patchType) => (
                <Bar
                  key={patchType}
                  dataKey={patchType}
                  stackId="commits"
                  fill={PATCH_COLORS[patchType as keyof typeof PATCH_COLORS]}
                  stroke="#ffffff"
                  strokeWidth={0.5}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>

          <div className="pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {PATCH_TYPE_ORDER.map((patchType) => {
                const total = data.reduce((sum, version) => 
                  sum + version[patchType as keyof Omit<VersionData, 'version' | 'total'>], 0
                )
                return (
                  <div key={patchType} className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: PATCH_COLORS[patchType as keyof typeof PATCH_COLORS] }}
                      />
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {patchType}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{total.toLocaleString()}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
