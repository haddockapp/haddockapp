import { FC, useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import Authorizations from "./Authorizations";
import ChangeGithubApplication from "./ChangeGithubApplication";

const settings = [
  {
    key: "github-application",
    name: "GitHub Application",
    Component: ChangeGithubApplication,
  },
  {
    key: "authorizations",
    name: "Authorizations",
    Component: Authorizations,
  },
];

const Settings: FC = () => {
  const [accordionOpen, setAccordionOpen] = useState<string[]>([]);

  return (
    <Accordion type="multiple" value={accordionOpen}>
      {settings.map(({ key, name, Component }) => (
        <AccordionItem key={key} value={key}>
          <AccordionTrigger
            onClick={() =>
              setAccordionOpen((pV) =>
                pV.includes(key) ? pV.filter((v) => v !== key) : [...pV, key]
              )
            }
            className="text-xl"
          >
            {name}
          </AccordionTrigger>
          <AccordionContent>
            <Component
              onClose={() =>
                setAccordionOpen((pV) => pV.filter((v) => v !== key))
              }
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default Settings;
