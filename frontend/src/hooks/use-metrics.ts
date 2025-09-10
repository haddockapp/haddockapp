import { MetricsData } from "@/services/metricSlice";
import { useAppSelector } from "./useStore";

export default (): MetricsData => {
  const { metrics, projectId } = useAppSelector((state) => state.metrics);

  const initialState: MetricsData = {
    cpuUsage: [],
    memoryUsage: [],
    diskUsage: [],
    logs: [],
    buildLogs: [],
    isAlert: false,
  };

  return projectId ? metrics[projectId] || initialState : initialState;
};
