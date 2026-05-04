# Phase 4 Deployment & Security Runbook

This runbook operationalizes Phase 4 for SimpleHome on the host at `/opt/docker`.

## 1. What was hardened

- `simplehome_db`, `simplehome_backend`, `simplehome_frontend` now use:
  - dedicated Docker network: `simplehome_net` (plus default network for compatibility),
  - healthchecks and startup dependency conditions,
  - aligned DB password variable (`SIMPLEHOME_DB_PASSWORD`),
  - no direct host port exposure for DB/backend/frontend.
- Backend exposes `GET /api/health` for runtime checks.
- Backend CORS is restricted by `CORS_ORIGINS` (default dashboard domain).
- Backend and frontend Dockerfiles are converted to production multi-stage builds.

## 2. Required environment variable

Set a strong DB password in the compose environment source (recommended: `/opt/docker/.env`):

```bash
SIMPLEHOME_DB_PASSWORD=replace_with_a_strong_secret
```

If not set, compose falls back to `simplehome_secret` (works but not recommended for production).

Backend variable template is available at:

- `backend/env.template`

## 3. Deploy

```bash
/opt/docker/simplehome/scripts/phase4/deploy.sh
```

This script validates compose, builds images, starts services, and waits for health.

## 4. Verify

```bash
/opt/docker/simplehome/scripts/phase4/verify.sh
```

Checks included:

- Compose syntax is valid.
- `simplehome_*` containers are running.
- Health status of DB/backend/frontend.
- Backend `/api/health` is reachable.
- DB/backend/frontend are not exposing host ports.
- NPM proxy host config contains:
  - `dashboard.hungthinhcloud.freeddns.org`
  - `api.hungthinhcloud.freeddns.org`

## 5. Nginx Proxy Manager expectations

NPM should route:

- `dashboard.hungthinhcloud.freeddns.org` -> `simplehome_frontend:3000`
- `api.hungthinhcloud.freeddns.org` -> `simplehome_backend:4000`

Both should have Let's Encrypt SSL and Force SSL enabled.

## 6. Firewall (UFW)

Dry-run:

```bash
/opt/docker/simplehome/scripts/phase4/ufw-phase4.sh
```

Apply (root required):

```bash
sudo /opt/docker/simplehome/scripts/phase4/ufw-phase4.sh --apply
```

Target policy:

- default: deny incoming, allow outgoing,
- allow: `80/tcp`, `443/tcp`, `1883/tcp`.

## 7. Rollback

If deployment has issues, return to previous containers:

```bash
docker compose -f /opt/docker/docker-compose.yml up -d --no-build simplehome_db simplehome_backend simplehome_frontend
```

And inspect logs:

```bash
docker logs --tail 200 simplehome_backend
docker logs --tail 200 simplehome_frontend
docker logs --tail 200 simplehome_db
```
