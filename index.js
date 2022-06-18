#!/usr/bin/env node

const fs = require("fs");
const _ = require("lodash");
const path = require("path");

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
  function readObject(object, path = []) {
    Object.keys(object).forEach((key) => {
      if (object[key] instanceof Array || typeof object[key] === "string") {
        if (languages.includes(key)) {
          _.set(translations[key].data, path, object[key]);
        }
      } else if (object[key] instanceof Object) {
        readObject(object[key], path.concat(key));
      }
    });
  }

  readObject(translationsFile);

  languages.forEach((language) => {
    fs.writeFileSync(
      translations[language].output,
      JSON.stringify(translations[language].data, null, "  ")
    );
  });
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
