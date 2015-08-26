/* global suite, sinon, setup, teardown, test, assert, poplar */
/*jshint maxlen:false*/

suite('poplar >', function() {
  'use strict';

  setup(function() {
    this.sinon = sinon.sandbox.create();
  });

  teardown(function() {
    this.sinon.restore();
  });

  test('it can place variables into text nodes', function() {
    var el = poplar('<div>${foo}</div>');
    poplar.populate(el, { foo: 'foo' });
    assert.equal(el.textContent, 'foo');
  });

  test('it can place variables as partial textContent', function() {
    var el = poplar('<div>foo: ${foo}</div>');
    poplar.populate(el, { foo: 'foo' });
    assert.equal(el.textContent, 'foo: foo');
  });

  test('it supports dot notation for deep properties', function() {
    var el = poplar('<div>${one.two.three}</div>');
    poplar.populate(el, { one: { two: { three: 'boo!' }} });
    assert.equal(el.textContent, 'boo!');
  });

  test('it can place a variable as an attribute', function() {
    var el = poplar('<div title="${foo}" data-unchanged="unchanged" data-bar="${bar}"></div>');
    poplar.populate(el, { foo: 'foo', bar: 'bar' });
    assert.equal(el.getAttribute('title'), 'foo');
    assert.equal(el.dataset.unchanged, 'unchanged');
    assert.equal(el.dataset.bar, 'bar');
  });

  test('it can place a variable a attribute partial', function() {
    var el = poplar('<div title="I am ${foo}"></div>');
    poplar.populate(el, { foo: 'foo' });
    assert.equal(el.getAttribute('title'), 'I am foo');
  });

  test('it does not call String#replace() for non-partials', function() {
    var el = poplar('<div title="${foo}"></div>');
    var replace = this.sinon.spy(String.prototype, 'replace');
    poplar.populate(el, { foo: 'foo' });
    sinon.assert.notCalled(replace);
    assert.equal(el.getAttribute('title'), 'foo');
  });
});
