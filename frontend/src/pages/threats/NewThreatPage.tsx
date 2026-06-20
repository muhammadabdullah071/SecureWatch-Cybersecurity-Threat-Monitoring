import { useState } from 'react'
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
import * as threatService from '@/services/threat.service'
import { Severity, ThreatStatus } from '@/types'

const threatSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  sourceIP: z.string().min(7, 'Valid source IP is required'),
  destinationIP: z.string().optional(),
  attackType: z.string().min(2, 'Attack type is required'),
  severity: z.nativeEnum(Severity),
  status: z.nativeEnum(ThreatStatus),
})

type ThreatForm = z.infer<typeof threatSchema>

export function NewThreatPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ThreatForm>({
    resolver: zodResolver(threatSchema),
    defaultValues: {
      title: '',
      description: '',
      sourceIP: '',
      destinationIP: '',
      attackType: '',
      severity: Severity.MEDIUM,
      status: ThreatStatus.NEW,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: ThreatForm) => threatService.createThreat(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threats'] })
      toast({ title: 'Threat created', variant: 'success' })
      navigate('/threats')
    },
    onError: () => {
      toast({ title: 'Failed to create threat', variant: 'destructive' })
    },
  })

  const onSubmit = (data: ThreatForm) => mutation.mutate(data)

  return (
    <div>
      <Button variant="ghost" onClick={() => navigate('/threats')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Threats
      </Button>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>New Threat</CardTitle>
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
                <Label htmlFor="srcIP">Source IP</Label>
                <Input id="srcIP" {...register('sourceIP')} className={errors.sourceIP ? 'border-critical-500' : ''} />
                {errors.sourceIP && <p className="text-xs text-critical-400">{errors.sourceIP.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dstIP">Destination IP</Label>
                <Input id="dstIP" {...register('destinationIP')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="attackType">Attack Type</Label>
              <Input id="attackType" {...register('attackType')} className={errors.attackType ? 'border-critical-500' : ''} />
              {errors.attackType && <p className="text-xs text-critical-400">{errors.attackType.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <select
                  id="severity"
                  {...register('severity')}
                  className="flex h-10 w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-100"
                >
                  {Object.values(Severity).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  {...register('status')}
                  className="flex h-10 w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-100"
                >
                  {Object.values(ThreatStatus).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <Button type="submit" isLoading={mutation.isPending}>Create Threat</Button>
              <Button type="button" variant="outline" onClick={() => navigate('/threats')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
