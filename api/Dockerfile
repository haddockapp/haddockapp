###
# Runner
###

FROM node:20 as runner

COPY . .

WORKDIR /app

RUN yarn install

CMD ["yarn", "start:migrate:dev"]

EXPOSE 3000