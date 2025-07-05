import { FC } from "react";

const HaddockSpinner: FC = () => (
  <div className="w-36">
    <img
      className="animate-spin ease-in-out origin-center rounded-full"
      src="./haddock.png"
    />
  </div>
);

const HaddockLoader: FC = () => (
  <div className="h-screen items-center justify-center flex flex-col">
    <HaddockSpinner />
  </div>
);

export default HaddockSpinner;
export { HaddockLoader };
