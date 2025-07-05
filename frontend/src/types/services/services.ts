export enum ServiceState {
  Running = "running",
  Starting = "starting",
  Stopped = "stopped",
}

export type NodePositions = Record<string, { x: number; y: number }>;

export type ReactFlowStateStorage = {
  servicesPositions: NodePositions;
  showEdges: boolean;
};
