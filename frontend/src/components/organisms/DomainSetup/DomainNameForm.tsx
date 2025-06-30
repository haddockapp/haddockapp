import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  Form,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import {
  DomainResponseDto,
  useCreateDomainMutation,
} from "@/services/backendApi/domains";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  domain: z.string().regex(/^[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,8}$/, {
    message: "Invalid domain name",
  }),
  https: z.boolean().optional(),
});

interface DomainNameFormProps {
  domain?: DomainResponseDto;
  https?: boolean;
  main?: boolean;
}
const DomainNameForm: FC<DomainNameFormProps> = ({ domain, main }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      https: domain?.https || undefined,
      domain: domain?.domain || "",
    },
  });

  const [triggerCreateDomain] = useCreateDomainMutation();

  const onSubmit = form.handleSubmit((data) => {
    triggerCreateDomain({
      domain: data.domain,
      main: main ?? false,
      https: data.https,
    })
      .unwrap()
      .then(() => {
        toast({ title: "Domain created successfully" });
        form.reset();
      })
      .catch((e) => {
        toast({ title: "Error", description: JSON.stringify(e) });
      });
  });

  return (
    <Form {...form}>
      <form className="text-start" onSubmit={onSubmit}>
        <div className="flex space-x-4">
          <FormField
            control={form.control}
            name="domain"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input {...field} placeholder="example.com, domain.fr..." />
                </FormControl>
                <FormMessage className="h-0" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="https"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel
                  className={`text-gray-700 text-sm min-w-14 ${
                    field.value === undefined ? "text-gray-400" : ""
                  }`}
                >
                  {field.value === true
                    ? "HTTPS"
                    : field.value === false
                    ? "HTTP"
                    : "HTTPS?"}
                </FormLabel>
              </FormItem>
            )}
          />
          <Button type="submit">Confirm</Button>
        </div>
      </form>
    </Form>
  );
};

export default DomainNameForm;
