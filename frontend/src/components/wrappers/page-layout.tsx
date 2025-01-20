import { FC } from "react";
import { Outlet } from "react-router-dom";
import Header from "@/components/organisms/Header";

const Layout: FC = () => (
  <div className="h-full w-full space-y-8 mb-2 px-2 py-2">
    <Header />
    <div className="overflow-scroll w-full h-full">
      <Outlet />
    </div>
  </div>
);

export default Layout;
