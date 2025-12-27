import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import c from 'react-syntax-highlighter/dist/esm/languages/prism/c'
import { ghcolors } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useState } from 'react'

SyntaxHighlighter.registerLanguage('c', c)

interface DiffViewerProps {
  content: string
}

export default function DiffViewer({ content }: DiffViewerProps) {
  const [copied, setCopied] = useState(false)

  if (!content) {
    return (
      <div className="text-gray-500 text-sm p-4 bg-gray-50 rounded">
        No diff content available
      </div>
    )
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // 预处理：移除 diff 标记以便高亮，但保留原始行用于判断类型
  const lines = content.split('\n')
  
  // 提取纯代码用于高亮（去掉 + - 前缀，但保留空格）
  const codeString = lines.map(line => {
    if (line.startsWith('+') || line.startsWith('-')) {
      return line.substring(1) || ' ' // 保持空行占位
    }
    return line
  }).join('\n')

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 text-xs font-mono text-gray-600 flex items-center justify-between">
        <span>Diff Content</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-gray-200 transition-colors text-gray-700"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto max-h-96 relative">
        {/* 
           这里使用 renderer 属性来自定义每一行的渲染逻辑 
           我们将 SyntaxHighlighter 作为解析器,但接管渲染过程
           以便注入我们的 Diff 背景色逻辑
        */}
        <SyntaxHighlighter
          language="c"
          style={ghcolors}
          customStyle={{ 
            margin: 0, 
            padding: '1rem 0',
            backgroundColor: 'transparent',
            fontSize: '16px',
            lineHeight: '1.8',
            fontFamily: "'Fira Code', 'SF Mono', 'Consolas', 'Monaco', 'Courier New', monospace",
            fontWeight: '550'
          }}
          showLineNumbers={true}
          // 自定义行号样式
          lineNumberStyle={{
            minWidth: '3.5em',
            paddingRight: '1.25em',
            textAlign: 'right',
            color: '#6b7280',
            borderRight: '1px solid #e5e7eb',
            marginRight: '1rem',
            userSelect: 'none',
            fontSize: '15px',
            fontWeight: '600'
          }}
          wrapLines={true}
          // 核心逻辑：根据原始 Diff 内容为每一行注入样式
          lineProps={(lineNumber) => {
            const originalLine = lines[lineNumber - 1] || ''
            const style: React.CSSProperties = { 
              display: 'block',
              paddingLeft: '1rem',
              paddingRight: '1rem'
            }
            
            if (originalLine.startsWith('+')) {
              style.backgroundColor = '#e6ffec'
            } else if (originalLine.startsWith('-')) {
              style.backgroundColor = '#ffebe9'
            } else if (originalLine.startsWith('@@')) {
              style.backgroundColor = '#f0f6fc'
              style.color = '#0969da'
              style.fontWeight = '700'
            }

            return { style }
          }}
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}
