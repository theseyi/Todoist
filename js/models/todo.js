var app = app || {};


app.Todo = Backbone.Model.extend({

    /**
     * Default attributes ensure that each to-do created has 'title' and 'completed' keys
     */
    defaults: {
        title    : '',
        completed: false
    },

    /**
     * Toggle the 'completed' state of this to-do item
     */
    toggle: function () {
        this.save({
            completed: !this.get('completed')
        });
    }
});