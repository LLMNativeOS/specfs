import { PATCH_TYPES } from '@/types/dataset'
import { Package, Tag as TagIcon } from 'lucide-react'

interface TagProps {
  type: 'component' | 'patch' | 'custom'
  value: string
  size?: 'sm' | 'md' | 'lg'
}

export default function Tag({ type, value, size = 'md' }: TagProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const sizeClass = sizeClasses[size]
  const iconSize = iconSizes[size]

  const getTagStyle = () => {
    switch (type) {
      case 'component':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'patch': {
        const patchType = PATCH_TYPES.find(p => p.name === value)
        if (patchType) {
          return `text-white border-transparent`
        }
        return 'bg-gray-100 text-gray-800 border-gray-200'
      }
      case 'custom':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const patchType = type === 'patch' ? PATCH_TYPES.find(p => p.name === value) : null

  return (
    <span
      className={`inline-flex items-center border rounded-full font-medium ${sizeClass} ${getTagStyle()}`}
      style={patchType ? { backgroundColor: patchType.color } : undefined}
    >
      {type === 'component' && <Package className={`${iconSize} mr-1`} />}
      {type === 'patch' && <TagIcon className={`${iconSize} mr-1`} />}
      {value}
    </span>
  )
}
