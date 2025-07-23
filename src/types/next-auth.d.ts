import 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    adminRole?: {
      id: number;
      name: string;
      displayName: string;
      permissions: string[];
    };
  }

  interface Session {
    user: User & {
      id: string;
      phone: string;
      firstName: string;
      lastName: string;
      adminRole?: {
        id: number;
        name: string;
        displayName: string;
        permissions: string[];
      };
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    phone: string;
    firstName: string;
    lastName: string;
    adminRole?: {
      id: number;
      name: string;
      displayName: string;
      permissions: string[];
    };
  }
}
