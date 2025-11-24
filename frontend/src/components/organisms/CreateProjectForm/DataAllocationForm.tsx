import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useFormContext } from "react-hook-form";

function DataAllocationForm() {
  const { control } = useFormContext();

  return (
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
  );
}

export default DataAllocationForm;
