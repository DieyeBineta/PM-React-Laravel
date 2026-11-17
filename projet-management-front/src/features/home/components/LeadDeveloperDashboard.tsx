import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, Bell, CalendarDays, CheckCircle2, Clock3, Eye, FolderKanban, ListTodo, LoaderCircle, Pencil, Plus, Search, Trash2, Users, X } from "lucide-react";
import type { User } from "../../auth/interfaces/user";
import { getApiErrorMessage } from "../../../utils/tools";
import Sidebar from "./Sidebar";
import TaskStatusPagination from "./TaskStatusPagination";
import { getProject, getProjects } from "../services/projectService";
import { createTask, deleteTask, getTasks, updateTask, type TaskPayload } from "../services/taskService";
import { getUsers } from "../../users/services/userService";
import type { Project } from "../interfaces/Project";
import type { Task, TaskStatus } from "../interfaces/Task";

type Props = {
  user: User;
  onLogout: () => void;
};

const taskStatuses: TaskStatus[] = ["En cours", "Disponible", "Attribuée", "Terminé"];
const cardColors = ["bg-[#D4E8FF]", "bg-[#DDD3FA]", "bg-[#FFF0D3]", "bg-[#F8D4ED]", "bg-[#BDF7D9]"];

const formatDate = (date: string | null | undefined) => {
  if (!date) return "Non définie";
  const [year, month, day] = date.slice(0, 10).split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR").format(new Date(year, month - 1, day));
};

const emptyForm = (projectId = "") => ({
  nom: "",
  description: "",
  date_debut: "",
  date_fin: "",
  projet_id: projectId,
  user_id: "",
});

