import { useGetServicesByProjectIdQuery } from "@/services/backendApi/services";
import { FC, useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  applyNodeChanges,
  type Edge,
  type Node,
  type NodeChange,
  MiniMap,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { ReactFlowStateStorage } from "@/types/services/services";
import {
  calculateCircularPosition,
  defineInitialEdges,
  mockServiceStates,
} from "./utils";
import CustomNode from "./CustomNode";
import CheckBoxWithText from "@/components/molecules/text-checkbox";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import ServiceDrawer from "../../ServicesDrawer/ServiceDrawer";

interface ReactflowTabProps {
  projectId: string;
}

const ReactflowTab: FC<ReactflowTabProps> = ({ projectId }) => {
  const {
    data: originalServices,
    isLoading,
    refetch,
  } = useGetServicesByProjectIdQuery(projectId ?? "");

  // Mock service states for demonstration
  const services = useMemo(() => {
    return originalServices ? mockServiceStates(originalServices) : [];
  }, [originalServices]);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [showEdges, setShowEdges] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Initialize nodes and edges when services data is available
  useEffect(() => {
    if (services && services.length > 0) {
      const newNodes = calculateCircularPosition(services, projectId);
      const newEdges = defineInitialEdges(services);

      setNodes(newNodes);
      setEdges(newEdges);

      // Load saved state from localStorage
      const initialState: ReactFlowStateStorage = JSON.parse(
        localStorage.getItem(`${projectId}FlowState`) ?? "{}"
      );
      setShowEdges(initialState.showEdges ?? true);
    }
  }, [projectId, services]);

  // Handle node changes (position, selection)
  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  // Save node position when dragging stops
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

  // Toggle edge visibility
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

  // Handle node click to open drawer
  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedServiceId(node.id);
    setIsDrawerOpen(true);
  };

  const selectedService = useMemo(
    () => services?.find((s) => s.name === selectedServiceId) ?? null,
    [services, selectedServiceId]
  );

  // Get the selected service
  const selectedService = useMemo(() => {
    if (!selectedServiceId || !services) return null;
    return (
      services.find((service) => service.name === selectedServiceId) || null
    );
  }, [selectedServiceId, services]);

  // Node types for the ReactFlow component
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
    <div className="mt-2 h-[75vh] pt-8 relative">
      <div className="absolute inset-0 flex">
        {/* Main ReactFlow canvas */}
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

            {/* Control panel */}
            <Panel
              position="top-left"
              className="bg-white p-2 rounded-md shadow-md m-2"
            >
              <div className="flex flex-col gap-2">
                <CheckBoxWithText
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
                  <RefreshCw size={14} />
                  <span>Refresh</span>
                </Button>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Service drawer */}
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
