const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const iconsList = document.getElementById('iconsList');
const output = document.getElementById('output');
const count = document.getElementById('count');
const cleanSuffixesToggle = document.getElementById('cleanSuffixesToggle');

let icons = [];

const SUFFIXES_REGEX = /\b(outline|sharp|filled|round|twotone)\b/gi;

function isCleanNamesChecked() {
    return cleanSuffixesToggle ? cleanSuffixesToggle.checked : false;
}

function cleanBoundaries(name) {
    return name.replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, '');
}

function extractBaseAndSuffix(fullName) {
    const cleanName = fullName.replace(/\.svg$/i, '').trim().toLowerCase();
    const match = cleanName.match(/^(.*?)(?:[_-]?(outline|sharp|filled|round|twotone))?$/i);
    
    if (match) {
        const base = cleanBoundaries(match[1] || cleanName);
        const suffix = match[2] ? match[2].toLowerCase() : null;
        return { base, suffix };
    }
    
    return { base: cleanBoundaries(cleanName), suffix: null };
}

function computeIconId(icon, allIcons = [], currentIndex = -1) {
    if (icon.customId) {
        return icon.customId;
    }

    const originalInfo = extractBaseAndSuffix(icon.originalId);
    const activeBase = icon.customBaseId ? icon.customBaseId : originalInfo.base;
    
    if (isCleanNamesChecked()) {
        if (!originalInfo.suffix) {
            return activeBase;
        }

        const candidateBase = activeBase;
        const willCauseDuplicate = allIcons.some((otherIcon, idx) => {
            if (idx === currentIndex) return false;
            
            const otherInfo = extractBaseAndSuffix(otherIcon.originalId);
            const otherActiveBase = otherIcon.customBaseId || otherInfo.base;
            return (otherIcon.id === candidateBase || otherActiveBase === candidateBase);
        });

        if (willCauseDuplicate) {
            return cleanBoundaries(`${activeBase}-${originalInfo.suffix}`);
        }

        return candidateBase;
    }

    if (originalInfo.suffix) {
        return cleanBoundaries(`${activeBase}-${originalInfo.suffix}`);
    }

    return activeBase;
}

if (cleanSuffixesToggle) {
    cleanSuffixesToggle.addEventListener('change', () => {
        runWithLoadingIfNeeded(icons.length, () => {
            icons.forEach((icon, index) => {
                icon.id = computeIconId(icon, icons, index);
            });
            renderIcons();
            generateSprite();
        });
    });
}

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

    const totalCountAfterUpload = icons.length + fileList.length;
    const shouldShowLoading = totalCountAfterUpload >= 100;

    if (shouldShowLoading) {
        showLoading();
    }

    setTimeout(async () => {
        try {
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

                        const originalId = file.name;
                        
                        resolve({ 
                            originalId, 
                            customBaseId: null,
                            customId: null,
                            content 
                        });
                    };

                    reader.readAsText(file);
                });
            });

            const results = await Promise.all(readTasks);
            const validFiles = results.filter(item => item !== null);

            let addedAny = false;
            validFiles.forEach(item => {
                const tempIconsList = [...icons];
                item.id = computeIconId(item, tempIconsList, -1);

                const isDuplicate = icons.some(icon => icon.id === item.id || icon.content.trim() === item.content.trim());
                if (!isDuplicate) {
                    icons.push(item);
                    addedAny = true;
                }
            });

            if (addedAny) {
                icons.forEach((icon, idx) => {
                    icon.id = computeIconId(icon, icons, idx);
                });
                renderIcons();
                generateSprite();
            }
        } finally {
            if (shouldShowLoading) {
                hideLoading();
            }
        }
    }, shouldShowLoading ? 10 : 0);
}

function checkScroll() {
    const hasScroll = iconsList.scrollHeight > iconsList.clientHeight;
    if (hasScroll) {
        iconsList.classList.add('has-scroll');
    } else {
        iconsList.classList.remove('has-scroll');
    }
}

