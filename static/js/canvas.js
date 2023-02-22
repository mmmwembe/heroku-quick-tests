// Get the canvas element and set its width
const canvas = document.getElementById("fabricCanvas");

// Set the width of the canvas to be 50% of the window width
canvas.width = window.innerWidth * 0.5;

// Get the canvas context
const ctx = canvas.getContext("2d");

// Set the initial background image
let imageUrl = "https://storage.googleapis.com/amina-files/users/92520572d6ac46b98a61745b61c327e7/user-images/ldcd9eygkpgul4i57a/Cherry_tomatoes/White-American-Rabbit.jpg";
const img = new Image();
img.crossOrigin = "anonymous";
img.onload = function() {
  // Calculate the aspect ratio of the image
  const aspectRatio = img.width / img.height;

  // Calculate the new height of the canvas based on the aspect ratio
  const newHeight = canvas.width / aspectRatio;

  // Resize the canvas to fit the image
  canvas.height = newHeight;

  // Draw the image onto the canvas
  ctx.drawImage(img, 0, 0, canvas.width, newHeight);
};
img.src = imageUrl;

// Get the button elements
const nextBtn = document.getElementById("nextBtn");
const cropBtn = document.getElementById("cropBtn");
const autoCropBtn = document.getElementById("autoCropBtn");

// Add event listeners to the buttons
nextBtn.addEventListener("click", function() {
  imageUrl = "https://storage.googleapis.com/amina-files/users/92520572d6ac46b98a61745b61c327e7/user-images/ldcd9eygkpgul4i57a/Grape_tomatoes/american-rabbit-001.jpg";
  img.src = imageUrl;
});

cropBtn.addEventListener("click", function() {
  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");
  croppedCanvas.width = 150;
  croppedCanvas.height = 50;
  croppedCtx.drawImage(canvas, 0, 0, croppedCanvas.width, croppedCanvas.height, 0, 0, croppedCanvas.width, croppedCanvas.height);

  const croppedImageElement = document.createElement("img");
  croppedImageElement.src = croppedCanvas.toDataURL();
  document.body.appendChild(croppedImageElement);
});

autoCropBtn.addEventListener("click", function() {
  // alert("autoCropBtn clicked");
  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");
  croppedCanvas.width = 150;
  croppedCanvas.height = 50;
  croppedCtx.drawImage(canvas, 0, 0, croppedCanvas.width, croppedCanvas.height, 0, 0, croppedCanvas.width, croppedCanvas.height);

  const croppedImageElement = document.createElement("img");
  croppedImageElement.src = croppedCanvas.toDataURL();
  document.getElementById("autoCropDiv").appendChild(croppedImageElement);
});