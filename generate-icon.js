const fs = require('fs');
const { PNG } = require('pngjs');

const png = new PNG({ width: 512, height: 512, fillType: 4 });

for (let i = 0; i < png.data.length; i++) {
  png.data[i] = 255;
}

const stream = fs.createWriteStream('assets/icon.png');
png.pack().pipe(stream);

stream.on('finish', () => {
  console.log('Icon created successfully');
});