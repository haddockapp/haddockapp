import { toast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";
import { FC } from "react";

interface CopiableFieldProps {
  value?: string;
}
const CopiableField: FC<CopiableFieldProps> = ({ value }) => (
  <div className="flex items-start space-x-2 w-full">
    <div className="border-gray-200 border rounded-sm p-2 bg-gray-100 text-start flex-1 min-h-8 max-w-full overflow-hidden">
      <span className="text-gray-600 break-all font-mono text-sm">{value}</span>
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
        className="text-primary cursor-pointer mt-2 flex-shrink-0"
      />
    )}
  </div>
);

export default CopiableField;
