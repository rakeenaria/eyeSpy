function filterByKabupaten() {
    const kabupaten = document.getElementById('kbptn').value;

    fetch(`php/fungsiCCTV.php?kabupaten=${kabupaten}`)
        .then(response => response.text())
        .then(data => {
            const tempatList = document.getElementById('tempatList');
            tempatList.innerHTML = data;
        })
        .catch(error => console.error('Error:', error));
}
