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
var app = app || {};

app.AppView = Backbone.View.extend({

    el: '#todoapp',

    statsTemplate: _.template($('#stats-template').html()),

    events: {
        'keypress #new-todo'    : 'createOnEnter',
        'click #clear-completed': 'clearCompleted',
        'click #toggle-all'     : 'toggleAllComplete'
    },

    initialize: function () {
        this.allCheckbox = this.$('#toggle-all')[0];
        this.$input = this.$('#new-todo');
        this.$footer = this.$('#footer');
        this.$main = this.$('#main');

        this.listenTo(app.Todos, 'add', this.addOne);
        this.listenTo(app.Todos, 'reset', this.addAll);
        this.listenTo(app.Todos, 'change:completed', this.filterOne);
        this.listenTo(app.Todos, 'filter', this.filterAll);
        this.listenTo(app.Todos, 'all', this.render);

        app.Todos.fetch();
    },

    /**
     * Re-rendering the app just means refreshing the statistics --the rest of the app does not change
     */
    render: function () {
        var completed = app.Todos.completed().length;
        var remaining = app.Todos.remaining().length;

        if (app.Todos.length) {
            this.$main.fadeIn(800);
            this.$footer.fadeIn(800);

            this.$footer.html(this.statsTemplate({
                completed: completed,
                remaining: remaining
            }));

            this.$('#filters li a')
                .removeClass('selected')
                .filter('[href="#/' + (app.TodoFilter || '') + '"]')
                .addClass('selected');
        } else {
            this.$main.hide();
            this.$footer.hide();
        }

        this.allCheckbox.checked = !remaining;
    },

    addOne: function (todo) {
        var view = new app.TodoView({model: todo});
        this.$('#todo-list').append(view.render().el);
    },

    addAll: function () {
        this.$('#todo_list').html('');
        app.Todos.each(this.addOne, this);
    },

    filterOne: function (todo) {
        todo.trigger('visible');
    },

    filterAll: function () {
        app.Todos.each(this.filterOne, this);
    },

    newAttributes: function () {
        return{
            title    : this.$input.val().trim(),
            order    : app.Todos.nextOrder(),
            completed: false
        };
    },

    createOnEnter: function (event) {
        if (event.which !== ENTER_KEY || !this.$input.val().trim()) {
            return;
        }

        app.Todos.create(this.newAttributes());
        this.$input.val('');
    },

    clearCompleted: function () {
        _.invoke(app.Todos.completed(), 'destroy');
        return false;
    },

    toggleAllComplete: function () {
        var completed = this.allCheckbox.checked;

        app.Todos.each(function (todo) {
            todo.save({
                'completed': completed
            });
        });
    }
});
var app = app || {};

app.TodoView = Backbone.View.extend({
    tagName: 'li',

    template: _.template($('#item-template').html()),

    events: {
        'click .toggle' : 'toggleCompleted',
        'click .destroy': 'clear',
        'dblclick label': 'edit',
        'keypress .edit': 'updateOnEnter',
        'blur .edit'    : 'close'
    },

    initialize: function () {
        this.listenTo(this.model, 'change', this.render);
        this.listenTo(this.model, 'destroy', this.remove);
        this.listenTo(this.model, 'visible', this.toggleVisible);
    },

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        this.$el.toggleClass('completed', this.model.get('completed'));
        this.toggleVisible();

        this.$input = this.$('.edit');
        return this;
    },

    toggleVisible: function () {
        this.$el.toggleClass('hidden', this.isHidden());
    },

    isHidden: function () {
        var isCompleted = this.model.get('completed');

        return (
            (!isCompleted && app.TodoFilter === 'completed')
                || (isCompleted && app.TodoFilter === 'active')
            );
    },

    toggleCompleted: function () {
        this.model.toggle();
    },

    edit: function () {
        this.$el.addClass('editing');
        this.$input.focus();
    },

    close: function () {
        var value = this.$input.val().trim();

        if (value) {
            this.model.save({title: value});
        } else {
            this.clear();
        }

        this.$el.removeClass('editing');
    },

    clear: function () {
        this.model.destroy();
    },

    updateOnEnter: function (e) {
        if (e.which === ENTER_KEY) {
            this.close();
        }
    }
});
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