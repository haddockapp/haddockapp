import { backendApi, QueryKeys } from "..";
import { SecurityFinding, SecurityFindingDto } from "./types";

const securityApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    analyzeProject: builder.mutation<{ success: boolean }, string>({
      query: (projectId) => ({
        url: `/security/analyze/${projectId}`,
        method: "POST",
      }),
      invalidatesTags: [QueryKeys.Security],
    }),
    getFindings: builder.query<{ findings: SecurityFinding[] }, string>({
      query: (projectId) => ({
        url: `/security/findings/${projectId}`,
        method: "GET",
      }),
      providesTags: [QueryKeys.Security],
      transformResponse: (response: { findings: SecurityFindingDto[] }) => {
        return {
          findings: response.findings.map((finding) => ({
            ...finding,
            location: finding.location
              ? JSON.parse(finding.location)
              : undefined,
            metadata: finding.metadata
              ? JSON.parse(finding.metadata)
              : undefined,
          })),
        };
      },
    }),
  }),
});

export const { useAnalyzeProjectMutation, useGetFindingsQuery } = securityApi;