export default function LeadDeveloperDashboard({ user, onLogout }: Props) {
  const [currentPage, setCurrentPage] = useState("Todo List");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectDetailsLoading, setProjectDetailsLoading] = useState(false);
  const [projectDetailsError, setProjectDetailsError] = useState<string | null>(null);
  const [developers, setDevelopers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "Tous">("En cours");
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadDashboard = async () => {
      setLoading(true);
      setLoadError(null);
      const [taskResult, projectResult, developerResult] = await Promise.allSettled([
        getTasks(),
        getProjects(),
        getUsers(),
      ]);
      if (cancelled) return;

      const errors: string[] = [];
      if (taskResult.status === "fulfilled") setTasks(taskResult.value.data);
      else errors.push(getApiErrorMessage(taskResult.reason));
      if (projectResult.status === "fulfilled") setProjects(projectResult.value.data);
      else errors.push(getApiErrorMessage(projectResult.reason));
      if (developerResult.status === "fulfilled") setDevelopers(developerResult.value.data);
      else errors.push(getApiErrorMessage(developerResult.reason));
      if (errors.length) setLoadError(errors.join(" "));
      setLoading(false);
    };
    void loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesStatus = statusFilter === "Tous" || task.statut === statusFilter;
      const content = `${task.nom} ${task.description ?? ""} ${task.projet?.nom ?? ""} ${task.user?.name ?? ""}`.toLowerCase();
      return matchesStatus && content.includes(query);
    });
  }, [tasks, statusFilter, search]);

  const openCreateForm = () => {
    setEditingTask(null);
    setForm(emptyForm(projects[0] ? String(projects[0].id) : ""));
    setFormError(null);
    setActionError(null);
    setShowForm(true);
  };

  const openEditForm = (task: Task) => {
    setEditingTask(task);
    setForm({
      nom: task.nom,
      description: task.description ?? "",
      date_debut: task.date_debut?.slice(0, 10) ?? "",
      date_fin: task.date_fin?.slice(0, 10) ?? "",
      projet_id: String(task.projet_id),
      user_id: task.user_id === null ? "" : String(task.user_id),
    });
    setFormError(null);
    setActionError(null);
    setShowForm(true);
  };

  const submitTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    if (!form.projet_id) {
      setFormError("Sélectionnez un projet.");
      return;
    }

    setSaving(true);
    const payload: TaskPayload = {
      nom: form.nom.trim(),
      description: form.description.trim(),
      date_debut: form.date_debut,
      date_fin: form.date_fin,
      projet_id: Number(form.projet_id),
      user_id: form.user_id ? Number(form.user_id) : null,
    };
    try {
      const response = editingTask
        ? await updateTask(editingTask.id, payload)
        : await createTask(payload);
      setTasks((current) => editingTask
        ? current.map((task) => task.id === response.data.id ? response.data : task)
        : [response.data, ...current]);
      setShowForm(false);
      setEditingTask(null);
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const removeTask = async (task: Task) => {
    if (!window.confirm(`Supprimer la tâche « ${task.nom} » ?`)) return;
    setDeletingTaskId(task.id);
    setActionError(null);
    try {
      await deleteTask(task.id);
      setTasks((current) => current.filter((item) => item.id !== task.id));
      setSelectedTask((current) => current?.id === task.id ? null : current);
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    } finally {
      setDeletingTaskId(null);
    }
  };

  const statusCounts = taskStatuses.map((status) => ({
    status,
    count: tasks.filter((task) => task.statut === status).length,
  }));
  const completedCount = statusCounts.find(({ status }) => status === "Terminé")?.count ?? 0;
  const eligibleDevelopers = developers.filter((developer) =>
    developer.projets?.some((project) => project.id === Number(form.projet_id))
  );
  const getProjectTasks = (projectId: number) =>
    tasks.filter((task) => task.projet_id === projectId);
  const getProjectPeriod = (projectId: number) => {
    const projectTasks = getProjectTasks(projectId);
    const startDates = projectTasks
      .map((task) => task.date_debut)
      .filter((date): date is string => Boolean(date))
      .sort();
    const endDates = projectTasks
      .map((task) => task.date_fin)
      .filter((date): date is string => Boolean(date))
      .sort();
    return `${formatDate(startDates[0])} – ${formatDate(endDates[endDates.length - 1])}`;
  };
  const openProjectDetails = async (project: Project) => {
    setSelectedProject(project);
    setProjectDetailsError(null);
    setProjectDetailsLoading(true);
    try {
      const response = await getProject(project.id);
      setSelectedProject(response.data);
    } catch (error) {
      setProjectDetailsError(getApiErrorMessage(error));
    } finally {
      setProjectDetailsLoading(false);
    }
  };

  return (
    <main className="bg-[#F0F3FA]">
      <div className="flex h-[calc(100vh-0.1rem)] min-h-[620px] w-full overflow-hidden rounded-xl bg-white shadow-[0_5px_35px_rgba(30,50,90,0.04)] max-md:h-[95vh]">
        <Sidebar
          user={user}
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onLogout={onLogout}
          tasks={tasks.map((task) => ({ id: task.id, title: task.nom, completed: task.statut === "Terminé" }))}
        />
        <section className="flex min-w-0 flex-1 flex-col bg-white">
          <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-[#EEF0F4] px-5">
            <h1 className="text-[18px] font-bold tracking-tight text-[#111827]">
              {currentPage === "Overview" ? "Tableau de bord" : currentPage}
            </h1>
            <div className="flex items-center gap-5">
              <Bell size={17} className="text-[#354052]" />
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F8E7C9] text-lg">👨🏻</div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 ">
            <div className=" flex flex-wrap items-center justify-between gap-3">
              {currentPage === "Todo List" && (
                <div className="flex items-center w-full pb-8 justify-between gap-3 sm:gap-4">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-[#202631]">
                      Panneau des tâches
                    </h2>
                    <p className="mt-1 text-xs text-[#858C98]">
                      Suivez l'avancement des tâches de vos projets et gérez-les efficacement.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={!projects.length}
                    onClick={openCreateForm}
                    className="flex h-9 items-center gap-2 rounded-lg bg-[#1556E8] px-3 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus size={15} /> Créer une tâche
                  </button>
                </div>
              )}
            </div>

            {loadError && (
              <div role="alert" className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 text-xs text-red-700">
                {loadError}
              </div>
            )}
            {actionError && (
              <div role="alert" className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 text-xs text-red-700">
                {actionError}
              </div>
            )}

            {currentPage === "Overview" ? (
              <>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-[#202631]">
                    Bonjour, {user.name} !
                  </h2>
                  <p className="mt-1 text-xs text-[#858C98]">
                    Gérez les tâches de vos projets et suivez leur avancement.
                  </p>
                </div>

                <div className="my-5 grid grid-cols-1 gap-3 sm:grid-cols-4 xl:grid-cols-4">
                  {[
                    { label: "Total des tâches", value: tasks.length, icon: ListTodo, color: "bg-blue-50 text-[#1556E8]" },
                    { label: "En cours", value: statusCounts.find((item) => item.status === "En cours")?.count ?? 0, icon: Clock3, color: "bg-amber-50 text-amber-600" },
                    { label: "Terminées", value: completedCount, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
                    { label: "Projets", value: projects.length, icon: CalendarDays, color: "bg-purple-50 text-purple-600" },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className={`rounded-xl ${color} p-4 shadow-[0_3px_14px_rgba(30,50,90,0.025)]`}>
                      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
                        <Icon size={19} />
                      </div>
                      <p className="text-xs font-medium text-[#858C98]">{label}</p>
                      <p className="mt-1 text-[27px] font-bold leading-tight text-[#202631]">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mb-5 rounded-xl border border-[#E9EDF4] bg-white p-5">
                  <h3 className="mb-4 text-sm font-bold text-[#202631]">État des tâches</h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {statusCounts.map(({ status, count }) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => { setStatusFilter(status); setCurrentPage("Todo List"); }}
                        className="flex items-center justify-between rounded-lg bg-[#FAFBFD] p-3 text-left text-xs text-[#536071] hover:bg-[#F0F4FC]"
                      >
                        {status}<strong className="text-sm text-[#202631]">{count}</strong>
                      </button>
                    ))}
                  </div>
                </div>
                <h3 className="mb-3 text-sm font-bold text-[#202631]">Tâches récentes</h3>
                <TaskGrid tasks={[...tasks].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? "")).slice(0, 4)} onDetails={setSelectedTask} onEdit={openEditForm} onDelete={removeTask} deletingTaskId={deletingTaskId} />
              </>
            ) : currentPage === "Projects" ? (
              selectedProject ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setSelectedProject(null)}
                    className="mb-4 flex items-center gap-2 text-xs font-semibold text-[#536071] transition hover:text-[#1556E8]"
                  >
                    <ArrowLeft size={15} /> Retour aux projets
                  </button>
                  <div className="mb-5 rounded-xl border border-[#E9EDF4] bg-white p-5 shadow-[0_3px_14px_rgba(30,50,90,0.025)]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-bold text-[#202631]">{selectedProject.nom}</h2>
                        <p className="mt-2 max-w-2xl whitespace-pre-wrap text-xs leading-5 text-[#858C98]">
                          {selectedProject.description || "Aucune description pour ce projet."}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-[#EAF0FF] px-3 py-2 text-xs font-semibold text-[#1556E8]">
                        <Users size={15} />
                        {selectedProject.users_count ?? selectedProject.users?.length ?? 0} membre(s)
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-[#EEF0F4] pt-4 text-[11px] text-[#858C98]">
                      <span>Lead développeur : <strong className="font-semibold text-[#354052]">{selectedProject.lead_developpeur?.name ?? user.name}</strong></span>
                      <span>Période : <strong className="font-semibold text-[#354052]">{getProjectPeriod(selectedProject.id)}</strong></span>
                      <span>Tâches : <strong className="font-semibold text-[#354052]">{getProjectTasks(selectedProject.id).length}</strong></span>
                    </div>
                    {selectedProject.users?.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {selectedProject.users.map((member) => (
                          <span key={member.id} className={`rounded-full px-3 py-1.5 text-[10px] ${member.id === selectedProject.lead_developpeur_id ? "bg-[#EAF0FF] font-semibold text-[#1556E8]" : "bg-[#F4F6FA] text-[#536071]"}`}>
                            {member.name}{member.id === selectedProject.lead_developpeur_id ? " — Lead Dev" : ""}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  {projectDetailsError && (
                    <div role="alert" className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 text-xs text-red-700">{projectDetailsError}</div>
                  )}
                  {projectDetailsLoading ? (
                    <div className="p-8 text-center text-sm text-[#858C98]">Chargement des détails...</div>
                  ) : getProjectTasks(selectedProject.id).length ? (
                    <>
                      <h3 className="mb-3 text-sm font-bold text-[#202631]">Tâches du projet</h3>
                      <TaskGrid tasks={getProjectTasks(selectedProject.id)} onDetails={setSelectedTask} onEdit={openEditForm} onDelete={removeTask} deletingTaskId={deletingTaskId} />
                    </>
                  ) : (
                    <div className="rounded-xl border border-[#E9EDF4] bg-white p-8 text-center text-sm text-[#858C98]">Aucune tâche dans ce projet.</div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="mb-5">
                    <h2 className="text-xl font-bold tracking-tight text-[#202631]">Mes projets</h2>
                    <p className="mt-1 text-xs text-[#858C98]">Projets dont vous êtes le lead développeur.</p>
                  </div>
                  {loading ? (
                    <div className="p-8 text-center text-sm text-[#858C98]">Chargement des projets...</div>
                  ) : projects.length ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {projects.map((project, index) => {
                        const relatedTasks = getProjectTasks(project.id);
                        const progress = relatedTasks.length
                          ? Math.round((relatedTasks.filter((task) => task.statut === "Terminé").length / relatedTasks.length) * 100)
                          : 0;
                        const members = new Set([
                          ...(project.lead_developpeur ? [project.lead_developpeur.id] : []),
                          ...relatedTasks.flatMap((task) => task.user ? [task.user.id] : []),
                        ]);
                        return (
                          <button
                            key={project.id}
                            type="button"
                            onClick={() => void openProjectDetails(project)}
                            className="rounded-xl border border-[#E9EDF4] p-5 text-left shadow-[0_3px_14px_rgba(30,50,90,0.025)] transition hover:-translate-y-0.5 hover:border-[#C8D7F5] hover:shadow-md"
                          >
                            <div className="mb-4 flex items-start justify-between gap-3">
                              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${cardColors[index % cardColors.length]}`}>
                                <FolderKanban size={19} className="text-[#354052]" />
                              </div>
                              <span className="rounded-full bg-[#F4F6FA] px-2.5 py-1 text-[10px] font-semibold text-[#536071]">
                                {relatedTasks.length} tâche(s)
                              </span>
                            </div>
                            <h3 className="truncate text-sm font-bold text-[#202631]">{project.nom}</h3>
                            <p className="mt-2 line-clamp-2 min-h-9 text-[11px] leading-[17px] text-[#858C98]">
                              {project.description || "Aucune description pour ce projet."}
                            </p>
                            <div className="mt-4 flex items-center justify-between text-[10px] text-[#858C98]">
                              <span className="flex items-center gap-1.5"><Users size={13} />{project.users_count ?? members.size} membre(s)</span>
                              <span>{progress}% terminé</span>
                            </div>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EEF0F4]">
                              <div className="h-full rounded-full bg-[#1556E8]" style={{ width: `${progress}%` }} />
                            </div>
                            <p className="mt-3 truncate text-[10px] text-[#9AA3B0]">
                              Lead : {project.lead_developpeur?.name ?? user.name}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-[#E9EDF4] bg-white p-8 text-center text-sm text-[#858C98]">
                      Aucun projet ne vous est actuellement attribué comme lead développeur.
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="rounded-xl bg-white shadow-[0_3px_14px_rgba(30,50,90,0.025)]">
                <div className="flex flex-wrap items-center justify-between gap-3  pb-4">
                  <div className="flex h-[34px] w-full max-w-[260px] items-center gap-2 rounded-md border border-[#E8E9ED] px-2.5">
                    <Search size={15} className="shrink-0 text-[#858C98]" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Rechercher une tâche"
                      aria-label="Rechercher une tâche"
                      className="w-full min-w-0 bg-transparent text-[11px] text-[#343B48] outline-none placeholder:text-[#858C98]"
                    />
                  </div>
                </div>
                <TaskStatusPagination tasks={tasks} selectedStatus={statusFilter} onSelect={setStatusFilter} />
                {loading ? (
                  <div className="p-8 text-center text-sm text-[#858C98]">Chargement des tâches...</div>
                ) : filteredTasks.length ? (
                  <TaskGrid tasks={filteredTasks} onDetails={setSelectedTask} onEdit={openEditForm} onDelete={removeTask} deletingTaskId={deletingTaskId} />
                ) : (
                  <div className="p-10 text-center text-sm text-[#858C98]">
                    {tasks.length === 0
                      ? "Aucune tâche créée pour vos projets."
                      : statusFilter === "Tous" || tasks.some((task) => task.statut === statusFilter)
                        ? "Aucune tâche ne correspond à la recherche."
                        : `Aucune tâche au statut « ${statusFilter} ».`}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#202631]">{editingTask ? "Modifier la tâche" : "Créer une tâche"}</h2>
              <button type="button" onClick={() => setShowForm(false)} aria-label="Fermer" className="text-[#858C98] hover:text-[#202631]"><X size={20} /></button>
            </div>
            <form onSubmit={submitTask} className="space-y-4">
              <label className="block text-xs font-medium text-[#536071]">
                Nom de la tâche
                <input required maxLength={255} value={form.nom} onChange={(event) => setForm({ ...form, nom: event.target.value })} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
              </label>
              <label className="block text-xs font-medium text-[#536071]">
                Description
                <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} className="mt-1.5 w-full resize-y rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
              </label>
              <label className="block text-xs font-medium text-[#536071]">
                Projet
                <select required disabled={Boolean(editingTask)} value={form.projet_id} onChange={(event) => setForm({ ...form, projet_id: event.target.value })} className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500">
                  {projects.map((project) => <option key={project.id} value={project.id}>{project.nom}</option>)}
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-medium text-[#536071]">
                  Date de début
                  <input required type="date" value={form.date_debut} onChange={(event) => setForm({ ...form, date_debut: event.target.value })} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
                </label>
                <label className="block text-xs font-medium text-[#536071]">
                  Date de fin
                  <input required type="date" min={form.date_debut} value={form.date_fin} onChange={(event) => setForm({ ...form, date_fin: event.target.value })} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
                </label>
              </div>
              <label className="block text-xs font-medium text-[#536071]">
                Assigner à un développeur (facultatif)
                <select value={form.user_id} onChange={(event) => setForm({ ...form, user_id: event.target.value })} className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500">
                  <option value="">Aucun développeur — tâche disponible</option>
                  {editingTask?.user && !developers.some((developer) => developer.id === editingTask.user_id) && (
                    <option value={editingTask.user.id}>{editingTask.user.name} (actuellement assigné)</option>
                  )}
                  {eligibleDevelopers.map((developer) => <option key={developer.id} value={developer.id}>{developer.name}</option>)}
                </select>
                <span className="mt-1 block text-[10px] font-normal text-[#9AA3B0]">
                  Seuls les développeurs actifs membres de ce projet sont proposés. Maximum 3 tâches actives par développeur.
                </span>
              </label>
              {formError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{formError}</p>}
              <button disabled={saving} type="submit" className="w-full rounded-lg bg-[#1556E8] py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                {saving ? "Enregistrement..." : editingTask ? "Enregistrer les modifications" : "Créer la tâche"}
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedTask(null); }}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[#1556E8]">{selectedTask.projet?.nom ?? "Projet"}</p>
                <h2 className="text-lg font-bold text-[#202631]">{selectedTask.nom}</h2>
              </div>
              <button type="button" onClick={() => setSelectedTask(null)} aria-label="Fermer" className="text-[#858C98] hover:text-[#202631]"><X size={20} /></button>
            </div>
            <p className="mb-5 whitespace-pre-wrap text-sm leading-6 text-[#536071]">{selectedTask.description || "Aucune description."}</p>
            <dl className="grid grid-cols-2 gap-3 rounded-xl bg-[#FAFBFD] p-4 text-xs">
              <div><dt className="text-[#9AA3B0]">État</dt><dd className="mt-1 font-semibold text-[#354052]">{selectedTask.statut}</dd></div>
              <div><dt className="text-[#9AA3B0]">Assignée à</dt><dd className="mt-1 font-semibold text-[#354052]">{selectedTask.user?.name ?? "Non assignée"}</dd></div>
              <div><dt className="text-[#9AA3B0]">Date de début</dt><dd className="mt-1 font-semibold text-[#354052]">{formatDate(selectedTask.date_debut)}</dd></div>
              <div><dt className="text-[#9AA3B0]">Date de fin</dt><dd className="mt-1 font-semibold text-[#354052]">{formatDate(selectedTask.date_fin)}</dd></div>
            </dl>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => { setSelectedTask(null); openEditForm(selectedTask); }} className="rounded-lg border border-[#E8E9ED] px-4 py-2 text-xs font-semibold text-[#536071] hover:border-[#1556E8] hover:text-[#1556E8]">Modifier</button>
              <button type="button" onClick={() => void removeTask(selectedTask)} className="rounded-lg bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function TaskGrid({
  tasks,
  onDetails,
  onEdit,
  onDelete,
  deletingTaskId,
}: {
  tasks: Task[];
  onDetails: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  deletingTaskId: number | null;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task, index) => (
        <article key={task.id} className={`min-h-37.5 rounded-[14px] border border-[#E9EDF4] p-4 shadow-[0_3px_14px_rgba(30,50,90,0.025)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${cardColors[index % cardColors.length]}`}>
          <button type="button" onClick={() => onDetails(task)} className="block w-full text-left">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="truncate text-[12px] font-semibold text-[#202631]">{task.nom}</h3>
              <span className="shrink-0 rounded-full bg-white/75 px-2 py-1 text-[9px] font-semibold text-[#354052]">{task.statut}</span>
            </div>
            <p className="mb-2 line-clamp-2 min-h-6 text-[11px] leading-[17px] text-[#59616D]">{task.description || "Aucune description."}</p>
            <p className="truncate text-[11px] font-medium text-[#536071]">Projet: {task.projet?.nom ?? "Projet"}</p>
            <p className="mt-1 truncate font-bold text-[10px] text-[#536071]">{task.user?.name ? `Assignée à ${task.user.name}` : "Non assignée"}</p>
            <p className="mt-1 text-[10px] text-[#536071]">{formatDate(task.date_debut)} – {formatDate(task.date_fin)}</p>
          </button>
          <div className="flex justify-end gap-1 pt-3">
            <button type="button" onClick={() => onDetails(task)} aria-label={`Détails de ${task.nom}`} title="Détails" className="rounded p-1 text-[#536071] transition hover:bg-white/50 hover:text-[#1c2127]">
              <Eye size={14} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => onEdit(task)} aria-label={`Modifier ${task.nom}`} title="Modifier" className="rounded p-1 text-[#1556E8] transition hover:bg-white/50">
              <Pencil size={14} aria-hidden="true" />
            </button>
            <button type="button" disabled={deletingTaskId === task.id} onClick={() => void onDelete(task)} aria-label={`Supprimer ${task.nom}`} title={deletingTaskId === task.id ? "Suppression..." : "Supprimer"} className="rounded p-1 text-red-600 transition hover:bg-white/50 disabled:opacity-50">
              {deletingTaskId === task.id ? <LoaderCircle size={14} className="animate-spin" aria-hidden="true" /> : <Trash2 size={14} aria-hidden="true" />}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
