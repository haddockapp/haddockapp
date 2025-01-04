import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAppDispatch } from "@/hooks/useStore";
import { nextSetupStep } from "@/services/authSlice";
import {
  useCreateConfigurationMutation,
  useGetConfigurationQuery,
} from "@/services/backendApi/configuration";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight } from "lucide-react";
import { FC, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  clientId: z.string().length(20),
  clientSecret: z.string().length(40),
});

const Configuration: FC = () => {
  const dispatch = useAppDispatch();

  const { data } = useGetConfigurationQuery();
  const [triggerCreateConfiguration] = useCreateConfigurationMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const handleCreateConfiguration = useCallback(
    (data: z.infer<typeof formSchema>) => {
      triggerCreateConfiguration({
        client_id: data.clientId,
        client_secret: data.clientSecret,
      })
        .unwrap()
        .catch((e) => {
          console.error(e);
        });
    },
    [triggerCreateConfiguration]
  );

  useEffect(() => {
    if (data) {
      const clientId = data.find((d) => d.key === "github_client_id")?.value;
      const clientSecret = data.find(
        (d) => d.key === "github_client_secret"
      )?.value;
      if (clientId) form.setValue("clientId", clientId);
      if (clientSecret) form.setValue("clientSecret", clientSecret);
    }
  }, [data, form]);

  const onSubmit = form.handleSubmit(handleCreateConfiguration);

  return (
    <Form {...form}>
      <form
        onSubmit={onSubmit}
        className="mx-auto space-y-4 w-[400px] text-start"
      >
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Github Client ID</FormLabel>
              <FormControl>
                <Input placeholder="0v20GH9zccjbTmUJO2Kf" {...field}></Input>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="clientSecret"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Github Client Secret</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="3p2m7wgbqmo4th8dj12v3p2m7wgbqmo4th8dj12v"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {data?.length == 0 ? (
          <Button type="submit">Submit</Button>
        ) : (
          <Button
            onClick={() => dispatch(nextSetupStep())}
            disabled={(data?.length ?? 0) == 0}
          >
            <ChevronRight />
            <span>Next</span>
          </Button>
        )}
      </form>
    </Form>
  );
};

export default Configuration;
