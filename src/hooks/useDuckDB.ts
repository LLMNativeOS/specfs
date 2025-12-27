import { useState, useEffect, useRef } from 'react'
import * as duckdb from '@duckdb/duckdb-wasm'
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url'
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url'

interface UseDuckDBReturn {
  db: duckdb.AsyncDuckDB | null
  connection: duckdb.AsyncDuckDBConnection | null
  loading: boolean
  error: string | null
  isReady: boolean
}

const PARQUET_FILES = {
  commits: './data/ext4-commits.parquet',
  commitFileDiffs: './data/ext4-commits-code.parquet'
}

export function useDuckDB(): UseDuckDBReturn {
  const [db, setDb] = useState<duckdb.AsyncDuckDB | null>(null)
  const [connection, setConnection] = useState<duckdb.AsyncDuckDBConnection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const initRef = useRef(false)

  useEffect(() => {
    // Prevent double initialization in React StrictMode
    if (initRef.current) return
    initRef.current = true

    async function initializeDuckDB() {
      try {
        setLoading(true)
        setError(null)

        console.log('[DuckDB] Starting initialization...')

        // Step 1: Create DuckDB bundle
        const bundle = await duckdb.selectBundle({
          mvp: {
            mainModule: duckdb_wasm,
            mainWorker: new URL('@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js', import.meta.url).href,
          },
          eh: {
            mainModule: duckdb_wasm_eh,
            mainWorker: new URL('@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js', import.meta.url).href,
          },
        })

        console.log('[DuckDB] Bundle selected')

        // Step 2: Initialize worker
        const worker = new Worker(bundle.mainWorker!)
        const logger = new duckdb.ConsoleLogger()
        const database = new duckdb.AsyncDuckDB(logger, worker)
        await database.instantiate(bundle.mainModule)

        console.log('[DuckDB] Worker initialized')

        // Step 3: Create connection
        const conn = await database.connect()
        console.log('[DuckDB] Connection established')

        // Step 4: Register and load Parquet files from URLs
        console.log('[DuckDB] Loading Parquet files...')
        
        // Fetch and register commits file
        const commitsResponse = await fetch(PARQUET_FILES.commits)
        if (!commitsResponse.ok) {
          throw new Error(`Failed to fetch commits.parquet: ${commitsResponse.status}`)
        }
        const commitsBuffer = await commitsResponse.arrayBuffer()
        await database.registerFileBuffer('commits.parquet', new Uint8Array(commitsBuffer))
        
        // Load commits table
        await conn.query(`
          CREATE TABLE commits AS 
          SELECT * FROM read_parquet('commits.parquet')
        `)
        console.log('[DuckDB] commits.parquet loaded')

        // Fetch and register commit_file_diffs file
        const diffsResponse = await fetch(PARQUET_FILES.commitFileDiffs)
        if (!diffsResponse.ok) {
          throw new Error(`Failed to fetch commit_file_diffs.parquet: ${diffsResponse.status}`)
        }
        const diffsBuffer = await diffsResponse.arrayBuffer()
        await database.registerFileBuffer('commit_file_diffs.parquet', new Uint8Array(diffsBuffer))
        
        // Load commit_file_diffs table
        await conn.query(`
          CREATE TABLE commit_file_diffs AS 
          SELECT * FROM read_parquet('commit_file_diffs.parquet')
        `)
        console.log('[DuckDB] commit_file_diffs.parquet loaded')

        // Step 6: Set state
        setDb(database)
        setConnection(conn)
        setIsReady(true)
        setLoading(false)

        console.log('[DuckDB] Initialization complete!')

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
        console.error('[DuckDB] Initialization failed:', err)
        setError(errorMessage)
        setLoading(false)
      }
    }

    initializeDuckDB()

    // Cleanup on unmount
    return () => {
      if (connection) {
        connection.close().catch(console.error)
      }
      if (db) {
        db.terminate().catch(console.error)
      }
    }
  }, [])

  return { db, connection, loading, error, isReady }
}
