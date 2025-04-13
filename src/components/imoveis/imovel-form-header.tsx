'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, X } from 'lucide-react';

interface ImovelFormHeaderProps {
  isEditing: boolean;
  titulo: string;
  isLoading: boolean;
  onClose: () => void;
  onSalvar: () => void;
}

export function ImovelFormHeader({ 
  isEditing, 
  titulo, 
  isLoading, 
  onClose, 
  onSalvar 
}: ImovelFormHeaderProps) {
  const [confirmacao, setConfirmacao] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between border-b p-4 sticky top-0 bg-white z-10">
        <h2 className="text-xl font-semibold">
          {isEditing ? 'Editar Imóvel' : 'Adicionar Novo Imóvel'}
        </h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setConfirmacao(true)}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-1" /> Cancelar
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={onSalvar}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Imóvel
          </Button>
        </div>
      </div>

      {/* Modal de confirmação para sair */}
      <Dialog open={confirmacao} onOpenChange={setConfirmacao}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deseja cancelar?</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Você tem alterações não salvas que serão perdidas.'
                : 'Este imóvel não será salvo. Deseja realmente cancelar?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmacao(false)}>
              Continuar Editando
            </Button>
            <Button variant="destructive" onClick={onClose}>
              Cancelar e Sair
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
