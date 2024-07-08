// JavaScript function untuk efek mengetik
function typeEffect(text, target) {
    var i = 0;
    var speed = 15; // Kecepatan mengetik dalam milidetik

    function typeWriter() {
        if (i < text.length) {
            if (text.charAt(i) === '<') {
                target.innerHTML += "<br>";
                i += 4; // Lompat 4 karakter untuk '<br>'
            } else {
                target.innerHTML += text.charAt(i);
                i++;
            }
            setTimeout(typeWriter, speed);
        }
    }
    typeWriter();
}

// Mengambil teks dari elemen hidden
document.addEventListener("DOMContentLoaded", function() {
    var text = document.getElementById("content").value;
    var target = document.getElementById("output");
    typeEffect(text, target);
});
