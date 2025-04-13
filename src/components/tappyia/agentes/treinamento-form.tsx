'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, BrainCircuit, CheckCircle, Lightbulb, Sparkles, Upload, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

interface TreinamentoFormProps {
  mudarParaAbaDeGerenciamento: () => void;
}

export function TreinamentoForm({ mudarParaAbaDeGerenciamento }: TreinamentoFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    nome: '',
    descricao: '',
    tipoAgente: 'VENDAS',
    tom: 'FORMAL',
    promptPersonalizado: '',
    instrucoesGerais: '',
    emoji: '🤖',
    cor: '#4f46e5',
    status: 'EM_TREINAMENTO',
    temperatura: 0.7
  });

  const handleChange = (field: string, value: any) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/ia/agentes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formValues)
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar agente: ${response.statusText}`);
      }

      const data = await response.json();
      
      toast({
        title: 'Agente criado com sucesso!',
        description: 'Seu agente foi criado e está em fase de treinamento.',
        duration: 5000
      });

      // Limpar o formulário
      setFormValues({
        nome: '',
        descricao: '',
        tipoAgente: 'VENDAS',
        tom: 'FORMAL',
        promptPersonalizado: '',
        instrucoesGerais: '',
        emoji: '🤖',
        cor: '#4f46e5',
        status: 'EM_TREINAMENTO',
        temperatura: 0.7
      });

      // Mudar para a aba de gerenciamento
      setTimeout(() => {
        mudarParaAbaDeGerenciamento();
      }, 1500);

    } catch (error) {
      console.error('Erro ao criar agente:', error);
      toast({
        title: 'Erro ao criar agente',
        description: 'Não foi possível criar o agente. Tente novamente.',
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="pb-8">
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-blue-100 to-indigo-50 p-6 rounded-xl shadow-sm border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-500 p-2 rounded-full">
              <BrainCircuit className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-blue-800">Criar Novo Agente de IA</h2>
          </div>
          <p className="text-slate-600 mb-2">Configure seu assistente personalizado para automatizar tarefas e melhorar o atendimento.</p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-md border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              <h3 className="text-lg font-medium text-slate-800">Informações Básicas</h3>
            </div>
          
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-sm font-medium flex items-center gap-1">
                  <span className="text-red-500">*</span> Nome do Agente
                </Label>
                <Input 
                  id="nome" 
                  placeholder="Ex: Vendedor Profissional" 
                  value={formValues.nome}
                  onChange={e => handleChange('nome', e.target.value)}
                  required 
                  className="transition-all border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
                <p className="text-xs text-slate-500">Um nome claro que descreva a função do agente</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descricao" className="text-sm font-medium flex items-center gap-1">
                  <span className="text-red-500">*</span> Descrição
                </Label>
                <Textarea 
                  id="descricao" 
                  placeholder="Descreva o propósito e as habilidades do seu agente de IA"
                  value={formValues.descricao}
                  onChange={e => handleChange('descricao', e.target.value)}
                  required
                  className="min-h-[80px] transition-all border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
                <p className="text-xs text-slate-500">Explique o que este agente fará para ajudar seus clientes</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instrucoesGerais" className="text-sm font-medium flex items-center gap-1">
                  Instruções Gerais
                </Label>
                <Textarea 
                  id="instrucoesGerais" 
                  placeholder="Inclua detalhes específicos e instruções para o assistente..."
                  className="min-h-[100px] transition-all border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  value={formValues.instrucoesGerais}
                  onChange={(e) => handleChange('instrucoesGerais', e.target.value)}
                />
                <p className="text-xs text-slate-500">Instruções detalhadas sobre como o agente deve se comportar e responder</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tipo" className="text-sm font-medium flex items-center gap-1">
                  <span className="text-red-500">*</span> Tipo de Agente
                </Label>
                <Select 
                  value={formValues.tipoAgente} 
                  onValueChange={(value) => handleChange('tipoAgente', value)}
                >
                  <SelectTrigger className="w-full transition-all border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100">
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VENDAS">Vendas</SelectItem>
                    <SelectItem value="ATENDIMENTO">Atendimento</SelectItem>
                    <SelectItem value="CONSULTORIA">Consultoria</SelectItem>
                    <SelectItem value="PERSONALIZADO">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">Escolha o tipo que melhor se encaixa na função do agente</p>
              </div>
            
            <div className="space-y-2">
              <Label htmlFor="temperatura" className="text-sm font-medium">Temperatura (Criatividade)</Label>
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-blue-700">Preciso</span>
                  <div className="flex-1 h-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"></div>
                  <span className="text-sm font-medium text-indigo-700">Criativo</span>
                </div>
                <Input
                  id="temperatura"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formValues.temperatura}
                  onChange={e => handleChange('temperatura', parseFloat(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-slate-500">Respostas consistentes e objetivas</span>
                  <span className="text-sm font-medium text-indigo-600">{formValues.temperatura.toFixed(1)}</span>
                  <span className="text-xs text-slate-500">Respostas criativas e variadas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
            
        <div className="bg-white rounded-xl p-6 shadow-md border border-slate-100 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-medium text-slate-800">Personalização Visual</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="emoji" className="text-sm font-medium">Emoji do Agente</Label>
              <div className="flex items-center space-x-3">
                <div className="flex justify-center items-center h-14 w-14 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
                  <span className="text-2xl">{formValues.emoji || '🤖'}</span>
                </div>
                <Input 
                  id="emoji"
                  placeholder="🤖"
                  value={formValues.emoji}
                  onChange={(e) => handleChange('emoji', e.target.value)}
                  className="w-32 transition-all border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <p className="text-xs text-slate-500">Escolha um emoji que represente a função do seu agente</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cor" className="text-sm font-medium">Cor do Agente</Label>
              <div className="flex items-center space-x-3">
                <div className="flex justify-center items-center h-14 w-14 rounded-xl" style={{ backgroundColor: formValues.cor || '#4f46e5' }}>
                  <span className="text-white text-xl">{formValues.emoji || '🤖'}</span>
                </div>
                <div className="flex-1 flex items-center space-x-2">
                  <input 
                    type="color" 
                    id="cor"
                    value={formValues.cor}
                    onChange={(e) => handleChange('cor', e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded-md border-0"
                  />
                  <Input 
                    value={formValues.cor}
                    onChange={(e) => handleChange('cor', e.target.value)}
                    className="w-32 transition-all border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500">Esta cor será usada para identificar o agente no painel</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="prompt-modelo">Prompt Base</Label>
            <Textarea
              id="prompt-modelo"
              placeholder="Ex: Você é um assistente especializado em imóveis que ajuda clientes a encontrar propriedades. Seja amigável e forneça informações detalhadas quando solicitado."
              className="min-h-[150px] resize-none"
            />
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Personalidade e Comportamento</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tom" className="text-sm font-medium flex items-center gap-1">
                <span className="text-red-500">*</span> Tom de Voz
              </Label>
              <Select
                value={formValues.tom}
                onValueChange={(value) => handleChange('tom', value)}
              >
                <SelectTrigger className="w-full transition-all border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100">
                  <SelectValue placeholder="Selecione um tom de voz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FORMAL">Formal</SelectItem>
                  <SelectItem value="INFORMAL">Informal</SelectItem>
                  <SelectItem value="TECNICO">Técnico</SelectItem>
                  <SelectItem value="AMIGAVEL">Amigável</SelectItem>
                  <SelectItem value="DIRETO">Direto</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">Escolha como o agente deve se comunicar com os clientes</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-md border border-slate-100 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <BrainCircuit className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-medium text-slate-800">Instruções Avançadas</h3>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="promptPersonalizado" className="text-sm font-medium">Prompt Personalizado (opcional)</Label>
              <Textarea
                id="promptPersonalizado"
                placeholder="Insira um prompt personalizado com instruções específicas..."
                className="min-h-[120px] transition-all border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                value={formValues.promptPersonalizado}
                onChange={(e) => handleChange('promptPersonalizado', e.target.value)}
              />
              <p className="text-xs text-slate-500">
                Insira instruções avançadas para personalizar como o agente deve responder em situações específicas.
              </p>
            </div>
            
            <Alert className="bg-amber-50 border-amber-200 text-amber-800 mt-4">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm">
                Seu agente será treinado com estas configurações e ficará disponível na aba "Gerenciar Agentes" quando estiver pronto.
              </AlertDescription>
            </Alert>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button 
            type="button" 
            variant="outline" 
            className="border-slate-200 hover:bg-slate-50 text-slate-700"
            disabled={loading}
            onClick={() => setFormValues({
              nome: '',
              descricao: '',
              tipoAgente: 'VENDAS',
              tom: 'FORMAL',
              promptPersonalizado: '',
              instrucoesGerais: '',
              emoji: '🤖',
              cor: '#4f46e5',
              status: 'EM_TREINAMENTO',
              temperatura: 0.7
            })}
          >
            Limpar Campos
          </Button>
          <Button 
            type="submit" 
            className="bg-gradient-to-r from-[#25D366] to-[#1da951] hover:from-[#1da951] hover:to-[#0d9142] text-white shadow-lg hover:shadow-xl transition-all px-8" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando Agente...
              </>
            ) : (
              'Criar Agente'
            )}
          </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
