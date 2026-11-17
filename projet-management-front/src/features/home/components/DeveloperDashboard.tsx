import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bell,
  Clock3,
  ExternalLink,
  FolderKanban,
  GitBranch,
  ListTodo,
  Play,
  RefreshCw,
  Users,
} from "lucide-react";
import type { User } from "../../auth/interfaces/user";
import { getApiErrorMessage } from "../../../utils/tools";
import Sidebar from "./Sidebar";
import TaskStatusPagination from "./TaskStatusPagination";
import { getProject, getProjects } from "../services/projectService";
import { createTaskBranch, getTasks, startTask, takeTask } from "../services/taskService";
import type { Project } from "../interfaces/Project";
import type { Task, TaskStatus } from "../interfaces/Task";

type Props = {
  user: User;
  onLogout: () => void;
};

const cardColors = ["bg-[#D4E8FF]", "bg-[#DDD3FA]", "bg-[#FFF0D3]", "bg-[#F8D4ED]", "bg-[#BDF7D9]"];
const statuses: TaskStatus[] = ["En cours", "Disponible", "Attribuée", "Terminé"];
const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

const formatDate = (date: string | null | undefined) => {
  if (!date) return "Non définie";
  const [year, month, day] = date.slice(0, 10).split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR").format(new Date(year, month - 1, day));
};

const getAvailableAt = (task: Task) => {
  if (!task.created_at) return null;
  return new Date(new Date(task.created_at).getTime() + threeDaysMs);
};

const isOldEnoughToTake = (task: Task, now: number) => {
  const availableAt = getAvailableAt(task);
  return availableAt !== null && availableAt.getTime() <= now;
};

const timeUntilAvailable = (task: Task, now: number) => {
  const availableAt = getAvailableAt(task);
  if (!availableAt) return "Date de création indisponible";
  const remainingMs = availableAt.getTime() - now;
  if (remainingMs <= 0) return "Prête à être prise";
  const hours = Math.ceil(remainingMs / (60 * 60 * 1000));
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `Disponible dans ${days ? `${days} j ` : ""}${remainingHours} h`;
};

