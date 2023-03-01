window.onload = function() {
  var canvas = document.getElementById('canvas');
  var context = canvas.getContext('2d');

  // Set canvas dimensions to fill middle column of first row
  canvas.width = document.querySelector('.col-6').offsetWidth;
  canvas.height = document.querySelector('.col-6').offsetHeight;

  // Add event listener to the crop button
  var cropBtn = document.getElementById('cropBtn');
  cropBtn.addEventListener('click', function() {
    var croppedImg = new Image();
    croppedImg.src = canvas.toDataURL();
    document.getElementById('croppedImgDiv').appendChild(croppedImg);
  });
};
