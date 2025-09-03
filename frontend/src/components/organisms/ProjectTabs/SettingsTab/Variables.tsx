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
    <div className="">
      <Accordion
        type="single"
        collapsible
        value={accordionOpen}
        onValueChange={setAccordionOpen}
      >
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-lg font-semibold text-typography/80">
            Manage environment variables
          </AccordionTrigger>
          <AccordionContent className="px-8">
            <VariablesList projectId={projectId} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default Variables;
