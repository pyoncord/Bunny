> [!NOTE]
> "Pyondetta" is not the final name of the mod.\
> This fork has been slowly progressing **since Dec 2023**, and [a set of new features](https://github.com/pyoncord/Pyondetta/issues/1) have been implemented.
> See [FAQs](#faqs)

# Pyondetta
A mod for Discord's mobile apps, fork of Vendetta, *with an actual progess.*


## Installing
Pyondetta's codebase is platform-agnostic, but you need a platform-specific loader.
> [!NOTE]
> - As of now, Pyoncord/Pyondetta does not have a proper independent loader.
> - However, you may use Vendetta's loader (VendettaXposed, VendettaTweak) and override loader url to [Pyondetta](https://raw.githubusercontent.com/pyoncord/detta-builds/main/pyondetta.js) (read [#Contributing > 7](#contributing))
> - Once our own independent loader is ready, support for Vendetta loader will cease

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

## FAQs

### Why Pyondetta?
Pyondetta is a fork from a maintainer of the good Vendetta, and is still passionate to work with Discord mods. Since Vendetta has reached EOL, Pyondetta was created to publish what I have been working behind the scenes.

### Pyondetta vs Pyoncord
Pyoncord and Pyondetta is a completely different mod. Pyoncord is my very own mod, and is in a very WIP project

### Discord server?
I'm not so much of an active Discord user myself. Since I'm ~~*a loner*~~ alone, managing a Discord server would be tough. Though, I still have created [a server for Pyoncord](https://discord.gg/97QVKX4z) for the sake of support (using GitHub issues is much preferable).

## Contributing
1. Install a Pyondetta loader with loader config support (any mentioned in the [Installing](#installing) section).

2. Go to Settings > General and enable Developer Settings.

3. Clone the repo:
    ```
    git clone https://github.com/pyoncord/pyondetta
    ```

4. Install dependencies:
    ```
    pnpm i
    ```
    <sup>`npm` or `yarn` should also work.</sup>

5. Build Pyondetta's code:
    ```
    pnpm build
    ```
    <sup>`npm` or `yarn` should also work.</sup>

6. In the newly created `dist` directory, run a HTTP server. I recommend [http-server](https://www.npmjs.com/package/http-server).

7. Go to Settings > Developer enabled earlier). Enable `Load from custom url` and input the IP address and port of the server (e.g.  e.g. `http://192.168.1.236:4040`) in the new input box labelled `VENDETTA URL`.

8. Restart Discord. Upon reload, you should notice that your device will download Pyondetta's bundled code from your server, rather than GitHub.

9. Make your changes, rebuild, reload, go wild!
