#!/bin/bash

# Thiết lập biến
STACK_NAME="my_stack"          # Tên của stack
SERVICE_NAME="app"             # Tên của service trong stack

# Cập nhật lại service và force restart
echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
echo "Updating and restarting service '$SERVICE_NAME' in stack '$STACK_NAME'..."
docker service update --force $STACK_NAME"_"$SERVICE_NAME

# Kiểm tra trạng thái của service sau khi update
echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
echo "Checking the status of the service..."
SERVICE_STATUS=$(docker service ps $STACK_NAME"_"$SERVICE_NAME --filter "desired-state=running" --format "{{.CurrentState}}")

# Kiểm tra nếu service đã chạy thành công
if [[ "$SERVICE_STATUS" == *"Running"* ]]; then
    echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
    echo "Service '$SERVICE_NAME' restarted successfully."

    # Lấy danh sách container đã dừng và xóa chúng
    echo "💀💀💀 Đang xóa các container đã dừng... 💀💀💀"
    docker ps -a --filter "status=exited" --filter "name=$STACK_NAME"_"$SERVICE_NAME" -q | xargs -r docker rm

    # Chui vào container
    CONTAINER_ID=$(docker ps -q --filter "name=$STACK_NAME"_"$SERVICE_NAME")
    if [ -z "$CONTAINER_ID" ]; then
        echo "💀💀💀Không tìm thấy container cho service '$SERVICE_NAME'.💀💀💀"
        exit 1
    fi

    echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
    echo "Chạy lệnh migrate..."
    docker exec -i $CONTAINER_ID bash -c "npx typeorm migration:generate -d ./dist/db/data-source.js"
    docker exec -i $CONTAINER_ID bash -c "npx typeorm migration:run -d ./dist/db/data-source.js"

    # Cài đặt ts-node global trong container
    echo "Cài đặt ts-node toàn cục trong container..."
    docker exec -i $CONTAINER_ID bash -c "npm install -g ts-node"

    # Chạy lệnh ts-node để chạy seed
    # echo "Chạy lệnh ts-node để chạy seed..."
    # docker exec -i $CONTAINER_ID bash -c "ts-node ./node_modules/typeorm-extension/bin/cli.cjs seed:run -d ./dist/db/data-source.ts"

    echo "💓💓💓Done.💓💓💓"
else
    echo "Failed to restart service '$SERVICE_NAME'."
    exit 1
fi
