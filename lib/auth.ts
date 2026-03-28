import { getServerSession } from 'next-auth';
import { authOptions } from './nextauth-options';
import type { Session } from 'next-auth';

export async function getSafeSession(): Promise<Session | null> {
  try {
    return await getServerSession(authOptions);
  } catch {
    return null;
  }
}

