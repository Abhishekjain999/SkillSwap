# C++ (GCC 13) Isolated Execution Runner for SkillSwap
FROM gcc:13-bookworm

# Create unprivileged execution user
RUN groupadd -g 1000 sandbox && \
    useradd -u 1000 -g sandbox -m -s /bin/sh sandbox

WORKDIR /workspace

# Switch to non-root user
USER sandbox

CMD ["./solution"]
