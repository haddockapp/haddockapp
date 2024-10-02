import { FC } from "react";

const Header: FC = () => {
  return (
    <div className="flex items-center ml-4 mt-4">
      <img className="w-16" src="/haddock.png" />
      <h3 className="text-2xl ml-2">/ dashboard</h3>
    </div>
  );
};

export default Header;
