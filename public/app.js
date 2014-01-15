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
   'click button.showAnswer' : 'showAnswer',
   'click button.save' : 'save'
  },
  nextQuestion: function(){
    this.$el.find('button.showAnswer').show();
    if (this.currentCount < this.questions.length){
      this.currentCount++;
      this.$currentQuestion.children().detach();
      this.$currentQuestion.append(this.questions[this.currentCount].el);
    }
    else this.$currentQuestion.append('<div class = "complete"><h1>You\'re Done!</h1></div>');
  },
  showAnswer: function(){
    var questionView = this.questions[this.currentCount];
    questionView.toggleAnswer();
    questionView.showingANswer = true;
    this.$el.find('button.showAnswer').hide();
  },
  dontKnow: function(){
    // Saving question model
    var questionView = this.questions[this.currentCount];
    if (questionView.showingAnswer){
      if (!questionView.dontKnow) this.tostudy.push(this.questions[this.currentCount].model);
      this.nextQuestion();
    } else {
     questionView.dontKnow = true;
     this.tostudy.push(this.questions[this.currentCount].model);
     questionView.toggleAnswer();
    }
  },
  save: function(){
    var savedQuestions = new SavedQuestions({questions: this.tostudy});
    $('.container').append(savedQuestions.el);
  },
  tostudy: [],
  questions: [],
  currentCount: 0,
  template: _.template('<div class = "count">0</div><div class = "total"></div>' +
                       '<div class = "currentQuestion"></div><div class = "buttons">' +
                       '<button class = "btn btn-lg btn-danger dontKnow"><span class = "glyphicon glyphicon-floppy-disk"></span> Don\'t know</button>' +
                       '<button class = "showAnswer btn btn-lg btn-primary"><span class = "glyphicon glyphicon-ok"></span> Check Answer </button></button>' +
                       '<button class = "btn btn-lg btn-success next"><span class = "glyphicon glyphicon-play"></span> Next</button></div>' +
                       '<div class = "saveSection"><hr><button class = "btn btn-block btn-info save"><span class = "glyphicon glyphicon-save"></span> Get failed questions</div>'),
  render: function(){
    this.$el.append(this.template({}));
    this.$currentQuestion = this.$el.find('.currentQuestion');
    this.collection.forEach(function(model){
      var questionView = new QuestionView({model: model});
      this.questions.push(questionView);
    }, this);
    //so you don't always see the same order
    shuffle(this.questions);
    if (this.questions.length){
      this.$currentQuestion.append(this.questions[this.currentCount].el);
    }
    this.$countDone = this.$el.find('.count');
    this.updateCount();
    this.$el.find('.total').text(this.questions.length);
    return this;
  },
  updateCount: function(){
    this.$countDone.text(this.currentCount + 1);
  }
});

var SavedQuestions = Backbone.View.extend({
  initialize: function(questions){
    this.questions = questions.questions;
    this.render();
    return this;
  },
  events: {
   'click button' : 'destroyThis'
  },
  destroyThis: function(){
    this.$el.remove();
  },
  className: 'saved',
  template: _.template('<div class = "question"><p>Question: <%= questionText %></p></div><div class = "answer"><p>Answer: <%= questionAnswer %></p></div><br><hr>'),
  render: function(){
    this.$el.append('<div class = "savedQuestions"></div>');
    var $savedQuestions = this.$el.find(".savedQuestions");
    if (!this.questions.length) this.$el.append('You haven\'t gotten any questions wrong, you genius you!');
    for (var i = 0; i < this.questions.length; i++){
      $savedQuestions.append(this.template(this.questions[i].attributes));
    }
    this.$el.append('<button class = "btn btn-block btn-primary done">Done</button>');
  }
});

var Question = Backbone.Model.extend({
  initialize: function(args){
    this.set('questionText', args.questionText.replace(/\n/g, '<br>'));
    this.set('questionAnswer', args.questionAnswer.replace(/\n/g, '<br>'));
  },
});

var QuestionView = Backbone.View.extend({
  initialize: function(){
    this.render();
  },
  template: _.template('<div class = "question"><h2>Question</h2><p><%= questionText %></p></div><div class = "answer"><h2>Answer</h2><p><%= questionAnswer %></p></div>'),
  render: function(){
    this.$el.append(this.template(this.model.attributes));
    this.$el.find('.answer').hide();
  },
  toggleAnswer: function(){
    this.$el.find('.answer').show();
  },
});

function shuffle(array) {
    var currentIndex = array.length;
    var temporaryValue;
    var randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }