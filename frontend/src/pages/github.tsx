import HaddockSpinner from "@/components/atoms/spinner";
import { useAppDispatch } from "@/hooks/useStore";
import { setToken } from "@/services/authSlice";
import { FC, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { constants } from "@/constants";
import axios from "axios";

const GithubCallback: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const [, query] = document.location.href.split("?");
    if (!query) return;
    const code = query.split("=")[1];
    if (code && code.length > 0) {
      axios
        .post(`${constants.apiUrl}/auth/github`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          code,
        })
        .then(({ data }: { data: { accessToken: string } }) => {
          dispatch(setToken(data.accessToken));
          navigate("/dashboard");
        });
    }
  }, [dispatch, navigate]);

  return (
    <div className="h-screen justify-center items-center flex flex-col">
      <HaddockSpinner />
      <p>Loading . . .</p>
    </div>
  );
};

export default GithubCallback;
