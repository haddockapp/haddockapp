import { ServiceDto } from "@/services/backendApi/services";
import { NodePositions } from "@/types/services/services";
import { Edge, Node } from "@xyflow/react";

const checkEdgeConditions = (nodeA: ServiceDto, nodeB: ServiceDto) => {
  const networksA = nodeA.networks || [];
  const networksB = nodeB.networks || [];
  if (networksA.length === 0 && networksB.length === 0) {
    return true;
  }
  if (
    (networksA.length === 0 && networksB.includes("default")) ||
    (networksB.length === 0 && networksA.includes("default"))
  ) {
    return true;
  }
  if (networksA.some((network) => networksB.includes(network))) {
    return true;
  }
  return false;
};

const defineInitialEdges = (services: ServiceDto[]): Edge[] => {
  const edges: Edge[] = [];
  for (let i = 0; i < services.length; i++) {
    for (let j = i + 1; j < services.length; j++) {
      const nodeA = services[i];
      const nodeB = services[j];
      if (checkEdgeConditions(nodeA, nodeB)) {
        edges.push({
          id: `${nodeA.name}-${nodeB.name}`,
          source: nodeA.name,
          target: nodeB.name,
          animated: true,
        });
      }
    }
  }
  return edges;
};

const defineInitalNodes = (services: ServiceDto[]): Node[] => {
  return services.map((service) => {
    return {
      id: service.name,
      data: { label: service.name },
      style: { borderColor: "green", borderWidth: 2 },
      position: { x: 0, y: 0 },
      type: "custom",
    } as Node;
  });
};

const modifyNodePosition = (
  nodes: ServiceDto[],
  edges: Edge[],
  projectId: string
): Node[] => {
  const positions: { [name: string]: { x: number; y: number } } = {};
  const clusters: string[][] = [];
  const initialNodesPositions: NodePositions = JSON.parse(
    localStorage.getItem(`${projectId}ServicePositions`) ?? "{}"
  );

  edges.forEach((edge) => {
    const sourceCluster = clusters.find((cluster) =>
      cluster.includes(edge.source)
    );
    const targetCluster = clusters.find((cluster) =>
      cluster.includes(edge.target)
    );

    if (sourceCluster && targetCluster && sourceCluster !== targetCluster) {
      sourceCluster.push(...targetCluster);
      clusters.splice(clusters.indexOf(targetCluster), 1);
    } else if (sourceCluster) {
      sourceCluster.push(edge.target);
    } else if (targetCluster) {
      targetCluster.push(edge.source);
    } else {
      clusters.push([edge.source, edge.target]);
    }
  });

  nodes.forEach((node) => {
    if (!clusters.some((cluster) => cluster.includes(node.name))) {
      clusters.push([node.name]);
    }
  });

  const clusterSpacing = 500;
  const nodeSpacing = 150;
  let clusterX = 0;

  clusters.forEach((cluster, clusterIndex) => {
    const clusterY = clusterIndex * clusterSpacing;

    cluster.forEach((nodeName, index) => {
      positions[nodeName] = {
        x: clusterX + (index % 5) * nodeSpacing,
        y: clusterY + Math.floor(index / 5) * nodeSpacing,
      };
    });

    clusterX += clusterSpacing;
  });

  const getNodePosition = (name: string) => {
    if (initialNodesPositions[name]) {
      return initialNodesPositions[name];
    }
    return positions[name];
  };

  return nodes.map((node) => ({
    id: node.name,
    position: getNodePosition(node.name),
    data: { label: node.name },
    type: "custom",
  }));
};

export { defineInitialEdges, defineInitalNodes, modifyNodePosition };
