const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine
} = require('mineflayer-statemachine')

const BehaviorLoadConfig = require('./../BehaviorModules/BehaviorLoadConfig')
const BehaviorGetReady = require('./../BehaviorModules/BehaviorGetReady')
const BehaviorEatFood = require('./../BehaviorModules/BehaviorEatFood')
const BehaviorEquip = require('./../BehaviorModules/BehaviorEquip')

function minerJobFunction (bot, targets) {
  const start = new BehaviorIdle(targets)
  start.stateName = 'Start'
  start.x = 125
  start.y = 113

  const loadConfig = new BehaviorLoadConfig(bot, targets)
  loadConfig.stateName = 'Load Bot Config'
  loadConfig.x = 325
  loadConfig.y = 113

  const equip = new BehaviorEquip(bot, targets)
  equip.stateName = 'Equip Armor'
  equip.x = 525
  equip.y = 250

  const getReady = new BehaviorGetReady(bot, targets)
  getReady.stateName = 'Get Ready for Mining'
  getReady.x = 525
  getReady.y = 113

  const eatFood = new BehaviorEatFood(bot, targets)
  eatFood.stateName = 'Eat Food'
  eatFood.x = 525
  eatFood.y = 375

  const eatFoodCombat = new BehaviorEatFood(bot, targets)
  eatFoodCombat.stateName = 'Eat Food In Combat'
  eatFoodCombat.x = 725
  eatFoodCombat.y = 513

  const miningFunction = require('./miningFunction')(bot, targets)
  miningFunction.x = 225
  miningFunction.y = 513

  const combatFunction = require('./combatFunction')(bot, targets)
  combatFunction.x = 525
  combatFunction.y = 513

  const goChests = require('./goChestsFunctions')(bot, targets)
  goChests.x = 225
  goChests.y = 313

  const getClosestMob = require('./../modules/getClosestEnemy')(bot, targets)

  const transitions = [
    new StateTransition({
      parent: start,
      child: loadConfig,
      name: 'start -> loadConfig',
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: loadConfig,
      child: getReady,
      name: 'loadConfig -> patrol',
      onTransition: () => {
        targets.entity = undefined
        getClosestMob.setMode(loadConfig.getMode())
        getClosestMob.setDistance(loadConfig.getDistance())
        getReady.setItemsToBeReady(loadConfig.getItemsToBeReady())
        eatFood.setFoods(loadConfig.getItemsCanBeEat())
        eatFoodCombat.setFoods(loadConfig.getItemsCanBeEat())
      },
      shouldTransition: () => true
    }),

    new StateTransition({
      parent: getReady,
      child: goChests,
      name: 'getReady -> goChests',
      shouldTransition: () => !getReady.getIsReady()
    }),

    new StateTransition({
      parent: goChests,
      child: getReady,
      name: 'goChests -> getReady',
      shouldTransition: () => goChests.isFinished()
    }),

    new StateTransition({
      parent: getReady,
      child: equip,
      name: 'getReady -> equip',
      shouldTransition: () => getReady.getIsReady()
    }),

    new StateTransition({
      parent: equip,
      child: eatFood,
      name: 'getReady -> eatFood',
      shouldTransition: () => equip.isFinished()
    }),

    new StateTransition({
      parent: eatFood,
      child: miningFunction,
      name: 'Continue Mining',
      shouldTransition: () => eatFood.isFinished()
    }),

    new StateTransition({
      parent: miningFunction,
      child: goChests,
      name: 'Return to base',
      shouldTransition: () => miningFunction.isFinished()
    }),

    new StateTransition({
      parent: miningFunction,
      child: combatFunction,
      name: 'miningFunction -> try getClosestMob',
      onTransition: () => bot.pathfinder.setGoal(null),
      shouldTransition: () => {
        getClosestMob.check()
        return targets.entity !== undefined
      }
    }),

    new StateTransition({
      parent: combatFunction,
      child: eatFood,
      name: 'Mob is dead',
      shouldTransition: () => combatFunction.isFinished()
    }),

    new StateTransition({
      parent: combatFunction,
      child: eatFoodCombat,
      name: 'Eat In Combat',
      shouldTransition: () => bot.health < 15 && bot.food !== 20
    }),

    new StateTransition({
      parent: eatFoodCombat,
      child: combatFunction,
      name: 'End Eat In Combat',
      shouldTransition: () => eatFoodCombat.isFinished()
    })

  ]

  const minerJobFunction = new NestedStateMachine(transitions, start)
  minerJobFunction.stateName = 'Miner Job'
  return minerJobFunction
}

module.exports = minerJobFunction
