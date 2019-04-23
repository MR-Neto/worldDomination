const fs = require('fs');

const data = fs.readFileSync('./monsters/world_map_small.txt').toString('utf-8').split('\n');

// Map object will store all cities as keys which have an object with  directions(North, South, West, East) as properties. 
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

function spreadMonsters(numberOfMonsters) {
  const cities = Object.keys(map);
  const monsters = Array.from({ length: numberOfMonsters }, () => cities[Math.floor(Math.random()*cities.length)]);
  console.log(monsters);
}

debugger;