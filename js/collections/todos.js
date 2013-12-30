var app = app || {};

var TodoList = Backbone.Collection.extend({

    /**
     * Reference to this collection's model, the model used by Collection.create to instantiate a new model in the
     * collection
     */
    model: app.Todo,

    /**
     * Collection is backed by localStorage instead of a remote server. Save all to-dos under the 'todos-bacbone'
     * namespace.
     */
    localStorage: new Backbone.LocalStorage('todos-backbone'),

    /**
     * filter down the list of to-do items that are completed i.e. completed is true
     * @returns {Array|Sizzle.selectors.filter|*}
     */
    completed: function () {
        return this.filter(function (todo) {
            return todo.get('completed');
        });
    },

    /**
     * Filter down the list of all to-do items that are still not finished
     * @returns {*}
     */
    remaining: function () {
        return this.without.apply(this, this.completed());
    },

    /**
     * We keep the to-dos in sequential order, despite being saved by unordered GUID in the database.
     * This generated the next order number for new items
     * @returns {*}
     */
    nextOrder: function () {
        if (!this.length) {
            return 1
        }
        return this.last().get('order') + 1;
    },

    comparator: function (todo) {
        return todo.get('order');
    }
});

app.Todos = new TodoList();