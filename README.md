> [!NOTE]
> This fork has been slowly progressing, check out [Bunny's roadmap](https://github.com/pyoncord/Bunny/issues/1)\
> Bunny is based on the codebase where I do my prototypes, so it could be unstable and might have some issues. Sticking to Vendetta is a better option for now, unless you want to try some other forks.


# Bunny
A mod for Discord's mobile apps, fork of Vendetta


## FAQs

### What's Bunny?
Bunny is a fork from a contributor of Vendetta who is still interested in modding Discord. Since Vendetta has reached EOL, Bunny was created to publish what I have been working on behind the scenes.


### Bunny vs. Pyoncord
Pyoncord and Bunny are completely different mods. [Pyoncord](https://github.com/pyoncord/pyoncord) is my very own WIP mod while Bunny is... simply a Vendetta fork. Bunny is put under Pyoncord branding following my initial plan which was to eventually merge these codebases into one (sounds insane I know).


### Discord server?
I'm not so much of an active Discord user myself. Since I'm ~~*a loner*~~ alone at the moment, managing a Discord server would be tough. With that noted, I still have created [Pyoncord's server](https://discord.gg/XjYgWXHb9Q), but using GitHub issues for support is much preferable.


### Progress?
Bunny is a side project that I work on for fun. I don’t have any intention to compete with other forks/client mods *(cough Revenge cough)* especially since I receive lack of support or encouragement from others. Bunny will go at its own pace and you may not get the same level of support as other mods.


## Installing
Bunny's codebase is *currently* platform-agnostic, but you need a platform-specific loader.
> [!NOTE]
> - As of now, Pyoncord/Bunny does not have a proper independent loader yet.
> - However, you may use Vendetta's loader (VendettaXposed, VendettaTweak) and override the loader url to [Bunny](https://raw.githubusercontent.com/pyoncord/detta-builds/main/bunny.js) (read [#Contributing > 7](#contributing))
> - Once our own independent loader is ready, support for the Vendetta loader will cease.


### Android
* Root - [VendettaXposed](https://github.com/vendetta-mod/VendettaXposed/releases/latest)
* Non-root - [VendettaManager](https://github.com/vendetta-mod/VendettaManager/releases/latest)
    - Manager not working? No problem! Pre-built APKs are provided [here](https://discord.k6.tf/).
    - The minimum Android version required is 9. It will not work any lower.


### iOS
* Jailbroken - [VendettaTweak](https://github.com/vendetta-mod/VendettaTweak)
    - You can get prebuilt `.deb` files from GitHub Actions - we support rootful and rootless jailbreaks!
* Jailed - You can get IPAs from [the thread](https://discord.com/channels/1015931589865246730/1087295482667208766) in our [Discord server](https://discord.gg/n9QQ4XhhJP) or from our [host](https://discord.k6.tf/ios/).
    - These IPAs do *not* work with AltStore! You should use [Sideloadly](https://sideloadly.io).


## Contributing
1. Install a Vendetta loader with loader config support (any mentioned in the [Installing](#installing) section).


2. Go to Settings > General and enable Developer Settings.


3. Clone the repo:
    ```
    git clone https://github.com/pyoncord/bunny
    ```


4. Install dependencies:
    ```
    pnpm i
    ```
    <sup>`npm` or `yarn` should also work.</sup>


5. Build Bunny's code:
    ```
    pnpm build
    ```
    <sup>`npm` or `yarn` should also work.</sup>


6. In the newly created `dist` directory, run a HTTP server. I recommend [http-server](https://www.npmjs.com/package/http-server).


7. Go to Settings > Developer enabled earlier). Enable `Load from custom url` and input the IP address and port of the server (e.g. `http://192.168.1.236:4040`) in the new input box labelled `VENDETTA URL`.


8. Restart Discord. Upon reload, you should notice that your device will download Bunny's bundled code from your server, rather than GitHub.


9. Make your changes, rebuild, reload, go wild!

