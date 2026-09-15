// Scrolling Top Arrow
window.addEventListener('scroll', () => {
    if (document.querySelector('body .main .topArrow')) {
        if (400 < window.scrollY) {
            document.querySelector('body .main .topArrow').classList.add('active')
        } else {
            document.querySelector('body .main .topArrow').classList.remove('active')
        }
    }
})

// Buttons
// Taps Buttons
function tabsButtonHandling(btn) {
    const buttons = btn.parentNode.children
    const Type = btn.attributes.type.value
    for(let i=0; i < buttons.length; i++) {
        buttons[i].classList.remove('active')
    }
    btn.classList.add('active')
    btn.parentNode.setAttribute('Type', Type)
}

// Toggles
function togglesHandelling(toggle) {
    if (toggle.parentNode.classList.contains('active')) {
        toggle.parentNode.classList.remove('active')
    } else {
        toggle.parentNode.classList.add('active')
    }
}

// CheckBoxes
function checkBoxesHandelling(checkBox) {
    if (checkBox.parentNode.classList.contains('active')) {
        checkBox.parentNode.classList.remove('active')
    } else {
        checkBox.parentNode.classList.add('active')
    }
}

// Radios
function radiosHandelling(radio) {
    if (radio.parentNode.classList.contains('active')) {
        radio.parentNode.classList.remove('active')
    } else {
        radio.parentNode.classList.add('active')
    }
}

// Pagination
function paginationNumbersHandelling(number) {
    const numbers = number.parentNode.children
    for (const num of numbers) {
        num.classList.remove('active')
    }
    number.classList.add('active')
}
function prevPaginationNumbers(eleNum, parent) {
    const num = Number(eleNum)
    const parentElements = parent.querySelector('.paginationNumbers').children

    for (const element of parentElements) {
        element.classList.remove('active')

        if ((num - 1) > 0) {
            if (element.innerHTML == (num - 1)) {
                element.classList.add('active')
            }
        } else {
            parentElements[0].classList.add('active')
        }
    }
}
function nextPaginationNumbers(eleNum, parent) {
    const num = Number(eleNum)
    const parentElements = parent.querySelector('.paginationNumbers').children
    const lastElement = parent.querySelector('.paginationNumbers').lastElementChild

    for (const element of parentElements) {
        element.classList.remove('active')

        if ((num + 1) < Number(lastElement.innerHTML)) {
            if (element.innerHTML == (num + 1)) {
                element.classList.add('active')
            }
        } else {
            lastElement.classList.add('active')
        }
    }
}

// Search
function searchInputHandlling(input) {
    if (input.value.length > 0) {
        input.parentNode.classList.add('has-text');
    } else {
        input.parentNode.classList.remove('has-text');
    }
}

// Taps 
// Frist Design
function tapsHandlling(tap) {
    if (tap.parentNode.classList.contains('active')) {
        tap.parentNode.classList.remove('active')
    } else {
        tap.parentNode.classList.add('active')
    }
}

// Second Design
function tapHandlling(control) {
    const tapControls = control.parentNode.querySelectorAll('.control')
    const tapStages = control.parentNode.parentNode.querySelector('.tapContent').querySelectorAll('.tap')

    const tapStage = control.getAttribute('tap')
    
    tapControls.forEach(control => {
        control.classList.remove('active')
    });
    control.classList.add('active')

    tapStages.forEach(item => {
        item.classList.remove('active')

        if (item.getAttribute('tap') == tapStage) {
            item.classList.add('active')
        }
    })
}

// Password Handlling
function passwordInpHandlling(passToggle) {
    const passwordInput = passToggle.parentNode.firstElementChild;

    // Showen Password
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);

    // Changing password hiding icon
    if (type == 'password') {
        passToggle.querySelector('use').setAttribute('xlink:href', '/assets/icons.svg#eye')
    } else if (type == 'text') {
        passToggle.querySelector('use').setAttribute('xlink:href', '/assets/icons.svg#eye-off')
    }
}

// Inputs Handlling
function inputHandlling(input) {
    if (input.value.length > 0) {
        input.classList.add('has-text');
    } else {
        input.classList.remove('has-text');
    }
}

// Color Input
function colorInputHandlling(input) {
    const colorPicker = input.parentNode.querySelector("input[type='color']");
    const colorText = input.parentNode.querySelector("input[type='text']");

    // Putting Color Value By Text
    if (input.type == "text") {
        if(/^#([0-9A-F]{3}){1,2}$/i.test(colorText.value)){
            colorPicker.value = colorText.value;
        }
    }

    // Putting Color Value By Color Pick
    if (input.type == "color") {
        colorText.value = colorPicker.value;
    }
}

