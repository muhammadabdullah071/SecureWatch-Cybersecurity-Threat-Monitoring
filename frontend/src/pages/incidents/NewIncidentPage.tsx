import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import * as incidentService from '@/services/incident.service'
import { IncidentPriority, IncidentStatus } from '@/types'

const incidentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.nativeEnum(IncidentPriority),
  status: z.nativeEnum(IncidentStatus),
  threatId: z.string().optional(),
  notes: z.string().optional(),
})

type IncidentForm = z.infer<typeof incidentSchema>

export function NewIncidentPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IncidentForm>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: IncidentPriority.MEDIUM,
      status: IncidentStatus.OPEN,
      threatId: '',
      notes: '',
    },
  })

  const mutation = useMutation({
    mutationFn: (data: IncidentForm) => incidentService.createIncident(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
      toast({ title: 'Incident created', variant: 'success' })
      navigate('/incidents')
    },
    onError: () => {
      toast({ title: 'Failed to create incident', variant: 'destructive' })
    },
  })

  const onSubmit = (data: IncidentForm) => mutation.mutate(data)

  return (
    <div>
      <Button variant="ghost" onClick={() => navigate('/incidents')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Incidents
      </Button>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>New Incident</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} className={errors.title ? 'border-critical-500' : ''} />
              {errors.title && <p className="text-xs text-critical-400">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <textarea
                id="desc"
                {...register('description')}
                className="flex min-h-[80px] w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-100"
              />
              {errors.description && <p className="text-xs text-critical-400">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  {...register('priority')}
                  className="flex h-10 w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-100"
                >
                  {Object.values(IncidentPriority).map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  {...register('status')}
                  className="flex h-10 w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-100"
                >
                  {Object.values(IncidentStatus).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="threatId">Related Threat ID (optional)</Label>
              <Input id="threatId" {...register('threatId')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                {...register('notes')}
                className="flex min-h-[80px] w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-100"
              />
            </div>
            <div className="flex gap-4 pt-4">
              <Button type="submit" isLoading={mutation.isPending}>Create Incident</Button>
              <Button type="button" variant="outline" onClick={() => navigate('/incidents')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
