'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, registerTalent as apiRegisterTalent, registerEstablishment as apiRegisterEstablishment, fetchCurrentUser } from '@/lib/api';

interface User {
    id: string;
    email: string;
    role: string;
    talentProfile?: any;
    establishmentProfile?: any;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    registerTalent: (data: any) => Promise<void>;
    registerEstablishment: (data: any) => Promise<void>;
    logout: () => void;
    setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('velvet_token='))
            ?.split('=')[1];

        if (token) {
            fetchCurrentUser()
                .then(response => {
                    if (response?.data) {
                        setUser(response.data);
                    }
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        const response = await apiLogin(email, password);
        
        if (response?.data?.accessToken) {
            // Store token in cookie
            document.cookie = `velvet_token=${response.data.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
            
            // Fetch user data
            const userResponse = await fetchCurrentUser();
            if (userResponse?.data) {
                setUser(userResponse.data);
            }
        }
    };

    const registerTalent = async (data: any) => {
        const response = await apiRegisterTalent(data);
        
        if (response?.data?.accessToken) {
            // Store token in cookie
            document.cookie = `velvet_token=${response.data.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}`;
            
            // Fetch user data
            const userResponse = await fetchCurrentUser();
            if (userResponse?.data) {
                setUser(userResponse.data);
            }
        }
    };

    const registerEstablishment = async (data: any) => {
        const response = await apiRegisterEstablishment(data);
        
        if (response?.data?.accessToken) {
            // Store token in cookie
            document.cookie = `velvet_token=${response.data.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}`;
            
            // Fetch user data
            const userResponse = await fetchCurrentUser();
            if (userResponse?.data) {
                setUser(userResponse.data);
            }
        }
    };

    const logout = () => {
        document.cookie = 'velvet_token=; path=/; max-age=0';
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, registerTalent, registerEstablishment, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
