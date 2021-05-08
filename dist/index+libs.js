(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () { 'use strict';

  /* Riot v5.4.1, @license MIT */
  /**
   * Convert a string from camel case to dash-case
   * @param   {string} string - probably a component tag name
   * @returns {string} component name normalized
   */
  function camelToDashCase(string) {
    return string.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
  /**
   * Convert a string containing dashes to camel case
   * @param   {string} string - input string
   * @returns {string} my-string -> myString
   */

  function dashToCamelCase(string) {
    return string.replace(/-(\w)/g, (_, c) => c.toUpperCase());
  }

  /**
   * Get all the element attributes as object
   * @param   {HTMLElement} element - DOM node we want to parse
   * @returns {Object} all the attributes found as a key value pairs
   */

  function DOMattributesToObject(element) {
    return Array.from(element.attributes).reduce((acc, attribute) => {
      acc[dashToCamelCase(attribute.name)] = attribute.value;
      return acc;
    }, {});
  }
  /**
   * Move all the child nodes from a source tag to another
   * @param   {HTMLElement} source - source node
   * @param   {HTMLElement} target - target node
   * @returns {undefined} it's a void method ¯\_(ツ)_/¯
   */
  // Ignore this helper because it's needed only for svg tags

  function moveChildren(source, target) {
    if (source.firstChild) {
      target.appendChild(source.firstChild);
      moveChildren(source, target);
    }
  }
  /**
   * Remove the child nodes from any DOM node
   * @param   {HTMLElement} node - target node
   * @returns {undefined}
   */

  function cleanNode(node) {
    clearChildren(node.childNodes);
  }
  /**
   * Clear multiple children in a node
   * @param   {HTMLElement[]} children - direct children nodes
   * @returns {undefined}
   */

  function clearChildren(children) {
    Array.from(children).forEach(removeChild);
  }
  /**
   * Remove a node
   * @param {HTMLElement}node - node to remove
   * @returns {undefined}
   */

  const removeChild = node => node && node.parentNode && node.parentNode.removeChild(node);
  /**
   * Insert before a node
   * @param {HTMLElement} newNode - node to insert
   * @param {HTMLElement} refNode - ref child
   * @returns {undefined}
   */

  const insertBefore = (newNode, refNode) => refNode && refNode.parentNode && refNode.parentNode.insertBefore(newNode, refNode);
  /**
   * Replace a node
   * @param {HTMLElement} newNode - new node to add to the DOM
   * @param {HTMLElement} replaced - node to replace
   * @returns {undefined}
   */

  const replaceChild = (newNode, replaced) => replaced && replaced.parentNode && replaced.parentNode.replaceChild(newNode, replaced);

  // Riot.js constants that can be used accross more modules
  const COMPONENTS_IMPLEMENTATION_MAP$1 = new Map(),
        DOM_COMPONENT_INSTANCE_PROPERTY$1 = Symbol('riot-component'),
        PLUGINS_SET$1 = new Set(),
        IS_DIRECTIVE = 'is',
        VALUE_ATTRIBUTE = 'value',
        MOUNT_METHOD_KEY = 'mount',
        UPDATE_METHOD_KEY = 'update',
        UNMOUNT_METHOD_KEY = 'unmount',
        SHOULD_UPDATE_KEY = 'shouldUpdate',
        ON_BEFORE_MOUNT_KEY = 'onBeforeMount',
        ON_MOUNTED_KEY = 'onMounted',
        ON_BEFORE_UPDATE_KEY = 'onBeforeUpdate',
        ON_UPDATED_KEY = 'onUpdated',
        ON_BEFORE_UNMOUNT_KEY = 'onBeforeUnmount',
        ON_UNMOUNTED_KEY = 'onUnmounted',
        PROPS_KEY = 'props',
        STATE_KEY = 'state',
        SLOTS_KEY = 'slots',
        ROOT_KEY = 'root',
        IS_PURE_SYMBOL = Symbol('pure'),
        IS_COMPONENT_UPDATING = Symbol('is_updating'),
        PARENT_KEY_SYMBOL = Symbol('parent'),
        ATTRIBUTES_KEY_SYMBOL = Symbol('attributes'),
        TEMPLATE_KEY_SYMBOL = Symbol('template');

  var globals = /*#__PURE__*/Object.freeze({
    __proto__: null,
    COMPONENTS_IMPLEMENTATION_MAP: COMPONENTS_IMPLEMENTATION_MAP$1,
    DOM_COMPONENT_INSTANCE_PROPERTY: DOM_COMPONENT_INSTANCE_PROPERTY$1,
    PLUGINS_SET: PLUGINS_SET$1,
    IS_DIRECTIVE: IS_DIRECTIVE,
    VALUE_ATTRIBUTE: VALUE_ATTRIBUTE,
    MOUNT_METHOD_KEY: MOUNT_METHOD_KEY,
    UPDATE_METHOD_KEY: UPDATE_METHOD_KEY,
    UNMOUNT_METHOD_KEY: UNMOUNT_METHOD_KEY,
    SHOULD_UPDATE_KEY: SHOULD_UPDATE_KEY,
    ON_BEFORE_MOUNT_KEY: ON_BEFORE_MOUNT_KEY,
    ON_MOUNTED_KEY: ON_MOUNTED_KEY,
    ON_BEFORE_UPDATE_KEY: ON_BEFORE_UPDATE_KEY,
    ON_UPDATED_KEY: ON_UPDATED_KEY,
    ON_BEFORE_UNMOUNT_KEY: ON_BEFORE_UNMOUNT_KEY,
    ON_UNMOUNTED_KEY: ON_UNMOUNTED_KEY,
    PROPS_KEY: PROPS_KEY,
    STATE_KEY: STATE_KEY,
    SLOTS_KEY: SLOTS_KEY,
    ROOT_KEY: ROOT_KEY,
    IS_PURE_SYMBOL: IS_PURE_SYMBOL,
    IS_COMPONENT_UPDATING: IS_COMPONENT_UPDATING,
    PARENT_KEY_SYMBOL: PARENT_KEY_SYMBOL,
    ATTRIBUTES_KEY_SYMBOL: ATTRIBUTES_KEY_SYMBOL,
    TEMPLATE_KEY_SYMBOL: TEMPLATE_KEY_SYMBOL
  });

  const EACH = 0;
  const IF = 1;
  const SIMPLE = 2;
  const TAG = 3;
  const SLOT = 4;
  var bindingTypes = {
    EACH,
    IF,
    SIMPLE,
    TAG,
    SLOT
  };

  const ATTRIBUTE = 0;
  const EVENT = 1;
  const TEXT = 2;
  const VALUE = 3;
  var expressionTypes = {
    ATTRIBUTE,
    EVENT,
    TEXT,
    VALUE
  };

  const HEAD_SYMBOL = Symbol('head');
  const TAIL_SYMBOL = Symbol('tail');

  /**
   * Create the <template> fragments comment nodes
   * @return {Object} {{head: Comment, tail: Comment}}
   */

  function createHeadTailPlaceholders() {
    const head = document.createComment('fragment head');
    const tail = document.createComment('fragment tail');
    head[HEAD_SYMBOL] = true;
    tail[TAIL_SYMBOL] = true;
    return {
      head,
      tail
    };
  }

  /**
   * Create the template meta object in case of <template> fragments
   * @param   {TemplateChunk} componentTemplate - template chunk object
   * @returns {Object} the meta property that will be passed to the mount function of the TemplateChunk
   */

  function createTemplateMeta(componentTemplate) {
    const fragment = componentTemplate.dom.cloneNode(true);
    const {
      head,
      tail
    } = createHeadTailPlaceholders();
    return {
      avoidDOMInjection: true,
      fragment,
      head,
      tail,
      children: [head, ...Array.from(fragment.childNodes), tail]
    };
  }

  /**
   * Get the current <template> fragment children located in between the head and tail comments
   * @param {Comment} head - head comment node
   * @param {Comment} tail - tail comment node
   * @return {Array[]} children list of the nodes found in this template fragment
   */

  function getFragmentChildren(_ref) {
    let {
      head,
      tail
    } = _ref;
    const nodes = walkNodes([head], head.nextSibling, n => n === tail, false);
    nodes.push(tail);
    return nodes;
  }
  /**
   * Recursive function to walk all the <template> children nodes
   * @param {Array[]} children - children nodes collection
   * @param {ChildNode} node - current node
   * @param {Function} check - exit function check
   * @param {boolean} isFilterActive - filter flag to skip nodes managed by other bindings
   * @returns {Array[]} children list of the nodes found in this template fragment
   */

  function walkNodes(children, node, check, isFilterActive) {
    const {
      nextSibling
    } = node; // filter tail and head nodes together with all the nodes in between
    // this is needed only to fix a really ugly edge case https://github.com/riot/riot/issues/2892

    if (!isFilterActive && !node[HEAD_SYMBOL] && !node[TAIL_SYMBOL]) {
      children.push(node);
    }

    if (!nextSibling || check(node)) return children;
    return walkNodes(children, nextSibling, check, // activate the filters to skip nodes between <template> fragments that will be managed by other bindings
    isFilterActive && !node[TAIL_SYMBOL] || nextSibling[HEAD_SYMBOL]);
  }

  /**
   * Quick type checking
   * @param   {*} element - anything
   * @param   {string} type - type definition
   * @returns {boolean} true if the type corresponds
   */
  function checkType(element, type) {
    return typeof element === type;
  }
  /**
   * Check if an element is part of an svg
   * @param   {HTMLElement}  el - element to check
   * @returns {boolean} true if we are in an svg context
   */

  function isSvg(el) {
    const owner = el.ownerSVGElement;
    return !!owner || owner === null;
  }
  /**
   * Check if an element is a template tag
   * @param   {HTMLElement}  el - element to check
   * @returns {boolean} true if it's a <template>
   */

  function isTemplate(el) {
    return !isNil(el.content);
  }
  /**
   * Check that will be passed if its argument is a function
   * @param   {*} value - value to check
   * @returns {boolean} - true if the value is a function
   */

  function isFunction(value) {
    return checkType(value, 'function');
  }
  /**
   * Check if a value is a Boolean
   * @param   {*}  value - anything
   * @returns {boolean} true only for the value is a boolean
   */

  function isBoolean(value) {
    return checkType(value, 'boolean');
  }
  /**
   * Check if a value is an Object
   * @param   {*}  value - anything
   * @returns {boolean} true only for the value is an object
   */

  function isObject(value) {
    return !isNil(value) && value.constructor === Object;
  }
  /**
   * Check if a value is null or undefined
   * @param   {*}  value - anything
   * @returns {boolean} true only for the 'undefined' and 'null' types
   */

  function isNil(value) {
    return value === null || value === undefined;
  }

  /**
   * ISC License
   *
   * Copyright (c) 2020, Andrea Giammarchi, @WebReflection
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
   * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
   * AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
   * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
   * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE
   * OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
   * PERFORMANCE OF THIS SOFTWARE.
   */
  // fork of https://github.com/WebReflection/udomdiff version 1.1.0
  // due to https://github.com/WebReflection/udomdiff/pull/2

  /* eslint-disable */

  /**
   * @param {Node[]} a The list of current/live children
   * @param {Node[]} b The list of future children
   * @param {(entry: Node, action: number) => Node} get
   * The callback invoked per each entry related DOM operation.
   * @param {Node} [before] The optional node used as anchor to insert before.
   * @returns {Node[]} The same list of future children.
   */

  var udomdiff = ((a, b, get, before) => {
    const bLength = b.length;
    let aEnd = a.length;
    let bEnd = bLength;
    let aStart = 0;
    let bStart = 0;
    let map = null;

    while (aStart < aEnd || bStart < bEnd) {
      // append head, tail, or nodes in between: fast path
      if (aEnd === aStart) {
        // we could be in a situation where the rest of nodes that
        // need to be added are not at the end, and in such case
        // the node to `insertBefore`, if the index is more than 0
        // must be retrieved, otherwise it's gonna be the first item.
        const node = bEnd < bLength ? bStart ? get(b[bStart - 1], -0).nextSibling : get(b[bEnd - bStart], 0) : before;

        while (bStart < bEnd) insertBefore(get(b[bStart++], 1), node);
      } // remove head or tail: fast path
      else if (bEnd === bStart) {
          while (aStart < aEnd) {
            // remove the node only if it's unknown or not live
            if (!map || !map.has(a[aStart])) removeChild(get(a[aStart], -1));
            aStart++;
          }
        } // same node: fast path
        else if (a[aStart] === b[bStart]) {
            aStart++;
            bStart++;
          } // same tail: fast path
          else if (a[aEnd - 1] === b[bEnd - 1]) {
              aEnd--;
              bEnd--;
            } // The once here single last swap "fast path" has been removed in v1.1.0
            // https://github.com/WebReflection/udomdiff/blob/single-final-swap/esm/index.js#L69-L85
            // reverse swap: also fast path
            else if (a[aStart] === b[bEnd - 1] && b[bStart] === a[aEnd - 1]) {
                // this is a "shrink" operation that could happen in these cases:
                // [1, 2, 3, 4, 5]
                // [1, 4, 3, 2, 5]
                // or asymmetric too
                // [1, 2, 3, 4, 5]
                // [1, 2, 3, 5, 6, 4]
                const node = get(a[--aEnd], -1).nextSibling;
                insertBefore(get(b[bStart++], 1), get(a[aStart++], -1).nextSibling);
                insertBefore(get(b[--bEnd], 1), node); // mark the future index as identical (yeah, it's dirty, but cheap 👍)
                // The main reason to do this, is that when a[aEnd] will be reached,
                // the loop will likely be on the fast path, as identical to b[bEnd].
                // In the best case scenario, the next loop will skip the tail,
                // but in the worst one, this node will be considered as already
                // processed, bailing out pretty quickly from the map index check

                a[aEnd] = b[bEnd];
              } // map based fallback, "slow" path
              else {
                  // the map requires an O(bEnd - bStart) operation once
                  // to store all future nodes indexes for later purposes.
                  // In the worst case scenario, this is a full O(N) cost,
                  // and such scenario happens at least when all nodes are different,
                  // but also if both first and last items of the lists are different
                  if (!map) {
                    map = new Map();
                    let i = bStart;

                    while (i < bEnd) map.set(b[i], i++);
                  } // if it's a future node, hence it needs some handling


                  if (map.has(a[aStart])) {
                    // grab the index of such node, 'cause it might have been processed
                    const index = map.get(a[aStart]); // if it's not already processed, look on demand for the next LCS

                    if (bStart < index && index < bEnd) {
                      let i = aStart; // counts the amount of nodes that are the same in the future

                      let sequence = 1;

                      while (++i < aEnd && i < bEnd && map.get(a[i]) === index + sequence) sequence++; // effort decision here: if the sequence is longer than replaces
                      // needed to reach such sequence, which would brings again this loop
                      // to the fast path, prepend the difference before a sequence,
                      // and move only the future list index forward, so that aStart
                      // and bStart will be aligned again, hence on the fast path.
                      // An example considering aStart and bStart are both 0:
                      // a: [1, 2, 3, 4]
                      // b: [7, 1, 2, 3, 6]
                      // this would place 7 before 1 and, from that time on, 1, 2, and 3
                      // will be processed at zero cost


                      if (sequence > index - bStart) {
                        const node = get(a[aStart], 0);

                        while (bStart < index) insertBefore(get(b[bStart++], 1), node);
                      } // if the effort wasn't good enough, fallback to a replace,
                      // moving both source and target indexes forward, hoping that some
                      // similar node will be found later on, to go back to the fast path
                      else {
                          replaceChild(get(b[bStart++], 1), get(a[aStart++], -1));
                        }
                    } // otherwise move the source forward, 'cause there's nothing to do
                    else aStart++;
                  } // this node has no meaning in the future list, so it's more than safe
                  // to remove it, and check the next live node out instead, meaning
                  // that only the live list index should be forwarded
                  else removeChild(get(a[aStart++], -1));
                }
    }

    return b;
  });

  const UNMOUNT_SCOPE = Symbol('unmount');
  const EachBinding = {
    // dynamic binding properties
    // childrenMap: null,
    // node: null,
    // root: null,
    // condition: null,
    // evaluate: null,
    // template: null,
    // isTemplateTag: false,
    nodes: [],

    // getKey: null,
    // indexName: null,
    // itemName: null,
    // afterPlaceholder: null,
    // placeholder: null,
    // API methods
    mount(scope, parentScope) {
      return this.update(scope, parentScope);
    },

    update(scope, parentScope) {
      const {
        placeholder,
        nodes,
        childrenMap
      } = this;
      const collection = scope === UNMOUNT_SCOPE ? null : this.evaluate(scope);
      const items = collection ? Array.from(collection) : []; // prepare the diffing

      const {
        newChildrenMap,
        batches,
        futureNodes
      } = createPatch(items, scope, parentScope, this); // patch the DOM only if there are new nodes

      udomdiff(nodes, futureNodes, patch(Array.from(childrenMap.values()), parentScope), placeholder); // trigger the mounts and the updates

      batches.forEach(fn => fn()); // update the children map

      this.childrenMap = newChildrenMap;
      this.nodes = futureNodes; // make sure that the loop edge nodes are marked

      markEdgeNodes(this.nodes);
      return this;
    },

    unmount(scope, parentScope) {
      this.update(UNMOUNT_SCOPE, parentScope);
      return this;
    }

  };
  /**
   * Patch the DOM while diffing
   * @param   {any[]} redundant - list of all the children (template, nodes, context) added via each
   * @param   {*} parentScope - scope of the parent template
   * @returns {Function} patch function used by domdiff
   */

  function patch(redundant, parentScope) {
    return (item, info) => {
      if (info < 0) {
        // get the last element added to the childrenMap saved previously
        const element = redundant[redundant.length - 1];

        if (element) {
          // get the nodes and the template in stored in the last child of the childrenMap
          const {
            template,
            nodes,
            context
          } = element; // remove the last node (notice <template> tags might have more children nodes)

          nodes.pop(); // notice that we pass null as last argument because
          // the root node and its children will be removed by domdiff

          if (nodes.length === 0) {
            // we have cleared all the children nodes and we can unmount this template
            redundant.pop();
            template.unmount(context, parentScope, null);
          }
        }
      }

      return item;
    };
  }
  /**
   * Check whether a template must be filtered from a loop
   * @param   {Function} condition - filter function
   * @param   {Object} context - argument passed to the filter function
   * @returns {boolean} true if this item should be skipped
   */


  function mustFilterItem(condition, context) {
    return condition ? Boolean(condition(context)) === false : false;
  }
  /**
   * Extend the scope of the looped template
   * @param   {Object} scope - current template scope
   * @param   {string} options.itemName - key to identify the looped item in the new context
   * @param   {string} options.indexName - key to identify the index of the looped item
   * @param   {number} options.index - current index
   * @param   {*} options.item - collection item looped
   * @returns {Object} enhanced scope object
   */


  function extendScope(scope, _ref) {
    let {
      itemName,
      indexName,
      index,
      item
    } = _ref;
    scope[itemName] = item;
    if (indexName) scope[indexName] = index;
    return scope;
  }
  /**
   * Mark the first and last nodes in order to ignore them in case we need to retrieve the <template> fragment nodes
   * @param {Array[]} nodes - each binding nodes list
   * @returns {undefined} void function
   */


  function markEdgeNodes(nodes) {
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (first) first[HEAD_SYMBOL] = true;
    if (last) last[TAIL_SYMBOL] = true;
  }
  /**
   * Loop the current template items
   * @param   {Array} items - expression collection value
   * @param   {*} scope - template scope
   * @param   {*} parentScope - scope of the parent template
   * @param   {EeachBinding} binding - each binding object instance
   * @returns {Object} data
   * @returns {Map} data.newChildrenMap - a Map containing the new children template structure
   * @returns {Array} data.batches - array containing the template lifecycle functions to trigger
   * @returns {Array} data.futureNodes - array containing the nodes we need to diff
   */


  function createPatch(items, scope, parentScope, binding) {
    const {
      condition,
      template,
      childrenMap,
      itemName,
      getKey,
      indexName,
      root,
      isTemplateTag
    } = binding;
    const newChildrenMap = new Map();
    const batches = [];
    const futureNodes = [];
    items.forEach((item, index) => {
      const context = extendScope(Object.create(scope), {
        itemName,
        indexName,
        index,
        item
      });
      const key = getKey ? getKey(context) : index;
      const oldItem = childrenMap.get(key);
      const nodes = [];

      if (mustFilterItem(condition, context)) {
        return;
      }

      const mustMount = !oldItem;
      const componentTemplate = oldItem ? oldItem.template : template.clone();
      const el = componentTemplate.el || root.cloneNode();
      const meta = isTemplateTag && mustMount ? createTemplateMeta(componentTemplate) : componentTemplate.meta;

      if (mustMount) {
        batches.push(() => componentTemplate.mount(el, context, parentScope, meta));
      } else {
        batches.push(() => componentTemplate.update(context, parentScope));
      } // create the collection of nodes to update or to add
      // in case of template tags we need to add all its children nodes


      if (isTemplateTag) {
        nodes.push(...(mustMount ? meta.children : getFragmentChildren(meta)));
      } else {
        nodes.push(el);
      } // delete the old item from the children map


      childrenMap.delete(key);
      futureNodes.push(...nodes); // update the children map

      newChildrenMap.set(key, {
        nodes,
        template: componentTemplate,
        context,
        index
      });
    });
    return {
      newChildrenMap,
      batches,
      futureNodes
    };
  }

  function create$6(node, _ref2) {
    let {
      evaluate,
      condition,
      itemName,
      indexName,
      getKey,
      template
    } = _ref2;
    const placeholder = document.createTextNode('');
    const root = node.cloneNode();
    insertBefore(placeholder, node);
    removeChild(node);
    return Object.assign({}, EachBinding, {
      childrenMap: new Map(),
      node,
      root,
      condition,
      evaluate,
      isTemplateTag: isTemplate(root),
      template: template.createDOM(node),
      getKey,
      indexName,
      itemName,
      placeholder
    });
  }

  /**
   * Binding responsible for the `if` directive
   */

  const IfBinding = {
    // dynamic binding properties
    // node: null,
    // evaluate: null,
    // isTemplateTag: false,
    // placeholder: null,
    // template: null,
    // API methods
    mount(scope, parentScope) {
      return this.update(scope, parentScope);
    },

    update(scope, parentScope) {
      const value = !!this.evaluate(scope);
      const mustMount = !this.value && value;
      const mustUnmount = this.value && !value;

      const mount = () => {
        const pristine = this.node.cloneNode();
        insertBefore(pristine, this.placeholder);
        this.template = this.template.clone();
        this.template.mount(pristine, scope, parentScope);
      };

      switch (true) {
        case mustMount:
          mount();
          break;

        case mustUnmount:
          this.unmount(scope);
          break;

        default:
          if (value) this.template.update(scope, parentScope);
      }

      this.value = value;
      return this;
    },

    unmount(scope, parentScope) {
      this.template.unmount(scope, parentScope, true);
      return this;
    }

  };
  function create$5(node, _ref) {
    let {
      evaluate,
      template
    } = _ref;
    const placeholder = document.createTextNode('');
    insertBefore(placeholder, node);
    removeChild(node);
    return Object.assign({}, IfBinding, {
      node,
      evaluate,
      placeholder,
      template: template.createDOM(node)
    });
  }

  /**
   * Throw an error with a descriptive message
   * @param   { string } message - error message
   * @returns { undefined } hoppla.. at this point the program should stop working
   */

  function panic(message) {
    throw new Error(message);
  }
  /**
   * Returns the memoized (cached) function.
   * // borrowed from https://www.30secondsofcode.org/js/s/memoize
   * @param {Function} fn - function to memoize
   * @returns {Function} memoize function
   */

  function memoize(fn) {
    const cache = new Map();

    const cached = val => {
      return cache.has(val) ? cache.get(val) : cache.set(val, fn.call(this, val)) && cache.get(val);
    };

    cached.cache = cache;
    return cached;
  }
  /**
   * Evaluate a list of attribute expressions
   * @param   {Array} attributes - attribute expressions generated by the riot compiler
   * @returns {Object} key value pairs with the result of the computation
   */

  function evaluateAttributeExpressions(attributes) {
    return attributes.reduce((acc, attribute) => {
      const {
        value,
        type
      } = attribute;

      switch (true) {
        // spread attribute
        case !attribute.name && type === ATTRIBUTE:
          return Object.assign({}, acc, value);
        // value attribute

        case type === VALUE:
          acc.value = attribute.value;
          break;
        // normal attributes

        default:
          acc[dashToCamelCase(attribute.name)] = attribute.value;
      }

      return acc;
    }, {});
  }

  const ElementProto = typeof Element === 'undefined' ? {} : Element.prototype;
  const isNativeHtmlProperty = memoize(name => ElementProto.hasOwnProperty(name)); // eslint-disable-line

  /**
   * Add all the attributes provided
   * @param   {HTMLElement} node - target node
   * @param   {Object} attributes - object containing the attributes names and values
   * @returns {undefined} sorry it's a void function :(
   */

  function setAllAttributes(node, attributes) {
    Object.entries(attributes).forEach(_ref => {
      let [name, value] = _ref;
      return attributeExpression(node, {
        name
      }, value);
    });
  }
  /**
   * Remove all the attributes provided
   * @param   {HTMLElement} node - target node
   * @param   {Object} newAttributes - object containing all the new attribute names
   * @param   {Object} oldAttributes - object containing all the old attribute names
   * @returns {undefined} sorry it's a void function :(
   */


  function removeAllAttributes(node, newAttributes, oldAttributes) {
    const newKeys = newAttributes ? Object.keys(newAttributes) : [];
    Object.keys(oldAttributes).filter(name => !newKeys.includes(name)).forEach(attribute => node.removeAttribute(attribute));
  }
  /**
   * Check whether the attribute value can be rendered
   * @param {*} value - expression value
   * @returns {boolean} true if we can render this attribute value
   */


  function canRenderAttribute(value) {
    return value === true || ['string', 'number'].includes(typeof value);
  }
  /**
   * Check whether the attribute should be removed
   * @param {*} value - expression value
   * @returns {boolean} boolean - true if the attribute can be removed}
   */


  function shouldRemoveAttribute(value) {
    return isNil(value) || value === false || value === '';
  }
  /**
   * This methods handles the DOM attributes updates
   * @param   {HTMLElement} node - target node
   * @param   {Object} expression - expression object
   * @param   {string} expression.name - attribute name
   * @param   {*} value - new expression value
   * @param   {*} oldValue - the old expression cached value
   * @returns {undefined}
   */


  function attributeExpression(node, _ref2, value, oldValue) {
    let {
      name
    } = _ref2;

    // is it a spread operator? {...attributes}
    if (!name) {
      if (oldValue) {
        // remove all the old attributes
        removeAllAttributes(node, value, oldValue);
      } // is the value still truthy?


      if (value) {
        setAllAttributes(node, value);
      }

      return;
    } // handle boolean attributes


    if (!isNativeHtmlProperty(name) && (isBoolean(value) || isObject(value) || isFunction(value))) {
      node[name] = value;
    }

    if (shouldRemoveAttribute(value)) {
      node.removeAttribute(name);
    } else if (canRenderAttribute(value)) {
      node.setAttribute(name, normalizeValue(name, value));
    }
  }
  /**
   * Get the value as string
   * @param   {string} name - attribute name
   * @param   {*} value - user input value
   * @returns {string} input value as string
   */

  function normalizeValue(name, value) {
    // be sure that expressions like selected={ true } will be always rendered as selected='selected'
    if (value === true) return name;
    return value;
  }

  const RE_EVENTS_PREFIX = /^on/;

  const getCallbackAndOptions = value => Array.isArray(value) ? value : [value, false]; // see also https://medium.com/@WebReflection/dom-handleevent-a-cross-platform-standard-since-year-2000-5bf17287fd38


  const EventListener = {
    handleEvent(event) {
      this[event.type](event);
    }

  };
  const ListenersWeakMap = new WeakMap();

  const createListener = node => {
    const listener = Object.create(EventListener);
    ListenersWeakMap.set(node, listener);
    return listener;
  };
  /**
   * Set a new event listener
   * @param   {HTMLElement} node - target node
   * @param   {Object} expression - expression object
   * @param   {string} expression.name - event name
   * @param   {*} value - new expression value
   * @returns {value} the callback just received
   */


  function eventExpression(node, _ref, value) {
    let {
      name
    } = _ref;
    const normalizedEventName = name.replace(RE_EVENTS_PREFIX, '');
    const eventListener = ListenersWeakMap.get(node) || createListener(node);
    const [callback, options] = getCallbackAndOptions(value);
    const handler = eventListener[normalizedEventName];
    const mustRemoveEvent = handler && !callback;
    const mustAddEvent = callback && !handler;

    if (mustRemoveEvent) {
      node.removeEventListener(normalizedEventName, eventListener);
    }

    if (mustAddEvent) {
      node.addEventListener(normalizedEventName, eventListener, options);
    }

    eventListener[normalizedEventName] = callback;
  }

  /**
   * Normalize the user value in order to render a empty string in case of falsy values
   * @param   {*} value - user input value
   * @returns {string} hopefully a string
   */

  function normalizeStringValue(value) {
    return isNil(value) ? '' : value;
  }

  /**
   * Get the the target text node to update or create one from of a comment node
   * @param   {HTMLElement} node - any html element containing childNodes
   * @param   {number} childNodeIndex - index of the text node in the childNodes list
   * @returns {HTMLTextNode} the text node to update
   */

  const getTextNode = (node, childNodeIndex) => {
    const target = node.childNodes[childNodeIndex];

    if (target.nodeType === Node.COMMENT_NODE) {
      const textNode = document.createTextNode('');
      node.replaceChild(textNode, target);
      return textNode;
    }

    return target;
  };
  /**
   * This methods handles a simple text expression update
   * @param   {HTMLElement} node - target node
   * @param   {Object} data - expression object
   * @param   {*} value - new expression value
   * @returns {undefined}
   */

  function textExpression(node, data, value) {
    node.data = normalizeStringValue(value);
  }

  /**
   * This methods handles the input fileds value updates
   * @param   {HTMLElement} node - target node
   * @param   {Object} expression - expression object
   * @param   {*} value - new expression value
   * @returns {undefined}
   */

  function valueExpression(node, expression, value) {
    node.value = normalizeStringValue(value);
  }

  var expressions = {
    [ATTRIBUTE]: attributeExpression,
    [EVENT]: eventExpression,
    [TEXT]: textExpression,
    [VALUE]: valueExpression
  };

  const Expression = {
    // Static props
    // node: null,
    // value: null,
    // API methods

    /**
     * Mount the expression evaluating its initial value
     * @param   {*} scope - argument passed to the expression to evaluate its current values
     * @returns {Expression} self
     */
    mount(scope) {
      // hopefully a pure function
      this.value = this.evaluate(scope); // IO() DOM updates

      apply(this, this.value);
      return this;
    },

    /**
     * Update the expression if its value changed
     * @param   {*} scope - argument passed to the expression to evaluate its current values
     * @returns {Expression} self
     */
    update(scope) {
      // pure function
      const value = this.evaluate(scope);

      if (this.value !== value) {
        // IO() DOM updates
        apply(this, value);
        this.value = value;
      }

      return this;
    },

    /**
     * Expression teardown method
     * @returns {Expression} self
     */
    unmount() {
      // unmount only the event handling expressions
      if (this.type === EVENT) apply(this, null);
      return this;
    }

  };
  /**
   * IO() function to handle the DOM updates
   * @param {Expression} expression - expression object
   * @param {*} value - current expression value
   * @returns {undefined}
   */

  function apply(expression, value) {
    return expressions[expression.type](expression.node, expression, value, expression.value);
  }

  function create$4(node, data) {
    return Object.assign({}, Expression, data, {
      node: data.type === TEXT ? getTextNode(node, data.childNodeIndex) : node
    });
  }

  /**
   * Create a flat object having as keys a list of methods that if dispatched will propagate
   * on the whole collection
   * @param   {Array} collection - collection to iterate
   * @param   {Array<string>} methods - methods to execute on each item of the collection
   * @param   {*} context - context returned by the new methods created
   * @returns {Object} a new object to simplify the the nested methods dispatching
   */
  function flattenCollectionMethods(collection, methods, context) {
    return methods.reduce((acc, method) => {
      return Object.assign({}, acc, {
        [method]: scope => {
          return collection.map(item => item[method](scope)) && context;
        }
      });
    }, {});
  }

  function create$3(node, _ref) {
    let {
      expressions
    } = _ref;
    return Object.assign({}, flattenCollectionMethods(expressions.map(expression => create$4(node, expression)), ['mount', 'update', 'unmount']));
  }

  function extendParentScope(attributes, scope, parentScope) {
    if (!attributes || !attributes.length) return parentScope;
    const expressions = attributes.map(attr => Object.assign({}, attr, {
      value: attr.evaluate(scope)
    }));
    return Object.assign(Object.create(parentScope || null), evaluateAttributeExpressions(expressions));
  } // this function is only meant to fix an edge case
  // https://github.com/riot/riot/issues/2842


  const getRealParent = (scope, parentScope) => scope[PARENT_KEY_SYMBOL] || parentScope;

  const SlotBinding = {
    // dynamic binding properties
    // node: null,
    // name: null,
    attributes: [],

    // template: null,
    getTemplateScope(scope, parentScope) {
      return extendParentScope(this.attributes, scope, parentScope);
    },

    // API methods
    mount(scope, parentScope) {
      const templateData = scope.slots ? scope.slots.find(_ref => {
        let {
          id
        } = _ref;
        return id === this.name;
      }) : false;
      const {
        parentNode
      } = this.node;
      const realParent = getRealParent(scope, parentScope);
      this.template = templateData && create(templateData.html, templateData.bindings).createDOM(parentNode);

      if (this.template) {
        this.template.mount(this.node, this.getTemplateScope(scope, realParent), realParent);
        this.template.children = Array.from(this.node.childNodes);
        moveSlotInnerContent(this.node);
      }

      removeChild(this.node);
      return this;
    },

    update(scope, parentScope) {
      if (this.template) {
        const realParent = getRealParent(scope, parentScope);
        this.template.update(this.getTemplateScope(scope, realParent), realParent);
      }

      return this;
    },

    unmount(scope, parentScope, mustRemoveRoot) {
      if (this.template) {
        this.template.unmount(this.getTemplateScope(scope, parentScope), null, mustRemoveRoot);
      }

      return this;
    }

  };
  /**
   * Move the inner content of the slots outside of them
   * @param   {HTMLElement} slot - slot node
   * @returns {undefined} it's a void method ¯\_(ツ)_/¯
   */

  function moveSlotInnerContent(slot) {
    const child = slot && slot.firstChild;
    if (!child) return;
    insertBefore(child, slot);
    moveSlotInnerContent(slot);
  }
  /**
   * Create a single slot binding
   * @param   {HTMLElement} node - slot node
   * @param   {string} options.name - slot id
   * @returns {Object} Slot binding object
   */


  function createSlot(node, _ref2) {
    let {
      name,
      attributes
    } = _ref2;
    return Object.assign({}, SlotBinding, {
      attributes,
      node,
      name
    });
  }

  /**
   * Create a new tag object if it was registered before, otherwise fallback to the simple
   * template chunk
   * @param   {Function} component - component factory function
   * @param   {Array<Object>} slots - array containing the slots markup
   * @param   {Array} attributes - dynamic attributes that will be received by the tag element
   * @returns {TagImplementation|TemplateChunk} a tag implementation or a template chunk as fallback
   */

  function getTag(component, slots, attributes) {
    if (slots === void 0) {
      slots = [];
    }

    if (attributes === void 0) {
      attributes = [];
    }

    // if this tag was registered before we will return its implementation
    if (component) {
      return component({
        slots,
        attributes
      });
    } // otherwise we return a template chunk


    return create(slotsToMarkup(slots), [...slotBindings(slots), {
      // the attributes should be registered as binding
      // if we fallback to a normal template chunk
      expressions: attributes.map(attr => {
        return Object.assign({
          type: ATTRIBUTE
        }, attr);
      })
    }]);
  }
  /**
   * Merge all the slots bindings into a single array
   * @param   {Array<Object>} slots - slots collection
   * @returns {Array<Bindings>} flatten bindings array
   */


  function slotBindings(slots) {
    return slots.reduce((acc, _ref) => {
      let {
        bindings
      } = _ref;
      return acc.concat(bindings);
    }, []);
  }
  /**
   * Merge all the slots together in a single markup string
   * @param   {Array<Object>} slots - slots collection
   * @returns {string} markup of all the slots in a single string
   */


  function slotsToMarkup(slots) {
    return slots.reduce((acc, slot) => {
      return acc + slot.html;
    }, '');
  }

  const TagBinding = {
    // dynamic binding properties
    // node: null,
    // evaluate: null,
    // name: null,
    // slots: null,
    // tag: null,
    // attributes: null,
    // getComponent: null,
    mount(scope) {
      return this.update(scope);
    },

    update(scope, parentScope) {
      const name = this.evaluate(scope); // simple update

      if (name && name === this.name) {
        this.tag.update(scope);
      } else {
        // unmount the old tag if it exists
        this.unmount(scope, parentScope, true); // mount the new tag

        this.name = name;
        this.tag = getTag(this.getComponent(name), this.slots, this.attributes);
        this.tag.mount(this.node, scope);
      }

      return this;
    },

    unmount(scope, parentScope, keepRootTag) {
      if (this.tag) {
        // keep the root tag
        this.tag.unmount(keepRootTag);
      }

      return this;
    }

  };
  function create$2(node, _ref2) {
    let {
      evaluate,
      getComponent,
      slots,
      attributes
    } = _ref2;
    return Object.assign({}, TagBinding, {
      node,
      evaluate,
      slots,
      attributes,
      getComponent
    });
  }

  var bindings = {
    [IF]: create$5,
    [SIMPLE]: create$3,
    [EACH]: create$6,
    [TAG]: create$2,
    [SLOT]: createSlot
  };

  /**
   * Text expressions in a template tag will get childNodeIndex value normalized
   * depending on the position of the <template> tag offset
   * @param   {Expression[]} expressions - riot expressions array
   * @param   {number} textExpressionsOffset - offset of the <template> tag
   * @returns {Expression[]} expressions containing the text expressions normalized
   */

  function fixTextExpressionsOffset(expressions, textExpressionsOffset) {
    return expressions.map(e => e.type === TEXT ? Object.assign({}, e, {
      childNodeIndex: e.childNodeIndex + textExpressionsOffset
    }) : e);
  }
  /**
   * Bind a new expression object to a DOM node
   * @param   {HTMLElement} root - DOM node where to bind the expression
   * @param   {Object} binding - binding data
   * @param   {number|null} templateTagOffset - if it's defined we need to fix the text expressions childNodeIndex offset
   * @returns {Binding} Binding object
   */


  function create$1(root, binding, templateTagOffset) {
    const {
      selector,
      type,
      redundantAttribute,
      expressions
    } = binding; // find the node to apply the bindings

    const node = selector ? root.querySelector(selector) : root; // remove eventually additional attributes created only to select this node

    if (redundantAttribute) node.removeAttribute(redundantAttribute);
    const bindingExpressions = expressions || []; // init the binding

    return (bindings[type] || bindings[SIMPLE])(node, Object.assign({}, binding, {
      expressions: templateTagOffset && !selector ? fixTextExpressionsOffset(bindingExpressions, templateTagOffset) : bindingExpressions
    }));
  }

  function createHTMLTree(html, root) {
    const template = isTemplate(root) ? root : document.createElement('template');
    template.innerHTML = html;
    return template.content;
  } // for svg nodes we need a bit more work


  function createSVGTree(html, container) {
    // create the SVGNode
    const svgNode = container.ownerDocument.importNode(new window.DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${html}</svg>`, 'application/xml').documentElement, true);
    return svgNode;
  }
  /**
   * Create the DOM that will be injected
   * @param {Object} root - DOM node to find out the context where the fragment will be created
   * @param   {string} html - DOM to create as string
   * @returns {HTMLDocumentFragment|HTMLElement} a new html fragment
   */


  function createDOMTree(root, html) {
    if (isSvg(root)) return createSVGTree(html, root);
    return createHTMLTree(html, root);
  }

  /**
   * Inject the DOM tree into a target node
   * @param   {HTMLElement} el - target element
   * @param   {HTMLFragment|SVGElement} dom - dom tree to inject
   * @returns {undefined}
   */

  function injectDOM(el, dom) {
    switch (true) {
      case isSvg(el):
        moveChildren(dom, el);
        break;

      case isTemplate(el):
        el.parentNode.replaceChild(dom, el);
        break;

      default:
        el.appendChild(dom);
    }
  }

  /**
   * Create the Template DOM skeleton
   * @param   {HTMLElement} el - root node where the DOM will be injected
   * @param   {string} html - markup that will be injected into the root node
   * @returns {HTMLFragment} fragment that will be injected into the root node
   */

  function createTemplateDOM(el, html) {
    return html && (typeof html === 'string' ? createDOMTree(el, html) : html);
  }
  /**
   * Template Chunk model
   * @type {Object}
   */


  const TemplateChunk = Object.freeze({
    // Static props
    // bindings: null,
    // bindingsData: null,
    // html: null,
    // isTemplateTag: false,
    // fragment: null,
    // children: null,
    // dom: null,
    // el: null,

    /**
     * Create the template DOM structure that will be cloned on each mount
     * @param   {HTMLElement} el - the root node
     * @returns {TemplateChunk} self
     */
    createDOM(el) {
      // make sure that the DOM gets created before cloning the template
      this.dom = this.dom || createTemplateDOM(el, this.html);
      return this;
    },

    // API methods

    /**
     * Attach the template to a DOM node
     * @param   {HTMLElement} el - target DOM node
     * @param   {*} scope - template data
     * @param   {*} parentScope - scope of the parent template tag
     * @param   {Object} meta - meta properties needed to handle the <template> tags in loops
     * @returns {TemplateChunk} self
     */
    mount(el, scope, parentScope, meta) {
      if (meta === void 0) {
        meta = {};
      }

      if (!el) throw new Error('Please provide DOM node to mount properly your template');
      if (this.el) this.unmount(scope); // <template> tags require a bit more work
      // the template fragment might be already created via meta outside of this call

      const {
        fragment,
        children,
        avoidDOMInjection
      } = meta; // <template> bindings of course can not have a root element
      // so we check the parent node to set the query selector bindings

      const {
        parentNode
      } = children ? children[0] : el;
      const isTemplateTag = isTemplate(el);
      const templateTagOffset = isTemplateTag ? Math.max(Array.from(parentNode.childNodes).indexOf(el), 0) : null;
      this.isTemplateTag = isTemplateTag; // create the DOM if it wasn't created before

      this.createDOM(el);

      if (this.dom) {
        // create the new template dom fragment if it want already passed in via meta
        this.fragment = fragment || this.dom.cloneNode(true);
      } // store root node
      // notice that for template tags the root note will be the parent tag


      this.el = this.isTemplateTag ? parentNode : el; // create the children array only for the <template> fragments

      this.children = this.isTemplateTag ? children || Array.from(this.fragment.childNodes) : null; // inject the DOM into the el only if a fragment is available

      if (!avoidDOMInjection && this.fragment) injectDOM(el, this.fragment); // create the bindings

      this.bindings = this.bindingsData.map(binding => create$1(this.el, binding, templateTagOffset));
      this.bindings.forEach(b => b.mount(scope, parentScope)); // store the template meta properties

      this.meta = meta;
      return this;
    },

    /**
     * Update the template with fresh data
     * @param   {*} scope - template data
     * @param   {*} parentScope - scope of the parent template tag
     * @returns {TemplateChunk} self
     */
    update(scope, parentScope) {
      this.bindings.forEach(b => b.update(scope, parentScope));
      return this;
    },

    /**
     * Remove the template from the node where it was initially mounted
     * @param   {*} scope - template data
     * @param   {*} parentScope - scope of the parent template tag
     * @param   {boolean|null} mustRemoveRoot - if true remove the root element,
     * if false or undefined clean the root tag content, if null don't touch the DOM
     * @returns {TemplateChunk} self
     */
    unmount(scope, parentScope, mustRemoveRoot) {
      if (this.el) {
        this.bindings.forEach(b => b.unmount(scope, parentScope, mustRemoveRoot));

        switch (true) {
          // pure components should handle the DOM unmount updates by themselves
          case this.el[IS_PURE_SYMBOL]:
            break;
          // <template> tags should be treated a bit differently
          // we need to clear their children only if it's explicitly required by the caller
          // via mustRemoveRoot !== null

          case this.children && mustRemoveRoot !== null:
            clearChildren(this.children);
            break;
          // remove the root node only if the mustRemoveRoot === true

          case mustRemoveRoot === true:
            removeChild(this.el);
            break;
          // otherwise we clean the node children

          case mustRemoveRoot !== null:
            cleanNode(this.el);
            break;
        }

        this.el = null;
      }

      return this;
    },

    /**
     * Clone the template chunk
     * @returns {TemplateChunk} a clone of this object resetting the this.el property
     */
    clone() {
      return Object.assign({}, this, {
        meta: {},
        el: null
      });
    }

  });
  /**
   * Create a template chunk wiring also the bindings
   * @param   {string|HTMLElement} html - template string
   * @param   {Array} bindings - bindings collection
   * @returns {TemplateChunk} a new TemplateChunk copy
   */

  function create(html, bindings) {
    if (bindings === void 0) {
      bindings = [];
    }

    return Object.assign({}, TemplateChunk, {
      html,
      bindingsData: bindings
    });
  }

  function noop() {
    return this;
  }
  /**
   * Autobind the methods of a source object to itself
   * @param   {Object} source - probably a riot tag instance
   * @param   {Array<string>} methods - list of the methods to autobind
   * @returns {Object} the original object received
   */

  function autobindMethods(source, methods) {
    methods.forEach(method => {
      source[method] = source[method].bind(source);
    });
    return source;
  }
  /**
   * Call the first argument received only if it's a function otherwise return it as it is
   * @param   {*} source - anything
   * @returns {*} anything
   */

  function callOrAssign(source) {
    return isFunction(source) ? source.prototype && source.prototype.constructor ? new source() : source() : source;
  }

  /**
   * Helper function to set an immutable property
   * @param   {Object} source - object where the new property will be set
   * @param   {string} key - object key where the new property will be stored
   * @param   {*} value - value of the new property
   * @param   {Object} options - set the propery overriding the default options
   * @returns {Object} - the original object modified
   */
  function defineProperty(source, key, value, options) {
    if (options === void 0) {
      options = {};
    }

    /* eslint-disable fp/no-mutating-methods */
    Object.defineProperty(source, key, Object.assign({
      value,
      enumerable: false,
      writable: false,
      configurable: true
    }, options));
    /* eslint-enable fp/no-mutating-methods */

    return source;
  }
  /**
   * Define multiple properties on a target object
   * @param   {Object} source - object where the new properties will be set
   * @param   {Object} properties - object containing as key pair the key + value properties
   * @param   {Object} options - set the propery overriding the default options
   * @returns {Object} the original object modified
   */

  function defineProperties(source, properties, options) {
    Object.entries(properties).forEach(_ref => {
      let [key, value] = _ref;
      defineProperty(source, key, value, options);
    });
    return source;
  }
  /**
   * Define default properties if they don't exist on the source object
   * @param   {Object} source - object that will receive the default properties
   * @param   {Object} defaults - object containing additional optional keys
   * @returns {Object} the original object received enhanced
   */

  function defineDefaults(source, defaults) {
    Object.entries(defaults).forEach(_ref2 => {
      let [key, value] = _ref2;
      if (!source[key]) source[key] = value;
    });
    return source;
  }

  /**
   * Converts any DOM node/s to a loopable array
   * @param   { HTMLElement|NodeList } els - single html element or a node list
   * @returns { Array } always a loopable object
   */
  function domToArray(els) {
    // can this object be already looped?
    if (!Array.isArray(els)) {
      // is it a node list?
      if (/^\[object (HTMLCollection|NodeList|Object)\]$/.test(Object.prototype.toString.call(els)) && typeof els.length === 'number') return Array.from(els);else // if it's a single node
        // it will be returned as "array" with one single entry
        return [els];
    } // this object could be looped out of the box


    return els;
  }

  /**
   * Simple helper to find DOM nodes returning them as array like loopable object
   * @param   { string|DOMNodeList } selector - either the query or the DOM nodes to arraify
   * @param   { HTMLElement }        ctx      - context defining where the query will search for the DOM nodes
   * @returns { Array } DOM nodes found as array
   */

  function $(selector, ctx) {
    return domToArray(typeof selector === 'string' ? (ctx || document).querySelectorAll(selector) : selector);
  }

  /**
   * Normalize the return values, in case of a single value we avoid to return an array
   * @param   { Array } values - list of values we want to return
   * @returns { Array|string|boolean } either the whole list of values or the single one found
   * @private
   */

  const normalize = values => values.length === 1 ? values[0] : values;
  /**
   * Parse all the nodes received to get/remove/check their attributes
   * @param   { HTMLElement|NodeList|Array } els    - DOM node/s to parse
   * @param   { string|Array }               name   - name or list of attributes
   * @param   { string }                     method - method that will be used to parse the attributes
   * @returns { Array|string } result of the parsing in a list or a single value
   * @private
   */


  function parseNodes(els, name, method) {
    const names = typeof name === 'string' ? [name] : name;
    return normalize(domToArray(els).map(el => {
      return normalize(names.map(n => el[method](n)));
    }));
  }
  /**
   * Set any attribute on a single or a list of DOM nodes
   * @param   { HTMLElement|NodeList|Array } els   - DOM node/s to parse
   * @param   { string|Object }              name  - either the name of the attribute to set
   *                                                 or a list of properties as object key - value
   * @param   { string }                     value - the new value of the attribute (optional)
   * @returns { HTMLElement|NodeList|Array } the original array of elements passed to this function
   *
   * @example
   *
   * import { set } from 'bianco.attr'
   *
   * const img = document.createElement('img')
   *
   * set(img, 'width', 100)
   *
   * // or also
   * set(img, {
   *   width: 300,
   *   height: 300
   * })
   *
   */


  function set(els, name, value) {
    const attrs = typeof name === 'object' ? name : {
      [name]: value
    };
    const props = Object.keys(attrs);
    domToArray(els).forEach(el => {
      props.forEach(prop => el.setAttribute(prop, attrs[prop]));
    });
    return els;
  }
  /**
   * Get any attribute from a single or a list of DOM nodes
   * @param   { HTMLElement|NodeList|Array } els   - DOM node/s to parse
   * @param   { string|Array }               name  - name or list of attributes to get
   * @returns { Array|string } list of the attributes found
   *
   * @example
   *
   * import { get } from 'bianco.attr'
   *
   * const img = document.createElement('img')
   *
   * get(img, 'width') // => '200'
   *
   * // or also
   * get(img, ['width', 'height']) // => ['200', '300']
   *
   * // or also
   * get([img1, img2], ['width', 'height']) // => [['200', '300'], ['500', '200']]
   */

  function get(els, name) {
    return parseNodes(els, name, 'getAttribute');
  }

  const CSS_BY_NAME = new Map();
  const STYLE_NODE_SELECTOR = 'style[riot]'; // memoized curried function

  const getStyleNode = (style => {
    return () => {
      // lazy evaluation:
      // if this function was already called before
      // we return its cached result
      if (style) return style; // create a new style element or use an existing one
      // and cache it internally

      style = $(STYLE_NODE_SELECTOR)[0] || document.createElement('style');
      set(style, 'type', 'text/css');
      /* istanbul ignore next */

      if (!style.parentNode) document.head.appendChild(style);
      return style;
    };
  })();
  /**
   * Object that will be used to inject and manage the css of every tag instance
   */


  var cssManager = {
    CSS_BY_NAME,

    /**
     * Save a tag style to be later injected into DOM
     * @param { string } name - if it's passed we will map the css to a tagname
     * @param { string } css - css string
     * @returns {Object} self
     */
    add(name, css) {
      if (!CSS_BY_NAME.has(name)) {
        CSS_BY_NAME.set(name, css);
        this.inject();
      }

      return this;
    },

    /**
     * Inject all previously saved tag styles into DOM
     * innerHTML seems slow: http://jsperf.com/riot-insert-style
     * @returns {Object} self
     */
    inject() {
      getStyleNode().innerHTML = [...CSS_BY_NAME.values()].join('\n');
      return this;
    },

    /**
     * Remove a tag style from the DOM
     * @param {string} name a registered tagname
     * @returns {Object} self
     */
    remove(name) {
      if (CSS_BY_NAME.has(name)) {
        CSS_BY_NAME.delete(name);
        this.inject();
      }

      return this;
    }

  };

  /**
   * Function to curry any javascript method
   * @param   {Function}  fn - the target function we want to curry
   * @param   {...[args]} acc - initial arguments
   * @returns {Function|*} it will return a function until the target function
   *                       will receive all of its arguments
   */
  function curry(fn) {
    for (var _len = arguments.length, acc = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      acc[_key - 1] = arguments[_key];
    }

    return function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      args = [...acc, ...args];
      return args.length < fn.length ? curry(fn, ...args) : fn(...args);
    };
  }

  /**
   * Get the tag name of any DOM node
   * @param   {HTMLElement} element - DOM node we want to inspect
   * @returns {string} name to identify this dom node in riot
   */

  function getName(element) {
    return get(element, IS_DIRECTIVE) || element.tagName.toLowerCase();
  }

  const COMPONENT_CORE_HELPERS = Object.freeze({
    // component helpers
    $(selector) {
      return $(selector, this.root)[0];
    },

    $$(selector) {
      return $(selector, this.root);
    }

  });
  const PURE_COMPONENT_API = Object.freeze({
    [MOUNT_METHOD_KEY]: noop,
    [UPDATE_METHOD_KEY]: noop,
    [UNMOUNT_METHOD_KEY]: noop
  });
  const COMPONENT_LIFECYCLE_METHODS = Object.freeze({
    [SHOULD_UPDATE_KEY]: noop,
    [ON_BEFORE_MOUNT_KEY]: noop,
    [ON_MOUNTED_KEY]: noop,
    [ON_BEFORE_UPDATE_KEY]: noop,
    [ON_UPDATED_KEY]: noop,
    [ON_BEFORE_UNMOUNT_KEY]: noop,
    [ON_UNMOUNTED_KEY]: noop
  });
  const MOCKED_TEMPLATE_INTERFACE = Object.assign({}, PURE_COMPONENT_API, {
    clone: noop,
    createDOM: noop
  });
  /**
   * Performance optimization for the recursive components
   * @param  {RiotComponentShell} componentShell - riot compiler generated object
   * @returns {Object} component like interface
   */

  const memoizedCreateComponent = memoize(createComponent);
  /**
   * Evaluate the component properties either from its real attributes or from its initial user properties
   * @param   {HTMLElement} element - component root
   * @param   {Object}  initialProps - initial props
   * @returns {Object} component props key value pairs
   */

  function evaluateInitialProps(element, initialProps) {
    if (initialProps === void 0) {
      initialProps = {};
    }

    return Object.assign({}, DOMattributesToObject(element), callOrAssign(initialProps));
  }
  /**
   * Bind a DOM node to its component object
   * @param   {HTMLElement} node - html node mounted
   * @param   {Object} component - Riot.js component object
   * @returns {Object} the component object received as second argument
   */


  const bindDOMNodeToComponentObject = (node, component) => node[DOM_COMPONENT_INSTANCE_PROPERTY$1] = component;
  /**
   * Wrap the Riot.js core API methods using a mapping function
   * @param   {Function} mapFunction - lifting function
   * @returns {Object} an object having the { mount, update, unmount } functions
   */


  function createCoreAPIMethods(mapFunction) {
    return [MOUNT_METHOD_KEY, UPDATE_METHOD_KEY, UNMOUNT_METHOD_KEY].reduce((acc, method) => {
      acc[method] = mapFunction(method);
      return acc;
    }, {});
  }
  /**
   * Factory function to create the component templates only once
   * @param   {Function} template - component template creation function
   * @param   {RiotComponentShell} componentShell - riot compiler generated object
   * @returns {TemplateChunk} template chunk object
   */


  function componentTemplateFactory(template, componentShell) {
    const components = createSubcomponents(componentShell.exports ? componentShell.exports.components : {});
    return template(create, expressionTypes, bindingTypes, name => {
      // improve support for recursive components
      if (name === componentShell.name) return memoizedCreateComponent(componentShell); // return the registered components

      return components[name] || COMPONENTS_IMPLEMENTATION_MAP$1.get(name);
    });
  }
  /**
   * Create a pure component
   * @param   {Function} pureFactoryFunction - pure component factory function
   * @param   {Array} options.slots - component slots
   * @param   {Array} options.attributes - component attributes
   * @param   {Array} options.template - template factory function
   * @param   {Array} options.template - template factory function
   * @param   {any} options.props - initial component properties
   * @returns {Object} pure component object
   */


  function createPureComponent(pureFactoryFunction, _ref) {
    let {
      slots,
      attributes,
      props,
      css,
      template
    } = _ref;
    if (template) panic('Pure components can not have html');
    if (css) panic('Pure components do not have css');
    const component = defineDefaults(pureFactoryFunction({
      slots,
      attributes,
      props
    }), PURE_COMPONENT_API);
    return createCoreAPIMethods(method => function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // intercept the mount calls to bind the DOM node to the pure object created
      // see also https://github.com/riot/riot/issues/2806
      if (method === MOUNT_METHOD_KEY) {
        const [el] = args; // mark this node as pure element

        el[IS_PURE_SYMBOL] = true;
        bindDOMNodeToComponentObject(el, component);
      }

      component[method](...args);
      return component;
    });
  }
  /**
   * Create the component interface needed for the @riotjs/dom-bindings tag bindings
   * @param   {RiotComponentShell} componentShell - riot compiler generated object
   * @param   {string} componentShell.css - component css
   * @param   {Function} componentShell.template - function that will return the dom-bindings template function
   * @param   {Object} componentShell.exports - component interface
   * @param   {string} componentShell.name - component name
   * @returns {Object} component like interface
   */


  function createComponent(componentShell) {
    const {
      css,
      template,
      exports,
      name
    } = componentShell;
    const templateFn = template ? componentTemplateFactory(template, componentShell) : MOCKED_TEMPLATE_INTERFACE;
    return _ref2 => {
      let {
        slots,
        attributes,
        props
      } = _ref2;
      // pure components rendering will be managed by the end user
      if (exports && exports[IS_PURE_SYMBOL]) return createPureComponent(exports, {
        slots,
        attributes,
        props,
        css,
        template
      });
      const componentAPI = callOrAssign(exports) || {};
      const component = defineComponent({
        css,
        template: templateFn,
        componentAPI,
        name
      })({
        slots,
        attributes,
        props
      }); // notice that for the components create via tag binding
      // we need to invert the mount (state/parentScope) arguments
      // the template bindings will only forward the parentScope updates
      // and never deal with the component state

      return {
        mount(element, parentScope, state) {
          return component.mount(element, state, parentScope);
        },

        update(parentScope, state) {
          return component.update(state, parentScope);
        },

        unmount(preserveRoot) {
          return component.unmount(preserveRoot);
        }

      };
    };
  }
  /**
   * Component definition function
   * @param   {Object} implementation - the componen implementation will be generated via compiler
   * @param   {Object} component - the component initial properties
   * @returns {Object} a new component implementation object
   */

  function defineComponent(_ref3) {
    let {
      css,
      template,
      componentAPI,
      name
    } = _ref3;
    // add the component css into the DOM
    if (css && name) cssManager.add(name, css);
    return curry(enhanceComponentAPI)(defineProperties( // set the component defaults without overriding the original component API
    defineDefaults(componentAPI, Object.assign({}, COMPONENT_LIFECYCLE_METHODS, {
      [PROPS_KEY]: {},
      [STATE_KEY]: {}
    })), Object.assign({
      // defined during the component creation
      [SLOTS_KEY]: null,
      [ROOT_KEY]: null
    }, COMPONENT_CORE_HELPERS, {
      name,
      css,
      template
    })));
  }
  /**
   * Create the bindings to update the component attributes
   * @param   {HTMLElement} node - node where we will bind the expressions
   * @param   {Array} attributes - list of attribute bindings
   * @returns {TemplateChunk} - template bindings object
   */

  function createAttributeBindings(node, attributes) {
    if (attributes === void 0) {
      attributes = [];
    }

    const expressions = attributes.map(a => create$4(node, a));
    const binding = {};
    return Object.assign(binding, Object.assign({
      expressions
    }, createCoreAPIMethods(method => scope => {
      expressions.forEach(e => e[method](scope));
      return binding;
    })));
  }
  /**
   * Create the subcomponents that can be included inside a tag in runtime
   * @param   {Object} components - components imported in runtime
   * @returns {Object} all the components transformed into Riot.Component factory functions
   */


  function createSubcomponents(components) {
    if (components === void 0) {
      components = {};
    }

    return Object.entries(callOrAssign(components)).reduce((acc, _ref4) => {
      let [key, value] = _ref4;
      acc[camelToDashCase(key)] = createComponent(value);
      return acc;
    }, {});
  }
  /**
   * Run the component instance through all the plugins set by the user
   * @param   {Object} component - component instance
   * @returns {Object} the component enhanced by the plugins
   */


  function runPlugins(component) {
    return [...PLUGINS_SET$1].reduce((c, fn) => fn(c) || c, component);
  }
  /**
   * Compute the component current state merging it with its previous state
   * @param   {Object} oldState - previous state object
   * @param   {Object} newState - new state givent to the `update` call
   * @returns {Object} new object state
   */


  function computeState(oldState, newState) {
    return Object.assign({}, oldState, callOrAssign(newState));
  }
  /**
   * Add eventually the "is" attribute to link this DOM node to its css
   * @param {HTMLElement} element - target root node
   * @param {string} name - name of the component mounted
   * @returns {undefined} it's a void function
   */


  function addCssHook(element, name) {
    if (getName(element) !== name) {
      set(element, IS_DIRECTIVE, name);
    }
  }
  /**
   * Component creation factory function that will enhance the user provided API
   * @param   {Object} component - a component implementation previously defined
   * @param   {Array} options.slots - component slots generated via riot compiler
   * @param   {Array} options.attributes - attribute expressions generated via riot compiler
   * @returns {Riot.Component} a riot component instance
   */


  function enhanceComponentAPI(component, _ref5) {
    let {
      slots,
      attributes,
      props
    } = _ref5;
    return autobindMethods(runPlugins(defineProperties(isObject(component) ? Object.create(component) : component, {
      mount(element, state, parentScope) {
        if (state === void 0) {
          state = {};
        }

        this[ATTRIBUTES_KEY_SYMBOL] = createAttributeBindings(element, attributes).mount(parentScope);
        defineProperty(this, PROPS_KEY, Object.freeze(Object.assign({}, evaluateInitialProps(element, props), evaluateAttributeExpressions(this[ATTRIBUTES_KEY_SYMBOL].expressions))));
        this[STATE_KEY] = computeState(this[STATE_KEY], state);
        this[TEMPLATE_KEY_SYMBOL] = this.template.createDOM(element).clone(); // link this object to the DOM node

        bindDOMNodeToComponentObject(element, this); // add eventually the 'is' attribute

        component.name && addCssHook(element, component.name); // define the root element

        defineProperty(this, ROOT_KEY, element); // define the slots array

        defineProperty(this, SLOTS_KEY, slots); // before mount lifecycle event

        this[ON_BEFORE_MOUNT_KEY](this[PROPS_KEY], this[STATE_KEY]);
        this[PARENT_KEY_SYMBOL] = parentScope; // mount the template

        this[TEMPLATE_KEY_SYMBOL].mount(element, this, parentScope);
        this[ON_MOUNTED_KEY](this[PROPS_KEY], this[STATE_KEY]);
        return this;
      },

      update(state, parentScope) {
        if (state === void 0) {
          state = {};
        }

        if (parentScope) {
          this[PARENT_KEY_SYMBOL] = parentScope;
          this[ATTRIBUTES_KEY_SYMBOL].update(parentScope);
        }

        const newProps = evaluateAttributeExpressions(this[ATTRIBUTES_KEY_SYMBOL].expressions);
        if (this[SHOULD_UPDATE_KEY](newProps, this[PROPS_KEY]) === false) return;
        defineProperty(this, PROPS_KEY, Object.freeze(Object.assign({}, this[PROPS_KEY], newProps)));
        this[STATE_KEY] = computeState(this[STATE_KEY], state);
        this[ON_BEFORE_UPDATE_KEY](this[PROPS_KEY], this[STATE_KEY]); // avoiding recursive updates
        // see also https://github.com/riot/riot/issues/2895

        if (!this[IS_COMPONENT_UPDATING]) {
          this[IS_COMPONENT_UPDATING] = true;
          this[TEMPLATE_KEY_SYMBOL].update(this, this[PARENT_KEY_SYMBOL]);
        }

        this[ON_UPDATED_KEY](this[PROPS_KEY], this[STATE_KEY]);
        this[IS_COMPONENT_UPDATING] = false;
        return this;
      },

      unmount(preserveRoot) {
        this[ON_BEFORE_UNMOUNT_KEY](this[PROPS_KEY], this[STATE_KEY]);
        this[ATTRIBUTES_KEY_SYMBOL].unmount(); // if the preserveRoot is null the template html will be left untouched
        // in that case the DOM cleanup will happen differently from a parent node

        this[TEMPLATE_KEY_SYMBOL].unmount(this, this[PARENT_KEY_SYMBOL], preserveRoot === null ? null : !preserveRoot);
        this[ON_UNMOUNTED_KEY](this[PROPS_KEY], this[STATE_KEY]);
        return this;
      }

    })), Object.keys(component).filter(prop => isFunction(component[prop])));
  }

  const {
    DOM_COMPONENT_INSTANCE_PROPERTY,
    COMPONENTS_IMPLEMENTATION_MAP,
    PLUGINS_SET
  } = globals;
  /**
   * Define a riot plugin
   * @param   {Function} plugin - function that will receive all the components created
   * @returns {Set} the set containing all the plugins installed
   */

  function install(plugin) {
    if (!isFunction(plugin)) panic('Plugins must be of type function');
    if (PLUGINS_SET.has(plugin)) panic('This plugin was already installed');
    PLUGINS_SET.add(plugin);
    return PLUGINS_SET;
  }

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */

  function __read(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m) return o;
      var i = m.call(o), r, ar = [], e;
      try {
          while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
      }
      catch (error) { e = { error: error }; }
      finally {
          try {
              if (r && !r.done && (m = i["return"])) m.call(i);
          }
          finally { if (e) throw e.error; }
      }
      return ar;
  }

  function __spreadArray(to, from) {
      for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
          to[j] = from[i];
      return to;
  }

  var EXTRAPOLATE = Symbol("extrapolate");
  function computeFrames(frames) {
      var staticString = null;
      var indexes = [];
      var frameNumbers = [];
      var frameValues = [];
      var beforeValue = null;
      var afterValue = null;
      var needUpdateAt = [false, null, null, false];
      function getNearestLeftIndexOf(frameNumber) {
          if (frameNumbers.length === 0) {
              return -1;
          }
          var leftIndex = 0;
          for (var i = 1; i < frameNumbers.length; i++) {
              if (frameNumbers[i] > frameNumber) {
                  break;
              }
              leftIndex = i;
          }
          return leftIndex;
      }
      {
          var constants_1 = false;
          frames.sort(function (a, b) {
              var result;
              if (a[0] === "before") {
                  result = b[0] === "after" ? -1 : b[0] === "before" ? 0 : 1;
              }
              else if (a[0] === "after") {
                  result = b[0] === "after" ? 0 : b[0] === "before" ? 1 : -1;
              }
              else if (b[0] === "before") {
                  result = -1;
              }
              else if (b[0] === "after") {
                  result = -1;
              }
              else {
                  result = a[0] - b[0];
              }
              return result;
          });
          frames.forEach(function (frame) {
              if (frame[1] === EXTRAPOLATE) {
                  if (frame[0] !== "after" && frame[0] !== "before") {
                      frameNumbers.push(frame[0]);
                  }
                  return;
              }
              else if (frame[0] === "after") {
                  afterValue = frame[1];
                  needUpdateAt[3] = true;
                  return;
              }
              else if (frame[0] === "before") {
                  beforeValue = frame[1];
                  needUpdateAt[0] = true;
                  return;
              }
              var thisStaticString;
              frameNumbers.push(frame[0]);
              if (needUpdateAt[1] == null || needUpdateAt[1] > frame[0]) {
                  needUpdateAt[1] = frame[0];
              }
              if (needUpdateAt[2] == null || needUpdateAt[2] < frame[0]) {
                  needUpdateAt[2] = frame[0];
              }
              if (!constants_1) {
                  thisStaticString = frame[1].trim()
                      .replace(/[ ]*,[ ]*/g, ",")
                      .replace(/(?:\([ ]+)/g, "(")
                      .replace(/(?:\)[ ]+(?= \w))/g, ") ")
                      .replace(/(?:\)[ ]{2,}(?! \w))/g, ")");
                  var thisStaticStringEmpty = thisStaticString.replace(/-?\d+(?:\.\d+)?/g, "");
                  var wasStaticStringNULL = staticString == null;
                  if (wasStaticStringNULL) {
                      staticString = thisStaticStringEmpty;
                  }
                  if (thisStaticStringEmpty !== staticString) {
                      constants_1 = true;
                  }
                  if (!constants_1) {
                      var match = void 0;
                      var thisValues = [];
                      while (match = (/(?:-?\d+(?:\.\d+)?)/).exec(thisStaticString)) {
                          var thisStaticStringArray = thisStaticString.split("");
                          thisStaticStringArray.splice(match.index, match[0].length);
                          thisStaticString = thisStaticStringArray.join("");
                          thisValues.push(parseFloat(match[0]));
                          if (wasStaticStringNULL) {
                              indexes.push(match.index);
                          }
                      }
                      frameValues.push(thisValues);
                  }
              }
          });
          if (constants_1) {
              return {
                  compute: function (frameNumber) {
                      if (frameNumber === "before") {
                          if (beforeValue != null) {
                              return beforeValue;
                          }
                          return frames[0][1];
                      }
                      else if (frameNumber === "after") {
                          if (afterValue != null) {
                              return afterValue;
                          }
                          return frames[frames.length - 1][1];
                      }
                      var index = getNearestLeftIndexOf(frameNumber);
                      if (index === -1) {
                          return "";
                      }
                      return frames[index][1];
                  },
                  needUpdateAt: needUpdateAt
              };
          }
      }
      if (frameValues.length === 0) {
          return {
              compute: function (frameNumber) {
                  if (frameNumber === "before" && beforeValue != null) {
                      return beforeValue;
                  }
                  else if (frameNumber === "after" && afterValue != null) {
                      return afterValue;
                  }
                  return "";
              },
              needUpdateAt: [needUpdateAt[0], null, null, needUpdateAt[3]]
          };
      }
      var staticStringArray = staticString.split("").reduce(function (prev, current, index) {
          if (indexes.some(function (i) { return i === index; })) {
              prev.push("");
          }
          prev[prev.length - 1] += current;
          return prev;
      }, [""]);
      function constructString(values) {
          var constructedString = "";
          var index = 0;
          var indexesLength = indexes.length;
          for (var i = 0; i < indexesLength; i++) {
              constructedString += staticStringArray[index] + values[i].toString();
              index++;
          }
          if (index < staticStringArray.length) {
              constructedString += staticStringArray[index];
          }
          return constructedString;
      }
      return {
          compute: function (frameNumber) {
              if (frameNumber === "before") {
                  if (beforeValue != null) {
                      return beforeValue;
                  }
                  return constructString(frameValues[0]);
              }
              else if (frameNumber === "after") {
                  if (afterValue != null) {
                      return afterValue;
                  }
                  return constructString(frameValues[frameValues.length - 1]);
              }
              frameNumber = Math.min(Math.max(0, frameNumber), 1);
              var index = getNearestLeftIndexOf(frameNumber);
              if (index === -1) {
                  return "";
              }
              if (index === frameNumbers.length - 1) {
                  return constructString(frameValues[index]);
              }
              var left = frameNumbers[index];
              var right = frameNumbers[index + 1];
              var perc = (frameNumber - left) / (right - left);
              var computedValues = [];
              var frameValue = frameValues[index];
              var nextFrameValue = frameValues[index + 1];
              var frameValueLength = frameValue.length;
              for (var v_index = 0; v_index < frameValueLength; v_index++) {
                  var value = frameValue[v_index];
                  var nextValue = nextFrameValue[v_index];
                  computedValues.push(value + ((nextValue - value) * perc));
              }
              return constructString(computedValues);
          },
          needUpdateAt: needUpdateAt
      };
  }
  var SCROLL_OBJECT = Symbol("scroll-object");
  var SCROLL_PARENT = Symbol("scroll-parent");
  var ScrollObject = (function () {
      function ScrollObject(el, frames) {
          this.el = el;
          this._needUpdateAt = [false, null, null, false];
          this._frames = [];
          this._lastRenderFrame = null;
          this.refresh(frames);
      }
      ScrollObject.prototype.refresh = function (frames) {
          var _this = this;
          this.el[SCROLL_OBJECT] = this;
          this._frames = [];
          var _loop_1 = function (key) {
              if (!Object.prototype.hasOwnProperty.call(frames, key)) {
                  return "continue";
              }
              var splitKey = key.split(".");
              var _a = __read(splitKey.pop().match(/^([^\(\)]*)(\(\))?$/) || [], 3), isValid = _a[0], lastKey = _a[1], isFunction = _a[2];
              if (!isValid) {
                  return "continue";
              }
              var _b = computeFrames(frames[key]), compute = _b.compute, needUpdateAt = _b.needUpdateAt;
              if (isFunction && needUpdateAt.every(function (value, index) {
                  if (index === 0 || index === 3) {
                      return value === false;
                  }
                  return value === null;
              })) {
                  needUpdateAt[0] = true;
                  needUpdateAt[1] = 0;
                  needUpdateAt[2] = 1;
                  needUpdateAt[3] = true;
              }
              var keyLength = splitKey.length;
              var accessor = function () {
                  var lastObject = _this.el;
                  for (var i = 0; i < keyLength; i++) {
                      if (lastObject == null) {
                          return [null, ""];
                      }
                      lastObject = lastObject[splitKey[i]];
                  }
                  return [lastObject, lastKey];
              };
              this_1._frames.push([accessor, isFunction != null, compute]);
              this_1._needUpdateAt[0] = this_1._needUpdateAt[0] || needUpdateAt[0];
              if (this_1._needUpdateAt[1] !== needUpdateAt[1] &&
                  needUpdateAt[1] != null && (this_1._needUpdateAt[1] == null ||
                  needUpdateAt[1] < this_1._needUpdateAt[1])) {
                  this_1._needUpdateAt[1] = needUpdateAt[1];
              }
              if (this_1._needUpdateAt[2] !== needUpdateAt[2] &&
                  needUpdateAt[2] != null && (this_1._needUpdateAt[2] == null ||
                  needUpdateAt[2] > this_1._needUpdateAt[2])) {
                  this_1._needUpdateAt[2] = needUpdateAt[2];
              }
              this_1._needUpdateAt[3] = this_1._needUpdateAt[3] || needUpdateAt[3];
          };
          var this_1 = this;
          for (var key in frames) {
              _loop_1(key);
          }
          this._lastRenderFrame = null;
          this.el[SCROLL_PARENT].refresh();
          return this;
      };
      ScrollObject.prototype.render = function (frame, renders, force) {
          if (force === void 0) { force = false; }
          if (!force &&
              this._lastRenderFrame === frame) {
              return renders;
          }
          if (this._lastRenderFrame != null &&
              frame !== "before" && frame !== "after" &&
              this._lastRenderFrame !== "before" &&
              this._lastRenderFrame !== "after" &&
              ((this._needUpdateAt[1] == null || frame < this._needUpdateAt[1]) ||
                  (this._needUpdateAt[2] == null || frame > this._needUpdateAt[2])) &&
              ((this._needUpdateAt[1] == null || this._lastRenderFrame < this._needUpdateAt[1]) ||
                  (this._needUpdateAt[2] == null || this._lastRenderFrame > this._needUpdateAt[2]))) {
              return renders;
          }
          this._lastRenderFrame = frame;
          for (var i = this._frames.length - 1; i >= 0; i--) {
              var currentFrame = this._frames[i];
              var accessor = currentFrame[0], isFunction = currentFrame[1], compute = currentFrame[2];
              var accessorResult = accessor();
              var object = accessorResult[0];
              if (object == null) {
                  continue;
              }
              var key = accessorResult[1];
              if (isFunction) {
                  renders.push([object, key, __spreadArray([
                          frame
                      ], __read(compute(frame).split(",").map(function (t) { return t.trim(); }).filter(function (t) { return t !== ""; })))]);
              }
              else {
                  renders.push([object, key, compute(frame)]);
              }
          }
          return renders;
      };
      return ScrollObject;
  }());
  function getFirstScrollParent(element) {
      if (element == null) {
          return null;
      }
      if (element.scrollHeight !== element.clientHeight ||
          element.scrollWidth !== element.scrollWidth) {
          return element;
      }
      return getFirstScrollParent(element.parentElement);
  }
  var ScrollParent = (function () {
      function ScrollParent(el) {
          this.el = el;
          this.children = [];
          this.trigger = 0;
          this.topOffset = 0;
          this.bottomOffset = 0;
          this._lastPosition = null;
          this._parents = [];
          el[SCROLL_PARENT] = this;
          this._computedStyle = window.getComputedStyle(this.el);
      }
      ScrollParent.prototype.refresh = function () {
          this._lastPosition = null;
          this._parents = [];
          var el = this.el;
          while (true) {
              el = getFirstScrollParent(el);
              if (el == null) {
                  break;
              }
              if (el !== this.el) {
                  this._parents.push(el);
              }
              el = el.parentElement;
          }
          return this;
      };
      ScrollParent.prototype._getRectTop = function () {
          var top = this.el.offsetTop;
          for (var i = this._parents.length - 1; i >= 0; i--) {
              var parent_1 = this._parents[i];
              top += parent_1.offsetTop - parent_1.scrollTop;
          }
          return top - window.pageYOffset;
      };
      ScrollParent.prototype.render = function (renders, force) {
          if (force === void 0) { force = false; }
          if (this.children.length === 0 || (this.el.clientHeight === 0 && this.el.clientWidth === 0)) {
              return renders;
          }
          var rectTop = this._getRectTop();
          var rectBottom = rectTop + this.el.offsetHeight;
          var trigger = document.documentElement.clientHeight * this.trigger;
          var top = rectTop - this.topOffset;
          var bottom = rectBottom + this.bottomOffset;
          var position = (trigger - top) / (bottom - top);
          var actualPosition = position > 1 ? "after" : position < 0 ? "before" : position;
          if (actualPosition === this._lastPosition && !force) {
              return renders;
          }
          this._lastPosition = actualPosition;
          for (var i = this.children.length - 1; i >= 0; i--) {
              this.children[i].render(this._lastPosition, renders, force);
          }
          return renders;
      };
      ScrollParent.prototype.remove = function (obj) {
          var index = -1;
          if (this.children.some(function (child, i) { index = i; return child === obj || child.el === obj.el; })) {
              this.children.splice(index, 1);
              this._lastPosition = null;
          }
      };
      ScrollParent.prototype.add = function (obj) {
          this.remove(obj);
          this.children.push(obj);
          this._lastPosition = null;
      };
      return ScrollParent;
  }());
  var baseScrollParent = new ScrollParent(document.documentElement);
  document.body[SCROLL_PARENT] = baseScrollParent;
  var scrollParents = [
      baseScrollParent
  ];
  function render() {
      var renders = [];
      for (var i = scrollParents.length - 1; i >= 0; i--) {
          scrollParents[i].render(renders);
      }
      for (var i = renders.length - 1; i >= 0; i--) {
          var render_1 = renders[i];
          var result = render_1[2];
          var object = render_1[0];
          if (Array.isArray(result)) {
              object[render_1[1]].apply(object, result);
          }
          else {
              object[render_1[1]] = result;
          }
      }
  }
  var stop = false;
  var started = false;
  function startLoop() {
      stop = false;
      if (started) {
          return;
      }
      started = true;
      requestAnimationFrame(function fn() {
          if (!stop) {
              render();
              requestAnimationFrame(fn);
          }
      });
  }
  function endLoop() {
      stop = true;
      started = false;
  }
  function getRefreshedParent(element) {
      if (element[SCROLL_PARENT]) {
          return element[SCROLL_PARENT].refresh();
      }
      var parent = new ScrollParent(element);
      scrollParents.push(parent);
      return parent;
  }
  function parse(element, parent, subtree) {
      if (subtree === void 0) { subtree = true; }
      var scrollOptions = null;
      Array.prototype.forEach.call(element.attributes, function (attr) {
          if (!attr.name.match(/^data-scroll[\-\.]/)) {
              return;
          }
          var data = attr.name.substr(11);
          if (data === "-parent") {
              parent = getRefreshedParent(element);
          }
          else if (data === "-trigger") {
              var trigger = parseFloat(attr.value);
              if (!isNaN(trigger)) {
                  parent = getRefreshedParent(element);
                  parent.trigger = trigger;
              }
          }
          else if (data === "-bottom") {
              var bottom = parseFloat(attr.value);
              if (!isNaN(bottom)) {
                  parent = getRefreshedParent(element);
                  parent.bottomOffset = bottom;
              }
          }
          else if (data === "-top") {
              var top_1 = parseFloat(attr.value);
              if (!isNaN(top_1)) {
                  parent = getRefreshedParent(element);
                  parent.topOffset = top_1;
              }
          }
          else {
              var dataSplit = data.split("-");
              dataSplit.shift();
              if (dataSplit.length > 2 || dataSplit.length === 0) {
                  return;
              }
              if (scrollOptions == null) {
                  scrollOptions = {};
              }
              var propertyName = dataSplit[0].replace(/(?:^|[\Wa-zA-Z])(_[a-zA-Z])/, function (_, g) {
                  return _.replace(g, g[1].toUpperCase());
              }).replace("__", "_");
              if (dataSplit.length === 1 && dataSplit[0].match(/(.*)\(\)$/)) {
                  scrollOptions[propertyName] = [];
              }
              else {
                  var frame = parseFloat(dataSplit[1]);
                  if (!isNaN(frame)) {
                      scrollOptions[propertyName] = (scrollOptions[propertyName] || []).concat([[frame, attr.value]]);
                  }
                  else if (dataSplit[1] === "before") {
                      scrollOptions[propertyName] = (scrollOptions[propertyName] || []).concat([["before", attr.value]]);
                  }
                  else if (dataSplit[1] === "after") {
                      scrollOptions[propertyName] = (scrollOptions[propertyName] || []).concat([["after", attr.value]]);
                  }
                  else if (dataSplit[1] === "extrapolate") {
                      scrollOptions[propertyName] = (scrollOptions[propertyName] || []).concat([
                          [0, EXTRAPOLATE], [1, EXTRAPOLATE]
                      ]);
                  }
              }
          }
      });
      if (scrollOptions != null) {
          element[SCROLL_PARENT] = parent;
          if (element[SCROLL_OBJECT]) {
              element[SCROLL_OBJECT].refresh(scrollOptions);
          }
          else {
              parent.children.push(new ScrollObject(element, scrollOptions));
          }
      }
      if (subtree) {
          Array.prototype.forEach.call(element.children, function (child) { parse(child, parent); });
      }
  }
  function add(element, subtree) {
      if (subtree === void 0) { subtree = true; }
      var parent = element;
      var firstScrollParent = element[SCROLL_PARENT];
      while (parent !== document.body && parent != null) {
          parent = parent.parentElement;
          if (parent == null) {
              return;
          }
          firstScrollParent = firstScrollParent || parent[SCROLL_PARENT];
      }
      if (firstScrollParent == null) {
          firstScrollParent = baseScrollParent;
          if (baseScrollParent.children.length === 0) {
              scrollParents.push(baseScrollParent);
          }
      }
      parse(element, firstScrollParent, subtree);
      if (scrollParents.length > 0) {
          startLoop();
      }
  }
  function remove(element, renderFrame) {
      if (renderFrame === void 0) { renderFrame = null; }
      var scrollParent = element[SCROLL_PARENT];
      var scrollObject = element[SCROLL_OBJECT];
      if (scrollParent != null) {
          if (scrollParent.el === element) {
              var index_1 = -1;
              if (scrollParents.some(function (p, i) {
                  index_1 = i;
                  return p === scrollParent;
              })) {
                  scrollParents.splice(index_1, 1);
              }
          }
          if (scrollObject != null) {
              scrollParent.remove(scrollObject);
              if (renderFrame != null) {
                  var renders = [];
                  scrollObject.render(renderFrame, renders, true);
                  for (var i = renders.length - 1; i >= 0; i--) {
                      var render_2 = renders[i];
                      render_2[0][render_2[1]] = render_2[2];
                  }
              }
          }
          delete element[SCROLL_PARENT];
          delete element[SCROLL_OBJECT];
      }
      Array.prototype.forEach.call(element.children, function (child) {
          remove(child, renderFrame);
      });
      if (scrollParent === baseScrollParent && baseScrollParent.children.length === 0) {
          var index_2 = -1;
          if (scrollParents.some(function (p, i) {
              if (p === baseScrollParent) {
                  index_2 = i;
                  return true;
              }
              return false;
          })) {
              scrollParents.splice(index_2, 1);
          }
      }
      if (scrollParents.length === 0) {
          endLoop();
      }
  }

  install(component => {
      if (!component.hasDataScrollAnimation) {
          return component;
      }

      const onMounted = component.onMounted;
      component.onMounted = (props, state) => {
          onMounted && onMounted.call(component, props, state);
          add(component.root);
      };
      const onUnmounted = component.onUnmounted;
      component.onUnmounted = (props, state) => {
          remove(component.root);
          onUnmounted && onUnmounted.call(component, props, state);
      };
      const onUpdated = component.onUpdated;
      component.onUpdated = (props, state) => {
          onUpdated && onUpdated.call(component, props, state);
          add(component.root);
      };
      return component;
  });

})));
