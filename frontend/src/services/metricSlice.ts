import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type CpuUsage = {
  user: number;
  system: number;
  idle: number;
  percent: number;

  timestamp?: string;
};

export type MemoryUsage = {
  total: number;
  available: number;
  percent: number;

  timestamp?: string;
};

export type DiskUsage = {
  total: number;
  percent: number;
  used: number;
  free: number;

  timestamp?: string;
};

export type MetricsData = {
  cpuUsage: CpuUsage[];
  diskUsage: DiskUsage[];
  memoryUsage: MemoryUsage[];
  logs: string[];
  buildLogs: string[];
  isAlert: boolean;
};

interface MetricsState {
  projectId: string | null;
  oldProjectId: string | null;
  metrics: Record<string, MetricsData>;
}

const initialState: MetricsState = {
  projectId: null,
  oldProjectId: null,
  metrics: {},
};

const initializeMetrics = (
  state: Record<string, MetricsData>,
  projectId: string
) => {
  if (!!state[projectId]) return;

  state[projectId] = {
    cpuUsage: [] as CpuUsage[],
    diskUsage: [] as DiskUsage[],
    memoryUsage: [] as MemoryUsage[],
    logs: [] as string[],
    buildLogs: [] as string[],
    isAlert: false,
  };
};

const metricSlice = createSlice({
  name: "metric",
  initialState,
  reducers: {
    setProjectId(state, action: PayloadAction<string | null>) {
      if (!action.payload) {
        state.oldProjectId = state.projectId;
      }
      state.projectId = action.payload;
    },
    setBuildLogs(
      state,
      action: PayloadAction<{ projectId: string; buildLogs: string[] }>
    ) {
      const projectId = action.payload.projectId;
      initializeMetrics(state.metrics, projectId);
      const oldBatch = state.metrics[projectId].buildLogs;
      const newBatch = action.payload.buildLogs;

      state.metrics[projectId].buildLogs = [...oldBatch, ...newBatch];
    },
    setAlert(
      state,
      action: PayloadAction<{ projectId: string; isAlert: boolean }>
    ) {
      const projectId = action.payload.projectId;
      initializeMetrics(state.metrics, projectId);

      state.metrics[projectId].isAlert = action.payload.isAlert;
    },
    setMetrics(
      state,
      action: PayloadAction<{
        projectId: string;
        cpuUsage: CpuUsage;
        diskUsage: DiskUsage;
        memoryUsage: MemoryUsage;
      }>
    ) {
      const timestamp = new Date().toUTCString();
      const projectId = action.payload.projectId;
      initializeMetrics(state.metrics, projectId);

      state.metrics[projectId].cpuUsage = [
        ...state.metrics[projectId].cpuUsage,
        { ...action.payload.cpuUsage, timestamp },
      ].slice(-50);
      state.metrics[projectId].diskUsage = [
        ...state.metrics[projectId].diskUsage,
        { ...action.payload.diskUsage, timestamp },
      ].slice(-50);
      state.metrics[projectId].memoryUsage = [
        ...state.metrics[projectId].memoryUsage,
        { ...action.payload.memoryUsage, timestamp },
      ].slice(-50);
    },
    setLogs(
      state,
      action: PayloadAction<{ projectId: string; logs: string[] }>
    ) {
      const projectId = action.payload.projectId;
      initializeMetrics(state.metrics, projectId);

      state.metrics[projectId].logs = action.payload.logs;
    },
  },
});

export const { setMetrics, setLogs, setProjectId, setBuildLogs, setAlert } =
  metricSlice.actions;

export default metricSlice;
