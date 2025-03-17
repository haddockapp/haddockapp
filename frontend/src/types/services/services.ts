export enum ServiceState {
  Running = "Running",
  Starting = "Starting",
  Stopped = "Stopped",
}

export type NodePositions = Record<string, { x: number; y: number }>;

export type ReactFlowStateStorage = {
  servicesPositions: NodePositions;
  showEdges: boolean;
};
