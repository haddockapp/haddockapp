import CreateSelect from "@/components/molecules/create-select";
import Select from "@/components/molecules/select";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useGetAllAuthorizationsQuery,
  AuthorizationEnum,
} from "@/services/backendApi/authorizations";
import {
  useGetAllRepositoriesQuery,
  useGetAllBranchesByRepositoryQuery,
} from "@/services/backendApi/github";
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";

function GithubSourceForm() {
  const { control, watch } = useFormContext();

  const watchAuthorization = watch("authorization")?.value;
  const watchRepository = watch("repository")?.value;

  const { currentData: authorizations, isFetching: isFetchingAuthorizations } =
    useGetAllAuthorizationsQuery();

  const canFetchReposAndBranches = useMemo(() => {
    if (!watchAuthorization) return false;
    const authorization = authorizations?.find(
      (authorization) => authorization.id === watchAuthorization
    );
    if (!authorization) return false;
    return authorization?.type !== AuthorizationEnum.DEPLOY_KEY;
  }, [authorizations, watchAuthorization]);

  const { currentData: repositories, isFetching: isFetchingRepositories } =
    useGetAllRepositoriesQuery(
      { authorization: watchAuthorization! },
      { skip: !watchAuthorization || !canFetchReposAndBranches }
    );
  const { currentData: branches, isFetching: isFetchingBranches } =
    useGetAllBranchesByRepositoryQuery(
      { repository: watchRepository, authorization: watchAuthorization! },
      { skip: !watchRepository || !canFetchReposAndBranches }
    );

  const authorizationsOptions = useMemo(
    () =>
      authorizations?.map((authorization) => ({
        label: `${authorization.name} (${authorization.type})`,
        value: authorization.id,
      })) ?? [],
    [authorizations]
  );

  const repositoriesOptions = useMemo(
    () =>
      repositories?.map((repository) => ({
        label: repository.full_name,
        value: repository.full_name,
      })) ?? [],
    [repositories]
  );

  const branchesOptions = useMemo(
    () =>
      branches?.map((branch) => ({
        label: branch,
        value: branch,
      })) ?? [],
    [branches]
  );

  return (
    <div className="flex flex-col justify-between space-y-4">
      <FormField
        control={control}
        name="authorization"
        render={({ field }) => (
          <FormItem>
            <Label>Authorization</Label>
            <FormControl>
              <Select
                {...field}
                isLoading={isFetchingAuthorizations}
                options={[
                  { value: "", label: "N/A" },
                  ...authorizationsOptions,
                ]}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="repository"
        rules={{ required: true }}
        render={({ field }) => (
          <FormItem>
            <Label>Repository</Label>
            <FormControl>
              <CreateSelect
                isLoading={isFetchingRepositories}
                options={repositoriesOptions}
                isSelect={canFetchReposAndBranches}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="branch"
        rules={{ required: true }}
        render={({ field }) => (
          <FormItem>
            <Label>Branch</Label>
            <FormControl>
              <CreateSelect
                isLoading={isFetchingBranches}
                isDisabled={!watch("repository")}
                options={branchesOptions}
                isSelect={canFetchReposAndBranches}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="composePath"
        rules={{ required: true }}
        render={({ field }) => (
          <FormItem>
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

export default GithubSourceForm;
