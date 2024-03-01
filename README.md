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
Pyoncord and Bunny are completely different mods. [Pyoncord](https://github.com/pyoncord/pyoncord) is my very own WIP mod, while Bunny is my own iteration of Vendetta. The current plan is to supersede Pyoncord with this project, so I have been directing more attention toward this one.


### Discord server?
I have created [Pyoncord's server](https://discord.gg/XjYgWXHb9Q) for announcements and support, but getting support through GitHub issues is much preferable.
> [!NOTE]
> It's worth noting that I'm not so much of an active Discord user myself. With me being a loner, even managing a dead Discord server would be tough. 

### Progress?
Bunny will try not to seriously compete with other client mods. Bunny is lacking *a lot* of help so if you're interested, you might want to check out [#Contributing](#contributing) to see what you could do with this project!

## Installing

## Android

### Root
If you are rooted, you can directly load Bunny through [PyonXposed](https://github.com/pyoncord/pyonxposed), the Xposed module dedicated to inject Bunny.

### Non-root
You can inject [PyonXposed](https://github.com/pyoncord/pyonxposed) through [Vendetta Manager](https://github.com/vendetta-mod/VendettaManager).
1. In Vendetta Manager, go to Settings > Developer*
2. Set "Module location" to the downloaded PyonXposed's path (e.g. `/storage/emulated/0/Download/app-release.apk`)
3. Return to main screen and install!

#### *Developer settings must be enabled beforehand by going to Settings > About and pressing the version number 10 times

## iOS
At the time of writing, iOS support is a lower priority than Android. This is due to the fact that developing for iOS is very demanding. I *do* have some non-jailbroken iOS devices for testing around, but setting up the tweak and .IPA thingy is not something I can work on.

For now, you can opt-in Bunny directly from VendettaTweak! If you wish to opt-in, simply:
1. Go to Settings > Developer (under the Vendetta section) > Enable 'Load from custom url'
2. Insert [Bunny's bundle URL](https://raw.githubusercontent.com/pyoncord/detta-builds/main/bunny.js) > Restart.

It's worth noting that this method may not last long and eventually cease in the future, but that's the least thing to worry about!... probably.

## Contributing
I am highly welcoming everyone who is interested in hopping in Bunny's development. Just reach me out through Discord!\
Bunny currenty needs some help especially with the following:
- Developments for iOS (Tweak, IPA)
- Setting up the rest of Bunny ecosystem (plugin template, plugin repository and such)

## Building
1. Install a Bunny loader with loader config support (any mentioned in the [Installing](#installing) section).

2. Go to Settings > General and enable Developer Settings.

3. Clone the repo:
    ```
    git clone https://github.com/pyoncord/Bunny
    ```

4. Install dependencies:
    ```
    pnpm i
    ```

5. Build Bunny's code:
    ```
    pnpm build
    ```

6. In the newly created `dist` directory, run a HTTP server. I recommend [http-server](https://www.npmjs.com/package/http-server).

7. Go to Settings > Developer enabled earlier. Enable `Load from custom url` and input the IP address and port of the server (e.g. `http://192.168.1.236:4040/bunny.js`) in the new input box labelled `Bunny URL`.

8. Restart Discord. Upon reload, you should notice that your device will download Bunny's bundled code from your server, rather than GitHub.

9. Make your changes, rebuild, reload, go wild!

> [!NOTE]
> Alternatively, you can directly *serve* the bundled code by running `pnpm serve`.\
> `bunny.js` will be hosted on your local address under the port 4040.\
> You will then insert `http://<local ip address>:4040/bunny.js` as a custom url and reload.\
> Whenever you restart your mobile client, the script will rebuild the bundle as your client fetches it.