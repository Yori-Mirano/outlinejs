window.addEventListener('load', function () {
    var contentEl   = document.querySelector('#content');
    var articleEl   = document.querySelector('article');
    var outlineEl   = document.querySelector('#outline');
    var outlineTree = outline.getTree(articleEl);

    console.log(outlineTree);

    outline.build(outlineTree, outlineEl, contentEl, 0.1);
}, false);
