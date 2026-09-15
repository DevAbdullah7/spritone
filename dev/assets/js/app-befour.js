const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const iconsList = document.getElementById('iconsList');
const output = document.getElementById('output');
const count = document.getElementById('count');

let icons = [];

dropZone.addEventListener('click', () => {
    fileInput.value = '';
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
});

function handleFiles(files) {
    [...files].forEach(file => {
        const reader = new FileReader();

        reader.onload = e => {
            let content = e.target.result;

            content = content
                .replace(/<\?xml[^>]*>/g, '')
                .replace(/<!DOCTYPE[^>]*>/g, '')
                .replace(/<!--[\s\S]*?-->/g, '')
                .replace(/xmlns(:\w+)?="[^"]*"/g, '');

            if (!content.includes('<svg')) return;

            // تحويل النص إلى DOM Document لاستخدام querySelectorAll
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, "image/svg+xml");
            const svgNode = doc.querySelector('svg');

            // التاكد من صحة كود الـ SVG
            if (!svgNode || doc.querySelector('parsererror')) return;

            // 1. حساب عدد العناصر الداخلية
            const elementCount = svgNode.querySelectorAll('*').length;

            // 2. التحقق من وجود صور مضمنة
            const hasEmbeddedImages = svgNode.querySelectorAll('image').length > 0;

            // 3. حساب حجم الملف بالكيلوبايت
            const sizeInKB = new Blob([content]).size / 1024;

            // استبعاد الرسوم المعقدة والملفات الضخمة
            const isIllustration = elementCount > 50 || sizeInKB > 45 || hasEmbeddedImages;

            if (isIllustration) return;

            const id = file.name
                .replace('.svg', '')
                .replace(/\s+/g, '-')
                .toLowerCase();

            // فحص التكرار عبر الـ ID أو المحتوى
            const isDuplicate = icons.some(icon => icon.id === id || icon.content.trim() === content.trim());

            if (isDuplicate) return;

            icons.push({ id, content });

            renderIcons();
            generateSprite();
        };

        reader.readAsText(file);
    });
}

function renderIcons() {
    iconsList.innerHTML = '';
    iconsList.style = 'justify-content: start;';

    if (icons.length > 0) {
        icons.forEach((icon, i) => {
            const div = document.createElement('div');
            div.className = 'icon-container';

            // Changing icon color !
            // const prop = icon.content.split(' ')
            // console.log(icon.content)
            // for (const word of prop) {
            //     if (word == "fill") {
                    
            //     }
            // }
            
    
            div.innerHTML = `
                <!-- Icon Symbol -->
                ${icon.content}
                
                <!-- Icon Name -->
                <p class="icon-name">${icon.id}.svg</p>
    
                <!-- Delete Icon -->
                <svg class="icon-remove" width="16" height="16" onclick="removeIcon(${i})">
                    <use xlink:href="./assets/icons.svg#remove"></use>
                </svg>
            `;
    
            generateSprite()
            iconsList.appendChild(div);
            iconsList.parentElement.querySelector('.icons-controlling').style = 'opacity: 1; height: unset;'
        });
    } else {
        iconsList.innerHTML = `
            <svg class="icon-remove" width="48" height="48" style="color: #919191;">
                <use xlink:href="./assets/icons.svg#image"></use>
            </svg>
            <p class="orderMSG">Generate Your Icons Sprite Now !</p>
        `
        iconsList.style = 'justify-content: center;';
        clearSprite()
    }


    count.textContent = `${icons.length}`;
}

function removeIcon(i) {
    icons.splice(i, 1);
    renderIcons();
}

function parseSVG(content) {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, "image/svg+xml");
        const svg = doc.querySelector("svg");

        if (!svg) return null;

        let viewBox = svg.getAttribute("viewBox");

        if (!viewBox) {
            const width = svg.getAttribute("width") || 24;
            const height = svg.getAttribute("height") || 24;
            viewBox = `0 0 ${parseFloat(width)} ${parseFloat(height)}`;
        }

        svg.querySelectorAll('*').forEach(el => {
            el.removeAttribute('xmlns');
            el.removeAttribute('style');
            el.removeAttribute('class');
        
            const fill = el.getAttribute('fill');
            const stroke = el.getAttribute('stroke');
        
            if (stroke) {
                el.setAttribute('stroke', 'currentColor');
        
                if (fill && fill !== 'none') {
                    el.setAttribute('fill', 'currentColor');
                } else {
                    el.removeAttribute('fill');
                }
            }
        
            else {
                el.setAttribute('fill', 'currentColor');
            }
        });

        let inner = svg.innerHTML
            .replace(/xmlns(:\w+)?="[^"]*"/g, '')
            .trim();

        return { viewBox, inner };

    } catch {
        return null;
    }
}

function formatNode(node, level = 2) {
    let indent = '\t'.repeat(level);
    let result = '';

    node.childNodes.forEach(child => {
        if (child.nodeType === 1) {
            const tag = child.tagName.toLowerCase();

            let attrs = '';
            [...child.attributes].forEach(attr => {
                attrs += ` ${attr.name}="${attr.value}"`;
            });

            if (child.children.length === 0) {
                result += `${indent}<${tag}${attrs}/>\n`;
            } else {
                result += `${indent}<${tag}${attrs}>\n`;
                result += formatNode(child, level + 1);
                result += `${indent}</${tag}>\n`;
            }
        }
    });

    return result;
}

function generateSprite() {
    if (icons.length > 0) {
        let sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none;">\n`;
    
        icons.forEach(icon => {
            const parsed = parseSVG(icon.content);
            if (!parsed) return;
    
            const parser = new DOMParser();
            const doc = parser.parseFromString(`<svg>${parsed.inner}</svg>`, "image/svg+xml");
            const svg = doc.querySelector("svg");
    
            sprite += `\t<symbol id="${icon.id}" viewBox="${parsed.viewBox}" fill="none">\n`;
    
            sprite += formatNode(svg, 2);
    
            sprite += `\t</symbol>\n`;
        });
    
        sprite += `</svg>`;
    
        output.parentElement.style.opacity = 1
        output.textContent = sprite;
        Prism.highlightElement(output);
    } else {
        fileInput.click();
        // clearSprite()
    }
}

function clearSprite() {
    icons = [];
    output.parentElement.style.opacity = .25
    output.innerHTML = ''
    iconsList.parentElement.querySelector('.icons-controlling').style = 'opacity: 0; height: 0;'
    renderIcons();
}

function downloadSprite() {
    const content = output.innerText;

    if (!content.trim()) {
        return;
    }

    const blob = new Blob([content], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'icons.svg';
    a.click();

    URL.revokeObjectURL(url);

    setTimeout(() => {
        clearSprite()
    }, 3000)
}

