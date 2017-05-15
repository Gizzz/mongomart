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


function CartDAO(database) {
    this.db = database;


    this.getCart = function(userId, callback) {
        this.db.collection("cart")
            .findOne({ userId })
            .then(userCart => callback(userCart))
            .catch((err) => {
				console.log(err);
				throw err;
			});
    }


    this.itemInCart = function(userId, itemId, callback) {
        this.db.collection("cart")
            .findOne({ userId })
            .then(cart => {
                const itemFromCart = cart.items.find(item => item._id === itemId);

                if (itemFromCart) {
                    callback(itemFromCart);
                } else {
                    callback(null);
                }
            })
            .catch((err) => {
				console.log(err);
				throw err;
			});
    }


    this.addItem = function(userId, item, callback) {
        this.db.collection("cart").findOneAndUpdate(
            {userId: userId},
            {"$push": {items: item}},
            {
                upsert: true,
                returnOriginal: false
            },
            function(err, result) {
                assert.equal(null, err);
                callback(result.value);
            }
        );
    };


    this.updateQuantity = function(userId, itemId, quantity, callback) {
        let updateDocument;

        if (quantity === 0) {
            // then remove item from cart
            updateDocument = { 
                $pull: { 
                    items : { _id: itemId } 
                } 
            };
        } else {
            // update item quantity
            updateDocument = { 
                $set: { "items.$.quantity": quantity } 
            }
        }

        this.db.collection("cart")
            .findOneAndUpdate(
                { 
                    userId,  
                    "items._id": itemId,
                },
                updateDocument,
                { returnOriginal: false }
            )
            .then(result => callback(result.value))
            .catch((err) => {
				console.log(err);
				throw err;
			});
    }

    this.createDummyItem = function() {
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
            quantity: 1,
            reviews: []
        };

        return item;
    }

}


module.exports.CartDAO = CartDAO;
