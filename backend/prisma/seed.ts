import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const FIRST_NAMES = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Hank',
  'Ivy', 'Jack', 'Kate', 'Liam', 'Mona', 'Nate', 'Olivia', 'Paul',
  'Quinn', 'Rosa', 'Sam', 'Tina',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
];

const ATTACK_TYPES = [
  'DDoS', 'Phishing', 'Malware', 'Ransomware', 'SQL Injection',
  'XSS', 'Brute Force', 'Man-in-the-Middle', 'Zero-Day Exploit',
  'DNS Spoofing', 'Credential Stuffing', 'Insider Threat',
  'APT', 'Buffer Overflow', 'Social Engineering',
];

const SOURCE_IPS = [
  '192.168.1.105', '10.0.0.87', '172.16.0.54', '203.0.113.45', '198.51.100.23',
  '185.220.101.34', '91.121.87.156', '45.33.32.156', '104.248.50.88', '157.230.112.45',
  '167.99.89.123', '159.89.214.145', '178.62.76.34', '138.68.98.67', '165.227.45.89',
  '192.241.234.56', '159.65.123.78', '167.71.45.90', '178.128.56.34', '157.245.78.12',
  '103.235.46.89', '45.79.123.45', '106.51.234.56', '202.54.78.90', '89.45.67.123',
  '77.88.99.12', '195.78.45.67', '212.54.89.12', '85.12.34.56', '176.34.56.78',
  '54.89.123.45', '67.23.45.89', '89.123.45.67', '12.34.56.78', '98.76.54.32',
  '185.225.34.12', '91.234.56.78', '45.67.89.12', '167.89.12.34', '178.90.12.34',
];

const DESTINATION_IPS = [
  '10.0.1.100', '172.16.1.200', '192.168.2.50', '10.0.0.1', '172.16.0.1',
  '192.168.1.1', '10.0.0.5', '172.16.1.1', '192.168.2.1', '10.0.1.1',
];

const THREAT_TITLES = [
  'Suspicious outbound traffic detected', 'Potential data exfiltration attempt',
  'Malware beaconing to C2 server', 'Ransomware encryption activity detected',
  'Brute force attack on SSH service', 'SQL injection attempt on web application',
  'Cross-site scripting attack detected', 'DNS tunneling activity observed',
  'Unusual privilege escalation attempt', 'Port scan from unknown external IP',
  'Phishing campaign targeting employees', 'Man-in-the-middle attack detected',
  'Zero-day exploit targeting web server', 'Credential stuffing attack on VPN',
  'DNS spoofing attack in progress', 'DDoS attack targeting load balancer',
  'Suspicious PowerShell execution', 'Unauthorized access attempt detected',
  'Malicious file download blocked', 'Anomalous network traffic pattern',
  'Suspicious registry modification', 'Rogue device detected on network',
  'Unusual database query pattern', 'Suspicious email attachment opened',
  'Cleartext protocol detected in DMZ', 'Certificate authority compromise attempt',
  'Suspicious API call pattern detected', 'Unauthorized configuration change',
  'Memory scraping tool detected', 'Suspicious scheduled task created',
  'RDP brute force from foreign IP', 'Suspicious WMI execution detected',
  'Unusual outbound data volume', 'Potential account takeover detected',
  'Suspicious VPN connection attempt', 'Malicious macro execution detected',
  'Suspicious DNS query pattern', 'Potential insider data theft',
  'Suspicious service installation', 'Unusual process injection detected',
];

const INCIDENT_TITLES = [
  'Active ransomware outbreak response', 'Critical data breach investigation',
  'DDoS mitigation in progress', 'Phishing incident response',
  'Malware outbreak containment', 'Zero-day exploit response',
  'Insider threat investigation', 'Network intrusion response',
  'Account compromise investigation', 'Ransomware recovery operation',
  'SQL injection incident response', 'Social engineering attack response',
  'Credential theft investigation', 'APT activity response',
  'DNS attack mitigation',
];

const FEED_IPS = [
  '185.220.101.34', '91.121.87.156', '45.33.32.156', '104.248.50.88',
  '157.230.112.45', '167.99.89.123', '159.89.214.145', '178.62.76.34',
  '138.68.98.67', '165.227.45.89', '192.241.234.56', '159.65.123.78',
  '167.71.45.90', '178.128.56.34', '157.245.78.12',
];

const FEED_DOMAINS = [
  'malware-c2.example.com', 'phishing-portal.net', 'evil-hosting.org',
  'botnet-control.xyz', 'ransomware-payload.io', 'data-exfil.biz',
  'credential-stealer.net', 'apt-group.org', 'dark-web-market.io',
  'malicious-download.xyz', 'spam-relay.net', 'ddos-command.io',
];

const FEED_COUNTRIES = ['RU', 'CN', 'KP', 'IR', 'NG', 'UA', 'RO', 'BR'];

const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const THREAT_STATUSES = ['NEW', 'INVESTIGATING', 'MITIGATED', 'RESOLVED'];
const PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const INCIDENT_STATUSES = ['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED'];
const ROLES = ['ADMIN', 'ANALYST', 'VIEWER'];

