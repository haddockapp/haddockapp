import { FC } from "react";
import Divider from "../atoms/divider";

const OrDivider: FC = () => (
  <div className="flex items-center">
    <Divider />
    <span className="text-typography/50 px-2 select-none">OR</span>
    <Divider />
  </div>
);

export default OrDivider;
