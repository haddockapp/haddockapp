import { FC } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import Authorizations from "./Authorizations";

const settings = [
  {
    key: "authorizations",
    name: "Authorizations",
    Component: Authorizations,
  },
];

const Settings: FC = () => {
  return (
    <Accordion type="multiple" defaultValue={[settings[0].key]}>
      {settings.map(({ key, name, Component }) => (
        <AccordionItem key={key} value={key}>
          <AccordionTrigger className="text-xl">{name}</AccordionTrigger>
          <AccordionContent>
            <Component />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default Settings;
