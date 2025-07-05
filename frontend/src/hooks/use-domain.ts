import {
  useDeleteDomainMutation,
  useGetAllDomainsQuery,
  useGetDomainStatusQuery,
} from "@/services/backendApi/domains";

const useDomainActions = (id?: string) => {
  const { data, refetch, isFetching } = useGetDomainStatusQuery(id ?? "", {
    skip: !id,
  });
  const { refetch: refetchDomains } = useGetAllDomainsQuery();

  const [triggerDeleteDomain] = useDeleteDomainMutation();

  return {
    data,
    isFetching,
    onRefetch: () => {
      refetch();
      refetchDomains();
    },
    onDelete: data ? () => triggerDeleteDomain(data.id) : undefined,
  };
};

export default useDomainActions;
