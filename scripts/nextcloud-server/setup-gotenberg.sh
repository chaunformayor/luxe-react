#!/usr/bin/env bash
# Adds Gotenberg (Word -> PDF converter used by luxestl.com e-sign templates) to the Nextcloud
# Docker stack and exposes it at https://nextcloud.midwestinvestorservices.com/gotenberg/
# behind basic auth. Safe to re-run. Backs up both files it edits.
#
# Run from your PC:
#   ssh -i ~/.ssh/oracle_nextcloud opc@163.192.115.174 'sudo bash -s' < scripts/nextcloud-server/setup-gotenberg.sh
#
# It prints GOTENBERG_PASSWORD at the end — add it to Vercel (with GOTENBERG_URL) and redeploy.
set -euo pipefail
cd /home/opc/nextcloud-stack
STAMP=$(date +%Y-%m-%d)
cp -n docker-compose.yml "docker-compose.yml.bak-$STAMP"
cp -n proxy/data/nginx/custom/server_proxy.conf "proxy/data/nginx/custom/server_proxy.conf.bak-$STAMP"

if ! grep -q '^GOTENBERG_PASSWORD=' .env; then
  echo "GOTENBERG_PASSWORD=$(openssl rand -hex 24)" >> .env
fi

if ! grep -q '^  gotenberg:' docker-compose.yml; then
  cat > /tmp/gotenberg-svc.yml <<'EOF'
  # Gotenberg: Word -> PDF for luxestl.com e-sign templates. LibreOffice route only, basic auth,
  # no URL fetching or webhooks.
  gotenberg:
    image: gotenberg/gotenberg:8
    container_name: gotenberg
    restart: always
    command:
      - gotenberg
      - --api-root-path=/gotenberg/
      - --api-enable-basic-auth
      - --api-timeout=90s
      - --api-body-limit=30MB
      - --api-disable-download-from
      - --chromium-disable-routes
      - --webhook-disable
    environment:
      - GOTENBERG_API_BASIC_AUTH_USERNAME=luxe
      - GOTENBERG_API_BASIC_AUTH_PASSWORD=${GOTENBERG_PASSWORD}

EOF
  # Insert the service just above the top-level "volumes:" section.
  awk 'FNR==NR { block = block $0 "\n"; next } /^volumes:/ && !done { printf "%s", block; done = 1 } { print }' \
    /tmp/gotenberg-svc.yml docker-compose.yml > /tmp/compose.new
  mv /tmp/compose.new docker-compose.yml
fi

docker compose config -q
docker compose up -d gotenberg

if ! grep -q 'location ^~ /gotenberg/' proxy/data/nginx/custom/server_proxy.conf; then
  cat >> proxy/data/nginx/custom/server_proxy.conf <<'EOF'

# Gotenberg (Word -> PDF for luxestl.com); Gotenberg itself enforces basic auth
location ^~ /gotenberg/ {
    proxy_pass http://gotenberg:3000;
    proxy_set_header Host $host;
    client_max_body_size 30m;
    proxy_read_timeout 120s;
}
EOF
fi

sleep 8
docker exec proxy-manager nginx -t
docker exec proxy-manager nginx -s reload
docker ps --filter name=gotenberg --format '{{.Names}}: {{.Status}}'
echo
echo "Done. Add these to Vercel (Production), then redeploy:"
echo "  GOTENBERG_URL=https://nextcloud.midwestinvestorservices.com/gotenberg"
echo "  GOTENBERG_PASSWORD=$(grep '^GOTENBERG_PASSWORD=' .env | cut -d= -f2)"
