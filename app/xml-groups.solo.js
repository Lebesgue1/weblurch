// Generated by CoffeeScript 1.8.0
(function() {
  var allowedChildrenProblems, isGroupRight, markGroupRight, markGroupWrong, rangeToHTML, tagData,
    __hasProp = {}.hasOwnProperty,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  tagData = {};

  window.setTagData = function(newData) {
    return tagData = newData;
  };

  window.addTagData = function(newData) {
    var key, value, _results;
    _results = [];
    for (key in newData) {
      if (!__hasProp.call(newData, key)) continue;
      value = newData[key];
      _results.push(tagData[key] = value);
    }
    return _results;
  };

  window.pluginsToLoad = ['dialogs'];

  window.setGroupTag = function(group, tagName) {
    return group.set('tagName', tagName);
  };

  window.getGroupTag = function(group) {
    return group.get('tagName');
  };

  window.initializeGroupTag = function(group) {
    var parentTagName, tagName;
    parentTagName = group.parent ? window.getGroupTag(group.parent) : window.topLevelTagName();
    tagName = window.getTagData(parentTagName, 'defaultChild');
    if (tagName) {
      return window.setGroupTag(group, tagName);
    }
  };

  window.getTagData = function(tagName, key) {
    var _ref;
    if (tagName instanceof window.Group) {
      tagName = window.getGroupTag(tagName);
    }
    return (_ref = tagData[tagName]) != null ? _ref[key] : void 0;
  };

  window.getTagExternalName = function(tagName) {
    var _ref;
    if (tagName instanceof window.Group) {
      tagName = window.getGroupTag(tagName);
    }
    return (_ref = window.getTagData(tagName, 'externalName')) != null ? _ref : tagName;
  };

  window.topLevelTagName = function() {
    var key, value;
    for (key in tagData) {
      if (!__hasProp.call(tagData, key)) continue;
      value = tagData[key];
      if (value.topLevel) {
        return key;
      }
    }
  };

  window.XMLMenuItems = function(group) {
    var allowed, documentation, external, parentTag, result, tag, tagName;
    result = [];
    if ((tag = window.getGroupTag(group)) != null) {
      external = window.getTagExternalName(tag);
      if ((documentation = window.getTagData(tag, 'documentation')) != null) {
        documentation = documentation.replace(/a href=/g, 'a target="_blank" href=');
        result.push({
          text: "Read \"" + external + "\" documentation",
          onclick: function() {
            return tinymce.activeEditor.Dialogs.alert({
              title: "Documentation for \"" + external + "\"",
              message: documentation
            });
          }
        });
      }
    }
    result.push({
      text: "View XML representation",
      onclick: function() {
        var xml;
        xml = window.convertToXML(group).replace(/&/g, '&amp;').replace(/</g, '&lt;');
        return tinymce.activeEditor.Dialogs.alert({
          title: 'XML Representation',
          message: "<pre>" + xml + "</pre>"
        });
      }
    });
    parentTag = group.parent ? window.getGroupTag(group.parent) : window.topLevelTagName();
    allowed = window.getTagData(parentTag, 'allowedChildren');
    result.push({
      text: 'Change tag to...',
      menu: (function() {
        var _i, _len, _ref, _results;
        _ref = Object.keys(tagData).sort();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          tagName = _ref[_i];
          _results.push((function(tagName) {
            return {
              text: window.getTagExternalName(tagName),
              disabled: (allowed != null) && !(tagName in allowed),
              onclick: function() {
                return group.set('tagName', tagName);
              }
            };
          })(tagName));
        }
        return _results;
      })()
    });
    return result;
  };

  window.groupToolbarButtons = {
    viewxml: {
      text: 'XML',
      tooltip: 'View XML representation of this document',
      onclick: function() {
        var allowed, doExport, editor, id, problems, _i, _len, _ref;
        problems = [];
        editor = tinymce.activeEditor;
        _ref = editor.Groups.ids();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          id = _ref[_i];
          if (!isGroupRight(editor.Groups[id])) {
            problems.push('At least one element in your document has errors (indicated by a red X following the element).');
            break;
          }
        }
        allowed = window.getTagData(window.topLevelTagName(), 'allowedChildren');
        if (allowed) {
          problems = problems.concat(allowedChildrenProblems(editor.Groups.topLevel, allowed, 'document'));
        }
        doExport = function() {
          var xml;
          xml = encodeURIComponent(window.convertToXML());
          return window.open("data:application/xml," + xml, '_blank');
        };
        if (problems.length === 0) {
          return doExport();
        }
        return tinymce.activeEditor.Dialogs.confirm({
          title: 'Problems with your document',
          message: "<p><b>The problems listed below exist in your document.</b></p> <ul><li>" + (problems.join('</li><li>')) + "</li></ul> <p>You can click OK to generate XML anyway, but it may be invalid.  Click Cancel to go back and fix these problems first.</b></p>",
          okCallback: doExport
        });
      }
    }
  };

  window.XMLGroupChanged = function(group, firstTime) {
    if (firstTime && !group.get('tagName')) {
      setTimeout((function() {
        return window.initializeGroupTag(group);
      }), 0);
    }
    return window.validateHierarchy(group);
  };

  window.XMLGroupDeleted = function(group) {
    var _ref;
    if (group.parent != null) {
      if (group.parent.children[0]) {
        return window.validateHierarchy(group.parent.children[0]);
      }
    } else {
      if ((_ref = group.plugin) != null ? _ref.topLevel[0] : void 0) {
        return window.validateHierarchy(group.plugin.topLevel[0]);
      }
    }
  };

  markGroupRight = function(group) {
    group.set('valid', true);
    group.clear('closeDecoration');
    return group.clear('closeHoverText');
  };

  markGroupWrong = function(group, reason) {
    group.set('valid', false);
    group.set('closeDecoration', '<font color="red">&#10006;</font>');
    return group.set('closeHoverText', reason);
  };

  isGroupRight = function(group) {
    return group.get('valid');
  };

  window.validateHierarchy = function(group) {
    var allowed, b, belongsAfter, belongsIn, bnames, check, gname, groupTag, moreProblems, next, parentTag, phrase, pname, prevTag, problems, walk;
    problems = [];
    if (!group.children) {
      setTimeout((function() {
        return window.validateHierarchy(group);
      }), 100);
      return;
    }
    if ((groupTag = window.getGroupTag(group)) == null) {
      problems.push("Each element must have a tag, but this one does not.  Add a tag using the context menu.");
    }
    parentTag = group.parent ? window.getGroupTag(group.parent) : window.topLevelTagName();
    belongsIn = window.getTagData(group, 'belongsIn');
    if (typeof belongsIn === 'string') {
      belongsIn = [belongsIn];
    }
    if (belongsIn instanceof Array && __indexOf.call(belongsIn, parentTag) < 0) {
      gname = window.getTagExternalName(group);
      pname = window.getTagExternalName(parentTag);
      bnames = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = belongsIn.length; _i < _len; _i++) {
          b = belongsIn[_i];
          _results.push(window.getTagExternalName(b));
        }
        return _results;
      })();
      pname = pname ? "" + pname + " elements" : "in an element without a tag";
      bnames = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = belongsIn.length; _i < _len; _i++) {
          b = belongsIn[_i];
          _results.push(window.getTagExternalName(b));
        }
        return _results;
      })();
      phrase = (function() {
        switch (bnames.length) {
          case 1:
            return "this kind of element: " + bnames[0];
          case 2:
            return "these kinds of elements: " + (bnames.join(' and '));
          default:
            return "these kinds of elements: " + (bnames.join(', '));
        }
      })();
      problems.push("" + gname + " elements are only permitted in " + phrase + " (not " + pname + ").");
    }
    prevTag = group.previousSibling() ? window.getGroupTag(group.previousSibling()) : null;
    belongsAfter = window.getTagData(group, 'belongsAfter');
    if (typeof belongsIn === 'string') {
      belongsAfter = [belongsAfter];
    }
    if (belongsAfter === null) {
      belongsAfter = [null];
    }
    if (belongsAfter instanceof Array && __indexOf.call(belongsAfter, prevTag) < 0) {
      gname = window.getTagExternalName(group);
      pname = window.getTagExternalName(prevTag);
      pname = pname ? "" + pname + " elements" : "being first in their context";
      bnames = (function() {
        var _i, _len, _ref, _results;
        _results = [];
        for (_i = 0, _len = belongsAfter.length; _i < _len; _i++) {
          b = belongsAfter[_i];
          _results.push((_ref = window.getTagExternalName(b)) != null ? _ref : "none (i.e., being the first in their context)");
        }
        return _results;
      })();
      phrase = (function() {
        switch (bnames.length) {
          case 1:
            return "this kind of element: " + bnames[0];
          case 2:
            return "these kinds of elements: " + (bnames.join(' and '));
          default:
            return "these kinds of elements: " + (bnames.join(', '));
        }
      })();
      problems.push("" + gname + " elements are only permitted to follow " + phrase + " (not " + pname + ").");
    }
    if (window.getTagData(group, 'unique')) {
      walk = group;
      while (walk = walk.previousSibling()) {
        if (window.getGroupTag(walk) === groupTag) {
          problems.push("Each context may contain only one \"" + (window.getTagExternalName(group)) + "\" element.  But there is already an earlier one in this context, making this one invalid.");
          break;
        }
      }
    }
    if (allowed = window.getTagData(group, 'allowedChildren')) {
      problems = problems.concat(allowedChildrenProblems(group.children, allowed));
    }
    if (check = window.getTagData(group, 'contentCheck')) {
      moreProblems = check(group);
      if (moreProblems instanceof Array) {
        problems = problems.concat(moreProblems);
      }
    }
    if (problems.length > 0) {
      markGroupWrong(group, problems.join('\n'));
    } else {
      markGroupRight(group);
    }
    if (next = group.nextSibling()) {
      return window.validateHierarchy(next);
    }
  };

  allowedChildrenProblems = function(children, allowed, subject) {
    var child, childTag, count, counts, external, max, min, problems, tagName, verb, word, _i, _len, _ref;
    if (subject == null) {
      subject = 'element';
    }
    problems = [];
    counts = {};
    for (_i = 0, _len = children.length; _i < _len; _i++) {
      child = children[_i];
      childTag = window.getGroupTag(child);
      if (counts[childTag] == null) {
        counts[childTag] = 0;
      }
      counts[childTag]++;
    }
    for (tagName in allowed) {
      if (!__hasProp.call(allowed, tagName)) continue;
      if (counts[tagName] == null) {
        counts[tagName] = 0;
      }
    }
    for (tagName in counts) {
      if (!__hasProp.call(counts, tagName)) continue;
      count = counts[tagName];
      if (!allowed.hasOwnProperty(tagName)) {
        continue;
      }
      _ref = allowed[tagName], min = _ref[0], max = _ref[1];
      if ((min == null) || (max == null)) {
        continue;
      }
      if (typeof min !== 'number' || typeof max !== 'number') {
        continue;
      }
      verb = count === 1 ? 'is' : 'are';
      word = min === 1 ? 'child' : 'children';
      external = window.getTagExternalName(tagName);
      if (count < min) {
        problems.push("The " + subject + " requires at least " + min + " " + word + " with tag " + external + ", but there " + verb + " " + count + " in this " + subject + ".");
      }
      word = max === 1 ? 'child' : 'children';
      if (count > max) {
        problems.push("The " + subject + " permits at most " + max + " " + word + " with tag " + external + ", but there " + verb + " " + count + " in this " + subject + ".");
      }
    }
    return problems;
  };

  window.convertToXML = function(group) {
    var alterXML, child, children, indent, inner, range, result, tag, text, wrap, wrapper;
    if (group != null) {
      children = group.children;
      tag = window.getGroupTag(group);
    } else {
      children = tinymce.activeEditor.Groups.topLevel;
      tag = window.topLevelTagName();
    }
    wrapper = window.getTagData(tag, 'includeText');
    wrap = function(text) {
      var alterXML, result;
      if (!wrapper) {
        return '';
      }
      if (!tagData.hasOwnProperty(wrapper)) {
        return text;
      }
      result = "<" + wrapper + ">" + text + "</" + wrapper + ">";
      if (alterXML = window.getTagData(wrapper, 'alterXML')) {
        result = alterXML(result);
      }
      return result;
    };
    result = (function() {
      var _i, _len;
      if (children.length) {
        indent = function(text) {
          return "  " + (text.replace(RegExp('\n', 'g'), '\n  '));
        };
        range = children[0].rangeBefore();
        inner = '';
        if (!/^\s*$/.test(range.toString())) {
          inner += wrap(tinymce.DOM.encode(rangeToHTML(range)));
        }
        for (_i = 0, _len = children.length; _i < _len; _i++) {
          child = children[_i];
          if (inner[inner.length - 1] !== '\n') {
            inner += '\n';
          }
          inner += "" + (window.convertToXML(child)) + "\n";
          range = child.rangeAfter();
          if (!/^\s*$/.test(range.toString())) {
            inner += wrap(tinymce.DOM.encode(rangeToHTML(range)));
          }
        }
        return "<" + tag + ">\n" + (indent(inner)) + "\n</" + tag + ">";
      } else {
        text = window.getTagData(tag, 'rawXML') ? (group != null ? group.contentAsText() : tinymce.activeEditor.getContent({
          format: 'text'
        })).replace(/\xA0/g, '\n') : tinymce.DOM.encode(group != null ? group.contentAsHTML() : tinymce.activeEditor.getContent());
        if (wrapper == null) {
          wrapper = true;
        }
        return "<" + tag + ">" + (wrap(text)) + "</" + tag + ">";
      }
    })();
    if (alterXML = window.getTagData(tag, 'alterXML')) {
      result = alterXML(result, group);
    }
    return result;
  };

  rangeToHTML = function(range) {
    var fragment, html, result, tmp, whiteSpaceAfter, whiteSpaceBefore;
    if (!(fragment = range != null ? range.cloneContents() : void 0)) {
      return null;
    }
    tmp = range.startContainer.ownerDocument.createElement('div');
    tmp.appendChild(fragment);
    html = tmp.innerHTML;
    whiteSpaceBefore = /^\s/.test(html) ? ' ' : '';
    whiteSpaceAfter = /\s+$/.test(html) ? ' ' : '';
    result = tinymce.activeEditor.serializer.serialize(tmp, {
      get: true,
      format: 'html',
      selection: true,
      getInner: true
    });
    return whiteSpaceBefore + result + whiteSpaceAfter;
  };

}).call(this);

//# sourceMappingURL=xml-groups.solo.js.map
