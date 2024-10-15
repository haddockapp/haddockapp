import Haddot from "@/components/atoms/haddot";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DomainResponseDto,
  useCreateDomainMutation,
  useGetAllDomainsQuery,
} from "@/services/backendApi/domains";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  domain: z.string().regex(/^[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}$/, {
    message: "Invalid domain name",
  }),
});

interface FormComponentProps {
  domain?: DomainResponseDto;
}

const SetupMainDomain: FC<FormComponentProps> = ({ domain }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domain: domain?.domain || "",
    },
  });

  const [triggerCreateDomain] = useCreateDomainMutation();

  const onSubmit = form.handleSubmit((data) => {
    triggerCreateDomain({ domain: data.domain, main: !!domain?.main })
      .unwrap()
      .then((d) => {
        toast({ title: "Domain created", description: JSON.stringify(d) });
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
                  <Input {...field} placeholder="Domain name" />
                </FormControl>
                <FormDescription className="italic">
                  eg: example.com, domain.fr...
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Confirm</Button>
        </div>
      </form>
    </Form>
  );
};

interface SetupDomainStepProps {
  value: keyof DomainResponseDto;
  title: string;
  subtitle: string;
}

const steps: SetupDomainStepProps[] = [
  {
    value: "primaryBinding",
    title: "Link primary domain name",
    subtitle:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    value: "wildcardBinding",
    title: "Link wildcard domain name",
    subtitle:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    value: "challengeBinding",
    title: "Haddock verification challenge",
    subtitle:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
];

const Domains: FC = () => {
  const { data } = useGetAllDomainsQuery();

  return (
    <div>
      <Accordion type="multiple">
        {[...(data ?? []), undefined].map((d) => (
          <AccordionItem value={d?.id ?? "new"}>
            <AccordionTrigger>
              <div className="flex items-center space-x-4">
                <Haddot completed={d?.linked} size={30} />
                <div className="text-start">
                  <h1 className="text-xl text-gray-700">
                    Setup {d?.main ? "main" : "secondary"} domain
                  </h1>
                  <p className="text-gray-400">{d?.domain}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-8 pt-1 space-y-6">
              <SetupMainDomain domain={d} />
              {steps.map((s) => (
                <div className="flex space-x-4">
                  <div className="flex h-fit mx-auto mt-4">
                    <Haddot completed={d?.linked} />
                  </div>
                  <div className="space-y-2 w-full">
                    <div className="text-start">
                      <h1 className="text-lg text-gray-700">{s.title}</h1>
                      <p className="text-gray-400">{s.subtitle}</p>
                    </div>
                    <Input value={d?.[s.value] as string} disabled />
                  </div>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default Domains;
