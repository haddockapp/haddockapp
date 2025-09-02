import {
  Drawer,
  DrawerTrigger,
  DrawerPortal,
  DrawerOverlay,
  DrawerContent,
} from "@/components/ui/drawer";
import { FC } from "react";
import ServiceCard from "../ServiceCard";
import { ServiceDto } from "@/services/backendApi/services";
import ServiceDrawerContent from "../ServicesDrawer/ServiceDrawerContent";

interface TopologyTabProps {
  services?: ServiceDto[];
  projectId: string;
}

const TopologyTab: FC<TopologyTabProps> = ({ services, projectId }) => {
  return (
    <div>
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
                className="relative flex h-10 flex-shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full px-4 text-sm font-medium shadow-sm transition-all hover:bg-[#FAFAFA] dark:bg-[#161615] dark:hover:bg-[#1A1A19] dark:text-white"
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
                  <ServiceDrawerContent
                    service={service}
                    projectId={projectId}
                  />
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
