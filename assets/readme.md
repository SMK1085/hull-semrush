# Semrush

The Hull Connector for Semrush allows you to run analytics reports from Semrush and enrich your profile data with the results.

> This connector is under active development, features are subject to change and the documentation might not be complete yet.

## Getting Started

1. From your Hull Connectors page click on **Add a Connector**.
2. Search for "Semrush" and click on **Install**
3. Authorize Hull to connect with the Semrush API by entering the api key:
   ![Semrush API Key](./docs/getting_started_01.png)

## Available Reports

The connector allows you to run several reports from Semrush to enrich your profile data in Hull. You can control which reports to run by specifying one or more segments in the respective Account Filter setting.

### Traffic Overview

The description _is not available yet_.

### Backlinks Categories

The description _is not available yet_.

## FAQ

### When is a profile being enriched

The connector receives updates from the Hull platform if anything on a given user or account profile changes and then almost immediately calls the Semrush API if the profile matches one of the whitelisted segments for the respective report.
This means in most cases the Semrush results will be available within a few minutes.
