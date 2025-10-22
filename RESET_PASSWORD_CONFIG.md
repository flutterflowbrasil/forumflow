# Configuração de Reset de Senha

## Rota da Página
A página de reset de senha está disponível em:
```
/reset-password
```

## Configuração no Supabase Dashboard

Para que o usuário seja redirecionado corretamente ao clicar no link de recuperação de senha, você precisa configurar a URL de redirecionamento no Supabase:

### Passo 1: Acesse o Dashboard do Supabase
1. Faça login em [https://supabase.com](https://supabase.com)
2. Selecione seu projeto

### Passo 2: Configure a URL de Redirecionamento
1. Vá para **Authentication** → **URL Configuration**
2. Em **Redirect URLs**, adicione as seguintes URLs:

   **Para desenvolvimento local:**
   ```
   http://localhost:8080/reset-password
   ```

   **Para produção (Vercel):**
   ```
   https://seu-dominio.vercel.app/reset-password
   ```

3. Clique em **Save**

### Passo 3: Configure o Email Template (Opcional)
1. Vá para **Authentication** → **Email Templates**
2. Selecione **Reset Password**
3. Certifique-se de que o template contém o link: `{{ .ConfirmationURL }}`

## Como Usar

### Para o Usuário:
1. Na página de login, clique em "Esqueceu sua senha?"
2. Digite o email cadastrado
3. Receberá um email com o link de recuperação
4. Ao clicar no link, será redirecionado para `/reset-password`
5. Preencha os campos "Nova Senha" e "Confirmar Nova Senha"
6. Clique em "Salvar Nova Senha"

### Validações Implementadas:
- ✅ Senha mínima de 6 caracteres
- ✅ Verificação se as senhas coincidem
- ✅ Verificação de sessão válida
- ✅ Feedback visual com ícones de mostrar/ocultar senha
- ✅ Mensagens de erro e sucesso com toast notifications
- ✅ Redirecionamento automático para login após sucesso

## Código de Implementação

O código de recuperação está implementado em:
- **Página:** `src/pages/ResetPassword.tsx`
- **Rota:** Configurada em `src/App.tsx`

### Método Supabase Utilizado:
```typescript
await supabase.auth.updateUser({
  password: novasenha
});
```

## Variáveis de Ambiente Necessárias

Certifique-se de que as seguintes variáveis estão configuradas no arquivo `.env`:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

## Troubleshooting

### Erro: "Sessão inválida ou expirada"
- O link de recuperação pode ter expirado (padrão: 1 hora)
- Solicite um novo link de recuperação

### Usuário não recebe o email
- Verifique a configuração SMTP no Supabase
- Confira a pasta de spam
- Verifique se o email está cadastrado no sistema

### Erro ao atualizar senha
- Verifique se as variáveis de ambiente estão configuradas
- Confirme que a URL de redirecionamento está correta no Supabase
- Verifique os logs do navegador para mais detalhes
