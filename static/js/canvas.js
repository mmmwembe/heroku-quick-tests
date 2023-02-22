// Initialize canvas
const canvas = new fabric.Canvas('fabricCanvas');

// Display background image
let imageUrl = 'https://storage.googleapis.com/amina-files/users/92520572d6ac46b98a61745b61c327e7/user-images/ldcd9eygkpgul4i57a/Cherry_tomatoes/White-American-Rabbit.jpg';
const backgroundImage = new Image();
backgroundImage.crossOrigin = 'anonymous';
backgroundImage.onload = function () {
  canvas.setBackgroundImage(backgroundImage.src, canvas.renderAll.bind(canvas), {
    scaleX: canvas.width / backgroundImage.width,
    scaleY: canvas.height / backgroundImage.height,
  });
};
backgroundImage.src = imageUrl;

// Change background image on next button click
const nextBtn = document.getElementById('nextBtn');
nextBtn.addEventListener('click', () => {
  imageUrl = 'https://storage.googleapis.com/amina-files/users/92520572d6ac46b98a61745b61c327e7/user-images/ldcd9eygkpgul4i57a/Grape_tomatoes/american-rabbit-001.jpg';
  backgroundImage.src = imageUrl;
});

// Crop and display section of canvas on crop button click
const cropBtn = document.getElementById('cropBtn');
cropBtn.addEventListener('click', () => {
  const croppedImage = new Image();
  croppedImage.src = canvas.toDataURL({
    left: 0,
    top: 0,
    width: 150,
    height: 50,
  });
  const croppedImageElement = document.createElement('img');
  croppedImageElement.src = croppedImage.src;
  document.body.appendChild(croppedImageElement);
});

// Append cropped image to div on auto crop button click
const autoCropBtn = document.getElementById('autoCropBtn');
autoCropBtn.addEventListener('click', () => {
  // alert('autoCropBtn clicked');
  const croppedImage = new Image();
  croppedImage.src = canvas.toDataURL({
    left: 0,
    top: 0,
    width: 150,
    height: 50,
  });
  const croppedImageElement = document.createElement('img');
  croppedImageElement.src = croppedImage.src;
  const autoCropDiv = document.getElementById('autoCropDiv');
  autoCropDiv.appendChild(croppedImageElement);
});
