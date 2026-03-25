# CI/CD Pipeline Using Jenkins with Ansible

## Project Tree

```bash
repo/
 ├── ansible/
 │     ├── inventory
 │     ├── deploy.yml
 │     └── rollback.yml
```

## Requirements

- Change Apache root folder
- Install Plugin SSH-Agent on Jenkins UI

## Recommended

- Add automatic rollback on health check failure
- Add deployment lock
- Add database migration stage
- Add blue/green with symlink switching
- Add shared directory for:
  - .env
  - uploads
  - logs
- Add release cleanup policy (keep last 5)
