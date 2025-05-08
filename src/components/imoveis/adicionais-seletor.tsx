'use client';

import { useState, useEffect } from 'react';
import { Check, Plus, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

export interface Adicional {
  id: string;
  nome: string;
}

interface AdicionaisSeletorProps {
  values: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
}

export function AdicionaisSeletor({ values = [], onChange, disabled = false }: AdicionaisSeletorProps) {
  // Garantir que values seja sempre um array
  const safeValues = Array.isArray(values) ? values : [];
  const [open, setOpen] = useState(false);
  const [adicionais, setAdicionais] = useState<Adicional[]>([]);
  const [adicionaisSelecionados, setAdicionaisSelecionados] = useState<Adicional[]>([]);
  const [loading, setLoading] = useState(true);
  const [novoAdicional, setNovoAdicional] = useState('');

  useEffect(() => {
    async function carregarAdicionais() {
      try {
        const response = await fetch('/api/imobiliaria/adicionais');
        if (!response.ok) throw new Error('Falha ao carregar adicionais');
        const data = await response.json();
        setAdicionais(data);
        
        if (safeValues.length > 0) {
          const selecionados = data.filter((a: Adicional) => safeValues.includes(a.id));
          setAdicionaisSelecionados(selecionados);
        }
      } catch (error) {
        console.error('Erro ao carregar adicionais:', error);
      } finally {
        setLoading(false);
      }
    }

    carregarAdicionais();
  }, [safeValues]);
  
  // Atualizar adicionaisSelecionados quando os valores mudarem
  useEffect(() => {
    if (adicionais.length > 0 && safeValues.length > 0) {
      const selecionados = adicionais.filter((a) => safeValues.includes(a.id));
      setAdicionaisSelecionados(selecionados);
    } else if (safeValues.length === 0) {
      setAdicionaisSelecionados([]);
    }
  }, [safeValues, adicionais]);

  const toggleAdicional = (adicionalId: string) => {
    const novosSelecionados = safeValues.includes(adicionalId)
      ? safeValues.filter(id => id !== adicionalId)
      : [...safeValues, adicionalId];
    
    onChange(novosSelecionados);
  };

  const removerAdicional = (adicionalId: string) => {
    onChange(safeValues.filter(id => id !== adicionalId));
  };

  const adicionarNovoAdicional = async () => {
    if (!novoAdicional.trim()) return;
    
    try {
      const response = await fetch('/api/imobiliaria/adicionais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: novoAdicional })
      });
      
      if (!response.ok) throw new Error('Falha ao adicionar');
      
      const adicional = await response.json();
      setAdicionais(prev => [...prev, adicional]);
      onChange([...safeValues, adicional.id]);
      setNovoAdicional('');
    } catch (error) {
      console.error('Erro ao adicionar:', error);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[38px]">
        {adicionaisSelecionados.length === 0 ? (
          <div className="text-muted-foreground text-sm">Nenhum adicional selecionado</div>
        ) : (
          adicionaisSelecionados.map(adicional => (
            <Badge 
              key={adicional.id} 
              variant="secondary"
              className="flex items-center gap-1"
            >
              {adicional.nome}
              {!disabled && (
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => removerAdicional(adicional.id)}
                />
              )}
            </Badge>
          ))
        )}
      </div>
      
      {!disabled && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 border-dashed">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar característica
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="start" onInteractOutside={(e) => e.preventDefault()}>
            <div className="sr-only">
              <DialogTitle>Gerenciar Adicionais</DialogTitle>
            </div>
            <div className="flex flex-col w-full">
              <div className="flex items-center gap-2 border-b px-3 py-2">
                <Search className="h-4 w-4 shrink-0 opacity-50" />
                <Input
                  className="h-8 flex-1 border-none shadow-none focus-visible:ring-0"
                  placeholder="Buscar adicional..."
                  onChange={(e) => {
                    const valor = e.target.value.toLowerCase();
                    const filtrados = adicionais.filter(a => 
                      a.nome.toLowerCase().includes(valor));
                    setAdicionais(filtrados.length > 0 ? filtrados : adicionais);
                  }}
                />
              </div>
              
              <div className="border-t px-3 py-2">
                <div className="flex items-center gap-2">
                  <Input
                    className="h-8 flex-1"
                    placeholder="Novo adicional..."
                    value={novoAdicional}
                    onChange={(e) => setNovoAdicional(e.target.value)}
                  />
                  <Button 
                    size="sm" 
                    className="h-8"
                    onClick={adicionarNovoAdicional}
                    disabled={!novoAdicional.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="h-[200px] py-1">
                {loading ? (
                  <div className="py-6 text-center text-sm">Carregando...</div>
                ) : adicionais.length === 0 ? (
                  <div className="py-6 text-center text-sm">Nenhum adicional encontrado.</div>
                ) : (
                  <div className="space-y-1 p-1">
                    {adicionais.map((adicional) => (
                      <div
                        key={adicional.id}
                        className={cn(
                          "flex items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground",
                          "cursor-pointer"
                        )}
                        onClick={() => toggleAdicional(adicional.id)}
                      >
                        <div className="flex items-center gap-2 w-full">
                          {adicional.nome}
                        </div>
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            safeValues.includes(adicional.id) ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
