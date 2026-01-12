#!/bin/bash
# EC2 bootstrap script (runs once as root on first boot via "user data").
# Target: Amazon Linux 2023, t3.micro.
#
# What it does:
#   1. installs Docker + the compose plugin + git
#   2. clones the repo into /opt/notes-api
#   3. writes a .env with a random Postgres password
#   4. starts db + migrate + api + nginx with docker compose
#
# Logs: /var/log/user-data.log  (and `sudo cloud-init status`)
#
# Placeholders to change before using:
#   REPO_URL - your own fork of this project
set -euo pipefail
exec > >(tee /var/log/user-data.log) 2>&1

REPO_URL="https://github.com/YOUR_GITHUB_USER/24-docker-ci-devops.git"
APP_DIR="/opt/notes-api"
COMPOSE_VERSION="v2.29.7"

echo "==> Installing Docker and git"
dnf update -y
dnf install -y docker git
systemctl enable --now docker
usermod -aG docker ec2-user

echo "==> Installing docker compose plugin"
mkdir -p /usr/local/lib/docker/cli-plugins
curl -fsSL "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-linux-x86_64" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

echo "==> Fetching the app"
git clone --depth 1 "$REPO_URL" "$APP_DIR"
cd "$APP_DIR"

echo "==> Writing .env (password generated on the box, never committed)"
if [ ! -f .env ]; then
  cat > .env <<EOF
POSTGRES_USER=notes
POSTGRES_PASSWORD=$(openssl rand -hex 24)
POSTGRES_DB=notes
LOG_LEVEL=info
HTTP_PORT=80
EOF
  chmod 600 .env
fi

echo "==> Starting the stack"
docker compose up -d --build

echo "==> Done. Try: curl http://<public-ip>/health"
