import { ScrollFollow, LazyLog } from "@melloware/react-logviewer";
import { ScrollTextIcon } from "lucide-react";
import { FC, useEffect, useRef, useState } from "react";

type LogsSectionProps = {
  lines: string[];
};

const LogsSection: FC<LogsSectionProps> = ({ lines }) => {
  const [logText, setLogText] = useState("");
  const prevLinesRef = useRef<string[]>([]);

  useEffect(() => {
    const newLines = lines.slice(prevLinesRef.current.length);
    if (newLines.length > 0) {
      setLogText((prev) => prev + newLines.join("\n") + "\n");
      prevLinesRef.current = lines;
    }
  }, [lines]);

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
              text={logText}
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
