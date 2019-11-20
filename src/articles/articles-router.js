const express = require('express')
const ArticlesService = require('./articles-service')
const xss = require('xss')

const articlesRouter = express.Router()
const jsonParser = express.json()

const serializeArticle = article => ({
	id: article.id,
	style: article.style,
	title: xss(article.title), //santize the title and content
	content: xss(article.content),
	date_published: article.date_published,
	author: article.author
})

articlesRouter
	.route('/')
	.get((req, res, next) => {
		ArticlesService.getAllArticles(
			req.app.get('db')
		)
			.then(articles => {
				res.json(articles.map(serializeArticle))
			})
			.catch(next)
	})
	.post(jsonParser, (req, res, next) => {
		const { title, content, style, author } = req.body
		const newArticle = { title, content, style }
		for (const [key, value] of Object.entries(newArticle)){ 
			if(value == null){
				return res.status(400).json({
					error: {message: `Missing '${key}' in request body.`}
				})	
			}
		}
		newArticle.author = author;
		ArticlesService.insertArticle(
			req.app.get('db'),
			newArticle
		)
			.then(article => {
			res
				.status(201)
				.location(req.originalUrl + `/${article.id}`)
				.json(serializeArticle(article))
			})
			.catch(next)
	})

articlesRouter
	.route('/:article_id')
	.all((req,res,next)=>{ //.all will take all /article_id requests first, handy for validation
		ArticlesService.getById(
			req.app.get('db'),
			req.params.article_id
		)
			.then(article => {
				if(!article){
					return res.status(404).json({
						error: { message: `Article doesn't exist` }
					})
				}
				res.article = article; //saving the article to the response, then we pass to whatever HTTP request the user makes
				next()
			})
			.catch(next)
	})
	.get((req, res, next) => {
		res.json(serializeArticle(res.article))
	})
	.delete((req,res,next)=>{
		ArticlesService.deleteArticle(
			req.app.get('db'),
			req.params.article_id
		)
			.then(()=>{
				res.status(204).end()
			})
			.catch(next)
	})
	.patch(jsonParser, (req,res,next) => {
		const {title, style, content} = req.body;
		const articleToUpdate = {title, style, content}
		const numberOfValues = Object.values(articleToUpdate).filter(Boolean).length; //checks if the expected keys are present
		if(numberOfValues === 0){
			return res.status(400).json({
				error: {message: `Request body must contain either 'title', 'style' or 'content'`}
			})
		}
		
		ArticlesService.updateArticle(
			req.app.get('db'),
			req.params.article_id,
			articleToUpdate
		)
			.then(numRowsAffected => {
				res.status(204).end()
			})
			.catch(next)
	})

module.exports = articlesRouter;