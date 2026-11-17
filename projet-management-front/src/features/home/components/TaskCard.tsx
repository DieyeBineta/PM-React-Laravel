import { Check, MoreHorizontal } from "lucide-react";

type Task = {
  id: string | number;
  title: string;
  description: string;
  time: string;
  completed: boolean;
  color: string;
  status?: string;
  assignee?: string;
  project?: string;
};

type TaskCardProps = {
  task: Task;
  readOnly?: boolean;
  onToggle?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
};

function TaskCard({ task, readOnly = false, onToggle, onDelete }: TaskCardProps) {
  return (
    <article
      className={`group relative min-h-[150px] rounded-[14px] border border-[#E9EDF4] p-4 shadow-[0_3px_14px_rgba(30,50,90,0.025)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${task.color}`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {readOnly ? (
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#1556E8]" />
          ) : (
            <button
              onClick={() => onToggle?.(task.id)}
              aria-label="Changer le statut"
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[2px] border border-white/80 ${
                task.completed ? "bg-blue-600 text-white" : "bg-white"
              }`}
            >
              {task.completed && <Check size={12} />}
            </button>
          )}

          <h3
            className={`truncate text-[12px] font-semibold text-[#202631] ${
              task.completed && !readOnly ? "line-through opacity-50" : ""
            }`}
          >
            {task.title}
          </h3>
        </div>

        {readOnly && task.status && (
          <span className="shrink-0 rounded-full bg-white/75 px-2 py-1 text-[9px] font-semibold text-[#354052]">
            {task.status}
          </span>
        )}

        {!readOnly && (
          <button
            onClick={() => onDelete?.(task.id)}
            aria-label="Supprimer la tâche"
            className="rounded-md p-0.5 text-[#222831] transition hover:bg-white/50"
          >
            <MoreHorizontal size={19} />
          </button>
        )}
      </div>

      <p className="mb-2 line-clamp-2 min-h-[34px] text-[11px] leading-[17px] text-[#59616D]">
        {task.description}
      </p>

      {readOnly && task.project && (
        <p className="truncate text-[10px] font-medium text-[#536071]">{task.project}</p>
      )}
      {readOnly && task.assignee && (
        <p className="mt-1 truncate text-[10px] text-[#536071]">Assignée à {task.assignee}</p>
      )}
      <p className="mt-1 text-[10px] text-[#536071]">{task.time}</p>
    </article>
  );
}

export default TaskCard;