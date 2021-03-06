var assert = require("assert");
var helpers = require("./helpers");
var _ = require("underscore")._;
var db;

describe('Tables', function () {
  
  before(function(done){
    helpers.resetDb(function(err,res){
      db = res;
      done();
    });
  });

  describe("Executing inline SQL", function () {
    it('with run and no args returns 3 products', function (done) {
      db.run("select * from products", function(err,res){
        assert.equal(3, res.length)
        done()
      });
    });
    it('with run and id returns Product 1', function (done) {
      db.run("select * from products where id=$1",[1], function(err,res){
        assert.equal(1, res[0].id)
        done()
      });
    });
  });
  describe('Simple queries with args', function () {
    it('returns product 1 with 1 as only arg', function (done) {
      db.products.find(1, function(err,res){
        assert.equal(res.id, 1);
        done();
      });
    });
    it('returns first record with findOne no args', function (done) {
      db.products.findOne(1, function(err,res){
        assert.equal(res.id, 1);
        done();
      });
    });
  });
  describe('Simple queries without args', function () {
    it('returns all records on find with no args', function (done) {
      db.products.find(function(err,res){
        assert.equal(res.length, 3);
        done();
      });
    });
    it('returns first record with findOne no args', function (done) {
      db.products.findOne(function(err,res){
        assert.equal(res.id, 1);
        done();
      });
    });
  });
  describe('Simple queries with AND and OR', function () {
    it('returns Product 1 OR Product 2', function (done) {
      db.products.where("id=$1 OR id=$2", [1,2],function(err,res){
        assert.equal(res.length, 2);
        done();
      });
    });
    it('returns Product 1 AND Product 2', function (done) {
      db.products.where("id=$1 AND price=$2", [1,12.00],function(err,res){
        assert.equal(res.length, 1);
        done();
      });
    });
    it('returns Product 1 with params as not array', function (done) {
      db.products.where("id=$1", 1,function(err,res){
        assert.equal(res.length, 1);
        done();
      });
    });
  });
  describe('Simple queries with count', function () {
    it('returns 2 for OR id 1 or 2', function (done) {
      db.products.count("id=$1 OR id=$2", [1,2],function(err,res){
        assert.equal(res,2);
        done();
      });
    });
    it('returns 1 for id 1', function (done) {
      db.products.count("id=$1", [1],function(err,res){
        assert.equal(res, 1);
        done();
      });
    });
  });
  describe('Simple comparative queries', function () {
    it('returns product with id greater than 2', function (done) {
      db.products.find({"id > " : 2}, function(err,res){
        assert.equal(res[0].id, 3);
        done();
      });
    });
    it('returns product with id less than 2', function (done) {
      db.products.find({"id < " : 2}, function(err,res){
        assert.equal(res[0].id, 1);
        done();
      });
    });
    it('returns products IN 1 and 2', function (done) {
      db.products.find({id : [1,2]}, function(err,res){
        assert.equal(res[0].id, 1);
        done();
      });
    });
    it('returns product NOT IN 1 and 2', function (done) {
      db.products.find({"id <>" : [1,2]}, function(err,res){
        assert.equal(res[0].id, 3);
        done();
      });
    });
  });
  describe('Limiting and Offsetting results', function () {
    it('returns 1 result with limit of 1', function (done) {
      db.products.find(null,{limit : 1}, function(err,res){
        assert.equal(res.length, 1);
        done();
      });
    });
    it('returns second result with limit of 1, offset of 1', function (done) {
      db.products.find({},{limit : 1, offset: 1}, function(err,res){
        assert.equal(res[0].id, 2);
        done();
      });
    });
    it('returns id and name if sending in columns', function (done) {
      db.products.find({},{columns :["id","name"]}, function(err,res){
        var keys = _.keys(res[0]);
        assert.equal(keys.length,2);
        done();
      });
    });
  });

  describe('Ordering results', function () {
    it('returns ascending order of products by price', function (done) {
      db.products.find({}, {order : "price"}, function(err,res){
        assert.equal(res.length, 3);
        assert.equal(res[0].id, 1);
        assert.equal(res[2].id, 3);
        done();
      });
    });
    it('returns descending order of products', function (done) {
      db.products.find({},{order : "id desc"}, function(err,res){
        assert.equal(res.length, 3);
        assert.equal(res[0].id, 3);
        assert.equal(res[2].id, 1);
        done();
      });
    });
  });

  describe('Casing issues', function () {
    it('returns users because we delimit OK', function (done) {
      db.Users.find({}, function(err, res){
        assert.equal(res.length, 1);
        done();
      });
    });
    it('returns the first user because we delimit OK', function (done) {
      db.Users.findOne(function(err,res){
        assert.equal(res.Id, 1);
        done();
      });
    });
    it('returns a subset of columns, when we delimit in the calling code', function (done) {
      db.Users.find({},{columns: ['"Id"','"Email"']}, function(err, res){
        assert.equal(res.length, 1);
        done();
      });
    });
    it('returns a single column, when we delimit in the calling code', function (done) {
      db.Users.find({},{columns: '"Email"'}, function(err, res){
        assert.equal(res.length, 1);
        done();
      });
    });
    it('returns users with a simple order by', function (done) {
      db.Users.find({}, {order: '"Email"'}, function(err, res){
        assert.equal(res.length, 1);
        done();
      });
    });
    it('returns users with a compound order by', function (done) {
      db.Users.find({}, {order: '"Email" asc, "Id" desc'}, function(err, res){
        assert.equal(res.length, 1);
        done();
      });
    });
  });
  describe('Full Text search', function () {
    it('returns 3 products for term "product"', function (done) {
      db.products.search({columns : ["name"], term: "Product"},function(err,res){
        assert.equal(res.length,3);
        done();
      });
    });
    it('returns 1 products for term "3"', function (done) {
      db.products.search({columns : ["name"], term: "3"},function(err,res){
        assert.equal(res.length,1);
        done();
      });
    });
  });
});