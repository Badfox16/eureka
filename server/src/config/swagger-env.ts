import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

interface SwaggerConfig {
  title: string;
  version: string;
  description: string;
  servers: Array<{
    url: string;
    description: string;
  }>;
  contact: {
    name: string;
    email: string;
  };
}

type Environment = 'development' | 'production' | 'staging' | 'test';

const createSwaggerConfig = (): SwaggerConfig => {
  const env = (process.env.NODE_ENV || 'development') as Environment;
  
  const baseConfig = {
    title: 'Eureka API - Sistema de Preparação para Exames',
    version: '1.1.0',
    description: 'API RESTful para o sistema Eureka de preparação para exames educacionais moçambicanos.',
    contact: {
      name: 'Equipa Eureka',
      email: 'mutizodejmaita@gmail.com'
    }
  };

  switch (env) {
    case 'production':
      return {
        ...baseConfig,
        servers: [
          {
            url: 'https://api.eurekamz.tech/v1',
            description: 'Servidor de Produção'
          }
        ]
      };
    
    case 'staging':
      return {
        ...baseConfig,
        servers: [
          {
            url: 'https://staging-api.eurekamz.tech/v1',
            description: 'Servidor de Staging'
          }
        ]
      };
    
    case 'test':
      return {
        ...baseConfig,
        servers: [
          {
            url: 'http://localhost:6199/api/v1',
            description: 'Servidor de Teste'
          }
        ]
      };
    
    default: // development
      return {
        ...baseConfig,
        servers: [
          {
            url: 'http://localhost:6199/api/v1',
            description: 'Servidor de Desenvolvimento'
          },
          {
            url: 'http://localhost:3001/api/v1',
            description: 'Servidor Alternativo'
          }
        ]
      };
  }
};

const createSwaggerOptions = (): swaggerJsdoc.Options => {
  const config = createSwaggerConfig();
  
  // Obter o diretório raiz do servidor
  const serverRoot = path.resolve(__dirname, '..');
  
  return {
    definition: {
      openapi: '3.0.0',
      info: {
        title: config.title,
        version: config.version,
        description: config.description,
        contact: config.contact,
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT'
        }
      },
      servers: config.servers,
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Token JWT para autenticação'
          }
        },
        schemas: {
          // Schemas de erro
          Error: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                example: 'error'
              },
              message: {
                type: 'string',
                example: 'Mensagem de erro'
              }
            }
          },
          // Schemas de sucesso
          Success: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                example: 'success'
              },
              message: {
                type: 'string',
                example: 'Operação realizada com sucesso'
              }
            }
          },
          // Schema de paginação
          Pagination: {
            type: 'object',
            properties: {
              page: {
                type: 'number',
                example: 1
              },
              limit: {
                type: 'number',
                example: 10
              },
              total: {
                type: 'number',
                example: 100
              },
              totalPages: {
                type: 'number',
                example: 10
              }
            }
          }
        }
      },
      security: [
        {
          bearerAuth: []
        }
      ]
    },
    apis: [
      path.join(serverRoot, 'routes', '*.ts'),
      path.join(serverRoot, 'controllers', '*.ts'),
      path.join(serverRoot, 'models', '*.ts'),
      path.join(serverRoot, 'schemas', 'openapi-schemas.ts')
    ]
  };
};

export const swaggerOptions = createSwaggerOptions();
export const getSwaggerConfig = createSwaggerConfig; 