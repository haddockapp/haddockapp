import { toast } from "@/hooks/use-toast";
import { CheckCircle, Copy } from "lucide-react";
import { FC, useState } from "react";
import { twMerge } from "tailwind-merge";

interface CopiableFieldProps {
  value?: string;
  containerClassName?: React.HTMLAttributes<HTMLDivElement>["className"];
}
const CopiableField: FC<
  CopiableFieldProps & React.HTMLAttributes<HTMLDivElement>
> = ({ value, className, containerClassName }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        duration: 1000,
      });
      setTimeout(() => setCopied(false), 5000);
    }
  };

  return (
    <div className={twMerge("flex items-center space-x-2", className)}>
      <div
        className={twMerge(
          "dark:border-card-foreground border-gray-200 border rounded-sm p-2 dark:bg-card bg-gray-100 text-start min-w-80 min-h-8",
          containerClassName
        )}
      >
        <span className="text-typography/60">{value}</span>
      </div>
      {value &&
        (!copied ? (
          <Copy
            onClick={handleCopy}
            size="16px"
            className="text-primary cursor-pointer"
          />
        ) : (
          <CheckCircle
            onClick={handleCopy}
            size="16px"
            className="text-primary"
          />
        ))}
    </div>
  );
};

export default CopiableField;
