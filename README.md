# Poople Plus

Poople Plus is a local Chrome extension for [poople.io](https://poople.io/).

It adds:

- Live green, amber, and red word validation
- Protection from invalid Enter presses
- Undo for accepted words



https://github.com/user-attachments/assets/63d57bfa-5890-48bc-84de-8ef331a7c816



## Develop

```sh
pnpm install
pnpm dev
```

Open `chrome://extensions`, enable Developer mode, and load `dist/` as an
unpacked extension. Reload the extension and the Poople tab when required.

## Build

```sh
pnpm build:prod
```

Load `dist-prod/` as the unpacked extension.
