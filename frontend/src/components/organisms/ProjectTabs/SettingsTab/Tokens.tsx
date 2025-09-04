import { FC } from "react";
import CreateTokenDialog from "./CreateTokenDialog";
import TokensList from "./TokensList";

interface TokensProps {
  projectId: string;
}

const Tokens: FC<TokensProps> = ({ projectId }) => {
  return (
    <div className="mt-8">
      <div className="flex flex-row justify-between items-center border-b pb-4 px-4">
        <div className="flex flex-col space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">API Tokens</h3>
          <p className="text-sm text-gray-600">
            Create and manage tokens for CLI access to this project. 
            Tokens provide secure, programmatic access with specific permissions.
          </p>
        </div>
        <CreateTokenDialog projectId={projectId} />
      </div>
      
      <div className="px-4 py-6">
        <TokensList projectId={projectId} />
      </div>
    </div>
  );
};

export default Tokens;
