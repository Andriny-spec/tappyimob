import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Star, StarHalf, Loader2, CheckCircle, AlertCircle, User } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Tipo para as avaliações
interface Avaliacao {
  id: string;
  titulo: string;
  descricao: string;
  nota: number;
  usuarioId: string;
  usuario: {
    nome: string;
    fotoPerfil?: string;
  };
  createdAt: Date;
}

interface PropertyReviewsProps {
  imovelId: string;
  imobiliariaId: string;
  avaliacoes?: Avaliacao[];
  corPrimaria: string;
  corSecundaria: string;
  corTexto: string;
  fonteTitulos: string;
  fonteCorpo: string;
  className?: string;
}

export function PropertyReviews({
  imovelId,
  imobiliariaId,
  avaliacoes = [],
  corPrimaria,
  corSecundaria,
  corTexto,
  fonteTitulos,
  fonteCorpo,
  className
}: PropertyReviewsProps) {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    nota: 5
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const reviewsStyle = {
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
  
  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({
      ...prev,
      nota: rating
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Preparar dados para envio
      const data = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        nota: formData.nota,
        imovelId,
        imobiliariaId
      };
      
      // Enviar para API
      const response = await fetch('/api/avaliacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao enviar sua avaliação. Por favor, tente novamente.');
      }
      
      setSuccess(true);
      setFormData({
        titulo: '',
        descricao: '',
        nota: 5
      });
      
      toast.success('Avaliação enviada com sucesso!');
      setShowForm(false);
      
      // Reset success state after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado');
      toast.error('Erro ao enviar avaliação');
    } finally {
      setLoading(false);
    }
  };
  
  // Renderiza as estrelas de avaliação
  const renderRatingStars = (rating: number, interactive = false) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star 
            key={i}
            className={cn(
              "w-5 h-5 fill-current", 
              interactive && "cursor-pointer hover:scale-110 transition-transform"
            )}
            style={{ color: 'var(--cor-primaria)' }}
            onClick={interactive ? () => handleRatingChange(i) : undefined}
          />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <StarHalf 
            key={i}
            className={cn(
              "w-5 h-5", 
              interactive && "cursor-pointer hover:scale-110 transition-transform"
            )}
            style={{ color: 'var(--cor-primaria)' }}
            onClick={interactive ? () => handleRatingChange(i) : undefined}
          />
        );
      } else {
        stars.push(
          <Star 
            key={i}
            className={cn(
              "w-5 h-5 text-gray-300", 
              interactive && "cursor-pointer hover:scale-110 transition-transform"
            )}
            onClick={interactive ? () => handleRatingChange(i) : undefined}
          />
        );
      }
    }
    
    return stars;
  };
  
  // Calcula a média das avaliações
  const calcularMediaAvaliacoes = () => {
    if (avaliacoes.length === 0) return 0;
    const soma = avaliacoes.reduce((acc, av) => acc + av.nota, 0);
    return parseFloat((soma / avaliacoes.length).toFixed(1));
  };
  
  const mediaAvaliacoes = calcularMediaAvaliacoes();
  
  return (
    <div 
      className={cn("bg-white rounded-xl p-6 shadow-md", className)}
      style={reviewsStyle}
    >
      <div className="mb-6">
        <h3 
          className="text-xl font-semibold mb-2"
          style={{ 
            color: 'var(--cor-texto)', 
            fontFamily: 'var(--fonte-titulos)'
          }}
        >
          Avaliações do imóvel
        </h3>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div className="flex items-center mb-3 sm:mb-0">
            <div className="flex mr-2">
              {renderRatingStars(mediaAvaliacoes)}
            </div>
            <span className="text-lg font-semibold">{mediaAvaliacoes}</span>
            <span className="text-gray-500 ml-2">
              ({avaliacoes.length} {avaliacoes.length === 1 ? 'avaliação' : 'avaliações'})
            </span>
          </div>
          
          {!showForm && (
            <Button 
              variant="outline" 
              onClick={() => setShowForm(true)}
              style={{ 
                borderColor: 'var(--cor-primaria)',
                color: 'var(--cor-primaria)'
              }}
            >
              Avaliar este imóvel
            </Button>
          )}
        </div>
      </div>
      
      {/* Formulário de avaliação */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 border rounded-lg p-4 bg-gray-50">
          <h4 
            className="text-lg font-medium mb-4"
            style={{ 
              color: 'var(--cor-texto)', 
              fontFamily: 'var(--fonte-titulos)'
            }}
          >
            Sua avaliação
          </h4>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="nota">Nota</Label>
              <div className="flex mt-1">
                {renderRatingStars(formData.nota, true)}
              </div>
            </div>
            
            <div>
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                placeholder="Resumo da sua experiência"
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="descricao">Comentário</Label>
              <Textarea
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                placeholder="Compartilhe sua opinião sobre este imóvel"
                required
                className="mt-1 min-h-[100px]"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="submit"
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
                  'Enviar avaliação'
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
            </div>
            
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
                  Avaliação enviada com sucesso! Obrigado pelo seu feedback.
                </span>
              </div>
            )}
          </div>
        </form>
      )}
      
      {/* Lista de avaliações */}
      <div className="space-y-6">
        {avaliacoes.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              Este imóvel ainda não possui avaliações.
              {!showForm && (
                <Button 
                  variant="link"
                  onClick={() => setShowForm(true)}
                  style={{ color: 'var(--cor-primaria)' }}
                >
                  Seja o primeiro a avaliar!
                </Button>
              )}
            </p>
          </div>
        ) : (
          avaliacoes.map((avaliacao) => (
            <div key={avaliacao.id} className="border-b pb-6 last:border-b-0 last:pb-0">
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {avaliacao.usuario.fotoPerfil ? (
                      <img 
                        src={avaliacao.usuario.fotoPerfil} 
                        alt={avaliacao.usuario.nome} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h5 
                      className="font-medium"
                      style={{ 
                        color: 'var(--cor-texto)', 
                        fontFamily: 'var(--fonte-titulos)'
                      }}
                    >
                      {avaliacao.usuario.nome}
                    </h5>
                    <p className="text-xs text-gray-500">
                      {format(new Date(avaliacao.createdAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="flex">
                  {renderRatingStars(avaliacao.nota)}
                </div>
              </div>
              
              <h6 
                className="font-medium mb-2"
                style={{ color: 'var(--cor-texto)' }}
              >
                {avaliacao.titulo}
              </h6>
              
              <p className="text-gray-600">
                {avaliacao.descricao}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
