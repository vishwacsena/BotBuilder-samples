using Microsoft.Bot.Builder;
using Microsoft.Bot.Schema;
using System.Threading.Tasks;
using Microsoft.Bot.Builder.Ai.LUIS;
using System;
using System.Threading;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;

namespace Microsoft.Bot.Samples.CafeBotDotNet
{
    public class HelloBot : IBot
    {
        public async Task OnTurn(ITurnContext context)
        {
            switch (context.Activity.Type)
            {
                case ActivityTypes.Message:

                    var luisResult = context.Services.Get<RecognizerResult>(LuisRecognizerMiddleware.LuisRecognizerResultKey);

                    if (luisResult != null)
                    {
                        (string key, double score) topItem = luisResult.GetTopScoringIntent();
                        switch(topItem.key)
                        {
                            case "Greeting":
                                await context.SendActivity($"Hello, I'm the contoso cafe bot. How can I help you?");
                                break;
                            case "Communication preference":
                                // get entities
                                if (luisResult.Entities.Count > 0)
                                {
                                    JToken commPreference;
                                    if(luisResult.Entities.TryGetValue("communicationOption", out commPreference))
                                    {
                                        switch(commPreference[0][0].ToString())
                                        {
                                            case "call":
                                                await context.SendActivity("Ok. I'll remember that you prefer to receive phone calls");
                                                break;
                                            case "text":
                                                await context.SendActivity("Ok. I'll remember that you prefer text updates");
                                                break;
                                            default:
                                                await context.SendActivity("Sorry. I do not understand that.");
                                                await context.SendActivity("You try 'I prefer text messages' or 'I prefer phone calls'");
                                                break;
                                        }
                                    }
                                }
                                break;
                            default:
                                await context.SendActivity($"Hello world.");
                                break;
                        }
                    }
                    break;
                case ActivityTypes.ConversationUpdate:
                    foreach (var newMember in context.Activity.MembersAdded)
                    {
                        if (newMember.Id != context.Activity.Recipient.Id)
                        {
                            await context.SendActivity("Hello and welcome to the Cafe bot.");
                        }
                    }
                    break;
            }
        }
    }
}