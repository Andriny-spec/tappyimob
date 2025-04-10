'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  Building2, Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter, Youtube,
  ArrowRight, CheckCircle2, Home, Search, Users, Building, Briefcase, FileText, HelpCircle,
  BookOpen, HeartHandshake, BadgeCheck, Shield, MessageSquare, Settings, Newspaper
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative">
      {/* Seção de Newsletter */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 py-20">
        {/* Efeito de blur para glassmorphism */}
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_80%)] bg-grid-white/[0.02] -z-10"></div>
        <div className="absolute h-40 w-40 bg-emerald-500/30 rounded-full blur-3xl -top-20 -left-20"></div>
        <div className="absolute h-40 w-40 bg-blue-500/20 rounded-full blur-3xl top-20 right-20"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Receba as melhores ofertas imobiliárias</h2>
            <p className="text-lg text-white/80 mb-8">Assine nossa newsletter para receber novidades, dicas e oportunidades exclusivas no mercado imobiliário</p>
            
            <div className="relative max-w-xl mx-auto group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-lg blur-lg group-hover:blur-xl transition-all duration-300"></div>
              <div className="relative flex w-full max-w-xl">
                <Input 
                  type="email" 
                  placeholder="Seu melhor e-mail" 
                  className="flex-1 bg-white/10 backdrop-blur-md border-0 text-white placeholder:text-white/60 focus-visible:ring-emerald-500 rounded-l-lg rounded-r-none h-14" 
                />
                <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white h-14 rounded-l-none px-6 text-base">
                  Assinar <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4 flex items-center justify-center gap-4 text-white/80 text-sm">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Conteúdo gratuito</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Cancele quando quiser</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer principal */}
      <div className="bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 backdrop-blur-sm pt-16 pb-8 border-t border-emerald-500/20">
        <div className="container mx-auto px-4">
          {/* Seção principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Coluna da marca */}
            <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Building2 className="h-8 w-8 text-emerald-400" />
              <span className="text-2xl font-bold tracking-tight text-white">TappyImob</span>
            </Link>
            <p className="text-white/70 mb-6 max-w-md">
              A plataforma completa para o mercado imobiliário brasileiro. Conectando imobiliárias, corretores e clientes em um só lugar, com tecnologia e inovação.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="icon" className="rounded-full border-blue-400/30 bg-blue-900/20 text-white hover:bg-blue-800/40 hover:text-emerald-400">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full border-blue-400/30 bg-blue-900/20 text-white hover:bg-blue-800/40 hover:text-emerald-400">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full border-blue-400/30 bg-blue-900/20 text-white hover:bg-blue-800/40 hover:text-emerald-400">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full border-blue-400/30 bg-blue-900/20 text-white hover:bg-blue-800/40 hover:text-emerald-400">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full border-blue-400/30 bg-blue-900/20 text-white hover:bg-blue-800/40 hover:text-emerald-400">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Links de Navegação */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-emerald-400 border-b border-blue-500/30 pb-2">Navegação</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-white/80 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <Home className="h-4 w-4 text-emerald-400" />
                  Início
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="text-white/80 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <Building className="h-4 w-4 text-emerald-400" />
                  Sobre nós
                </Link>
              </li>
              <li>
                <Link href="/buscar/em-destaque" className="text-white/80 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <Search className="h-4 w-4 text-emerald-400" />
                  Imóveis em destaque
                </Link>
              </li>
              <li>
                <Link href="/imobiliarias" className="text-white/80 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-emerald-400" />
                  Imobiliárias
                </Link>
              </li>
              <li>
                <Link href="/corretores" className="text-white/80 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-400" />
                  Corretores
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-white/80 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-emerald-400" />
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-white/80 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-emerald-400" />
                  Contato
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Tipos de imóveis */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-emerald-400 border-b border-blue-500/30 pb-2">Imóveis</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/buscar/apartamentos" className="text-white/80 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <Home className="h-4 w-4 text-emerald-400" />
                  Apartamentos
                </Link>
              </li>
              <li>
                <Link href="/buscar/casas" className="text-white/80 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <Home className="h-4 w-4 text-emerald-400" />
                  Casas
                </Link>
              </li>
              <li>
                <Link href="/buscar/comerciais" className="text-white/80 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-emerald-400" />
                  Comerciais
                </Link>
              </li>
              <li>
                <Link href="/buscar/terrenos" className="text-white/80 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  Terrenos
                </Link>
              </li>
              <li>
                <Link href="/buscar/rurais" className="text-white/80 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  Rurais
                </Link>
              </li>
              <li>
                <Link href="/buscar/lancamentos" className="text-white/80 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <Building className="h-4 w-4 text-emerald-400" />
                  Lançamentos
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Soluções */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-emerald-400 border-b border-blue-500/30 pb-2">Soluções</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/solucoes/imobiliarias" className="text-white/80 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-emerald-400" />
                  Para Imobiliárias
                </Link>
              </li>
              <li>
                <Link href="/solucoes/corretores" className="text-white/80 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-400" />
                  Para Corretores
                </Link>
              </li>
              <li>
                <Link href="/solucoes/incorporadoras" className="text-white/80 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <Building className="h-4 w-4 text-emerald-400" />
                  Para Incorporadoras
                </Link>
              </li>
              <li>
                <Link href="/integracao/whatsapp" className="text-white/80 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-emerald-400" />
                  Integração WhatsApp
                </Link>
              </li>
              <li>
                <Link href="/recursos/automacao" className="text-white/80 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <Settings className="h-4 w-4 text-emerald-400" />
                  Automação
                </Link>
              </li>
              <li>
                <Link href="/recursos/marketing" className="text-white/80 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <Newspaper className="h-4 w-4 text-emerald-400" />
                  Marketing Digital
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Coluna de contato */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-emerald-400 border-b border-blue-500/30 pb-2">Contato</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-900/40 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <span className="text-white/90 block">Endereço</span>
                  <span className="text-white/60 text-sm">
                    Av. Paulista, 1000, São Paulo - SP, 01310-100
                  </span>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-900/40 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <span className="text-white/90 block">Telefone</span>
                  <span className="text-white/60 text-sm">
                    (11) 4002-8922
                  </span>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-900/40 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <span className="text-white/90 block">E-mail</span>
                  <span className="text-white/60 text-sm">
                    contato@tappyimob.com.br
                  </span>
                </div>
              </li>
            </ul>
            
            <div className="mt-8 bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm p-4 rounded-lg border border-emerald-500/20">
              <h4 className="font-medium text-emerald-400 mb-3 flex items-center gap-2">
                <BadgeCheck className="h-4 w-4" />
                Atendimento
              </h4>
              <p className="text-white/70 text-sm mb-2">Segunda a Sexta, 9h às 18h</p>
              <Button 
                className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                size="sm"
              >
                <Phone className="h-4 w-4" /> Agendar uma ligação
              </Button>
            </div>
          </div>
        </div>
        
        {/* Selo de segurança */}
        <div className="mt-16 border-t border-emerald-500/20 pt-8 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="flex items-center justify-center md:justify-start gap-4 text-white/80">
              <Shield className="h-10 w-10 text-emerald-400" />
              <div>
                <h4 className="font-medium">Dados protegidos</h4>
                <p className="text-sm text-white/60">SSL 256-bits e conformidade com LGPD</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 text-white/80">
              <HeartHandshake className="h-10 w-10 text-emerald-400" />
              <div>
                <h4 className="font-medium">Suporte dedicado</h4>
                <p className="text-sm text-white/60">Equipe pronta para te ajudar</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-end gap-4 text-white/80">
              <Building2 className="h-10 w-10 text-emerald-400" />
              <div>
                <h4 className="font-medium">Parceiro Imobiliário</h4>
                <p className="text-sm text-white/60">Líder em tecnologia para o setor</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Separador */}
        <Separator className="my-8 bg-emerald-500/20" />
        
        {/* Rodapé inferior */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/60">
            © {currentYear} TappyImob. Todos os direitos reservados.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/termos" className="text-sm text-white/60 hover:text-emerald-400 transition-colors">
              Termos de Uso
            </Link>
            <Link href="/privacidade" className="text-sm text-white/60 hover:text-emerald-400 transition-colors">
              Política de Privacidade
            </Link>
            <Link href="/cookies" className="text-sm text-white/60 hover:text-emerald-400 transition-colors">
              Política de Cookies
            </Link>
            <Link href="/acessibilidade" className="text-sm text-white/60 hover:text-emerald-400 transition-colors">
              Acessibilidade
            </Link>
            <Link href="/sitemap" className="text-sm text-white/60 hover:text-emerald-400 transition-colors">
              Mapa do Site
            </Link>
          </div>
        </div>
      </div>
      </div>
      
      {/* Linha decorativa inferior */}
      <div className="h-1 bg-gradient-to-r from-emerald-500 via-blue-700 to-emerald-500"></div>
    </footer>
  );
}
