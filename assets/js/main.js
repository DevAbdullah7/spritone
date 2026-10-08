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

// ==========================================
// 1. Freeze Manager (نظام التجميد الموحد)
// ==========================================
const FreezeManager = {
    scrollPosition: 0,
    lockCount: 0,

    freeze() {
        if (this.lockCount === 0) {
            // حفظ موقع السكرول عند أول طلب تجميد
            this.scrollPosition = window.scrollY;
            document.body.style.top = `-${this.scrollPosition}px`;
            document.body.classList.add('freez');
        }
        this.lockCount++;
    },

    unfreeze() {
        if (this.lockCount > 0) {
            this.lockCount--;
        }

        // إرجاع التمرير فقط عند انتهاء كافة الطلبات
        if (this.lockCount === 0) {
            document.body.classList.remove('freez');
            document.body.style.top = '';
            window.scrollTo(0, this.scrollPosition);
        }
    }
};

// ==========================================
// 2. Loading Controller (إدارة اللودينج)
// ==========================================
let loadingStartTime = 0;

function showLoading() {
    loadingStartTime = performance.now(); // تسجيل وقت البداية
    FreezeManager.freeze();
    document.documentElement.classList.add('loading');
    console.log('⏳ Loading started...');
}

function hideLoading() {
    document.documentElement.classList.remove('loading');
    FreezeManager.unfreeze();
    
    // حساب الوقت المستغرق بالثواني
    const durationInSeconds = ((performance.now() - loadingStartTime) / 1000).toFixed(2);
    
    console.log(`✅ Loading finished in ${durationInSeconds} seconds.`);
}

function runWithLoadingIfNeeded(targetCount, actionTask) {
    if (targetCount >= 100) {
        showLoading();
        requestAnimationFrame(() => {
            setTimeout(async () => {
                try {
                    await actionTask();
                } finally {
                    hideLoading();
                }
            }, 10);
        });
    } else {
        actionTask();
    }
}

// ==========================================
// 3. Navbar Setup (إدارة القائمة المنسدلة)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelectorAll('.nav-links a, .BTN');

    if (!navbar || !menuToggle) return;

    function toggleMenu() {
        const isOpen = navbar.classList.contains('is-open');

        if (!isOpen) {
            FreezeManager.freeze();
            navbar.classList.add('is-open');
        } else {
            navbar.classList.remove('is-open');
            FreezeManager.unfreeze();
        }
    }

    menuToggle.addEventListener('click', toggleMenu);

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            if (navbar.classList.contains('is-open')) {
                toggleMenu();
            }
            link.classList.add('active');
        });
    });
});