import { useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";


// Regras de Negócio: Nome >= 4 caracteres, Email válido, Senha >= 8 caracteres no registro
const isEmail = (validate) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(validate.trim());

const LoginPage = () => {
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const [status, setStatus] = useState("login"); // "login" | "register"
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(false);

    const isRegister = status === "register";

    const switchStatus = (next) => {
        setStatus(next);
        setFormError("");
        setConfirm("");
    };

    const validateLocal = () => {
        if (isRegister && name.trim().length < 4) {
            return "O nome deve ter ao menos 4 caracteres.";
        }

        if (!isEmail(email)) {
            return "Informe um email válido.";
        }

        // No Login exigimos só presença (401 genérico cobre o resto)
        // No Registro é aplicado a regra do backend (>=8)
        if (!password) {
            return "Informe sua senha.";
        }

        if (isRegister && password.length < 8) {
            return "A senha deve ter ao menos 8 caracteres.";
        }

        if (isRegister && password !== confirm) {
            return "As senhas não conferem.";
        }
        return "";
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError("");
        

        const localError = validateLocal();
        if (localError) {
            setFormError(localError);
            return;
        }

        setLoading(true);
        const result = isRegister
            ? await register({ name: name.trim(), email: email.trim(), password })
            : await login({ email: email.trim(), password });
        setLoading(false);

        if (result.ok) {
            toast.success(isRegister ? "Conta criada com sucesso!" : "Login realizado!");
            navigate("/");
            return;
        }

        // Mensagem já vem padronizada de mapAuthError:
        // 401 -> "Email ou senha incorretos." | sem rede -> Mensagem de conexão.
        setFormError(result.message);
        toast.error(result.message);
    };

     return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 p-4">
      <div className="card w-full max-w-md bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title font-mono text-primary flex items-center justify-center">
            {isRegister ? "Criar conta" : "Entrar"}
          </h2>
          <p className="text-sm opacity-70 flex items-center justify-center">
            {isRegister
              ? "Cadastre-se para gerenciar suas tarefas."
              : "Acesse suas tarefas."}
          </p>

          {/* Alternador login | registro */}
          <div className="tabs tabs-boxed mt-2">
            <button
              type="button"
              className={`tab ${!isRegister ? "tab-active" : ""} outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500`}
              onClick={() => switchStatus("login")}
            >
              Entrar
            </button>
            <button
              type="button"
              className={`tab ${isRegister ? "tab-active" : ""} outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500`}
              onClick={() => switchStatus("register")}
            >
              Criar conta
            </button>
          </div>

          {formError && (
            <div role="alert" className="alert alert-error mt-4">
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-4">
            {isRegister && (
              <label className="form-control">
                <span className="label-text">
                    Nome:
                </span>
                <input
                  className="input input-bordered outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  autoComplete="name"
                />
              </label>
            )}

            <label className="form-control">
              <span className="label-text">
                Email:
              </span>
              <input
                className="input input-bordered outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                autoComplete="email"
              />
            </label>

            <label className="form-control">
              <span className="label-text">
                Senha:
              </span>
              <input
                className="input input-bordered outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRegister ? "Mínimo 8 caracteres" : "Sua senha"}
                autoComplete={isRegister ? "new-password" : "current-password"}
              />
            </label>

            {isRegister && (
              <label className="form-control">
                <span className="label-text">
                    Confirmar senha:
                </span>
                <input
                  className="input input-bordered outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repita a senha"
                  autoComplete="new-password"
                />
              </label>
            )}

            <button className="btn btn-primary mt-2 outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500" disabled={loading}>
              {loading
                ? "Aguarde..."
                : isRegister
                  ? "Criar conta"
                  : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;