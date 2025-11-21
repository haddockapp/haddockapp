import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FC, useState } from "react";
import VariablesList from "./VariablesList";

interface VariablesProps {
  projectId: string;
}

const Variables: FC<VariablesProps> = ({ projectId }) => {
  const [accordionOpen, setAccordionOpen] = useState("");
  return (
    <div>
      <Accordion
        type="single"
        collapsible
        value={accordionOpen}
        onValueChange={setAccordionOpen}
      >
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-lg px-0 pr-6 font-semibold text-typography/80">
            Manage environment variables
          </AccordionTrigger>
          <AccordionContent className="px-0">
            <VariablesList projectId={projectId} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default Variables;
