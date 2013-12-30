var app = app || {};


var Workspace = Backbone.Router.extend({
    routes: {
        '*filter': 'setFilter'
    },

    setFilter: function (param) {
        if (param) {
            param = param.trim();
        }
        app.TodoFilter = param || '';

        /**
         * Trigger a collection filter event, causing hiding/unhiding of to-do view items
         */
        app.Todos.trigger('filter');
    }
});

app.TodoRouter = new Workspace;

Backbone.history.start();