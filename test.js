const nightmare = require('nightmare')({ width: 1920, height: 1080 });
const fs        = require('fs');
const stdin     = process.openStdin();
const spawn     = require('child_process').spawn;

function main() {
  nightmare
    .goto('http://coe1.annauniv.edu/home/')
    .wait(500)
    .exists('#register_no')
    .then((loaded) => {
      if(!loaded) main();

      nightmare
        .insert('#register_no', process.argv[2])
        .insert('#dob', process.argv[3])
        .evaluate(() => {
          return $('#login_stu .login > img').attr('src');
        })
        .then((captcha) => {
          let captchaBase64 = captcha.replace(/^data:image\/png;base64,/, "");
          let txt;
          fs.writeFile("captcha.png", captchaBase64, 'base64', function(err) {
            if(err) console.log(err);
            txt = spawn('cacaview', ['./captcha.png']);
            console.log('Solve Captcha: [./captcha.png] : ');

          });

          stdin.once("data", function(d) {
            txt.kill('SIGINT');
            let captchaSol = d.toString().trim();

            nightmare
              .insert('#security_code_student', captchaSol)
              .click('html body div#wrapper div#page div#content div#content-box1.box form#login_stu div.members_login div.login_row input#gos.buttonSubmit')
              .wait(1000)
              .exists('#tab4')
              .then((loaded) => {
                if(!loaded) main();

                nightmare
                  .click('#tab4')
                  .wait(1000)
                  .exists('#footer')
                  .then((loaded) => {
                    if(!loaded) main();

                    nightmare
                      .screenshot('./result.png')
                      .end()
                      .then(function (result) {
                        console.log('Done.');
                        spawn('display', ['./result.png']);
                        process.exit();
                      })
                      .catch(function (error) {
                        console.error('Error: ', error);
                      });
                  })
              })
          });

        });

    });
}

main();
