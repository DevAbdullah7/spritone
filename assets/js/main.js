// Caching Daynamic
const cacheItems = document.querySelectorAll('.cacheItem')
cacheItems.forEach(item => {
    if (item.src !== undefined) {
        item.src = item.src + cacheVersion
    } else if (item.href !== undefined) {
        item.href = item.href + cacheVersion
    } else if (item.content !== undefined) {
        item.content = item.content + cacheVersion
    } else {
        console.log(item)
    }
})

// Navbar 
const navbar = document.getElementById('navbar');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.querySelectorAll('.nav-links a, .btn-contact');

// فتح وإغلاق الناف بار عند النقر على الأيقونة
menuToggle.addEventListener('click', () => {
    navbar.classList.toggle('is-open');
});

// إغلاق الناف بار عند النقر على أي رابط داخلي (لتجربة أفضل للمستخدم)
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (navbar.classList.contains('is-open')) {
            navbar.classList.remove('is-open');
        }
    });
});