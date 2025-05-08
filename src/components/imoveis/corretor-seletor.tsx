'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, UserCircle2 } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface Corretor {
  id: string;
  fotoPerfil?: string;
  user: {
    nome: string;
    email: string;
  };
}

interface CorretorSeletorProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CorretorSeletor({ value, onChange, disabled = false }: CorretorSeletorProps) {
  const [open, setOpen] = useState(false);
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [loading, setLoading] = useState(true);
  const [corretorSelecionado, setCorretorSelecionado] = useState<Corretor | undefined>();

  useEffect(() => {
    async function carregarCorretores() {
      try {
        const response = await fetch('/api/imobiliaria/corretores');
        if (!response.ok) throw new Error('Falha ao carregar corretores');
        const data = await response.json();
        setCorretores(data);
        
        if (value) {
          const corretor = data.find((c: Corretor) => c.id === value);
          setCorretorSelecionado(corretor);
        }
      } catch (error) {
        console.error('Erro ao carregar corretores:', error);
      } finally {
        setLoading(false);
      }
    }

    carregarCorretores();
  }, [value]);

  const handleSelect = (corretorId: string) => {
    onChange(corretorId);
    setOpen(false);
    const corretor = corretores.find(c => c.id === corretorId);
    setCorretorSelecionado(corretor);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          {corretorSelecionado ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={corretorSelecionado.fotoPerfil} />
                <AvatarFallback>
                  <UserCircle2 className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span>{corretorSelecionado.user.nome}</span>
            </div>
          ) : (
            "Selecionar corretor"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar corretor..." />
          <CommandEmpty>
            {loading ? "Carregando..." : "Nenhum corretor encontrado."}
          </CommandEmpty>
          <CommandGroup className="max-h-60 overflow-auto">
            {corretores.map((corretor) => (
              <CommandItem
                key={corretor.id}
                value={corretor.id}
                onSelect={() => handleSelect(corretor.id)}
              >
                <div className="flex items-center gap-2 w-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={corretor.fotoPerfil} />
                    <AvatarFallback>
                      <UserCircle2 className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span>{corretor.user.nome}</span>
                    <span className="text-xs text-muted-foreground">{corretor.user.email}</span>
                  </div>
                </div>
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === corretor.id ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
