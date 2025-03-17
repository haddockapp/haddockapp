import { Button } from "@/components/ui/button";
import { FC, useEffect, useMemo } from "react";
import { useGetAllDomainsQuery } from "@/services/backendApi/domains";
import { ChevronRight } from "lucide-react";
import DomainAccordion from "@/components/organisms/DomainSetup";
import { useNavigate, useSearchParams } from "react-router-dom";
import useSetup from "@/hooks/use-setup";

const Domains: FC = () => {
  const navigate = useNavigate();

  const { data } = useGetAllDomainsQuery();
  const domains = useMemo(
    () => [...(data ?? [])].sort((a, b) => +b.main - +a.main),
    [data]
  );

  const { isLoading } = useSetup();

  const [, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (!isLoading) setSearchParams({ step: "domains" });
  }, [isLoading, setSearchParams]);

  return (
    <>
      <div>
        <DomainAccordion domains={domains} />
      </div>
      <Button
        onClick={() => navigate("/setup?step=welcome")}
        disabled={!(domains ?? []).some((d) => d.linked)}
      >
        <ChevronRight />
        <span>Next</span>
      </Button>
    </>
  );
};

export default Domains;
