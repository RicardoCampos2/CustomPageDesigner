// TypeScript version of page.js
// Converted to TS with types while keeping exact same behavior

declare const JSZip: any; // provided by included library at runtime

const sidebar = document.querySelector(".sidebar") as HTMLElement;
const hideBtn = document.getElementById("hide-sidebar") as HTMLButtonElement;
const showBtn = document.getElementById("show-sidebar") as HTMLButtonElement;
const insertedImages: Map<string, File> = new Map();
const faviconFile: { file: File | null; dataUrl: string | null } = { file: null, dataUrl: null };

hideBtn.addEventListener("click", () => {
  sidebar.classList.add("hidden");
});

showBtn.addEventListener("click", () => {
  sidebar.classList.remove("hidden");
});

let elementCounter = 0;
let selectedPlaceholder: HTMLElement | null = null;

function generateId(type: string): string {
  elementCounter++;
  return `${type}-${elementCounter}`;
}

document.addEventListener("click", function (e: MouseEvent) {
  const target = e.target as HTMLElement;
  const placeholder = target.closest(".add-placeholder") as HTMLElement | null;

  if (placeholder) {
    if (selectedPlaceholder) selectedPlaceholder.classList.remove("selected");
    selectedPlaceholder = placeholder;
    selectedPlaceholder.classList.add("selected");
  }
});

document.getElementById("element-type")!.addEventListener("change", function (this: HTMLSelectElement) {
  const type = this.value;
  (document.getElementById("element-text") as HTMLElement).style.display =
    type === "text" || type === "title" ? "block" : "none";
  (document.getElementById("element-image") as HTMLElement).style.display =
    type === "image" ? "block" : "none";
  (document.getElementById("container-layout") as HTMLElement).style.display =
    type === "container" ? "block" : "none";
});

document.addEventListener("DOMContentLoaded", buildTree);

