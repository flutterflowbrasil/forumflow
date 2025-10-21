// Script de teste para verificar conexão com Supabase
const SUPABASE_URL = 'https://pvwvhdnpwiaydsysruba.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3ZoZG5wd2lheWRzeXNydWJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MDE3NzksImV4cCI6MjA3NjI3Nzc3OX0.5tDnLSao8MOgr0SK6aiE6-eKq6Xh7cFqS7ySk0NE6zM';

console.log('🔍 Testando conexão com Supabase...\n');

// Teste 1: Verificar se a URL está acessível
fetch(SUPABASE_URL)
  .then(response => {
    console.log('✅ Supabase URL está acessível');
    console.log('   Status:', response.status);
    console.log('   URL:', SUPABASE_URL);
  })
  .catch(error => {
    console.error('❌ Erro ao acessar Supabase URL:');
    console.error('   ', error.message);
  });

// Teste 2: Verificar endpoint de autenticação
fetch(`${SUPABASE_URL}/auth/v1/health`, {
  headers: {
    'apikey': SUPABASE_ANON_KEY
  }
})
  .then(response => response.json())
  .then(data => {
    console.log('\n✅ Endpoint de autenticação está respondendo:');
    console.log('   ', JSON.stringify(data, null, 2));
  })
  .catch(error => {
    console.error('\n❌ Erro no endpoint de autenticação:');
    console.error('   ', error.message);
  });

// Teste 3: Verificar se consegue fazer uma requisição REST
setTimeout(() => {
  fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      console.log('\n✅ Endpoint REST está respondendo');
      console.log('   Status:', response.status);
    })
    .catch(error => {
      console.error('\n❌ Erro no endpoint REST:');
      console.error('   ', error.message);
    });
}, 1000);
