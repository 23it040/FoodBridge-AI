import swaggerJsdoc from 'swagger-jsdoc';
import env from './env.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FoodBridge AI API',
      version: '1.0.0',
      description:
        'Production REST API for FoodBridge AI — a platform connecting food donors with NGOs to reduce food waste.',
      contact: {
        name: 'FoodBridge AI Team',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.port}/api/v1`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            statusCode: { type: 'integer' },
            message: { type: 'string' },
            data: { type: 'object' },
            meta: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            statusCode: { type: 'integer' },
            message: { type: 'string' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'role', 'profile'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            role: { type: 'string', enum: ['donor', 'ngo', 'volunteer'] },
            profile: { type: 'object' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        Donation: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            category: { type: 'string' },
            quantity: { type: 'number' },
            status: { type: 'string' },
          },
        },
      },
    },
    tags: [
      { name: 'Health', description: 'API health checks' },
      { name: 'Auth', description: 'Authentication & authorization' },
      { name: 'Users', description: 'User profile & admin management' },
      { name: 'Donations', description: 'Food donation listings' },
      { name: 'Requests', description: 'NGO food requests & pickups' },
      { name: 'Notifications', description: 'In-app notifications' },
      { name: 'Reviews', description: 'Post-pickup reviews' },
      { name: 'Analytics', description: 'Dashboard metrics' },
      { name: 'AI', description: 'AI recommendations & uploads' },
    ],
    paths: {
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check',
          responses: {
            200: { description: 'API is healthy' },
          },
        },
      },
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterRequest' },
              },
            },
          },
          responses: {
            201: { description: 'User registered successfully' },
            400: { description: 'Validation error' },
            409: { description: 'Email already exists' },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' },
              },
            },
          },
          responses: {
            200: { description: 'Login successful' },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get current user profile',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Profile fetched' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/donations': {
        get: {
          tags: ['Donations'],
          summary: 'List donations',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
            { name: 'status', in: 'query', schema: { type: 'string' } },
            { name: 'longitude', in: 'query', schema: { type: 'number' } },
            { name: 'latitude', in: 'query', schema: { type: 'number' } },
            { name: 'radiusKm', in: 'query', schema: { type: 'number' } },
          ],
          responses: {
            200: { description: 'Donations list' },
          },
        },
        post: {
          tags: ['Donations'],
          summary: 'Create a donation',
          security: [{ bearerAuth: [] }],
          responses: {
            201: { description: 'Donation created' },
          },
        },
      },
      '/requests/demand': {
        post: {
          tags: ['Requests'],
          summary: 'Create a demand request (NGO)',
          security: [{ bearerAuth: [] }],
          responses: {
            201: { description: 'Demand request created' },
          },
        },
      },
      '/requests/pickup': {
        post: {
          tags: ['Requests'],
          summary: 'Request pickup for a donation (NGO)',
          security: [{ bearerAuth: [] }],
          responses: {
            201: { description: 'Pickup request created' },
          },
        },
      },
      '/ai/recommendations/{donationId}': {
        get: {
          tags: ['AI'],
          summary: 'Get AI NGO recommendations for a donation',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'donationId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: { description: 'Recommendations generated' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
