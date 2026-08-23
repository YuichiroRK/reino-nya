FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /usr/src/app

# Install dependencies automatically just in case, then run
CMD ["sh", "-c", "pnpm install && pnpm --filter client dev --host"]
