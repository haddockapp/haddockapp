import Haddot from "@/components/atoms/haddot";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FC, useMemo, useState } from "react";
import { useGetAllDomainsQuery } from "@/services/backendApi/domains";
import { ChevronRight } from "lucide-react";
import { useAppDispatch } from "@/hooks/useStore";
import { nextSetupStep } from "@/services/authSlice";
import SetupDomainForm from "@/components/organisms/DomainSetup";

const Domains: FC = () => {
  const dispatch = useAppDispatch();

  const { data } = useGetAllDomainsQuery();
  const domains = useMemo(
    () => [...(data ?? [])].sort((a, b) => +b.main - +a.main),
    [data]
  );

  const [openedAccordions, setOpenedAccordions] = useState<string[]>(["new"]);

  return (
    <>
      <div>
        <Accordion type="multiple" value={openedAccordions}>
          {[...domains, undefined].map((d) => {
            const isMain = d?.main || domains.length === 0;
            const id = d?.id ?? "new";

            return (
              <AccordionItem key={id} value={id}>
                <AccordionTrigger
                  onClick={() => {
                    setOpenedAccordions((prev) => {
                      if (prev.includes(id))
                        return prev.filter((v) => v !== id);
                      return [...prev, id];
                    });
                  }}
                >
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
                    onClose={() =>
                      setOpenedAccordions((prev) =>
                        prev.filter((v) => v !== id)
                      )
                    }
                    domain={d}
                    main={isMain}
                  />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
      <Button
        onClick={() => dispatch(nextSetupStep())}
        // disabled={!(domains ?? []).some((d) => d.linked)}
      >
        <ChevronRight />
        <span>Next</span>
      </Button>
    </>
  );
};

export default Domains;
