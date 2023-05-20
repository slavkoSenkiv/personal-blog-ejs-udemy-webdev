//express and ejs boilerplate
const ejs = require("ejs");
const lodash = require('lodash');
const express = require("express");
const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

//sequelize boilerplate
const Sequelize = require('sequelize');
const {DataTypes, Op} = Sequelize;

let sequelize;
if (process.env.NODE_ENV === 'production'){
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }); 

} else {
  sequelize = new Sequelize(
    'blogproject',
    'postgres',
    'pass',
    {
      host: 'localhost',
      dialect: 'postgres',
      logging: false
    });
}
  
// Test the database connection
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });

//blogpost model
const Blogpost = sequelize.define('blogpost', {
  id:{
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title:{
    type: DataTypes.STRING,
  },
  urlpart:{
    type: DataTypes.STRING
  },
  post:{
    type: DataTypes.TEXT
  }
},{
  timestamps: false
});

// default content
const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";
const postsLst = [];


// http
app.get('/', function(req, res){

  Blogpost.findAll()
    .then((results) => {
      results.forEach((blogpost)=>{
        postsLst.push(blogpost.dataValues);
      });
      console.log('postsLst from get "/"', postsLst);
    })
    .catch((error) => {
      console.error('Error executing query:', error);
    });

  res.render('home', {
    homeStartingContent:homeStartingContent,
    postsLst:postsLst
  });
});

app.get('/posts/:postUrl', function(req, res){

  Blogpost.findAll()
  .then((results) => {
    results.forEach((blogpost)=>{
      let dbPostRow = blogpost.dataValues;
      postsLst.push(dbPostRow);
    });
    console.log('postsLst', postsLst);
  })
  .catch((error) => {
    console.error('Error executing query:', error);
  });

  postsLst.forEach(function(blogPost){
    //let kebabCaseTitle = lodash.kebabCase(blogPost.title);
    console.log('blogPost', blogPost);
    if(blogPost.urlpart === req.params.postUrl){
      console.log(blogPost, ' title FOUND in db');
      res.render('post', {blogPost:blogPost});
    }else{
      console.log(blogPost, ' title not found in db');
    };
  });
});

app.get('/about', function(req, res){
  res.render('about', {aboutContent:aboutContent});
});

app.get('/contact', function(req, res){
  res.render('contact', {contactContent:contactContent});
});

app.get('/compose', function(req, res){
  res.render('compose');
});

app.post('/compose', function(req, res){

  const newBlogPost = Blogpost.build({
    title: blogPost.titleInput,
    urlpart: lodash.kebabCase(blogPost.titleInput),
    post: blogPost.postInput
  });
  newBlogPost.save();

  res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
