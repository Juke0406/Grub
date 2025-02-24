#!/bin/bash
set -e

# Wait for MinIO to be ready
until curl -sf http://localhost:9000/minio/health/live; do
    echo "Waiting for MinIO to be ready..."
    sleep 1
done

# Create aliases for mc
mc alias set minio http://localhost:9000 minioadmin minioadmin

# Create buckets
mc mb minio/gloria-items || true

# Set bucket policy to allow read access
cat > /tmp/bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": ["*"]
            },
            "Action": [
                "s3:GetObject"
            ],
            "Resource": [
                "arn:aws:s3:::gloria-items/*"
            ]
        }
    ]
}
EOF

mc anonymous set-json /tmp/bucket-policy.json minio/gloria-items

# Clean up
rm /tmp/bucket-policy.json

echo "MinIO initialization completed successfully"
