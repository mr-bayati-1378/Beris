import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers; 

// برای debug
console.log('NextAuth handlers exported:', { GET: !!GET, POST: !!POST }); 