import { Button } from "@/components/ui/button";
import { DomainStatusDto } from "@/services/backendApi/domains";
import { RefreshCw, Trash, Check } from "lucide-react";
import { FC } from "react";

interface DomainActionsProps {
  isRefreshing: boolean;
  onRefresh: () => void;
  onDelete: (id: string) => void;
  onSave: () => void;
  status?: DomainStatusDto;
}
const DomainActions: FC<DomainActionsProps> = ({
  isRefreshing,
  onRefresh,
  onDelete,
  onSave,
  status,
}) => (
  <>
    <Button
      disabled={isRefreshing}
      onClick={onRefresh}
      className="space-x-2"
      variant="secondary"
    >
      <RefreshCw size="16px" />
      <span>Refresh</span>
    </Button>
    {!!onDelete && !!status && (
      <Button
        className="space-x-2"
        variant="destructive"
        onClick={() => onDelete(status.id)}
      >
        <Trash size="16px" />
        <span>Delete domain</span>
      </Button>
    )}
    <Button
      onClick={onSave}
      disabled={!status?.canBeLinked}
      className="space-x-2"
    >
      <Check size="16px" />
      <span>Save</span>
    </Button>
  </>
);

export default DomainActions;
