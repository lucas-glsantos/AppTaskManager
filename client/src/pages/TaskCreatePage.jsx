import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import api from "@/lib/axios";

const CreatePage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if(!title.trim() || !content.trim()) {
      toast.error("Todos os campos são obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/tasks", {
        title,
        content,
      });

      toast.success("Tarefa criada com sucesso!");
      navigate("/");

    } catch (error) {
      console.log("Erro ao criar tarefa", error);
      if (error.response?.status === 429) {
        toast.error("Devagar! Você está criando tarefas muito rápido", {
          duration: 4000,
          icon: "🚨",
        });
      } else {
        toast.error("Falha ao criar tarefa");
      }

    } finally{
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link to={"/"} className="btn btn-ghost mb-6 outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500">
            <ArrowLeftIcon className="size-5" />
            Voltar
          </Link>

          <div className="card bg-base-100">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">
                Criar Nova Tarefa
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">
                      Título:
                    </span>
                  </label>
                  <input type="text"
                    placeholder="Titulo da Tarefa"
                    className="input input-bordered outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">
                      Conteúdo:
                    </span>
                  </label>
                  <textarea
                    placeholder="Escreva aqui sua tarefa..."
                    className="textarea textarea-bordered h-32 outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>

                <div className="card-actions justify-end">
                  <button type="submit" className="btn btn-primary outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500" disabled={loading}>
                    {loading ? "Criando..." : "Criar Tarefa"}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>

      </div>

    </div>
  )
};

export default CreatePage;