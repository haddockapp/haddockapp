#!/bin/bash

# Check if a resource name was provided
if [ -z "$1" ]; then
  echo "Usage: $0 [resourceName]"
  exit 1
fi

RESOURCE_NAME=$1
BASE_DIR="./src/services/backendApi/$RESOURCE_NAME"

# Create the directory
mkdir -p "$BASE_DIR"

# Create index.ts
cat <<EOF > "$BASE_DIR/index.ts"
export * from './$RESOURCE_NAME.service';
export * from './$RESOURCE_NAME.dto';
EOF

# Create [resourceName].service.ts
cat <<EOF > "$BASE_DIR/$RESOURCE_NAME.service.ts"
import { backendApi } from "@/services/backendApi";

const ${RESOURCE_NAME}Api = backendApi.injectEndpoints({
  endpoints: (builder) => ({
  
  })
});

export const {} = ${RESOURCE_NAME}Api;

export default ${RESOURCE_NAME}Api;
EOF

# Create [resourceName].dto.ts
cat <<EOF > "$BASE_DIR/$RESOURCE_NAME.dto.ts"
export default {};
EOF

echo "Service files for '$RESOURCE_NAME' created in $BASE_DIR"
