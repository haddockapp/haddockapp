import { useAppSelector } from "./useStore";

export default () => {
  const { metrics, projectId } = useAppSelector((state) => state.metrics);

  const initialState = {
    cpuUsage: [],
    memoryUsage: [],
    diskUsage: [],
    logs: [],
  };

  return projectId ? metrics[projectId] || initialState : initialState;
};
