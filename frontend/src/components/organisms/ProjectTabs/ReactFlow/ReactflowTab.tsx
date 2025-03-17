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
  MiniMap,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerContent,
} from "@/components/ui/drawer";
import ServiceDrawerContent from "../../ServicesDrawer/ServiceDrawerContent";
import { ReactFlowStateStorage } from "@/types/services/services";
import {
  calculateCircularPosition,
  defineInitalNodes,
  defineInitialEdges,
} from "./utils";
import CustomNode from "./CustomNode";
import CheckBoxWithText from "@/components/molecules/text-checkbox";

interface ReactflowTabProps {
  projectId: string;
}

const ReactflowTab: FC<ReactflowTabProps> = ({ projectId }) => {
  const { data: services } = useGetServicesByProjectIdQuery(projectId ?? "");
  const initialNodes: Node[] = defineInitalNodes(services ?? []);
  const initialEdges: Edge[] = defineInitialEdges(services ?? []);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [showEdges, setShowEdges] = useState(true);
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
      const initialState: ReactFlowStateStorage = JSON.parse(
        localStorage.getItem(`${projectId}FlowState`) ?? "{}"
      );
      setShowEdges(initialState.showEdges ?? true);
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
      const currentNodesPositions: ReactFlowStateStorage = JSON.parse(
        localStorage.getItem(`${projectId}FlowState`) ?? "{}"
      );
      if (!currentNodesPositions.servicesPositions) {
        currentNodesPositions.servicesPositions = {};
      }
      currentNodesPositions.servicesPositions[node.id] = {
        x: node.position.x,
        y: node.position.y,
      };
      localStorage.setItem(
        `${projectId}FlowState`,
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

  const onChangeShowEdges = (checked: boolean) => {
    setShowEdges(checked);
    const currentFlowState: ReactFlowStateStorage = JSON.parse(
      localStorage.getItem(`${projectId}FlowState`) ?? "{}"
    );
    currentFlowState.showEdges = checked;
    localStorage.setItem(
      `${projectId}FlowState`,
      JSON.stringify(currentFlowState)
    );
  };

  return (
    <div className="mt-2 h-[75vh]" ref={reactFlowWrapper}>
      {(services?.length === 0 || !services) && (
        <>
          <h1 className="text-3xl font-bold my-8">Services</h1>
          <div className="flex flex-column items-center">
            <p className="text-lg">No services found</p>
          </div>
        </>
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
          <div className="relative border-4 border-gray-200 rounded-lg shadow-lg w-full h-full">
            <ReactFlow
              nodes={nodes}
              edges={showEdges ? edges : []}
              onNodesChange={onNodesChange}
              onNodeClick={onNodeClick}
              onPaneClick={() => setSelectedService(null)}
              onNodeDragStop={onNodeDragStop}
              nodeTypes={{ custom: CustomNode }}
              fitView
            >
              <Background />
              <Controls />
              <MiniMap />
              <CheckBoxWithText
                id="showEdges"
                text="Show Edges"
                checked={showEdges}
                onCheckedChange={(checked) => onChangeShowEdges(checked)}
                containerClassName="absolute top-2 right-2 z-10"
              />
            </ReactFlow>
          </div>
        </>
      )}
    </div>
  );
};

export default ReactflowTab;
