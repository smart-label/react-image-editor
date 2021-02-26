var glob = require("glob");

export const readDirectory = (path) => {
  return new Promise((resolve, reject) => {
    const pattern = path + "/**/**.+(jpg|png|jpeg)";
    console.log(pattern);
    glob.glob(pattern, (err, matches) => {
      if (err) reject(err);
      resolve(matches);
    });
  });
};
