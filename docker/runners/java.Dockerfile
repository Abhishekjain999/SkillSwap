# Java (OpenJDK 21) Isolated Execution Runner for SkillSwap
FROM openjdk:21-slim

# Create unprivileged execution user
RUN groupadd -g 1000 sandbox && \
    useradd -u 1000 -g sandbox -m -s /bin/sh sandbox

WORKDIR /workspace

# Switch to non-root user
USER sandbox

CMD ["java", "-Xmx128m", "Main"]
