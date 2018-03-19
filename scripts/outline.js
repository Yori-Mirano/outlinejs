var outline = {
  /**
   * Renvoie un arbre représentant la scructure du document.
   * 
   * @param   {HTMLElement} rootEl Racine du document à traiter.
   * @param   {Number}      depth  Profondeur maximum de l'arbre.
   * @param   {Number}      level  Utilisé pour indiquer la profondeur actuelle au
   *                             cours du traitement récurcif. Laisser vide.
   *                             
   * @returns {Object}      L'arbre représentant la structure du document.
   */
  getTree: function (rootEl, depth, level) {
    // Valeurs par défaut.
    depth = typeof depth !== 'undefined' ? depth : -1;
    level = typeof level !== 'undefined' ? level : 0;

    var
      outline = {},
      subOutline,
      children = rootEl.children,
      child;

    for (var i = 0, l = children.length; i < l; i++) {
      child = children[i];

      if (child.tagName.match(/^h[1-6]$/i)) {
        outline.el    = child;
        outline.type  = 'heading';
        outline.level = level;
        outline.title = child.textContent;
        outline.position = child.offsetTop / child.offsetParent.scrollHeight;
        outline.size  = child.parentElement.textContent.length;
        outline.words = child.parentElement.textContent.match(/\S+/g).length;


      } else if ((depth === -1 || level < depth) &&
                 child.tagName.match(/^section$/i)) {

        subOutline = this.getTree(child, depth, level + 1);

        !outline.sub && (outline.sub = []);
        outline.sub.push(subOutline);
      }
    }

    return outline;
  },





  /**
   * Construit le sommaire dans le DOM.
   * 
   * @param   {Object}      outlineTree         Arbre représentant la structure du document.
   * @param   {HTMLElement} outlineContainerEl  Element qui contiendra le sommaire dans le DOM.
   * @param   {HTMLElement} docScrollingFrameEl Element du DOM qui gère le défilement du document.
   *                                            Il permet le calcul de la hauteur du sommaire.
   * @param   {Number}      scale               Echelle du sommaire par rapport à
   *                                            la taille réelle du document.
   *                                          
   * @returns {HTMLElement} Renvoie un élément partiel du sommaire pour le
   *                                            traitrement récurcif.
   */
  build: function (outlineTree, outlineContainerEl, docScrollingFrameEl, scale) {
    var isRootCall = !!outlineContainerEl;
  
    // FIX chrome bug on scrollTop with document.documentElement that always returns 0.
    if (docScrollingFrameEl === document.documentElement && docScrollingFrameEl.scrollTop < document.body.scrollTop) {
      docScrollingFrameEl = document.body;
    }
    // ENDFIX

    var li = document.createElement('li');


    var titleEl = document.createElement('div');
    titleEl.className = 'outline-title';
    titleEl.style.position = 'absolute';
    titleEl.style.right = '0px';

    if (isRootCall) {
      titleEl.style.top = '-16px';
    } else {
      titleEl.style.top = (outlineTree.position * docScrollingFrameEl.scrollHeight * scale) + 'px';
    }

    titleEl.innerHTML = outlineTree.title;

    li.appendChild(titleEl);


    if (outlineTree.sub) {
      var ul = document.createElement('ul');
      ul.className = 'outline-section';

      for (var i = 0, l = outlineTree.sub.length; i < l; i++) {
        ul.appendChild(this.build(outlineTree.sub[i], null, docScrollingFrameEl, scale));
      }

      li.appendChild(ul);
    }


    if (isRootCall) {
      // Clean the outline container.
      outlineContainerEl.innerHTML = '';

      // Create outline DOM element.
      var outlineEl = document.createElement('ul');
      outlineEl.className = 'outline';
      outlineEl.style.height = (docScrollingFrameEl.scrollHeight * scale) + 'px';

      // Create progress DOM element.
      var progressEl = document.createElement('div');
      progressEl.className = 'outline-progress';
      outlineEl.appendChild(progressEl);

      var progress = 0;

      // Create progress info box DOM element.
      var progressInfoEl = document.createElement('div');
      progressInfoEl.className = 'outline-progress-info';
      progressEl.appendChild(progressInfoEl);
      
      // Update progress on scroll event.
      var onScroll = function () {
        progress = (docScrollingFrameEl.scrollTop + outlineTree.position * docScrollingFrameEl.scrollHeight) / docScrollingFrameEl.scrollHeight;
        progressEl.style.height = Math.round(progress * outlineContainerEl.clientHeight) + 'px';

        outlineContainerEl.parentElement.scrollTop = progress * (outlineContainerEl.parentElement.scrollHeight - outlineContainerEl.parentElement.clientHeight);
        progressInfoEl.innerHTML = Math.round(outlineTree.words * (1 - progress)) + ' mots<br>restants';
      };

      window.addEventListener('resize', onScroll, false);
      docScrollingFrameEl.addEventListener('scroll', onScroll, false);

      // Append outline to the DOM.
      outlineEl.appendChild(li);
      outlineContainerEl.appendChild(outlineEl);


    } else {
      // Else it's a recursive call. Return a partial outline tree.
      return li;
    }

  }
};