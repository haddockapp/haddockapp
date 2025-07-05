import { DomainResponseDto } from "@/services/backendApi/domains";
import { FC, useEffect, useMemo, useState } from "react";
import DomainNameForm from "./DomainNameForm";
import DomainSetupStep from "./DomainSetupStep";
import steps from "./domainSteps";
import DomainActions from "./DomainActions";
import useDomainActions from "@/hooks/use-domain";
import Haddot from "@/components/atoms/haddot";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface SetupDomainFormProps {
  domain?: DomainResponseDto;
  main?: boolean;
  onClose: () => void;
}
const SetupDomainForm: FC<SetupDomainFormProps> = ({
  domain,
  main,
  onClose,
}) => {
  const { data } = useDomainActions(domain?.id);

  return (
    <div className="px-8 pt-1 space-y-6">
      {!domain && <DomainNameForm domain={domain} main={main} />}
      {steps.map((s) => (
        <DomainSetupStep
          key={s.title}
          step={s}
          completed={data?.[s.boolean] as boolean}
          value={domain?.[s.value] as string}
        />
      ))}
      <div className="flex space-x-2">
        <DomainActions id={domain?.id} onSave={onClose} />
      </div>
    </div>
  );
};

interface DomainAccordionItemProps {
  d?: DomainResponseDto;
  isMain: boolean;
  onToggle: (id: string) => void;
}
const DomainAccordionItem: FC<DomainAccordionItemProps> = ({
  d,
  onToggle,
  isMain,
}) => {
  const id = useMemo(() => d?.id ?? "new", [d?.id]);

  return (
    <AccordionItem value={id}>
      <AccordionTrigger onClick={() => onToggle(id)}>
        <div className="flex items-center space-x-4">
          <Haddot completed={d?.linked} size={30} />
          <div className="text-start">
            <h1 className="text-xl text-gray-700">
              Setup {isMain ? "main" : "secondary"} domain
            </h1>
            <p className="text-gray-400">{d?.domain}</p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <SetupDomainForm
          onClose={() => onToggle(id)}
          domain={d}
          main={isMain}
        />
      </AccordionContent>
    </AccordionItem>
  );
};

interface DomainAccordionProps {
  domains: DomainResponseDto[];
}
const DomainAccordion: FC<DomainAccordionProps> = ({ domains }) => {
  const incompleteDomain = useMemo(
    () => domains.find((d) => !d.linked),
    [domains]
  );

  const [openedAccordions, setOpenedAccordions] = useState<string[]>(["new"]);

  useEffect(() => {
    if (incompleteDomain) setOpenedAccordions([incompleteDomain.id]);
  }, [domains, incompleteDomain]);

  return (
    <Accordion type="multiple" value={openedAccordions}>
      {(domains.every((d) => d.linked) ? [...domains, undefined] : domains).map(
        (d) => (
          <DomainAccordionItem
            key={d?.id ?? "new"}
            onToggle={(id: string) => {
              setOpenedAccordions((prev) => {
                if (prev.includes(id)) return prev.filter((v) => v !== id);
                return [...prev, id];
              });
            }}
            isMain={d?.main || domains.length === 0}
            d={d}
          />
        )
      )}
    </Accordion>
  );
};

export default DomainAccordion;
