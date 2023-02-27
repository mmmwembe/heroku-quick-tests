// Initialize canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth * 0.5;
canvas.height = canvas.width * 0.3;
var container = document.getElementById("container");
container.appendChild(canvas);

// Set initial background image on canvas
var image_url = IMAGE_ARRAY[0];
ctx.drawImage(image_url, 0, 0, canvas.width, canvas.height);

// Set crossorigin attribute for image to "anonymous"
var image = new Image();
image.crossOrigin = "anonymous";

// Create function to draw rectangle
function createRect(x, y, width, height, fill, opacity) {
  var rect = new Path2D();
  rect.rect(x, y, width, height);
  ctx.fillStyle = fill;
  ctx.globalAlpha = opacity;
  ctx.fill(rect);
  ctx.globalAlpha = 1;
  return rect;
}

// Constants for rectangle width and height
const rect_width = 150;
const rect_height = 50;

// Next button event listener
var nextBtn = document.getElementById("nextBtn");
nextBtn.addEventListener("click", function() {
  var currentIndex = IMAGE_ARRAY.indexOf(image_url);
  var nextIndex = (currentIndex + 1) % IMAGE_ARRAY.length;
  image_url = IMAGE_ARRAY[nextIndex];
  image.src = image_url;
});

// Crop button event listener
var cropBtn = document.getElementById("cropBtn");
cropBtn.addEventListener("click", function() {
  var num_columns = Math.floor(canvas.width / rect_width);
  var num_rows = Math.floor(canvas.height / rect_height);
  var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  for (var x = 0; x < num_rows; x++) {
    for (var y = 0; y < num_columns; y++) {
      var fill = COLORS_ARRAY[Math.floor(Math.random() * COLORS_ARRAY.length)];
      var myRect = createRect(
        y * rect_width,
        x * rect_height,
        rect_width,
        rect_height,
        fill,
        0.2
      );
      ctx.clip(myRect);
      ctx.drawImage(image, 0, 0);
      var croppedImageData = ctx.getImageData(
        y * rect_width,
        x * rect_height,
        rect_width,
        rect_height
      );
      var croppedCanvas = document.createElement("canvas");
      croppedCanvas.width = rect_width;
      croppedCanvas.height = rect_height;
      var croppedCtx = croppedCanvas.getContext("2d");
      croppedCtx.putImageData(croppedImageData, 0, 0);
      var croppedImg = new Image();
      croppedImg.src = croppedCanvas.toDataURL();
      croppedImg.width = rect_width;
      croppedImg.height = rect_height;
      var croppedImageDiv = document.getElementById("croppedImageDiv");
      croppedImageDiv.appendChild(croppedImg);
    }
  }
});

// Initialize auto-crop button
var autoCropBtn = document.createElement("BUTTON");
autoCropBtn.id = "autoCropBtn";
autoCropBtn.innerHTML = "Auto Crop";
autoCropBtn.style.margin = "20px";
autoCropBtn.style.display = "none";
autoCropBtn.addEventListener("click", autoCrop);
rowTwo.appendChild(autoCropBtn);

// Define the autoCrop function
function autoCrop() {
// Hide the next button and crop button
nextBtn.style.display = "none";
cropBtn.style.display = "none";
autoCropBtn.style.display = "none";

// Set up variables for loop
var num_columns = Math.floor(canvas.width / rect_width);
var num_rows = Math.floor(canvas.height / rect_height);
var x = 0;
var y = 0;

// Create a new canvas to store the cropped images
var croppedCanvas = document.createElement("canvas");
croppedCanvas.width = canvas.width;
croppedCanvas.height = canvas.height;
var croppedCtx = croppedCanvas.getContext("2d");

// Loop through rows and columns, create rectangles and crop sections of the canvas
for (var i = 0; i < num_rows; i++) {
y = i * rect_height;
for (var j = 0; j < num_columns; j++) {
x = j * rect_width;
var fill = COLORS_ARRAY[Math.floor(Math.random() * COLORS_ARRAY.length)];
var opacity = 0.2;
var myRect = createRect(x, y, rect_width, rect_height, fill, opacity);
croppedCtx.drawImage(canvas, x, y, rect_width, rect_height, x, y, rect_width, rect_height);
}
}

// Convert the cropped canvas to an image and display it in the "croppedImageDiv"
var croppedImage = new Image();
croppedImage.src = croppedCanvas.toDataURL();
croppedImage.crossOrigin = "anonymous";
croppedImage.style.width = "100%";
croppedImage.style.height = "100%";
croppedImageDiv.appendChild(croppedImage);
}

// Define the createRect function
function createRect(x, y, width, height, fill, opacity) {
var rect = new Path2D();
rect.rect(x, y, width, height);
ctx.fillStyle = fill;
ctx.globalAlpha = opacity;
ctx.fill(rect);
ctx.globalAlpha = 1;
return rect;
}