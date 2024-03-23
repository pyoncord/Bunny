> [!IMPORTANT]
> Most parts of Bunny are being rewritten, and the project is undergoing a rebranding to **Pyoncord**. The `legacy` branch has entered maintenance mode, and support for it will be discontinued once Pyoncord achieves full functionality to replace Bunny. For more details, refer to the #rebrand channel on [Pyoncord's Discord server](https://discord.gg/XjYgWXHb9Q).

# Bunny
A mod for Discord's mobile apps, a fork of Vendetta.

## Installing

### Android

- **Root** - [PyonXposed v0.1.0](https://github.com/pyoncord/PyoncordXposed/releases/tag/0.1.0) 
- **Non-root** - Inject [PyonXposed v0.1.0](https://github.com/pyoncord/PyoncordXposed/releases/tag/0.1.0) through [Vendetta Manager](https://github.com/vendetta-mod/VendettaManager):
    1. In Vendetta Manager, go to Settings > About and pressing the version number 10 times to enable Developer Settings
    2. Press back and go to Settings > Developer
    3. Point "Module location" to the downloaded PyonXposed's path (e.g. `/storage/emulated/0/Download/app-release.apk`)
    4. Return to main screen and install!

## iOS
> [!NOTE]
> At the time of writing, iOS support has a lower priority than Android. This is due to the fact that developing for iOS is very demanding.\
> The upcoming Pyoncord will provide its own tweak and only loadable through the tweak.

### Installing from VendettaTweak
You can load Bunny from VendettaTweak:

1. In Discord with the tweak, go to Settings > Developer (under the Vendetta section) > Enable 'Load from custom url'
2. Insert [Bunny's bundle URL](https://raw.githubusercontent.com/pyoncord/detta-builds/main/bunny.js) and restart.

This method forces you to initially use a Discord version which is supported by Vendetta, and >=222.0 (56747) seemingly stopped working with it, therefore is not recommended.

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
