import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Code, FileCode, FileImage, Globe, MessageSquare, Settings2 } from 'lucide-react';

export const BuildingAnimation = () => {
  const animationItems = [
    { icon: <FileCode className="h-5 w-5" />, text: 'Gerando estrutura do site...' },
    { icon: <FileImage className="h-5 w-5" />, text: 'Preparando imagens e assets...' },
    { icon: <Code className="h-5 w-5" />, text: 'Compilando código...' },
    { icon: <Settings2 className="h-5 w-5" />, text: 'Configurando funcionalidades...' },
    { icon: <Globe className="h-5 w-5" />, text: 'Preparando para deploy...' },
    { icon: <Building2 className="h-5 w-5" />, text: 'Finalizando construção...' },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="w-full max-w-md mx-auto">
        {/* Animação de construção */}
        <div className="relative mb-8">
          <div className="flex justify-center">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            >
              <div className="relative">
                <Building2 className="h-32 w-32 text-primary" />
                
                {/* Pequenas partículas de construção */}
                <motion.div
                  className="absolute -top-4 -right-4"
                  animate={{
                    rotate: [0, 360],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                >
                  <FileCode className="h-8 w-8 text-amber-500" />
                </motion.div>
                
                <motion.div
                  className="absolute -bottom-4 -left-4"
                  animate={{
                    rotate: [0, -360],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                  }}
                >
                  <Settings2 className="h-8 w-8 text-blue-500" />
                </motion.div>
                
                <motion.div
                  className="absolute top-10 -left-8"
                  animate={{
                    x: [0, 5, 0, -5, 0],
                    y: [0, -5, 0, 5, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                  }}
                >
                  <Globe className="h-6 w-6 text-green-500" />
                </motion.div>
                
                <motion.div
                  className="absolute bottom-10 -right-6"
                  animate={{
                    x: [0, -3, 0, 3, 0],
                    y: [0, 3, 0, -3, 0],
                  }}
                  transition={{
                    duration: 4.5,
                    repeat: Infinity,
                  }}
                >
                  <MessageSquare className="h-6 w-6 text-purple-500" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Mensagens de progresso */}
        <div className="space-y-4">
          {animationItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.5, duration: 0.3 }}
              className="flex items-center space-x-3 bg-slate-50 p-3 rounded-md"
            >
              <div className="text-primary">{item.icon}</div>
              <div className="text-sm">{item.text}</div>
              <motion.div
                className="ml-auto w-5 h-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.5 + 0.3 }}
              >
                <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
