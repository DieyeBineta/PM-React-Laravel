// import React from 'react'

import axios from "axios"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import type { User } from "../../auth/interfaces/user"
import { getUser } from "../services/dashboardService"
import { logout } from "../../auth/services/authService";
import { removeToken } from "../../../commons/services/tokenService";
import { getApiErrorMessage } from "../../../utils/tools"

import {
  ListTodo,
  Bell,
  Plus,
  Search,
  X,
  Users,
  ArrowLeft,
  FolderKanban,
  Pencil,
  Trash2,
  LoaderCircle,
} from "lucide-react";
import TaskCard from "./TaskCard";
import TaskStatusPagination from "./TaskStatusPagination";
import Sidebar from "./Sidebar";
import DashboardOverview from "./DashboardOverview";
import { createUser, getUsers, setUserActiveStatus, updateUser } from "../../users/services/userService";
import { createProject, deleteProject, getProject, getProjects, updateProject } from "../services/projectService";
import type { Project } from "../interfaces/Project";
import { getTasks } from "../services/taskService";
import type { Task as ApiTask, TaskStatus } from "../interfaces/Task";
import LeadDeveloperDashboard from "./LeadDeveloperDashboard";
import DeveloperDashboard from "./DeveloperDashboard";

const formatDate = (date: string | null | undefined) => {
    if (!date) return null;
    const [year, month, day] = date.slice(0, 10).split("-").map(Number);
    return new Intl.DateTimeFormat("fr-FR").format(new Date(year, month - 1, day));
};

const getProjectExecutionPeriod = (project: Project) => {
    const startDate = formatDate(project.taches_min_date_debut);
    const endDate = formatDate(project.taches_max_date_fin);

    if (startDate && endDate) return `${startDate} – ${endDate}`;
    if (startDate) return `À partir du ${startDate}`;
    if (endDate) return `Jusqu’au ${endDate}`;
    return "Non définie";
};

