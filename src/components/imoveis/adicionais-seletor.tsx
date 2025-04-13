'use client';

import { useState, useEffect } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
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
  const [open, setOpen] = useState(false);
  const [adicionais, setAdicionais] = useState<Adicional[]>([]);
  const [adicionaisSelecionados, setAdicionaisSelecionados] = useState<Adicional[]>([]);
  const [loading, setLoading] = useState(true);
  const [novoAdicional, setNovoAdicional] = useState('');

  useEffect(() => {
    async function carregarAdicionais() {
      try {
        const response = await fetch('/api/adicionais');
        if (!response.ok) throw new Error('Falha ao carregar adicionais');
        const data = await response.json();
        setAdicionais(data);
        
        if (values && values.length > 0) {
          const selecionados = data.filter((a: Adicional) => values.includes(a.id));
          setAdicionaisSelecionados(selecionados);
        }
      } catch (error) {
        console.error('Erro ao carregar adicionais:', error);
      } finally {
        setLoading(false);
      }
    }

    carregarAdicionais();
  }, [values]);

  const toggleAdicional = (adicionalId: string) => {
    const novosSelecionados = values.includes(adicionalId)
      ? values.filter(id => id !== adicionalId)
      : [...values, adicionalId];
    
    onChange(novosSelecionados);
  };

  const removerAdicional = (adicionalId: string) => {
    onChange(values.filter(id => id !== adicionalId));
  };

  const adicionarNovoAdicional = async () => {
    if (!novoAdicional.trim()) return;
    
    try {
      const response = await fetch('/api/adicionais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: novoAdicional })
      });
      
      if (!response.ok) throw new Error('Falha ao adicionar');
      
      const adicional = await response.json();
      setAdicionais(prev => [...prev, adicional]);
      onChange([...values, adicional.id]);
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
          <PopoverContent className="w-96 p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar adicional..." />
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
              <CommandEmpty>
                {loading ? "Carregando..." : "Nenhum adicional encontrado."}
              </CommandEmpty>
              <CommandGroup className="max-h-60 overflow-auto">
                <ScrollArea className="h-[200px]">
                  {adicionais.map((adicional) => (
                    <CommandItem
                      key={adicional.id}
                      value={adicional.id}
                      onSelect={() => toggleAdicional(adicional.id)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        {adicional.nome}
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          values.includes(adicional.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
