FROM node:20-bullseye

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

HEALTHCHECK --interval=20s --timeout=5s --retries=10 CMD node -e "fetch('http://localhost:3000').then(()=>process.exit(0)).catch(()=>process.exit(1))"

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]