// Image Input
function imageInputHandlling(input) {
    const file = input.files[0];

    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
    const allowedExt = ["png","jpg","jpeg","svg"];

    if (!allowedTypes.includes(file.type) || !allowedExt.includes(ext)) {
        input.value = "";
        input.parentNode.querySelector('.inputMSG').innerHTML = `<span style="color: #ff0000;">Upload An Image !</span>`
        input.parentNode.querySelector('.inputFeild').classList.add('error')
        return;
    }

    input.parentNode.querySelector('.inputFeild').classList.remove('error')
    input.parentNode.querySelector('.inputMSG').innerHTML = `
    ${file.name}
    <svg width="12" height="12" class="cleaner" onclick="imageInputCleaner(this.parentNode.parentNode.querySelector('input'))">
        <use xlink:href="/assets/icons.svg#remove"></use>
    </svg>
    `;
    input.classList.add('has-text')
}
function imageInputCleaner(input) {
    input.value = "";
    input.parentNode.querySelector('.inputMSG').innerHTML = `<span style="color: #ff0000;">*</span>File Supported: .png .jpg .jpeg .svg`
    input.classList.remove('has-text')
}

// calendars
function updateCalendar(calendar) {
    const monthYearElement = calendar.querySelector('.header .monthYear')
    const datesElement = calendar.querySelector('.dates')
    
    // calendar Time Handling, this should be discussing with the team.
    let currentDate = ''
    if (calendar.attributes.calTime.value <= 0) {
        currentDate = new Date()
    } else {
        currentDate = new Date(calendar.attributes.calTime.value)
    }

    // set the date input default value by today date as default value
    if (calendar.parentNode.classList.contains('input')) {
        const dateInput = calendar.parentNode.querySelector('input[type=date]')
        if (dateInput.value == "") {
            const theDay = String(currentDate.getDate()).length < 2 ? `0${currentDate.getDate()}` : String(currentDate.getDate())
            const theMonth = String(currentDate.getMonth()+1).length < 2 ? `0${currentDate.getMonth()+1}` : String(currentDate.getMonth()+1)
            const theYear = String(currentDate.getFullYear());
            const inputValue = theDay + "-" + theMonth + "-" + theYear;
            const parts = inputValue.split('-');
            const formattedValue = `${parts[2]}-${parts[1]}-${parts[0]}`;
            dateInput.value = formattedValue
        }
    }
    

    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()
    const fristDay = new Date(currentYear, currentMonth, 0)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const totalDayes = lastDay.getDate()
    const fristDayIndex = fristDay.getDay()
    const lastDayIndex = lastDay.getDay()

    const monthYearString = currentDate.toLocaleString('default', {month: 'long', year: 'numeric'})
    monthYearElement.textContent = monthYearString

    let datesHTML = ''

    for(let i = fristDayIndex; i > 0; i--) {
        const prevDate = new Date(currentYear, currentMonth, 0 - i + 1)
        datesHTML += `<div class="date inactive" onclick="
        if (this.parentNode.parentNode.parentNode.classList.contains('input')) {
            if (String(${currentMonth}).length < 2) {
                if (String(${prevDate.getDate()}).length < 2) {
                    this.parentNode.parentNode.parentNode.children[1].children[0].value = String(${currentYear}) + '-' + 0 + String(${currentMonth}) + '-' + 0 + String(${prevDate.getDate()})
                } else {
                    this.parentNode.parentNode.parentNode.children[1].children[0].value = String(${currentYear}) + '-' + 0 + String(${currentMonth}) + '-' + String(${prevDate.getDate()})
                }
            } else {
                if (String(${prevDate.getDate()}).length < 2) {
                    this.parentNode.parentNode.parentNode.children[1].children[0].value = String(${currentYear}) + '-' + String(${currentMonth}) + '-' + 0 + String(${prevDate.getDate()})
                } else {
                    this.parentNode.parentNode.parentNode.children[1].children[0].value = String(${currentYear}) + '-' + String(${currentMonth}) + '-' + String(${prevDate.getDate()})
                }
            }
            this.parentNode.parentNode.classList.add('picked')
            this.parentNode.parentNode.classList.remove('active')
        } else {
            
        }
        ">${prevDate.getDate()}</div>`
    }

    for(let i = 1; i <= totalDayes; i++) {
        const date = new Date(currentYear, currentMonth, i)
        const activeClass = date.toDateString() === new Date().toDateString() ? 'active' : ''

        datesHTML += `<div class="date ${activeClass}" onclick="
        if (this.parentNode.parentNode.parentNode.classList.contains('input')) {
            if (String(${currentMonth + 1}).length < 2) {
                if (String(${i}).length < 2) {
                    this.parentNode.parentNode.parentNode.children[1].children[0].value = String(${currentYear}) + '-' + 0 + String(${currentMonth + 1}) + '-' + 0 + String(${i})
                } else {
                    this.parentNode.parentNode.parentNode.children[1].children[0].value = String(${currentYear}) + '-' + 0 + String(${currentMonth + 1}) + '-' + String(${i})
                }
            } else {
                if (String(${i}).length < 2) {
                    this.parentNode.parentNode.parentNode.children[1].children[0].value = String(${currentYear}) + '-' + String(${currentMonth + 1}) + '-' + 0 + String(${i})
                } else {
                    this.parentNode.parentNode.parentNode.children[1].children[0].value = String(${currentYear}) + '-' + String(${currentMonth + 1}) + '-' + String(${i})
                }
            }
            this.parentNode.parentNode.classList.add('picked')
            this.parentNode.parentNode.classList.remove('active')
        } else {
            
        }
        ">${i}</div>`
    }

    for(let i = 1; i <= 7 - lastDayIndex; i++) {
        const nextDate = new Date(currentYear, currentMonth + 1, i)

        datesHTML += `<div class="date inactive" onclick="
        if (this.parentNode.parentNode.parentNode.classList.contains('input')) {
            if (String(${currentMonth + 2}).length < 2) {
                if (String(${nextDate.getDate()}).length < 2) {
                    this.parentNode.parentNode.parentNode.children[1].children[0].value = String(${currentYear}) + '-' + 0 + String(${currentMonth + 2}) + '-' + 0 + String(${nextDate.getDate()})
                } else {
                    this.parentNode.parentNode.parentNode.children[1].children[0].value = String(${currentYear}) + '-' + 0 + String(${currentMonth + 2}) + '-' + String(${nextDate.getDate()})
                }
            } else {
                if (String(${nextDate.getDate()}).length < 2) {
                    this.parentNode.parentNode.parentNode.children[1].children[0].value = String(${currentYear}) + '-' + String(${currentMonth + 2}) + '-' + 0 + String(${nextDate.getDate()})
                } else {
                    this.parentNode.parentNode.parentNode.children[1].children[0].value = String(${currentYear}) + '-' + String(${currentMonth + 2}) + '-' + String(${nextDate.getDate()})
                }
            }
            this.parentNode.parentNode.classList.add('picked')
            this.parentNode.parentNode.classList.remove('active')
        } else {
            
        }
        ">${nextDate.getDate()}</div>`
    }

    datesElement.innerHTML = datesHTML
    calendar.setAttribute('calTime', currentDate)
}
// Run calendars
window.addEventListener('load', () => {
    const calendars = document.querySelectorAll('.calendar')
    for (const calendar of calendars) {
        updateCalendar(calendar)
    }
})

