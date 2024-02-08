> [!NOTE]
> - This fork is still slowly progressing, but a set of new features have been implemented.
> - "Pyondetta" is *not* the final name of the mod.
> - Pyon's independent loader coming soon.

# Pyondetta
A mod for Discord's mobile apps, fork of Vendetta.

## Installing
Pyondetta's codebase is platform-agnostic, but you need a platform-specific loader.
> [!NOTE]
> As of now, Pyoncord/Pyondetta does not have a proper independent loader.\
> However, you may use Vendetta's loader (VendettaXposed, VendettaTweak) and override loader url to [Pyondetta](https://raw.githubusercontent.com/pyoncord/detta-builds/main/pyondetta.js) (read [#Contributing > 7](#contributing)) to try out Pyondetta

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
