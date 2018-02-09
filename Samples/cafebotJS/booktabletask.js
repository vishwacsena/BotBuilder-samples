const getLocation = require('./sub-flows/getlocationmodule');
const getDateTime = require('./sub-flows/getdateandtimemodule');
const getPartySize = require('./sub-flows/getPartySize');
const confirmOder = require('./sub-flows/confirmTable');

module.exports = {
    executeTask(context) {
        // prase LUIS entities
        // did we get a userName entity from LUIS?
        let entitiesFoundList = context.topIntent.entities;
        if(entitiesFoundList.length > 0) {
            entitiesFoundList.forEach((entity) => {
                if(entity.type === 'cafeLocation') {
                    context.state.conversation.userLocation = entity.value;
                } else if(entity.type === 'confirmationList') {
                    context.state.conversation.confirmToUseLocation = entity.resolution.values[0];
                } else if(entity.type === 'builtin.geography.city') {
                    context.state.conversation.geographyLocation = true;
                } else if(entity.type === 'partySize') {
                    context.state.conversation.partySize = entity.value;
                } else if(entity.type.includes('builtin.datetimeV2')) {
                    getDateTime.updateDateAndTime(entity, context)
                }
            });
        } 
        
        // get location
        getLocation.executeTask(context);
        
        // get date and time
        getDateTime.executeTask(context);
        
        // get party size
        getPartySize.executeTask(context);

        // confirm order
        confirmOder.executeTask(context);
        
        if(context.state.conversation.confirmTableOrder) {
            // TODO: book the table

            context.reply('I\'ve booked your table for ' + context.state.conversation.partySize + ' guests in our ' + context.state.conversation.userLocation + ' location for ' + context.state.conversation.reqDate + ' at ' + context.state.conversation.reqTime);
            if(context.state.conversation.commPreference) {
                context.reply('You should receive confirmation via ' + context.state.conversation.commPreference + ' shortly');
            }

            // clear out context
            confirmOder.clearContext(context);
        }
        
        return Promise.resolve();
    }
}

