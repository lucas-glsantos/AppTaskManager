import { useState, useEffect } from "react";
import RateLimitedUI from "../components/RateLimitedUI";
import TaskCard from "../components/TaskCard";
import TasksNotFound from "../components/TasksNotFound";
import toast from "react-hot-toast";
import api from "../lib/axios";

const HomePage = () => {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [tasks,setTasks] = useState([]);
  const [loading,setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get("/tasks");
        console.log(res.data);
        setTasks(res.data);
        setIsRateLimited(false);
      } catch (error) {
        if (error.response?.status === 429){
          setIsRateLimited(true);
        } else {
          toast.error("Falha ao carregar tarefas");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-base-100">

      {isRateLimited && <RateLimitedUI />}

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 mt-6">
        {loading && (
          <div className="text-center text-primary py-10">
            Carregando tarefas...
          </div>
        )}

        {tasks.length === 0 && !isRateLimited && <TasksNotFound />}

        {tasks.length > 0 && !isRateLimited && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <TaskCard key={task._id} task={task} setTasks={setTasks} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
export default HomePage;