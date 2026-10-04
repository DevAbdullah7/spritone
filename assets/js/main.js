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
    
    let scrollPosition = 0;

    function toggleMenu() {
      const isOpen = navbar.classList.contains('is-open');

      if (!isOpen) {
        // 1. حفظ موضع السكرول الحالي قبل الفتح
        scrollPosition = window.scrollY;
        
        // 2. تثبيت البودي في نفس موقعه الظاهر
        document.body.style.top = `-${scrollPosition}px`;
        document.body.classList.add('freez');
        
        navbar.classList.add('is-open');
      } else {
        // 3. إلغاء التثبيت وإعادة السكرول إلى نفس النقطة فوراً
        navbar.classList.remove('is-open');
        document.body.classList.remove('freez');
        document.body.style.top = '';
        window.scrollTo(0, scrollPosition);
      }
    }

    menuToggle.addEventListener('click', toggleMenu);

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (navbar.classList.contains('is-open')) {
          toggleMenu();
        }
      });
    });
