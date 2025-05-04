"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";
import { type FC, useState } from "react";
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

  // Get status indicator styles
  const getStatusStyles = () => {
    switch (service?.status ?? ServiceState.Stopped) {
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
        "w-[350px] border-l border-gray-200 bg-white shadow-lg transition-all duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {service ? (
        <div className="flex flex-col h-full">
          {/* Drawer header */}
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
                      {service.status ?? ServiceState.Stopped}
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

          {/* Drawer content */}
          <div className="flex-1 overflow-auto">
            <Tabs
              defaultValue={TabsValue.Status}
              value={selectedTab}
              onValueChange={(value) => setSelectedTab(value as TabsValue)}
              className="p-4"
            >
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value={TabsValue.Status}>Status</TabsTrigger>
                <TabsTrigger value={TabsValue.Config}>
                  Configuration
                </TabsTrigger>
                <TabsTrigger value={TabsValue.Networks}>Networks</TabsTrigger>
              </TabsList>

              <TabsContent value={TabsValue.Status} className="p-2">
                <StatusTab
                  status={service.status ?? ServiceState.Stopped}
                  image={service.image}
                  onStart={() => console.log("Start")}
                  onRestart={() => console.log("Restart")}
                  onStop={() => console.log("Stop")}
                />
              </TabsContent>

              <TabsContent value={TabsValue.Config} className="p-2">
                <ConfigTab serviceInformations={service} />
              </TabsContent>

              <TabsContent value={TabsValue.Networks} className="p-2">
                <NetworksTab
                  serviceInformations={service}
                  projectId={projectId}
                />
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
