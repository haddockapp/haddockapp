import { ScrollFollow, LazyLog } from "@melloware/react-logviewer";
import { ScrollTextIcon } from "lucide-react";
import { FC, useMemo } from "react";

type LogsSectionProps = {
  lines: string[];
};

const LogsSection: FC<LogsSectionProps> = ({ lines }) => {
  const text = useMemo<string>(() => lines.join("\n"), [lines]);

  return (
    <div className="space-y-2">
      <div className="flex flex-row items-center space-x-2">
        <ScrollTextIcon />
        <h3 className="text-lg font-semibold text-gray-800">Docker Logs</h3>
      </div>
      <div className="w-full h-96">
        <ScrollFollow
          startFollowing={true}
          render={({ follow, onScroll }) => (
            <LazyLog
              selectableLines
              enableSearch
              text={text}
              follow={follow}
              onScroll={onScroll}
            />
          )}
        />
      </div>
    </div>
  );
};

export default LogsSection;
