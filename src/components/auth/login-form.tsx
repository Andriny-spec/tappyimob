'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  KeyRound, Mail, Eye, EyeOff, 
  Loader2, Building2, AlertCircle, 
  CheckCircle2, Github, Twitter, Smartphone
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Usando NextAuth para autenticação
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      
      if (result?.error) {
        throw new Error(result.error);
      }
      
      setSuccess('Login realizado com sucesso! Redirecionando...');
      
      // Buscar informações do usuário após login
      const userResponse = await fetch('/api/auth/session');
      const session = await userResponse.json();
      
      // Redirecionamento baseado no papel do usuário
      setTimeout(() => {
        // Redirecionar com base no papel (role) do usuário
        const userRole = session?.user?.role || 'CLIENTE';
        
        switch(userRole) {
          case 'IMOBILIARIA':
            router.push('/imobiliaria/dashboard');
            break;
          case 'CORRETOR':
            router.push('/corretor/dashboard');
            break;
          case 'ADMIN':
            router.push('/admin/dashboard');
            break;
          default:
            router.push('/dashboard');
        }
      }, 1000);
      
    } catch (error: any) {
      setError(error.message || 'Ocorreu um erro ao fazer login. Por favor, tente novamente.');
      console.error('Erro de login:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-0 shadow-2xl bg-white">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold">Acessar sua conta</CardTitle>
          <CardDescription className="text-base">
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-red-50 text-red-800 flex items-start gap-3"
            >
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}
          
          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-emerald-50 text-emerald-800 flex items-start gap-3"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-sm">{success}</p>
            </motion.div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium">
                E-mail
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-slate-50 h-12 shadow-sm border-slate-200"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password" className="font-medium">
                  Senha
                </Label>
                <Link 
                  href="/recuperar-senha" 
                  className="text-sm text-emerald-600 hover:text-emerald-800 hover:underline transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-slate-50 h-12 shadow-sm border-slate-200"
                />
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label 
                htmlFor="remember" 
                className="text-sm text-gray-700 cursor-pointer"
              >
                Lembrar-me neste dispositivo
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Conectando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <div className="relative my-4">
            <Separator className="my-4" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="px-2 text-xs text-gray-500 bg-white">OU CONTINUAR COM</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Button 
              variant="outline" 
              className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 flex items-center justify-center gap-2 h-12"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 flex items-center justify-center gap-2 h-12"
            >
              <svg className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
              </svg>
              Facebook
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 flex items-center justify-center gap-2 h-12"
            >
              <Smartphone className="h-5 w-5 text-slate-700" />
              Celular
            </Button>
          </div>
        </CardContent>
        
        <CardFooter className="text-sm text-center border-t bg-slate-50 py-4">
          <p className="w-full">
            Não tem uma conta?{" "}
            <Link 
              href="/cadastro" 
              className="font-medium text-emerald-600 hover:text-emerald-800 hover:underline transition-colors"
            >
              Criar conta grátis
            </Link>
          </p>
        </CardFooter>
      </Card>
      
      <div className="text-center mt-6 space-y-2">
        <p className="text-sm text-gray-600">
          Tappy Imob © {new Date().getFullYear()}. Todos os direitos reservados.
        </p>
        <div className="flex justify-center gap-4 text-gray-500">
          <Link href="/termos" className="text-xs hover:text-emerald-600 transition-colors">
            Termos de Uso
          </Link>
          <Link href="/privacidade" className="text-xs hover:text-emerald-600 transition-colors">
            Política de Privacidade
          </Link>
          <Link href="/suporte" className="text-xs hover:text-emerald-600 transition-colors">
            Centro de Ajuda
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
