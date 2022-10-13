#!/usr/bin/env node

const fs = require("fs");
const _ = require("lodash");
const path = require("path");
const translate = require('@vitalets/google-translate-api');

function getArg(name) {
  if (!process.argv.includes(`--${name}`)) {
    return null;
  }

  return process.argv[process.argv.indexOf(`--${name}`) + 1];
}

const mode = getArg("mode") || "build";

const translationsFile = require(path.resolve(process.cwd(), getArg("translations-file")));

const translations = {};

const outputs = getArg("languages")
  .split(",")
  .reduce((object, language) => {
    const [languageName, output] = language.split("=");

    return {
      ...object,
      [languageName]: output,
    };
  }, {});

const languages = Object.keys(outputs);

languages.forEach((language) => {
  translations[language] = {
    output: outputs[language],
    data: {},
  };
});

if (mode === "build") {
  async function readObject(object, path = []) {
    for (let key of Object.keys(object)) {
      if (object[key] instanceof Array || typeof object[key] === "string") {
        if (languages.includes(key)) {
          _.set(translations[key].data, path, object[key]);
        }
      } else if (object[key] instanceof Object) {
        await readObject(object[key], path.concat(key));

        if (getArg('suggest')) {
          let [from, to] = getArg('suggest').split('>');

          const googleFrom = from.split(':')[1] || from;
          from = from.split(':')[0] || from;

          const googleTo = to.split(':')[1] || to;
          to = to.split(':')[0] || to;

          if (object[key][from] && !object[key][to]) {
            const response = await translate(object[key][from], { from: googleFrom, to: googleTo });

            _.set(translations[to].data, path.concat(key), response.text.trim());

            console.log(`${path.concat(key).join('.')} translated!`);
          }
        }
      }
    }
  }

  (async () => {
    await readObject(translationsFile);

    languages.forEach((language) => {
      fs.writeFileSync(
        translations[language].output,
        JSON.stringify(translations[language].data, null, "  ")
      );
    });
  })();
} else if (mode === "reverse") {
  const translationsFile = {};

  languages.forEach((language) => {
    const translation = require(path.resolve(process.cwd(), translations[language].output));

    function readObject(object, path = []) {
      Object.keys(object).forEach((key) => {
        if (object[key] instanceof Array || typeof object[key] === "string") {
          _.set(translationsFile, path.concat([key, language]), object[key]);
        } else if (object[key] instanceof Object) {
          readObject(object[key], path.concat(key));
        }
      });
    }

    readObject(translation);
  });

  fs.writeFileSync(
    getArg("translations-file"),
    JSON.stringify(translationsFile, null, "  ")
  );
}
