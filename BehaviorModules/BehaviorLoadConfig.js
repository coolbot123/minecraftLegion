const botConfig = require('../modules/botConfig')

module.exports = class BehaviorLoadConfig {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorLoadConfig'

    this.job = false
    this.mode = 'none'
    this.helpFriends = false
    this.distance = 10
    this.patrol = []
    this.chests = []
    this.minerCords = {}
  }

  onStateEntered () {
    this.job = botConfig.getJob(this.bot.username)
    this.mode = botConfig.getMode(this.bot.username)
    this.helpFriends = botConfig.getHelpFriend(this.bot.username)
    this.distance = botConfig.getDistance(this.bot.username)
    this.patrol = botConfig.getPatrol(this.bot.username)
    this.minerCords = botConfig.getMinerCords(this.bot.username)
    this.chests = botConfig.getAllChests(this.bot.username)
  }

  getJob () {
    return this.job
  }

  getMode () {
    return this.mode
  }

  getHelpFriend () {
    return this.helpFriends
  }

  getDistance () {
    return this.distance
  }

  getPatrol () {
    return this.patrol
  }

  getMinerCords () {
    return this.minerCords
  }

  getAllChests () {
    return this.chests
  }
}
