# Unified Translations

Unify translations in one single file for maintenance and build to separated files.

Keep all translated sentences of your project in one single JSON file and organized by scope:

``` json
{
  "home": {
    "title": {
      "pt-br": "Olá, Mundo!",
      "en": "Hello World!"
    }
  }
}
```

And ask to `unified-translations` separate in differents files for your i18n configuration.

Example of the final files:

```json
// pt-br.json
{
  "home": {
    "title": "Olá, Mundo!"
  }
}
```

```json
// en.json
{
  "home": {
    "title": "Hello World!"
  }
}
```


## Install

```
npm install unified-translations --save-dev
```

## Arguments

| Argument | Description |
| - | - |
| `--translations-file` | JSON file of all translated sentences. |
| `--languages` | List of all languages key and output file separated by coma. Eg. "pt-br=./pt-br.json" wich `pt-br` is the language key, the same used in translations file to identify the language and the `./pt-br.json` is the desired final output file of that language.
| `--mode` | Mode of the script. Default is `build`, but it also accepts `reverse` mode. |

## Build

To create the separated files, use the following command:

```
unified-translations
  --translations-file ./translations.json
  --languages pt-br=./pt-br.json,en=./en.json
```

## Reverse Mode

To create the "translations file" from the already created output files:

```
unified-translations
  --translations-file ./translations.json
  --languages pt-br=./pt-br.json,en=./en.json
  --mode reverse
```
