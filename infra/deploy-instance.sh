#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 4 ]; then
  echo "Usage: deploy-instance.sh STACK_NAME PUBLIC_URL RELEASE_ID AWS_REGION" >&2
  exit 2
fi

stack_name="$1"
public_url="$2"
release_id="$3"
export AWS_DEFAULT_REGION="$4"

source_root="/tmp/snowstep-release"
app_root="/var/www/snowstep"
release_dir="$app_root/releases/$release_id"

install -d -o ubuntu -g ubuntu "$release_dir"
cp -a "$source_root/backend" "$release_dir/"
install -d -o ubuntu -g ubuntu "$release_dir/frontend"
cp -a "$source_root/frontend/dist" "$release_dir/frontend/"
install -d -o ubuntu -g ubuntu "$release_dir/infra"
cp "$source_root/infra/nginx-snowstep.conf" "$release_dir/infra/"
chown -R ubuntu:ubuntu "$release_dir"

get_parameter() {
  aws ssm get-parameter \
    --name "/$stack_name/$1" \
    --with-decryption \
    --query "Parameter.Value" \
    --output text
}

mongodb_uri="$(get_parameter MONGODB_URI)"
auth_token_secret="$(get_parameter AUTH_TOKEN_SECRET)"

printf 'NODE_ENV=production\nPORT=5000\nMONGODB_URI=%s\nAUTH_TOKEN_SECRET=%s\nFRONTEND_ORIGIN=%s\n' \
  "$mongodb_uri" "$auth_token_secret" "$public_url" \
  > "$release_dir/backend/.env"
chmod 600 "$release_dir/backend/.env"
chown ubuntu:ubuntu "$release_dir/backend/.env"

runuser -u ubuntu -- npm ci --omit=dev --prefix "$release_dir/backend"
ln -sfn "$release_dir" "$app_root/current"

install -m 0644 "$release_dir/infra/nginx-snowstep.conf" \
  /etc/nginx/sites-available/snowstep
ln -sfn /etc/nginx/sites-available/snowstep /etc/nginx/sites-enabled/snowstep
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

pm2_bin="$(command -v pm2)"
cat > /etc/systemd/system/snowstep-pm2.service <<EOF
[Unit]
Description=Restore Snowstep PM2 processes
After=network.target

[Service]
Type=oneshot
User=ubuntu
Environment=PM2_HOME=/home/ubuntu/.pm2
ExecStart=$pm2_bin resurrect
ExecStop=$pm2_bin kill
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable snowstep-pm2.service

runuser -u ubuntu -- env PM2_HOME=/home/ubuntu/.pm2 \
  "$pm2_bin" startOrReload \
  "$app_root/current/backend/ecosystem.config.cjs" --update-env
runuser -u ubuntu -- env PM2_HOME=/home/ubuntu/.pm2 "$pm2_bin" save
systemctl start snowstep-pm2.service

for attempt in $(seq 1 12); do
  if curl --silent --fail http://127.0.0.1:5000/api/health \
    | grep -q '"database":"connected"'; then
    echo "Snowstep API is healthy and connected to MongoDB."
    exit 0
  fi
  sleep 5
done

runuser -u ubuntu -- env PM2_HOME=/home/ubuntu/.pm2 \
  "$pm2_bin" logs snowstep-api --lines 40 --nostream || true
echo "Snowstep API health check failed." >&2
exit 1
