import type React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ServiceState } from "@/types/services/services";
import "./styles.css";

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

  const { statusClass } = getStatusInfo();

  return (
    <div className={`custom-node ${selected ? "selected" : ""}`}>
      <Handle
        type="target"
        position={Position.Left}
        className="custom-handle"
      />

      <div className={`status-indicator ${statusClass}`}>
        <span className="status-dot"></span>
      </div>

      {!!data.icon && (
        <div className="service-icon">
          <img
            src={(data.icon as string) || "/placeholder.svg"}
            alt={`${data.label} icon`}
          />
        </div>
      )}

      <div className="service-name">{data.label as string}</div>

      <Handle
        type="source"
        position={Position.Right}
        className="custom-handle"
      />
    </div>
  );
};

export default CustomNode;
