// I don't want to call this class "UI" anymore. That's not the right name for it.
// I may want tp break out some of its methods into a different class...

Ui = function() {
  //use mustache syntax for underscore templates so ejs doesn't get confused
  _.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g
  };

  //pull in the edit/normal view templates from the index file"
  var normalView = _.template($('._template#punkNormalView').html());

  var socket;

  this.setup = function() {
    // Initialize socket connection and authenticate
    socket = io.connect(window.location.protocol + '//' + window.location.host);
    console.log('created socket');
    socket.emit('auth', { socketKey: socketKey });
    console.log('sent message with key ' + socketKey);

    // set up listeners for UI events
    $('.btn').click(function(event){
      var toCall = $(this).attr('data-function');
      eval(toCall);
    });

    $('form').submit(function(event){
      event.preventDefault();
      var toCall = $(this).attr('data-function');
      eval(toCall);
    });

    $('#hardStatus').change(function() {
      $('.statusForm').trigger('submit');
    });

    $('#user').change(function(event){
      ui.setControls();
    });

    socket.on('update', function (data) {
      ui.refreshPunk(data.name);
    });
  }

  this.setControls = function() {
    var currentPerson = ui.getPunk(me.name, function(err, currentPerson) {
      $('#softStatus').val(currentPerson.softStatus);
      $('#hardStatus').val(currentPerson.hardStatus);
      $('#softStatus').select();
    });
  }

  this.updatePunk = function() {
    var name = me.name;

    var post = {
      punk: {
        hardStatus: $('#hardStatus option:selected').val(),
        softStatus: $('#softStatus').val()
      }
    }

    ui.post(name, post);
  }


  this.refreshPunk = function(name) {
    ui.getPunk(name, function(err, user) {
      $('.punk#' + name + ' .info').html(normalView(user));
    });
  };

  this.post = function(name, post) {
    $.ajax({
      url: '/punks/update/'+name,
      type: 'POST',
      data: post,
      async: true
    });  
  }

  this.getPunk = function(name, callback) {
    var punk;
    $.ajax({
      url: '/punks/'+name,
      type: 'GET',
      async: false,
      success: function(data) {
        punk = data;
        return callback(null, punk);
      },
      failure: function() {
        return callback("Error");
      }
    });
  }
}

$(document).ready(function() {
  window.ui = new Ui();
  ui.setup();
  ui.setControls();
});
