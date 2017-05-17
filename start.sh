
echo ".:: start th server prod mode ::."
rm app.pid
nohup NODE_ENV=production node index.js > /dev/null &
echo $! >> app.pid
