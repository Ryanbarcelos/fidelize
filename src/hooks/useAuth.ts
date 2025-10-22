import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthUser extends User {
  password: string;
}

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('fidelize-current-user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const signUp = (name: string, email: string, password: string): { success: boolean; error?: string } => {
    const users = JSON.parse(localStorage.getItem('fidelize-users') || '[]') as AuthUser[];
    
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Este email já está cadastrado' };
    }

    const newUser: AuthUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
    };

    users.push(newUser);
    localStorage.setItem('fidelize-users', JSON.stringify(users));

    const { password: _, ...userWithoutPassword } = newUser;
    setCurrentUser(userWithoutPassword);
    localStorage.setItem('fidelize-current-user', JSON.stringify(userWithoutPassword));

    return { success: true };
  };

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const users = JSON.parse(localStorage.getItem('fidelize-users') || '[]') as AuthUser[];
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return { success: false, error: 'Email ou senha incorretos' };
    }

    const { password: _, ...userWithoutPassword } = user;
    setCurrentUser(userWithoutPassword);
    localStorage.setItem('fidelize-current-user', JSON.stringify(userWithoutPassword));

    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('fidelize-current-user');
  };

  return {
    currentUser,
    isLoading,
    signUp,
    login,
    logout,
  };
}