function randomDate(daysBack: number): Date {
  const now = new Date();
  const past = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

async function seed() {
  console.log('🌱 Starting SecureWatch seed...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.session.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.threat.deleteMany();
  await prisma.threatFeed.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleaned existing data');

  // Create users
  const hashedPassword = await bcrypt.hash('SecureWatch123!', 12);
  const users: any[] = [];

  const userData = [
    { email: 'admin@securewatch.io', firstName: 'Alice', lastName: 'Smith', role: 'ADMIN' },
    { email: 'analyst1@securewatch.io', firstName: 'Bob', lastName: 'Johnson', role: 'ANALYST' },
    { email: 'analyst2@securewatch.io', firstName: 'Charlie', lastName: 'Williams', role: 'ANALYST' },
    { email: 'analyst3@securewatch.io', firstName: 'Diana', lastName: 'Brown', role: 'ANALYST' },
    { email: 'analyst4@securewatch.io', firstName: 'Eve', lastName: 'Jones', role: 'ANALYST' },
    { email: 'analyst5@securewatch.io', firstName: 'Frank', lastName: 'Garcia', role: 'ANALYST' },
  ];

  for (let i = 0; i < 14; i++) {
    userData.push({
      email: `viewer${i + 1}@securewatch.io`,
      firstName: FIRST_NAMES[i + 6],
      lastName: LAST_NAMES[i + 6],
      role: 'VIEWER' as const,
    });
  }

  for (const data of userData) {
    const lastLogin = Math.random() > 0.3 ? randomDate(7) : null;
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        isActive: data.role === 'ADMIN' ? true : Math.random() > 0.1,
        lastLogin,
        createdAt: randomDate(60),
      },
    });
    users.push(user);
  }

  console.log(`✅ Created ${users.length} users (1 admin, 5 analysts, 14 viewers)`);

  const analysts = users.filter(u => u.role === 'ANALYST');
  const admins = users.filter(u => u.role === 'ADMIN');
  const allUsers = users;

  // Create threats
  const threats: any[] = [];
  for (let i = 0; i < 100; i++) {
    const createdAt = randomDate(30);
    const severity = (() => {
      const r = Math.random();
      if (r < 0.15) return 'CRITICAL';
      if (r < 0.35) return 'HIGH';
      if (r < 0.65) return 'MEDIUM';
      return 'LOW';
    })();

    const status = (() => {
      const r = Math.random();
      if (createdAt < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        return r < 0.1 ? 'NEW' : r < 0.25 ? 'INVESTIGATING' : r < 0.5 ? 'MITIGATED' : 'RESOLVED';
      }
      return r < 0.4 ? 'NEW' : r < 0.7 ? 'INVESTIGATING' : r < 0.85 ? 'MITIGATED' : 'RESOLVED';
    })();

    const assignedTo = status !== 'NEW' && analysts.length > 0 ? randomItem(analysts) : null;

    const threat = await prisma.threat.create({
      data: {
        title: randomItem(THREAT_TITLES),
        description: `Detected ${randomItem(ATTACK_TYPES).toLowerCase()} activity from IP ${randomItem(SOURCE_IPS)}. ${severity === 'CRITICAL' ? 'Immediate action required.' : 'Investigation recommended.'}`,
        sourceIP: randomItem(SOURCE_IPS),
        destinationIP: Math.random() > 0.4 ? randomItem(DESTINATION_IPS) : null,
        attackType: randomItem(ATTACK_TYPES),
        severity,
        status,
        assignedToId: assignedTo?.id || null,
        assignedAnalyst: assignedTo ? `${assignedTo.firstName} ${assignedTo.lastName}` : null,
        createdAt,
        updatedAt: new Date(createdAt.getTime() + randomInt(1, 48) * 60 * 60 * 1000),
      },
    });
    threats.push(threat);
  }

  console.log(`✅ Created ${threats.length} threats`);

  // Create incidents
  const incidents: any[] = [];
  for (let i = 0; i < 50; i++) {
    const createdAt = randomDate(25);
    const priority = (() => {
      const r = Math.random();
      if (r < 0.2) return 'CRITICAL';
      if (r < 0.45) return 'HIGH';
      if (r < 0.7) return 'MEDIUM';
      return 'LOW';
    })();

    const status = createdAt < new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      ? (['RESOLVED', 'CLOSED', 'INVESTIGATING'])[Math.floor(Math.random() * 3)]
      : (['OPEN', 'INVESTIGATING'])[Math.floor(Math.random() * 2)];

    const relatedThreat = Math.random() > 0.3 ? randomItem(threats) : null;
    const assignedUser = Math.random() > 0.4 ? randomItem(analysts) : null;
    const createdBy = randomItem(allUsers.filter(u => u.role !== 'VIEWER'));

    const incident = await prisma.incident.create({
      data: {
        title: randomItem(INCIDENT_TITLES),
        description: `Incident related to threat analysis. Priority level: ${priority.toLowerCase()}. Action required from assigned team.`,
        priority,
        status,
        threatId: relatedThreat?.id || null,
        assignedToId: assignedUser?.id || null,
        createdById: createdBy.id,
        notes: Math.random() > 0.5 ? `Investigation notes: Initial analysis indicates ${randomItem(ATTACK_TYPES).toLowerCase()} activity.` : null,
        closedAt: status === 'CLOSED' || status === 'RESOLVED' ? new Date(createdAt.getTime() + randomInt(24, 72) * 60 * 60 * 1000) : null,
        createdAt,
        updatedAt: new Date(createdAt.getTime() + randomInt(1, 24) * 60 * 60 * 1000),
      },
    });
    incidents.push(incident);
  }

  console.log(`✅ Created ${incidents.length} incidents`);

  // Create audit logs
  const actions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW', 'EXPORT'];
  const entities = ['User', 'Threat', 'Incident', 'Notification', 'AuditLog', 'ThreatFeed'];

  for (let i = 0; i < 200; i++) {
    const user = randomItem(allUsers);
    const action = randomItem(actions);
    const entity = randomItem(entities);

    let entityId = null;
    let details = null;
    if (entity === 'Threat' && threats.length > 0) {
      const t = randomItem(threats);
      entityId = t.id;
      details = JSON.stringify({ title: t.title, severity: t.severity });
    } else if (entity === 'Incident' && incidents.length > 0) {
      const inc = randomItem(incidents);
      entityId = inc.id;
      details = JSON.stringify({ title: inc.title, priority: inc.priority });
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        action,
        entity,
        entityId,
        details,
        ipAddress: `192.168.${randomInt(1, 254)}.${randomInt(1, 254)}`,
        createdAt: randomDate(30),
      },
    });
  }

  console.log('✅ Created 200 audit logs');

  // Create notifications
  const notificationTypes = ['info', 'warning', 'critical', 'assignment', 'incident'];
  const notificationMessages = [
    'New threat detected in your assigned queue',
    'Critical vulnerability identified in network',
    'Incident assigned to your team',
    'Weekly security report is ready',
    'Threat feed updated with new indicators',
    'Password expiration reminder',
    'System maintenance scheduled',
    'New security policy requires review',
    'Suspicious login attempt detected',
    'Security patch available for deployment',
  ];

  for (let i = 0; i < 50; i++) {
    const user = randomItem(allUsers);
    const isRecent = i < 20;

    await prisma.notification.create({
      data: {
        userId: user.id,
        title: randomItem(notificationMessages),
        message: `Details: ${randomItem(notificationMessages)}. Please review and take appropriate action.`,
        type: randomItem(notificationTypes),
        read: isRecent ? Math.random() > 0.7 : Math.random() > 0.3,
        link: Math.random() > 0.4 ? `/threats/${randomItem(threats)?.id || ''}` : null,
        createdAt: isRecent ? randomDate(2) : randomDate(15),
      },
    });
  }

  console.log('✅ Created 50 notifications');

  // Create threat feeds
  const feedDescriptions = [
    'Known C2 server - report as malicious',
    'Phishing campaign infrastructure',
    'Ransomware distribution endpoint',
    'Botnet command and control',
    'Malware download server',
    'Data exfiltration endpoint',
    'Credential harvesting site',
    'APT group infrastructure',
    'Dark web marketplace',
    'Spam relay server',
  ];

  for (const ip of FEED_IPS) {
    await prisma.threatFeed.create({
      data: {
        type: 'ip',
        value: ip,
        description: randomItem(feedDescriptions),
        riskScore: randomInt(60, 100),
        isActive: Math.random() > 0.15,
        source: randomItem(['internal', 'alienvault', 'virustotal', 'abuseipdb', 'threatfox']),
      },
    });
  }

  for (const domain of FEED_DOMAINS) {
    await prisma.threatFeed.create({
      data: {
        type: 'domain',
        value: domain,
        description: randomItem(feedDescriptions),
        riskScore: randomInt(50, 95),
        isActive: Math.random() > 0.1,
        source: randomItem(['internal', 'alienvault', 'virustotal', 'threatfox']),
      },
    });
  }

  for (const country of FEED_COUNTRIES) {
    const feedCount = Math.random() > 0.5 ? 1 : 0;
    if (feedCount > 0) {
      await prisma.threatFeed.create({
        data: {
          type: 'country',
          value: country,
          description: `High-risk threat origin country - ${country}`,
          riskScore: randomInt(40, 90),
          isActive: true,
          source: 'internal',
        },
      });
    }
  }

  console.log(`✅ Created ${FEED_IPS.length + FEED_DOMAINS.length + (FEED_COUNTRIES.length > 0 ? Math.ceil(FEED_COUNTRIES.length / 2) : 0)} threat feeds`);

  // Create sessions for recent activity
  for (let i = 0; i < 10; i++) {
    const user = randomItem(allUsers);
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: `seed-refresh-${user.id}-${i}-${Date.now()}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ipAddress: `192.168.${randomInt(1, 254)}.${randomInt(1, 254)}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: randomDate(2),
      },
    });
  }

  console.log('✅ Created 10 sessions');
  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('Default password for all users: SecureWatch123!');
  console.log('Admin email: admin@securewatch.io');
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
