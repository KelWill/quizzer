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
  initialize: function(){

  }
});

var QuestionSetView = Backbone.View.extend({
  events: {
   'click button.next': 'nextQuestion',
   'click button.dontknow' : 'dontKnow',
   'click button.checkAnswer' : 'showAnswer'
  },
  nextQuestion: function(){
    this.currentCount++;
    this.$currentQuestion.children().detach();
    if (this.currentCount < this.questions.length) this.$currentQuestion.append(this.questions[this.currentCount].el);
    else this.$currentQuestion.append('<div class = "complete">You\'re Done!</div>');
  },
  showAnswer: function(){
    this.questions[this.currentCount].showAnswer();
  },
  dontKnow: function(){
    this.tostudy.push(this.currentCount);
    this.showAnswer();
  },
  tostudy: [],
  questions: [],
  currentCount: 0,
  template: _.template('<div class = "currentQuestion"></div><div class = "buttons"><button class = "btn btn-lg btn-danger dontknow">Don\'t know</button><button class = "btn btn-lg btn-success next">Got it</button></div>'),
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
    console.log(arguments);
  },
});

var QuestionView = Backbone.View.extend({
  initialize: function(){
    this.render();
  },
  template: _.template('<div class = "question"><%= questionText %></div><div class = "answer"><%= questionAnswer %></div>'),
  render: function(){
    this.$el.append(this.template(this.model.attributes));
    this.$el.find('.answer').hide();
  },
  showAnswer: function(){
    this.$el.find('.question').hide();
    this.$el.find('.answer').show();
  },
});