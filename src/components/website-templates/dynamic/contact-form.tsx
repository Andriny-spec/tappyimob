import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ContactFormProps {
  imovelId?: string;
  imovelTitulo?: string;
  imovelCodigo?: string;
  imobiliariaId: string;
  corPrimaria: string;
  corSecundaria: string;
  corTexto: string;
  fonteTitulos: string;
  fonteCorpo: string;
  className?: string;
}

export function ContactForm({
  imovelId,
  imovelTitulo,
  imovelCodigo,
  imobiliariaId,
  corPrimaria,
  corSecundaria,
  corTexto,
  fonteTitulos,
  fonteCorpo,
  className
}: ContactFormProps) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    mensagem: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const formStyle = {
    '--cor-primaria': corPrimaria,
    '--cor-secundaria': corSecundaria,
    '--cor-texto': corTexto,
    '--fonte-titulos': fonteTitulos,
    '--fonte-corpo': fonteCorpo,
  } as React.CSSProperties;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Preparar assunto baseado no contexto (se for para um imóvel específico)
      const assunto = imovelId 
        ? `Interesse no imóvel: ${imovelTitulo || ''} (${imovelCodigo || ''})`
        : 'Contato via formulário de atendimento';
        
      const data = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        mensagem: formData.mensagem,
        assunto: assunto,
        imobiliariaSlug: imobiliariaId, // Usando o ID como slug temporariamente
        imovelId: imovelId || undefined
      };
      
      // Enviar para API
      const response = await fetch('/api/mensagens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Erro ao enviar sua mensagem. Por favor, tente novamente.');
      }
      
      setSuccess(true);
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        mensagem: ''
      });
      
      toast.success('Mensagem enviada com sucesso!');
      
      // Reset success state after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado');
      toast.error('Erro ao enviar mensagem');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn("bg-white rounded-xl p-6 shadow-md", className)}
      style={formStyle}
    >
      <div className="mb-6">
        <h3 
          className="text-xl font-semibold mb-2"
          style={{ 
            color: 'var(--cor-texto)', 
            fontFamily: 'var(--fonte-titulos)'
          }}
        >
          {imovelId ? 'Interesse neste imóvel?' : 'Entre em contato'}
        </h3>
        <p className="text-gray-600 text-sm">
          {imovelId 
            ? 'Preencha o formulário abaixo para receber mais informações sobre este imóvel' 
            : 'Entre em contato conosco. Responderemos o mais breve possível'}
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="nome">Nome*</Label>
          <Input
            id="nome"
            name="nome" 
            value={formData.nome}
            onChange={handleChange}
            placeholder="Seu nome completo"
            required
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="email">E-mail*</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Seu melhor e-mail"
            required
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="telefone">Telefone*</Label>
          <Input
            id="telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
            required
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="mensagem">Mensagem*</Label>
          <Textarea
            id="mensagem"
            name="mensagem"
            value={formData.mensagem}
            onChange={handleChange}
            placeholder={imovelId 
              ? "Olá, tenho interesse neste imóvel e gostaria de mais informações." 
              : "Sua mensagem aqui..."}
            required
            className="mt-1 min-h-[100px]"
          />
        </div>
        
        <Button 
          type="submit"
          className="w-full"
          disabled={loading}
          style={{ 
            backgroundColor: 'var(--cor-primaria)',
            color: 'white'
          }}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            'Enviar mensagem'
          )}
        </Button>
        
        {error && (
          <div className="bg-red-50 p-3 rounded-md flex items-start mt-4">
            <AlertCircle className="text-red-500 h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-700">
              {error}
            </span>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 p-3 rounded-md flex items-start mt-4">
            <CheckCircle className="text-green-500 h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-green-700">
              Mensagem enviada com sucesso! Em breve entraremos em contato.
            </span>
          </div>
        )}
      </div>
    </form>
  );
}
