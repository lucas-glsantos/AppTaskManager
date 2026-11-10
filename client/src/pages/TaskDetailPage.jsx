import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { ArrowLeftIcon, Loader2Icon, Trash2Icon } from "lucide-react";

const TaskDetailPage = () => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const navigate = useNavigate();

  const {id} = useParams();

  useEffect(() => {
    const fetchTask = async() => {
      try {
        const res = await api.get(`/tasks/${id}`);
        setTask(res.data);
      } catch (error) {
        toast.error("Falha ao buscar tarefa");
        console.log("Erro em buscar tarefa", error);

      } finally {
        setLoading(false);
      };
    };

    fetchTask();
  },[id]);

  const handleDelete = async() => {
    if (!window.confirm("Tem certeza de que deseja excluir esta tarefa?"))
      return;

    try {
      await api.delete(`/tasks/${id}`);
      toast.success("Tarefa excluída");
      navigate("/");

    } catch (error) {
      console.log("Erro ao excluir tarefa:", error);
      toast.error("Falha ao excluir tarefa");
    }
  };

  const handleSave = async() => {
    if (!task.title.trim() || !task.content.trim()) {
      toast.error("Por favor adicione Título e Conteúdo");
      return;
    }

    setSaving(true);

    try {
      await api.put(`/tasks/${id}`, task);
      toast.success("Tarefa atualizada com sucesso!");

    } catch (error) {
      console.log("Erro ao salvar tarefa:", error);
      toast.error("Falha ao atualizar tarefa");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <Loader2Icon className="animate-spin size-20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="btn btn-ghost">
              <ArrowLeftIcon className="h-5 w-5" />
              Voltar para Tarefas
            </Link>
            <button onClick={handleDelete} className="btn btn-error btn-outline">
              <Trash2Icon className="h-5 w-5" />
              Excluir Tarefa
            </button>
          </div>

          <div className="card bg-base-100">
            <div className="card-body">
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Título</span>
                </label>
                <input
                  type="text"
                  placeholder="Título da Tarefa"
                  className="input input-bordered"
                  value={task.title}
                  onChange={(e) => setTask({ ...task, title: e.target.value })}
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Conteúdo</span>
                </label>
                <textarea
                  placeholder="Escreva sua tarefa aqui..."
                  className="textarea textarea-bordered h-32"
                  value={task.content}
                  onChange={(e) => setTask({ ...task, content: e.target.value })}
                />
              </div>

              <div className="card-actions justify-end">
                <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default TaskDetailPage;