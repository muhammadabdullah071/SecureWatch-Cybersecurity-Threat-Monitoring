import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ScrollText, Download } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatRelativeTime } from '@/lib/utils'
import * as auditService from '@/services/audit.service'
import type { AuditLog } from '@/types'
import { useToast } from '@/components/ui/toast'

export function AuditLogsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const { toast } = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, search],
    queryFn: () => auditService.getAuditLogs({ page, limit: 15, search: search || undefined }),
  })

  const logs: AuditLog[] = data?.data?.data || data?.data || []
  const pagination = data?.data?.pagination

  const columns: Column<AuditLog>[] = [
    {
      key: 'action',
      header: 'Action',
      sortable: true,
      render: (l) => (
        <Badge variant="outline" className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">
          {l.action}
        </Badge>
      ),
    },
    { key: 'userEmail', header: 'User', sortable: true },
    { key: 'entity', header: 'Entity', sortable: true },
    {
      key: 'entityId',
      header: 'Entity ID',
      render: (l) => <span className="font-mono text-xs text-slate-500">{l.entityId?.substring(0, 12)}...</span>,
    },
    {
      key: 'ipAddress',
      header: 'IP Address',
      render: (l) => <span className="font-mono text-xs text-slate-600 dark:text-slate-400">{l.ipAddress}</span>,
    },
    {
      key: 'createdAt',
      header: 'Timestamp',
      sortable: true,
      render: (l) => <span className="text-slate-500 text-sm">{formatRelativeTime(l.createdAt)}</span>,
    },
  ]

  const handleExport = async () => {
    try {
      const response = await auditService.exportAuditLogs()
      const blob = response.data as Blob
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'audit-logs-export.csv'
      a.click()
      window.URL.revokeObjectURL(url)
      toast({ title: 'Audit logs exported successfully', variant: 'success' })
    } catch {
      toast({ title: 'Failed to export audit logs', variant: 'destructive' })
    }
  }

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        description="Track all system activities and changes"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        }
      />

      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={logs}
            isLoading={isLoading}
            page={page}
            totalPages={pagination?.totalPages || 1}
            onPageChange={setPage}
            searchable={true}
            searchPlaceholder="Search audit logs..."
            onSearch={(q) => { setSearch(q); setPage(1) }}
            keyExtractor={(l) => l.id}
          />
        </CardContent>
      </Card>
    </div>
  )
}
