const botWebsocket = require('../modules/botWebsocket')

module.exports = class BehaviorDepositChest {
  constructor (bot, targets) {
    this.bot = bot
    this.targets = targets
    this.stateName = 'BehaviorDepositChest'
    this.isEndFinished = false

    this.chest = false
    this.indexItemsToDeposit = 0
    this.inventory = require('../modules/inventoryModule')(this.bot)
  }

  onStateEntered () {
    this.indexItemsToDeposit = 0
    this.isEndFinished = false
    botWebsocket.log('Items to deposit ' + JSON.stringify(this.targets.items))
    this.depositAllItems()
  }

  onStateExited () {
    this.indexItemsToDeposit = 0
    this.isEndFinished = false
    this.targets.items = []
    try {
      this.chest.removeAllListeners()
    } catch (e) { }
  }

  isFinished () {
    return this.isEndFinished
  }

  depositAllItems () {
    const mcData = require('minecraft-data')(this.bot.version)

    const chestToOpen = this.bot.findBlock({
      matching: ['chest', 'ender_chest', 'trapped_chest'].map(name => mcData.blocksByName[name].id),
      maxDistance: 6
    })

    if (!chestToOpen) {
      botWebsocket.log('No chest found')
      this.isEndFinished = true
      return
    }

    this.chest = this.bot.openChest(chestToOpen)

    this.chest.on('close', () => {
      setTimeout(() => {
        this.isEndFinished = true
      }, 500)
    })

    this.chest.on('open', () => {
      setTimeout(() => {
        this.depositItems()
          .then(() => this.chest.close())
          .catch((error) => {
            botWebsocket.log(`Error Deposit items ${error}`)
            this.chest.close()
          })
      }, 500)
    })
  }

  depositItems () {
    return new Promise((resolve, reject) => {
      const itemToDeposit = this.targets.items[this.indexItemsToDeposit]

      if (this.targets.items.length <= this.indexItemsToDeposit) {
        resolve()
        return
      }

      this.indexItemsToDeposit++

      this.depositToChest(itemToDeposit.type, itemToDeposit.quantity)
        .then(() => {
          this.depositItems()
            .then(() => resolve())
            .catch((error) => reject(error))
        })
        .catch((error) => reject(error))
    })
  }

  depositToChest (itemType, quantity) {
    return new Promise((resolve, reject) => {
      this.chest.deposit(itemType, null, quantity, (error) => {
        if (error) {
          setTimeout(() => reject(error), 200)
        } else {
          setTimeout(() => resolve(), 200)
        }
      })
    })
  }
}