function insertElement(): void {
  if (!selectedPlaceholder) {
    alert("Select a placeholder button inside a block first.");
    return;
  }

  const type = (document.getElementById("element-type") as HTMLSelectElement).value;
  const textVal = (document.getElementById("element-text") as HTMLInputElement).value;
  const fileInput = document.getElementById("element-image") as HTMLInputElement;
  const layout = (document.getElementById("container-layout") as HTMLSelectElement).value;

  let newEl: HTMLElement | HTMLImageElement | null = null;

  switch (type) {
    case "title": {
      const el = document.createElement("h2");
      el.className = "block__title";
      el.id = generateId("title");
      el.textContent = textVal || "New Title";
      newEl = el;
      break;
    }

    case "text": {
      const el = document.createElement("p");
      el.className = "block__text";
      el.id = generateId("text");
      el.textContent = textVal || "New Text";
      newEl = el;
      break;
    }

    case "image": {
      const el = document.createElement("img");
      el.className = "block__img";
      el.id = generateId("image");
      el.alt = "New Image";

      if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          el.src = e.target!.result as string;
          insertedImages.set(el.id, file);
        };
        reader.readAsDataURL(file);
      } else {
        el.src = "img.jpg";
      }

      newEl = el;
      break;
    }

    case "container": {
      const el = document.createElement("div");
      el.className = "container";
      el.id = generateId("container");

      const createPlaceholder = (): HTMLButtonElement => {
        const btn = document.createElement("button");
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
          const left = createPlaceholder();
          const rightContainer = document.createElement("div");
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

function buildTree(): void {
  const treeRoot = document.getElementById("dom-tree") as HTMLElement;
  if (!treeRoot) return;
  treeRoot.innerHTML = "";

  const mainContent = document.querySelector(".main-content") as HTMLElement;
  if (!mainContent) return;

  function createNode(el: HTMLElement, parentUl: HTMLElement): void {
    const li = document.createElement("li");
    li.dataset.elementId = el.id;

    const header = document.createElement("div");
    header.className = "tree-node";

    const label = document.createElement("button");
    label.textContent = `${el.tagName.toLowerCase()} (${el.id || "no-id"})`;
    label.onclick = () => {
      if (selectedPlaceholder) selectedPlaceholder.classList.remove("selected");
      selectedPlaceholder = el;
      el.classList.add("selected");
    };

    header.appendChild(label);
    li.appendChild(header);
    parentUl.appendChild(li);

    const children = el.querySelectorAll(":scope > [id]") as NodeListOf<HTMLElement>;

    if (children.length > 0) {
      const toggle = document.createElement("button");
      toggle.className = "tree-toggle";
      header.insertBefore(toggle, label);

      const ul = document.createElement("ul");
      li.appendChild(ul);

      children.forEach((child) => createNode(child, ul));

      toggle.onclick = () => {
        const isOpen = toggle.classList.toggle("open");
        ul.classList.toggle("hidden", !isOpen);
      };

      ul.classList.add("hidden");
    }
  }

  const topLevel = mainContent.querySelectorAll(".top-banner, .block") as NodeListOf<HTMLElement>;
  topLevel.forEach((el) => createNode(el, treeRoot));
}

// Export HTML functionality
const exportBtn = document.getElementById("export-html-btn") as HTMLButtonElement | null;
if (exportBtn) exportBtn.addEventListener("click", exportPage);

function exportPage(): void {
  const mainContent = document.body;
  if (!mainContent) {
    alert("No main content found to export.");
    return;
  }

  const clonedContent = mainContent.cloneNode(true) as HTMLElement;
  clonedContent.querySelectorAll(".add-placeholder").forEach((el) => el.remove());
  clonedContent.querySelectorAll(".sidebar").forEach((el) => el.remove());
  clonedContent.querySelectorAll(".selected").forEach((el) => el.classList.remove("selected"));

  // Remove the 'selected' class from the body if it was selected for properties
  clonedContent.classList.remove('selected');

  // Explicitly set the computed background color of the body
  clonedContent.style.backgroundColor = window.getComputedStyle(document.body).backgroundColor;

  // Handle favicon
  let faviconLinkHtml = '';
  let faviconFileName = '';
  let faviconBlobToZip: Blob | null = null;
  let faviconPromise: Promise<void> = Promise.resolve(); // Initialize with a resolved promise

  if (faviconFile.file && faviconFile.dataUrl) {
    const ext = faviconFile.file.name.split(".").pop();
    faviconFileName = `favicon.${ext}`;
    faviconLinkHtml = `<link rel="icon" type="${faviconFile.file.type}" href="${faviconFileName}">`;
    faviconBlobToZip = faviconFile.file; // Use the uploaded file directly
  } else {
    // Check if there's an existing favicon link in the original document
    const existingFavicon = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (existingFavicon && existingFavicon.href && !existingFavicon.href.startsWith('data:')) {
      const faviconUrl = existingFavicon.href;
      const urlParts = faviconUrl.split('/');
      faviconFileName = urlParts[urlParts.length - 1]; // Get filename from URL
      // Try to infer type from URL or default to image/x-icon
      const inferredType = faviconFileName.includes('.') ? `image/${faviconFileName.split('.').pop()}` : 'image/x-icon';
      faviconLinkHtml = `<link rel="icon" type="${inferredType}" href="${faviconFileName}">`;

      faviconPromise = fetch(faviconUrl)
        .then(res => res.blob())
        .then(blob => {
          faviconBlobToZip = blob;
        })
        .catch(error => console.error(`Failed to fetch existing favicon ${faviconUrl}:`, error));
    }
  }

  const zip = new JSZip();
  fetch("style.css")
    .then((res) => res.text())
    .then((cssText) => {
      zip.file("style.css", cssText);

      const images = clonedContent.querySelectorAll("img") as NodeListOf<HTMLImageElement>;
      const imgPromises: Promise<void>[] = [];

      // Add the favicon promise to the array of promises to wait for
      imgPromises.push(faviconPromise);

      images.forEach((img, i) => {
        const file = insertedImages.get(img.id);
        if (file) {
          zip.file(`images/img${i}.${file.name.split(".").pop()}`, file);
          img.src = `images/img${i}.${file.name.split(".").pop()}`;
        } else if (img.src.startsWith("data:")) {
          const base64Data = img.src.split(",")[1];
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let j = 0; j < byteCharacters.length; j++) {
            byteNumbers[j] = byteCharacters.charCodeAt(j);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: "image/png" });
          zip.file(`images/img${i}.png`, blob);
          img.src = `images/img${i}.png`;
        } else {
            // Handle external images or default images
            imgPromises.push(
              fetch(img.src)
                .then((res) => res.blob())
                .then((blob) => {
                  // Try to infer extension, default to png
                  const contentType = blob.type.split('/').pop() || 'png';
                  zip.file(`images/img${i}.${contentType}`, blob);
                  img.src = `images/img${i}.${contentType}`;
                })
                .catch(error => console.error(`Failed to fetch image ${img.src}:`, error)) // Add error handling
            );
        }
      });

      Promise.all(imgPromises).then(() => {
        // Add favicon to zip here, after all fetches are complete
        if (faviconBlobToZip && faviconFileName) {
          zip.file(faviconFileName, faviconBlobToZip);
        }

        // Get the inline style from the cloned body to apply it to the exported body tag
        const bodyStyle = clonedContent.getAttribute('style') || '';

        const finalHtml = `<!DOCTYPE html><html lang="en">
<head>
    <meta charset="UTF-8" />
    <link rel="stylesheet" type="text/css" href="style.css">
    <title>${document.title}</title>
    ${faviconLinkHtml}
</head>
<body style="${bodyStyle}">
    ${clonedContent.innerHTML}
</body>
</html>`;
        zip.file("exported_page.html", finalHtml);

        zip.generateAsync({ type: "blob" }).then((content: Blob) => {
          const a = document.createElement("a");
          a.href = URL.createObjectURL(content);
          a.download = "exported_page.zip";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        });
      });
    });
}

