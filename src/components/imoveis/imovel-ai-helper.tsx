'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface ImovelAIHelperProps {
  tipo: 'titulo' | 'descricao';
  detalhes: any;
  valorAtual: string;
  onAplicar: (texto: string) => void;
}

export function ImovelAIHelper({ 
  tipo, 
  detalhes, 
  valorAtual, 
  onAplicar 
}: ImovelAIHelperProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [textoGerado, setTextoGerado] = useState('');

  async function gerarTexto() {
    if (isLoading) return;

    // Verificar se temos informações mínimas para gerar
    if (!detalhes.tipoImovel) {
      toast.error('Selecione o tipo do imóvel antes de gerar o texto');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/imobiliaria/imoveis/gerar-texto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo,
          detalhes
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao gerar texto');
      }

      const data = await response.json();
      setTextoGerado(data[tipo]);
      toast.success(`${tipo === 'titulo' ? 'Título' : 'Descrição'} gerado com sucesso!`);
    } catch (error) {
      console.error('Erro ao gerar texto:', error);
      toast.error('Não foi possível gerar o texto. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  function aplicarTexto() {
    if (textoGerado) {
      onAplicar(textoGerado);
      setTextoGerado('');
      toast.success(`${tipo === 'titulo' ? 'Título' : 'Descrição'} aplicado`);
    }
  }

  function limparTexto() {
    setTextoGerado('');
  }

  return (
    <div className="border rounded-md p-3 space-y-3 bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-medium">
            Gerar {tipo === 'titulo' ? 'título' : 'descrição'} com IA
          </h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={gerarTexto}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" /> 
              Gerando...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-3 w-3" /> 
              Gerar {tipo === 'titulo' ? 'Título' : 'Descrição'}
            </>
          )}
        </Button>
      </div>

      {textoGerado && (
        <div className="space-y-2">
          <Textarea
            value={textoGerado}
            onChange={(e) => setTextoGerado(e.target.value)}
            rows={tipo === 'titulo' ? 2 : 7}
            className="resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={limparTexto}>
              Limpar
            </Button>
            <Button variant="default" size="sm" onClick={aplicarTexto}>
              Aplicar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
