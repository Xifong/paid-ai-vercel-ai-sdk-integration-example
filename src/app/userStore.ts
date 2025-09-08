import { UserData } from "./types";

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  customerId?: string;
  paymentMethodId?: string;
  confirmationTokenId?: string;
  paymentProcessed?: boolean;
  createdAt: string;
}

export interface Session {
  token: string;
  userId: string;
  expiresAt: string;
}

interface SerializedStore {
  users: User[];
  sessions: Session[];
}

const COOKIE_NAME = 'multi_user_store';
const COOKIE_MAX_AGE = 31536000; // 1 year

class CookieBackedUserStore {
  private users = new Map<string, User>();
  private sessions = new Map<string, Session>();
  private emailToUserId = new Map<string, string>();
  private isClient = typeof window !== 'undefined';

  constructor() {
    if (this.isClient) {
      this.loadFromCookie();
    }
  }

  private loadFromCookie(): void {
    try {
      const cookieValue = this.getCookie(COOKIE_NAME);
      if (!cookieValue) return;

      const data: SerializedStore = JSON.parse(decodeURIComponent(cookieValue));

      for (const user of data.users) {
        this.users.set(user.id, user);
        this.emailToUserId.set(user.email, user.id);
      }

      const now = new Date();
      for (const session of data.sessions) {
        if (new Date(session.expiresAt) > now) {
          this.sessions.set(session.token, session);
        }
      }
    } catch (error) {
      console.warn('Failed to load user store from cookie:', error);
    }
  }

  private saveToCookie(): void {
    if (!this.isClient) return;

    try {
      const data: SerializedStore = {
        users: Array.from(this.users.values()),
        sessions: Array.from(this.sessions.values())
      };

      const serialized = encodeURIComponent(JSON.stringify(data));
      this.setCookie(COOKIE_NAME, serialized, COOKIE_MAX_AGE);
    } catch (error) {
      console.warn('Failed to save user store to cookie:', error);
    }
  }

  private getCookie(name: string): string | null {
    if (!this.isClient) return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  private setCookie(name: string, value: string, maxAge: number): void {
    if (!this.isClient) return;

    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`;
  }

  async createUser(email: string, name: string, password: string): Promise<User> {
    console.log('[STORE] C1. createUser called', { email, name });

    if (this.emailToUserId.has(email)) {
      console.log('[STORE] C2. User already exists, throwing error');
      throw new Error('User already exists');
    }
    console.log('[STORE] C3. User does not exist, creating new');

    const userId = crypto.randomUUID();
    console.log('[STORE] C4. Generated userId:', userId);

    const user: User = {
      id: userId,
      email,
      name,
      password,
      createdAt: new Date().toISOString(),
    };
    console.log('[STORE] C5. User object created:', user);

    this.users.set(userId, user);
    this.emailToUserId.set(email, userId);
    console.log('[STORE] C6. User added to maps');

    this.saveToCookie();
    console.log('[STORE] C7. Cookie saved');

    return user;
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const userId = this.emailToUserId.get(email);
    if (!userId) return null;

    const user = this.users.get(userId);
    if (!user) return null;

    const isValidPassword = user.password === password;
    return isValidPassword ? user : null;
  }

  getUserByEmail(email: string): User | null {
    const userId = this.emailToUserId.get(email);
    return userId ? this.users.get(userId) || null : null;
  }

  getUserById(id: string): User | null {
    return this.users.get(id) || null;
  }

  updateUser(id: string, updates: Partial<Omit<User, 'id' | 'password' | 'createdAt'>>): User | null {
    const user = this.users.get(id);
    if (!user) return null;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    this.saveToCookie();
    return updatedUser;
  }

  createSession(userId: string): Session {
    console.log('[STORE] D1. createSession called for userId:', userId);

    const token = crypto.randomUUID();
    console.log('[STORE] D2. Generated session token:', token);

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
    console.log('[STORE] D3. Session expires at:', expiresAt);

    const session: Session = {
      token,
      userId,
      expiresAt,
    };
    console.log('[STORE] D4. Session object created:', session);

    this.sessions.set(token, session);
    console.log('[STORE] D5. Session added to map');

    this.saveToCookie();
    console.log('[STORE] D6. Cookie saved');

    this.setCurrentSessionToken(token);
    console.log('[STORE] D7. Current session token set');

    return session;
  }

  getSession(token: string): Session | null {
    const session = this.sessions.get(token);
    if (!session) return null;

    if (new Date(session.expiresAt) < new Date()) {
      this.sessions.delete(token);
      this.saveToCookie();
      return null;
    }

    return session;
  }

  deleteSession(token: string): void {
    this.sessions.delete(token);
    this.clearCurrentSessionToken();
    this.saveToCookie();
  }

  getUserBySession(token: string): User | null {
    const session = this.getSession(token);
    if (!session) return null;

    return this.getUserById(session.userId);
  }

  userToUserData(user: User): UserData {
    return {
      customerId: user.customerId || user.id,
      name: user.name,
      email: user.email,
      paymentMethodId: user.paymentMethodId,
      password: user.password,
    };
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  getAllSessions(): Session[] {
    return Array.from(this.sessions.values());
  }

  clear(): void {
    this.users.clear();
    this.sessions.clear();
    this.emailToUserId.clear();
    if (this.isClient) {
      this.setCookie(COOKIE_NAME, '', 0); // Delete cookie
    }
  }

  // Get current session token from cookies (for active user)
  getCurrentSessionToken(): string | null {
    return this.getCookie('session_token');
  }

  // Set current session token in cookies
  setCurrentSessionToken(token: string): void {
    this.setCookie('session_token', token, COOKIE_MAX_AGE);
  }

  // Clear current session token
  clearCurrentSessionToken(): void {
    this.setCookie('session_token', '', 0);
  }

  // Get currently logged in user
  getCurrentUser(): User | null {
    console.log('[STORE] E1. getCurrentUser called');
    const sessionToken = this.getCurrentSessionToken();
    console.log('[STORE] E2. Current session token:', sessionToken);

    if (!sessionToken) {
      console.log('[STORE] E3. No session token found');
      return null;
    }

    const user = this.getUserBySession(sessionToken);
    console.log('[STORE] E4. User from session:', user);
    return user;
  }

  deleteUser(userID: string): void {
    this.users.delete(userID);
    const userSessions = this.sessions.values().filter((session) => session.userId === userID).toArray();
    if (!userSessions) return;
    for (const session of userSessions) {
      this.deleteSession(session.token);
    }
    this.saveToCookie();
  }
}

export const userStore = new CookieBackedUserStore();
