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

app.compile = function(force) {
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
};

app.save = function () {

    console.log('├─┬ Saving...');

    if (!app.data.user.id) {
        app.animateAlert({
            header: 'Whoops!', 
            body: 'You have to be signed in to save files.', 
            type: 'danger', 
        });
        console.log('│ └── error in saving: user not signed in.');
        return;
    }
    app.data.file.filename = $('#filename').val();
    if (!app.data.file.filename) {
        app.animateAlert({
            header: 'Whoops!', 
            body: 'Please enter a filename.', 
            type: 'danger', 
        });
            console.log('│ └── error in saving: no filename provided.');
        return;
    }
    app.data.file.text = app.editor.getValue();

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            var statMesg = JSON.parse(request.responseText).statMesg;
            var fileid = JSON.parse(request.responseText).fileid;
            if (request.status === 200) {
                if(app.settings.autosave) {
                    $('#save-status').html(' Saved');
                } else {
                    app.animateAlert({
                        header:'Success!', 
                        body: 'Your file was saved.'
                    });
                }
                if(/\/edit$/g.test(document.URL)) {
                    setTimeout(function() {
                        if(document.URL.charAt(document.URL.length - 1) === '/') {
                            window.location.href = document.URL + fileid;
                        } else {
                            window.location.href = document.URL + '/' + fileid;
                        }
                    }, 1500);
                }
                console.log('│ └── save successful.');
            } else {
                app.animateAlert({
                    header:'Oh no!', 
                    body: statMesg + " (error: " + request.status + ")", 
                    type: 'danger'
                });
                if(app.settings.autosave) {
                    $('#save-status').html(' Unsaved');
                }
                console.log('│ └── error in saving: ' + statMesg + ' (error: ' + request.status + ')');
            }
        }
    }
    request.open('POST', '/save', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(app.data));
};

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
