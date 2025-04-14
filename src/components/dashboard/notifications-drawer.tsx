'use client';

import { useState, useEffect } from 'react';
import { Bell, Building2, User, MessageCircle, Star, Home, Package, Calendar, Clock, Activity } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Tipo para as atividades recentes
type ActivityItem = {
  id: string;
  tipo: 'imovel' | 'corretor' | 'cliente' | 'avaliacao' | 'mensagem' | 'visita' | 'venda';
  titulo: string;
  descricao: string;
  data: Date | string; // Pode vir como string do JSON da API
  isRead: boolean;
  entidadeId?: string;
  entidadeNome?: string;
  icone: string;
};

// Cores para os diferentes tipos de atividades
const activityColors = {
  imovel: 'bg-blue-500',
  corretor: 'bg-green-500',
  cliente: 'bg-purple-500',
  avaliacao: 'bg-amber-500',
  mensagem: 'bg-pink-500',
  visita: 'bg-cyan-500',
  venda: 'bg-emerald-500'
};

export function NotificationsDrawer() {
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  // Função para carregar as atividades recentes
  const loadActivities = async () => {
    setIsLoading(true);
    try {
      // Em uma implementação real, isso buscaria dados da API
      const response = await fetch('/api/imobiliarias/atividades-recentes');
      
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
        setUnreadCount(data.filter((item: ActivityItem) => !item.isRead).length);
      } else {
        // Fallback para dados mockados caso a API falhe
        const mockData: ActivityItem[] = [
          {
            id: '1',
            tipo: 'imovel',
            titulo: 'Novo imóvel cadastrado',
            descricao: 'Apartamento de luxo em Copacabana',
            data: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
            isRead: false,
            entidadeId: 'imovel-1',
            entidadeNome: 'Apartamento de luxo',
            icone: 'Building2'
          },
          {
            id: '2',
            tipo: 'corretor',
            titulo: 'Novo corretor adicionado',
            descricao: 'Carlos Silva foi adicionado à sua equipe',
            data: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
            isRead: false,
            entidadeId: 'corretor-1',
            entidadeNome: 'Carlos Silva',
            icone: 'User'
          },
          {
            id: '3',
            tipo: 'cliente',
            titulo: 'Novo cliente cadastrado',
            descricao: 'Maria Santos foi adicionada como cliente',
            data: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 horas atrás
            isRead: true,
            entidadeId: 'cliente-1',
            entidadeNome: 'Maria Santos',
            icone: 'User'
          },
          {
            id: '4',
            tipo: 'mensagem',
            titulo: 'Nova mensagem recebida',
            descricao: 'João enviou uma pergunta sobre o imóvel',
            data: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 horas atrás
            isRead: true,
            entidadeId: 'mensagem-1',
            icone: 'MessageCircle'
          },
          {
            id: '5',
            tipo: 'avaliacao',
            titulo: 'Nova avaliação recebida',
            descricao: 'Avaliação de 5 estrelas para o imóvel',
            data: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 dia atrás
            isRead: true,
            entidadeId: 'avaliacao-1',
            icone: 'Star'
          },
          {
            id: '6',
            tipo: 'visita',
            titulo: 'Visita agendada',
            descricao: 'Visita ao apartamento marcada para amanhã',
            data: new Date(Date.now() - 1000 * 60 * 60 * 26), // 26 horas atrás
            isRead: false,
            entidadeId: 'visita-1',
            icone: 'Calendar'
          },
          {
            id: '7',
            tipo: 'venda',
            titulo: 'Venda concluída',
            descricao: 'Casa na Barra foi vendida com sucesso',
            data: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 dias atrás
            isRead: true,
            entidadeId: 'venda-1',
            entidadeNome: 'Casa na Barra',
            icone: 'Package'
          }
        ];
        setActivities(mockData);
        setUnreadCount(mockData.filter(item => !item.isRead).length);
      }
    } catch (error) {
      console.error('Erro ao carregar atividades recentes:', error);
      // Caso ocorra algum erro, inicializar com array vazio
      setActivities([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar as atividades quando o componente for montado ou o drawer for aberto
  useEffect(() => {
    if (open) {
      loadActivities();
    }
  }, [open]);

  // Função para marcar uma atividade como lida
  const markAsRead = async (id: string) => {
    try {
      // Em uma implementação real, isso enviaria uma requisição para a API
      // await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      
      // Atualiza localmente
      setActivities(prev => 
        prev.map(item => 
          item.id === id ? { ...item, isRead: true } : item
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  // Função para marcar todas como lidas
  const markAllAsRead = async () => {
    try {
      // Em uma implementação real, isso enviaria uma requisição para a API
      // await fetch('/api/notifications/mark-all-read', { method: 'POST' });
      
      // Atualiza localmente
      setActivities(prev => 
        prev.map(item => ({ ...item, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Erro ao marcar todas notificações como lidas:', error);
    }
  };

  // Renderiza o ícone apropriado baseado no tipo de atividade
  const renderIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      Building2: <Building2 className="h-5 w-5" />,
      User: <User className="h-5 w-5" />,
      MessageCircle: <MessageCircle className="h-5 w-5" />,
      Star: <Star className="h-5 w-5" />,
      Home: <Home className="h-5 w-5" />,
      Package: <Package className="h-5 w-5" />,
      Calendar: <Calendar className="h-5 w-5" />
    };
    
    return icons[iconName] || <Activity className="h-5 w-5" />;
  };

  // Função para formatar a data relativa (ex: "há 5 minutos", "há 2 horas")
  const getRelativeTime = (dateInput: Date | string) => {
    // Converter para objeto Date se for string
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    
    // Verificar se é um objeto Date válido
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return 'data desconhecida';
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) {
      return `${diffDay} dia${diffDay > 1 ? 's' : ''} atrás`;
    } else if (diffHour > 0) {
      return `${diffHour} hora${diffHour > 1 ? 's' : ''} atrás`;
    } else if (diffMin > 0) {
      return `${diffMin} minuto${diffMin > 1 ? 's' : ''} atrás`;
    } else {
      return 'agora mesmo';
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/20">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0 border-l">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="text-xl font-bold flex justify-between items-center">
            <span>Atividades Recentes</span>
            {activities.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="text-xs font-normal"
              >
                Marcar todas como lidas
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>
        
        <Tabs defaultValue="todas" className="px-6">
          <TabsList className="mb-2">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="imoveis">Imóveis</TabsTrigger>
            <TabsTrigger value="pessoas">Pessoas</TabsTrigger>
            <TabsTrigger value="interacoes">Interações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="todas" className="mt-0">
            <ActivityList 
              activities={activities} 
              isLoading={isLoading} 
              onMarkAsRead={markAsRead}
              renderIcon={renderIcon}
              getRelativeTime={getRelativeTime}
            />
          </TabsContent>
          
          <TabsContent value="imoveis" className="mt-0">
            <ActivityList 
              activities={activities.filter(item => ['imovel', 'venda'].includes(item.tipo))} 
              isLoading={isLoading} 
              onMarkAsRead={markAsRead}
              renderIcon={renderIcon}
              getRelativeTime={getRelativeTime}
            />
          </TabsContent>
          
          <TabsContent value="pessoas" className="mt-0">
            <ActivityList 
              activities={activities.filter(item => ['corretor', 'cliente'].includes(item.tipo))} 
              isLoading={isLoading} 
              onMarkAsRead={markAsRead}
              renderIcon={renderIcon}
              getRelativeTime={getRelativeTime}
            />
          </TabsContent>
          
          <TabsContent value="interacoes" className="mt-0">
            <ActivityList 
              activities={activities.filter(item => ['mensagem', 'avaliacao', 'visita'].includes(item.tipo))} 
              isLoading={isLoading} 
              onMarkAsRead={markAsRead}
              renderIcon={renderIcon}
              getRelativeTime={getRelativeTime}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

// Componente para a lista de atividades
type ActivityListProps = {
  activities: ActivityItem[];
  isLoading: boolean;
  onMarkAsRead: (id: string) => void;
  renderIcon: (iconName: string) => React.ReactNode;
  getRelativeTime: (date: Date | string) => string;
};

function ActivityList({ activities, isLoading, onMarkAsRead, renderIcon, getRelativeTime }: ActivityListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="flex items-start gap-4 px-2 py-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <Clock className="mx-auto h-12 w-12 mb-3 opacity-20" />
        <p>Nenhuma atividade recente</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-160px)]">
      <div className="space-y-1 py-4">
        {activities.map((activity) => (
          <div 
            key={activity.id}
            className={cn(
              "flex items-start gap-4 px-4 py-3 hover:bg-muted/40 rounded-lg transition-colors cursor-pointer relative",
              !activity.isRead && "bg-muted/60"
            )}
            onClick={() => !activity.isRead && onMarkAsRead(activity.id)}
          >
            <div className={cn(
              "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white",
              activityColors[activity.tipo]
            )}>
              {renderIcon(activity.icone)}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium leading-none mb-1">{activity.titulo}</p>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-1">{activity.descricao}</p>
              <p className="text-xs text-muted-foreground flex items-center">
                <Clock className="h-3 w-3 mr-1 inline-block" /> 
                {getRelativeTime(activity.data)}
              </p>
            </div>

            {!activity.isRead && (
              <div className="absolute right-4 top-4 h-2 w-2 rounded-full bg-primary"></div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
