import MonitoringTab from "@/components/organisms/ProjectTabs/MonitoringTab";
import ReactflowTab from "@/components/organisms/ProjectTabs/ReactFlow/ReactflowTab";
import SettingsTab from "@/components/organisms/ProjectTabs/SettingsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactFlowProvider } from "@xyflow/react";
import { type FC, useState } from "react";
import { useParams } from "react-router-dom";
import ProjectManagementPanel from "@/components/organisms/ProjectManagement/ProjectManagementPanel";
import { useGetProjectsQuery } from "@/services/backendApi/projects";
import { Skeleton } from "@/components/ui/skeleton";

enum TabsValue {
  Topology = "topology",
  Monitoring = "monitoring",
  Settings = "settings",
}

const ProjectDetails: FC = () => {
  const { projectId } = useParams();
  const [selectedTab, setSelectedTab] = useState<TabsValue>(TabsValue.Topology);

  const { data: projects, isLoading } = useGetProjectsQuery();
  const currentProject = projects?.find((project) => project.id === projectId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[150px] w-full rounded-lg" />
        <Skeleton className="h-[500px] w-full rounded-lg" />
      </div>
    );
  }

  if (!currentProject) {
    return <div className="text-center py-10">Project not found</div>;
  }

  return (
    <>
      <ProjectManagementPanel project={currentProject} />

      <Tabs defaultValue="topology">
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
        </TabsContent>
        <TabsContent value="monitoring">
          <MonitoringTab />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default ProjectDetails;
