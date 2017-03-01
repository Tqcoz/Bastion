/*
 * Copyright (C) 2017 Sankarsan Kampa
 *                    https://sankarsankampa.com/contact
 *
 * This file is a part of Bastion Discord BOT.
 *                        https://github.com/snkrsnkampa/Bastion
 *
 * This code is licensed under the SNKRSN Shared License. It is free to
 * download, copy, compile, use, study and refer under the terms of the
 * SNKRSN Shared License. You can modify the code only for personal or
 * internal use only. However, you can not redistribute the code without
 * explicitly getting permission fot it.
 *
 * Bastion BOT is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY. See the SNKRSN Shared License for
 * more details.
 *
 * You should have received a copy of the SNKRSN Shared License along
 * with this program. If not, see <https://github.com/snkrsnkampa/Bastion/LICENSE>.
 */

const fs = require('fs');
const getDirSync = require('../functions/getDirSync').func;

module.exports = Bastion => {
  let modules = getDirSync('./modules/');
  Bastion.log.info(`Loading ${modules.length} modules...`);
  for (var i = 0; i < modules.length; i++)
    loadEvent(Bastion, modules[i]);
};

function loadEvent(Bastion, module) {
  fs.readdir(`./modules/${module}/`, (err, files) => {
    if (err) console.error(err);
    Bastion.log.info(`Loading module: ${module} [${files.length} commands]`)
    files.forEach(f => {
      let cmd = require(`../modules/${module}/${f}`);
      Bastion.log.msg(`Loading command: ${cmd.help.name}`)
      Bastion.commands.set(cmd.help.name, cmd);
      cmd.conf.aliases.forEach(alias => {
        Bastion.aliases.set(alias, cmd.help.name);
      });
    });
    Bastion.log.info(`Done.`)
  });
}