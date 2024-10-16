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
import { FC, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import {
  useCreateDomainMutation,
  useDeleteDomainMutation,
  useGetAllDomainsQuery,
  useGetDomainStatusQuery,
} from "@/services/backendApi/domains";
import {
  DomainResponseDto,
  DomainStatusDto,
} from "@/services/backendApi/domains/domains.dto";
import { Check, Copy, RefreshCw, Trash } from "lucide-react";

const formSchema = z.object({
  domain: z.string().regex(/^[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}$/, {
    message: "Invalid domain name",
  }),
});

interface FormComponentProps {
  domain?: DomainResponseDto;
  main?: boolean;
}

const SetupMainDomain: FC<FormComponentProps> = ({ domain, main }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domain: domain?.domain || "",
    },
  });

  const [triggerCreateDomain] = useCreateDomainMutation();

  const onSubmit = form.handleSubmit((data) => {
    triggerCreateDomain({ domain: data.domain, main: main ?? false })
      .unwrap()
      .then((d) => {
        toast({ title: "Domain created", description: JSON.stringify(d) });
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
  boolean: keyof DomainStatusDto;
  value: keyof DomainResponseDto;
  title: string;
  subtitle: string;
}

const steps: SetupDomainStepProps[] = [
  {
    boolean: "primaryStatus",
    value: "primaryBinding",
    title: "Link primary domain name",
    subtitle:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    boolean: "wildcardStatus",
    value: "wildcardBinding",
    title: "Link wildcard domain name",
    subtitle:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    boolean: "challengeStatus",
    value: "challengeBinding",
    title: "Haddock verification challenge",
    subtitle:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
];

interface SetupDomainFormProps {
  domain?: DomainResponseDto;
  main?: boolean;
}
const SetupDomainForm: FC<SetupDomainFormProps> = ({ domain, main }) => {
  const { data, refetch, isFetching } = useGetDomainStatusQuery(
    domain?.id ?? "",
    {
      skip: !domain,
    }
  );

  const [triggerDeleteDomain] = useDeleteDomainMutation();

  return (
    <div className="px-8 pt-1 space-y-6">
      {!domain && <SetupMainDomain domain={domain} main={main} />}
      {steps.map((s) => (
        <div key={s.title} className="flex space-x-4">
          <div className="flex h-fit mx-auto mt-4">
            <Haddot completed={data?.[s.boolean] as boolean} />
          </div>
          <div className="space-y-2 w-full">
            <div className="text-start">
              <h1 className="text-lg text-gray-700">{s.title}</h1>
              <p className="text-gray-400">{s.subtitle}</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="border-gray-200 border rounded-sm p-2 bg-gray-100 text-start min-w-80 min-h-8">
                <span className="text-gray-600">
                  {domain?.[s.value] as string}
                </span>
              </div>
              {!!domain?.[s.value] && (
                <Copy
                  onClick={() => {
                    navigator.clipboard.writeText(domain?.[s.value] as string);
                    toast({
                      title: "Copied to clipboard",
                      duration: 1000,
                    });
                  }}
                  size="16px"
                  className="text-primary cursor-pointer"
                />
              )}
            </div>
          </div>
        </div>
      ))}
      <div className="flex space-x-2">
        <Button
          disabled={isFetching}
          onClick={refetch}
          className="space-x-2"
          variant="secondary"
        >
          <RefreshCw size="16px" />
          <span>Refresh</span>
        </Button>
        {!!domain && (
          <Button
            className="space-x-2"
            variant="destructive"
            onClick={() => triggerDeleteDomain(domain?.id)}
          >
            <Trash size="16px" />
            <span>Delete domain</span>
          </Button>
        )}
        <Button disabled={!data?.canBeLinked} className="space-x-2">
          {/* TODO: make this button collapse accordion when clicked */}
          <Check size="16px" />
          <span>Save</span>
        </Button>
      </div>
    </div>
  );
};

const Domains: FC = () => {
  const { data } = useGetAllDomainsQuery();
  const domains = useMemo(
    () => [...(data ?? [])].sort((a, b) => +b.main - +a.main),
    [data]
  );

  return (
    <div>
      <Accordion type="multiple">
        {[...domains, undefined].map((d) => {
          const isMain = d?.main || domains.length === 0;

          return (
            <AccordionItem key={d?.id ?? "new"} value={d?.id ?? "new"}>
              <AccordionTrigger>
                <div className="flex items-center space-x-4">
                  <Haddot completed={d?.linked} size={30} />
                  <div className="text-start">
                    <h1 className="text-xl text-gray-700">
                      Setup {isMain ? "main" : "secondary"} domain
                    </h1>
                    <p className="text-gray-400">{d?.domain}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <SetupDomainForm domain={d} main={isMain} />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default Domains;
