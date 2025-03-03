import MonitoringTab from "@/components/organisms/ProjectTabs/MonitoringTab";
import ReactflowTab from "@/components/organisms/ProjectTabs/ReactFlow/ReactflowTab";
import SettingsTab from "@/components/organisms/ProjectTabs/SettingsTab";
import TopologyTab from "@/components/organisms/ProjectTabs/TopologyTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetServicesByProjectIdQuery } from "@/services/backendApi/services";
import { ReactFlowProvider } from "@xyflow/react";
import { FC, useState } from "react";
import { useParams } from "react-router-dom";

enum TabsValue {
  Topology = "topology",
  Monitoring = "monitoring",
  Settings = "settings",
}

const ProjectDetails: FC = () => {
  const { projectId } = useParams();
  const { data: services } = useGetServicesByProjectIdQuery(projectId ?? "");
  const [selectedTab, setSelectedTab] = useState<TabsValue>(TabsValue.Topology);

  return (
    <Tabs defaultValue="topology" className="px-8">
      <div className="w-full text-right">
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
        {/* <TopologyTab services={services} projectId={projectId ?? ""} /> */}
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
