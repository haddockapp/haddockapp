import MonitoringTab from "@/components/organisms/ProjectTabs/MonitoringTab";
import ReactflowTab from "@/components/organisms/ProjectTabs/ReactFlow/ReactflowTab";
import SettingsTab from "@/components/organisms/ProjectTabs/SettingsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch } from "@/hooks/useStore";
import { setProjectId } from "@/services/metricSlice";
import { ReactFlowProvider } from "@xyflow/react";
import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

enum TabsValue {
  Topology = "topology",
  Monitoring = "monitoring",
  Settings = "settings",
}

const ProjectDetails: FC = () => {
  const [selectedTab, setSelectedTab] = useState<TabsValue>(TabsValue.Topology);

  const { projectId } = useParams();

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!projectId) return;
    dispatch(setProjectId(projectId));

    return () => {
      dispatch(setProjectId(null));
    };
  }, [dispatch, projectId]);

  return (
    <Tabs defaultValue="topology">
      <div className="w-full flex flex-row justify-between">
        <p className="pl-4 self-end text-gray-600">On since: 20 hours</p>
        <TabsList>
          <TabsTrigger
            value={TabsValue.Topology}
            onClick={() => setSelectedTab(TabsValue.Topology)}
          >
            <span
              className={
                selectedTab === TabsValue.Topology ? "text-primary" : ""
              }
            >
              Topology
            </span>
          </TabsTrigger>
          <TabsTrigger
            value={TabsValue.Monitoring}
            onClick={() => setSelectedTab(TabsValue.Monitoring)}
          >
            <span
              className={
                selectedTab === TabsValue.Monitoring ? "text-primary" : ""
              }
            >
              Monitoring
            </span>
          </TabsTrigger>
          <TabsTrigger
            value={TabsValue.Settings}
            onClick={() => setSelectedTab(TabsValue.Settings)}
          >
            <span
              className={
                selectedTab === TabsValue.Settings ? "text-primary" : ""
              }
            >
              Settings
            </span>
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="topology">
        <ReactFlowProvider>
          <ReactflowTab projectId={projectId ?? ""} />
        </ReactFlowProvider>
      </TabsContent>
      <TabsContent value="monitoring">
        <MonitoringTab />
      </TabsContent>
      <TabsContent value="settings">
        <SettingsTab />
      </TabsContent>
    </Tabs>
  );
};

export default ProjectDetails;
