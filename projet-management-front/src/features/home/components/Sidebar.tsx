// import { useState } from "react";
// import { CalendarDays, ChevronDown, ListTodo, Users } from "lucide-react";


// function Sidebar({ tasks }) {
//   const [teamOpen, setTeamOpen] = useState(true);
//   const [todoOpen, setTodoOpen] = useState(true);

//   return (
//     <aside className="w-[220px] shrink-0 bg-[#FAFBFE] px-3 py-6 max-md:w-[75px] max-md:px-2">
//       {/* Logo */}
//       <div className="mb-8 flex items-center gap-2 px-3">
//         <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1556D9] text-white">
//           <span className="text-lg font-bold">✣</span>
//         </div>
//         <span className="text-[17px] font-bold tracking-tight text-[#15233B] max-md:hidden">
//           HealDocs
//         </span>
//       </div>

//       {/* Navigation */}
//       <nav className="space-y-2 text-[12px] text-[#252B36]">
//         <button className="flex h-10 w-full items-center gap-3 rounded-lg px-3 transition hover:bg-blue-50">
//           <CalendarDays size={15} />
//           <span className="max-md:hidden">Overview</span>
//         </button>

//         {/* Team mates */}
//         <div>
//           <button
//             onClick={() => setTeamOpen(!teamOpen)}
//             className="flex h-10 w-full items-center justify-between rounded-lg px-3 hover:bg-blue-50"
//           >
//             <span className="flex items-center gap-3">
//               <Users size={16} />
//               <span className="max-md:hidden">Team Mates</span>
//             </span>
//             <ChevronDown
//               size={14}
//               className={`max-md:hidden transition-transform ${
//                 teamOpen ? "" : "-rotate-90"
//               }`}
//             />
//           </button>

//           {teamOpen && (
//             <div className="ml-5 border-l border-[#E4E8EF] pl-4 max-md:hidden">
//               {["Akash Singh", "Vaibhav Kumar", "Piyush Raj", "Nitesh Rajput"].map(
//                 (name) => (
//                   <div
//                     key={name}
//                     className="relative flex h-7 items-center text-[11px] text-[#7A8492] before:absolute before:-left-4 before:top-0 before:h-4 before:w-3 before:rounded-bl-lg before:border-b before:border-l before:border-[#E4E8EF]"
//                   >
//                     {name}
//                   </div>
//                 )
//               )}
//             </div>
//           )}
//         </div>

//         {/* Todo list */}
//         <div>
//           <button
//             onClick={() => setTodoOpen(!todoOpen)}
//             className="flex h-10 w-full items-center justify-between rounded-xl bg-[#DCE9FF] px-3 font-semibold text-[#24364B]"
//           >
//             <span className="flex items-center gap-3">
//               <ListTodo size={16} />
//               <span className="max-md:hidden">Todo List</span>
//             </span>
//             <ChevronDown
//               size={14}
//               className={`max-md:hidden transition-transform ${
//                 todoOpen ? "" : "-rotate-90"
//               }`}
//             />
//           </button>

//           {todoOpen && (
//             <div className="ml-5 mt-2 border-l border-[#E4E8EF] pl-4 max-md:hidden">
//               {tasks.map((task) => (
//                 <div
//                   key={task.id}
//                   className="relative flex min-h-8 items-center text-[11px] text-[#7A8492] before:absolute before:-left-4 before:top-0 before:h-4 before:w-3 before:rounded-bl-lg before:border-b before:border-l before:border-[#E4E8EF]"
//                 >
//                   <span className="truncate">{task.title}</span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </nav>
//     </aside>
//   );
// }

// export default Sidebar;


import {
  ListTodo,
  CalendarDays,
  FolderKanban,
  LogOut,
  ChevronRight,
  Users,
} from "lucide-react";
import { useState } from "react";
import type { User } from "../../auth/interfaces/user";

type Task = {
  id: string | number;
  title: string;
  completed?: boolean;
};

const managerMenuItems = [
  {
    name: "Overview",
    icon: CalendarDays,
  },
  {
    name: "Todo List",
    icon: ListTodo,
  },
  {
    name: "Team Mates",
    icon: Users,
  },
  {
    name: "Projects",
    icon: FolderKanban,
  },
];

