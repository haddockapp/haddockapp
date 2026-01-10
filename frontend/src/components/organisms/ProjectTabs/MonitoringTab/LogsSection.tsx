import { Card } from "@/components/ui/card";
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
    <Card className="w-full h-96 p-8">
      <ScrollFollow
        startFollowing={true}
        render={({ follow, onScroll }) => (
          <LazyLog
            lineClassName="text-sm text-typography hover:bg-primary/10 duration-200"
            selectableLines
            enableSearch
            text={logText}
            follow={follow}
            onScroll={onScroll}
          />
        )}
      />
    </Card>
  );
};

export default LogsSection;
