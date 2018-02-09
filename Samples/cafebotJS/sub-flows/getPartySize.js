const { MessageStyler } = require('botbuilder');

module.exports = {
    executeTask(context) {
        if(!context.state.conversation.groundedDateTime) return Promise.resolve();
        if(!context.state.conversation.partySize) {
            const message = MessageStyler.suggestedActions(['1', '2', '3', '4']);
            message.text = 'How many guests?';
            context.reply(message);
        } else {
            //context.reply('Sweet. I have ' + context.state.conversation.partySize + ' guests');
            context.state.conversation.groundedPartySize = true;
        }
        return Promise.resolve();
    }
}