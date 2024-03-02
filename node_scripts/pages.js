const Twig = require('twig');
const fs = require('fs');
const path = require('path');
const pretty = require('pretty');

const sourceDirectory = 'src/twig/';
const destinationDirectory = 'dist/';
const pageTemplateRegex = new RegExp('^[^_].*\\.twig$');

renderDir(sourceDirectory, pageTemplateRegex, sourceDirectory, destinationDirectory);

function renderDir(startPath, pageTemplateRegex, sourceDirectory, destinationDirectory) {
  if (!fs.existsSync(startPath)) {
    console.log("no dir ", startPath);
    return;
  }

  let files = fs.readdirSync(startPath);
  for (let i = 0; i < files.length; i++) {
    let filename = path.join(startPath, files[i]);
    let stat = fs.lstatSync(filename);
    if (stat.isDirectory()) {
      renderDir(filename, pageTemplateRegex, sourceDirectory, destinationDirectory); //recurse
    } else if (stat.isFile() && pageTemplateRegex.test(files[i])) {
      let destination = filename.replace(new RegExp('^'+sourceDirectory), destinationDirectory);
      destination = destination.replace(new RegExp('.twig$'), '.html');
      renderPage(filename, destination);
    }
  };
}

function renderPage(source, destination) {
  Twig.renderFile(source, {/*data:'here'*/}, (err, html) => {
    if (err) throw err;

    const dirname = path.dirname(destination);
    fs.mkdir(dirname, { recursive: true }, (err) => {
      if (err) throw err;
    });

    fs.writeFileSync(destination, pretty(html));
  });
}
