import type { Threat, Incident, Notification, User, AuditLog, ThreatFeed, DashboardStats } from '@/types'

const now = Date.now()
const day = 86400000

const USERS: User[] = [
  { id: 'u1', email: 'admin@securewatch.io', firstName: 'Alice', lastName: 'Smith', role: 'ADMIN' as const, isActive: true, lastLogin: new Date(now - day).toISOString(), createdAt: new Date(now - 90 * day).toISOString() },
  { id: 'u2', email: 'analyst1@securewatch.io', firstName: 'Bob', lastName: 'Johnson', role: 'ANALYST' as const, isActive: true, lastLogin: new Date(now - 2 * day).toISOString(), createdAt: new Date(now - 80 * day).toISOString() },
  { id: 'u3', email: 'analyst2@securewatch.io', firstName: 'Charlie', lastName: 'Williams', role: 'ANALYST' as const, isActive: true, lastLogin: new Date(now - day / 2).toISOString(), createdAt: new Date(now - 70 * day).toISOString() },
  { id: 'u4', email: 'analyst3@securewatch.io', firstName: 'Diana', lastName: 'Brown', role: 'ANALYST' as const, isActive: true, lastLogin: new Date(now - 4 * day).toISOString(), createdAt: new Date(now - 60 * day).toISOString() },
  { id: 'u5', email: 'analyst4@securewatch.io', firstName: 'Eve', lastName: 'Jones', role: 'ANALYST' as const, isActive: true, lastLogin: new Date(now - day).toISOString(), createdAt: new Date(now - 50 * day).toISOString() },
  { id: 'u6', email: 'analyst5@securewatch.io', firstName: 'Frank', lastName: 'Garcia', role: 'ANALYST' as const, isActive: true, lastLogin: new Date(now - 3 * day).toISOString(), createdAt: new Date(now - 40 * day).toISOString() },
  ...Array.from({ length: 14 }, (_, i) => ({
    id: `u${i + 7}`, email: `viewer${i + 1}@securewatch.io`, firstName: ['Grace', 'Hank', 'Ivy', 'Jack', 'Kate', 'Liam', 'Mona', 'Nate', 'Olivia', 'Paul', 'Quinn', 'Rosa', 'Sam', 'Tina'][i], lastName: ['Davis', 'Rodriguez', 'Martinez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'White'][i], role: 'VIEWER' as const, isActive: Math.random() > 0.15, lastLogin: Math.random() > 0.3 ? new Date(now - Math.random() * 7 * day).toISOString() : null, createdAt: new Date(now - (20 + Math.random() * 70) * day).toISOString(),
  })),
]

const ATTACK_TYPES = ['DDoS', 'Phishing', 'Malware', 'Ransomware', 'SQL Injection', 'XSS', 'Brute Force', 'Man-in-the-Middle', 'Zero-Day Exploit', 'DNS Spoofing', 'Credential Stuffing', 'Insider Threat', 'APT', 'Buffer Overflow', 'Social Engineering']
const THREAT_TITLES = [
  'Suspicious outbound traffic detected', 'Potential data exfiltration attempt', 'Malware beaconing to C2 server',
  'Ransomware encryption activity detected', 'Brute force attack on SSH service', 'SQL injection attempt on web application',
  'Cross-site scripting attack detected', 'DNS tunneling activity observed', 'Unusual privilege escalation attempt',
  'Port scan from unknown external IP', 'Phishing campaign targeting employees', 'Man-in-the-middle attack detected',
  'Zero-day exploit targeting web server', 'Credential stuffing attack on VPN', 'DDoS attack targeting load balancer',
  'Suspicious PowerShell execution', 'Unauthorized access attempt detected', 'Malicious file download blocked',
  'Anomalous network traffic pattern', 'Rogue device detected on network',
]
const SOURCE_IPS = ['192.168.1.105', '10.0.0.87', '172.16.0.54', '203.0.113.45', '198.51.100.23', '185.220.101.34', '91.121.87.156', '45.33.32.156', '104.248.50.88', '157.230.112.45', '167.99.89.123', '159.89.214.145', '178.62.76.34', '138.68.98.67', '165.227.45.89']
const DEST_IPS = ['10.0.1.100', '172.16.1.200', '192.168.2.50', '10.0.0.1', '172.16.0.1']
const ANALYSTS = USERS.filter(u => u.role === 'ANALYST')
const INCIDENT_TITLES = ['Active ransomware outbreak response', 'Critical data breach investigation', 'DDoS mitigation in progress', 'Phishing incident response', 'Malware outbreak containment', 'Zero-day exploit response', 'Insider threat investigation', 'Network intrusion response', 'Account compromise investigation', 'SQL injection incident response']
const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const
const THREAT_STATUSES = ['NEW', 'INVESTIGATING', 'MITIGATED', 'RESOLVED'] as const

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function rdate(maxDays: number) { return new Date(now - Math.random() * maxDays * day).toISOString() }

const THREATS: Threat[] = Array.from({ length: 100 }, (_, i) => {
  const sev = Math.random() < 0.15 ? 'CRITICAL' : Math.random() < 0.35 ? 'HIGH' : Math.random() < 0.65 ? 'MEDIUM' : 'LOW'
  const created = new Date(now - Math.random() * 30 * day)
  const isOld = created < new Date(now - 7 * day)
  const st: typeof THREAT_STATUSES[number] = isOld
    ? (['NEW', 'INVESTIGATING', 'MITIGATED', 'RESOLVED'] as const)[rand(0, 3)]
    : (['NEW', 'INVESTIGATING', 'MITIGATED'] as const)[rand(0, 2)]
  const analyst = st !== 'NEW' && ANALYSTS.length > 0 ? pick(ANALYSTS) : null
  return {
    id: `t${i + 1}`, title: pick(THREAT_TITLES), description: `Detected ${pick(ATTACK_TYPES).toLowerCase()} activity from IP ${pick(SOURCE_IPS)}.`,
    sourceIP: pick(SOURCE_IPS), destinationIP: Math.random() > 0.4 ? pick(DEST_IPS) : null,
    attackType: pick(ATTACK_TYPES), severity: sev as any, status: st as any,
    assignedAnalyst: analyst ? `${analyst.firstName} ${analyst.lastName}` : null,
    assignedToId: analyst?.id || null,
    createdAt: created.toISOString(), updatedAt: new Date(created.getTime() + rand(1, 48) * 3600000).toISOString(),
  }
})

const INCIDENTS: Incident[] = Array.from({ length: 50 }, (_, i) => {
  const created = new Date(now - Math.random() * 25 * day)
  const isClosed = created < new Date(now - 5 * day)
  const st = isClosed ? (['RESOLVED', 'CLOSED'] as const)[rand(0, 1)] : (['OPEN', 'INVESTIGATING'] as const)[rand(0, 1)]
  const threat = Math.random() > 0.3 ? pick(THREATS) : null
  return {
    id: `inc${i + 1}`, title: pick(INCIDENT_TITLES), description: `Incident related to threat analysis. Priority level: ${Math.random() > 0.7 ? 'high' : 'medium'}.`,
    priority: (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const)[rand(0, 3)] as any,
    status: st as any, threatId: threat?.id || null,
    assignedToId: Math.random() > 0.4 ? pick(ANALYSTS).id : null,
    createdById: pick(USERS.filter(u => u.role !== 'VIEWER')).id,
    notes: Math.random() > 0.5 ? 'Initial analysis indicates potential security breach.' : null,
    closedAt: st === 'CLOSED' || st === 'RESOLVED' ? new Date(created.getTime() + rand(24, 72) * 3600000).toISOString() : null,
    createdAt: created.toISOString(), updatedAt: new Date(created.getTime() + rand(1, 24) * 3600000).toISOString(),
  }
})

const NOTIFICATIONS: Notification[] = Array.from({ length: 30 }, (_, i) => {
  const recent = i < 15
  return {
    id: `n${i + 1}`, userId: pick(USERS).id,
    title: pick(['New threat detected in your queue', 'Critical vulnerability identified', 'Incident assigned to your team', 'Weekly security report ready', 'Suspicious login attempt detected']),
    message: 'Please review and take appropriate action.',
    type: pick(['info', 'warning', 'critical', 'assignment']),
    read: recent ? Math.random() > 0.6 : Math.random() > 0.2,
    link: Math.random() > 0.4 ? `/threats/${pick(THREATS).id}` : null,
    createdAt: recent ? rdate(2) : rdate(15),
  }
})

const AUDIT_LOGS: AuditLog[] = Array.from({ length: 100 }, (_, i) => {
  const user = pick(USERS)
  return {
    id: `a${i + 1}`, userId: user.id, userEmail: user.email,
    action: pick(['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW', 'EXPORT']),
    entity: pick(['User', 'Threat', 'Incident', 'Notification', 'AuditLog']),
    entityId: Math.random() > 0.5 ? pick(THREATS).id : null,
    details: null, ipAddress: `192.168.${rand(1, 254)}.${rand(1, 254)}`,
    createdAt: rdate(30),
  }
})

const FEEDS: ThreatFeed[] = [
  ...['185.220.101.34', '91.121.87.156', '45.33.32.156', '104.248.50.88', '157.230.112.45', '167.99.89.123', '159.89.214.145', '178.62.76.34', '138.68.98.67', '165.227.45.89', '192.241.234.56', '159.65.123.78', '167.71.45.90', '178.128.56.34', '157.245.78.12'].map((ip, i) => ({
    id: `fip${i + 1}`, type: 'ip', value: ip, description: pick(['Known C2 server', 'Phishing infrastructure', 'Ransomware endpoint', 'Botnet C&C', 'Malware download server']),
    riskScore: rand(60, 100), isActive: Math.random() > 0.15, source: pick(['internal', 'alienvault', 'virustotal', 'abuseipdb', 'threatfox']), createdAt: rdate(60),
  })),
  ...['malware-c2.example.com', 'phishing-portal.net', 'evil-hosting.org', 'botnet-control.xyz', 'ransomware-payload.io', 'data-exfil.biz', 'credential-stealer.net', 'apt-group.org', 'dark-web-market.io', 'malicious-download.xyz', 'spam-relay.net', 'ddos-command.io'].map((domain, i) => ({
    id: `fd${i + 1}`, type: 'domain', value: domain, description: 'Known malicious domain', riskScore: rand(50, 95), isActive: Math.random() > 0.1, source: pick(['internal', 'alienvault', 'virustotal', 'threatfox']), createdAt: rdate(60),
  })),
]

const MOCK_USER = USERS[0]
const ACCESS_TOKEN = 'mock-access-token-securewatch-' + Date.now()
const REFRESH_TOKEN = 'mock-refresh-token-securewatch-' + Date.now()

const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io')

if (isGitHubPages) {
  localStorage.setItem('accessToken', ACCESS_TOKEN)
  localStorage.setItem('refreshToken', REFRESH_TOKEN)
  localStorage.setItem('user', JSON.stringify(MOCK_USER))
}

function ok(data: any, pagination?: any) {
  return { data: pagination ? { success: true, data, pagination } : { success: true, data }, status: 200, statusText: 'OK', headers: {}, config: {} as any }
}

function match(path: string, method: string, params?: any, body?: any) {
  const url = new URL(path, 'http://localhost')
  const p = url.pathname

  // Auth
  if (p === '/api/auth/login' && method === 'POST') {
    const u = USERS.find(x => x.email === body?.email)
    if (!u || !u.isActive) return ok({ message: u ? 'Account is deactivated' : 'Invalid credentials' }, undefined)
    return ok({ user: { id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, role: u.role }, tokens: { accessToken: ACCESS_TOKEN, refreshToken: REFRESH_TOKEN } })
  }
  if (p === '/api/auth/register' && method === 'POST') return ok({ user: MOCK_USER, tokens: { accessToken: ACCESS_TOKEN, refreshToken: REFRESH_TOKEN } })
  if (p === '/api/auth/logout' && method === 'POST') return ok({ message: 'Logged out successfully' })
  if (p === '/api/auth/refresh' && method === 'POST') return ok({ accessToken: ACCESS_TOKEN, refreshToken: REFRESH_TOKEN })
  if (p === '/api/auth/forgot-password' && method === 'POST') return ok({ message: 'Password reset email sent' })
  if (p === '/api/auth/reset-password' && method === 'POST') return ok({ message: 'Password reset successful' })
  if (p === '/api/auth/change-password' && method === 'POST') return ok({ message: 'Password changed successfully' })
  if (p === '/api/auth/profile' && method === 'GET') return ok(MOCK_USER)
  if (p === '/api/auth/profile' && method === 'PUT') return ok({ ...MOCK_USER, ...body })

  // Threats
  if (p === '/api/threats' && method === 'GET') {
    let filtered = [...THREATS]
    if (params?.search) {
      const q = params.search.toLowerCase()
      filtered = filtered.filter(t => t.title.toLowerCase().includes(q) || t.sourceIP.includes(q) || t.attackType.toLowerCase().includes(q))
    }
    if (params?.severity) filtered = filtered.filter(t => t.severity === params.severity)
    if (params?.status) filtered = filtered.filter(t => t.status === params.status)
    const page = parseInt(params?.page as string) || 1
    const limit = parseInt(params?.limit as string) || 10
    const start = (page - 1) * limit
    const total = filtered.length
    return ok(filtered.slice(start, start + limit), { page, limit, total, totalPages: Math.ceil(total / limit) })
  }
  if (p.match(/^\/api\/threats\/stats$/) && method === 'GET') {
    return ok({ total: THREATS.length, critical: THREATS.filter(t => t.severity === 'CRITICAL').length, high: THREATS.filter(t => t.severity === 'HIGH').length, medium: THREATS.filter(t => t.severity === 'MEDIUM').length, low: THREATS.filter(t => t.severity === 'LOW').length, new: THREATS.filter(t => t.status === 'NEW').length, investigating: THREATS.filter(t => t.status === 'INVESTIGATING').length, mitigated: THREATS.filter(t => t.status === 'MITIGATED').length, resolved: THREATS.filter(t => t.status === 'RESOLVED').length })
  }
  const threatIdMatch = p.match(/^\/api\/threats\/(.+)$/)
  if (threatIdMatch) {
    const id = threatIdMatch[1]
    if (method === 'GET') return ok(THREATS.find(t => t.id === id) || THREATS[0])
    if (method === 'PUT') return ok({ ...THREATS.find(t => t.id === id), ...body })
    if (method === 'DELETE') return ok({ message: 'Threat deleted' })
  }
  if (p === '/api/threats' && method === 'POST') return ok({ id: 't' + (THREATS.length + 1), ...body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })

  // Incidents
  if (p === '/api/incidents' && method === 'GET') {
    let filtered = [...INCIDENTS]
    if (params?.status) filtered = filtered.filter(i => i.status === params.status)
    if (params?.priority) filtered = filtered.filter(i => i.priority === params.priority)
    const page = parseInt(params?.page as string) || 1
    const limit = parseInt(params?.limit as string) || 10
    const start = (page - 1) * limit
    const total = filtered.length
    return ok(filtered.slice(start, start + limit), { page, limit, total, totalPages: Math.ceil(total / limit) })
  }
  if (p.match(/^\/api\/incidents\/stats$/) && method === 'GET') {
    return ok({ total: INCIDENTS.length, open: INCIDENTS.filter(i => i.status === 'OPEN').length, investigating: INCIDENTS.filter(i => i.status === 'INVESTIGATING').length, resolved: INCIDENTS.filter(i => i.status === 'RESOLVED').length, closed: INCIDENTS.filter(i => i.status === 'CLOSED').length })
  }
  const incIdMatch = p.match(/^\/api\/incidents\/(.+)$/)
  if (incIdMatch) {
    const id = incIdMatch[1]
    if (method === 'GET') return ok(INCIDENTS.find(i => i.id === id) || INCIDENTS[0])
    if (method === 'PUT') return ok({ ...INCIDENTS.find(i => i.id === id), ...body })
    if (method === 'DELETE') return ok({ message: 'Incident deleted' })
  }
  if (p === '/api/incidents' && method === 'POST') return ok({ id: 'inc' + (INCIDENTS.length + 1), ...body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })

  // Users
  if (p === '/api/users' && method === 'GET') {
    const page = parseInt(params?.page as string) || 1
    const limit = parseInt(params?.limit as string) || 10
    const start = (page - 1) * limit
    const total = USERS.length
    return ok(USERS.slice(start, start + limit).map(u => ({ ...u, password: undefined })), { page, limit, total, totalPages: Math.ceil(total / limit) })
  }
  if (p === '/api/users' && method === 'POST') return ok({ id: 'u' + (USERS.length + 1), ...body, isActive: true, createdAt: new Date().toISOString(), password: undefined })
  const userIdMatch = p.match(/^\/api\/users\/(.+)$/)
  if (userIdMatch) {
    const id = userIdMatch[1]
    if (method === 'GET') return ok(USERS.find(u => u.id === id) || USERS[0])
    if (method === 'PUT') return ok({ ...USERS.find(u => u.id === id), ...body })
    if (method === 'DELETE') return ok({ message: 'User deactivated' })
  }

  // Notifications
  if (p === '/api/notifications' && method === 'GET') {
    const userId = params?.userId || MOCK_USER.id
    const userNots = NOTIFICATIONS.filter(n => n.userId === userId)
    return ok(userNots.length > 0 ? userNots : NOTIFICATIONS.slice(0, 10))
  }
  const notifReadAll = p.match(/^\/api\/notifications\/read-all$/)
  if (notifReadAll && method === 'PATCH') return ok({ message: 'All notifications marked as read' })
  const notifIdMatch = p.match(/^\/api\/notifications\/(.+)\/read$/)
  if (notifIdMatch && method === 'PATCH') return ok({ message: 'Notification marked as read' })

  // Analytics
  if (p === '/api/analytics/dashboard' && method === 'GET') {
    const critical = THREATS.filter(t => t.severity === 'CRITICAL').length
    const activeIncidents = INCIDENTS.filter(i => i.status === 'OPEN' || i.status === 'INVESTIGATING').length
    const resolved = THREATS.filter(t => t.status === 'RESOLVED').length
    const trend = Array.from({ length: 7 }, (_, i) => ({ date: new Date(now - (6 - i) * day).toISOString().slice(0, 10), count: rand(5, 25) }))
    const severityDistribution = [
      { name: 'Critical', value: critical, color: '#ef4444' },
      { name: 'High', value: THREATS.filter(t => t.severity === 'HIGH').length, color: '#f59e0b' },
      { name: 'Medium', value: THREATS.filter(t => t.severity === 'MEDIUM').length, color: '#3b82f6' },
      { name: 'Low', value: THREATS.filter(t => t.severity === 'LOW').length, color: '#22c55e' },
    ]
    const topSources = [...new Set(THREATS.map(t => t.sourceIP))].slice(0, 8).map(ip => ({ source: ip, count: THREATS.filter(t => t.sourceIP === ip).length }))
    const recentEvents = THREATS.slice(0, 10).map(t => ({ id: t.id, type: t.severity === 'CRITICAL' ? 'critical' : t.severity === 'HIGH' ? 'warning' : 'info', title: t.title, severity: t.severity, timestamp: t.createdAt }))
    return ok({ totalThreats: THREATS.length, activeIncidents, criticalAlerts: critical, resolvedThreats: resolved, threatTrend: trend, severityDistribution, topAttackSources: topSources, systemHealth: 'healthy', recentEvents })
  }
  if (p === '/api/analytics/threat-trends' && method === 'GET') {
    return ok(Array.from({ length: 12 }, (_, i) => ({ month: new Date(now - (11 - i) * 30 * day).toISOString().slice(0, 7), count: rand(10, 50) })))
  }
  if (p === '/api/analytics/severity-distribution' && method === 'GET') {
    return ok([{ name: 'Critical', value: THREATS.filter(t => t.severity === 'CRITICAL').length, color: '#ef4444' }, { name: 'High', value: THREATS.filter(t => t.severity === 'HIGH').length, color: '#f59e0b' }, { name: 'Medium', value: THREATS.filter(t => t.severity === 'MEDIUM').length, color: '#3b82f6' }, { name: 'Low', value: THREATS.filter(t => t.severity === 'LOW').length, color: '#22c55e' }])
  }
  if (p === '/api/analytics/top-attack-sources' && method === 'GET') {
    return ok([...new Set(THREATS.map(t => t.sourceIP))].slice(0, 8).map(ip => ({ source: ip, count: THREATS.filter(t => t.sourceIP === ip).length })))
  }

  // Audit Logs
  if (p === '/api/audit-logs' && method === 'GET') {
    const page = parseInt(params?.page as string) || 1
    const limit = parseInt(params?.limit as string) || 10
    let filtered = [...AUDIT_LOGS]
    if (params?.action) filtered = filtered.filter(a => a.action === params.action)
    if (params?.entity) filtered = filtered.filter(a => a.entity === params.entity)
    if (params?.userId) filtered = filtered.filter(a => a.userId === params.userId)
    const start = (page - 1) * limit
    const total = filtered.length
    return ok(filtered.slice(start, start + limit), { page, limit, total, totalPages: Math.ceil(total / limit) })
  }
  const auditIdMatch = p.match(/^\/api\/audit-logs\/(.+)$/)
  if (auditIdMatch && method === 'GET') return ok(AUDIT_LOGS[0])

  // Threat Intel
  if (p.match(/^\/api\/threat-intel\/search\/ip\//) && method === 'GET') {
    const ip = p.split('/').pop()
    const feed = FEEDS.find(f => f.value === ip)
    return ok(feed ? { found: true, ip, riskScore: feed.riskScore, isMalicious: feed.riskScore > 70, source: feed.source, description: feed.description } : { found: false, ip, riskScore: 0, isMalicious: false })
  }
  if (p.match(/^\/api\/threat-intel\/search\/domain\//) && method === 'GET') {
    const domain = p.split('/').pop()
    const feed = FEEDS.find(f => f.value === domain)
    return ok(feed ? { found: true, domain, riskScore: feed.riskScore, isMalicious: feed.riskScore > 70, source: feed.source } : { found: false, domain, riskScore: 0, isMalicious: false })
  }
  if (p.match(/^\/api\/threat-intel\/search\/country\//) && method === 'GET') {
    return ok({ found: true, riskScore: rand(40, 90), isMalicious: true })
  }
  if (p.match(/^\/api\/threat-intel\/summary$/) && method === 'GET') {
    return ok({ totalFeeds: FEEDS.length, activeFeeds: FEEDS.filter(f => f.isActive).length, maliciousIPs: FEEDS.filter(f => f.type === 'ip' && f.riskScore > 70).length, maliciousDomains: FEEDS.filter(f => f.type === 'domain' && f.riskScore > 70).length })
  }
  if (p === '/api/threat-intel/feeds' && method === 'GET') {
    const page = parseInt(params?.page as string) || 1
    const limit = parseInt(params?.limit as string) || 10
    let filtered = [...FEEDS]
    if (params?.type) filtered = filtered.filter(f => f.type === params.type)
    const start = (page - 1) * limit
    const total = filtered.length
    return ok(filtered.slice(start, start + limit), { page, limit, total, totalPages: Math.ceil(total / limit) })
  }
  const feedIdMatch = p.match(/^\/api\/threat-intel\/feeds\/(.+)$/)
  if (feedIdMatch && method === 'DELETE') return ok({ message: 'Feed entry deleted' })
  if (p === '/api/threat-intel/feeds' && method === 'POST') return ok({ id: 'f' + (FEEDS.length + 1), ...body, riskScore: body.riskScore || 50, isActive: true, createdAt: new Date().toISOString() })

  // Fallback
  return null
}

export function handleMockRequest(config: any): any {
  const result = match(config.url, (config.method || 'get').toUpperCase(), config.params, config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : undefined)
  if (result) {
    return result
  }
  if (config.method?.toLowerCase() === 'get') return ok({})
  return ok({ message: 'Mock: operation successful' })
}

export function isUsingMockData(): boolean {
  return typeof window !== 'undefined' && (window.location.hostname.includes('github.io') || window.location.hostname === 'localhost' && !localStorage.getItem('backend_running'))
}
