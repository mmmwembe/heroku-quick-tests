// Get the canvas element and set its width
const canvas = document.getElementById("fabricCanvas");
canvas.width = window.innerWidth * 0.5;

// Get the canvas context
const ctx = canvas.getContext("2d");

// Set the initial background image
let imageUrl = "https://storage.googleapis.com/amina-files/users/92520572d6ac46b98a61745b61c327e7/user-images/ldcd9eygkpgul4i57a/Cherry_tomatoes/White-American-Rabbit.jpg";
const img = new Image();
img.crossOrigin = "anonymous";
img.onload = function() {
  ctx.drawImage(img, 0, 0, canvas.width, canvas.width * img.height / img.width);
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