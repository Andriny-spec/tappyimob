import dynamic from "next/dynamic";
import { DeferredMount } from "@/components/sections/DeferredMount";
import type { TipoCard } from "@/components/sections/TiposCarrossel";
import type { ImovelAPI as ImovelDestaqueEspecialAPI } from "@/components/sections/ImoveisDestaqueEspecial";
import type { ImovelAPI as ImovelDestaqueAPI } from "@/components/sections/ImoveisDestaque";
import type { InstagramPost } from "@/components/sections/GaleriaInsta";
import type { BlogPost } from "@/components/sections/NoticiasCarrossel";

// dynamic() sem ssr:false: mantém o code-splitting (chunk carregado à parte)
// mas permite que o HTML já saia do servidor com os dados reais (sem CLS, sem
// esperar hydration pra mostrar conteúdo, e indexável por crawlers).
const TiposCarrossel = dynamic(() =>
  import("@/components/sections/TiposCarrossel").then((m) => m.TiposCarrossel)
);
const ImoveisDestaqueEspecial = dynamic(() =>
  import("@/components/sections/ImoveisDestaqueEspecial").then((m) => m.ImoveisDestaqueEspecial)
);
const ImoveisDestaque = dynamic(() =>
  import("@/components/sections/ImoveisDestaque").then((m) => m.ImoveisDestaque)
);
const GaleriaInsta = dynamic(() =>
  import("@/components/sections/GaleriaInsta").then((m) => m.GaleriaInsta)
);
const NoticiasCarrossel = dynamic(() =>
  import("@/components/sections/NoticiasCarrossel").then((m) => m.NoticiasCarrossel)
);

interface HomeBelowFoldProps {
  initialTipos?: TipoCard[];
  initialImoveisEspecial?: ImovelDestaqueEspecialAPI[];
  initialImoveisDestaques?: ImovelDestaqueAPI[];
  initialInstagramPosts?: InstagramPost[];
  initialBlogPosts?: BlogPost[];
}

export function HomeBelowFold({
  initialTipos,
  initialImoveisEspecial,
  initialImoveisDestaques,
  initialInstagramPosts,
  initialBlogPosts,
}: HomeBelowFoldProps) {
  return (
    <>
      <TiposCarrossel initialTipos={initialTipos} />
      <ImoveisDestaqueEspecial initialImoveis={initialImoveisEspecial} />
      <ImoveisDestaque initialDestaques={initialImoveisDestaques} />
      {/* Instagram tem valor de SEO/LCP baixo — adia o mount (e o fetch de imagens)
          até chegar perto da viewport, em vez de competir por banda no load inicial. */}
      <DeferredMount minHeight={360}>
        <GaleriaInsta initialPosts={initialInstagramPosts} />
      </DeferredMount>
      <NoticiasCarrossel initialPosts={initialBlogPosts} />
    </>
  );
}
