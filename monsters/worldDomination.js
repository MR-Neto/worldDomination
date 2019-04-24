"use strict";

function worldDestruction(numberOfMonsters) {

  function loadMap() {
    const fs = require('fs');
    const data = fs.readFileSync('./monsters/world_map_medium.txt').toString('utf-8').split('\n');
    const map = {};
    data.forEach(line => {
      //don't consider empty lines
      if (line !== "") {
        const city = line.split(' ')[0];
        const connections = line.split(' ');
        connections.shift();
        map[city] = {};

        connections.forEach((connection) => {
          const direction = connection.split('=')[0];
          const connectedCity = connection.split('=')[1];
          map[city][direction] = connectedCity;
        })
      }
    });

    return map;
  }

  function createMonsters() {
    const cities = Object.keys(map);
    return Array.from({ length: numberOfMonsters }, (v, k) => (
      {
        name: k,
        location: cities[Math.floor(Math.random() * cities.length)],
        moves: 0,
      })
    );
  }

  function moveMonsters() {

    monsters = monsters.map((monster) => {
      const { name, location, moves } = monster;

      const movementOptions = Object.values(map[location])

      //trapped monsters won't move  
      if (movementOptions.length === 0) {
        return monster;
      }

      const newLocation = movementOptions[Math.floor(Math.random() * movementOptions.length)]

      return {
        name,
        location: newLocation,
        moves: moves + 1,
      }
    })
  }

  function checkDestroyedCities() {

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

    // Remove destroyed cities and connections
    destroyedCities.forEach(city => {
      const connections = Object.entries(map[city]);

      connections.forEach(connection => {
        delete map[connection[1]][oppositeDirection(connection[0])]
      })

      delete map[city];
    });


    // Update Monsters according to fights and push killed monsters to killedMonsters
    monsters = monsters.filter((monster) => {
      if (destroyedCities.includes(monster.location)) {
        killedMonsters.push(monster);
        return false;
      }
      return true;
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
            return string.concat(`, monster ${monster.name}`);
        }
      }, "")

      console.log(`${city} has been destroyed${logSentence}`)
    });

  }

  function logFinalResult() {
    const logResult = Object
      .keys(map)
      .reduce((acc, city) => {
        const connectionString = Object
          .entries(map[city])
          .reduce((connectionString, connection) => (
            connectionString.concat(` ${connection[0]}=${connection[1]}`)
          ), "")
        return acc.concat(city, connectionString, "\n")
      }, "");

    console.log(logResult);
  }

  function oppositeDirection(direction) {
    switch (direction) {
      case 'north':
        return 'south';
      case 'south':
        return 'north';
      case 'east':
        return 'west';
      case 'west':
        return 'east';
      default:
        return ''
    }
  }

  // Map object will store all cities as keys which have an object with  directions(North, South, West, East) as properties. 
  let map = loadMap();

  // Array of monsters, which are objects with the properties (name, location and moves)
  let monsters = createMonsters(numberOfMonsters);

  // When monsters are placed randomly, they may fall in the same city. Thus, we need to destroy those cities.
  checkDestroyedCities();

  let numberOfMovements = 0;
  while (monsters.length > 0 && numberOfMovements <= 10000) {
    moveMonsters();
    checkDestroyedCities();
    numberOfMovements += 1;
  }

  logFinalResult();
}

worldDestruction(3000);