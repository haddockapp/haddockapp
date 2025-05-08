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
  cpuUsage: CpuUsage[];
  diskUsage: DiskUsage[];
  memoryUsage: MemoryUsage[];
  logs: string[];
}

const initialState: MetricsState = {
  projectId: null,
  oldProjectId: null,
  cpuUsage: [],
  diskUsage: [],
  memoryUsage: [],
  logs: [],
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
        cpuUsage: CpuUsage;
        diskUsage: DiskUsage;
        memoryUsage: MemoryUsage;
      }>
    ) {
      const timestamp = new Date().toTimeString();

      state.cpuUsage = [
        ...state.cpuUsage,
        { ...action.payload.cpuUsage, timestamp },
      ].slice(-50);
      state.diskUsage = [
        ...state.diskUsage,
        { ...action.payload.diskUsage, timestamp },
      ].slice(-50);
      state.memoryUsage = [
        ...state.memoryUsage,
        { ...action.payload.memoryUsage, timestamp },
      ].slice(-50);
    },
    setLogs(state, action: PayloadAction<string[]>) {
      state.logs = action.payload;
    },
  },
});

export const { setMetrics, setLogs, setProjectId } = metricSlice.actions;

export default metricSlice;
