import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, AlertTriangle, Trash2, Eye } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { formatRelativeTime } from '@/lib/utils'
import * as incidentService from '@/services/incident.service'
import type { Incident } from '@/types'
import { useToast } from '@/components/ui/toast'

export function IncidentsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['incidents', page, search],
    queryFn: () => incidentService.getIncidents({ page, limit: 10, search: search || undefined }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => incidentService.deleteIncident(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
      toast({ title: 'Incident deleted', variant: 'success' })
      setDeleteId(null)
    },
    onError: () => {
      toast({ title: 'Failed to delete incident', variant: 'destructive' })
    },
  })

  const incidents: Incident[] = data?.data?.data || data?.data || []
  const pagination = data?.data?.pagination

  const columns: Column<Incident>[] = [
    { key: 'title', header: 'Title', sortable: true },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (i) => <StatusBadge status={i.priority} />,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (i) => <StatusBadge status={i.status} />,
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (i) => <span className="text-slate-400 text-sm">{formatRelativeTime(i.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (i) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={() => navigate(`/incidents/${i.id}`)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteId(i.id)}>
            <Trash2 className="h-4 w-4 text-critical-400" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Incidents"
        description="Track and manage security incidents"
        actions={
          <Button onClick={() => navigate('/incidents/new')}>
            <Plus className="mr-2 h-4 w-4" /> New Incident
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={incidents}
        isLoading={isLoading}
        onRowClick={(i) => navigate(`/incidents/${i.id}`)}
        page={page}
        totalPages={pagination?.totalPages || 1}
        onPageChange={setPage}
        searchPlaceholder="Search incidents..."
        onSearch={(q) => { setSearch(q); setPage(1) }}
        keyExtractor={(i) => i.id}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Incident"
        description="Are you sure you want to delete this incident?"
        confirmLabel="Delete"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
