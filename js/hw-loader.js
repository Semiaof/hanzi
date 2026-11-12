/* Stroke-data loader · © 2026 李牧飞 Aphisit Kaewnet
   Order: this site's own copy (data/hw) -> CDN mirrors, so it also works where CDNs are blocked. */
(function () {
  var SOURCES = [
    function (ch) { return 'data/hw/' + ch.codePointAt(0).toString(16) + '.json'; },
    function (ch) { return 'https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/' + encodeURIComponent(ch) + '.json'; },
    function (ch) { return 'https://fastly.jsdelivr.net/npm/hanzi-writer-data@2.0.1/' + encodeURIComponent(ch) + '.json'; },
    function (ch) { return 'https://unpkg.com/hanzi-writer-data@2.0.1/' + encodeURIComponent(ch) + '.json'; }
  ];
  var mem = {};
  function get(url, ms) {
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var t = setTimeout(function () { if (ctrl) ctrl.abort(); }, ms);
    return fetch(url, ctrl ? { signal: ctrl.signal } : {}).then(function (r) {
      clearTimeout(t);
      if (!r.ok) throw new Error('http ' + r.status);
      return r.json();
    }, function (e) { clearTimeout(t); throw e; });
  }
  function load(ch) {
    if (!mem[ch]) {
      var i = 0;
      var next = function () {
        if (i >= SOURCES.length) return Promise.reject(new Error('no stroke data for ' + ch));
        var url = SOURCES[i++](ch);
        return get(url, i === 1 ? 12000 : 7000).catch(next);
      };
      mem[ch] = next();
      mem[ch].catch(function () { delete mem[ch]; });
    }
    return mem[ch];
  }
  function loader(ch, onLoad, onError) { load(ch).then(onLoad, onError); }
  window.hanziDataLoader = loader;
  if (typeof HanziWriter === 'undefined') return;
  var create = HanziWriter.create, loadData = HanziWriter.loadCharacterData;
  HanziWriter.create = function (el, ch, opts) {
    return create.call(HanziWriter, el, ch, Object.assign({ charDataLoader: loader }, opts || {}));
  };
  HanziWriter.loadCharacterData = function (ch, opts) {
    return loadData.call(HanziWriter, ch, Object.assign({ charDataLoader: loader }, opts || {}));
  };
})();
