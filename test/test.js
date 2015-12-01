/* global suite, sinon, setup, teardown, test, assert, popel, CharacterData */
/*jshint maxlen:false*/

suite('popel >', function() {
  'use strict';

  setup(function() {
    this.sinon = sinon.sandbox.create();
  });

  teardown(function() {
    this.sinon.restore();
  });

  function totalSize(node) {
    var result = 0;
    if (node.childNodes.length === 0) {
      return 0;
    }

    for (var i = 0; i < node.childNodes.length; i++) {
      var child = node.childNodes[i];
      result += 1 + totalSize(child);
    }

    return result;
  }

  test('it can place variables into text nodes', function() {
    var el = popel('<div>${foo}</div>');
    popel.populate(el, { foo: 'foo' });
    assert.equal(el.textContent, 'foo');
  });

  suite('paint optimization', function() {
    var dataDescriptor, setData, el;

    setup(function() {
      el = popel('<div>${foo}</div>');

      dataDescriptor = Object.getOwnPropertyDescriptor(
        CharacterData.prototype,
        'data'
      );

      setData = this.sinon.spy(dataDescriptor, 'set');

      Object.defineProperty(CharacterData.prototype, 'data', {
        set: setData,
        get: dataDescriptor.get
      });
    });

    teardown(function() {
      Object.defineProperty(
        CharacterData.prototype,
        'data',
        dataDescriptor
      );
    });

    test('it skips the update if the content is the same', function() {
      popel.populate(el, { foo: 'bar' });
      popel.populate(el, { foo: 'bar' });
      sinon.assert.calledOnce(setData);
    });
  });

  test('it can place variables as partial textContent', function() {
    var el = popel('<div>foo: ${foo}</div>');
    popel.populate(el, { foo: 'foo' });
    assert.equal(el.textContent, 'foo: foo');
  });

  test('it supports dot notation for deep properties', function() {
    var el = popel('<div>${one.two.three}</div>');
    popel.populate(el, { one: { two: { three: 'boo!' }} });
    assert.equal(el.textContent, 'boo!');
  });

  test('it can place a variable as an attribute', function() {
    var el = popel('<div title="${foo}" data-unchanged="unchanged" data-bar="${bar}"></div>');
    popel.populate(el, { foo: 'foo', bar: 'bar' });
    assert.equal(el.getAttribute('title'), 'foo');
    assert.equal(el.dataset.unchanged, 'unchanged');
    assert.equal(el.dataset.bar, 'bar');
  });

  test('it can place a variable a attribute partial', function() {
    var el = popel('<div title="I am ${foo}"></div>');
    popel.populate(el, { foo: 'foo' });
    assert.equal(el.getAttribute('title'), 'I am foo');
  });

  test('it does not call String#replace() for non-partials', function() {
    var el = popel('<div title="${foo}"></div>');
    var replace = this.sinon.spy(String.prototype, 'replace');
    popel.populate(el, { foo: 'foo' });
    sinon.assert.notCalled(replace);
    assert.equal(el.getAttribute('title'), 'foo');
  });

  test('can re-use parsed element to minimise parseHTML tasks', function() {
    var parsed = popel.parse('<h1>${name}</h1>');

    var el1 = popel.create(parsed.cloneNode(true));
    var el2 = popel.create(parsed.cloneNode(true));
    var el3 = popel.create(parsed.cloneNode(true));

    popel.populate(el1, { name: '1' });
    popel.populate(el2, { name: '2' });
    popel.populate(el3, { name: '3' });

    assert.equal(el1.textContent, '1');
    assert.equal(el2.textContent, '2');
    assert.equal(el3.textContent, '3');
  });

  test('it removes useless textNodes to lighten up the DOM', function() {
    var template =
      '<div title="${foo}">\n' +
      '  <span>${bar}</span> \n' +
      '  \n ' +
      '\n' +
      '  <img src="${bat}" />\n ' +
      '</div>';
    var el = popel(template);
    assert.equal(totalSize(el), 3);
  });

  suite('.populate()', function() {
    test('it returns `false` if element is unknown', function() {
      assert.isFalse(popel.populate(document.createElement('div'), {}));
    });

    test('it results `true` if element is known', function() {
      var el = popel('<div>${foo}</div>');
      assert.isTrue(popel.populate(el, { foo: 'foo' }));
    });
  });
});
