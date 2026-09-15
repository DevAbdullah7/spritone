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

async function handleFiles(files) {
    const fileList = [...files];
    if (fileList.length === 0) return;

    // قراءة ومعالجة الملفات بالتوازي في الذاكرة أولاً
    const readTasks = fileList.map(file => {
        return new Promise(resolve => {
            const reader = new FileReader();

            reader.onload = e => {
                let content = e.target.result;

                content = content
                    .replace(/<\?xml[^>]*>/g, '')
                    .replace(/<!DOCTYPE[^>]*>/g, '')
                    .replace(/<!--[\s\S]*?-->/g, '')
                    .replace(/xmlns(:\w+)?="[^"]*"/g, '');

                if (!content.includes('<svg')) return resolve(null);

                const parser = new DOMParser();
                const doc = parser.parseFromString(content, "image/svg+xml");
                const svgNode = doc.querySelector('svg');

                if (!svgNode || doc.querySelector('parsererror')) return resolve(null);

                const elementCount = svgNode.querySelectorAll('*').length;
                const hasEmbeddedImages = svgNode.querySelectorAll('image').length > 0;
                const sizeInKB = new Blob([content]).size / 1024;

                const isIllustration = elementCount > 50 || sizeInKB > 45 || hasEmbeddedImages;
                if (isIllustration) return resolve(null);

                const id = file.name
                    .replace(/\.svg$/i, '')
                    .replace(/\s+/g, '-')
                    .toLowerCase();

                resolve({ id, content });
            };

            reader.readAsText(file);
        });
    });

    const results = await Promise.all(readTasks);
    const validFiles = results.filter(item => item !== null);

    let addedAny = false;
    validFiles.forEach(item => {
        const isDuplicate = icons.some(icon => icon.id === item.id || icon.content.trim() === item.content.trim());
        if (!isDuplicate) {
            icons.push(item);
            addedAny = true;
        }
    });

    if (addedAny) {
        renderIcons();
        generateSprite();
    }
}

function renderIcons() {
    iconsList.innerHTML = '';
    iconsList.style = 'justify-content: start;';

    if (icons.length > 0) {
        const fragment = document.createDocumentFragment();

        icons.forEach((icon, i) => {
            const div = document.createElement('div');
            div.className = 'icon-container';

            div.innerHTML = `
                <!-- Icon Symbol -->
                ${icon.content}
                
                <!-- Icon Name -->
                <p class="icon-name" title="${icon.id}">${icon.id}.svg</p>
                
                <!-- Action Call Buttons -->
                <div class="action-call-buttons">
                    <div class="input" style="display: none;">
                        <div class="inputContainer">
                            <input 
                                type="text" 
                                name="icon-name" 
                                placeholder="Enter Icon Name" 
                                oninput="inputHandlling(this), this.value = this.value.replace(/[^a-zA-Z0-9\s-]/g, '')"
                            >
                        </div>
                    </div>

                    <!-- Edit Button -->
                    <div class="BTN Edit-BTN" title="Edit Icon Name" onclick="editIconName(this, ${i})">
                        <svg width="24" height="24">
                            <use href="./assets/icons/sprites/icons.svg#pencel"></use>
                        </svg>
                    </div>

                    <!-- Delete Button -->
                    <svg class="icon-remove" width="16" height="16" onclick="removeIcon(${i})">
                        <use xlink:href="/assets/icons/sprites/icons.svg#remove"></use>
                    </svg>
                </div>
            `;

            fragment.appendChild(div);
        });

        iconsList.appendChild(fragment);
        iconsList.parentElement.querySelector('.icons-controlling').style = 'opacity: 1; height: unset;';
    } else {
        // رسم الواجهة الفارغة فقط لمنع الـ Stack Overflow
        iconsList.innerHTML = `
            <svg class="icon-remove" width="48" height="48" style="color: #919191;">
                <use xlink:href="/assets/icons/sprites/icons.svg#image"></use>
            </svg>
            <p class="orderMSG">Generate Your Icons Sprite Now !</p>
        `;
        iconsList.style = 'justify-content: center;';
        iconsList.parentElement.querySelector('.icons-controlling').style = 'opacity: 0; height: 0;';
    }

    count.textContent = `${icons.length}`;
}

function editIconName(btn, index) {
    const inputWrapper = btn.parentNode.querySelector('.input');
    const inputElement = inputWrapper.querySelector('input');

    inputWrapper.style.display = 'block';
    // inputElement.value = icons[index].id;
    inputElement.focus();

    btn.innerHTML = `
        <svg width="24" height="24">
            <use xlink:href="/assets/icons/sprites/icons.svg#checkmark"></use>
        </svg>
    `;

    btn.onclick = (e) => {
        e.stopPropagation();
        updateIconName(index, inputElement.value);
    };

    inputElement.onkeydown = (e) => {
        if (e.key === 'Enter') {
            updateIconName(index, inputElement.value);
        }
    };
}

function updateIconName(index, newName) {
    if (!newName) return;

    const cleanId = newName
        .replace(/\.svg$/i, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

    if (!cleanId) {
        alert('يرجى إدخال اسم باللغة الإنجليزية فقط (أحرف إنجليزية، أرقام، أو شرطات).');
        renderIcons();
        return;
    }

    const isDuplicate = icons.some((icon, i) => i !== index && icon.id === cleanId);
    if (isDuplicate) {
        alert('هذا الاسم مستخدم بالفعل، اختر اسماً آخر.');
        renderIcons();
        return;
    }

    icons[index].id = cleanId;
    renderIcons();
    generateSprite();
}

function removeIcon(i) {
    icons.splice(i, 1);
    renderIcons();
    generateSprite();
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
            } else {
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
    
        output.textContent = sprite;
        if (window.Prism) {
            Prism.highlightElement(output);
        }
    } else {
        output.textContent = '';
    }
}

function clearSprite() {
    icons = [];
    output.textContent = '';
    renderIcons();
}

function downloadSprite() {
    const content = output.textContent;

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
        clearSprite();
    }, 3000);
}