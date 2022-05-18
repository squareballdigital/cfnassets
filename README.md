# @squareball/cfnassets

Build asset zip packages for deployment.

## Quick Start

You need an assets config file:

```jsonc
// cfnassets.config.json
{
  "api": {
    "type": "rollup",
    "options": {
      "entrypoint": "./core/lib/api/lambda.js",
      "install": ["source-map-support"],
      "packageFilePath": "package.json",
      "packageInstallImage": "node:16-slim",
      "packageLockPath": "package-lock.json"
    }
  },
  "app-client": {
    "type": "content",
    "options": {
      "source": "apps/client/build"
    }
  }
}
```

Then run:

```
cfnassets build --config cfnassets.config.json
```

## Work In Progress 🚧

This project has been hacked off the codebase of another project, and is currently missing documentation.

![We Can Do It!](https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/We_Can_Do_It%21_NARA_535413_-_Restoration_2.jpg/800px-We_Can_Do_It%21_NARA_535413_-_Restoration_2.jpg)

Help wanted 😁
