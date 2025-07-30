import { createContext, useContext, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
    fetchWithAuth: (url:string,options?:RequestInit) => Promise<Response | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: {children: ReactNode}) => {
    const navigate = useNavigate();

    const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
        const res  = await fetch(url, {
            ...options,
            credentials: 'include'
        });

        if(res.status === 401) {
            navigate('/login', {replace: true});
            return null;
        }

        return res;
    }

    return (
        <AuthContext.Provider value={{ fetchWithAuth }}>
            { children }
        </AuthContext.Provider>
    )
}

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context;
}
