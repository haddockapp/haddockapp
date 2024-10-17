import Haddot from "@/components/atoms/haddot";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FC, useMemo } from "react";
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

  return (
    <>
      <div>
        <Accordion type="multiple">
          {[...domains, undefined].map((d) => {
            const isMain = d?.main || domains.length === 0;

            return (
              <AccordionItem key={d?.id ?? "new"} value={d?.id ?? "new"}>
                <AccordionTrigger>
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
                  <SetupDomainForm domain={d} main={isMain} />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
      <Button
        onClick={() => dispatch(nextSetupStep())}
        disabled={!(domains ?? []).some((d) => d.linked)}
      >
        <ChevronRight />
        <span>Next</span>
      </Button>
    </>
  );
};

export default Domains;
