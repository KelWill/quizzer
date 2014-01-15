var questions = new Firebase("https://quizzer.firebaseio.com/");

questions.once('value', function(snapshot){
  var questions = snapshot.val();
  var questionSet = new QuestionSet();
  for (var key in questions){
    questionSet.add(new Question(questions[key]));
  }
  var questionSetView = new QuestionSetView({collection: questionSet});
  $('.questions').append(questionSetView.render().el);
});

var QuestionSet = Backbone.Collection.extend({
  compileTopics: function(){
    this.forEach(function(model){
      var tags = model.get('tags');
      for (var i = 0; i < tags.length; i++){
        if (!topics[tags[i]]) topics[tags[i]] = 1;
        else topics[tags[i]] = topics[tags[i]] + 1;
      }
    }, this);
  },
  topics: {}
});

var TopicsView = Backbone.View.extend({
  initialize: function(){
    this.collection.compileTopics();
    this.render();
  },
  events: {
   'click': 'updateShowList'
  },
  updateShowList: function(){
    //Could cause bugs -- could refactor to route this through overall app function...
    var tags = this.$el.find('input:checkbox:checked').val();
    questionSet.show = {};
    for (var i = 0; i < tags.length; i++){
      questionSet.show[tags[i]] = true;
    }
  },
  tagName: 'form',
  template: _.template('<label><%=name%> (<%=count%>)</label><input type = "checkbox" name = "options" value = "<%=name%>" checked = "true"></input>'),
  render: function(){
    var options = this.collection.topics;
    for (var key in options){
      this.$el.append(this.template({name: key, count: options[key]}));
    }
    this.updateShowList();
  }
});

var QuestionSetView = Backbone.View.extend({
  events: {
   'click button.next': 'nextQuestion',
   'click button.dontKnow' : 'dontKnow',
   'click button.showAnswer' : 'showAnswer'
  },
  nextQuestion: function(){
    this.currentCount++;
    this.$currentQuestion.children().detach();
    if (this.currentCount < this.questions.length) this.$currentQuestion.append(this.questions[this.currentCount].el);
    else this.$currentQuestion.append('<div class = "complete"><h1>You\'re Done!</h1></div>');
  },
  showAnswer: function(){
    this.questions[this.currentCount].toggleAnswer();
  },
  dontKnow: function(){
    // Saving question model
    var questionView = this.questions[this.currentCount];
    if (questionView.dontKnow === true){
      this.nextQuestion();
    } else {
     questionView.dontKnow = true;
     questionView.toggleAnswer();
     this.tostudy.push(this.questions[this.currentCount].model);
    }
  },
  tostudy: [],
  questions: [],
  currentCount: 0,
  template: _.template('<div class = "currentQuestion"></div><div class = "buttons">\
                       <button class = "btn btn-lg btn-danger dontKnow">Don\'t know</button>\
                       <button class = "showAnswer btn btn-lg btn-warning">Not sure?</button></button>\
                       <button class = "btn btn-lg btn-success next">Got it</button></div>'),
  render: function(){
    this.$el.append(this.template({}));
    this.$currentQuestion = this.$el.find('.currentQuestion');
    this.collection.forEach(function(model){
      var questionView = new QuestionView({model: model});
      this.questions.push(questionView);

    }, this);
    if (this.questions.length){
      this.$currentQuestion.append(this.questions[this.currentCount].el);
    }
    return this;
  }
});

var Question = Backbone.Model.extend({
  initialize: function(){
  },
});

var QuestionView = Backbone.View.extend({
  initialize: function(){
    this.render();
  },
  template: _.template('<div class = "question"><h2>Question:</h2><%= questionText %></div><div class = "answer"><h2>Answer</h2><%= questionAnswer %></div>'),
  render: function(){
    this.$el.append(this.template(this.model.attributes));
    this.$el.find('.answer').hide();
  },
  toggleAnswer: function(){
    this.$el.find('.question').toggle();
    this.$el.find('.answer').toggle();
  },
});