export default function DeveloperDashboard({ user, onLogout }: Props) {
  const [currentPage, setCurrentPage] = useState("Overview");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [projectLoading, setProjectLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyTaskId, setBusyTaskId] = useState<number | null>(null);
  const [taskStatusFilter, setTaskStatusFilter] = useState<TaskStatus | "Tous">("En cours");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const [taskResult, projectResult] = await Promise.allSettled([getTasks(), getProjects()]);
    const messages: string[] = [];
    if (taskResult.status === "fulfilled") setTasks(taskResult.value.data);
    else messages.push(getApiErrorMessage(taskResult.reason));
    if (projectResult.status === "fulfilled") setProjects(projectResult.value.data);
    else messages.push(getApiErrorMessage(projectResult.reason));
    if (messages.length) setError(messages.join(" "));
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    const initialLoad = async () => {
      try {
        await loadData();
      } catch (loadError) {
        if (active) setError(getApiErrorMessage(loadError));
      }
    };
    void initialLoad();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const timerId = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timerId);
  }, []);

  const activeTasks = tasks.filter((task) => Number(task.user_id) === Number(user.id) && ["Attribuée", "En cours"].includes(task.statut));
  const visibleTasks = useMemo(() => {
    if (currentPage === "Projects" && selectedProject) {
      return tasks.filter((task) => task.projet_id === selectedProject.id);
    }
    return tasks;
  }, [tasks, currentPage, selectedProject]);

  const openProject = async (project: Project) => {
    setSelectedProject(project);
    setProjectLoading(true);
    setActionError(null);
    try {
      const response = await getProject(project.id);
      setSelectedProject(response.data);
    } catch (projectError) {
      setActionError(getApiErrorMessage(projectError));
    } finally {
      setProjectLoading(false);
    }
  };

  const take = async (task: Task) => {
    setBusyTaskId(task.id);
    setActionError(null);
    try {
      const response = await takeTask(task.id);
      setTasks((current) => current.map((item) => item.id === task.id ? response.data : item));
    } catch (taskError) {
      setActionError(getApiErrorMessage(taskError));
    } finally {
      setBusyTaskId(null);
    }
  };

  const start = async (task: Task) => {
    setBusyTaskId(task.id);
    setActionError(null);
    try {
      const response = await startTask(task.id);
      setTasks((current) => current.map((item) => item.id === task.id ? response.data : item));
    } catch (taskError) {
      setActionError(getApiErrorMessage(taskError));
    } finally {
      setBusyTaskId(null);
    }
  };

  const createBranch = async (task: Task) => {
    setBusyTaskId(task.id);
    setActionError(null);
    try {
      const response = await createTaskBranch(task.id);
      setTasks((current) => current.map((item) => item.id === task.id
        ? { ...item, github_branch: response.data.branch, github_branch_url: response.data.url }
        : item));
    } catch (taskError) {
      setActionError(getApiErrorMessage(taskError));
    } finally {
      setBusyTaskId(null);
    }
  };

  const taskStatusCounts = statuses.map((status) => ({
    status,
    count: tasks.filter((task) => task.statut === status).length,
  }));
  const projectTasks = selectedProject
    ? tasks.filter((task) => task.projet_id === selectedProject.id)
    : [];
  const projectMembers = selectedProject?.users ?? [];

  return (
    <main className="bg-[#F0F3FA]">
      <div className="flex h-[calc(100vh-0.1rem)] min-h-[620px] w-full overflow-hidden rounded-xl bg-white shadow-[0_5px_35px_rgba(30,50,90,0.04)] max-md:h-[95vh]">
        <Sidebar
          user={user}
          currentPage={currentPage}
          onNavigate={(page) => {
            setCurrentPage(page);
            setSelectedProject(null);
          }}
          onLogout={onLogout}
          tasks={tasks.map((task) => ({ id: task.id, title: task.nom, completed: task.statut === "Terminé" }))}
        />
        <section className="flex min-w-0 flex-1 flex-col bg-white">
          <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-[#EEF0F4] px-5 sm:px-8">
            <h1 className="text-[18px] font-bold tracking-tight text-[#111827]">
              {currentPage === "Overview" ? "Tableau de bord" : currentPage}
            </h1>
            <div className="flex items-center gap-5">
              {/* <button type="button" onClick={() => void loadData()} title="Actualiser" className="text-[#858C98] hover:text-[#1556E8]">
                <RefreshCw size={16} />
              </button> */}
              <Bell size={17} className="text-[#354052]" />
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F8E7C9] text-lg">👨🏻</div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
            {error && <Notice message={error} />}
            {actionError && <Notice message={actionError} />}

            {currentPage === "Overview" && (
              <>
              <div className="mb-6">
                <h2 className="text-xl font-bold tracking-tight text-[#202631]">Bonjour, {user.name} !</h2>
                <p className="mt-1 text-xs text-[#858C98]">
                  Suivez votre travail, prenez les tâches disponibles et consultez vos projets.
                </p>
              </div>
                <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-4 xl:grid-cols-4">
                  {[
                    { label: "Mes tâches actives", value: activeTasks.length, icon: ListTodo, color: "bg-blue-50 text-[#1556E8]" },
                    { label: "En cours", value: activeTasks.filter((task) => task.statut === "En cours").length, icon: Play, color: "bg-amber-50 text-amber-600" },
                    { label: "Disponibles", value: taskStatusCounts.find((item) => item.status === "Disponible")?.count ?? 0, icon: Clock3, color: "bg-emerald-50 text-emerald-600" },
                    { label: "Projets", value: projects.length, icon: FolderKanban, color: "bg-purple-50 text-purple-600" },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className={`rounded-xl border ${color} border-[#E9EDF4] p-4 shadow-[0_3px_14px_rgba(30,50,90,0.025)]`}>
                      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${color}`}><Icon size={19} /></div>
                      <p className="text-xs font-medium text-[#858C98]">{label}</p>
                      <p className="mt-1 text-[27px] font-bold leading-tight text-[#202631]">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mb-5 rounded-xl border border-[#E9EDF4] bg-white p-5">
                  <h3 className="mb-4 text-sm font-bold text-[#202631]">État des tâches de mes projets</h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {taskStatusCounts.map(({ status, count }) => (
                      <button key={status} type="button" onClick={() => { setTaskStatusFilter(status); setCurrentPage("Todo List"); }} className="flex items-center justify-between rounded-lg bg-[#FAFBFD] p-3 text-left text-xs text-[#536071] hover:bg-[#F0F4FC]">
                        {status}<strong className="text-sm text-[#202631]">{count}</strong>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#202631]">Mes tâches actives</h3>
                  <button type="button" onClick={() => setCurrentPage("Todo List")} className="text-[11px] font-semibold text-[#1556E8] hover:underline">Voir toutes</button>
                </div>
                {loading ? <Loading /> : <TaskGrid tasks={activeTasks} userId={user.id} now={now} busyTaskId={busyTaskId} onTake={take} onStart={start} onCreateBranch={createBranch} />}
              </>
            )}

            {currentPage === "Todo List" && (
              <section className="rounded-xl  bg-white shadow-[0_3px_14px_rgba(30,50,90,0.025)]">
                <div className="flex flex-wrap items-center justify-between gap-3  pb-2 mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-[#202631]">Mes tâches et tâches disponibles</h3>
                    <p className="mt-1 text-[10px] text-[#858C98]">Limite de 3 tâches actives. Une tâche non assignée peut être prise après 3 jours.</p>
                  </div>
                  <span className={`rounded-full px-3 py-1.5 text-[10px] font-semibold ${activeTasks.length >= 3 ? "bg-red-50 text-red-600" : "bg-[#EAF0FF] text-[#1556E8]"}`}>
                    {activeTasks.length} / 3 actives
                  </span>
                </div>
                <TaskStatusPagination tasks={visibleTasks} selectedStatus={taskStatusFilter} onSelect={setTaskStatusFilter} />
                {loading ? <Loading /> : visibleTasks.filter((task) => taskStatusFilter === "Tous" || task.statut === taskStatusFilter).length > 0 ? (
                  <TaskGrid tasks={visibleTasks.filter((task) => taskStatusFilter === "Tous" || task.statut === taskStatusFilter)} userId={user.id} now={now} activeTaskCount={activeTasks.length} busyTaskId={busyTaskId} onTake={take} onStart={start} onCreateBranch={createBranch} />
                ) : (
                  <p className="p-8 text-center text-sm text-[#858C98]">
                    {taskStatusFilter === "Tous" ? "Aucune tâche à afficher." : `Aucune tâche au statut « ${taskStatusFilter} ».`}
                  </p>
                )}
              </section>
            )}

            {currentPage === "Projects" && (
              selectedProject ? (
                <div>
                  <button type="button" onClick={() => setSelectedProject(null)} className="mb-4 flex items-center gap-2 text-xs font-semibold text-[#536071] hover:text-[#1556E8]">
                    <ArrowLeft size={15} /> Retour aux projets
                  </button>
                  <section className="mb-5 rounded-xl border border-[#E9EDF4] bg-white p-5 shadow-[0_3px_14px_rgba(30,50,90,0.025)]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-bold text-[#202631]">{selectedProject.nom}</h2>
                        <p className="mt-2 max-w-2xl whitespace-pre-wrap text-xs leading-5 text-[#858C98]">{selectedProject.description || "Aucune description."}</p>
                      </div>
                      <span className="flex items-center gap-2 rounded-lg bg-[#EAF0FF] px-3 py-2 text-xs font-semibold text-[#1556E8]">
                        <Users size={15} /> {selectedProject.users_count ?? projectMembers.length} membre(s)
                      </span>
                    </div>
                    <p className="mt-3 text-[11px] text-[#536071]">
                      Lead développeur : <strong className="font-semibold text-[#1556E8]">{selectedProject.lead_developpeur?.name ?? "Non renseigné"}</strong>
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-[#EEF0F4] pt-4">
                      {projectMembers.map((member) => (
                        <span key={member.id} className={`rounded-full px-3 py-1.5 text-[10px] ${member.id === selectedProject.lead_developpeur_id ? "bg-[#EAF0FF] font-semibold text-[#1556E8]" : "bg-[#F4F6FA] text-[#536071]"}`}>
                          {member.name}{member.id === selectedProject.lead_developpeur_id ? " — Lead Dev" : ""}
                        </span>
                      ))}
                    </div>
                  </section>
                  <h3 className="mb-3 text-sm font-bold text-[#202631]">Tâches du projet</h3>
                  {projectLoading ? <Loading /> : <TaskGrid tasks={projectTasks} userId={user.id} now={now} activeTaskCount={activeTasks.length} busyTaskId={busyTaskId} onTake={take} onStart={start} onCreateBranch={createBranch} />}
                </div>
              ) : (
                <div>
                  <div className="mb-5">
                    <h2 className="text-xl font-bold tracking-tight text-[#202631]">Mes projets</h2>
                    <p className="mt-1 text-xs text-[#858C98]">Projets auxquels vous participez.</p>
                  </div>
                  {loading ? <Loading /> : projects.length ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {projects.map((project, index) => {
                        const relatedTasks = tasks.filter((task) => task.projet_id === project.id);
                        const completed = relatedTasks.filter((task) => task.statut === "Terminé").length;
                        const progress = relatedTasks.length ? Math.round((completed / relatedTasks.length) * 100) : 0;
                        return (
                          <button key={project.id} type="button" onClick={() => void openProject(project)} className="rounded-xl border border-[#E9EDF4] bg-white p-5 text-left shadow-[0_3px_14px_rgba(30,50,90,0.025)] transition hover:-translate-y-0.5 hover:border-[#C8D7F5] hover:shadow-md">
                            <div className="mb-4 flex items-start justify-between gap-3">
                              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${cardColors[index % cardColors.length]}`}><FolderKanban size={19} className="text-[#354052]" /></div>
                              <span className="rounded-full bg-[#F4F6FA] px-2.5 py-1 text-[10px] font-semibold text-[#536071]">{relatedTasks.length} tâche(s)</span>
                            </div>
                            <h3 className="truncate text-sm font-bold text-[#202631]">{project.nom}</h3>
                            <p className="mt-2 line-clamp-2 min-h-9 text-[11px] leading-[17px] text-[#858C98]">{project.description || "Aucune description pour ce projet."}</p>
                            <div className="mt-4 flex items-center justify-between text-[10px] text-[#858C98]">
                              <span className="flex items-center gap-1.5"><Users size={13} />{project.users_count ?? (project.lead_developpeur ? 1 : 0)} membre(s)</span>
                              <span>{progress}% terminé</span>
                            </div>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EEF0F4]"><div className="h-full rounded-full bg-[#1556E8]" style={{ width: `${progress}%` }} /></div>
                            <p className="mt-3 truncate text-[10px] text-[#9AA3B0]">
                              Lead développeur : {project.lead_developpeur?.name ?? "Non renseigné"}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  ) : <EmptyState message="Vous ne participez actuellement à aucun projet." />}
                </div>
              )
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function TaskGrid({
  tasks,
  userId,
  now,
  activeTaskCount = 0,
  busyTaskId,
  onTake,
  onStart,
  onCreateBranch,
}: {
  tasks: Task[];
  userId: number;
  now: number;
  activeTaskCount?: number;
  busyTaskId: number | null;
  onTake: (task: Task) => void;
  onStart: (task: Task) => void;
  onCreateBranch: (task: Task) => void;
}) {
  if (!tasks.length) return <EmptyState message="Aucune tâche à afficher." />;
  return (
    <div className="grid grid-cols-1 gap-4  sm:grid-cols-2 pt-4 lg:grid-cols-3">
      {tasks.map((task, index) => {
        const isAssignedToMe = Number(task.user_id) === Number(userId);
        const isAvailable = task.user_id === null && task.statut === "Disponible";
        const canTake = isAvailable && activeTaskCount < 3 && isOldEnoughToTake(task, now);
        const busy = busyTaskId === task.id;
        return (
          <article key={task.id} className={`rounded-[14px] border border-[#E9EDF4] p-4 shadow-[0_3px_14px_rgba(30,50,90,0.025)] ${cardColors[index % cardColors.length]}`}>
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="min-w-0 truncate text-[12px] font-semibold text-[#202631]">{task.nom}</h3>
              <span className="shrink-0 rounded-full bg-white/75 px-2 py-1 text-[9px] font-semibold text-[#354052]">{task.statut}</span>
            </div>
            <p className=" line-clamp-2 min-h-[36px] text-[11px] leading-[17px] text-[#59616D]">{task.description || "Aucune description."}</p>
            <div className="space-y-1 mt-2 text-[10px] text-[#536071]">
              <p className="truncate font-bold">{task.projet?.nom ?? "Projet"}</p>
              {/* <p className="truncate">{task.user?.name ? `Assignée à ${task.user.name}` : "Non assignée"}</p> */}
              <p>{formatDate(task.date_debut)} - {formatDate(task.date_fin)}</p>
              {/* <p>Échéance :</p> */}
            </div>
            {isAvailable && (
              <p className="mt-2 text-[10px] font-medium text-[#7A8492]">
                {activeTaskCount >= 3 ? "Limite de 3 tâches actives atteinte" : timeUntilAvailable(task, now)}
              </p>
            )}
            {task.github_branch && (
              <a href={task.github_branch_url ?? "#"} target="_blank" rel="noreferrer" className="mt-3 flex items-center gap-1.5 truncate text-[10px] font-semibold text-[#1556E8] hover:underline">
                <GitBranch size={13} /> {task.github_branch} <ExternalLink size={11} />
              </a>
            )}
            <div className=" flex justify-between flex-wrap gap-2 pt-4">
              {isAvailable && (
                <button type="button" disabled={!canTake || busy} onClick={() => onTake(task)} className="w-[calc(50%-0.5rem)] justify-center text-center rounded-md bg-[#1556E8] px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                  {busy ? "..." : "Prendre la tâche"}
                </button>
              )}
              {isAssignedToMe && task.statut === "Attribuée" && (
                <button type="button" disabled={busy} onClick={() => onStart(task)} className="w-[calc(50%-0.5rem)] justify-center text-center flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                  <Play size={11} /> {busy ? "..." : "Commencer"}
                </button>
              )}
              {isAssignedToMe && ["Attribuée", "En cours"].includes(task.statut) && !task.github_branch && (
                <button type="button" disabled={busy} onClick={() => onCreateBranch(task)} className="w-[calc(50%-0.5rem)] justify-center text-center flex items-center gap-1.5 rounded-md border border-[#D8DEE8] bg-white/70 px-3 py-1.5 text-[10px] font-semibold text-[#354052] hover:bg-white disabled:opacity-50">
                  <GitBranch size={12} /> Créer branche
                </button>
              )}
              {isAssignedToMe && ["Attribuée", "En cours"].includes(task.statut) && task.github_branch && (
                <a href={task.github_branch_url ?? "#"} target="_blank" rel="noreferrer" className="w-[calc(50%-0.5rem)] justify-center text-center flex items-center gap-1.5 rounded-md border border-[#D8DEE8] bg-white/70 px-3 py-1.5 text-[10px] font-semibold text-[#354052] hover:bg-white">
                  <GitBranch size={12} /> Ouvrir branche <ExternalLink size={11} />
                </a>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function Notice({ message }: { message: string }) {
  return <div role="alert" className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 text-xs text-red-700">{message}</div>;
}

function Loading() {
  return <div className="p-8 text-center text-sm text-[#858C98]">Chargement...</div>;
}

function EmptyState({ message }: { message: string }) {
  return <div className="rounded-xl border border-[#E9EDF4] bg-white p-8 text-center text-sm text-[#858C98]">{message}</div>;
}
