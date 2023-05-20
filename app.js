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
const {DataTypes} = Sequelize;

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
  post:{
    type: DataTypes.TEXT
  }
},{
  timestamps: false
});

// default content
const homeStartingContent = "home page start content";
const aboutContent = "about page content";
const contactContent = "contct page content";
let postsArray;


function refreshPostsArray(){

  return new Promise((resolve, reject)=>{
    postsArray = [];

    Blogpost.findAll()
      .then((results) => {
        results.forEach((blogpost)=>{
          postsArray.push(blogpost.dataValues);
        });
        resolve();
      })
      .catch((error) => {
        console.error('Error executing query:', error);
        reject();
      });
  });
}

// complex http
app.get('/', function(req, res){

  refreshPostsArray()
    .then(()=>{
      res.render('home', {
        homeStartingContent:homeStartingContent,
        postsArray:postsArray
      });
    })
    .catch((error)=>{
      console.error('Error refreshing posts array:', error);
    });
});


app.post('/compose', function(req, res){

  const newBlogPost = Blogpost.build({
    title: req.body.titleInput,
    post: req.body.postInput});
  newBlogPost.save();

  res.redirect('/');
});


app.get('/posts/:postUrl', function(req, res){

  let urlParams = req.params.postUrl;  

  let kebabUrlParams = lodash.kebabCase(urlParams);   

  refreshPostsArray()
    .then(()=>{
      postsArray.forEach(function(blogPost){
        let kebabBlogPostTitle = lodash.kebabCase(blogPost.title); 

        if(kebabBlogPostTitle === kebabUrlParams){
          console.log(blogPost, ' title FOUND in db');
          res.render('post', {blogPost:blogPost});
        }else{
          console.log(blogPost, ' title not found in db');
        }
      });
    })
    .catch((error)=>{
      console.error('Error refreshing posts array:', error);
    });
});

//bilerplate http
app.get('/about', function(req, res){
  res.render('about', {aboutContent:aboutContent});
});


app.get('/contact', function(req, res){
  res.render('contact', {contactContent:contactContent});
});


app.get('/compose', function(req, res){
  res.render('compose');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
