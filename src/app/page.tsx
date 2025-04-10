import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { Hero } from "@/components/home/hero";
import { Recursos } from "@/components/home/recursos";
import { Planos } from "@/components/home/planos";
import { Integracoes } from "@/components/home/integracoes";
import { Diferencial } from "@/components/home/diferencial";
import { ChatWidget } from "@/components/chat/chat-widget";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <Hero />
        <Recursos />
        <Planos />
        <Integracoes />
        <Diferencial />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}