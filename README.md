> [!NOTE]
> This fork has been slowly progressing, check out [Bunny's roadmap](https://github.com/pyoncord/Bunny/issues/1)\
> I might be a bit inactive to maintain Bunny until March '24.\
> I also recommend sticking to Vendetta as long as it works.


# Bunny
A mod for Discord's mobile apps, a fork of Vendetta


## FAQs

### What's Bunny?
Bunny is a fork from someone from the Vendetta team who is still interested in modding Discord. Since Vendetta has reached EOL, Bunny was created to publish what I have been working on behind the scenes.


### Bunny vs. Pyoncord
Pyoncord and Bunny are completely different mods. [Pyoncord](https://github.com/pyoncord/pyoncord) is my very own WIP mod, while Bunny is... simply a Vendetta fork. Bunny is put under Pyoncord branding following my initial plan, which was to eventually merge these codebases into one (sounds insane, I know).


### Discord server?
I have created [Pyoncord's server](https://discord.gg/XjYgWXHb9Q) for support and announcements, but getting support through GitHub issues is much preferable.
> [!NOTE]
> It's worth noting that I'm not so much of an active Discord user myself. With me being a loner, even managing a dead Discord server would be tough. 


### Progress?
Bunny is a side project that I work on for fun. I don’t have any intention to compete with other forks/client mods *(cough Revenge cough)* especially since I receive lack of support or encouragement from others. Bunny will go at its own pace and you may not get the same level of support as other mods.


## Installing

## Android

### Root
If you are rooted, you can directly load Bunny through [PyonXposed](https://github.com/pyoncord/pyonxposed), a module dedicated to inject Bunny.

### Non-root
You can inject [PyonXposed](https://github.com/pyoncord/pyonxposed) through [Vendetta Manager](https://github.com/vendetta-mod/VendettaManager).
1. In Vendetta Manager, go to Settings > Developer*
2. Set "Module location" to the downloaded PyonXposed's path (e.g. `/storage/emulated/0/Download/app-release.apk`)
3. Return to main screen and install!

#### *Developer settings must be enabled beforehand by going to Settings > About and pressing the version number 10 times

## iOS
At the time of writing, iOS support is a lower priority than Android. This is due to the fact that developing for iOS is very demanding. I *do* have some non-jailbroken iOS devices for testing around, but setting up the tweak and .ipa thingy is... meh.

I am welcoming everyone who is interested in hopping in Bunny's development and develop Bunny for iOS. Just reach me out through Discord!

For now, you can opt-in Bunny directly from VendettaTweak! If you wish to opt-in, simply:
1. Go to Settings > Developer (under the Vendetta section) > Enable 'Load from custom url'
2. Insert [Pyoncord's bundle URL](https://raw.githubusercontent.com/pyoncord/detta-builds/main/bunny.js) > Restart.

It's worth noting that this method may not last long and eventually cease in the future, but that's the least thing to worry about!... probably.

## Contributing <!-- do better tbh -->
Setting up Bunny is quite simple if you're already familiar with developing with Node.js. Simply `git clone`, `pnpm install`, `pnpm dev` and locally host the `<project-dir>/dist/bunny.js` bundle built by the script. Once you've got the local URL (something like `http://192.168.1.236:4040/bunny.js`), insert the URL under Settings > Developer (enabled in General beforehand) > Load custom URL and restart
