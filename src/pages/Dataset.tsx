import { useState } from 'react'
import { useDuckDB } from '@/hooks/useDuckDB'
import type { Commit, SearchFilters } from '@/types/dataset'
import SearchBar from '@/components/dataset/SearchBar'
import CommitCard from '@/components/dataset/CommitCard'
import Pagination from '@/components/dataset/Pagination'

const INITIAL_FILTERS: SearchFilters = {
  keyword: '',
  startDate: '',
  endDate: '',
  version: '',
  component: '',
  patchType: '',
  fileName: ''
}

const PAGE_SIZE = 10

export default function Dataset() {
  const { connection, loading, error, isReady } = useDuckDB()
  const [filters, setFilters] = useState<SearchFilters>(INITIAL_FILTERS)
  const [commits, setCommits] = useState<Commit[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [searching, setSearching] = useState(false)

  const buildQuery = (countOnly = false, pageOverride?: number) => {
    const conditions: string[] = []
    
    // Keyword search
    if (filters.keyword.trim()) {
      const keyword = filters.keyword.trim().replace(/'/g, "''")
      conditions.push(`(commit_id LIKE '%${keyword}%' OR message LIKE '%${keyword}%')`)
    }

    // Date range
    if (filters.startDate) {
      conditions.push(`date >= '${filters.startDate}'`)
    }
    if (filters.endDate) {
      conditions.push(`date <= '${filters.endDate}'`)
    }

    // Version
    if (filters.version.trim()) {
      const version = filters.version.trim().replace(/'/g, "''")
      conditions.push(`version LIKE '%${version}%'`)
    }

    // Component
    if (filters.component) {
      conditions.push(`component = '${filters.component}'`)
    }

    // Patch type
    if (filters.patchType) {
      conditions.push(`patch_type = '${filters.patchType}'`)
    }

    // File name - requires JOIN with commit_file_diffs
    if (filters.fileName.trim()) {
      const fileName = filters.fileName.trim().replace(/'/g, "''")
      const fileQuery = countOnly
        ? `SELECT DISTINCT commit_id FROM commit_file_diffs WHERE file_path LIKE '%${fileName}%'`
        : `SELECT DISTINCT commit_id FROM commit_file_diffs WHERE file_path LIKE '%${fileName}%'`
      conditions.push(`commit_id IN (${fileQuery})`)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    if (countOnly) {
      return `SELECT COUNT(*) as total FROM commits ${whereClause}`
    }

    const activePage = pageOverride !== undefined ? pageOverride : currentPage
    const offset = (activePage - 1) * PAGE_SIZE
    return `
      SELECT * FROM commits
      ${whereClause}
      ORDER BY date DESC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `
  }

  const handleSearch = async () => {
    if (!connection) return

    setSearching(true)
    try {
      // Get total count
      const countResult = await connection.query(buildQuery(true))
      const countData = countResult.toArray()[0]
      // Convert BigInt to Number
      const total = typeof countData.total === 'bigint' 
        ? Number(countData.total) 
        : countData.total
      setTotalItems(total)

      // Get paginated results
      const result = await connection.query(buildQuery(false))
      const resultsArray = result.toArray().map(row => ({
        ...row,
        // Convert any BigInt fields to Number
        files_changed: typeof row.files_changed === 'bigint' ? Number(row.files_changed) : row.files_changed,
        insertions: typeof row.insertions === 'bigint' ? Number(row.insertions) : row.insertions,
        deletions: typeof row.deletions === 'bigint' ? Number(row.deletions) : row.deletions,
      }))
      setCommits(resultsArray as unknown as Commit[])
      setCurrentPage(1)
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setSearching(false)
    }
  }

  const handlePageChange = async (page: number) => {
    if (!connection) return

    if (searching) return // Prevent multiple simultaneous requests

    //  Prevent navigating to invalid pages
    const totalPages = Math.ceil(totalItems / PAGE_SIZE)
    if (page < 1 || page > totalPages) return

    setSearching(true)
    try {
      const result = await connection.query(buildQuery(false, page))
      const resultsArray = result.toArray().map(row => ({
        ...row,
        // Convert any BigInt fields to Number
        files_changed: typeof row.files_changed === 'bigint' ? Number(row.files_changed) : row.files_changed,
        insertions: typeof row.insertions === 'bigint' ? Number(row.insertions) : row.insertions,
        deletions: typeof row.deletions === 'bigint' ? Number(row.deletions) : row.deletions,
      }))
      setCommits(resultsArray as unknown as Commit[])
      setCurrentPage(page)

      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error('Pagination error:', err)
    } finally {
      setSearching(false)
    }
  }

  const handleClear = () => {
    setFilters(INITIAL_FILTERS)
    setCommits([])
    setTotalItems(0)
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="space-y-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Ext4 Filesystem Patch Set</h1>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900">Loading...</p>
            <p className="text-sm text-gray-600 mt-2">
              Initializing Ext4 Filesystem Patch Set Database
            </p>
            <p className="text-xs text-gray-500 mt-1">
              This usually takes 3-5 seconds
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Dataset</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">
            Error Loading Database
          </h2>
          <p className="text-red-700">{error}</p>
          <p className="text-sm text-red-600 mt-2">
            Please check the console for more details.
          </p>
        </div>
      </div>
    )
  }

  if (!isReady || !connection) {
    return (
      <div className="space-y-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Dataset</h1>
        <p className="text-gray-600">Database connection not available.</p>
      </div>
    )
  }

  const totalPages = Math.ceil(totalItems / PAGE_SIZE)

  return (
    <div className="space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ext4 Filesystem Patch Set</h1>
        <p className="text-gray-600 mt-2">
          Search and explore 20 years of Ext4 filesystem evolution history.
        </p>
      </div>

      {/* Search Bar */}
      <SearchBar
        filters={filters}
        onFilterChange={setFilters}
        onSearch={handleSearch}
        onClear={handleClear}
      />

      {/* Results */}
      {searching ? (
        <div className="flex justify-center py-12">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
        </div>
      ) : commits.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Search Results ({totalItems.toLocaleString()})
            </h2>
          </div>

          <div className="space-y-4">
            {commits.map((commit) => (
              <CommitCard key={commit.commit_id} commit={commit} connection={connection} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={PAGE_SIZE}
              totalItems={totalItems}
              onPageChange={handlePageChange}
            />
          )}
        </>
      ) : totalItems === 0 && commits.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No commits found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search filters or click "Search" to see all commits
          </p>
        </div>
      )}
    </div>
  )
}
