import type React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ServiceState } from "@/types/services/services";
import "./styles.css";
import { cn } from "@/lib/utils";

const CustomNode: React.FC<NodeProps> = ({ data, selected }) => {
  const status = data.status || ServiceState.Stopped;

  const getStatusInfo = () => {
    switch (status) {
      case ServiceState.Running:
        return {
          statusClass: "running",
          statusLabel: "Running",
        };
      case ServiceState.Starting:
        return {
          statusClass: "starting",
          statusLabel: "Starting",
        };
      default:
        return {
          statusClass: "stopped",
          statusLabel: "Stopped",
        };
    }
  };

  const { statusClass, statusLabel } = getStatusInfo();

  return (
    <div
      className={cn(
        "relative flex w-[260px] flex-col overflow-hidden rounded-2xl border p-0 shadow-lg backdrop-blur-xl transition-all duration-500 group",
        // Light Mode
        "border-slate-200 bg-white/80 hover:border-slate-300 hover:bg-white",
        // Dark Mode
        "dark:border-white/10 dark:bg-zinc-900/80 dark:hover:border-white/20 dark:hover:bg-zinc-900",

        selected
          ? "ring-1 ring-primary/50 scale-105"
          : "hover:shadow-xl hover:-translate-y-1 dark:hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.1)]"
      )}
    >
      {/* Top Status Line Glow */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-1 transition-all duration-500",
          statusClass === "running"
            ? "bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0 opacity-60 group-hover:opacity-100 shadow-[0_2px_10px_rgba(16,185,129,0.3)]"
            : statusClass === "starting"
            ? "bg-gradient-to-r from-amber-500/0 via-amber-500 to-amber-500/0 opacity-60 group-hover:opacity-100 shadow-[0_2px_10px_rgba(245,158,11,0.3)]"
            : "bg-gradient-to-r from-rose-500/0 via-rose-500 to-rose-500/0 opacity-60 group-hover:opacity-100 shadow-[0_2px_10px_rgba(244,63,94,0.3)]"
        )}
      />

      <div className="flex items-center gap-4 p-4 z-10">
        <Handle
          type="target"
          position={Position.Left}
          className={cn(
            "!h-2 !w-2 !border-0 transition-all backdrop-blur-sm",
            // Light
            "!bg-slate-400",
            // Dark
            "dark:!bg-white/20",
            "group-hover:!bg-primary group-hover:!h-3 group-hover:!w-3 py-0"
          )}
        />

        {/* Service Icon with Glass Tile */}
        <div
          className={cn(
            "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-inner transition-transform duration-500 group-hover:scale-110",
            // Light
            "border-white/40 bg-white/40 group-hover:bg-white/60",
            // Dark
            "dark:border-white/10 dark:bg-white/5 dark:group-hover:bg-white/10"
          )}
        >
          {/* Inner glow behind icon */}
          <div
            className={cn(
              "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-20 blur-md",
              statusClass === "running"
                ? "bg-emerald-500"
                : statusClass === "starting"
                ? "bg-amber-500"
                : "bg-rose-500"
            )}
          />

          <img
            src={(data.icon as string) || "/placeholder.svg"}
            alt={`${data.label} icon`}
            className="h-7 w-7 object-contain relative z-10 drop-shadow-sm"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        </div>

        <div className="flex flex-col min-w-0">
          <span
            className={cn(
              "font-semibold text-sm truncate tracking-wide transition-colors",
              // Light
              "text-slate-800 group-hover:text-black",
              // Dark
              "dark:text-slate-200 dark:group-hover:text-white"
            )}
            title={data.label as string}
          >
            {data.label as string}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={cn(
                "flex h-1.5 w-1.5 rounded-full shadow-sm",
                statusClass === "running"
                  ? "bg-emerald-500 animate-pulse"
                  : statusClass === "starting"
                  ? "bg-amber-500 animate-pulse"
                  : "bg-rose-500"
              )}
            />
            <span
              className={cn(
                "text-[10px] uppercase font-bold tracking-widest",
                statusClass === "running"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : statusClass === "starting"
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-rose-600 dark:text-rose-400"
              )}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        <Handle
          type="source"
          position={Position.Right}
          className={cn(
            "!h-2 !w-2 !border-0 transition-all backdrop-blur-sm",
            // Light
            "!bg-slate-400",
            // Dark
            "dark:!bg-white/20",
            "group-hover:!bg-primary group-hover:!h-3 group-hover:!w-3"
          )}
        />
      </div>

      {/* Decorative gradient sheen/shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-all duration-700 pointer-events-none bg-gradient-to-tr from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transform-gpu ease-out" />
    </div>
  );
};

export default CustomNode;
