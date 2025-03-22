import { useGetAllDomainsQuery } from "@/services/backendApi/domains";
import { useAppSelector } from "./useStore";
import { useSearchParams } from "react-router-dom";

const useSetup = () => {
  const [params] = useSearchParams();
  const step = params.get("step");

  const { isAuth } = useAppSelector((state) => state.auth);
  const { data: domains, isFetching } = useGetAllDomainsQuery(undefined, {
    skip: !isAuth,
  });

  const isAuthenticationStep = !isAuth;
  const isDomainsStep = isAuth && !(domains?.at(0)?.linked ?? false);
  const isSetupComplete = isAuth && (domains?.at(0)?.linked ?? false);

  const stepCount = isAuthenticationStep
    ? 0
    : isDomainsStep || (step === "domains" && isSetupComplete)
    ? 1
    : isSetupComplete
    ? 2
    : 0;

  return {
    isAuthenticationStep: stepCount === 0,
    isDomainsStep: stepCount === 1,
    isSetupComplete: stepCount === 2,
    stepCount,
    isLoading: isFetching,
  };
};

export default useSetup;
