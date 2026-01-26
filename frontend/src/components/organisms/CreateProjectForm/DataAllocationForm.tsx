import { Card } from "@/components/ui/card";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Feather, Gem, Zap } from "lucide-react";
import { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { twMerge } from "tailwind-merge";

const presets = [
  { label: "Light", icon: <Feather />, vcpus: 2, memory: 2048, disk: 512 },
  { label: "Medium", icon: <Zap />, vcpus: 4, memory: 4096, disk: 1024 },
  { label: "Powerful", icon: <Gem />, vcpus: 8, memory: 8192, disk: 2048 },
];

function DataAllocationForm() {
  const { control, setValue, watch } = useFormContext();

  const [watchVcpus, watchMemory, watchDisk] = watch([
    "vcpus",
    "memory",
    "disk",
  ]);

  const applyPreset = (preset: (typeof presets)[number]) => {
    if (preset.vcpus) setValue("vcpus", preset.vcpus);
    if (preset.memory) setValue("memory", preset.memory);
    if (preset.disk) setValue("disk", preset.disk);
  };

  const isPresetActive = useCallback(
    (preset: (typeof presets)[number]) =>
      (preset.vcpus ? preset.vcpus === watchVcpus : true) &&
      (preset.memory ? preset.memory === watchMemory : true) &&
      (preset.disk ? preset.disk === watchDisk : true),
    [watchDisk, watchMemory, watchVcpus],
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Card
            key={preset.label}
            onClick={() => applyPreset(preset)}
            className={twMerge(
              "flex flex-col gap-3 flex-1 px-8 py-6 items-center justify-center text-center hover:border-primary/50 hover:bg-muted/50 cursor-pointer duration-300 transition-all group relative border-2",
              isPresetActive(preset) &&
                "border-primary bg-primary/5 text-primary shadow-md hover:border-primary cursor-default",
            )}
          >
            <div
              className={twMerge(
                "p-3 rounded-full bg-background shadow-sm transition-transform duration-300 group-hover:scale-110",
                isPresetActive(preset) && "bg-primary/20",
              )}
            >
              {preset.icon}
            </div>
            <div className="space-y-1">
              <span className="font-semibold text-lg">{preset.label}</span>
              <div className="text-xs text-muted-foreground flex flex-col gap-0.5">
                <span>{preset.vcpus} vCPUs</span>
                <span>{preset.memory} MB RAM</span>
                <span>{preset.disk} MB Disk</span>
              </div>
            </div>
            {isPresetActive(preset) && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />
            )}
          </Card>
        ))}
      </div>
      <div className="flex flex-col justify-between space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 bg-muted/30 rounded-xl border border-border/50">
          <FormField
            control={control}
            name="vcpus"
            rules={{ required: true }}
            render={({ field }) => (
              <FormItem className="space-y-4">
                <Label className="flex justify-between items-center">
                  <span className="font-medium">CPUs</span>
                  <span className="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded text-sm">
                    {field.value} Core{field.value > 1 ? "s" : ""}
                  </span>
                </Label>
                <FormControl>
                  <Slider
                    className="py-4"
                    value={[field.value]}
                    onValueChange={([v]) => field.onChange(v)}
                    min={1}
                    max={8}
                    step={1}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="memory"
            rules={{ required: true }}
            render={({ field }) => (
              <FormItem className="space-y-4">
                <Label className="flex justify-between items-center">
                  <span className="font-medium">Memory</span>
                  <span className="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded text-sm">
                    {field.value} MB
                  </span>
                </Label>
                <FormControl>
                  <Slider
                    className="py-4"
                    value={[field.value]}
                    onValueChange={([v]) => field.onChange(v)}
                    min={1024}
                    max={8192}
                    step={512}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="disk"
            rules={{ required: true }}
            render={({ field }) => (
              <FormItem className="space-y-4">
                <Label className="flex justify-between items-center">
                  <span className="font-medium">Disk</span>
                  <span className="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded text-sm">
                    {field.value} MB
                  </span>
                </Label>
                <FormControl>
                  <Slider
                    className="py-4"
                    value={[field.value]}
                    onValueChange={([v]) => field.onChange(v)}
                    min={256}
                    max={2048}
                    step={256}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}

export default DataAllocationForm;
