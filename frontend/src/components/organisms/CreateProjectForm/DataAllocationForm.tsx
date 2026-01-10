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
    [watchDisk, watchMemory, watchVcpus]
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Card
            key={preset.label}
            onClick={() => applyPreset(preset)}
            className={twMerge(
              "flex flex-col gap-2 flex-1 px-12 py-8 items-center hover:border-card-foreground hover:bg-primary/20 cursor-pointer duration-200",
              isPresetActive(preset) &&
                "border-primary/40 hover:border-primary/40 cursor-default hover:bg-primary/10 bg-primary/10"
            )}
          >
            {preset.icon}
            <span>{preset.label}</span>
          </Card>
        ))}
      </div>
      <div className="flex flex-col justify-between space-y-6">
        <FormField
          control={control}
          name="vcpus"
          rules={{ required: true }}
          render={({ field }) => (
            <FormItem className="space-y-2">
              <Label className="flex justify-between">
                <span>CPUs</span>
                <span className="text-typography/40">{field.value}</span>
              </Label>
              <FormControl>
                <Slider
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
            <FormItem className="space-y-2">
              <Label className="flex justify-between">
                <span>Memory</span>
                <span className="text-typography/40">{field.value} MB</span>
              </Label>
              <FormControl>
                <Slider
                  value={[field.value]}
                  onValueChange={([v]) => field.onChange(v)}
                  min={1024}
                  max={8192}
                  step={1024}
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
            <FormItem className="space-y-2">
              <Label className="flex justify-between">
                <span>Disk</span>
                <span className="text-typography/40">{field.value} MB</span>
              </Label>
              <FormControl>
                <Slider
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
  );
}

export default DataAllocationForm;
