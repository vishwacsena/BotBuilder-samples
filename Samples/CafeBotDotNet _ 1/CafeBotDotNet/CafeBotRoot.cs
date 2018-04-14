using Microsoft.Bot.Builder;
using Microsoft.Bot.Schema;
using System.Threading.Tasks;

namespace Microsoft.Bot.Samples.CafeBotDotNet
{
    public class HelloBot : IBot
    {
        public async Task OnTurn(ITurnContext context)
        {
            switch (context.Activity.Type)
            {
                case ActivityTypes.Message:
                    // top level dispatch
                    if (context.Activity.Text.ToLower() == "hi")
                    {
                        await context.SendActivity($"Hello, I'm the contoso cafe bot. How can I help you?");
                    }
                    else
                    {
                        await context.SendActivity($"Hello world.");
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