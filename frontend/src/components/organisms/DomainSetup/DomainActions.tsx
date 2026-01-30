import { Button } from "@/components/ui/button";
import useDomainActions from "@/hooks/use-domain";
import { RefreshCw, Trash, Check } from "lucide-react";
import { FC } from "react";

interface DomainActionsProps {
  id?: string;
  onSave: () => void;
}
const DomainActions: FC<DomainActionsProps> = ({ id, onSave }) => {
  const { onDelete, onRefetch, isFetching } = useDomainActions(id);

  return (
    <>
      <Button
        disabled={isFetching}
        onClick={onRefetch}
        className="space-x-2 shadow-lg hover:shadow-xl transition-shadow"
        variant="secondary"
      >
        <RefreshCw size="16px" />
        <span>Refresh</span>
      </Button>
      {onDelete && (
        <Button className="space-x-2" variant="destructive" onClick={onDelete}>
          <Trash size="16px" />
          <span>Delete domain</span>
        </Button>
      )}
      <Button onClick={onSave} className="space-x-2">
        <Check size="16px" />
        <span>Save</span>
      </Button>
    </>
  );
};

export default DomainActions;
