---
statement: The database is provisioned outside the deployment and reached only through a connection URL supplied as configuration; the deployment provisions no database service.
scope: system
fitness: The deployment declares no database service, and the connection URL is read from environment configuration and from nowhere else.
---

## Description

A managed instance somebody else operates is what the deployment gets, so nothing here backs up, upgrades or fails over a database.
Which provider operates it is a deployment choice and not a solution bound: naming one would refuse a second environment provisioned differently, while the property a check can hold — that the deployment provisions nothing and hardcodes no endpoint — is what this states instead.
