import { Button } from "@/components/ui/button";
import { constants } from "@/constants";
import { FC } from "react";

const Home: FC = () => (
  <div className="h-screen justify-center items-center flex flex-col space-y-4">
    <div className="space-y-0">
      <img className="w-80" src="./haddock.png" />
      <h1 className="text-4xl text-center">Welcome</h1>
    </div>
    <Button
      variant="dark"
      onClick={() =>
        (window.location.href = `https://github.com/login/oauth/authorize?client_id=${constants.githubClientId}&scope=user%20repo`)
      }
      className="p-4 gap-2"
    >
      <div className="devicon-github-original" />
      <span className="text-white font-semibold">Signup with Github</span>
    </Button>
  </div>
);

export default Home;
