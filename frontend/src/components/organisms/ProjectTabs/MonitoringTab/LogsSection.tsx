import { ScrollFollow, LazyLog } from "@melloware/react-logviewer";
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
    <div className="w-full h-96">
      <ScrollFollow
        startFollowing={true}
        render={({ follow, onScroll }) => (
          <LazyLog
            style={{ backgroundColor: "transparent" }}
            selectableLines
            enableSearch
            text={logText}
            follow={follow}
            onScroll={onScroll}
          />
        )}
      />
    </div>
  );
};

export default LogsSection;
