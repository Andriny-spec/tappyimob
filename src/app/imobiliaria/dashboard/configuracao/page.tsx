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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  User,
  CreditCard,
  Building,
  Bell,
  Lock,
  Shield,
  Mail,
  Smartphone,
  HelpCircle,
  Globe,
  Save,
  CloudUpload,
  UserPlus,
  Building2,
  UserX,
  FileText,
  MessageSquare,
  Layers,
  Palette,
  Menu
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ConfiguracaoPage() {
  const [tabAtiva, setTabAtiva] = useState('geral');
  
  return (
    <PageContainer
      title="Configurações"
      subtitle="Personalize e configure sua conta, preferências e integrações"
    >
      <Tabs
        defaultValue="geral"
        orientation="vertical"
        onValueChange={setTabAtiva}
        className="flex flex-col md:flex-row gap-6"
      >
        <div className="md:w-1/4">
          <Card>
            <CardContent className="p-4">
              <TabsList className="flex flex-col items-start h-auto bg-transparent p-0 w-full">
                <TabsTrigger
                  value="geral"
                  className="w-full justify-start data-[state=active]:bg-muted px-3 py-2"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Geral
                </TabsTrigger>
                <TabsTrigger
                  value="perfil"
                  className="w-full justify-start data-[state=active]:bg-muted px-3 py-2"
                >
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </TabsTrigger>
                <TabsTrigger
                  value="empresa"
                  className="w-full justify-start data-[state=active]:bg-muted px-3 py-2"
                >
                  <Building className="h-4 w-4 mr-2" />
                  Empresa
                </TabsTrigger>
                <TabsTrigger
                  value="faturamento"
                  className="w-full justify-start data-[state=active]:bg-muted px-3 py-2"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Faturamento
                </TabsTrigger>
                <TabsTrigger
                  value="notificacoes"
                  className="w-full justify-start data-[state=active]:bg-muted px-3 py-2"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notificações
                </TabsTrigger>
                <TabsTrigger
                  value="seguranca"
                  className="w-full justify-start data-[state=active]:bg-muted px-3 py-2"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Segurança
                </TabsTrigger>
                <TabsTrigger
                  value="usuarios"
                  className="w-full justify-start data-[state=active]:bg-muted px-3 py-2"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Usuários
                </TabsTrigger>
                <TabsTrigger
                  value="aparencia"
                  className="w-full justify-start data-[state=active]:bg-muted px-3 py-2"
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Aparência
                </TabsTrigger>
                <TabsTrigger
                  value="integracao"
                  className="w-full justify-start data-[state=active]:bg-muted px-3 py-2"
                >
                  <Layers className="h-4 w-4 mr-2" />
                  Integrações
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:w-3/4">
          <TabsContent value="geral" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>
                  Gerencie as configurações gerais do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Preferências do Sistema</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="modo-escuro">Modo Escuro</Label>
                      <p className="text-sm text-muted-foreground">
                        Altera a aparência do sistema para o modo escuro
                      </p>
                    </div>
                    <Switch id="modo-escuro" />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="idioma">Idioma do Sistema</Label>
                      <p className="text-sm text-muted-foreground">
                        Define o idioma padrão para toda a interface
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <select
                        id="idioma"
                        className="border rounded p-1 text-sm bg-transparent"
                        defaultValue="pt-BR"
                      >
                        <option value="pt-BR">Português (Brasil)</option>
                        <option value="en-US">English (US)</option>
                        <option value="es">Español</option>
                      </select>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notif-email">Notificações por E-mail</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba atualizações importantes por e-mail
                      </p>
                    </div>
                    <Switch id="notif-email" defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="backup-auto">Backup Automático</Label>
                      <p className="text-sm text-muted-foreground">
                        Realiza backups automáticos dos seus dados
                      </p>
                    </div>
                    <Switch id="backup-auto" defaultChecked />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Configurações Avançadas</h3>
                  
                  <div>
                    <Label htmlFor="limite-armazenamento">Limite de Armazenamento</Label>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Usado: 2.5GB</span>
                        <span>Total: 10GB</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-1/4"></div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        25% do armazenamento usado
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label htmlFor="exportar-dados">Exportar Dados</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Faça download de uma cópia dos seus dados
                    </p>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <FileText className="h-4 w-4" />
                      Exportar Dados
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="gap-1.5">
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="perfil" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>Perfil do Usuário</CardTitle>
                <CardDescription>
                  Gerencie suas informações pessoais e profissionais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex flex-col items-center space-y-2">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="/avatars/01.png" alt="Avatar" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <CloudUpload className="h-4 w-4" />
                      Alterar foto
                    </Button>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nome">Nome</Label>
                        <Input id="nome" defaultValue="João" />
                      </div>
                      <div>
                        <Label htmlFor="sobrenome">Sobrenome</Label>
                        <Input id="sobrenome" defaultValue="da Silva" />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input id="email" type="email" defaultValue="joao.silva@exemplo.com" />
                    </div>
                    
                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input id="telefone" defaultValue="(11) 98765-4321" />
                    </div>
                    
                    <div>
                      <Label htmlFor="cargo">Cargo</Label>
                      <Input id="cargo" defaultValue="Corretor de Imóveis" />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Informações Profissionais</h3>
                  
                  <div>
                    <Label htmlFor="creci">CRECI</Label>
                    <Input id="creci" defaultValue="123456-F" />
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">Biografia</Label>
                    <Textarea id="bio" className="min-h-[100px]" defaultValue="Corretor de imóveis com mais de 10 anos de experiência no mercado imobiliário de São Paulo, especializado em imóveis de alto padrão." />
                  </div>
                  
                  <div>
                    <Label htmlFor="especialidades">Especialidades</Label>
                    <Input id="especialidades" defaultValue="Imóveis de Luxo, Apartamentos, Casas de Condomínio" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Separe as especialidades por vírgula
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="gap-1.5">
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="empresa" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>Dados da Empresa</CardTitle>
                <CardDescription>
                  Gerencie as informações da sua imobiliária
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="h-24 w-24 border rounded-md flex items-center justify-center">
                      <Building2 className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <CloudUpload className="h-4 w-4" />
                      Upload do logo
                    </Button>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <Label htmlFor="razao-social">Razão Social</Label>
                      <Input id="razao-social" defaultValue="Imobiliária Exemplo Ltda" />
                    </div>
                    
                    <div>
                      <Label htmlFor="nome-fantasia">Nome Fantasia</Label>
                      <Input id="nome-fantasia" defaultValue="Exemplo Imóveis" />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cnpj">CNPJ</Label>
                        <Input id="cnpj" defaultValue="12.345.678/0001-90" />
                      </div>
                      <div>
                        <Label htmlFor="inscricao-estadual">Inscrição Estadual</Label>
                        <Input id="inscricao-estadual" defaultValue="123.456.789.000" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Endereço</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                    <div className="sm:col-span-4">
                      <Label htmlFor="logradouro">Logradouro</Label>
                      <Input id="logradouro" defaultValue="Av. Paulista" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="numero">Número</Label>
                      <Input id="numero" defaultValue="1000" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                    <div className="sm:col-span-3">
                      <Label htmlFor="complemento">Complemento</Label>
                      <Input id="complemento" defaultValue="Sala 1010" />
                    </div>
                    <div className="sm:col-span-3">
                      <Label htmlFor="bairro">Bairro</Label>
                      <Input id="bairro" defaultValue="Bela Vista" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                    <div className="sm:col-span-2">
                      <Label htmlFor="cep">CEP</Label>
                      <Input id="cep" defaultValue="01310-100" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input id="cidade" defaultValue="São Paulo" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="estado">Estado</Label>
                      <select
                        id="estado"
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        defaultValue="SP"
                      >
                        <option value="SP">São Paulo</option>
                        <option value="RJ">Rio de Janeiro</option>
                        <option value="MG">Minas Gerais</option>
                        <option value="RS">Rio Grande do Sul</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Contato</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="telefone-empresa">Telefone</Label>
                      <Input id="telefone-empresa" defaultValue="(11) 3456-7890" />
                    </div>
                    <div>
                      <Label htmlFor="email-empresa">E-mail</Label>
                      <Input id="email-empresa" type="email" defaultValue="contato@exemploimoveis.com.br" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="site">Site</Label>
                    <Input id="site" defaultValue="https://www.exemploimoveis.com.br" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="gap-1.5">
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </PageContainer>
  );
}

function Textarea({ id, className, defaultValue }) {
  return (
    <textarea
      id={id}
      className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      defaultValue={defaultValue}
    />
  );
}
