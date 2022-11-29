const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");

esbuild.buildSync({
  entryPoints: ['src/index.tsx'],
  bundle: true,
  outdir: 'dist',
});

const copyStatic = (dirs, outdir) => {
  dirs.forEach((dir) => {
    fs.readdirSync(dir).forEach(file => {
      console.log(file);
      fs.copyFileSync(path.join(__dirname, dir, file), path.join(__dirname, outdir, file));
    });
  })
}

copyStatic(["public"], "dist")