function renderIcons(onComplete) {
    iconsList.innerHTML = '';
    iconsList.style = 'justify-content: start;';

    if (icons.length === 0) {
        iconsList.innerHTML = `
            <svg class="icon-remove" width="48" height="48" style="color: #919191;">
                <use xlink:href="/assets/icons/sprites/icons.svg#image"></use>
            </svg>
            <p class="orderMSG">Generate Your Icons Sprite Now !</p>
        `;
        iconsList.style = 'justify-content: center;';
        iconsList.parentElement.querySelector('.icons-controlling').style = 'opacity: 0; height: 0;';
        count.textContent = '0';
        checkScroll();
        if (onComplete) onComplete();
        return;
    }

    iconsList.parentNode.classList.add('active');
    count.textContent = `${icons.length}`;

    const chunkSize = 250; 
    let currentIndex = 0;

    function renderChunk() {
        let chunkHtml = '';
        const end = Math.min(currentIndex + chunkSize, icons.length);

        for (let i = currentIndex; i < end; i++) {
            const icon = icons[i];
            chunkHtml += `
                <div class="icon-container">
                    <div class="icon-viewer">
                        ${icon.content}
                    </div>
                    <p class="icon-name" title="${icon.id}">${icon.id}.svg</p>
                    <div class="input buttonInp statusInp edit-icon-name" style="display: none;" Status="">
                        <div class="inputContainer">
                            <input 
                                type="text" 
                                name="icon-name" 
                                placeholder="Enter Icon Name" 
                                oninput="inputHandlling(this), this.value = this.value.replace(/[^a-zA-Z0-9\\s-]/g, '')"
                            >
                            <div class="inputIcon" id="resetIconName" title="Reset Icon Name">
                                <svg width="24" height="24">
                                    <use href="/assets/icons/sprites/icons.svg#refresh"></use>
                                </svg>
                            </div>
                        </div>
                        <span class="inputMSG"></span>
                    </div>
                    <div class="action-call-buttons">
                        <div class="BTN Edit-BTN" title="Edit Icon Name" onclick="editIconName(this, ${i})">
                            <svg width="24" height="24">
                                <use href="/assets/icons/sprites/icons.svg#pencel"></use>
                            </svg>
                        </div>
                        <svg class="icon-remove" width="16" height="16" onclick="removeIcon(${i})">
                            <use xlink:href="/assets/icons/sprites/icons.svg#remove"></use>
                        </svg>
                    </div>
                </div>
            `;
        }

        iconsList.insertAdjacentHTML('beforeend', chunkHtml);
        currentIndex = end;

        if (currentIndex < icons.length) {
            requestAnimationFrame(renderChunk);
        } else {
            iconsList.parentElement.querySelector('.icons-controlling').style = 'opacity: 1; height: unset;';
            checkScroll();
            if (onComplete) onComplete();
        }
    }

    renderChunk();
}

function editIconName(btn, index) {
    const iconContainer = btn.parentNode.parentNode;
    const inputWrapper = btn.parentNode.parentNode.querySelector('.input');
    const inputElement = inputWrapper.querySelector('input');

    const isThereIconEditing = iconContainer.parentNode.querySelector('.icon-container.editing');
    if (isThereIconEditing) {
        isThereIconEditing.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
        isThereIconEditing.querySelector('input').focus();
        return;
    }

    iconContainer.classList.toggle('editing');

    inputWrapper.style.display = 'block';
    inputElement.value = icons[index].id;
    inputElement.focus();

    btn.innerHTML = `
        <svg width="24" height="24">
            <use xlink:href="/assets/icons/sprites/icons.svg#checkmark"></use>
        </svg>
    `;

    btn.onclick = (e) => {
        e.stopPropagation();
        updateIconName(index, btn, inputElement.value);
    };

    inputElement.onkeydown = (e) => {
        if (e.key === 'Enter') {
            updateIconName(index, btn, inputElement.value);
        }
    };

    const resetBtn = iconContainer.querySelector('#resetIconName');
    if (resetBtn) {
        resetBtn.onclick = (e) => {
            e.stopPropagation();
            inputElement.value = icons[index].id;
            inputElement.focus();
            iconContainer.querySelector('.input').setAttribute('Status', '');
            iconContainer.querySelector('.input .inputMSG').innerHTML = ``;
        };
    }
}

function updateIconName(index, btn, newName) {
    if (!newName) return;

    const cleanedNewName = cleanBoundaries(
        newName
            .replace(/\.svg$/i, '')
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
    );

    if (!cleanedNewName) return;

    const newInfo = extractBaseAndSuffix(cleanedNewName);
    const originalInfo = extractBaseAndSuffix(icons[index].originalId);

    let tempCustomId = null;
    let tempCustomBaseId = null;

    if (isCleanNamesChecked() && newInfo.suffix) {
        tempCustomId = cleanedNewName;
    } 
    else if (!isCleanNamesChecked() && originalInfo.suffix && !newInfo.suffix) {
        tempCustomId = cleanedNewName;
    } 
    else {
        if (newInfo.base !== originalInfo.base) {
            tempCustomBaseId = newInfo.base;
        }
    }

    const tempIcon = { ...icons[index], customBaseId: tempCustomBaseId, customId: tempCustomId };
    const calculatedId = computeIconId(tempIcon, icons, index);

    const isDuplicate = icons.some((icon, i) => i !== index && icon.id === calculatedId);
    if (isDuplicate) {
        const inputWrapper = btn.parentNode.parentNode.parentNode.querySelector('.icon-container.editing .input');
        if (inputWrapper) {
            inputWrapper.setAttribute('Status', 'error');
            const msgEl = inputWrapper.querySelector('.inputMSG');
            if (msgEl) msgEl.innerHTML = `This Name is Duplicated !`;
        }
        return;
    }

    runWithLoadingIfNeeded(icons.length, () => {
        icons[index].customId = tempCustomId;
        icons[index].customBaseId = tempCustomBaseId;
        icons[index].id = calculatedId;

        renderIcons();
        generateSprite();
    });
}

function removeIcon(i) {
    runWithLoadingIfNeeded(icons.length, () => {
        icons.splice(i, 1);
        if (!icons.length > 0) {
            clearSprite();
            return;
        }
        renderIcons();
        generateSprite();
    });
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
            requestAnimationFrame(() => {
                Prism.highlightElement(output);
            });
        }
    } else {
        output.textContent = '';
    }
}

function clearSprite() {
    icons = [];
    output.textContent = '';
    iconsList.parentNode.classList.remove('active');
    renderIcons();
}

function downloadSprite() {
    const content = output.textContent;

    if (!content.trim()) return;

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