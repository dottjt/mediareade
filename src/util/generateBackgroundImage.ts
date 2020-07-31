import path from 'path';
// import GeoPattern from 'geopattern';
// import randomColor from 'randomcolor';
// import atob from 'atob';
// import * as svgToImg from "svg-to-img";
// import * as hero from 'hero-patterns';
import trianglify from 'trianglify';
import fs from 'fs';

// import { heroPatternsPropertyList } from './heroPatternsConfig';
// import colors from './colors';

// const randomItemNumber = (stringArray: string[]): string => {
//   return  stringArray[Math.floor(Math.random() * stringArray.length)];
// }

// const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min)
// const roundTo = (increment: number, number: number) => Math.round(number / increment) * increment
// const genAlpha = () => roundTo(5, random(23, 102)) / 100;

// const generateHeroPatternSVG = (name: string) => {
//   // generate random color combination and opacity value
//   let [c1, c2] = colors[random(1, colors.length) - 1];
//   if (random(1, 2) === 1) [c1, c2] = [c2, c1];
//   const alpha = genAlpha();

//   return {
//     fn: name,
//     params: alpha === 1 ? [c2] : [c2, alpha]
//   }
// }

// const generateRandomString = (length: number): string => {
//   var result = '';
//   var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   var charactersLength = characters.length;
//   for ( var i = 0; i < length; i++ ) {
//      result += characters.charAt(Math.floor(Math.random() * charactersLength));
//   }
//   return result;
// }

// NOTE: This is awful and does not work like I want.
// The problem is also finding colour palettes that look nicee.
// nice-color-palettes // https://www.npmjs.com/package/nice-color-palettes
// https://www.npmjs.com/package/svg-patterns (Maybe I should nest the svg inside another svg like in this library...)
// const generateHeroPatternSVGString = () => {
//   const { fn, params } = generateHeroPatternSVG(randomItemNumber(heroPatternsPropertyList));

//   const heroFn = hero[fn];
//   const svgURI = heroFn.apply(null, params);
//   return svgURI.replace("url('data:image/svg+xml,", "").replace("')", "")
// }

// NOTE: Can't get it to look nice.
// https://github.com/jasonlong/geo_pattern
// const generateGeoPatternSVGString = () => {
//   const pattern = GeoPattern.generate(generateRandomString(7), { });
//   const svgURI = pattern.toDataUrl();
//   return svgURI.replace('url("data:image/svg+xml;base64,', "").replace('")', "");
// }

const generateTrianglifySVGString = (backgroundImageFolder: string): Promise<void> => {
  const canvas = trianglify({
    width: 1280,
    height: 720
  }).toCanvas()

  const file = fs.createWriteStream(path.join(backgroundImageFolder, 'index.png'));
  const pngStream = canvas.createPNGStream();

  pngStream.pipe(file);

  return new Promise(function(resolve, reject) {
    pngStream.on('end', resolve);
    pngStream.on('error', reject);
  });
}

export const generateRandomSVGBackgroundImage = async ({
  backgroundImageFolder
}) => {
  await generateTrianglifySVGString(backgroundImageFolder);

  // const svgString = generateHeroPatternSVGString();
  // const svgString = generateGeoPatternSVGString();

  // console.log(svgString);
  // const image = await svgToImg.from(atob(svgString)).toPng({
  //   path: "./example.png",
  //   width: 1280,
  //   height: 720,
  //   background: randomColor({ luminosity: 'light', hue: 'random' })
  // });

  // svg2img(
  //   svgString,
  //   { width: 1280, height: 720, preserveAspectRatio:true},
  //   function(error: any, buffer: any) {
  //   //returns a Buffer
  //   fse.writeFileSync('foo1.png', buffer);
  // });

  // NOTE: svg-to-png converts files, not strings
  // https://www.npmjs.com/package/svg-to-png
  // var svg_to_png = require('svg-to-png');
  // svg_to_png.convert(svgString, '../output.png', {
  // }) // async, returns promise
  // .then( function(){
  //     // Do tons of stuff
  // });
}

export const generateBackgroundImage = (): string => {
  const backgroundImage = path.join(__dirname, '..', 'background-image', 'index.jpg');
  return backgroundImage;
};
