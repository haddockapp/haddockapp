import MonitoringTab from "@/components/organisms/ProjectTabs/MonitoringTab";
import ReactflowTab from "@/components/organisms/ProjectTabs/ReactFlow/ReactflowTab";
import SettingsTab from "@/components/organisms/ProjectTabs/SettingsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactFlowProvider } from "@xyflow/react";
import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProjectManagementPanel from "@/components/organisms/ProjectManagement/ProjectManagementPanel";
import { useGetProjectsQuery } from "@/services/backendApi/projects";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch } from "@/hooks/useStore";
import { setAlert, setProjectId } from "@/services/metricSlice";
import { ProjectTabsValue } from "./projectTabsType";

const ProjectDetails: FC = () => {
  const dispatch = useAppDispatch();
  const { projectId } = useParams();
  const [selectedTab, setSelectedTab] = useState<ProjectTabsValue>(
    ProjectTabsValue.Topology
  );

  const { data: projects, isLoading } = useGetProjectsQuery();
  const currentProject = projects?.find((project) => project.id === projectId);

  useEffect(() => {
    if (projectId) dispatch(setProjectId(projectId));

    return () => {
      dispatch(setProjectId(null));
    };
  }, [dispatch, projectId]);

  useEffect(() => {
    if (selectedTab === ProjectTabsValue.Monitoring && !!projectId)
      dispatch(setAlert({ projectId, isAlert: false }));
  }, [dispatch, projectId, selectedTab]);

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
      <ProjectManagementPanel
        onChangeTab={setSelectedTab}
        project={currentProject}
      />

      <Tabs value={selectedTab}>
        <div className="w-full text-right">
          <TabsList>
            <TabsTrigger
              value={ProjectTabsValue.Topology}
              onClick={() => setSelectedTab(ProjectTabsValue.Topology)}
            >
              <span
                className={
                  selectedTab === ProjectTabsValue.Topology
                    ? "text-primary"
                    : ""
                }
              >
                Topology
              </span>
            </TabsTrigger>
            <TabsTrigger
              value={ProjectTabsValue.Monitoring}
              onClick={() => setSelectedTab(ProjectTabsValue.Monitoring)}
            >
              <span
                className={
                  selectedTab === ProjectTabsValue.Monitoring
                    ? "text-primary"
                    : ""
                }
              >
                Monitoring
              </span>
            </TabsTrigger>
            <TabsTrigger
              value={ProjectTabsValue.Settings}
              onClick={() => setSelectedTab(ProjectTabsValue.Settings)}
            >
              <span
                className={
                  selectedTab === ProjectTabsValue.Settings
                    ? "text-primary"
                    : ""
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
          <MonitoringTab projectId={projectId ?? ""} />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default ProjectDetails;
