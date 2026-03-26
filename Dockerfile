FROM node:22

RUN apt update && apt install -y ansible sshpass openssh-client nginx

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

CMD ["nginx", "-g", "daemon off;"]
