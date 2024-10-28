import { Button } from "@/components/ui/button";
import { DrawerTitle } from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FC, useState } from "react";
import { TabsValue } from "../ProjectTabs/type";
import StatusTab from "./StatusTab";
import {
  ServiceDto,
  useGetServiceInformationsQuery,
} from "@/services/backendApi/services";
import ConfigTab from "./ConfigTab";
import NetworksTab from "./NetworksTab";

interface ServiceDrawerContentProps {
  service: ServiceDto;
  projectId: string;
}

const ServiceDrawerContent: FC<ServiceDrawerContentProps> = ({
  service,
  projectId,
}) => {
  const [selectedTab, setSelectedTab] = useState<TabsValue>(TabsValue.Status);
  const { data: serviceInformation } = useGetServiceInformationsQuery({
    projectId: projectId,
    serviceName: service.name,
  });
  return (
    <div className="bg-zinc-50 rounded-[16px] w-[310px] grow mt-2 mr-2 mb-2 p-5 flex flex-col">
      <DrawerTitle className="font-medium mb-2 text-zinc-900">
        <div className="flex flex-row gap-2">
          <img className="w-12 h-12" src={service.icon} />
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
            <TabsList className="absolute top-8 right-8">
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
            <TabsContent value="status" className="mt-4">
              {serviceInformation && (
                <StatusTab status="Running" image={serviceInformation.image} />
              )}
            </TabsContent>
            <TabsContent value="config">
              {serviceInformation ? (
                <ConfigTab serviceInformations={serviceInformation} />
              ) : (
                <div className="mt-10 text-center">No configuration found</div>
              )}
            </TabsContent>
            <TabsContent value="networks">
              {serviceInformation ? (
                <NetworksTab serviceInformations={serviceInformation} />
              ) : (
                <div className="mt-10 text-center">No networks found</div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DrawerTitle>
    </div>
  );
};

export default ServiceDrawerContent;
