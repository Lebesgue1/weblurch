// Generated by CoffeeScript 1.8.0
(function() {
  var Groups, LoadSave, Overlay,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice;

  Groups = (function() {
    function Groups(editor) {
      this.editor = editor;
      this.scanDocument = __bind(this.scanDocument, this);
      this.hideOrShowGroupers = __bind(this.hideOrShowGroupers, this);
      this.allGroupers = __bind(this.allGroupers, this);
      this.groupCurrentSelection = __bind(this.groupCurrentSelection, this);
      this.addGroupType = __bind(this.addGroupType, this);
      this.setUsedID = __bind(this.setUsedID, this);
      this.addFreeId = __bind(this.addFreeId, this);
      this.nextFreeId = __bind(this.nextFreeId, this);
      this.groupTypes = {};
      this.freeIds = [0];
    }

    Groups.prototype.nextFreeId = function() {
      if (this.freeIds.length > 1) {
        return this.freeIds.shift();
      } else {
        return this.freeIds[0]++;
      }
    };

    Groups.prototype.addFreeId = function(id) {
      if (id < this.freeIds[this.freeIds.length - 1]) {
        this.freeIds.push(id);
        return this.freeIds.sort();
      }
    };

    Groups.prototype.setUsedID = function(id) {
      var i, last;
      last = this.freeIds[this.freeIds.length - 1];
      while (last < id) {
        this.freeIds.push(++last);
      }
      i = this.freeIds.indexOf(id);
      this.freeIds.splice(i, 1);
      if (i === this.freeIds.length) {
        return this.freeIds.push(id + 1);
      }
    };

    Groups.prototype.addGroupType = function(name, data) {
      var buttonData, key, menuData, n, _ref;
      if (data == null) {
        data = {};
      }
      name = ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = name.length; _i < _len; _i++) {
          n = name[_i];
          if (/[a-zA-Z_-]/.test(n)) {
            _results.push(n);
          }
        }
        return _results;
      })()).join('');
      this.groupTypes[name] = data;
      if (data.hasOwnProperty('text')) {
        menuData = {
          text: data.text,
          context: (_ref = data.context) != null ? _ref : 'Insert',
          onclick: (function(_this) {
            return function() {
              return _this.groupCurrentSelection(name);
            };
          })(this)
        };
        if (data.shortcut != null) {
          menuData.shortcut = data.shortcut;
        }
        if (data.icon != null) {
          menuData.icon = data.icon;
        }
        this.editor.addMenuItem(name, menuData);
        buttonData = {
          tooltip: data.tooltip,
          onclick: (function(_this) {
            return function() {
              return _this.groupCurrentSelection(name);
            };
          })(this)
        };
        key = data.image != null ? 'image' : data.icon != null ? 'icon' : 'text';
        buttonData[key] = data[key];
        return this.editor.addButton(name, buttonData);
      }
    };

    Groups.prototype.groupCurrentSelection = function(type) {
      var close, content, cursor, hide, id, open, _ref, _ref1, _ref2;
      if (!this.groupTypes.hasOwnProperty(type)) {
        return;
      }
      hide = ($((_ref = this.allGroupers()) != null ? _ref[0] : void 0)).hasClass('hide');
      id = this.nextFreeId();
      open = this.grouperHTML(type, (_ref1 = this.groupTypes[type]['open-img']) != null ? _ref1 : 'images/red-bracket-open.png', 'open', id, hide);
      close = this.grouperHTML(type, (_ref2 = this.groupTypes[type]['close-img']) != null ? _ref2 : 'images/red-bracket-close.png', 'close', id, hide);
      cursor = '<span id="put_cursor_here">\u200b</span>';
      content = this.editor.selection.getContent();
      this.editor.insertContent(open + content + cursor + close);
      cursor = ($(this.editor.getBody())).find('#put_cursor_here');
      this.editor.selection.select(cursor.get(0));
      return cursor.remove();
    };

    Groups.prototype.grouperHTML = function(typeName, image, openClose, id, hide) {
      if (hide == null) {
        hide = true;
      }
      hide = hide ? ' hide' : '';
      return "<img src='" + image + "' class='grouper " + typeName + hide + "' id='" + openClose + id + "'>";
    };

    Groups.prototype.grouperInfo = function(grouper) {
      var info;
      info = /^(open|close)([0-9]+)$/.exec(grouper != null ? typeof grouper.getAttribute === "function" ? grouper.getAttribute('id') : void 0 : void 0);
      if (info) {
        return {
          type: info[1],
          id: info[2]
        };
      } else {
        return null;
      }
    };

    Groups.prototype.allGroupers = function() {
      return this.editor.getDoc().getElementsByClassName('grouper');
    };

    Groups.prototype.hideOrShowGroupers = function() {
      var groupers;
      groupers = $(this.allGroupers());
      if (($(groupers != null ? groupers[0] : void 0)).hasClass('hide')) {
        return groupers.removeClass('hide');
      } else {
        return groupers.addClass('hide');
      }
    };

    Groups.prototype.scanDocument = function() {
      var gpStack, grouper, groupers, idStack, index, info, _i, _len, _results;
      groupers = Array.prototype.slice.apply(this.allGroupers());
      idStack = [];
      gpStack = [];
      for (_i = 0, _len = groupers.length; _i < _len; _i++) {
        grouper = groupers[_i];
        if ((info = this.grouperInfo(grouper)) == null) {
          ($(grouper)).remove();
        } else if (info.type === 'open') {
          idStack.unshift(info.id);
          gpStack.unshift(grouper);
        } else {
          index = idStack.indexOf(info.id);
          if (index === -1) {
            ($(grouper)).remove();
          } else {
            while (idStack[0] !== info.id) {
              idStack.shift();
              ($(gpStack.shift())).remove();
            }
            idStack.shift();
            gpStack.shift();
          }
        }
      }
      _results = [];
      while (idStack.length > 0) {
        idStack.shift();
        _results.push(($(gpStack.shift())).remove());
      }
      return _results;
    };

    return Groups;

  })();

  tinymce.PluginManager.add('groups', function(editor, url) {
    var type, _i, _len, _ref;
    editor.Groups = new Groups(editor);
    editor.on('init', function(event) {
      return editor.dom.loadCSS('groupsplugin.css');
    });
    _ref = editor.settings.groupTypes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      type = _ref[_i];
      editor.Groups.addGroupType(type.name, type);
    }
    return editor.addMenuItem('hideshowgroups', {
      text: 'Hide/show groups',
      context: 'View',
      onclick: function() {
        return editor.Groups.hideOrShowGroupers();
      }
    });
  });

  LoadSave = (function() {
    LoadSave.prototype.appName = null;

    LoadSave.setAppName = function(newname) {
      var instance, _i, _len, _ref, _results;
      if (newname == null) {
        newname = null;
      }
      LoadSave.prototype.appName = newname;
      _ref = LoadSave.prototype.instances;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        instance = _ref[_i];
        _results.push(instance.setAppName(newname));
      }
      return _results;
    };

    LoadSave.prototype.instances = [];

    function LoadSave(editor) {
      var control;
      this.editor = editor;
      this.manageFiles = __bind(this.manageFiles, this);
      this.handleOpen = __bind(this.handleOpen, this);
      this.tryToOpen = __bind(this.tryToOpen, this);
      this.load = __bind(this.load, this);
      this.tryToSave = __bind(this.tryToSave, this);
      this.save = __bind(this.save, this);
      this.tryToClear = __bind(this.tryToClear, this);
      this.clear = __bind(this.clear, this);
      this.setFileSystem = __bind(this.setFileSystem, this);
      this.setAppName = __bind(this.setAppName, this);
      this.setFilepath = __bind(this.setFilepath, this);
      this.setFilename = __bind(this.setFilename, this);
      this.setDocumentDirty = __bind(this.setDocumentDirty, this);
      this.recomputePageTitle = __bind(this.recomputePageTitle, this);
      this.setAppName(LoadSave.prototype.appName);
      this.setFileSystem(this.appName);
      this.setFilepath(FileSystem.prototype.pathSeparator);
      setTimeout(((function(_this) {
        return function() {
          return _this.clear();
        };
      })(this)), 0);
      this.saveMetaData = this.loadMetaData = null;
      this.editor.on('change', (function(_this) {
        return function(event) {
          return _this.setDocumentDirty(true);
        };
      })(this));
      control = (function(_this) {
        return function(name, data) {
          var buttonData, key;
          buttonData = {
            icon: data.icon,
            shortcut: data.shortcut,
            onclick: data.onclick,
            tooltip: data.tooltip
          };
          key = data.icon != null ? 'icon' : 'text';
          buttonData[key] = data[key];
          _this.editor.addButton(name, buttonData);
          return _this.editor.addMenuItem(name, data);
        };
      })(this);
      control('newfile', {
        text: 'New',
        icon: 'newdocument',
        context: 'file',
        shortcut: 'ctrl+N',
        tooltip: 'New file',
        onclick: (function(_this) {
          return function() {
            return _this.tryToClear();
          };
        })(this)
      });
      control('savefile', {
        text: 'Save',
        icon: 'save',
        context: 'file',
        shortcut: 'ctrl+S',
        tooltip: 'Save file',
        onclick: (function(_this) {
          return function() {
            return _this.tryToSave();
          };
        })(this)
      });
      this.editor.addMenuItem('saveas', {
        text: 'Save as...',
        context: 'file',
        shortcut: 'ctrl+shift+S',
        onclick: (function(_this) {
          return function() {
            return _this.tryToSave(null, '');
          };
        })(this)
      });
      control('openfile', {
        text: 'Open...',
        icon: 'browse',
        context: 'file',
        shortcut: 'ctrl+O',
        tooltip: 'Open file...',
        onclick: (function(_this) {
          return function() {
            return _this.handleOpen();
          };
        })(this)
      });
      this.editor.addMenuItem('managefiles', {
        text: 'Manage files...',
        context: 'file',
        onclick: (function(_this) {
          return function() {
            return _this.manageFiles();
          };
        })(this)
      });
      LoadSave.prototype.instances.push(this);
    }

    LoadSave.prototype.recomputePageTitle = function() {
      return document.title = "" + (this.appName ? this.appName + ': ' : '') + " " + (this.filename || '(untitled)') + " " + (this.documentDirty ? '*' : '');
    };

    LoadSave.prototype.setDocumentDirty = function(setting) {
      if (setting == null) {
        setting = true;
      }
      this.documentDirty = setting;
      return this.recomputePageTitle();
    };

    LoadSave.prototype.setFilename = function(newname) {
      if (newname == null) {
        newname = null;
      }
      this.filename = newname;
      return this.recomputePageTitle();
    };

    LoadSave.prototype.setFilepath = function(newpath) {
      if (newpath == null) {
        newpath = null;
      }
      return this.filepath = newpath;
    };

    LoadSave.prototype.setAppName = function(newname) {
      var mustAlsoUpdateFileSystem;
      if (newname == null) {
        newname = null;
      }
      mustAlsoUpdateFileSystem = this.appName === this.fileSystem;
      this.appName = newname;
      if (mustAlsoUpdateFileSystem) {
        this.fileSystem = this.appName;
      }
      return this.recomputePageTitle();
    };

    LoadSave.prototype.setFileSystem = function(newname) {
      if (newname == null) {
        newname = this.appName;
      }
      return this.fileSystem = newname;
    };

    LoadSave.prototype.clear = function() {
      this.editor.setContent('');
      this.setDocumentDirty(false);
      return this.setFilename(null);
    };

    LoadSave.prototype.tryToClear = function() {
      if (!this.documentDirty) {
        this.clear();
        this.editor.focus();
        return;
      }
      return this.editor.windowManager.open({
        title: 'Save first?',
        buttons: [
          {
            text: 'Save',
            onclick: (function(_this) {
              return function() {
                _this.tryToSave(function(success) {
                  if (success) {
                    return _this.clear();
                  }
                });
                return _this.editor.windowManager.close();
              };
            })(this)
          }, {
            text: 'Discard',
            onclick: (function(_this) {
              return function() {
                _this.clear();
                return _this.editor.windowManager.close();
              };
            })(this)
          }, {
            text: 'Cancel',
            onclick: (function(_this) {
              return function() {
                return _this.editor.windowManager.close();
              };
            })(this)
          }
        ]
      });
    };

    LoadSave.prototype.save = function() {
      var objectToSave, tmp;
      if (this.filename === null) {
        return;
      }
      tmp = new FileSystem(this.fileSystem);
      tmp.cd(this.filepath);
      objectToSave = [this.editor.getContent(), typeof this.saveMetaData === "function" ? this.saveMetaData() : void 0];
      if (tmp.write(this.filename, objectToSave, true)) {
        return this.setDocumentDirty(false);
      }
    };

    LoadSave.prototype.tryToSave = function(callback, filename) {
      var filepath, refreshDialog, result, saveWouldOverwrite;
      if (filename == null) {
        filename = this.filename;
      }
      if (filename) {
        this.setFilename(filename);
        result = this.save();
        this.editor.focus();
        return typeof callback === "function" ? callback(result) : void 0;
      }
      refreshDialog = function() {
        var button, dialog, _i, _len, _ref, _results;
        dialog = document.getElementsByClassName('mce-window')[0];
        if (!dialog) {
          return;
        }
        _ref = dialog.getElementsByTagName('button');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          button = _ref[_i];
          if (button.textContent === 'Save') {
            if (filename) {
              button.removeAttribute('disabled');
              button.parentNode.style.backgroundImage = null;
              button.parentNode.style.backgroundColor = null;
            } else {
              button.setAttribute('disabled', true);
              button.parentNode.style.backgroundImage = 'none';
              button.parentNode.style.backgroundColor = '#ccc';
            }
            break;
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };
      filename = null;
      this.saveFileNameChangedHandler = function(newname) {
        filename = newname;
        return refreshDialog();
      };
      filepath = null;
      this.changedFolderHandler = function(newfolder) {
        return filepath = newfolder;
      };
      saveWouldOverwrite = (function(_this) {
        return function(filepath, filename) {
          var tmp;
          tmp = new FileSystem(_this.fileSystem);
          tmp.cd(filepath);
          return null !== tmp.type(filename);
        };
      })(this);
      this.buttonClickedHandler = (function(_this) {
        return function() {
          var args, name;
          name = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
          if (name === 'Save') {
            if (saveWouldOverwrite(filepath, filename)) {
              if (!confirm("Are you sure you want to overwrite the file " + filename + "?")) {
                _this.tellDialog('setFileBrowserMode', 'save file');
                return;
              }
            }
            _this.setFilepath(filepath);
            _this.setFilename(filename);
            _this.editor.windowManager.close();
            result = _this.save();
            return typeof callback === "function" ? callback(result) : void 0;
          } else if (name === 'Cancel') {
            _this.editor.windowManager.close();
            return typeof callback === "function" ? callback(false) : void 0;
          }
        };
      })(this);
      return this.editor.windowManager.open({
        title: 'Save file...',
        url: 'filedialog/filedialog.html',
        width: 600,
        height: 400,
        buttons: [
          {
            text: 'Save',
            subtype: 'primary',
            onclick: (function(_this) {
              return function() {
                return _this.buttonClickedHandler('Save');
              };
            })(this)
          }, {
            text: 'Cancel',
            onclick: (function(_this) {
              return function() {
                return _this.buttonClickedHandler('Cancel');
              };
            })(this)
          }
        ]
      }, {
        fsName: this.fileSystem,
        mode: 'save file'
      });
    };

    LoadSave.prototype.load = function(filepath, filename) {
      var content, metadata, tmp, _ref;
      if (filename === null) {
        return;
      }
      if (filepath === null) {
        filepath = '.';
      }
      tmp = new FileSystem(this.fileSystem);
      tmp.cd(filepath);
      _ref = tmp.read(filename), content = _ref[0], metadata = _ref[1];
      this.editor.setContent(content);
      this.editor.focus();
      this.setFilepath(filepath);
      this.setFilename(filename);
      this.setDocumentDirty(false);
      if (metadata) {
        return typeof this.loadMetaData === "function" ? this.loadMetaData(metadata) : void 0;
      }
    };

    LoadSave.prototype.tryToOpen = function(callback) {
      var filename, filepath, refreshDialog;
      if (callback == null) {
        callback = (function(_this) {
          return function(p, f) {
            return _this.load(p, f);
          };
        })(this);
      }
      refreshDialog = (function(_this) {
        return function() {
          var button, dialog, _i, _len, _ref, _results;
          dialog = document.getElementsByClassName('mce-window')[0];
          if (!dialog) {
            return;
          }
          _ref = dialog.getElementsByTagName('button');
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            button = _ref[_i];
            if (button.textContent === 'Open') {
              if (filename) {
                button.removeAttribute('disabled');
                button.parentNode.style.backgroundImage = null;
                button.parentNode.style.backgroundColor = null;
              } else {
                button.setAttribute('disabled', true);
                button.parentNode.style.backgroundImage = 'none';
                button.parentNode.style.backgroundColor = '#ccc';
              }
              break;
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        };
      })(this);
      filename = null;
      this.selectedFileHandler = function(newname) {
        filename = newname;
        return refreshDialog();
      };
      filepath = null;
      this.changedFolderHandler = function(newfolder) {
        return filepath = newfolder;
      };
      this.buttonClickedHandler = (function(_this) {
        return function() {
          var args, name;
          name = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
          if (name === 'Open') {
            _this.editor.windowManager.close();
            return typeof callback === "function" ? callback(filepath, filename) : void 0;
          } else if (name === 'Cancel') {
            _this.editor.windowManager.close();
            return typeof callback === "function" ? callback(null, null) : void 0;
          }
        };
      })(this);
      this.editor.windowManager.open({
        title: 'Open file...',
        url: 'filedialog/filedialog.html',
        width: 600,
        height: 400,
        buttons: [
          {
            text: 'Open',
            subtype: 'primary',
            onclick: (function(_this) {
              return function() {
                return _this.buttonClickedHandler('Open');
              };
            })(this)
          }, {
            text: 'Cancel',
            onclick: (function(_this) {
              return function() {
                return _this.buttonClickedHandler('Cancel');
              };
            })(this)
          }
        ]
      }, {
        fsName: this.fileSystem,
        mode: 'open file'
      });
      return refreshDialog();
    };

    LoadSave.prototype.handleOpen = function() {
      if (!this.documentDirty) {
        return this.tryToOpen();
      }
      return this.editor.windowManager.open({
        title: 'Save first?',
        buttons: [
          {
            text: 'Save',
            onclick: (function(_this) {
              return function() {
                _this.editor.windowManager.close();
                return _this.tryToSave(function(success) {
                  if (success) {
                    return _this.tryToOpen();
                  }
                });
              };
            })(this)
          }, {
            text: 'Discard',
            onclick: (function(_this) {
              return function() {
                _this.editor.windowManager.close();
                return _this.tryToOpen();
              };
            })(this)
          }, {
            text: 'Cancel',
            onclick: (function(_this) {
              return function() {
                return _this.editor.windowManager.close();
              };
            })(this)
          }
        ]
      });
    };

    LoadSave.prototype.tellDialog = function() {
      var args, frame, frames, _i, _len;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      frames = document.getElementsByTagName('iframe');
      for (_i = 0, _len = frames.length; _i < _len; _i++) {
        frame = frames[_i];
        if ('filedialog/filedialog.html' === frame.getAttribute('src')) {
          return frame.contentWindow.postMessage(args, '*');
        }
      }
    };

    LoadSave.prototype.manageFiles = function() {
      return this.editor.windowManager.open({
        title: 'Manage files',
        url: 'filedialog/filedialog.html',
        width: 700,
        height: 500,
        buttons: [
          {
            text: 'New folder',
            onclick: (function(_this) {
              return function() {
                return _this.tellDialog('buttonClicked', 'New folder');
              };
            })(this)
          }, {
            text: 'Done',
            onclick: (function(_this) {
              return function() {
                return _this.editor.windowManager.close();
              };
            })(this)
          }
        ]
      }, {
        fsName: this.fileSystem,
        mode: 'manage files'
      });
    };

    return LoadSave;

  })();

  tinymce.PluginManager.add('loadsave', function(editor, url) {
    return editor.LoadSave = new LoadSave(editor);
  });

  window.onmessage = function(event) {
    var handlerName, instance, _i, _len, _ref;
    handlerName = "" + event.data[0] + "Handler";
    _ref = LoadSave.prototype.instances;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      instance = _ref[_i];
      if (instance.hasOwnProperty(handlerName)) {
        return instance[handlerName].apply(null, event.data.slice(1));
      }
    }
  };

  window.setAppName = function(newname) {
    if (newname == null) {
      newname = null;
    }
    return LoadSave.prototype.appName = newname;
  };

  Overlay = (function() {
    function Overlay(editor) {
      this.editor = editor;
      this.editor.on('init', (function(_this) {
        return function() {
          _this.canvas = document.createElement('canvas');
          _this.editor.getContentAreaContainer().appendChild(_this.canvas);
          _this.canvas.style.position = 'absolute';
          _this.canvas.style.top = _this.canvas.style.left = '0px';
          _this.canvas.style['background-color'] = 'rgba(0,0,0,0)';
          _this.canvas.style['pointer-events'] = 'none';
          return _this.canvas.style['z-index'] = '10';
        };
      })(this));
      this.drawHandlers = [];
      this.editor.on('NodeChange', (function(_this) {
        return function(event) {
          var context, doDrawing, e, _i, _len, _ref, _results;
          _this.positionCanvas();
          context = _this.canvas.getContext('2d');
          _this.clearCanvas(context);
          _ref = _this.drawHandlers;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            doDrawing = _ref[_i];
            try {
              _results.push(doDrawing(_this.canvas, context));
            } catch (_error) {
              e = _error;
              _results.push(console.log("Error in overlay draw function: " + e));
            }
          }
          return _results;
        };
      })(this));
    }

    Overlay.prototype.addDrawHandler = function(drawFunction) {
      return this.drawHandlers.push(drawFunction);
    };

    Overlay.prototype.getEditorFrame = function() {
      var frame, _i, _len, _ref;
      _ref = window.frames;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        frame = _ref[_i];
        if (frame.document === this.editor.getDoc()) {
          return frame;
        }
      }
      return null;
    };

    Overlay.prototype.positionCanvas = function() {
      var isBody, orig, walk;
      this.canvas.width = this.canvas.parentNode.offsetWidth;
      this.canvas.height = this.canvas.parentNode.offsetHeight;
      orig = walk = this.getEditorFrame();
      isBody = function(e) {
        return tinymce.DOM.hasClass(e, 'mce-container-body');
      };
      while (walk && !isBody(walk)) {
        walk = walk.parentNode;
      }
      if (walk) {
        return this.canvas.style.top = walk.clientHeight - orig.clientHeight;
      }
    };

    Overlay.prototype.clearCanvas = function(context) {
      return context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };

    return Overlay;

  })();

  tinymce.PluginManager.add('overlay', function(editor, url) {
    return editor.Overlay = new Overlay(editor);
  });

  setAppName('Lurch');

  $(function() {
    var editor;
    editor = document.createElement('textarea');
    editor.setAttribute('id', 'editor');
    document.body.appendChild(editor);
    return tinymce.init({
      selector: '#editor',
      auto_focus: 'editor',
      browser_spellcheck: true,
      gecko_spellcheck: true,
      statusbar: false,
      plugins: 'advlist table charmap colorpicker contextmenu image link importcss paste print save searchreplace textcolor fullscreen -loadsave -overlay -groups',
      toolbar: ['newfile openfile savefile managefiles | print | undo redo | cut copy paste | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent blockquote | table', 'fontselect styleselect | bold italic underline textcolor subscript superscript removeformat | link unlink | charmap image | spellchecker searchreplace | me'],
      menu: {
        file: {
          title: 'File',
          items: 'newfile openfile | savefile saveas | managefiles | print'
        },
        edit: {
          title: 'Edit',
          items: 'undo redo | cut copy paste pastetext | selectall'
        },
        insert: {
          title: 'Insert',
          items: 'link media | template hr | me'
        },
        view: {
          title: 'View',
          items: 'visualaid hideshowgroups'
        },
        format: {
          title: 'Format',
          items: 'bold italic underline strikethrough superscript subscript | formats | removeformat'
        },
        table: {
          title: 'Table',
          items: 'inserttable tableprops deletetable | cell row column'
        },
        help: {
          title: 'Help',
          items: 'about website'
        }
      },
      contextmenu: 'link image inserttable | cell row column deletetable',
      setup: function(editor) {
        editor.addMenuItem('about', {
          text: 'About...',
          context: 'help',
          onclick: function() {
            return alert('webLurch\n\npre-alpha, not intended for general consumption!');
          }
        });
        editor.addMenuItem('website', {
          text: 'Lurch website',
          context: 'help',
          onclick: function() {
            return window.open('http://www.lurchmath.org', '_blank');
          }
        });
        return editor.on('init', function() {
          var filemenu, icon;
          editor.getBody().style.fontSize = '16px';
          setTimeout(function() {
            var h, walk, _i, _len, _ref, _results;
            editor.execCommand('mceFullScreen');
            walk = editor.iframeElement;
            while (walk && walk !== editor.container) {
              if (walk === editor.iframeElement.parentNode) {
                walk.style.height = 'auto';
              } else {
                walk.style.height = '100%';
              }
              walk = walk.parentNode;
            }
            _ref = editor.getDoc().getElementsByTagName('html');
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              h = _ref[_i];
              _results.push(h.style.height = 'auto');
            }
            return _results;
          }, 0);
          filemenu = (editor.getContainer().getElementsByClassName('mce-menubtn'))[0];
          icon = document.createElement('img');
          icon.setAttribute('src', 'icons/apple-touch-icon-76x76.png');
          icon.style.width = icon.style.height = '26px';
          icon.style.padding = '2px';
          filemenu.insertBefore(icon, filemenu.childNodes[0]);
          return editor.getBody().addEventListener('focus', function() {
            if (editor.windowManager.getWindows().length !== 0) {
              return editor.windowManager.close();
            }
          });
        });
      },
      groupTypes: [
        {
          name: 'me',
          text: 'Meaningful expression',
          image: './images/red-bracket-icon.png',
          tooltip: 'Make text a meaningful expression'
        }
      ]
    });
  });

}).call(this);

//# sourceMappingURL=app.js.map
