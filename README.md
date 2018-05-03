# Discord FAQ bot

A simple simple bot that helps you answer frequently asked questions on your server.

[Add the bot](https://discordapp.com/api/oauth2/authorize?client_id=441430430403526657&permissions=0&scope=bot)

[Support discord](https://discord.gg/uTw6e7d)

## Commands

The standard prefix is `!faq`, but if that doesn't work you can also do `@FAQ <command>`.

```
!faq add <name> <description>  Add new FAQ
!faq delete <name>             Delete specific FAQ
!faq help (command)            Display help
!faq list                      Show all FAQs
!faq setprefix [prefix]        Set or check command prefix
!faq show <name> (@user)       Show specific FAQ
```

## Standard use case

After inviting, set up the bot by adding one FAQ to the bot:

`!faq add prefix To change the prefix you can do '!faq setprefix !'`

Now when a user asks how he can change the prefix, you can simple do

`!faq show prefix @user`

or a shorthand

`!faq . prefix @user`

This will mention the user and send him the answer you specified.

## Planned features

- Ability to DM new users instructions how they can use the FAQ bot themselves (`!faq list`)
- Maybe some kind of NLP to analyze the messages and identify if someone needs help and then reply automatically.