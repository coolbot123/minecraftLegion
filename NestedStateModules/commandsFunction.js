const {
    StateTransition,
    BehaviorIdle,
    BehaviorFollowEntity,
    BehaviorLookAtEntity,
    NestedStateMachine
} = require("mineflayer-statemachine");
const Vec3 = require('vec3').Vec3

function commandsFunction(bot, targets) {
    bot.loadPlugin(require('mineflayer-pathfinder').pathfinder);
    const enter = new BehaviorIdle(targets);
    const exit = new BehaviorIdle(targets);
    const followPlayer = new BehaviorFollowEntity(bot, targets);
    const lookAtFollowTarget = new BehaviorLookAtEntity(bot, targets);
    const lookAtPlayersState = new BehaviorLookAtEntity(bot, targets);

    const transitions = [
        new StateTransition({ // 0
            parent: lookAtPlayersState,
            child: exit,
            name: 'Player say: bye',
            onTransition: () => bot.chat("Bye Master!"),
        }),
        new StateTransition({ // 1
            parent: followPlayer,
            child: exit,
            name: 'Player say: bye',
            onTransition: () => bot.chat("Bye Master!"),
        }),
        new StateTransition({ // 2
            parent: lookAtFollowTarget,
            child: exit,
            name: 'Player say: bye',
            onTransition: () => bot.chat("Bye Master!"),
        }),

        new StateTransition({ // 3
            parent: lookAtPlayersState,
            child: followPlayer,
            name: 'Player say: come',
            onTransition: () => bot.chat("Yes sr!"),
        }),

        new StateTransition({ // 4
            parent: lookAtFollowTarget,
            child: lookAtPlayersState,
            name: 'Player say: stay',
            onTransition: () => bot.chat("I wait here!"),
        }),
        new StateTransition({ // 5
            parent: followPlayer,
            child: lookAtPlayersState,
            name: 'Player say: stay',
            onTransition: () => bot.chat("I wait here!"),
        }),


        new StateTransition({
            parent: followPlayer,
            child: lookAtFollowTarget,
            name: 'The player is too far',
            shouldTransition: () => followPlayer.distanceToTarget() < 2,
        }),
        new StateTransition({
            parent: lookAtFollowTarget,
            child: followPlayer,
            name: 'The player is too close',
            shouldTransition: () => lookAtFollowTarget.distanceToTarget() >= 2,
        }),
        new StateTransition({
            parent: enter,
            child: lookAtPlayersState,
            name: 'Enter to nested',
            shouldTransition: () => true,
        }),
    ];

    bot.on("chat", (username, message) => {
        switch (true) {
            case (message === "bye"):
                transitions[0].trigger();
                transitions[1].trigger();
                transitions[2].trigger();
                break;
            case (message === "come"):
                transitions[3].trigger();
                break;
            case (message === "stay"):
                transitions[4].trigger();
                transitions[5].trigger();
                break;
        }
    });

    const commandsFunction = new NestedStateMachine(transitions, enter, exit);
    commandsFunction.stateName = 'commandsFunction'
    return commandsFunction;
}


module.exports = commandsFunction;