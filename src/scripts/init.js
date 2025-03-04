const inquirer = require('inquirer');
const { execStream } = require('../helpers/async-node');
const chalk = require('chalk');

const gui = require('../helpers/gui');

module.exports = async args => {
    try {
        //new name or new
        if (args[0] === 'new') {
            let name;
            if (args[1]) {
                name = args[1];
            } else {
                name = await inquirer
                    .prompt({
                        type: 'string',
                        message: 'Project Name:',
                        name: 'projectName',
                    })
                    .then(answers => answers.projectName);
            }
            //clone repo
            await execStream(
                `git clone --depth 1 https://github.com/Squishy123/ronin-starter.git ./${name} --progress`
            );

            //install dependencies
            await execStream(`cd ${name} && yarn`);

            console.log(
                chalk.white(`
Ronin Project Created Successfully!
cd ${name}
and run 
yarn dev`)
            );
        } else {
            gui.displayInitHelp();
        }
    } catch (err) {
        gui.displayError(err);
    }
};
