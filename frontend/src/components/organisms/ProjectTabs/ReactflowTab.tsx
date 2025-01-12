import {
  ServiceDto,
  useGetServicesByProjectIdQuery,
} from "@/services/backendApi/services";
import { FC, useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  applyNodeChanges,
  Edge,
  Node,
  NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { mockedNodes } from "./mock";
import {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerContent,
} from "@/components/ui/drawer";
import ServiceDrawerContent from "../ServicesDrawer/ServiceDrawerContent";

interface ReactflowTabProps {
  services?: ServiceDto[];
  projectId: string;
}

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
      position: { x: 0, y: 0 },
    } as Node;
  });
};

const modifyNodePosition = (nodes: ServiceDto[], edges: Edge[]): Node[] => {
  const positions: { [name: string]: { x: number; y: number } } = {};
  const clusters: string[][] = [];

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

  return nodes.map((node) => ({
    id: node.name,
    position: { x: positions[node.name].x, y: positions[node.name].y },
    data: { label: node.name },
  }));
};

const ReactflowTab: FC<ReactflowTabProps> = ({ projectId }) => {
  // const { data: services } = useGetServicesByProjectIdQuery(projectId ?? "");
  const services = mockedNodes;
  const initialNodes: Node[] = defineInitalNodes(services ?? []);
  const initialEdges: Edge[] = defineInitialEdges(services ?? []);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selectedService, setSelectedService] = useState<ServiceDto | null>(
    null
  );
  useMemo(() => {
    if (services) {
      const newEdges = defineInitialEdges(services);
      const newNodes = modifyNodePosition(services, newEdges);
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [services]);
  const onNodesChange = useCallback(
    (changes: NodeChange<Node>[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedService(
      services?.find((service) => service.name === node.id) || null
    );
  };
  return (
    <div className="h-screen w-full mx-8">
      <h1 className="text-3xl font-bold my-8">Services</h1>
      {(services?.length === 0 || !services) && (
        <div className="flex flex-column items-center">
          <p className="text-lg">No services found</p>
        </div>
      )}
      {services && (
        <>
          <Drawer
            direction="right"
            open={selectedService !== null}
            onClose={() => setSelectedService(null)}
            modal={false}
          >
            <DrawerPortal>
              <DrawerOverlay className="fixed inset-0 z-0 bg-black/40" />
              <DrawerContent className="right-0 top-0 bottom-0 fixed z-10 flex outline-none w-2/5">
                <ServiceDrawerContent
                  service={selectedService}
                  projectId={projectId}
                />
              </DrawerContent>
            </DrawerPortal>
          </Drawer>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onNodeClick={onNodeClick}
            onPaneClick={() => setSelectedService(null)}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </>
      )}
    </div>
  );
};

export default ReactflowTab;