export default function Sidebar({
  tasks = [] as Task[],
  currentPage = "Overview",
  onNavigate = () => {},
  user,
  teamMembers = [],
  onLogout,
}: {
  tasks?: Task[];
  currentPage?: string;
  onNavigate?: (page: string) => void;
  user?: User | null;
  teamMembers?: User[];
  onLogout?: () => void;
}) {
  const [teamOpen, setTeamOpen] = useState(true);
  const [todoOpen, setTodoOpen] = useState(true);
  const menuItems = user?.role_id === 2
    ? managerMenuItems.filter((item) => ["Overview", "Todo List", "Projects"].includes(item.name))
    : user?.role_id === 3
      ? managerMenuItems.filter((item) => ["Overview", "Todo List", "Projects"].includes(item.name))
    : managerMenuItems;
  return (
    <aside className="flex h-full w-[230px] shrink-0 flex-col border-r border-[#EEF0F4] bg-white">

      {/* Logo */}
      <div className="flex h-[76px] shrink-0 items-center border-b border-[#EEF0F4] px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1556D9] text-white">
            <span className="text-lg font-bold">✣</span>
          </div>
          <span className="text-[17px] font-bold tracking-tight text-[#15233B] max-md:hidden">
            HealDocs
          </span>

        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6">

        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = currentPage === item.name;
            const Icon = item.icon;

            return (
              <div>
                <button
                  key={item.name}
                  onClick={() => onNavigate(item.name)}
                  className={`group relative flex w-full items-center gap-3 rounded-lg px-4 py-3 text-[12px] transition-all duration-200 ${
                    isActive
                      ? "bg-[#EAF0FF] font-semibold text-[#1556E8]"
                      : "font-medium text-[#858C98] hover:bg-[#F5F7FB] hover:text-[#354052]"
                  }`}
                >
                  {/* Icon */}
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.3 : 1.8}
                    className={`shrink-0 transition-colors ${
                      isActive
                        ? "text-[#1556E8]"
                        : "text-[#9AA3B0] group-hover:text-[#536071]"
                    }`}
                  />

                  {/* Label */}
                  <span className="flex-1 text-left">
                    {item.name}
                  </span>

                  {/* Active arrow */}
                  {item.name === "Todo List"  && (
                    <ChevronRight
                      size={14}
                      className={`${isActive ? "text-[#1556E8]" : "text-[#858C98]"} ${todoOpen ? "rotate-90" : ""} transition-transform`}
                      onClick={() => setTodoOpen(!todoOpen)}
                    />
                  )}
                  {item.name === "Team Mates"  && (
                    <ChevronRight
                      size={14}
                      className={`${isActive ? "text-[#1556E8]" : "text-[#858C98]"} ${teamOpen ? "rotate-90" : ""} transition-transform`}
                      onClick={() => setTeamOpen(!teamOpen)}
                      />
                  )}

                  
                </button>

                {item.name === "Team Mates" && !teamOpen && (
                  <div className="ml-5 border-l border-[#E4E8EF] pl-4 max-md:hidden">
                    {teamMembers.slice(0, 5).map((member) => (
                        <div
                          key={member.id}
                          className="relative flex h-7 items-center text-[11px] text-[#7A8492] before:absolute before:-left-4 before:top-0 before:h-4 before:w-3 before:rounded-bl-lg before:border-b before:border-l before:border-[#E4E8EF]"
                        >
                          {member.name}
                        </div>
                      ))}
                  </div>
                )}

                {item.name === "Todo List" && !todoOpen && (
                  <div className="ml-5 mt-2 border-l border-[#E4E8EF] pl-4 max-md:hidden">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="relative flex min-h-8 items-center text-[11px] text-[#7A8492] before:absolute before:-left-4 before:top-0 before:h-4 before:w-3 before:rounded-bl-lg before:border-b before:border-l before:border-[#E4E8EF]"
                      >
                        <span className="truncate">{task.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
          );
          })}
        </nav>

        
      </div>

      {/* Bottom profile */}
      <div className="shrink-0 border-t border-[#EEF0F4] p-2">
        <div className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-[#F8F9FC]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F8E7C9] text-lg">
            👨🏻
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold text-[#354052]">
              {user?.name ?? "Manager"}
            </p>
            <p className="text-[10px] text-[#9AA3B0]">
              {user?.role?.titre?.replace("_", " ") ?? "Manager"}
            </p>
          </div>

          <button
            type="button"
            title="Déconnexion"
            onClick={onLogout}
            className="text-[#9AA3B0] transition hover:text-red-500"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
