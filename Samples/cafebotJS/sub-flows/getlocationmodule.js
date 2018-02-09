const { MessageStyler } = require('botbuilder');

module.exports = {
    executeTask(context) {
        if(context.state.conversation.groundedUserLocation) return Promise.resolve();
        if(context.state.conversation.prompt === 'bookTable-askForLocation') {
            if(context.state.conversation.confirmToUseLocation) {
                if(context.state.conversation.confirmToUseLocation === 'yes') {
                    context.state.conversation.userLocation = context.state.conversation.mUserLocation;
                } else {
                    if(!context.state.conversation.userLocation) {
                        // user wants to get a new location
                        context.reply('Ok, did you have a location in mind?');
                        context.state.conversation.userLocation = null;
                        context.state.conversation.mUserLocation = null;
                        context.state.conversation.prompt = null;
                    } else {
                        context.state.conversation.mUserLocation = context.state.conversation.userLocation;
                        context.state.conversation.prompt = null;
                        context.state.conversation.groundedUserLocation = true;
                        //context.reply('Sure,, I have ' + context.state.conversation.userLocation);
                    }
                }
                context.state.conversation.confirmToUseLocation = null;
            } else {
                // just re-prompt.
                context.reply('Sorry, I did not catch that. You want to book a table at our ' + context.state.conversation.mUserLocation + ' store, right?');
            }
            return Promise.resolve();
        }
        
        // do we have a geography location? 
        if(context.state.conversation.geographyLocation && !context.state.conversation.userLocation) {
            context.reply('We offer services in Redmond, Renton and Seattle. Did you have a location in mind?');
            context.state.conversation.geographyLocation = null;
            return Promise.resolve();
        }
        
        // do we have location from memory? 
        if(context.state.conversation.mUserLocation) {
            context.reply('In ' + context.state.conversation.mUserLocation + ', right?');
            context.state.conversation.prompt = 'bookTable-askForLocation';
            return Promise.resolve(); 
        } 

        // do we have location? 
        if(!context.state.conversation.userLocation) {
            const message = MessageStyler.suggestedActions(['Seattle', 'Redmond', 'Renton']);
            message.text = 'Sure, did you have a location in mind?';
            context.reply(message);
            return Promise.resolve();
        }
        // remember the location in context for future
        context.state.conversation.mUserLocation = context.state.conversation.userLocation;
        //context.reply('Sure, I have ' + context.state.conversation.userLocation);
        context.state.conversation.groundedUserLocation = true;
        context.state.conversation.prompt = null;
        return Promise.resolve();
    }
}