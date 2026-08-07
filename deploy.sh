#!/bin/bash
cd ~/SI-BUMDES
git pull origin hypnotic-shovel
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart si-bumdes
echo "Deploy selesai!"
