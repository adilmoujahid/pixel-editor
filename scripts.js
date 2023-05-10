// Variables
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const gridCanvas = document.getElementById("gridCanvas");
const gridCtx = gridCanvas.getContext("2d");
const assets = document.getElementById("assets");

let canvasSize = parseInt(document.getElementById("canvasSize").value);
let gridSize = parseInt(document.getElementById("gridSize").value);
canvas.width = gridCanvas.width = canvasSize * gridSize;
canvas.height = gridCanvas.height = canvasSize * gridSize;

let isDrawing = false;
let isGridVisible = true;
let color = "#000000";

// Initialize the color
setColor(document.getElementById("colorPicker").value);

// Functions

// Sets the color
function updateCanvasSize() {
  canvasSize = parseInt(document.getElementById("canvasSize").value);
  gridSize = parseInt(document.getElementById("gridSize").value);
  canvas.width = gridCanvas.width = canvasSize * gridSize;
  canvas.height = gridCanvas.height = canvasSize * gridSize;
  drawGrid();
}

function setColor(newColor) {
  if (newColor) {
    color = newColor;
    document.getElementById("colorPicker").value = newColor;
  }
}

// Draws the grid on the canvas
function drawGrid() {
  gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
  if (!isGridVisible) return;

  gridCtx.strokeStyle = "rgba(0, 0, 0, 0.1)";
  gridCtx.lineWidth = 1;

  for (let i = 0; i <= canvasSize; i++) {
    gridCtx.beginPath();
    gridCtx.moveTo(i * gridSize, 0);
    gridCtx.lineTo(i * gridSize, gridCanvas.height);
    gridCtx.stroke();
    gridCtx.beginPath();
    gridCtx.moveTo(0, i * gridSize);
    gridCtx.lineTo(gridCanvas.width, i * gridSize);
    gridCtx.stroke();
  }
}

// Draws a pixel on the canvas
function drawPixel(x, y) {
  const size = canvas.width / canvasSize;
  ctx.clearRect(x * size, y * size, size, size);
  ctx.fillStyle = color;
  ctx.fillRect(x * size, y * size, size, size);
}

// Gets the index of the clicked pixel on the canvas
function getIndex(x, y) {
  const size = canvas.width / canvasSize;
  return { i: Math.floor(x / size), j: Math.floor(y / size) };
}

// Exports the selected images
function exportImages(listId) {
  const list = document.getElementById(listId);
  const assetContainers = list.getElementsByClassName("asset-container");

  Array.from(assetContainers).forEach((container, index) => {
    const checkbox = container.querySelector(".asset-checkbox");
    if (!checkbox.checked) return;

    const img = container.querySelector(".saved-image");
    setTimeout(() => {
      const link = document.createElement("a");
      link.href = img.src;
      link.download = `asset_${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 100 * index);
  });
}

// Imports images and adds them to the list
function importImages(e, listId) {
  const files = e.target.files;
  const list = document.getElementById(listId);

  // Loop through each file
  for (let i = 0; i < files.length; i++) {
    // Check if the file is an image (PNG or JPEG)
    if (files[i].type === "image/png" || files[i].type === "image/jpeg") {
      const reader = new FileReader();
      reader.onload = (event) => {
        // Create a new image element
        const savedImage = document.createElement("img");
        savedImage.src = event.target.result;
        savedImage.classList.add("saved-image");
        savedImage.addEventListener("click", () => {
          loadSavedImage(savedImage);
        });

        // Create a new checkbox element
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("asset-checkbox");

        // Create a new container for the asset
        const assetContainer = document.createElement("div");
        assetContainer.classList.add("asset-container");
        assetContainer.appendChild(checkbox);
        assetContainer.appendChild(savedImage);
        list.appendChild(assetContainer);

        // Resize the saved image to fit the canvas
        resizeSavedImage(savedImage);
      };
      reader.readAsDataURL(files[i]);
    } else {
      alert("Error: Invalid file format.");
    }
  }
}

// Resizes a saved image to fit the canvas size.
function resizeSavedImage(img) {
  const size = canvasSize * gridSize;
  const ratio = Math.min(size / img.naturalWidth, size / img.naturalHeight);
  img.width = img.naturalWidth * ratio;
  img.height = img.naturalHeight * ratio;
}

// Loads a saved image onto the canvas.
function loadSavedImage(savedImage) {
  const targetSize = canvasSize * gridSize;

  // If the saved image's dimensions match the canvas size, draw the image.
  if (targetSize === savedImage.naturalWidth && targetSize === savedImage.naturalHeight) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(savedImage, 0, 0, savedImage.naturalWidth, savedImage.naturalHeight, 0, 0, targetSize, targetSize);
    displayColors(getColorsInCanvas());
  } else {
    // Calculate the new size of the image to fit the canvas
    const ratio = Math.min(canvas.width / savedImage.naturalWidth, canvas.height / savedImage.naturalHeight);
    const newWidth = savedImage.naturalWidth * ratio;
    const newHeight = savedImage.naturalHeight * ratio;

    // Clear the canvas and draw the resized image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(savedImage, 0, 0, savedImage.naturalWidth, savedImage.naturalHeight, 0, 0, newWidth, newHeight);

    // Display a message about the resizing
    alert(`The image has been resized from the original size (${savedImage.naturalWidth}x${savedImage.naturalHeight}) to fit the canvas size (${newWidth.toFixed(0)}x${newHeight.toFixed(0)}).`);

    displayColors(getColorsInCanvas());
  }
}

// Detects all the unique colors in the canvas.
function getColorsInCanvas() {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const colors = new Set();

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a === 0) continue;

    const color = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
    colors.add(color);
  }

  return Array.from(colors);
}

// Takes an array of colors and displays them under "Colors" in the sidebar.
function displayColors(colors) {
  const colorsList = document.getElementById("colorsList");
  colorsList.innerHTML = "";

  colors.forEach(color => {
      const colorDiv = document.createElement("div");
      colorDiv.style.backgroundColor = color;
      colorDiv.style.width = "20px";
      colorDiv.style.height = "20px";
      colorDiv.style.border = "1px solid #000";
      colorDiv.style.display = "inline-block";
      colorDiv.style.margin = "2px";
      colorDiv.style.cursor = "pointer";
      colorDiv.title = color;
      colorDiv.addEventListener("click", () => {
          // Create and configure the color input
          const input = document.createElement("input");
          input.type = "color";
          input.value = color;
          input.style.position = "absolute";
          input.style.opacity = 0;
          input.style.width = "20px";
          input.style.height = "20px";
          input.style.cursor = "pointer";
          input.addEventListener("change", (e) => {
              // Update the color of the colorDiv and the canvas
              const oldColor = colorDiv.style.backgroundColor;
              const newColor = e.target.value;
              colorDiv.style.backgroundColor = newColor;
              updateColorOnCanvas(oldColor, newColor);
          });

          // Append the color input to the colorDiv and trigger a click event to open the color picker
          colorDiv.appendChild(input);
          input.click();
          input.addEventListener("blur", () => {
              colorDiv.removeChild(input);
          });
      });

      colorsList.appendChild(colorDiv);
  });
}


// Converts an RGBA color string to a hexadecimal color string
function rgbaToHex(rgba) {
  // Extracts the rgba values from the input string
  const parts = rgba.match(/[\d.]+/g);

  // Converts the rgba values to hexadecimal and concatenates the result
  return "#" + parts.slice(0, 3).map((x) => {
      const hex = parseInt(x).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

// Converts a hexadecimal color string to an RGB color string
function hexToRgbA(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgb(${r}, ${g}, ${b})`;
}

// Updates the color of the canvas with the new color
function updateColorOnCanvas(oldColor, newColor) {
  // Get image data from the canvas
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  // Convert colors to hexadecimal and RGB formats
  const oldColorHex = rgbaToHex(oldColor);
  const newColorHex = newColor;
  const newColorRGB = hexToRgbA(newColor);

  // Iterate over the image data to find and replace the old color with the new color
  for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a === 0) continue;

      const currentColorHex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      if (currentColorHex === oldColorHex) {
          const rgba = newColorRGB.match(/[\d.]+/g);
          data[i] = rgba[0];
          data[i + 1] = rgba[1];
          data[i + 2] = rgba[2];
      }
  }

  // Update the canvas with the modified image data
  ctx.putImageData(imgData, 0, 0);
}

// Event listeners and UI interactions

// Update the canvas size when the "Grid Size" dropdown value changes
document.getElementById("gridSize").addEventListener("change", () => {
  updateCanvasSize();
});

// Draw on canvas when mouse button is pressed
canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  const { i, j } = getIndex(e.offsetX, e.offsetY);
  drawPixel(i, j);
});

