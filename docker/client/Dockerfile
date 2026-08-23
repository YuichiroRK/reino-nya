FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /usr/src/app

# Since we use volumes for development, we just start the dev server
CMD ["pnpm", "--filter", "client", "dev", "--host"]
