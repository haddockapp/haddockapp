import { FC } from "react";
import { Card, CardContent } from "../ui/card";
import { VmState } from "@/types/vm/vm";

interface ServiceCardProps {
  name: string;
  image: string;
  icon: string;
  onClick?: () => void;
}

const ServiceStateLabel = {
  [VmState.Stopping]: "Stopping",
  [VmState.Stopped]: "Stopped",
  [VmState.Running]: "Running",
  [VmState.Starting]: "Starting",
};

const ServiceStateColor = {
  [VmState.Stopping]: "orange-500",
  [VmState.Starting]: "orange-500",
  [VmState.Stopped]: "red-500",
  [VmState.Running]: "green-500",
};

const ServiceCard: FC<ServiceCardProps> = ({ name, icon, image, onClick }) => {
  return (
    <Card
      className="w-full cursor-pointer shadow-none border-none"
      onClick={onClick}
    >
      <CardContent className="p-4 align-middle">
        <div className="flex flex-column gap-4 justify-between">
          <div className="flex flex-row gap-4">
            <img className="w-12 h-12" src={icon} alt={name} />
            <div className=" self-center">
              <p className="text-xl font-semibold text-typography/90 line-clamp-1">
                {name}
              </p>
              <p className="text-typography/60">{image}</p>
            </div>
          </div>
          <div
            className={`flex items-center gap-1 text-${
              ServiceStateColor[VmState.Running]
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-${
                ServiceStateColor[VmState.Running]
              }`}
            ></div>
            <p className="font-bold">{ServiceStateLabel[VmState.Running]}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
