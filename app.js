const nightmare = require('nightmare')({ show: true, width: 1920, height: 1080 });

nightmare
  .goto('http://coe1.annauniv.edu/home/')
  .insert('#register_no', process.argv[2])
  .insert('#dob', process.argv[3])
  .type('#dob', '\u0009')
  .wait('#tab4')
  .click('#tab4')
  .wait(1000)
  .screenshot('./result.png')
  .end()
  .then(function (result) {
    console.log('Done.');
  })
  .catch(function (error) {
    console.error('Search failed:', error);
  });
