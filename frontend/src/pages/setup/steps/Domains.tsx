import { Button } from "@/components/ui/button";
import { FC, useCallback, useEffect, useMemo } from "react";
import {
  useApplyDomainMutation,
  useGetAllDomainsQuery,
} from "@/services/backendApi/domains";
import { ChevronRight } from "lucide-react";
import DomainAccordion from "@/components/organisms/DomainSetup";
import { useSearchParams } from "react-router-dom";
import useSetup from "@/hooks/use-setup";
import { toast } from "@/hooks/use-toast";
import { setBackendUrl } from "@/services/configSlice";
import { useAppDispatch } from "@/hooks/useStore";

const Domains: FC = () => {
  const dispatch = useAppDispatch();

  const { data } = useGetAllDomainsQuery();
  const [triggerApplyDomain, { isLoading: isApplying }] =
    useApplyDomainMutation();
  const domains = useMemo(
    () => [...(data ?? [])].sort((a, b) => +b.main - +a.main),
    [data]
  );

  const { isLoading } = useSetup();

  const [, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (!isLoading) setSearchParams({ step: "domains" });
  }, [isLoading, setSearchParams]);

  const handleApply = useCallback(() => {
    triggerApplyDomain()
      .unwrap()
      .then(({ autologin, backendUrl, frontendUrl }) => {
        toast({
          title: "Success",
          description: "Domains setup successfully",
        });
        dispatch(setBackendUrl(backendUrl));
        window.location.href = `${frontendUrl}/autologin?token=${autologin}`;
      })
      .catch((e) => {
        toast({
          title: "Error",
          variant: "destructive",
          description: "An error occurred while setting up the domains",
        });
        console.error(e);
      });
  }, [dispatch, triggerApplyDomain]);

  return (
    <>
      <div>
        <DomainAccordion domains={domains} />
      </div>
      <Button
        onClick={handleApply}
        disabled={!(domains ?? []).some((d) => d.linked) || isApplying}
      >
        <ChevronRight />
        <span>Next</span>
      </Button>
    </>
  );
};

export default Domains;
