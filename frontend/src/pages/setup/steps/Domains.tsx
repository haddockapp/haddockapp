import { Button } from "@/components/ui/button";
import { FC, useMemo } from "react";
import { useGetAllDomainsQuery } from "@/services/backendApi/domains";
import { ChevronRight } from "lucide-react";
import { useAppDispatch } from "@/hooks/useStore";
import { nextSetupStep } from "@/services/authSlice";
import DomainAccordion from "@/components/organisms/DomainSetup";

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
        <DomainAccordion domains={domains} />
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