let blockCounter = 3;

const addBlockBtn = document.getElementById("add-block-btn") as HTMLButtonElement | null;
if (addBlockBtn) {
  addBlockBtn.addEventListener("click", () => {
    blockCounter++;

    const newBlock = document.createElement("div");
    newBlock.className = "block";
    newBlock.id = `block${blockCounter}`;
    newBlock.setAttribute("data-id", `block${blockCounter}`);

    const placeholderBtn = document.createElement("button");
    placeholderBtn.className = "add-placeholder";
    placeholderBtn.innerHTML = '<img src="add.png" alt="Add">';

    newBlock.appendChild(placeholderBtn);

    const mainContent = document.querySelector(".main-content") as HTMLElement | null;
    if (mainContent) {
      const division = document.createElement("div");
      division.className = "division";
      mainContent.appendChild(division);
      mainContent.appendChild(newBlock);
    }

    buildTree();
  });
}

// Properties panel code (runs on DOMContentLoaded)
document.addEventListener('DOMContentLoaded', () => {
  const domTree = document.getElementById('dom-tree') as HTMLElement | null;
  const propertiesPanel = document.getElementById('element-properties') as HTMLElement | null;
  const selectedElementTag = document.getElementById('selected-element-tag') as HTMLElement | null;
  const textProperties = document.getElementById('text-properties') as HTMLElement | null;
  const genericProperties = document.getElementById('generic-properties') as HTMLElement | null;
  const layoutProperties = document.getElementById('layout-properties') as HTMLElement | null;
  const imageProperties = document.getElementById('image-properties') as HTMLElement | null;
  const pagePropertiesPanel = document.getElementById('page-properties-panel') as HTMLElement | null;
  const pageSettingsBtn = document.getElementById('page-settings-btn') as HTMLButtonElement | null;
  const pageTitleInput = document.getElementById('page-title-input') as HTMLInputElement | null;
  const pageBgColorInput = document.getElementById('page-bg-color') as HTMLInputElement | null;
  const pageBgColorAlpha = document.getElementById('page-bg-color-alpha') as HTMLInputElement | null;

  const bgColorInput = document.getElementById('bg-color') as HTMLInputElement | null;
  const fontColorInput = document.getElementById('font-color') as HTMLInputElement | null;
  const fontSizeInput = document.getElementById('font-size') as HTMLInputElement | null;
  const deleteButton = document.getElementById('delete-element-btn') as HTMLButtonElement | null;
  const elementContentInput = document.getElementById('element-content') as HTMLInputElement | null;
  const justifyContentSelect = document.getElementById('justify-content') as HTMLSelectElement | null;
  const alignItemsSelect = document.getElementById('align-items') as HTMLSelectElement | null;
  const imageWidthInput = document.getElementById('image-width') as HTMLInputElement | null;
  const imageHeightInput = document.getElementById('image-height') as HTMLInputElement | null;
  const imageFileInput = document.getElementById('image-file-input') as HTMLInputElement | null;
  const pageFaviconInput = document.getElementById('page-favicon-input') as HTMLInputElement | null;
  const textAlignSelect = document.getElementById('text-align') as HTMLSelectElement | null;
  const bgColorAlpha = document.getElementById('bg-color-alpha') as HTMLInputElement | null;
  const fontColorAlpha = document.getElementById('font-color-alpha') as HTMLInputElement | null;

  let selectedElement: HTMLElement | null = null;
  let selectedTreeItem: HTMLElement | null = null;

  if (domTree) {
    domTree.addEventListener('click', (e) => {
      const treeItem = (e.target as HTMLElement).closest('li') as HTMLElement | null;
      if (treeItem && treeItem.dataset.elementId) {
        const elementId = treeItem.dataset.elementId;
        const element = document.getElementById(elementId as string);

        if (element) {
          if (selectedTreeItem) selectedTreeItem.classList.remove('selected');
          if (selectedElement) selectedElement.classList.remove('selected');

          selectedElement = element as HTMLElement;
          selectedTreeItem = treeItem;
          selectedTreeItem.classList.add('selected');
          selectedElement.classList.add('selected');
          showPropertiesPanelFor(selectedElement);
        }
      }
    });
  }

  if (pageSettingsBtn) {
    pageSettingsBtn.addEventListener('click', () => {
      // Deselect any selected element
      if (selectedTreeItem) selectedTreeItem.classList.remove('selected');
      if (selectedElement) selectedElement.classList.remove('selected');
      selectedElement = null;
      selectedTreeItem = null;

      // Hide element properties and show page properties
      if (propertiesPanel) propertiesPanel.style.display = 'block';
      if (selectedElementTag) selectedElementTag.textContent = 'Page';
      if (textProperties) textProperties.style.display = 'none';
      if (genericProperties) genericProperties.style.display = 'none';
      if (layoutProperties) layoutProperties.style.display = 'none';
      if (imageProperties) imageProperties.style.display = 'none';
      if (pagePropertiesPanel) pagePropertiesPanel.style.display = 'block';

      // Populate page properties fields
      if (pageTitleInput) pageTitleInput.value = document.title;

      const bodyComputedStyle = window.getComputedStyle(document.body);
      const bodyBgRgba = parseRgba(document.body.style.backgroundColor || bodyComputedStyle.backgroundColor);
      if (pageBgColorInput) pageBgColorInput.value = bodyBgRgba.hex;
      if (pageBgColorAlpha) pageBgColorAlpha.value = String(bodyBgRgba.alpha);
      const pageBgWrapper = document.getElementById('page-bg-color-wrapper') as HTMLElement | null;
      if (pageBgWrapper && pageBgColorInput) pageBgWrapper.style.backgroundColor = pageBgColorInput.value;

      // Clear favicon input for new selection
      if (pageFaviconInput) pageFaviconInput.value = '';
    });
  }

  function showPropertiesPanelFor(element: HTMLElement) {
    if (!propertiesPanel || !selectedElementTag) return;
    propertiesPanel.style.display = 'block';
    selectedElementTag.textContent = `${element.tagName.toLowerCase()}`;

    const computedStyle = window.getComputedStyle(element);
    const bgRgba = parseRgba(element.style.backgroundColor || computedStyle.backgroundColor);
    if (bgColorInput) bgColorInput.value = bgRgba.hex;
    if (bgColorAlpha) bgColorAlpha.value = String(bgRgba.alpha);
    const bgWrapper = document.getElementById('bg-color-wrapper') as HTMLElement | null;
    if (bgWrapper && bgColorInput) bgWrapper.style.backgroundColor = bgColorInput.value;

    // Show generic properties for elements
    if (genericProperties) genericProperties.style.display = 'block';

    // Hide page properties panel when an element is selected
    if (pagePropertiesPanel) pagePropertiesPanel.style.display = 'none';

    if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'BUTTON'].includes(element.tagName)) {
      if (textProperties) textProperties.style.display = 'block';

      const fontRgba = parseRgba(element.style.color || computedStyle.color);
      if (fontColorInput) fontColorInput.value = fontRgba.hex;
      if (fontColorAlpha) fontColorAlpha.value = String(fontRgba.alpha);
      if (fontSizeInput) fontSizeInput.value = String(parseInt(element.style.fontSize || computedStyle.fontSize, 10));
      const fontWrapper = document.getElementById('font-color-wrapper') as HTMLElement | null;
      if (fontWrapper && fontColorInput) fontWrapper.style.backgroundColor = fontColorInput.value;

      if (elementContentInput) elementContentInput.value = element.textContent?.trim() || '';
      if (textAlignSelect) textAlignSelect.value = element.style.textAlign || computedStyle.textAlign;
    } else {
      if (textProperties) textProperties.style.display = 'none';
    }

    if (computedStyle.display === 'flex') {
      if (layoutProperties) layoutProperties.style.display = 'block';
      if (justifyContentSelect) justifyContentSelect.value = element.style.justifyContent || (computedStyle.justifyContent as string);
      if (alignItemsSelect) alignItemsSelect.value = element.style.alignItems || (computedStyle.alignItems as string);
    } else {
      if (layoutProperties) layoutProperties.style.display = 'none';
    }

    if (element.tagName === 'IMG') {
      if (imageProperties) imageProperties.style.display = 'block';
      if (imageWidthInput) imageWidthInput.value = String(parseInt(element.style.width || computedStyle.width, 10));
      if (imageHeightInput) imageHeightInput.value = String(parseInt(element.style.height || computedStyle.height, 10));
      if (imageFileInput) imageFileInput.value = '';
    } else {
      if (imageProperties) imageProperties.style.display = 'none';
    }
  }

  function applyColor(element: HTMLElement, property: 'backgroundColor' | 'color', hex: string, alpha: string | number) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    element.style[property] = `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  if (bgColorInput) bgColorInput.addEventListener('input', (e) => { if (selectedElement) applyColor(selectedElement, 'backgroundColor', (e.target as HTMLInputElement).value, bgColorAlpha?.value || '1'); (e.target as HTMLElement).parentElement!.style.backgroundColor = (e.target as HTMLInputElement).value; });

  // Page Properties Event Listeners
  if (pageTitleInput) pageTitleInput.addEventListener('input', (e) => {
    document.title = (e.target as HTMLInputElement).value;
  });

  if (pageBgColorInput) pageBgColorInput.addEventListener('input', (e) => {
    applyColor(document.body, 'backgroundColor', (e.target as HTMLInputElement).value, pageBgColorAlpha?.value || '1');
    (e.target as HTMLElement).parentElement!.style.backgroundColor = (e.target as HTMLInputElement).value;
  });

  if (pageBgColorAlpha) pageBgColorAlpha.addEventListener('input', (e) => {
    applyColor(document.body, 'backgroundColor', pageBgColorInput?.value || '#ffffff', (e.target as HTMLInputElement).value);
  });

  if (pageFaviconInput) pageFaviconInput.addEventListener('change', (e) => {
    const files = (e.target as HTMLInputElement).files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = function(event) {
        updateFavicon(event.target!.result as string, file);
      };
      reader.readAsDataURL(file);
    }
  });
  if (bgColorAlpha) bgColorAlpha.addEventListener('input', (e) => { if (selectedElement) applyColor(selectedElement, 'backgroundColor', bgColorInput?.value || '#000000', (e.target as HTMLInputElement).value); });
  if (fontColorInput) fontColorInput.addEventListener('input', (e) => { if (selectedElement) applyColor(selectedElement, 'color', (e.target as HTMLInputElement).value, fontColorAlpha?.value || '1'); (e.target as HTMLElement).parentElement!.style.backgroundColor = (e.target as HTMLInputElement).value; });
  if (fontColorAlpha) fontColorAlpha.addEventListener('input', (e) => { if (selectedElement) applyColor(selectedElement, 'color', fontColorInput?.value || '#000000', (e.target as HTMLInputElement).value); });
  if (fontSizeInput) fontSizeInput.addEventListener('change', (e) => { if (selectedElement) selectedElement.style.fontSize = `${(e.target as HTMLInputElement).value}px`; });
  if (elementContentInput) elementContentInput.addEventListener('input', (e) => { if (selectedElement) selectedElement.textContent = (e.target as HTMLInputElement).value; });
  if (imageWidthInput) imageWidthInput.addEventListener('input', (e) => { if (selectedElement) (selectedElement as HTMLImageElement).style.width = `${(e.target as HTMLInputElement).value}px`; });
  if (imageHeightInput) imageHeightInput.addEventListener('input', (e) => { if (selectedElement) (selectedElement as HTMLImageElement).style.height = `${(e.target as HTMLInputElement).value}px`; });
  if (textAlignSelect) textAlignSelect.addEventListener('change', (e) => { if (selectedElement) selectedElement.style.textAlign = (e.target as HTMLSelectElement).value; });

  if (imageFileInput) imageFileInput.addEventListener('change', (e) => {
    if (selectedElement && selectedElement.tagName === 'IMG' && (e.target as HTMLInputElement).files && (e.target as HTMLInputElement).files![0]) {
      const file = (e.target as HTMLInputElement).files![0];
      const reader = new FileReader();
      reader.onload = function(event) {
        (selectedElement as HTMLImageElement).src = event.target!.result as string;
        insertedImages.set(selectedElement!.id, file);
      };
      reader.readAsDataURL(file);
    }
  });

  if (justifyContentSelect) justifyContentSelect.addEventListener('change', (e) => { if (selectedElement) selectedElement.style.justifyContent = (e.target as HTMLSelectElement).value; });
  if (alignItemsSelect) alignItemsSelect.addEventListener('change', (e) => { if (selectedElement) selectedElement.style.alignItems = (e.target as HTMLSelectElement).value; });

  if (deleteButton) deleteButton.addEventListener('click', () => {
    if (selectedElement && selectedTreeItem) {
      if (confirm('Are you sure you want to delete this element?')) {
        selectedElement.remove();
        selectedTreeItem.remove();

        if (propertiesPanel) propertiesPanel.style.display = 'none';
        selectedElement = null;
        selectedTreeItem = null;
      }
    }
  });

  function rgbToHex(rgb: string | null): string {
    if (!rgb || rgb.indexOf('rgb') === -1) return '#000000';
    const parts = rgb.match(/[0-9]+/g);
    if (!parts) return '#000000';
    const [r, g, b] = parts.map(Number);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toLowerCase();
  }

  function parseRgba(rgbaString: string | null): { hex: string; alpha: number } {
    if (!rgbaString || !rgbaString.toLowerCase().startsWith('rgba')) {
      return { hex: rgbToHex(rgbaString), alpha: 1 };
    }
    const parts = rgbaString.match(/[0-9.]+/g);
    if (!parts || parts.length < 4) {
      return { hex: '#000000', alpha: 1 };
    }
    const hex = rgbToHex(`rgb(${parts[0]}, ${parts[1]}, ${parts[2]})`);
    return { hex: hex, alpha: parseFloat(parts[3]) };
  }

  function updateFavicon(href: string, file: File | null = null) {
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = href;
    if (file) faviconFile.file = file;
    faviconFile.dataUrl = href;
  }
});
 