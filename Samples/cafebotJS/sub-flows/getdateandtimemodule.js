module.exports = {
    executeTask(context) {
        if(!context.state.conversation.groundedUserLocation) return Promise.resolve();
        if(!context.state.conversation.reqDate && !context.state.conversation.reqTime) {
            context.reply('When do you want to come in?');
            context.state.conversation.prompt = 'bookTable-askfordatetime';
        } else if(context.state.conversation.reqDate && !context.state.conversation.reqTime) {
            context.reply('Did you have a time in mind?');
            context.state.conversation.prompt = 'bookTable-askfordatetime';
        } else if(!context.state.conversation.reqDate && context.state.conversation.reqTime) {
            context.reply('Did you have a date in mind?');
            context.state.conversation.prompt = 'bookTable-askfordatetime';
        } else {
            //context.reply('Ok, I have ' + context.state.conversation.reqDate + ' at ' + context.state.conversation.reqTime);
            context.state.conversation.groundedDateTime = true;
            context.state.conversation.prompt = null;
        }
        return Promise.resolve();
    },
    updateDateAndTime(entity, context) {
        var lDate = '';
        var lTime = '';
        if(entity.type === 'builtin.datetimeV2.datetime'){
            if(entity.resolution.values[0].value !== undefined) {
                var d = new Date(entity.resolution.values[0].value);
                lTime = d.toLocaleTimeString();
                lDate = d.toDateString();
            }        
        } else if(entity.type === 'builtin.datetimeV2.daterange') {
            var d = new Date(entity.resolution.values[0].start);
            lTime = d.toLocaleTimeString();
            lDate = d.toDateString();
        } 
        else if (entity.type === 'builtin.datetimeV2.time'){
            lTime = entity.resolution.values[0].value;
        } else if (entity.type === 'builtin.datetimeV2.date'){
            if(entity.resolution.values[0].value !== undefined) {
                var d = new Date(entity.resolution.values[0].value);
                lDate = d.toDateString();    
            }        
        }
        if(lDate !== '') context.state.conversation.reqDate = lDate;
        if(lTime !== '' && lTime !== '12:00:00 AM') context.state.conversation.reqTime = lTime;
        return {'Date':lDate, 'Time':lTime}
    }
}