import { FC } from "react";

interface StatusTabProps {
  status: string;
  image: string;
}

const StatusTab: FC<StatusTabProps> = ({ status, image }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p>Current status</p>
        <div className="flex w-fit h-fit px-2 py-1 bg-green-500 bg-opacity-25 rounded-sm items-center justify-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <p className="text-green-500 font-medium text-sm">{status}</p>
        </div>
      </div>
      <div className="flex flex-col">
        <p>Image</p>
        <div className="flex items-center gap-1 ml-3 mt-2">
          <div className="w-1 h-1 bg-neutral-950 rounded-full" />
          <p>{image}</p>
        </div>
      </div>
    </div>
  );
};

export default StatusTab;
