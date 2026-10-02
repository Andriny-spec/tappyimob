"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiChat3Line,
  RiCloseLine,
  RiSendPlaneFill,
  RiRobot2Line,
  RiUser3Line,
  RiSparklingLine,
  RiAttachment2,
  RiEmotionHappyLine,
  RiMore2Fill,
  RiWhatsappLine,
  RiMessage3Line,
} from "react-icons/ri";
import { Button } from "@/components/ui/button";

interface Message {
  id: number;
  type: "bot" | "user";
  content: string;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: 1,
    type: "bot",
    content: "Olá! 👋 Eu sou a Bia, assistente virtual da Tappy Imob. Como posso ajudar você hoje?",
    timestamp: new Date(),
  },
];

const quickReplies = [
  "Quero conhecer os planos",
  "Preciso de suporte",
  "Agendar uma demo",
  "Falar com atendente",
];

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleWhatsApp = () => {
    window.open("https://wa.me/5511999999999?text=Olá! Vim pelo site e gostaria de mais informações.", "_blank");
    setShowOptions(false);
  };

  const handleChat = () => {
    setShowOptions(false);
    setIsOpen(true);
  };

  const handleButtonClick = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      setShowOptions(!showOptions);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSendMessage = (content?: string) => {
    const messageContent = content || inputValue.trim();
    if (!messageContent) return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      type: "user",
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponses: { [key: string]: string } = {
        "Quero conhecer os planos":
          "Temos planos incríveis para todos os tamanhos de imobiliárias! 🏠 O plano Starter começa em R$97/mês, o Professional em R$197/mês e o Enterprise é personalizado. Quer que eu detalhe algum?",
        "Preciso de suporte":
          "Claro! Nossa equipe de suporte está disponível 24/7. Você pode descrever seu problema aqui ou acessar nossa central de ajuda em help.tappyimob.com.br 💪",
        "Agendar uma demo":
          "Excelente escolha! 🎯 Posso agendar uma demonstração personalizada para você. Qual horário funciona melhor: manhã ou tarde?",
        "Falar com atendente":
          "Vou transferir você para um de nossos especialistas humanos. Aguarde um momento enquanto verifico a disponibilidade... 🔄",
      };

      const botMessage: Message = {
        id: messages.length + 2,
        type: "bot",
        content:
          botResponses[messageContent] ||
          "Entendi! Vou analisar sua solicitação. Enquanto isso, posso ajudar com algo mais específico? 🤔",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Options popup */}
      <AnimatePresence>
        {showOptions && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-32 right-4 sm:bottom-28 sm:right-6 md:right-8 z-50"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-4 w-64">
              <p className="text-sm font-medium text-neutral-900 dark:text-white mb-3">
                Como deseja ser atendido?
              </p>
              <div className="space-y-2">
                <button
                  onClick={handleWhatsApp}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-green-500 hover:bg-green-600 text-white transition-colors"
                >
                  <RiWhatsappLine className="w-5 h-5" />
                  <span className="font-medium">WhatsApp</span>
                </button>
                <button
                  onClick={handleChat}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#0B2545] hover:bg-[#081733] text-white transition-colors"
                >
                  <RiMessage3Line className="w-5 h-5" />
                  <span className="font-medium">Chat Online</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat button - Verde WhatsApp */}
      <motion.button
        onClick={handleButtonClick}
        className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30">
            <AnimatePresence mode="wait">
              {isOpen || showOptions ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                >
                  <RiCloseLine className="w-6 h-6 md:w-7 md:h-7" />
                </motion.div>
              ) : (
                <motion.div
                  key="whatsapp"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                >
                  <RiWhatsappLine className="w-6 h-6 md:w-7 md:h-7" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pulse effect */}
          {!isOpen && !showOptions && (
            <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30" />
          )}
        </div>
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-2 bottom-20 sm:inset-x-auto sm:bottom-24 sm:right-6 md:right-8 w-auto sm:w-[380px] md:w-[420px] max-w-[calc(100vw-1rem)] z-50"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col h-[calc(100vh-120px)] sm:h-[480px] md:h-[550px] max-h-[600px]">
              {/* Header */}
              <div className="relative bg-[#0B2545] p-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <RiRobot2Line className="w-6 h-6 text-white" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#0B2545] rounded-full" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">Assistente</h3>
                      <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-white/20 rounded-full text-white">
                        <RiSparklingLine className="w-3 h-3" />
                        IA
                      </span>
                    </div>
                    <p className="text-sm text-white/70">
                      Tappy Imob • Online
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <RiMore2Fill className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Wave decoration */}
                <svg
                  className="absolute bottom-0 left-0 right-0 translate-y-[calc(100%-1px)]"
                  viewBox="0 0 400 20"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,20 Q100,0 200,10 T400,20 L400,20 L0,20 Z"
                    className="fill-white dark:fill-neutral-900"
                  />
                </svg>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-end gap-2 ${
                      message.type === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === "bot"
                          ? "bg-[#0B2545]/10 dark:bg-[#0B2545]/30"
                          : "bg-neutral-100 dark:bg-neutral-800"
                      }`}
                    >
                      {message.type === "bot" ? (
                        <RiRobot2Line className="w-4 h-4 text-[#0B2545] dark:text-sky-400" />
                      ) : (
                        <RiUser3Line className="w-4 h-4 text-neutral-500" />
                      )}
                    </div>
                    <div
                      className={`max-w-[75%] p-3 rounded-2xl ${
                        message.type === "bot"
                          ? "bg-neutral-100 dark:bg-neutral-800 rounded-bl-md"
                          : "bg-[#0B2545] text-white rounded-br-md"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <span
                        className={`text-[10px] mt-1 block ${
                          message.type === "bot"
                            ? "text-neutral-400"
                            : "text-white/60"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="flex items-end gap-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#0B2545]/10 dark:bg-[#0B2545]/30 flex items-center justify-center">
                        <RiRobot2Line className="w-4 h-4 text-[#0B2545] dark:text-sky-400" />
                      </div>
                      <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-2xl rounded-bl-md">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.span
                              key={i}
                              className="w-2 h-2 bg-neutral-400 rounded-full"
                              animate={{ y: [0, -4, 0] }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: i * 0.1,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>

              {/* Quick replies */}
              {messages.length === 1 && (
                <div className="px-4 pb-2">
                  <div className="flex flex-wrap gap-2">
                    {quickReplies.map((reply) => (
                      <motion.button
                        key={reply}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSendMessage(reply)}
                        className="px-3 py-1.5 text-xs font-medium text-[#0B2545] dark:text-sky-400 bg-[#0B2545]/5 dark:bg-[#0B2545]/20 hover:bg-[#0B2545]/10 dark:hover:bg-[#0B2545]/30 rounded-full transition-colors"
                      >
                        {reply}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <button className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                    <RiAttachment2 className="w-5 h-5" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Digite sua mensagem..."
                      className="w-full h-10 px-4 rounded-full bg-neutral-100 dark:bg-neutral-800 text-sm outline-none focus:ring-2 focus:ring-[#0B2545] transition-all"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                      <RiEmotionHappyLine className="w-5 h-5" />
                    </button>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim()}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0B2545] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#081733] transition-colors"
                  >
                    <RiSendPlaneFill className="w-5 h-5" />
                  </motion.button>
                </div>
                <p className="text-[10px] text-neutral-400 text-center mt-2">
                  Powered by <span className="text-[#0B2545] dark:text-sky-400 font-medium">Tappy IA</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
