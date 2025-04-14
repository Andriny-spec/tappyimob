'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Building2,
  Save,
  CloudUpload,
  Moon,
  Sun,
  Bell,
  Lock,
  Clock,
  Shield,
  Phone,
  Mail,
  MapPin,
  FileText
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface ImobiliariaData {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  bairro: string;
  numero: string;
  cidade: string;
  estado: string;
  cep: string;
  cnpj: string;
  cpf: string;
  fotoPerfil: string;
  horarioAtendimentoInicio?: string;
  horarioAtendimentoFim?: string;
  diasAtendimento?: string[];
  descricao?: string;
  creci?: string;
}

export default function ConfiguracaoPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);
  const [auth2faAtivo, setAuth2faAtivo] = useState(false);
  const [dadosImobiliaria, setDadosImobiliaria] = useState<ImobiliariaData | null>(null);
  const [senha, setSenha] = useState({
    atual: '',
    nova: '',
    confirmar: ''
  });

  // Buscar dados da imobiliária
  useEffect(() => {
    const fetchDadosImobiliaria = async () => {
      if (!session?.user?.id) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/imobiliarias/${session.user.id}`);
        
        if (!response.ok) {
          throw new Error('Falha ao buscar dados da imobiliária');
        }
        
        const data = await response.json();
        setDadosImobiliaria(data.imobiliaria);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast.error({
          title: 'Erro',
          description: 'Não foi possível carregar os dados da imobiliária'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDadosImobiliaria();
  }, [session]);

  // Salvar alterações
  const salvarAlteracoes = async () => {
    if (!dadosImobiliaria || !session?.user?.id) return;
    
    try {
      setIsSaving(true);
      const response = await fetch(`/api/imobiliarias/${session.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosImobiliaria)
      });
      
      if (!response.ok) {
        throw new Error('Falha ao atualizar dados');
      }
      
      toast.success({
        title: 'Sucesso',
        description: 'Dados atualizados com sucesso'
      });
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      toast.error({
        title: 'Erro',
        description: 'Não foi possível salvar as alterações'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Atualizar senha
  const atualizarSenha = async () => {
    if (senha.nova !== senha.confirmar) {
      toast.error({
        title: 'Erro',
        description: 'As senhas não coincidem'
      });
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch('/api/auth/atualizar-senha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          senhaAtual: senha.atual,
          novaSenha: senha.nova
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Falha ao atualizar senha');
      }
      
      setSenha({
        atual: '',
        nova: '',
        confirmar: ''
      });
      
      toast.success({
        title: 'Sucesso',
        description: 'Senha atualizada com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao atualizar senha:', error);
      toast.error({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar a senha'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handler para uploads de avatar
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Verificar tipo e tamanho do arquivo
    if (!file.type.includes('image')) {
      toast.error({
        title: 'Erro',
        description: 'Por favor, selecione uma imagem válida'
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error({
        title: 'Erro',
        description: 'A imagem deve ter no máximo 5MB'
      });
      return;
    }
    
    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Falha ao fazer upload da imagem');
      }
      
      const data = await response.json();
      setDadosImobiliaria(prev => prev ? {...prev, fotoPerfil: data.url} : null);
      
      toast.success({
        title: 'Sucesso',
        description: 'Foto de perfil atualizada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error({
        title: 'Erro',
        description: 'Não foi possível atualizar a foto de perfil'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Atualize os handlers para definir preferências
  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Implementar lógica para salvar preferência no localStorage ou banco
  };

  const handleToggleNotificacoes = () => {
    setNotificacoesAtivas(!notificacoesAtivas);
    // Implementar lógica para salvar preferência no banco
  };

  const handleToggle2FA = () => {
    setAuth2faAtivo(!auth2faAtivo);
    // Implementar lógica de ativação de 2FA
  };

  // Atualizar campo de dados da imobiliária
  const handleUpdateField = (field: keyof ImobiliariaData, value: any) => {
    if (!dadosImobiliaria) return;
    
    setDadosImobiliaria(prev => prev ? {...prev, [field]: value} : null);
  };

  if (isLoading) {
    return (
      <PageContainer
        title="Configurações"
        subtitle="Personalize e configure sua conta"
      >
        <div className="flex justify-center items-center h-64">
          <Spinner className="h-12 w-12" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Configurações"
      subtitle="Personalize e configure sua conta"
    >
      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="perfil" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="empresa" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="preferencias" className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            Preferências
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Segurança
          </TabsTrigger>
        </TabsList>
        
        {/* Aba de Perfil */}
        <TabsContent value="perfil" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Perfil do Usuário</CardTitle>
              <CardDescription>
                Gerencie suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-24 w-24">
                    {dadosImobiliaria?.fotoPerfil ? (
                      <AvatarImage src={dadosImobiliaria.fotoPerfil} alt="Avatar" />
                    ) : (
                      <AvatarFallback>{dadosImobiliaria?.nome?.charAt(0) || 'U'}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="relative">
                    <input
                      type="file"
                      id="avatar-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                    >
                      <CloudUpload className="h-4 w-4" />
                      Alterar foto
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome">Nome</Label>
                      <Input
                        id="nome"
                        value={dadosImobiliaria?.nome || ''}
                        onChange={(e) => handleUpdateField('nome', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={dadosImobiliaria?.email || ''}
                        onChange={(e) => handleUpdateField('email', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={dadosImobiliaria?.telefone || ''}
                      onChange={(e) => handleUpdateField('telefone', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="creci">CRECI</Label>
                    <Input
                      id="creci"
                      value={dadosImobiliaria?.creci || ''}
                      onChange={(e) => handleUpdateField('creci', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={salvarAlteracoes} 
                disabled={isSaving}
                className="gap-1.5"
              >
                {isSaving ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                Salvar Alterações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Aba de Empresa */}
        <TabsContent value="empresa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados da Empresa</CardTitle>
              <CardDescription>
                Informações da sua imobiliária
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={dadosImobiliaria?.cnpj || ''}
                    onChange={(e) => handleUpdateField('cnpj', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF (Opcional para MEI)</Label>
                  <Input
                    id="cpf"
                    value={dadosImobiliaria?.cpf || ''}
                    onChange={(e) => handleUpdateField('cpf', e.target.value)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Endereço</h3>
                
                <div>
                  <Label htmlFor="endereco">Logradouro</Label>
                  <Input
                    id="endereco"
                    value={dadosImobiliaria?.endereco || ''}
                    onChange={(e) => handleUpdateField('endereco', e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="numero">Número</Label>
                    <Input
                      id="numero"
                      value={dadosImobiliaria?.numero || ''}
                      onChange={(e) => handleUpdateField('numero', e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      value={dadosImobiliaria?.bairro || ''}
                      onChange={(e) => handleUpdateField('bairro', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={dadosImobiliaria?.cidade || ''}
                      onChange={(e) => handleUpdateField('cidade', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="estado">Estado</Label>
                    <select
                      id="estado"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={dadosImobiliaria?.estado || ''}
                      onChange={(e) => handleUpdateField('estado', e.target.value)}
                    >
                      <option value="">Selecione</option>
                      <option value="AC">Acre</option>
                      <option value="AL">Alagoas</option>
                      <option value="AP">Amapá</option>
                      <option value="AM">Amazonas</option>
                      <option value="BA">Bahia</option>
                      <option value="CE">Ceará</option>
                      <option value="DF">Distrito Federal</option>
                      <option value="ES">Espírito Santo</option>
                      <option value="GO">Goiás</option>
                      <option value="MA">Maranhão</option>
                      <option value="MT">Mato Grosso</option>
                      <option value="MS">Mato Grosso do Sul</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="PA">Pará</option>
                      <option value="PB">Paraíba</option>
                      <option value="PR">Paraná</option>
                      <option value="PE">Pernambuco</option>
                      <option value="PI">Piauí</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="RN">Rio Grande do Norte</option>
                      <option value="RS">Rio Grande do Sul</option>
                      <option value="RO">Rondônia</option>
                      <option value="RR">Roraima</option>
                      <option value="SC">Santa Catarina</option>
                      <option value="SP">São Paulo</option>
                      <option value="SE">Sergipe</option>
                      <option value="TO">Tocantins</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={dadosImobiliaria?.cep || ''}
                    onChange={(e) => handleUpdateField('cep', e.target.value)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Horário de Atendimento</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="horario-inicio">Horário de Início</Label>
                    <Input
                      id="horario-inicio"
                      type="time"
                      value={dadosImobiliaria?.horarioAtendimentoInicio || ''}
                      onChange={(e) => handleUpdateField('horarioAtendimentoInicio', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="horario-fim">Horário de Término</Label>
                    <Input
                      id="horario-fim"
                      type="time"
                      value={dadosImobiliaria?.horarioAtendimentoFim || ''}
                      onChange={(e) => handleUpdateField('horarioAtendimentoFim', e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="mb-2 block">Dias de Atendimento</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((dia) => (
                      <Button
                        key={dia}
                        type="button"
                        variant={dadosImobiliaria?.diasAtendimento?.includes(dia) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          const dias = dadosImobiliaria?.diasAtendimento || [];
                          const novoDias = dias.includes(dia)
                            ? dias.filter(d => d !== dia)
                            : [...dias, dia];
                          handleUpdateField('diasAtendimento', novoDias);
                        }}
                      >
                        {dia}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="descricao">Sobre a Imobiliária</Label>
                <Textarea
                  id="descricao"
                  value={dadosImobiliaria?.descricao || ''}
                  onChange={(e) => handleUpdateField('descricao', e.target.value)}
                  rows={4}
                  placeholder="Descreva brevemente sua imobiliária..."
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={salvarAlteracoes} 
                disabled={isSaving}
                className="gap-1.5"
              >
                {isSaving ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                Salvar Alterações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Aba de Preferências */}
        <TabsContent value="preferencias" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferências do Sistema</CardTitle>
              <CardDescription>
                Personalize a sua experiência na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="modo-escuro">Modo Escuro</Label>
                    <p className="text-sm text-muted-foreground">
                      Altera a aparência do sistema para o modo escuro
                    </p>
                  </div>
                  <Switch 
                    id="modo-escuro" 
                    checked={darkMode}
                    onCheckedChange={handleToggleDarkMode}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notificacoes">Notificações</Label>
                    <p className="text-sm text-muted-foreground">
                      Ativar ou desativar todas as notificações do sistema
                    </p>
                  </div>
                  <Switch 
                    id="notificacoes" 
                    checked={notificacoesAtivas}
                    onCheckedChange={handleToggleNotificacoes}
                  />
                </div>
                
                <Separator />
                
                <div>
                  <Label className="mb-2 block">Idioma do Sistema</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue="pt-BR"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es">Español</option>
                  </select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="gap-1.5">
                <Save className="h-4 w-4" />
                Salvar Preferências
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Aba de Segurança */}
        <TabsContent value="seguranca" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Segurança da Conta</CardTitle>
              <CardDescription>
                Gerencie a segurança e os acessos da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Alterar Senha</h3>
                
                <div>
                  <Label htmlFor="senha-atual">Senha Atual</Label>
                  <Input
                    id="senha-atual"
                    type="password"
                    value={senha.atual}
                    onChange={(e) => setSenha({...senha, atual: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="nova-senha">Nova Senha</Label>
                  <Input
                    id="nova-senha"
                    type="password"
                    value={senha.nova}
                    onChange={(e) => setSenha({...senha, nova: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirmar-senha">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmar-senha"
                    type="password"
                    value={senha.confirmar}
                    onChange={(e) => setSenha({...senha, confirmar: e.target.value})}
                  />
                </div>
                
                <Button 
                  onClick={atualizarSenha} 
                  disabled={isSaving || !senha.atual || !senha.nova || !senha.confirmar}
                  variant="outline"
                  className="gap-1.5"
                >
                  {isSaving ? <Spinner className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  Alterar Senha
                </Button>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autenticacao-2fa">Autenticação em Dois Fatores (2FA)</Label>
                    <p className="text-sm text-muted-foreground">
                      Adiciona uma camada extra de segurança à sua conta
                    </p>
                  </div>
                  <Switch 
                    id="autenticacao-2fa" 
                    checked={auth2faAtivo}
                    onCheckedChange={handleToggle2FA}
                  />
                </div>
                
                {auth2faAtivo && (
                  <div className="rounded-md border p-4">
                    <p className="text-sm mb-4">
                      Escaneie o QR code abaixo com um aplicativo de autenticação como Google Authenticator ou Authy:
                    </p>
                    <div className="flex justify-center mb-4">
                      <div className="bg-gray-200 h-40 w-40 flex items-center justify-center text-sm text-gray-500">
                        QR Code de Exemplo
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="codigo-2fa">Digite o código de 6 dígitos</Label>
                      <Input
                        id="codigo-2fa"
                        placeholder="000000"
                        maxLength={6}
                        className="text-center"
                      />
                    </div>
                    <Button className="mt-2 w-full">Verificar e Ativar</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

// Componente para texto multilinhas
function Textarea({
  id,
  className,
  defaultValue,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      id={id}
      className={`flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      defaultValue={defaultValue}
      {...props}
    />
  );
}
