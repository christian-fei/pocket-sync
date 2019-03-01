> small utility to save pocket items to disk as json and yml

# installation

```
npm i -g pocket-sync
```


# usage

to get started, the only thing you need is a pocket consumer key.

## 1. get a pocket consumer key

login on [getpocket.com](https://getpocket.com) and [get a pocket consumer key](http://getpocket.com/developer/apps/new) **(don't worry, it takes 10 seconds)**.


## 2. profit

install `pocket-sync` (`npm -i g pocket-sync`) or run it directly with `npx` like this:

```
npx @christian_fei/pocket-sync <POCKET_CONSUMER_KEY>
```

you'll be asked to open a link to get the consumer key, and use it the next time you want to sync your pocket items to be authenticated directly **without opening the browser**.

```
npx @christian_fei/pocket-sync <POCKET_CONSUMER_KEY> <POCKET_ACCESS_TOKEN>
```

Find the results in `pocket.json` and `pocket.yml`

# other

## pocket authentication

here you can find the [documentation](https://getpocket.com/developer/docs/authentication) for autenticating with your pocket account
