# Node.js LTS Isolated Execution Runner for SkillSwap
FROM node:20-slim

WORKDIR /workspace

# Use existing non-root node user (UID 1000)
USER node

CMD ["node", "index.js"]
