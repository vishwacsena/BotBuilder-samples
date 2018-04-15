using Microsoft.Bot.Builder;
using Microsoft.Bot.Schema;
using System.Threading.Tasks;
using Microsoft.Bot.Builder.Ai.LUIS;
using System;
using System.Threading;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;
using Microsoft.Bot.Builder.Prompts;

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

                    if (luisResult != null && !textData.Prompted)
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
                            case "Who are you intent":
                                GetTextUsingPrompt(context);
                                break;
                            default:
                                await context.SendActivity($"Hello world.");
                                break;
                        }
                    }
                    else
                    {
                        GetTextUsingPrompt(context);
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

        private async void GetTextUsingPrompt(ITurnContext context)
        {
            TextPrompt getUserNamePrompt = new TextPrompt();
            if(!textData.Prompted)
            {
                // We haven't prompted yet, so ask for the information and set the flag.
                await getUserNamePrompt.Prompt(context, "Hi, I'm the Contoso Cafe bot. What's your name?");
                textData.Prompted = true;
            }
            else
            {
                TextResult result = await getUserNamePrompt.Recognize(context);
                if(result.Succeeded())
                {
                    textData.Value = result.Value;
                    textData.Prompted = false;
                    await context.SendActivity($"Hello {textData.Value}. Nice to meet you!");
                }
                else
                {
                    // Validation failed, so reprompt.
                    await getUserNamePrompt.Prompt(context, "I did not understand that. Please enter your name.");
                }
            }
        }
        static PromptTextState textData = new PromptTextState();
        // Internal helper class.
        private class PromptTextState
        {
            public bool Prompted { get; set; } = false;
            public string Value { get; set; } = string.Empty;
        }
    }

    

}