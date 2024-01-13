#!/usr/bin/env bash

# spawn an auto-reloading site that jumps to newly edited pages

hugo \
    server \
    --buildDrafts \
    --buildExpired \
    --buildFuture \
    --gc \
    --minify \
    --navigateToChanged
