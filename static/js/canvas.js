// Get the canvas element from HTML
var canvas = document.getElementById("myCanvas");
var croppedImageDiv = document.getElementById("croppedImageDiv");

// Set the border and width of the canvas
canvas.style.border = "3px solid green";

// Set the height and width of the canvas
canvas.width = canvas.offsetWidth * 0.4;
canvas.height = canvas.offsetWidth * 0.3;

// Set the context of the canvas
var ctx = canvas.getContext("2d");

// Set the initial background image of the canvas
var IMAGE_ARRAY = ["https://storage.googleapis.com/amina-files/users/92520572d6ac46b98a61745b61c327e7/user-images/ldcd9eygkpgul4i57a/Grape_tomatoes/american-rabbit-001.jpg","https://storage.googleapis.com/amina-files/users/92520572d6ac46b98a61745b61c327e7/user-images/ldcd9eygkpgul4i57a/Cherry_tomatoes/White-American-Rabbit.jpg",           "https://storage.googleapis.com/amina-files/users/92520572d6ac46b98a61745b61c327e7/user-images/ldcd9eygkpgul4i57a/Cherry_tomatoes/american-rabbit-003.jpg",      "https://storage.googleapis.com/amina-files/users/92520572d6ac46b98a61745b61c327e7/user-images/ldcd9eygkpgul4i57a/Cherry_tomatoes/images-americanrabbbit-98498343.jpg", "https://storage.googleapis.com/amina-files/users/92520572d6ac46b98a61745b61c327e7/user-images/ldcd9eygkpgul4i57a/Cherry_tomatoes/images-not-sure-but.jpg"];
var image_url = IMAGE_ARRAY[0];
var img = new Image();
img.crossOrigin = "anonymous";
img.src = image_url;
img.onload = function() {
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

// Set the width and height of the rectangle
var rect_width = 150;
var rect_height = 50;

// Create a function to draw a rectangle
function createRect(x, y, width, height, fill, opacity) {
  var rect = new Path2D();
  rect.rect(x, y, width, height);
  ctx.fillStyle = fill;
  ctx.globalAlpha = opacity;
  ctx.fill(rect);
  ctx.globalAlpha = 1;
  return rect;
}

// Add event listener to the next button
var nextBtn = document.getElementById("nextBtn");
nextBtn.addEventListener("click", function() {
  var index = IMAGE_ARRAY.indexOf(image_url);
  if (index === IMAGE_ARRAY.length - 1) {
    index = 0;
  } else {
    index++;
  }
  image_url = IMAGE_ARRAY[index];
  img.src = image_url;
});

// Add event listener to the crop button
// Add event listener to the crop button
cropBtn.addEventListener('click', function() {
  // Determine the number of rows and columns of rectangles to create
  var num_columns = Math.floor(canvas.width/rect_width);
  var num_rows = Math.floor(canvas.height/rect_height);

  // Loop over each row and column to create a rectangle with random fill color
  for (var x = 0; x < num_rows; x++) {
    for (var y = 0; y < num_columns; y++) {
      var fill = COLORS_ARRAY[Math.floor(Math.random() * COLORS_ARRAY.length)];
      var opacity = 0.2;
      var myRect = createRect(y*rect_width, x*rect_height, rect_width, rect_height, fill, opacity);

      // Overlay the rectangle on the canvas
      ctx.drawImage(canvas, y*rect_width, x*rect_height, rect_width, rect_height, y*rect_width, x*rect_height, rect_width, rect_height);

      // Display the cropped section of the rectangle in the croppedImageDiv
      var croppedImage = new Image();
      croppedImage.src = canvas.toDataURL('image/png');
      croppedImage.width = rect_width;
      croppedImage.height = rect_height;
      croppedImageDiv.appendChild(croppedImage);
    }
  }
});

