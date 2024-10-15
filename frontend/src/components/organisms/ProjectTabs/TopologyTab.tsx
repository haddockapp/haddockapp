import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerTrigger,
  DrawerPortal,
  DrawerOverlay,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import { FC, useState } from "react";
import ServiceCard from "../ServiceCard";
import StatusTab from "../ServicesDrawer/StatusTab";
import { ServiceDto } from "@/services/backendApi/services";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsValue } from "./type";

interface TopologyTabProps {
  services?: ServiceDto[];
}

const TopologyTab: FC<TopologyTabProps> = ({ services }) => {
  const [selectedTab, setSelectedTab] = useState<TabsValue>(TabsValue.Status);
  return (
    <div className="mx-8">
      <h1 className="text-3xl font-bold my-8">Services</h1>
      {(services?.length === 0 || !services) && (
        <div className="flex flex-column items-center">
          <p className="text-lg">No services found</p>
        </div>
      )}
      {services?.map((service, index) => {
        return (
          <div key={index}>
            <Drawer direction="right">
              <DrawerTrigger
                asChild
                className="relative flex h-10 flex-shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-4 text-sm font-medium shadow-sm transition-all hover:bg-[#FAFAFA] dark:bg-[#161615] dark:hover:bg-[#1A1A19] dark:text-white"
              >
                <ServiceCard
                  key={index}
                  name={service.name}
                  icon={service.icon}
                  image={service.image}
                />
              </DrawerTrigger>
              <DrawerPortal>
                <DrawerOverlay className="fixed inset-0 z-0 bg-black/40" />
                <DrawerContent className="right-0 top-0 bottom-0 fixed z-10 flex outline-none w-4/6">
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
                                onClick={() =>
                                  setSelectedTab(TabsValue.Networks)
                                }
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
                            <StatusTab
                              status="Started"
                              image="python/python3.9"
                            />
                          </TabsContent>
                          <TabsContent value="config">
                            <div className="mt-10 text-center">
                              Configuration
                            </div>
                          </TabsContent>
                          <TabsContent value="networks">
                            <div className="mt-10 text-center">Networks</div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </DrawerTitle>
                  </div>
                </DrawerContent>
              </DrawerPortal>
            </Drawer>
            <hr />
          </div>
        );
      })}
    </div>
  );
};

export default TopologyTab;
