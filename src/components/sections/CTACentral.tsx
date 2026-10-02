"use client";

import { motion } from "framer-motion";
import {
  RiArrowRightLine,
  RiCheckLine,
  RiHome4Line,
  RiUserLine,
  RiFileList3Line,
  RiPieChartLine,
  RiMessage3Line,
  RiCalendarCheckLine,
  RiNotification3Line,
  RiSearchLine,
} from "react-icons/ri";
import { Button } from "@/components/ui/button";

const platformFeatures = [
  "Dashboard intuitivo",
  "Gestão de leads automática",
  "Relatórios em tempo real",
  "Integração WhatsApp",
  "App mobile completo",
  "Suporte 24/7",
];

// Simulated platform UI elements
const dashboardCards = [
  { icon: RiHome4Line, label: "Imóveis", value: "234", change: "+12%", color: "orange" },
  { icon: RiUserLine, label: "Leads", value: "89", change: "+28%", color: "blue" },
  { icon: RiFileList3Line, label: "Contratos", value: "15", change: "+5%", color: "green" },
  { icon: RiPieChartLine, label: "Vendas", value: "R$ 2.4M", change: "+18%", color: "purple" },
];

const notifications = [
  { text: "Novo lead: João Silva interessado em apt. Jardins", time: "Agora", type: "lead" },
  { text: "Visita confirmada para amanhã às 14h", time: "5 min", type: "calendar" },
  { text: "Proposta aceita! Contrato gerado automaticamente", time: "1h", type: "success" },
];

export function CTACentral() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-3 py-1 text-xs font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-full mb-6">
              PLATAFORMA COMPLETA
            </span>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Experimente o poder do
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                CRM mais completo
              </span>
            </h2>

            <p className="text-lg text-neutral-400 mb-8 max-w-lg">
              Uma plataforma pensada por corretores, para corretores. 
              Cada funcionalidade foi desenvolvida para simplificar seu dia a dia 
              e multiplicar seus resultados.
            </p>

            {/* Feature list */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              {platformFeatures.map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <RiCheckLine className="w-3 h-3 text-orange-500" />
                  </div>
                  <span className="text-sm text-neutral-300">{feature}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="glow" size="xl" className="group">
                Começar teste grátis
                <RiArrowRightLine className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="xl" className="border-neutral-700 text-white hover:bg-neutral-800">
                Agendar demonstração
              </Button>
            </div>

            {/* Trust text */}
            <p className="text-sm text-neutral-500 mt-6">
              ✓ 14 dias grátis • ✓ Sem cartão de crédito • ✓ Cancele quando quiser
            </p>
          </motion.div>

          {/* Right - Platform Animation */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Main Dashboard Frame */}
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-purple-500/20 blur-3xl" />
              
              {/* Browser frame */}
              <div className="relative bg-neutral-800 rounded-2xl border border-neutral-700 overflow-hidden shadow-2xl">
                {/* Browser header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-neutral-900 border-b border-neutral-700">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-neutral-800 rounded-full">
                      <RiSearchLine className="w-3.5 h-3.5 text-neutral-500" />
                      <span className="text-xs text-neutral-400">app.tappyimob.com.br/dashboard</span>
                    </div>
                  </div>
                </div>

                {/* Dashboard content */}
                <div className="p-4">
                  {/* Top bar */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                        <RiHome4Line className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-semibold text-white text-sm">Tappy Imob CRM</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="relative"
                      >
                        <RiNotification3Line className="w-5 h-5 text-neutral-400" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                      </motion.div>
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
                    </div>
                  </div>

                  {/* Stats cards */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {dashboardCards.map((card, i) => (
                      <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="bg-neutral-700/50 rounded-xl p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <card.icon className={`w-4 h-4 ${
                            card.color === "orange" ? "text-orange-500" :
                            card.color === "blue" ? "text-blue-500" :
                            card.color === "green" ? "text-green-500" :
                            "text-purple-500"
                          }`} />
                          <span className="text-[10px] text-green-400">{card.change}</span>
                        </div>
                        <div className="text-lg font-bold text-white">{card.value}</div>
                        <div className="text-[10px] text-neutral-400">{card.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Chart placeholder */}
                  <div className="bg-neutral-700/50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-white">Vendas Mensais</span>
                      <span className="text-[10px] text-neutral-400">Últimos 6 meses</span>
                    </div>
                    <div className="flex items-end gap-2 h-16">
                      {[40, 65, 45, 80, 60, 95].map((height, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${height}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                          className={`flex-1 rounded-t ${i === 5 ? "bg-orange-500" : "bg-neutral-600"}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Recent activity */}
                  <div className="space-y-2">
                    {notifications.map((notification, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1.2 + i * 0.15 }}
                        className="flex items-center gap-3 p-2 bg-neutral-700/30 rounded-lg"
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          notification.type === "lead" ? "bg-blue-500/20" :
                          notification.type === "calendar" ? "bg-purple-500/20" :
                          "bg-green-500/20"
                        }`}>
                          {notification.type === "lead" ? (
                            <RiUserLine className="w-3 h-3 text-blue-400" />
                          ) : notification.type === "calendar" ? (
                            <RiCalendarCheckLine className="w-3 h-3 text-purple-400" />
                          ) : (
                            <RiCheckLine className="w-3 h-3 text-green-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-neutral-300 truncate">{notification.text}</p>
                        </div>
                        <span className="text-[9px] text-neutral-500">{notification.time}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1.5 }}
                animate={{ y: [0, -10, 0] }}
                className="absolute -right-4 top-20 bg-white dark:bg-neutral-800 rounded-xl p-3 shadow-xl border border-neutral-200 dark:border-neutral-700"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                    <RiMessage3Line className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-900 dark:text-white">Nova mensagem!</p>
                    <p className="text-[10px] text-neutral-500">Cliente interessado...</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1.7 }}
                animate={{ y: [0, 10, 0] }}
                className="absolute -left-4 bottom-20 bg-white dark:bg-neutral-800 rounded-xl p-3 shadow-xl border border-neutral-200 dark:border-neutral-700"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                    <RiHome4Line className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-900 dark:text-white">Imóvel visitado!</p>
                    <p className="text-[10px] text-neutral-500">Apt. Jardins • 5 min</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
