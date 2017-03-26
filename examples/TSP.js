//solution of travelling salesman problem,  just a simple example
//index 0 is the origin city 

let Evolvement = require('../lib/evolvement');

let config = {
    "size": 250,
    "mutation": 0.3,
    "iterations": 1000,
    "fittestSurvive": true,
    "skip": 20
}


// cityMap[i][j] : the distance of city i to city j
const N = 30;
let cityMap = Array(N);
for (let i = 0; i < N; i++) {
    cityMap[i] = Array(N);
}
for (let i = 0; i < N; i++) {
    for (let j = i; j < N; j++) {
        if (i == j) {
            cityMap[i][j] = 0;
            continue;
        }
        cityMap[i][j] = Math.floor(Math.random() * 50) + 1;
        cityMap[j][i] = cityMap[i][j];
    }
}

let evolvement = new Evolvement();

evolvement.optimize = Evolvement.Optimize.Minimize;
evolvement.select = Evolvement.Select.Tournament2;
evolvement.seed = function () {
    let path = [];
    for (let i = 1; i < N; i++)
        path.push(i);

    path.sort(() => Math.random() < 0.5 ? -1 : 1);
    return path;
};

evolvement.mutate = function (path) {
    let i = Math.floor(Math.random() * path.length);
    let j = Math.floor(Math.random() * path.length);
    let temp = path[i];
    path[i] = path[j];
    path[j] = temp;
    return path;
};

evolvement.crossover = function (parent1, parent2) {
    //no crossover
    return [parent1, parent2];
};

evolvement.fitness = function (path) {
    let fitness = cityMap[0][path[0]] + cityMap[path[path.length - 1]][0];
    for (let i = 0; i < path.length - 1; i++) {
        fitness += cityMap[path[i]][path[i + 1]];
    }
    return fitness;
};


evolvement.notification = function (pop, generation, stats, isFinished) {
    console.log(generation, pop[0].fitness, pop[0].entity.join(','))
};


evolvement.evolve(config);