// Copy Elements Functionality
function copyElement(ele) {
    const code = ele.parentNode.querySelector('pre')
    const range = document.createRange();
    range.selectNodeContents(code);
    if (!range.commonAncestorContainer.childElementCount > 0) return;
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    navigator.clipboard.writeText(selection);
    ele.classList.add('copied')
    ele.innerHTML = `
    <svg width="20" height="20">
        <use xlink:href="/assets/icons/sprites/icons.svg#checkmark"></use>
    </svg>
    `
    setTimeout(() => {
        ele.classList.remove('copied')
        ele.innerHTML = `
        <svg width="18" height="18">
            <use xlink:href="/assets/icons/sprites/icons.svg#copy"></use>
        </svg>
        `
        selection.removeRange(range);
    }, 500);
}

// Side Panel Links Handlling
function sidePanelLinksHandlling(link) {
    const links = document.querySelectorAll('.sidePanel .item')
    for (const link of links) {
        link.classList.remove('active')
    }
    link.classList.add('active')
    document.querySelector('.sidePanel').classList.remove('active')
}

// ========== Icons Factionality ==========
// Get & Print Icons in Icons Section
const basePath = window.location.origin + '/assets/icons/sprites/';

fetch('/assets/icons/sprites/mainfest.json')
    .then(res => res.json())
    .then(files => {
        files.forEach(file => {
            // الكائن ينظف ./ تلقائياً ويحل المسار الكامل
            const fullUrl = new URL(file, basePath);
            const filePath = fullUrl.pathname; // ينتج: /assets/icons/sprites/icons.svg
            
            // استخراج اسم الملف بدون امتداد
            const fileName = filePath.split('/').pop().replace('.svg', '');

            loadSprite(filePath, fileName);
        });
    });