// Continue drawing on canvas when mouse moves
canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) return;
  const { i, j } = getIndex(e.offsetX, e.offsetY);
  drawPixel(i, j);
});

// Stop drawing when mouse button is released
canvas.addEventListener("mouseup", () => {
  isDrawing = false;
  displayColors(getColorsInCanvas());
});

// Stop drawing when mouse leaves the canvas
canvas.addEventListener("mouseleave", () => {
  isDrawing = false;
});

// Update the current color when the color picker value changes
document.getElementById("colorPicker").addEventListener("input", (e) => {
  setColor(e.target.value);
});

// Clear the canvas when the "Clear Canvas" button is clicked
document.getElementById("clearCanvas").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Toggle grid visibility when the "Toggle Grid" button is clicked
document.getElementById("toggleGrid").addEventListener("click", () => {
  isGridVisible = !isGridVisible;
  drawGrid();
});

// Save the current canvas as an asset when the "Save Asset" button is clicked
document.getElementById("saveAsset").addEventListener("click", () => {
  // Get the assets list container
  const list = document.getElementById("assetsList");

  // Create an image element for the saved asset
  const img = document.createElement("img");
  img.src = canvas.toDataURL();
  img.classList.add("saved-image");
  resizeSavedImage(img);

  // Add an event listener to load the saved asset when clicked
  img.addEventListener("click", () => {
      loadSavedImage(img);
  });

  // Create a checkbox element for the saved asset
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("asset-checkbox");

  // Create an asset container and append the checkbox and image elements
  const assetContainer = document.createElement("div");
  assetContainer.classList.add("asset-container");
  assetContainer.appendChild(checkbox);
  assetContainer.appendChild(img);
  list.appendChild(assetContainer);
});

// Update the canvas size when the "Canvas Size" dropdown value changes
document.getElementById("canvasSize").addEventListener("change", (e) => {
  updateCanvasSize();
});

// Export assets when the "Export Assets" button is clicked
document.getElementById("exportAssets").addEventListener("click", () => {
  exportImages("assetsList");
});

// Import assets when the "Import Assets" input changes
document.getElementById("importAssets").addEventListener("change", (e) => {
  importImages(e, "assetsList");
});

// Resize all saved images in the assets list
function resizeAllSavedImages() {
  const savedImages = document.querySelectorAll(".saved-image");
  savedImages.forEach((img) => {
      resizeSavedImage(img);
  });
}

// Resize all saved images when the window loads
window.onload = () => {
  resizeAllSavedImages();
};

// Draw the initial grid on the canvas
drawGrid();
