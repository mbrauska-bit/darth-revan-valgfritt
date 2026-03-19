document.querySelectorAll(".game-img").forEach(img =>   {
    img.addEventListener("click",()=>{
        img.classList.add("clicked");
        setTimeout(() => {
            window.location.href = img.dataset.link;
        });
    });
});
