const db = require('../../helpers/db');
const chalk = require('chalk');
const gui = require('../../helpers/gui');
const inquirer = require('inquirer');
const fs = require('fs');

const deleteModels = require('./models');

module.exports = async args => {
    //null
    if (args[0] == 'delete') {
        gui.displayDeleteHelp();
    } else if (args[0] == 'delete:select') {
        let data = {
            models: db
                .get('models')
                .value()
                .map((m, i) =>
                    Object.assign(m, {
                        value: {
                            index: i,
                            category: 'models',
                        },
                    })
                ),
            migrations: db
                .get('migrations')
                .get('order')
                .value()
                .map((m, i) =>
                    Object.assign(m, {
                        value: {
                            index: i,
                            category: 'migrations',
                        },
                    })
                ),
            modules: db
                .get('modules')
                .value()
                .map((m, i) =>
                    Object.assign(m, {
                        value: {
                            index: i,
                            category: 'modules',
                        },
                    })
                ),
            middlewares: db
                .get('middlewares')
                .value()
                .map((m, i) =>
                    Object.assign(m, {
                        value: {
                            index: i,
                            category: 'middlewares',
                        },
                    })
                ),
            routes: db
                .get('routes')
                .value()
                .map((m, i) =>
                    Object.assign(m, {
                        value: {
                            index: i,
                            category: 'routes',
                        },
                    })
                ),
        };

        let selected = await inquirer
            .prompt([
                {
                    type: 'checkbox',
                    message: 'Select Deletions',
                    name: 'deletions',
                    choices: [
                        new inquirer.Separator(' = Models = '),
                        ...data.models,
                        new inquirer.Separator(' = Migrations = '),
                        ...data.migrations,
                        new inquirer.Separator(' = Modules = '),
                        ...data.modules,
                        new inquirer.Separator(' = Middlewares = '),
                        ...data.middlewares,
                        new inquirer.Separator(' = Routes = '),
                        ...data.routes,
                    ],
                },
            ])
            .then(answers => answers.deletions);

        let confirmData = selected.reduce((acc, val) => {
            return acc + `\n${data[val.category][val.index].name}`;
        }, '');

        let confirm = await inquirer
            .prompt({
                name: 'confirm',
                type: 'confirm',
                message: 'Confirm Deletions:' + confirmData + '\n',
            })
            .then(answers => answers.confirm);

        if (confirm) {
            selected.forEach(val => {
                let e = data[val.category][val.index];
                console.log(`Deleting ${e.path}`);
                fs.unlinkSync(e.path);

                if (val.category == 'migrations') {
                    db.get('migrations')
                        .get('order')
                        .remove(e)
                        .write();
                } else {
                    db.get(val.category)
                        .remove(e)
                        .write();
                }
            });

            //cleanup
            ['models', 'modules', 'middlewares', 'routes'].forEach(q => {
                db.get(q)
                    .value()
                    .forEach((e, i) => {
                        db.unset(`${q}.${i}.value`).write();
                    });
            });

            db.get('migrations')
                .get('order')
                .value()
                .forEach((e, i) => {
                    db.unset(`migrations.${i}.value`).write();
                });
        }

        console.log(
            chalk.greenBright('Deletions') + ' Completed Successfully!'
        );
    } else if (args[0] == 'delete:models') {
        await deleteModels(args);
    }
};
