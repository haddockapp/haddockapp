import { FC, useMemo } from "react";
import { Trash, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import useDisclosure from "@/hooks/use-disclosure";
import type { ServiceInformationDto } from "@/services/backendApi/services";
import ConfigNetworkForm from "./ConfigNetworkForm";
import {
  useDeleteNetworkConnectionMutation,
  useGetNetworksConnectionQuery,
} from "@/services/backendApi/networks/networks.service";

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

  const renderSection = (
    title: string,
    isEmpty: boolean,
    emptyMessage: string,
    content: React.ReactNode
  ) => (
    <section className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">{title}</h3>
      {isEmpty ? (
        <p className="text-sm text-gray-500 italic">{emptyMessage}</p>
      ) : (
        content
      )}
    </section>
  );

  return (
    <div className="space-y-8">
      {renderSection(
        "Ports",
        serviceInformations.ports.length === 0,
        "No ports configured",
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium">Port Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceInformations.ports.map((port) => (
                <TableRow key={port} className="hover:bg-gray-50">
                  <TableCell>{port}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {renderSection(
        "Networks",
        serviceInformations.networks.length === 0,
        "No networks configured",
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium">Network name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceInformations.networks.map((network) => (
                <TableRow key={network} className="hover:bg-gray-50">
                  <TableCell>{network}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Redirections</h3>
          <Dialog open={isCreateModalOpen} onOpenChange={onCreateModalToggle}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add redirection
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-6">
              <DialogHeader>
                <DialogTitle>Create a new redirection</DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                  Connect your service port to a domain to make it accessible
                  from the internet
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

        {serviceRedirections.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No redirections configured
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-1/4 font-medium">Port</TableHead>
                  <TableHead className="font-medium">Domain</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceRedirections.map((redirection) => (
                  <TableRow key={redirection.id} className="hover:bg-gray-50">
                    <TableCell>{redirection.port}</TableCell>
                    <TableCell className="font-medium">
                      {redirection.domain}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={onDeleteModalToggle}
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>

                      <Dialog
                        open={isDeleteModalOpen}
                        onOpenChange={onDeleteModalToggle}
                      >
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-center text-red-600">
                              Delete Redirection
                            </DialogTitle>
                            <DialogDescription className="text-center">
                              Are you sure you want to delete this redirection?
                              <p className="mt-2 font-medium text-gray-900">
                                {redirection.domain}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                This action is irreversible and will immediately
                                remove the redirection.
                              </p>
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="sm:justify-center gap-2 sm:gap-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={onDeleteModalClose}
                              className="sm:w-32"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={() =>
                                handleDeleteRedirection(redirection.id)
                              }
                              className="sm:w-32"
                            >
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
};

export default NetworksTab;
