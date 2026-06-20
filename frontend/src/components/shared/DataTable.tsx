import { useState, useMemo } from 'react'
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export interface Column<T> {
  key: keyof T | string
  header: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  onRowClick?: (item: T) => void
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  searchable?: boolean
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  onExport?: () => void
  emptyMessage?: string
  keyExtractor: (item: T) => string
}

export function DataTable<T extends { [key: string]: any }>({
  columns,
  data,
  isLoading,
  onRowClick,
  page = 1,
  totalPages = 1,
  onPageChange,
  searchable = true,
  searchPlaceholder = 'Search...',
  onSearch,
  onExport,
  emptyMessage = 'No data found',
  keyExtractor,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [searchQuery, setSearchQuery] = useState('')

  const sortedData = useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (aVal == null) return 1
      if (bVal == null) return -1
      const cmp = String(aVal).localeCompare(String(bVal))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [data, sortKey, sortDir])

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch?.(value)
  }

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortKey !== columnKey) return <ChevronsUpDown className="ml-1 h-3.5 w-3.5 inline opacity-40" />
    return sortDir === 'asc' ? (
      <ChevronUp className="ml-1 h-3.5 w-3.5 inline" />
    ) : (
      <ChevronDown className="ml-1 h-3.5 w-3.5 inline" />
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-24 ml-auto" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {(searchable || onExport) && (
        <div className="flex items-center gap-4">
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          )}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport} className="ml-auto">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          )}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={String(col.key)}
                  className={cn(
                    col.sortable && 'cursor-pointer select-none hover:text-slate-200',
                    col.className
                  )}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  {col.header}
                  {col.sortable && <SortIcon columnKey={String(col.key)} />}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-8 w-8 opacity-30" />
                    <p>{emptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item) => (
                <TableRow
                  key={keyExtractor(item)}
                  onClick={() => onRowClick?.(item)}
                  className={cn(onRowClick && 'cursor-pointer')}
                >
                  {columns.map((col) => (
                    <TableCell key={String(col.key)} className={col.className}>
                      {col.render ? col.render(item) : String(item[col.key as keyof T] ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
