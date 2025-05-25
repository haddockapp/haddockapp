import { Button } from "@/components/ui/button";
import { DrawerTitle } from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FC, useState } from "react";
import StatusTab from "./StatusTab";
import { ServiceDto } from "@/services/backendApi/services";
import ConfigTab from "./ConfigTab";
import NetworksTab from "./NetworksTab";
import {
  ServiceAction,
  useChangeServiceStatusMutation,
} from "@/services/backendApi/projects";
import { ServiceState } from "@/types/services/services";

enum TabsValue {
  Status = "status",
  Config = "config",
  Networks = "networks",
}

interface ServiceDrawerContentProps {
  service: ServiceDto | null;
  projectId: string;
}

const ServiceDrawerContent: FC<ServiceDrawerContentProps> = ({
  service,
  projectId,
}) => {
  const [selectedTab, setSelectedTab] = useState<TabsValue>(TabsValue.Status);
  const [changeServiceStatus] = useChangeServiceStatusMutation();
  const handleStatusChange = (action: ServiceAction) => {
    if (!service) return;
    changeServiceStatus({
      projectId,
      serviceId: service.id,
      action,
    });
  };
  return (
    <div className="bg-zinc-50 rounded-[16px] w-[310px] grow mt-2 mr-2 mb-2 p-5 flex flex-col">
      {service === null && <div className="text-center">No service found</div>}
      {service && (
        <DrawerTitle>
          <div className="flex flex-row gap-2">
            <img
              className="w-12 h-12"
              src={service.icon}
              alt="Icon of the service"
            />
            <div className="flex flex-col">
              <p className="text-xl font-semibold text-gray-900 line-clamp-1">
                {service.name}
              </p>
              <p className="text-gray-600">{service.image}</p>
            </div>
          </div>
          <div className="w-full flex">
            <Tabs
              defaultValue={TabsValue.Status}
              className="mt-8 items-center w-full"
            >
              <TabsList className="mb-4">
                <TabsTrigger value={TabsValue.Status}>
                  <Button
                    variant="link"
                    onClick={() => setSelectedTab(TabsValue.Status)}
                    className={
                      selectedTab === TabsValue.Status
                        ? "underline"
                        : "text-black-500"
                    }
                  >
                    Status
                  </Button>
                </TabsTrigger>
                <TabsTrigger value={TabsValue.Config}>
                  <Button
                    variant="link"
                    onClick={() => setSelectedTab(TabsValue.Config)}
                    className={
                      selectedTab === TabsValue.Config
                        ? "underline"
                        : "text-black-500"
                    }
                  >
                    Configuration
                  </Button>
                </TabsTrigger>
                <TabsTrigger value={TabsValue.Networks}>
                  <Button
                    variant="link"
                    onClick={() => setSelectedTab(TabsValue.Networks)}
                    className={
                      selectedTab === TabsValue.Networks
                        ? "underline"
                        : "text-black-500"
                    }
                  >
                    Networks
                  </Button>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="status" className="p-4 border rounded-md">
                {service && (
                  <StatusTab
                    status={service.status ?? ServiceState.Stopped}
                    image={service.image}
                    onStart={() => handleStatusChange(ServiceAction.START)}
                    onRestart={() => handleStatusChange(ServiceAction.RESTART)}
                    onStop={() => handleStatusChange(ServiceAction.STOP)}
                  />
                )}
              </TabsContent>
              <TabsContent value="config">
                {service ? (
                  <ConfigTab serviceInformations={service} />
                ) : (
                  <div className="mt-10 text-center">
                    No configuration found
                  </div>
                )}
              </TabsContent>
              <TabsContent value="networks">
                {service ? (
                  <NetworksTab
                    serviceInformations={service}
                    projectId={projectId}
                  />
                ) : (
                  <div className="mt-10 text-center">No networks found</div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </DrawerTitle>
      )}
    </div>
  );
};

export default ServiceDrawerContent;