function loadSprite(filePath, fileName) {
    fetch(filePath)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.text()
        })
        .then(data => {
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(data, 'image/svg+xml');
            const icons = svgDoc.querySelectorAll('symbol');

            if (icons.length === 0) return;

            const container = document.querySelector('#Icons .icons-viewer');

            const sprite = document.createElement('div');
            sprite.className = `part sprite ${fileName}`

            const sectionTitle = document.createElement('div');
            sectionTitle.className = 'partTitle';
            sectionTitle.innerHTML = `
                ${fileName} :

                <div class="BTN Primary-BTN" onclick="iconsShowAll(this)">
                    Show All
                </div>
            `;
            sprite.appendChild(sectionTitle)

            const iconsFragment = document.createDocumentFragment();
            icons.forEach(icon => {
                const iconId = icon.id;
                if (!iconId) return;

                const card = document.createElement('div');
                card.className = 'iconContainer';
                card.innerHTML = `
                    <div class="icon" id="${iconId}" onclick="copyIcon(this)">
                        <svg width="24" height="24">
                            <use xlink:href="${filePath}#${iconId}"></use>
                        </svg>
                    </div>
                    <p class="p-xxs">${iconId}</p>
                `;
                iconsFragment.appendChild(card);
            });
            const iconsContainer = document.createElement('div')
            iconsContainer.className = 'partContent'
            iconsContainer.appendChild(iconsFragment)
            sprite.appendChild(iconsContainer)

            container.appendChild(sprite);
        })
        .catch(err => {
            // console.error(`[Sprite Loader Error]: Failed to fetch ${fileName}`, err);

            const container = document.querySelector('#Icons .icons-viewer');
            if (!container) return;

            const errorNotice = document.createElement('div');
            errorNotice.className = 'part sprite-error';
            errorNotice.innerHTML = `
                <h3 class="partTitle">${fileName} :</h3>
                <div class="partContent error">
                    <svg width="48" height="48">
                        <use xlink:href="../assets/icons/sprites/icons.svg#warning"></use>
                    </svg>

                    Error: Failed to Fetch Icons !
                </div>
            `;

            container.appendChild(errorNotice);
        })
}

// Show All Icons or Less
function iconsShowAll(Btn) {
    const Button = Btn;
    const iconsContainer = Button.parentNode.parentNode.querySelector('.partContent');
    iconsContainer.classList.toggle('opend')

    if (iconsContainer.classList.contains('opend')) {
        Button.textContent = 'Hide'
    } else {
        Button.textContent = 'Show All'
    }

}

// Search about icon in design system
if (document.querySelector('.section#Icons .searchHeader input')) {
    document.querySelector('.section#Icons .searchHeader input').addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            document.querySelector('.section#Icons .searchHeader .Icon-BTN').click()
        }
    })
}
function iconsSearch(searchInput) {
    const searchValue = searchInput.value
    const icons = document.querySelectorAll('.section#Icons .icon')
    const searchResult = document.querySelector('.section#Icons .searchHeader .searchResult')
    let matches = []
    // if (searchValue == '') return;

    icons.forEach(icon => {
        icon.parentNode.classList.remove('hidden')
        if (icon.id.includes(searchValue)) {
            matches.push(icon)
        } else {
            icon.parentNode.classList.add('hidden')
        }
    })

    if (matches.length == 0) {
        icons.forEach(icon => {
            icon.parentNode.classList.remove('hidden')
        })
        searchInput.value = ''
        searchInput.classList.remove('has-text')
        if (!searchValue == '') {
            searchResult.innerHTML = `
                <svg width="48" height="48">
                    <use xlink:href="../assets/icons/sprites/icons.svg#warning"></use>
                </svg>

                The Icon is not Found, or It's Just not Added Yet.
            `
            setTimeout(() => {
                searchResult.innerHTML = ''
            }, 1500)
        }
    } else {
        matches.forEach(icon => {
            icon.parentNode.classList.remove('hidden')
        })
        searchResult.innerHTML = ''
    }
}

// Copy Icon
function copyIcon(icon) {
    const iconHref = icon.querySelector('use').href['baseVal']
    const iconCode = `<svg width="24" height="24">
    <use xlink:href="${iconHref}"></use>
</svg>`
    navigator.clipboard.writeText(iconCode);

    icon.classList.add('copied')
    setTimeout(() => {
        icon.classList.remove('copied')
        const searchInput = document.querySelector('.section#Icons .searchHeader input')
        const icons = document.querySelectorAll('.section#Icons .iconsContainer .icon')
        const searchResult = document.querySelector('.section#Icons .searchHeader .searchResult')
        icons.forEach(icon => {
            icon.parentNode.classList.remove('hidden')
        })
        searchInput.value = ''
        searchInput.classList.remove('has-text')
        searchResult.innerHTML = ''
    }, 750);

}