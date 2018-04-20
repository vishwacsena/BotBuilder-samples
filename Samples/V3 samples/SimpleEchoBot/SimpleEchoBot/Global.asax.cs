
using Autofac;
using System.Configuration;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder.Dialogs.Internals;
using Microsoft.Bot.Connector;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Routing;
using Microsoft.Bot.Builder.Azure;

namespace SimpleEchoBot
{
    public class WebApiApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            GlobalConfiguration.Configure(WebApiConfig.Register);
            
            Conversation.UpdateContainer(
            builder =>
            {
                var store = new InMemoryDataStore();
                builder.Register(c => store)
                          .Keyed<IBotDataStore<BotData>>(AzureModule.Key_DataStore)
                          .AsSelf()
                          .SingleInstance();
                builder.Register(c => new CachingBotDataStore(store,
                          CachingBotDataStoreConsistencyPolicy
                          .ETagBasedConsistency))
                          .As<IBotDataStore<BotData>>()
                          .AsSelf()
                          .InstancePerLifetimeScope();
                          
            });
        }
    }
}
