export GOOGLE_APPLICATION_CREDENTIALS=/Users/mhuda/Works/Credentials/levenshtein-dev-app.json
gcloud config configurations activate levenshtein-dev
rm .env
cp .env-dev .env
node app.js
