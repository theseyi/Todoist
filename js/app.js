var app = app || {};
var ENTER_KEY = 13;

$(function () {
    new app.AppView();

    $('a#can-i-use').click(function (e) {
        e.preventDefault();

        var link = $(this).prop('href');
        window.open(link, 'CanIUse', 'menubar=no,scrollbars=yes,status=no,resizable=yes,top=10,left=10,dependent=yes,alwaysRaised=yes');
    });
});