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
        uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'

      - name: Install Dependencies
        run: npm install

      - name: Validate Mod
        uses: actions/factorio-mod-uploader@1
        with:
          action: validate
          mod-dir: ./test_mod

      - name: Create zip
        uses: actions/factorio-mod-uploader@1
        with:
          action: compress

      - name: Upload Mod
        uses: actions/factorio-mod-uploader@1
        with:
          action: upload
          token: ${{ secrets.FACTORIO_TOKEN }}
          mod-file: './dist/mod.zip'
```

## Repository Overview

This repository contains a GitHub Action designed to streamline the process of packaging and uploading Factorio mods. It executes steps such as checking out the repository, installing dependencies, building the mod, and uploading it to the Factorio Mod Portal.
