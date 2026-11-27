#!/usr/bin/env bash
set -Eeuo pipefail
trap 'rm -f "$0"' EXIT

: "${MONGODB_URI:?MONGODB_URI must be provided by GitHub Actions}"
: "${AUTH_TOKEN_SECRET:?AUTH_TOKEN_SECRET must be provided by GitHub Actions}"
: "${FRONTEND_ORIGIN:?FRONTEND_ORIGIN must be provided by GitHub Actions}"

app_dir="/var/www/snowstep"
repo_url="https://github.com/bijayanpraj/snowstep-teesting.git"
deploy_user="$(id -un)"
deploy_group="$(id -gn)"

sudo install -d -o "$deploy_user" -g "$deploy_group" /var/www
if [ -d "$app_dir" ]; then
  sudo chown -R "$deploy_user:$deploy_group" "$app_dir"
else
  sudo install -d -o "$deploy_user" -g "$deploy_group" "$app_dir"
fi

git config --global --add safe.directory "$app_dir"

if [ -d "$app_dir/.git" ]; then
  git -C "$app_dir" remote set-url origin "$repo_url"
  git -C "$app_dir" fetch origin main
  git -C "$app_dir" reset --hard origin/main
else
  checkout_dir="$(mktemp -d /tmp/snowstep-checkout.XXXXXX)"
  trap 'rm -rf "$checkout_dir"' EXIT
  git clone --branch main --single-branch "$repo_url" "$checkout_dir"
  cp -a "$checkout_dir"/. "$app_dir"/
  rm -rf "$checkout_dir"
  trap - EXIT
fi

umask 077
if [ -f "$app_dir/backend/.env" ]; then
  chmod 600 "$app_dir/backend/.env"
else
  printf 'PORT=5000\nNODE_ENV=production\nMONGODB_URI=%s\nAUTH_TOKEN_SECRET=%s\nFRONTEND_ORIGIN=%s\n' \
    "$MONGODB_URI" "$AUTH_TOKEN_SECRET" "$FRONTEND_ORIGIN" \
    > "$app_dir/backend/.env"
  chmod 600 "$app_dir/backend/.env"
fi

npm ci --omit=dev --prefix "$app_dir/backend"
npm ci --prefix "$app_dir/frontend"
npm run build --prefix "$app_dir/frontend"

if pm2 describe snowstep-backend >/dev/null 2>&1; then
  pm2 delete snowstep-backend
fi
pm2 start "$app_dir/backend/ecosystem.config.cjs" --update-env
pm2 save

pm2_bin="$(command -v pm2)"
sudo tee /etc/systemd/system/snowstep-pm2.service >/dev/null <<SYSTEMD
[Unit]
Description=Restore Snowstep PM2 processes
After=network.target

[Service]
Type=oneshot
User=$deploy_user
Environment=PM2_HOME=/home/$deploy_user/.pm2
ExecStart=$pm2_bin resurrect
ExecStop=$pm2_bin kill
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
SYSTEMD
sudo systemctl daemon-reload
sudo systemctl enable snowstep-pm2.service

sudo install -m 0644 "$app_dir/infra/nginx.conf" \
  /etc/nginx/sites-available/snowstep
sudo ln -sfn /etc/nginx/sites-available/snowstep \
  /etc/nginx/sites-enabled/snowstep
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

healthy=0
for attempt in $(seq 1 12); do
  if curl --fail --silent http://127.0.0.1/api/health \
    | grep -q '"database":"connected"'; then
    healthy=1
    break
  fi
  sleep 5
done
if [ "$healthy" -ne 1 ]; then
  echo "Local API health check failed." >&2
  exit 1
fi

echo "Snowstep deployed at $FRONTEND_ORIGIN"
