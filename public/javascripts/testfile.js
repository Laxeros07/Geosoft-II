const englishCode = "en-UK";

const frenchCode = "es-FS";

function getAboutUsLink(language) {
  switch (language.toLowerCase()) {
    case englishCode.toLowerCase():
      return "/about-us";

    case frenchCode.toLowerCase():
      return "/-à propos de nous";
  }

  return "";
}

function moin(param) {
  if (param == 1) {
    return "ja";
  } else {
    return "nein";
  }
}

module.exports = getAboutUsLink;
module.exports = moin;
