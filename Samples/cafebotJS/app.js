const { Bot, BotStateManager, MemoryStorage, MessageStyler, CardStyler } = require('botbuilder');
const { BotFrameworkAdapter } = require('botbuilder-services');
const restify = require('restify');
const whoAreyoutask = require('./whoareyoutask');
const booktabletask = require('./booktabletask');
const { LuisRecognizer, QnAMaker } = require('botbuilder-ai');

// LUIS stuff
const LUISappId = 'fd66bde5-c875-40e6-960a-910b0f4d9b01';
const LUISsubscriptionKey = 'be30825b782843dcbbe520ac5338f567';
const LUISmodel = new LuisRecognizer(LUISappId, LUISsubscriptionKey);

const qna = new QnAMaker({
    knowledgeBaseId: '40080f40-0200-482e-8e55-fae74d973490',
    subscriptionKey: 'd534abd71a0d438d95d5a001025ee074',
    top: 1
});

// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

// Create adapter and listen to servers '/api/messages' route.
const adapter = new BotFrameworkAdapter({ 
    appId: process.env.MICROSOFT_APP_ID, 
    appPassword: process.env.MICROSOFT_APP_PASSWORD 
});
server.post('/api/messages', adapter.listen());

// Initialize bot by passing it adapter
const bot = new Bot(adapter)
    .use(new MemoryStorage())
    .use(new BotStateManager())
    .use(LUISmodel)
    .onReceive((context) => {
        if (context.request.type === 'message') {
            // handle top level non LUIS dispatch - you dont want to do this after LUIS because of possible conflicts
            const userMessage = context.request.text;
             // get the first word in user's message
            const firstWordInMessage = userMessage.substr(0, userMessage.indexOf(' ')).toLowerCase();
            if(firstWordInMessage === 'echo' || firstWordInMessage === 'repeat') {
                // extract user message and add it as task entity
                const responseMessage = userMessage.substr(userMessage.indexOf(' ') + 1);
                context.reply('Here\'s what you said' + responseMessage);
                return Promise.resolve();
            }
            const intentName = context.topIntent ? context.topIntent.name : 'None';
            console.log('LUIS intent: ' + intentName);
            switch(intentName) {
                case 'Greeting':
                    const message = MessageStyler.suggestedActions(['Book a table', 'Who are you', 'Order Sandwich', 'Where can I get coffee?']);
                    message.text = 'Hello, I\'m the contoso cafe bot. How can I help you?'; 
                    context.reply(message);
                    return Promise.resolve();
                case 'Help':
                    context.reply('Hello, I\'m the Contoso Café bot. I can help you book a table, order sandwich, find cafe locations, answer questions about Contoso café, and more.', 'Hello, I\'m the official bot for Contoso Cafe. ');
                    return Promise.resolve();
                case 'whoAreYouIntent':
                case 'askForUserName':
                    return whoAreyoutask.executeTask(context);
                case 'communicationPreference':
                    // see if we have comm preference entity from LUIS
                    let entitiesFoundList = context.topIntent.entities;
                    if(entitiesFoundList.length > 0) {
                        entitiesFoundList.forEach((entity) => {
                            if(entity.type === 'communicationOption') context.state.conversation.commPreference = entity.value;
                        });
                    } 
                    context.reply('Ok, I\'ll remember that');
                    return Promise.resolve();
                case 'orderSandwich':
                    context.reply('I\'m learning that skill. Please use our website for now - http://www.contosocafe.com');
                    return Promise.resolve();
                case 'bookTableTrigger':
                case 'GetLocationDateTimePartySize':
                    return booktabletask.executeTask(context);
                case 'findCafeLocation':
                    context.reply('I\'m still learning that skill. Please use our website for now - http://www.contosocafe.com');
                    return Promise.resolve();
                default:
                    // call qna and see if we have an answer as a fallback
                    const utterance = context.request.text || '';
                    return qna.getAnswers(utterance)
                        .then((results) => {
                            if (results && results.length > 0) {
                                context.reply(results[0].answer);
                            } else {
                                context.reply(`I don't know.`);
                            }
                        });
            }
        } else if(context.request.type === 'conversationUpdate') {
            // do not do anything if this was the conversationUpdate event for the bot itself
            if(context.request.membersAdded[0].name !== 'Bot' && context.request.membersAdded[0].name !== 'You' && context.request.membersAdded[0].name !== 'username') {
                const message = MessageStyler.attachment(
                    CardStyler.heroCard(
                        'How can I help?',   // cards title 
                        [''],   // cards image(s)
                        ['Book a table', 'Order sandwich', 'Where can I get coffee?', 'What can you do?']   // cards button(s)
                     )
                );
                context.reply('Hello, I\'m the contoso cafe bot.');
                context.reply(message);
            }
        } else {
            console.log('Unhandled event: (' + context.request.type + ')::' + JSON.stringify(context));
        }
    });