"use client";

import { MotionConfig } from "framer-motion";
import { Navigation } from "./navigation";
import { Hero } from "./hero";
import { Features, Automation, WebsiteSection, Management } from "./features";
import { Process } from "./process";
import { Pricing } from "./pricing";
import { FAQ, FinalCTA, Footer } from "./closing";
import { TappyLoader } from "./loader";
import { SaasFloating } from "./floating";
import "./saas.css";

export function SaasHome() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="saas">
        <a className="saas-skip-link" href="#saas-main">
          Ir para o conteúdo
        </a>
        <Navigation />
        <main id="saas-main">
          <Hero />
          <Features />
          <Automation />
          <Process />
          <WebsiteSection />
          <Management />
          <Pricing />
          <FAQ />
          <FinalCTA />
        </main>
        <Footer />
        <SaasFloating />
        <TappyLoader />
      </div>
    </MotionConfig>
  );
}
