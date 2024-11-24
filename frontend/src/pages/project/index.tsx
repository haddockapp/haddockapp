import MonitoringTab from "@/components/organisms/ProjectTabs/MonitoringTab";
import SettingsTab from "@/components/organisms/ProjectTabs/SettingsTab";
import TopologyTab from "@/components/organisms/ProjectTabs/TopologyTab";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetServicesByProjectIdQuery } from "@/services/backendApi/services";
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
    <Tabs defaultValue="topology">
      <TabsList className="absolute sm:top-24 lg:top-10 right-10">
        <TabsTrigger value={TabsValue.Topology} className="-mx-2">
          <Button
            variant="link"
            onClick={() => setSelectedTab(TabsValue.Topology)}
            className={
              selectedTab === TabsValue.Topology
                ? "underline"
                : "text-black-500"
            }
          >
            Topology
          </Button>
        </TabsTrigger>
        <TabsTrigger value={TabsValue.Monitoring} className="-mx-2">
          <Button
            variant="link"
            onClick={() => setSelectedTab(TabsValue.Monitoring)}
            className={
              selectedTab === TabsValue.Monitoring
                ? "underline"
                : "text-black-500"
            }
          >
            Monitoring
          </Button>
        </TabsTrigger>
        <TabsTrigger value={TabsValue.Settings} className="-mx-2">
          <Button
            variant="link"
            onClick={() => setSelectedTab(TabsValue.Settings)}
            className={
              selectedTab === TabsValue.Settings
                ? "underline"
                : "text-black-500"
            }
          >
            Settings
          </Button>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="topology">
        <TopologyTab services={services} projectId={projectId ?? ""} />
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
