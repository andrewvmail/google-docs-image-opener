const tag = "[ google-docs-image-opener/content.js ]";
console.log(tag, "Content script running");

let open = false;
let addButton = false;
document.addEventListener("click", function (event) {
  if (open) {
    return;
  }
  const imageContainer = document.getElementsByTagName("image")[0];
  if (!imageContainer) {
    return;
  }
  const imageContainerOuterHTML = imageContainer.outerHTML;

  const url = imageContainerOuterHTML.match(
    /(filesystem|blob):.*(?=" width)/,
  )[0];

  // Create an anchor element and set its href to the filesystem URL
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";

  const bubble = document.getElementsByClassName(
    "docs-bubble kix-embedded-entity-bubble",
  )[0];
  if (!addButton) {
    const div = document.createElement("div");
    div.innerHTML =
      '<div class="goog-inline-block docs-material kix-embedded-entity-options" role="toolbar">' +
      "<a style='padding:1em;' id='image-clicked' target='_blank' href='#'>Open in new tab</a>" +
      "</div>";
    addButton = true;
    bubble.appendChild(div);
  }

  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "blob";
  xhr.onload = function () {
    if (xhr.status === 200) {
      const blob = xhr.response;
      const reader = new FileReader();
      reader.onload = function (event) {
        const url = URL.createObjectURL(blob);
        document.getElementById("image-clicked").href = url;
      };
      reader.readAsText(blob);
    } else {
      console.error(tag, "Failed to load filesystem URL:", xhr.statusText);
    }
  };
  xhr.onerror = function () {
    console.error(tag, "Error during XHR request to filesystem URL");
  };
  xhr.send();
});
