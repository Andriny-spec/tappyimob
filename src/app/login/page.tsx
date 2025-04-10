import { LoginForm } from "@/components/auth/login-form";
import Image from "next/image";
import Link from "next/link";
import { Building2 } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Área visual (lado esquerdo) */}
      <div className="hidden md:flex md:w-1/2 relative bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900">
        {/* Elementos decorativos */}
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_80%)] bg-grid-white/[0.02] -z-10" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-emerald-500/5 to-transparent -z-10" />
        <div className="absolute top-40 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-40 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
        
        <div className="flex flex-col justify-center items-center w-full p-8 relative z-0">
          {/* Logo destacado */}
          <div className="text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <Building2 className="h-12 w-12 text-emerald-400" />
              <span className="text-4xl font-bold tracking-tight text-white">TappyImob</span>
            </Link>
            <p className="text-white/70 text-xl max-w-md mx-auto">
              A plataforma completa para o mercado imobiliário brasileiro
            </p>
          </div>
          
          {/* Imagem ilustrativa */}
          <div className="relative h-96 w-full max-w-lg">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/20 to-blue-500/20 backdrop-blur-sm border border-white/10 shadow-2xl" />
            <div className="absolute top-4 left-4 right-4 bottom-4 rounded-lg overflow-hidden flex items-center justify-center">
              <Image
                src="/login-illustration.svg"
                width={500}
                height={400}
                alt="Ilustração de dashboard imobiliário"
                className="w-full h-full object-contain"
                priority
              />
            </div>
          </div>
          
          {/* Depoimento */}
          <div className="mt-12 max-w-lg">
            <blockquote className="p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm border border-white/10 relative">
              <div className="absolute -top-4 -left-2 text-emerald-500/20 text-7xl font-serif">"</div>
              <p className="text-white/80 italic relative z-10">
                O Tappy Imob revolucionou nossa forma de trabalhar. Em apenas 3 meses, aumentamos nossas vendas em 42% e reduzimos o tempo gasto em tarefas administrativas.
              </p>
              <footer className="mt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-emerald-400 font-bold">M</span>
                </div>
                <div>
                  <p className="text-white font-medium">Marcela Santos</p>
                  <p className="text-white/60 text-sm">Diretora Comercial, MS Imóveis</p>
                </div>
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
      
      {/* Área de login (lado direito) */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="md:hidden flex items-center gap-2 mb-8 justify-center">
            <Building2 className="h-8 w-8 text-emerald-400" />
            <span className="text-2xl font-bold tracking-tight">TappyImob</span>
          </Link>
          
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
