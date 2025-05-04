import {FC} from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ServiceState } from "@/types/services/services";
import "./styles.css";

const CustomNode: FC<NodeProps> = ({ data, selected }) => {
  // Use the status from data or default to Stopped
    const status = (data.status as ServiceState) ?? ServiceState.Stopped;

  // Determine status indicator color and label
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

const CustomNode: React.FC<NodeProps> = ({ data }) => {
  const status = (data.status as ServiceState) ?? ServiceState.Stopped;
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

      {data.icon && (
        <div className="service-icon">
          <img
            src={data.icon || "/placeholder.svg"}
            alt={`${data.label} icon`}
          />
        </div>
      )}

      {/* Service name */}
      <div className="service-name">{data.label}</div>

      <Handle
        type="source"
        position={Position.Right}
        className="custom-handle"
      />
    </div>
  );
};

export default CustomNode;
