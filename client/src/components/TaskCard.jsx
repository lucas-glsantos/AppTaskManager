import { PenSquareIcon, Trash2Icon } from "lucide-react";
import { useNavigate } from "react-router";
import { formatDate } from "@/lib/utils";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useState } from "react";

const TaskCard = ({ task, setTasks }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    if (!task?._id) return null;

    const goToDetailTask = () => navigate(`/task/${task._id}`); // Ao clicar leva o usuário a Task correspondente

    const handleKeyDown = (click) => {
        if (click.key === "Enter" || click.key === " ") {
            click.preventDefault();
            goToDetailTask();
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Tem certeza de que deseja excluir esta tarefa?"))
            return;

        setLoading(true)
        try {
            await api.delete(`/tasks/${id}`);
            setTasks((prev) => prev.filter((task) => task._id !== id)); // Filtrar exluido
            toast.success("Tarefa excluída");
        } catch (error) {
            console.log("Error no handleDelete", error);
            if (error.response?.status === 429) {
                toast.error("Muitas tentativas. Aguarde e tente novamente.", {
                    duration: 4000,
                    icon: "🚨",
                });
            } else {
                toast.error("Falha ao excluir tarefa");
            }
        } finally {
            setLoading(false);
        }
    };

    let formattedDate = "";
    try {
        const date = new Date(task.createdAt);
        if (!Number.isNaN(date.getTime())) formattedDate = formatDate(date)
    } catch {
        formattedDate = "";
    }

    return (
        <article className="card bg-base-100 hover:shadow-lg transition-all duration-200 border-t-4 border-t-primary">
            <div className="card-body">
                <div 
                    onClick={goToDetailTask} 
                    onKeyDown={handleKeyDown}
                    role="link"
                    tabIndex={0}
                    className="cursor-pointer outline-none focus:ring-2 focus:ring-primary rounded"
                    aria-label={`Abrir ${task.title}`}
                    title={`Abrir ${task.title}`}
            >
                <h3 className="card-title text-base-content">
                    {task.title}
                </h3>
                <p className="text-base-content/70 line-clamp-3">
                    {task.content}
                </p>
                {formattedDate && (
                    <span className="text-sm text-base-content/60">
                        {formattedDate}
                    </span>
                )}
            </div>

            <div className="card-actions justify-end items-center mt-4">
                <button 
                    type="button"
                    aria-label="Editar tarefa"
                    title="Editar tarefa"
                    onClick={goToDetailTask}
                    disabled={loading}
                    className="btn btn-ghost btn-xs"
                >
                    <PenSquareIcon className="size-5" />
                </button>

                <button 
                    type="button"
                    aria-label="Exluir tarefa"
                    title="Exluir tarefa"
                    onClick={() => handleDelete(task._id)}
                    disabled={loading}
                    className="btn btn-ghost btn-xs text-error"
                >
                    <Trash2Icon className="size-5" />
                </button>
            </div>
            </div>
        </article>
    )
};

export default TaskCard;