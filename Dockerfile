FROM node:18

WORKDIR /usr/src/app

COPY . /usr/src/app/
RUN yarn install --frozen-lockfile

RUN yarn build

CMD ["yarn", "start"]