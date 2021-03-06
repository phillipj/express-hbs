var assert = require('assert');
var hbs = require('..');
var path = require('path');
var H = require('./helpers');


describe('issue-22 template', function() {
  var dirname =  path.join(__dirname, 'issues/22');

  it('should use multiple layouts with caching', function(done) {
    var render = hbs.create().express3({});
    var locals1 = H.createLocals('express3', dirname, { layout: 'layout1', cache: true });
    var locals2 = H.createLocals('express3', dirname, { layout: 'layout2', cache: true });

    render(dirname + '/template.hbs', locals1, function(err, html) {
      assert.ifError(err);
      assert.equal('<layout1>template</layout1>', H.stripWs(html));
      render(dirname + '/template.hbs', locals2, function(err, html) {
        assert.ifError(err);
        assert.equal('<layout2>template</layout2>', H.stripWs(html));
        done();
      });
    });
  });
});

describe('issue-23', function() {
  var dirname =  path.join(__dirname, 'issues/23');

  it('should not pass an empty or missing partial to handlebars', function(done) {
    var render = hbs.create().express3({
      partialsDir: [dirname + '/partials']
    });

    function check(err, html) {
      assert.ifError(err);
      assert.equal('<html>Hello</html>', H.stripWs(html));
      done();
    }
    var result = render(dirname + '/index.hbs', {cache: true, settings: {views: dirname + '/views'}}, check);
  });

  it('should handle empty string', function(done) {
    var render = hbs.create().express3({
      partialsDir: [dirname + '/partials']
    });

    function check(err, html) {
      assert.ifError(err);
      assert.equal('', H.stripWs(html));
      done();
    }
    var result = render(dirname + '/empty.hbs', {cache: true, settings: {views: dirname + '/views'}}, check);
  });


  it('should register empty partial', function(done) {
    var hb = hbs.create();
    var render = hb.express3({
      partialsDir: [dirname + '/partials']
    });
    hb.handlebars.registerPartial('emptyPartial', '');

    var pass = 0;
    function check(err, html) {
      pass++;
      assert.ifError(err);
      assert.equal('foo', H.stripWs(html));
      if (pass < 3) {
        doIt();
      } else {
        done();
      }
    }
    function doIt() {
      render(dirname + '/emptyPartial.hbs', {cache: true, settings: {views: dirname + '/views'}}, check);
    }
    doIt();
  });

  it('should register partial that results in empty string (comment)', function(done) {
    var hb = hbs.create();
    var render = hb.express3({
      partialsDir: [dirname + '/partials']
    });
    // this fails
    //hb.handlebars.registerPartial('emptyComment', '{{! just a comment}}');
    hb.registerPartial('emptyComment', '{{! just a comment}}');

    var pass = 0;
    function check(err, html) {
      pass++;
      assert.ifError(err);
      assert.equal('foo', H.stripWs(html));
      if (pass < 3) {
        doIt();
      } else {
        done();
      }
    }
    function doIt() {
      render(dirname + '/emptyComment.hbs', {cache: true, settings: {views: dirname + '/views'}}, check);
    }
    doIt();
  });
});


describe('issue-21', function() {
  var dirname =  path.join(__dirname, 'issues/21');
  var render = hbs.create().express3({
    layoutsDir: dirname + '/views/layouts'
  });

  it('should allow specifying layouts without the parent dir', function(done) {
    function check(err, html) {
      assert.ifError(err);
      assert.equal('<html>index</html>', H.stripWs(html));
      done();
    }

    var options = {cache: true, layout: 'default', settings: {views: dirname + '/views'}};
    var result = render(dirname + '/views/index.hbs', options, check);
  });


  it('should allow specifying layouts without the parent dir in a sub view', function(done) { function check(err, html) {
      assert.ifError(err);
      assert.equal('<html>sub</html>', H.stripWs(html));
      done();
    }

    var options = {cache: true, layout: 'default', settings: {views: dirname + '/views'}};
    var result = render(dirname + '/views/sub/sub.hbs', options, check);
  });

  it('should treat layouts that start with "." relative to template', function(done) { function check(err, html) {
      assert.ifError(err);
      assert.equal('<relative>sub</relative>', H.stripWs(html));
      done();
    }

    var options = {cache: true, layout: './relativeLayout', settings: {views: dirname + '/views'}};
    var result = render(dirname + '/views/sub/sub.hbs', options, check);
  });

  it('should allow layouts in subfolders', function(done) {
    function check(err, html) {
      assert.ifError(err);
      assert.equal('<sub>useLayoutInDir</sub>', H.stripWs(html));
      done();
    }

    var options = {cache: true, layout: 'sub/child', settings: {views: dirname + '/views'}};
    var result = render(dirname + '/views/useLayoutInDir.hbs', options, check);
  });

  it('should treat layouts relative to views directory if layoutsDir is not passed', function(done) {
    var dirname =  path.join(__dirname, 'issues/21');
    var render = hbs.create().express3();

    function check(err, html) {
      assert.ifError(err);
      assert.equal('<sub>sub</sub>', H.stripWs(html));
      done();
    }

    var options = {cache: true, layout: 'layouts/sub/child', settings: {views: dirname + '/views'}};
    var result = render(dirname + '/views/sub/sub.hbs', options, check);
  });
});


describe('issue-49', function() {
  var dirname =  path.join(__dirname, 'issues/49');

  it('should report filename with error', function(done) {
    var hb = hbs.create()
    var render = hb.express3({});
    var locals = H.createLocals('express3', dirname, {});
    render(dirname + '/error.hbs', locals, function(err, html) {
      assert(err.stack.indexOf('[error.hbs]') > 0);
      done();
    });
  });

  it('should report relative filename with error', function(done) {
    var hb = hbs.create()
    var render = hb.express3({});
    var locals = H.createLocals('express3', dirname, {});
    render(dirname + '/front/error.hbs', locals, function(err, html) {
      assert(err.stack.indexOf('[front/error.hbs]') > 0);
      done();
    });
  });

  it('should report filename with partial error', function(done) {
    var hb = hbs.create()
    var render = hb.express3({
      partialsDir: dirname + '/partials'
    });
    var locals = H.createLocals('express3', dirname, {});
    render(dirname + '/partial.hbs', locals, function(err, html) {
      assert(err.stack.indexOf('[partial.hbs]') > 0);
      done();
    });
  });

  it('should report filename with layout error', function(done) {
    var hb = hbs.create()
    var render = hb.express3({
      partialsDir: dirname + '/partials'
    });
    var locals = H.createLocals('express3', dirname, {});
    render(dirname + '/index.hbs', locals, function(err, html) {
      assert(err.stack.indexOf('[layouts/default.hbs]') > 0);
      done();
    });
  });
});

describe('issue-53', function() {
  var dirname =  path.join(__dirname, 'issues/53');

  it('should use block with async helpers', function(done) {
    var hb = hbs.create()
    var res = 0;
    hb.registerAsyncHelper('weird', function(_, resultcb) {
      setTimeout(function() {
        resultcb(++res);
      }, 1)
    });
    var render = hb.express3({});
    var locals = H.createLocals('express3', dirname, {});
    render(dirname + '/index.hbs', locals, function(err, html) {
      assert.ok(html.indexOf('__aSyNcId_') < 0);
      done();
    });
  });
});







