module.exports = {
    executeTask(context) {
        var userName = null;
        // did we get a userName entity from LUIS?
        let entitiesFoundList = context.topIntent.entities;
        if(entitiesFoundList.length > 0) {
            entitiesFoundList.forEach((entity) => {
                if(entity.type === 'userName') userName = entity.value;
            });
        } 
        if(userName === null && context.state.conversation.userName) {
            userName = context.state.conversation.userName;
        }        
        // do we already have user's name? 
        if(userName === null) {
            // see if the user does not want to give us their name
            if(context.topIntent.name === 'askForUserName') {
                context.reply('Hello Human, nice to meet you!');
            } else {
                context.reply('Hello, I\'m the Contoso Cafe bot. What is your name?');
            }
        } else {            
            context.state.conversation.userName = userName;
            context.reply('Hello ' + context.state.conversation.userName + ', nice to meet you!');
        }
        return Promise.resolve(); 
    }
}