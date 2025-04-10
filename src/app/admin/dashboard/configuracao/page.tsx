'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  User,
  Lock,
  CreditCard,
  Bell,
  Globe,
  Palette,
  ShieldCheck,
  Mail,
  Smartphone,
  Brush,
  Moon,
  Sun,
  Monitor,
  Info,
  Save,
  FileText,
  Trash2,
  AlertTriangle,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';

export default function ConfiguracaoPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <PageContainer
      title="Configurações"
      subtitle="Personalize as configurações do sistema"
    >
      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-2 sm:grid-cols-4 gap-2">
          <TabsTrigger value="perfil" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="aparencia" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        {/* Perfil */}
        <TabsContent value="perfil">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais e profissionais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" value="Administrador TappyImob" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value="admin@tappyimob.com" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" type="tel" value="(11) 99999-9999" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input id="cargo" value="Administrador" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea id="bio" rows={4} placeholder="Conte um pouco sobre você..." />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancelar</Button>
              <Button>Salvar Alterações</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Aparência */}
        <TabsContent value="aparencia">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Aparência</CardTitle>
              <CardDescription>
                Personalize o tema e a experiência visual do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="theme-switch" className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Modo Escuro
                  </Label>
                  <Switch 
                    id="theme-switch" 
                    checked={darkMode} 
                    onCheckedChange={setDarkMode}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Alternar entre tema claro e escuro
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <Label>Tema do Sistema</Label>
                <div className="grid grid-cols-3 gap-4">
                  <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                    <Sun className="h-5 w-5 mb-2" />
                    <span>Claro</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                    <Moon className="h-5 w-5 mb-2" />
                    <span>Escuro</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                    <Monitor className="h-5 w-5 mb-2" />
                    <span>Sistema</span>
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <Label>Cor Principal</Label>
                <div className="flex flex-wrap gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-500 cursor-pointer border-2 border-blue-500 ring-2 ring-white" />
                  <div className="h-10 w-10 rounded-full bg-green-500 cursor-pointer" />
                  <div className="h-10 w-10 rounded-full bg-purple-500 cursor-pointer" />
                  <div className="h-10 w-10 rounded-full bg-amber-500 cursor-pointer" />
                  <div className="h-10 w-10 rounded-full bg-pink-500 cursor-pointer" />
                  <div className="h-10 w-10 rounded-full bg-teal-500 cursor-pointer" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Aplicar Alterações</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Notificações */}
        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificações</CardTitle>
              <CardDescription>
                Configure como e quando você deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notif" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Notificações por Email
                  </Label>
                  <Switch 
                    id="email-notif" 
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Receba notificações importantes por email
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-notif" className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Notificações Push
                  </Label>
                  <Switch 
                    id="push-notif" 
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Receba notificações em tempo real no navegador
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Tipos de Notificações</h4>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="new-lead-notif" className="flex-1">
                    Novos leads
                  </Label>
                  <Switch id="new-lead-notif" checked={true} />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="message-notif" className="flex-1">
                    Novas mensagens
                  </Label>
                  <Switch id="message-notif" checked={true} />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="update-notif" className="flex-1">
                    Atualizações do sistema
                  </Label>
                  <Switch id="update-notif" checked={false} />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="marketing-notif" className="flex-1">
                    Comunicados de marketing
                  </Label>
                  <Switch id="marketing-notif" checked={false} />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Salvar Preferências</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Segurança */}
        <TabsContent value="seguranca">
          <Card>
            <CardHeader>
              <CardTitle>Segurança da Conta</CardTitle>
              <CardDescription>
                Atualize suas credenciais e configure autenticação de dois fatores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Alterar Senha</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="current-password">Senha Atual</Label>
                  <div className="relative">
                    <Input id="current-password" type="password" />
                    <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <div className="relative">
                    <Input id="new-password" type="password" />
                    <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                  <div className="relative">
                    <Input id="confirm-password" type="password" />
                    <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">Atualizar Senha</Button>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="two-factor" className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      Autenticação de Dois Fatores
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Adicione uma camada extra de segurança à sua conta
                    </p>
                  </div>
                  <Switch 
                    id="two-factor" 
                    checked={twoFactor}
                    onCheckedChange={setTwoFactor}
                  />
                </div>
                
                {twoFactor && (
                  <div className="mt-4 p-4 bg-muted rounded-md">
                    <h5 className="font-medium mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Configuração Necessária
                    </h5>
                    <p className="text-sm text-muted-foreground mb-4">
                      Para ativar a autenticação de dois fatores, escaneie o código QR abaixo com seu aplicativo autenticador.
                    </p>
                    <div className="w-40 h-40 bg-white p-2 mx-auto mb-4">
                      {/* Placeholder para QR code */}
                      <div className="w-full h-full bg-muted-foreground/20 flex items-center justify-center">
                        QR Code
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="verification-code">Código de Verificação</Label>
                      <Input id="verification-code" placeholder="Digite o código de 6 dígitos" />
                    </div>
                    <Button className="w-full mt-4">Verificar e Ativar</Button>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-red-500">Zona de Perigo</h4>
                <p className="text-sm text-muted-foreground">
                  Ações irreversíveis que afetam sua conta
                </p>
                <Button variant="destructive" className="w-full mt-2">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Conta
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
