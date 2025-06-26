const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

// Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Eureka API - Sistema de Preparação para Exames',
      version: '1.0.0',
      description: 'API RESTful para o sistema Eureka de preparação para exames educacionais angolanos',
      contact: {
        name: 'Equipa Eureka',
        email: 'suporte@eureka.ao'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001/api/v1',
        description: 'Servidor de Desenvolvimento'
      }
    ],
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
    path.join(__dirname, '..', 'routes', '*.ts'),
    path.join(__dirname, '..', 'controllers', '*.ts'),
    path.join(__dirname, '..', 'models', '*.ts'),
    path.join(__dirname, '..', 'schemas', 'openapi-schemas.ts')
  ]
};

console.log('🔍 Verificando arquivos de documentação...');
console.log('📁 Caminhos dos arquivos:');
swaggerOptions.apis.forEach(api => {
  console.log(`  - ${api}`);
});

try {
  console.log('\n📝 Gerando especificação Swagger...');
  const specs = swaggerJsdoc(swaggerOptions);
  
  console.log('\n✅ Especificação gerada com sucesso!');
  console.log(`📊 Total de endpoints encontrados: ${specs.paths ? Object.keys(specs.paths).length : 0}`);
  
  if (specs.paths) {
    console.log('\n📋 Endpoints encontrados:');
    Object.keys(specs.paths).forEach(path => {
      const methods = Object.keys(specs.paths[path]);
      methods.forEach(method => {
        const endpoint = specs.paths[path][method];
        console.log(`  ${method.toUpperCase()} ${path} - ${endpoint.summary || 'Sem descrição'}`);
      });
    });
  }
  
  console.log('\n📄 Salvando especificação em arquivo...');
  const fs = require('fs');
  fs.writeFileSync(
    path.join(__dirname, '..', 'swagger-spec.json'),
    JSON.stringify(specs, null, 2)
  );
  console.log('✅ Especificação salva em swagger-spec.json');
  
} catch (error) {
  console.error('❌ Erro ao gerar especificação:', error.message);
  console.error('Stack trace:', error.stack);
} 