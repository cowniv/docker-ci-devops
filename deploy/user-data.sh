#!/bin/bash
# EC2 bootstrap script (runs once as root on first boot via "user data").
# Target: Amazon Linux 2023, t3.micro.
#
# What it does:
#   1. installs Docker + the compose plugin + git
#   2. clones the repo into /opt/notes-api
#   3. writes a .env with a random Postgres password
#   4. starts db + migrate + api + nginx with docker compose
#
# Logs: /var/log/user-data.log  (and `sudo cloud-init status`)
