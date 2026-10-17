
#!/usr/bin/env bash
set -Eeuo pipefail

# Resolve project root (parent of scripts/)
PROJECT_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

ENV_FILE="$PROJECT_ROOT/.env"
DOCKERFILE="$PROJECT_ROOT/Dockerfile"
IMAGE_NAME="ajaysinghnp/ajaysinghnp.github.io:latest"

# Validate required files
if [[ ! -f "$ENV_FILE" ]]; then
    echo "Error: .env not found at $ENV_FILE" >&2
    exit 1
fi

if [[ ! -f "$DOCKERFILE" ]]; then
    echo "Error: Dockerfile not found at $DOCKERFILE" >&2
    exit 1
fi

# Load shell-compatible environment variables from .env
set -a
source "$ENV_FILE"
set +a

# Validate the build secret
if [[ -z "${GITHUB_TOKEN:-}" ]]; then
    echo "Error: GITHUB_TOKEN is missing from .env" >&2
    exit 1
fi

echo "Building Docker image: $IMAGE_NAME"

docker build \
    --secret id=github_token,env=GITHUB_TOKEN \
    --file "$DOCKERFILE" \
    --tag "$IMAGE_NAME" \
    "$PROJECT_ROOT"

echo "Build completed: $IMAGE_NAME"
