// TypeScript version of page.js
// Converted to TS with types while keeping exact same behavior
var sidebar = document.querySelector(".sidebar");
var hideBtn = document.getElementById("hide-sidebar");
var showBtn = document.getElementById("show-sidebar");
var insertedImages = new Map();
var faviconFile = { file: null, dataUrl: null };
hideBtn.addEventListener("click", function () {
    sidebar.classList.add("hidden");
});
showBtn.addEventListener("click", function () {
    sidebar.classList.remove("hidden");
});
var elementCounter = 0;
var selectedPlaceholder = null;
function generateId(type) {
    elementCounter++;
    return "".concat(type, "-").concat(elementCounter);
}
document.addEventListener("click", function (e) {
    var target = e.target;
    var placeholder = target.closest(".add-placeholder");
    if (placeholder) {
        if (selectedPlaceholder)
            selectedPlaceholder.classList.remove("selected");
        selectedPlaceholder = placeholder;
        selectedPlaceholder.classList.add("selected");
    }
});
document.getElementById("element-type").addEventListener("change", function () {
    var type = this.value;
    document.getElementById("element-text").style.display =
        type === "text" || type === "title" ? "block" : "none";
    document.getElementById("element-image").style.display =
        type === "image" ? "block" : "none";
    document.getElementById("container-layout").style.display =
        type === "container" ? "block" : "none";
});
document.addEventListener("DOMContentLoaded", buildTree);
function insertElement() {
    if (!selectedPlaceholder) {
        alert("Select a placeholder button inside a block first.");
        return;
    }
    var type = document.getElementById("element-type").value;
    var textVal = document.getElementById("element-text").value;
    var fileInput = document.getElementById("element-image");
    var layout = document.getElementById("container-layout").value;
    var newEl = null;
    switch (type) {
        case "title": {
            var el = document.createElement("h2");
            el.className = "block__title";
            el.id = generateId("title");
            el.textContent = textVal || "New Title";
            newEl = el;
            break;
        }
        case "text": {
            var el = document.createElement("p");
            el.className = "block__text";
            el.id = generateId("text");
            el.textContent = textVal || "New Text";
            newEl = el;
            break;
        }
        case "image": {
            var el_1 = document.createElement("img");
            el_1.className = "block__img";
            el_1.id = generateId("image");
            el_1.alt = "New Image";
            if (fileInput.files && fileInput.files[0]) {
                var file_1 = fileInput.files[0];
                var reader = new FileReader();
                reader.onload = function (e) {
                    el_1.src = e.target.result;
                    insertedImages.set(el_1.id, file_1);
                };
                reader.readAsDataURL(file_1);
            }
            else {
                el_1.src = "img.jpg";
            }
            newEl = el_1;
            break;
        }
        case "container": {
            var el = document.createElement("div");
            el.className = "container";
            el.id = generateId("container");
            var createPlaceholder = function () {
                var btn = document.createElement("button");
                btn.className = "add-placeholder";
                btn.innerHTML = '<img src="add.png" alt="Add">';
                return btn;
            };
            switch (layout) {
                case "single":
                    el.appendChild(createPlaceholder());
                    break;
                case "2-row":
                    el.append(createPlaceholder(), createPlaceholder());
                    break;
                case "3-row":
                    el.append(createPlaceholder(), createPlaceholder(), createPlaceholder());
                    break;
                case "2-col":
                    el.classList.add("vertical");
                    el.append(createPlaceholder(), createPlaceholder());
                    break;
                case "3-col":
                    el.classList.add("vertical");
                    el.append(createPlaceholder(), createPlaceholder(), createPlaceholder());
                    break;
                case "1-2-split": {
                    var left = createPlaceholder();
                    var rightContainer = document.createElement("div");
                    rightContainer.className = "container vertical";
                    rightContainer.id = generateId("container");
                    rightContainer.append(createPlaceholder(), createPlaceholder());
                    el.append(left, rightContainer);
                    break;
                }
                default:
                    el.append(createPlaceholder(), createPlaceholder());
                    break;
            }
            newEl = el;
            break;
        }
    }
    if (newEl) {
        selectedPlaceholder.replaceWith(newEl);
        buildTree();
        selectedPlaceholder = null;
    }
}
function buildTree() {
    var treeRoot = document.getElementById("dom-tree");
    if (!treeRoot)
        return;
    treeRoot.innerHTML = "";
    var mainContent = document.querySelector(".main-content");
    if (!mainContent)
        return;
    function createNode(el, parentUl) {
        var li = document.createElement("li");
        li.dataset.elementId = el.id;
        var header = document.createElement("div");
        header.className = "tree-node";
        var label = document.createElement("button");
        label.textContent = "".concat(el.tagName.toLowerCase(), " (").concat(el.id || "no-id", ")");
        label.onclick = function () {
            if (selectedPlaceholder)
                selectedPlaceholder.classList.remove("selected");
            selectedPlaceholder = el;
            el.classList.add("selected");
        };
        header.appendChild(label);
        li.appendChild(header);
        parentUl.appendChild(li);
        var children = el.querySelectorAll(":scope > [id]");
        if (children.length > 0) {
            var toggle_1 = document.createElement("button");
            toggle_1.className = "tree-toggle";
            header.insertBefore(toggle_1, label);
            var ul_1 = document.createElement("ul");
            li.appendChild(ul_1);
            children.forEach(function (child) { return createNode(child, ul_1); });
            toggle_1.onclick = function () {
                var isOpen = toggle_1.classList.toggle("open");
                ul_1.classList.toggle("hidden", !isOpen);
            };
            ul_1.classList.add("hidden");
        }
    }
    var topLevel = mainContent.querySelectorAll(".top-banner, .block");
    topLevel.forEach(function (el) { return createNode(el, treeRoot); });
}
// Export HTML functionality
var exportBtn = document.getElementById("export-html-btn");
if (exportBtn)
    exportBtn.addEventListener("click", exportPage);
