// An array of the link text you want to KEEP
const keepList = ["News", "Trash", "Spaces"];

// Select all the links within the main navigation container
const sidebarLinks = document.querySelectorAll('.MenuBar a');

// Loop over each link
sidebarLinks.forEach(link => {
  // If the link's text is NOT in our keepList, remove it
  if (!keepList.includes(link.textContent)) {
    link.remove();
  }
});