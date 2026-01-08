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
    <div className="flex flex-row items-center justify-around">
      <FormField
        control={control}
        name="composePath"
        rules={{ required: true }}
        render={({ field }) => (
          <FormItem className="w-full">
            <Label>Compose path</Label>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export default ZipSourceForm;
