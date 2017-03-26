'use strict';


class Evolvement {
    constructor(config) {
        this.state = {};
        this.population = [];

    }

    clone(obj) {
        if (obj == null || typeof obj != "object")
            return obj;
        return JSON.parse(JSON.stringify(obj));
    }

    seed() {
        throw new Error('The "seed" function must be specified!');
    }

    optimize(a, b) {
        throw new Error('The "optimize" function must be specified!');
    }

    fitness(entity) {
        throw new Error('The "fitness" function must be specified!');
    }

    select(pop) {
        throw new Error('The "select" function must be specified!');
    }

    crossover(parent1, parent2) {
        throw new Error('The "crossover" function must be specified!');
    }

    mutate(entity) {
        throw new Error('The "mutate" function must be specified!');
    }

    notification(pop, generation, stats, isFinished) {}


    generation() {
        return true;
    }

    mutateOrNot(entity) {
        return Math.random() <= this.config['mutation'] ? this.mutate(this.clone(entity)) : this.clone(entity);
    }

    evolve(config, population) {
        this.config = {
            "size": 100,
            "mutation": 0.2,
            "iterations": 100,
            "fittestSurvive": true,
            "skip": 0
        }
        Object.assign(this.config, config);

        if (!population) {
            for (let i = 0; i < this.config['size']; ++i) {
                this.population.push(this.clone(this.seed()));
            }
        } else {
            this.population = population;
        }

        for (let i = 0; i < this.config['iterations']; ++i) {
            this.state = {};

            let pop = this.population.map(entity => {
                return {
                    fitness: this.fitness(entity),
                    entity
                };
            }).sort((a, b) => this.optimize(a.fitness, b.fitness) ? -1 : 1);


            let stats = {
                "best": pop[0].fitness,
                "worst": pop[pop.length - 1].fitness,
            };

            if (!isNaN(pop[0].fitness)) {
                let mean = pop.reduce((a, b) => a + b.fitness, 0) / pop.length;
                let stdev = Math.sqrt(pop.map(a => (a.fitness - mean) * (a.fitness - mean))
                    .reduce((a, b) => a + b, 0) / pop.length);
                stats["mean"] = mean;
                stats["stdev"] = stdev;
            }

            let r = this.generation(pop, i, stats);
            let isFinished = (r !== undefined && !r) || (i == this.config['iterations'] - 1);
            if (isFinished || this.config["skip"] == 0 || i % this.config["skip"] == 0) {
                this.notification(pop, i, stats, isFinished);
            }

            if (isFinished)
                break;

            let newPop = [];
            if (this.config['fittestSurvive'])
                newPop.push(pop[0].entity);

            while (newPop.length < this.config['size'] - 1) {
                let parent1 = this.mutateOrNot(this.select(pop));
                let parent2 = this.mutateOrNot(this.select(pop));
                let children = this.crossover(parent1, parent2);
                newPop.push(...children);
            }
            if (newPop.length < this.config['size']) {
                newPop.push(this.mutateOrNot(this.select(pop)));
            }
            this.population = newPop;
        }

        return this.population;
    }
}


Evolvement.Optimize = {
    "Maximize": function (a, b) {
        return a >= b;
    },
    "Minimize": function (a, b) {
        return a < b;
    }
};

Evolvement.Select = {
    "Tournament2": function (pop) {
        let n = pop.length;
        let a = pop[Math.floor(Math.random() * n)];
        let b = pop[Math.floor(Math.random() * n)];
        return this.optimize(a.fitness, b.fitness) ? a.entity : b.entity;
    },
    "Tournament3": function (pop) {
        let n = pop.length;
        let a = pop[Math.floor(Math.random() * n)];
        let b = pop[Math.floor(Math.random() * n)];
        let c = pop[Math.floor(Math.random() * n)];
        let best = this.optimize(a.fitness, b.fitness) ? a : b;
        best = this.optimize(best.fitness, c.fitness) ? best : c;
        return best.entity;
    },
    "Fittest": function (pop) {
        return pop[0].entity;
    },
    "Random": function (pop) {
        return pop[Math.floor(Math.random() * pop.length)].entity;
    },
    "RandomLinearRank": function (pop) {
        this.state["rlr"] = this.state["rlr"] || 0;
        return pop[Math.floor(Math.random() * Math.min(pop.length, (this.state["rlr"]++)))].entity;
    },
    "Sequential": function (pop) {
        this.state["seq"] = this.state["seq"] || 0;
        return pop[(this.state["seq"]++) % pop.length].entity;
    }
};

module.exports = Evolvement;