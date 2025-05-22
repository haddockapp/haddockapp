import { HaddockLoader } from "@/components/atoms/spinner";
import { toast } from "@/hooks/use-toast";
import { useAppDispatch } from "@/hooks/useStore";
import { logout, setToken } from "@/services/authSlice";
import { useAutologinMutation } from "@/services/backendApi/auth";
import { FC, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const AutologinPage: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [triggerUseAutologin] = useAutologinMutation();

  useEffect(() => {
    if (token) {
      triggerUseAutologin({ token })
        .unwrap()
        .then(({ accessToken }) => {
          dispatch(setToken(accessToken));
          navigate("/setup?step=welcome");
        })
        .catch((e) => {
          console.error(e);
          toast({
            title: "Error",
            description: e.data.message,
            variant: "destructive",
          });
          dispatch(logout());
          navigate("/");
        });
    }
  }, [dispatch, navigate, token, triggerUseAutologin]);

  return <HaddockLoader />;
};

export default AutologinPage;
