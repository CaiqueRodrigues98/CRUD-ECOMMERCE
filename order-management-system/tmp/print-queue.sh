#!/bin/sh
# Bash helper (use inside host) to print queue files
set -e

echo "Listing data dir in app container..."
docker-compose exec app sh -c "ls -la /app/order-management-system/data || true"
echo "---"
echo "kafka-queue.log content:" 

docker-compose exec app sh -c "cat /app/order-management-system/data/kafka-queue.log 2>/dev/null || true"
echo "---"
echo "kafka-queue.json content:"
docker-compose exec app sh -c "cat /app/order-management-system/data/kafka-queue.json 2>/dev/null || true"
echo "---"
