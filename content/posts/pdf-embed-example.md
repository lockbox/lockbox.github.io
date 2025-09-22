---
title: "PDF Embed Shortcode Example"
date: 2025-01-22T10:00:00-05:00
draft: true
summary: "Example usage of the PDF embed shortcode with Adobe PDF Embed API"
categories: ["examples"]
tags: ["hugo", "pdf", "shortcodes"]
---

This post demonstrates how to use the PDF embed shortcode.

## Basic Usage

The simplest way to embed a PDF:

```
{{</* pdf "https://example.com/document.pdf" */>}}
```

## With Parameters

You can customize the PDF viewer with various parameters:

```
{{</* pdf url="https://example.com/document.pdf"
         title="My Document"
         height="800px"
         mode="FULL_WINDOW"
         annotations="true"
         panel="true"
         download="true"
         print="true"
         controls="true" */>}}
```

## Available Parameters

- `url` (required): The URL of the PDF to embed
- `title`: Display title for the PDF (default: "PDF Document")
- `height`: Height of the viewer (default: "600px")
- `mode`: Embed mode - "FULL_WINDOW", "SIZED_CONTAINER", "IN_LINE", or "LIGHT_BOX" (default: "FULL_WINDOW")
- `annotations`: Show annotation tools (default: "true")
- `panel`: Show left hand panel (default: "true")
- `download`: Allow PDF download (default: "true")
- `print`: Allow PDF printing (default: "true")
- `controls`: Show page controls (default: "true")

## Setup Instructions

**NOTE**: You do not need to use the client api

1. Get a free Adobe PDF Embed API client ID from: https://www.adobe.com/go/dcsdks_credentials
2. Add your client ID to `hugo.toml`:
   ```toml
   [params.adobe]
     pdfEmbedClientId = "YOUR_CLIENT_ID_HERE"
   ```
3. Use the shortcode

### Fallback Behavior

If no Adobe client ID is configured, the shortcode will fall back to using a standard iframe embed with a link to open the PDF in a new tab.

## Example with a Sample PDF

Here's an example embedding a sample PDF (this refers to a remote pdf, so it should fail by default unless the content security policy is updated):

{{< pdf url="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" title="Sample PDF Document" height="700px" >}}
