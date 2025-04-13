'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layout/page-container';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Loader2 } from 'lucide-react';
import { ImovelListagem } from '@/components/imoveis/imovel-listagem';
import { ImovelFormHeader } from '@/components/imoveis/imovel-form-header';
import { ImovelAIHelper } from '@/components/imoveis/imovel-ai-helper';
import { ImovelForm } from '@/components/imoveis/imovel-form-new';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

interface Imovel {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  valor: number;
  tipoOperacao: string;
  tipoImovel: string;
  status: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  fotoPrincipal?: string;
  quartos?: number;
  banheiros?: number;
  areaTotal?: number;
  [key: string]: any;
}

export default function ImoveisPage() {
  // Estados principais
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [imovelAtual, setImovelAtual] = useState<Imovel | null>(null);
  const [modoFormulario, setModoFormulario] = useState<'visualizar' | 'editar' | 'adicionar' | null>(null);

  // Ações básicas
  const abrirFormularioAdicao = () => {
    setImovelAtual(null);
    setModoFormulario('adicionar');
  };

  const abrirVisualizacao = (imovel: Imovel) => {
    setImovelAtual(imovel);
    setModoFormulario('visualizar');
  };

  const abrirFormularioEdicao = (imovel: Imovel) => {
    setImovelAtual(imovel);
    setModoFormulario('editar');
  };

  const fecharFormulario = () => {
    setModoFormulario(null);
    setImovelAtual(null);
  };

  // Excluir imóvel
  const excluirImovel = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/imobiliaria/imoveis/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir imóvel');
      }

      toast.success('Imóvel excluído com sucesso');
      // Atualizar lista de imóveis
      setImoveis(imoveis.filter(imovel => imovel.id !== id));
    } catch (error) {
      console.error('Erro ao excluir imóvel:', error);
      toast.error('Não foi possível excluir o imóvel. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Carrega dados iniciais
  useEffect(() => {
    // Esta função seria para carregar dados, mas já temos os dados
    // através do componente ImovelListagem
  }, []);

  // Salvar imóvel (novo ou edição)
  const salvarImovel = async (dados: any) => {
    const isEdicao = !!dados.id;

    try {
      setIsLoading(true);

      // URL e método dependem se é criação ou edição
      const url = isEdicao 
        ? `/api/imobiliaria/imoveis/${dados.id}` 
        : '/api/imobiliaria/imoveis';
      
      const method = isEdicao ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar imóvel');
      }

      const responseData = await response.json();
      
      toast.success(
        isEdicao ? 'Imóvel atualizado com sucesso' : 'Imóvel criado com sucesso'
      );

      // Fechar formulário e atualizar página
      fecharFormulario();
      router.refresh();
    } catch (error) {
      console.error('Erro ao salvar imóvel:', error);
      toast.error('Erro ao salvar imóvel. Verifique os dados e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Renderização condicional do formulário em modal
  const renderModalContent = () => {
    if (!modoFormulario) return null;

    return (
      <ImovelForm
        imovel={imovelAtual}
        isLoading={isLoading}
        onSubmit={salvarImovel}
        onCancel={fecharFormulario}
        mode={modoFormulario}
      />
    );
  };

  return (
    <PageContainer
      title="Imóveis"
      description="Gerencie todos os seus imóveis em um só lugar"
      actions={null}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Todos os Imóveis</CardTitle>
              <CardDescription>
                Visualize, edite e gerencie seus imóveis
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="todos" onValueChange={setFiltroStatus}>
            <TabsList className="mb-4">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="ATIVO">Disponíveis</TabsTrigger>
              <TabsTrigger value="VENDIDO">Vendidos</TabsTrigger>
              <TabsTrigger value="ALUGADO">Alugados</TabsTrigger>
            </TabsList>
            <TabsContent value={filtroStatus}>
              <ImovelListagem
                onVerDetalhes={abrirVisualizacao}
                onEditar={abrirFormularioEdicao}
                onDeletar={excluirImovel}
                onAdicionar={abrirFormularioAdicao}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal para adicionar/editar/visualizar imóvel */}
      <Dialog open={!!modoFormulario} onOpenChange={(open) => !open && fecharFormulario()}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-[1600px] overflow-auto p-0" hideClose>
          {renderModalContent()}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
