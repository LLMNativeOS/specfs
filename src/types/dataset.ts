export interface Commit {
  commit_id: string
  author: string
  date: string
  message: string
  files_changed: number
  insertions: number
  deletions: number
  version: string
  component: string
  patch_type: string
  tags: string
}

export interface FileDiff {
  id: number
  commit_id: string
  file_path: string
  insertions: number
  deletions: number
  diff_content: string
}

export interface SearchFilters {
  keyword: string
  startDate: string
  endDate: string
  version: string
  component: string
  patchType: string
  fileName: string
}

export interface Component {
  id: number
  name: string
  description: string
}

export interface PatchType {
  id: number
  name: string
  color: string
}

export const COMPONENTS: Component[] = [
  { id: 1, name: 'balloc', description: 'Data-block allocation and deallocation' },
  { id: 2, name: 'dir', description: 'Directory management' },
  { id: 3, name: 'extent', description: 'Contiguous-blocks mapping' },
  { id: 4, name: 'file', description: 'File read/write operations' },
  { id: 5, name: 'inode', description: 'Inode-metadata management' },
  { id: 6, name: 'trans', description: 'Journaling or transactional support' },
  { id: 7, name: 'super', description: 'Superblock metadata management' },
  { id: 8, name: 'tree', description: 'Generic tree-structure procedures' },
  { id: 9, name: 'other', description: 'Other miscellaneous operations' }
]

export const PATCH_TYPES: PatchType[] = [
  { id: 1, name: 'feature', color: '#10b981' },
  { id: 2, name: 'bug', color: '#ef4444' },
  { id: 3, name: 'performance', color: '#f59e0b' },
  { id: 4, name: 'maintenance', color: '#6b7280' },
  { id: 5, name: 'reliability', color: '#8b5cf6' }
]
