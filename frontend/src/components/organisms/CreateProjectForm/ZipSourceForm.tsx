import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormContext } from "react-hook-form";

function ZipSourceForm() {
  const { control } = useFormContext();

  return (
    <div className="flex flex-col gap-6">
      <FormField
        control={control}
        name="composePath"
        rules={{ required: true }}
        render={({ field }) => (
          <FormItem className="w-full">
            <Label>Compose path</Label>
            <FormControl>
              <Input {...field} placeholder="e.g., docker-compose.yml" />
            </FormControl>
            <p className="text-[0.8rem] text-muted-foreground">
              Path to the compose file within your ZIP archive.
            </p>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export default ZipSourceForm;
