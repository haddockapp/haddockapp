import {
  useDeleteDomainMutation,
  useGetDomainStatusQuery,
} from "@/services/backendApi/domains";

const useDomainActions = (id?: string) => {
  const { data, refetch, isFetching } = useGetDomainStatusQuery(id ?? "", {
    skip: !id,
  });
  const [triggerDeleteDomain] = useDeleteDomainMutation();

  return {
    data,
    isFetching,
    onRefetch: refetch,
    onDelete: data ? () => triggerDeleteDomain(data.id) : undefined,
  };
};

export default useDomainActions;
