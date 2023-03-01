// Get the canvas element and set its dimensions
var canvas = document.getElementById("canvas");
canvas.width = canvas.parentNode.offsetWidth * 0.5;
canvas.height = canvas.parentNode.offsetHeight * 0.25;

// Add event listeners to the buttons
var nextBtn = document.getElementById("nextBtn");
var cropBtn = document.getElementById("cropBtn");
var autoCropBtn = document.getElementById("autoCropBtn");

nextBtn.addEventListener("click", function() {
	// Handle the "Next" button click
  alert("// Handle the Next button click")
});

cropBtn.addEventListener("click", function() {
	// Handle the "Crop" button click
  alert("// Handle the Crop button click")
});

autoCropBtn.addEventListener("click", function() {
	// Handle the "Auto Crop" button click
  alert("// Handle the Auto Crop button click")
});
