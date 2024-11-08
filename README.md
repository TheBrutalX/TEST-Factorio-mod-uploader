[![Release](https://github.com/TheBrutalX/factorio-mod-uploader-action/actions/workflows/release.yml/badge.svg?branch=main)](https://github.com/TheBrutalX/factorio-mod-uploader-action/actions/workflows/release.yml) [![CodeQL](https://github.com/TheBrutalX/factorio-mod-uploader-action/actions/workflows/github-code-scanning/codeql/badge.svg?branch=main)](https://github.com/TheBrutalX/factorio-mod-uploader-action/actions/workflows/github-code-scanning/codeql)

# Factorio Mod Uploader Action

A GitHub Action to automate uploading Factorio mods to the [Factorio Mod Portal](https://mods.factorio.com/).

## Workflow Example

Create a workflow file in `.github/workflows/publish.yml`:

```yaml
name: Publish Factorio Mod

on:
    push:
        branches:
            - main

jobs:
    publish-mod:
        runs-on: ubuntu-latest
        steps:
            - name: Checkout Repository
              uses: actions/checkout@v4

            - name: Set up Node.js
              uses: actions/setup-node@v3
              with:
                  node-version: '20'

            - name: Validate Mod
              uses: TheBrutalX/factorio-mod-uploader-action@v1
              with:
                  action: validate

            - name: Create zip
              uses: TheBrutalX/factorio-mod-uploader-action@v1
              with:
                  action: compress

            - name: Upload Mod
              uses: TheBrutalX/factorio-mod-uploader-action@v1
              with:
                  action: upload
                  factorio-api-key: ${{ secrets.FACTORIO_API_KEY }}
```

## Repository Overview

This repository contains a GitHub Action designed to streamline the process of packaging and uploading Factorio mods. It executes steps such as checking out the repository, installing dependencies, building the mod, and uploading it to the Factorio Mod Portal.

## Step overview

### Validate Mod

The `Validate Mod` step ensures that the `info.json` file in your mod directory is correctly formatted and contains valid information. It performs the following checks:

-   Verifies the presence of `info.json`.
-   Ensures `info.json` contains `name` and `version` fields.
-   Validates the length and format of the mod name.
-   Checks if the mod version follows semantic versioning.
-   Confirms that the mod version is newer than the version available on the Factorio Mod Portal.

If all checks pass, it exports the mod name, version, and folder as environment variables for subsequent steps.

**Input Parameters**
| Name | Description | Required | From Enviroment | Default |
|------------|------------------------------|----------|----------|------------------------|
| `MOD-FOLDER` | Path to the mod folder (specify if not root of project) | false | false | `GITHUB_WORKSPACE` |

**Output Variables**
| Name | Description |
|-------------|------------------------------|
| `MOD_NAME` | The name of the mod |
| `MOD_VERSION` | The version of the mod |
| `MOD_FOLDER` | The path to the mod folder |

### Create zip

The `Create zip` step packages your mod directory into a zip file. This is useful for preparing the mod for upload to the Factorio Mod Portal. It performs the following actions:

-   Reads the mod name, version, and folder from environment variables.
-   Creates a temporary directory for the zip file.
-   Copies the mod directory to the temporary directory.
-   Compresses the mod directory into a zip file.
-   Exports the path to the created zip file as an environment variable.

**Input Parameters** > _If parameter not set from user the value was set from Enviroment_
| Name | Description | Required | From Enviroment | Default |
|------------|------------------------------|----------|----------|------------------------|
| `MOD-NAME` | The name of the mod | false | true | |
| `MOD-FOLDER` | Path to the mod folder | false | true | |
| `MOD-VERSION`| The version of the mod | false | true | |

**Output Variables**
| Name | Description |
|-------------|------------------------------|
| `ZIP_FILE` | The path to the created zip file |

### Upload Mod

The `Upload Mod` step uploads the created zip file to the Factorio Mod Portal. It performs the following actions:

-   Reads the mod name and zip file path from environment variables.
-   Retrieves an upload URL from the Factorio Mod Portal.
-   Uploads the zip file to the retrieved URL.
-   Confirms the successful upload of the mod.

**Input Parameters** > _If parameter not set from user the value was set from Environment_
| Name | Description | Required | From Environment | Default |
|------------------|------------------------------|----------|------------------|------------------------|
| `MOD-NAME` | The name of the mod | false | true | |
| `ZIP-FILE` | The path to the zip file | false | true | |
| `FACTORIO-API-KEY` | The API key for Factorio | true | false | |

**Output Variables**
| Name | Description |
|-------------|------------------------------|
| `UPLOAD_URL`| The URL used for uploading the mod |
