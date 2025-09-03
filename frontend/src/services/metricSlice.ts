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

interface MetricsState {
  projectId: string | null;
  oldProjectId: string | null;
  metrics: Record<
    string,
    {
      cpuUsage: CpuUsage[];
      diskUsage: DiskUsage[];
      memoryUsage: MemoryUsage[];
      logs: string[];
    }
  >;
}

const initialState: MetricsState = {
  projectId: null,
  oldProjectId: null,
  metrics: {},
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

      if (!state.metrics[projectId]) {
        state.metrics[projectId] = {
          cpuUsage: [],
          diskUsage: [],
          memoryUsage: [],
          logs: [],
        };
      }

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

      if (!state.metrics[projectId]) {
        state.metrics[projectId] = {
          cpuUsage: [],
          diskUsage: [],
          memoryUsage: [],
          logs: [],
        };
      }

      state.metrics[projectId].logs = action.payload.logs;
    },
  },
});

export const { setMetrics, setLogs, setProjectId } = metricSlice.actions;

export default metricSlice;
