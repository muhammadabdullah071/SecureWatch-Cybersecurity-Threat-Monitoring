import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SecureWatch - Cybersecurity Threat Monitoring Dashboard API',
      version: '1.0.0',
      description: 'RESTful API for the SecureWatch cybersecurity threat monitoring platform. Provides endpoints for threat detection, incident management, user administration, and security analytics.',
      contact: {
        name: 'SecureWatch Team',
        email: 'support@securewatch.io',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' },
            hasNextPage: { type: 'boolean' },
            hasPreviousPage: { type: 'boolean' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string', enum: ['ADMIN', 'ANALYST', 'VIEWER'] },
            isActive: { type: 'boolean' },
            lastLogin: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Threat: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            sourceIP: { type: 'string' },
            destinationIP: { type: 'string' },
            attackType: { type: 'string' },
            severity: { type: 'string', enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] },
            status: { type: 'string', enum: ['NEW', 'INVESTIGATING', 'MITIGATED', 'RESOLVED'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Incident: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            priority: { type: 'string', enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] },
            status: { type: 'string', enum: ['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED'] },
            threatId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            message: { type: 'string' },
            type: { type: 'string' },
            read: { type: 'boolean' },
            link: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        AuditLog: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            userEmail: { type: 'string' },
            action: { type: 'string' },
            entity: { type: 'string' },
            entityId: { type: 'string' },
            details: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ThreatFeed: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['ip', 'domain', 'country'] },
            value: { type: 'string' },
            description: { type: 'string' },
            riskScore: { type: 'integer' },
            isActive: { type: 'boolean' },
            source: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    paths: {
      '/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password', 'firstName', 'lastName'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    role: { type: 'string', enum: ['ADMIN', 'ANALYST', 'VIEWER'] },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Registration successful' },
            '409': { description: 'Email already registered' },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Login with credentials',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Login successful' },
            '401': { description: 'Invalid credentials' },
          },
        },
      },
      '/auth/logout': {
        post: {
          tags: ['Authentication'],
          summary: 'Logout and invalidate session',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['refreshToken'],
                  properties: {
                    refreshToken: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Logout successful' },
          },
        },
      },
      '/auth/refresh-token': {
        post: {
          tags: ['Authentication'],
          summary: 'Refresh access token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['refreshToken'],
                  properties: {
                    refreshToken: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Token refreshed' },
            '401': { description: 'Invalid refresh token' },
          },
        },
      },
      '/auth/forgot-password': {
        post: {
          tags: ['Authentication'],
          summary: 'Request password reset',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                  },
                },
              },
            },
          },
          responses: { '200': { description: 'Reset email sent' } },
        },
      },
      '/auth/reset-password': {
        post: {
          tags: ['Authentication'],
          summary: 'Reset password with token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['token', 'password'],
                  properties: {
                    token: { type: 'string' },
                    password: { type: 'string', minLength: 8 },
                  },
                },
              },
            },
          },
          responses: { '200': { description: 'Password reset successful' } },
        },
      },
      '/auth/change-password': {
        post: {
          tags: ['Authentication'],
          summary: 'Change password',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['oldPassword', 'newPassword'],
                  properties: {
                    oldPassword: { type: 'string' },
                    newPassword: { type: 'string', minLength: 8 },
                  },
                },
              },
            },
          },
          responses: { '200': { description: 'Password changed' } },
        },
      },
      '/auth/profile': {
        get: {
          tags: ['Authentication'],
          summary: 'Get current user profile',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Profile data' },
            '401': { description: 'Unauthorized' },
          },
        },
      },
      '/threats': {
        get: {
          tags: ['Threats'],
          summary: 'List all threats',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'severity', in: 'query', schema: { type: 'string', enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['NEW', 'INVESTIGATING', 'MITIGATED', 'RESOLVED'] } },
            { name: 'attackType', in: 'query', schema: { type: 'string' } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
          ],
          responses: { '200': { description: 'List of threats' } },
        },
        post: {
          tags: ['Threats'],
          summary: 'Create a new threat',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'description', 'sourceIP', 'attackType'],
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    sourceIP: { type: 'string' },
                    destinationIP: { type: 'string' },
                    attackType: { type: 'string' },
                    severity: { type: 'string', enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] },
                  },
                },
              },
            },
          },
          responses: { '201': { description: 'Threat created' } },
        },
      },
      '/threats/stats': {
        get: {
          tags: ['Threats'],
          summary: 'Get threat statistics',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Threat statistics' } },
        },
      },
      '/threats/{id}': {
        get: {
          tags: ['Threats'],
          summary: 'Get threat by ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            '200': { description: 'Threat details' },
            '404': { description: 'Threat not found' },
          },
        },
        put: {
          tags: ['Threats'],
          summary: 'Update a threat',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    severity: { type: 'string', enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] },
                    status: { type: 'string', enum: ['NEW', 'INVESTIGATING', 'MITIGATED', 'RESOLVED'] },
                  },
                },
              },
            },
          },
          responses: { '200': { description: 'Threat updated' } },
        },
        delete: {
          tags: ['Threats'],
          summary: 'Delete a threat',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: { '200': { description: 'Threat deleted' } },
        },
      },
      '/incidents': {
        get: {
          tags: ['Incidents'],
          summary: 'List all incidents',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'priority', in: 'query', schema: { type: 'string', enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED'] } },
          ],
          responses: { '200': { description: 'List of incidents' } },
        },
        post: {
          tags: ['Incidents'],
          summary: 'Create a new incident',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'description'],
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    priority: { type: 'string', enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] },
                    threatId: { type: 'string', format: 'uuid' },
                    assignedToId: { type: 'string', format: 'uuid' },
                  },
                },
              },
            },
          },
          responses: { '201': { description: 'Incident created' } },
        },
      },
      '/incidents/stats': {
        get: {
          tags: ['Incidents'],
          summary: 'Get incident statistics',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Incident statistics' } },
        },
      },
      '/incidents/{id}': {
        get: {
          tags: ['Incidents'],
          summary: 'Get incident by ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: { '200': { description: 'Incident details' } },
        },
        put: {
          tags: ['Incidents'],
          summary: 'Update an incident',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: { '200': { description: 'Incident updated' } },
        },
      },
      '/incidents/{id}/close': {
        patch: {
          tags: ['Incidents'],
          summary: 'Close an incident',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: { '200': { description: 'Incident closed' } },
        },
      },
      '/users': {
        get: {
          tags: ['Users'],
          summary: 'List all users (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'role', in: 'query', schema: { type: 'string', enum: ['ADMIN', 'ANALYST', 'VIEWER'] } },
          ],
          responses: { '200': { description: 'List of users' } },
        },
        post: {
          tags: ['Users'],
          summary: 'Create user (Admin only)',
          security: [{ bearerAuth: [] }],
          responses: { '201': { description: 'User created' } },
        },
      },
      '/users/me': {
        get: {
          tags: ['Users'],
          summary: 'Get current user profile',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'User profile' } },
        },
        patch: {
          tags: ['Users'],
          summary: 'Update current user profile',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Profile updated' } },
        },
      },
      '/users/{id}': {
        get: {
          tags: ['Users'],
          summary: 'Get user by ID (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: { '200': { description: 'User details' } },
        },
        put: {
          tags: ['Users'],
          summary: 'Update user (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: { '200': { description: 'User updated' } },
        },
        delete: {
          tags: ['Users'],
          summary: 'Deactivate user (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: { '200': { description: 'User deactivated' } },
        },
      },
      '/analytics/dashboard': {
        get: {
          tags: ['Analytics'],
          summary: 'Get dashboard statistics',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Dashboard stats' } },
        },
      },
      '/analytics/threats-by-month': {
        get: {
          tags: ['Analytics'],
          summary: 'Get threats grouped by month',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Monthly threat data' } },
        },
      },
      '/analytics/severity-distribution': {
        get: {
          tags: ['Analytics'],
          summary: 'Get threat severity distribution',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Severity distribution' } },
        },
      },
      '/analytics/attack-types': {
        get: {
          tags: ['Analytics'],
          summary: 'Get attack type distribution',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Attack types' } },
        },
      },
      '/analytics/top-threat-sources': {
        get: {
          tags: ['Analytics'],
          summary: 'Get top threat source IPs',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Top sources' } },
        },
      },
      '/analytics/resolution-time': {
        get: {
          tags: ['Analytics'],
          summary: 'Get incident resolution time stats',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Resolution time stats' } },
        },
      },
      '/notifications': {
        get: {
          tags: ['Notifications'],
          summary: 'Get user notifications',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          ],
          responses: { '200': { description: 'List of notifications' } },
        },
      },
      '/notifications/unread-count': {
        get: {
          tags: ['Notifications'],
          summary: 'Get unread notification count',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Unread count' } },
        },
      },
      '/notifications/read-all': {
        patch: {
          tags: ['Notifications'],
          summary: 'Mark all notifications as read',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'All marked as read' } },
        },
      },
      '/notifications/{id}/read': {
        patch: {
          tags: ['Notifications'],
          summary: 'Mark notification as read',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: { '200': { description: 'Marked as read' } },
        },
      },
      '/audit-logs': {
        get: {
          tags: ['Audit Logs'],
          summary: 'List audit logs (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
            { name: 'action', in: 'query', schema: { type: 'string' } },
            { name: 'entity', in: 'query', schema: { type: 'string' } },
            { name: 'userId', in: 'query', schema: { type: 'string' } },
          ],
          responses: { '200': { description: 'List of audit logs' } },
        },
      },
      '/audit-logs/{id}': {
        get: {
          tags: ['Audit Logs'],
          summary: 'Get audit log by ID (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: { '200': { description: 'Audit log details' } },
        },
      },
      '/threat-intel/feeds': {
        get: {
          tags: ['Threat Intelligence'],
          summary: 'List threat feeds',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'List of threat feeds' } },
        },
        post: {
          tags: ['Threat Intelligence'],
          summary: 'Add threat feed entry',
          security: [{ bearerAuth: [] }],
          responses: { '201': { description: 'Feed entry created' } },
        },
      },
      '/threat-intel/feeds/stats': {
        get: {
          tags: ['Threat Intelligence'],
          summary: 'Get threat feed statistics',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Feed statistics' } },
        },
      },
      '/threat-intel/feeds/{id}': {
        delete: {
          tags: ['Threat Intelligence'],
          summary: 'Delete threat feed entry (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: { '200': { description: 'Feed deleted' } },
        },
      },
      '/threat-intel/search/ip/{ip}': {
        get: {
          tags: ['Threat Intelligence'],
          summary: 'Search IP address in threat feeds',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'ip', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: { '200': { description: 'IP search results' } },
        },
      },
      '/threat-intel/search/domain/{domain}': {
        get: {
          tags: ['Threat Intelligence'],
          summary: 'Search domain in threat feeds',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'domain', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: { '200': { description: 'Domain search results' } },
        },
      },
      '/threat-intel/search/country/{country}': {
        get: {
          tags: ['Threat Intelligence'],
          summary: 'Search country in threat feeds',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'country', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: { '200': { description: 'Country search results' } },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
