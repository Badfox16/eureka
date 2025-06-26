#!/usr/bin/env node

/**
 * Script para gerar documentação da API
 * 
 * Uso:
 * node scripts/generate-docs.js
 * 
 * Este script:
 * 1. Verifica se o servidor está rodando
 * 2. Gera a documentação OpenAPI
 * 3. Salva em arquivo JSON
 * 4. Valida a especificação
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const SERVER_URL = 'http://localhost:6199';
const API_DOCS_URL = `${SERVER_URL}/api-docs.json`;
const OUTPUT_FILE = path.join(__dirname, '..', 'docs', 'openapi.json');

// Criar diretório docs se não existir
const docsDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

function checkServer() {
  return new Promise((resolve, reject) => {
    const req = http.get(SERVER_URL, (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        reject(new Error(`Servidor retornou status ${res.statusCode}`));
      }
    });

    req.on('error', (err) => {
      reject(new Error(`Erro ao conectar com servidor: ${err.message}`));
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout ao conectar com servidor'));
    });
  });
}

function fetchApiDocs() {
  return new Promise((resolve, reject) => {
    const req = http.get(API_DOCS_URL, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (err) {
          reject(new Error(`Erro ao parsear JSON: ${err.message}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(new Error(`Erro ao buscar documentação: ${err.message}`));
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout ao buscar documentação'));
    });
  });
}

function validateOpenAPI(spec) {
  const errors = [];
  
  // Validar versão OpenAPI
  if (!spec.openapi || !spec.openapi.startsWith('3.')) {
    errors.push('Versão OpenAPI deve ser 3.x');
  }
  
  // Validar informações básicas
  if (!spec.info || !spec.info.title || !spec.info.version) {
    errors.push('Informações básicas (info) incompletas');
  }
  
  // Validar servidores
  if (!spec.servers || spec.servers.length === 0) {
    errors.push('Pelo menos um servidor deve ser definido');
  }
  
  // Validar paths
  if (!spec.paths || Object.keys(spec.paths).length === 0) {
    errors.push('Nenhum endpoint definido');
  }
  
  // Validar componentes
  if (!spec.components) {
    errors.push('Componentes não definidos');
  }
  
  return errors;
}

function saveDocumentation(spec) {
  const jsonString = JSON.stringify(spec, null, 2);
  fs.writeFileSync(OUTPUT_FILE, jsonString, 'utf8');
  console.log(`✅ Documentação salva em: ${OUTPUT_FILE}`);
}

function generateStats(spec) {
  const stats = {
    endpoints: Object.keys(spec.paths || {}).length,
    schemas: Object.keys(spec.components?.schemas || {}).length,
    servers: spec.servers?.length || 0,
    tags: new Set()
  };
  
  // Contar tags
  Object.values(spec.paths || {}).forEach(path => {
    Object.values(path).forEach(operation => {
      if (operation.tags) {
        operation.tags.forEach(tag => stats.tags.add(tag));
      }
    });
  });
  
  stats.tags = Array.from(stats.tags);
  
  return stats;
}

async function main() {
  console.log('🚀 Gerando documentação da API...\n');
  
  try {
    // 1. Verificar se o servidor está rodando
    console.log('1. Verificando servidor...');
    await checkServer();
    console.log('✅ Servidor está rodando\n');
    
    // 2. Buscar documentação
    console.log('2. Buscando documentação da API...');
    const apiSpec = await fetchApiDocs();
    console.log('✅ Documentação obtida\n');
    
    // 3. Validar especificação
    console.log('3. Validando especificação OpenAPI...');
    const errors = validateOpenAPI(apiSpec);
    if (errors.length > 0) {
      console.log('❌ Erros de validação:');
      errors.forEach(error => console.log(`   - ${error}`));
      process.exit(1);
    }
    console.log('✅ Especificação válida\n');
    
    // 4. Salvar documentação
    console.log('4. Salvando documentação...');
    saveDocumentation(apiSpec);
    
    // 5. Gerar estatísticas
    console.log('5. Gerando estatísticas...');
    const stats = generateStats(apiSpec);
    console.log('📊 Estatísticas da API:');
    console.log(`   - Endpoints: ${stats.endpoints}`);
    console.log(`   - Schemas: ${stats.schemas}`);
    console.log(`   - Servidores: ${stats.servers}`);
    console.log(`   - Tags: ${stats.tags.length} (${stats.tags.join(', ')})`);
    
    console.log('\n🎉 Documentação gerada com sucesso!');
    console.log(`📖 Acesse: ${SERVER_URL}/api-docs`);
    console.log(`📄 JSON: ${OUTPUT_FILE}`);
    
  } catch (error) {
    console.error(`❌ Erro: ${error.message}`);
    console.log('\n💡 Certifique-se de que:');
    console.log('   1. O servidor está rodando (bun run dev)');
    console.log('   2. A porta 6199 está disponível');
    console.log('   3. As dependências estão instaladas');
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  checkServer,
  fetchApiDocs,
  validateOpenAPI,
  saveDocumentation,
  generateStats
}; 