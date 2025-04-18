'use client';

import { useState } from 'react';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cadastrarAssinante } from '@/lib/api/tappy';

type EmailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  planoId: string;
  planoNome: string;
};

export function PlanosEmailModal({ isOpen, onClose, planoId, planoNome }: EmailModalProps) {
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [mensagem, setMensagem] = useState('');
  const [kirvanoUrl, setKirvanoUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setStatus('error');
      setMensagem('Por favor, informe seu email');
      return;
    }
    
    try {
      setStatus('loading');
      
      const resultado = await cadastrarAssinante({
        email: email.trim(),
        nome: nome.trim() || undefined,
        planoId
      });
      
      if (resultado.success) {
        setStatus('success');
        setMensagem(resultado.message);
        setKirvanoUrl(resultado.kirvanoUrl || '');
      } else {
        setStatus('error');
        setMensagem(resultado.message);
      }
    } catch (error) {
      setStatus('error');
      setMensagem('Ocorreu um erro ao processar seu cadastro. Por favor, tente novamente.');
      console.error('Erro ao cadastrar:', error);
    }
  };

  const handleContinuarParaPagamento = () => {
    if (kirvanoUrl) {
      window.location.href = kirvanoUrl;
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Finalize seu cadastro</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            {status === 'success' 
              ? 'Estamos quase lá! Continue para finalizar o pagamento.' 
              : `Para continuar com o plano ${planoNome}, precisamos de algumas informações.`}
          </DialogDescription>
        </DialogHeader>

        {status === 'success' ? (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center justify-center text-center space-y-3 py-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-sm">{mensagem}</p>
            </div>
            <Button 
              onClick={handleContinuarParaPagamento}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
            >
              Continuar para pagamento
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email *
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
                disabled={status === 'loading'}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="nome" className="text-sm font-medium">
                Nome (opcional)
              </label>
              <Input
                id="nome"
                placeholder="Seu nome ou nome da imobiliária"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full"
                disabled={status === 'loading'}
              />
            </div>

            {status === 'error' && (
              <div className="bg-red-50 p-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{mensagem}</p>
              </div>
            )}

            <div className="text-xs text-gray-500">
              Ao continuar, você receberá seu acesso no email informado para entrar na plataforma após a confirmação do pagamento.
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                'Continuar para pagamento'
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
