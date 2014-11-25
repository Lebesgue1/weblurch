// Generated by CoffeeScript 1.8.0
(function() {
  var LoadSave;

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
      this.setAppName(LoadSave.prototype.appName);
      this.setFileSystem(this.appName);
      this.setFilepath(FileSystem.prototype.pathSeparator);
      setTimeout(((function(_this) {
        return function() {
          return _this.clear();
        };
      })(this)), 0);
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
            onclick: data.onclick
          };
          key = data.icon ? 'icon' : 'text';
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
      var tmp;
      if (this.filename === null) {
        return;
      }
      tmp = new FileSystem(this.fileSystem);
      tmp.cd(this.filepath);
      if (tmp.write(this.filename, this.editor.getContent(), true)) {
        return this.setDocumentDirty(false);
      }
    };

    LoadSave.prototype.tryToSave = function(callback, filename) {
      var filepath, refreshDialog, result;
      if (filename == null) {
        filename = this.filename;
      }
      if (filename) {
        this.setFilename(filename);
        result = this.save();
        return typeof callback === "function" ? callback(result) : void 0;
      }
      refreshDialog = function() {
        var button, dialog, _i, _len, _ref, _results;
        dialog = document.getElementsByClassName('mce-window')[0];
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
                _this.setFilepath(filepath);
                _this.setFilename(filename);
                _this.editor.windowManager.close();
                result = _this.save();
                return typeof callback === "function" ? callback(result) : void 0;
              };
            })(this)
          }, {
            text: 'Cancel',
            onclick: (function(_this) {
              return function() {
                _this.editor.windowManager.close();
                return typeof callback === "function" ? callback(false) : void 0;
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
      var tmp;
      if (filename === null) {
        return;
      }
      if (filepath === null) {
        filepath = '.';
      }
      tmp = new FileSystem(this.fileSystem);
      tmp.cd(filepath);
      this.editor.setContent(tmp.read(filename));
      this.setFilepath(filepath);
      this.setFilename(filename);
      return this.setDocumentDirty(false);
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
      refreshDialog = function() {
        var button, dialog, _i, _len, _ref, _results;
        dialog = document.getElementsByClassName('mce-window')[0];
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
      filename = null;
      this.selectedFileHandler = function(newname) {
        filename = newname;
        return refreshDialog();
      };
      filepath = null;
      this.changedFolderHandler = function(newfolder) {
        return filepath = newfolder;
      };
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
                _this.editor.windowManager.close();
                return typeof callback === "function" ? callback(filepath, filename) : void 0;
              };
            })(this)
          }, {
            text: 'Cancel',
            onclick: (function(_this) {
              return function() {
                _this.editor.windowManager.close();
                return typeof callback === "function" ? callback(null, null) : void 0;
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
                var frame, frames, _i, _len;
                frames = document.getElementsByTagName('iframe');
                for (_i = 0, _len = frames.length; _i < _len; _i++) {
                  frame = frames[_i];
                  if ('filedialog/filedialog.html' === frame.getAttribute('src')) {
                    return frame.contentWindow.postMessage(['buttonClicked', 'New folder'], '*');
                  }
                }
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
      plugins: 'advlist table charmap colorpicker contextmenu image link importcss paste print save searchreplace textcolor fullscreen -loadsave',
      toolbar: ['newfile openfile savefile managefiles | print | undo redo | cut copy paste | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent blockquote | table', 'fontselect styleselect | bold italic underline textcolor subscript superscript removeformat | link unlink | charmap image | spellchecker searchreplace'],
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
          items: 'link media | template hr'
        },
        view: {
          title: 'View',
          items: 'visualaid'
        },
        format: {
          title: 'Format',
          items: 'bold italic underline strikethrough superscript subscript | formats | removeformat'
        },
        table: {
          title: 'Table',
          items: 'inserttable tableprops deletetable | cell row column'
        }
      },
      contextmenu: 'link image inserttable | cell row column deletetable',
      setup: function(editor) {
        return editor.on('init', function() {
          editor.getBody().style.fontSize = '16px';
          return setTimeout((function() {
            return editor.execCommand('mceFullScreen');
          }), 0);
        });
      }
    });
  });

}).call(this);

//# sourceMappingURL=app.js.map
