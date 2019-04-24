/* eslint-disable no-console */
/* eslint-disable no-use-before-define */

const fs = require('fs');

const worldDestruction = (numberOfMonsters) => {
  const loadMap = () => {
    const data = fs.readFileSync('./monsters/world_map_medium.txt').toString('utf-8').split('\n');
    const map = {};
    data.forEach((line) => {
      // don't consider empty lines
      if (line !== '') {
        const city = line.split(' ')[0];
        const connections = line.split(' ');
        connections.shift();
        map[city] = {};

        connections.forEach((connection) => {
          const direction = connection.split('=')[0];
          const connectedCity = connection.split('=')[1];
          map[city][direction] = connectedCity;
        });
      }
    });

    return map;
  };

  const createMonsters = () => {
    const cities = Object.keys(map);
    return Array.from({ length: numberOfMonsters }, (v, k) => (
      {
        name: k,
        location: cities[Math.floor(Math.random() * cities.length)],
        stuck: false,
      }));
  };

  const moveMonsters = () => {
    monsters = monsters.map((monster) => {
      const { location, stuck } = monster;
      // Only unstuck monsters will move
      if (!stuck) {
        const movementOptions = Object.values(map[location]);

        if (movementOptions.length === 0) {
          return {
            ...monster,
            stuck: true,
          };
        }

        const newLocation = movementOptions[Math.floor(Math.random() * movementOptions.length)];

        return {
          ...monster,
          location: newLocation,
        };
      }
      return monster;
    });
  };

  const checkDestroyedCities = () => {
    const killedMonsters = [];

    // find the cities which were destroyed (have two or more monsters) in the next steps
    const destroyedCities = monsters

      // get an array of cities where monsters are located
      .map(monster => monster.location)

      // filter to cities that appear only more than 1 time
      .filter((citySearch, index, cities) => (
        cities.reduce((count, city) => count + (city === citySearch), 0) > 1
      ))

      // remove duplicate cities
      .reduce((cleanDuplicateCities, city) => (
        cleanDuplicateCities.includes(city)
          ? cleanDuplicateCities
          : cleanDuplicateCities.concat(city)
      ), []);

    // Remove destroyed cities and connections
    destroyedCities.forEach((city) => {
      const connections = Object.entries(map[city]);

      connections.forEach((connection) => {
        delete map[connection[1]][oppositeDirection(connection[0])];
      });

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
  };

  const logCitiesDestroyed = (destroyedCities, killedMonsters) => {
    destroyedCities.forEach((city) => {
      const logMonsters = killedMonsters.filter(monster => monster.location === city);

      const logSentence = logMonsters.reduce((string, monster, index) => {
        switch (index) {
          case 0:
            return string.concat(` by monster ${monster.name}`);
          case logMonsters.length - 1:
            return string.concat(` and monster ${monster.name}!`);
          default:
            return string.concat(`, monster ${monster.name}`);
        }
      }, '');

      console.log(`${city} has been destroyed${logSentence}`);
    });
  };

  const logFinalResult = () => {
    Object

      // get array of standing cities
      .keys(map)
      .forEach((city) => {
        const connectionString = Object
          .entries(map[city])
          .reduce((accumulatedString, connection) => (
            accumulatedString.concat(` ${connection[0]}=${connection[1]}`)
          ), '');
        console.log(city.concat(connectionString));
      });
  };

  const oppositeDirection = (direction) => {
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
        return '';
    }
  };

  // Map object will store all cities as keys
  // Each key will have an object with directions(North, South, West, East) as properties
  let map = loadMap();

  // Array of alive monsters, which have name, location and moves
  let monsters = createMonsters(numberOfMonsters);

  // Monster may be placed randomly in the same city
  // Thus, we need to destroy those cities
  checkDestroyedCities();


  // 3 conditions to keep the loop going:
  // There are monsters
  // The monsters have moved less than 10000 times
  // There is least an unstuck monster

  let numberOfMovements = 0;

  while (monsters.length > 0
    && numberOfMovements <= 10000
    && monsters.filter(monster => !monster.stuck).length > 0) {
    moveMonsters();
    checkDestroyedCities();
    numberOfMovements += 1;
  }

  logFinalResult();
};

worldDestruction(1000);
