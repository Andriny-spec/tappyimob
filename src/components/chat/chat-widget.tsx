'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  MessageCircle, X, Headphones, HelpCircle, Send, 
  MessageSquare, Sparkles, MessagesSquare 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const PULSE_VARIANTS = {
  initial: { 
    scale: 1, 
    boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.7)'
  },
  pulse: { 
    scale: [1, 1.05, 1],
    boxShadow: [
      '0 0 0 0 rgba(16, 185, 129, 0.7)',
      '0 0 0 10px rgba(16, 185, 129, 0)',
      '0 0 0 0 rgba(16, 185, 129, 0)'
    ],
    transition: { 
      duration: 2, 
      repeat: Infinity, 
      repeatType: 'loop'
    }
  }
};

const FLOAT_VARIANTS = {
  initial: { y: 0 },
  float: {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      repeatType: 'loop'
    }
  }
};

const CHAT_OPTIONS = [
  {
    id: 'whatsapp',
    title: 'Tappy WhatsApp',
    description: 'Fale com um consultor agora mesmo',
    icon: <MessageSquare className="h-6 w-6 text-emerald-500" />,
    color: 'bg-emerald-500',
    link: 'https://wa.me/5511987654321'
  },
  {
    id: 'central',
    title: 'Central de Ajuda',
    description: 'Consulte tutoriais e perguntas frequentes',
    icon: <HelpCircle className="h-6 w-6 text-blue-500" />,
    color: 'bg-blue-500',
    link: '/ajuda'
  },
  {
    id: 'atendimento',
    title: 'Atendimento Online',
    description: 'Inicie um chat com um especialista',
    icon: <Headphones className="h-6 w-6 text-purple-500" />,
    color: 'bg-purple-500',
    action: 'chat'
  },
  {
    id: 'tappy-ia',
    title: 'Tappy I.A.',
    description: 'Tire dúvidas com nossa assistente virtual',
    icon: <Sparkles className="h-6 w-6 text-amber-500" />,
    color: 'bg-amber-500',
    action: 'ai'
  }
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<{type: 'user' | 'agent', text: string, time: string}[]>([]);
  const [aiMessages, setAiMessages] = useState<{type: 'user' | 'ai', text: string, time: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Simulação de resposta do atendente
  const simulateAgentResponse = () => {
    setIsTyping(true);
    const responses = [
      "Olá! Como posso ajudar você hoje?",
      "Entendo sua dúvida. Posso te oferecer mais informações sobre isso!",
      "Vou verificar isso para você imediatamente.",
      "Claro, posso ajudar com essa questão. Poderia fornecer mais detalhes?",
      "Obrigado por entrar em contato. Um especialista em imóveis vai analisar sua solicitação."
    ];
    
    setTimeout(() => {
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const now = new Date();
      setChatMessages(prev => [...prev, {
        type: 'agent',
        text: randomResponse,
        time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      }]);
      setIsTyping(false);
    }, 1500);
  };

  // Simulação de resposta da IA
  const simulateAIResponse = () => {
    setIsTyping(true);
    const responses = [
      "Sou a assistente virtual Tappy I.A. Como posso ajudar?",
      "Com base nas informações do mercado imobiliário, posso informar que...",
      "Analisando seu histórico de pesquisas, recomendo estes imóveis...",
      "Posso calcular o financiamento ideal para seu perfil. Preciso de algumas informações adicionais.",
      "No bairro solicitado, temos 24 imóveis disponíveis que correspondem aos seus critérios."
    ];
    
    setTimeout(() => {
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const now = new Date();
      setAiMessages(prev => [...prev, {
        type: 'ai',
        text: randomResponse,
        time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      }]);
      setIsTyping(false);
    }, 1200);
  };

  const handleSend = (type: 'chat' | 'ai') => {
    if (!message.trim()) return;
    
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    if (type === 'chat') {
      setChatMessages(prev => [...prev, {
        type: 'user',
        text: message,
        time: timeStr
      }]);
      setMessage('');
      simulateAgentResponse();
    } else {
      setAiMessages(prev => [...prev, {
        type: 'user',
        text: message,
        time: timeStr
      }]);
      setMessage('');
      simulateAIResponse();
    }
  };

  const handleOptionClick = (option: typeof CHAT_OPTIONS[0]) => {
    if (option.link) {
      window.open(option.link, '_blank');
      return;
    }
    
    if (option.action === 'chat') {
      setShowChat(true);
      // Iniciar chat com mensagem de boas-vindas
      if (chatMessages.length === 0) {
        const now = new Date();
        setChatMessages([{
          type: 'agent',
          text: "Olá! Bem-vindo ao atendimento da Tappy Imob. Como podemos ajudar você hoje?",
          time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
        }]);
      }
    } else if (option.action === 'ai') {
      setShowAI(true);
      // Iniciar chat com IA com mensagem de boas-vindas
      if (aiMessages.length === 0) {
        const now = new Date();
        setAiMessages([{
          type: 'ai',
          text: "Olá, sou a Tappy I.A., sua assistente virtual para o mercado imobiliário. Posso ajudar com buscas de imóveis, simulação de financiamento ou tirar dúvidas sobre o processo de compra e venda. Como posso te ajudar hoje?",
          time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
        }]);
      }
    }
  };

  const handleBackToOptions = () => {
    setShowChat(false);
    setShowAI(false);
  };

  return (
    <>
      {/* Botão flutuante de chat */}
      <motion.div
        className="fixed right-6 bottom-6 z-50"
        initial="initial"
        animate="float"
        variants={FLOAT_VARIANTS}
      >
        <motion.button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-emerald-500/30 transition-shadow group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial="initial"
          animate="pulse"
          variants={PULSE_VARIANTS}
        >
          <span className="sr-only">Abrir chat</span>
          <MessageCircle className="h-8 w-8 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
            2
          </span>
        </motion.button>
      </motion.div>

      {/* Modal de Chat */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-xl">
          <DialogHeader className="px-6 pt-6 pb-3 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessagesSquare className="h-5 w-5 text-emerald-400" />
                <span>Atendimento Tappy</span>
              </div>
              {(showChat || showAI) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBackToOptions}
                  className="p-1 h-8 w-8 rounded-full hover:bg-white/10 text-white"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Voltar</span>
                </Button>
              )}
            </DialogTitle>
            <DialogDescription className="text-white/70">
              {!showChat && !showAI ? 'Escolha uma opção de atendimento' : ''}
              {showChat && 'Atendimento com um especialista'}
              {showAI && 'Tappy I.A. - Assistente virtual'}
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {/* Tela de opções de atendimento */}
            {!showChat && !showAI && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="p-6"
              >
                <div className="grid grid-cols-1 gap-4">
                  {CHAT_OPTIONS.map((option) => (
                    <motion.div
                      key={option.id}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleOptionClick(option)}
                      className="p-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer flex items-center gap-4 shadow-sm transition-all"
                    >
                      <div className={`p-3 rounded-full ${option.color}/10 flex items-center justify-center`}>
                        {option.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">{option.title}</h3>
                        <p className="text-sm text-slate-500">{option.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Tela de chat com atendente */}
            {showChat && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-96"
              >
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                  {chatMessages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-xs rounded-2xl px-4 py-2 ${
                          msg.type === 'user' 
                            ? 'bg-emerald-500 text-white rounded-br-none' 
                            : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {msg.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl rounded-bl-none">
                        <div className="flex gap-1">
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, repeatType: 'loop', delay: 0 }}
                            className="w-2 h-2 bg-slate-400 rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, repeatType: 'loop', delay: 0.2 }}
                            className="w-2 h-2 bg-slate-400 rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, repeatType: 'loop', delay: 0.4 }}
                            className="w-2 h-2 bg-slate-400 rounded-full"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
                
                <div className="p-3 border-t bg-white">
                  <div className="flex items-center gap-2">
                    <Input 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend('chat')}
                      placeholder="Digite sua mensagem..."
                      className="flex-1 bg-slate-50 border-slate-200"
                    />
                    <Button 
                      variant="default" 
                      size="icon"
                      onClick={() => handleSend('chat')}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Tela de chat com IA */}
            {showAI && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-96"
              >
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                  {aiMessages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-xs rounded-2xl px-4 py-2 ${
                          msg.type === 'user' 
                            ? 'bg-blue-500 text-white rounded-br-none' 
                            : 'bg-gradient-to-r from-amber-50 to-amber-100 text-slate-900 rounded-bl-none'
                        }`}
                      >
                        {msg.type === 'ai' && (
                          <div className="flex items-center gap-1 mb-1">
                            <Sparkles className="h-3 w-3 text-amber-500" />
                            <span className="text-xs font-medium text-amber-500">Tappy I.A.</span>
                          </div>
                        )}
                        <p>{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                          {msg.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gradient-to-r from-amber-50 to-amber-100 px-4 py-2 rounded-2xl rounded-bl-none">
                        <div className="flex gap-1">
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, repeatType: 'loop', delay: 0 }}
                            className="w-2 h-2 bg-amber-400 rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, repeatType: 'loop', delay: 0.2 }}
                            className="w-2 h-2 bg-amber-400 rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, repeatType: 'loop', delay: 0.4 }}
                            className="w-2 h-2 bg-amber-400 rounded-full"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
                
                <div className="p-3 border-t bg-white">
                  <div className="flex items-center gap-2">
                    <Input 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend('ai')}
                      placeholder="Pergunte à Tappy I.A..."
                      className="flex-1 bg-slate-50 border-slate-200"
                    />
                    <Button 
                      variant="default" 
                      size="icon"
                      onClick={() => handleSend('ai')}
                      className="bg-amber-500 hover:bg-amber-600"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}
