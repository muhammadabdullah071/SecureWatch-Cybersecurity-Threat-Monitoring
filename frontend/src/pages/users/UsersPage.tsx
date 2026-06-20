import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, UserPlus, Trash2, Ban, CheckCircle } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { formatDate } from '@/lib/utils'
import * as userService from '@/services/user.service'
import type { User } from '@/types'
import { useToast } from '@/components/ui/toast'

export function UsersPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search],
    queryFn: () => userService.getUsers({ page, limit: 10, search: search || undefined }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast({ title: 'User deleted', variant: 'success' })
      setDeleteId(null)
    },
  })

  const users: User[] = data?.data?.data || data?.data || []
  const pagination = data?.data?.pagination

  const columns: Column<User>[] = [
    {
      key: 'firstName',
      header: 'Name',
      sortable: true,
      render: (u) => <span className="text-slate-900 dark:text-slate-200">{u.firstName} {u.lastName}</span>,
    },
    { key: 'email', header: 'Email', sortable: true },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (u) => <StatusBadge status={u.role} />,
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (u) => <StatusBadge status={u.isActive ? 'ACTIVE' : 'INACTIVE'} />,
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      sortable: true,
      render: (u) => <span className="text-slate-500 text-sm">{u.lastLogin ? formatDate(u.lastLogin) : 'Never'}</span>,
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (u) => <span className="text-slate-500 text-sm">{formatDate(u.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (u) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon">
            {u.isActive ? <Ban className="h-4 w-4 text-warning-500" /> : <CheckCircle className="h-4 w-4 text-success-500" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteId(u.id)}>
            <Trash2 className="h-4 w-4 text-critical-500" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage system users and their roles"
        actions={
          <Button onClick={() => toast({ title: 'Success', description: 'User creation form opened' })}>
            <UserPlus className="mr-2 h-4 w-4" /> Add User
          </Button>
        }
      />

      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={users}
            isLoading={isLoading}
            page={page}
            totalPages={pagination?.totalPages || 1}
            onPageChange={setPage}
            searchable={true}
            searchPlaceholder="Search users..."
            onSearch={(q) => { setSearch(q); setPage(1) }}
            keyExtractor={(u) => u.id}
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete User"
        description="Are you sure you want to delete this user?"
        confirmLabel="Delete"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
