// Generated by CoffeeScript 1.8.0
(function() {
  var addModelFunctions, addRow, checkTimer, getRow, getState, getVariablesBefore, insertRow, loadState, mainContainer, makeDiv, makeRuleForm, makeTestZone, model, myTimer, now, numRows, parse, removeState, saveState, savedStates, setRow, setState, setupRuleForm, setupTestZone, showModelInView, startTimer, swapRows, takeRow, updateModel, updateTestResult,
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  model = {
    name: 'Example',
    elements: [
      {
        type: 'definition'
      }
    ]
  };

  (addModelFunctions = function() {
    model.insert = function(n, element) {
      model.elements = __slice.call(model.elements.slice(0, n)).concat([element], __slice.call(model.elements.slice(n)));
      showModelInView();
      ($('html,body')).scrollTop(($(getRow(n))).offset().top);
      return ($(getRow(n))).fadeOut(0).fadeIn(500);
    };
    model.remove = function(n) {
      model.elements = __slice.call(model.elements.slice(0, n)).concat(__slice.call(model.elements.slice(n + 1)));
      if (model.elements.length === 0) {
        model.elements = [
          {
            type: 'definition'
          }
        ];
      }
      showModelInView();
      return ($('html,body')).scrollTop(($(getRow(n))).offset().top);
    };
    return model.swap = function(n) {
      if (n < 0 || n >= model.elements.length - 1) {
        return alert('That cannot be moved any further in that direction.');
      } else {
        model.elements = __slice.call(model.elements.slice(0, n)).concat([model.elements[n + 1]], [model.elements[n]], __slice.call(model.elements.slice(n + 2)));
        showModelInView();
        ($('html,body')).scrollTop(($(getRow(n))).offset().top);
        ($(getRow(n))).fadeOut(0).fadeIn(500);
        return ($(getRow(n + 1))).fadeOut(0).fadeIn(500);
      }
    };
  })();

  getState = function() {
    return model;
  };

  setState = function(state) {
    model = state;
    addModelFunctions();
    return showModelInView();
  };

  saveState = function(name) {
    var object, _ref;
    object = JSON.parse((_ref = window.localStorage.languageData) != null ? _ref : "{}");
    object[name] = getState();
    return window.localStorage.languageData = JSON.stringify(object);
  };

  savedStates = function() {
    var object, _ref;
    object = JSON.parse((_ref = window.localStorage.languageData) != null ? _ref : "{}");
    return Object.keys(object).sort();
  };

  loadState = function(name) {
    var object, _ref;
    object = JSON.parse((_ref = window.localStorage.languageData) != null ? _ref : "{}");
    return setState(object[name]);
  };

  removeState = function(name) {
    var object, _ref;
    object = JSON.parse((_ref = window.localStorage.languageData) != null ? _ref : "{}");
    delete object[name];
    return window.localStorage.languageData = JSON.stringify(object);
  };

  myTimer = null;

  now = function() {
    return (new Date).getTime();
  };

  startTimer = function() {
    return myTimer = now();
  };

  checkTimer = function() {
    return "(took " + (now() - myTimer) + " ms)";
  };

  mainContainer = function() {
    return ($('#main')).get(0);
  };

  numRows = function() {
    return mainContainer().childNodes.length;
  };

  getRow = function(n) {
    return mainContainer().childNodes[n];
  };

  addRow = function(node) {
    return mainContainer().appendChild(node);
  };

  takeRow = function(n) {
    return mainContainer().removeChild(getRow(n));
  };

  insertRow = function(n, node) {
    if (n === numRows()) {
      return addRow(node);
    }
    return mainContainer().insertBefore(node, getRow(n));
  };

  swapRows = function(n, m) {
    return insertRow(Math.min(n, m), takeRow(Math.max(n, m)));
  };

  setRow = function(n, node) {
    if (n === numRows()) {
      return addRow(node);
    }
    mainContainer().insertAfter(node, getRow(n));
    return takeRow(n);
  };

  makeDiv = function(html, classes) {
    var result;
    if (classes == null) {
      classes = null;
    }
    result = document.createElement('div');
    result.innerHTML = html;
    if (classes != null) {
      result.setAttribute('class', classes);
    }
    return result;
  };

  makeRuleForm = function(n) {
    return makeDiv("<div class='panel-heading'> <div class='row'> <div class='col-md-6'><h5>New form in the language</h5></div> <div class='col-md-6' style='text-align: right;'> Move <button type='button' id='move_up_button_" + n + "' data-toggle='tooltip' title='Move this form up' class='btn btn-md btn-default'><span class='glyphicon glyphicon-arrow-up' aria-hidden='true'></span></button> <button type='button' id='move_down_button_" + n + "' data-toggle='tooltip' title='Move this form down' class='btn btn-md btn-default'><span class='glyphicon glyphicon-arrow-down' aria-hidden='true'></span></button> Test <button type='button' id='test_above_button_" + n + "' data-toggle='tooltip' title='Add test above' class='btn btn-md btn-default'><span class='glyphicon glyphicon-arrow-up' aria-hidden='true'></span></button> <button type='button' id='test_below_button_" + n + "' data-toggle='tooltip' title='Add test below' class='btn btn-md btn-default'><span class='glyphicon glyphicon-arrow-down' aria-hidden='true'></span></button> Form <button type='button' id='form_above_button_" + n + "' data-toggle='tooltip' title='Add form above' class='btn btn-md btn-default'><span class='glyphicon glyphicon-arrow-up' aria-hidden='true'></span></button> <button type='button' id='form_below_button_" + n + "' data-toggle='tooltip' title='Add form below' class='btn btn-md btn-default'><span class='glyphicon glyphicon-arrow-down' aria-hidden='true'></span></button> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; <button type='button' id='duplicate_form_button_" + n + "' data-toggle='tooltip' title='Duplicate this form' class='btn btn-md btn-default'><span class='glyphicon glyphicon-plus' aria-hidden='true'></span></button> <button type='button' id='delete_form_button_" + n + "' data-toggle='tooltip' title='Delete this form' class='btn btn-md btn-default'><span class='glyphicon glyphicon-remove' aria-hidden='true'></span></button> </div></div> </div> <div class='panel-body container'> <div class='row form-group'> <div class='col-md-3' style='text-align: right;'> We define a(n) </div> <div class='col-md-8'> <input type='text' class='form-control' id='input_name" + n + "' placeholder='examples: integer, sum, fraction, variable, factorial, ...'> </div> <div class='col-md-1'> <a href='#' onclick='javascript:showHelp(" + n + ",\"name\");'> <span class='glyphicon glyphicon-question-sign' aria-hidden='true'></span></a> </div> </div> <div class='row form-group'> <div class='col-md-3' style='text-align: right;'> by this syntax: </div> <div class='col-md-8 form-inline'> <select class='selectpicker' id='form_choice_" + n + "'> <option selected='true'>one of these characters:</option> <option>of the following form:</option> </select> <input type='text' class='form-control' size=60 id='input_chars" + n + "' placeholder='examples: 0-9 or a-zA-Z'> <span><span id='input_form" + n + "'>example:left + right</span></span>. </div> <div class='col-md-1'> <a href='#' onclick='javascript:showHelp(" + n + ",\"form\");'> <span class='glyphicon glyphicon-question-sign' aria-hidden='true'></span></a> </div> </div> <div class='row form-group'> <div class='col-md-3' style='text-align: right;'> We labeled it as </div> <div class='col-md-8'> <input type='text' class='form-control' id='input_tag" + n + "' placeholder='number, sum/difference, polynomial, factor in a product, ...'> </div> <div class='col-md-1'> <a href='#' onclick='javascript:showHelp(" + n + ",\"tag\");'> <span class='glyphicon glyphicon-question-sign' aria-hidden='true'></span></a> </div> </div> <div class='row form-group'> <div class='col-md-3' style='text-align: right;'> and interpret it as </div> <div class='col-md-8 form-inline'> <select class='selectpicker' id='input_interpret_" + n + "'> <option selected='true'>a symbol application</option> <option>a binding expression</option> <option>a string</option> <option>an integer</option> <option>a floating point number</option> <option>a variable</option> <option>(no change to interpretation)</option> </select> <span id='span_for_bound_vars_" + n + "' class='hidden'> , binding the variables at indices <input type='text' class='form-control' size=10 id='bound_vars_" + n + "' placeholder='1 3'></span> <span id='span_for_symbol_for_" + n + "'> of the symbol <input type='text' class='form-control' size=30 id='symbol_for_" + n + "' placeholder='example: binary addition'></span>. </div> <div class='col-md-1'> <a href='#' onclick='javascript:showHelp(" + n + ",\"interp\");'> <span class='glyphicon glyphicon-question-sign' aria-hidden='true'></span></a> </div> </div> </div>", 'panel panel-info is-a-definition');
  };

  setupRuleForm = function(n) {
    var hideShowSpans, selected, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
    ($("#input_name" + n)).val((_ref = (_ref1 = model.elements[n]) != null ? _ref1.name : void 0) != null ? _ref : '');
    ($("#input_chars" + n)).val((_ref2 = (_ref3 = model.elements[n]) != null ? _ref3.chars : void 0) != null ? _ref2 : '');
    ($("#input_form" + n)).mathquill('editable');
    if (((_ref4 = model.elements[n]) != null ? _ref4.form : void 0) != null) {
      ($("#input_form" + n)).mathquill('latex', model.elements[n].form);
    }
    ($("#input_tag" + n)).val((_ref5 = (_ref6 = model.elements[n]) != null ? _ref6.tag : void 0) != null ? _ref5 : '');
    ($("#symbol_for_" + n)).val((_ref7 = (_ref8 = model.elements[n]) != null ? _ref8.sym : void 0) != null ? _ref7 : '');
    ($("#bound_vars_" + n)).val((_ref9 = (_ref10 = model.elements[n]) != null ? _ref10.bound : void 0) != null ? _ref9 : '');
    selected = (_ref11 = (_ref12 = model.elements[n]) != null ? _ref12.choice : void 0) != null ? _ref11 : 'one of these characters:';
    ($("#form_choice_" + n + " option")).each(function(index, option) {
      option = $(option);
      return option.prop('selected', option.text() === selected);
    });
    selected = (_ref13 = (_ref14 = model.elements[n]) != null ? _ref14.interp : void 0) != null ? _ref13 : 'an expression tree';
    ($("#input_interpret_" + n + " option")).each(function(index, option) {
      option = $(option);
      return option.prop('selected', option.text() === selected);
    });
    (hideShowSpans = function() {
      selected = $("#form_choice_" + n + " option:selected");
      if (selected.text() === 'one of these characters:') {
        ($("#input_chars" + n)).removeClass('hidden');
        ($("#input_form" + n)).get(0).parentNode.style.display = 'none';
      } else {
        ($("#input_chars" + n)).addClass('hidden');
        ($("#input_form" + n)).get(0).parentNode.style.display = 'inline';
      }
      selected = $("#input_interpret_" + n + " option:selected");
      if (selected.text() === 'a binding expression') {
        ($("#span_for_bound_vars_" + n)).removeClass('hidden');
      } else {
        ($("#span_for_bound_vars_" + n)).addClass('hidden');
      }
      if (selected.text() === 'a symbol application') {
        return ($("#span_for_symbol_for_" + n)).removeClass('hidden');
      } else {
        return ($("#span_for_symbol_for_" + n)).addClass('hidden');
      }
    })();
    ($("#form_choice_" + n)).change(hideShowSpans);
    ($("#input_interpret_" + n)).change(hideShowSpans);
    ($("#test_above_button_" + n)).click(function(event) {
      return model.insert(n, {
        type: 'test'
      });
    });
    ($("#test_below_button_" + n)).click(function(event) {
      return model.insert(n + 1, {
        type: 'test'
      });
    });
    ($("#form_above_button_" + n)).click(function(event) {
      return model.insert(n, {
        type: 'definition'
      });
    });
    ($("#form_below_button_" + n)).click(function(event) {
      return model.insert(n + 1, {
        type: 'definition'
      });
    });
    ($("#delete_form_button_" + n)).click(function(event) {
      return model.remove(n);
    });
    ($("#duplicate_form_button_" + n)).click(function(event) {
      return model.insert(n, JSON.parse(JSON.stringify(model.elements[n])));
    });
    ($("#move_up_button_" + n)).click(function(event) {
      return model.swap(n - 1);
    });
    return ($("#move_down_button_" + n)).click(function(event) {
      return model.swap(n);
    });
  };

  makeTestZone = function(n) {
    var i, numRulesBefore, _i;
    numRulesBefore = 0;
    for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
      if (model.elements[i].type === 'definition') {
        numRulesBefore++;
      }
    }
    return makeDiv("<div class='panel-heading'> <div class='row'> <div class='col-md-6'><h5>Test of the language defined above (containing " + numRulesBefore + " forms)</h5></div> <div class='col-md-6' style='text-align: right;'> Move <button type='button' id='move_up_button_" + n + "' data-toggle='tooltip' title='Move this test up' class='btn btn-md btn-default'><span class='glyphicon glyphicon-arrow-up' aria-hidden='true'></span></button> <button type='button' id='move_down_button_" + n + "' data-toggle='tooltip' title='Move this test down' class='btn btn-md btn-default'><span class='glyphicon glyphicon-arrow-down' aria-hidden='true'></span></button> Test <button type='button' id='test_above_button_" + n + "' data-toggle='tooltip' title='Add test above' class='btn btn-md btn-default'><span class='glyphicon glyphicon-arrow-up' aria-hidden='true'></span></button> <button type='button' id='test_below_button_" + n + "' data-toggle='tooltip' title='Add test below' class='btn btn-md btn-default'><span class='glyphicon glyphicon-arrow-down' aria-hidden='true'></span></button> Form <button type='button' id='form_above_button_" + n + "' data-toggle='tooltip' title='Add form above' class='btn btn-md btn-default'><span class='glyphicon glyphicon-arrow-up' aria-hidden='true'></span></button> <button type='button' id='form_below_button_" + n + "' data-toggle='tooltip' title='Add form below' class='btn btn-md btn-default'><span class='glyphicon glyphicon-arrow-down' aria-hidden='true'></span></button> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; <button type='button' id='duplicate_test_button_" + n + "' data-toggle='tooltip' title='Duplicate this test' class='btn btn-md btn-default'><span class='glyphicon glyphicon-plus' aria-hidden='true'></span></button> <button type='button' id='delete_test_button_" + n + "' data-toggle='tooltip' title='Delete this test' class='btn btn-md btn-default'><span class='glyphicon glyphicon-remove' aria-hidden='true'></span></button> </div> </div></div> <div class='panel-body'> <div>Enter an expression in your language, then press enter to see the parsed result</div> <div><p><span id='test_input_" + n + "'>temp</span></p></div> <div><pre id='test_output_" + n + "'></pre></div> </div>", 'panel panel-success is-a-test-zone');
  };

  setupTestZone = function(n) {
    var _ref, _ref1, _ref2, _ref3;
    ($("#test_input_" + n)).mathquill('editable');
    ($("#test_input_" + n)).mathquill('latex', (_ref = (_ref1 = model.elements[n]) != null ? _ref1.input : void 0) != null ? _ref : 'PutTestHere');
    ($("#test_output_" + n)).text((_ref2 = (_ref3 = model.elements[n]) != null ? _ref3.output : void 0) != null ? _ref2 : '');
    ($("#test_output_" + n)).text("(Result will be shown here.)");
    ($("#test_above_button_" + n)).click(function(event) {
      return model.insert(n, {
        type: 'test'
      });
    });
    ($("#test_below_button_" + n)).click(function(event) {
      return model.insert(n + 1, {
        type: 'test'
      });
    });
    ($("#form_above_button_" + n)).click(function(event) {
      return model.insert(n, {
        type: 'definition'
      });
    });
    ($("#form_below_button_" + n)).click(function(event) {
      return model.insert(n + 1, {
        type: 'definition'
      });
    });
    ($("#delete_test_button_" + n)).click(function(event) {
      return model.remove(n);
    });
    ($("#duplicate_test_button_" + n)).click(function(event) {
      return model.insert(n, JSON.parse(JSON.stringify(model.elements[n])));
    });
    ($("#move_up_button_" + n)).click(function(event) {
      return model.swap(n - 1);
    });
    return ($("#move_down_button_" + n)).click(function(event) {
      return model.swap(n);
    });
  };

  showModelInView = function() {
    var element, index, timerId, _i, _len, _ref;
    while (numRows() > 0) {
      takeRow(0);
    }
    _ref = model.elements;
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      element = _ref[index];
      if (element.type === 'definition') {
        addRow(makeRuleForm(index));
        setupRuleForm(index);
      } else {
        addRow(makeTestZone(index));
        setupTestZone(index);
        updateTestResult(index);
      }
    }
    ($('.selectpicker')).selectpicker();
    timerId = null;
    ($('input')).keyup(function(event) {
      if (timerId != null) {
        clearTimeout(timerId);
      }
      return timerId = setTimeout(updateModel, 500);
    });
    ($('.mathquill-editable')).keyup(function(event) {
      if (timerId != null) {
        clearTimeout(timerId);
      }
      return timerId = setTimeout(updateModel, 500);
    });
    return ($('select')).change(function(event) {
      if (timerId != null) {
        clearTimeout(timerId);
      }
      return timerId = setTimeout(updateModel, 500);
    });
  };

  getVariablesBefore = function(n) {
    return function(array) {
      var attempt, i, name, _i;
      for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
        if (model.elements[i].type !== 'definition') {
          continue;
        }
        if ((name = model.elements[i].name) == null) {
          continue;
        }
        attempt = array.slice(0, name.length).join('');
        if (name === attempt) {
          return name;
        }
      }
    };
  };

  updateTestResult = function(n) {
    var mqnode;
    mqnode = ($("#test_input_" + n)).get(0);
    return ($("#test_output_" + n)).text(parse(n, window.mathQuillToMeaning(mqnode, getVariablesBefore(n))));
  };

  updateModel = function() {
    var mqnode, n, _base, _base1, _i, _ref, _results;
    _results = [];
    for (n = _i = 0, _ref = numRows(); 0 <= _ref ? _i < _ref : _i > _ref; n = 0 <= _ref ? ++_i : --_i) {
      if (($(getRow(n))).hasClass('is-a-definition')) {
        if ((_base = model.elements)[n] == null) {
          _base[n] = {};
        }
        model.elements[n].type = 'definition';
        model.elements[n].name = ($("#input_name" + n)).val();
        model.elements[n].chars = ($("#input_chars" + n)).val();
        model.elements[n].form = ($("#input_form" + n)).mathquill('latex');
        mqnode = ($("#input_form" + n)).get(0);
        model.elements[n].form_array = window.mathQuillToMeaning(mqnode, getVariablesBefore(n));
        model.elements[n].tag = ($("#input_tag" + n)).val();
        model.elements[n].sym = ($("#symbol_for_" + n)).val();
        model.elements[n].bound = ($("#bound_vars_" + n)).val();
        model.elements[n].interp = ($("#input_interpret_" + n + " option:selected")).text();
        _results.push(model.elements[n].choice = ($("#form_choice_" + n + " option:selected")).text());
      } else {
        if ((_base1 = model.elements)[n] == null) {
          _base1[n] = {};
        }
        model.elements[n].type = 'test';
        model.elements[n].input = ($("#test_input_" + n)).mathquill('latex');
        model.elements[n].output = ($("#test_output_" + n)).val();
        _results.push(updateTestResult(n));
      }
    }
    return _results;
  };

  window.showHelp = function(id, topic) {
    return alert((function() {
      switch (topic) {
        case 'name':
          return 'This must be a valid identifier, meaning that it must start with a letter or underscore, and then can contain any sequence of letters, numbers, or underscores.\n    Examples: \n    sum, product, hex_digit, integerBelow10';
        case 'form':
          return '1. If you choose "one of these characters," then this blank must be filled with a list of individual characters, and the form being defined matches exactly one of them.  Thus, for instance, you could define a single digit this way: \n    0123456789 \nNote that this only defines a single digit, not an entire sequence of digits.  For that, create a higher-level syntactic form, using the option 2., below. \nHyphens indicate ranges of digits, so the above set of characters could also be defined this way: \n    0-9 \nTo include an actual hyphen as a valid character, put it first or last in the list. \n \n2. If you choose "of the following form," then this blank must exhibit the form in question.  Identifiers that have been previously declared as names for forms are interpreted as such; whitespace is interpreted as optional and of any length; everything else is interpreted as exact text. Examples: \n    Natural numbers: \n        Base form:       digit \n        Inductive form:  digit natural \n    Sums: \n        Base form:       term \n        Inductive form:  term + sum \n    Grouping symbols: \n        One form:        ( expression )';
        case 'tag':
          return 'Any human-readable phrase can go here, but it should be brief, because it will be used to populate bubble tags when expressions of this form appear inside the bubble.';
        case 'interp':
          return 'If the piece of syntax you\'re defining should have special meaning (e.g., as a number for us in computations, or as a variable for use in quantifiers) then mark it here as having such an interpretation.  If you\'re defining something hierarchical (e.g., a binary sum) then you should mark it as "an expression tree."  If you\'re defining a quantifier (or any operator that binds variables, such as a summation, product, integral, lambda, etc.) then you should mark it as a binding expression.  In that case, you say which of the tokens in the expression are variables that should be bound.  For instance, if you define an expression \n    Sum sub ( variable = term ) sup ( term ) term \nthen you should say item 3 (the fourth counting from zero, the "variable" token) is a variable to be bound.';
      }
    })());
  };

  $(function() {
    var lastSavedFilename;
    ($('#loadButton')).click(function(event) {
      var thingsToLoad, toLoad;
      thingsToLoad = savedStates();
      if (thingsToLoad.length === 0) {
        return alert('You have not saved any language definitions yet.');
      } else {
        toLoad = prompt("Type the name of the language definition to load, chosen from the following list:\n \n" + (thingsToLoad.join('\n')), thingsToLoad[0]);
        if (toLoad == null) {
          return;
        }
        return loadState(toLoad);
      }
    });
    lastSavedFilename = null;
    ($('#saveButton')).click(function(event) {
      var toSave;
      toSave = prompt("Type the name under which to save this language definition.", lastSavedFilename);
      if (toSave == null) {
        return;
      }
      if (__indexOf.call(savedStates(), toSave) >= 0) {
        if (!confirm("Save over language definition of that same name?")) {
          return;
        }
      }
      return saveState(lastSavedFilename = toSave);
    });
    ($('#eraseButton')).click(function(event) {
      var thingsToErase, toErase;
      thingsToErase = savedStates();
      if (thingsToErase.length === 0) {
        return alert('You have not saved any language definitions yet.');
      } else {
        toErase = prompt("Type the name of the language definition to erase, chosen from the following list:\n \n" + (thingsToErase.join('\n')), thingsToErase[0]);
        if (toErase == null) {
          return;
        }
        if (__indexOf.call(thingsToErase, toErase) < 0) {
          return;
        }
        if (!confirm("Are you SURE you want to ERASE " + toErase + "?")) {
          return;
        }
        return removeState(toErase);
      }
    });
    return showModelInView();
  });

  parse = function(n, input) {
    var G, chars, d, def, e, element, hasKey, i, index, indices, interp, lastExpressionBuilt, name, nameToData, newsym, obj, parseKey, parsed, results, rhs, sre, sym, tag, _i, _j, _k, _len, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
    G = new Grammar;
    try {
      nameToData = {};
      for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
        if (model.elements[i].type === 'definition') {
          def = model.elements[i];
          name = (_ref = (_ref1 = def.name) != null ? _ref1.trim() : void 0) != null ? _ref : '';
          if (!/^[a-zA-Z_][a-zA-Z_0-9]*$/.test(name)) {
            throw "This name was not an identifier: " + name;
          }
          sym = (_ref2 = def.sym) != null ? _ref2.trim() : void 0;
          tag = (_ref3 = def.tag) != null ? _ref3.trim() : void 0;
          interp = (_ref4 = def.interp) != null ? _ref4.trim() : void 0;
          sre = /^[a-zA-Z_][a-zA-Z_0-9]*\.[a-zA-Z_][a-zA-Z_0-9]*$/;
          obj = nameToData[name] != null ? nameToData[name] : nameToData[name] = {};
          if ((obj.tag != null) && obj.tag !== tag) {
            throw "Inconsistent tag names for " + name + ": " + obj.tag + " and " + tag;
          }
          obj.tag = tag;
          if ((obj.interp != null) && obj.interp !== interp) {
            throw "Inconsistent tag names for " + name + ": " + obj.interp + " and " + interp;
          }
          obj.interp = interp;
          if (sre.test(sym)) {
            nameToData[name].sym = OM.symbol.apply(OM, sym.split('.'));
          } else {
            newsym = /[a-zA-Z_]/.test(sym[0]) ? '' : '_';
            for (i = _j = 0, _ref5 = sym.length; 0 <= _ref5 ? _j < _ref5 : _j > _ref5; i = 0 <= _ref5 ? ++_j : --_j) {
              if (/[a-zA-Z_]/.test(sym[i])) {
                newsym += sym[i];
              } else {
                newsym += "" + (sym.charCodeAt(i));
              }
            }
            nameToData[name].sym = OM.symbol(newsym, 'Lurch');
          }
          if (interp === 'a binding expression') {
            indices = (_ref6 = def.bound) != null ? (_ref7 = _ref6.trim()) != null ? _ref7.split(/\s+/) : void 0 : void 0;
            for (_k = 0, _len = indices.length; _k < _len; _k++) {
              index = indices[_k];
              if (!/^[0-9]+$/.test(index)) {
                throw "This variable index is not a natural number: " + v + ".  The list of bound variables should be just natural numbers separated by whitespace.";
              }
            }
            nameToData[name].bound = indices;
          }
          chars = ((_ref8 = def.chars) != null ? _ref8 : '').trim();
          rhs = (function() {
            var _l, _len1, _ref10, _ref9, _results;
            if (def.choice === 'one of these characters:') {
              return RegExp("[" + (RegExp.escape2(chars)) + "]");
            } else {
              _ref10 = (_ref9 = def.form_array) != null ? _ref9 : [];
              _results = [];
              for (_l = 0, _len1 = _ref10.length; _l < _len1; _l++) {
                element = _ref10[_l];
                if (G.rules.hasOwnProperty(element)) {
                  _results.push(element);
                } else {
                  _results.push(RegExp(RegExp.escape(element)));
                }
              }
              return _results;
            }
          })();
          G.addRule(name, rhs);
          if (G.START == null) {
            G.START = name;
          }
          if (rhs.length === 1 && G.START === rhs[0]) {
            G.START = name;
          }
        }
      }
      parseKey = OM.sym('Lurch', 'ParsedFrom');
      lastExpressionBuilt = null;
      G.setOption('expressionBuilder', function(expr) {
        var args, bound, collapse, data, e, rest, result, text, tmp, toValue;
        name = expr[0];
        data = nameToData[name];
        lastExpressionBuilt = data.tag;
        toValue = function(v) {
          var _ref9;
          if (v instanceof OM) {
            return ((_ref9 = v.getAttribute(parseKey)) != null ? _ref9 : v).value;
          } else {
            return v;
          }
        };
        collapse = function(array) {
          var elt;
          return ((function() {
            var _l, _len1, _results;
            _results = [];
            for (_l = 0, _len1 = array.length; _l < _len1; _l++) {
              elt = array[_l];
              _results.push("" + (toValue(elt)));
            }
            return _results;
          })()).join('');
        };
        result = (function() {
          switch (data.interp) {
            case 'a symbol application':
              args = (function() {
                var _l, _len1, _results;
                _results = [];
                for (_l = 0, _len1 = expr.length; _l < _len1; _l++) {
                  e = expr[_l];
                  if (e instanceof OM) {
                    _results.push(e);
                  }
                }
                return _results;
              })();
              if (args.length > 0) {
                return OM.application.apply(OM, [data.sym].concat(__slice.call(args)));
              } else {
                return data.sym;
              }
              break;
            case 'a binding expression':
              bound = (function() {
                var _l, _len1, _ref9, _results;
                _ref9 = data.bound;
                _results = [];
                for (_l = 0, _len1 = _ref9.length; _l < _len1; _l++) {
                  i = _ref9[_l];
                  _results.push(expr[i]);
                }
                return _results;
              })();
              rest = (function() {
                var _l, _ref9, _results;
                _results = [];
                for (i = _l = 0, _ref9 = expr.length; 0 <= _ref9 ? _l < _ref9 : _l > _ref9; i = 0 <= _ref9 ? ++_l : --_l) {
                  if (__indexOf.call(data.bound, i) < 0) {
                    _results.push(i);
                  }
                }
                return _results;
              })();
              rest = (function() {
                var _l, _len1, _results;
                _results = [];
                for (_l = 0, _len1 = rest.length; _l < _len1; _l++) {
                  i = rest[_l];
                  if (expr[i] instanceof OM) {
                    _results.push(expr[i]);
                  }
                }
                return _results;
              })();
              return OM.application.apply(OM, [data.sym].concat(__slice.call(bound), __slice.call(rest)));
            case 'a string':
              return OM.string(collapse(expr.slice(1)));
            case 'an integer':
              text = collapse(expr.slice(1));
              text = text.replace(/\u2212/g, '-');
              tmp = OM.integer(parseInt(text));
              tmp.setAttribute(OM.sym('Lurch', 'ParsedFrom'), OM.str(text));
              return tmp;
            case 'a floating point number':
              text = collapse(expr.slice(1));
              text = text.replace(/\u2212/g, '-');
              tmp = OM.float(parseFloat(text));
              tmp.setAttribute(OM.sym('Lurch', 'ParsedFrom'), OM.str(text));
              return tmp;
            case 'a variable':
              return OM.variable(collapse(expr.slice(1)));
            case '(no change to interpretation)':
              return expr[1];
          }
        })();
        return result;
      });
      G.setOption('comparator', function(a, b) {
        return a != null ? typeof a.equals === "function" ? a.equals(b) : void 0 : void 0;
      });
      if (!G.START) {
        throw 'No grammar rules have been defined.';
      }
      results = G.parse(input);
      results = (function() {
        var _l, _len1, _len2, _m, _ref9, _results;
        _results = [];
        for (_l = 0, _len1 = results.length; _l < _len1; _l++) {
          parsed = results[_l];
          if (!(parsed instanceof OM)) {
            _results.push("Not an OMNode: " + (JSON.stringify(parsed)));
          } else {
            hasKey = function(om) {
              return om.getAttribute(parseKey);
            };
            _ref9 = parsed.descendantsSatisfying(hasKey);
            for (_m = 0, _len2 = _ref9.length; _m < _len2; _m++) {
              d = _ref9[_m];
              d.removeAttribute(parseKey);
            }
            _results.push(JSON.stringify(JSON.parse(parsed.encode()), null, 4));
          }
        }
        return _results;
      })();
      return "Input: " + input + " \nResult: " + (results.join('\nResult: ')) + " \nType: " + lastExpressionBuilt;
    } catch (_error) {
      e = _error;
      console.log(e.stack);
      return "Language definition error:  " + e;
    }
  };

  RegExp.escape = function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  };

  RegExp.escape2 = function(s) {
    return s.replace(/[\/\\^$*+?.()|[\]{}]/g, '\\$&');
  };

}).call(this);

//# sourceMappingURL=cp-test.solo.js.map