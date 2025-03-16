import { useGetAllDomainsQuery } from "@/services/backendApi/domains";
import { useAppDispatch, useAppSelector } from "./useStore";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { setSetupCompletion } from "@/services/authSlice";

const useSetup = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const step = params.get("step");

  const dispatch = useAppDispatch();

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

  useEffect(() => {
    if (isFetching) return;
    if (isSetupComplete) {
      dispatch(setSetupCompletion(true));
      if (!step) {
        navigate("/dashboard");
      }
    } else if (isAuth && !!domains) {
      dispatch(setSetupCompletion(false));
    }
  }, [dispatch, domains, isAuth, isFetching, isSetupComplete, navigate, step]);

  return {
    isAuthenticationStep: stepCount === 0,
    isDomainsStep: stepCount === 1,
    isSetupComplete: stepCount === 2,
    stepCount,
    isLoading: isFetching,
  };
};

export default useSetup;
