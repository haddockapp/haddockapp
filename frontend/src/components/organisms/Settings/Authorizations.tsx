import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FC, useCallback } from "react";
import SimpleDialog from "@/components/organisms/SimpleDialog";
import {
  AuthorizationEnum,
  useCreateAuthorizationMutation,
} from "@/services/backendApi/authorizations";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const DEPLOY_KEY_PLACEHOLDER = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAK...jLV05UD
-----END RSA PRIVATE KEY-----`;
const PERSONAL_ACCESS_TOKEN_PLACEHOLDER = `ghp_HDIdBXGBK2M...uqjw9W1uRJ5x`;
const OAUTH_PLACEHOLDER = `15db4ce0ecba489a2721`;

type Form = {
  type: AuthorizationEnum;
  token?: string;
  code?: string;
  key?: string;
};

const authorizationTypeLabels: Record<AuthorizationEnum, string> = {
  [AuthorizationEnum.DEPLOY_KEY]: "Private Key",
  [AuthorizationEnum.OAUTH]: "OAuth",
  [AuthorizationEnum.PERSONAL_ACCESS_TOKEN]: "Personal Access Token",
};

const formSchema = z.object({
  type: z.enum([
    AuthorizationEnum.DEPLOY_KEY,
    AuthorizationEnum.OAUTH,
    AuthorizationEnum.PERSONAL_ACCESS_TOKEN,
  ]),
  token: z.string().regex(/^github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59}$/, {
    message: "Invalid token format",
  }),
  code: z
    .string()
    .regex(/^gho_[a-zA-Z0-9]{36}$/, { message: "Invalid OAuth code format" }),
  key: z
    .string()
    .regex(
      /^-----BEGIN(?: (?:RSA|OPENSSH|ED25519))? PRIVATE KEY-----\s*(\S[\s\S]*?)\s*-----END(?: (?:RSA|OPENSSH|ED25519))? PRIVATE KEY-----\n$/,
      { message: "Invalid key format" }
    ),
});

const CreateNewAuthorization: FC = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const [triggerCreateAuthorization] = useCreateAuthorizationMutation();

  const handleCreateAuthorization = useCallback(
    (data: z.infer<typeof formSchema>) => {
      console.log(data);
      const createDeployKey = (key: string) =>
        triggerCreateAuthorization({
          type: AuthorizationEnum.DEPLOY_KEY,
          data: { key },
        });
      const createOAuth = (code: string) =>
        triggerCreateAuthorization({
          type: AuthorizationEnum.OAUTH,
          data: { code },
        });
      const createToken = (token: string) =>
        triggerCreateAuthorization({
          type: AuthorizationEnum.PERSONAL_ACCESS_TOKEN,
          data: { token },
        });

      let createFn;
      if (data.code) createFn = createOAuth(data.code);
      else if (data.key) createFn = createDeployKey(data.key);
      else if (data.token) createFn = createToken(data.token);

      createFn
        ?.unwrap()
        .then(() => {
          toast({
            title: "Authorization created succesfully",
            duration: 1000,
            variant: "default",
          });
        })
        .catch(() => {
          toast({
            title: "Authorization could not be created",
            duration: 1000,
            variant: "destructive",
          });
        });
    },
    [triggerCreateAuthorization]
  );

  const onSubmit = form.handleSubmit(handleCreateAuthorization);

  const watchType = form.watch("type");

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-3"
                >
                  {Object.values(AuthorizationEnum).map((a) => (
                    <FormItem
                      key={a}
                      className="flex items-center space-x-1 space-y-0"
                    >
                      <FormControl>
                        <RadioGroupItem value={a} />
                      </FormControl>
                      <FormLabel
                        className={cn(
                          !field.value
                            ? `text-black`
                            : field.value === a
                            ? `text-primary`
                            : `text-gray-500`,
                          "duration-500"
                        )}
                      >
                        {authorizationTypeLabels[a]}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {watchType === AuthorizationEnum.DEPLOY_KEY && (
          <FormField
            control={form.control}
            name="key"
            rules={{ required: true }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Private Key</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={DEPLOY_KEY_PLACEHOLDER}
                    className="h-20"
                  />
                </FormControl>
                <FormDescription className="pt-2">
                  You can execute the command{" "}
                  <span
                    onClick={() => {
                      navigator.clipboard.writeText("cat ~/.ssh/id_rsa");
                      toast({
                        title: "Copied to clipboard",
                        duration: 1000,
                      });
                    }}
                    className="cursor-pointer bg-zinc-800 font-extralight text-zinc-50 w-fit p-1"
                  >
                    cat ~/.ssh/id_rsa
                  </span>{" "}
                  inside a terminal to print out your SSH key.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {watchType === AuthorizationEnum.PERSONAL_ACCESS_TOKEN && (
          <FormField
            control={form.control}
            name="token"
            rules={{ required: true }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Personal Access Token</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={PERSONAL_ACCESS_TOKEN_PLACEHOLDER}
                  />
                </FormControl>
                <FormDescription>
                  Learn more about Personal Access Tokens by visiting the{" "}
                  <a
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens"
                  >
                    official github documentation
                  </a>
                  .
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {watchType === AuthorizationEnum.OAUTH && (
          <FormField
            control={form.control}
            name="code"
            rules={{ required: true }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>OAuth Code</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={OAUTH_PLACEHOLDER} />
                </FormControl>{" "}
                <FormDescription>
                  Learn more about OAuth by visiting the{" "}
                  <a
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app"
                  >
                    official github documentation
                  </a>
                  .
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button type="submit" className="w-fit">
          Confirm
        </Button>
      </form>
    </Form>
  );
};

const Authorizations: FC = () => {
  //   const { data: authorizations, isLoading } = useGetAllAuthorizationsQuery();

  return (
    <div className="flex flex-col space-y-4">
      <p className="text-zinc-600">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
        mollis placerat leo in pellentesque. Vivamus tellus dolor, euismod eget
        luctus vel, placerat nec metus. Proin nibh ligula, porta eu libero
        ultricies, vulputate sodales augue.
      </p>
      <SimpleDialog
        title="Add a new Authorization"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    Suspendisse mollis placerat leo in pellentesque. Vivamus tellus
    dolor, euismod eget luctus vel, placerat nec metus. Proin nibh
    ligula, porta eu libero ultricies, vulputate sodales augue."
        Content={() => <CreateNewAuthorization />}
        Trigger={({ onOpen }) => (
          <Button onClick={onOpen} className="w-fit space-x-2">
            <Plus />
            <span>Add authorization</span>
          </Button>
        )}
      />
    </div>
  );
};

export default Authorizations;
