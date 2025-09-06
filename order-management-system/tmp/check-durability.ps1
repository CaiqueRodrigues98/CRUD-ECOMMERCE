# Script de diagnóstico para testar durabilidade Kafka -> arquivos locais -> flush
# Execute a partir da raiz do repo (onde está docker-compose.yml)

Write-Output "Stopping kafka container..."
docker-compose stop kafka

Write-Output "Sending POST /orders using tmp-durability.json (verbose)..."
# Ajuste o caminho ao arquivo tmp-durability.json se necessário
curl -v -X POST http://localhost:3000/orders -H "Content-Type: application/json" --data-binary @tmp-durability.json

Write-Output "Listing persistence files in container..."
docker-compose exec app sh -c "ls -la /app/order-management-system/data || true; echo '---'; cat /app/order-management-system/data/kafka-queue.log 2>/dev/null || true; echo '---'; cat /app/order-management-system/data/kafka-queue.json 2>/dev/null || true"

Write-Output "Showing last 200 log lines from app..."
docker-compose logs --no-color --tail 200 app

Write-Output "Starting kafka container..."
docker-compose start kafka

Write-Output "Waiting 5s for app to notice kafka..."
Start-Sleep -Seconds 5

Write-Output "Showing app logs after kafka start..."
docker-compose logs --no-color --tail 200 app

Write-Output "Done."
