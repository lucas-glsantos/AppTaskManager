import axios from "axios";
import { clearSession, getRefreshToken, getToken, tryRecover, updateSessionTokens } from "@/lib/auth";

const BASE_URL = "/api";

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    withCredentials: true,
});

// Anexa Bearer em toda requisição Autenticada, tenta sair do degradado antes (probe barato, mantém reativo sem timer)
api.interceptors.request.use((config) => {
    tryRecover();
    
    const token = getToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let refreshPromise = null;


// Função responsável por renovar os Tokens de Autenticação de forma segura
// Garante que o Usuário continue Logado sem precisar digitar a senha novamente
function refresh() {
    if (!refreshPromise) {
        tryRecover();

        const refreshTk = getRefreshToken();

        if (!refreshTk) return Promise.reject(new Error("no-refresh-token"));

        // Axios puro sem interceptors (Evita Loop)
        refreshPromise = axios
            .post(`${BASE_URL}/auth/refresh`, { refreshToken: refreshTk }, { timeout: 15000 })
            .then((res) => {
                const success = updateSessionTokens({
                    token: res.data.token,
                    refreshToken: res.data.refreshToken
                });

                if (!success) {
                    window.dispatchEvent(new CustomEvent("auth:storage-unavailable"));
                    throw new Error("SessionUnavailable");
                }

                return res.data.token;
            })
            .catch((error) => {
                // Só erro definitivo invalida sessão (regra 7d). Rede/429/500 preservam
                const Status = error.response?.status;
                if (Status === 401 || Status === 403 || error.message === "no-refresh-token" || error.message === "SessionUnavailable") {
                    clearSession();
                    window.dispatchEvent(new CustomEvent("auth:session-expired"));
                }
                throw error;
            })
            .finally(() => {
                // Finally roda somente após then/catch propagarem liberando próxima expiração
                refreshPromise = null;
            });
    }
    return refreshPromise;
};


// Função responsável pela Segurança verificando se a requisição é Login, Cadastro ou Renovação de Token
const includeAuthUrl = (url = "") =>
    url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/refresh");

// Interceptador global do Axios que observa todas as respostas retornadas pela API
// Se Resposta for Success apenas repassa
// Se Resposta for Error 401, chama a função refresh() para buscar um Novo Token e caso Success, refaz a requisição Original com o Token Atualizado
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        const status = error.response?.status;

        if (!error.response || status !== 401 || !original || original._retry || includeAuthUrl(original.url)) {
            return Promise.reject(error);
        }

        original._retry = true;

        try {
            const newToken = await refresh();
            original.headers.Authorization = `Bearer ${newToken}`;
            return api(original); // retry 1x

        } catch (refreshError) {
            return Promise.reject(refreshError);
        }
    }
);

export default api;