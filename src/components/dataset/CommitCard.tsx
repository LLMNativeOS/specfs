import { useState } from 'react'
import type { Commit, FileDiff } from '@/types/dataset'
import Tag from './Tag'
import DiffViewer from './DiffViewer'
import * as duckdb from '@duckdb/duckdb-wasm'
import { Calendar, FileText, GitCommit, Minus, Plus, User } from 'lucide-react'

interface CommitCardProps {
  commit: Commit
  connection: duckdb.AsyncDuckDBConnection
}

export default function CommitCard({ commit, connection }: CommitCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [fileDiffs, setFileDiffs] = useState<FileDiff[]>([])
  const [expandedFiles, setExpandedFiles] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)

  const loadFileDiffs = async () => {
    if (fileDiffs.length > 0) return

    setLoading(true)
    try {
      const result = await connection.query(`
        SELECT * FROM commit_file_diffs 
        WHERE commit_id = '${commit.commit_id}'
        ORDER BY file_path
      `)
      const diffsArray = result.toArray().map(row => ({
        ...row,
        // Convert any BigInt fields to Number
        id: typeof row.id === 'bigint' ? Number(row.id) : row.id,
        insertions: typeof row.insertions === 'bigint' ? Number(row.insertions) : row.insertions,
        deletions: typeof row.deletions === 'bigint' ? Number(row.deletions) : row.deletions,
      }))
      setFileDiffs(diffsArray as unknown as FileDiff[])
      // Default: collapse all files
      setExpandedFiles(new Set())
    } catch (error) {
      console.error('Error loading file diffs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCardClick = async () => {
    if (!expanded) {
      await loadFileDiffs()
    }
    setExpanded(!expanded)
  }

  const toggleFileDiff = (fileId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const newExpanded = new Set(expandedFiles)
    if (newExpanded.has(fileId)) {
      newExpanded.delete(fileId)
    } else {
      newExpanded.add(fileId)
    }
    setExpandedFiles(newExpanded)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const truncateMessage = (message: string, maxLength: number = 100) => {
    const firstLine = message.split('\n')[0]
    if (firstLine.length <= maxLength) return firstLine
    return firstLine.substring(0, maxLength) + '...'
  }

  const tags = commit.tags ? commit.tags.split(',').map(t => t.trim()).filter(Boolean) : []

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Header with commit ID and version */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <GitCommit className="w-5 h-5 text-blue-600" />
          <code className="text-sm font-mono text-blue-600 font-semibold">
            {commit.commit_id.substring(0, 8)}
          </code>
          {commit.version && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 font-medium">
              {commit.version}
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleCardClick()
          }}
          className="inline-flex items-center px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
          title={expanded ? "Collapse" : "Expand"}
        >
          <svg
            className={`w-3 h-3 mr-1 transition-transform ${expanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {/* Commit Message */}
      <div className="mb-4">
        <p className="text-gray-900 font-medium leading-relaxed">
          {truncateMessage(commit.message)}
        </p>
      </div>

      {/* Tags Display */}
      <div className="flex flex-wrap gap-2 mb-4">
        {commit.component && <Tag type="component" value={commit.component} size="sm" />}
        {commit.patch_type && <Tag type="patch" value={commit.patch_type} size="sm" />}
        {tags.map((tag, idx) => (
          <Tag key={idx} type="custom" value={tag} size="sm" />
        ))}
      </div>

      {/* Author and Date */}
      <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <User className="w-4 h-4" />
          <span>{commit.author}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(commit.date)}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center space-x-6 text-sm">
        <div className="flex items-center space-x-1 text-gray-600">
          <FileText className="w-4 h-4" />
          <span>{commit.files_changed} {commit.files_changed === 1 ? 'file' : 'files'}</span>
        </div>
        <div className="flex items-center space-x-1 text-green-600">
          <Plus className="w-4 h-4" />
          <span>{commit.insertions}</span>
        </div>
        <div className="flex items-center space-x-1 text-red-600">
          <Minus className="w-4 h-4" />
          <span>{commit.deletions}</span>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-6 border-t border-gray-200 pt-6" onClick={(e) => e.stopPropagation()}>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading details...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Full Message */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Commit Message</h4>
                <div className="bg-gray-50 rounded-md p-3 max-h-160 overflow-y-auto">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                    {commit.message}
                  </pre>
                </div>
              </div>

              {/* File Changes */}
              {fileDiffs.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    File Changes ({fileDiffs.length})
                  </h4>
                  <div className="space-y-3">
                    {fileDiffs.map((file) => (
                      <div key={file.id} className="border border-gray-200 rounded-md">
                        <div
                          className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                          onClick={(e) => toggleFileDiff(file.id, e)}
                        >
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <code className="text-sm font-medium text-gray-900 font-mono truncate">
                              {file.file_path}
                            </code>
                          </div>
                          <div className="flex items-center space-x-4 flex-shrink-0">
                            <div className="flex items-center space-x-3 text-xs">
                              <span className="flex items-center text-green-600">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                {file.insertions}
                              </span>
                              <span className="flex items-center text-red-600">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                                {file.deletions}
                              </span>
                            </div>
                            <svg
                              className={`w-4 h-4 text-gray-400 transition-transform ${
                                expandedFiles.has(file.id) ? 'rotate-90' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                        {expandedFiles.has(file.id) && (
                          <div className="p-0">
                            <DiffViewer content={file.diff_content} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {fileDiffs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No file diffs available</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
