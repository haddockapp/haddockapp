import { useGetServicesByProjectIdQuery } from "@/services/backendApi/services";
import { FC, useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  ReactFlow,
  Controls,
  applyNodeChanges,
  Edge,
  Node,
  NodeChange,
  MiniMap,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  ServiceState,
  type ReactFlowStateStorage,
} from "@/types/services/services";
import { cn, formatShortcut } from "@/lib/utils";
import {
  generateServiceNodes,
  defineInitialEdges,
  getLayoutedElements,
} from "./utils";
import CustomNode from "./CustomNode";
import SwitchWithText from "@/components/molecules/text-switch";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import ServiceDrawer from "../../ServicesDrawer/ServiceDrawer";
import { useAppSelector } from "@/hooks/useStore";
import { Theme } from "@/services/settingsSlice";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

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

  const theme = useAppSelector((state) => state.settings.theme);
  const showCommands = useAppSelector((state) => state.settings.showCommands);
  const { toast } = useToast();

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [showEdges, setShowEdges] = useState(true);
  const [, setIsNodesInitialized] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isActuallyRefreshing, setIsActuallyRefreshing] = useState(false);

  useEffect(() => {
    if (!services) return;

    if (services.length === 0) {
      setTimeout(() => {
        refetch();
      }, 2000);
    }
  }, [services, refetch]);

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
    if (!services || services.length === 0) return;

    // Load saved state
    const currentFlowState: ReactFlowStateStorage = JSON.parse(
      localStorage.getItem(`${projectId}FlowState`) ?? "{}"
    );

    // Generate edges based on networks
    const generatedEdges = defineInitialEdges(services);

    // Generate initial nodes structure
    let initialNodes = generateServiceNodes(services, {});

    // Calculate default layout using Dagre (for ALL nodes)
    const layouted = getLayoutedElements(
      [...initialNodes],
      [...generatedEdges],
      "LR"
    );
    const defaultPositions: Record<string, { x: number; y: number }> = {};
    layouted.nodes.forEach((node) => {
      defaultPositions[node.id] = node.position;
    });

    const savedPositions = currentFlowState.servicesPositions || {};

    initialNodes = initialNodes.map((node) => ({
      ...node,
      position: savedPositions[node.id] ||
        defaultPositions[node.id] || { x: 0, y: 0 },
    }));

    setNodes(initialNodes);
    setEdges(generatedEdges);

    setShowEdges(currentFlowState.showEdges ?? true);
  }, [services, projectId]);

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

  const lastClickedNodeIdRef = useRef<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "d" || e.code === "KeyD")) {
        e.preventDefault();

        if (isDrawerOpen) {
          setIsDrawerOpen(false);
          setSelectedServiceId(null);
        } else {
          const lastId = lastClickedNodeIdRef.current;

          if (lastId) {
            setSelectedServiceId(lastId);
            setIsDrawerOpen(true);
          } else {
            toast({
              variant: "destructive",
              title: "No node selected",
              description:
                "Click on a service node first to enable this shortcut.",
              duration: 3000,
            });
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, toast]);

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedServiceId(node.id);
    lastClickedNodeIdRef.current = node.id;
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
      <div className="space-y-8">
        <h1 className="text-3xl font-bold my-8">Services</h1>
        <p className="text-typography/70">No services found.</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mt-2 h-[55vh] pt-8 relative w-full overflow-hidden rounded-2xl border border-border shadow-xl transition-colors duration-300",
        theme === Theme.DARK ? "bg-[#09090b]" : "bg-white"
      )}
    >
      {/* Background Grid Pattern */}
      {theme !== Theme.DARK && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(#000000 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      )}

      {/* Ambient Glow */}
      <div
        className={cn(
          "absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] pointer-events-none",
          theme === Theme.DARK ? "bg-primary/10" : "bg-primary/5"
        )}
      />

      <div className="absolute inset-0 flex">
        <motion.div
          className="flex-grow relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <ReactFlow
            nodes={nodes}
            edges={showEdges ? edges : []}
            onNodesChange={onNodesChange}
            onNodeClick={onNodeClick}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={nodeTypes}
            colorMode={theme === Theme.DARK ? "dark" : "light"}
            fitView
            className="bg-card/70"
            defaultEdgeOptions={{
              type: "default", // Bezier
              animated: true,
              style: {
                strokeWidth: 1.5,
                stroke:
                  theme === Theme.DARK
                    ? "rgba(255,255,255,0.3)"
                    : "rgba(0,0,0,0.15)",
              },
            }}
          >
            <Controls
              className={cn(
                "m-4 !backdrop-blur-md !shadow-lg !rounded-lg overflow-hidden [&>button]:!bg-transparent",
                theme === Theme.DARK
                  ? "!bg-white/10 !border-white/10 [&>button]:!border-white/10 [&>button]:!fill-white/70 [&>button:hover]:!bg-white/10 [&>button:hover]:!fill-white"
                  : "!bg-white/60 !border-black/5 [&>button]:!border-black/5 [&>button]:!fill-black/70 [&>button:hover]:!bg-black/5 [&>button:hover]:!fill-black"
              )}
            />
            <MiniMap
              className={cn(
                "m-4 !backdrop-blur-md !shadow-lg !rounded-lg overflow-hidden",
                theme === Theme.DARK
                  ? "!bg-white/10 !border-white/10"
                  : "!bg-white/60 !border-black/5"
              )}
              nodeColor={(n) => {
                const status = n.data?.status as ServiceState;
                if (status === ServiceState.Running) return "#10b981";
                if (status === ServiceState.Starting) return "#f59e0b";
                return "#f43f5e";
              }}
              maskColor={
                theme === Theme.DARK
                  ? "rgba(0,0,0,0.6)"
                  : "rgba(255,255,255,0.6)"
              }
            />

            <Panel
              position="top-left"
              className={cn(
                "backdrop-blur-xl border py-2 px-4 rounded-xl shadow-sm m-4 flex items-center gap-4 transition-all",
                "bg-card/10 border-border/80 hover:border-border hover:bg-card/20"
              )}
            >
              <div className="flex flex-col gap-2">
                <div
                  className={cn(
                    "text-sm font-medium",
                    theme === Theme.DARK ? "text-white/90" : "text-slate-800"
                  )}
                >
                  <SwitchWithText
                    id="showEdges"
                    text="Show Connections"
                    checked={showEdges}
                    onCheckedChange={onChangeShowEdges}
                  />
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className={cn(
                    "h-8 flex items-center gap-2 justify-start px-2 p-0 w-full",
                    theme === Theme.DARK
                      ? "text-white/60 hover:text-white hover:bg-white/5"
                      : "text-slate-500 hover:text-slate-900 hover:bg-black/5"
                  )}
                  onClick={() => refetch()}
                >
                  <RefreshCw
                    size={14}
                    className={cn(isActuallyRefreshing ? "animate-spin" : "")}
                  />
                  <span className="text-xs tracking-wide font-semibold">
                    REFRESH
                  </span>
                </Button>

                {showCommands && (
                  <div
                    className={cn(
                      "pt-2 mt-1 border-t flex items-center justify-between",
                      theme === Theme.DARK
                        ? "border-white/10"
                        : "border-black/5"
                    )}
                  >
                    <span
                      className={cn(
                        "text-[10px] font-medium",
                        theme === Theme.DARK
                          ? "text-white/40"
                          : "text-slate-400"
                      )}
                    >
                      Open Last Node
                    </span>
                    <kbd
                      className={cn(
                        "pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100",
                        theme === Theme.DARK
                          ? "bg-white/5 border-white/10 text-white/50"
                          : "bg-slate-100 border-slate-200 text-slate-500"
                      )}
                    >
                      {formatShortcut("⌘ + D")}
                    </kbd>
                  </div>
                )}
              </div>
            </Panel>
          </ReactFlow>
        </motion.div>

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
