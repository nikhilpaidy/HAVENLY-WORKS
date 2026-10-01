export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'AURA Coworking & Meeting Room Management API',
    version: '1.0.0',
    description:
      'Production-grade RESTful API for multi-tenant physical coworking spaces, meeting room slot reservations, corporate allowance accounting, and offline payment audit trails.'
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Local Development Server'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token'
      }
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Detailed error explanation' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'paidynikhil@gmail.com' },
          password: { type: 'string', example: 'Nikhil@123' }
        }
      },
      BookingRequest: {
        type: 'object',
        required: ['roomId', 'title', 'attendeeCount', 'startTime', 'endTime'],
        properties: {
          roomId: { type: 'string', example: '67b...room' },
          title: { type: 'string', example: 'Board of Directors Strategy' },
          purpose: { type: 'string', example: 'Quarterly review' },
          attendeeCount: { type: 'integer', example: 6 },
          startTime: { type: 'string', format: 'date-time', example: '2026-11-01T10:00:00Z' },
          endTime: { type: 'string', format: 'date-time', example: '2026-11-01T11:30:00Z' }
        }
      }
    }
  },
  security: [{ BearerAuth: [] }],
  paths: {
    '/health': {
      get: {
        summary: 'System Health Check',
        tags: ['Health'],
        security: [],
        responses: {
          200: { description: 'System healthy and database connected' }
        }
      }
    },
    '/auth/login': {
      post: {
        summary: 'Authenticate User and obtain JWT session token',
        tags: ['Auth'],
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } }
        },
        responses: {
          200: { description: 'Successful login returning user profile and access token' },
          401: { description: 'Invalid email or password' }
        }
      }
    },
    '/auth/me': {
      get: {
        summary: 'Get current user profile and company permissions',
        tags: ['Auth'],
        responses: {
          200: { description: 'User profile returned' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/super-admin/admins': {
      get: {
        summary: 'List coworking administrators (Super Admin)',
        tags: ['Super Admin'],
        responses: { 200: { description: 'List of admins' } }
      },
      post: {
        summary: 'Onboard a new coworking admin',
        tags: ['Super Admin'],
        responses: { 201: { description: 'Admin created' } }
      }
    },
    '/organizations': {
      get: {
        summary: 'List all coworking organizations / brands',
        tags: ['Organizations'],
        responses: { 200: { description: 'List of organizations' } }
      },
      post: {
        summary: 'Create a new coworking organization',
        tags: ['Organizations'],
        responses: { 201: { description: 'Organization registered' } }
      }
    },
    '/locations': {
      get: {
        summary: 'List physical hub locations and business hours',
        tags: ['Locations'],
        responses: { 200: { description: 'Hub locations list' } }
      },
      post: {
        summary: 'Add a physical hub location',
        tags: ['Locations'],
        responses: { 201: { description: 'Location created' } }
      }
    },
    '/rooms': {
      get: {
        summary: 'List meeting rooms with filter by location',
        tags: ['Meeting Rooms'],
        parameters: [
          { name: 'locationId', in: 'query', schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'List of rooms' } }
      },
      post: {
        summary: 'Create a meeting room with buffer times and capacity',
        tags: ['Meeting Rooms'],
        responses: { 201: { description: 'Meeting room created' } }
      }
    },
    '/rooms/{id}/maintenance': {
      post: {
        summary: 'Add downtime maintenance window to room',
        tags: ['Meeting Rooms'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Maintenance window locked' } }
      }
    },
    '/availability/{roomId}': {
      get: {
        summary: 'Check live slot availability for a specific room and date',
        tags: ['Availability'],
        parameters: [
          { name: 'roomId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'date', in: 'query', required: true, schema: { type: 'string', example: '2026-11-01' } }
        ],
        responses: { 200: { description: 'Hourly slots with availability and reservation reasons' } }
      }
    },
    '/companies': {
      get: {
        summary: 'List client companies and allowance configurations',
        tags: ['Companies'],
        responses: { 200: { description: 'List of client companies' } }
      },
      post: {
        summary: 'Onboard a client company with owner credentials and free-hour pool',
        tags: ['Companies'],
        responses: { 201: { description: 'Company onboarded' } }
      }
    },
    '/bookings': {
      get: {
        summary: 'List bookings (scoped by role: all for admin, company for client)',
        tags: ['Bookings'],
        parameters: [
          { name: 'scope', in: 'query', schema: { type: 'string', enum: ['upcoming', 'past'] } }
        ],
        responses: { 200: { description: 'List of reservations' } }
      },
      post: {
        summary: 'Create atomic reservation with quota ledger deduction and slot locking',
        tags: ['Bookings'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/BookingRequest' } } }
        },
        responses: {
          201: { description: 'Reservation confirmed' },
          409: { description: 'Slot conflict or concurrent reservation collision' }
        }
      }
    },
    '/bookings/{id}/cancel': {
      post: {
        summary: 'Cancel an active reservation and refund free allowance hours',
        tags: ['Bookings'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Reservation cancelled and inventory released' } }
      }
    },
    '/bookings/{id}/check-in': {
      post: {
        summary: 'Check in attendees for an upcoming reservation',
        tags: ['Bookings'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Checked in successfully' } }
      }
    },
    '/allowances/current': {
      get: {
        summary: 'Retrieve company active allowance pool and remaining hours',
        tags: ['Allowances'],
        responses: { 200: { description: 'Current allowance period data' } }
      }
    },
    '/allowances/history': {
      get: {
        summary: 'Retrieve double-entry allowance quota ledger entries',
        tags: ['Allowances'],
        responses: { 200: { description: 'Ledger history' } }
      }
    },
    '/allowances/estimate': {
      post: {
        summary: 'Simulate allowance deduction vs overage billing before confirmation',
        tags: ['Allowances'],
        responses: { 200: { description: 'Estimated allowance application' } }
      }
    },
    '/billing': {
      get: {
        summary: 'List billing statements and invoices',
        tags: ['Billing'],
        responses: { 200: { description: 'Invoices list' } }
      }
    },
    '/billing/generate': {
      post: {
        summary: 'Generate monthly statement from billable room overages (Admin)',
        tags: ['Billing'],
        responses: { 201: { description: 'Invoice statement created' } }
      }
    },
    '/payments/record': {
      post: {
        summary: 'Record manual collection (ACH, wire, POS, check) with audit trail',
        tags: ['Payments'],
        responses: { 201: { description: 'Payment recorded pending verification' } }
      }
    },
    '/payments/{id}/verify': {
      post: {
        summary: 'Verify manual payment by administrator',
        tags: ['Payments'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Payment verified and ledger reconciled' } }
      }
    },
    '/reports/super-admin': {
      get: {
        summary: 'Platform-wide operational analytics',
        tags: ['Reports'],
        responses: { 200: { description: 'Super Admin metrics' } }
      }
    },
    '/reports/admin': {
      get: {
        summary: 'Hub room utilization and company quota ratios',
        tags: ['Reports'],
        responses: { 200: { description: 'Hub analytics' } }
      }
    },
    '/blogs': {
      get: {
        summary: 'Public blog posts for marketing website',
        tags: ['Blogs'],
        security: [],
        responses: { 200: { description: 'Published blog posts' } }
      }
    },
    '/blogs/{slug}': {
      get: {
        summary: 'Read single published blog article by slug',
        tags: ['Blogs'],
        security: [],
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Blog article details' } }
      }
    },
    '/notifications': {
      get: {
        summary: 'Retrieve user in-app activity notifications',
        tags: ['Notifications'],
        responses: { 200: { description: 'Notifications array' } }
      }
    }
  }
};
