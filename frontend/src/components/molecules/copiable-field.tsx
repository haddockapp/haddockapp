import { toast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";
import { FC } from "react";

interface CopiableFieldProps {
  value?: string;
}
const CopiableField: FC<CopiableFieldProps> = ({ value }) => (
  <div className="flex items-center space-x-2">
    <div className="dark:border-card-foreground border-gray-200 border rounded-sm p-2 dark:bg-card bg-gray-100 text-start min-w-80 min-h-8">
      <span className="text-typography/60">{value}</span>
    </div>
    {value && (
      <Copy
        onClick={() => {
          navigator.clipboard.writeText(value);
          toast({
            title: "Copied to clipboard",
            duration: 1000,
          });
        }}
        size="16px"
        className="text-primary cursor-pointer"
      />
    )}
  </div>
);

export default CopiableField;
