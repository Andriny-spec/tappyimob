import React from 'react';
import { Header1 } from '../headers/header-1';
import { Header2 } from '../headers/header-2';
import { Footer1 } from '../footers/footer-1';
import { Footer2 } from '../footers/footer-2';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, MapPin, Share2, Star, Bath, Ruler, Bed, Car, Heart, MessageSquare, Phone, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ImobiliariaInfo {
  telefone: string;
  endereco: string;
  cnpj: string;
  creci: string;
  descricao: string;
}

interface Endereco {
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  coordenadas?: {
    latitude: number;
    longitude: number;
  };
}

interface Avaliacao {
  id: string;
  autor: string;
  comentario: string;
  nota: number;
  data: string;
}

interface Imovel {
  id: string;
  titulo: string;
  descricao: string;
  preco: number;
  tipo: string;
  categoria: string;
  area: number;
  quartos: number;
  banheiros: number;
  vagas: number;
  imagemUrl: string;
  imagens: string[];
  caracteristicas: string[];
  endereco: Endereco;
  avaliacoes: Avaliacao[];
}

interface SingleImovelPageProps {
  imobiliariaInfo: ImobiliariaInfo;
  nomeSite: string;
  logoUrl: string;
  corPrimaria: string;
  corSecundaria: string;
  corAcentuacao: string;
  corTexto: string;
  fonteTitulos: string;
  fonteCorpo: string;
  headerType: 'header-1' | 'header-2';
  footerType: 'footer-1' | 'footer-2';
  imovel: Imovel;
  imobiliariaSlug: string;
}

