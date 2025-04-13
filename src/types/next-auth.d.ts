import 'next-auth';
import { Role, StatusUser } from '@prisma/client';

declare module 'next-auth' {
  interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    status: StatusUser;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: Role;
      status: StatusUser;
      image?: string | null;
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
    status: StatusUser;
  }
}
