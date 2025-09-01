import { FC } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { ServiceInformationDto } from "@/services/backendApi/services";

interface ConfigTabProps {
  serviceInformations: ServiceInformationDto;
}

const ConfigTab: FC<ConfigTabProps> = ({ serviceInformations }) => {
  const renderSection = (
    title: string,
    isEmpty: boolean,
    emptyMessage: string,
    content: React.ReactNode
  ) => (
    <section className="space-y-3">
      <h3 className="text-sm font-medium text-typography/70">{title}</h3>
      {isEmpty ? (
        <p className="text-sm text-typography/50 italic">{emptyMessage}</p>
      ) : (
        content
      )}
    </section>
  );

  return (
    <div className="space-y-8">
      {renderSection(
        "Environment variables",
        !Object.keys(serviceInformations.environment).length,
        "No environment variables configured",
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-1/3 font-medium">Key</TableHead>
                <TableHead className="font-medium">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(serviceInformations.environment).map(
                ([key, value]) => (
                  <TableRow key={key} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-xs">{key}</TableCell>
                    <TableCell className="font-mono text-xs truncate max-w-xs">
                      {value}
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {renderSection(
        "Depends on",
        !serviceInformations.depends_on.length,
        "No service dependencies",
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium">Service name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceInformations.depends_on.map((depend, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell>{depend}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {renderSection(
        "Resource limits",
        serviceInformations.deployment === null,
        "No resource limits configured",
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-1/3 font-medium">Resource</TableHead>
                <TableHead className="font-medium">Limit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-gray-50">
                <TableCell>CPU</TableCell>
                <TableCell>
                  <span className="font-medium">
                    {serviceInformations.deployment?.cpus}
                  </span>
                  <span className="text-typography/50 ml-1">%</span>
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-gray-50">
                <TableCell>Memory</TableCell>
                <TableCell>
                  <span className="font-medium">
                    {serviceInformations.deployment?.memory}
                  </span>
                  <span className="text-typography/50 ml-1">MB</span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

      {renderSection(
        "User",
        serviceInformations.user === null,
        "No user configuration",
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-1/3 font-medium">ID</TableHead>
                <TableHead className="font-medium">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-gray-50">
                <TableCell>UID</TableCell>
                <TableCell>{serviceInformations.user?.uid}</TableCell>
              </TableRow>
              <TableRow className="hover:bg-gray-50">
                <TableCell>GID</TableCell>
                <TableCell>{serviceInformations.user?.gid}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ConfigTab;
