import React from "react";
import { NodeProps } from "@xyflow/react";
import "./styles.css"; // Importation du CSS global

const CustomNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div className="custom-node Stopped">
      <span>{data.label}</span>
    </div>
  );
};

export default CustomNode;
