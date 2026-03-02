---
title: "Example Case Study: Warehouse Modernization"
date: "2025-03-01"
type: "Case Study"
status: "Completed"
stack:
  cloud: ["GCP", "BigQuery"]
  data: ["dbt"]
  orchestration: ["Airflow"]
  iac: ["Terraform"]
  languages: ["Python", "SQL"]
repo:
nda: false
highlights:
  - "Migrated legacy reporting to a modern warehouse with curated layers and semantic models."
  - "Implemented data quality checks, documentation, and alerting for critical tables."
results:
  - "Improved query performance and reduced cost with partitioning + clustering."
  - "Unified KPIs with a single source of truth."
learnings:
  - "Invest early in contracts and ownership to prevent downstream breaks."
tags: ["bigquery", "dbt", "airflow"]
featured: true
---

## Problem

Describe the business problem in a few bullets.

## Solution

Outline the approach and why it fits.

## Architecture

```mermaid
flowchart LR
  A[Sources] --> B[Ingestion]
  B --> C[Raw / Bronze]
  C --> D[Transform / Silver]
  D --> E[Mart / Gold]
  E --> F[BI / Apps]
```

## Tradeoffs

Call out important tradeoffs and why you chose them.

## Results

Summarize outcomes and impact.
