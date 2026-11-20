#!/bin/bash
# Pre-pull execution runner Docker images for SkillSwap
set -e

echo "=== Pulling SkillSwap Execution Runner Images ==="

docker pull python:3.12-slim
docker pull openjdk:21-slim
docker pull gcc:13-bookworm
docker pull node:20-slim

echo "=== All execution runner images pulled successfully! ==="
