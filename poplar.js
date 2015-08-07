;(function(define){define(function(require,exports,module){
/*jshint esnext:true*/

var debug = 0 ? (...args) => console.log('[poplar]', ...args) : ()=>{};
var elements = new WeakMap();
var divider = ':::';

var regex = {
  content: />([^<]+)</g,
  variable: /\$\{([^\}]+)\}/g,
  attrs: /<[a-z]+ (.+)\/|>/g,
  attr: /([a-z]+)\=\"([^\"]+\$\{[^\"]+|\$[^"]+)/g
};

/**
 * Exports
 */

module.exports = poplar;

/**
 * Create a poplar element
 * from an HTML string.
 *
 * @param  {String} html
 * @return {HTMLElement}
 */
function poplar(html) {
  debug('poplar', html);

  var formatted = html
    .replace(/\n/g, '')

    // attribute bindings
    .replace(regex.attrs, function(m, attrs) {
      return m.replace(regex.attr, function(m, g1, g2) {
        return `data-bind-attr="${g1}${divider}${g2}`;
      });
    })

    // textNode bindings
    .replace(regex.content, function(m, content) {
      return m.replace(regex.variable, function(m, group) {
        return `<span data-bind="${group}"/>`;
      });
    });

  var parent = elementify(formatted);
  var child = parent.firstElementChild;
  elements.set(child, swapBindings(parent));

  return child;
}

/**
 * Populate the element with data.
 *
 * @param  {HTMLElement} el   poplar element
 * @param  {Object} data  Data to fill
 * @public
 */
poplar.populate = function(el, data) {
  var bindings = elements.get(el);

  bindings.textNodes.forEach(binding => {
    var value = getProp(data, binding.key);
    binding.textNode.data = value;
  });

  bindings.attributes.forEach(binding => {
    var value = binding.template.replace(regex.variable, function(match, group) {
      return getProp(data, group);
    });

    binding.el.setAttribute(binding.attribute, value);
  });
};

function swapBindings(el) {
  var textPlaceholders = el.querySelectorAll('[data-bind]');
  var attributePlaceholders = el.querySelectorAll('[data-bind-attr]');
  return {
    textNodes: [].map.call(textPlaceholders, replaceTextPlaceholder),
    attributes: [].map.call(attributePlaceholders, replaceAttributePlaceholder)
  };
}

function replaceTextPlaceholder(el) {
  var textNode = document.createTextNode('');
  el.parentNode.replaceChild(textNode, el);
  return {
    key: el.dataset.bind,
    textNode: textNode
  };
}

function replaceAttributePlaceholder(el) {
  var values = el.dataset.bindAttr.split(divider);
  var attribute = values[0];
  var value = values[1];

  el.removeAttribute('data-bind-attr');

  return {
    template: value,
    attribute: attribute,
    el: el
  };
}

function elementify(html) {
  var div = document.createElement('div');
  div.innerHTML = html;
  return div;
}

function getProp(object, path) {
  return path && getDeep(object, path.split('.'));
}

function getDeep(item, parts) {
  var part = parts.shift();
  return parts.length ? getDeep(item[part], parts) : item[part];
}

});})(typeof define=='function'&&define.amd?define
:(function(n,w){return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('poplar',this));
