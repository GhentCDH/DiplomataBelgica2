yarn encore production
git add public/build
git commit -m "production build"
git push
yarn encore dev
./bin/console cache:clear