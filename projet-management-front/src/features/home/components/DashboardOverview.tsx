
import {
  ListTodo,
  CheckCircle2,
  Clock3,
  CalendarDays,
  ArrowRight,
  FolderKanban,
} from "lucide-react";
import type { User } from "../../auth/interfaces/user";
import type { Project } from "../interfaces/Project";
import type { Task } from "../interfaces/Task";

type DashboardOverviewProps = {
  tasks: Task[];
  projects: Project[];
  user: User | null;
  loading: boolean;
  error: string | null;
  onNavigate: (page: string) => void;
};

const formatDate = (date: string | null | undefined) => {
  if (!date) return "—";
  const parsedDate = new Date(`${date.slice(0, 10)}T00:00:00`);
  return Number.isNaN(parsedDate.getTime())
    ? "—"
    : new Intl.DateTimeFormat("fr-FR").format(parsedDate);
};

export default function DashboardOverview({
  tasks,
  projects,
  user,
  loading,
  error,
  onNavigate,
}: DashboardOverviewProps) {
  const completedTasks = tasks.filter((task) => task.statut === "Terminé").length;
  const inProgressTasks = tasks.filter((task) => task.statut === "En cours").length;
  const assignedTasks = tasks.filter((task) => task.statut === "Attribuée").length;
  const availableTasks = tasks.filter((task) => task.statut === "Disponible").length;
  const completionRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const taskStatuses = [
    { label: "Créées / disponibles", value: availableTasks, color: "bg-[#BFD1F8]" },
    { label: "Attribuées", value: assignedTasks, color: "bg-purple-400" },
    { label: "En cours", value: inProgressTasks, color: "bg-amber-400" },
    { label: "Terminées", value: completedTasks, color: "bg-[#1556E8]" },
  ];
  const maxStatusCount = Math.max(1, ...taskStatuses.map((status) => status.value));
  const recentTasks = [...tasks]
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))
    .slice(0, 5);
  const projectProgress = projects.slice(0, 4).map((project, index) => {
    const projectTasks = tasks.filter((task) => task.projet_id === project.id);
    const doneCount = projectTasks.filter((task) => task.statut === "Terminé").length;
    return {
      id: project.id,
      name: project.nom,
      leadDeveloper: project.lead_developpeur?.name ?? "Non renseigné",
      memberCount: project.users_count ?? 0,
      progress: projectTasks.length ? Math.round((doneCount / projectTasks.length) * 100) : 0,
      color: ["bg-[#1556E8]", "bg-purple-500", "bg-amber-500", "bg-emerald-500"][index % 4],
    };
  });
  const statCards = [
    { title: "Total des tâches", value: tasks.length, description: "Tous les projets", icon: ListTodo, iconBg: "bg-blue-50", iconColor: "text-[#1556E8]" },
    { title: "Tâches terminées", value: completedTasks, description: "Statut terminé", icon: CheckCircle2, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { title: "En cours", value: inProgressTasks, description: "Statut en cours", icon: Clock3, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
    { title: "Projets", value: projects.length, description: `${assignedTasks} tâche(s) attribuée(s)`, icon: CalendarDays, iconBg: "bg-purple-50", iconColor: "text-purple-600" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">

      {/* Welcome header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#202631] sm:text-2xl">
            Bonjour, {user?.name ?? "Manager"} !
          </h2>
          <p className="mt-1 text-xs text-[#858C98]">
            Vue d’ensemble de vos projets et de l’activité de l’équipe.
          </p>
        </div>

        <div className="flex h-9 items-center gap-2 rounded-lg border border-[#E8E9ED] bg-white px-3 text-xs font-medium text-[#536071] shadow-sm">
          <CalendarDays size={14} className="text-[#1556E8]" />
          {new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(new Date())}
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      )}
      {loading && (
        <div className="mb-4 rounded-lg border border-[#E9EDF4] bg-white p-3 text-xs text-[#858C98]">
          Chargement des données du tableau de bord...
        </div>
      )}

      {/* Statistics cards */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-4 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              // style={{ backgroundColor: stat.iconColor }}
              className={`${stat.iconBg} group rounded-xl p-4 shadow-[0_3px_14px_rgba(30,50,90,0.025)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(30,50,90,0.06)]`}
            >
              <div className={`mb-4 flex items-center justify-between `}>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.iconBg} ${stat.iconColor}`}>
                  <Icon size={19} strokeWidth={1.8} />
                </div>
              </div>

              <p className="text-xs font-medium text-[#858C98]">
                {stat.title}
              </p>

              <div className="mt-1 flex items-center justify-between gap-2">
                <h3 className="text-[27px] font-bold leading-tight text-[#202631]">
                  {stat.value}
                </h3>
              </div>

              <p className="mt-2 text-[10px] text-[#A0A7B2]">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Activity and progress */}
      <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-3">

        {/* Task status */}
        <div className="rounded-xl border border-[#E9EDF4] bg-white p-5 shadow-[0_3px_14px_rgba(30,50,90,0.025)] xl:col-span-2">

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#202631]">
                Répartition des tâches
              </h3>
              <p className="mt-1 text-[11px] text-[#9AA3B0]">
                État actuel des tâches de tous les projets
              </p>
            </div>

            <span className="text-[10px] text-[#9AA3B0]">{tasks.length} tâche(s)</span>
          </div>

          <div className="space-y-4 pt-3">
            {taskStatuses.map((status) => (
              <div key={status.label}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[10px] text-[#858C98]">
                    <span className={`h-2 w-2 rounded-full ${status.color}`} />
                    {status.label}
                  </span>
                  <span className="text-[10px] font-semibold text-[#354052]">{status.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#EEF0F4]">
                  <div
                    className={`h-full rounded-full transition-all ${status.color}`}
                    style={{ width: `${(status.value / maxStatusCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task completion */}
        <div className="rounded-xl border border-[#E9EDF4] bg-white p-5 shadow-[0_3px_14px_rgba(30,50,90,0.025)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#202631]">
                Taux d’achèvement
              </h3>
              <p className="mt-1 text-[11px] text-[#9AA3B0]">
                Part des tâches terminées
              </p>
            </div>

            <CheckCircle2 size={18} className="text-[#AAB1BC]" />
          </div>

          <div className="my-6 flex justify-center">
            <div
              className="relative flex h-36 w-36 items-center justify-center rounded-full"
              style={{
                background:
                  `conic-gradient(#1556E8 0% ${completionRate}%, #EEF0F4 ${completionRate}% 100%)`,
              }}
            >
              <div className="flex h-[112px] w-[112px] flex-col items-center justify-center rounded-full bg-white">
                <span className="text-[27px] font-bold text-[#202631]">
                  {completionRate}%
                </span>
                <span className="text-[10px] text-[#9AA3B0]">
                  Terminées
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2 text-[11px] text-[#536071]">
                  <span className="h-2 w-2 rounded-full bg-[#1556E8]" />
                  Terminées
                </span>
                <span className="text-xs font-semibold text-[#202631]">
                  {completedTasks}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#EEF0F4]">
                <div className="h-full rounded-full bg-[#1556E8]" style={{ width: `${completionRate}%` }} />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2 text-[11px] text-[#536071]">
                  <span className="h-2 w-2 rounded-full bg-[#BFD1F8]" />
                  Restantes
                </span>
                <span className="text-xs font-semibold text-[#202631]">
                  {tasks.length - completedTasks}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#EEF0F4]">
                <div className="h-full rounded-full bg-[#BFD1F8]" style={{ width: `${100 - completionRate}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent tasks and project progress */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">

        {/* Recent tasks */}
        <div className="rounded-xl border border-[#E9EDF4] bg-white p-5 shadow-[0_3px_14px_rgba(30,50,90,0.025)] xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#202631]">
                Tâches récentes
              </h3>
              <p className="mt-1 text-[11px] text-[#9AA3B0]">
                Les dernières tâches enregistrées
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate("Todo List")}
              className="flex items-center gap-1 text-[10px] font-semibold text-[#1556E8] hover:underline"
            >
              Voir tout <ArrowRight size={12} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left">
              <thead>
                <tr className="border-b border-[#EEF0F4] text-[9px] uppercase tracking-wider text-[#9AA3B0]">
                  <th className="pb-3 font-medium">Tâche</th>
                  <th className="pb-3 font-medium">Projet / assigné</th>
                  <th className="pb-3 font-medium">Échéance</th>
                  <th className="pb-3 font-medium">Statut</th>
                </tr>
              </thead>

              <tbody>
                {recentTasks.map((task) => {
                  const statusStyle = task.statut === "Terminé"
                    ? "bg-emerald-50 text-emerald-700"
                    : task.statut === "En cours"
                      ? "bg-blue-50 text-blue-700"
                      : task.statut === "Attribuée"
                        ? "bg-purple-50 text-purple-700"
                        : "bg-amber-50 text-amber-700";
                  return (
                  <tr
                    key={task.id}
                    className="border-b border-[#F3F4F6] last:border-0 transition hover:bg-[#FAFBFD]"
                  >
                    <td className="py-3.5 pr-3">
                      <span className="text-[11px] font-semibold text-[#354052]">
                        {task.nom}
                      </span>
                    </td>

                    <td className="py-3.5 text-[10px] text-[#858C98]">
                      {task.projet?.nom ?? task.user?.name ?? "—"}
                    </td>

                    <td className="py-3.5 text-[10px] text-[#858C98]">
                      {formatDate(task.date_fin)}
                    </td>

                    <td className="py-3.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[9px] font-medium ${statusStyle}`}>
                        {task.statut}
                      </span>
                    </td>
                  </tr>
                  );
                })}
                {!recentTasks.length && !loading && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-xs text-[#9AA3B0]">
                      Aucune tâche enregistrée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Project progress */}
        <div className="rounded-xl border border-[#E9EDF4] bg-white p-5 shadow-[0_3px_14px_rgba(30,50,90,0.025)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#202631]">
                Avancement des projets
              </h3>
              <p className="mt-1 text-[11px] text-[#9AA3B0]">
                Pourcentage de tâches terminées
              </p>
            </div>

            <FolderKanban size={18} className="text-[#AAB1BC]" />
          </div>

          <div className="space-y-6">
            {projectProgress.map((project) => (
              <div key={project.id}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-[#536071]">
                    {project.name}
                  </span>
                  <span className="text-[10px] font-semibold text-[#202631]">
                    {project.progress}%
                  </span>
                </div>
                <p className="mb-2 truncate text-[9px] text-[#9AA3B0]">
                  Lead développeur : {project.leadDeveloper} · {project.memberCount} membre(s)
                </p>

                <div className="h-1.5 overflow-hidden rounded-full bg-[#EEF0F4]">
                  <div
                    className={`h-full rounded-full ${project.color}`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {!projectProgress.length && !loading && (
            <p className="py-5 text-center text-xs text-[#9AA3B0]">Aucun projet enregistré.</p>
          )}

          <button
            type="button"
            onClick={() => onNavigate("Projects")}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg border border-[#E8E9ED] py-2.5 text-[10px] font-semibold text-[#536071] transition hover:border-[#1556E8] hover:text-[#1556E8]"
          >
            Voir les projets
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
