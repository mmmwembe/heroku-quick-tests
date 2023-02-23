// Select the canvas element and set its dimensions
var canvas = document.getElementById("myCanvas");
canvas.width = canvas.parentElement.offsetWidth * 0.4;
canvas.height = canvas.width * 0.3;

// Initialize the canvas context
var ctx = canvas.getContext("2d");

// Set the initial image to display on the canvas
var image_url = "https://storage.googleapis.com/amina-files/users/92520572d6ac46b98a61745b61c327e7/user-images/ldcd9eygkpgul4i57a/Cherry_tomatoes/White-American-Rabbit.jpg";

// Set the image crossorigin to "anonymous"
var img = new Image();
img.crossOrigin = "anonymous";
img.src = image_url;

// Draw the image on the canvas when it's loaded
img.onload = function() {
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
};

// Add event listeners to the buttons
document.getElementById("nextBtn").addEventListener("click", function() {
  image_url = "https://storage.googleapis.com/amina-files/users/92520572d6ac46b98a61745b61c327e
