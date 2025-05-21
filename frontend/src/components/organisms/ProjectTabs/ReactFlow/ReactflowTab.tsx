import { useGetServicesByProjectIdQuery } from "@/services/backendApi/services";
import { FC, useState, useCallback, useMemo, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  applyNodeChanges,
  Edge,
  Node,
  NodeChange,
  MiniMap,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { ReactFlowStateStorage } from "@/types/services/services";
import { calculateCircularPosition, defineInitialEdges } from "./utils";
import CustomNode from "./CustomNode";
import SwitchWithText from "@/components/molecules/text-switch";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import ServiceDrawer from "../../ServicesDrawer/ServiceDrawer";

interface ReactflowTabProps {
  projectId: string;
}

const ReactflowTab: FC<ReactflowTabProps> = ({ projectId }) => {
  const {
    data: services,
    isLoading,
    isFetching,
    refetch,
  } = useGetServicesByProjectIdQuery(projectId ?? "");

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [showEdges, setShowEdges] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isActuallyRefreshing, setIsActuallyRefreshing] = useState(false);

  useEffect(() => {
    if (isFetching) {
      setIsActuallyRefreshing(true);

      const timeout = setTimeout(() => {
        if (!isFetching) {
          setIsActuallyRefreshing(false);
        }
      }, 1000);

      return () => clearTimeout(timeout);
    } else {
      if (isActuallyRefreshing) {
        setTimeout(() => {
          setIsActuallyRefreshing(false);
        }, 1000);
      }
    }
  }, [isFetching, isActuallyRefreshing]);

  useEffect(() => {
    if (services && services.length > 0) {
      const newNodes = calculateCircularPosition(services, projectId);
      const newEdges = defineInitialEdges(services);

      setNodes(newNodes);
      setEdges(newEdges);

      const initialState: ReactFlowStateStorage = JSON.parse(
        localStorage.getItem(`${projectId}FlowState`) ?? "{}"
      );
      setShowEdges(initialState.showEdges ?? true);
    }
  }, [projectId, services]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

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

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedServiceId(node.id);
    setIsDrawerOpen(true);
  };

  const selectedService = useMemo(() => {
    if (!selectedServiceId || !services) return null;
    return (
      services.find((service) => service.name === selectedServiceId) || null
    );
  }, [selectedServiceId, services]);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[75vh]">
        Loading services...
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <div className="mt-2 h-[75vh] pt-8">
        <h1 className="text-3xl font-bold my-8">Services</h1>
        <div className="flex flex-column items-center justify-center">
          <p className="text-lg">No services found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 h-[55vh] pt-8 relative">
      <div className="absolute inset-0 flex">
        <div className="flex-grow relative">
          <ReactFlow
            nodes={nodes}
            edges={showEdges ? edges : []}
            onNodesChange={onNodesChange}
            onNodeClick={onNodeClick}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-50"
          >
            <Background color="#9ca3af" gap={16} size={1} />
            <Controls className="m-2" />
            <MiniMap className="m-2" nodeColor="#6366f1" />

            <Panel
              position="top-left"
              className="bg-white p-2 rounded-md shadow-md m-2"
            >
              <div className="flex flex-col gap-2">
                <SwitchWithText
                  id="showEdges"
                  text="Show Connections"
                  checked={showEdges}
                  onCheckedChange={onChangeShowEdges}
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => refetch()}
                >
                  <RefreshCw
                    size={14}
                    className={isActuallyRefreshing ? "animate-spin" : ""}
                  />
                  <span>Refresh</span>
                </Button>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        <ServiceDrawer
          service={selectedService}
          projectId={projectId}
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelectedServiceId(null);
          }}
        />
      </div>
    </div>
  );
};

export default ReactflowTab;
