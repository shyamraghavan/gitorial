var app = {}; app.data = {}; app.data.user = {}; app.data.file = {};
app.settings = {
    editor: {
        mode:         "gfm",
        lineNumbers:  "true",
        lineWrapping: "true",
        theme:        "monokai",
        keyMap:       "vim"
    },
    editorCreated: false,
    marked: {
      gfm: true,
      tables: true,
      breaks: false,
      pedantic: false,
      sanitize: false,
      smartLists: true,
      smartypants: true,
      langPrefix: 'lang-',
    }
}
app.currentStep = 1;

app.compile = function(force, whichstep) {
  var oldstep;
  if (whichstep) {
    oldstep = app.currentStep;
    app.currentStep = whichstep;
  }
  var raw = app.editors[app.currentStep - 1].getValue();
  if(!force && !raw) {return;} // Quit unless we have to or we don't have anything
  console.log("├─┬ Compiling. . .");
  var preview = raw
    .replace(/\\\(/g, '<script type="math/tex">')
    .replace(/\\\)/g, '</script>')
    .replace(/\\\[/g, '<script type="math/tex; mode=display">')
    .replace(/\\\]/g, '</script>');
  preview = preview
    .replace(/\[\[@\]\]/g, '~~~\n' + app.steps[app.currentStep - 1] + '\n~~~');
  marked(preview, function(err, compiled) {
    if (err) {
      console.log('│ └─ error in compiling: ' + err);
    } else {
      var pane = $('#' + app.currentStep + ' .preview');
      var scroll = pane.scrollTop();
      var bottom = false;
      if(scroll + pane.innerHeight() === pane[0].scrollHeight) {
        bottom = true;
      }
      pane.html(compiled);
      // re-render math
      MathJax.Hub.Queue(["Typeset",MathJax.Hub], [function() {
        pane.scrollTop(bottom ? pane[0].scrollHeight : scroll);
      }]);
      // re-render Google prettyprint
      $('#' + app.currentStep + ' .preview pre').addClass("prettyprint").before('<div class="pre-header"><p class="text-center">Step ' + app.currentStep + ' - ' + app.repo + '</div>');
      $('#' + app.currentStep + ' .preview pre code').addClass("prettyprint");
      prettyPrint();
      console.log("│ └── compiling successful.");
    }
  });
  if(whichstep) {
    app.currentStep = oldstep;
  }
};

app.save = function () {
  console.log('├─┬ Saving...');
  var numsteps = app.steps.length;
  for(var i = 1; i <= numsteps; i++) {
    app.compile(true, i);
  }

  var data = {};
  data.repo = app.repo;
  data.title = app.repo;
  data.steps = app.steps.length;
  $('.preview').each(function(index) {
    data.html = $(this).html();
  });

  $.ajax('/save', {
    data: data,
    error: function(jqXHR, textStatus, errorThrown) {
      console.log('error: ' + textStatus + errorThrown);
    },
    success: function() {
      console.log('Success!');
    },
    type: 'POST'
  });
}

app.init = function () {
    console.log('│ Initializing app. . .');
    app.repo = $('#gitorial-edit').data().repo;
    app.profileUrl = $('#gitorial-edit').data().profileUrl;

    marked.setOptions(app.settings.marked);

    app.editors = [];
    $('.editor-form textarea').each(function(index) {
      app.editors.push(CodeMirror.fromTextArea($(this)[0], app.settings.editor));
    });
    $('.step').each(function(index) {
      $(this).on('shown.bs.tab', function(e) {
        app.editors[index].setValue(app.editors[index].getValue());
        app.currentStep = index + 1;
      });
    });

    $('.CodeMirror').css('height', $(window).height() - 95);
    $(window).resize(function(e) {
      $('.CodeMirror').css('height', $(window).height() - 95);
    });
    CodeMirror.commands.save = app.compile;

    $('#save-button').click(app.save);
    $('#compile-button').click(function() { app.compile(true); });

    app.steps = [];
    $('#data div').each(function(index) {
      app.steps.push($(this).html());
      $(this).remove();
    });

    console.log('├── app intialized.');
}

app.init();
