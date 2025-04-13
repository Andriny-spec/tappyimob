'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImovelAIHelper } from './imovel-ai-helper';
import { ImovelFormHeader } from './imovel-form-header';
import { ImovelGaleria } from './imovel-galeria';
import { CorretorSeletor } from './corretor-seletor';
import { AdicionaisSeletor } from './adicionais-seletor';
import { Building2, Home, Image, ListChecks, User } from 'lucide-react';
import { formatarMoeda } from '@/lib/utils';
import { toast } from 'sonner';

// Esquema de validação do formulário
const imovelSchema = z.object({
  titulo: z.string().min(5, 'O título precisa ter pelo menos 5 caracteres'),
  descricao: z.string().min(20, 'A descrição precisa ter pelo menos 20 caracteres'),
  valor: z.coerce.number().min(1, 'O valor é obrigatório'),
  tipoImovel: z.string().min(1, 'Selecione o tipo de imóvel'),
  tipoOperacao: z.string().min(1, 'Selecione o tipo de operação'),
  status: z.string().min(1, 'Selecione o status do imóvel'),
  quartos: z.coerce.number().min(0, 'Número de quartos inválido').optional(),
  banheiros: z.coerce.number().min(0, 'Número de banheiros inválido').optional(),
  suites: z.coerce.number().min(0, 'Número de suítes inválido').optional(),
  areaTotal: z.coerce.number().min(0, 'Área total inválida').optional(),
  areaUtil: z.coerce.number().min(0, 'Área útil inválida').optional(),
  vagas: z.coerce.number().min(0, 'Número de vagas inválido').optional(),
  andar: z.coerce.number().min(0, 'Andar inválido').optional(),
  endereco: z.string().min(5, 'Endereço completo obrigatório'),
  bairro: z.string().min(2, 'Bairro obrigatório'),
  cidade: z.string().min(2, 'Cidade obrigatória'),
  estado: z.string().min(2, 'Estado obrigatório'),
  cep: z.string().optional(),
  adicionais: z.array(z.string()).optional(),
  corretorId: z.string().optional(),
  imobiliariaId: z.string().optional(),
  proprietarioId: z.string().optional(),
  fotos: z.array(z.object({
    id: z.string().optional(),
    url: z.string(),
    legenda: z.string().optional(),
    ordem: z.number()
  })).optional(),
  fotoPrincipal: z.string().optional(),
  codigoInterno: z.string().optional(),
});

// Tipo derivado do schema Zod
type ImovelFormData = z.infer<typeof imovelSchema>;

// Opções para selects
const tiposImoveis = [
  { value: 'APARTAMENTO', label: 'Apartamento' },
  { value: 'CASA', label: 'Casa' },
  { value: 'COBERTURA', label: 'Cobertura' },
  { value: 'FLAT', label: 'Flat' },
  { value: 'TERRENO', label: 'Terreno' },
  { value: 'SALA_COMERCIAL', label: 'Sala Comercial' },
  { value: 'LOJA', label: 'Loja' },
  { value: 'GALPAO', label: 'Galpão' },
  { value: 'SITIO', label: 'Sítio' },
  { value: 'CHACARA', label: 'Chácara' },
  { value: 'FAZENDA', label: 'Fazenda' },
  { value: 'PONTO_COMERCIAL', label: 'Ponto Comercial' },
  { value: 'HOTEL', label: 'Hotel' },
  { value: 'POUSADA', label: 'Pousada' },
  { value: 'PREDIO', label: 'Prédio' },
  { value: 'OUTROS', label: 'Outros' },
];

const tiposOperacoes = [
  { value: 'VENDA', label: 'Venda' },
  { value: 'ALUGUEL', label: 'Aluguel' },
  { value: 'VENDA_ALUGUEL', label: 'Venda e Aluguel' },
  { value: 'TEMPORADA', label: 'Temporada' },
  { value: 'PERMUTA', label: 'Permuta' },
];

