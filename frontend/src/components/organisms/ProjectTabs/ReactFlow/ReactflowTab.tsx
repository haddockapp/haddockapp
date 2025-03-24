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
import Divider from "@/components/atoms/divider";

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

  const handlePaneClick = () => {
    setSelectedService(null);
  };

  return (
    <div className="mt-2 h-[75vh] pt-8">
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
          <Drawer direction="right" open={selectedService !== null}>
            <DrawerPortal>
              <DrawerOverlay className="fixed inset-0 z-30 bg-black/40" />
              <DrawerContent className="right-0 top-0 bottom-0 fixed z-50 flex outline-none w-2/5">
                <ServiceDrawerContent
                  service={selectedService}
                  projectId={projectId}
                />
              </DrawerContent>
            </DrawerPortal>
          </Drawer>
          <Divider />
          <div className="relative w-full h-full z-40">
            <ReactFlow
              className="z-40"
              nodes={nodes}
              edges={showEdges ? edges : []}
              onNodesChange={onNodesChange}
              onNodeClick={onNodeClick}
              onPaneClick={handlePaneClick}
              onNodeDragStop={onNodeDragStop}
              nodeTypes={{ custom: CustomNode }}
              fitView
            >
              <Background className="z-40" />
              <Controls className="z-40" />
              <MiniMap className="z-40" />
              <CheckBoxWithText
                id="showEdges"
                text="Show Edges"
                checked={showEdges}
                onCheckedChange={(checked) => onChangeShowEdges(checked)}
                containerClassName="absolute top-2 left-2 z-50"
              />
            </ReactFlow>
          </div>
        </>
      )}
    </div>
  );
};

export default ReactflowTab;
