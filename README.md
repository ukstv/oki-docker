# Oki Docker
NPM packages installation in docker composed projects made easy

> Link to the Medium article will be here soon

### What is this?

Oki Docker is a compact nodejs package, that helps you to manage packages installation Docker Compose services with less pain.

### Do I need this?

If you do not develop your nodejs projects with Docker Compose - you don't need this.

### Why do I need this?

Well, I assume you use Docker Compose in development. Then you might face the next issues:
1. If your `package.json` was changed, you need to rebuild all affected Docker Compose services (or if you use `lerna` - all services), and it takes huge amount of time.
2. IDE does not help you with auto-completion anymore, because `node_modules` folder is missing.

**Oki Docker** suggest you to solve both issues at once by installing packages at Docker Entrypoint.

### How to make it work?

1. Install it globally by a command `npm i -g oki-docker` (or `yarn global add oki-docker` if you prefer yarn)
2. Add entrypoint to each Docker Compose service, that needs to install packages
3. If you use `lerna`, make sure to bind every project's directory to every service.
4. Add **Oki Docker** config file.
5. Run it inside the entrypoint by a command `oki-docker {ABS_PATH_TO_CONFIG}`

### Examples

This example will run `yarn install`, if any `package.json` (root or service-related) will change, or root `node_modules` folder will be missing / empty.
Also, it will run `yarn build` in context of `service2`, if `packages/service2/src/schema.graphql` will change.

**docker-compose.yml**

```yaml
version: '3.7'

x-shared-volumes:
  - &root_node_modules ./node_modules:/app/node_modules:cached
  - &service1_dir ./packages/service1:/app/packages/service1:cached
  - &service1_dir ./packages/service2:/app/packages/service2:cached
  - &service3_dir ./packages/service3:/app/packages/service3:cached
  - &tmp ./tmp:/app/tmp:cached
    
services:
  service1:
    ...
    entrypoint: ["/app/entrypoint-dev.sh"]
    environment:
      - OKI_PACKAGE_NAME=service1

  service2:
    ...
    entrypoint: ["/app/entrypoint-dev.sh"]
    environment:
      - OKI_PACKAGE_NAME=service2

  service3:
    ...
    entrypoint: ["/app/entrypoint-dev.sh"]
    environment:
      - OKI_PACKAGE_NAME=service3
```

**oki.config.json**

```json
{
  "projectRoot": "/app",
  "tmpPath": "/app/tmp",
  "masterPackage": "service1",
  "commands": [
    {
      "command": "yarn install",
      "checkRootNodeModules": true,
      "checkRootPackageJson": true,
      "packages": [
        "packages/service1",
        "packages/service2",
        "packages/service3"
      ]
    },
    {
      "command": "cd /app/packages/service2 && yarn build && cd -",
      "checks": [
        {
          "path": "packages/service2/src/schema.graphql",
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

oki-docker /app/oki.config.json
...
```
