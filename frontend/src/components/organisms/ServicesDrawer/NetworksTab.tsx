import { ServiceInformationDto } from "@/services/backendApi/services";
import { FC, useMemo } from "react";
import ConfigNetworkForm from "./ConfigNetworkForm";
import {
  useDeleteNetworkConnectionMutation,
  useGetNetworksConnectionQuery,
} from "@/services/backendApi/networks/networks.service";
import { Button } from "@/components/ui/button";
import { NetworkConnectionDto } from "@/services/backendApi/networks/networks.dto";
import { Trash } from "lucide-react";
import { Plus } from "lucide-react";
import { DialogHeader } from "@/components/ui/dialog";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import useDisclosure from "@/hooks/use-disclosure";

interface NetworksTabProps {
  serviceInformations: ServiceInformationDto;
  projectId: string;
}

const NetworksTab: FC<NetworksTabProps> = ({
  serviceInformations,
  projectId,
}) => {
  const { data: redirections } = useGetNetworksConnectionQuery(projectId);
  const [deleteRedirection] = useDeleteNetworkConnectionMutation();
  const { isOpen, onToggle, onClose } = useDisclosure();
  const serviceRedirections = useMemo(() => {
    return !redirections
      ? [
          {
            id: "1",
            domain: "api.maxime.custom-domain.fr",
            port: 8080,
            projectId: "",
            createdAt: new Date(),
          } as NetworkConnectionDto,
        ]
      : redirections.filter(
          (redirection) =>
            redirection.port.toString() === serviceInformations.ports[0]
        );
  }, [redirections, serviceInformations.ports]);

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
        <div>
          <p className="mb-2 text-lg">Redirections</p>
          <div className="flex flex-col gap-2 w-fit">
            {serviceRedirections.length === 0 ? (
              <p className="ml-2 text-md">No redirections</p>
            ) : (
              <div>
                {serviceRedirections.map((redirection) => (
                  <div className="flex flex-row gap-2 ml-2 items-center">
                    <p key={redirection.id} className="text-md">
                      {redirection.port} {"->"} {redirection.domain}
                    </p>
                    <Button
                      className="h-6 w-6 rounded-sm"
                      size="icon"
                      variant="destructive"
                      onClick={() => deleteRedirection(redirection.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Dialog open={isOpen} onOpenChange={onToggle}>
              <DialogTrigger asChild>
                <Button
                  className="w-auto"
                  onClick={() => console.log("Create redirection")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add redirection
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a new redirection</DialogTitle>
                  <DialogDescription>
                    Fill the form below to create a new redirection
                  </DialogDescription>
                </DialogHeader>
                <ConfigNetworkForm
                  serviceInformations={serviceInformations}
                  projectId={projectId}
                  onClose={onClose}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  );
};

export default NetworksTab;
