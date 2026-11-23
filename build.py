import pathlib
d=pathlib.Path(__file__).parent/'src'
h=(d/'index.html').read_text()
h=h.replace('/*CSS*/',(d/'style.css').read_text()).replace('/*JS*/','\n'.join((d/f).read_text() for f in ['data.js','app.js','games.js']))
(d.parent/'dist'/'EpiQuest.html').write_text(h)
print('built',len(h))
(d.parent/'dist'/'index.html').write_text(h)
