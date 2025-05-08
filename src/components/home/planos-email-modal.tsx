'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cadastrarAssinante } from '@/lib/api/tappy';
import { useSession } from 'next-auth/react';

type EmailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  planoId: string;
  planoNome: string;
  planoIntervalo?: 'mensal' | 'anual';
};

export function PlanosEmailModal({ isOpen, onClose, planoId, planoNome, planoIntervalo = 'mensal' }: EmailModalProps) {
  const { data: session } = useSession();
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [mensagem, setMensagem] = useState('');
  const [kirvanoUrl, setKirvanoUrl] = useState('');
  
  // Preencher com os dados da sessão se disponível
  useEffect(() => {
    if (session?.user) {
      setEmail(session.user.email || '');
      setNome(session.user.name || '');
    }
  }, [session]);

  // Aplicar máscara no telefone - versão corrigida
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Pegar apenas os números
    const numeros = e.target.value.replace(/\D/g, '');
    
    // Aplicar máscara de acordo com a quantidade de dígitos
    let telefoneFormatado = numeros;
    
    if (numeros.length > 0) {
      // Formatar DDD
      telefoneFormatado = `(${numeros.slice(0, 2)}`;
      
      if (numeros.length > 2) {
        // Adicionar fechamento do DDD
        telefoneFormatado += ') ';
        
        // Adicionar o prefixo do telefone
        if (numeros.length <= 7) {
          // Adicionar apenas o que tem
          telefoneFormatado += numeros.slice(2);
        } else {
          // Formatar com hífen para celular/fixo
          telefoneFormatado += `${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
        }
      }
    }
    
    setTelefone(telefoneFormatado);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setStatus('error');
      setMensagem('Por favor, informe seu email');
      return;
    }
    
    if (!nome.trim()) {
      setStatus('error');
      setMensagem('Por favor, informe seu nome');
      return;
    }
    
    if (!telefone.trim() || telefone.length < 14) {
      setStatus('error');
      setMensagem('Por favor, informe um telefone válido');
      return;
    }
    
    try {
      setStatus('loading');
      
      const resultado = await cadastrarAssinante({
        email: email.trim(),
        nome: nome.trim(),
        telefone: telefone.trim().replace(/\D/g, ''),
        planoId,
        intervalo: planoIntervalo
      });
      
      console.log('Resposta da API:', resultado);
      
      if (resultado.success) {
        setStatus('success');
        setMensagem(resultado.message);
        
        // Garantir que temos uma URL para redirecionamento
        if (resultado.kirvanoUrl) {
          setKirvanoUrl(resultado.kirvanoUrl);
          console.log('URL de redirecionamento definida:', resultado.kirvanoUrl);
        } else {
          console.warn('Sucesso, mas sem URL de redirecionamento');
          setMensagem(resultado.message + ' Aguarde o redirecionamento para o pagamento...');
        }
      } else {
        setStatus('error');
        setMensagem(resultado.message);
        console.error('Erro na resposta da API:', resultado.message);
      }
    } catch (error) {
      setStatus('error');
      setMensagem('Ocorreu um erro ao processar seu cadastro. Por favor, tente novamente.');
      console.error('Erro ao cadastrar:', error);
    }
  };

  const handleContinuarParaPagamento = () => {
    console.log('URL para redirecionamento:', kirvanoUrl);
    if (kirvanoUrl) {
      // Abrir em nova aba para garantir que o redirecionamento funcione
      window.open(kirvanoUrl, '_blank');
    } else {
      console.error('URL de pagamento não disponível');
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
            <div className="pb-3 mb-4 border-b">
              <div className="flex items-start space-x-2 text-blue-600 bg-blue-50 p-3 rounded-md">
                <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">
                  Uma conta será criada automaticamente se você ainda não for cadastrado.
                  A senha inicial será enviada para seu email.
                </p>
              </div>
            </div>
          
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email *
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                disabled={status === 'loading' || !!session?.user}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="nome" className="text-sm font-medium">
                Nome completo *
              </label>
              <Input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                disabled={status === 'loading'}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="telefone" className="text-sm font-medium">
                Telefone *
              </label>
              <Input
                id="telefone"
                type="text"
                value={telefone}
                onChange={handleTelefoneChange}
                placeholder="(00) 00000-0000"
                disabled={status === 'loading'}
                required
                maxLength={15}
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
