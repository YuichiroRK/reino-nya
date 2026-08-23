FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /usr/src/app

# For development, we run the dev script inside the container
CMD ["pnpm", "--filter", "server", "dev"]
