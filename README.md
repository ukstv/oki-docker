# Oki Docker
NPM packages installation in docker composed projects made easy

> Link to the Medium article will be here soon

### What is this?

Oki Docker is a compact nodejs package, that helps you to manage packages installation Docker Compose services with less pain.

### Do I need this?

If you do not develop your nodejs projects with Docker Compose - you don't need this.

### Why do I need this?

Well, I assume you use Docker Compose in development. Then you might face the next issues:
1. If your `package.json` was changed, you need to rebuild all affected Docker Compose services (or if you use `lerna` - I bet almost all services), and it takes huge amount of time.
2. IDE does not help you with auto-completion anymore, because `node_modules` folder is missing.

**Oki Docker** suggest you to solve both issues at once by installing packages at Docker Entrypoint.

### How to make it work?

1. Install it globally by a command `npm i -g oki-docker` (or `yarn global add oki-docker` if you prefer yarn)
2. Add entrypoint to each Docker Compose service, that needs to install packages
3. If you use `lerna`, make sure to bind every project's directory to every service.
4. Add **Oki Docker** config file.
5. Run it inside the entrypoint by a command `oki-docker {ABS_PATH_TO_CONFIG}`

### Examples

Let's say you have a monorepo with a few packages, managed by `lerna`. `common-lib` holds some reusable code, `graphql` depends on `common-lib`, `web` depends on `common-lib` and `graphql`.

In this example, `oki-docker` will run `lerna bootstrap`, if any `package.json` (in root or package dir) will change, or root `node_modules` folder will be missing / empty.

Also, it will run `yarn build` in `graphql` dir, if `packages/graphql/src/schema.graphql` will change.

Note, that by saying **_run_** I mean **run in container's entrypoint**, and only in master package's container. Other containers will wait until master package finishes running passed commands.

**docker-compose.yml**

```yaml
version: '3.7'

x-shared-volumes: &shared-volumes
  - &root-node-modules ./node_modules:/app/node_modules:cached

  - &common-lib ./packages/common-lib:/app/packages/common-lib:cached
  - &graphql ./packages/graphql:/app/packages/graphql:cached
  - &web ./packages/web:/app/packages/web:cached

  - &tmp ./tmp:/app/tmp:cached
    
services:
  common-lib:
    ...
    volumes:
      - *common-lib
      - *root-node-modules
      - *tmp
      - ./custom-dir:/app/custom-dir

    entrypoint: ["/app/entrypoint-dev.sh"]
    environment:
      - OKI_PACKAGE_NAME=common-lib

  graphql:
    ...
    volumes:
      - *graphql
      - *common-lib
      - *root-node-modules
      - *tmp
    entrypoint: ["/app/entrypoint-dev.sh"]
    environment:
      - OKI_PACKAGE_NAME=graphql

  web:
    ...
    volumes: *shared-volumes
    entrypoint: ["/app/entrypoint-dev.sh"]
    environment:
      - OKI_PACKAGE_NAME=web
```

**oki.config.json**

```json
{
  "projectRoot": "/app",
  "tmpPath": "/app/tmp",
  "masterPackage": "common-lib",
  "commands": [
    {
      "command": "lerna bootstrap",
      "checkRootNodeModules": true,
      "checkRootPackageJson": true,
      "packages": [
        "packages/common-lib",
        "packages/graphql",
        "packages/web"
      ]
    },
    {
      "command": "cd /app/packages/graphql && yarn build && cd -",
      "checks": [
        {
          "path": "packages/graphql/src/schema.graphql",
          "trigger": "diff"
        }
      ]
    }
  ]
}
```

**entrypoint-dev.sh**

```bash
#!/usr/bin/env bash

set -e

oki-docker /app/oki.config.json
...

exec "$@"
```
