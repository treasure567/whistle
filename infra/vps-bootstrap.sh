#!/usr/bin/env bash
set -euo pipefail

# Provisions a fresh Ubuntu 22.04/24.04 host for the whistle backend:
# Node 24 (via nvm), pnpm, PM2, PostgreSQL 17, Redis 7, and nginx.
# Run as a sudo-capable user. Idempotent where practical. Secrets are
# placeholders; set real values in the per-app shared/.env after running.

NODE_VERSION="24"
PM2_VERSION="5.4.3"
DB_NAME="${DB_NAME:-whistle}"
DB_USER="${DB_USER:-whistle}"
APPS=("api" "agents")

echo "==> apt base packages"
sudo apt-get update -y
sudo apt-get install -y curl ca-certificates gnupg git build-essential ufw

echo "==> Node ${NODE_VERSION} via nvm + pnpm via corepack"
export NVM_DIR="$HOME/.nvm"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
fi
. "$NVM_DIR/nvm.sh"
nvm install "$NODE_VERSION"
nvm use "$NODE_VERSION"
corepack enable
corepack prepare pnpm@10.5.0 --activate
npm install -g "pm2@${PM2_VERSION}"

echo "==> PostgreSQL 17"
if ! command -v psql >/dev/null 2>&1; then
  sudo install -d /usr/share/postgresql-common/pgdg
  curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc \
    | sudo gpg --dearmor -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.gpg
  echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.gpg] https://apt.postgresql.org/pub/repos/apt $(. /etc/os-release && echo "$VERSION_CODENAME")-pgdg main" \
    | sudo tee /etc/apt/sources.list.d/pgdg.list >/dev/null
  sudo apt-get update -y
  sudo apt-get install -y postgresql-17
fi

echo "==> database role and database"
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE ROLE ${DB_USER} LOGIN PASSWORD 'replace_me';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"

echo "==> Redis 7"
sudo apt-get install -y redis-server
sudo systemctl enable --now redis-server

echo "==> nginx"
sudo apt-get install -y nginx
sudo systemctl enable --now nginx

echo "==> release directories"
for app in "${APPS[@]}"; do
  mkdir -p "$HOME/whistle/$app"/{releases,incoming,shared/logs}
  touch "$HOME/whistle/$app/shared/.env"
done

echo "==> firewall (ssh + http + https)"
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo "done. Next: fill shared/.env per app, run prisma migrate deploy + db:seed,"
echo "install the nginx site from infra/nginx.conf, then deploy via the GitHub workflow."
