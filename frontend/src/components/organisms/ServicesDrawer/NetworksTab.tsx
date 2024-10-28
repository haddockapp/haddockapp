import { ServiceInformationDto } from "@/services/backendApi/services";
import { FC } from "react";
import ConfigNetworkForm from "./ConfigNetworkForm";

interface NetworksTabProps {
  serviceInformations: ServiceInformationDto;
}

const NetworksTab: FC<NetworksTabProps> = ({ serviceInformations }) => {
  return (
    <>
      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-2 text-lg">Ports</p>
          {serviceInformations.ports.length === 0 ? (
            <p className="ml-2 text-md">No ports</p>
          ) : (
            <div>
              {serviceInformations.ports.map((port) => (
                <p key={port} className="ml-2 text-md">
                  {port}
                </p>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="mb-2 text-lg">Networks</p>
          {serviceInformations.networks.length === 0 ? (
            <p className="ml-2 text-md">No networks</p>
          ) : (
            <div>
              {serviceInformations.networks.map((network, index) => (
                <p key={index} className="ml-2 text-md">
                  {network}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-4">
        <ConfigNetworkForm serviceInformations={serviceInformations} />
      </div>
    </>
  );
};

export default NetworksTab;
