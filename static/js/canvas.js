// Initialize canvas
const canvas = document.createElement("canvas");
canvas.width = window.innerWidth * 0.4;
canvas.height = window.innerWidth * 0.3;
canvas.style.border = "3px solid green";
canvas.style.display = "block";
canvas.style.margin = "0 auto";
const context = canvas.getContext("2d");
document.querySelector("#canvasContainer .col-md-4:nth-of-type(2)").appendChild(canvas);

// Draw initial image
let imageUrl = "https://storage.googleapis.com/amina-files/users/92520572d6ac46b98a61745b61c327e7/user-images/ldcd9eygkpgul4i57a/Cherry_tomatoes/White-American-Rabbit.jpg";
const img = new Image();
img.crossOrigin = "anonymous";
img.onload = function() {
  context.drawImage(img, 0, 0, canvas.width, canvas.height);
};
img.src = imageUrl;

// Add event listeners to buttons
document.querySelector("#nextBtn").addEventListener("click", function() {
  imageUrl = "https://storage.googleapis.com/amina-files/users/92520572d6ac46b98a61745b61c327e7/user-images/ldcd9eygkpgul4i57a/Grape_tomatoes/american-rabbit-001.jpg";
  img.src = imageUrl;
});

document.querySelector("#cropBtn").addEventListener("click", function() {
  const croppedCanvas = document.createElement("canvas");
  croppedCanvas.width = 150;
  croppedCanvas.height = 50;
  const croppedContext = croppedCanvas.getContext("2d");
  croppedContext.drawImage(canvas, 0, 0, 150, 50, 0, 0, 150, 50);
  const croppedImage = new Image();
  croppedImage.src = croppedCanvas.toDataURL();
  const croppedImageDiv = document.querySelector("#croppedImageDiv");
  croppedImageDiv.style.width = canvas.width + "px";
  croppedImageDiv.style.height = canvas.height + "px";
  croppedImageDiv.style.border = "3px solid blue";
  croppedImageDiv.innerHTML = "";
  croppedImageDiv.appendChild(croppedImage);
});

document.querySelector("#autoCropBtn").addEventListener("click", function() {
  const croppedCanvas = document.createElement("canvas");
  croppedCanvas.width = canvas.width;
  croppedCanvas.height = canvas.height;
  const croppedContext = croppedCanvas.getContext("2d");
  croppedContext.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
  const croppedImage = new Image();
  croppedImage.src = croppedCanvas.toDataURL();
  const croppedImageDiv = document.querySelector("#croppedImageDiv");
  croppedImageDiv.style.width = canvas.width + "px";
  croppedImageDiv.style.height = canvas.height + "px";
  croppedImageDiv.style.border = "3px solid blue";
  croppedImageDiv.innerHTML = "";
  croppedImageDiv.appendChild(croppedImage);
});
