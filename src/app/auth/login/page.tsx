'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import Link from 'next/link';
import { AtSign, KeyRound, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Credenciais inválidas. Tente novamente.');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      setError('Ocorreu um erro ao tentar fazer login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      {/* Seção lateral com gradiente e informações */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-[#17d300] to-[#2c3e50] text-white">
        <div className="space-y-8">
          <h1 className="text-4xl font-bold">Bem-vindo ao Sistema Imobiliário Completo</h1>
          <p className="text-xl">Gerencie imóveis, clientes, corretores e muito mais em um só lugar.</p>
        </div>
        
        <div className="space-y-10">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Recursos Principais</h2>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <ArrowRight size={18} />
                <span>Gerencie todos os imóveis em um só lugar</span>
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight size={18} />
                <span>Controle de clientes e agendamentos</span>
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight size={18} />
                <span>Relatórios detalhados em tempo real</span>
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight size={18} />
                <span>Comunicação integrada com clientes</span>
              </li>
            </ul>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-medium">Segurança Garantida</h3>
              <p className="text-sm text-white/80">Seus dados estão protegidos conosco</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Formulário de login */}
      <div className="flex flex-1 items-center justify-center p-6 bg-[#f8fafc] dark:bg-[#0f172a]">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="space-y-6 pb-4">
            <div className="flex justify-center">
              <Image 
                src="/TAPPY - SOMENTE A LOGO - VERDE.svg" 
                alt="Tappy Imob Logo" 
                width={70} 
                height={70} 
                priority 
              />
            </div>
            <div className="space-y-2 text-center">
              <CardTitle className="text-2xl font-bold">Acesse sua conta</CardTitle>
              <CardDescription>Entre com suas credenciais para acessar o sistema</CardDescription>
              <p className="text-xs text-center mt-2 text-muted-foreground">(Use admin@tappyimob.com / senha123)</p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <AtSign className="h-4 w-4 text-muted-foreground" />
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="pl-3 h-11"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-3 h-11"
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-600">
                    Lembrar-me
                  </label>
                </div>
                <div className="text-sm">
                  <Link href="#" className="font-medium text-primary hover:text-primary-hover">
                    Esqueceu a senha?
                  </Link>
                </div>
              </div>
              
              {error && (
                <div className="rounded-md bg-red-50 p-3">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    {error}
                  </p>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-11 bg-[#17d300] hover:bg-[#15bb00] text-white font-medium" 
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="pt-0 flex flex-col space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#f8fafc] dark:bg-[#0f172a] px-2 text-gray-500">
                  ou continue com
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" type="button" className="h-11">
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </Button>
              <Button variant="outline" type="button" className="h-11">
                <svg className="mr-2 h-5 w-5 fill-current" viewBox="0 0 16 16">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                </svg>
                GitHub
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-1 pt-4">
              <p className="text-sm text-gray-500">Não tem uma conta?</p>
              <Link href="#" className="text-sm font-medium text-primary hover:text-primary-hover">
                Criar uma conta
              </Link>
            </div>
            
            <div className="flex justify-center pt-4">
              <p className="text-xs text-gray-500">
                © 2025 TappyImob. Todos os direitos reservados.
              </p>
            </div>
            
            <div className="flex justify-center gap-4 pt-2">
              <div className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                  <Lock className="h-3 w-3 text-green-600" />
                </div>
                <span className="ml-2 text-xs text-gray-500">SSL Seguro</span>
              </div>
              <div className="flex items-center">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <Lock className="h-3 w-3 text-blue-600" />
                </div>
                <span className="ml-2 text-xs text-gray-500">Compatível com PCI</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
