import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Debug = () => {
  const [status, setStatus] = useState<any>({
    connection: '⏳ Aguardando teste...',
    auth: '⏳ Aguardando teste...',
    duvidaTable: '⏳ Aguardando teste...',
    profilesTable: '⏳ Aguardando teste...',
    categoriesTable: '⏳ Aguardando teste...',
    userSession: null,
  });

  const runTests = async () => {
    // Resetar status
    setStatus({
      connection: '⏳ Testando...',
      auth: '⏳ Testando...',
      duvidaTable: '⏳ Testando...',
      profilesTable: '⏳ Testando...',
      categoriesTable: '⏳ Testando...',
      userSession: null,
    });

    // Teste 1: Verificar sessão do usuário
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      setStatus((prev: any) => ({ 
        ...prev, 
        auth: session ? `✅ Autenticado: ${session.user.email}` : '❌ Não autenticado',
        userSession: session
      }));
    } catch (error: any) {
      setStatus((prev: any) => ({ 
        ...prev, 
        auth: `❌ Erro: ${error.message}`
      }));
    }

    // Teste 2: Tentar conectar e buscar duvidas
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5000);
      
      const { data, error } = await supabase
        .from('duvidas')
        .select('id, title')
        .limit(1)
        .abortSignal(controller.signal);
      
      if (error) throw error;
      setStatus((prev: any) => ({ 
        ...prev, 
        duvidaTable: `✅ OK - ${data?.length || 0} registro(s) encontrado(s)`,
        connection: '✅ Conexão OK'
      }));
    } catch (error: any) {
      const errorMsg = error.message || String(error);
      setStatus((prev: any) => ({ 
        ...prev, 
        duvidaTable: `❌ Erro: ${errorMsg}`,
        connection: errorMsg.includes('abort') ? '❌ Timeout de conexão' : '❌ Erro de conexão'
      }));
    }

    // Teste 3: Verificar tabela profiles
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (error) throw error;
      setStatus((prev: any) => ({ 
        ...prev, 
        profilesTable: `✅ OK - ${data?.length || 0} registro(s)`
      }));
    } catch (error: any) {
      setStatus((prev: any) => ({ 
        ...prev, 
        profilesTable: `❌ Erro: ${error.message}`
      }));
    }

    // Teste 4: Verificar tabela categories
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      
      if (error) throw error;
      setStatus((prev: any) => ({ 
        ...prev, 
        categoriesTable: `✅ OK - ${data?.length || 0} categoria(s)`
      }));
    } catch (error: any) {
      setStatus((prev: any) => ({ 
        ...prev, 
        categoriesTable: `❌ Erro: ${error.message}`
      }));
    }
  };

  return (
    <div className="min-h-screen p-8 bg-background">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>🔧 Diagnóstico do Sistema</CardTitle>
          <CardDescription>
            Teste a conexão com o Supabase e verifique as tabelas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runTests} className="w-full">
            Executar Testes
          </Button>

          <div className="space-y-2 mt-6">
            <div className="p-3 border rounded-lg">
              <strong>Conexão:</strong> {status.connection}
            </div>
            <div className="p-3 border rounded-lg">
              <strong>Autenticação:</strong> {status.auth}
            </div>
            <div className="p-3 border rounded-lg">
              <strong>Tabela 'duvidas':</strong> {status.duvidaTable}
            </div>
            <div className="p-3 border rounded-lg">
              <strong>Tabela 'profiles':</strong> {status.profilesTable}
            </div>
            <div className="p-3 border rounded-lg">
              <strong>Tabela 'categories':</strong> {status.categoriesTable}
            </div>
          </div>

          {status.userSession && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Sessão do Usuário:</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify({
                  id: status.userSession.user.id,
                  email: status.userSession.user.email,
                  role: status.userSession.user.role,
                }, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <h3 className="font-semibold mb-2">💡 Possíveis Soluções:</h3>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Se der erro de permissão: Verifique as políticas RLS no Supabase</li>
              <li>Se der timeout: Verifique sua conexão de internet</li>
              <li>Se tabela não existir: Crie as tabelas no Supabase SQL Editor</li>
              <li>Se não autenticado: Faça login primeiro</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Debug;
