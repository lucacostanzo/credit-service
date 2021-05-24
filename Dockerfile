FROM node:14

WORKDIR /app
ADD . .
WORKDIR /app/dist

EXPOSE 8080
CMD ["node", "credits/run.js"]