function exportPage() {
    var mainContent = document.body;
    if (!mainContent) {
        alert("No main content found to export.");
        return;
    }
    var clonedContent = mainContent.cloneNode(true);
    clonedContent.querySelectorAll(".add-placeholder").forEach(function (el) { return el.remove(); });
    clonedContent.querySelectorAll(".sidebar").forEach(function (el) { return el.remove(); });
    clonedContent.querySelectorAll(".selected").forEach(function (el) { return el.classList.remove("selected"); });
    // Remove the 'selected' class from the body if it was selected for properties
    clonedContent.classList.remove('selected');
    // Explicitly set the computed background color of the body
    clonedContent.style.backgroundColor = window.getComputedStyle(document.body).backgroundColor;
    // Handle favicon
    var faviconLinkHtml = '';
    var faviconFileName = '';
    var faviconBlobToZip = null;
    var faviconPromise = Promise.resolve(); // Initialize with a resolved promise
    if (faviconFile.file && faviconFile.dataUrl) {
        var ext = faviconFile.file.name.split(".").pop();
        faviconFileName = "favicon.".concat(ext);
        faviconLinkHtml = "<link rel=\"icon\" type=\"".concat(faviconFile.file.type, "\" href=\"").concat(faviconFileName, "\">");
        faviconBlobToZip = faviconFile.file; // Use the uploaded file directly
    }
    else {
        // Check if there's an existing favicon link in the original document
        var existingFavicon = document.querySelector("link[rel~='icon']");
        if (existingFavicon && existingFavicon.href && !existingFavicon.href.startsWith('data:')) {
            var faviconUrl_1 = existingFavicon.href;
            var urlParts = faviconUrl_1.split('/');
            faviconFileName = urlParts[urlParts.length - 1]; // Get filename from URL
            // Try to infer type from URL or default to image/x-icon
            var inferredType = faviconFileName.includes('.') ? "image/".concat(faviconFileName.split('.').pop()) : 'image/x-icon';
            faviconLinkHtml = "<link rel=\"icon\" type=\"".concat(inferredType, "\" href=\"").concat(faviconFileName, "\">");
            faviconPromise = fetch(faviconUrl_1)
                .then(function (res) { return res.blob(); })
                .then(function (blob) {
                faviconBlobToZip = blob;
            })
                .catch(function (error) { return console.error("Failed to fetch existing favicon ".concat(faviconUrl_1, ":"), error); });
        }
    }
    var zip = new JSZip();
    fetch("style.css")
        .then(function (res) { return res.text(); })
        .then(function (cssText) {
        zip.file("style.css", cssText);
        var images = clonedContent.querySelectorAll("img");
        var imgPromises = [];
        // Add the favicon promise to the array of promises to wait for
        imgPromises.push(faviconPromise);
        images.forEach(function (img, i) {
            var file = insertedImages.get(img.id);
            if (file) {
                zip.file("images/img".concat(i, ".").concat(file.name.split(".").pop()), file);
                img.src = "images/img".concat(i, ".").concat(file.name.split(".").pop());
            }
            else if (img.src.startsWith("data:")) {
                var base64Data = img.src.split(",")[1];
                var byteCharacters = atob(base64Data);
                var byteNumbers = new Array(byteCharacters.length);
                for (var j = 0; j < byteCharacters.length; j++) {
                    byteNumbers[j] = byteCharacters.charCodeAt(j);
                }
                var byteArray = new Uint8Array(byteNumbers);
                var blob = new Blob([byteArray], { type: "image/png" });
                zip.file("images/img".concat(i, ".png"), blob);
                img.src = "images/img".concat(i, ".png");
            }
            else {
                // Handle external images or default images
                imgPromises.push(fetch(img.src)
                    .then(function (res) { return res.blob(); })
                    .then(function (blob) {
                    // Try to infer extension, default to png
                    var contentType = blob.type.split('/').pop() || 'png';
                    zip.file("images/img".concat(i, ".").concat(contentType), blob);
                    img.src = "images/img".concat(i, ".").concat(contentType);
                })
                    .catch(function (error) { return console.error("Failed to fetch image ".concat(img.src, ":"), error); }) // Add error handling
                );
            }
        });
        Promise.all(imgPromises).then(function () {
            // Add favicon to zip here, after all fetches are complete
            if (faviconBlobToZip && faviconFileName) {
                zip.file(faviconFileName, faviconBlobToZip);
            }
            // Get the inline style from the cloned body to apply it to the exported body tag
            var bodyStyle = clonedContent.getAttribute('style') || '';
            var finalHtml = "<!DOCTYPE html><html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\" />\n    <link rel=\"stylesheet\" type=\"text/css\" href=\"style.css\">\n    <title>".concat(document.title, "</title>\n    ").concat(faviconLinkHtml, "\n</head>\n<body style=\"").concat(bodyStyle, "\">\n    ").concat(clonedContent.innerHTML, "\n</body>\n</html>");
            zip.file("exported_page.html", finalHtml);
            zip.generateAsync({ type: "blob" }).then(function (content) {
                var a = document.createElement("a");
                a.href = URL.createObjectURL(content);
                a.download = "exported_page.zip";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            });
        });
    });
}
var blockCounter = 3;
var addBlockBtn = document.getElementById("add-block-btn");
if (addBlockBtn) {
    addBlockBtn.addEventListener("click", function () {
        blockCounter++;
        var newBlock = document.createElement("div");
        newBlock.className = "block";
        newBlock.id = "block".concat(blockCounter);
        newBlock.setAttribute("data-id", "block".concat(blockCounter));
        var placeholderBtn = document.createElement("button");
        placeholderBtn.className = "add-placeholder";
        placeholderBtn.innerHTML = '<img src="add.png" alt="Add">';
        newBlock.appendChild(placeholderBtn);
        var mainContent = document.querySelector(".main-content");
        if (mainContent) {
            var division = document.createElement("div");
            division.className = "division";
            mainContent.appendChild(division);
            mainContent.appendChild(newBlock);
        }
        buildTree();
    });
}
// Properties panel code (runs on DOMContentLoaded)
document.addEventListener('DOMContentLoaded', function () {
    var domTree = document.getElementById('dom-tree');
    var propertiesPanel = document.getElementById('element-properties');
    var selectedElementTag = document.getElementById('selected-element-tag');
    var textProperties = document.getElementById('text-properties');
    var genericProperties = document.getElementById('generic-properties');
    var layoutProperties = document.getElementById('layout-properties');
    var imageProperties = document.getElementById('image-properties');
    var pagePropertiesPanel = document.getElementById('page-properties-panel');
    var pageSettingsBtn = document.getElementById('page-settings-btn');
    var pageTitleInput = document.getElementById('page-title-input');
    var pageBgColorInput = document.getElementById('page-bg-color');
    var pageBgColorAlpha = document.getElementById('page-bg-color-alpha');
    var bgColorInput = document.getElementById('bg-color');
    var fontColorInput = document.getElementById('font-color');
    var fontSizeInput = document.getElementById('font-size');
    var deleteButton = document.getElementById('delete-element-btn');
    var elementContentInput = document.getElementById('element-content');
    var justifyContentSelect = document.getElementById('justify-content');
    var alignItemsSelect = document.getElementById('align-items');
    var imageWidthInput = document.getElementById('image-width');
    var imageHeightInput = document.getElementById('image-height');
    var imageFileInput = document.getElementById('image-file-input');
    var pageFaviconInput = document.getElementById('page-favicon-input');
    var textAlignSelect = document.getElementById('text-align');
    var bgColorAlpha = document.getElementById('bg-color-alpha');
    var fontColorAlpha = document.getElementById('font-color-alpha');
    var selectedElement = null;
    var selectedTreeItem = null;
    if (domTree) {
        domTree.addEventListener('click', function (e) {
            var treeItem = e.target.closest('li');
            if (treeItem && treeItem.dataset.elementId) {
                var elementId = treeItem.dataset.elementId;
                var element = document.getElementById(elementId);
                if (element) {
                    if (selectedTreeItem)
                        selectedTreeItem.classList.remove('selected');
                    if (selectedElement)
                        selectedElement.classList.remove('selected');
                    selectedElement = element;
                    selectedTreeItem = treeItem;
                    selectedTreeItem.classList.add('selected');
                    selectedElement.classList.add('selected');
                    showPropertiesPanelFor(selectedElement);
                }
            }
        });
    }
    if (pageSettingsBtn) {
        pageSettingsBtn.addEventListener('click', function () {
            // Deselect any selected element
            if (selectedTreeItem)
                selectedTreeItem.classList.remove('selected');
            if (selectedElement)
                selectedElement.classList.remove('selected');
            selectedElement = null;
            selectedTreeItem = null;
            // Hide element properties and show page properties
            if (propertiesPanel)
                propertiesPanel.style.display = 'block';
            if (selectedElementTag)
                selectedElementTag.textContent = 'Page';
            if (textProperties)
                textProperties.style.display = 'none';
            if (genericProperties)
                genericProperties.style.display = 'none';
            if (layoutProperties)
                layoutProperties.style.display = 'none';
            if (imageProperties)
                imageProperties.style.display = 'none';
            if (pagePropertiesPanel)
                pagePropertiesPanel.style.display = 'block';
            // Populate page properties fields
            if (pageTitleInput)
                pageTitleInput.value = document.title;
            var bodyComputedStyle = window.getComputedStyle(document.body);
            var bodyBgRgba = parseRgba(document.body.style.backgroundColor || bodyComputedStyle.backgroundColor);
            if (pageBgColorInput)
                pageBgColorInput.value = bodyBgRgba.hex;
            if (pageBgColorAlpha)
                pageBgColorAlpha.value = String(bodyBgRgba.alpha);
            var pageBgWrapper = document.getElementById('page-bg-color-wrapper');
            if (pageBgWrapper && pageBgColorInput)
                pageBgWrapper.style.backgroundColor = pageBgColorInput.value;
            // Clear favicon input for new selection
            if (pageFaviconInput)
                pageFaviconInput.value = '';
        });
    }
    function showPropertiesPanelFor(element) {
        var _a;
        if (!propertiesPanel || !selectedElementTag)
            return;
        propertiesPanel.style.display = 'block';
        selectedElementTag.textContent = "".concat(element.tagName.toLowerCase());
        var computedStyle = window.getComputedStyle(element);
        var bgRgba = parseRgba(element.style.backgroundColor || computedStyle.backgroundColor);
        if (bgColorInput)
            bgColorInput.value = bgRgba.hex;
        if (bgColorAlpha)
            bgColorAlpha.value = String(bgRgba.alpha);
        var bgWrapper = document.getElementById('bg-color-wrapper');
        if (bgWrapper && bgColorInput)
            bgWrapper.style.backgroundColor = bgColorInput.value;
        // Show generic properties for elements
        if (genericProperties)
            genericProperties.style.display = 'block';
        // Hide page properties panel when an element is selected
        if (pagePropertiesPanel)
            pagePropertiesPanel.style.display = 'none';
        if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'BUTTON'].includes(element.tagName)) {
            if (textProperties)
                textProperties.style.display = 'block';
            var fontRgba = parseRgba(element.style.color || computedStyle.color);
            if (fontColorInput)
                fontColorInput.value = fontRgba.hex;
            if (fontColorAlpha)
                fontColorAlpha.value = String(fontRgba.alpha);
            if (fontSizeInput)
                fontSizeInput.value = String(parseInt(element.style.fontSize || computedStyle.fontSize, 10));
            var fontWrapper = document.getElementById('font-color-wrapper');
            if (fontWrapper && fontColorInput)
                fontWrapper.style.backgroundColor = fontColorInput.value;
            if (elementContentInput)
                elementContentInput.value = ((_a = element.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
            if (textAlignSelect)
                textAlignSelect.value = element.style.textAlign || computedStyle.textAlign;
        }
        else {
            if (textProperties)
                textProperties.style.display = 'none';
        }
        if (computedStyle.display === 'flex') {
            if (layoutProperties)
                layoutProperties.style.display = 'block';
            if (justifyContentSelect)
                justifyContentSelect.value = element.style.justifyContent || computedStyle.justifyContent;
            if (alignItemsSelect)
                alignItemsSelect.value = element.style.alignItems || computedStyle.alignItems;
        }
        else {
            if (layoutProperties)
                layoutProperties.style.display = 'none';
        }
        if (element.tagName === 'IMG') {
            if (imageProperties)
                imageProperties.style.display = 'block';
            if (imageWidthInput)
                imageWidthInput.value = String(parseInt(element.style.width || computedStyle.width, 10));
            if (imageHeightInput)
                imageHeightInput.value = String(parseInt(element.style.height || computedStyle.height, 10));
            if (imageFileInput)
                imageFileInput.value = '';
        }
        else {
            if (imageProperties)
                imageProperties.style.display = 'none';
        }
    }
    function applyColor(element, property, hex, alpha) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        element.style[property] = "rgba(".concat(r, ", ").concat(g, ", ").concat(b, ", ").concat(alpha, ")");
    }
    if (bgColorInput)
        bgColorInput.addEventListener('input', function (e) { if (selectedElement)
            applyColor(selectedElement, 'backgroundColor', e.target.value, (bgColorAlpha === null || bgColorAlpha === void 0 ? void 0 : bgColorAlpha.value) || '1'); e.target.parentElement.style.backgroundColor = e.target.value; });
    // Page Properties Event Listeners
    if (pageTitleInput)
        pageTitleInput.addEventListener('input', function (e) {
            document.title = e.target.value;
        });
    if (pageBgColorInput)
        pageBgColorInput.addEventListener('input', function (e) {
            applyColor(document.body, 'backgroundColor', e.target.value, (pageBgColorAlpha === null || pageBgColorAlpha === void 0 ? void 0 : pageBgColorAlpha.value) || '1');
            e.target.parentElement.style.backgroundColor = e.target.value;
        });
    if (pageBgColorAlpha)
        pageBgColorAlpha.addEventListener('input', function (e) {
            applyColor(document.body, 'backgroundColor', (pageBgColorInput === null || pageBgColorInput === void 0 ? void 0 : pageBgColorInput.value) || '#ffffff', e.target.value);
        });
    if (pageFaviconInput)
        pageFaviconInput.addEventListener('change', function (e) {
            var files = e.target.files;
            if (files && files[0]) {
                var file_2 = files[0];
                var reader = new FileReader();
                reader.onload = function (event) {
                    updateFavicon(event.target.result, file_2);
                };
                reader.readAsDataURL(file_2);
            }
        });
    if (bgColorAlpha)
        bgColorAlpha.addEventListener('input', function (e) { if (selectedElement)
            applyColor(selectedElement, 'backgroundColor', (bgColorInput === null || bgColorInput === void 0 ? void 0 : bgColorInput.value) || '#000000', e.target.value); });
    if (fontColorInput)
        fontColorInput.addEventListener('input', function (e) { if (selectedElement)
            applyColor(selectedElement, 'color', e.target.value, (fontColorAlpha === null || fontColorAlpha === void 0 ? void 0 : fontColorAlpha.value) || '1'); e.target.parentElement.style.backgroundColor = e.target.value; });
    if (fontColorAlpha)
        fontColorAlpha.addEventListener('input', function (e) { if (selectedElement)
            applyColor(selectedElement, 'color', (fontColorInput === null || fontColorInput === void 0 ? void 0 : fontColorInput.value) || '#000000', e.target.value); });
    if (fontSizeInput)
        fontSizeInput.addEventListener('change', function (e) { if (selectedElement)
            selectedElement.style.fontSize = "".concat(e.target.value, "px"); });
    if (elementContentInput)
        elementContentInput.addEventListener('input', function (e) { if (selectedElement)
            selectedElement.textContent = e.target.value; });
    if (imageWidthInput)
        imageWidthInput.addEventListener('input', function (e) { if (selectedElement)
            selectedElement.style.width = "".concat(e.target.value, "px"); });
    if (imageHeightInput)
        imageHeightInput.addEventListener('input', function (e) { if (selectedElement)
            selectedElement.style.height = "".concat(e.target.value, "px"); });
    if (textAlignSelect)
        textAlignSelect.addEventListener('change', function (e) { if (selectedElement)
            selectedElement.style.textAlign = e.target.value; });
    if (imageFileInput)
        imageFileInput.addEventListener('change', function (e) {
            if (selectedElement && selectedElement.tagName === 'IMG' && e.target.files && e.target.files[0]) {
                var file_3 = e.target.files[0];
                var reader = new FileReader();
                reader.onload = function (event) {
                    selectedElement.src = event.target.result;
                    insertedImages.set(selectedElement.id, file_3);
                };
                reader.readAsDataURL(file_3);
            }
        });
    if (justifyContentSelect)
        justifyContentSelect.addEventListener('change', function (e) { if (selectedElement)
            selectedElement.style.justifyContent = e.target.value; });
    if (alignItemsSelect)
        alignItemsSelect.addEventListener('change', function (e) { if (selectedElement)
            selectedElement.style.alignItems = e.target.value; });
    if (deleteButton)
        deleteButton.addEventListener('click', function () {
            if (selectedElement && selectedTreeItem) {
                if (confirm('Are you sure you want to delete this element?')) {
                    selectedElement.remove();
                    selectedTreeItem.remove();
                    if (propertiesPanel)
                        propertiesPanel.style.display = 'none';
                    selectedElement = null;
                    selectedTreeItem = null;
                }
            }
        });
    function rgbToHex(rgb) {
        if (!rgb || rgb.indexOf('rgb') === -1)
            return '#000000';
        var parts = rgb.match(/[0-9]+/g);
        if (!parts)
            return '#000000';
        var _a = parts.map(Number), r = _a[0], g = _a[1], b = _a[2];
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toLowerCase();
    }
    function parseRgba(rgbaString) {
        if (!rgbaString || !rgbaString.toLowerCase().startsWith('rgba')) {
            return { hex: rgbToHex(rgbaString), alpha: 1 };
        }
        var parts = rgbaString.match(/[0-9.]+/g);
        if (!parts || parts.length < 4) {
            return { hex: '#000000', alpha: 1 };
        }
        var hex = rgbToHex("rgb(".concat(parts[0], ", ").concat(parts[1], ", ").concat(parts[2], ")"));
        return { hex: hex, alpha: parseFloat(parts[3]) };
    }
    function updateFavicon(href, file) {
        if (file === void 0) { file = null; }
        var link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = href;
        if (file)
            faviconFile.file = file;
        faviconFile.dataUrl = href;
    }
});
