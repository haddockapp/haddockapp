import { ServiceInformationDto } from "@/services/backendApi/services";
import { FC, useMemo } from "react";
import ConfigNetworkForm from "./ConfigNetworkForm";
import {
  useDeleteNetworkConnectionMutation,
  useGetNetworksConnectionQuery,
} from "@/services/backendApi/networks/networks.service";
import { Button } from "@/components/ui/button";
import { Trash, Plus } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import useDisclosure from "@/hooks/use-disclosure";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface NetworksTabProps {
  serviceInformations: ServiceInformationDto;
  projectId: string;
}

const NetworksTab: FC<NetworksTabProps> = ({
  serviceInformations,
  projectId,
}) => {
  const { toast } = useToast();
  const { data: redirections } = useGetNetworksConnectionQuery(projectId);
  const [deleteRedirection] = useDeleteNetworkConnectionMutation();
  const {
    isOpen: isCreateModalOpen,
    onToggle: onCreateModalToggle,
    onClose: onCreateModalClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteModalOpen,
    onToggle: onDeleteModalToggle,
    onClose: onDeleteModalClose,
  } = useDisclosure();
  const serviceRedirections = useMemo(() => {
    return redirections
      ? redirections.filter(
          (redirection) =>
            redirection.port.toString() === serviceInformations.ports[0]
        )
      : [];
  }, [redirections, serviceInformations.ports]);

  const handleDeleteRedirection = (id: string) => {
    deleteRedirection(id);
    onDeleteModalClose();
    toast({
      title: "Redirection deleted",
      description: "The redirection has been successfully deleted",
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-lg">Ports</p>
        {serviceInformations.ports.length === 0 ? (
          <p className="ml-2 text-md">No ports</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Port Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceInformations.ports.map((port) => (
                <TableRow key={port}>
                  <TableCell>{port}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <div>
        <p className="mb-2 text-lg">Networks</p>
        {serviceInformations.networks.length === 0 ? (
          <p className="ml-2 text-md">No networks</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Network name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceInformations.networks.map((network) => (
                <TableRow key={network}>
                  <TableCell>{network}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <p className="mb-2 text-lg">Redirections</p>
        {serviceRedirections.length === 0 ? (
          <p className="ml-2 text-md">No redirections</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Port</TableHead>
                <TableHead>Domain</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceRedirections.map((redirection) => (
                <TableRow key={redirection.id}>
                  <TableCell>{redirection.port}</TableCell>
                  <TableCell>{redirection.domain}</TableCell>
                  <TableCell className="flex justify-self-end">
                    <Dialog
                      open={isDeleteModalOpen}
                      onOpenChange={onDeleteModalToggle}
                    >
                      <DialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="self-center mb-2 text-red-600">
                            Are you sure you want to delete this redirection?
                          </DialogTitle>
                          <DialogDescription className="text-sm text-gray-700 self-center">
                            This action is irreversible, so please proceed with
                            caution.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="justify-between">
                          <Button
                            type="button"
                            variant="secondary"
                            className="w-36"
                            onClick={onDeleteModalClose}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            variant="destructive"
                            onClick={() =>
                              handleDeleteRedirection(redirection.id)
                            }
                            className="w-36"
                          >
                            Delete Redirection
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Dialog open={isCreateModalOpen} onOpenChange={onCreateModalToggle}>
          <DialogTrigger asChild>
            <Button className="w-auto">
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
              onClose={onCreateModalClose}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default NetworksTab;
