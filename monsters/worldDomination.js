"use strict";

const fs = require('fs');

const data = fs.readFileSync('./monsters/world_map_small.txt').toString('utf-8').split('\n');

// Map object will store all cities as keys which have an object with  directions(North, South, West, East) as properties. 
let map = {};
let monsters = [];

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
  monsters = Array.from({ length: numberOfMonsters }, (v, k) => (
    {
      name: k,
      location: cities[Math.floor(Math.random() * cities.length)],
      moves: 0,
      alive: true
    })
  );
  return monsters;
}

function checkDestroyedCities(monsters) {

  let killedMonsters = [];

  //find the cities which were destroyed (have two or more monsters) in the next steps
  const destroyedCities = monsters

    //get an array of cities where monsters are located
    .map((monster) => monster.location)

    //filter to cities that appear only more than 1 time
    .filter((citySearch, index, cities) => cities.reduce((count, city) => count + (city === citySearch), 0) > 1)

    //remove duplicate cities
    .reduce((cleanDuplicateCities, city) => (
      cleanDuplicateCities.includes(city) ?
        cleanDuplicateCities
        :
        cleanDuplicateCities.concat(city)
    ),
      [])

  console.log("DESTROYED CITIES", destroyedCities);

  // Update Monsters according to fights and push killed monsters to killedMonsters
  monsters = monsters.map((monster) => {
    const { name, location, moves, alive } = monster;
    if (destroyedCities.includes(monster.location) && alive) {
      killedMonsters.push(monster);
      return {
        name,
        location,
        moves,
        alive: false
      }
    }
    return monster;
  });

  logCitiesDestroyed(destroyedCities, killedMonsters);
}

function logCitiesDestroyed(destroyedCities, killedMonsters) {
  destroyedCities.forEach((city) => {
    const logMonsters = killedMonsters.filter((monster) => monster.location === city)

    const logSentence = logMonsters.reduce((string, monster, index) => {
      switch (index) {
        case 0:
          return string.concat(` by monster ${monster.name}`);
        case logMonsters.length - 1:
          return string.concat(` and monster ${monster.name}!`);
        default:
          return string.concat(`, by monster ${monster.name}`);
      }
    }, "")

    console.log(`${city} has been destroyed${logSentence}`)
  });

}

spreadMonsters(20);
checkDestroyedCities(monsters);