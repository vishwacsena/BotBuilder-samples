const { MessageStyler } = require('botbuilder');

module.exports = {
    executeTask(context) {
        if(!context.state.conversation.groundedPartySize) return Promise.resolve();
        if(context.state.conversation.confirmToUseLocation) {
            if(context.state.conversation.confirmToUseLocation === 'yes') {
                context.state.conversation.confirmTableOrder = true;
                context.reply('Booking your order...');
            } else if (context.state.conversation.confirmToUseLocation === 'cancel') {
                context.reply('Ok. I\'ve cancelled that!');
                g_clearContext(context);
            } else {
                const message = MessageStyler.suggestedActions(['Yes', 'No', 'Cancel']);
                message.text = 'Should I go ahead and book a table for ' + context.state.conversation.partySize + ' guests in our ' + context.state.conversation.userLocation + ' location for ' + context.state.conversation.reqDate + ' at ' + context.state.conversation.reqTime + '?'; 
                context.reply(message);
            }
            return Promise.resolve();
        }
        const message = MessageStyler.suggestedActions(['Yes', 'No', 'Cancel']);
        message.text = 'Should I go ahead and book a table for ' + context.state.conversation.partySize + ' guests in our ' + context.state.conversation.userLocation + ' location for ' + context.state.conversation.reqDate + ' at ' + context.state.conversation.reqTime + '?';
        context.reply(message);
        return Promise.resolve();
    }, 
    clearContext(context) {
        g_clearContext(context);
    }
}

var g_clearContext = function (context) {
    context.state.conversation.userLocation = null;
    context.state.conversation.groundedUserLocation = null;
    context.state.conversation.groundedDateTime = null;
    context.state.conversation.groundedPartySize = null;
    context.state.conversation.geographyLocation = null;
    context.state.conversation.confirmTableOrder = null;
    context.state.conversation.reqDate = null;
    context.state.conversation.reqTime = null;
    context.state.conversation.partySize = null;
    context.state.conversation.prompt = null;
    context.state.conversation.confirmTableOrder = null;
    context.state.conversation.confirmToUseLocation = null;
}