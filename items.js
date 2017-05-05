/*
  Copyright (c) 2008 - 2016 MongoDB, Inc. <http://mongodb.com>

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/


var MongoClient = require('mongodb').MongoClient,
	assert = require('assert');


function ItemDAO(database) {
	this.db = database;

	this.getCategories = function (callback) {
		this.db.collection("item")
			.aggregate([
				{
					"$group": {
						"_id": "$category",
						"num": { "$sum": 1 }
					}
				},
				{
					"$sort": { "_id": 1 }
				},
			])
			.toArray()
			.then((groupsByCategory) => {
				const overallItemsCount = groupsByCategory.reduce((prev, next) => {
					return prev + next.num;
				}, 0);

				const allItems_group = {
					_id: "All",
					num: overallItemsCount,
				};

				const allGroups = [allItems_group].concat(groupsByCategory);
				callback(allGroups);
			})
			.catch((err) => {
				console.log(err);
				throw err;
			});
	}


	this.getItems = function (category, page, itemsPerPage, callback) {
		let query = category === "All" ? {} : { category };

		this.db.collection("item")
			.find(query)
			.sort({ "_id": 1 })
			.skip(page * itemsPerPage)
			.limit(itemsPerPage)
			.toArray()
			.then(pageItems => callback(pageItems))
			.catch((err) => {
				console.log(err);
				throw err;
			});
	}


	this.getNumItems = function (category, callback) {
		let query = category === "All" ? {} : { category };

		this.db.collection("item")
			.find(query)
			.count()
			.then(res => callback(res))
			.catch((err) => {
				console.log(err);
				throw err;
			});
	}


	this.searchItems = function (query, page, itemsPerPage, callback) {
		this.db.collection("item")
			.find({
				$text: { $search: query }
			})
			.sort({ _id: 1 })
			.skip(page * itemsPerPage)
			.limit(itemsPerPage)
			.toArray()
			.then(items => callback(items))
			.catch((err) => {
				console.log(err);
				throw err;
			});
	}


	this.getNumSearchItems = function (query, callback) {
		this.db.collection("item")
			.count({
				$text: { $search: query }
			})
			.then(numItems => callback(numItems))
			.catch((err) => {
				console.log(err);
				throw err;
			});
	}


	this.getItem = function (itemId, callback) {
		"use strict";

		/*
		 * TODO-lab3
		 *
		 * LAB #3: Implement the getItem() method.
		 *
		 * Using the itemId parameter, query the "item" collection by
		 * _id and pass the matching item to the callback function.
		 *
		 */

		var item = this.createDummyItem();

		// TODO-lab3 Replace all code above (in this method).

		// TODO Include the following line in the appropriate
		// place within your code to pass the matching item
		// to the callback.
		callback(item);
	}


	this.getRelatedItems = function (callback) {
		"use strict";

		this.db.collection("item").find({})
			.limit(4)
			.toArray(function (err, relatedItems) {
				assert.equal(null, err);
				callback(relatedItems);
			});
	};


	this.addReview = function (itemId, comment, name, stars, callback) {
		"use strict";

		/*
		 * TODO-lab4
		 *
		 * LAB #4: Implement addReview().
		 *
		 * Using the itemId parameter, update the appropriate document in the
		 * "item" collection with a new review. Reviews are stored as an
		 * array value for the key "reviews". Each review has the fields:
		 * "name", "comment", "stars", and "date".
		 *
		 */

		var reviewDoc = {
			name: name,
			comment: comment,
			stars: stars,
			date: Date.now()
		}

		// TODO replace the following two lines with your code that will
		// update the document with a new review.
		var doc = this.createDummyItem();
		doc.reviews = [reviewDoc];

		// TODO Include the following line in the appropriate
		// place within your code to pass the updated doc to the
		// callback.
		callback(doc);
	}


	this.createDummyItem = function () {
		"use strict";

		var item = {
			_id: 1,
			title: "Gray Hooded Sweatshirt",
			description: "The top hooded sweatshirt we offer",
			slogan: "Made of 100% cotton",
			stars: 0,
			category: "Apparel",
			img_url: "/img/products/hoodie.jpg",
			price: 29.99,
			reviews: []
		};

		return item;
	}
}


module.exports.ItemDAO = ItemDAO;
