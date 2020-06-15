
window.addEventListener("load", getBirthday());


function getBirthday() {

    var hoy = new Date();
    var cumpleanos = new Date("1996/12/27 0:00:00");
    var edad = hoy.getFullYear() - cumpleanos.getFullYear();
    var m = hoy.getMonth() - cumpleanos.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
        edad--;
    }
    var elemento = document.getElementById("date").innerHTML = edad
    var elemento = document.getElementById("date2").innerHTML = edad


}


function change(exe) {

    if (exe.id == "btnIngles") {
        document.getElementById("spanish").style.display = "none";
        document.getElementById("english").style.display = "block";
    }
    if (exe.id == "btnSpanish") {
        document.getElementById("english").style.display = "none";
        document.getElementById("spanish").style.display = "block";
    }

}
