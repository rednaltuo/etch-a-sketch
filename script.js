const colorInput = document.querySelector('input[type=color]');
const colorPickerDiv = document.querySelector('.color-picker');

colorInput.addEventListener('input', () => {
    colorPickerDiv.style.backgroundColor = colorInput.value;
});

colorPickerDiv.addEventListener('click', () => {
    console.log(colorInput.click());
});