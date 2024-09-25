import { FC } from "react";

const HaddockSpinner: FC = () => (
  <div className="w-36">
    <img
      className="animate-spin ease-in-out origin-center rounded-full"
      src="./haddock.png"
    />
  </div>
);

export default HaddockSpinner;
