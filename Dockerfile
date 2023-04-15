FROM nikolaik/python-nodejs

WORKDIR /usr/src/app
COPY . .

RUN pip3 install PyPasser

RUN yarn install
RUN yarn build

CMD ["yarn", "start"]