function Dashboard() {
    const [error, setError] = useState<string | null | undefined>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [user, setUser] = useState<User | null>(null)
    const [logoutError, setLogoutError] = useState<string | null>(null)
    const navigate = useNavigate();
    useEffect(() => {
        const fetchUser = async () => {
            setError(null)
            setLoading(true)
            try {
                const user = await getUser();
                setUser(user)
            } catch(e) {
                if (axios.isAxiosError(e) && e.response?.status === 401) {
                    removeToken()
                    navigate("/auth/login", { replace: true })
                    return
                }
                setError(getApiErrorMessage(e))
            } finally{
                setLoading(false)
            }
        }
        fetchUser()
    }, [])

    const handleLogout = async () => {
        setLogoutError(null);
        try {
            await logout();
            removeToken();
            navigate("/auth/login", { replace: true });
        } catch (e) {
            setLogoutError(getApiErrorMessage(e));
        }
    };

    const [managerTasks, setManagerTasks] = useState<ApiTask[]>([]);
    const [managerTasksLoading, setManagerTasksLoading] = useState(false);
    const [managerTasksError, setManagerTasksError] = useState<string | null>(null);
    const [taskStatusFilter, setTaskStatusFilter] = useState<TaskStatus | "Tous">("En cours");
    const [currentPage, setCurrentPage] = useState("Overview");
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(false);
    const [projectsError, setProjectsError] = useState<string | null>(null);
    const [leadDevelopers, setLeadDevelopers] = useState<User[]>([]);
    const [projectDevelopers, setProjectDevelopers] = useState<User[]>([]);
    const [leadDevelopersError, setLeadDevelopersError] = useState<string | null>(null);
    const [showProjectForm, setShowProjectForm] = useState(false);
    const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
    const [creatingProject, setCreatingProject] = useState(false);
    const [projectFormError, setProjectFormError] = useState<string | null>(null);
    const [projectActionError, setProjectActionError] = useState<string | null>(null);
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDescription, setNewProjectDescription] = useState("");
    const [newProjectLeadId, setNewProjectLeadId] = useState("");
    const [newProjectDeveloperIds, setNewProjectDeveloperIds] = useState<string[]>([]);
    const [deletingProjectId, setDeletingProjectId] = useState<number | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [projectDetailsLoading, setProjectDetailsLoading] = useState(false);
    const [projectDetailsError, setProjectDetailsError] = useState<string | null>(null);
    const [teamMembers, setTeamMembers] = useState<User[]>([]);
    const [teamLoading, setTeamLoading] = useState(false);
    const [teamError, setTeamError] = useState<string | null>(null);
    const [updatingMemberId, setUpdatingMemberId] = useState<number | null>(null);
    const [teamActionError, setTeamActionError] = useState<string | null>(null);
    const [showUserForm, setShowUserForm] = useState(false);
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [creatingUser, setCreatingUser] = useState(false);
    const [userFormError, setUserFormError] = useState<string | null>(null);
    const [newUserName, setNewUserName] = useState("");
    const [newUserEmail, setNewUserEmail] = useState("");
    const [newUserPassword, setNewUserPassword] = useState("");
    const [newUserPasswordConfirmation, setNewUserPasswordConfirmation] = useState("");
    const [newUserRoleId, setNewUserRoleId] = useState(2);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (user?.role_id !== 1 || !["Overview", "Todo List"].includes(currentPage)) return;

        let cancelled = false;
        const fetchManagerTasks = async () => {
            setManagerTasksLoading(true);
            setManagerTasksError(null);
            try {
                const response = await getTasks();
                if (!cancelled) setManagerTasks(response.data);
            } catch (e) {
                if (!cancelled) setManagerTasksError(getApiErrorMessage(e));
            } finally {
                if (!cancelled) setManagerTasksLoading(false);
            }
        };

        fetchManagerTasks();
        return () => {
            cancelled = true;
        };
    }, [currentPage, user?.role_id]);

    const filteredManagerTasks = managerTasks.filter((task) => {
        const matchesStatus = taskStatusFilter === "Tous" || task.statut === taskStatusFilter;
        const searchText = `${task.nom} ${task.description ?? ""} ${task.projet?.nom ?? ""} ${task.user?.name ?? ""}`.toLowerCase();
        return matchesStatus && searchText.includes(search.toLowerCase());
    });

    useEffect(() => {
        if (user?.role_id !== 1 || !["Overview", "Team Mates"].includes(currentPage)) return;

        let cancelled = false;
        const fetchTeamMembers = async () => {
            setTeamLoading(true);
            setTeamError(null);
            try {
                const response = await getUsers();
                if (!cancelled) setTeamMembers(response.data);
            } catch (e) {
                if (!cancelled) setTeamError(getApiErrorMessage(e));
            } finally {
                if (!cancelled) setTeamLoading(false);
            }
        };

        fetchTeamMembers();
        return () => {
            cancelled = true;
        };
    }, [currentPage, user?.role_id]);

    useEffect(() => {
        if (user?.role_id !== 1 || !["Overview", "Projects"].includes(currentPage)) return;

        let cancelled = false;
        const fetchProjects = async () => {
            setProjectsLoading(true);
            setProjectsError(null);
            setLeadDevelopersError(null);
            try {
                const projectsResult = (await Promise.allSettled([getProjects()]))[0];
                const usersResult: PromiseSettledResult<Awaited<ReturnType<typeof getUsers>>> | null =
                    currentPage === "Projects"
                        ? (await Promise.allSettled([getUsers()]))[0]
                        : null;
                if (!cancelled) {
                    if (projectsResult.status === "fulfilled") {
                        setProjects(projectsResult.value.data);
                    } else {
                        setProjectsError(getApiErrorMessage(projectsResult.reason));
                    }

                    if (usersResult) {
                        if (usersResult.status === "fulfilled") {
                                setProjectDevelopers(
                                    usersResult.value.data.filter(
                                        (candidate) =>
                                            candidate.role?.titre === "Developpeur" &&
                                            candidate.statut === "Actif"
                                    )
                                );
                                setLeadDevelopers(
                                usersResult.value.data.filter(
                                    (candidate) =>
                                        candidate.role?.titre === "Lead_Developpeur" &&
                                        candidate.statut !== "Desactivé"
                                )
                            );
                        } else {
                            setLeadDevelopersError(getApiErrorMessage(usersResult.reason));
                        }
                    }
                }
            } finally {
                if (!cancelled) setProjectsLoading(false);
            }
        };

        fetchProjects();
        return () => {
            cancelled = true;
        };
    }, [currentPage, user?.role_id]);

    useEffect(() => {
        if (user?.role_id !== 1 || currentPage !== "Project Details" || selectedProjectId === null) return;

        let cancelled = false;
        const fetchProjectDetails = async () => {
            setProjectDetailsLoading(true);
            setProjectDetailsError(null);
            try {
                const response = await getProject(selectedProjectId);
                if (!cancelled) setSelectedProject(response.data);
            } catch (e) {
                if (!cancelled) setProjectDetailsError(getApiErrorMessage(e));
            } finally {
                if (!cancelled) setProjectDetailsLoading(false);
            }
        };

        fetchProjectDetails();
        return () => {
            cancelled = true;
        };
    }, [currentPage, selectedProjectId, user?.role_id]);

    const filteredTeamMembers = teamMembers.filter((member) =>
        `${member.name} ${member.email} ${member.role?.titre ?? ""}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const addTeamMember = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        setUserFormError(null);
        setCreatingUser(true);

        try {
            const response = editingUserId === null
                ? await createUser({
                    name: newUserName.trim(),
                    email: newUserEmail.trim(),
                    password: newUserPassword,
                    password_confirmation: newUserPasswordConfirmation,
                    role_id: newUserRoleId,
                })
                : await updateUser(editingUserId, {
                    name: newUserName.trim(),
                    email: newUserEmail.trim(),
                    role_id: newUserRoleId,
                });
            setTeamMembers((members) => editingUserId === null
                ? [...members, response.data]
                : members.map((member) => member.id === editingUserId ? response.data : member));
            setNewUserName("");
            setNewUserEmail("");
            setNewUserPassword("");
            setNewUserPasswordConfirmation("");
            setNewUserRoleId(2);
            setEditingUserId(null);
            setShowUserForm(false);
        } catch (e) {
            setUserFormError(getApiErrorMessage(e));
        } finally {
            setCreatingUser(false);
        }
    };

    const editTeamMember = (member: User) => {
        setEditingUserId(member.id);
        setNewUserName(member.name);
        setNewUserEmail(member.email);
        setNewUserRoleId(member.role_id);
        setUserFormError(null);
        setShowUserForm(true);
    };

    const addProject = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        setProjectFormError(null);

        const leadId = Number(newProjectLeadId);
        if (!newProjectName.trim() || !Number.isInteger(leadId) || leadId <= 0) {
            setProjectFormError("Le nom du projet et un lead développeur sont obligatoires.");
            return;
        }
        if (editingProjectId === null && (newProjectDeveloperIds.length < 2 || newProjectDeveloperIds.length > 9)) {
            setProjectFormError("Un projet doit avoir entre 2 et 9 développeurs, en plus de son lead (3 à 10 membres au total).");
            return;
        }

        setCreatingProject(true);
        try {
            const projectPayload = {
                nom: newProjectName.trim(),
                description: newProjectDescription.trim() || undefined,
                lead_developpeur_id: leadId,
            };
            const response = editingProjectId === null
                ? await createProject({
                    ...projectPayload,
                    developer_ids: newProjectDeveloperIds.map(Number),
                })
                : await updateProject(editingProjectId, projectPayload);
            setProjects((currentProjects) => editingProjectId === null
                ? [...currentProjects, response.data]
                : currentProjects.map((project) =>
                    project.id === editingProjectId ? response.data : project
                ));
            if (selectedProjectId === editingProjectId) {
                setSelectedProject(response.data);
            }
            setNewProjectName("");
            setNewProjectDescription("");
            setNewProjectLeadId("");
            setNewProjectDeveloperIds([]);
            setEditingProjectId(null);
            setShowProjectForm(false);
        } catch (e) {
            setProjectFormError(getApiErrorMessage(e));
        } finally {
            setCreatingProject(false);
        }
    };

    const editProject = (project: Project) => {
        setEditingProjectId(project.id);
        setNewProjectName(project.nom);
        setNewProjectDescription(project.description ?? "");
        setNewProjectLeadId(String(project.lead_developpeur_id ?? project.lead_developpeur?.id ?? ""));
        setNewProjectDeveloperIds([]);
        setProjectFormError(null);
        setShowProjectForm(true);
    };

    const removeProject = async (project: Project) => {
        if (!window.confirm(`Supprimer le projet « ${project.nom} » et ses tâches ?`)) return;

        setDeletingProjectId(project.id);
        setProjectActionError(null);
        try {
            await deleteProject(project.id);
            setProjects((currentProjects) => currentProjects.filter((item) => item.id !== project.id));
            if (selectedProjectId === project.id) {
                setSelectedProject(null);
                setSelectedProjectId(null);
                setCurrentPage("Projects");
            }
        } catch (e) {
            setProjectActionError(getApiErrorMessage(e));
        } finally {
            setDeletingProjectId(null);
        }
    };

    const toggleMemberStatus = async (member: User) => {
        const active = member.statut !== "Actif";
        setUpdatingMemberId(member.id);
        setTeamActionError(null);

        try {
            const response = await setUserActiveStatus(member.id, active);
            setTeamMembers((members) =>
                members.map((currentMember) =>
                    currentMember.id === member.id
                        ? { ...currentMember, ...response.data }
                        : currentMember
                )
            );
        } catch (e) {
            setTeamActionError(getApiErrorMessage(e));
        } finally {
            setUpdatingMemberId(null);
        }
    };

    if (loading) {
        return <div className="p-6 text-sm text-[#858C98]">Chargement du tableau de bord...</div>;
    }

    if (error || !user) {
        return (
            <div role="alert" className="m-6 rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                {error ?? "Impossible de récupérer le compte connecté."}
            </div>
        );
    }

    if (user.role_id === 1) {
        return (
            <main className=" bg-[#F0F3FA]">
            <div className="flex h-167.5 w-full overflow-hidden rounded-xl bg-white shadow-[0_5px_35px_rgba(30,50,90,0.04)] max-md:h-[95vh]">
                
                <Sidebar
                    tasks={managerTasks.map((task) => ({
                        id: task.id,
                        title: task.nom,
                        completed: task.statut === "Terminé",
                    }))}
                    currentPage={currentPage}
                    onNavigate={setCurrentPage}
                    user={user}
                    teamMembers={teamMembers}
                    onLogout={handleLogout}
                />

                {/* Main content */}
                <section className="flex min-w-0 flex-1 flex-col bg-white">
                
                {/* Header */}
                <header className="flex h-19 shrink-0 items-center justify-between px-5 sm:px-8 border-b border-[#EEF0F4]">
                    <h1 className="text-[18px] font-bold tracking-tight text-[#111827]">
                    {currentPage === "Overview" ? "Tableau de bord" : currentPage}
                    </h1>

                    <div className="flex items-center gap-5">
                    <button className="relative text-[#354052]">
                        <Bell size={17} fill="#354052" />
                        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-white bg-blue-600" />
                    </button>

                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#F8E7C9] text-xl">
                        👨🏻
                    </div>
                    </div>
                </header>
                {logoutError && (
                    <p role="alert" className="border-b border-red-100 bg-red-50 px-5 py-2 text-xs text-red-700">
                        Déconnexion impossible : {logoutError}
                    </p>
                )}

                {currentPage === "Overview" ? (
                    <DashboardOverview
                        tasks={managerTasks}
                        projects={projects}
                        user={user}
                        loading={managerTasksLoading || projectsLoading}
                        error={managerTasksError || projectsError}
                        onNavigate={setCurrentPage}
                    />
                ) : ["Team Mates", "Projects", "Project Details"].includes(currentPage) ? (
                    <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
                        {currentPage === "Team Mates" && (
                        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-[#202631]">
                                    Membres de l’équipe
                                </h2>
                                <p className="mt-1 text-xs text-[#858C98]">
                                    Consulte les membres de ton équipe.
                                </p>
                            </div>
                            <div className="flex w-full  items-center justify-end gap-2 sm:w-auto">
                                <div className="flex h-8.5 w-full min-w-80 items-center gap-2 rounded-md border border-[#E8E9ED] px-2.5">
                                    <Search size={15} className="shrink-0 text-[#858C98]" />
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Rechercher un membre"
                                        aria-label="Rechercher un membre"
                                        className="w-full min-w-0 bg-transparent text-[11px] text-[#343B48] outline-none placeholder:text-[#858C98]"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setUserFormError(null);
                                        setEditingUserId(null);
                                        setNewUserName("");
                                        setNewUserEmail("");
                                        setNewUserPassword("");
                                        setNewUserPasswordConfirmation("");
                                        setNewUserRoleId(2);
                                        setShowUserForm(true);
                                    }}
                                    className="flex h-8.5 shrink-0 items-center gap-2 rounded-md bg-[#1556E8] px-3 text-[11px] font-medium text-white shadow-sm transition hover:bg-blue-700"
                                >
                                    <Plus size={14} />
                                    <span className="hidden sm:inline">Ajouter un utilisateur</span>
                                    <span className="sm:hidden">Ajouter</span>
                                </button>
                            </div>
                        </div>
                        )}

                        {currentPage === "Team Mates" && teamLoading ? (
                            <div className="flex min-h-40 items-center justify-center text-sm text-[#858C98]">
                                Chargement des membres...
                            </div>
                        ) : currentPage === "Team Mates" && teamError ? (
                            <div role="alert" className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                                {teamError}
                            </div>
                        ) : currentPage === "Team Mates" && filteredTeamMembers.length === 0 ? (
                            <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-[#E9EDF4] bg-white text-center">
                                <Users size={28} className="mb-2 text-[#B5BFCD]" />
                                <p className="text-sm font-medium text-[#536071]">
                                    {teamMembers.length === 0
                                        ? "Aucun membre dans l’équipe"
                                        : "Aucun membre trouvé"}
                                </p>
                                {teamMembers.length > 0 && (
                                    <p className="mt-1 text-xs text-[#9AA3B0]">
                                        Essaie avec un autre nom, rôle ou email.
                                    </p>
                                )}
                            </div>
                        ) : currentPage === "Projects" ? (
                            <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
                                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                                    <div>
                                        <h2 className="text-xl font-bold tracking-tight text-[#202631]">
                                            Projets
                                        </h2>
                                        <p className="mt-1 text-xs text-[#858C98]">
                                            Consulte les projets et les membres associés.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProjectFormError(null);
                                            setEditingProjectId(null);
                                            setNewProjectName("");
                                            setNewProjectDescription("");
                                            setNewProjectLeadId("");
                                            setNewProjectDeveloperIds([]);
                                            setShowProjectForm(true);
                                        }}
                                        disabled={leadDevelopers.length === 0 || Boolean(leadDevelopersError)}
                                        className="flex h-8.5 items-center gap-2 rounded-md bg-[#1556E8] px-3 text-[11px] font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <Plus size={14} />
                                        Créer un projet
                                    </button>
                                </div>
                                {leadDevelopersError && (
                                    <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                                        Impossible de charger les leads développeurs : {leadDevelopersError}
                                    </p>
                                )}
                                {!projectsLoading && !leadDevelopersError && leadDevelopers.length === 0 && (
                                    <p className="mb-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                                        Aucun lead développeur actif n’est disponible. Ajoutez-en un avant de créer un projet.
                                    </p>
                                )}
                                {projectActionError && (
                                    <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                                        {projectActionError}
                                    </p>
                                )}

                                {projectsLoading ? (
                                    <div className="flex min-h-40 items-center justify-center text-sm text-[#858C98]">
                                        Chargement des projets...
                                    </div>
                                ) : projectsError ? (
                                    <div role="alert" className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                                        {projectsError}
                                    </div>
                                ) : projects.length === 0 ? (
                                    <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-[#E9EDF4] bg-white text-center">
                                        <FolderKanban size={28} className="mb-2 text-[#B5BFCD]" />
                                        <p className="text-sm font-medium text-[#536071]">
                                            Aucun projet disponible
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                        {projects
                                            .filter((project) =>
                                                `${project.nom} ${project.description ?? ""}`
                                                    .toLowerCase()
                                                    .includes(search.toLowerCase())
                                            )
                                            .map((project, index) => {
                                                const cardColors = [
                                                    "bg-[#D4E8FF]",
                                                    "bg-[#DDD3FA]",
                                                    "bg-[#FFF0D3]",
                                                    "bg-[#F8D4ED]",
                                                    "bg-[#BDF7D9]",
                                                ];

                                                return (
                                                    <article
                                                        key={project.id}
                                                        className={`group flex min-h-48 flex-col rounded-[14px] p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${cardColors[index % cardColors.length]}`}
                                                    >
                                                        <div className="mb-3 flex items-start justify-between gap-3">
                                                            <div className="flex min-w-0 items-center gap-2">
                                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/70 text-[#1556E8]">
                                                                    <FolderKanban size={17} />
                                                                </div>
                                                                <h3 className="truncate text-sm font-semibold text-[#202631]">
                                                                    {project.nom}
                                                                </h3>
                                                            </div>
                                                            <div className="flex shrink-0 gap-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => editProject(project)}
                                                                    aria-label={`Modifier ${project.nom}`}
                                                                    className="rounded-md bg-white/70 p-2 text-[#536071] transition hover:bg-white hover:text-[#1556E8]"
                                                                >
                                                                    <Pencil size={14} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeProject(project)}
                                                                    disabled={deletingProjectId !== null}
                                                                    aria-label={`Supprimer ${project.nom}`}
                                                                    className="rounded-md bg-white/70 p-2 text-red-700 transition hover:bg-white disabled:opacity-50"
                                                                >
                                                                    {deletingProjectId === project.id ? <LoaderCircle size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className="mb-4 flex-1 text-[11px] leading-5 text-[#59616D]">
                                                            {project.description?.trim() || "Aucune description disponible."}
                                                        </p>
                                                        <p className="mb-3 text-[11px] text-[#536071]">
                                                            <span className="font-semibold">Période : </span>
                                                            {getProjectExecutionPeriod(project)}
                                                        </p>
                                                        <p className="mb-3 truncate text-[11px] text-[#536071]">
                                                            <span className="font-semibold">Lead développeur : </span>
                                                            {project.lead_developpeur?.name ?? "Non renseigné"}
                                                        </p>
                                                        <div className="flex items-center justify-between gap-2 border-t border-white/60 pt-3">
                                                            <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#303743]">
                                                                <Users size={14} />
                                                                {project.users_count ?? 0} membre{project.users_count === 1 ? "" : "s"}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedProjectId(project.id);
                                                                    setSelectedProject(null);
                                                                    setProjectDetailsError(null);
                                                                    setCurrentPage("Project Details");
                                                                }}
                                                                className="rounded-md bg-white/70 px-3 py-2 text-[11px] font-semibold text-[#1556E8] transition hover:bg-white"
                                                            >
                                                                Voir les détails
                                                            </button>
                                                        </div>
                                                    </article>
                                                );
                                            })}
                                    </div>
                                )}
                            </div>
                        ) : currentPage === "Project Details" ? (
                            <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage("Projects")}
                                    className="mb-5 inline-flex items-center gap-2 rounded-md border border-[#E8E9ED] bg-white px-3 py-2 text-xs font-medium text-[#536071] transition hover:border-[#1556E8] hover:text-[#1556E8]"
                                >
                                    <ArrowLeft size={14} />
                                    Retour aux projets
                                </button>

                                {projectDetailsLoading ? (
                                    <div className="flex min-h-40 items-center justify-center text-sm text-[#858C98]">
                                        Chargement des détails...
                                    </div>
                                ) : projectDetailsError ? (
                                    <div role="alert" className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                                        {projectDetailsError}
                                    </div>
                                ) : selectedProject ? (
                                    <div className="space-y-4">
                                        {projectActionError && (
                                            <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-700">
                                                {projectActionError}
                                            </p>
                                        )}
                                        <section className="rounded-xl border border-[#E9EDF4] bg-white p-5 shadow-[0_3px_14px_rgba(30,50,90,0.025)]">
                                            <div className="mb-3 flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#1556E8]">
                                                    <FolderKanban size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] text-[#858C98]">Projet</p>
                                                    <h2 className="text-lg font-bold text-[#202631]">
                                                        {selectedProject.nom}
                                                    </h2>
                                                </div>
                                            </div>
                                            <div className="mb-3 flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => editProject(selectedProject)}
                                                    className="inline-flex items-center gap-1.5 rounded-md border border-[#E8E9ED] px-3 py-2 text-[11px] font-semibold text-[#536071] hover:border-[#1556E8] hover:text-[#1556E8]"
                                                >
                                                    <Pencil size={13} /> Modifier le projet
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeProject(selectedProject)}
                                                    disabled={deletingProjectId !== null}
                                                    className="inline-flex items-center gap-1.5 rounded-md border border-red-100 px-3 py-2 text-[11px] font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                                                >
                                                    <Trash2 size={13} /> Supprimer le projet
                                                </button>
                                            </div>
                                            <p className="text-sm leading-6 text-[#59616D]">
                                                {selectedProject.description?.trim() || "Aucune description disponible."}
                                            </p>
                                            <p className="mt-3 text-xs text-[#536071]">
                                                <span className="font-semibold">Période d’exécution : </span>
                                                {getProjectExecutionPeriod(selectedProject)}
                                            </p>
                                            <div className="mt-4 flex flex-wrap gap-4 border-t border-[#EEF0F4] pt-3 text-xs text-[#536071]">
                                                <span className="flex items-center gap-1.5">
                                                    <Users size={14} className="text-[#1556E8]" />
                                                    {selectedProject.users_count ?? selectedProject.users?.length ?? 0} membre{(selectedProject.users_count ?? selectedProject.users?.length ?? 0) === 1 ? "" : "s"}
                                                </span>
                                                {selectedProject.lead_developpeur && (
                                                    <span>
                                                        Lead développeur : {selectedProject.lead_developpeur.name}
                                                    </span>
                                                )}
                                            </div>
                                        </section>

                                        <section className="rounded-xl border border-[#E9EDF4] bg-white p-5 shadow-[0_3px_14px_rgba(30,50,90,0.025)]">
                                            <h3 className="mb-4 text-sm font-bold text-[#202631]">
                                                Membres du projet
                                            </h3>
                                            {selectedProject.users?.length ? (
                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                                    {selectedProject.users.map((member, index) => {
                                                        const cardColors = [
                                                            "bg-[#D4E8FF]",
                                                            "bg-[#DDD3FA]",
                                                            "bg-[#FFF0D3]",
                                                            "bg-[#F8D4ED]",
                                                            "bg-[#BDF7D9]",
                                                        ];
                                                        return (
                                                            <article
                                                                key={member.id}
                                                                className={`rounded-[14px] p-3 ${cardColors[index % cardColors.length]}`}
                                                            >
                                                                <h4 className="text-xs font-semibold text-[#202631]">
                                                                    {member.name}
                                                                    {member.id === selectedProject.lead_developpeur_id && (
                                                                        <span className="ml-1.5 text-[9px] font-semibold text-[#1556E8]">Lead Dev</span>
                                                                    )}
                                                                </h4>
                                                                <p className="mt-1 break-all text-[11px] text-[#59616D]">
                                                                    {member.email}
                                                                </p>
                                                                <p className="mt-2 text-right text-[10px] text-[#536071]">
                                                                    {member.role?.titre.replace("_", " ") ?? "Membre"}
                                                                </p>
                                                            </article>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-[#858C98]">
                                                    Aucun membre associé à ce projet.
                                                </p>
                                            )}
                                        </section>
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-[#E9EDF4] bg-white p-4 text-sm text-[#858C98]">
                                        Projet introuvable.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                            {teamActionError && (
                                <div role="alert" className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 text-xs text-red-700">
                                    {teamActionError}
                                </div>
                            )}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-3">
                                {filteredTeamMembers.map((member, index) => {
                                    const cardColors = [
                                        "bg-[#D4E8FF]",
                                        "bg-[#DDD3FA]",
                                        "bg-[#FFF0D3]",
                                        "bg-[#F8D4ED]",
                                        "bg-[#BDF7D9]",
                                    ];

                                    return (
                                    <article
                                        key={member.id}
                                        className={`group relative min-h-28.75 rounded-[14px] p-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${cardColors[index % cardColors.length]}`}
                                    >
                                        <div className="mb-1 flex items-center justify-between gap-2">
                                            <div className=" min-w-0 items-center gap-2">
                                                <div className={` flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white text-[15px] font-semibold text-[#022e61]`}>
                                                {member.name
                                                    .split(/\s+/)
                                                    .slice(0, 2)
                                                    .map((part) => part[0]?.toUpperCase())
                                                    .join("")}
                                                </div>
                                                <h3 className="truncate text-[12px] mt-3 font-semibold text-[#202631]">
                                                    {member.name}
                                                </h3>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-2">
                                                {member.statut && (
                                                    <span className={`text-[10px] font-medium ${
                                                        member.statut === "Actif" ? "text-emerald-700" : "text-gray-600"
                                                    }`}>
                                                        {member.statut}
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => editTeamMember(member)}
                                                    aria-label={`Modifier ${member.name}`}
                                                    className="rounded-md border border-white/70 bg-white/70 p-1.5 text-[#536071] hover:bg-white hover:text-[#1556E8]"
                                                >
                                                    <Pencil size={12} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="mb-3  line-clamp-2 break-all text-[11px] leading-4.25 text-[#57616f]">
                                            {member.email}
                                        </p>
                                        <p className="text-[11px] font-medium text-right text-[#30374392]">
                                                {member.role?.titre.replace("_", " ") ?? "Membre"}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => toggleMemberStatus(member)}
                                            disabled={updatingMemberId !== null}
                                            className={`mt-3 w-full rounded-md border border-white/70 bg-white/70 px-3 py-2 text-[11px] font-semibold transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 ${
                                                member.statut === "Actif"
                                                    ? "text-red-700"
                                                    : "text-emerald-700"
                                            }`}
                                        >
                                            {updatingMemberId === member.id
                                                ? "Mise à jour..."
                                                : member.statut === "Actif"
                                                    ? "Désactiver le compte"
                                                    : "Réactiver le compte"}
                                        </button>
                                    </article>
                                )})}
                            </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="flex min-h-0 flex-1 flex-col">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF0F4] px-4 py-4 sm:px-5">
                            <div>
                                <h2 className="text-sm font-bold text-[#202631]">Suivi des tâches</h2>
                                <p className="mt-1 text-[11px] text-[#858C98]">
                                    Consultation des tâches et de leur avancement.
                                </p>
                            </div>
                            <div className="flex h-[34px] w-full max-w-[260px] items-center gap-2 rounded-md border border-[#E8E9ED] px-2.5">
                                <Search size={15} className="shrink-0 text-[#858C98]" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Rechercher une tâche"
                                    aria-label="Rechercher une tâche"
                                    className="w-full min-w-0 bg-transparent text-[11px] text-[#343B48] outline-none placeholder:text-[#858C98]"
                                />
                            </div>
                        </div>

                        <TaskStatusPagination
                            tasks={managerTasks}
                            selectedStatus={taskStatusFilter}
                            onSelect={setTaskStatusFilter}
                        />

                        {managerTasksLoading ? (
                            <div className="flex flex-1 items-center justify-center text-sm text-[#858C98]">
                                Chargement des tâches...
                            </div>
                        ) : managerTasksError ? (
                            <div role="alert" className="m-4 rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                                {managerTasksError}
                            </div>
                        ) : filteredManagerTasks.length === 0 ? (
                            <div className="flex flex-1 flex-col items-center justify-center p-4 text-center">
                                <ListTodo size={30} className="mb-2 text-[#B5BFCD]" />
                                <p className="text-sm font-medium text-[#536071]">
                                    {managerTasks.length === 0
                                        ? "Aucune tâche enregistrée"
                                        : taskStatusFilter === "Tous" || managerTasks.some((task) => task.statut === taskStatusFilter)
                                            ? "Aucune tâche ne correspond à la recherche"
                                            : `Aucune tâche au statut « ${taskStatusFilter} »`}
                                </p>
                            </div>
                        ) : (
                            <div className="grid flex-1 content-start grid-cols-1 gap-4 overflow-y-auto p-4 sm:grid-cols-2 sm:px-5 lg:grid-cols-3">
                                {filteredManagerTasks.map((task, index) => {
                                    const cardColors = [
                                        "bg-[#D4E8FF]",
                                        "bg-[#DDD3FA]",
                                        "bg-[#FFF0D3]",
                                        "bg-[#F8D4ED]",
                                        "bg-[#BDF7D9]",
                                    ];
                                    const startDate = formatDate(task.date_debut);
                                    const endDate = formatDate(task.date_fin);

                                    return (
                                        <TaskCard
                                            key={task.id}
                                            readOnly
                                            task={{
                                                id: task.id,
                                                title: task.nom,
                                                description: task.description || "Aucune description.",
                                                time: startDate && endDate
                                                    ? `${startDate} – ${endDate}`
                                                    : startDate ?? endDate ?? "Dates non définies",
                                                completed: task.statut === "Terminé",
                                                color: cardColors[index % cardColors.length],
                                                status: task.statut,
                                                assignee: task.user?.name,
                                                project: task.projet?.nom,
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Date and search */}
                {/* <div className="flex min-h-[45px] flex-wrap items-center justify-between gap-3 border-b border-[#EEF0F4] px-4 pb-3 sm:px-5">
                    <button className="flex items-center gap-3 text-[14px] font-semibold text-[#202631]">
                    21st Feb, 2025
                    <ChevronDown size={16} />
                    </button>

                    <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
                    <div className="flex h-[34px] w-full max-w-[215px] items-center gap-2 rounded-md border border-[#E8E9ED] px-2.5">
                        <Search size={15} className="shrink-0 text-[#858C98]" />
                        <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search List"
                        className="w-full min-w-0 bg-transparent text-[11px] text-[#343B48] outline-none placeholder:text-[#858C98]"
                        />
                    </div>

                    <button
                        onClick={() => setShowForm(true)}
                        className="flex h-[34px] shrink-0 items-center gap-2 rounded-md bg-[#1556E8] px-3 text-[11px] font-medium text-white shadow-sm transition hover:bg-blue-700"
                    >
                        <Plus size={14} />
                        <span className="hidden sm:inline">Add New List</span>
                        <span className="sm:hidden">Add</span>
                    </button>
                    </div>
                </div> */}

                {/* Tabs */}
                {/* <div className="px-4 pt-4 sm:px-5">
                    <div className="inline-flex items-center gap-1 rounded-md bg-[#FAFBFD] p-1">
                    <button
                        onClick={() => setActiveTab("active")}
                        className={`rounded-md px-3 py-1.5 text-[11px] transition ${
                        activeTab === "active"
                            ? "bg-white font-semibold text-[#252B36] shadow-sm"
                            : "text-[#7A818C]"
                        }`}
                    >
                        Active Task
                    </button>

                    <button
                        onClick={() => setActiveTab("completed")}
                        className={`rounded-md px-3 py-1.5 text-[11px] transition ${
                        activeTab === "completed"
                            ? "bg-white font-semibold text-[#252B36] shadow-sm"
                            : "text-[#7A818C]"
                        }`}
                    >
                        Completed
                    </button>
                    </div>
                </div> */}

                {/* Task grid */}
                {/* <div className="grid flex-1 content-start grid-cols-1 gap-4 overflow-y-auto p-4 sm:grid-cols-2 sm:px-5 lg:grid-cols-3">
                    {filteredTasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onToggle={toggleTask}
                        onDelete={deleteTask}
                    />
                    ))}

                    {filteredTasks.length === 0 && (
                    <div className="col-span-full flex min-h-40 flex-col items-center justify-center text-center">
                        <ListTodo size={30} className="mb-2 text-[#B5BFCD]" />
                        <p className="text-sm font-medium text-[#536071]">
                        Aucune tâche trouvée
                        </p>
                        <p className="mt-1 text-xs text-[#9AA3B0]">
                        Ajoute une tâche ou modifie ta recherche.
                        </p>
                    </div>
                    )}
                </div> */}
                </section>
            </div>

            {showProjectForm && currentPage === "Projects" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
                    <form
                        onSubmit={addProject}
                        className="w-full max-w-95 rounded-2xl bg-white p-6 shadow-xl"
                    >
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-[#172033]">
                                {editingProjectId === null ? "Créer un projet" : "Modifier le projet"}
                            </h2>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowProjectForm(false);
                                    setEditingProjectId(null);
                                }}
                                aria-label="Fermer"
                                className="text-gray-400 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {projectFormError && (
                            <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                                {projectFormError}
                            </p>
                        )}

                        <div className="space-y-3">
                            <input
                                autoFocus
                                required
                                maxLength={255}
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                placeholder="Nom du projet"
                                aria-label="Nom du projet"
                                className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
                            />
                            <textarea
                                value={newProjectDescription}
                                onChange={(e) => setNewProjectDescription(e.target.value)}
                                placeholder="Description (facultative)"
                                aria-label="Description du projet"
                                rows={3}
                                className="w-full resize-y rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
                            />
                            <label className="block text-xs font-semibold text-gray-600">
                                Lead développeur obligatoire
                            </label>
                            <select
                                required
                                value={newProjectLeadId}
                                onChange={(e) => setNewProjectLeadId(e.target.value)}
                                aria-label="Lead développeur obligatoire"
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-600 outline-none focus:border-blue-500"
                            >
                                <option value="" disabled>
                                    Sélectionner un lead développeur
                                </option>
                                {leadDevelopers.map((lead) => (
                                    <option key={lead.id} value={lead.id}>
                                        {lead.name} — {lead.email}
                                    </option>
                                ))}
                            </select>
                            {editingProjectId === null && (
                                <fieldset className="rounded-lg border border-gray-200 p-3">
                                    <legend className="px-1 text-xs font-semibold text-gray-600">
                                        Développeurs actifs — {newProjectDeveloperIds.length + (newProjectLeadId ? 1 : 0)} / 3 à 10 membres
                                    </legend>
                                    <p className="mb-2 text-[10px] text-gray-500">
                                        Sélectionnez de 2 à 9 développeurs. Le lead développeur compte comme un membre.
                                    </p>
                                    {projectDevelopers.length ? (
                                        <div className="max-h-40 space-y-1 overflow-y-auto">
                                            {projectDevelopers.map((developer) => {
                                                const selected = newProjectDeveloperIds.includes(String(developer.id));
                                                const atLimit = newProjectDeveloperIds.length >= 9 && !selected;
                                                return (
                                                    <label key={developer.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50">
                                                        <input
                                                            type="checkbox"
                                                            checked={selected}
                                                            disabled={atLimit}
                                                            onChange={(event) => {
                                                                setNewProjectDeveloperIds((current) =>
                                                                    event.target.checked
                                                                        ? [...current, String(developer.id)]
                                                                        : current.filter((id) => id !== String(developer.id))
                                                                );
                                                            }}
                                                            className="accent-[#1556E8]"
                                                        />
                                                        <span>{developer.name}</span>
                                                        <span className="ml-auto text-[10px] text-gray-400">{developer.email}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="py-2 text-xs text-amber-700">Aucun développeur actif disponible.</p>
                                    )}
                                </fieldset>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={creatingProject || leadDevelopers.length === 0 || (editingProjectId === null && newProjectDeveloperIds.length < 2)}
                            className="mt-5 w-full rounded-lg bg-[#1556E8] py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {creatingProject
                                ? (editingProjectId === null ? "Création..." : "Enregistrement...")
                                : (editingProjectId === null ? "Créer le projet" : "Enregistrer les modifications")}
                        </button>
                    </form>
                </div>
            )}
            {showUserForm && currentPage === "Team Mates" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
                    <form
                        onSubmit={addTeamMember}
                        className="w-full max-w-95 rounded-2xl bg-white p-6 shadow-xl"
                    >
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-[#172033]">
                                {editingUserId === null ? "Ajouter un utilisateur" : "Modifier le membre"}
                            </h2>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowUserForm(false);
                                    setEditingUserId(null);
                                }}
                                aria-label="Fermer"
                                className="text-gray-400 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {userFormError && (
                            <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                                {userFormError}
                            </p>
                        )}

                        <div className="space-y-3">
                            <input
                                autoFocus
                                required
                                value={newUserName}
                                onChange={(e) => setNewUserName(e.target.value)}
                                placeholder="Nom complet"
                                aria-label="Nom complet"
                                className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
                            />
                            <input
                                type="email"
                                required
                                value={newUserEmail}
                                onChange={(e) => setNewUserEmail(e.target.value)}
                                placeholder="Adresse email"
                                aria-label="Adresse email"
                                className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
                            />
                            <select
                                value={newUserRoleId}
                                onChange={(e) => setNewUserRoleId(Number(e.target.value))}
                                aria-label="Rôle"
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-600 outline-none focus:border-blue-500"
                            >
                                <option value={2}>Lead développeur</option>
                                <option value={3}>Développeur</option>
                            </select>
                            {editingUserId === null && (
                                <>
                                    <input
                                        type="password"
                                        required
                                        minLength={8}
                                        value={newUserPassword}
                                        onChange={(e) => setNewUserPassword(e.target.value)}
                                        placeholder="Mot de passe (8 caractères minimum)"
                                        aria-label="Mot de passe"
                                        className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
                                    />
                                    <input
                                        type="password"
                                        required
                                        minLength={8}
                                        value={newUserPasswordConfirmation}
                                        onChange={(e) => setNewUserPasswordConfirmation(e.target.value)}
                                        placeholder="Confirmer le mot de passe"
                                        aria-label="Confirmer le mot de passe"
                                        className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
                                    />
                                </>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={creatingUser}
                            className="mt-5 w-full rounded-lg bg-[#1556E8] py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {creatingUser
                                ? (editingUserId === null ? "Création..." : "Enregistrement...")
                                : (editingUserId === null ? "Créer l’utilisateur" : "Enregistrer les modifications")}
                        </button>
                    </form>
                </div>
            )}
            </main>
        )
    } else if (user?.role_id == 2) {
        return (
            <LeadDeveloperDashboard user={user} onLogout={handleLogout} />
        )
    } else if (user?.role_id == 3) {
        return (
            <DeveloperDashboard user={user} onLogout={handleLogout} />
        )
    }
}

export default Dashboard