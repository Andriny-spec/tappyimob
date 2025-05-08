import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Token será undefined se não estiver autenticado
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  const isAuthenticated = !!token;
  const isLoginPage = pathname === '/login';
  const isAdminRoute = pathname.startsWith('/admin');
  const isImobiliariaRoute = pathname.startsWith('/imobiliaria');
  const isCorretorRoute = pathname.startsWith('/corretor');
  const isClienteRoute = pathname.startsWith('/cliente');
  
  // 1. Proteger a página de login contra acesso de usuários já autenticados
  if (isLoginPage) {
    if (isAuthenticated) {
      // Redirecionar para o painel apropriado com base na role
      const role = token.role as string;
      
      switch (role) {
        case 'ADMIN':
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        case 'IMOBILIARIA':
          return NextResponse.redirect(new URL('/imobiliaria/dashboard', request.url));
        case 'CORRETOR':
          return NextResponse.redirect(new URL('/corretor/dashboard', request.url));
        case 'IMOBILIARIA':
          return NextResponse.redirect(new URL('/cliente/dashboard', request.url));
        default:
          return NextResponse.redirect(new URL('/', request.url));
      }
    }
    return NextResponse.next();
  }
  
  // Função para redirecionar para o dashboard apropriado com base na role
  const redirectToDashboard = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      case 'IMOBILIARIA':
        return NextResponse.redirect(new URL('/imobiliaria/dashboard', request.url));
      case 'CORRETOR':
        return NextResponse.redirect(new URL('/corretor/dashboard', request.url));
      case 'IMOBILIARIA':
        return NextResponse.redirect(new URL('/cliente/dashboard', request.url));
      default:
        return NextResponse.redirect(new URL('/', request.url));
    }
  };

  // 2. Proteger rotas de administrador
  if (isAdminRoute) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    if (token.role !== 'ADMIN') {
      // Redirecionar para o dashboard do usuário com base em sua role
      return redirectToDashboard(token.role as string);
    }
    
    return NextResponse.next();
  }
  
  // 3. Proteger rotas de imobiliária
  if (isImobiliariaRoute) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    if (token.role !== 'IMOBILIARIA') {
      // Redirecionar para o dashboard do usuário com base em sua role
      return redirectToDashboard(token.role as string);
    }
    
    return NextResponse.next();
  }
  
  // 4. Proteger rotas de corretor
  if (isCorretorRoute) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    if (token.role !== 'CORRETOR') {
      // Redirecionar para o dashboard do usuário com base em sua role
      return redirectToDashboard(token.role as string);
    }
    
    return NextResponse.next();
  }
  
  // 5. Proteger rotas de cliente
  if (isClienteRoute) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    if (token.role !== 'CLIENTE') {
      // Redirecionar para o dashboard do usuário com base em sua role
      return redirectToDashboard(token.role as string);
    }
    
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

// Configurar quais rotas devem ter o middleware aplicado
export const config = {
  matcher: ['/login', '/admin/:path*', '/imobiliaria/:path*', '/corretor/:path*', '/cliente/:path*']
};
