
import { createContext, useState, useEffect, useCallback, useContext } from "react";
import api from "@/lib/axios";
import { clearSession, getStoredUser, getToken, initAuthSync, isDegraded, mapAuthError, saveSession, tryRecover } from "@/lib/auth";
import toast from "react-hot-toast";


const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => getStoredUser());
    const [loading, setLoading] = useState(() => Boolean(getToken()));
    const [degraded, setDegraded] = useState(() => isDegraded());

    // Boot tryRecover antes de ler token, /me com retry 15min via interceptor
    useEffect(() => {
        let cancelled = false;
        const boot = async () => {
            tryRecover();

            if (!getToken()) {
                if (!cancelled) {
                    setUser(null);
                    setLoading(false);
                    setDegraded(isDegraded());
                }
                return;
            }

            try {
                const res = await api.get("/auth/me");
                if (!cancelled) {
                    setUser(res.data);
                    setDegraded(isDegraded());
                }

            } catch {
                if (!cancelled) {
                    clearSession();
                    setUser(null);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        boot();
        return () => { cancelled = true; };
    }, []);

    // Recupera local ao voltar o foco (saiu da privada/liberou cota) sem reload
    useEffect(() => {
        const onFocus = () => {
            if (tryRecover()) {
                setDegraded(false);
                setUser(getStoredUser());
            } else {
                setDegraded(isDegraded());
            }
        };

        window.addEventListener("focus", onFocus);
        document.addEventListener("visibilitychange", onFocus);
        
        return () => {
            window.removeEventListener("focus", onFocus);
            document.removeEventListener("visibilitychange", onFocus);
        }
    }, []);

    // Sync multi-tab + Eventos do axios/storage
    useEffect(() => {
        // Inicia a sincronização de dados de autenticação
        const offSync = initAuthSync(() => {
            setUser(getStoredUser());
            setDegraded(isDegraded());
        });

        // Executa quando a sessão do usuário expira
        const onExpired = () => setUser(null); // 403 7d do Axios

        // "onDegraded" Executa quando o armazenamento principal do navegador falha
        // Altera o estado para "degradado" e exibe um toast avisando que o login só valerá naquela aba específica
        const onDegraded = () => {
            setDegraded(true);
            toast.error("Armazenamento indisponível - Sessão válida só nesta aba.", { id: "tm-degraded" });
        };

        // Executa quando o armazenamento do navegador volta ao normal
        // Desativa o estado de falha, busca os dados do usuário novamente e exibe um toast de sucesso
        const onRecovered = () => {
            setDegraded(false);
            setUser(getStoredUser());
            toast.success("Armazenamento recuperado.", { id: "tm-degraded" });
        };

        // Executa exibindo um toast de erro Caso o Navegador do usuário Bloqueie totalmente a gravação dos dados de sessão
        const onUnavailable = () => {
            toast.error("Não foi possível salvar a sessão neste navegador.", { id: "tm-unavailable", duration: 5000 });
        };

        // Ligam essas funções aos System Events
        window.addEventListener("auth:session-expired", onExpired);
        window.addEventListener("auth:storage-degraded", onDegraded);
        window.addEventListener("auth:storage-recovered", onRecovered);
        window.addEventListener("auth:storage-unavailable", onUnavailable);

        // Garante a remoção dos Listeners Quando os componentes forem Desmontados, evitando travamentos ou vazamentos de memória no React
        return () => {
            offSync?.();
            window.removeEventListener("auth:session-expired", onExpired);
            window.removeEventListener("auth:storage-degraded", onDegraded);
            window.removeEventListener("auth:storage-recovered", onRecovered);
            window.removeEventListener("auth:storage-unavailable", onUnavailable);
        };
    }, []);


    // Função Assíncrona responsável por Executar o fluxo de Autenticação (input) do Usuário no System
    const login = useCallback(async ({ email, password }) => {
        try {
            const res = await api.post("/auth/login", { email, password });
            const saved = saveSession(res.data);

            if (!saved) return {
                ok: false,
                message: mapAuthError(new Error("SessionUnavailable"))
            };

            setUser(res.data.user);
            setDegraded(isDegraded());

            return { ok: true };

        } catch (error) {
            return { 
                ok: false, 
                message: mapAuthError(error, { context: "login" })
            };
        }
    }, []);


    // Função Assíncrona responsável por Executar o fluxo de Cadastro (Create Account) de um Novo Usuário no System
    // Realiza Login Automático após Cadastro
    const register = useCallback(async ({ name, email, password }) => {
        try {
            const res = await api.post("/auth/register", { name, email, password });
            const saved = saveSession(res.data);

            if (!saved) return {
                ok: false,
                message: mapAuthError(new Error("SessionUnavailable"))
            };

            setUser(res.data.user);
            setDegraded(isDegraded());

            return { ok: true };

        } catch (error) {
            return {
                ok: false,
                message: mapAuthError(error, { context: "register" })
            };
        }
    }, []);


    // Função Assíncrona responsável por Encerrar a Sessão do Usuário (System Exit) de forma segura
    const logout = useCallback(async () => {
        try {
            await api.post("/auth/logout");
        } catch {
            // Mesmo sem rede, a sessão LOCAL sempre é encerrada
        } finally {
            clearSession();
            setUser(null);
            setDegraded(false);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, degraded, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
    return context;
};