drop table if exists "Users";
drop table if exists products;
drop table if exists docs;

create table "Users"(
  "Id" serial primary key,
  "Email" varchar(50) not null,
  search tsvector
);

create table products(
  id serial primary key,
  name varchar(50) NOT NULL,
  price decimal(10,2) default 0.00 not null,
  description text,
  in_stock boolean,
  created_at timestamptz default now() not null
);

create table docs(
  id serial primary key,
  body jsonb not null,
  search tsvector
);

insert into "Users"("Email")
values('test@test.com');

insert into products(name, price, description, in_stock)
values ('Product 1', 12.00, 'Product 1 description', true),
('Product 2', 24.00, 'Product 2 description', true),
('Product 3', 35.00, 'Product 3 description', false);

insert into docs(body) 
values('{"title":"A Document","price":22,"description":"lorem ipsum etc","is_good":true,"created_at":"2015-03-04T09:43:41.643Z"}'),
('{"title":"Another Document","price":18,"description":"Macaroni and Cheese","is_good":true,"created_at":"2015-03-04T09:43:41.643Z"}'),
('{"title":"Starsky and Hutch","price":6,"description":"Two buddies fighting crime","is_good":false,"created_at":"1977-03-04T09:43:41.643Z","studios": [{"name" : "Warner"}, {"name" : "Universal"}]}');