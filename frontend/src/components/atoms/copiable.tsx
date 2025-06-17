import { toast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";
import { FC } from "react";

type CopiableProps = {
  text: string;
};

const Copiable: FC<CopiableProps> = ({ text }) => {
  const handleCopyCallbackUrl = () => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      duration: 1000,
    });
  };

  return (
    <div className="inline-flex items-center space-x-1 pr-1">
      <b
        onClick={handleCopyCallbackUrl}
        className="cursor-pointer hover:underline"
      >
        {text}
      </b>
      <Copy
        onClick={handleCopyCallbackUrl}
        size="16px"
        className="text-primary cursor-pointer"
      />
    </div>
  );
};

export default Copiable;
