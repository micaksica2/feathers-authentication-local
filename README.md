# feathers-authentication-local

[![Build Status](https://travis-ci.org/feathersjs/feathers-authentication-local.png?branch=master)](https://travis-ci.org/feathersjs/feathers-authentication-local)
[![Code Climate](https://codeclimate.com/github/feathersjs/feathers-authentication-local/badges/gpa.svg)](https://codeclimate.com/github/feathersjs/feathers-authentication-local)
[![Test Coverage](https://codeclimate.com/github/feathersjs/feathers-authentication-local/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/feathers-authentication-local/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers-authentication-local.svg?style=flat-square)](https://david-dm.org/feathersjs/feathers-authentication-local)
[![Download Status](https://img.shields.io/npm/dm/feathers-authentication-local.svg?style=flat-square)](https://www.npmjs.com/package/feathers-authentication-local)

> Local authentication strategy for feathers-authentication

## Installation

```
npm install feathers-authentication-local --save
```

## Documentation

<!-- Please refer to the [feathers-authentication-local documentation](http://docs.feathersjs.com/) for more details. -->

## API

This module contains 3 core pieces:

1. The main entry function
2. The `hashPassword` hook 
3. The `Verifier` class

### Main Initialization

In most initializing the `feathers-authentication-local` module is simply:

```js
app.configure(authentication(settings));
app.configure(local());
```

This will pull from your global `auth` object in your config file. It will also mix in the following defaults, which can be customized.

#### Default Options

```js
{
    name: 'local', // the name to use when invoking the authentication Strategy
    entity: 'user', // the entity that you comparing username/password against
    service: 'users', // the service to look up the entity
    usernameField: 'email', // key name of username field
    passwordField: 'password', // key name of password field
    passReqToCallback: true, // whether the request object should be passed to `verify`
    session: false // whether to use sessions,
    Verifier: Verifier // A Verifier class. Defaults to the built-in one but can be a custom one. See below for details.
}
```

### hashPassword hook

This hook is used to hash plain text passwords before they are saved to the database. It uses the bcrypt algorithm by default but can be customized by passing your own `optionk.hash` function.

#### Default Options

```js
{
    passwordField: 'password', // key name of password field to look on hook.data
    hash: 'function' // default bcrypt hash function. Takes in a password and returns a hash.
}
```

### Verifier

This is the verification class that does the username and password verification by looking up the entity (normally a `user`) on a given service and compares the hashed password using bcrypt. It has the following methods that can be overridden. All methods return a promise.

```js
{
    constructor(app, options) // the class constructor
    comparePassword(entity, password) // compares password using bcrypt
    normalizeResult(result) // normalizes result from service to account for pagination
    verify(req, username, password, done) // queries the service and calls the other internal functions.
}
```


## Customizing the Verifier

The `Verifier` class can be extended so that you customize it's behavior without having to rewrite and test a totally custom local Passport implementation. Although that is always an option if you don't want use this plugin.

An example of customizing the Verifier:

```js
import local, { Verifier } from 'feathers-authentication-local';

class CustomVerifier extends Verifier {
  verify(req, username, password, done) {
    // do your custom stuff. You can call internal Verifier methods
    // and reference this.app and this.options. This method must be implemented.
    done(null, user);
  }
}

app.configure(local({ Verifier: CustomVerifier }));
```

## Complete Example

Here's a basic example of a Feathers server that uses `feathers-authentication-local`. You can see a fully working example in the [example/](./example/) directory.

```js
const feathers = require('feathers');
const rest = require('feathers-rest');
const hooks = require('feathers-hooks');
const memory = require('feathers-memory');
const bodyParser = require('body-parser');
const errorHandler = require('feathers-errors/handler');
const auth = require('feathers-authentication');
const local = require('feathers-authentication-local');

// Initialize the application
const app = feathers()
  .configure(rest())
  .configure(hooks())
  // Needed for parsing bodies (login)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  // Initialize a user service. This must come first
  .use('/users', memory())
  // Configure feathers-authentication
  .configure(auth({ secret: 'super secret' }))
  .configure(local())
  .use(errorHandler());

app.listen(3030);

console.log('Feathers app started on 127.0.0.1:3030');
```

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
