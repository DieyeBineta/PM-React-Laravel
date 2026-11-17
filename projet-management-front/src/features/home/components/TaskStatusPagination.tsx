import type { TaskStatus } from "../interfaces/Task";

const taskStatuses: TaskStatus[] = ["En cours", "Disponible", "Attribuée", "Terminé"];

const statusLabels: Record<TaskStatus, string> = {
  "En cours": "En cours",
  Disponible: "Disponibles",
  Attribuée: "Attribuées",
  Terminé: "Terminées",
};

type Props = {
  tasks: { statut: TaskStatus }[];
  selectedStatus: TaskStatus | "Tous";
  onSelect: (status: TaskStatus | "Tous") => void;
};

export default function TaskStatusPagination({ tasks, selectedStatus, onSelect }: Props) {
  return (
    <nav aria-label="Pagination des tâches par statut" className="overflow-x-auto pt-4 ">
      <div className="inline-flex min-w-max items-center gap-1 rounded-md bg-[#FAFBFD] p-1">
        {(["Tous", ...taskStatuses] as const).map((status) => {
          const selected = selectedStatus === status;
          const count = status === "Tous" ? tasks.length : tasks.filter((task) => task.statut === status).length;

          return (
            <button
              key={status}
              type="button"
              onClick={() => onSelect(status)}
              aria-current={selected ? "page" : undefined}
              className={`rounded-md px-3 py-1.5 text-[11px] transition ${
                selected
                  ? "bg-white font-semibold text-[#252B36] shadow-sm"
                  : "text-[#7A818C] hover:text-[#354052]"
              }`}
            >
              {status === "Tous" ? "Toutes" : statusLabels[status]}
              <span className="ml-1.5 text-[10px] text-[#9AA3B0]">{count}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
