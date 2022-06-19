FROM node:18

WORKDIR /usr/src/app

COPY . /usr/src/app/

RUN yarn install --frozen-lockfile --network-concurrency 1

RUN yarn build

CMD ["yarn", "start"]