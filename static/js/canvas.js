// Get the canvas element and context
const canvas = document.getElementById('fabricCanvas');
const ctx = canvas.getContext('2d');

// Set initial background image URL and load it
let imageUrl = 'https://storage.googleapis.com/amina-files/users/92520572d6ac46b98a61745b61c327e7/user-images/ldcd9eygkpgul4i57a/Cherry_tomatoes/White-American-Rabbit.jpg';
const image = new Image();
image.crossOrigin = 'anonymous';
image.onload = () => {
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
};
image.src = imageUrl;

// Add event listeners to the buttons
const nextBtn = document.getElementById('nextBtn');
nextBtn.addEventListener('click', () => {
    imageUrl = 'https://storage.googleapis.com/amina-files/users/92520572d6ac46b98a61745b61c327e7/user-images/ldcd9eygkpgul4i57a/Grape_tomatoes/american-rabbit-001.jpg';
    image.src = imageUrl;
});

const cropBtn = document.getElementById('cropBtn');
cropBtn.addEventListener('click', () => {
    const rect1 = { left: 0, top: 0, width: 150, height: 50 };
    const croppedImage = ctx.getImageData(rect1.left, rect1.top, rect1.width, rect1.height);
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = rect1.width;
    croppedCanvas.height = rect1.height;
    const croppedCtx = croppedCanvas.getContext('2d');
    croppedCtx.putImageData(croppedImage, 0, 0);
    const croppedImageURL = croppedCanvas.toDataURL();
    const croppedImageElement = document.createElement('img');
    croppedImageElement.src = croppedImageURL;
    document.body.appendChild(croppedImageElement);
});

const autoCropBtn = document.getElementById('autoCropBtn');
autoCropBtn.addEventListener('click', () => {
    alert('autoCropBtn clicked');
});
