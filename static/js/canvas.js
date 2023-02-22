// Get canvas and context
const canvas = document.getElementById('fabricCanvas');
const context = canvas.getContext('2d');

// Set canvas width
canvas.style.width = '30%';
canvas.width = canvas.offsetWidth;

// Set initial background image
let imageUrl = 'https://storage.googleapis.com/amina-files/users/92520572d6ac46b98a61745b61c327e7/user-images/ldcd9eygkpgul4i57a/Cherry_tomatoes/White-American-Rabbit.jpg';

// Set up image object
const image = new Image();
image.crossOrigin = 'anonymous';
image.src = imageUrl;
image.onload = () => {
	// Resize canvas height based on aspect ratio of image
	const aspectRatio = image.width / image.height;
	canvas.style.height = `${canvas.offsetWidth / aspectRatio}px`;
	canvas.height = canvas.offsetHeight;

	// Draw image on canvas
	context.drawImage(image, 0, 0, canvas.width, canvas.height);
}

// Button listeners
const nextBtn = document.getElementById('nextBtn');
nextBtn.addEventListener('click', () => {
	// Change image URL and redraw canvas
	imageUrl = 'https://storage.googleapis.com/amina-files/users/92520572d6ac46b98a61745b61c327e7/user-images/ldcd9eygkpgul4i57a/Grape_tomatoes/american-rabbit-001.jpg';
	image.src = imageUrl;
});

const cropBtn = document.getElementById('cropBtn');
cropBtn.addEventListener('click', () => {
	// Crop rectangle
	const rect = { left: 0, top: 0, width: 150, height: 50 };
	const croppedImage = context.getImageData(rect.left, rect.top, rect.width, rect.height);

	// Create new canvas for cropped image
	const croppedCanvas = document.createElement('canvas');
	croppedCanvas.width = rect.width;
	croppedCanvas.height = rect.height;
	croppedCanvas.getContext('2d').putImageData(croppedImage, 0, 0);

	// Display cropped image on page
	const croppedImageElement = new Image();
	croppedImageElement.src = croppedCanvas.toDataURL();
	document.getElementById('autoCropDiv').appendChild(croppedImageElement);
});

const autocropBtn = document.getElementById('autocropBtn');
autocropBtn.addEventListener('click', () => {
	//alert('autoCropBtn clicked');

	// Crop rectangle
	const rect = { left: 0, top: 0, width: 150, height: 50 };
	const croppedImage = context.getImageData(rect.left, rect.top
