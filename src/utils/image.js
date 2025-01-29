// Function to check for black pixels
export const checkBlackPixels = (context, width, height) => {
  const imageData = context.getImageData(0, 0, width, height);
  const { data } = imageData;
  let blackPixels = 0;
  const totalPixels = width * height;

  // Check each pixel
  for (let i = 0; i < data.length; i += 4) {
    // A pixel is considered "black" if all RGB values are below a threshold
    // Using 30 as threshold to account for very dark pixels
    if (data[i] < 30 && data[i + 1] < 30 && data[i + 2] < 30) {
      // eslint-disable-next-line no-plusplus
      blackPixels++;
    }
  }

  const blackPixelPercentage = (blackPixels / totalPixels) * 100;
  return blackPixelPercentage;
};
