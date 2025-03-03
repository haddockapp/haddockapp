import {
  ServiceDto,
  useGetServicesByProjectIdQuery,
} from "@/services/backendApi/services";
import { FC, useState, useCallback, useMemo, useEffect, useRef } from "react";
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
import {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerContent,
} from "@/components/ui/drawer";
import ServiceDrawerContent from "../../ServicesDrawer/ServiceDrawerContent";
import { NodePositions } from "@/types/services/services";
import {
  calculateCircularPosition,
  defineInitalNodes,
  defineInitialEdges,
} from "./utils";
import CustomNode from "./CustomNode";

interface ReactflowTabProps {
  projectId: string;
}

const ReactflowTab: FC<ReactflowTabProps> = ({ projectId }) => {
  const { data: services } = useGetServicesByProjectIdQuery(projectId ?? "");
  const initialNodes: Node[] = defineInitalNodes(services ?? []);
  const initialEdges: Edge[] = defineInitialEdges(services ?? []);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selectedService, setSelectedService] = useState<ServiceDto | null>(
    null
  );
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  useMemo(() => {
    if (services) {
      const newEdges = defineInitialEdges(services);
      const newNodes = calculateCircularPosition(services, projectId);
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [projectId, services]);
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
  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const currentNodesPositions: NodePositions = JSON.parse(
        localStorage.getItem(`${projectId}ServicePositions`) ?? "{}"
      );
      currentNodesPositions[node.id] = {
        x: node.position.x,
        y: node.position.y,
      };
      localStorage.setItem(
        `${projectId}ServicePositions`,
        JSON.stringify(currentNodesPositions)
      );
    },
    [projectId]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        reactFlowWrapper.current &&
        !reactFlowWrapper.current.contains(event.target as HTMLElement) &&
        drawerRef.current &&
        !drawerRef.current.contains(event.target as HTMLElement)
      ) {
        setSelectedService(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="h-screen w-full mx-8" ref={reactFlowWrapper}>
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
              <DrawerContent
                className="right-0 top-0 bottom-0 fixed z-10 flex outline-none w-2/5"
                ref={drawerRef}
              >
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
            onNodeDragStop={onNodeDragStop}
            nodeTypes={{ custom: CustomNode }}
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
