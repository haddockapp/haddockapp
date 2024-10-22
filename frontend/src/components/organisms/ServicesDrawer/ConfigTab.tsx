import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { ServiceInformationDto } from "@/services/backendApi/services";
import { FC } from "react";

interface ConfigTabProps {
  serviceInformations: ServiceInformationDto;
}

const ConfigTab: FC<ConfigTabProps> = ({ serviceInformations }) => {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-lg">Environment variable</p>
        {serviceInformations.environment.length === 0 ? (
          <p className="ml-2 text-md">No environment variable</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Key</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceInformations.environment.map((env) => (
                <TableRow>
                  <TableCell>{env.split("=")[0]}</TableCell>
                  <TableCell>{env.split("=")[1]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <div>
        <p className="mb-2 text-lg">Depends on</p>
        {serviceInformations.depends_on.length === 0 ? (
          <p className="ml-2 text-md">No service depends on</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Service name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceInformations.depends_on.map((depend) => (
                <TableRow>
                  <TableCell>{depend}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <div>
        <p className="mb-2 text-lg">Resource limits</p>
        {serviceInformations.deployment === null ? (
          <p className="ml-2 text-md">No resource limit</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Resource</TableHead>
                <TableHead>Limit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>CPU</TableCell>
                <TableCell>{serviceInformations.deployment?.cpus} %</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Memory</TableCell>
                <TableCell>
                  {serviceInformations.deployment?.memory} MB
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </div>
      <div>
        <p className="mb-2 text-lg">User</p>
        {serviceInformations.user === null ? (
          <p className="ml-2 text-md">No user configuration</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Uid</TableCell>
                <TableCell>{serviceInformations.user?.uid}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Gid</TableCell>
                <TableCell>{serviceInformations.user?.gid}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default ConfigTab;
