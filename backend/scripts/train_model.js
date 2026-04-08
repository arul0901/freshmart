const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');
const jpeg = require('jpeg-js');

const datasetPath = path.join(__dirname, '../dataset/train');
const modelOutPath = path.join(__dirname, '../models/freshmart_model');

// Decodes a raw JPEG into a 64x64 float32 Tensor
function decodeJpegToTensor(filePath) {
  const buf = fs.readFileSync(filePath);
  const jpegData = jpeg.decode(buf, {useTArray: true});
  const numChannels = 3;
  const numPixels = jpegData.width * jpegData.height;
  const values = new Int32Array(numPixels * numChannels);

  for (let i = 0; i < numPixels; i++) {
    values[i * numChannels + 0] = jpegData.data[i * 4 + 0];
    values[i * numChannels + 1] = jpegData.data[i * 4 + 1];
    values[i * numChannels + 2] = jpegData.data[i * 4 + 2];
  }

  let imgTensor = tf.tensor3d(values, [jpegData.height, jpegData.width, numChannels], 'int32');
  imgTensor = tf.image.resizeBilinear(imgTensor, [64, 64]);
  imgTensor = imgTensor.cast('float32').div(255);
  return imgTensor;
}

async function startTraining() {
  console.log('Loading dataset...');
  const xData = [];
  const yData = [];
  
  const classDirs = fs.readdirSync(datasetPath);
  const numClasses = classDirs.length;

  for (let c = 0; c < numClasses; c++) {
    const classDir = path.join(datasetPath, c.toString());
    const files = fs.readdirSync(classDir).filter(f => f.endsWith('.jpg'));
    
    for (let f of files) {
       try {
         const tensor = decodeJpegToTensor(path.join(classDir, f));
         xData.push(tensor);
         yData.push(c);
       } catch (e) {
         console.warn("Could not read " + f);
       }
    }
  }

  console.log(`Loaded ${xData.length} images across ${numClasses} classes.`);
  
  const xs = tf.stack(xData);
  const ys = tf.oneHot(tf.tensor1d(yData, 'int32'), numClasses);

  console.log('Building Custom CNN Model from scratch...');
  const model = tf.sequential();
  model.add(tf.layers.conv2d({inputShape: [64, 64, 3], filters: 16, kernelSize: 3, activation: 'relu'}));
  model.add(tf.layers.maxPooling2d({poolSize: 2}));
  model.add(tf.layers.conv2d({filters: 32, kernelSize: 3, activation: 'relu'}));
  model.add(tf.layers.maxPooling2d({poolSize: 2}));
  model.add(tf.layers.flatten());
  model.add(tf.layers.dense({units: 64, activation: 'relu'}));
  model.add(tf.layers.dense({units: numClasses, activation: 'softmax'}));

  model.compile({
    optimizer: 'adam',
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });

  model.summary();

  console.log('Training model...');
  await model.fit(xs, ys, {
    epochs: 20,
    batchSize: 16,
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, acc = ${logs.acc.toFixed(4)}`);
      }
    }
  });

  console.log('Training complete! Saving model...');
  if (!fs.existsSync(path.dirname(modelOutPath))) {
    fs.mkdirSync(path.dirname(modelOutPath), { recursive: true });
  }
  
  // Custom fallback to save weights if tfjs-node is not installed
  // We save the topology and weights manually since raw tfjs without node environment requires indexeddb/localstorage
  const outJsonInfo = path.join(modelOutPath, 'model.json');
  const weightsBinInfo = path.join(modelOutPath, 'weights.bin');
  
  await model.save(`file://${modelOutPath}`);
  
  console.log('✅ Model saved to models/freshmart_model');
}

startTraining();
