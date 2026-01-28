import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AITools } from "@/services/backendApi/projects/sources.dto";
import { FC } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { AnimatePresence, motion } from "framer-motion";
import CopiableField from "@/components/molecules/copiable-field";
import { useAppSelector } from "@/hooks/useStore";
import { useGetDeploymentCodeQuery } from "@/services/backendApi/projects";
import { Skeleton } from "@/components/ui/skeleton";
import { Theme } from "@/services/settingsSlice";

const aiToolToLabel: Record<AITools, string> = {
  [AITools.VSCODE]: "VSCode",
  [AITools.CURSOR]: "Cursor",
  [AITools.ZED]: "Zed",
  [AITools.WINDSURF]: "Windsurf",
};

const aiToolToFetchCommand: Record<AITools, string> = {
  [AITools.VSCODE]: "#fetch",
  [AITools.CURSOR]: "@web",
  [AITools.ZED]: "@fetch",
  [AITools.WINDSURF]: "@web",
};

const getAiToolToLogo = (theme: Theme): Record<AITools, React.ReactNode> => ({
  [AITools.VSCODE]: (
    <img src="/vscode.png" alt="VSCode Logo" className="size-5 shrink-0" />
  ),
  [AITools.CURSOR]: (
    <img src="/cursor.png" alt="Cursor Logo" className="size-5 shrink-0" />
  ),
  [AITools.ZED]: (
    <div className={`${theme === Theme.LIGHT ? "bg-black rounded p-1" : ""}`}>
      <img src="/zed.png" alt="Zed Logo" className="size-5 shrink-0" />
    </div>
  ),
  [AITools.WINDSURF]: (
    <img
      src="/windsurf.png"
      alt="Windsurf Logo"
      className={`size-5 shrink-0 rounded-full ${theme === Theme.LIGHT ? "" : "bg-foreground"}`}
    />
  ),
});

type AIToolCardProps = {
  label: React.ReactNode;
  value: AITools;
  onChangeValue: (value: AITools) => void;
  isActive: boolean;
};

const AIToolCard: FC<AIToolCardProps> = ({
  label,
  value,
  onChangeValue,
  isActive,
}) => (
  <Card
    onClick={() => onChangeValue(value)}
    className={twMerge(
      "p-2 flex-1 justify-center md:p-8 flex flex-row items-center gap-2 text-typography/70",
      isActive
        ? "text-primary cursor-default"
        : "hover:text-primary cursor-pointer hover:shadow-md transition-shadow",
    )}
  >
    <span className="text-md md:text-xl">{label}</span>
  </Card>
);
function AISourceForm() {
  const { watch, control, setValue } = useFormContext<{
    tool: AITools;
  }>();
  const watchTool = watch("tool");
  const handleReset = () => {
    // @ts-expect-error resetting field
    setValue("tool", undefined);
  };

  const {
    data: deploymentCode,
    isFetching,
    isError,
    refetch,
  } = useGetDeploymentCodeQuery();
  const code = deploymentCode?.deploy_code ?? "XXXXXX";

  const { backendUrl } = useAppSelector((state) => state.config);
  const theme = useAppSelector((state) => state.settings.theme);
  const aiToolToLogo = getAiToolToLogo(theme);

  return (
    <AnimatePresence>
      <div className="flex flex-col gap-6 py-4 w-full">
        <span className="text-xl text-typography font-semibold">
          Deploy with AI
        </span>
        {!watchTool ? (
          <motion.div
            key="pick-tool"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-8 w-full justify-center text-center"
          >
            <span className="text-xl text-typography font-semibold">
              Pick your tool
            </span>
            <Controller
              name="tool"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-4 ">
                  {Object.values(AITools).map((tool) => (
                    <AIToolCard
                      key={tool}
                      label={
                        <div className="flex flex-row gap-2 items-center">
                          {aiToolToLogo[tool]}
                          {aiToolToLabel[tool]}
                        </div>
                      }
                      value={tool}
                      onChangeValue={field.onChange}
                      isActive={field.value === tool}
                    />
                  ))}
                </div>
              )}
            />
          </motion.div>
        ) : (
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-row gap-2 items-center">
              <span className="text-md text-typography pointer-events-none">
                {aiToolToLabel[watchTool]}
              </span>
              {aiToolToLogo[watchTool]}
              <Button onClick={handleReset} variant="link">
                Change
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-typography/80">
                In chat window type this and VSCode will learn how to use
                Haddock :
              </span>
              <CopiableField
                value={`${aiToolToFetchCommand[watchTool]} ${backendUrl}/llms.txt`}
                containerClassName="text-center"
                className="self-center"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-typography">Usage</span>
              <span className="text-typography/80">
                Ask Copilot to deploy your project to Haddock using the
                following temporary deploy key :
              </span>
              <Skeleton loading={isFetching} className="w-fit self-center">
                <CopiableField
                  value={code}
                  containerClassName="text-center"
                  className="self-center"
                />
              </Skeleton>
              {isError ? (
                <span className="text-xs text-destructive text-center">
                  There was an error while attempting to load the deploy key.
                </span>
              ) : (
                <span className="text-xs text-typography/70 text-center">
                  ex: "Deploy to Haddock using code {code}"
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                className="self-center"
                type="button"
                onClick={() => refetch()}
              >
                Generate new key
              </Button>
            </div>
            {watchTool && (
              <Button type="submit" className="w-fit self-center mt-8">
                Done
              </Button>
            )}
          </div>
        )}
      </div>
    </AnimatePresence>
  );
}

export default AISourceForm;
