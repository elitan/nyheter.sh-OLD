#!/bin/bash

git pull
docker compose -f docker-compose.yaml --project-name nyheter up -d --build
