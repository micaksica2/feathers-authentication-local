import Debug from 'debug';
import merge from 'lodash.merge';
import omit from 'lodash.omit';
import pick from 'lodash.pick';
import hooks from './hooks';
import DefaultVerifier from './verifier';
import { Strategy as LocalStrategy } from 'passport-local';

const debug = Debug('feathers-authentication-local');
const defaults = {
  name: 'local',
  usernameField: 'email',
  passwordField: 'password'
};

const KEYS = [
  'entity',
  'service',
  'passReqToCallback',
  'session'
];

export default function init(options = {}) {
  return function localAuth() {
    const app = this;
    const _super = app.setup;

    if (!app.passport) {
      throw new Error(`Can not find app.passport. Did you initialize feathers-authentication before feathers-authentication-local?`);
    }

    let name = options.name || defaults.name;
    let authOptions = app.get('authentication') || {};
    let localOptions = authOptions[name] || {};

    // NOTE (EK): Pull from global auth config to support legacy auth for an easier transition.
    const localSettings = merge({}, defaults, pick(authOptions, KEYS), localOptions, omit(options, ['Verifier']));
    let Verifier = DefaultVerifier;

    if (options.Verifier) {
      Verifier = options.Verifier;
    }

    app.setup = function () {
      let result = _super.apply(this, arguments);
      let verifier = new Verifier(app, localSettings);

      if (!verifier.verify) {
        throw new Error(`Your verifier must implement a 'verify' function. It should have the same signature as a local passport verify callback.`)
      }

      // Register 'local' strategy with passport
      debug('Registering local authentication strategy with options:', localSettings);
      app.passport.use(localSettings.name, new LocalStrategy(localSettings, verifier.verify.bind(verifier)));
      app.passport.options(localSettings.name, localSettings);
      
      return result;
    }
  };
}

// Exposed Modules
Object.assign(init, {
  defaults,
  hooks,
  Verifier: DefaultVerifier
});