const statusImoveis = [
  { value: 'ATIVO', label: 'Ativo/Disponível' },
  { value: 'INATIVO', label: 'Inativo' },
  { value: 'VENDIDO', label: 'Vendido' },
  { value: 'ALUGADO', label: 'Alugado' },
  { value: 'EM_ANALISE', label: 'Em Análise' },
  { value: 'RESERVADO', label: 'Reservado' },
];

// Props do componente
interface ImovelFormProps {
  imovel?: any;
  isLoading?: boolean;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  mode: 'visualizar' | 'editar' | 'adicionar';
}

export function ImovelForm({
  imovel,
  isLoading = false,
  onSubmit,
  onCancel,
  mode,
}: ImovelFormProps) {
  // Estado para controlar o loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  
  // Preparando dados para o formulário
  const adicionaisIds = imovel?.adicionais 
    ? imovel.adicionais.map((adicional: any) => adicional.id)
    : [];
    
  // Configuração do React Hook Form com Zod
  const form = useForm<ImovelFormData>({
    resolver: zodResolver(imovelSchema),
    defaultValues: {
      titulo: imovel?.titulo || '',
      descricao: imovel?.descricao || '',
      valor: imovel?.valor || 0,
      tipoImovel: imovel?.tipoImovel || '',
      tipoOperacao: imovel?.tipoOperacao || '',
      status: imovel?.status || 'ATIVO',
      quartos: imovel?.quartos || 0,
      banheiros: imovel?.banheiros || 0,
      suites: imovel?.suites || 0,
      areaTotal: imovel?.areaTotal || 0,
      areaUtil: imovel?.areaConstruida || 0,
      vagas: imovel?.vagas || 0,
      andar: imovel?.andar || 0,
      endereco: imovel?.endereco || '',
      bairro: imovel?.bairro || '',
      cidade: imovel?.cidade || '',
      estado: imovel?.estado || '',
      cep: imovel?.cep || '',
      adicionais: adicionaisIds,
      corretorId: imovel?.corretorId || '',
      imobiliariaId: imovel?.imobiliariaId || '',
      proprietarioId: imovel?.proprietarioId || '',
      fotos: imovel?.fotos || [],
      fotoPrincipal: imovel?.fotoPrincipal || '',
      codigoInterno: imovel?.codigo || '',
    },
  });

  // Lidar com o envio do formulário
  async function handleSubmit(data: ImovelFormData) {
    setIsSubmitting(true);
    try {
      // Formatar os dados para envio
      const formattedData = {
        ...data,
        id: imovel?.id, // Manter o ID em caso de edição
        adicionais: data.adicionais?.map(id => ({ id })) || [],
        // Garantir que o array de fotos tem o formato correto
        fotos: Array.isArray(data.fotos) 
          ? data.fotos.map((foto, index) => ({
              ...foto,
              ordem: index
            }))
          : []
      };

      await onSubmit(formattedData);
    } catch (error) {
      console.error('Erro ao salvar imóvel:', error);
      toast.error('Erro ao salvar imóvel. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Aplicar título gerado pela IA
  function aplicarTitulo(titulo: string) {
    form.setValue('titulo', titulo);
  }

  // Aplicar descrição gerada pela IA
  function aplicarDescricao(descricao: string) {
    form.setValue('descricao', descricao);
  }

  // Verificar se está no modo visualização
  const isReadOnly = mode === 'visualizar';

  return (
    <div className="max-h-screen flex flex-col">
      <ImovelFormHeader
        isEditing={mode === 'editar'}
        titulo={imovel?.titulo || 'Novo Imóvel'}
        isLoading={isLoading || isSubmitting}
        onClose={onCancel}
        onSalvar={form.handleSubmit(handleSubmit)}
      />

      <div className="flex-1 overflow-y-auto p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start mb-6">
                <TabsTrigger value="info" className="flex items-center gap-2">
                  <Home className="h-4 w-4" /> Informações
                </TabsTrigger>
                <TabsTrigger value="fotos" className="flex items-center gap-2">
                  <Image className="h-4 w-4" /> Fotos
                </TabsTrigger>
                <TabsTrigger value="adicionais" className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4" /> Adicionais
                </TabsTrigger>
                <TabsTrigger value="corretor" className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Corretor
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-6">
                {/* Informações Básicas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Básicas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="titulo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Título do Imóvel</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Ex: Apartamento moderno próximo ao centro" 
                                  {...field} 
                                  disabled={isReadOnly} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {!isReadOnly && (
                          <ImovelAIHelper
                            tipo="titulo"
                            detalhes={form.getValues()}
                            valorAtual={form.getValues('titulo')}
                            onAplicar={aplicarTitulo}
                          />
                        )}
                      </div>

                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="descricao"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descrição</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Descreva o imóvel detalhadamente..." 
                                  className="min-h-32" 
                                  {...field} 
                                  disabled={isReadOnly}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {!isReadOnly && (
                          <ImovelAIHelper
                            tipo="descricao"
                            detalhes={form.getValues()}
                            valorAtual={form.getValues('descricao')}
                            onAplicar={aplicarDescricao}
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Seção de tipificação e valores */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tipo e Valor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="tipoImovel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Imóvel</FormLabel>
                            <Select 
                              disabled={isReadOnly}
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {tiposImoveis.map((tipo) => (
                                  <SelectItem key={tipo.value} value={tipo.value}>
                                    {tipo.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tipoOperacao"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Operação</FormLabel>
                            <Select 
                              disabled={isReadOnly}
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a operação" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {tiposOperacoes.map((tipo) => (
                                  <SelectItem key={tipo.value} value={tipo.value}>
                                    {tipo.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="valor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor (R$)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0,00"
                                {...field}
                                disabled={isReadOnly}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status do Imóvel</FormLabel>
                            <Select 
                              disabled={isReadOnly}
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {statusImoveis.map((status) => (
                                  <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="codigoInterno"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Código Interno</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ex: AP001" 
                                {...field} 
                                disabled={isReadOnly || mode === 'editar'} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Seção de endereço */}
                <Card>
                  <CardHeader>
                    <CardTitle>Localização</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="endereco"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Endereço</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Rua, número" 
                                {...field} 
                                disabled={isReadOnly} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bairro"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bairro</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Bairro" 
                                {...field} 
                                disabled={isReadOnly} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cidade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Cidade" 
                                {...field} 
                                disabled={isReadOnly} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="estado"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Estado" 
                                {...field} 
                                disabled={isReadOnly} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cep"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CEP</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="CEP" 
                                {...field} 
                                disabled={isReadOnly} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Seção de características */}
                <Card>
                  <CardHeader>
                    <CardTitle>Características</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <FormField
                        control={form.control}
                        name="quartos"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quartos</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                disabled={isReadOnly}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="suites"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Suítes</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                disabled={isReadOnly}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="banheiros"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Banheiros</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                disabled={isReadOnly}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="vagas"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vagas de Garagem</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                disabled={isReadOnly}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="areaTotal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Área Total (m²)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                disabled={isReadOnly}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="areaUtil"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Área Útil (m²)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                disabled={isReadOnly}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Botão só é mostrado no modo visualização, outros modos usam o cabeçalho */}
                {isReadOnly && (
                  <div className="flex justify-end">
                    <Button variant="outline" onClick={onCancel}>
                      Fechar
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="fotos" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Galeria de Fotos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="fotos"
                      render={({ field }) => (
                        <FormItem>
                          <ImovelGaleria
                            fotos={field.value || []}
                            onChange={field.onChange}
                            onSetFotoPrincipal={(url) => form.setValue('fotoPrincipal', url)}
                            fotoPrincipal={form.getValues('fotoPrincipal')}
                            disabled={isReadOnly}
                          />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="adicionais" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Características Adicionais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="adicionais"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Selecione as características deste imóvel</FormLabel>
                          <FormControl>
                            <AdicionaisSeletor
                              values={field.value || []}
                              onChange={field.onChange}
                              disabled={isReadOnly}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="corretor" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Corretor Responsável</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="corretorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Selecione o corretor responsável por este imóvel</FormLabel>
                          <FormControl>
                            <CorretorSeletor
                              value={field.value}
                              onChange={field.onChange}
                              disabled={isReadOnly}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </div>
    </div>
  );
}
