"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";
import { FC, useState } from "react";
import StatusTab from "./StatusTab";
import ConfigTab from "./ConfigTab";
import NetworksTab from "./NetworksTab";
import type { ServiceDto } from "@/services/backendApi/services";
import { ServiceState } from "@/types/services/services";
import { cn } from "@/lib/utils";

enum TabsValue {
  Status = "status",
  Config = "config",
  Networks = "networks",
}

interface ServiceDrawerProps {
  service: ServiceDto | null;
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ServiceDrawer: FC<ServiceDrawerProps> = ({
  service,
  projectId,
  isOpen,
  onClose,
}) => {
  const [selectedTab, setSelectedTab] = useState<TabsValue>(TabsValue.Status);
  const status = service?.status ?? ServiceState.Stopped;

  const getStatusStyles = () => {
    switch (status) {
      case ServiceState.Running:
        return {
          color: "text-emerald-600",
          bg: "bg-emerald-500",
        };
      case ServiceState.Starting:
        return {
          color: "text-amber-600",
          bg: "bg-amber-500",
        };
      default:
        return {
          color: "text-red-600",
          bg: "bg-red-500",
        };
    }
  };

  const statusStyles = getStatusStyles();

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={cn(
        "w-[500px] border-l border-gray-200 bg-white shadow-lg transition-all duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {service ? (
        <div className="flex flex-col h-full">
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={service.icon || "/placeholder.svg"}
                  alt={`${service.name} icon`}
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {service.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm">
                    <div
                      className={cn("h-2 w-2 rounded-full", statusStyles.bg)}
                    />
                    <span className={statusStyles.color}>
                      {status.slice(0, 1).toUpperCase().concat(status.slice(1))}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full h-8 w-8"
              >
                <X size={16} />
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2 truncate">
              {service.image}
            </p>
          </div>

          <div className="flex-1 overflow-auto">
            <Tabs
              defaultValue={TabsValue.Status}
              value={selectedTab}
              onValueChange={(value) => setSelectedTab(value as TabsValue)}
              className="p-4"
            >
              <TabsList className="w-full grid grid-cols-3 mb-6 bg-gray-50 p-1 rounded-lg">
                <TabsTrigger
                  value={TabsValue.Status}
                  className="py-2 text-sm font-medium transition-all data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:bg-white"
                >
                  Status
                </TabsTrigger>
                <TabsTrigger
                  value={TabsValue.Config}
                  className="py-2 text-sm font-medium transition-all data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:bg-white"
                >
                  Configuration
                </TabsTrigger>
                <TabsTrigger
                  value={TabsValue.Networks}
                  className="py-2 text-sm font-medium transition-all data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:bg-white"
                >
                  Networks
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value={TabsValue.Status}
                className="p-4 border rounded-md bg-white"
              >
                {service && (
                  <StatusTab
                    status={service.status || ServiceState.Stopped}
                    image={service.image}
                    onStart={() => console.log("Start")}
                    onRestart={() => console.log("Restart")}
                    onStop={() => console.log("Stop")}
                  />
                )}
              </TabsContent>

              <TabsContent
                value={TabsValue.Config}
                className="p-4 border rounded-md bg-white"
              >
                {service ? (
                  <ConfigTab serviceInformations={service} />
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-500">
                    No configuration found
                  </div>
                )}
              </TabsContent>

              <TabsContent
                value={TabsValue.Networks}
                className="p-4 border rounded-md bg-white"
              >
                {service ? (
                  <NetworksTab
                    serviceInformations={service}
                    projectId={projectId}
                  />
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-500">
                    No networks found
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Select a service to view details</p>
        </div>
      )}
    </div>
  );
};

export default ServiceDrawer;
