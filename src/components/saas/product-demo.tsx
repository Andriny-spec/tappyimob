"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  Building2,
  CalendarDays,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  CircleHelp,
  LayoutDashboard,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";

const views = [
  { name: "Visão geral", icon: LayoutDashboard },
  { name: "CRM & leads", icon: Users },
  { name: "Imóveis", icon: Building2 },
  { name: "Financeiro", icon: Wallet },
];
const leads = [
  {
    name: "Marina Costa",
    initials: "MC",
    home: "Apartamento · Jardins",
    status: "Visita agendada",
    color: "green",
  },
  {
    name: "Pedro Almeida",
    initials: "PA",
    home: "Casa · Alphaville",
    status: "Em atendimento",
    color: "blue",
  },
  {
    name: "Juliana Santos",
    initials: "JS",
    home: "Cobertura · Pinheiros",
    status: "Proposta enviada",
    color: "purple",
  },
];

export function ProductDemo({ compact = false }: { compact?: boolean }) {
  const [view, setView] = useState(0);
  return (
    <div className={`saas-product ${compact ? "saas-product-compact" : ""}`}>
      <div className="saas-product-chrome">
        <div className="saas-window-dots">
          <i />
          <i />
          <i />
        </div>
        <span>
          <span className="saas-live-dot" /> Seu próximo nível começa aqui
        </span>
        <span className="saas-demo-label">DEMONSTRAÇÃO</span>
      </div>
      <div className="saas-product-body">
        <aside className="saas-product-sidebar">
          <div className="saas-product-logo">
            <Building2 size={22} />
            <strong>
              tappy<span>imob</span>
              <sup>®</sup>
            </strong>
          </div>
          <span className="saas-sidebar-label">WORKSPACE</span>
          <div role="tablist" aria-label="Demonstração da plataforma">
            {views.map(({ name, icon: Icon }, index) => (
              <button
                key={name}
                id={`demo-tab-${compact ? "mini" : "full"}-${index}`}
                role="tab"
                aria-selected={view === index}
                aria-controls={`demo-panel-${compact ? "mini" : "full"}`}
                tabIndex={view === index ? 0 : -1}
                className={view === index ? "active" : ""}
                onClick={() => setView(index)}
                onKeyDown={(event) => {
                  const next =
                    event.key === "ArrowDown" || event.key === "ArrowRight"
                      ? (index + 1) % views.length
                      : event.key === "ArrowUp" || event.key === "ArrowLeft"
                        ? (index + views.length - 1) % views.length
                        : event.key === "Home"
                          ? 0
                          : event.key === "End"
                            ? views.length - 1
                            : null;
                  if (next !== null) {
                    event.preventDefault();
                    setView(next);
                    document
                      .getElementById(
                        `demo-tab-${compact ? "mini" : "full"}-${next}`,
                      )
                      ?.focus();
                  }
                }}
              >
                <Icon size={15} />
                {name}
                {index === 1 && <small>12</small>}
              </button>
            ))}
          </div>
          <div className="saas-sidebar-muted">
            <span>
              <MessageCircle size={15} /> WhatsApp
            </span>
            <span>
              <CalendarDays size={15} /> Agenda
            </span>
            <span>
              <Sparkles size={15} /> Tappy IA <small>AI</small>
            </span>
          </div>
          <div className="saas-sidebar-bottom">
            <CircleHelp size={15} /> Central de ajuda <Settings2 size={15} />
          </div>
        </aside>
        <div className="saas-product-main">
          <div className="saas-product-topbar">
            <span>
              Sua imobiliária <ChevronDown size={12} />
            </span>
            <div>
              <Search size={15} />
              <Bell size={15} />
              <span className="saas-avatar">AC</span>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              id={`demo-panel-${compact ? "mini" : "full"}`}
              role="tabpanel"
              aria-labelledby={`demo-tab-${compact ? "mini" : "full"}-${view}`}
              className="saas-dashboard"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
            >
              <div className="saas-dashboard-heading">
                <div>
                  <span>SEU NEGÓCIO, EM MOVIMENTO</span>
                  <h3>
                    {
                      [
                        "Tudo pronto para um ótimo dia.",
                        "Boas conversas. Novos negócios.",
                        "Seu portfólio, em um só lugar.",
                        "Clareza para o próximo passo.",
                      ][view]
                    }
                  </h3>
                </div>
                <span className="saas-mock-button">
                  <Plus size={12} />{" "}
                  {view === 2 ? "Novo imóvel" : "Novo negócio"}
                </span>
              </div>
              <div className="saas-metrics">
                {(view === 3
                  ? [
                      ["Comissões previstas", "R$ 48.500", "+12,8%"],
                      ["Recebido no mês", "R$ 32.000", "+8,4%"],
                      ["Negócios concluídos", "18", "+4 este mês"],
                    ]
                  : [
                      ["Imóveis ativos", "248", "+16 este mês"],
                      ["Novos leads", "86", "+24,6%"],
                      ["Negócios em andamento", "32", "+8 este mês"],
                    ]
                ).map(([title, value, change], i) => (
                  <div key={title}>
                    <span>
                      {title}
                      {i === 0 ? (
                        <Building2 size={13} />
                      ) : i === 1 ? (
                        <Users size={13} />
                      ) : (
                        <ChartNoAxesCombined size={13} />
                      )}
                    </span>
                    <strong>{value}</strong>
                    <small>
                      <ArrowUpRight size={11} />
                      {change}
                    </small>
                    <div className="saas-spark-bars">
                      {[20, 32, 24, 38, 32, 46, 40, 56, 49, 64, 57, 78].map(
                        (h, j) => (
                          <i
                            key={j}
                            style={{ height: `${h}%`, opacity: 0.22 + j / 18 }}
                          />
                        ),
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {view === 1 ? (
                <div className="saas-kanban">
                  {["Novos leads", "Em atendimento", "Visita agendada"].map(
                    (title, i) => (
                      <div key={title}>
                        <h4>
                          <i />
                          {title}
                          <span>{i + 2}</span>
                        </h4>
                        {[leads[i], leads[(i + 1) % 3]].map((lead, j) => (
                          <article key={lead.name}>
                            <div>
                              <span className={`saas-avatar ${lead.color}`}>
                                {lead.initials}
                              </span>
                              <MoreHorizontal size={14} />
                            </div>
                            <strong>{lead.name}</strong>
                            <p>{lead.home}</p>
                            <small>
                              <MessageCircle size={11} />{" "}
                              {j === 0 ? "WhatsApp" : "Site imobiliário"}
                            </small>
                          </article>
                        ))}
                      </div>
                    ),
                  )}
                </div>
              ) : view === 2 ? (
                <div className="saas-demo-properties">
                  {[
                    "Casa contemporânea",
                    "Apartamento com varanda",
                    "Cobertura com vista",
                  ].map((name, i) => (
                    <article key={name}>
                      <div className={`saas-property-illustration house-${i}`}>
                        <Building2 size={55} strokeWidth={0.7} />
                        <span>DISPONÍVEL</span>
                      </div>
                      <strong>{name}</strong>
                      <small>
                        {
                          [
                            "Alphaville · 280 m²",
                            "Jardins · 120 m²",
                            "Pinheiros · 190 m²",
                          ][i]
                        }
                      </small>
                      <b>{["R$ 1.850.000", "R$ 980.000", "R$ 2.100.000"][i]}</b>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="saas-dashboard-bottom">
                  <div className="saas-chart">
                    <div>
                      <h4>
                        {view === 3
                          ? "Evolução das comissões"
                          : "Oportunidades que crescem"}
                      </h4>
                      <span>
                        Este mês <ChevronDown size={11} />
                      </span>
                    </div>
                    <div className="saas-chart-plot">
                      <div className="saas-chart-axis">
                        <span>90</span>
                        <span>60</span>
                        <span>30</span>
                        <span>0</span>
                      </div>
                      <svg
                        viewBox="0 0 500 125"
                        preserveAspectRatio="none"
                        role="img"
                        aria-label="Gráfico ilustrativo de crescimento de oportunidades"
                      >
                        <defs>
                          <linearGradient
                            id={`chart-fill-${compact ? "mini" : "full"}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#25d366"
                              stopOpacity=".22"
                            />
                            <stop
                              offset="100%"
                              stopColor="#25d366"
                              stopOpacity="0"
                            />
                          </linearGradient>
                        </defs>
                        {[15, 48, 82, 116].map((y) => (
                          <line
                            key={y}
                            x1="0"
                            y1={y}
                            x2="500"
                            y2={y}
                            stroke="#e9eef1"
                            strokeDasharray="4 5"
                          />
                        ))}
                        <path
                          d="M0 110 C30 110 30 95 60 98 S100 60 135 75 S180 75 215 58 S250 75 280 50 S325 45 350 35 S400 50 430 22 S465 32 500 8 L500 125 L0 125Z"
                          fill={`url(#chart-fill-${compact ? "mini" : "full"})`}
                        />
                        <path
                          d="M0 110 C30 110 30 95 60 98 S100 60 135 75 S180 75 215 58 S250 75 280 50 S325 45 350 35 S400 50 430 22 S465 32 500 8"
                          fill="none"
                          stroke="#20b665"
                          strokeWidth="2.5"
                        />
                        <circle
                          cx="430"
                          cy="22"
                          r="5"
                          fill="#20b665"
                          stroke="white"
                          strokeWidth="3"
                        />
                      </svg>
                    </div>
                    <div className="saas-chart-days">
                      <span>01 out</span>
                      <span>07 out</span>
                      <span>14 out</span>
                      <span>21 out</span>
                      <span>28 out</span>
                    </div>
                  </div>
                  <div className="saas-activity">
                    <h4>
                      {view === 3
                        ? "Últimos recebimentos"
                        : "Acontecendo agora"}
                    </h4>
                    {leads.map((lead, i) => (
                      <div key={lead.name}>
                        <span className={`saas-avatar ${lead.color}`}>
                          {view === 3 ? (
                            <ArrowDownLeft size={15} />
                          ) : (
                            lead.initials
                          )}
                        </span>
                        <p>
                          <strong>
                            {view === 3
                              ? [
                                  "Comissão recebida",
                                  "Repasse confirmado",
                                  "Proposta aprovada",
                                ][i]
                              : lead.name}
                          </strong>
                          <small>
                            {view === 3
                              ? ["R$ 8.500,00", "R$ 4.200,00", "R$ 6.800,00"][i]
                              : lead.status}
                          </small>
                        </p>
                        <span>{i + 2}m</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="saas-ai-note">
                <Sparkles size={15} />
                <span>
                  <strong>Tappy IA</strong>{" "}
                  {view === 3
                    ? "Visão clara das suas comissões, metas e próximos recebimentos."
                    : "Seu próximo negócio pode estar em um follow-up. Vamos conversar?"}
                </span>
                <ArrowRightMini />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="saas-product-bottom">
        <span>
          <Check size={11} /> Todos os módulos conectados
        </span>
        <span>Dados ilustrativos · explore o menu lateral</span>
      </div>
    </div>
  );
}
function ArrowRightMini() {
  return <ArrowUpRight size={15} />;
}
