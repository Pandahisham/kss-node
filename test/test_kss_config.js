/* eslint-disable max-nested-callbacks */

'use strict';

const KssBuilder = require('../builder');

let pathToJSON = helperUtils.fixtures('cli-option-config.json');

describe('KssConfig object API', function() {
  /* eslint-disable guard-for-in,no-loop-func */
  ['set',
    'get',
    'addOptions',
    'getOptions',
    'normalizeConfig'
  ].forEach(function(method) {
    it('has ' + method + '() method', function(done) {
      expect(new kss.KssConfig({})).to.respondTo(method);
      done();
    });
  });
  /* eslint-enable guard-for-in,no-loop-func */

  describe('KssConfig constructor', function() {
    it('should initialize the data', function(done) {
      let kssConfig = new kss.KssConfig();
      expect(kssConfig).to.have.property('config');
      expect(kssConfig).to.have.property('options');
      done();
    });

    it('should set config when given an object', function(done) {
      let opts = require(pathToJSON);
      let kssConfig = new kss.KssConfig(opts);
      expect(kssConfig.config.source).to.deep.equal('with-include');
      done();
    });
  });

  describe('.set()', function() {
    it('should set this.config', function(done) {
      let kssConfig = new kss.KssConfig();
      kssConfig.set({aSetting: 'isSet'});
      expect(kssConfig.config.aSetting).to.equal('isSet');
      done();
    });

    it('should not unset this.config', function(done) {
      let kssConfig = new kss.KssConfig({newSetting: '../output/nested'});
      kssConfig.set({aSetting: 'isSet'});
      expect(kssConfig.config.newSetting).to.equal('../output/nested');
      done();
    });

    it('should automatically normalize known settings', function(done) {
      let kssConfig = new kss.KssConfig();
      kssConfig.addOptions((new KssBuilder()).options);
      kssConfig.set({destination: 'test/output/nested'});
      kssConfig.set({source: 'test/output/nested'});
      expect(kssConfig.config.destination).to.equal(path.resolve('test', 'output', 'nested'));
      expect(kssConfig.config.source).to.deep.equal([path.resolve('test', 'output', 'nested')]);
      done();
    });
  });

  describe('.get()', function() {
    it('should return this.config', function(done) {
      let kssConfig = new kss.KssConfig(require(pathToJSON));
      let config = kssConfig.get();
      for (let key in config) {
        if (config.hasOwnProperty(key)) {
          expect(config[key]).to.equal(kssConfig.config[key]);
        }
      }
      done();
    });

    it('should return this.config.key given key', function(done) {
      let kssConfig = new kss.KssConfig(require(pathToJSON));
      for (let key in kssConfig.config) {
        if (kssConfig.config.hasOwnProperty(key)) {
          expect(kssConfig.get(key)).to.equal(kssConfig.config[key]);
        }
      }
      done();
    });
  });

  describe('.addOptions()', function() {
    it('should add to this.options', function(done) {
      let kssConfig = new kss.KssConfig(require(pathToJSON));
      kssConfig.addOptions({
        candy: {
          description: 'I want candy.'
        }
      });
      expect(kssConfig.options.candy).to.exist;
      expect(kssConfig.options.candy.description).to.exist;
      expect(kssConfig.options.candy.multiple).to.be.true;
      expect(kssConfig.options.candy.path).to.false;
      done();
    });

    it('should automatically normalize corresponding settings', function(done) {
      let kssConfig = new kss.KssConfig({aSetting: 'test/output/nested'});
      expect(kssConfig.config.aSetting).to.equal('test/output/nested');
      kssConfig.addOptions({
        aSetting: {
          multiple: false,
          path: true
        }
      });
      expect(kssConfig.config.aSetting).to.equal(path.resolve('test', 'output', 'nested'));
      done();
    });
  });

  describe('.getOptions()', function() {
    it('should return this.options', function(done) {
      let kssConfig = new kss.KssConfig();
      kssConfig.addOptions((new KssBuilder()).options);
      let options = kssConfig.getOptions();
      for (let key in options) {
        if (options.hasOwnProperty(key)) {
          expect(options[key]).to.equal(kssConfig.options[key]);
        }
      }
      done();
    });

    it('should return this.options.key given key', function(done) {
      let kssConfig = new kss.KssConfig();
      kssConfig.addOptions((new KssBuilder()).options);
      for (let key in kssConfig.options) {
        if (kssConfig.options.hasOwnProperty(key)) {
          expect(kssConfig.getOptions(key)).to.equal(kssConfig.options[key]);
        }
      }
      done();
    });
  });

  describe('.normalizeConfig()', function() {
    it('should normalize a "multiple" option to an array of values', function(done) {
      let kssConfig = new kss.KssConfig();
      kssConfig.addOptions((new KssBuilder()).options);
      kssConfig.set({source: 'with-include'});
      kssConfig.normalizeConfig(['source']);
      expect(kssConfig.config.source).to.be.an.instanceOf(Array);
      kssConfig.set({source: ['with-include', 'missing-homepage']});
      kssConfig.normalizeConfig(['source']);
      expect(kssConfig.config.source).to.be.an.instanceOf(Array);
      // Yargs will set any option without a default to undefined.
      /* eslint-disable no-undefined */
      kssConfig.set({source: undefined});
      kssConfig.normalizeConfig(['source']);
      expect(kssConfig.config.source).to.be.an.instanceOf(Array);
      expect(kssConfig.config.source.length).to.equal(0);
      done();
    });

    it('should normalize a non-"multiple" option to a single value', function(done) {
      let kssConfig = new kss.KssConfig();
      kssConfig.addOptions((new KssBuilder()).options);
      kssConfig.set({builder: ['empty-source', 'with-include', 'builder']});
      kssConfig.normalizeConfig(['builder']);
      expect(kssConfig.config.builder).to.be.a('string');
      done();
    });

    it('should resolve paths relative to the current working directory', function(done) {
      let kssConfig = new kss.KssConfig(require(pathToJSON));
      kssConfig.addOptions((new KssBuilder()).options);
      kssConfig.normalizeConfig(['source']);
      expect(kssConfig.config.source[0]).to.equal(path.resolve('with-include'));
      done();
    });

    it('should not try to resolve a null path', function(done) {
      let kssConfig = new kss.KssConfig(require(pathToJSON));
      kssConfig.set({destination: null});
      kssConfig.normalizeConfig(['destination']);
      expect(kssConfig.config.destination).to.equal(null);
      done();
    });
  });
});
