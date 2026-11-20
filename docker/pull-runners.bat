@echo off
echo === Pulling SkillSwap Execution Runner Images ===

docker pull python:3.12-slim
if %ERRORLEVEL% NEQ 0 goto error

docker pull openjdk:21-slim
if %ERRORLEVEL% NEQ 0 goto error

docker pull gcc:13-bookworm
if %ERRORLEVEL% NEQ 0 goto error

docker pull node:20-slim
if %ERRORLEVEL% NEQ 0 goto error

echo === All execution runner images pulled successfully! ===
exit /b 0

:error
echo Failed to pull images. Please ensure Docker is running.
exit /b 1
