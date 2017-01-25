const nightmare = require('nightmare')({ width: 1920, height: 1080 });
const fs        = require('fs');
const stdin     = process.openStdin();
const spawn     = require('child_process').spawn;

function main() {
  nightmare
    .goto('http://coe1.annauniv.edu/home/')
    .wait(500) // Wait for the page to load. Modify if needed, for different bandwidth
    .exists('#register_no')
    .then((loaded) => {
      if(!loaded) main(); // Check if the page has loaded, if not, rerun

      nightmare
        .insert('#register_no', process.argv[2]) // Insert register number
        .insert('#dob', process.argv[3]) // Insert date of birth
        .evaluate(() => {
          return $('#login_stu .login > img').attr('src'); // Get the captcha image
        })
        .then((captcha) => {
          /*
            Store the image in ./captcha.png and open it using `cacaview`.
            Note: I used `cacaview` over traditional `display` image viewer since
            the image is small and for some reason looks more clear
            in cacaview.
          */
          let captchaBase64 = captcha.replace(/^data:image\/png;base64,/, "");
          let txt;
          fs.writeFile("captcha.png", captchaBase64, 'base64', function(err) {
            if(err) console.log(err);
            txt = spawn('cacaview', ['./captcha.png']);
            console.log('Solve Captcha: [./captcha.png] : ');

          });

          // Recieve the answer for the captcha
          stdin.once("data", function(d) {
            txt.kill('SIGINT'); // Close the cacaview window
            let captchaSol = d.toString().trim();

            nightmare
              .insert('#security_code_student', captchaSol) // Insert captcha solution
              .click('form#login_stu #gos') // Click login button
              .wait(1000) // Wait for the page to load. Modify if needed, for different bandwidth
              .exists('#tab4')
              .then((loaded) => {
                if(!loaded) main(); // Check if the page has loaded, if not, rerun

                nightmare
                  .click('#tab4') // Click on `Exam Results` tab
                  .wait(1000) // Wait for the page to load. Modify if needed, for different bandwidth
                  .exists('#footer')
                  .then((loaded) => {
                    if(!loaded) main(); // Check if the page has loaded, if not, rerun

                    nightmare
                      .screenshot('./result.png') //Save the page screenshot to `./result.png`
                      .end()
                      .then(function (result) {
                        console.log('Done.');
                        spawn('display', ['./result.png']); // Open the result screenshot
                        process.exit(); // Halt the program
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

// Check for valid arguments
if((process.argv.length < 4) || !(/[0-9]{12}/g.test(process.argv[2])) || !(/(^(((0[1-9]|1[0-9]|2[0-8])[-](0[1-9]|1[012]))|((29|30|31)[-](0[13578]|1[02]))|((29|30)[\/](0[4,6,9]|11)))[-](19|[2-9][0-9])\d\d$)|(^29[\/]02[\/](19|[2-9][0-9])(00|04|08|12|16|20|24|28|32|36|40|44|48|52|56|60|64|68|72|76|80|84|88|92|96)$)/.test(process.argv[3]))) {
  console.log('Invalid arguments');
  console.log('FORMAT: npm start [register number] [DOB (DD-MM-YYYY)]');
  process.exit(); // Halt the program
}

main();
