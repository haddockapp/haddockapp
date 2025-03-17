import React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import "./styles.css";

const CustomNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div className="custom-node Running">
      <Handle
        type="target"
        position={Position.Left}
        className="custom-handle"
      />
      <span>{data.label}</span>
      <Handle
        type="source"
        position={Position.Right}
        className="custom-handle"
      />
    </div>
  );
};

export default CustomNode;