export function SingleImovelPage({
  imobiliariaInfo,
  nomeSite,
  logoUrl,
  corPrimaria,
  corSecundaria,
  corAcentuacao,
  corTexto,
  fonteTitulos,
  fonteCorpo,
  headerType = 'header-1',
  footerType = 'footer-1',
  imovel,
  imobiliariaSlug
}: SingleImovelPageProps) {
  // Formatação de preço
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // CSS Variables para estilização
  const cssVariables = {
    '--cor-primaria': corPrimaria,
    '--cor-secundaria': corSecundaria,
    '--cor-acentuacao': corAcentuacao,
    '--cor-texto': corTexto,
    '--fonte-titulos': fonteTitulos,
    '--fonte-corpo': fonteCorpo,
  } as React.CSSProperties;

  // Renderizar Estrelas de Avaliação
  const renderEstrelas = (nota: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          className={cn(
            i <= nota ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          )}
        />
      );
    }
    return stars;
  };

  // Renderiza o header baseado no tipo selecionado
  const renderHeader = () => {
    const headerProps = {
      logoUrl,
      nomeSite,
      corPrimaria,
      corSecundaria,
      corTexto,
      fonteTitulos,
      telefone: imobiliariaInfo.telefone,
      endereco: imobiliariaInfo.endereco
    };

    return headerType === 'header-1' 
      ? <Header1 {...headerProps} /> 
      : <Header2 {...headerProps} />;
  };

  // Renderiza o footer baseado no tipo selecionado
  const renderFooter = () => {
    const footerProps = {
      logoUrl,
      nomeSite,
      corPrimaria,
      corSecundaria,
      corTexto,
      fonteTitulos,
      telefone: imobiliariaInfo.telefone,
      endereco: imobiliariaInfo.endereco,
      creci: imobiliariaInfo.creci,
      cnpj: imobiliariaInfo.cnpj
    };

    return footerType === 'footer-1' 
      ? <Footer1 {...footerProps} /> 
      : <Footer2 {...footerProps} />;
  };

  return (
    <div style={cssVariables} className="flex flex-col min-h-screen">
      {/* Header */}
      {renderHeader()}

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4 flex items-center text-sm">
        <Link href={`/${imobiliariaSlug}/home`} className="hover:underline flex items-center">
          <Home size={14} className="mr-1" />
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/${imobiliariaSlug}/imoveis`} className="hover:underline">
          Imóveis
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-500 truncate max-w-[200px]">{imovel.titulo}</span>
      </div>

      {/* Hero Section - Galeria de Imagens */}
      <section className="container mx-auto px-4 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <Image
              src={imovel.imagens[0] || 'https://placehold.co/800x600/png'}
              alt={imovel.titulo}
              fill
              className="object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {imovel.imagens.slice(1, 5).map((imagem, index) => (
              <div key={index} className="relative h-[190px] rounded-lg overflow-hidden">
                <Image
                  src={imagem}
                  alt={`${imovel.titulo} - imagem ${index + 2}`}
                  fill
                  className="object-cover"
                />
                {index === 3 && imovel.imagens.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xl font-semibold">
                      +{imovel.imagens.length - 5} fotos
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Informações Principais */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Coluna com detalhes do imóvel */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge
                className="bg-[var(--cor-acentuacao)] hover:bg-[var(--cor-acentuacao)]/80"
              >
                {imovel.tipo === 'venda' ? 'Venda' : 'Aluguel'}
              </Badge>
              <Badge variant="outline">{imovel.categoria}</Badge>
              <div className="flex items-center ml-auto">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Share2 size={18} />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Heart size={18} />
                </Button>
              </div>
            </div>

            <h1 
              className="text-3xl lg:text-4xl font-[var(--fonte-titulos)] font-bold mb-2"
              style={{ color: 'var(--cor-texto)' }}
            >
              {imovel.titulo}
            </h1>
            
            <div className="flex items-center text-gray-600 mb-6">
              <MapPin size={18} className="mr-1" />
              <span>
                {imovel.endereco.rua}, {imovel.endereco.numero} - {imovel.endereco.bairro}, {imovel.endereco.cidade}/{imovel.endereco.estado}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                <Bed size={18} className="mr-2 text-[var(--cor-primaria)]" />
                <span>{imovel.quartos} {imovel.quartos === 1 ? 'Quarto' : 'Quartos'}</span>
              </div>
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                <Bath size={18} className="mr-2 text-[var(--cor-primaria)]" />
                <span>{imovel.banheiros} {imovel.banheiros === 1 ? 'Banheiro' : 'Banheiros'}</span>
              </div>
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                <Ruler size={18} className="mr-2 text-[var(--cor-primaria)]" />
                <span>{imovel.area} m²</span>
              </div>
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                <Car size={18} className="mr-2 text-[var(--cor-primaria)]" />
                <span>{imovel.vagas} {imovel.vagas === 1 ? 'Vaga' : 'Vagas'}</span>
              </div>
            </div>

            <h2 
              className="text-2xl font-[var(--fonte-titulos)] font-bold mb-4"
              style={{ color: 'var(--cor-texto)' }}
            >
              Sobre este imóvel
            </h2>
            <p className="text-gray-700 mb-8 whitespace-pre-line font-[var(--fonte-corpo)]">
              {imovel.descricao}
            </p>

            <h2 
              className="text-2xl font-[var(--fonte-titulos)] font-bold mb-4"
              style={{ color: 'var(--cor-texto)' }}
            >
              Características
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
              {imovel.caracteristicas.map((caracteristica, index) => (
                <div key={index} className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-[var(--cor-primaria)] mr-2"></div>
                  <span className="text-gray-700">{caracteristica}</span>
                </div>
              ))}
            </div>

            {/* Tabs para Informações Adicionais */}
            <Tabs defaultValue="avaliacoes" className="mb-10">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
                <TabsTrigger value="localizacao">Localização</TabsTrigger>
              </TabsList>
              <TabsContent value="avaliacoes" className="pt-6">
                <h3 
                  className="text-xl font-[var(--fonte-titulos)] font-bold mb-6"
                  style={{ color: 'var(--cor-texto)' }}
                >
                  O que as pessoas estão dizendo
                </h3>
                
                {imovel.avaliacoes.length > 0 ? (
                  <div className="space-y-6">
                    {imovel.avaliacoes.map((avaliacao) => (
                      <Card key={avaliacao.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold">{avaliacao.autor}</h4>
                              <div className="flex space-x-1 mt-1">
                                {renderEstrelas(avaliacao.nota)}
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(avaliacao.data).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700">{avaliacao.comentario}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Ainda não há avaliações para este imóvel.</p>
                )}

                {/* Formulário de Avaliação */}
                <div className="mt-8">
                  <h3 
                    className="text-xl font-[var(--fonte-titulos)] font-bold mb-4"
                    style={{ color: 'var(--cor-texto)' }}
                  >
                    Deixe sua avaliação
                  </h3>
                  <form 
                    className="space-y-4" 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const nome = formData.get('nome') as string;
                      const email = formData.get('email') as string;
                      const comentario = formData.get('comentario') as string;
                      const nota = parseInt(formData.get('nota') as string) || 5;
                      
                      if (!nome || !comentario) {
                        alert('Por favor, preencha todos os campos obrigatórios.');
                        return;
                      }
                      
                      try {
                        const response = await fetch('/api/avaliacoes', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            nome,
                            email,
                            comentario,
                            nota,
                            imovelId: imovel.id,
                            imobiliariaSlug
                          }),
                        });
                        
                        const data = await response.json();
                        
                        if (response.ok) {
                          alert(data.message || 'Avaliação enviada com sucesso!');
                          // Limpar o formulário
                          e.currentTarget.reset();
                        } else {
                          alert(data.error || 'Erro ao enviar avaliação. Tente novamente.');
                        }
                      } catch (error) {
                        console.error('Erro ao enviar avaliação:', error);
                        alert('Erro ao enviar avaliação. Tente novamente mais tarde.');
                      }
                    }}
                  >
                    <div>
                      <Label htmlFor="nome">Nome*</Label>
                      <Input id="nome" name="nome" placeholder="Seu nome" required />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" placeholder="seu@email.com" />
                    </div>
                    <div>
                      <Label htmlFor="comentario">Comentário*</Label>
                      <Textarea 
                        id="comentario" 
                        name="comentario" 
                        placeholder="Conte sua experiência com este imóvel ou com a imobiliária" 
                        rows={4} 
                        required 
                      />
                    </div>
                    <div>
                      <Label>Avaliação*</Label>
                      <div className="flex space-x-2 mt-1">
                        {[1, 2, 3, 4, 5].map((index) => {
                          const starId = `star-${index}`;
                          return (
                            <div key={index} className="flex items-center">
                              <input 
                                type="radio" 
                                id={starId} 
                                name="nota" 
                                value={index} 
                                className="sr-only" 
                                defaultChecked={index === 5}
                              />
                              <label htmlFor={starId} className="cursor-pointer">
                                <Star 
                                  size={24} 
                                  className="text-gray-300 hover:text-yellow-400 peer-checked:text-yellow-400 peer-checked:fill-yellow-400" 
                                />
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="bg-[var(--cor-primaria)] hover:bg-[var(--cor-primaria)]/90"
                    >
                      Enviar Avaliação
                    </Button>
                  </form>
                </div>
              </TabsContent>
              
              <TabsContent value="localizacao" className="pt-6">
                <h3 
                  className="text-xl font-[var(--fonte-titulos)] font-bold mb-6"
                  style={{ color: 'var(--cor-texto)' }}
                >
                  Localização
                </h3>
                <div className="rounded-lg overflow-hidden mb-4">
                  {/* Aqui seria integrado um mapa, por exemplo Google Maps */}
                  <div className="relative h-[400px] bg-gray-200 flex items-center justify-center">
                    <MapPin size={48} className="text-[var(--cor-primaria)]" />
                    <p className="absolute bottom-4 left-4 bg-white p-2 rounded shadow">
                      {imovel.endereco.rua}, {imovel.endereco.numero} - {imovel.endereco.bairro}, {imovel.endereco.cidade}/{imovel.endereco.estado}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold mb-2">Endereço completo</h4>
                    <p className="text-gray-700 mb-1">
                      {imovel.endereco.rua}, {imovel.endereco.numero}
                      {imovel.endereco.complemento && `, ${imovel.endereco.complemento}`}
                    </p>
                    <p className="text-gray-700 mb-1">
                      {imovel.endereco.bairro}, {imovel.endereco.cidade} - {imovel.endereco.estado}
                    </p>
                    <p className="text-gray-700">
                      CEP: {imovel.endereco.cep}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">Como chegar</h4>
                    <Button 
                      className="bg-[var(--cor-primaria)] hover:bg-[var(--cor-primaria)]/90 mb-2 w-full"
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${imovel.endereco.rua},${imovel.endereco.numero},${imovel.endereco.cidade}`, '_blank')}
                    >
                      Ver no Google Maps
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                    >
                      Copiar Endereço
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Coluna lateral com preço e contato */}
          <div className="w-full lg:w-[350px] space-y-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-2">
                <h2 
                  className="text-3xl font-[var(--fonte-titulos)] font-bold"
                  style={{ color: 'var(--cor-primaria)' }}
                >
                  {formatCurrency(imovel.preco)}
                </h2>
                {imovel.tipo === 'aluguel' && <p className="text-gray-500">por mês</p>}
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full bg-[var(--cor-primaria)] hover:bg-[var(--cor-primaria)]/90 flex items-center justify-center gap-2"
                >
                  <Phone size={18} />
                  {imobiliariaInfo.telefone}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-[var(--cor-primaria)] text-[var(--cor-primaria)] hover:bg-[var(--cor-primaria)]/10"
                >
                  Agendar Visita
                </Button>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <h3 className="text-lg font-[var(--fonte-titulos)] font-bold">
                  Envie uma mensagem
                </h3>
              </CardHeader>
              <CardContent>
                <form 
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const nome = formData.get('nome') as string;
                    const email = formData.get('email') as string;
                    const telefone = formData.get('telefone') as string;
                    const mensagem = formData.get('mensagem') as string;
                    
                    if (!nome || !email || !mensagem) {
                      alert('Por favor, preencha todos os campos obrigatórios.');
                      return;
                    }
                    
                    try {
                      const response = await fetch('/api/mensagens', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          nome,
                          email,
                          telefone,
                          mensagem,
                          imovelId: imovel.id,
                          assunto: `Interesse no imóvel: ${imovel.titulo}`,
                          imobiliariaSlug
                        }),
                      });
                      
                      const data = await response.json();
                      
                      if (response.ok) {
                        alert(data.message || 'Mensagem enviada com sucesso! Entraremos em contato em breve.');
                        // Limpar o formulário
                        e.currentTarget.reset();
                      } else {
                        alert(data.error || 'Erro ao enviar mensagem. Tente novamente.');
                      }
                    } catch (error) {
                      console.error('Erro ao enviar mensagem:', error);
                      alert('Erro ao enviar mensagem. Tente novamente mais tarde.');
                    }
                  }}
                >
                  <div>
                    <Label htmlFor="nome-contato">Nome*</Label>
                    <Input id="nome-contato" name="nome" placeholder="Seu nome" required />
                  </div>
                  <div>
                    <Label htmlFor="email-contato">Email*</Label>
                    <Input id="email-contato" name="email" type="email" placeholder="seu@email.com" required />
                  </div>
                  <div>
                    <Label htmlFor="telefone-contato">Telefone</Label>
                    <Input id="telefone-contato" name="telefone" placeholder="(99) 99999-9999" />
                  </div>
                  <div>
                    <Label htmlFor="mensagem-contato">Mensagem*</Label>
                    <Textarea 
                      id="mensagem-contato" 
                      name="mensagem"
                      placeholder="Olá, tenho interesse neste imóvel e gostaria de mais informações." 
                      rows={4} 
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-[var(--cor-primaria)] hover:bg-[var(--cor-primaria)]/90"
                  >
                    Enviar Mensagem
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Corretor/Imobiliária Card */}
            <Card className="border-gray-200 shadow-sm overflow-hidden">
              <div className="h-20 bg-[var(--cor-secundaria)]"></div>
              <CardContent className="-mt-10 relative space-y-4 text-center">
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto border-4 border-white bg-white">
                  <Image
                    src={logoUrl}
                    alt={nomeSite}
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-[var(--fonte-titulos)] font-bold">{nomeSite}</h3>
                  <p className="text-sm text-gray-500">{imobiliariaInfo.creci}</p>
                </div>
                <div className="space-y-1">
                  <p className="flex items-center justify-center text-sm">
                    <Phone size={14} className="mr-1" />
                    {imobiliariaInfo.telefone}
                  </p>
                  <p className="flex items-center justify-center text-sm">
                    <MapPin size={14} className="mr-1" />
                    {imobiliariaInfo.endereco}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full border-[var(--cor-primaria)] text-[var(--cor-primaria)] hover:bg-[var(--cor-primaria)]/10"
                  asChild
                >
                  <Link href={`/${imobiliariaSlug}/sobre`}>
                    Ver Imobiliária
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      {renderFooter()}
    </div>
  );
}
