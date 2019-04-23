const fs = require('fs');

const data = fs.readFileSync('./monsters/world_map_small.txt').toString('utf-8').split('\n');

let map = {};

data.forEach(line => {
  const city = line.split(' ')[0];
  const connections = line.split(' ');
  connections.shift();
  map[city] = {};

  connections.forEach((connection) => {
    const direction = connection.split('=')[0];
    const connectedCity = connection.split('=')[1];
    map[city][direction] = connectedCity;
  })
});

console.log(map);
