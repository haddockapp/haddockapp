import React, { ReactNode } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import "./styles.css";
import { ServiceState } from "@/types/services/services";

const CustomNode: React.FC<NodeProps> = ({ data }) => {
  const status =
    (data.status as keyof typeof ServiceState) in ServiceState
      ? (data.status as keyof typeof ServiceState)
      : ServiceState.Stopped;
  return (
    <div className={`custom-node ${status}`}>
      <Handle
        type="target"
        position={Position.Left}
        className="custom-handle"
      />
      <span>{data.label as ReactNode}</span>
      <Handle
        type="source"
        position={Position.Right}
        className="custom-handle"
      />
    </div>
  );
};

export default CustomNode;
