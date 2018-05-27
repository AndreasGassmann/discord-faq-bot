# Discord FAQ bot

A simple simple bot that helps you answer frequently asked questions on your server.

[Add the bot](https://discordapp.com/api/oauth2/authorize?client_id=441430430403526657&permissions=0&scope=bot)

[Support discord](https://discord.gg/uTw6e7d)

## Commands

The standard prefix is `!`, but if that doesn't work you can also do `@FAQ <command>`. The bot only listens to commands starting with `<prefix>faq`, so there shouldn't be any conflicts with other bots, even if they share a prefix.

```
!faq                               Show a list of all FAQs
!faq <name> (@user)           		 Show specific FAQ
!faq add <name> <description>      Add new FAQ
!faq delete <name>                 Delete specific FAQ
!faq help (command)                Display help
!faq list                          Show a list of all FAQs
!faq detail <name>                 Show details of a specific FAQ
!faq set <property> <name> <value> Set a property of an FAQ. Use `!faq help set` for more info
!faq autoResponse <yes/no>				 Enable or disable automatic responses
!faq setprefix [prefix]            Set or check command prefix
```

## Standard use case

After inviting, set up the bot by adding one FAQ to the bot:

`!faq add prefix To change the prefix you can do '!faq setprefix !'`

Now when a user asks how he can change the prefix, you can simple do

`!faq prefix @user`

This will mention the user and send him the answer you specified.

## Advanced

### Setting properties of FAQs

To improve your FAQ, you can add properties to individual FAQs. The following properties are available:

question (default: empty)
answer (default: value set during !faq add)
tags (default: empty)
enableAutoAnswer (default: true)

Example: `!faq set question prefix How do I set the prefix?`

## Planned features

### Automatic answering

You can define triggers that are related to your FAQ and the bot will answer automatically