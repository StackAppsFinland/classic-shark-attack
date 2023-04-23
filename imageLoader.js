const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = src;
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Image not found: ${src}`));
  });
};

class ImageLoader {
  constructor(callback) {
    this.imageFilenames = [
        'shark.png:6',
        'net-0011.png',
        'net-0101.png',
        'net-0110.png',
        'net-0111.png',
        'net-1001.png',
        'net-1010.png',
        'net-1011.png',
        'net-1100.png',
        'net-1101.png',
        'net-1110.png',
        'net-1111.png',
        'spool.png',
        'player.png:2',
        'frame_.png:48'
    ];
    this.textures = new Map();
    this.loadTextures(callback);
  }

  getImage(id) {
    return this.textures.get(id);
    console.log(this.textures)
  }

  parseFilenames() {
    const expandedFilenames = [];

    this.imageFilenames.forEach(filename => {
      const [baseName, range] = filename.split(':');

      if (range) {
        const end = parseInt(range, 10);
        for (let i = 1; i <= end; i++) {
          expandedFilenames.push(`${baseName.slice(0, -4)}${i}.png`);
        }
      } else {
        expandedFilenames.push(filename);
      }
    });

    return expandedFilenames;
  }

  loadTextures(callback) {
    const expandedFilenames = this.parseFilenames();
    const loadPromises = expandedFilenames.map(filename => {
      const id = filename.split('.')[0];
      const src = `images/${filename}`;
      return loadImage(src)
          .then(image => {
            const texture = PIXI.Texture.from(image);
            this.textures.set(id, texture);
          })
          .catch((ex) => {
            console.log(ex);
            console.error(`Image not found: ${src}`);
          });
    });

    Promise.all(loadPromises).then(callback);
  }
}

export default ImageLoader;