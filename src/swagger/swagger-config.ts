import { type Options } from 'swagger-jsdoc';

const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Home App API',
      version: '1.0.0',
      description: 'API documentation for the Home App backend',
    },
    servers: [
      {
        url: 'http://localhost:3004/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: `
JWT Bearer Token Authentication

**How to get token:**
1. Register via \`/api/user/register\` or login via \`/api/user/login\`
2. Copy the \`token\` from response
3. Click "Authorize" button above
4. Enter: \`Bearer <your-token>\`

**Example:** Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
            `
        }
      },
    },
    security: [
      {
        bearerAuth: []
      }
    ],
  },
  apis: [
    './src/docs/error-schemas.yaml',
    './src/docs/*.yaml',
  ],
};

export default swaggerOptions;
