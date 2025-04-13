'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { 
  Trash2, 
  Plus, 
  Image as ImageIcon, 
  ArrowUpCircle, 
  ArrowDownCircle 
} from 'lucide-react';

interface Foto {
  id?: string;
  url: string;
  legenda?: string;
  ordem: number;
  imovelId?: string;
}

interface ImovelGaleriaProps {
  fotos: Foto[];
  onChange: (fotos: Foto[]) => void;
  onSetFotoPrincipal: (url: string) => void;
  fotoPrincipal?: string;
  disabled?: boolean;
}

export function ImovelGaleria({ 
  fotos, 
  onChange, 
  onSetFotoPrincipal, 
  fotoPrincipal,
  disabled = false 
}: ImovelGaleriaProps) {
  const [novaUrl, setNovaUrl] = useState('');

  const adicionarFoto = () => {
    if (!novaUrl.trim()) return;
    
    const novaFoto: Foto = {
      url: novaUrl,
      legenda: '',
      ordem: fotos.length
    };
    
    onChange([...fotos, novaFoto]);
    setNovaUrl('');
  };

  const removerFoto = (index: number) => {
    const novasFotos = [...fotos];
    novasFotos.splice(index, 1);
    // Reordenar
    const fotosReordenadas = novasFotos.map((foto, idx) => ({
      ...foto,
      ordem: idx
    }));
    onChange(fotosReordenadas);
  };

  const definirComoPrincipal = (url: string) => {
    onSetFotoPrincipal(url);
  };

  const moverFoto = (index: number, direcao: 'acima' | 'abaixo') => {
    if (
      (direcao === 'acima' && index === 0) || 
      (direcao === 'abaixo' && index === fotos.length - 1)
    ) {
      return;
    }

    const novasFotos = [...fotos];
    const novoIndex = direcao === 'acima' ? index - 1 : index + 1;
    
    // Trocar posições
    [novasFotos[index], novasFotos[novoIndex]] = [novasFotos[novoIndex], novasFotos[index]];
    
    // Atualizar ordem
    const fotosReordenadas = novasFotos.map((foto, idx) => ({
      ...foto,
      ordem: idx
    }));
    
    onChange(fotosReordenadas);
  };

  const atualizarLegenda = (index: number, legenda: string) => {
    const novasFotos = [...fotos];
    novasFotos[index] = {
      ...novasFotos[index],
      legenda
    };
    onChange(novasFotos);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="url"
            placeholder="URL da imagem"
            value={novaUrl}
            onChange={(e) => setNovaUrl(e.target.value)}
            disabled={disabled}
          />
        </div>
        <Button
          type="button"
          onClick={adicionarFoto}
          disabled={!novaUrl || disabled}
        >
          <Plus className="mr-2 h-4 w-4" /> Adicionar Foto
        </Button>
      </div>

      {fotos.length === 0 ? (
        <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg p-4 text-muted-foreground">
          <div className="text-center">
            <ImageIcon className="h-10 w-10 mx-auto mb-2 text-muted-foreground/60" />
            <p>Nenhuma foto adicionada</p>
            <p className="text-sm">Adicione fotos para melhorar a visibilidade do imóvel</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fotos.map((foto, index) => (
            <Card key={index} className={`relative overflow-hidden ${foto.url === fotoPrincipal ? 'ring-2 ring-primary' : ''}`}>
              <div className="aspect-video relative">
                <img 
                  src={foto.url} 
                  alt={foto.legenda || `Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {foto.url === fotoPrincipal && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-medium">
                    Principal
                  </div>
                )}
              </div>
              <CardContent className="p-3 space-y-2">
                <Input
                  type="text"
                  placeholder="Legenda da foto"
                  value={foto.legenda || ''}
                  onChange={(e) => atualizarLegenda(index, e.target.value)}
                  className="text-sm h-8"
                  disabled={disabled}
                />
                
                <div className="flex gap-1 justify-between">
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => moverFoto(index, 'acima')}
                      disabled={index === 0 || disabled}
                      className="h-8 w-8 p-0"
                    >
                      <ArrowUpCircle className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => moverFoto(index, 'abaixo')}
                      disabled={index === fotos.length - 1 || disabled}
                      className="h-8 w-8 p-0"
                    >
                      <ArrowDownCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex gap-1">
                    {foto.url !== fotoPrincipal && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => definirComoPrincipal(foto.url)}
                        disabled={disabled}
                        className="h-8 text-xs"
                      >
                        Definir Principal
                      </Button>
                    )}
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => removerFoto(index)}
                      disabled={disabled}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
