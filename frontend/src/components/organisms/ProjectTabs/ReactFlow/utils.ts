import type { ServiceDto } from "@/services/backendApi/services";
import type { ReactFlowStateStorage } from "@/types/services/services";
import type { Edge } from "@xyflow/react";
import { ServiceState } from "@/types/services/services";

// Helper function to check if two services should be connected
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

// Create edges between services based on network connections
export const defineInitialEdges = (services: ServiceDto[]): Edge[] => {
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
    const status = service.status ?? "unknown";
    return {
      id: service.name,
      data: { label: service.name, status: status ?? undefined },
      style: { borderColor: "green", borderWidth: 2 },
      position: { x: 0, y: 0 },
      type: "custom",
    } as Node;
  });
};

// Calculate positions for nodes in a circular layout
export const calculateCircularPosition = (
  services: ServiceDto[],
  projectId: string,
  center = { x: 500, y: 400 },
  baseSpacing = 250,
  minDistance = 150
) => {
  const networkGroups: Record<string, string[]> = {};
  const positions: Record<string, { x: number; y: number }> = {};
  const initialNodesPositions: ReactFlowStateStorage = JSON.parse(
    localStorage.getItem(`${projectId}FlowState`) ?? "{}"
  );

  // Group services by network
  services.forEach((service) => {
    const network = service.networks?.length > 0 ? service.networks[0] : "none";
    if (!networkGroups[network]) networkGroups[network] = [];
    networkGroups[network].push(service.name);
  });

  // Sort networks to ensure consistent layout
  const sortedNetworks = Object.keys(networkGroups).sort((a, b) => {
    if (a === "default") return -1;
    if (b === "default") return 1;
    return 0;
  });

  // Position nodes in a circular layout by network group
  sortedNetworks.forEach((network, networkIndex) => {
    let radius = baseSpacing + networkIndex * baseSpacing;
    const nodes = networkGroups[network];
    const angleStep = (2 * Math.PI) / nodes.length;

    nodes.forEach((node, index) => {
      // Use saved position if available
      if (initialNodesPositions.servicesPositions?.[node]) {
        positions[node] = initialNodesPositions.servicesPositions[node];
        return;
      }

      // Calculate new position
      let angle = index * angleStep;
      let x = center.x + radius * Math.cos(angle);
      let y = center.y + radius * Math.sin(angle);

      // Avoid overlapping nodes
      let iteration = 0;
      while (
        Object.values(positions).some(
          (pos) => Math.hypot(pos.x - x, pos.y - y) < minDistance
        ) &&
        iteration < 10
      ) {
        radius += 20;
        angle += angleStep / 5;
        x = center.x + radius * Math.cos(angle);
        y = center.y + radius * Math.sin(angle);
        iteration++;
      }

      positions[node] = { x, y };
    });
  });

  // Create nodes with positions and status
  return services.map((service) => ({
    id: service.name,
    position: positions[service.name] || { x: 0, y: 0 },
    data: {
      label: service.name,
      status: service.status ?? ServiceState.Stopped,
      icon: service.icon,
    },
    type: "custom",
  }));
};
